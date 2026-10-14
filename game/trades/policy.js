import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';

export const TRADE_TTL_MS = 15 * 60_000;
export const TRADE_MAX_UNITS = 3;
export const TRADE_MAX_OPEN = 5;
export const isOpenTrade = trade => ['draft', 'locked'].includes(trade.status);

export function tradeExpiresAt(now) {
  const at = dailyTimestamp(now) + TRADE_TTL_MS;
  requireGame(Number.isSafeInteger(at) && at <= Date.parse('9999-12-31T23:59:59.999Z'), 'INVALID_CLOCK');
  return new Date(at).toISOString();
}

export function validateTradeOperationKey(key) {
  requireGame(typeof key === 'string' && key.length > 0 && key.length <= 200 && key.trim() === key, 'INVALID_OPERATION_KEY');
}

export function validateTradeChat(chatId) {
  requireGame(typeof chatId === 'string' && chatId.length > 0 && chatId.length <= 200 && chatId.trim() === chatId, 'INVALID_CHAT');
}

export function normalizeTradeOffer(unitIds, coins) {
  requireGame(Array.isArray(unitIds) && unitIds.length <= TRADE_MAX_UNITS && unitIds.every(id => typeof id === 'string' && id.trim()), 'INVALID_TRADE_OFFER');
  const ids = unitIds.map(id => id.trim().toUpperCase());
  requireGame(new Set(ids).size === ids.length && ids.every(id => id.length <= 100), 'INVALID_TRADE_OFFER');
  requireGame(Number.isSafeInteger(coins) && coins >= 0, 'INVALID_COIN_AMOUNT');
  return { unitIds: ids, coins };
}
