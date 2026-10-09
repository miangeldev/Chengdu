import { requireGame } from '../../utils/GameError.js';

export const BALANCE_VERSION = 1;
export const SUPPLY_BY_RARITY = Object.freeze({ common: 50, rare: 35, epic: 20, legendary: 10, mythic: 5 });

const stats = values => Object.freeze(Object.fromEntries(['hp', 'attack', 'defense', 'speed'].map((key, i) => [key, values[i]])));
export const LEGACY_STATS = Object.freeze({
  panda_guerrero: stats([120, 24, 22, 8]),
  mago_carmesi: stats([95, 32, 14, 10]),
  lobo_sombrio: stats([90, 27, 16, 16]),
  monje_celestial: stats([108, 25, 20, 11]),
  guardian_jade: stats([125, 20, 26, 7]),
  bruja_lunar: stats([96, 26, 17, 12]),
  dragon_carmesi: stats([110, 30, 17, 9]),
  espiritu_bambu: stats([105, 22, 21, 12])
});

// Versioned rebalance: keep these historical values stable in future editions.
export const BALANCED_STATS = Object.freeze({
  panda_guerrero: stats([120, 25, 23, 8]),
  mago_carmesi: stats([100, 32, 16, 10]),
  lobo_sombrio: stats([95, 27, 17, 16]),
  monje_celestial: stats([114, 27, 21, 11]),
  guardian_jade: stats([133, 23, 28, 7]),
  bruja_lunar: stats([108, 33, 21, 13]),
  dragon_carmesi: stats([124, 35, 22, 12]),
  espiritu_bambu: stats([124, 27, 24, 12])
});

export function balancedLegacyStats(unit) {
  const original = LEGACY_STATS[unit.characterId];
  const target = BALANCED_STATS[unit.characterId];
  return Object.fromEntries(['hp', 'attack', 'defense', 'speed'].map(key => {
    const value = unit.initialStats[key] + (original ? target[key] - original[key] : 0);
    requireGame(Number.isSafeInteger(value) && value >= (key === 'defense' ? 0 : 1), 'NUMERIC_OVERFLOW');
    return [key, value];
  }));
}

export function migrateBalancedCharacter(character, issuedCount) {
  const cap = SUPPLY_BY_RARITY[character.rarity];
  requireGame(cap && Number.isSafeInteger(issuedCount) && issuedCount >= 0, 'DATABASE_CORRUPT');
  const max = character.supply.type === 'limited' ? Math.min(character.supply.max, cap) : cap;
  const revision = character.revision + 1;
  requireGame(Number.isSafeInteger(revision), 'NUMERIC_OVERFLOW');
  return {
    ...character, revision,
    baseStats: { ...(BALANCED_STATS[character.id] ?? character.baseStats) },
    supply: { type: 'limited', max, ...(issuedCount > max ? { grandfatheredIssued: issuedCount } : {}) }
  };
}
