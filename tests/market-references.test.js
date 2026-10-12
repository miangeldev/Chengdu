import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, validateTransition } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

const state = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

async function fixture(t) {
  let now = '2026-10-11T20:00:00.000Z';
  const context = setup(t, { clock: () => now });
  const seller = await register(context.game);
  const buyer = await register(context.game, 'Lukas', '521111111111');
  const unit = (await context.game.starter.claimStarter({ userId: seller.id, choice: 'panda' })).unit;
  await context.game.economy.claimDaily({ userId: buyer.id, operationKey: 'fund-buyer' });
  const offer = (unitId, price, key, sellerId = seller.id) => context.game.market.createListing({
    sellerId, unitId, price, operationKey: key
  });
  return { ...context, seller, buyer, unit, offer, setTime: value => { now = value; } };
}

test('market codes identify global listings across pages, prices, rarities and different viewers', async t => {
  const c = await fixture(t);
  const units = [c.unit];
  for (let i = 1; i < 6; i++) units.push(await c.game.units.createUnit({
    ownerId: c.seller.id, characterId: i === 5 ? 'monje_celestial' : 'panda_guerrero',
    origin: { type: 'admin', sourceId: 'short-market-codes' }, operationKey: `mint:${i}`
  }));
  const listings = [];
  for (let i = 0; i < units.length; i++) listings.push((await c.offer(units[i].id, 80 - i * 10, `offer:${i}`)).listing);
  assert.deepEqual(listings.map(listing => listing.code), ['M1', 'M2', 'M3', 'M4', 'M5', 'M6']);
  assert.deepEqual((await c.game.market.listListings()).items.map(listing => listing.code), ['M6', 'M5', 'M4', 'M3', 'M2']);
  assert.deepEqual((await c.game.market.listListings({ page: 2 })).items.map(listing => listing.code), ['M1']);
  assert.deepEqual((await c.game.market.listListings({ sort: 'price_desc' })).items.map(listing => listing.code), ['M1', 'M2', 'M3', 'M4', 'M5']);
  assert.deepEqual((await c.game.market.listListings({ rarity: 'rare' })).items.map(listing => listing.code), ['M6']);
  assert.equal((await c.game.market.listListings({ sellerId: c.buyer.id })).items.length, 0);
  assert.equal((await c.game.market.getListing(' m6 ')).id, listings[5].id);
  assert.equal((await c.game.units.getUnit(units[5].id)).marketCode, 'M6');
  assert.equal((await c.game.units.getUserUnits(c.seller.id, { limit: 10 })).items.find(unit => unit.id === units[5].id).marketCode, 'M6');
  const purchased = await c.game.market.buyListing({ buyerId: c.buyer.id, listingId: 'M6', operationKey: 'buy-filtered' });
  assert.equal(purchased.unit.id, units[5].id);
  assert.equal(purchased.sale.price, 30);
  assert.equal(purchased.sale.listingId, listings[5].id);
  assert.equal((await c.game.market.getListing('M1')).status, 'active');
  assert.equal(readRecords(c.directory, 'mercado').some(listing => Object.hasOwn(listing, 'code')), false);
});

test('closed codes are never reassigned after withdrawal, sale, expiry, relisting or restart', async t => {
  const c = await fixture(t);
  const first = (await c.offer(c.unit.id, 20, 'first')).listing;
  await c.game.market.cancelListing({ sellerId: c.seller.id, listingId: first.code, operationKey: 'cancel-first' });
  const second = (await c.offer(c.unit.id, 21, 'second')).listing;
  await c.game.market.buyListing({ buyerId: c.buyer.id, listingId: second.code, operationKey: 'buy-second' });
  const third = (await c.offer(c.unit.id, 22, 'third', c.buyer.id)).listing;
  c.setTime(third.expiresAt);
  const fourth = (await c.offer(c.unit.id, 23, 'fourth', c.buyer.id)).listing;
  assert.deepEqual([first.code, second.code, third.code, fourth.code], ['M1', 'M2', 'M3', 'M4']);
  await c.game.close();
  const reopened = c.open().game;
  for (const [code, id, status] of [['M1', first.id, 'cancelled'], ['M2', second.id, 'sold'], ['M3', third.id, 'expired'], ['M4', fourth.id, 'active']]) {
    const listing = await reopened.market.getListing(code);
    assert.equal(listing.id, id);
    assert.equal(listing.code, code);
    assert.equal(listing.status, status);
  }
  assert.deepEqual((await reopened.market.listListings()).items.map(listing => listing.code), ['M4']);
  const before = state(c.directory);
  for (const listingId of ['M1', 'M2']) await assert.rejects(reopened.market.buyListing({
    buyerId: c.seller.id, listingId, operationKey: `stale:${listingId}`
  }), { code: 'LISTING_NOT_ACTIVE' });
  await assert.rejects(reopened.market.buyListing({ buyerId: c.seller.id, listingId: 'M3', operationKey: 'expired' }), { code: 'LISTING_EXPIRED' });
  assert.deepEqual(state(c.directory), before);
  assert.equal((await reopened.units.getUnit(c.unit.id)).lock.referenceId, fourth.id);
});

