import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { transferUnitInTransaction } from '../game/units/ownership.js';
import { readRecords, register, setup } from './helpers.js';

const chatId = 'trade-storage@g.us';
const now = '2026-10-13T10:00:00.000Z';
const rawState = directory => Object.fromEntries(COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

async function offered(t) {
  const c = setup(t, { clock: () => now });
  const first = await register(c.game);
  const second = await register(c.game, 'Lukas', '521111111111');
  const unit = (await c.game.starter.claimStarter({ userId: first.id, choice: 'panda' })).unit;
  await c.game.economy.claimDaily({ userId: first.id, operationKey: 'fund' });
  const trade = (await c.game.trades.create({ userId: first.id, opponentId: second.id, chatId, operationKey: 'create' })).trade;
  await c.game.trades.setOffer({ userId: first.id, chatId, code: trade.code, unitIds: [unit.id], coins: 50, operationKey: 'offer' });
  return { ...c, first, second, unit, trade };
}

test('persisted trade actions prove escrow, refunds and ownership, rejecting tampered ledger, offer, actor and source', async t => {
  const c = await offered(t);
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: c.trade.code, operationKey: 'lock' });
  await c.game.trades.confirm({ userId: c.second.id, chatId, code: c.trade.code, operationKey: 'complete' });
  const original = rawState(c.directory);
  const mutations = [
    state => { state.intercambios.records[0].offers[0].coins++; },
    state => { state.accionesintercambio.records[2].movements[0].amount++; },
    state => { state.accionesintercambio.records[3].movements[0].userId = c.first.id; },
    state => { state.accionesintercambio.records[3].transfers[0].fromOwnershipVersion++; },
    state => { state.accionesintercambio.records[3].transfers[0].eventId = 'EVT-missing'; },
    state => { state.accionesintercambio.records[2].userId = 'USR-missing'; },
    state => { state.accionesintercambio.records[3].operationKey = 'lock'; },
    state => { state.accionesintercambio.records[1].after.offers[1].coins = 1; },
    state => { state.accionesintercambio.records[2].after.reservations[0].progress.xp++; },
    state => { state.accionesintercambio.records.pop(); },
    state => { state.eventos.records.find(event => event.reason === 'trade').sourceId = 'TRD-missing'; },
    state => { state.eventos.records.find(event => event.reason === 'trade').reason = 'market'; },
    state => { state.economia.records.find(move => move.sourceType === 'trade_settlement').sourceId = 'unknown'; },
    state => { state.economia.records.find(move => move.sourceType === 'trade_escrow').sourceType = 'trade_refund'; },
    state => { state.economia.records.splice(state.economia.records.findIndex(move => move.sourceType === 'trade_escrow'), 1); },
    state => { state.unidades.records[0].ownershipVersion++; },
    state => { state.intercambios.records[0].status = 'locked'; },
    state => { state.intercambios.records[0].expiresAt = state.intercambios.records[0].createdAt; }
  ];
  for (const mutation of mutations) {
    const state = structuredClone(original);
    mutation(state);
    assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
  }
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('transactions cannot edit old actions, bypass reservation, forge a refund or transfer outside a complete action', async t => {
  const c = await offered(t);
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: c.trade.code, operationKey: 'lock' });
  const original = rawState(c.directory);
  const attacks = [
    async repos => {
      const action = (await repos.tradeActions.all())[0];
      await repos.tradeActions.replace({ ...action, operationKey: 'edited' });
    },
    async repos => {
      const trade = await repos.trades.get(c.trade.id);
      await repos.trades.replace({ ...trade, offers: [{ ...trade.offers[0], coins: 500 }, trade.offers[1]] });
    },
    async repos => {
      const unit = await repos.units.get(c.unit.id);
      await repos.units.replace({ ...unit, lock: null });
    },
    async repos => {
      const unit = await repos.units.get(c.unit.id);
      await repos.units.replace({ ...unit, ownerId: c.second.id, ownershipVersion: 1, lock: null });
    },
    async repos => {
      await transferUnitInTransaction(repos, { unitId: c.unit.id, fromOwnerId: c.first.id, toOwnerId: c.second.id,
        sourceId: c.trade.id, reason: 'trade' }, now);
    },
    async repos => {
      const user = await repos.users.get(c.first.id);
      await repos.users.replace({ ...user, economy: { ...user.economy, coins: 100 } });
      await repos.economy.insert({ id: 'coin:forged-refund', userId: user.id, type: 'credit', sourceType: 'trade_refund',
        sourceId: 'forged-refund', amount: 50, balanceBefore: 50, balanceAfter: 100, createdAt: now });
    }
  ];
  for (const attack of attacks) {
    await assert.rejects(c.storage.withTransaction(attack), { code: 'DATABASE_CORRUPT' });
    assert.deepEqual(rawState(c.directory), original);
  }
});

