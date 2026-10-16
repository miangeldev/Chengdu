import { equal } from './equality.js';
import { validateEvolutionSnapshot } from './evolutionSnapshot.js';
import { effectiveUnitStats, evolvedStats, evolutionSnapshot, displayUnitCharacterName } from '../game/evolution/rules.js';
import { requireGame } from '../utils/GameError.js';
import { effectiveStats, safeAdd } from '../game/progression/rules.js';
import { MARKET_POLICY_VERSION, marketPolicy, marketExpiresAt, quoteMarket } from '../game/market/policy.js';
import { ownershipAt } from '../game/units/ownership.js';
import { battleUnits } from '../game/battle/advancedEngine.js';

const check = (value, field) => requireGame(value, 'DATABASE_CORRUPT', { field });

const integer = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const operationKey = value => text(value) && value.trim() === value;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));

function snapshot(unit, character) {
  return { id: unit.id, characterId: unit.characterId, characterRevision: unit.characterRevision,
    characterName: displayUnitCharacterName(unit, character), evolution: evolutionSnapshot(unit), rarity: character.rarity, role: character.role, serial: unit.serial,
    ownershipVersion: unit.ownershipVersion, level: unit.progress.level, progress: structuredClone(unit.progress),
    traits: unit.traits, variant: unit.variant, traitVersion: unit.traitVersion,
    stats: effectiveUnitStats(unit) };
}

function sameSnapshot(actual, expected) {
  return actual && Object.keys(actual).length === Object.keys(expected).length &&
    Object.entries(expected).every(([key, value]) => equal(actual[key], value));
}

function expiredLock(before, after, unit, at) {
  if (unit.lock === null) return true;
  const market = unit.lock?.type === 'market', trade = unit.lock?.type === 'trade';
  const name = market ? 'mercado' : trade ? 'intercambios' : 'combates';
  const old = before[name].records.find(r => r.id === unit.lock?.referenceId);
  const closed = after[name].records.find(r => r.id === old?.id);
  return old?.status === (trade ? 'locked' : 'active') && closed?.status === 'expired' && Date.parse(old.expiresAt) <= Date.parse(at) &&
    (market || trade ? closed.closedAt : closed.finishedAt) === at;
}

function validNextLock(after, unit, closedAt) {
  if (unit?.lock === null) return true;
  if (unit?.lock?.type === 'market') {
    const next = after.mercado.records.find(l => l.id === unit.lock.referenceId);
    return next?.status === 'active' && next.unitId === unit.id && next.createdAt === closedAt;
  }
  if (unit?.lock?.type === 'trade') {
    const next = after.intercambios.records.find(t => t.id === unit.lock.referenceId);
    return next?.status === 'locked' && next.updatedAt === closedAt && next.reservations.some(r => r.unitId === unit.id);
  }
  if (unit?.lock?.type === 'battle') {
    const next = after.combates.records.find(b => b.id === unit.lock.referenceId);
    return next?.status === 'active' && next.acceptedAt === closedAt && next.players.some(p => battleUnits(p).some(snapshot => snapshot.id === unit.id));
  }
  return false;
}

