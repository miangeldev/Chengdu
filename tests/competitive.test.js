import test from 'node:test';
import assert from 'node:assert/strict';
import { readRecords, register, setup } from './helpers.js';
import { ABANDON_PENALTY, BASE_RATING, COMPETITIVE_WINDOW_MS, SEASON_LENGTH_MS, SEASON_START,
  applyResultToRanking, compareRankings, competitiveDecision, eloDelta, finalStandings,
  initialRanking, rankTier, rankingEligible, resultPlayers, seasonDefinition, seasonNumberAt,
  seasonPrize } from '../game/competitive/policy.js';

async function fixture(t, options = {}) {
  let now = options.now ?? SEASON_START;
  const context = setup(t, { clock: () => now, randomRoll: () => 0 });
  const a = await register(context.game, 'Miguel');
  const b = await register(context.game, 'Lukas', '521111111111');
  const ua = (await context.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await context.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await context.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await context.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  return { ...context, a, b, ua, ub, chatId: 'competitive-test@g.us',
    setTime: value => { now = value; },
    advance: ms => { now = new Date(Date.parse(now) + ms).toISOString(); } };
}

async function start(context, opponent = context.b, options = {}) {
  await context.game.battle.challenge({ userId: context.a.id, opponentId: opponent.id,
    chatId: context.chatId, ranked: true, ...options });
  return (await context.game.battle.accept({ userId: opponent.id, chatId: context.chatId })).battle;
}

async function fight(context, opponent = context.b, options = {}) {
  let battle = await start(context, opponent, options);
  while (battle.status === 'active') {
    battle = (await context.game.battle.attack({ userId: battle.turnUserId,
      chatId: context.chatId, choice: '1', operationKey: `ranked-attack:${battle.id}:${battle.actions.length}` })).battle;
  }
  return battle;
}

async function opponent(context, name, number) {
  const user = await register(context.game, name, number);
  const { unit } = await context.game.starter.claimStarter({ userId: user.id, choice: 'lobo' });
  await context.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  return user;
}

test('competitive policy uses 30-day CDMX seasons and canonical short codes', () => {
  assert.equal(seasonNumberAt('2026-10-13T05:59:59.999Z'), 0);
  assert.equal(seasonNumberAt(SEASON_START), 1);
  assert.equal(seasonDefinition(1).startsAt, SEASON_START);
  assert.equal(seasonDefinition(1).endsAt, '2026-11-12T06:00:00.000Z');
  assert.equal(seasonNumberAt(seasonDefinition(1).endsAt), 2);
  assert.equal(seasonDefinition(2).startsAt, seasonDefinition(1).endsAt);
  assert.throws(() => seasonNumberAt('invalid'), { code: 'INVALID_CLOCK' });
  assert.throws(() => seasonDefinition(0), { code: 'INVALID_SEASON' });
});

test('Elo is opponent-dependent, symmetric at equal rating and exposes documented tiers', () => {
  assert.equal(eloDelta(1000, 1000, 1), 16);
  assert.equal(eloDelta(1000, 1000, 0), -16);
  assert.equal(eloDelta(1000, 1000, 0.5), 0);
  assert.equal(eloDelta(1000, 1400, 1), 29);
  assert.equal(eloDelta(1400, 1000, 1), 3);
  assert.equal(eloDelta(1400, 1000, 0.5), -13);
  assert.deepEqual([999, 1000, 1100, 1250, 1450, 1650].map(rankTier),
    ['Bronce', 'Plata', 'Oro', 'Platino', 'Diamante', 'Maestro']);
});

test('standings qualify by both matches and distinct opponents, sort ties stably and award no units', () => {
  const base = initialRanking('season:T1', 'a', SEASON_START);
  const qualified = { ...base, matches: 5, wins: 3, losses: 2, opponentIds: ['b', 'c', 'd'] };
  const provisional = { ...qualified, userId: 'b', rating: 1600, opponentIds: ['a'] };
  assert.equal(rankingEligible(qualified), true);
  assert.equal(rankingEligible(provisional), false);
  assert.ok(compareRankings(qualified, provisional) < 0);
  const standings = finalStandings([provisional, qualified, { ...base, userId: 'c' }]);
  assert.deepEqual(standings.map(row => row.position), [1, null]);
  assert.equal(seasonPrize(standings[1], seasonDefinition(1)), null);
  assert.deepEqual(seasonPrize(standings[0], seasonDefinition(1)), {
    position: 1, rating: 1000, tier: 'Plata', coins: 1450, title: 'Plata de Chengdú · T1'
  });
});

test('competitive scoring at season boundary is zero even when the idle player is known', () => {
  const season = seasonDefinition(1);
  const a = initialRanking(season.id, 'a', season.startsAt);
  const b = initialRanking(season.id, 'b', season.startsAt);
  const battle = { players: [{ userId: 'a' }, { userId: 'b' }], competitive: { endsAt: season.endsAt },
    status: 'expired', finishReason: 'inactivity', actions: [], finishedAt: season.endsAt, winnerId: null };
  assert.equal(competitiveDecision(battle, [], { idleUserId: 'a' }), 'season_closed');
  const players = resultPlayers(battle, [a, b], 'season_closed', { idleUserId: 'a' });
  assert.deepEqual(players.map(row => row.delta), [0, 0]);
  assert.deepEqual(applyResultToRanking(a, { reason: 'season_closed', players, createdAt: season.endsAt }), a);
});

test('ranked draws adjust unequal ratings and count both players without inventing a winner', () => {
  const season = seasonDefinition(1);
  const a = initialRanking(season.id, 'a', season.startsAt);
  const b = { ...initialRanking(season.id, 'b', season.startsAt), rating: 1400 };
  const battle = { players: [{ userId: 'a' }, { userId: 'b' }], winnerId: null };
  const players = resultPlayers(battle, [a, b], 'rated');
  assert.deepEqual(players.map(player => player.delta), [13, -13]);
  const receipt = { reason: 'rated', players, createdAt: season.startsAt };
  for (const rank of [a, b]) {
    const after = applyResultToRanking(rank, receipt);
    assert.equal(after.matches, 1);
    assert.equal(after.draws, 1);
    assert.equal(after.wins + after.losses, 0);
  }
});

test('abandonment penalties cannot make ratings negative or award the opponent free points', () => {
  const season = seasonDefinition(1);
  const a = { ...initialRanking(season.id, 'a', season.startsAt), rating: 8 };
  const b = initialRanking(season.id, 'b', season.startsAt);
  const battle = { players: [{ userId: 'a' }, { userId: 'b' }], winnerId: 'b',
    actions: [{ type: 'surrender', actorId: 'a' }] };
  const players = resultPlayers(battle, [a, b], 'early_surrender');
  assert.deepEqual(players.map(player => player.delta), [-8, 0]);
  assert.deepEqual(players.map(player => player.ratingAfter), [0, 1000]);
});

test('casual battles preserve their rewards and never create competitive state', async t => {
  const c = await fixture(t);
  const battle = await fight(c, c.b, { ranked: false, mode: 'auto' });
  assert.equal(battle.competitive, undefined);
  assert.equal(battle.settlement.reason, 'rewarded');
  assert.equal(readRecords(c.directory, 'resultadoscompetitivos').length, 0);
  assert.equal(readRecords(c.directory, 'clasificacion').length, 0);
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.rating, BASE_RATING);
});

