import { randomUUID } from 'node:crypto';
import { normalizeIdentity, validName } from '../../utils/identity.js';
import { requireGame } from '../../utils/GameError.js';
import { expireBattles } from '../battle/lifecycle.js';

export function createUserService(storage, clock) {
  return {
    async registerUser({ identity, name }) {
      const canonical = normalizeIdentity(identity);
      const cleanName = validName(name);
      return storage.withTransaction(async repos => {
        const existing = await repos.users.getByIdentity(canonical);
        requireGame(!existing, 'USER_ALREADY_EXISTS', { name: existing?.name });
        const now = clock();
        return repos.users.insert({
          id: `USR-${randomUUID()}`, identities: [canonical], name: cleanName,
          createdAt: now, updatedAt: now,
          economy: { coins: 0 }, progress: { level: 1, xp: 0 },
          battleStats: { wins: 0, losses: 0, matches: 0 }, team: [], settings: { notifications: true }
        });
      });
    },
    async getUser(userId) {
      return storage.withRead(async repos => {
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        return user;
      });
    },
    async linkIdentity({ userId, identity }) {
      // Internal API: the host must verify control of this identity before calling.
      const canonical = normalizeIdentity(identity);
      return storage.withTransaction(async repos => {
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        const linked = await repos.users.getByIdentity(canonical);
        requireGame(!linked || linked.id === userId, 'IDENTITY_ALREADY_LINKED');
        if (linked) return user;
        return repos.users.replace({ ...user, identities: [...user.identities, canonical], updatedAt: clock() });
      });
    },
    async getUserByIdentity(identity) {
      const canonical = normalizeIdentity(identity);
      return storage.withRead(async repos => {
        const user = await repos.users.getByIdentity(canonical);
        requireGame(user, 'USER_NOT_FOUND');
        return user;
      });
    },
    async getProfile(userId) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        return { user, starterClaim: await repos.state.get(`starter:${userId}`), unitCount: (await repos.units.getByOwner(userId)).length };
      });
    }
  };
}
