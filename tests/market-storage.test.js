import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { effectiveStats } from '../game/progression/rules.js';
import { marketExpiresAt } from '../game/market/policy.js';
import { pendingRecords, readRecords, register, setup } from './helpers.js';

const rawState = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

async function listed(t, { packUnit = false } = {}) {
  const c = setup(t, { clock: () => '2026-10-11T10:00:00.000Z', randomRoll: () => 0, randomDropInt: () => 0 });
  const seller = await register(c.game);
  const buyer = await register(c.game, 'Lukas', '521111111111');
  let unit = (await c.game.starter.claimStarter({ userId: seller.id, choice: 'panda' })).unit;
  const opponentUnit = (await c.game.starter.claimStarter({ userId: buyer.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: seller.id, unitIds: [unit.id] });
  await c.game.teams.setTeam({ userId: buyer.id, unitIds: [opponentUnit.id] });
  const chatId = 'market-storage-arena';
  async function fight() {
    await c.game.battle.challenge({ userId: seller.id, opponentId: buyer.id, chatId });
    let battle = (await c.game.battle.accept({ userId: buyer.id, chatId })).battle;
    while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
  }
  await fight();
  if (packUnit) {
    await c.storage.withTransaction(async repos => {
      const pack = await repos.packs.get('basico');
      await repos.packs.replace({ ...pack, revision: pack.revision + 1, price: 100 });
    });
    unit = (await c.game.packs.openPack({ userId: seller.id, packId: 'basico', operationKey: 'market-birth-pack' })).unit;
    await c.game.teams.setTeam({ userId: seller.id, unitIds: [unit.id] });
    await fight();
  }
  await c.game.economy.claimDaily({ userId: buyer.id, operationKey: 'market-buyer-coins' });
  const listing = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 21, operationKey: 'market-listing' })).listing;
  const before = rawState(c.directory);
  return { ...c, seller, buyer, unit, listing, before };
}

test('trading a previously battled pack unit preserves birth, old owners in battle history and economic sources', async t => {
  const c = await listed(t, { packUnit: true });
  const result = await c.game.market.buyListing({ buyerId: c.buyer.id, listingId: c.listing.id, operationKey: 'purchase-pack-unit' });
  assert.equal(result.unit.ownerId, c.buyer.id);
  assert.equal(result.unit.ownershipVersion, 1);
  const before = c.before.unidades.records.find(u => u.id === c.unit.id);
  for (const field of ['serial', 'characterRevision', 'origin', 'initialStats', 'combatBaseStats', 'progress', 'traits', 'variant', 'traitVersion', 'battleStats']) assert.deepEqual(result.unit[field], before[field]);
  for (const name of ['combates', 'aperturas', 'recompensas', 'estado', 'personajes', 'diarios']) assert.deepEqual(readRecords(c.directory, name), c.before[name].records);
  assert.deepEqual(readRecords(c.directory, 'economia').slice(-2).map(m => [m.sourceType, m.type, m.amount]), [
    ['market_purchase', 'debit', 21], ['market_sale', 'credit', 19]
  ]);
  assert.equal(readRecords(c.directory, 'eventos').filter(e => e.unitId === c.unit.id && e.type === 'unit_created').length, 1);
  assert.equal(readRecords(c.directory, 'eventos').filter(e => e.unitId === c.unit.id && e.type === 'unit_transferred').length, 1);
  assert.equal((await c.game.validateDatabase()).valid, true);
  const another = await register(c.game, 'Tercer dueño', '521222222222');
  await c.game.economy.claimDaily({ userId: another.id, operationKey: 'third-owner-daily' });
  const resale = (await c.game.market.createListing({ sellerId: c.buyer.id, unitId: c.unit.id, price: 22, operationKey: 'resale' })).listing;
  await c.game.market.buyListing({ buyerId: another.id, listingId: resale.id, operationKey: 'second-purchase' });
  const final = await c.game.units.getUnit(c.unit.id);
  assert.equal(final.ownershipVersion, 2);
  assert.equal(final.ownerId, another.id);
  assert.deepEqual(readRecords(c.directory, 'combates'), c.before.combates.records);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('active listing prices and snapshots cannot be edited, and raw sale or transfer tampering fails validation', async t => {
  const c = await listed(t);
  for (const changes of [{ price: 22 }, { unitSnapshot: { ...c.listing.unitSnapshot, characterName: 'Otro personaje' } }]) {
    await assert.rejects(c.storage.withTransaction(async repos => {
      const listing = await repos.listings.get(c.listing.id);
      await repos.listings.replace({ ...listing, ...changes });
    }), { code: 'DATABASE_CORRUPT' });
  }
  await c.game.market.buyListing({ buyerId: c.buyer.id, listingId: c.listing.id, operationKey: 'protected-purchase' });
  const before = rawState(c.directory);
  const mutations = [
    state => { state.ventas.records[0].fee = 1; state.ventas.records[0].net = 20; },
    state => { state.ventas.records[0].buyerId = state.ventas.records[0].sellerId; },
    state => { state.ventas.records[0].toOwnershipVersion++; },
    state => { state.ventas.records[0].policyVersion = '1'; },
    state => { state.ventas.records[0].transferEventId = 'missing'; },
    state => { state.eventos.records.find(e => e.type === 'unit_transferred').ownershipVersion++; },
    state => { state.unidades.records.find(u => u.id === c.unit.id).ownerId = c.seller.id; },
    state => { state.economia.records.pop(); },
    state => { state.economia.records.at(-1).id = `coin:${state.ventas.records[0].id}`; },
    state => { state.mercado.records[0].price++; },
    state => { state.mercado.records[0].status = 'active'; },
    state => {
      const listing = state.mercado.records[0];
      const unit = state.unidades.records.find(u => u.id === listing.unitId);
      listing.createdAt = new Date(Date.parse(unit.createdAt) - 1).toISOString();
      listing.expiresAt = marketExpiresAt(listing.createdAt, listing.policyVersion);
    },
    state => {
      const s = state.mercado.records[0].unitSnapshot;
      const unit = state.unidades.records.find(u => u.id === c.unit.id);
      s.level = 2;
      s.progress = { level: 2, xp: 0 };
      s.stats = effectiveStats(unit.initialStats, s.level, unit.statGrowthVersion, unit.traits, unit.traitVersion, unit.combatBaseStats);
    }
  ];
  for (const mutation of mutations) {
    const state = structuredClone(before);
    mutation(state);
    assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
  }
  await assert.rejects(c.storage.withTransaction(async repos => {
    const sale = (await repos.sales.all())[0];
    await repos.sales.replace({ ...sale, note: 'edit after sale' });
  }), { code: 'DATABASE_CORRUPT' });
  assert.deepEqual(rawState(c.directory), before);
});

test('a lazily expired listing can be closed and relisted in the same transaction', async t => {
  const c = await listed(t);
  await c.game.close();
  const game = c.open({ clock: () => c.listing.expiresAt }).game;
  const relisted = (await game.market.createListing({ sellerId: c.seller.id, unitId: c.unit.id, price: 25, operationKey: 'after-lazy-expiry' })).listing;
  assert.equal((await game.market.getListing(c.listing.id)).status, 'expired');
  assert.equal(relisted.status, 'active');
  assert.deepEqual((await game.units.getUnit(c.unit.id)).lock, { type: 'market', referenceId: relisted.id });
  assert.equal((await game.validateDatabase()).valid, true);
});

test('a lazily expired battle unlocks the unit before creating its listing in the same transaction', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const seller = await register(c.game);
  const opponent = await register(c.game, 'Lukas', '521111111111');
  const unit = (await c.game.starter.claimStarter({ userId: seller.id, choice: 'panda' })).unit;
  const other = (await c.game.starter.claimStarter({ userId: opponent.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: seller.id, unitIds: [unit.id] });
  await c.game.teams.setTeam({ userId: opponent.id, unitIds: [other.id] });
  await c.game.battle.challenge({ userId: seller.id, opponentId: opponent.id, chatId: 'expiry-market-arena' });
  const fight = (await c.game.battle.accept({ userId: opponent.id, chatId: 'expiry-market-arena' })).battle;
  now = fight.expiresAt;
  const listing = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 20, operationKey: 'after-battle-expiry' })).listing;
  assert.equal(readRecords(c.directory, 'combates')[0].status, 'expired');
  assert.deepEqual((await c.game.units.getUnit(unit.id)).lock, { type: 'market', referenceId: listing.id });
  assert.equal((await c.game.validateDatabase()).valid, true);
});

