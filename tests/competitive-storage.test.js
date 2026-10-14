import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { crearDatabase } from '../CTU-database.js';
import { COLLECTIONS, COMPETITIVE_COLLECTIONS, V9_COLLECTIONS, validateDatabase, validateTransition } from '../storage/validation.js';
import { initialRanking, seasonDefinition, seasonPrize } from '../game/competitive/policy.js';
import { resolveAdvancedAction } from '../game/battle/advancedEngine.js';
import { settleBattle } from '../game/battle/lifecycle.js';
import { creditCoinsInTransaction } from '../game/economy/coinOperations.js';
import { createRepositories } from '../repositories/index.js';
import { readRecords, register, setup } from './helpers.js';

const stateOf = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));
const corrupt = action => assert.throws(action, { code: 'DATABASE_CORRUPT' });

async function competitiveSetup(t, count = 2) {
  let now = '2026-10-13T08:00:00.000Z';
  const context = setup(t, { clock: () => now, randomRoll: () => 0 });
  context.users = [];
  context.units = [];
  for (let index = 0; index < count; index++) {
    const user = await register(context.game, `Jugador ${index + 1}`, `52190000000${index}`);
    const unit = await context.game.units.createUnit({ ownerId: user.id, characterId: 'panda_guerrero',
      origin: { type: 'admin', sourceId: 'competitive-storage-fixture' }, operationKey: `fixture-unit:${index}` });
    await context.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
    context.users.push(user);
    context.units.push(unit);
  }
  context.chatId = 'competitive-storage@g.us';
  context.setTime = value => { now = value; };
  context.advance = (milliseconds = 60_000) => { now = new Date(Date.parse(now) + milliseconds).toISOString(); };
  return context;
}

async function completeRanked(context, opponent = 1) {
  await context.game.battle.challenge({ userId: context.users[0].id, opponentId: context.users[opponent].id,
    chatId: context.chatId, ranked: true, mode: '1v1' });
  let battle = (await context.game.battle.accept({ userId: context.users[opponent].id, chatId: context.chatId })).battle;
  while (battle.status === 'active') {
    battle = (await context.game.battle.attack({ userId: battle.turnUserId, chatId: context.chatId,
      choice: '1', operationKey: `storage:${battle.id}:${battle.actions.length}` })).battle;
  }
  context.advance();
  return battle;
}

async function qualified(context) {
  for (const opponent of [1, 2, 3, 1, 2]) await completeRanked(context, opponent);
  context.setTime(seasonDefinition(1).endsAt);
  const season = await context.game.competitive.getSeason({ seasonCode: 'T1', userId: context.users[0].id });
  assert.equal(season.status, 'closed');
  assert.equal(season.rank.eligible, true);
  return season;
}

test('four competitive collections are managed, isolated and read-only outside a transaction', async t => {
  const c = await competitiveSetup(t);
  await c.game.validateDatabase();
  const original = stateOf(c.directory);
  for (const name of COMPETITIVE_COLLECTIONS) {
    const helper = crearDatabase(name, [], { directory: c.directory, maintenance: true });
    for (const action of [() => helper.cargar(), () => helper.guardar([]), () => helper.eliminar()]) {
      assert.throws(action, { code: 'MANAGED_DATABASE_FILE' });
    }
  }
  for (const name of ['seasons', 'rankings', 'competitiveResults', 'seasonRewards']) {
    await assert.rejects(c.storage.withRead(repos => repos[name].insert({ id: 'forged' })), { code: 'READ_ONLY_TRANSACTION' });
  }
  assert.deepEqual(stateOf(c.directory), original);
});

