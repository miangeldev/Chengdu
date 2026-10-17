import { equal } from './equality.js';
import { requireGame } from '../utils/GameError.js';
import { CRAFTING_POLICY_VERSION, MATERIAL_KEYS, addMaterials, emptyMaterials, materialSources,
  materialsAfter, recipeFor, sourceKey } from '../game/crafting/policy.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });

const integer = value => Number.isSafeInteger(value) && value >= 0;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const materials = value => value && Object.keys(value).length === MATERIAL_KEYS.length && MATERIAL_KEYS.every(key => integer(value[key]));

function validateSources(state, action, used) {
  const sources = new Map(materialSources(state, action.userId, action.createdAt).map(source => [sourceKey(source), source]));
  let total = emptyMaterials();
  check(action.sources.length > 0 && action.sources.length <= 100, 'crafting.sourcesCount');
  for (const source of action.sources) {
    const key = `${action.userId}:${sourceKey(source)}`;
    const actual = sources.get(sourceKey(source));
    check(actual && Object.keys(source).length === 2 && !used.has(key), 'crafting.earnedSource');
    const coinSource = { battle: 'battle_reward', content: 'content_reward', season: 'season_reward', story: 'story_reward' }[source.type];
    check(state.economia.records.slice(0, action.economyCursor).some(movement => movement.sourceType === coinSource &&
      movement.sourceId === source.id && movement.userId === action.userId), 'crafting.sourceCommitOrder');
    used.add(key);
    total = addMaterials(total, actual.materials);
  }
  check(equal(action.outputs, total), 'crafting.sourceAmounts');
}

function balanceAtCursor(state, userId, cursor) {
  let balance = state.estado.records.find(record => record.kind === 'progressionBaseline' && record.entityType === 'user' && record.entityId === userId)?.coins;
  for (const movement of state.economia.records.slice(0, cursor)) if (movement.userId === userId) balance = movement.balanceAfter;
  return balance;
}

export function validateCraftingData(state) {
  const users = new Set(state.usuarios.records.map(user => user.id));
  const balances = new Map(), used = new Set(), operationKeys = new Set(), badges = new Set();
  for (const action of state.artesania.records) {
    check(/^CRAFT-[a-f0-9-]{36}$/.test(action.id) && users.has(action.userId) && action.policyVersion === CRAFTING_POLICY_VERSION &&
      typeof action.operationKey === 'string' && action.operationKey.length > 0 && action.operationKey.length <= 200 && action.operationKey.trim() === action.operationKey &&
      !operationKeys.has(action.operationKey) && date(action.createdAt) && Array.isArray(action.sources) && integer(action.coins) &&
      integer(action.economyCursor) && action.economyCursor <= state.economia.records.length && integer(action.balanceBefore) && integer(action.balanceAfter) &&
      materials(action.materialsBefore) && materials(action.materialsAfter) && materials(action.inputs) && materials(action.outputs), 'crafting.metadata');
    operationKeys.add(action.operationKey);
    check(equal(action.materialsBefore, balances.get(action.userId) ?? emptyMaterials()), 'crafting.materialChain');
    check(action.balanceBefore === balanceAtCursor(state, action.userId, action.economyCursor), 'crafting.balanceCursor');
    if (action.kind === 'material_claim') {
      check(action.recipeId === null && action.coins === 0 && action.badge === null && equal(action.inputs, emptyMaterials()), 'crafting.claim');
      validateSources(state, action, used);
    } else if (action.kind === 'craft') {
      const recipe = recipeFor(action.recipeId, action.policyVersion);
      check(recipe && action.sources.length === 0 && action.coins === recipe.coins && equal(action.inputs, recipe.inputs) &&
        equal(action.outputs, recipe.outputs) && action.badge === recipe.badge, 'crafting.recipe');
      if (recipe.badge) {
        const key = `${action.userId}:${recipe.badge}`;
        check(!badges.has(key), 'crafting.cosmeticOnce');
        badges.add(key);
      }
      const movement = state.economia.records[action.economyCursor];
      check(movement?.sourceType === 'crafting_cost' && movement.sourceId === action.id, 'crafting.costOrder');
    } else if (action.kind === 'evolution_spend') {
      check(action.sources.length === 0 && action.recipeId === null && action.coins === 0 && action.badge === null &&
        equal(action.inputs, { fragmentos: 0, esencias: 0, sellos: 1 }) && equal(action.outputs, emptyMaterials()), 'crafting.evolutionSpend');
      const evolutions = state.evoluciones.records.filter(row => row.craftingActionId === action.id);
      check(evolutions.length === 1 && evolutions[0].userId === action.userId && evolutions[0].createdAt === action.createdAt &&
        evolutions[0].operationKey === action.operationKey && evolutions[0].balanceBefore === action.balanceBefore, 'crafting.evolutionLink');
      const movement = state.economia.records[action.economyCursor];
      check(movement?.sourceType === 'evolution_cost' && movement.sourceId === evolutions[0].id, 'crafting.evolutionCostOrder');
    } else check(false, 'crafting.kind');
    check(equal(action.materialsAfter, materialsAfter(action.materialsBefore, action.inputs, action.outputs)) &&
      action.balanceAfter === action.balanceBefore - action.coins, 'crafting.totals');
    balances.set(action.userId, action.materialsAfter);
  }
}

export function validateCraftingTransition(before, after, context = {}) {
  check(equal(before.artesania.records, after.artesania.records.slice(0, before.artesania.records.length)), 'crafting.appendOnly');
  const used = new Set(before.artesania.records.filter(action => action.kind === 'material_claim')
    .flatMap(action => action.sources.map(source => `${action.userId}:${sourceKey(source)}`)));
  for (const action of after.artesania.records.slice(before.artesania.records.length)) {
    check(!context.now || Date.parse(action.createdAt) <= Date.parse(context.now), 'crafting.trustedClock');
    check(action.economyCursor >= before.economia.records.length, 'crafting.transactionCursor');
    const user = before.usuarios.records.find(row => row.id === action.userId);
    check(user && Date.parse(action.createdAt) >= Date.parse(user.updatedAt), 'crafting.userClock');
    if (action.kind === 'material_claim') validateSources(before, action, used);
  }
}