test('ranked match records its Elo once, keeps economic rewards, and survives restart', async t => {
  const c = await fixture(t);
  const battle = await fight(c);
  assert.equal(battle.rulesVersion, 2);
  assert.equal(battle.competitive.seasonCode, 'T1');
  assert.equal(battle.competitive.settlement.reason, 'rated');
  assert.deepEqual(battle.competitive.settlement.players.map(player => player.delta).sort((a, b) => a - b), [-16, 16]);
  assert.equal(battle.settlement.reason, 'rewarded');
  const before = await c.game.competitive.getRank({ userId: c.a.id });
  assert.equal(before.rank.matches, 1);
  assert.equal(before.rank.eligible, false);
  const action = battle.actions.at(-1);
  const replay = await c.game.battle.attack({ userId: action.actorId, chatId: c.chatId,
    choice: '1', operationKey: action.operationKey });
  assert.equal(replay.duplicate, true);
  assert.equal(readRecords(c.directory, 'resultadoscompetitivos').length, 1);
  await c.game.close();
  const reopened = c.open().game;
  assert.deepEqual(await reopened.competitive.getRank({ userId: c.a.id }), before);
  assert.equal((await reopened.validateDatabase()).valid, true);
});

test('ranked challenge replay rejects a casual flag and cannot award points before acceptance', async t => {
  const c = await fixture(t);
  const params = { userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, mode: 'auto', operationKey: 'ranked-challenge' };
  const first = await c.game.battle.challenge({ ...params, ranked: true });
  assert.equal((await c.game.battle.challenge({ ...params, ranked: true })).duplicate, true);
  await assert.rejects(c.game.battle.challenge({ ...params, ranked: false }), { code: 'OPERATION_CONFLICT' });
  await c.game.battle.closeChallenge({ userId: c.b.id, chatId: c.chatId, reject: true });
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.rating, 1000);
  assert.equal(readRecords(c.directory, 'resultadoscompetitivos').length, 0);
  assert.equal(first.battle.competitive.settlement, null);
  await assert.rejects(c.game.battle.challenge({ ...params, ranked: true, mode: 'classic', operationKey: 'classic-ranked' }), { code: 'RANKED_ADVANCED_ONLY' });
});