test('ranked receipt and both ratings replay from the authoritative finished battle', async t => {
  const c = await competitiveSetup(t);
  const battle = await completeRanked(c);
  const state = stateOf(c.directory);
  assert.equal(validateDatabase(state).valid, true);
  const [result] = state.resultadoscompetitivos.records;
  assert.equal(result.reason, 'rated');
  assert.equal(result.battleId, battle.id);
  assert.deepEqual(result.players.map(row => row.ratingBefore), [1000, 1000]);
  assert.equal(result.players.reduce((sum, row) => sum + row.delta, 0), 0);
  assert.ok(state.clasificacion.records.every(rank => rank.matches === 1));
  assert.equal(state.recompensas.records.length, 2);
  assert.ok(state.unidades.records.every(unit => unit.lock === null));
});

test('ratings, qualification counters, recipients, result actors and season dates cannot be fabricated', async t => {
  const c = await competitiveSetup(t);
  await completeRanked(c);
  const original = stateOf(c.directory);
  const mutations = [
    state => { state.clasificacion.records[0].rating++; },
    state => { state.clasificacion.records[0].matches = 5; state.clasificacion.records[0].wins = 5; },
    state => { state.clasificacion.records[0].opponentIds.push('USR-forged'); },
    state => { state.resultadoscompetitivos.records[0].players[0].delta++; },
    state => { state.resultadoscompetitivos.records[0].players[0].userId = state.resultadoscompetitivos.records[0].players[1].userId; },
    state => { state.resultadoscompetitivos.records[0].idleUserId = state.usuarios.records[0].id; },
    state => { state.resultadoscompetitivos.records[0].reason = 'pair_limit'; },
    state => { state.resultadoscompetitivos.records[0].createdAt = '2026-10-13T07:00:00.000Z'; },
    state => { state.temporadas.records[0].endsAt = '2026-10-14T08:00:00.000Z'; },
    state => { state.combates.records[0].competitive.settlement.players[0].ratingAfter++; },
    state => { state.resultadoscompetitivos.records = []; },
    state => { state.clasificacion.records = []; }
  ];
  for (const mutation of mutations) {
    const altered = structuredClone(original);
    mutation(altered);
    corrupt(() => validateDatabase(altered));
  }
  await assert.rejects(c.storage.withTransaction(async repos => {
    const rank = (await repos.rankings.all())[0];
    await repos.rankings.replace({ ...rank, rating: rank.rating + 1 });
  }), { code: 'DATABASE_CORRUPT' });
  assert.deepEqual(stateOf(c.directory), original);
});

test('a valid existing advanced casual challenge cannot be retroactively declared ranked', async t => {
  const c = await competitiveSetup(t);
  await c.game.battle.challenge({ userId: c.users[0].id, opponentId: c.users[1].id, chatId: c.chatId, mode: '1v1' });
  const before = stateOf(c.directory), after = structuredClone(before);
  const battle = after.combates.records[0], season = seasonDefinition(1);
  after.temporadas.records.push(season);
  after.clasificacion.records.push(...battle.players.map(player => initialRanking(season.id, player.userId, battle.createdAt)));
  battle.competitive = { version: 1, seasonId: season.id, seasonCode: season.code, endsAt: season.endsAt, settlement: null };
  assert.equal(validateDatabase(after).valid, true);
  corrupt(() => validateTransition(before, after));
  const schema9 = Object.fromEntries(V9_COLLECTIONS.map(name => [name, structuredClone(after[name])]));
  for (const collection of Object.values(schema9)) collection._meta.schemaVersion = 9;
  corrupt(() => validateDatabase(schema9, 9));
});

test('classic battles cannot contain ranked metadata, and ranked metadata cannot be removed or reassigned', async t => {
  const c = await competitiveSetup(t);
  await c.game.battle.challenge({ userId: c.users[0].id, opponentId: c.users[1].id, chatId: c.chatId, mode: 'classic' });
  let state = stateOf(c.directory);
  state.combates.records[0].competitive = { version: 1, seasonId: 'season:T1', seasonCode: 'T1',
    endsAt: seasonDefinition(1).endsAt, settlement: null };
  state.temporadas.records.push(seasonDefinition(1));
  corrupt(() => validateDatabase(state));
  await c.game.battle.closeChallenge({ userId: c.users[1].id, chatId: c.chatId, reject: true });
  await c.game.battle.challenge({ userId: c.users[0].id, opponentId: c.users[1].id, chatId: c.chatId, mode: '1v1', ranked: true });
  const before = stateOf(c.directory);
  for (const mutate of [
    battle => { delete battle.competitive; },
    battle => { battle.competitive.seasonId = 'season:T2'; },
    battle => { battle.competitive.endsAt = seasonDefinition(2).endsAt; }
  ]) {
    const after = structuredClone(before);
    mutate(after.combates.records.find(battle => battle.status === 'pending'));
    corrupt(() => validateTransition(before, after));
  }
});

