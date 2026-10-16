import { equal } from './equality.js';
import { requireGame } from '../utils/GameError.js';
import { replayAdvancedBattle } from '../game/battle/advancedEngine.js';
import { COMPETITIVE_POLICY_VERSION, applyResultToRanking, competitiveDecision,
  finalStandings, initialRanking, resultPlayers, seasonDefinition, seasonNumberAt, seasonPrize } from '../game/competitive/policy.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });

const integer = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
  Number.isFinite(Date.parse(value)) && [new Date(value).toISOString(), new Date(value).toISOString().replace('.000Z', 'Z')].includes(value);
const rankId = (seasonId, userId) => `rank:${seasonId}:${userId}`;
const open = battle => ['pending', 'active'].includes(battle.status);

function metadataOf(battle) {
  const { settlement, ...metadata } = battle.competitive;
  return metadata;
}

function firstChallenges(battles) {
  const first = new Map();
  for (const battle of battles) {
    if (!battle.competitive) continue;
    for (const player of battle.players) {
      const key = rankId(battle.competitive.seasonId, player.userId);
      const previous = first.get(key);
      if (!previous || Date.parse(battle.createdAt) < Date.parse(previous.createdAt)) first.set(key, battle);
    }
  }
  return first;
}

// Rankings and frozen positions are projections of immutable battle receipts.
// Never accept a rating, qualifying match, prize or title merely because its
// numeric value looks plausible: replay its authoritative game evidence.
export function validateCompetitiveData(state) {
  const seasons = new Map(state.temporadas.records.map(row => [row.id, row]));
  const rankings = new Map(state.clasificacion.records.map(row => [row.id, row]));
  const battles = new Map(state.combates.records.map(row => [row.id, row]));
  const results = state.resultadoscompetitivos.records;
  const resultByBattle = new Map(results.map(row => [row.battleId, row]));
  const firstByRank = firstChallenges(state.combates.records);
  const users = new Map(state.usuarios.records.map(row => [row.id, row]));
  const numbers = new Set();
  let activeSeasons = 0;

  for (const season of seasons.values()) {
    check(integer(season.number, 1) && season.number <= 10000 && !numbers.has(season.number), 'competitive.seasonNumber');
    numbers.add(season.number);
    const definition = seasonDefinition(season.number);
    const expected = season.status === 'closed'
      ? { ...definition, status: 'closed', closedAt: definition.endsAt, standings: season.standings, updatedAt: definition.endsAt }
      : definition;
    check(equal(season, expected), 'competitive.seasonDefinition');
    if (season.status === 'active') activeSeasons++;
    check(Array.isArray(season.standings), 'competitive.seasonStandings');
  }
  check(activeSeasons <= 1, 'competitive.activeSeasonUnique');
  const latest = Math.max(0, ...numbers);
  for (const season of seasons.values()) if (season.status === 'active') {
    check(season.number === latest, 'competitive.activeSeasonCurrent');
  }

  const replay = new Map();
  for (const rank of rankings.values()) {
    const season = seasons.get(rank.seasonId);
    const user = users.get(rank.userId);
    const first = firstByRank.get(rank.id);
    check(season && user && rank.id === rankId(season.id, rank.userId) && date(rank.createdAt) &&
      Date.parse(rank.createdAt) >= Date.parse(season.startsAt) && Date.parse(rank.createdAt) < Date.parse(season.endsAt) &&
      (user.createdAt === null || Date.parse(rank.createdAt) >= Date.parse(user.createdAt)) &&
      first && first.createdAt === rank.createdAt, 'competitive.rankingOrigin');
    replay.set(rank.id, initialRanking(rank.seasonId, rank.userId, rank.createdAt));
  }

  for (const battle of battles.values()) {
    if (battle.competitive === undefined) continue;
    const competitive = battle.competitive;
    const season = seasons.get(competitive?.seasonId);
    check(battle.rulesVersion === 2 && competitive && season && competitive.version === COMPETITIVE_POLICY_VERSION &&
      competitive.seasonCode === season.code && competitive.endsAt === season.endsAt &&
      equal(metadataOf(battle), { version: COMPETITIVE_POLICY_VERSION, seasonId: season.id, seasonCode: season.code, endsAt: season.endsAt }),
    'competitive.battleMetadata');
    check(Date.parse(battle.createdAt) >= Date.parse(season.startsAt) && Date.parse(battle.createdAt) < Date.parse(season.endsAt) &&
      (battle.acceptedAt === null || Date.parse(battle.acceptedAt) < Date.parse(season.endsAt)), 'competitive.battleWindow');
    for (const player of battle.players) {
      check(rankings.has(rankId(season.id, player.userId)), 'competitive.battleRanking');
    }
    if (open(battle) || battle.acceptedAt === null) {
      check(competitive.settlement === null && !resultByBattle.has(battle.id), 'competitive.unsettledBattle');
      if (open(battle)) check(season.status === 'active', 'competitive.closedSeasonOpenBattle');
    } else {
      check(['finished', 'expired'].includes(battle.status) && resultByBattle.get(battle.id)?.id === `competitive:${battle.id}`,
        'competitive.closedBattleReceipt');
    }
  }

  const priorByPair = new Map();
  const seenBattles = new Set();
  for (const result of results) {
    const battle = battles.get(result.battleId);
    const season = seasons.get(result.seasonId);
    check(battle?.competitive && season && battle.competitive.seasonId === season.id &&
      battle.acceptedAt !== null && ['finished', 'expired'].includes(battle.status) && !seenBattles.has(battle.id),
    'competitive.resultBattle');
    seenBattles.add(battle.id);
    const idleUserId = battle.status === 'expired' ? replayAdvancedBattle(battle).turnUserId : null;
    check(result.idleUserId === idleUserId, 'competitive.inactivityActor');
    // Pairs share their history across seasons, while unrelated rivals do not
    // add work to every replayed rating decision.
    const pair = battle.players.map(player => player.userId).sort().join(':');
    const prior = priorByPair.get(pair) ?? [];
    const reason = competitiveDecision(battle, prior, { idleUserId });
    const before = battle.players.map(player => replay.get(rankId(season.id, player.userId)));
    check(before.every(Boolean) && date(result.createdAt) && result.createdAt === battle.finishedAt &&
      before.every(rank => Date.parse(result.createdAt) >= Date.parse(rank.updatedAt)), 'competitive.resultClock');
    const expected = { id: `competitive:${battle.id}`, battleId: battle.id, seasonId: season.id,
      policyVersion: COMPETITIVE_POLICY_VERSION, createdAt: battle.finishedAt, reason, winnerId: battle.winnerId,
      idleUserId, players: resultPlayers(battle, before, reason, { idleUserId }) };
    check(equal(result, expected), 'competitive.resultReplay');
    check(equal(battle.competitive.settlement, { resultId: result.id, reason,
      createdAt: result.createdAt, players: result.players }), 'competitive.battleSettlement');
    for (const rank of before) replay.set(rank.id, applyResultToRanking(rank, result));
    prior.push(result);
    priorByPair.set(pair, prior);
  }

  for (const [id, rank] of rankings) check(equal(rank, replay.get(id)), 'competitive.rankingReplay');
  for (const season of seasons.values()) if (season.status === 'closed') {
    const finalRanks = [...replay.values()].filter(rank => rank.seasonId === season.id);
    check(equal(season.standings, finalStandings(finalRanks)), 'competitive.frozenStandings');
  }

  const operations = new Set(), claimed = new Set();
  for (const reward of state.premiostemporada.records) {
    const season = seasons.get(reward.seasonId);
    const standing = season?.standings.find(row => row.userId === reward.userId);
    const prize = season && seasonPrize(standing, season);
    const key = `${reward.seasonId}:${reward.userId}`;
    check(season?.status === 'closed' && prize && users.has(reward.userId) && !claimed.has(key) &&
      text(reward.operationKey) && reward.operationKey.trim() === reward.operationKey && !operations.has(reward.operationKey) &&
      date(reward.createdAt) && Date.parse(reward.createdAt) >= Date.parse(season.endsAt) &&
      integer(reward.balanceBefore) && Number.isSafeInteger(reward.balanceBefore + prize.coins), 'competitive.rewardEligibility');
    const expected = { id: `seasonReward:${season.id}:${reward.userId}`, seasonId: season.id, userId: reward.userId,
      operationKey: reward.operationKey, policyVersion: COMPETITIVE_POLICY_VERSION, createdAt: reward.createdAt,
      ...prize, balanceBefore: reward.balanceBefore, balanceAfter: reward.balanceBefore + prize.coins };
    check(equal(reward, expected), 'competitive.rewardReplay');
    claimed.add(key);
    operations.add(reward.operationKey);
  }
}

