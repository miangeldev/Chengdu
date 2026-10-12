import test from 'node:test';
import assert from 'node:assert/strict';
import { advancedUnitRewards } from '../game/rewards/battlePolicy.js';
import { readRecords } from './helpers.js';
import { advanceAttacks, advancedSetup, startAdvanced } from './advanced-helpers.js';

async function enterAll(context, battle) {
  for (const slot of ['2', '2', '3', '3']) {
    battle = (await context.game.battle.switchUnit({ userId: battle.turnUserId, chatId: context.chatId, choice: slot })).battle;
  }
  return battle;
}

async function surrenderAfterCombat(context, battle = null) {
  battle ??= await startAdvanced(context);
  battle = await advanceAttacks(context, battle);
  assert.equal(battle.status, 'active');
  return (await context.game.battle.surrender({ userId: context.b.id, chatId: context.chatId,
    operationKey: `finish:${battle.id}` })).battle;
}

test('advanced XP divides a fixed total in team order, including uneven remainders', () => {
  const player = { units: [{ id: 'A', participated: true }, { id: 'B', participated: false },
    { id: 'C', participated: true }, { id: 'D', participated: true }] };
  assert.deepEqual(advancedUnitRewards(player, 35), [{ unitId: 'A', xp: 12 }, { unitId: 'C', xp: 12 }, { unitId: 'D', xp: 11 }]);
  assert.deepEqual(advancedUnitRewards(player, 20), [{ unitId: 'A', xp: 7 }, { unitId: 'C', xp: 7 }, { unitId: 'D', xp: 6 }]);
  assert.deepEqual(advancedUnitRewards(player, 0), [{ unitId: 'A', xp: 0 }, { unitId: 'C', xp: 0 }, { unitId: 'D', xp: 0 }]);
});