test('closed classification, standings and historical receipts are immutable', async t => {
  const c = await competitiveSetup(t);
  await completeRanked(c);
  c.setTime(seasonDefinition(1).endsAt);
  await c.game.competitive.getSeason({ seasonCode: 'T1' });
  const before = stateOf(c.directory);
  for (const mutation of [
    state => { const season = state.temporadas.records[0]; season.status = 'active'; season.closedAt = null; season.standings = []; season.updatedAt = season.startsAt; },
    state => { state.temporadas.records[0].standings[0].position = 1; },
    state => { state.clasificacion.records[0].rating++; },
    state => { state.resultadoscompetitivos.records[0].players[0].delta++; }
  ]) {
    const after = structuredClone(before);
    mutation(after);
    corrupt(() => validateTransition(before, after));
  }
});

test('season reward proves eligibility, position, tier, amount, title and one exact ledger credit', async t => {
  const c = await competitiveSetup(t, 4);
  const season = await qualified(c);
  const userId = c.users[0].id;
  const prize = seasonPrize(season.standings.find(row => row.userId === userId), season);
  const originalCoins = (await c.game.users.getUser(userId)).economy.coins;
  const { reward } = await c.game.competitive.claimSeasonReward({ userId, seasonCode: 'T1', operationKey: 'prove-season-reward' });
  assert.equal(reward.coins, prize.coins);
  assert.equal(reward.balanceAfter, originalCoins + prize.coins);
  assert.equal(reward.title, prize.title);
  const state = stateOf(c.directory);
  assert.equal(validateDatabase(state).valid, true);
  const movements = state.economia.records.filter(row => row.sourceType === 'season_reward');
  assert.equal(movements.length, 1);
  assert.equal(movements[0].sourceId, reward.id);
  const replay = await c.game.competitive.claimSeasonReward({ userId, seasonCode: 'T1', operationKey: 'another-key' });
  assert.equal(replay.alreadyClaimed, true);
  assert.equal((await c.game.users.getUser(userId)).economy.coins, reward.balanceAfter);
  for (const mutate of [
    state => { state.premiostemporada.records[0].coins++; },
    state => { state.premiostemporada.records[0].title = 'Título inventado'; },
    state => { state.premiostemporada.records[0].position = 2; },
    state => { state.premiostemporada.records[0].tier = 'Maestro'; },
    state => { state.premiostemporada.records[0].createdAt = season.startsAt; },
    state => { state.economia.records = state.economia.records.filter(row => row.sourceType !== 'season_reward'); },
    state => { state.premiostemporada.records.push({ ...state.premiostemporada.records[0], id: 'duplicate', operationKey: 'duplicate-key' }); },
    state => { state.temporadas.records[0].standings.find(row => row.userId === userId).rating++; }
  ]) {
    const after = structuredClone(state);
    mutate(after);
    corrupt(() => validateDatabase(after));
  }
  await assert.rejects(c.game.competitive.claimSeasonReward({ userId: c.users[1].id, seasonCode: 'T1', operationKey: 'unqualified-claim' }),
    { code: 'SEASON_REWARD_NOT_ELIGIBLE' });
});

