import { pathToFileURL } from 'node:url';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { advancedAttack } from '../game/battle/combatContent.js';
import { effectiveStats } from '../game/progression/rules.js';
import { evolvedStats } from '../game/evolution/rules.js';
import { createStoryBattle, resolveStoryAction, storyCombatPolicy } from '../game/story/combat.js';

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

export function storySeasonTacticalAction(battle) {
  const m = battle.mechanics, phase = battle.enemyIntent.type;
  const party = battle.players[0], unit = party.units[party.activeIndex];
  if (phase === 'protect' && ['V05', 'TRIAL3', 'IV02A', 'IV02B', 'IV02C'].includes(battle.encounterId)) return { action: 'protect' };
  if (battle.encounterId === 'IV05' && m.tension >= 3 && m.purifyCooldown === 0) return { action: 'purify' };
  if (['unleash', 'reflect', 'tension'].includes(phase)) return { action: 'defend' };
  if (['IV02A', 'IV02B', 'IV02C'].includes(battle.encounterId) && m.npcSafety <= 50) return { action: 'protect' };
  if (battle.encounterId === 'III03' && !m.lessons.defense && phase === 'defense') return { action: 'defend' };
  if (battle.encounterId === 'III03' && !m.lessons.support && phase === 'support' && m.supportCooldown === 0) return { action: 'support' };
  if (m.recklessStreak >= 2) {
    if (m.supportCooldown === 0) return { action: 'support' };
    if (['IV05', 'V05', 'TRIAL3'].includes(battle.encounterId) && m.purifyCooldown === 0) return { action: 'purify' };
    return { action: 'defend' };
  }
  if (phase === 'exposed' && unit.hp > unit.stats.hp * 0.2) {
    const ready = m.sealTurns === 0 && !(unit.cooldowns[unit.attacks[1].id] > 0);
    return { action: ready ? 'skill' : 'attack', choice: ready ? null : '1' };
  }
  if (unit.hp < unit.stats.hp * 0.65 && m.supportCooldown === 0) return { action: 'support' };
  if (['V05', 'TRIAL3'].includes(battle.encounterId) && m.purifyCooldown === 0 && (m.sealTurns > 0 || unit.hp < unit.stats.hp * 0.65)) return { action: 'purify' };
  if (unit.hp < unit.stats.hp * 0.35) {
    const next = party.units.findIndex(other => other.id !== unit.id && other.hp > other.stats.hp * 0.5);
    if (next >= 0) return { action: 'switch', choice: String(next + 1) };
  }
  if (m.barrier > 0) return { action: 'break' };
  if (['II05', 'V05', 'TRIAL3'].includes(battle.encounterId) && !m.revealed) return { action: 'observe' };
  const skillReady = m.sealTurns === 0 && !(unit.cooldowns[unit.attacks[1].id] > 0);
  return { action: skillReady ? 'skill' : 'attack', choice: skillReady ? null : '1' };
}

export function simulateStorySeason({ encounterId = 'V05', characterId = 'panda_guerrero', level = 8, size = 1,
  evolved = false, policy = 'tactical', seed = 1, rolls = null, defeats = null, context = {} }) {
  const now = '2026-10-18T00:00:00.000Z', required = storyCombatPolicy(encounterId).requiredDefeats;
  let battle = createStoryBattle({ id: 'season-simulation', encounterId, version: 3, now, context,
    units: Array.from({ length: size }, (_, index) => storyBalanceSnapshot(characterId, level, evolved, `:${index}`)),
    learning: { defeats: defeats ?? required, required } });
  const random = generator(seed);
  for (let turn = 0; turn < 60 && battle.status === 'active'; turn++) {
    const request = policy === 'tactical' ? storySeasonTacticalAction(battle) : { action: 'attack', choice: '1' };
    battle = resolveStoryAction(battle, { ...request, now, rolls: rolls ?? [random(), random()] }).battle;
  }
  return { status: battle.status, turns: battle.actions.length, hp: battle.players[0].units.reduce((sum, unit) => sum + unit.hp, 0), battle };
}

export function simulateStorySeasonBalance(samples = 100) {
  const rows = [];
  for (const encounterId of ['I03', 'I05', 'II05', 'III05', 'IV05', 'V05']) {
    const level = { I03: 3, I05: 4, II05: 5, III05: 6, IV05: 7, V05: 8 }[encounterId];
    for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) for (const size of [1, 3]) for (const policy of ['attack', 'tactical']) {
      const results = Array.from({ length: samples }, (_, index) => simulateStorySeason({ encounterId, characterId, level, size, policy, seed: index + 1 }));
      rows.push({ encounterId, level, characterId, size, policy, samples,
        winPercent: Math.round(results.filter(result => result.status === 'won').length / samples * 1000) / 10,
        meanTurns: Math.round(results.reduce((sum, result) => sum + result.turns, 0) / samples * 10) / 10 });
    }
  }
  return rows;
}

// Use the earliest campaign checkpoint, rather than granting the next reward
// before the encounter. Trials are measured at the completed season's level.
export function simulateStoryAccessibility(samples = 20) {
  const levels = { III01: 5, III03: 6, IV02A: 6, IV02B: 6, IV02C: 6, V02: 7, V04: 8,
    TRIAL1: 9, TRIAL2: 9, TRIAL3: 9 };
  const rows = [];
  for (const [encounterId, level] of Object.entries(levels)) {
    for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) for (const size of [1, 3]) {
      const request = { encounterId, characterId, level, size };
      const fixed = simulateStorySeason({ ...request, rolls: [30, 30] });
      const results = Array.from({ length: samples }, (_, index) => simulateStorySeason({ ...request, seed: index + 1 }));
      rows.push({ encounterId, level, characterId, size, fixedRoll30: fixed.status, fixedTurns: fixed.turns, samples,
        winPercent: Math.round(results.filter(result => result.status === 'won').length / samples * 1000) / 10,
        maximumTurns: Math.max(...results.map(result => result.turns)),
        lossReasons: [...new Set(results.filter(result => result.status === 'lost').map(result => result.battle.finishReason))].join(', ') });
    }
  }
  return rows;
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
  const simulate = process.argv.includes('--accessibility') ? simulateStoryAccessibility : process.argv.includes('--season') ? simulateStorySeasonBalance :
    process.argv.includes('--chapters') ? simulateStoryChapters : simulateStoryBalance;
  const sampleArgument = process.argv.slice(2).find(argument => /^[1-9]\d*$/.test(argument));
  console.table(simulate(sampleArgument ? Number(sampleArgument) : process.argv.includes('--accessibility') ? 20 : 300));
}
