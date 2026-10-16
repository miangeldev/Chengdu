import { equal } from './equality.js';
import { requireGame } from '../utils/GameError.js';
import { ownershipAt } from '../game/units/ownership.js';
import { isOpenTrade, TRADE_MAX_OPEN, TRADE_MAX_UNITS, tradeExpiresAt } from '../game/trades/policy.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });

const integer = (number, minimum = 0) => Number.isSafeInteger(number) && number >= minimum;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const key = value => text(value) && value.trim() === value;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const ids = value => Array.isArray(value) && value.every(text) && new Set(value).size === value.length;
const TRADE_FIELDS = ['id', 'chatId', 'participants', 'offers', 'status', 'confirmations', 'reservations', 'operationKey', 'createdAt', 'expiresAt', 'updatedAt', 'closedAt', 'closeActionId'];
const ACTION_FIELDS = ['id', 'tradeId', 'userId', 'kind', 'operationKey', 'createdAt', 'before', 'after', 'movements', 'transfers'];
const exactFields = (record, fields) => record && Object.keys(record).length === fields.length && fields.every(field => Object.hasOwn(record, field));

function tradeMetadata(trade, users, units) {
  check(exactFields(trade, TRADE_FIELDS) && /^TRD-[a-f0-9-]{32,36}$/.test(trade.id) && key(trade.chatId) && key(trade.operationKey) &&
    ids(trade.participants) && trade.participants.length === 2 && trade.participants.every(id => users.has(id)) &&
    date(trade.createdAt) && date(trade.updatedAt) && trade.expiresAt === tradeExpiresAt(trade.createdAt) &&
    Date.parse(trade.updatedAt) >= Date.parse(trade.createdAt), 'trade.metadata');
  check(Array.isArray(trade.offers) && trade.offers.length === 2 && trade.offers.every((offer, index) =>
    exactFields(offer, ['userId', 'unitIds', 'coins']) && offer.userId === trade.participants[index] && ids(offer.unitIds) &&
    offer.unitIds.length <= TRADE_MAX_UNITS && offer.unitIds.every(id => units.has(id)) && integer(offer.coins)), 'trade.offers');
  const offeredIds = trade.offers.flatMap(offer => offer.unitIds);
  check(new Set(offeredIds).size === offeredIds.length, 'trade.uniqueAssets');
  check(ids(trade.confirmations) && trade.confirmations.every(id => trade.participants.includes(id)) &&
    Array.isArray(trade.reservations) && ['draft', 'locked', 'completed', 'cancelled', 'expired'].includes(trade.status), 'trade.status');
  for (const reservation of trade.reservations) {
    check(exactFields(reservation, ['unitId', 'userId', 'ownershipVersion', 'progress', 'battleStats']) && units.has(reservation.unitId) &&
      trade.offers.some(offer => offer.userId === reservation.userId && offer.unitIds.includes(reservation.unitId)) &&
      integer(reservation.ownershipVersion) && integer(reservation.progress?.level, 1) && integer(reservation.progress?.xp) &&
      ['wins', 'losses'].every(field => integer(reservation.battleStats?.[field])), 'trade.reservation');
  }
  check(new Set(trade.reservations.map(row => row.unitId)).size === trade.reservations.length, 'trade.uniqueReservations');
  if (trade.status === 'draft') check(trade.confirmations.length === 0 && trade.reservations.length === 0, 'trade.draft');
  if (trade.status === 'locked' || trade.status === 'completed') {
    check(trade.offers.some(offer => offer.coins > 0 || offer.unitIds.length > 0) &&
      equal(trade.reservations.map(row => row.unitId), offeredIds) &&
      trade.confirmations.length === (trade.status === 'locked' ? 1 : 2), 'trade.confirmations');
  }
  if (isOpenTrade(trade)) check(trade.closedAt === null && trade.closeActionId === null &&
    Date.parse(trade.updatedAt) < Date.parse(trade.expiresAt), 'trade.open');
  else {
    check(date(trade.closedAt) && trade.closedAt === trade.updatedAt && /^TA-[a-f0-9-]{32,36}$/.test(trade.closeActionId), 'trade.closed');
    check(trade.status === 'expired' ? Date.parse(trade.closedAt) >= Date.parse(trade.expiresAt) :
      Date.parse(trade.closedAt) < Date.parse(trade.expiresAt), 'trade.closeTime');
  }
}

