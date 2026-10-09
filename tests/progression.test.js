import test from 'node:test';
import assert from 'node:assert/strict';
import { effectiveStats, grantXp, xpToNextLevel } from '../game/progression/rules.js';
import { readRecords, register, setup } from './helpers.js';

async function prepare(t, options = {}) {
  const c = setup(t, { randomRoll: () => 0, ...options });
  c.a = await register(c.game, 'Miguel');
  c.b = await register(c.game, 'Lukas', '521111111111');
  c.ua = (await c.game.starter.claimStarter({ userId: c.a.id, choice: 'panda' })).unit;
  c.ub = (await c.game.starter.claimStarter({ userId: c.b.id, choice: 'lobo' })).unit;
  for (const [user, unit] of [[c.a, c.ua], [c.b, c.ub]]) await c.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  c.chatId = 'arena-1';
  return c;
}

async function start(c, opponentId = c.b.id) {
  await c.game.battle.challenge({ userId: c.a.id, opponentId, chatId: c.chatId });
  return (await c.game.battle.accept({ userId: opponentId, chatId: c.chatId })).battle;
}

async function finish(c, battle = null) {
  battle ??= await start(c);
  let request;
  while (battle.status === 'active') {
    request = { userId: battle.turnUserId, chatId: c.chatId, choice: '2', operationKey: `${battle.id}:attack:${battle.turnNumber}` };
    battle = (await c.game.battle.attack(request)).battle;
  }
  return { battle, request };
}

test('XP thresholds retain surplus, cross several levels, respect separate caps and reject overflow', () => {
  assert.deepEqual(grantXp({ level: 1, xp: 65 }, 35, 'user'), { level: 2, xp: 0 });
  assert.deepEqual(grantXp({ level: 1, xp: 90 }, 450, 'unit'), { level: 3, xp: 240 });
  assert.deepEqual(grantXp({ level: 19, xp: 1890 }, 35, 'unit'), { level: 20, xp: 25 });
  assert.deepEqual(grantXp({ level: 49, xp: 4890 }, 35, 'user'), { level: 50, xp: 25 });
  assert.deepEqual(grantXp({ level: 20, xp: 80 }, 35, 'unit'), { level: 20, xp: 115 });
  assert.equal(xpToNextLevel({ level: 20 }, 'unit'), null);
  assert.equal(xpToNextLevel({ level: 20 }, 'user'), 2000);
  assert.deepEqual(grantXp({ level: 1, xp: 500 }, 0, 'unit'), { level: 1, xp: 500 });
  assert.throws(() => grantXp({ level: 1, xp: Number.MAX_SAFE_INTEGER }, 35, 'user'), { code: 'NUMERIC_OVERFLOW' });
});

test('unit growth is bounded and never changes birth stats or speed', () => {
  const stats = { hp: 120, attack: 18, defense: 22, speed: 8 };
  assert.deepEqual(effectiveStats(stats, 1), stats);
  assert.deepEqual(effectiveStats(stats, 20), { hp: 158, attack: 21, defense: 25, speed: 8 });
  assert.deepEqual(effectiveStats(stats, 100), effectiveStats(stats, 20));
  assert.deepEqual(effectiveStats(stats, 20, 0), stats);
  assert.deepEqual(stats, { hp: 120, attack: 18, defense: 22, speed: 8 });
});

test('three victories level player and unit independently and new fights freeze the increased stats', async t => {
  const c = await prepare(t);
  const fights = [];
  for (let i = 0; i < 3; i++) fights.push((await finish(c)).battle);
  assert.ok(fights.every(b => b.winnerId === c.a.id && b.settlement.reason === 'rewarded'));
  const user = await c.game.users.getUser(c.a.id);
  const unit = await c.game.units.getUnit(c.ua.id);
  assert.deepEqual(user.progress, { level: 2, xp: 5 });
  assert.equal(user.economy.coins, 360);
  assert.deepEqual(unit.progress, { level: 2, xp: 5 });
  assert.deepEqual(unit.initialStats, c.ua.initialStats);
  assert.equal(unit.serial, c.ua.serial);
  assert.equal(unit.characterRevision, c.ua.characterRevision);
  assert.equal(unit.currentStats.hp, 122);
  assert.deepEqual((await c.game.users.getUser(c.b.id)).progress, { level: 1, xp: 45 });
  assert.equal(fights[2].players[0].unit.stats.hp, 120);
  assert.equal(fights[2].settlement.rewards[0].unitLevelAfter, 2);
  const next = await start(c);
  assert.equal(next.players[0].unit.stats.hp, 122);
  assert.equal(next.players[0].unit.level, 2);
  assert.equal(next.players[0].unit.statsVersion, 2);
  assert.deepEqual(await c.game.battle.getHistoryBattle({ userId: c.a.id, battleId: fights[0].id }), fights[0]);
  assert.equal((await c.game.units.getCombatDetails({ unitId: c.ua.id })).units[0].stats.hp, 122);
});

