import { requireGame } from '../utils/GameError.js';
import { safeAdd } from '../game/progression/rules.js';
import { DAILY_POLICY_VERSION, dailyPolicy, nextDailyAt } from '../game/economy/dailyPolicy.js';

const check = (value, field) => requireGame(value, 'DATABASE_CORRUPT', { field });
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const integer = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));

export function validateEconomyData(state, schemaVersion = 7) {
  const users = new Map(state.usuarios.records.map(u => [u.id, u]));
  const rewards = new Map(state.recompensas.records.map(r => [r.id, r]));
  const openings = new Map(state.aperturas.records.map(o => [o.id, o]));
  const claims = new Map((schemaVersion >= 6 ? state.diarios.records : []).map(d => [d.id, d]));
  const sales = new Map((schemaVersion >= 7 ? state.ventas.records : []).map(s => [s.id, s]));
  const operationKeys = new Set();
  const latest = new Map();
  for (const claim of claims.values()) {
    check(/^DAILY-[a-f0-9-]{32,36}$/.test(claim.id) && users.has(claim.userId) && text(claim.operationKey) &&
      claim.operationKey.trim() === claim.operationKey && !operationKeys.has(claim.operationKey) && date(claim.createdAt), 'daily.metadata');
    operationKeys.add(claim.operationKey);
    check(integer(claim.policyVersion, 1), 'daily.policyVersion');
    const policy = dailyPolicy(claim.policyVersion);
    check(claim.amount === policy.amount && claim.cooldownMs === policy.cooldownMs &&
      date(claim.nextClaimAt) && claim.nextClaimAt === nextDailyAt(claim.createdAt, claim.policyVersion), 'daily.policy');
    check(!latest.has(claim.userId) || Date.parse(claim.createdAt) >= Date.parse(latest.get(claim.userId).nextClaimAt), 'daily.cooldown');
    check(integer(claim.balanceBefore) && claim.balanceAfter === safeAdd(claim.balanceBefore, claim.amount), 'daily.balance');
    latest.set(claim.userId, claim);
  }
  const balances = new Map(state.estado.records.filter(r => r.kind === 'progressionBaseline' && r.entityType === 'user').map(r => [r.entityId, r.coins]));
  const linked = new Set();
  const sources = { battle_reward: rewards, pack_opening: openings, ...(schemaVersion >= 6 ? { daily_reward: claims } : {}),
    ...(schemaVersion >= 7 ? { market_purchase: sales, market_sale: sales } : {}) };
  for (const movement of state.economia.records) {
    const purchase = movement.sourceType === 'market_purchase';
    const resale = movement.sourceType === 'market_sale';
    const key = `${movement.sourceType}:${movement.sourceId}`;
    const expectedId = `coin:${movement.sourceId}${purchase ? ':buyer' : resale ? ':seller' : ''}`;
    check(users.has(movement.userId) && ['credit', 'debit'].includes(movement.type) &&
      Object.hasOwn(sources, movement.sourceType) && text(movement.sourceId) && movement.id === expectedId &&
      !linked.has(key) && date(movement.createdAt) && integer(movement.amount), 'coinMovement.metadata');
    linked.add(key);
    const source = sources[movement.sourceType].get(movement.sourceId);
    check(source && (purchase ? source.buyerId : resale ? source.sellerId : source.userId) === movement.userId && source.createdAt === movement.createdAt &&
      (purchase ? source.buyerBalanceBefore : resale ? source.sellerBalanceBefore : source.balanceBefore) === movement.balanceBefore &&
      (purchase ? source.buyerBalanceAfter : resale ? source.sellerBalanceAfter : source.balanceAfter) === movement.balanceAfter, 'coinMovement.source');
    check(movement.balanceBefore === balances.get(movement.userId), 'coinMovement.balanceBefore');
    if (movement.sourceType === 'pack_opening' || purchase) {
      check(movement.type === 'debit' && movement.amount === source.price && integer(movement.amount, 1) &&
        movement.balanceBefore >= movement.amount && movement.balanceAfter === movement.balanceBefore - movement.amount, 'coinMovement.debit');
    } else {
      check(movement.type === 'credit' && movement.amount === (resale ? source.net : movement.sourceType === 'battle_reward' ? source.coins : source.amount) &&
        movement.balanceAfter === safeAdd(movement.balanceBefore, movement.amount), 'coinMovement.credit');
    }
    balances.set(movement.userId, movement.balanceAfter);
  }
  const sourceIds = Object.entries(sources).flatMap(([type, records]) => [...records.keys()].map(id => `${type}:${id}`));
  check(linked.size === sourceIds.length && sourceIds.every(id => linked.has(id)), 'coinMovement.complete');
  for (const user of users.values()) check(user.economy.coins === balances.get(user.id), 'coinMovement.userTotals');
}

export function validateEconomyTransition(before, after) {
  for (const name of ['economia', 'diarios']) {
    check(equal(before[name].records, after[name].records.slice(0, before[name].records.length)), `${name}.appendOnly`);
  }
  for (const claim of after.diarios.records.slice(before.diarios.records.length)) {
    check(claim.policyVersion === DAILY_POLICY_VERSION, 'daily.currentPolicy');
  }
}
