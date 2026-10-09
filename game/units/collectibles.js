import { requireGame } from '../../utils/GameError.js';

export const TRAIT_VERSION = 1;
export const TRAITS = Object.freeze([
  Object.freeze({ id: 'robust', name: 'Robusto', stat: 'hp', percent: 3 }),
  Object.freeze({ id: 'aggressive', name: 'Agresivo', stat: 'attack', flat: 1 }),
  Object.freeze({ id: 'resolute', name: 'Firme', stat: 'defense', flat: 1 })
]);
export const VARIANTS = Object.freeze([
  Object.freeze({ id: 'normal', name: 'Normal' }),
  Object.freeze({ id: 'shiny', name: 'Shiny' }),
  Object.freeze({ id: 'golden', name: 'Dorada' })
]);

export function traitName(id) {
  return TRAITS.find(trait => trait.id === id)?.name ?? id;
}

export function variantName(id) {
  return VARIANTS.find(variant => variant.id === id)?.name ?? id;
}

export function applyTraits(stats, traits, version = TRAIT_VERSION) {
  requireGame(version === 0 || version === TRAIT_VERSION, 'INVALID_COLLECTIBLES');
  const result = { ...stats };
  // Existing unknown traits retain their birth identity without acquiring new effects.
  if (version === 0) return result;
  requireGame(Array.isArray(traits) && traits.length <= 2 && new Set(traits).size === traits.length &&
    traits.every(id => TRAITS.some(trait => trait.id === id)), 'INVALID_COLLECTIBLES');
  requireGame(['hp', 'attack', 'defense', 'speed'].every(key =>
    Number.isSafeInteger(result[key]) && result[key] >= 0), 'NUMERIC_OVERFLOW');
  for (const id of traits) {
    const trait = TRAITS.find(candidate => candidate.id === id);
    // Split division first so MAX_SAFE_INTEGER cannot overflow during multiplication.
    const bonus = trait.flat ?? Math.floor(result[trait.stat] / 100) * trait.percent +
      Math.floor((result[trait.stat] % 100) * trait.percent / 100);
    requireGame(Number.isSafeInteger(bonus) && bonus >= 0 &&
      Number.isSafeInteger(result[trait.stat] + bonus), 'NUMERIC_OVERFLOW');
    result[trait.stat] += bonus;
  }
  return result;
}