test('same pair limit survives group changes and reopening and resets at the 24-hour boundary', async t => {
  let now = '2026-10-08T20:00:00Z';
  const c = await prepare(t, { clock: () => now });
  for (let i = 0; i < 3; i++) await finish(c);
  await c.game.close();
  c.game = c.open().game;
  c.chatId = 'arena-2';
  const { battle } = await finish(c);
  assert.equal(battle.settlement.reason, 'pair_limit');
  assert.ok(battle.settlement.rewards.every(r => r.coins === 0 && r.userXp === 0 && r.unitXp === 0));
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 360);
  assert.deepEqual((await c.game.users.getUser(c.a.id)).progress, { level: 2, xp: 5 });
  assert.equal((await c.game.users.getUser(c.a.id)).battleStats.matches, 4);
  now = '2026-10-09T20:00:00Z';
  const next = (await finish(c)).battle;
  assert.equal(next.settlement.reason, 'rewarded');
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 480);
});

test('a different rival has its own limit and only the participating unit gains XP', async t => {
  const c = await prepare(t);
  for (let i = 0; i < 3; i++) await finish(c);
  const other = await register(c.game, 'Juan', '521222222222');
  const ou = (await c.game.starter.claimStarter({ userId: other.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: other.id, unitIds: [ou.id] });
  const extra = await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'panda_guerrero', origin: { type: 'admin', sourceId: 'test' }, operationKey: 'extra' });
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [extra.id] });
  const { battle } = await finish(c, await start(c, other.id));
  assert.equal(battle.settlement.reason, 'rewarded');
  assert.equal((await c.game.units.getUnit(extra.id)).progress.xp, 35);
  assert.deepEqual((await c.game.units.getUnit(c.ua.id)).progress, { level: 2, xp: 5 });
  assert.deepEqual((await c.game.users.getUser(c.a.id)).progress, { level: 2, xp: 40 });
});

test('early surrender gives no XP and does not consume the pair allowance; contested surrender rewards both', async t => {
  const c = await prepare(t, { randomRoll: () => 99 });
  await start(c);
  const early = (await c.game.battle.surrender({ userId: c.b.id, chatId: c.chatId })).battle;
  assert.equal(early.settlement.reason, 'early_surrender');
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 0);
  let battle = await start(c);
  for (let i = 0; i < 4; i++) battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
  battle = (await c.game.battle.surrender({ userId: c.b.id, chatId: c.chatId })).battle;
  assert.equal(battle.settlement.reason, 'rewarded');
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 120);
  assert.equal((await c.game.users.getUser(c.b.id)).progress.xp, 15);
  assert.equal(readRecords(c.directory, 'recompensas').length, 4);
});

test('draw awards both players and units XP; expiration records zero rewards and unaccepted challenges record none', async t => {
  let now = '2026-10-08T20:00:00Z';
  const c = await prepare(t, { clock: () => now, randomRoll: () => 99 });
  const draw = (await finish(c)).battle;
  assert.equal(draw.finishReason, 'turn_limit');
  assert.ok(draw.settlement.rewards.every(r => r.userXp === 20 && r.unitXp === 20 && r.coins === 0));
  await start(c);
  now = '2026-10-08T20:31:00Z';
  await c.game.economy.getBalance(c.a.id);
  const expired = await c.game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId });
  assert.equal(expired.settlement.reason, 'inactivity');
  assert.equal((await c.game.users.getUser(c.a.id)).progress.xp, 20);
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId });
  now = '2026-10-08T20:37:00Z';
  await c.game.battle.sweepExpired();
  assert.equal(readRecords(c.directory, 'recompensas').length, 4);
  assert.equal((await c.game.battle.getHistory({ userId: c.a.id })).items.length, 2);
});

