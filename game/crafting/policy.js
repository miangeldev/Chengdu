import { requireGame } from '../../utils/GameError.js';
import { safeAdd } from '../progression/rules.js';
import { EVOLUTION_MIN_LEVEL } from '../evolution/rules.js';

export const CRAFTING_POLICY_VERSION = 1;
export const MATERIAL_KEYS = Object.freeze(['fragmentos', 'esencias', 'sellos']);
export const emptyMaterials = () => ({ fragmentos: 0, esencias: 0, sellos: 0 });

export const RECIPES = Object.freeze([
  Object.freeze({ id: 'sello_evolucion', name: 'Sello de evolución', coins: 100,
    inputs: Object.freeze({ fragmentos: 5, esencias: 2, sellos: 0 }),
    outputs: Object.freeze({ fragmentos: 0, esencias: 0, sellos: 1 }), badge: null,
    description: `Permite evolucionar una unidad compatible desde el nivel ${EVOLUTION_MIN_LEVEL}.` }),
  Object.freeze({ id: 'insignia_bambu', name: 'Insignia de bambú', coins: 50,
    inputs: Object.freeze({ fragmentos: 3, esencias: 0, sellos: 0 }),
    outputs: Object.freeze({ fragmentos: 0, esencias: 0, sellos: 0 }), badge: 'bambu_artesano',
    description: 'Una insignia cosmética permanente. No altera estadísticas.' })
]);

export function recipeFor(id, version = CRAFTING_POLICY_VERSION) {
  requireGame(version === CRAFTING_POLICY_VERSION, 'INVALID_CRAFTING_POLICY');
  return RECIPES.find(recipe => recipe.id === id) ?? null;
}

export function materialRewardFor(source, version = CRAFTING_POLICY_VERSION) {
  requireGame(version === CRAFTING_POLICY_VERSION, 'INVALID_CRAFTING_POLICY');
  if (source.type === 'battle' && source.receipt.reason === 'rewarded') return { fragmentos: 2, esencias: 0, sellos: 0 };
  if (source.type === 'season') return { fragmentos: 3, esencias: 1, sellos: 0 };
  if (source.type === 'story') return structuredClone(source.receipt.materials);
  if (source.type === 'content') {
    const rewards = { mission: [2, 0], achievement: [3, 1], boss: [3, 1], event: [1, 0] };
    const amounts = rewards[source.receipt.kind];
    if (amounts) return { fragmentos: amounts[0], esencias: amounts[1], sellos: 0 };
  }
  return null;
}

export function materialSources(state, userId, at) {
  const result = [];
  for (const [type, name] of [['battle', 'recompensas'], ['content', 'premioscontenido'], ['season', 'premiostemporada'], ['story', 'premioshistoria']]) {
    for (const receipt of state[name]?.records ?? []) {
      if (receipt.userId !== userId || Date.parse(receipt.createdAt) > Date.parse(at)) continue;
      const source = { type, receipt };
      const materials = materialRewardFor(source);
      if (materials && MATERIAL_KEYS.some(key => materials[key] > 0)) result.push({ type, id: receipt.id, materials, createdAt: receipt.createdAt });
    }
  }
  return result;
}

export function addMaterials(balance, amount) {
  return Object.fromEntries(MATERIAL_KEYS.map(key => [key, safeAdd(balance[key], amount[key])]));
}

export function spendMaterials(balance, amount) {
  for (const key of MATERIAL_KEYS) requireGame(balance[key] >= amount[key], 'INSUFFICIENT_MATERIALS', {
    material: key, required: amount[key], available: balance[key]
  });
  return Object.fromEntries(MATERIAL_KEYS.map(key => [key, balance[key] - amount[key]]));
}

export function materialsAfter(before, inputs, outputs) {
  return addMaterials(spendMaterials(before, inputs), outputs);
}

export function sourceKey(source) { return `${source.type}:${source.id}`; }
