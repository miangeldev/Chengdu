import { requireGame } from '../../utils/GameError.js';
import { expireBattles } from '../battle/lifecycle.js';
import { randomUUID } from 'node:crypto';
import { creditCoinsInTransaction } from './coinOperations.js';
import { DAILY_POLICY_VERSION, dailyPolicy, dailyTimestamp, nextDailyAt } from './dailyPolicy.js';

async function registeredUser(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function latestDaily(repos, userId) {
  return repos.dailyClaims.lastBy('userId', userId);
}

export function createEconomyService(storage, clock) {
  return {
    async getBalance(userId) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        const user = await registeredUser(repos, userId);
        const movements = await repos.economy.filterBy('userId', userId);
        let income = 0n, expenses = 0n;
        for (const movement of movements) {
          if (movement.type === 'credit') income += BigInt(movement.amount);
          else expenses += BigInt(movement.amount);
        }
        const baseline = await repos.state.get(`progression:${userId}`);
        // Lifetime totals may exceed the numeric limit of an individual balance.
        return { coins: user.economy.coins, income: income.toString(), expenses: expenses.toString(), openingBalance: baseline.coins };
      });
    },
    async getDailyStatus(userId) {
      return storage.withRead(async repos => {
        await registeredUser(repos, userId);
        const latest = await latestDaily(repos, userId);
        const now = dailyTimestamp(clock());
        return { ...dailyPolicy(), available: latest === null || now >= dailyTimestamp(latest.nextClaimAt), nextClaimAt: latest?.nextClaimAt ?? null };
      });
    },
    async claimDaily({ userId, operationKey }) {
      requireGame(typeof operationKey === 'string' && operationKey.length > 0 && operationKey.length <= 200 &&
        operationKey.trim() === operationKey, 'INVALID_OPERATION_KEY');
      return storage.withTransaction(async repos => {
        const user = await registeredUser(repos, userId);
        const existing = await repos.dailyClaims.findBy('operationKey', operationKey);
        if (existing) {
          requireGame(existing.userId === userId, 'OPERATION_CONFLICT');
          return { claim: existing, alreadyClaimed: true };
        }
        const now = clock();
        const nowMs = dailyTimestamp(now);
        const latest = await latestDaily(repos, userId);
        requireGame(latest === null || nowMs >= dailyTimestamp(latest.nextClaimAt), 'DAILY_NOT_READY', { nextClaimAt: latest?.nextClaimAt ?? null });
        const policy = dailyPolicy();
        const nextClaimAt = nextDailyAt(now);
        const id = `DAILY-${randomUUID()}`;
        const credited = await creditCoinsInTransaction(repos, user, policy.amount, now, { type: 'daily_reward', id });
        const claim = await repos.dailyClaims.insert({
          id, userId, operationKey, createdAt: now, policyVersion: DAILY_POLICY_VERSION,
          ...policy, nextClaimAt, balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins
        });
        return { claim, alreadyClaimed: false };
      });
    },
    async getMovements(userId, options = {}) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        await registeredUser(repos, userId);
        // Append order represents committed transactions and stays stable across new arrivals.
        return repos.economy.pageBy('userId', userId, options, `coinLedger:${userId}`,
          (movement, position) => [String(Number.MAX_SAFE_INTEGER - position).padStart(16, '0'), movement.id]);
      });
    }
  };
}