for (const stage of ['prepared', 'committed', ...COLLECTIONS.map(name => `published:${name}.json`), 'published:_database.json']) {
  test(`purchase balances, ownership, lock and receipts recover atomically at ${stage}`, async t => {
    const c = await listed(t);
    const request = { buyerId: c.buyer.id, listingId: c.listing.id, operationKey: 'interrupted-purchase' };
    await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted market purchase'); } }).game;
    await assert.rejects(failed.market.buyListing(request), { code: 'STORAGE_WRITE_FAILED' });
    const journal = JSON.parse(fs.readFileSync(path.join(c.directory, '_journal.json'), 'utf8'));
    const attempted = pendingRecords(c.directory, journal, 'ventas')[0];
    await failed.close();
    const game = c.open().game;
    const committed = stage !== 'prepared';
    const unit = await game.units.getUnit(c.unit.id);
    assert.equal(unit.ownerId, committed ? c.buyer.id : c.seller.id);
    assert.equal(unit.ownershipVersion, committed ? 1 : 0);
    assert.deepEqual(unit.lock, committed ? null : { type: 'market', referenceId: c.listing.id });
    assert.equal((await game.economy.getBalance(c.buyer.id)).coins, committed ? 79 : 100);
    assert.equal((await game.economy.getBalance(c.seller.id)).coins, committed ? 139 : 120);
    assert.equal(readRecords(c.directory, 'ventas').length, committed ? 1 : 0);
    const replay = await game.market.buyListing(request);
    assert.equal(replay.alreadyPurchased, committed);
    if (committed) assert.deepEqual(readRecords(c.directory, 'ventas')[0], attempted);
    else assert.notEqual(replay.sale.id, attempted.id);
    assert.equal(replay.sale.id, readRecords(c.directory, 'ventas')[0].id);
    assert.equal(readRecords(c.directory, 'economia').filter(m => m.sourceId === replay.sale.id).length, 2);
    assert.equal(readRecords(c.directory, 'eventos').filter(e => e.type === 'unit_transferred').length, 1);
    assert.deepEqual(readRecords(c.directory, 'combates'), c.before.combates.records);
    assert.equal((await game.validateDatabase()).valid, true);
  });
}