for (const stage of ['prepared', 'committed', 'published:combates.json', 'published:clasificacion.json',
  'published:resultadoscompetitivos.json', 'published:_database.json']) {
  test(`ranked termination recovers battle, penalty and its receipt together at ${stage}`, async t => {
    const c = await competitiveSetup(t);
    await c.game.battle.challenge({ userId: c.users[0].id, opponentId: c.users[1].id, chatId: c.chatId, mode: '1v1', ranked: true });
    await c.game.battle.accept({ userId: c.users[1].id, chatId: c.chatId });
    await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('ranked receipt interrupted'); } }).game;
    const request = { userId: c.users[0].id, chatId: c.chatId, operationKey: 'recover-ranked-surrender' };
    await assert.rejects(failed.battle.surrender(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = c.open().game;
    const replay = await recovered.battle.surrender(request);
    assert.equal(replay.duplicate, stage !== 'prepared');
    assert.equal(readRecords(c.directory, 'resultadoscompetitivos').length, 1);
    assert.equal(readRecords(c.directory, 'clasificacion').find(rank => rank.userId === c.users[0].id).rating, 984);
    assert.equal(readRecords(c.directory, 'clasificacion').find(rank => rank.userId === c.users[1].id).rating, 1000);
    assert.equal(readRecords(c.directory, 'recompensas').reduce((sum, row) => sum + row.coins, 0), 0);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
    assert.equal((await recovered.validateDatabase()).valid, true);
  });
}

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:economia.json',
  'published:premiostemporada.json', 'published:_database.json']) {
  test(`season money and title recover with the one-time receipt at ${stage}`, async t => {
    const c = await competitiveSetup(t, 4);
    const season = await qualified(c);
    const userId = c.users[0].id;
    const prize = seasonPrize(season.standings.find(row => row.userId === userId), season);
    const before = (await c.game.users.getUser(userId)).economy.coins;
    await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('season credit interrupted'); } }).game;
    const request = { userId, seasonCode: 'T1', operationKey: 'recover-season-award' };
    await assert.rejects(failed.competitive.claimSeasonReward(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = c.open().game;
    const replay = await recovered.competitive.claimSeasonReward(request);
    assert.equal(replay.alreadyClaimed, stage !== 'prepared');
    assert.equal((await recovered.users.getUser(userId)).economy.coins, before + prize.coins);
    assert.equal(readRecords(c.directory, 'premiostemporada').length, 1);
    assert.equal(readRecords(c.directory, 'economia').filter(row => row.sourceType === 'season_reward').length, 1);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
    assert.equal((await recovered.validateDatabase()).valid, true);
  });
}

for (const stage of ['prepared', 'committed', 'published:combates.json', 'published:temporadas.json',
  'published:clasificacion.json', 'published:resultadoscompetitivos.json', 'published:_database.json']) {
  test(`season cutoff recovers its frozen standings and expired battle together at ${stage}`, async t => {
    const c = await competitiveSetup(t);
    await completeRanked(c);
    const ratingsBefore = readRecords(c.directory, 'clasificacion');
    const endsAt = seasonDefinition(1).endsAt;
    c.setTime(new Date(Date.parse(endsAt) - 10).toISOString());
    await c.game.battle.challenge({ userId: c.users[0].id, opponentId: c.users[1].id,
      chatId: c.chatId, ranked: true, mode: '1v1' });
    const active = (await c.game.battle.accept({ userId: c.users[1].id, chatId: c.chatId })).battle;
    assert.equal(active.expiresAt, endsAt);
    await c.game.close();
    c.setTime(endsAt);
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('season cutoff interrupted'); } }).game;
    await assert.rejects(failed.competitive.getSeason({ seasonCode: 'T1' }), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = c.open().game;
    const closed = await recovered.competitive.getSeason({ seasonCode: 'T1' });
    assert.equal(closed.status, 'closed');
    assert.equal(closed.closedAt, endsAt);
    assert.equal(closed.standings.length, 2);
    assert.deepEqual(readRecords(c.directory, 'clasificacion').filter(rank => rank.seasonId === closed.id), ratingsBefore);
    const receipts = readRecords(c.directory, 'resultadoscompetitivos');
    assert.equal(receipts.length, 2);
    assert.equal(receipts.find(receipt => receipt.battleId === active.id).reason, 'season_closed');
    assert.equal(readRecords(c.directory, 'combates').find(battle => battle.id === active.id).status, 'expired');
    assert.ok(readRecords(c.directory, 'unidades').every(unit => unit.lock === null));
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
    assert.equal((await recovered.validateDatabase()).valid, true);
  });
}

