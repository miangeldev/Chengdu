import { safeAdd } from '../progression/rules.js';
import { requireGame } from '../../utils/GameError.js';

// Internal only: the caller records the source and receipt in the same transaction.
// All earned coin credits use this operation; commands never edit a balance.
async function recordMovement(repos, user, amount, after, now, source, type) {
  requireGame(source && ['battle_reward', 'pack_opening', 'daily_reward', 'market_purchase', 'market_sale', 'content_reward', 'season_reward', 'trade_escrow', 'trade_settlement', 'trade_refund', 'crafting_cost', 'evolution_cost', 'clan_creation', 'clan_deposit', 'clan_withdraw', 'clan_war_reward'].includes(source.type) && typeof source.id === 'string', 'INVALID_COIN_SOURCE');
  const role = source.type === 'market_purchase' ? ':buyer' : source.type === 'market_sale' ? ':seller' : '';
  await repos.economy.insert({
    id: `coin:${source.id}${role}`, userId: user.id, type, sourceType: source.type, sourceId: source.id,
    amount, balanceBefore: user.economy.coins, balanceAfter: after, createdAt: now
  });
}

export async function creditCoinsInTransaction(repos, user, amount, now, source) {
  const credited = { ...user, economy: { ...user.economy, coins: safeAdd(user.economy.coins, amount) }, updatedAt: now };
  await recordMovement(repos, user, amount, credited.economy.coins, now, source, 'credit');
  await repos.users.replace(credited);
  return credited;
}

export async function debitCoinsInTransaction(repos, user, amount, now, source) {
  requireGame(Number.isSafeInteger(amount) && amount > 0, 'INVALID_COIN_AMOUNT');
  requireGame(user.economy.coins >= amount, 'INSUFFICIENT_COINS', { required: amount, coins: user.economy.coins });
  const debited = { ...user, economy: { ...user.economy, coins: user.economy.coins - amount }, updatedAt: now };
  await recordMovement(repos, user, amount, debited.economy.coins, now, source, 'debit');
  await repos.users.replace(debited);
  return debited;
}
