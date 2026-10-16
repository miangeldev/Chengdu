import { expireTrades } from '../trades/lifecycle.js';
import { requireGame } from '../../utils/GameError.js';
import { expireBattles } from '../battle/lifecycle.js';
import { expireListings } from '../market/lifecycle.js';

export function createTeamService(storage, clock) {
  async function view(repos, user) {
    const units = await Promise.all(user.team.map(async id => {
      const unit = await repos.units.get(id);
      return { ...unit, character: await repos.characters.get(unit.characterId) };
    }));
    return { user: { id: user.id, name: user.name }, units, maxSize: 3 };
  }
  async function change(userId, chooseIds) {
    return storage.withTransaction(async repos => {
      const now = clock();
      await expireBattles(repos, now);
      await expireListings(repos, now);
    await expireTrades(repos, now);
      const user = await repos.users.get(userId);
      requireGame(user, 'USER_NOT_FOUND');
      requireGame(!await repos.battles.findBy('status', 'active', b => b.players.some(p => p.userId === userId)), 'TEAM_LOCKED');
      const ids = chooseIds(user.team);
      requireGame(ids.length <= 3, 'TEAM_FULL');
      requireGame(new Set(ids).size === ids.length, 'DUPLICATE_TEAM_UNIT');
      for (const id of ids) {
        const unit = await repos.units.get(id);
        requireGame(unit, 'UNIT_NOT_FOUND');
        requireGame(unit.ownerId === userId, 'UNIT_NOT_OWNED');
        requireGame(unit.lock === null, 'UNIT_LOCKED');
      }
      const updated = { ...user, team: ids, updatedAt: now };
      await repos.users.replace(updated);
      return view(repos, updated);
    });
  }
  return {
    async getTeam(userId) {
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await expireListings(repos, now);
        await expireTrades(repos, now);
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        return view(repos, user);
      });
    },
    async setTeam({ userId, unitIds }) {
      requireGame(Array.isArray(unitIds) && unitIds.length <= 3 && unitIds.every(id => typeof id === 'string' && id.trim()), 'INVALID_TEAM');
      const ids = unitIds.map(id => id.trim().toUpperCase());
      return change(userId, () => ids);
    },
    async updateTeam({ userId, operation, unitId = null, positions = null }) {
      requireGame(['use', 'add', 'remove', 'clear', 'order'].includes(operation), 'INVALID_TEAM');
      if (operation === 'order') {
        requireGame(Array.isArray(positions) && positions.every(position => Number.isSafeInteger(position) && position >= 1), 'INVALID_TEAM_ORDER');
        return change(userId, team => {
          requireGame(positions.length === team.length && new Set(positions).size === team.length && positions.every(position => position <= team.length), 'INVALID_TEAM_ORDER');
          return positions.map(position => team[position - 1]);
        });
      }
      requireGame(operation === 'clear' || typeof unitId === 'string', 'INVALID_TEAM');
      const id = typeof unitId === 'string' ? unitId.trim().toUpperCase() : null;
      return change(userId, team => {
        if (operation === 'clear') return [];
        if (operation === 'use') return [id];
        if (operation === 'add') {
          requireGame(!team.includes(id), 'DUPLICATE_TEAM_UNIT');
          return [...team, id];
        }
        requireGame(team.includes(id), 'UNIT_NOT_IN_TEAM');
        return team.filter(value => value !== id);
      });
    }
  };
}
