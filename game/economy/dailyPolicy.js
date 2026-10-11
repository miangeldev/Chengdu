import { requireGame } from '../../utils/GameError.js';

// Keep historical policies intact when adding another edition of the daily reward.
export const DAILY_POLICIES = Object.freeze({
  1: Object.freeze({ amount: 100, cooldownMs: 86_400_000 })
});
export const DAILY_POLICY_VERSION = 1;
export const DAILY_AMOUNT = DAILY_POLICIES[DAILY_POLICY_VERSION].amount;
export const DAILY_COOLDOWN_MS = DAILY_POLICIES[DAILY_POLICY_VERSION].cooldownMs;

export function dailyPolicy(version = DAILY_POLICY_VERSION) {
  requireGame(Number.isSafeInteger(version) && version >= 1 && Object.hasOwn(DAILY_POLICIES, version), 'INVALID_DAILY_POLICY');
  return DAILY_POLICIES[version];
}

export function dailyTimestamp(value) {
  requireGame(typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) &&
    Number.isFinite(Date.parse(value)), 'INVALID_CLOCK');
  const timestamp = Date.parse(value);
  const canonical = value.includes('.') ? value : value.replace(/Z$/, '.000Z');
  requireGame(new Date(timestamp).toISOString() === canonical, 'INVALID_CLOCK');
  return timestamp;
}

export function nextDailyAt(createdAt, version = DAILY_POLICY_VERSION) {
  const timestamp = dailyTimestamp(createdAt) + dailyPolicy(version).cooldownMs;
  requireGame(Number.isSafeInteger(timestamp) && Number.isFinite(new Date(timestamp).getTime()), 'INVALID_CLOCK');
  const result = new Date(timestamp).toISOString();
  dailyTimestamp(result);
  return result;
}
