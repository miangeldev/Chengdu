import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';

export const COMPETITIVE_POLICY_VERSION = 1;
export const BASE_RATING = 1000;
export const ELO_K = 32;
export const ABANDON_PENALTY = 16;
export const COMPETITIVE_PAIR_LIMIT = 3;
export const COMPETITIVE_WINDOW_MS = 24 * 60 * 60_000;
export const SEASON_START = '2026-10-13T06:00:00.000Z';
export const SEASON_LENGTH_MS = 30 * 24 * 60 * 60_000;
export const QUALIFYING_MATCHES = 5;
export const QUALIFYING_OPPONENTS = 3;

export const COMPETITIVE_TIERS = Object.freeze([
  { name: 'Bronce', minimum: 0, coins: 300 },
  { name: 'Plata', minimum: 1000, coins: 450 },
  { name: 'Oro', minimum: 1100, coins: 700 },
  { name: 'Platino', minimum: 1250, coins: 1000 },
  { name: 'Diamante', minimum: 1450, coins: 1500 },
  { name: 'Maestro', minimum: 1650, coins: 2200 }
].map(Object.freeze));

export function seasonNumberAt(now) {
  const timestamp = dailyTimestamp(now);
  if (timestamp < Date.parse(SEASON_START)) return 0;
  const number = Math.floor((timestamp - Date.parse(SEASON_START)) / SEASON_LENGTH_MS) + 1;
  requireGame(number <= 10000, 'INVALID_CLOCK');
  return number;
}

export function seasonDefinition(number) {
  requireGame(Number.isSafeInteger(number) && number >= 1 && number <= 10000, 'INVALID_SEASON');
  const startsAt = new Date(Date.parse(SEASON_START) + (number - 1) * SEASON_LENGTH_MS).toISOString();
  const endsAt = new Date(Date.parse(startsAt) + SEASON_LENGTH_MS).toISOString();
  const code = `T${number}`;
  return { id: `season:${code}`, code, number, name: `Temporada ${number}`,
    policyVersion: COMPETITIVE_POLICY_VERSION, startsAt, endsAt, status: 'active',
    closedAt: null, standings: [], createdAt: startsAt, updatedAt: startsAt };
}

export function initialRanking(seasonId, userId, now) {
  return { id: `rank:${seasonId}:${userId}`, seasonId, userId, rating: BASE_RATING,
    matches: 0, wins: 0, losses: 0, draws: 0, penalties: 0, opponentIds: [],
    createdAt: now, updatedAt: now, lastResultAt: null };
}

export function rankTier(rating) {
  return COMPETITIVE_TIERS.findLast(tier => rating >= tier.minimum)?.name ?? 'Bronce';
}

export function rankingEligible(rank) {
  return rank.matches >= QUALIFYING_MATCHES && rank.opponentIds.length >= QUALIFYING_OPPONENTS;
}

export function compareRankings(a, b) {
  return Number(rankingEligible(b)) - Number(rankingEligible(a)) || b.rating - a.rating ||
    b.wins - a.wins || a.matches - b.matches || a.userId.localeCompare(b.userId);
}

export function finalStandings(rankings) {
  let position = 0;
  return rankings.filter(rank => rank.matches > 0).sort(compareRankings).map(rank => {
    const eligible = rankingEligible(rank);
    return { position: eligible ? ++position : null, userId: rank.userId, rating: rank.rating,
      matches: rank.matches, wins: rank.wins, losses: rank.losses, draws: rank.draws,
      penalties: rank.penalties, opponentIds: [...rank.opponentIds], eligible, tier: rankTier(rank.rating) };
  });
}

export function seasonPrize(standing, season) {
  if (!standing?.eligible) return null;
  const tier = rankTier(standing.rating);
  const base = COMPETITIVE_TIERS.find(row => row.name === tier).coins;
  const podium = ({ 1: 1000, 2: 600, 3: 300 })[standing.position] ?? 0;
  return { position: standing.position, rating: standing.rating, tier,
    coins: base + podium, title: `${tier} de Chengdú · ${season.code}` };
}

export function eloDelta(rating, opponentRating, score) {
  const expectation = 1 / (1 + 10 ** ((opponentRating - rating) / 400));
  return Math.round(ELO_K * (score - expectation));
}

export function competitiveDecision(battle, priorResults = [], { idleUserId = null } = {}) {
  if (Date.parse(battle.finishedAt) >= Date.parse(battle.competitive.endsAt)) return 'season_closed';
  if (battle.status === 'expired') return 'inactivity';
  const attacks = battle.actions.filter(action => action.type === 'attack');
  if (battle.finishReason === 'surrender' && (attacks.length < 4 ||
    !battle.players.every(player => attacks.some(action => action.actorId === player.userId)))) return 'early_surrender';
  const pair = battle.players.map(player => player.userId).sort().join(':');
  const start = Date.parse(battle.finishedAt) - COMPETITIVE_WINDOW_MS;
  const counted = priorResults.filter(result => result.reason === 'rated' &&
    result.players.map(player => player.userId).sort().join(':') === pair &&
    Date.parse(result.createdAt) > start && Date.parse(result.createdAt) <= Date.parse(battle.finishedAt));
  return counted.length >= COMPETITIVE_PAIR_LIMIT ? 'pair_limit' : 'rated';
}

export function resultPlayers(battle, rankings, reason, { idleUserId = null } = {}) {
  const abandoner = reason === 'early_surrender'
    ? battle.actions.findLast(action => action.type === 'surrender')?.actorId
    : reason === 'inactivity' ? idleUserId : null;
  return battle.players.map(player => {
    const rank = rankings.find(row => row.userId === player.userId);
    const other = rankings.find(row => row.userId !== player.userId);
    requireGame(rank && other, 'DATABASE_CORRUPT');
    const score = reason === 'rated' ? battle.winnerId === null ? 0.5 : battle.winnerId === player.userId ? 1 : 0 : null;
    let delta = reason === 'rated' ? eloDelta(rank.rating, other.rating, score)
      : abandoner === player.userId ? -ABANDON_PENALTY : 0;
    delta = Math.max(-rank.rating, delta);
    if (delta === 0) delta = 0;
    return { userId: player.userId, ratingBefore: rank.rating,
      ratingAfter: rank.rating + delta, delta, score, countsForRanking: reason === 'rated' };
  });
}

export function applyResultToRanking(rank, result) {
  const player = result.players.find(row => row.userId === rank.userId);
  requireGame(player && player.ratingBefore === rank.rating, 'DATABASE_CORRUPT');
  if (result.reason === 'season_closed') return structuredClone(rank);
  const scored = player.countsForRanking;
  const opponent = result.players.find(row => row.userId !== rank.userId).userId;
  const opponentIds = scored ? [...new Set([...rank.opponentIds, opponent])].sort() : [...rank.opponentIds];
  return { ...rank, rating: player.ratingAfter, matches: rank.matches + Number(scored),
    wins: rank.wins + Number(scored && player.score === 1),
    losses: rank.losses + Number(scored && player.score === 0),
    draws: rank.draws + Number(scored && player.score === 0.5),
    penalties: rank.penalties + Number(!scored && player.delta < 0), opponentIds,
    updatedAt: result.createdAt, lastResultAt: result.createdAt };
}