function expectedMoney(action) {
  const before = action.before;
  if (!before) return [];
  if (action.kind === 'confirm' && before.status === 'draft') return before.offers.filter(offer => offer.coins > 0)
    .map(offer => ({ userId: offer.userId, amount: offer.coins, type: 'debit', sourceType: 'trade_escrow' }));
  if (action.kind === 'confirm' && before.status === 'locked') return before.offers.filter(offer => offer.coins > 0)
    .map(offer => ({ userId: before.participants.find(id => id !== offer.userId), amount: offer.coins, type: 'credit', sourceType: 'trade_settlement' }));
  if (['cancel', 'expire'].includes(action.kind) && before.status === 'locked') return before.offers.filter(offer => offer.coins > 0)
    .map(offer => ({ userId: offer.userId, amount: offer.coins, type: 'credit', sourceType: 'trade_refund' }));
  return [];
}

function verifyAction(action, users, units) {
  check(exactFields(action, ACTION_FIELDS) && /^TA-[a-f0-9-]{32,36}$/.test(action.id) && text(action.tradeId) && key(action.operationKey) &&
    date(action.createdAt) && ['create', 'offer', 'confirm', 'cancel', 'expire'].includes(action.kind) &&
    Array.isArray(action.movements) && Array.isArray(action.transfers), 'trade.actionMetadata');
  const before = action.before;
  const after = action.after;
  tradeMetadata(after, users, units);
  check(action.tradeId === after.id && action.createdAt === after.updatedAt, 'trade.actionTarget');
  if (action.kind === 'create') {
    check(before === null && action.userId === after.participants[0] && action.operationKey === after.operationKey &&
      after.createdAt === action.createdAt && equal(after.offers, after.participants.map(userId => ({ userId, unitIds: [], coins: 0 }))) &&
      after.status === 'draft', 'trade.create');
  } else {
    tradeMetadata(before, users, units);
    check(isOpenTrade(before) && before.id === after.id && Date.parse(action.createdAt) >= Date.parse(before.updatedAt), 'trade.actionBefore');
    const expected = { ...before, updatedAt: action.createdAt };
    if (action.kind === 'expire') {
      check(action.userId === null && action.operationKey === `trade-expire:${before.id}` &&
        Date.parse(action.createdAt) >= Date.parse(before.expiresAt), 'trade.expire');
      Object.assign(expected, { status: 'expired', closedAt: action.createdAt, closeActionId: action.id });
    } else {
      check(before.participants.includes(action.userId) && Date.parse(action.createdAt) < Date.parse(before.expiresAt), 'trade.actor');
      if (action.kind === 'offer') {
        check(before.status === 'draft', 'trade.offerFrozen');
        expected.offers = before.offers.map(offer => offer.userId === action.userId ? after.offers.find(next => next.userId === action.userId) : offer);
      } else if (action.kind === 'cancel') {
        Object.assign(expected, { status: 'cancelled', closedAt: action.createdAt, closeActionId: action.id });
      } else {
        check(!before.confirmations.includes(action.userId), 'trade.confirmOnce');
        expected.confirmations = [...before.confirmations, action.userId];
        if (before.status === 'draft') {
          Object.assign(expected, { status: 'locked', reservations: after.reservations });
        } else Object.assign(expected, { status: 'completed', closedAt: action.createdAt, closeActionId: action.id });
      }
    }
    check(equal(after, expected), 'trade.authorizedTransition');
  }
  const expected = expectedMoney(action);
  check(action.movements.length === expected.length, 'trade.moneyCount');
  for (let index = 0; index < expected.length; index++) {
    const movement = action.movements[index];
    const source = expected[index];
    check(exactFields(movement, ['userId', 'amount', 'type', 'sourceType', 'sourceId', 'balanceBefore', 'balanceAfter']) &&
      Object.entries(source).every(([field, value]) => movement[field] === value) &&
      movement.sourceId === `${action.id}:${source.userId}` && integer(movement.balanceBefore) && integer(movement.balanceAfter) &&
      movement.balanceAfter === movement.balanceBefore + (source.type === 'credit' ? source.amount : -source.amount), 'trade.moneyProof');
  }
  const transfers = action.kind === 'confirm' && before?.status === 'locked' ? before.reservations : [];
  check(action.transfers.length === transfers.length, 'trade.transferCount');
  for (let index = 0; index < transfers.length; index++) {
    const source = transfers[index];
    const transfer = action.transfers[index];
    check(exactFields(transfer, ['unitId', 'fromOwnerId', 'toOwnerId', 'fromOwnershipVersion', 'toOwnershipVersion', 'eventId']) &&
      transfer.unitId === source.unitId && transfer.fromOwnerId === source.userId &&
      transfer.toOwnerId === before.participants.find(id => id !== source.userId) &&
      transfer.fromOwnershipVersion === source.ownershipVersion && transfer.toOwnershipVersion === source.ownershipVersion + 1 &&
      integer(transfer.toOwnershipVersion, 1) && /^EVT-[a-f0-9-]{32,36}$/.test(transfer.eventId), 'trade.transferProof');
  }
}