test('simultaneous season claims interleaved with daily credit preserve one prize and the exact balance', async t => {
  const c = await competitiveSetup(t, 4);
  const season = await qualified(c);
  const userId = c.users[0].id;
  const prize = seasonPrize(season.standings.find(row => row.userId === userId), season);
  const before = (await c.game.users.getUser(userId)).economy.coins;
  const results = await Promise.all([
    c.game.competitive.claimSeasonReward({ userId, seasonCode: 'T1', operationKey: 'racing-prize:1' }),
    c.game.economy.claimDaily({ userId, operationKey: 'racing-daily' }),
    c.game.competitive.claimSeasonReward({ userId, seasonCode: 'T1', operationKey: 'racing-prize:2' }),
    c.game.competitive.claimSeasonReward({ userId, seasonCode: 'T1', operationKey: 'racing-prize:3' })
  ]);
  assert.equal(results.filter(result => result.reward && !result.alreadyClaimed).length, 1);
  assert.equal((await c.game.users.getUser(userId)).economy.coins, before + prize.coins + 100);
  assert.equal(readRecords(c.directory, 'premiostemporada').length, 1);
  assert.equal(readRecords(c.directory, 'economia').filter(row => row.sourceType === 'season_reward').length, 1);
  assert.equal(readRecords(c.directory, 'economia').filter(row => row.sourceType === 'daily_reward').length, 1);
  await c.game.close();
  const reopened = c.open().game;
  assert.equal((await reopened.users.getUser(userId)).economy.coins, before + prize.coins + 100);
  assert.equal((await reopened.competitive.claimSeasonReward({ userId, seasonCode: 'T1', operationKey: 'racing-prize:4' })).alreadyClaimed, true);
  assert.equal((await reopened.validateDatabase()).valid, true);
});

test('trusted transaction clock rejects an otherwise valid premature season closure', async t => {
  const c = await competitiveSetup(t);
  await c.game.competitive.getSeason();
  const before = stateOf(c.directory), after = structuredClone(before);
  const season = after.temporadas.records[0];
  const closed = { ...season, status: 'closed', closedAt: season.endsAt, standings: [], updatedAt: season.endsAt };
  after.temporadas.records[0] = closed;
  assert.equal(validateDatabase(after).valid, true);
  assert.doesNotThrow(() => validateTransition(before, after));
  corrupt(() => validateTransition(before, after, { now: '2026-10-13T08:00:00.000Z' }));
  await assert.rejects(c.storage.withTransaction(repos => repos.seasons.replace(closed)), error =>
    error.code === 'DATABASE_CORRUPT' && error.details.field === 'competitive.seasonCloseClockAuthority');
  assert.deepEqual(stateOf(c.directory), before);
  assert.equal((await c.game.competitive.getSeason()).status, 'active');
});

test('a dirty transaction cannot omit clock authority with a null clock while unchanged replays remain valid', async t => {
  const c = await competitiveSetup(t);
  const before = stateOf(c.directory);
  c.setTime(null);
  await assert.rejects(c.storage.withTransaction(repos => repos.seasons.insert(seasonDefinition(1))), { code: 'INVALID_CLOCK' });
  assert.deepEqual(stateOf(c.directory), before);
  assert.equal(await c.storage.withTransaction(() => 'unchanged'), 'unchanged');
});

