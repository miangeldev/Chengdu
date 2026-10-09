import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDamage } from '../game/battle/engine.js';
import { readRecords, register, setup } from './helpers.js';

async function prepare(t, options = {}) {
  const context = setup(t, { randomRoll: () => 0, ...options });
  const a = await register(context.game, 'Miguel');
  const b = await register(context.game, 'Juan', '521111111111');
  const ua = (await context.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await context.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await context.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await context.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  return { ...context, a, b, ua, ub, chatId: 'arena-1' };
}

async function start(context) {
  const { battle } = await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, operationKey: 'challenge:1' });
  return (await context.game.battle.accept({ userId: context.b.id, chatId: context.chatId, battleId: battle.id, operationKey: 'accept:1' })).battle;
}

test('team selection validates ownership and adds/removes atomically', async t => {
  const c = await prepare(t);
  await assert.rejects(c.game.teams.setTeam({ userId: c.a.id, unitIds: [c.ub.id] }), { code: 'UNIT_NOT_OWNED' });
  await assert.rejects(c.game.teams.setTeam({ userId: c.a.id, unitIds: [c.ua.id, c.ub.id] }), { code: 'INVALID_TEAM' });
  const extra = await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'mago_carmesi', origin: { type: 'admin', sourceId: 'test' }, operationKey: 'extra:1' });
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [] });
  const results = await Promise.allSettled([
    c.game.teams.updateTeam({ userId: c.a.id, operation: 'add', unitId: c.ua.id }),
    c.game.teams.updateTeam({ userId: c.a.id, operation: 'add', unitId: extra.id })
  ]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'TEAM_FULL');
  await c.game.teams.updateTeam({ userId: c.a.id, operation: 'remove', unitId: c.ua.id });
  assert.equal((await c.game.teams.getTeam(c.a.id)).units.length, 0);
});

test('challenges require prepared distinct players and only the recipient can accept', async t => {
  const c = await prepare(t);
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.a.id, chatId: c.chatId }), { code: 'SELF_CHALLENGE' });
  await c.game.teams.setTeam({ userId: c.b.id, unitIds: [] });
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId }), { code: 'TEAM_EMPTY' });
  await c.game.teams.setTeam({ userId: c.b.id, unitIds: [c.ub.id] });
  const request = { userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, operationKey: 'challenge:1' };
  const first = await c.game.battle.challenge(request);
  assert.equal((await c.game.battle.challenge(request)).battle.id, first.battle.id);
  await assert.rejects(c.game.battle.accept({ userId: c.a.id, chatId: c.chatId }), { code: 'CHALLENGE_NOT_YOURS' });
  await assert.rejects(c.game.battle.challenge({ ...request, operationKey: 'challenge:2' }), { code: 'PLAYER_BUSY' });
  const battle = await startAlreadyPending(c);
  assert.equal(battle.turnUserId, c.b.id);
  assert.equal(battle.turnNumber, 1);
  assert.equal((await c.game.units.getUnit(c.ua.id)).lock.referenceId, battle.id);
  await assert.rejects(c.game.teams.setTeam({ userId: c.a.id, unitIds: [] }), { code: 'TEAM_LOCKED' });
});

async function startAlreadyPending(c) {
  return (await c.game.battle.accept({ userId: c.b.id, chatId: c.chatId, operationKey: 'accept:1' })).battle;
}

test('battle snapshots and turn survive reopening, and combat stays in its arena', async t => {
  const c = await prepare(t);
  const battle = await start(c);
  await c.game.close();
  const reopened = c.open().game;
  const restored = await reopened.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId });
  assert.deepEqual(restored, battle);
  await assert.rejects(reopened.battle.attack({ userId: c.b.id, chatId: 'arena-2', battleId: battle.id, choice: '1' }), { code: 'BATTLE_WRONG_CHAT' });
  const outsider = await register(reopened, 'Otro', '521333333333');
  await assert.rejects(reopened.battle.getMyBattle({ userId: outsider.id, chatId: c.chatId, battleId: battle.id }), { code: 'BATTLE_NOT_PARTICIPANT' });
  const result = await reopened.battle.attack({ userId: c.b.id, chatId: c.chatId, choice: '1' });
  assert.equal(result.battle.turnNumber, 2);
});

