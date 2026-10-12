import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { seedEventAttacks, seedEventCharacters } from '../game/content/catalog.js';
import { replayAdvancedBattle } from '../game/battle/advancedEngine.js';
import { simulateAdvancedDuel } from '../scripts/simulate-advanced-balance.js';
import { runContentSimulation } from '../scripts/simulate-content-balance.js';

test('event abilities and attacks play and replay through the actual advanced PvP engine', () => {
  const catalog = [...seedCharacters(), ...seedEventCharacters()];
  const attackDefinitions = new Map([...seedAttacks(), ...seedEventAttacks()].map(attack => [attack.id, attack]));
  for (const [firstCharacters, secondCharacters] of [
    [['zorro_faroles'], ['lobo_sombrio']], [['guardian_espectral'], ['monje_celestial']],
    [['zorro_faroles', 'panda_guerrero', 'guardian_espectral'], ['monje_celestial', 'bruja_lunar', 'dragon_carmesi']]
  ]) {
    const battle = simulateAdvancedDuel({ firstCharacters, secondCharacters, catalog, attackDefinitions, seed: 73 });
    assert.deepEqual(replayAdvancedBattle(battle), battle);
    assert.equal(battle.status, 'finished');
    assert.ok(battle.actions.length <= 100);
  }
});

test('content balance sampling is reproducible and its published reference preserves complete definitions', () => {
  const first = runContentSimulation({ samples: 2 });
  assert.deepEqual(first, runContentSimulation({ samples: 2 }));
  assert.equal(first.pairs.length, 45);
  assert.equal(first.totalDuels, 90);
  const reference = JSON.parse(fs.readFileSync(new URL('../docs/content-balance-0.8.json', import.meta.url), 'utf8'));
  assert.equal(reference.totalDuels, 9000);
  for (const character of seedEventCharacters()) {
    const saved = reference.characters.find(row => row.id === character.id);
    assert.deepEqual(saved.stats, character.baseStats);
    assert.deepEqual(saved.combat, character.combat);
    assert.deepEqual(saved.attacks, seedEventAttacks().filter(attack => character.attackIds.includes(attack.id)));
    assert.equal(saved.supply, character.rarity === 'rare' ? 35 : 20);
    assert.ok(saved.score >= 35 && saved.score <= 70);
  }
  assert.ok(reference.characters.find(row => row.id === 'dragon_carmesi').score > reference.characters.find(row => row.id === 'guardian_espectral').score);
});
