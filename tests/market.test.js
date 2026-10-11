import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS } from '../storage/validation.js';
import { quoteMarket, marketExpiresAt } from '../game/market/policy.js';
import { readRecords, register, setup, updateCharacter } from './helpers.js';

const contents = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  fs.readFileSync(path.join(directory, `${name}.json`), 'utf8')
]));

async function participants(c) {
  const seller = await register(c.game);
  const buyer = await register(c.game, 'Lukas', '521111111111');
  const unit = (await c.game.starter.claimStarter({ userId: seller.id, choice: 'panda' })).unit;
  await c.game.economy.claimDaily({ userId: buyer.id, operationKey: 'fund-buyer' });
  return { seller, buyer, unit };
}

test('a sale preserves the quoted character and unit, debits the full price, burns the rounded fee and exposes only the reader balance', async t => {
  const c = setup(t);
  const { seller, buyer, unit } = await participants(c);
  await c.game.teams.setTeam({ userId: seller.id, unitIds: [unit.id] });
  const listing = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 21, operationKey: 'offer' })).listing;
  assert.equal(listing.fee, 2);
  assert.equal(listing.net, 19);
  assert.deepEqual((await c.game.users.getUser(seller.id)).team, []);
  await assert.rejects(c.game.teams.setTeam({ userId: seller.id, unitIds: [unit.id] }), { code: 'UNIT_LOCKED' });
  await updateCharacter(c.storage, unit.characterId, { name: 'Panda futuro', rarity: 'rare', supply: { type: 'limited', max: 35 }, baseStats: { hp: 140, attack: 29, defense: 25, speed: 9 } });
  const result = await c.game.market.buyListing({ buyerId: buyer.id, listingId: listing.id.toUpperCase(), operationKey: 'buy' });
  assert.equal(result.sale.unitSnapshot.characterName, listing.unitSnapshot.characterName);
  assert.equal(result.sale.unitSnapshot.rarity, 'common');
  assert.deepEqual(result.sale.unitSnapshot.stats, listing.unitSnapshot.stats);
  assert.equal(result.sale.buyerBalanceBefore, 100);
  assert.equal(result.sale.buyerBalanceAfter, 79);
  assert.ok(!Object.hasOwn(result.sale, 'sellerBalanceBefore'));
  assert.ok(!Object.hasOwn(result.sale, 'sellerBalanceAfter'));
  assert.equal(result.unit.ownerId, buyer.id);
  assert.equal(result.unit.ownershipVersion, 1);
  for (const key of ['id', 'serial', 'createdAt', 'initialStats', 'combatBaseStats', 'progress', 'traits', 'variant', 'origin']) {
    assert.deepEqual(result.unit[key], unit[key], key);
  }
  assert.deepEqual(await c.game.economy.getBalance(buyer.id), { coins: 79, income: '100', expenses: '21', openingBalance: 0 });
  assert.deepEqual(await c.game.economy.getBalance(seller.id), { coins: 19, income: '19', expenses: '0', openingBalance: 0 });
  const sellerSales = await c.game.market.getSales(seller.id);
  assert.equal(sellerSales.items[0].role, 'seller');
  assert.equal(sellerSales.items[0].sellerBalanceAfter, 19);
  assert.ok(!Object.hasOwn(sellerSales.items[0], 'buyerBalanceAfter'));
  const moves = readRecords(c.directory, 'economia').filter(movement => movement.sourceId === result.sale.id);
  assert.equal(moves.length, 2);
  assert.deepEqual(moves.map(movement => [movement.type, movement.amount]), [['debit', 21], ['credit', 19]]);
  assert.equal((await c.game.units.getUserUnits(seller.id)).items.length, 0);
  assert.equal((await c.game.units.getUserUnits(buyer.id)).items[0].id, unit.id);
  assert.equal((await c.game.market.listListings()).items.length, 0);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('two buyers compete for one unit and purchase versus cancellation has exactly one winner', async t => {
  const c = setup(t);
  const { seller, buyer, unit } = await participants(c);
  const other = await register(c.game, 'Ana', '521222222222');
  await c.game.economy.claimDaily({ userId: other.id, operationKey: 'fund-other' });
  const listing = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 50, operationKey: 'offer' })).listing;
  const race = await Promise.allSettled([buyer, other].map((user, i) => c.game.market.buyListing({ buyerId: user.id, listingId: listing.id, operationKey: 'buy-' + i })));
  assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(race.find(result => result.status === 'rejected').reason.code, 'LISTING_NOT_ACTIVE');
  assert.equal(readRecords(c.directory, 'ventas').length, 1);
  assert.equal(readRecords(c.directory, 'eventos').filter(event => event.type === 'unit_transferred').length, 1);
  assert.equal((await c.game.economy.getBalance(buyer.id)).coins + (await c.game.economy.getBalance(other.id)).coins, 150);
  const winner = race.find(result => result.status === 'fulfilled').value.unit.ownerId;
  const offer2 = (await c.game.market.createListing({ sellerId: winner, unitId: unit.id, price: 20, operationKey: 'offer-2' })).listing;
  const buyer2 = winner === buyer.id ? other : buyer;
  const race2 = await Promise.allSettled([
    c.game.market.cancelListing({ sellerId: winner, listingId: offer2.id, operationKey: 'cancel-2' }),
    c.game.market.buyListing({ buyerId: buyer2.id, listingId: offer2.id, operationKey: 'purchase-2' })
  ]);
  assert.equal(race2.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(race2.find(result => result.status === 'rejected').reason.code, 'LISTING_NOT_ACTIVE');
  const final = await c.game.market.getListing(offer2.id);
  assert.ok(['cancelled', 'sold'].includes(final.status));
  assert.equal((await c.game.units.getUnit(unit.id)).lock, null);
  assert.equal(readRecords(c.directory, 'ventas').length, final.status === 'sold' ? 2 : 1);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('listing, cancellation and purchase replays survive resale, restart and a faulty clock without charging or reopening anything', async t => {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const { seller, buyer, unit } = await participants(c);
  await c.game.economy.claimDaily({ userId: seller.id, operationKey: 'fund-seller' });
  const offer = { sellerId: seller.id, unitId: unit.id, price: 21, operationKey: 'offer' };
  const listing = (await c.game.market.createListing(offer)).listing;
  const buy = { buyerId: buyer.id, listingId: listing.id, operationKey: 'buy' };
  const first = await c.game.market.buyListing(buy);
  const secondListing = (await c.game.market.createListing({ sellerId: buyer.id, unitId: unit.id, price: 20, operationKey: 'relist' })).listing;
  await c.game.market.buyListing({ buyerId: seller.id, listingId: secondListing.id, operationKey: 'return' });
  const cancelListing = (await c.game.market.createListing({ ...offer, operationKey: 'cancel-offer' })).listing;
  const cancel = { sellerId: seller.id, listingId: cancelListing.id, operationKey: 'cancel' };
  await c.game.market.cancelListing(cancel);
  const before = contents(c.directory);
  await c.game.close();
  c.game = c.open().game;
  now = 'bad-clock';
  assert.equal((await c.game.market.createListing(offer)).alreadyListed, true);
  assert.equal((await c.game.market.cancelListing(cancel)).alreadyCancelled, true);
  const replay = await c.game.market.buyListing(buy);
  assert.equal(replay.alreadyPurchased, true);
  assert.deepEqual(replay.sale, first.sale);
  assert.equal(replay.unit.ownerId, seller.id);
  assert.equal(replay.unit.ownershipVersion, 2);
  await assert.rejects(c.game.market.createListing({ ...offer, price: 22 }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.market.buyListing({ ...buy, buyerId: seller.id }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.market.cancelListing({ ...cancel, operationKey: buy.operationKey }), { code: 'OPERATION_CONFLICT' });
  assert.deepEqual(contents(c.directory), before);
});

test('market filters, prices and private sale history use stable cursors scoped to the exact query', async t => {
  const c = setup(t);
  const { seller, buyer, unit } = await participants(c);
  const units = [unit];
  for (const characterId of ['panda_guerrero', 'monje_celestial', 'lobo_sombrio']) {
    units.push(await c.game.units.createUnit({ ownerId: seller.id, characterId, origin: { type: 'admin', sourceId: 'test' }, operationKey: 'mint-' + characterId }));
  }
  const listings = [];
  for (let i = 0; i < units.length; i++) listings.push((await c.game.market.createListing({ sellerId: seller.id, unitId: units[i].id, price: [40, 20, 30, 50][i], operationKey: 'offer-' + i })).listing);
  const first = await c.game.market.listListings({ sellerId: seller.id, limit: 2 });
  assert.deepEqual(first.items.map(listing => listing.id), listings.slice(2).toReversed().map(listing => listing.id));
  for (const query of [{ sellerId: buyer.id }, { sort: 'price_asc' }, { rarity: 'common' }]) {
    await assert.rejects(c.game.market.listListings({ ...query, cursor: first.nextCursor }), { code: 'INVALID_CURSOR' });
  }
  const fifth = await c.game.units.createUnit({ ownerId: seller.id, characterId: unit.characterId, origin: { type: 'admin', sourceId: 'test' }, operationKey: 'mint-fifth' });
  await c.game.market.createListing({ sellerId: seller.id, unitId: fifth.id, price: 60, operationKey: 'offer-fifth' });
  const second = await c.game.market.listListings({ sellerId: seller.id, cursor: first.nextCursor, limit: 2 });
  assert.deepEqual(second.items.map(listing => listing.id), listings.slice(0, 2).toReversed().map(listing => listing.id));
  assert.deepEqual((await c.game.market.listListings({ sort: 'price_asc' })).items.map(listing => listing.price), [20, 30, 40, 50, 60]);
  assert.deepEqual((await c.game.market.listListings({ sort: 'price_desc' })).items.map(listing => listing.price), [60, 50, 40, 30, 20]);
  assert.equal((await c.game.market.listListings({ rarity: 'rare' })).items.length, 1);
  for (const listing of listings.slice(0, 2)) await c.game.market.buyListing({ buyerId: buyer.id, listingId: listing.id, operationKey: 'buy-' + listing.id });
  const sales = await c.game.market.getSales(seller.id, { limit: 1 });
  await assert.rejects(c.game.market.getSales(buyer.id, { cursor: sales.nextCursor }), { code: 'INVALID_CURSOR' });
  assert.equal((await c.game.market.getSales(seller.id, { cursor: sales.nextCursor })).items[0].listingId, listings[0].id);
});

test('invalid prices, unrelated units, self purchase, empty wallets and invalid operations leave all records unchanged', async t => {
  const c = setup(t);
  const { seller, buyer, unit } = await participants(c);
  const empty = await register(c.game, 'Ana', '521222222222');
  const before = contents(c.directory);
  for (const price of [0, 19, 1_000_001, 20.5, NaN, Infinity, '20', null]) {
    await assert.rejects(c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price, operationKey: 'invalid-price' }), { code: 'INVALID_MARKET_PRICE' });
  }
  await assert.rejects(c.game.market.createListing({ sellerId: buyer.id, unitId: unit.id, price: 20, operationKey: 'wrong-owner' }), { code: 'UNIT_NOT_OWNED' });
  await assert.rejects(c.game.market.createListing({ sellerId: seller.id, unitId: 'missing', price: 20, operationKey: 'missing' }), { code: 'UNIT_NOT_FOUND' });
  assert.deepEqual(contents(c.directory), before);
  const listing = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 20, operationKey: 'offer' })).listing;
  const listed = contents(c.directory);
  await assert.rejects(c.game.market.buyListing({ buyerId: seller.id, listingId: listing.id, operationKey: 'self' }), { code: 'SELF_PURCHASE' });
  await assert.rejects(c.game.market.buyListing({ buyerId: empty.id, listingId: listing.id, operationKey: 'poor' }), { code: 'INSUFFICIENT_COINS' });
  await assert.rejects(c.game.market.cancelListing({ sellerId: buyer.id, listingId: listing.id, operationKey: 'wrong-cancel' }), { code: 'LISTING_NOT_YOURS' });
  await assert.rejects(c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 20, operationKey: 'duplicate' }), { code: 'UNIT_ALREADY_LISTED' });
  for (const operationKey of ['', ' key ', null, 'x'.repeat(201)]) await assert.rejects(c.game.market.buyListing({ buyerId: buyer.id, listingId: listing.id, operationKey }), { code: 'INVALID_OPERATION_KEY' });
  assert.deepEqual(contents(c.directory), listed);
  assert.deepEqual(quoteMarket(20), { fee: 1, net: 19 });
  assert.deepEqual(quoteMarket(1_000_000), { fee: 50_000, net: 950_000 });
  await assert.rejects(c.game.market.listListings({ rarity: 'super' }), { code: 'INVALID_MARKET_FILTER' });
  assert.throws(() => marketExpiresAt('9999-12-31T20:00:00.000Z'), { code: 'INVALID_CLOCK' });
});

