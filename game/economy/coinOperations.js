import { safeAdd } from '../progression/rules.js';

// Internal only: the caller records the source and receipt in the same transaction.
// All earned coin credits use this operation; commands never edit a balance.
export async function creditCoinsInTransaction(repos, user, amount, now) {
  const credited = { ...user, economy: { ...user.economy, coins: safeAdd(user.economy.coins, amount) }, updatedAt: now };
  await repos.users.replace(credited);
  return credited;
}
