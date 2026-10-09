import { randomInt, randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { availablePool, rollDrop } from '../drops/dropEngine.js';
import { debitCoinsInTransaction } from '../economy/coinOperations.js';
import { createUnitInTransaction } from '../units/unitGenerator.js';

export function createPackService(storage, clock, randomDropInt = upper => randomInt(upper)) {
  return {
    async listPacks() {
      return storage.withRead(async repos => {
        const characters = await repos.characters.all();
        const counters = await repos.state.filter(r => r.kind === 'mintCounter');
        const items = (await repos.packs.all()).map(pack => {
          const pool = availablePool(pack, characters, counters);
          return { ...pack, available: pool.totalWeight > 0, odds: pool.entries.map(entry => ({
            rarity: entry.rarity, weight: entry.weight, totalWeight: pool.totalWeight, characterCount: entry.characters.length
          })) };
        });
        return { items };
      });
    },
    async openPack({ userId, packId, operationKey }) {
      requireGame(typeof packId === 'string' && packId.length > 0 && packId.length <= 100, 'PACK_NOT_FOUND');
      requireGame(typeof operationKey === 'string' && operationKey.length > 0 && operationKey.length <= 200 && operationKey.trim() === operationKey, 'INVALID_OPERATION_KEY');
      return storage.withTransaction(async repos => {
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        const existing = await repos.openings.find(o => o.operationKey === operationKey);
        if (existing) {
          requireGame(existing.userId === userId && existing.packId === packId, 'OPERATION_CONFLICT');
          const unit = await repos.units.get(existing.unitId);
          return { opening: existing, unit, character: await repos.characters.get(unit.characterId), alreadyOpened: true };
        }
        const pack = await repos.packs.get(packId);
        requireGame(pack, 'PACK_NOT_FOUND');
        const pool = availablePool(pack, await repos.characters.all(), await repos.state.filter(r => r.kind === 'mintCounter'));
        requireGame(pool.totalWeight > 0, 'PACK_UNAVAILABLE');
        requireGame(user.economy.coins >= pack.price, 'INSUFFICIENT_COINS', { required: pack.price, coins: user.economy.coins });
        const now = clock();
        const openingId = `OPEN-${randomUUID()}`;
        const drop = rollDrop(pack, pool, randomDropInt);
        const debited = await debitCoinsInTransaction(repos, user, pack.price, now, { type: 'pack_opening', id: openingId });
        const unit = await createUnitInTransaction(repos, {
          ownerId: userId, characterId: drop.character.id, origin: { type: 'pack', sourceId: openingId },
          operationKey: `opening:${openingId}`, collectibles: { traits: drop.traits, variant: drop.variant, traitVersion: drop.traitVersion }
        }, () => now);
        const opening = await repos.openings.insert({
          id: openingId, userId, packId: pack.id, packRevision: pack.revision, operationKey, createdAt: now,
          price: pack.price, balanceBefore: user.economy.coins, balanceAfter: debited.economy.coins,
          unitId: unit.id, packSnapshot: structuredClone(pack), result: {
            characterId: unit.characterId, characterRevision: unit.characterRevision,
            characterName: drop.character.name, rarity: drop.character.rarity, serial: unit.serial,
            traits: unit.traits, variant: unit.variant, traitVersion: unit.traitVersion
          }
        });
        return { opening, unit, character: drop.character, alreadyOpened: false };
      });
    }
  };
}