export function validateMarketData(state) {
  const users = new Map(state.usuarios.records.map(u => [u.id, u]));
  const units = new Map(state.unidades.records.map(u => [u.id, u]));
  const listings = new Map(state.mercado.records.map(l => [l.id, l]));
  const sales = new Map(state.ventas.records.map(s => [s.id, s]));
  const keys = new Set();
  const activeUnits = new Set();
  const byListing = new Map();
  const uniqueKey = key => {
    check(operationKey(key) && !keys.has(key), 'market.operationKey');
    keys.add(key);
  };
  for (const listing of listings.values()) {
    check(/^LIST-[a-f0-9-]{32,36}$/.test(listing.id) && users.has(listing.sellerId) && units.has(listing.unitId) &&
      integer(listing.ownershipVersion) && integer(listing.policyVersion, 1) && date(listing.createdAt) && date(listing.updatedAt), 'listing.metadata');
    uniqueKey(listing.operationKey);
    const policy = marketPolicy(listing.policyVersion);
    check(integer(listing.price, 1) && listing.price >= policy.minPrice && listing.price <= policy.maxPrice &&
      listing.expiresAt === marketExpiresAt(listing.createdAt, listing.policyVersion), 'listing.policy');
    check(['active', 'sold', 'cancelled', 'expired'].includes(listing.status), 'listing.status');
    const unit = units.get(listing.unitId);
    const s = listing.unitSnapshot;
    validateEvolutionSnapshot(state, s, listing.createdAt);
    check(s && s.id === unit.id && s.characterId === unit.characterId && s.characterRevision === unit.characterRevision &&
      s.serial === unit.serial && s.ownershipVersion === listing.ownershipVersion && text(s.characterName) && text(s.role) &&
      ['common', 'rare', 'epic', 'legendary', 'mythic'].includes(s.rarity) && integer(s.level, 1) && s.level === s.progress?.level &&
      integer(s.progress.xp) && s.level <= unit.progress.level && (s.level !== unit.progress.level || s.progress.xp <= unit.progress.xp) &&
      equal(s.traits, unit.traits) && s.variant === unit.variant && s.traitVersion === unit.traitVersion &&
      equal(s.stats, evolvedStats(effectiveStats(unit.initialStats, s.level, unit.statGrowthVersion, unit.traits, unit.traitVersion, unit.combatBaseStats), s.evolution, unit.characterId, s.level)), 'listing.snapshot');
    check(ownershipAt(state, listing.unitId, listing.ownershipVersion) === listing.sellerId, 'listing.historicalOwner');
    const acquisition = state.eventos.records.find(event => event.unitId === listing.unitId &&
      (listing.ownershipVersion === 0 ? event.type === 'unit_created' :
        event.type === 'unit_transferred' && event.ownershipVersion === listing.ownershipVersion));
    check(acquisition && Date.parse(listing.createdAt) >= Date.parse(acquisition.createdAt), 'listing.acquiredBeforeCreation');
    if (listing.status === 'active') {
      check(!activeUnits.has(unit.id) && unit.ownerId === listing.sellerId && unit.ownershipVersion === listing.ownershipVersion &&
        equal(unit.lock, { type: 'market', referenceId: listing.id }) && !users.get(listing.sellerId).team.includes(unit.id) &&
        equal(s.progress, unit.progress) && listing.updatedAt === listing.createdAt && listing.closedAt === null &&
        listing.closeOperationKey === null && listing.saleId === null, 'listing.active');
      activeUnits.add(unit.id);
    } else {
      check(date(listing.closedAt) && listing.updatedAt === listing.closedAt && Date.parse(listing.closedAt) >= Date.parse(listing.createdAt), 'listing.closed');
      if (listing.status === 'sold') check(text(listing.saleId) && operationKey(listing.closeOperationKey), 'listing.sold');
      else {
        check(listing.saleId === null, 'listing.noSale');
        if (listing.status === 'expired') check(listing.closeOperationKey === null && Date.parse(listing.closedAt) >= Date.parse(listing.expiresAt), 'listing.expired');
        else {
          uniqueKey(listing.closeOperationKey);
          check(Date.parse(listing.closedAt) < Date.parse(listing.expiresAt), 'listing.cancelled');
        }
      }
    }
  }
  for (const sale of sales.values()) {
    check(/^SALE-[a-f0-9-]{32,36}$/.test(sale.id) && date(sale.createdAt) && users.has(sale.sellerId) && users.has(sale.buyerId) &&
      sale.sellerId !== sale.buyerId && integer(sale.policyVersion, 1) && integer(sale.fromOwnershipVersion) &&
      sale.toOwnershipVersion === safeAdd(sale.fromOwnershipVersion, 1), 'sale.metadata');
    uniqueKey(sale.operationKey);
    const listing = listings.get(sale.listingId);
    check(listing && !byListing.has(listing.id) && listing.status === 'sold' && listing.saleId === sale.id &&
      listing.unitId === sale.unitId && listing.sellerId === sale.sellerId && listing.ownershipVersion === sale.fromOwnershipVersion &&
      listing.price === sale.price && listing.policyVersion === sale.policyVersion && listing.closedAt === sale.createdAt &&
      listing.closeOperationKey === sale.operationKey && Date.parse(sale.createdAt) < Date.parse(listing.expiresAt), 'sale.listing');
    byListing.set(listing.id, sale);
    const quote = quoteMarket(sale.price, sale.policyVersion);
    check(sale.fee === quote.fee && sale.net === quote.net && integer(sale.buyerBalanceBefore) &&
      sale.buyerBalanceBefore >= sale.price && sale.buyerBalanceAfter === sale.buyerBalanceBefore - sale.price &&
      integer(sale.sellerBalanceBefore) && sale.sellerBalanceAfter === safeAdd(sale.sellerBalanceBefore, sale.net), 'sale.amounts');
    check(text(sale.transferEventId) && state.eventos.records.some(e => e.id === sale.transferEventId && e.type === 'unit_transferred' && e.unitId === sale.unitId), 'sale.transferEvent');
  }
  for (const listing of listings.values()) check((listing.status === 'sold') === byListing.has(listing.id), 'listing.saleComplete');
  for (const unit of units.values()) if (unit.lock?.type === 'market') {
    check(activeUnits.has(unit.id) && listings.get(unit.lock.referenceId)?.unitId === unit.id, 'market.lockReference');
  }
}