test('only the current player can attack; failed attacks still pass the turn', async t => {
  const c = await prepare(t, { randomRoll: () => 99 });
  await start(c);
  await assert.rejects(c.game.battle.attack({ userId: c.a.id, chatId: c.chatId, choice: '1' }), { code: 'NOT_YOUR_TURN' });
  await assert.rejects(c.game.battle.attack({ userId: c.b.id, chatId: c.chatId, choice: '3' }), { code: 'INVALID_ATTACK' });
  const result = await c.game.battle.attack({ userId: c.b.id, chatId: c.chatId, choice: '2' });
  assert.equal(result.action.hit, false);
  assert.equal(result.action.damage, 0);
  assert.equal(result.battle.players[0].unit.hp, c.ua.initialStats.hp);
  assert.equal(result.battle.turnUserId, c.a.id);
  assert.equal(calculateDamage({ power: 1 }, { attack: 1 }, { defense: 1000 }), 1);
});

test('concurrent repeated message IDs apply one attack and a new wrong-turn action is rejected', async t => {
  const c = await prepare(t);
  await start(c);
  const request = { userId: c.b.id, chatId: c.chatId, choice: '1', operationKey: 'message:attack-1' };
  const results = await Promise.all([c.game.battle.attack(request), c.game.battle.attack(request)]);
  assert.deepEqual(results.map(r => r.duplicate), [false, true]);
  assert.equal(results[1].battle.actions.length, 1);
  await assert.rejects(c.game.battle.attack({ ...request, operationKey: 'message:attack-2' }), { code: 'NOT_YOUR_TURN' });
  await assert.rejects(c.game.battle.attack({ ...request, choice: '2' }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.battle.attack({ ...request, battleId: 'BTL-other' }), { code: 'OPERATION_CONFLICT' });
});

test('a complete knockout settles player/unit statistics once and releases both units', async t => {
  const c = await prepare(t);
  let battle = await start(c);
  let lastRequest;
  while (battle.status === 'active') {
    lastRequest = { userId: battle.turnUserId, chatId: c.chatId, choice: '2', operationKey: `attack:${battle.turnNumber}` };
    battle = (await c.game.battle.attack(lastRequest)).battle;
  }
  assert.equal(battle.finishReason, 'knockout');
  const winner = battle.winnerId;
  assert.equal((await c.game.battle.attack(lastRequest)).duplicate, true);
  for (const player of battle.players) {
    const user = await c.game.users.getUser(player.userId);
    const unit = await c.game.units.getUnit(player.unit.id);
    assert.equal(user.battleStats.matches, 1);
    assert.equal(user.battleStats.wins, player.userId === winner ? 1 : 0);
    assert.equal(user.battleStats.losses, player.userId === winner ? 0 : 1);
    assert.equal(unit.battleStats.wins, user.battleStats.wins);
    assert.equal(unit.battleStats.losses, user.battleStats.losses);
    assert.equal(unit.lock, null);
    assert.equal(unit.initialStats.hp, player.unit.stats.hp);
    assert.equal(user.economy.coins, 0);
    assert.equal(user.progress.xp, 0);
  }
  await assert.rejects(c.game.battle.attack({ ...lastRequest, operationKey: 'after-finish' }), { code: 'BATTLE_NOT_FOUND' });
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId });
});

test('surrender works outside the turn and repeated surrender cannot award twice', async t => {
  const c = await prepare(t);
  await start(c);
  const args = { userId: c.a.id, chatId: c.chatId, operationKey: 'surrender:1' };
  const result = await c.game.battle.surrender(args);
  assert.equal(result.battle.winnerId, c.b.id);
  assert.equal((await c.game.battle.surrender(args)).duplicate, true);
  assert.equal((await c.game.users.getUser(c.b.id)).battleStats.wins, 1);
});

test('attack balance changes during a fight do not rewrite its snapshots', async t => {
  const c = await prepare(t);
  const battle = await start(c);
  const oldAttack = battle.players[1].unit.attacks[0];
  await c.storage.withTransaction(async repos => {
    const attack = await repos.attacks.get(oldAttack.id);
    await repos.attacks.replace({ ...attack, power: 999, revision: attack.revision + 1 });
  });
  const result = await c.game.battle.attack({ userId: c.b.id, chatId: c.chatId, choice: '1' });
  assert.equal(result.action.damage, calculateDamage(oldAttack, battle.players[1].unit.stats, battle.players[0].unit.stats));
  assert.equal(result.battle.players[1].unit.attacks[0].power, oldAttack.power);
});

