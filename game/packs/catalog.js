// Content seeds never replace an existing pack definition on startup.
export function seedPacks() {
  return [{
    id: 'basico', revision: 1, name: 'Sobre Básico', price: 500,
    pool: [
      { rarity: 'common', weight: 7000, characterIds: ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio'] },
      { rarity: 'rare', weight: 2200, characterIds: ['monje_celestial', 'guardian_jade'] },
      { rarity: 'epic', weight: 700, characterIds: ['bruja_lunar', 'espiritu_bambu'] },
      { rarity: 'legendary', weight: 100, characterIds: ['dragon_carmesi'] }
    ],
    traitWeights: [{ count: 0, weight: 8000 }, { count: 1, weight: 1900 }, { count: 2, weight: 100 }],
    variantWeights: [{ id: 'normal', weight: 9400 }, { id: 'shiny', weight: 500 }, { id: 'golden', weight: 100 }]
  }];
}