export function validateCompetitiveTransition(before, after, context = {}) {
  // Offline checks may omit a clock; live transactions always pass the UOW's
  // injected clock. Never derive permission to close/pay from draft metadata.
  const hasClock = Object.hasOwn(context, 'now');
  const now = context.now;
  if (hasClock) requireGame(date(now), 'INVALID_CLOCK');
  const timestamp = hasClock ? Date.parse(now) : null;
  for (const name of ['resultadoscompetitivos', 'premiostemporada']) {
    check(equal(before[name].records, after[name].records.slice(0, before[name].records.length)), `competitive.${name}.appendOnly`);
  }
  const nextBattles = new Map(after.combates.records.map(row => [row.id, row]));
  for (const battle of before.combates.records) {
    const next = nextBattles.get(battle.id);
    if (battle.competitive === undefined) {
      check(next.competitive === undefined, 'competitive.historicalBattleImmutable');
    } else {
      check(next.competitive && equal(metadataOf(battle), metadataOf(next)), 'competitive.battleMetadataImmutable');
      if (battle.competitive.settlement !== null) {
        check(equal(battle.competitive.settlement, next.competitive.settlement), 'competitive.settlementImmutable');
      }
    }
  }

  const previousBattles = new Map(before.combates.records.map(row => [row.id, row]));
  if (timestamp !== null) for (const battle of after.combates.records) {
    if (!battle.competitive || equal(battle, previousBattles.get(battle.id))) continue;
    for (const field of ['createdAt', 'updatedAt', 'acceptedAt', 'finishedAt']) {
      check(battle[field] === null || Date.parse(battle[field]) <= timestamp, 'competitive.battleClock');
    }
    if (!previousBattles.has(battle.id)) {
      const season = after.temporadas.records.find(row => row.id === battle.competitive.seasonId);
      check(season && season.number === seasonNumberAt(now) && season.status === 'active', 'competitive.newBattleCurrentSeason');
    }
  }
  for (const result of after.resultadoscompetitivos.records.slice(before.resultadoscompetitivos.records.length)) {
    const previous = previousBattles.get(result.battleId);
    const next = nextBattles.get(result.battleId);
    check(previous?.competitive && previous.status === 'active' && previous.competitive.settlement === null &&
      next.acceptedAt !== null && ['finished', 'expired'].includes(next.status), 'competitive.atomicSettlement');
    if (timestamp !== null) check(Date.parse(result.createdAt) <= timestamp, 'competitive.resultClockAuthority');
    if (result.reason !== 'season_closed') {
      check(before.temporadas.records.find(row => row.id === result.seasonId)?.status === 'active', 'competitive.resultSeasonOpen');
    }
  }

  const nextSeasons = new Map(after.temporadas.records.map(row => [row.id, row]));
  const previousSeasons = new Set(before.temporadas.records.map(row => row.id));
  if (timestamp !== null) for (const season of after.temporadas.records) {
    if (!previousSeasons.has(season.id)) {
      check(season.number === seasonNumberAt(now) && season.status === 'active' &&
        Date.parse(season.startsAt) <= timestamp && timestamp < Date.parse(season.endsAt), 'competitive.newSeasonClockAuthority');
    }
  }
  for (const season of before.temporadas.records) {
    const next = nextSeasons.get(season.id);
    if (season.status === 'closed') check(equal(next, season), 'competitive.closedSeasonImmutable');
    else check(equal(next, season) || equal(next, { ...season, status: 'closed', closedAt: season.endsAt,
      standings: finalStandings(after.clasificacion.records.filter(rank => rank.seasonId === season.id)), updatedAt: season.endsAt }),
    'competitive.seasonCloseTransition');
    if (timestamp !== null && season.status !== 'closed' && next.status === 'closed') {
      check(timestamp >= Date.parse(season.endsAt), 'competitive.seasonCloseClockAuthority');
    }
  }
  const previousRanks = new Map(before.clasificacion.records.map(row => [row.id, row]));
  const firstByRank = firstChallenges(after.combates.records);
  for (const rank of after.clasificacion.records) {
    const previous = previousRanks.get(rank.id);
    if (previous) check(rank.createdAt === previous.createdAt && rank.seasonId === previous.seasonId &&
      rank.userId === previous.userId, 'competitive.rankingIdentityImmutable');
    else {
      const first = firstByRank.get(rank.id);
      check(first && !previousBattles.has(first.id), 'competitive.newRankingChallenge');
    }
    if (before.temporadas.records.find(season => season.id === rank.seasonId)?.status === 'closed') {
      check(previous && equal(rank, previous), 'competitive.closedRankingImmutable');
    }
  }

  for (const reward of after.premiostemporada.records.slice(before.premiostemporada.records.length)) {
    const season = after.temporadas.records.find(row => row.id === reward.seasonId);
    check(season?.status === 'closed' && Date.parse(reward.createdAt) >= Date.parse(season.endsAt), 'competitive.rewardClosedSeason');
    if (timestamp !== null) check(Date.parse(reward.createdAt) <= timestamp, 'competitive.rewardClockAuthority');
  }
}