test('rejected/cancelled invitations do not affect match statistics or lock units', async t => {
  const c = await prepare(t);
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId });
  await assert.rejects(c.game.battle.closeChallenge({ userId: c.a.id, chatId: c.chatId, reject: true }), { code: 'CHALLENGE_NOT_YOURS' });
  assert.equal((await c.game.battle.closeChallenge({ userId: c.b.id, chatId: c.chatId, reject: true })).battle.status, 'rejected');
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId });
  assert.equal((await c.game.battle.closeChallenge({ userId: c.a.id, chatId: c.chatId })).battle.status, 'cancelled');
  assert.equal((await c.game.users.getUser(c.a.id)).battleStats.matches, 0);
  assert.equal((await c.game.units.getUnit(c.ua.id)).lock, null);
});

test('invitation and inactivity deadlines expire safely, once, on the next query', async t => {
  let now = '2026-10-08T20:00:00Z';
  const c = await prepare(t, { clock: () => now });
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId });
  now = '2026-10-08T20:06:00Z';
  assert.equal((await c.game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId })).status, 'expired');
  assert.equal((await c.game.users.getUser(c.a.id)).battleStats.matches, 0);
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId });
  await startAlreadyPending(c);
  now = '2026-10-08T20:37:00Z';
  const profile = await c.game.users.getProfile(c.a.id);
  assert.equal(profile.user.battleStats.matches, 1);
  assert.equal((await c.game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId })).finishReason, 'inactivity');
  assert.equal((await c.game.units.getUnit(c.ua.id)).lock, null);
  assert.equal(await c.game.battle.sweepExpired(), 0);
  assert.equal((await c.game.users.getUser(c.a.id)).battleStats.matches, 1);
});

test('fifty missed attacks end in a draw instead of holding units forever', async t => {
  const c = await prepare(t, { randomRoll: () => 99 });
  let battle = await start(c);
  for (let i = 0; i < 50; i++) battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
  assert.equal(battle.status, 'finished');
  assert.equal(battle.finishReason, 'turn_limit');
  assert.equal(battle.winnerId, null);
  assert.deepEqual((await c.game.users.getUser(c.a.id)).battleStats, { wins: 0, losses: 0, matches: 1 });
});

test('snapshot, action history and settlement integrity reject unauthorized rewrites', async t => {
  const c = await prepare(t);
  await start(c);
  const { battle } = await c.game.battle.attack({ userId: c.b.id, chatId: c.chatId, choice: '1' });
  const changed = structuredClone(battle);
  changed.players[0].unit.hp += 10;
  await assert.rejects(c.storage.withTransaction(repos => repos.battles.replace(changed)), { code: 'DATABASE_CORRUPT' });
  await assert.rejects(c.storage.withTransaction(async repos => {
    const user = await repos.users.get(c.a.id);
    await repos.users.replace({ ...user, battleStats: { ...user.battleStats, wins: 1, matches: 1 } });
  }), { code: 'DATABASE_CORRUPT' });
  assert.equal(readRecords(c.directory, 'combates')[0].players[0].unit.hp, battle.players[0].unit.hp);
});

for (const stage of ['prepared', 'committed', 'published:unidades.json', 'published:combates.json']) {
  test(`surrender statistics and unit locks recover consistently at ${stage}`, async t => {
    const c = await prepare(t);
    await start(c);
    await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted settlement'); } }).game;
    const args = { userId: c.a.id, chatId: c.chatId, operationKey: 'surrender:crash' };
    await assert.rejects(failed.battle.surrender(args), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = c.open().game;
    const beforeReplay = await recovered.users.getUser(c.b.id);
    assert.equal(beforeReplay.battleStats.wins, stage === 'prepared' ? 0 : 1);
    const result = await recovered.battle.surrender(args);
    assert.equal(result.battle.status, 'finished');
    assert.equal((await recovered.users.getUser(c.b.id)).battleStats.wins, 1);
    assert.equal((await recovered.units.getUnit(c.ua.id)).lock, null);
    assert.equal((await recovered.units.getUnit(c.ub.id)).lock, null);
  });
}
