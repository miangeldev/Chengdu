import test from 'node:test';
import assert from 'node:assert/strict';
import { chooseAdvancedAction, createAdvancedRoll, runAdvancedSimulation, simulateAdvancedDuel, TEAM_COMPOSITIONS } from '../scripts/simulate-advanced-balance.js';
import { activeUnit, initializeAdvancedBattle, replayAdvancedBattle } from '../game/battle/advancedEngine.js';

test('advanced reference policy plays the real engine and its entire result replays exactly', () => {
  for (const [firstCharacters, secondCharacters] of [
    [['mago_carmesi'], ['panda_guerrero']],
    [TEAM_COMPOSITIONS[0].characters, TEAM_COMPOSITIONS[5].characters],
    [TEAM_COMPOSITIONS[1].characters, TEAM_COMPOSITIONS[3].characters]
  ]) {
    const battle = simulateAdvancedDuel({ firstCharacters, secondCharacters, seed: 8191 });
    assert.equal(battle.rulesVersion, 2);
    assert.equal(battle.status, 'finished');
    assert.deepEqual(replayAdvancedBattle(battle), battle);
    assert.ok(battle.actions.length <= 100);
    for (const player of battle.players) for (const unit of player.units) {
      assert.ok(unit.hp >= 0 && unit.hp <= unit.stats.hp);
      assert.equal(new Set(unit.effects.map(effect => effect.type)).size, unit.effects.length);
      assert.ok(unit.effects.every(effect => effect.remaining > 0 && effect.remaining <= 5));
    }
    for (const player of battle.players) assert.ok(battle.actions.filter(a => a.actorId === player.userId && a.type === 'switch').length <= 2);
  }
});

test('seeded simulations are reproducible, sample every character pair and composition, and aggregate consistently', () => {
  const options = { samples: 2, seed: 73 };
  const first = runAdvancedSimulation(options);
  const second = runAdvancedSimulation(options);
  assert.deepEqual(first, second);
  assert.equal(first.duels.length, 28);
  assert.equal(first.teams.length, 15);
  assert.equal(first.metrics.all.totalDuels, 86);
  assert.equal(first.metrics.all.totalDuels, first.metrics.all.knockouts + first.metrics.all.draws);
  assert.equal(first.metrics.all.totalActions, [...first.duels, ...first.teams].reduce((sum, row) => sum + row.totalActions, 0));
  assert.equal(first.policy.switchCost, 'one_action');
  assert.ok(first.teams.some(row => row.totalSwitches > 0));
  for (const row of [...first.duels, ...first.teams]) {
    assert.equal(row.firstWins + row.secondWins + row.draws, row.samples);
    assert.equal(row.firstScore + row.secondScore, 100);
    assert.equal(row.knockoutRate + row.drawRate, 100);
    assert.ok(row.meanActions > 0 && row.meanActions <= 100);
  }
  assert.equal(first.characterScores.length, 8);
  assert.equal(first.rarityScores.length, 4);
});

test('alternating challengers removes a fixed local initiative when active speed ties', () => {
  for (const challenger of ['first', 'second']) {
    const battle = simulateAdvancedDuel({ firstCharacters: ['dragon_carmesi'], secondCharacters: ['espiritu_bambu'], challenger, roll: () => 0 });
    assert.equal(battle.actions[0].actorId, challenger);
  }
  const report = runAdvancedSimulation({ samples: 2, seed: 73, allowSwitch: false, strategy: 'basic' });
  assert.equal(report.initiativeAtEqualSpeed, 'alternating_challenger');
  assert.equal(report.metrics.all.meanSwitches, 0);
  for (const row of [...report.duels, ...report.teams]) assert.equal(row.totalSwitches, 0);
});

test('adaptive policy respects unavailable skills and stun, while basic policy remains a useful control', () => {
  const finished = simulateAdvancedDuel({ firstCharacters: ['dragon_carmesi'], secondCharacters: ['panda_guerrero'], seed: 2 });
  const battle = initializeAdvancedBattle(finished);
  const unit = activeUnit(battle.players.find(p => p.userId === battle.turnUserId));
  unit.cooldowns[unit.attacks[1].id] = 2;
  assert.deepEqual(chooseAdvancedAction(battle), { type: 'attack', choice: '1' });
  unit.cooldowns = {};
  unit.effects = [{ type: 'stun', remaining: 1, potency: 1, sourceUnitId: 'other', appliedAtTurn: 0 }];
  assert.deepEqual(chooseAdvancedAction(battle), { type: 'attack', choice: '1' });
  unit.effects = [];
  assert.deepEqual(chooseAdvancedAction(battle, { strategy: 'basic' }), { type: 'attack', choice: '1' });
});

test('simulator validates sample/seed/teams/strategy/level and injected randomness', () => {
  assert.throws(() => runAdvancedSimulation({ samples: 0 }), RangeError);
  assert.throws(() => runAdvancedSimulation({ samples: 2001 }), RangeError);
  assert.throws(() => createAdvancedRoll(-1), RangeError);
  assert.throws(() => createAdvancedRoll(0x100000000), RangeError);
  assert.throws(() => simulateAdvancedDuel({ firstCharacters: ['panda_guerrero'], secondCharacters: [] }), RangeError);
  assert.throws(() => simulateAdvancedDuel({ firstCharacters: ['future_unknown'], secondCharacters: ['panda_guerrero'] }), RangeError);
  assert.throws(() => simulateAdvancedDuel({ firstCharacters: ['panda_guerrero'], secondCharacters: ['mago_carmesi'], strategy: 'optimal' }), RangeError);
  assert.throws(() => simulateAdvancedDuel({ firstCharacters: ['panda_guerrero'], secondCharacters: ['mago_carmesi'], level: 21 }), RangeError);
  assert.throws(() => simulateAdvancedDuel({ firstCharacters: ['panda_guerrero'], secondCharacters: ['mago_carmesi'], roll: () => 100 }), { code: 'INVALID_RANDOM_ROLL' });
  const battle = simulateAdvancedDuel({ firstCharacters: ['panda_guerrero'], secondCharacters: ['mago_carmesi'], level: 20, seed: 7 });
  assert.ok(battle.players.every(player => player.units[0].level === 20));
  assert.ok(battle.players[0].units[0].stats.hp > 120);
});
