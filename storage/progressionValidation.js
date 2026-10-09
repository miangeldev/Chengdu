import { requireGame } from '../utils/GameError.js';
import { effectiveStats, grantXp, safeAdd } from '../game/progression/rules.js';
import { rewardAmounts, rewardDecision, rewardSummary } from '../game/rewards/battlePolicy.js';

const check = (value, field) => requireGame(value, 'DATABASE_CORRUPT', { field });
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const integer = value => Number.isSafeInteger(value) && value >= 0;

export function validateProgressionData(state, schemaVersion = 5) {
  const users = new Map(state.usuarios.records.map(u => [u.id, u]));
  const units = new Map(state.unidades.records.map(u => [u.id, u]));
  const battles = new Map(state.combates.records.map(b => [b.id, b]));
  const coinMovements = schemaVersion >= 4 ? new Map(state.economia.records
    .filter(m => m.sourceType === 'battle_reward').map(m => [m.sourceId, m])) : null;
  const balances = new Map();
  const userProgress = new Map();
  const unitProgress = new Map();
  for (const baseline of state.estado.records.filter(r => r.kind === 'progressionBaseline')) {
    check(['user', 'unit'].includes(baseline.entityType) && baseline.id === `progression:${baseline.entityId}`, 'progression.baseline');
    const entities = baseline.entityType === 'user' ? users : units;
    const progress = baseline.entityType === 'user' ? userProgress : unitProgress;
    check(entities.has(baseline.entityId) && !progress.has(baseline.entityId) &&
      Number.isSafeInteger(baseline.progress?.level) && baseline.progress.level >= 1 && integer(baseline.progress.xp), 'progression.baselineReference');
    progress.set(baseline.entityId, baseline.progress);
    if (baseline.entityType === 'user') {
      check(integer(baseline.coins), 'progression.openingBalance');
      balances.set(baseline.entityId, baseline.coins);
    }
  }
  check(userProgress.size === users.size && unitProgress.size === units.size, 'progression.baselineComplete');
  for (const unit of units.values()) {
    check(unit.statGrowthVersion === (schemaVersion >= 5 ? 2 : 1), 'progression.statVersion');
    effectiveStats(unit.initialStats, unit.progress.level, unit.statGrowthVersion, unit.traits, unit.traitVersion ?? 0, unit.combatBaseStats ?? null);
  }

  const byBattle = new Map();
  const seenRewarded = [];
  for (const reward of state.recompensas.records) {
    const battle = battles.get(reward.battleId);
    const player = battle?.players.find(p => p.userId === reward.userId);
    check(battle && battle.rewardVersion === 1 && battle.acceptedAt !== null && !['pending', 'active'].includes(battle.status) &&
      player?.unit?.id === reward.unitId && reward.id === `reward:${battle.id}:${reward.userId}` && reward.version === 1 && reward.createdAt === battle.finishedAt, 'reward.references');
    let entries = byBattle.get(battle.id);
    if (!entries) {
      entries = [];
      byBattle.set(battle.id, entries);
      check(reward.reason === rewardDecision(battle, seenRewarded), 'reward.eligibility');
      if (reward.reason === 'rewarded') seenRewarded.push(battle);
    }
    check(!entries.some(r => r.userId === reward.userId) && reward.reason === (entries[0]?.reason ?? reward.reason), 'reward.uniquePlayer');
    const amounts = rewardAmounts(battle, reward.userId, reward.reason);
    check(['coins', 'userXp', 'unitXp'].every(key => reward[key] === amounts[key]), 'reward.amounts');
    check(integer(reward.balanceBefore) && reward.balanceAfter === safeAdd(reward.balanceBefore, reward.coins) &&
      (schemaVersion >= 4 || reward.balanceBefore === balances.get(reward.userId)), 'reward.balance');
    if (schemaVersion >= 4) {
      const movement = coinMovements.get(reward.id);
      check(movement && movement.userId === reward.userId && movement.amount === reward.coins &&
        movement.balanceBefore === reward.balanceBefore && movement.balanceAfter === reward.balanceAfter &&
        movement.createdAt === reward.createdAt, 'reward.coinMovement');
    }
    check(equal(reward.userProgressBefore, userProgress.get(reward.userId)) &&
      equal(reward.userProgressAfter, grantXp(reward.userProgressBefore, reward.userXp, 'user')), 'reward.userProgress');
    check(equal(reward.unitProgressBefore, unitProgress.get(reward.unitId)) &&
      equal(reward.unitProgressAfter, grantXp(reward.unitProgressBefore, reward.unitXp, 'unit')), 'reward.unitProgress');
    balances.set(reward.userId, reward.balanceAfter);
    userProgress.set(reward.userId, reward.userProgressAfter);
    unitProgress.set(reward.unitId, reward.unitProgressAfter);
    entries.push(reward);
  }
  for (const battle of battles.values()) {
    check([0, 1].includes(battle.rewardVersion), 'reward.battleVersion');
    check(battle.rewardVersion !== 0 || !['pending', 'active'].includes(battle.status), 'reward.legacyClosed');
    const entries = byBattle.get(battle.id) ?? [];
    const settled = battle.rewardVersion === 1 && battle.acceptedAt !== null && !['pending', 'active'].includes(battle.status);
    if (!settled) check(battle.settlement === null && entries.length === 0, 'reward.noSettlement');
    else check(entries.length === 2 && equal(battle.settlement, {
      version: 1, reason: entries[0].reason, createdAt: battle.finishedAt,
      rewards: battle.players.map(p => rewardSummary(entries.find(r => r.userId === p.userId)))
    }), 'reward.settlement');
  }
  for (const user of users.values()) check((schemaVersion >= 4 || user.economy.coins === balances.get(user.id)) && equal(user.progress, userProgress.get(user.id)), 'reward.userTotals');
  for (const unit of units.values()) check(equal(unit.progress, unitProgress.get(unit.id)), 'reward.unitTotals');
}

export function validateProgressionTransition(before, after) {
  check(equal(before.recompensas.records, after.recompensas.records.slice(0, before.recompensas.records.length)), 'reward.appendOnly');
  const previousBattle = new Map(before.combates.records.map(b => [b.id, b]));
  for (const reward of after.recompensas.records.slice(before.recompensas.records.length)) {
    check(previousBattle.get(reward.battleId)?.status === 'active', 'reward.closingBattle');
  }
  for (const name of ['usuarios', 'unidades']) {
    const previousIds = new Set(before[name].records.map(r => r.id));
    for (const entity of after[name].records.filter(r => !previousIds.has(r.id))) {
      check(equal(entity.progress, { level: 1, xp: 0 }) && (name !== 'usuarios' || entity.economy.coins === 0), 'progression.newEntity');
    }
  }
}