export function validateTradeData(state) {
  if (!state.intercambios || !state.accionesintercambio) return;
  const users = new Map(state.usuarios.records.map(user => [user.id, user]));
  const units = new Map(state.unidades.records.map(unit => [unit.id, unit]));
  const trades = new Map(state.intercambios.records.map(trade => [trade.id, trade]));
  const latest = new Map();
  const keys = new Set();
  const actionIds = new Set();
  const locked = new Set();
  const coins = new Map(state.economia.records.map(movement => [movement.id, movement]));
  const backedMoney = new Set();
  const events = new Map(state.eventos.records.map(event => [event.id, event]));
  const backedTransfers = new Set();
  for (const action of state.accionesintercambio.records) {
    verifyAction(action, users, units);
    check(trades.has(action.tradeId) && !keys.has(action.operationKey) && !actionIds.has(action.id), 'trade.actionUnique');
    keys.add(action.operationKey);
    actionIds.add(action.id);
    check(equal(action.before, latest.get(action.tradeId) ?? null), 'trade.actionChain');
    latest.set(action.tradeId, action.after);
    if (action.kind === 'confirm' && action.before?.status === 'draft') {
      for (const reservation of action.after.reservations) {
        const unit = units.get(reservation.unitId);
        const acquisition = state.eventos.records.find(event => event.unitId === reservation.unitId &&
          (reservation.ownershipVersion === 0 ? event.type === 'unit_created' :
            event.type === 'unit_transferred' && event.ownershipVersion === reservation.ownershipVersion));
        check(acquisition && Date.parse(acquisition.createdAt) <= Date.parse(action.createdAt) &&
          ownershipAt(state, reservation.unitId, reservation.ownershipVersion) === reservation.userId &&
          reservation.progress.level <= unit.progress.level &&
          (reservation.progress.level !== unit.progress.level || reservation.progress.xp <= unit.progress.xp) &&
          ['wins', 'losses'].every(field => reservation.battleStats[field] <= unit.battleStats[field]), 'trade.historicalReservation');
      }
    }
    for (const movement of action.movements) {
      const id = `coin:${movement.sourceId}`;
      check(!backedMoney.has(id) && equal(coins.get(id), { id, userId: movement.userId, type: movement.type,
        sourceType: movement.sourceType, sourceId: movement.sourceId, amount: movement.amount,
        balanceBefore: movement.balanceBefore, balanceAfter: movement.balanceAfter, createdAt: action.createdAt }), 'trade.moneyReceipt');
      backedMoney.add(id);
    }
    for (const transfer of action.transfers) {
      const event = events.get(transfer.eventId);
      check(!backedTransfers.has(transfer.eventId) && event && event.type === 'unit_transferred' && event.reason === 'trade' &&
        event.unitId === transfer.unitId && event.fromOwnerId === transfer.fromOwnerId && event.toOwnerId === transfer.toOwnerId &&
        event.ownershipVersion === transfer.toOwnershipVersion && event.sourceId === action.tradeId &&
        event.operationKey === `transfer:${action.tradeId}:${transfer.unitId}` && event.createdAt === action.createdAt, 'trade.transferReceipt');
      backedTransfers.add(transfer.eventId);
    }
  }
  check(latest.size === trades.size, 'trade.completeHistory');
  const openCounts = new Map();
  const pairs = new Set();
  for (const trade of trades.values()) {
    tradeMetadata(trade, users, units);
    check(equal(latest.get(trade.id), trade), 'trade.current');
    for (const reservation of trade.reservations) check(ownershipAt(state, reservation.unitId, reservation.ownershipVersion) === reservation.userId,
      'trade.historicalOwner');
    if (isOpenTrade(trade)) {
      const pair = [...trade.participants].sort().join(':');
      check(!pairs.has(pair), 'trade.singlePair');
      pairs.add(pair);
      for (const id of trade.participants) {
        openCounts.set(id, (openCounts.get(id) ?? 0) + 1);
        check(openCounts.get(id) <= TRADE_MAX_OPEN, 'trade.openLimit');
      }
    }
    if (trade.status === 'locked') for (const reservation of trade.reservations) {
      const unit = units.get(reservation.unitId);
      check(!locked.has(unit.id) && unit.ownerId === reservation.userId && unit.ownershipVersion === reservation.ownershipVersion &&
        equal(unit.lock, { type: 'trade', referenceId: trade.id }) && equal(unit.progress, reservation.progress) &&
        equal(unit.battleStats, reservation.battleStats), 'trade.lockedAsset');
      locked.add(unit.id);
    }
  }
  for (const unit of units.values()) if (unit.lock?.type === 'trade') check(locked.has(unit.id), 'trade.lockReference');
  for (const movement of coins.values()) if (['trade_escrow', 'trade_settlement', 'trade_refund'].includes(movement.sourceType))
    check(backedMoney.has(movement.id), 'trade.unbackedMoney');
  for (const event of events.values()) if (event.reason === 'trade') check(backedTransfers.has(event.id), 'trade.unbackedTransfer');
}

