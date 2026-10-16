import { equal } from './equality.js';
import { requireGame } from '../utils/GameError.js';

const check = (value, field) => requireGame(value, 'DATABASE_CORRUPT', { field });

const integer = value => Number.isSafeInteger(value) && value >= 0;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));

export function validateOwnershipData(state, schemaVersion = 7) {
  if (schemaVersion < 7) return;
  const units = new Map(state.unidades.records.map(unit => [unit.id, unit]));
  const users = new Set(state.usuarios.records.map(user => user.id));
  const sales = new Map(state.ventas.records.map(sale => [sale.id, sale]));
  const trades = new Map((schemaVersion >= 11 ? state.intercambios?.records ?? [] : []).map(trade => [trade.id, trade]));
  const tradeActions = new Map((schemaVersion >= 11 ? state.accionesintercambio?.records ?? [] : []).map(action => [action.id, action]));
  const chains = new Map();
  const operationKeys = new Set();
  for (const event of state.eventos.records) {
    const unit = units.get(event.unitId);
    check(unit && text(event.operationKey) && !operationKeys.has(event.operationKey) && date(event.createdAt), 'ownership.eventMetadata');
    operationKeys.add(event.operationKey);
    if (event.type === 'unit_created') {
      check(!chains.has(unit.id) && event.fromOwnerId === null && users.has(event.toOwnerId) &&
        event.reason === unit.origin.type && event.createdAt === unit.createdAt &&
        (event.ownershipVersion === undefined || event.ownershipVersion === 0), 'ownership.mint');
      chains.set(unit.id, { ownerId: event.toOwnerId, version: 0 });
      continue;
    }
    const previous = chains.get(unit.id);
    const sale = sales.get(event.sourceId);
    check(event.type === 'unit_transferred' && /^EVT-[a-f0-9-]{32,36}$/.test(event.id) && previous &&
      integer(event.ownershipVersion) && event.ownershipVersion === previous.version + 1 &&
      event.fromOwnerId === previous.ownerId && users.has(event.toOwnerId) && event.toOwnerId !== previous.ownerId &&
      (event.reason === 'market' ? event.operationKey === `transfer:${event.sourceId}` :
        event.reason === 'trade' && event.operationKey === `transfer:${event.sourceId}:${event.unitId}`), 'ownership.transferChain');
    if (event.reason === 'market') {
      check(sale && sale.transferEventId === event.id && sale.unitId === unit.id && sale.sellerId === event.fromOwnerId &&
        sale.buyerId === event.toOwnerId && sale.fromOwnershipVersion === previous.version &&
        sale.toOwnershipVersion === event.ownershipVersion && sale.createdAt === event.createdAt, 'ownership.saleSource');
    } else {
      const trade = trades.get(event.sourceId);
      const action = tradeActions.get(trade?.closeActionId);
      const source = action?.transfers.find(transfer => transfer.eventId === event.id);
      check(trade?.status === 'completed' && action?.kind === 'confirm' && action.after.status === 'completed' &&
        source?.unitId === unit.id && source.fromOwnerId === event.fromOwnerId && source.toOwnerId === event.toOwnerId &&
        source.fromOwnershipVersion === previous.version && source.toOwnershipVersion === event.ownershipVersion &&
        action.createdAt === event.createdAt, 'ownership.tradeSource');
    }
    chains.set(unit.id, { ownerId: event.toOwnerId, version: event.ownershipVersion });
  }
  check(chains.size === units.size, 'ownership.complete');
  for (const unit of units.values()) {
    const current = chains.get(unit.id);
    check(integer(unit.ownershipVersion) && current.ownerId === unit.ownerId && current.version === unit.ownershipVersion, 'ownership.current');
  }
}

export function validateOwnershipTransition(before, after) {
  check(equal(before.eventos.records, after.eventos.records.slice(0, before.eventos.records.length)), 'ownership.eventsAppendOnly');
  const oldUnits = new Map(before.unidades.records.map(unit => [unit.id, unit]));
  const nextUnits = new Map(after.unidades.records.map(unit => [unit.id, unit]));
  const previousSales = new Set(before.ventas.records.map(sale => sale.id));
  const previousTradeActions = new Set((before.accionesintercambio?.records ?? []).map(action => action.id));
  const transfers = new Map();
  for (const event of after.eventos.records.slice(before.eventos.records.length)) {
    if (event.type === 'unit_created') {
      check(!oldUnits.has(event.unitId) && nextUnits.get(event.unitId)?.ownershipVersion === 0, 'ownership.newMint');
      continue;
    }
    const previous = oldUnits.get(event.unitId);
    const updated = nextUnits.get(event.unitId);
    const marketSource = event.reason === 'market' && previous?.lock?.type === 'market' && !previousSales.has(event.sourceId) &&
      after.ventas.records.some(sale => sale.id === event.sourceId);
    const trade = (after.intercambios?.records ?? []).find(row => row.id === event.sourceId);
    const tradeSource = event.reason === 'trade' && previous?.lock?.type === 'trade' && previous.lock.referenceId === event.sourceId &&
      trade?.status === 'completed' && !previousTradeActions.has(trade.closeActionId);
    check(event.type === 'unit_transferred' && previous && updated && !transfers.has(event.unitId) &&
      updated.lock === null && (marketSource || tradeSource), 'ownership.newTransfer');
    check(event.fromOwnerId === previous.ownerId && event.toOwnerId === updated.ownerId &&
      event.ownershipVersion === previous.ownershipVersion + 1 && updated.ownershipVersion === event.ownershipVersion &&
      updated.updatedAt === event.createdAt, 'ownership.transferTransition');
    check(equal(previous.progress, updated.progress) && equal(previous.battleStats, updated.battleStats), 'ownership.transferProgress');
    check(!after.usuarios.records.find(user => user.id === previous.ownerId).team.includes(previous.id), 'ownership.previousTeam');
    transfers.set(previous.id, event);
  }
  for (const previous of oldUnits.values()) {
    const updated = nextUnits.get(previous.id);
    check(updated && (transfers.has(previous.id) || (updated.ownerId === previous.ownerId && updated.ownershipVersion === previous.ownershipVersion)), 'ownership.immutableWithoutTransfer');
  }
  for (const unit of nextUnits.values()) if (!oldUnits.has(unit.id)) check(unit.ownershipVersion === 0, 'ownership.newVersion');
}
