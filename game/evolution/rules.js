import { requireGame } from '../../utils/GameError.js';
import { effectiveStats, LEVEL_CAPS, safeAdd } from '../progression/rules.js';

export const EVOLUTION_POLICY_VERSION = 2;
export const EVOLUTION_MIN_LEVEL = 5;
export const EVOLUTION_COINS = 300;
// Historical receipts and battle snapshots continue to use their original
// policy. New evolutions unlock earlier, reaching the original power at Lv. 10.
const EVOLUTION_POLICIES = Object.freeze({
  1: Object.freeze({ version: 1, minimumLevel: 10, coins: 300,
    stages: Object.freeze([Object.freeze({ minimumLevel: 10, bonusPercent: 5 })]) }),
  2: Object.freeze({ version: 2, minimumLevel: 5, coins: 300,
    stages: Object.freeze([
      Object.freeze({ minimumLevel: 5, bonusPercent: 4 }),
      Object.freeze({ minimumLevel: 10, bonusPercent: 5 })
    ]) })
});

export function evolutionPolicy(version = EVOLUTION_POLICY_VERSION) {
  requireGame(Number.isSafeInteger(version) && Object.hasOwn(EVOLUTION_POLICIES, version), 'INVALID_EVOLUTION');
  return EVOLUTION_POLICIES[version];
}

export function evolutionBonusPercent(evolution, level) {
  if (!evolution) return 0;
  const policy = evolutionPolicy(evolution.version);
  if (policy.version === 1) return 5;
  requireGame(Number.isSafeInteger(level) && level >= 1 && level <= LEVEL_CAPS.unit, 'INVALID_PROGRESSION');
  return policy.stages.filter(stage => level >= stage.minimumLevel).at(-1)?.bonusPercent ?? 0;
}
export const EVOLUTION_FORMS = Object.freeze([
  Object.freeze({ id: 'panda_maestro', characterId: 'panda_guerrero', name: 'Panda Maestro', bonusPercent: 5 }),
  Object.freeze({ id: 'mago_arcano', characterId: 'mago_carmesi', name: 'Mago Arcano', bonusPercent: 5 }),
  Object.freeze({ id: 'lobo_lunar', characterId: 'lobo_sombrio', name: 'Lobo Lunar', bonusPercent: 5 })
]);

export function formForCharacter(characterId) {
  return EVOLUTION_FORMS.find(form => form.characterId === characterId) ?? null;
}

export function evolutionSnapshot(unit) {
  return unit.evolution ? structuredClone(unit.evolution) : null;
}

export function validEvolutionShape(evolution, characterId) {
  if (evolution === null || evolution === undefined) return true;
  const form = formForCharacter(characterId);
  return Boolean(form && Number.isSafeInteger(evolution.version) && Object.hasOwn(EVOLUTION_POLICIES, evolution.version) && evolution.formId === form.id &&
    typeof evolution.receiptId === 'string' && /^EVO-[a-f0-9-]{36}$/.test(evolution.receiptId) &&
    typeof evolution.evolvedAt === 'string' && Number.isFinite(Date.parse(evolution.evolvedAt)) &&
    Object.keys(evolution).length === 4);
}

export function evolvedStats(stats, evolution, characterId, level) {
  requireGame(validEvolutionShape(evolution, characterId), 'INVALID_EVOLUTION');
  if (!evolution) return stats;
  const percent = evolutionBonusPercent(evolution, level);
  return Object.fromEntries(Object.entries(stats).map(([key, value]) => {
    const bonus = Math.floor(value / 100) * percent + Math.floor((value % 100) * percent / 100);
    return [key, safeAdd(value, bonus)];
  }));
}

export function effectiveUnitStats(unit) {
  return evolvedStats(effectiveStats(unit.initialStats, unit.progress.level, unit.statGrowthVersion, unit.traits,
    unit.traitVersion ?? 0, unit.combatBaseStats), unit.evolution, unit.characterId, unit.progress.level);
}

export function displayUnitCharacterName(unit, character) {
  requireGame(validEvolutionShape(unit.evolution, unit.characterId), 'INVALID_EVOLUTION');
  return unit.evolution ? formForCharacter(unit.characterId).name : character.name;
}
