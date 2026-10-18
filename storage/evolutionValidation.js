import { equal } from './equality.js';
import { expiredStoredLock } from './lockProof.js';
import { requireGame } from '../utils/GameError.js';
import { effectiveUnitStats, evolvedStats, evolutionPolicy, EVOLUTION_POLICY_VERSION,
  formForCharacter, validEvolutionShape } from '../game/evolution/rules.js';
import { effectiveStats } from '../game/progression/rules.js';
import { ownershipAt } from '../game/units/ownership.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });

const integer = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));

export function validateEvolutionData(state) {
  const units = new Map(state.unidades.records.map(unit => [unit.id, unit]));
  const seenUnits = new Set(), keys = new Set(), seenSpends = new Set();
  for (const evolution of state.evoluciones.records) {
    const unit = units.get(evolution.unitId);
    const form = formForCharacter(evolution.characterId);
    const policy = evolutionPolicy(evolution.policyVersion);
    check(/^EVO-[a-f0-9-]{36}$/.test(evolution.id) && unit && form && evolution.policyVersion === policy.version &&
      unit.characterId === evolution.characterId && state.usuarios.records.some(user => user.id === evolution.userId) &&
      integer(evolution.ownershipVersion) && evolution.ownershipVersion <= unit.ownershipVersion &&
      ownershipAt(state, unit.id, evolution.ownershipVersion) === evolution.userId && date(evolution.createdAt) &&
      typeof evolution.operationKey === 'string' && evolution.operationKey.length > 0 && evolution.operationKey.length <= 200 &&
      evolution.operationKey.trim() === evolution.operationKey && !keys.has(evolution.operationKey) && !seenUnits.has(unit.id) &&
      integer(evolution.level, policy.minimumLevel) && evolution.level <= unit.progress.level &&
      evolution.coins === policy.coins && integer(evolution.balanceBefore, evolution.coins) &&
      evolution.balanceAfter === evolution.balanceBefore - evolution.coins && evolution.before === null &&
      validEvolutionShape(evolution.after, unit.characterId) && evolution.after?.version === policy.version &&
      evolution.after?.receiptId === evolution.id && evolution.after.evolvedAt === evolution.createdAt &&
      equal(unit.evolution, evolution.after), 'evolution.receipt');
    keys.add(evolution.operationKey); seenUnits.add(unit.id);
    check(!seenSpends.has(evolution.craftingActionId), 'evolution.uniqueSpend');
    seenSpends.add(evolution.craftingActionId);
    const spend = state.artesania.records.find(action => action.id === evolution.craftingActionId);
    check(spend?.kind === 'evolution_spend' && spend.userId === evolution.userId && spend.operationKey === evolution.operationKey &&
      spend.createdAt === evolution.createdAt, 'evolution.sealReceipt');
    const beforeStats = effectiveStats(unit.initialStats, evolution.level, unit.statGrowthVersion, unit.traits, unit.traitVersion ?? 0, unit.combatBaseStats);
    check(equal(evolution.statsBefore, beforeStats) && equal(evolution.statsAfter, evolvedStats(beforeStats, evolution.after, unit.characterId, evolution.level)), 'evolution.statsProof');
  }
  for (const unit of units.values()) {
    check(validEvolutionShape(unit.evolution, unit.characterId) && Boolean(unit.evolution) === seenUnits.has(unit.id), 'evolution.unitProof');
    effectiveUnitStats(unit);
  }
}

export function validateEvolutionTransition(before, after, context = {}) {
  check(equal(before.evoluciones.records, after.evoluciones.records.slice(0, before.evoluciones.records.length)), 'evolution.appendOnly');
  const newReceipts = after.evoluciones.records.slice(before.evoluciones.records.length);
  for (const receipt of newReceipts) {
    check(receipt.policyVersion === EVOLUTION_POLICY_VERSION, 'evolution.currentPolicy');
    const policy = evolutionPolicy(receipt.policyVersion);
    const unit = before.unidades.records.find(row => row.id === receipt.unitId);
    check(unit && unit.ownerId === receipt.userId && unit.ownershipVersion === receipt.ownershipVersion && !unit.evolution && expiredStoredLock(before, after, unit, receipt.createdAt) &&
      unit.progress.level >= policy.minimumLevel && receipt.level === unit.progress.level && receipt.characterId === unit.characterId &&
      equal(receipt.statsBefore, effectiveUnitStats(unit)), 'evolution.beforeAuthority');
    const user = before.usuarios.records.find(row => row.id === receipt.userId);
    check(user && Date.parse(receipt.createdAt) >= Date.parse(user.updatedAt) && Date.parse(receipt.createdAt) >= Date.parse(unit.updatedAt) &&
      (!context.now || Date.parse(receipt.createdAt) <= Date.parse(context.now)), 'evolution.trustedClock');
    const next = after.unidades.records.find(row => row.id === unit.id);
    check(next.ownerId === unit.ownerId && next.ownershipVersion === unit.ownershipVersion && equal(next.progress, unit.progress) &&
      next.lock === null && next.updatedAt === receipt.createdAt, 'evolution.preservedUnit');
  }
  for (const unit of before.unidades.records) {
    const next = after.unidades.records.find(row => row.id === unit.id);
    if (!equal(unit.evolution, next?.evolution)) check(!unit.evolution &&
      newReceipts.some(receipt => receipt.unitId === unit.id && equal(receipt.after, next.evolution)), 'evolution.authorizedMutation');
  }
  for (const unit of after.unidades.records.filter(row => !before.unidades.records.some(previous => previous.id === row.id))) {
    check(!unit.evolution, 'evolution.bornUnevolved');
  }
}
