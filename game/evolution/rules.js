import { requireGame } from '../../utils/GameError.js';
import { effectiveStats, safeAdd } from '../progression/rules.js';

export const EVOLUTION_POLICY_VERSION = 1;
export const EVOLUTION_MIN_LEVEL = 10;
export const EVOLUTION_COINS = 300;
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
  return Boolean(form && evolution.version === EVOLUTION_POLICY_VERSION && evolution.formId === form.id &&
    typeof evolution.receiptId === 'string' && /^EVO-[a-f0-9-]{36}$/.test(evolution.receiptId) &&
    typeof evolution.evolvedAt === 'string' && Number.isFinite(Date.parse(evolution.evolvedAt)) &&
    Object.keys(evolution).length === 4);
}

export function evolvedStats(stats, evolution, characterId) {
  requireGame(validEvolutionShape(evolution, characterId), 'INVALID_EVOLUTION');
  if (!evolution) return stats;
  const percent = formForCharacter(characterId).bonusPercent;
  return Object.fromEntries(Object.entries(stats).map(([key, value]) => {
    const bonus = Math.floor(value / 100) * percent + Math.floor((value % 100) * percent / 100);
    return [key, safeAdd(value, bonus)];
  }));
}

export function effectiveUnitStats(unit) {
  return evolvedStats(effectiveStats(unit.initialStats, unit.progress.level, unit.statGrowthVersion, unit.traits,
    unit.traitVersion ?? 0, unit.combatBaseStats), unit.evolution, unit.characterId);
}

export function displayUnitCharacterName(unit, character) {
  requireGame(validEvolutionShape(unit.evolution, unit.characterId), 'INVALID_EVOLUTION');
  return unit.evolution ? formForCharacter(unit.characterId).name : character.name;
}