test('ranked repeated rival cap is independent of casual rewards and resets at the exact 24-hour edge', async t => {
  const c = await fixture(t);
  await fight(c, c.b, { ranked: false, mode: 'auto' });
  for (let index = 0; index < 3; index++) assert.equal((await fight(c)).competitive.settlement.reason, 'rated');
  const fourth = await fight(c);
  assert.equal(fourth.competitive.settlement.reason, 'pair_limit');
  assert.deepEqual(fourth.competitive.settlement.players.map(player => player.delta), [0, 0]);
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.matches, 3);
  c.advance(COMPETITIVE_WINDOW_MS);
  assert.equal((await fight(c)).competitive.settlement.reason, 'rated');
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.matches, 4);
});

test('early surrender penalizes only the abandoning player without creating a qualifying match', async t => {
  const c = await fixture(t);
  await start(c);
  const result = await c.game.battle.surrender({ userId: c.b.id, chatId: c.chatId, operationKey: 'early-abandon' });
  assert.equal(result.battle.competitive.settlement.reason, 'early_surrender');
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.rating, 1000);
  const loser = (await c.game.competitive.getRank({ userId: c.b.id })).rank;
  assert.equal(loser.rating, 1000 - ABANDON_PENALTY);
  assert.equal(loser.matches, 0);
  assert.equal(loser.penalties, 1);
  assert.equal((await c.game.competitive.getLeaderboard()).totalItems, 0);
  await c.game.battle.surrender({ userId: c.b.id, chatId: c.chatId, operationKey: 'early-abandon' });
  assert.equal(readRecords(c.directory, 'resultadoscompetitivos').length, 1);
});

test('surrender after four attacks by both players is a normal rated victory', async t => {
  const c = await fixture(t);
  let battle = await start(c);
  for (let count = 0; count < 4; count++) {
    battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '1' })).battle;
  }
  assert.equal(battle.status, 'active');
  const result = await c.game.battle.surrender({ userId: c.b.id, chatId: c.chatId, operationKey: 'late-abandon' });
  assert.equal(result.battle.competitive.settlement.reason, 'rated');
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.matches, 1);
  assert.equal((await c.game.competitive.getRank({ userId: c.b.id })).rank.penalties, 0);
});

