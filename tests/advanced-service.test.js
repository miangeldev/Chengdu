import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS } from '../storage/validation.js';
import { advancedSetup, startAdvanced, advanceAttacks } from './advanced-helpers.js';
import { readRecords, register } from './helpers.js';

const contents = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  fs.readFileSync(path.join(directory, `${name}.json`), 'utf8')
]));

test('advanced formats validate both teams before accepting and lock every reserve until the result is settled', async t => {
  const c = await advancedSetup(t);
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, mode: '4v4' }), { code: 'INVALID_BATTLE_MODE' });
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, mode: '2v2' }), { code: 'TEAM_SIZE_MISMATCH' });
  const invitation = { userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, mode: '3v3', operationKey: 'invite' };
  const pending = (await c.game.battle.challenge(invitation)).battle;
  assert.equal(pending.format, '3v3');
  assert.equal((await c.game.battle.challenge(invitation)).duplicate, true);
  await assert.rejects(c.game.battle.challenge({ ...invitation, mode: 'auto' }), { code: 'OPERATION_CONFLICT' });
  await c.game.teams.setTeam({ userId: c.b.id, unitIds: [c.units[1][0].id] });
  const before = contents(c.directory);
  const accept = { userId: c.b.id, chatId: c.chatId, operationKey: 'accept' };
  await assert.rejects(c.game.battle.accept(accept), { code: 'TEAM_SIZE_MISMATCH' });
  assert.deepEqual(contents(c.directory), before);
  await c.game.teams.setTeam({ userId: c.b.id, unitIds: c.units[1].map(unit => unit.id) });
  const results = await Promise.all([c.game.battle.accept(accept), c.game.battle.accept(accept)]);
  assert.deepEqual(results.map(result => result.duplicate), [false, true]);
  for (const unit of c.units.flat()) assert.deepEqual((await c.game.units.getUnit(unit.id)).lock, { type: 'battle', referenceId: pending.id });
  await assert.rejects(c.game.market.createListing({ sellerId: c.a.id, unitId: c.units[0][2].id, price: 20, operationKey: 'sell-reserve' }), { code: 'UNIT_LOCKED' });
  await c.game.battle.surrender({ userId: c.a.id, chatId: c.chatId, operationKey: 'surrender' });
  for (const unit of c.units.flat()) assert.equal((await c.game.units.getUnit(unit.id)).lock, null);
  const listed = await c.game.market.createListing({ sellerId: c.a.id, unitId: c.units[0][2].id, price: 20, operationKey: 'sell-after' });
  assert.equal(listed.listing.status, 'active');
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('advanced action replay is independent of the current active slot, restart, clock faults and random consumption', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  let draws = 0;
  const c = await advancedSetup(t, { clock: () => now, randomRoll: () => { draws++; return 0; } });
  let battle = await startAdvanced(c);
  const actorId = battle.turnUserId;
  const request = { userId: actorId, chatId: c.chatId, choice: '1', operationKey: 'original-attack' };
  const actions = await Promise.all([c.game.battle.attack(request), c.game.battle.attack(request)]);
  assert.deepEqual(actions.map(result => result.duplicate), [false, true]);
  assert.equal(draws, 1);
  battle = (await c.game.battle.attack({ userId: actions[0].battle.turnUserId, chatId: c.chatId, choice: '1', operationKey: 'other-attack' })).battle;
  const switched = { userId: actorId, chatId: c.chatId, choice: '2', operationKey: 'switch' };
  battle = (await c.game.battle.switchUnit(switched)).battle;
  assert.equal(battle.players.find(player => player.userId === actorId).activeIndex, 1);
  const originalAction = actions[0].action;
  const before = contents(c.directory);
  await c.game.close();
  c.game = c.open().game;
  now = 'faulty-clock';
  const replay = await c.game.battle.attack(request);
  assert.equal(replay.duplicate, true);
  assert.deepEqual(replay.action, originalAction);
  assert.equal(replay.battle.players.find(player => player.userId === actorId).activeIndex, 1);
  assert.equal((await c.game.battle.switchUnit(switched)).duplicate, true);
  await assert.rejects(c.game.battle.attack({ ...request, choice: '2' }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.battle.switchUnit({ ...switched, choice: '3' }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.battle.surrender({ userId: actorId, chatId: c.chatId, operationKey: request.operationKey }), { code: 'OPERATION_CONFLICT' });
  assert.equal(draws, 2);
  assert.deepEqual(contents(c.directory), before);
});

test('different simultaneous actions consume one turn and authenticated operation keys cannot be reused by another participant', async t => {
  const c = await advancedSetup(t);
  const battle = await startAdvanced(c);
  const request = { userId: battle.turnUserId, chatId: c.chatId, choice: '1', operationKey: 'competing-attack' };
  const race = await Promise.allSettled([
    c.game.battle.attack(request),
    c.game.battle.switchUnit({ ...request, choice: '2', operationKey: 'competing-switch' })
  ]);
  assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(race.find(result => result.status === 'rejected').reason.code, 'NOT_YOUR_TURN');
  const current = await c.game.battle.getMyBattle({ userId: request.userId, chatId: c.chatId });
  assert.equal(current.actions.length, 1);
  const other = current.players.find(player => player.userId !== request.userId);
  await assert.rejects(c.game.battle.attack({ ...request, userId: other.userId }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.battle.attack({ ...request, chatId: 'another-arena' }), { code: 'OPERATION_CONFLICT' });
  const outsider = await register(c.game, 'Ana', '521222222222');
  await assert.rejects(c.game.battle.getMyBattle({ userId: outsider.id, chatId: c.chatId, battleId: current.id }), { code: 'BATTLE_NOT_PARTICIPANT' });
});

test('a complete 3v3 participation shares XP once and a later sale preserves its six combat snapshots and old receipt', async t => {
  const c = await advancedSetup(t);
  let battle = await startAdvanced(c);
  for (const choice of ['2', '2', '3', '3']) {
    battle = (await c.game.battle.switchUnit({ userId: battle.turnUserId, chatId: c.chatId, choice, operationKey: `switch:${battle.actions.length}` })).battle;
  }
  battle = await advanceAttacks(c, battle, 4);
  assert.equal(battle.status, 'active');
  assert.ok(battle.players.every(player => player.units.every(unit => unit.participated)));
  const finishRequest = { userId: c.b.id, chatId: c.chatId, operationKey: 'finish' };
  battle = (await c.game.battle.surrender(finishRequest)).battle;
  const saved = structuredClone(battle);
  assert.equal(battle.settlement.reason, 'rewarded');
  assert.equal(readRecords(c.directory, 'recompensas').length, 2);
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 120);
  for (const [i, player] of battle.players.entries()) {
    const reward = battle.settlement.rewards.find(reward => reward.userId === player.userId);
    assert.equal(reward.unitRewards.reduce((sum, unit) => sum + unit.xp, 0), i === 0 ? 35 : 15);
    assert.deepEqual(reward.unitRewards.map(unit => unit.xp), i === 0 ? [12, 12, 11] : [5, 5, 5]);
    for (const snapshot of player.units) assert.equal((await c.game.units.getUnit(snapshot.id)).battleStats[i === 0 ? 'wins' : 'losses'], 1);
  }
  await c.game.economy.claimDaily({ userId: c.b.id, operationKey: 'fund-buyer' });
  const soldUnit = c.units[0][2];
  const { listing } = await c.game.market.createListing({ sellerId: c.a.id, unitId: soldUnit.id, price: 50, operationKey: 'sell-trained' });
  await c.game.market.buyListing({ buyerId: c.b.id, listingId: listing.id, operationKey: 'buy-trained' });
  const after = await c.game.units.getUnit(soldUnit.id);
  assert.equal(after.ownerId, c.b.id);
  assert.equal(after.ownershipVersion, 1);
  assert.deepEqual(after.initialStats, soldUnit.initialStats);
  assert.equal(after.progress.xp, 11);
  assert.deepEqual(await c.game.battle.getHistoryBattle({ userId: c.a.id, battleId: saved.id }), saved);
  assert.deepEqual((await c.game.battle.surrender(finishRequest)).battle, saved);
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 167);
  assert.equal(readRecords(c.directory, 'recompensas').length, 2);
  assert.equal((await c.game.validateDatabase()).valid, true);
});