test('three participants share 35/15 XP while one reward receipt and coin movement cover each player', async t => {
  const context = await advancedSetup(t);
  const battle = await surrenderAfterCombat(context, await enterAll(context, await startAdvanced(context)));
  assert.equal(battle.settlement.version, 2);
  assert.equal(battle.settlement.reason, 'rewarded');
  const winner = battle.settlement.rewards.find(reward => reward.userId === context.a.id);
  const loser = battle.settlement.rewards.find(reward => reward.userId === context.b.id);
  assert.deepEqual(winner.unitRewards.map(entry => entry.xp), [12, 12, 11]);
  assert.deepEqual(loser.unitRewards.map(entry => entry.xp), [5, 5, 5]);
  assert.equal(winner.unitXp, 35);
  assert.equal(loser.unitXp, 15);
  assert.equal((await context.game.economy.getBalance(context.a.id)).coins, 120);
  for (const [index, units] of context.units.entries()) {
    for (const [slot, original] of units.entries()) {
      const unit = await context.game.units.getUnit(original.id);
      assert.equal(unit.progress.xp, index === 0 ? [12, 12, 11][slot] : 5);
      assert.deepEqual(unit.initialStats, original.initialStats);
      assert.equal(unit.lock, null);
      assert.equal(unit.battleStats[index === 0 ? 'wins' : 'losses'], 1);
    }
  }
  assert.equal(readRecords(context.directory, 'recompensas').length, 2);
  assert.equal(readRecords(context.directory, 'economia').length, 2);
  assert.equal(readRecords(context.directory, 'recompensas').every(reward => reward.version === 2 && !Object.hasOwn(reward, 'unitId')), true);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('unused reserves receive no XP or victory statistics, and each player still receives one match', async t => {
  const context = await advancedSetup(t);
  const battle = await surrenderAfterCombat(context);
  assert.deepEqual(battle.players.map(player => player.units.map(unit => unit.participated)),
    [[true, false, false], [true, false, false]]);
  for (const [index, units] of context.units.entries()) {
    for (const [slot, original] of units.entries()) {
      const unit = await context.game.units.getUnit(original.id);
      assert.equal(unit.progress.xp, slot === 0 ? index === 0 ? 35 : 15 : 0);
      assert.equal(unit.battleStats[index === 0 ? 'wins' : 'losses'], slot === 0 ? 1 : 0);
      assert.equal(unit.lock, null);
    }
  }
  assert.equal((await context.game.users.getUser(context.a.id)).battleStats.matches, 1);
  assert.equal((await context.game.users.getUser(context.b.id)).battleStats.matches, 1);
});

test('switching four times does not bypass the early surrender attack requirement', async t => {
  const context = await advancedSetup(t);
  const opened = await enterAll(context, await startAdvanced(context));
  const battle = (await context.game.battle.surrender({ userId: context.b.id, chatId: context.chatId })).battle;
  assert.equal(opened.actions.length, 4);
  assert.equal(battle.settlement.reason, 'early_surrender');
  assert.equal(battle.settlement.rewards.every(reward => reward.coins === 0 && reward.userXp === 0 && reward.unitXp === 0), true);
  assert.equal(readRecords(context.directory, 'recompensas').every(reward => reward.unitRewards.every(unit => unit.xp === 0)), true);
});

test('classic and advanced matches share the same pair allowance across formats and restarts', async t => {
  const context = await advancedSetup(t);
  for (const mode of ['classic', 'auto', 'classic']) {
    await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode });
    let battle = (await context.game.battle.accept({ userId: context.b.id, chatId: context.chatId })).battle;
    battle = await advanceAttacks(context, battle);
    const closed = (await context.game.battle.surrender({ userId: context.b.id, chatId: context.chatId })).battle;
    assert.equal(closed.settlement.reason, 'rewarded');
  }
  await context.game.close();
  context.game = context.open().game;
  context.chatId = 'another-arena';
  const battle = await surrenderAfterCombat(context);
  assert.equal(battle.settlement.reason, 'pair_limit');
  assert.equal((await context.game.economy.getBalance(context.a.id)).coins, 360);
  assert.equal(readRecords(context.directory, 'recompensas').length, 8);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('advanced draw conserves 20 XP per player and shares it as 7/7/6 among three participants', async t => {
  const context = await advancedSetup(t, { randomRoll: () => 99 });
  await context.storage.withTransaction(async repos => {
    for (const attack of await repos.attacks.all()) {
      await repos.attacks.replace({ ...attack, revision: attack.revision + 1,
        combat: { ...attack.combat, accuracy: 1, effects: [] } });
    }
  });
  let battle = await enterAll(context, await startAdvanced(context));
  while (battle.status === 'active') battle = await advanceAttacks(context, battle, 1);
  assert.equal(battle.finishReason, 'turn_limit');
  assert.equal(battle.actions.length, 100);
  for (const reward of battle.settlement.rewards) {
    assert.equal(reward.userXp, 20);
    assert.equal(reward.unitXp, 20);
    assert.deepEqual(reward.unitRewards.map(entry => entry.xp), [7, 7, 6]);
    assert.equal(reward.coins, 0);
  }
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('inactivity closes all team locks and records zero rewards for participants without changing XP', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const context = await advancedSetup(t, { clock: () => now });
  await enterAll(context, await startAdvanced(context));
  now = '2026-10-11T10:30:00.000Z';
  await context.game.battle.sweepExpired();
  const battle = (await context.game.battle.getHistory({ userId: context.a.id })).items[0];
  assert.equal(battle.settlement.reason, 'inactivity');
  assert.equal(battle.settlement.rewards.every(reward => reward.coins === 0 && reward.userXp === 0 && reward.unitXp === 0), true);
  for (const original of context.units.flat()) {
    const unit = await context.game.units.getUnit(original.id);
    assert.equal(unit.lock, null);
    assert.equal(unit.progress.xp, 0);
    assert.deepEqual(unit.battleStats, { wins: 0, losses: 0 });
  }
  assert.equal((await context.game.users.getUser(context.a.id)).battleStats.matches, 1);
});

test('concurrent terminal delivery and replay after restart distribute XP and coins exactly once', async t => {
  const context = await advancedSetup(t);
  const battle = await advanceAttacks(context, await startAdvanced(context));
  const request = { userId: context.b.id, chatId: context.chatId, operationKey: 'advanced-terminal-retry' };
  const results = await Promise.all([context.game.battle.surrender(request), context.game.battle.surrender(request)]);
  assert.deepEqual(results.map(result => result.duplicate), [false, true]);
  assert.equal(results[0].battle.id, battle.id);
  await context.game.close();
  context.game = context.open().game;
  assert.equal((await context.game.battle.surrender(request)).duplicate, true);
  assert.equal(readRecords(context.directory, 'recompensas').length, 2);
  assert.equal((await context.game.units.getUnit(context.units[0][0].id)).progress.xp, 35);
  assert.equal((await context.game.economy.getBalance(context.a.id)).coins, 120);
});

test('advanced reward shares, settlements, XP and unit statistics reject edits outside their battle settlement', async t => {
  const context = await advancedSetup(t);
  const battle = await surrenderAfterCombat(context, await enterAll(context, await startAdvanced(context)));
  const mutations = [
    async repos => { const reward = (await repos.rewards.all())[0]; reward.unitRewards[0].xp++; await repos.rewards.replace(reward); },
    async repos => { const record = await repos.battles.get(battle.id); record.settlement.rewards[0].unitRewards[0].xp++; await repos.battles.replace(record); },
    async repos => { const unit = await repos.units.get(context.units[0][0].id); await repos.units.replace({ ...unit, progress: { level: 2, xp: 0 } }); },
    async repos => { const unit = await repos.units.get(context.units[0][0].id); await repos.units.replace({ ...unit, battleStats: { ...unit.battleStats, wins: 9 } }); }
  ];
  for (const mutation of mutations) await assert.rejects(context.storage.withTransaction(mutation), { code: 'DATABASE_CORRUPT' });
  assert.equal((await context.game.validateDatabase()).valid, true);
});