test('trusted transaction clock rejects future or skipped historical active seasons', async t => {
  const c = await competitiveSetup(t);
  const before = stateOf(c.directory), after = structuredClone(before);
  after.temporadas.records.push(seasonDefinition(2));
  assert.equal(validateDatabase(after).valid, true);
  assert.doesNotThrow(() => validateTransition(before, after));
  await assert.rejects(c.storage.withTransaction(repos => repos.seasons.insert(seasonDefinition(2))), error =>
    error.code === 'DATABASE_CORRUPT' && error.details.field === 'competitive.newSeasonClockAuthority');
  assert.deepEqual(stateOf(c.directory), before);
  c.setTime(seasonDefinition(3).startsAt);
  await assert.rejects(c.storage.withTransaction(repos => repos.seasons.insert(seasonDefinition(1))), error =>
    error.code === 'DATABASE_CORRUPT' && error.details.field === 'competitive.newSeasonClockAuthority');
  assert.equal((await c.game.competitive.getSeason()).code, 'T3');
});

test('trusted transaction clock rejects a future ranked result even with a complete valid battle replay', async t => {
  const c = await competitiveSetup(t);
  await c.game.battle.challenge({ userId: c.users[0].id, opponentId: c.users[1].id,
    chatId: c.chatId, ranked: true, mode: '1v1' });
  const active = (await c.game.battle.accept({ userId: c.users[1].id, chatId: c.chatId })).battle;
  const future = '2026-10-13T08:00:00.001Z';
  const finish = async repos => {
    const { battle } = resolveAdvancedAction(active, { type: 'surrender', userId: c.users[0].id,
      now: future, operationKey: 'future-result' });
    return settleBattle(repos, battle, future);
  };
  const before = stateOf(c.directory), after = structuredClone(before);
  await finish(createRepositories(after, true));
  assert.equal(validateDatabase(after).valid, true);
  assert.doesNotThrow(() => validateTransition(before, after));
  await assert.rejects(c.storage.withTransaction(finish), error =>
    error.code === 'DATABASE_CORRUPT' && error.details.field === 'competitive.battleClock');
  assert.deepEqual(stateOf(c.directory), before);
});

test('trusted transaction clock rejects a future season prize despite exact eligibility and ledger proof', async t => {
  const c = await competitiveSetup(t, 4);
  const season = await qualified(c);
  const userId = c.users[0].id;
  const prize = seasonPrize(season.standings.find(row => row.userId === userId), season);
  const future = new Date(Date.parse(season.endsAt) + 1).toISOString();
  const award = async repos => {
    const user = await repos.users.get(userId);
    const id = `seasonReward:${season.id}:${userId}`;
    const credited = await creditCoinsInTransaction(repos, user, prize.coins, future, { type: 'season_reward', id });
    await repos.seasonRewards.insert({ id, seasonId: season.id, userId, operationKey: 'future-prize',
      policyVersion: 1, createdAt: future, ...prize, balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins });
  };
  const before = stateOf(c.directory), after = structuredClone(before);
  await award(createRepositories(after, true));
  assert.equal(validateDatabase(after).valid, true);
  assert.doesNotThrow(() => validateTransition(before, after));
  await assert.rejects(c.storage.withTransaction(award), error =>
    error.code === 'DATABASE_CORRUPT' && error.details.field === 'competitive.rewardClockAuthority');
  assert.deepEqual(stateOf(c.directory), before);
  assert.equal((await c.game.competitive.claimSeasonReward({ userId, seasonCode: 'T1', operationKey: 'legitimate-prize' })).alreadyClaimed, false);
});

test('an unavailable trusted clock permits a read-only replay but cannot authorize a season mutation', async t => {
  const c = await competitiveSetup(t);
  await c.game.competitive.getSeason();
  const before = stateOf(c.directory);
  const season = before.temporadas.records[0];
  const closed = { ...season, status: 'closed', closedAt: season.endsAt, standings: [], updatedAt: season.endsAt };
  c.setTime(null);
  assert.equal(await c.storage.withTransaction(() => 'already committed'), 'already committed');
  await assert.rejects(c.storage.withTransaction(repos => repos.seasons.replace(closed)), { code: 'INVALID_CLOCK' });
  assert.deepEqual(stateOf(c.directory), before);
});
