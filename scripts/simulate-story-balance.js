import { pathToFileURL } from 'node:url';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { advancedAttack } from '../game/battle/combatContent.js';
import { effectiveStats } from '../game/progression/rules.js';
import { evolvedStats } from '../game/evolution/rules.js';
import { createStoryBattle, resolveStoryAction } from '../game/story/combat.js';

export function storyBalanceSnapshot(characterId, level = 4, evolved = false, suffix = '') {
  const character = seedCharacters().find(character => character.id === characterId);
  const evolution = evolved ? { version: 2, formId: { panda_guerrero: 'panda_maestro', mago_carmesi: 'mago_arcano', lobo_sombrio: 'lobo_lunar' }[characterId],
    receiptId: 'EVO-00000000-0000-4000-8000-000000000001', evolvedAt: '2026-10-17T00:00:00.000Z' } : null;
  const stats = evolvedStats(effectiveStats(character.baseStats, level, 2), evolution, characterId, level);
  return { id: `unit:${characterId}${suffix}`, characterId, characterName: character.name, level, stats, evolution,
    profileVersion: 1, element: character.combat.element, ability: character.combat.ability,
    attacks: seedAttacks().filter(attack => character.attackIds.includes(attack.id)).map(advancedAttack) };
}

export function storyTacticalAction(battle) {
  const unit = battle.players[0].units[battle.players[0].activeIndex];
  if (battle.encounterId === 'P03' && !battle.tutorial.defend) return { action: 'defend' };
  if (battle.enemyIntent.type === 'unleash') return { action: 'defend' };
  if (battle.encounterId === 'I05' && battle.mechanics.barrier > 0) return { action: 'break' };
  if (battle.encounterId === 'II05' && !battle.mechanics.revealed) return { action: 'observe' };
  const skillReady = !(unit.cooldowns[unit.attacks[1].id] > 0);
  return { action: skillReady ? 'skill' : 'attack', choice: skillReady ? null : '1' };
}

function generator(seed) {
  let value = (Math.imul(seed, 0x9e3779b1) ^ 0x85ebca6b) >>> 0;
  return () => { value = (Math.imul(value, 1664525) + 1013904223) >>> 0; return Math.floor(value / 4294967296 * 100); };
}

export function simulateStory({ characterId, level = 4, evolved = false, policy = 'tactical', seed = 1, rolls = null, encounterId = 'I03', version = 2 }) {
  const now = '2026-10-17T00:00:00.000Z';
  let battle = createStoryBattle({ id: 'simulation', encounterId, version, units: [storyBalanceSnapshot(characterId, level, evolved)], now });
  const random = generator(seed);
  for (let turn = 0; turn < 60 && battle.status === 'active'; turn++) {
    const choice = policy === 'tactical' ? storyTacticalAction(battle) : { action: 'attack', choice: '1' };
    battle = resolveStoryAction(battle, { ...choice, rolls: rolls ?? [random(), random()], now }).battle;
  }
  return { status: battle.status, turns: battle.actions.length, hp: battle.players[0].units[0].hp, battle };
}

export function simulateStoryChapters(samples = 300) {
  const rows = [];
  for (const encounterId of ['I03', 'I04', 'I05', 'II05']) for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
    for (const policy of ['attack', 'tactical']) {
      const level = { I03: 3, I04: 4, I05: 4, II05: 5 }[encounterId];
      const results = Array.from({ length: samples }, (_, index) => simulateStory({ encounterId, characterId, level, policy, seed: index + 1 }));
      rows.push({ encounterId, level, characterId, policy, samples, winPercent: Math.round(results.filter(result => result.status === 'won').length / samples * 1000) / 10,
        meanTurns: Math.round(results.reduce((sum, result) => sum + result.turns, 0) / samples * 10) / 10 });
    }
  }
  return rows;
}

export function simulateStoryBalance(samples = 300) {
  const rows = [];
  for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
    for (const [level, evolved] of [[1, false], [4, false], [5, false], [5, true]]) {
      for (const policy of ['attack', 'tactical']) {
        const results = Array.from({ length: samples }, (_, index) => simulateStory({ characterId, level, evolved, policy, version: 1, seed: index + 1 }));
        rows.push({ characterId, level, evolved, policy, samples, wins: results.filter(result => result.status === 'won').length,
          winPercent: Math.round(results.filter(result => result.status === 'won').length / samples * 1000) / 10,
          meanTurns: Math.round(results.reduce((sum, result) => sum + result.turns, 0) / samples * 10) / 10 });
      }
    }
  }
  return rows;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  console.table((process.argv.includes('--chapters') ? simulateStoryChapters : simulateStoryBalance)(Number(process.argv[2]) || 300));
}
