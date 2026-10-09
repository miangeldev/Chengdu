import { createUnitInTransaction } from './unitGenerator.js';
import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { expireBattles } from '../battle/lifecycle.js';

async function detail(repos, unit) {
  const owner = await repos.users.get(unit.ownerId);
  return { ...unit, character: await repos.characters.get(unit.characterId), owner: { id: owner.id, name: owner.name } };
}

function snapshotDetail(player) {
  return { ...player.unit, owner: { id: player.userId, name: player.name }, inBattle: true };
}

async function combatDetail(repos, unitId) {
  const unit = await repos.units.get(unitId);
  requireGame(unit, 'UNIT_NOT_FOUND');
  if (unit.lock?.type === 'battle') {
    const battle = await repos.battles.get(unit.lock.referenceId);
    return snapshotDetail(battle.players.find(p => p.unit.id === unit.id));
  }
  const character = await repos.characters.get(unit.characterId);
  const owner = await repos.users.get(unit.ownerId);
  return {
    id: unit.id, characterId: unit.characterId, characterName: character.name,
    stats: unit.initialStats, hp: unit.initialStats.hp,
    attacks: await Promise.all(character.attackIds.map(id => repos.attacks.get(id))),
    owner: { id: owner.id, name: owner.name }, inBattle: false
  };
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
    async getCombatDetails({ userId = null, chatId = null, unitId = null } = {}) {
      requireGame(unitId === null || typeof unitId === 'string', 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        if (unitId !== null) return { units: [await combatDetail(repos, unitId.trim().toUpperCase())] };
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        const battle = await repos.battles.find(b => b.status === 'active' &&
          (chatId === null || b.chatId === chatId) && b.players.some(p => p.userId === userId));
        if (battle) return { units: battle.players.map(snapshotDetail) };
        return { units: await Promise.all(user.team.map(id => combatDetail(repos, id))) };
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