test('UUID and short-code retries recover the same purchase and cancellation without another payment', async t => {
  const c = await fixture(t);
  const first = (await c.offer(c.unit.id, 21, 'first')).listing;
  const purchased = await c.game.market.buyListing({ buyerId: c.buyer.id, listingId: first.id, operationKey: 'purchase' });
  const second = (await c.offer(c.unit.id, 22, 'second', c.buyer.id)).listing;
  await c.game.market.cancelListing({ sellerId: c.buyer.id, listingId: second.code, operationKey: 'cancel' });
  await c.offer(c.unit.id, 23, 'third', c.buyer.id);
  await c.game.close();
  const reopened = c.open().game;
  c.setTime('bad-clock');
  const before = state(c.directory);
  const replay = await reopened.market.buyListing({ buyerId: c.buyer.id, listingId: 'm01', operationKey: 'purchase' });
  assert.equal(replay.alreadyPurchased, true);
  assert.equal(replay.sale.id, purchased.sale.id);
  assert.equal(replay.listing.code, 'M1');
  assert.equal((await reopened.market.cancelListing({ sellerId: c.buyer.id, listingId: second.id.toUpperCase(), operationKey: 'cancel' })).alreadyCancelled, true);
  assert.equal((await reopened.market.createListing({ sellerId: c.seller.id, unitId: c.unit.id, price: 21, operationKey: 'first' })).listing.code, 'M1');
  for (const listingId of ['M2', 'M999']) await assert.rejects(reopened.market.buyListing({
    buyerId: c.buyer.id, listingId, operationKey: 'purchase'
  }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(reopened.market.cancelListing({ sellerId: c.buyer.id, listingId: 'M3', operationKey: 'cancel' }), { code: 'OPERATION_CONFLICT' });
  assert.deepEqual(state(c.directory), before);
});

test('unknown short codes fail without altering balances, ownership or listing locks', async t => {
  const c = await fixture(t);
  await c.offer(c.unit.id, 20, 'offer');
  const before = state(c.directory);
  for (const listingId of ['M0', 'M999', 'M9007199254740993', 'M-1', 'M1.5', 'M1e0', '', null]) {
    await assert.rejects(c.game.market.getListing(listingId), { code: 'LISTING_NOT_FOUND' });
    await assert.rejects(c.game.market.buyListing({ buyerId: c.buyer.id, listingId, operationKey: 'missing-buy' }), { code: 'LISTING_NOT_FOUND' });
    await assert.rejects(c.game.market.cancelListing({ sellerId: c.seller.id, listingId, operationKey: 'missing-cancel' }), { code: 'LISTING_NOT_FOUND' });
  }
  assert.deepEqual(state(c.directory), before);
});

test('concurrent publications have unique codes and listing order cannot change in a later commit', async t => {
  const c = await fixture(t);
  const other = await c.game.units.createUnit({ ownerId: c.seller.id, characterId: 'lobo_sombrio',
    origin: { type: 'admin', sourceId: 'concurrent-codes' }, operationKey: 'mint-other' });
  const results = await Promise.all([c.offer(c.unit.id, 20, 'one'), c.offer(other.id, 21, 'two')]);
  assert.deepEqual(results.map(result => result.listing.code), ['M1', 'M2']);
  for (const { listing } of results) assert.equal((await c.game.market.getListing(listing.code)).id, listing.id);
  const before = state(c.directory);
  const reordered = structuredClone(before);
  reordered.mercado.records.reverse();
  assert.throws(() => validateTransition(before, reordered), { code: 'DATABASE_CORRUPT' });
  const removed = structuredClone(before);
  removed.mercado.records.shift();
  assert.throws(() => validateTransition(before, removed), { code: 'DATABASE_CORRUPT' });
});
