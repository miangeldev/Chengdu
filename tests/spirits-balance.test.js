import test from 'node:test';
import assert from 'node:assert/strict';
import { runSpiritsSimulation, simulateSpiritsDuel } from '../scripts/simulate-spirits-balance.js';
import { replayAdvancedBattle } from '../game/battle/advancedEngine.js';

test('Spirits balance simulation samples every old opponent and duplicate-card teams reproducibly at low and high levels', () => {
  const options = { samples: 2, levels: [1, 20], seed: 73 };
  const first = runSpiritsSimulation(options), second = runSpiritsSimulation(options);
  assert.deepEqual(first, second);
  assert.equal(first.totalDuels, 360);
  assert.equal(first.matches.length, 40);
  assert.equal(first.teams.length, 10);
  assert.equal(first.characterScores.length, 4);
  assert.equal(first.referenceMatches.length, 80);
  assert.ok(first.teams.some(team => team.first.every(id => id === 'guardian_mil_mascaras')));
  assert.ok(first.teams.some(team => team.first.every(id => id === 'zorro_llamas_errantes')));
  assert.ok(first.unlocked <= first.openingRolls);
  assert.ok(first.specialUses <= first.unlocked);
  for (const row of [...first.matches, ...first.teams]) {
    assert.ok(row.scoreWith >= 0 && row.scoreWith <= 100);
    assert.ok(row.scoreWithout >= 0 && row.scoreWithout <= 100);
    assert.ok(row.meanActionsWith > 0 && row.meanActionsWith <= 100);
    assert.equal(row.scoreDelta, row.scoreWith - row.scoreWithout);
  }
});

test('Spirits simulations preserve exact engine replay for the opening roll, mask shifts and Fatality uses', () => {
  for (const useFatality of [false, true]) {
    const battle = simulateSpiritsDuel({ first: ['guardian_mil_mascaras', 'zorro_llamas_errantes', 'guardian_mil_mascaras'],
      second: ['dragon_carmesi', 'bruja_lunar', 'espiritu_bambu'], level: 20, seed: 73, useFatality });
    assert.deepEqual(replayAdvancedBattle(battle), battle);
    assert.equal(battle.status, 'finished');
    for (const player of battle.players) for (const unit of player.units) {
      assert.ok(unit.hp >= 0 && unit.hp <= unit.stats.hp);
      if (unit.fatality) assert.equal(unit.fatality.unlocked, unit.fatality.roll < 10);
    }
  }
});
