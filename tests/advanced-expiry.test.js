import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS } from '../storage/validation.js';
import { advancedSetup, startAdvanced } from './advanced-helpers.js';
import { readRecords } from './helpers.js';

const contents = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  fs.readFileSync(path.join(directory, `${name}.json`), 'utf8')
]));

for (const method of ['attack', 'switchUnit', 'surrender']) {
  test(`expired ${method} publishes inactivity, six unlocks and zero receipts before returning its error`, async t => {
    let now = '2026-10-11T10:00:00.000Z';
    const context = await advancedSetup(t, { clock: () => now });
    const battle = await startAdvanced(context);
    now = '2026-10-11T10:30:00.000Z';
    const request = { userId: battle.turnUserId, chatId: context.chatId, choice: method === 'switchUnit' ? '2' : '1',
      operationKey: `expired:${method}` };
    await assert.rejects(context.game.battle[method](request), { code: 'BATTLE_NOT_FOUND' });
    const saved = readRecords(context.directory, 'combates')[0];
    assert.equal(saved.status, 'expired');
    assert.equal(saved.finishReason, 'inactivity');
    assert.equal(saved.actions.length, 0);
    assert.equal(readRecords(context.directory, 'unidades').every(unit => unit.lock === null && unit.progress.xp === 0), true);
    const rewards = readRecords(context.directory, 'recompensas');
    assert.equal(rewards.length, 2);
    assert.equal(rewards.every(reward => reward.coins === 0 && reward.userXp === 0 && reward.unitXp === 0), true);
    assert.equal(readRecords(context.directory, 'economia').every(movement => movement.amount === 0), true);
    const before = contents(context.directory);
    await assert.rejects(context.game.battle[method](request), { code: 'BATTLE_NOT_FOUND' });
    assert.deepEqual(contents(context.directory), before);
    assert.equal((await context.game.validateDatabase()).valid, true);
  });
}

test('accepting at the five minute deadline commits the invitation timeout without locks or rewards', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const context = await advancedSetup(t, { clock: () => now });
  await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode: 'auto' });
  now = '2026-10-11T10:05:00.000Z';
  await assert.rejects(context.game.battle.accept({ userId: context.b.id, chatId: context.chatId,
    operationKey: 'too-late-acceptance' }), { code: 'BATTLE_NOT_FOUND' });
  const saved = readRecords(context.directory, 'combates')[0];
  assert.equal(saved.status, 'expired');
  assert.equal(saved.finishReason, 'challenge_timeout');
  assert.equal(saved.acceptedAt, null);
  assert.equal(readRecords(context.directory, 'unidades').every(unit => unit.lock === null), true);
  assert.equal(readRecords(context.directory, 'recompensas').length, 0);
});

for (const reject of [false, true]) {
  test(`${reject ? 'rejecting' : 'cancelling'} an already expired invitation commits its timeout`, async t => {
    let now = '2026-10-11T10:00:00.000Z';
    const context = await advancedSetup(t, { clock: () => now });
    await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode: 'auto' });
    now = '2026-10-11T10:05:00.000Z';
    await assert.rejects(context.game.battle.closeChallenge({ userId: reject ? context.b.id : context.a.id,
      chatId: context.chatId, reject }), { code: 'BATTLE_NOT_FOUND' });
    const saved = readRecords(context.directory, 'combates')[0];
    assert.equal(saved.status, 'expired');
    assert.equal(saved.finishReason, 'challenge_timeout');
    assert.equal(readRecords(context.directory, 'recompensas').length, 0);
    assert.equal(readRecords(context.directory, 'unidades').every(unit => unit.lock === null), true);
  });
}

test('numeric attack and switch choices replay identically across active unit changes, restart and clock faults', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  let draws = 0;
  const context = await advancedSetup(t, { clock: () => now, randomRoll: () => { draws++; return 0; } });
  const battle = await startAdvanced(context);
  const attackRequest = { userId: battle.turnUserId, chatId: context.chatId, choice: 1, operationKey: 'numeric-attack' };
  const original = await context.game.battle.attack(attackRequest);
  assert.equal((await context.game.battle.attack(attackRequest)).duplicate, true);
  assert.equal((await context.game.battle.attack({ ...attackRequest, choice: '1' })).duplicate, true);
  await context.game.battle.attack({ userId: original.battle.turnUserId, chatId: context.chatId, choice: '1' });
  const switchRequest = { userId: attackRequest.userId, chatId: context.chatId, choice: 2, operationKey: 'numeric-switch' };
  const switched = await context.game.battle.switchUnit(switchRequest);
  assert.equal(switched.battle.players.find(player => player.userId === switchRequest.userId).activeIndex, 1);
  assert.equal((await context.game.battle.switchUnit(switchRequest)).duplicate, true);
  const before = contents(context.directory);
  await context.game.close();
  context.game = context.open().game;
  now = 'faulty-clock';
  assert.deepEqual((await context.game.battle.attack(attackRequest)).action, original.action);
  assert.equal((await context.game.battle.switchUnit(switchRequest)).duplicate, true);
  await assert.rejects(context.game.battle.attack({ ...attackRequest, choice: 2 }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(context.game.battle.switchUnit({ ...switchRequest, choice: 3 }), { code: 'OPERATION_CONFLICT' });
  assert.equal(draws, 2);
  assert.deepEqual(contents(context.directory), before);
});

test('invalid RNG and invalid authorization still roll back an action completely', async t => {
  const context = await advancedSetup(t, { randomRoll: () => 100 });
  const battle = await startAdvanced(context);
  const before = contents(context.directory);
  await assert.rejects(context.game.battle.attack({ userId: battle.turnUserId, chatId: context.chatId,
    choice: '1', operationKey: 'invalid-random' }), { code: 'INVALID_RANDOM_ROLL' });
  await assert.rejects(context.game.battle.attack({ userId: battle.turnUserId, chatId: 'another-arena',
    battleId: battle.id, choice: '1', operationKey: 'invalid-arena' }), { code: 'BATTLE_WRONG_CHAT' });
  assert.deepEqual(contents(context.directory), before);
  assert.equal(readRecords(context.directory, 'combates')[0].status, 'active');
  assert.equal(readRecords(context.directory, 'recompensas').length, 0);
});

test('classic expiration keeps its previous error code and also publishes one zero receipt per player', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const context = await advancedSetup(t, { clock: () => now });
  await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode: 'classic' });
  const battle = (await context.game.battle.accept({ userId: context.b.id, chatId: context.chatId })).battle;
  now = '2026-10-11T10:30:00.000Z';
  await assert.rejects(context.game.battle.attack({ userId: battle.turnUserId, chatId: context.chatId, choice: '1' }),
    { code: 'BATTLE_NOT_FOUND' });
  assert.equal(readRecords(context.directory, 'combates')[0].status, 'expired');
  assert.equal(readRecords(context.directory, 'recompensas').length, 2);
  assert.equal(readRecords(context.directory, 'recompensas').every(reward => reward.version === 1 && reward.coins === 0), true);
  assert.equal(readRecords(context.directory, 'unidades').every(unit => unit.lock === null), true);
});
