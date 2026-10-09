import { requireGame } from '../../utils/GameError.js';
import { expireBattles } from '../battle/lifecycle.js';

export function createTeamService(storage, clock) {
  async function view(repos, user) {
    const units = await Promise.all(user.team.map(async id => {
      const unit = await repos.units.get(id);
      return { ...unit, character: await repos.characters.get(unit.characterId) };
    }));
    return { user: { id: user.id, name: user.name }, units, maxSize: 1 };
  }
  async function change(userId, chooseIds) {
    return storage.withTransaction(async repos => {
      const now = clock();
      await expireBattles(repos, now);
      const user = await repos.users.get(userId);
      requireGame(user, 'USER_NOT_FOUND');
      requireGame(!await repos.battles.find(b => b.status === 'active' && b.players.some(p => p.userId === userId)), 'TEAM_LOCKED');
      const ids = chooseIds(user.team);
      requireGame(ids.length <= 1, 'TEAM_FULL');
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
        await expireBattles(repos, clock());
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        return view(repos, user);
      });
    },
    async setTeam({ userId, unitIds }) {
      requireGame(Array.isArray(unitIds) && unitIds.length <= 1 && unitIds.every(id => typeof id === 'string'), 'INVALID_TEAM');
      const ids = unitIds.map(id => id.trim().toUpperCase());
      return change(userId, () => ids);
    },
    async updateTeam({ userId, operation, unitId = null }) {
      requireGame(['use', 'add', 'remove', 'clear'].includes(operation), 'INVALID_TEAM');
      requireGame(operation === 'clear' || typeof unitId === 'string', 'INVALID_TEAM');
      const id = typeof unitId === 'string' ? unitId.trim().toUpperCase() : null;
      return change(userId, team => {
        if (operation === 'clear') return [];
        if (operation === 'use') return [id];
        if (operation === 'add') return team.includes(id) ? [...team] : [...team, id];
        requireGame(team.includes(id), 'UNIT_NOT_IN_TEAM');
        return team.filter(value => value !== id);
      });
    }
  };
}