test('concurrent delivery of the winning attack and replay after restart award exactly once', async t => {
  const c = await prepare(t);
  let battle = await start(c);
  for (let i = 0; i < 3; i++) battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
  const request = { userId: battle.turnUserId, chatId: c.chatId, choice: '2', operationKey: 'winning-message' };
  const results = await Promise.all([c.game.battle.attack(request), c.game.battle.attack(request)]);
  assert.deepEqual(results.map(r => r.duplicate), [false, true]);
  assert.equal(results[0].battle.status, 'finished');
  await c.game.close();
  c.game = c.open().game;
  assert.equal((await c.game.battle.attack(request)).duplicate, true);
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 120);
  assert.equal(readRecords(c.directory, 'recompensas').length, 2);
});

test('history is newest first, paginates across arenas and blocks cursors and details from other players', async t => {
  let now = '2026-10-08T20:00:00Z';
  const c = await prepare(t, { clock: () => now });
  const ids = [];
  for (let i = 0; i < 6; i++) {
    now = `2026-10-08T20:0${i}:00Z`;
    c.chatId = `arena-${i}`;
    ids.push((await finish(c)).battle.id);
  }
  const page = await c.game.battle.getHistory({ userId: c.a.id, limit: 5 });
  assert.deepEqual(page.items.map(b => b.id), ids.slice(1).reverse());
  const last = await c.game.battle.getHistory({ userId: c.a.id, cursor: page.nextCursor, limit: 5 });
  assert.deepEqual(last.items.map(b => b.id), [ids[0]]);
  assert.equal(last.nextCursor, null);
  await assert.rejects(c.game.battle.getHistory({ userId: c.b.id, cursor: page.nextCursor }), { code: 'INVALID_CURSOR' });
  const other = await register(c.game, 'Otro', '521222222222');
  await assert.rejects(c.game.battle.getHistoryBattle({ userId: other.id, battleId: ids[0] }), { code: 'BATTLE_NOT_PARTICIPANT' });
});

test('balances, progress, reward audit, receipts and growth version reject edits outside settlement', async t => {
  const c = await prepare(t);
  const { battle } = await finish(c);
  const mutations = [
    async repos => { const u = await repos.users.get(c.a.id); await repos.users.replace({ ...u, economy: { coins: 999 } }); },
    async repos => { const u = await repos.users.get(c.a.id); await repos.users.replace({ ...u, progress: { level: 2, xp: 35 } }); },
    async repos => { const u = await repos.units.get(c.ua.id); await repos.units.replace({ ...u, progress: { level: 20, xp: 0 } }); },
    async repos => { const r = (await repos.rewards.all())[0]; await repos.rewards.replace({ ...r, coins: 999 }); },
    async repos => { const b = await repos.battles.get(battle.id); b.settlement.rewards[0].coins = 999; await repos.battles.replace(b); },
    async repos => { const u = await repos.units.get(c.ua.id); await repos.units.replace({ ...u, statGrowthVersion: 0 }); },
    async repos => { const b = await repos.state.get(`progression:${c.a.id}`); await repos.state.replace({ ...b, coins: 999 }); }
  ];
  for (const mutation of mutations) await assert.rejects(c.storage.withTransaction(mutation), { code: 'DATABASE_CORRUPT' });
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 120);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:unidades.json', 'published:combates.json', 'published:recompensas.json']) {
  test(`winning attack rewards, XP, stats and locks recover together at ${stage}`, async t => {
    const c = await prepare(t);
    let battle = await start(c);
    for (let i = 0; i < 3; i++) battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
    const request = { userId: battle.turnUserId, chatId: c.chatId, choice: '2', operationKey: 'winning-crash' };
    await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted reward'); } }).game;
    await assert.rejects(failed.battle.attack(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = c.open().game;
    const rolledBack = stage === 'prepared';
    assert.equal((await recovered.validateDatabase()).valid, true);
    assert.equal((await recovered.economy.getBalance(c.a.id)).coins, rolledBack ? 0 : 120);
    assert.equal(readRecords(c.directory, 'recompensas').length, rolledBack ? 0 : 2);
    assert.equal((await recovered.units.getUnit(c.ua.id)).lock === null, !rolledBack);
    assert.equal((await recovered.battle.attack(request)).duplicate, !rolledBack);
    assert.equal((await recovered.users.getUser(c.a.id)).progress.xp, 35);
    assert.equal((await recovered.units.getUnit(c.ua.id)).progress.xp, 35);
    assert.equal((await recovered.users.getUser(c.a.id)).battleStats.matches, 1);
    assert.equal((await recovered.economy.getBalance(c.a.id)).coins, 120);
  });
}
