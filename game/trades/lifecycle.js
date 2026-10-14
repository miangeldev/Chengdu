import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { creditCoinsInTransaction } from '../economy/coinOperations.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { isOpenTrade } from './policy.js';

export function createTradeAction(trade, kind, userId, operationKey, now) {
  return { id: `TA-${randomUUID()}`, tradeId: trade.id, userId, kind, operationKey, createdAt: now,
    before: structuredClone(trade), after: null, movements: [], transfers: [] };
}

export async function finishTradeAction(repos, action, trade) {
  action.after = structuredClone(trade);
  await repos.trades.replace(trade);
  await repos.tradeActions.insert(action);
  return trade;
}

export async function closeTradeInTransaction(repos, trade, { status, userId, operationKey, now }) {
  const action = createTradeAction(trade, status === 'expired' ? 'expire' : 'cancel', userId, operationKey, now);
  if (trade.status === 'locked') {
    for (const reservation of trade.reservations) {
      const unit = await repos.units.get(reservation.unitId);
      requireGame(unit?.ownerId === reservation.userId && unit.ownershipVersion === reservation.ownershipVersion &&
        unit.lock?.type === 'trade' && unit.lock.referenceId === trade.id, 'DATABASE_CORRUPT');
      await repos.units.replace({ ...unit, lock: null, updatedAt: now });
    }
    for (const offer of trade.offers) if (offer.coins > 0) {
      const user = await repos.users.get(offer.userId);
      const sourceId = `${action.id}:${user.id}`;
      const credited = await creditCoinsInTransaction(repos, user, offer.coins, now, { type: 'trade_refund', id: sourceId });
      action.movements.push({ userId: user.id, amount: offer.coins, type: 'credit', sourceType: 'trade_refund', sourceId,
        balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins });
    }
  }
  return finishTradeAction(repos, action, { ...trade, status, closedAt: now, updatedAt: now, closeActionId: action.id });
}

export async function expireTrades(repos, now) {
  if (!repos.trades) return 0;
  const timestamp = dailyTimestamp(now);
  const expired = await repos.trades.filter(trade => isOpenTrade(trade) && dailyTimestamp(trade.expiresAt) <= timestamp);
  for (const trade of expired) await closeTradeInTransaction(repos, trade, {
    status: 'expired', userId: null, operationKey: `trade-expire:${trade.id}`, now
  });
  return expired.length;
}