function releasedInTransaction(before, after, unit, at) {
  if (unit.lock === null) return true;
  const collections = { market: 'mercado', battle: 'combates', trade: 'intercambios' };
  const collection = collections[unit.lock?.type];
  if (!collection) return false;
  const old = before[collection].records.find(row => row.id === unit.lock.referenceId);
  const next = after[collection].records.find(row => row.id === unit.lock.referenceId);
  return old && next?.status === 'expired' && Date.parse(old.expiresAt) <= Date.parse(at) &&
    (unit.lock.type === 'battle' ? next.finishedAt : next.closedAt) === at;
}

function validLaterLock(after, unit, at) {
  if (unit?.lock === null) return true;
  if (unit?.lock?.type === 'market') {
    const row = after.mercado.records.find(listing => listing.id === unit.lock.referenceId);
    return row?.status === 'active' && row.unitId === unit.id && row.createdAt === at;
  }
  if (unit?.lock?.type === 'battle') {
    const row = after.combates.records.find(battle => battle.id === unit.lock.referenceId);
    return row?.status === 'active' && row.acceptedAt === at;
  }
  if (unit?.lock?.type === 'trade') {
    const row = after.intercambios.records.find(trade => trade.id === unit.lock.referenceId);
    return row?.status === 'locked' && row.updatedAt === at && row.reservations.some(reservation => reservation.unitId === unit.id);
  }
  return false;
}

