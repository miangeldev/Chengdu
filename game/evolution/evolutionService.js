import { expireTrades } from '../trades/lifecycle.js';
import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { validContentKey } from '../content/rewards.js';
import { expireBattles } from '../battle/lifecycle.js';
import { expireListings } from '../market/lifecycle.js';
import { debitCoinsInTransaction } from '../economy/coinOperations.js';
import { consumeEvolutionSeal, craftingInventory } from '../crafting/craftingService.js';
import { effectiveUnitStats, EVOLUTION_COINS, EVOLUTION_MIN_LEVEL, EVOLUTION_POLICY_VERSION, formForCharacter } from './rules.js';

async function ownUnit(repos, userId, unitId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  const unit = await repos.units.get(unitId.trim().toUpperCase());
  requireGame(unit, 'UNIT_NOT_FOUND');
  requireGame(unit.ownerId === userId, 'NOT_UNIT_OWNER');
  return { user, unit };
}

export function createEvolutionService(storage, clock) {
  return {
    async getOptions({ userId, unitId }) {
      requireGame(typeof unitId === 'string', 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await expireListings(repos, now);
        await expireTrades(repos, now);
        const { user, unit } = await ownUnit(repos, userId, unitId);
        const form = formForCharacter(unit.characterId);
        const inventory = await craftingInventory(repos, userId);
        return { unit, form, minimumLevel: EVOLUTION_MIN_LEVEL, coins: EVOLUTION_COINS, seals: 1,
          materials: inventory.materials, balance: user.economy.coins,
          available: Boolean(form && !unit.evolution && !unit.lock && unit.progress.level >= EVOLUTION_MIN_LEVEL &&
            inventory.materials.sellos >= 1 && user.economy.coins >= EVOLUTION_COINS) };
      });
    },
    async evolve({ userId, unitId, operationKey }) {
      validContentKey(operationKey);
      requireGame(typeof unitId === 'string', 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        requireGame(await repos.users.get(userId), 'USER_NOT_FOUND');
        const existing = await repos.evolutionActions.find(action => action.operationKey === operationKey);
        if (existing) {
          requireGame(existing.userId === userId && existing.unitId === unitId.trim().toUpperCase(), 'OPERATION_CONFLICT');
          return { evolution: existing, alreadyEvolved: true };
        }
        const now = clock();
        await expireBattles(repos, now);
        await expireListings(repos, now);
        await expireTrades(repos, now);
        const user = await repos.users.get(userId);
        requireGame(!(await repos.craftingActions.find(action => action.operationKey === operationKey)), 'OPERATION_CONFLICT');
        const { unit } = await ownUnit(repos, userId, unitId);
        const form = formForCharacter(unit.characterId);
        requireGame(form, 'EVOLUTION_UNAVAILABLE');
        requireGame(!unit.evolution, 'UNIT_ALREADY_EVOLVED');
        requireGame(!unit.lock, 'UNIT_LOCKED');
        requireGame(unit.progress.level >= EVOLUTION_MIN_LEVEL, 'EVOLUTION_LEVEL_REQUIRED', { minimum: EVOLUTION_MIN_LEVEL, level: unit.progress.level });
        requireGame(Date.parse(now) >= Date.parse(unit.updatedAt), 'INVALID_CLOCK');
        const id = `EVO-${randomUUID()}`;
        const spend = await consumeEvolutionSeal(repos, { user, operationKey, createdAt: now });
        const debited = await debitCoinsInTransaction(repos, user, EVOLUTION_COINS, now, { type: 'evolution_cost', id });
        const after = { version: EVOLUTION_POLICY_VERSION, formId: form.id, receiptId: id, evolvedAt: now };
        const nextUnit = { ...unit, evolution: after, updatedAt: now };
        const evolution = await repos.evolutionActions.insert({ id, userId, unitId: unit.id, operationKey,
          policyVersion: EVOLUTION_POLICY_VERSION, createdAt: now, characterId: unit.characterId,
          ownershipVersion: unit.ownershipVersion, level: unit.progress.level, craftingActionId: spend.id,
          coins: EVOLUTION_COINS, balanceBefore: user.economy.coins, balanceAfter: debited.economy.coins,
          before: null, after, statsBefore: effectiveUnitStats(unit), statsAfter: effectiveUnitStats(nextUnit) });
        await repos.units.replace(nextUnit);
        return { evolution, alreadyEvolved: false };
      });
    }
  };
}