test('a traded unit can be sold again while previous trade receipts remain historical and unchanged', async t => {
  const c = await offered(t);
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: c.trade.code, operationKey: 'lock' });
  await c.game.trades.confirm({ userId: c.second.id, chatId, code: c.trade.code, operationKey: 'complete' });
  const actions = readRecords(c.directory, 'accionesintercambio');
  const listing = (await c.game.market.createListing({ sellerId: c.second.id, unitId: c.unit.id, price: 20, operationKey: 'resale' })).listing;
  await c.game.market.buyListing({ buyerId: c.first.id, listingId: listing.code, operationKey: 'buyback' });
  assert.equal((await c.game.units.getUnit(c.unit.id)).ownershipVersion, 2);
  assert.deepEqual(readRecords(c.directory, 'accionesintercambio'), actions);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

for (const kind of ['reserve', 'complete', 'refund']) {
  for (const stage of ['prepared', 'committed', 'published:intercambios.json', 'published:economia.json', 'published:unidades.json']) {
    test(`${kind} recovers units, balances and receipts atomically at ${stage}`, async t => {
      const c = await offered(t);
      if (kind !== 'reserve') await c.game.trades.confirm({ userId: c.first.id, chatId, code: c.trade.code, operationKey: 'lock' });
      const operation = kind === 'refund' ? 'cancel' : 'confirm';
      const request = { userId: kind === 'complete' ? c.second.id : c.first.id, chatId, code: c.trade.code, operationKey: `interrupted:${kind}` };
      await c.game.close();
      const broken = c.open({ fault: current => { if (current === stage) throw new Error('trade interruption'); } }).game;
      await assert.rejects(broken.trades[operation](request), { code: 'STORAGE_WRITE_FAILED' });
      await broken.close();
      const game = c.open().game;
      const committed = stage !== 'prepared';
      const result = await game.trades[operation](request);
      assert.equal(result.alreadyProcessed, committed);
      assert.equal(result.trade.status, kind === 'reserve' ? 'locked' : kind === 'complete' ? 'completed' : 'cancelled');
      const unit = await game.units.getUnit(c.unit.id);
      assert.equal(unit.ownerId, kind === 'complete' ? c.second.id : c.first.id);
      assert.equal(unit.ownershipVersion, kind === 'complete' ? 1 : 0);
      assert.deepEqual(unit.lock, kind === 'reserve' ? { type: 'trade', referenceId: c.trade.id } : null);
      assert.equal((await game.economy.getBalance(c.first.id)).coins, kind === 'refund' ? 100 : 50);
      assert.equal((await game.economy.getBalance(c.second.id)).coins, kind === 'complete' ? 50 : 0);
      assert.equal(readRecords(c.directory, 'accionesintercambio').filter(action => action.operationKey === request.operationKey).length, 1);
      assert.equal(readRecords(c.directory, 'economia').filter(move => move.sourceType === 'trade_escrow').length, 1);
      assert.equal(readRecords(c.directory, 'economia').filter(move => move.sourceType === 'trade_settlement').length, kind === 'complete' ? 1 : 0);
      assert.equal(readRecords(c.directory, 'economia').filter(move => move.sourceType === 'trade_refund').length, kind === 'refund' ? 1 : 0);
      assert.equal((await game.validateDatabase()).valid, true);
    });
  }
}
