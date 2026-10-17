import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { validContentKey } from '../content/rewards.js';
import { debitCoinsInTransaction } from '../economy/coinOperations.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { CRAFTING_POLICY_VERSION, RECIPES, addMaterials, emptyMaterials, materialSources,
  materialsAfter, recipeFor, sourceKey } from './policy.js';

export async function craftingInventory(repos, userId) {
  const actions = await repos.craftingActions.filterBy('userId', userId);
  const materials = actions.at(-1)?.materialsAfter ?? emptyMaterials();
  return { materials: structuredClone(materials), badges: [...new Set(actions.filter(action => action.kind === 'craft' && action.badge).map(action => action.badge))] };
}

async function pendingSources(repos, userId, now) {
  const state = { recompensas: { records: await repos.rewards.all() }, premioscontenido: { records: await repos.contentRewards.all() },
    premiostemporada: { records: await repos.seasonRewards.all() },
    premioshistoria: { records: repos.storyRewards ? await repos.storyRewards.all() : [] } };
  const claimed = new Set((await repos.craftingActions.filterBy('userId', userId, action => action.kind === 'material_claim'))
    .flatMap(action => action.sources.map(sourceKey)));
  return materialSources(state, userId, now).filter(source => !claimed.has(sourceKey(source)));
}

async function userFor(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function baseReceipt(repos, user, operationKey, now) {
  requireGame(dailyTimestamp(now) >= dailyTimestamp(user.updatedAt), 'INVALID_CLOCK');
  return { id: `CRAFT-${randomUUID()}`, userId: user.id, operationKey, policyVersion: CRAFTING_POLICY_VERSION,
    createdAt: now, economyCursor: await repos.economy.count(),
    materialsBefore: (await craftingInventory(repos, user.id)).materials,
    balanceBefore: user.economy.coins, balanceAfter: user.economy.coins };
}

// Internal: an evolution receipt must link this spend in the same transaction.
export async function consumeEvolutionSeal(repos, { user, operationKey, createdAt }) {
  const base = await baseReceipt(repos, user, operationKey, createdAt);
  const inputs = { fragmentos: 0, esencias: 0, sellos: 1 };
  return repos.craftingActions.insert({ ...base, kind: 'evolution_spend', recipeId: null, sources: [], coins: 0,
    inputs, outputs: emptyMaterials(), badge: null, materialsAfter: materialsAfter(base.materialsBefore, inputs, emptyMaterials()) });
}

export function createCraftingService(storage, clock) {
  return {
    async getInventory(userId) {
      return storage.withRead(async repos => {
        await userFor(repos, userId);
        const inventory = await craftingInventory(repos, userId);
        const pending = await pendingSources(repos, userId, clock());
        return { ...inventory, pendingSources: pending.length,
          pendingMaterials: pending.reduce((total, source) => addMaterials(total, source.materials), emptyMaterials()) };
      });
    },
    async getRecipes(userId) {
      return storage.withRead(async repos => {
        const user = await userFor(repos, userId);
        const inventory = await craftingInventory(repos, userId);
        return { ...inventory, coins: user.economy.coins, recipes: RECIPES.map(recipe => ({ ...structuredClone(recipe),
          alreadyCrafted: recipe.badge !== null && inventory.badges.includes(recipe.badge),
          available: user.economy.coins >= recipe.coins && Object.keys(recipe.inputs).every(key => inventory.materials[key] >= recipe.inputs[key]) &&
            (recipe.badge === null || !inventory.badges.includes(recipe.badge)) })) };
      });
    },
    async claimMaterials({ userId, operationKey }) {
      validContentKey(operationKey);
      return storage.withTransaction(async repos => {
        const user = await userFor(repos, userId);
        const existing = await repos.craftingActions.findBy('operationKey', operationKey);
        if (existing) {
          requireGame(existing.userId === userId && existing.kind === 'material_claim', 'OPERATION_CONFLICT');
          return { action: existing, alreadyClaimed: true };
        }
        const now = clock();
        dailyTimestamp(now);
        const sources = (await pendingSources(repos, userId, now)).slice(0, 100);
        requireGame(sources.length > 0, 'NO_MATERIALS_AVAILABLE');
        const base = await baseReceipt(repos, user, operationKey, now);
        const outputs = sources.reduce((total, source) => addMaterials(total, source.materials), emptyMaterials());
        const action = await repos.craftingActions.insert({ ...base, kind: 'material_claim', recipeId: null,
          sources: sources.map(({ type, id }) => ({ type, id })), coins: 0, inputs: emptyMaterials(), outputs, badge: null,
          materialsAfter: addMaterials(base.materialsBefore, outputs) });
        return { action, alreadyClaimed: false };
      });
    },
    async craft({ userId, recipeId, operationKey }) {
      validContentKey(operationKey);
      requireGame(typeof recipeId === 'string' && recipeFor(recipeId), 'RECIPE_NOT_FOUND');
      return storage.withTransaction(async repos => {
        const user = await userFor(repos, userId);
        const existing = await repos.craftingActions.findBy('operationKey', operationKey);
        if (existing) {
          requireGame(existing.userId === userId && existing.kind === 'craft' && existing.recipeId === recipeId, 'OPERATION_CONFLICT');
          return { action: existing, alreadyCrafted: true };
        }
        const recipe = recipeFor(recipeId);
        const inventory = await craftingInventory(repos, userId);
        requireGame(recipe.badge === null || !inventory.badges.includes(recipe.badge), 'COSMETIC_ALREADY_OWNED');
        const now = clock();
        const base = await baseReceipt(repos, user, operationKey, now);
        const after = materialsAfter(base.materialsBefore, recipe.inputs, recipe.outputs);
        const debited = await debitCoinsInTransaction(repos, user, recipe.coins, now, { type: 'crafting_cost', id: base.id });
        const action = await repos.craftingActions.insert({ ...base, kind: 'craft', recipeId, sources: [], coins: recipe.coins,
          inputs: structuredClone(recipe.inputs), outputs: structuredClone(recipe.outputs), badge: recipe.badge,
          materialsAfter: after, balanceAfter: debited.economy.coins });
        return { action, alreadyCrafted: false };
      });
    }
  };
}
