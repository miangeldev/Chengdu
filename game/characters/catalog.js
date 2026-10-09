import { characterAttackIds } from '../battle/attacks.js';

const definitions = [
  ['panda_guerrero', 'PAND', 'Panda Guerrero', 'common', 'tank', [120, 24, 22, 8], true],
  ['mago_carmesi', 'MAGC', 'Mago Carmesí', 'common', 'attacker', [95, 32, 14, 10], true],
  ['lobo_sombrio', 'LOBO', 'Lobo Sombrío', 'common', 'speed', [90, 27, 16, 16], true],
  ['monje_celestial', 'MONJ', 'Monje Celestial', 'rare', 'balanced', [108, 25, 20, 11], false],
  ['guardian_jade', 'JADE', 'Guardián Jade', 'rare', 'tank', [125, 20, 26, 7], false],
  ['bruja_lunar', 'BRUJ', 'Bruja Lunar', 'epic', 'control', [96, 26, 17, 12], false],
  ['dragon_carmesi', 'DRGC', 'Dragón Carmesí', 'legendary', 'attacker', [110, 30, 17, 9], false],
  ['espiritu_bambu', 'BAMB', 'Espíritu Bambú', 'epic', 'support', [105, 22, 21, 12], false]
];

// Content seed only. Existing catalogs are never replaced on application startup.
export function seedCharacters() {
  return definitions.map(([id, unitPrefix, name, rarity, role, stats, starterEligible]) => ({
    id, revision: 1, name, unitPrefix, rarity, role,
    baseStats: Object.fromEntries(['hp', 'attack', 'defense', 'speed'].map((stat, i) => [stat, stats[i]])),
    statVariation: { hp: 0, attack: 0, defense: 0, speed: 0 },
    attackIds: characterAttackIds(id),
    supply: id === 'dragon_carmesi' ? { type: 'limited', max: 500 } : { type: 'unlimited', max: null },
    obtainable: true, starterEligible
  }));
}

export const STARTERS = Object.freeze([
  Object.freeze({ choice: 'panda', characterId: 'panda_guerrero', number: '1' }),
  Object.freeze({ choice: 'mago', characterId: 'mago_carmesi', number: '2' }),
  Object.freeze({ choice: 'lobo', characterId: 'lobo_sombrio', number: '3' })
]);
