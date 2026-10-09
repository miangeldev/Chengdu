import { createUnitInTransaction } from './unitGenerator.js';
import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { expireBattles } from '../battle/lifecycle.js';

async function detail(repos, unit) {
  const owner = await repos.users.get(unit.ownerId);
  return { ...unit, character: await repos.characters.get(unit.characterId), owner: { id: owner.id, name: owner.name } };
}

export function createUnitService(storage, clock) {
  return {
    async createUnit(options) {
      // Internal API. No player command accepts origin, owner or operationKey.
      requireGame(options.origin?.type !== 'starter', 'INVALID_ORIGIN');
      return storage.withTransaction(repos => createUnitInTransaction(repos, options, clock));
    },
    async getUnit(unitId) {
      requireGame(typeof unitId === 'string', 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        const unit = await repos.units.get(unitId.trim().toUpperCase());
        requireGame(unit, 'UNIT_NOT_FOUND');
        return detail(repos, unit);
      });
    },
    async getUserUnits(ownerId, options = {}) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        requireGame(await repos.users.get(ownerId), 'USER_NOT_FOUND');
        const page = paginate(await repos.units.getByOwner(ownerId), options, `collection:${ownerId}`);
        page.items = await Promise.all(page.items.map(unit => detail(repos, unit)));
        return page;
      });
    }
  };
}