export function validateMarketTransition(before, after) {
  check(equal(before.mercado.records.map(listing => listing.id),
    after.mercado.records.slice(0, before.mercado.records.length).map(listing => listing.id)), 'listings.appendOrder');
  check(equal(before.ventas.records, after.ventas.records.slice(0, before.ventas.records.length)), 'sales.appendOnly');
  const previous = new Map(before.mercado.records.map(l => [l.id, l]));
  for (const listing of after.mercado.records) {
    const old = previous.get(listing.id);
    if (!old) {
      const unit = before.unidades.records.find(u => u.id === listing.unitId);
      const character = before.personajes.records.find(c => c.id === unit?.characterId);
      check(unit && character && expiredLock(before, after, unit, listing.createdAt) && unit.ownerId === listing.sellerId && listing.ownershipVersion === unit.ownershipVersion &&
        Date.parse(listing.createdAt) >= Date.parse(unit.updatedAt) && listing.status === 'active' &&
        listing.policyVersion === MARKET_POLICY_VERSION && sameSnapshot(listing.unitSnapshot, snapshot(unit, character)), 'listing.newSource');
      continue;
    }
    if (old.status !== 'active' || listing.status === 'active') { check(equal(old, listing), 'listing.immutable'); continue; }
    const { status, updatedAt, closedAt, closeOperationKey, saleId, ...source } = old;
    const { status: newStatus, updatedAt: newUpdatedAt, closedAt: newClosedAt, closeOperationKey: newCloseKey, saleId: newSaleId, ...newSource } = listing;
    check(equal(source, newSource) && ['sold', 'cancelled', 'expired'].includes(listing.status), 'listing.closeTransition');
    const unit = after.unidades.records.find(u => u.id === listing.unitId);
    check(unit?.lock === null || (listing.status === 'expired' && validNextLock(after, unit, listing.closedAt)), 'listing.closeUnlock');
  }
  for (const sale of after.ventas.records.slice(before.ventas.records.length)) {
    const listing = previous.get(sale.listingId);
    const unit = before.unidades.records.find(u => u.id === sale.unitId);
    check(listing?.status === 'active' && unit && unit.ownerId === sale.sellerId && unit.ownershipVersion === sale.fromOwnershipVersion &&
      equal(unit.lock, { type: 'market', referenceId: listing.id }), 'sale.newSource');
  }
}