test('expiry is exact at seven days, releases the lock on a failed purchase and permits immediate relisting', async t => {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const { seller, buyer, unit } = await participants(c);
  const listing = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 20, operationKey: 'offer' })).listing;
  now = '2026-10-18T19:59:59.999Z';
  assert.equal((await c.game.market.getListing(listing.id)).status, 'active');
  now = listing.expiresAt;
  await assert.rejects(c.game.market.buyListing({ buyerId: buyer.id, listingId: listing.id, operationKey: 'late' }), { code: 'LISTING_EXPIRED' });
  assert.equal(readRecords(c.directory, 'mercado')[0].status, 'expired');
  assert.equal(readRecords(c.directory, 'unidades')[0].lock, null);
  const relisted = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 21, operationKey: 'relist' })).listing;
  now = relisted.expiresAt;
  const replacement = (await c.game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 22, operationKey: 'third' })).listing;
  assert.equal(replacement.status, 'active');
  assert.equal(readRecords(c.directory, 'mercado')[1].status, 'expired');
  assert.equal(readRecords(c.directory, 'unidades')[0].lock.referenceId, replacement.id);
  assert.equal(readRecords(c.directory, 'ventas').length, 0);
  assert.equal((await c.game.economy.getBalance(buyer.id)).coins, 100);
});