test('inactivity penalizes the player whose turn expired and releases unit locks', async t => {
  const c = await fixture(t);
  const battle = await start(c);
  c.setTime(battle.expiresAt);
  assert.equal(await c.game.battle.sweepExpired(), 1);
  const receipt = readRecords(c.directory, 'resultadoscompetitivos')[0];
  assert.equal(receipt.reason, 'inactivity');
  assert.equal(receipt.idleUserId, battle.turnUserId);
  const idle = (await c.game.competitive.getRank({ userId: battle.turnUserId })).rank;
  assert.equal(idle.rating, 984);
  assert.equal(idle.matches, 0);
  assert.equal(readRecords(c.directory, 'unidades').every(unit => unit.lock === null), true);
  assert.equal(await c.game.battle.sweepExpired(), 0);
});

test('season rollover freezes old positions, resets only ratings, and closes boundary battles without penalties', async t => {
  const c = await fixture(t);
  await fight(c);
  const prior = await c.game.competitive.getRank({ userId: c.a.id });
  const end = seasonDefinition(1).endsAt;
  c.setTime(new Date(Date.parse(end) - 1000).toISOString());
  const boundary = await start(c);
  assert.equal(boundary.expiresAt, end);
  c.setTime(end);
  const newSeason = await c.game.competitive.getRank({ userId: c.a.id });
  assert.equal(newSeason.season.code, 'T2');
  assert.equal(newSeason.rank.rating, 1000);
  assert.equal(newSeason.rank.matches, 0);
  const old = await c.game.competitive.getRank({ userId: c.a.id, seasonCode: 't1' });
  assert.equal(old.season.status, 'closed');
  assert.deepEqual(old.rank, prior.rank);
  assert.equal(readRecords(c.directory, 'resultadoscompetitivos').at(-1).reason, 'season_closed');
  assert.deepEqual(readRecords(c.directory, 'resultadoscompetitivos').at(-1).players.map(player => player.delta), [0, 0]);
  assert.equal(readRecords(c.directory, 'unidades').length, 2);
  assert.ok(readRecords(c.directory, 'usuarios').find(user => user.id === c.a.id).progress.xp > 0);
});

test('qualified season prizes are atomic, replayable, permanent and cannot multiply coin credits', async t => {
  const c = await fixture(t);
  const ana = await opponent(c, 'Ana', '521222222222');
  const leo = await opponent(c, 'Leo', '521333333333');
  for (const rival of [c.b, c.b, c.b, ana, leo]) await fight(c, rival);
  const before = await c.game.competitive.getRank({ userId: c.a.id });
  assert.equal(before.rank.eligible, true);
  assert.equal(before.rank.position, 1);
  await assert.rejects(c.game.competitive.claimSeasonReward({ userId: c.a.id, seasonCode: 'T1', operationKey: 'too-early' }), { code: 'SEASON_NOT_ENDED' });
  c.advance(SEASON_LENGTH_MS);
  const coinsBefore = (await c.game.economy.getBalance(c.a.id)).coins;
  const unitsBefore = readRecords(c.directory, 'unidades');
  const claims = await Promise.all(['season-claim', 'other-message'].map(operationKey =>
    c.game.competitive.claimSeasonReward({ userId: c.a.id, seasonCode: 'T1', operationKey })));
  assert.deepEqual(claims.map(result => result.alreadyClaimed), [false, true]);
  const reward = claims[0].reward;
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, coinsBefore + reward.coins);
  assert.equal(readRecords(c.directory, 'economia').filter(row => row.sourceType === 'season_reward').length, 1);
  assert.equal(readRecords(c.directory, 'premiostemporada').length, 1);
  assert.deepEqual(readRecords(c.directory, 'unidades'), unitsBefore);
  assert.equal((await c.game.content.getInventory(c.a.id)).titles.includes(reward.title), true);
  await assert.rejects(c.game.competitive.claimSeasonReward({ userId: c.b.id, seasonCode: 'T1', operationKey: 'ineligible' }), { code: 'SEASON_REWARD_NOT_ELIGIBLE' });
  await c.game.close();
  const reopened = c.open().game;
  c.setTime('invalid-clock');
  assert.equal((await reopened.competitive.claimSeasonReward({ userId: c.a.id, seasonCode: 't1', operationKey: 'season-claim' })).reward.id, reward.id);
  await assert.rejects(reopened.competitive.claimSeasonReward({ userId: c.b.id, seasonCode: 'T1', operationKey: 'season-claim' }), { code: 'OPERATION_CONFLICT' });
});

