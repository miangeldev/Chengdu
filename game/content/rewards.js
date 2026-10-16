import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { creditCoinsInTransaction } from '../economy/coinOperations.js';
import { grantXp, safeAdd } from '../progression/rules.js';
import { CONTENT_POLICY_VERSION } from './catalog.js';

export function validContentKey(value) {
  requireGame(typeof value === 'string' && value.length > 0 && value.length <= 200 && value.trim() === value, 'INVALID_OPERATION_KEY');
}

export async function ticketBalance(repos, userId) {
  return (await repos.contentRewards.lastBy('userId', userId))?.ticketsAfter ?? 0;
}

export async function grantContentReward(repos, { userId, kind, sourceId, operationKey, coins = 0, userXp = 0,
  tickets = 0, ticketCost = 0, createdAt, details = {} }) {
  validContentKey(operationKey);
  requireGame(['mission', 'achievement', 'boss', 'event', 'spawn'].includes(kind) && typeof sourceId === 'string' && sourceId.length > 0 && sourceId.length <= 200, 'INVALID_CONTENT_REWARD');
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  const previousKey = await repos.contentRewards.findBy('operationKey', operationKey);
  if (previousKey) {
    requireGame(previousKey.userId === userId && previousKey.kind === kind && previousKey.sourceId === sourceId, 'OPERATION_CONFLICT');
    return { reward: previousKey, alreadyClaimed: true };
  }
  const previous = await repos.contentRewards.findBy('userId', userId, reward => reward.kind === kind && reward.sourceId === sourceId);
  if (previous) return { reward: previous, alreadyClaimed: true };
  for (const amount of [coins, userXp, tickets, ticketCost]) requireGame(Number.isSafeInteger(amount) && amount >= 0, 'INVALID_CONTENT_REWARD');
  requireGame(dailyTimestamp(createdAt) >= dailyTimestamp(user.updatedAt), 'INVALID_CLOCK');
  const ticketsBefore = await ticketBalance(repos, userId);
  const available = safeAdd(ticketsBefore, tickets);
  requireGame(available >= ticketCost, 'INSUFFICIENT_TICKETS', { required: ticketCost, tickets: ticketsBefore });
  const id = `CR-${randomUUID()}`;
  const credited = await creditCoinsInTransaction(repos, user, coins, createdAt, { type: 'content_reward', id });
  const userProgressAfter = grantXp(user.progress, userXp, 'user');
  const reward = await repos.contentRewards.insert({ id, kind, sourceId, userId, operationKey,
    policyVersion: CONTENT_POLICY_VERSION, createdAt, coins, userXp, tickets, ticketCost, details: structuredClone(details),
    balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins,
    userProgressBefore: user.progress, userProgressAfter, ticketsBefore, ticketsAfter: available - ticketCost });
  await repos.users.replace({ ...credited, progress: userProgressAfter });
  return { reward, alreadyClaimed: false };
}