export function validateTradeTransition(before, after) {
  if (!before.intercambios || !after.intercambios) return;
  check(equal(before.accionesintercambio.records, after.accionesintercambio.records.slice(0, before.accionesintercambio.records.length)), 'trade.actionsAppendOnly');
  check(equal(before.intercambios.records.map(trade => trade.id), after.intercambios.records.slice(0, before.intercambios.records.length).map(trade => trade.id)), 'trade.appendOrder');
  const oldTrades = new Map(before.intercambios.records.map(trade => [trade.id, trade]));
  const oldUnits = new Map(before.unidades.records.map(unit => [unit.id, unit]));
  const nextUnits = new Map(after.unidades.records.map(unit => [unit.id, unit]));
  const oldUsers = new Map(before.usuarios.records.map(user => [user.id, user]));
  const actions = after.accionesintercambio.records.slice(before.accionesintercambio.records.length);
  const touched = new Set(actions.map(action => action.tradeId));
  for (const trade of after.intercambios.records) {
    if (!touched.has(trade.id)) check(equal(trade, oldTrades.get(trade.id)), 'trade.immutableWithoutAction');
  }
  const replay = new Map(oldTrades);
  const economics = new Map(before.usuarios.records.map(user => [user.id, user.economy.coins]));
  for (const action of actions) {
    const old = replay.get(action.tradeId);
    check(equal(action.before, old ?? null), 'trade.actionPreviousState');
    replay.set(action.tradeId, action.after);
    if (action.kind === 'offer') {
      const offer = action.after.offers.find(row => row.userId === action.userId);
      check(economics.get(action.userId) >= offer.coins, 'trade.offerBalance');
      for (const id of offer.unitIds) {
        const unit = oldUnits.get(id);
        check(unit?.ownerId === action.userId && releasedInTransaction(before, after, unit, action.createdAt), 'trade.offerOwnership');
      }
    }
    if (action.kind === 'confirm' && old?.status === 'draft') {
      for (const reservation of action.after.reservations) {
        const unit = oldUnits.get(reservation.unitId);
        const updated = nextUnits.get(reservation.unitId);
        check(unit && unit.ownerId === reservation.userId && unit.ownershipVersion === reservation.ownershipVersion &&
          releasedInTransaction(before, after, unit, action.createdAt) && Date.parse(action.createdAt) >= Date.parse(unit.updatedAt) &&
          equal(reservation.progress, unit.progress) && equal(reservation.battleStats, unit.battleStats) &&
          updated?.ownerId === unit.ownerId && updated.ownershipVersion === unit.ownershipVersion &&
          equal(updated.lock, { type: 'trade', referenceId: action.tradeId }) && updated.updatedAt === action.createdAt &&
          equal(updated.progress, unit.progress) && equal(updated.battleStats, unit.battleStats), 'trade.reserveSource');
        check(!before.combates.records.some(battle => battle.status === 'active' && Date.parse(battle.expiresAt) > Date.parse(action.createdAt) &&
          battle.players.some(player => player.userId === reservation.userId) && oldUsers.get(reservation.userId).team.includes(unit.id)), 'trade.teamBattleLock');
      }
    }
    if (['cancel', 'expire'].includes(action.kind) && old?.status === 'locked') {
      for (const reservation of old.reservations) {
        const oldUnit = oldUnits.get(reservation.unitId);
        const updated = nextUnits.get(reservation.unitId);
        check(oldUnit?.lock?.type === 'trade' && oldUnit.lock.referenceId === old.id && updated.ownerId === oldUnit.ownerId &&
          updated.ownershipVersion === oldUnit.ownershipVersion && equal(oldUnit.progress, updated.progress) &&
          equal(oldUnit.battleStats, updated.battleStats) && (updated.lock === null || action.kind === 'expire' && validLaterLock(after, updated, action.createdAt)), 'trade.refundSource');
      }
    }
    for (const movement of action.movements) {
      // The immutable economy ledger checks the complete global balance chain;
      // receipt source amounts and users are already checked against the offers.
      economics.set(movement.userId, movement.balanceAfter);
    }
  }
  for (const [id, trade] of replay) check(equal(after.intercambios.records.find(row => row.id === id), trade), 'trade.finalActionState');
}