test('rank and season pages use short references, reject invalid pages and preserve final standings after later games', async t => {
  const c = await fixture(t);
  await fight(c);
  const first = await c.game.competitive.getLeaderboard({ limit: 1 });
  assert.equal(first.page, 1);
  assert.equal(first.totalPages, 2);
  assert.equal((await c.game.competitive.getLeaderboard({ page: 2, limit: 1 })).items.length, 1);
  await assert.rejects(c.game.competitive.getLeaderboard({ page: 3, limit: 1 }), { code: 'PAGE_NOT_FOUND' });
  await assert.rejects(c.game.competitive.getRank({ userId: c.a.id, seasonCode: 'uuid' }), { code: 'INVALID_SEASON' });
  await assert.rejects(c.game.competitive.getSeason({ seasonCode: 'T99' }), { code: 'SEASON_NOT_FOUND' });
  c.advance(SEASON_LENGTH_MS);
  const historical = await c.game.competitive.getLeaderboard({ seasonCode: 'T1' });
  await fight(c);
  assert.deepEqual(await c.game.competitive.getLeaderboard({ seasonCode: 'T1' }), historical);
  assert.deepEqual((await c.game.competitive.getSeasons()).items.map(row => row.code), ['T2', 'T1']);
  assert.equal((await c.game.competitive.getSeason({ seasonCode: 'T2', userId: c.a.id })).rank.matches, 1);
});

test('competitive APIs enforce registration, season start and clock monotonicity', async t => {
  const c = await fixture(t, { now: '2026-10-13T05:00:00.000Z' });
  await assert.rejects(c.game.competitive.getRank({ userId: c.a.id }), { code: 'SEASON_NOT_STARTED' });
  await assert.rejects(c.game.competitive.getRank({ userId: 'USR-missing' }), { code: 'USER_NOT_FOUND' });
  await assert.rejects(start(c), { code: 'SEASON_NOT_STARTED' });
  c.setTime(SEASON_START);
  await fight(c);
  c.setTime(new Date(Date.parse(SEASON_START) - 1).toISOString());
  await assert.rejects(start(c), { code: 'INVALID_CLOCK' });
});

test('consulting the next season prevents reopening a closed season with a rewound clock', async t => {
  const c = await fixture(t);
  await c.game.competitive.getSeason();
  c.advance(SEASON_LENGTH_MS);
  assert.equal((await c.game.competitive.getSeason()).code, 'T2');
  c.setTime(SEASON_START);
  await assert.rejects(c.game.competitive.getSeason(), { code: 'INVALID_CLOCK' });
  await assert.rejects(start(c), { code: 'INVALID_CLOCK' });
  assert.equal(readRecords(c.directory, 'combates').length, 0);
});

test('long offline periods close the existing season and create only the current season on return', async t => {
  const c = await fixture(t);
  await c.game.competitive.getSeason();
  c.advance(SEASON_LENGTH_MS * 12);
  const seasons = await c.game.competitive.getSeasons();
  assert.deepEqual(seasons.items.map(row => [row.code, row.status]), [['T13', 'active'], ['T1', 'closed']]);
  assert.equal(readRecords(c.directory, 'unidades').length, 2);
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.rating, 1000);
});
