import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { expireBattles } from '../battle/lifecycle.js';
import { creditCoinsInTransaction } from '../economy/coinOperations.js';
import { validContentKey } from '../content/rewards.js';
import { COMPETITIVE_POLICY_VERSION, BASE_RATING, QUALIFYING_MATCHES, QUALIFYING_OPPONENTS,
  finalStandings, initialRanking, rankTier, rankingEligible, seasonDefinition, seasonNumberAt,
  seasonPrize } from './policy.js';
import { refreshSeasons } from './lifecycle.js';

async function userFor(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function seasonFor(repos, now, code) {
  if (code === null || code === undefined) {
    const number = seasonNumberAt(now);
    requireGame(number > 0, 'SEASON_NOT_STARTED');
    return repos.seasons.get(seasonDefinition(number).id);
  }
  requireGame(typeof code === 'string' && /^T(?:10000|[1-9]\d{0,3})$/i.test(code), 'INVALID_SEASON');
  const season = await repos.seasons.find(row => row.code === code.toUpperCase());
  requireGame(season, 'SEASON_NOT_FOUND');
  return season;
}

async function standingsFor(repos, season) {
  return season.status === 'closed' ? season.standings
    : finalStandings(await repos.rankings.filter(rank => rank.seasonId === season.id));
}

async function rankView(repos, season, userId, standings) {
  const user = await userFor(repos, userId);
  const rank = await repos.rankings.get(initialRanking(season.id, userId, season.startsAt).id)
    ?? initialRanking(season.id, userId, season.startsAt);
  const frozen = season.status === 'closed' ? standings.find(row => row.userId === userId) : null;
  const source = frozen ?? rank;
  const eligible = rankingEligible(source);
  return { userId, name: user.name, rating: source.rating ?? BASE_RATING,
    matches: source.matches, wins: source.wins, losses: source.losses, draws: source.draws,
    penalties: source.penalties, opponentIds: [...source.opponentIds], eligible,
    tier: rankTier(source.rating), position: standings.find(row => row.userId === userId)?.position ?? null,
    provisionalMatches: Math.max(0, QUALIFYING_MATCHES - source.matches),
    provisionalOpponents: Math.max(0, QUALIFYING_OPPONENTS - source.opponentIds.length) };
}

export function createCompetitiveService(storage, clock) {
  async function refresh(repos) {
    const now = clock();
    seasonNumberAt(now);
    await expireBattles(repos, now);
    await refreshSeasons(repos, now);
    return now;
  }

  return {
    async getRank({ userId, seasonCode = null }) {
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const now = await refresh(repos);
        const season = await seasonFor(repos, now, seasonCode);
        const standings = await standingsFor(repos, season);
        return { season, rank: await rankView(repos, season, userId, standings),
          rewardClaimed: Boolean(await repos.seasonRewards.find(reward => reward.seasonId === season.id && reward.userId === userId)) };
      });
    },
    async getLeaderboard({ seasonCode = null, page = 1, limit = 5 } = {}) {
      return storage.withTransaction(async repos => {
        const now = await refresh(repos);
        const season = await seasonFor(repos, now, seasonCode);
        const standings = await standingsFor(repos, season);
        const indexed = standings.map((row, index) => ({ ...row, id: row.userId, order: index }));
        const result = paginate(indexed, { page, limit }, `competitive:${season.id}`,
          row => [String(row.order).padStart(10, '0'), row.userId]);
        result.items = await Promise.all(result.items.map(row => rankView(repos, season, row.userId, standings)));
        return { ...result, season };
      });
    },
    async getSeason({ seasonCode = null, userId = null } = {}) {
      return storage.withTransaction(async repos => {
        if (userId !== null) await userFor(repos, userId);
        const now = await refresh(repos);
        const season = await seasonFor(repos, now, seasonCode);
        const standings = await standingsFor(repos, season);
        const rank = userId === null ? null : await rankView(repos, season, userId, standings);
        const standing = standings.find(row => row.userId === userId);
        return { ...season, participants: standings.length, eligibleParticipants: standings.filter(row => row.eligible).length,
          rank, reward: seasonPrize(standing, season), rewardClaimed: userId !== null && Boolean(
            await repos.seasonRewards.find(reward => reward.seasonId === season.id && reward.userId === userId)) };
      });
    },
    async getSeasons({ page = 1, limit = 5 } = {}) {
      return storage.withTransaction(async repos => {
        await refresh(repos);
        const result = paginate(await repos.seasons.all(), { page, limit }, 'competitiveSeasons',
          row => [String(10000 - row.number).padStart(5, '0'), row.id]);
        result.items = await Promise.all(result.items.map(async season => {
          const standings = await standingsFor(repos, season);
          return { ...season, participants: standings.length,
            eligibleParticipants: standings.filter(row => row.eligible).length };
        }));
        return result;
      });
    },
    async claimSeasonReward({ userId, seasonCode, operationKey }) {
      validContentKey(operationKey);
      requireGame(typeof seasonCode === 'string' && /^T(?:10000|[1-9]\d{0,3})$/i.test(seasonCode), 'INVALID_SEASON');
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const replay = await repos.seasonRewards.find(reward => reward.operationKey === operationKey);
        if (replay) {
          requireGame(replay.userId === userId && replay.seasonId === `season:${String(seasonCode).toUpperCase()}`, 'OPERATION_CONFLICT');
          return { reward: replay, alreadyClaimed: true };
        }
        const claimed = await repos.seasonRewards.find(reward => reward.userId === userId &&
          reward.seasonId === `season:${seasonCode.toUpperCase()}`);
        if (claimed) return { reward: claimed, alreadyClaimed: true };
        const now = await refresh(repos);
        const season = await seasonFor(repos, now, seasonCode);
        const previous = await repos.seasonRewards.find(reward => reward.userId === userId && reward.seasonId === season.id);
        if (previous) return { reward: previous, alreadyClaimed: true };
        requireGame(season.status === 'closed', 'SEASON_NOT_ENDED');
        const standing = season.standings.find(row => row.userId === userId);
        const prize = seasonPrize(standing, season);
        requireGame(prize, 'SEASON_REWARD_NOT_ELIGIBLE');
        const user = await repos.users.get(userId);
        requireGame(Date.parse(now) >= Date.parse(user.updatedAt), 'INVALID_CLOCK');
        const id = `seasonReward:${season.id}:${userId}`;
        const credited = await creditCoinsInTransaction(repos, user, prize.coins, now, { type: 'season_reward', id });
        const reward = await repos.seasonRewards.insert({ id, seasonId: season.id, userId, operationKey,
          policyVersion: COMPETITIVE_POLICY_VERSION, createdAt: now, ...prize,
          balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins });
        return { reward, alreadyClaimed: false };
      });
    },
    async sweepSeasons() {
      return storage.withTransaction(async repos => {
        const now = await refresh(repos);
        return seasonFor(repos, now, null);
      });
    }
  };
}
