import { characterAttackIds } from '../battle/attacks.js';
import { BALANCED_STATS, SUPPLY_BY_RARITY } from './balance.js';

const definitions = [
  ['panda_guerrero', 'PAND', 'Panda Guerrero', 'common', 'tank', true],
  ['mago_carmesi', 'MAGC', 'Mago Carmesí', 'common', 'attacker', true],
  ['lobo_sombrio', 'LOBO', 'Lobo Sombrío', 'common', 'speed', true],
  ['monje_celestial', 'MONJ', 'Monje Celestial', 'rare', 'balanced', false],
  ['guardian_jade', 'JADE', 'Guardián Jade', 'rare', 'tank', false],
  ['bruja_lunar', 'BRUJ', 'Bruja Lunar', 'epic', 'control', false],
  ['dragon_carmesi', 'DRGC', 'Dragón Carmesí', 'legendary', 'attacker', false],
  ['espiritu_bambu', 'BAMB', 'Espíritu Bambú', 'epic', 'support', false]
];

// Seed for new installations. Existing catalogs change through explicit migrations.
export function seedCharacters() {
  return definitions.map(([id, unitPrefix, name, rarity, role, starterEligible]) => ({
    id, revision: 1, name, unitPrefix, rarity, role,
    baseStats: { ...BALANCED_STATS[id] },
    statVariation: { hp: 0, attack: 0, defense: 0, speed: 0 },
    attackIds: characterAttackIds(id),
    supply: { type: 'limited', max: SUPPLY_BY_RARITY[rarity] },
    obtainable: true, starterEligible
  }));
}

export const STARTERS = Object.freeze([
  Object.freeze({ choice: 'panda', characterId: 'panda_guerrero', number: '1' }),
  Object.freeze({ choice: 'mago', characterId: 'mago_carmesi', number: '2' }),
  Object.freeze({ choice: 'lobo', characterId: 'lobo_sombrio', number: '3' })
]);
