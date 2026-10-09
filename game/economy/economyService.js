import { requireGame } from '../../utils/GameError.js';
import { expireBattles } from '../battle/lifecycle.js';

export function createEconomyService(storage, clock) {
  return {
    async getBalance(userId) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        return { coins: user.economy.coins };
      });
    }
  };
}
