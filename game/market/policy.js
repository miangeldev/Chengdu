import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';

// Preserve historical policies when adding future market editions.
export const MARKET_POLICIES = Object.freeze({
  1: Object.freeze({ feeBps: 500, minPrice: 20, maxPrice: 1_000_000, listingDurationMs: 604_800_000 })
});
export const MARKET_POLICY_VERSION = 1;

export function marketPolicy(version = MARKET_POLICY_VERSION) {
  requireGame(Number.isSafeInteger(version) && Object.hasOwn(MARKET_POLICIES, version), 'INVALID_MARKET_POLICY');
  return MARKET_POLICIES[version];
}

export function quoteMarket(price, version = MARKET_POLICY_VERSION) {
  const policy = marketPolicy(version);
  requireGame(Number.isSafeInteger(price) && price >= policy.minPrice && price <= policy.maxPrice, 'INVALID_MARKET_PRICE');
  const fee = Number((BigInt(price) * BigInt(policy.feeBps) + 9_999n) / 10_000n);
  return { fee, net: price - fee };
}

export function marketExpiresAt(createdAt, version = MARKET_POLICY_VERSION) {
  const timestamp = dailyTimestamp(createdAt) + marketPolicy(version).listingDurationMs;
  requireGame(Number.isSafeInteger(timestamp) && Number.isFinite(new Date(timestamp).getTime()), 'INVALID_CLOCK');
  const result = new Date(timestamp).toISOString();
  dailyTimestamp(result);
  return result;
}
