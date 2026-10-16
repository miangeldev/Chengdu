import { requireGame } from '../../utils/GameError.js';
import { COMPETITIVE_POLICY_VERSION, applyResultToRanking, competitiveDecision,
  finalStandings, initialRanking, resultPlayers, seasonDefinition, seasonNumberAt } from './policy.js';

// Called inside the same unit of work as the game operation. Closing a season
// never resets units, balances, progression or results from previous seasons.
export async function refreshSeasons(repos, now) {
  const number = seasonNumberAt(now);
  const existing = await repos.seasons.all();
  requireGame(existing.every(season => season.number <= number &&
    !(season.status === 'closed' && Date.parse(now) < Date.parse(season.endsAt))), 'INVALID_CLOCK');
  for (const season of existing) {
    if (season.status === 'active' && Date.parse(now) >= Date.parse(season.endsAt)) {
      const rankings = await repos.rankings.filterBy('seasonId', season.id);
      await repos.seasons.replace({ ...season, status: 'closed', closedAt: season.endsAt,
        standings: finalStandings(rankings), updatedAt: season.endsAt });
    }
  }
  if (number === 0) return null;
  const current = seasonDefinition(number);
  return await repos.seasons.get(current.id) ?? await repos.seasons.insert(current);
}

export async function prepareCompetitiveChallenge(repos, now, { userIds }) {
  const season = await refreshSeasons(repos, now);
  requireGame(season, 'SEASON_NOT_STARTED');
  requireGame(season.status === 'active', 'INVALID_CLOCK');
  for (const userId of userIds) {
    const user = await repos.users.get(userId);
    requireGame(user, 'USER_NOT_FOUND');
    requireGame(Date.parse(now) >= Date.parse(user.updatedAt), 'INVALID_CLOCK');
    const initial = initialRanking(season.id, userId, now);
    const previous = await repos.rankings.get(initial.id);
    requireGame(!previous || Date.parse(now) >= Date.parse(previous.updatedAt), 'INVALID_CLOCK');
    if (!previous) await repos.rankings.insert(initial);
  }
  return { version: COMPETITIVE_POLICY_VERSION, seasonId: season.id,
    seasonCode: season.code, endsAt: season.endsAt, settlement: null };
}

export async function settleCompetitiveBattle(repos, battle, now, { idleUserId = null } = {}) {
  if (!battle.competitive || battle.acceptedAt === null) return;
  requireGame(['finished', 'expired'].includes(battle.status), 'DATABASE_CORRUPT');
  const id = `competitive:${battle.id}`;
  const previous = await repos.competitiveResults.get(id);
  if (previous) {
    battle.competitive.settlement = { resultId: id, reason: previous.reason,
      createdAt: previous.createdAt, players: structuredClone(previous.players) };
    return previous;
  }
  const season = await repos.seasons.get(battle.competitive.seasonId);
  requireGame(season && battle.competitive.settlement === null, 'DATABASE_CORRUPT');
  requireGame(Date.parse(now) === Date.parse(battle.finishedAt), 'INVALID_CLOCK');
  const rankings = await Promise.all(battle.players.map(player => repos.rankings.get(
    initialRanking(season.id, player.userId, now).id)));
  requireGame(rankings.every(Boolean) && rankings.every(rank =>
    Date.parse(now) >= Date.parse(rank.updatedAt)), 'INVALID_CLOCK');
  const priorResults = await repos.competitiveResults.all();
  const reason = competitiveDecision(battle, priorResults, { idleUserId });
  if (reason === 'inactivity') requireGame(battle.players.some(player => player.userId === idleUserId), 'DATABASE_CORRUPT');
  const result = { id, battleId: battle.id, seasonId: season.id, policyVersion: COMPETITIVE_POLICY_VERSION,
    createdAt: now, reason, winnerId: battle.winnerId,
    idleUserId: battle.status === 'expired' ? idleUserId : null,
    players: resultPlayers(battle, rankings, reason, { idleUserId }) };
  await repos.competitiveResults.insert(result);
  for (const rank of rankings) await repos.rankings.replace(applyResultToRanking(rank, result));
  battle.competitive.settlement = { resultId: id, reason, createdAt: now, players: structuredClone(result.players) };
  await refreshSeasons(repos, now);
  return result;
}
