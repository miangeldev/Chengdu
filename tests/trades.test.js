import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

const chatId = 'trade-arena@g.us';
const contents = directory => Object.fromEntries(COLLECTIONS.map(name => [name, fs.readFileSync(path.join(directory, `${name}.json`), 'utf8')]));

async function participants(t, options = {}) {
  const c = setup(t, { clock: () => '2026-10-13T10:00:00.000Z', ...options });
  const first = await register(c.game);
  const second = await register(c.game, 'Lukas', '521111111111');
  const firstUnit = (await c.game.starter.claimStarter({ userId: first.id, choice: 'panda' })).unit;
  const secondUnit = (await c.game.starter.claimStarter({ userId: second.id, choice: 'lobo' })).unit;
  for (const user of [first, second]) await c.game.economy.claimDaily({ userId: user.id, operationKey: `fund:${user.id}` });
  await c.game.teams.setTeam({ userId: first.id, unitIds: [firstUnit.id] });
  await c.game.teams.setTeam({ userId: second.id, unitIds: [secondUnit.id] });
  return { ...c, first, second, firstUnit, secondUnit };
}

async function offered(c, suffix = '') {
  const trade = (await c.game.trades.create({ userId: c.first.id, opponentId: c.second.id, chatId, operationKey: `create${suffix}` })).trade;
  await c.game.trades.setOffer({ userId: c.first.id, chatId, code: trade.code, unitIds: [c.firstUnit.id], coins: 20, operationKey: `offer1${suffix}` });
  await c.game.trades.setOffer({ userId: c.second.id, chatId, code: trade.code, unitIds: [c.secondUnit.id], coins: 40, operationKey: `offer2${suffix}` });
  return trade;
}

test('both confirmations swap original units and coins atomically without fees, supply changes or losing progress', async t => {
  const c = await participants(t);
  const trade = await offered(c);
  const original = readRecords(c.directory, 'unidades');
  const supply = readRecords(c.directory, 'estado');
  const first = await c.game.trades.confirm({ userId: c.first.id, chatId, code: trade.code, operationKey: 'confirm1' });
  assert.equal(first.trade.status, 'locked');
  assert.equal((await c.game.economy.getBalance(c.first.id)).coins, 80);
  assert.equal((await c.game.economy.getBalance(c.second.id)).coins, 60);
  for (const [user, unit] of [[c.first, c.firstUnit], [c.second, c.secondUnit]]) {
    assert.deepEqual((await c.game.users.getUser(user.id)).team, [unit.id]);
    assert.deepEqual((await c.game.units.getUnit(unit.id)).lock, { type: 'trade', referenceId: trade.id });
  }
  const second = await c.game.trades.confirm({ userId: c.second.id, chatId, code: trade.code, operationKey: 'confirm2' });
  assert.equal(second.trade.status, 'completed');
  assert.equal((await c.game.economy.getBalance(c.first.id)).coins, 120);
  assert.equal((await c.game.economy.getBalance(c.second.id)).coins, 80);
  for (const [oldUser, newUser, unit] of [[c.first, c.second, c.firstUnit], [c.second, c.first, c.secondUnit]]) {
    const actual = await c.game.units.getUnit(unit.id);
    const source = original.find(row => row.id === unit.id);
    assert.equal(actual.ownerId, newUser.id);
    assert.equal(actual.ownershipVersion, 1);
    assert.equal(actual.lock, null);
    for (const field of ['id', 'serial', 'characterId', 'characterRevision', 'origin', 'createdAt', 'initialStats', 'combatBaseStats',
      'progress', 'battleStats', 'traits', 'variant', 'traitVersion']) assert.deepEqual(actual[field], source[field], field);
    assert.deepEqual((await c.game.users.getUser(oldUser.id)).team, []);
  }
  assert.deepEqual(readRecords(c.directory, 'estado'), supply);
  assert.equal(readRecords(c.directory, 'ventas').length, 0);
  assert.deepEqual(readRecords(c.directory, 'economia').slice(-4).map(row => [row.type, row.sourceType, row.amount]), [
    ['debit', 'trade_escrow', 20], ['debit', 'trade_escrow', 40], ['credit', 'trade_settlement', 20], ['credit', 'trade_settlement', 40]
  ]);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('locked offers cannot change and their escrow cannot be spent in another purchase', async t => {
  const c = await participants(t);
  const trade = await offered(c);
  const seller = await register(c.game, 'Ana', '521222222222');
  const item = (await c.game.starter.claimStarter({ userId: seller.id, choice: 'mago' })).unit;
  const listing = (await c.game.market.createListing({ sellerId: seller.id, unitId: item.id, price: 61, operationKey: 'sell' })).listing;
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: trade.code, operationKey: 'lock' });
  const before = contents(c.directory);
  await assert.rejects(c.game.trades.setOffer({ userId: c.second.id, chatId, code: trade.code, unitIds: [], coins: 0, operationKey: 'change' }), { code: 'TRADE_OFFER_FROZEN' });
  await assert.rejects(c.game.trades.confirm({ userId: c.first.id, chatId, code: trade.code, operationKey: 'again' }), { code: 'TRADE_ALREADY_CONFIRMED' });
  await assert.rejects(c.game.market.buyListing({ buyerId: c.second.id, listingId: listing.code, operationKey: 'spend-escrow' }), { code: 'INSUFFICIENT_COINS' });
  await assert.rejects(c.game.market.createListing({ sellerId: c.first.id, unitId: c.firstUnit.id, price: 20, operationKey: 'double-sell' }), { code: 'UNIT_LOCKED' });
  await assert.rejects(c.game.teams.setTeam({ userId: c.first.id, unitIds: [c.firstUnit.id] }), { code: 'UNIT_LOCKED' });
  assert.deepEqual(contents(c.directory), before);
});

test('three units per participant transfer independently with six unique ownership events', async t => {
  const c = await participants(t);
  const units = [[c.firstUnit], [c.secondUnit]];
  for (const [index, user] of [c.first, c.second].entries()) {
    for (let extra = 0; extra < 2; extra++) units[index].push(await c.game.units.createUnit({ ownerId: user.id,
      characterId: extra === 0 ? 'panda_guerrero' : 'mago_carmesi', origin: { type: 'admin', sourceId: 'trade-test' },
      operationKey: `extra:${index}:${extra}` }));
    await c.game.teams.setTeam({ userId: user.id, unitIds: units[index].map(unit => unit.id) });
  }
  const trade = (await c.game.trades.create({ userId: c.first.id, opponentId: c.second.id, chatId, operationKey: 'three-create' })).trade;
  for (const [index, user] of [c.first, c.second].entries()) await c.game.trades.setOffer({ userId: user.id, chatId,
    code: trade.code, unitIds: units[index].map(unit => unit.id), operationKey: `offer:${index}` });
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: trade.code, operationKey: 'first' });
  await c.game.trades.confirm({ userId: c.second.id, chatId, code: trade.code, operationKey: 'second' });
  for (const [index, user] of [c.first, c.second].entries()) assert.deepEqual(
    readRecords(c.directory, 'unidades').filter(unit => unit.ownerId === user.id).map(unit => unit.id).sort(),
    units[1 - index].map(unit => unit.id).sort()
  );
  const events = readRecords(c.directory, 'eventos').filter(event => event.reason === 'trade');
  assert.equal(events.length, 6);
  assert.equal(new Set(events.map(event => event.operationKey)).size, 6);
  assert.equal(readRecords(c.directory, 'economia').filter(movement => movement.sourceType.startsWith('trade_')).length, 0);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('cancellation refunds each escrow once, preserves ownership and restores the existing team', async t => {
  const c = await participants(t);
  const trade = await offered(c);
  await c.game.trades.confirm({ userId: c.second.id, chatId, code: trade.code, operationKey: 'lock' });
  const cancel = { userId: c.first.id, chatId, code: trade.code, operationKey: 'cancel' };
  const cancelled = await c.game.trades.cancel(cancel);
  assert.equal(cancelled.trade.status, 'cancelled');
  const before = contents(c.directory);
  assert.equal((await c.game.trades.cancel(cancel)).alreadyProcessed, true);
  assert.deepEqual(contents(c.directory), before);
  for (const [user, unit] of [[c.first, c.firstUnit], [c.second, c.secondUnit]]) {
    assert.equal((await c.game.economy.getBalance(user.id)).coins, 100);
    assert.deepEqual((await c.game.users.getUser(user.id)).team, [unit.id]);
    const actual = await c.game.units.getUnit(unit.id);
    assert.equal(actual.ownerId, user.id);
    assert.equal(actual.ownershipVersion, 0);
    assert.equal(actual.lock, null);
  }
  assert.equal(readRecords(c.directory, 'eventos').filter(row => row.type === 'unit_transferred').length, 0);
  assert.equal(readRecords(c.directory, 'economia').filter(row => row.sourceType === 'trade_refund').length, 2);
  await assert.rejects(c.game.trades.confirm({ userId: c.second.id, chatId, code: trade.code, operationKey: 'too-late' }), { code: 'TRADE_NOT_ACTIVE' });
});

test('all successful requests replay after restart and after resale without consulting a faulty clock', async t => {
  let now = '2026-10-13T10:00:00.000Z';
  const c = await participants(t, { clock: () => now });
  const create = { userId: c.first.id, opponentId: c.second.id, chatId, operationKey: 'create' };
  const trade = (await c.game.trades.create(create)).trade;
  const offer = { userId: c.first.id, chatId, code: trade.code, unitIds: [c.firstUnit.id], coins: 10, operationKey: 'offer' };
  const confirm1 = { userId: c.first.id, chatId, code: trade.code, operationKey: 'confirm1' };
  const confirm2 = { userId: c.second.id, chatId, code: trade.code, operationKey: 'confirm2' };
  await c.game.trades.setOffer(offer);
  await c.game.trades.confirm(confirm1);
  await c.game.trades.confirm(confirm2);
  const listing = (await c.game.market.createListing({ sellerId: c.second.id, unitId: c.firstUnit.id, price: 20, operationKey: 'resale' })).listing;
  await c.game.market.buyListing({ buyerId: c.first.id, listingId: listing.id, operationKey: 'buyback' });
  const before = contents(c.directory);
  await c.game.close();
  c.game = c.open().game;
  now = 'bad-clock';
  for (const [method, request] of [['create', create], ['setOffer', offer], ['confirm', confirm1], ['confirm', confirm2]]) {
    assert.equal((await c.game.trades[method](request)).alreadyProcessed, true);
  }
  await assert.rejects(c.game.trades.setOffer({ ...offer, coins: 11 }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.trades.cancel({ ...confirm1 }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.trades.create({ ...create, chatId: 'other@g.us' }), { code: 'OPERATION_CONFLICT' });
  assert.deepEqual(contents(c.directory), before);
});

test('confirmation racing cancellation has one terminal winner and conserved currency', async t => {
  const c = await participants(t);
  const trade = await offered(c);
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: trade.code, operationKey: 'lock' });
  const results = await Promise.allSettled([
    c.game.trades.confirm({ userId: c.second.id, chatId, code: trade.code, operationKey: 'complete' }),
    c.game.trades.cancel({ userId: c.first.id, chatId, code: trade.code, operationKey: 'cancel' })
  ]);
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.code, 'TRADE_NOT_ACTIVE');
  const status = (await c.game.trades.getTrade({ userId: c.first.id, chatId, code: trade.code })).status;
  assert.ok(['completed', 'cancelled'].includes(status));
  assert.equal((await c.game.economy.getBalance(c.first.id)).coins + (await c.game.economy.getBalance(c.second.id)).coins, 200);
  assert.equal(readRecords(c.directory, 'eventos').filter(row => row.type === 'unit_transferred').length, status === 'completed' ? 2 : 0);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('overlapping drafts can reserve each unit only once and battles cannot use a reserved team', async t => {
  const c = await participants(t);
  const other = await register(c.game, 'Ana', '521222222222');
  const first = await offered(c);
  const second = (await c.game.trades.create({ userId: c.first.id, opponentId: other.id, chatId, operationKey: 'other-trade' })).trade;
  await c.game.trades.setOffer({ userId: c.first.id, chatId, code: second.code, unitIds: [c.firstUnit.id], operationKey: 'overlap' });
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: first.code, operationKey: 'lock' });
  await assert.rejects(c.game.trades.confirm({ userId: other.id, chatId, code: second.code, operationKey: 'lock-overlap' }), { code: 'UNIT_LOCKED' });
  await assert.rejects(c.game.battle.challenge({ userId: c.first.id, opponentId: c.second.id, chatId }), { code: 'UNIT_LOCKED' });
  assert.equal((await c.game.trades.getTrade({ userId: other.id, chatId, code: second.code })).status, 'draft');
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('expiry is exact at fifteen minutes, refunds across restart and a failed late confirmation commits the release', async t => {
  let now = '2026-10-13T10:00:00.000Z';
  const c = await participants(t, { clock: () => now });
  const trade = await offered(c);
  await c.game.trades.confirm({ userId: c.first.id, chatId, code: trade.code, operationKey: 'lock' });
  now = '2026-10-13T10:14:59.999Z';
  assert.equal((await c.game.trades.getTrade({ userId: c.first.id, chatId, code: trade.code })).status, 'locked');
  await c.game.close();
  c.game = c.open().game;
  now = trade.expiresAt;
  await assert.rejects(c.game.trades.confirm({ userId: c.second.id, chatId, code: trade.code, operationKey: 'late' }), { code: 'TRADE_EXPIRED' });
  assert.equal(readRecords(c.directory, 'intercambios')[0].status, 'expired');
  assert.equal((await c.game.units.getUnit(c.firstUnit.id)).lock, null);
  assert.equal((await c.game.economy.getBalance(c.first.id)).coins, 100);
  assert.equal((await c.game.economy.getBalance(c.second.id)).coins, 100);
  const before = contents(c.directory);
  assert.equal(await c.game.trades.sweepExpired(), 0);
  assert.deepEqual(contents(c.directory), before);
  const next = (await c.game.trades.create({ userId: c.first.id, opponentId: c.second.id, chatId, operationKey: 'next' })).trade;
  assert.equal(next.code, 'I2');
});

test('stale market offers are revalidated before either escrow is debited', async t => {
  const c = await participants(t);
  const trade = await offered(c);
  const listing = (await c.game.market.createListing({ sellerId: c.first.id, unitId: c.firstUnit.id, price: 20, operationKey: 'sale-before-confirm' })).listing;
  await c.game.market.buyListing({ buyerId: c.second.id, listingId: listing.id, operationKey: 'buy-before-confirm' });
  const before = contents(c.directory);
  await assert.rejects(c.game.trades.confirm({ userId: c.first.id, chatId, code: trade.code, operationKey: 'stale' }), { code: 'UNIT_NOT_OWNED' });
  assert.deepEqual(contents(c.directory), before);
});

test('authorization, input validation, empty offers and insufficient wallets leave storage unchanged', async t => {
  const c = await participants(t);
  const outsider = await register(c.game, 'Ana', '521222222222');
  const trade = (await c.game.trades.create({ userId: c.first.id, opponentId: c.second.id, chatId, operationKey: 'create' })).trade;
  const request = { userId: c.first.id, chatId, code: trade.code, operationKey: 'invalid' };
  const before = contents(c.directory);
  await assert.rejects(c.game.trades.confirm(request), { code: 'EMPTY_TRADE' });
  await assert.rejects(c.game.trades.cancel({ ...request, chatId: 'other@g.us' }), { code: 'TRADE_WRONG_CHAT' });
  await assert.rejects(c.game.trades.cancel({ ...request, userId: outsider.id }), { code: 'TRADE_NOT_YOURS' });
  await assert.rejects(c.game.trades.getTrade({ ...request, userId: outsider.id }), { code: 'TRADE_NOT_YOURS' });
  await assert.rejects(c.game.trades.setOffer({ ...request, unitIds: [c.secondUnit.id] }), { code: 'UNIT_NOT_OWNED' });
  for (const coins of [-1, 0.5, NaN, Infinity, '20', Number.MAX_SAFE_INTEGER + 1])
    await assert.rejects(c.game.trades.setOffer({ ...request, coins }), { code: 'INVALID_COIN_AMOUNT' });
  await assert.rejects(c.game.trades.setOffer({ ...request, coins: 101 }), { code: 'INSUFFICIENT_COINS' });
  for (const unitIds of [[c.firstUnit.id, c.firstUnit.id], ['one', 'two', 'three', 'four'], null, ['']])
    await assert.rejects(c.game.trades.setOffer({ ...request, unitIds }), { code: 'INVALID_TRADE_OFFER' });
  for (const operationKey of ['', ' key ', null, 'x'.repeat(201)])
    await assert.rejects(c.game.trades.confirm({ ...request, operationKey }), { code: 'INVALID_OPERATION_KEY' });
  await assert.rejects(c.game.trades.create({ userId: c.first.id, opponentId: c.first.id, chatId, operationKey: 'self' }), { code: 'SELF_TRADE' });
  assert.deepEqual(contents(c.directory), before);
});

test('stable global codes, one open trade per pair and five open trades per player prevent spam', async t => {
  const c = await participants(t);
  const others = [c.second];
  for (let i = 0; i < 5; i++) others.push(await register(c.game, `Jugador ${i}`, `52122222222${i}`));
  const trades = [];
  for (const other of others.slice(0, 5)) trades.push((await c.game.trades.create({ userId: c.first.id, opponentId: other.id, chatId, operationKey: `create:${other.id}` })).trade);
  assert.deepEqual(trades.map(trade => trade.code), ['I1', 'I2', 'I3', 'I4', 'I5']);
  await assert.rejects(c.game.trades.create({ userId: c.second.id, opponentId: c.first.id, chatId: 'other@g.us', operationKey: 'pair-spam' }), { code: 'TRADE_ALREADY_OPEN' });
  await assert.rejects(c.game.trades.create({ userId: c.first.id, opponentId: others[5].id, chatId, operationKey: 'limit-spam' }), { code: 'TOO_MANY_TRADES' });
  const page = await c.game.trades.listMyTrades({ userId: c.first.id, page: 2, limit: 2 });
  assert.deepEqual(page.items.map(trade => trade.code), ['I3', 'I2']);
  assert.equal(page.totalPages, 3);
  await c.game.trades.cancel({ userId: c.second.id, chatId, code: 'I1', operationKey: 'cancel' });
  const next = (await c.game.trades.create({ userId: c.first.id, opponentId: others[5].id, chatId, operationKey: 'new' })).trade;
  assert.equal(next.code, 'I6');
  assert.equal((await c.game.trades.listMyTrades({ userId: c.first.id, status: 'open' })).totalItems, 5);
  assert.equal((await c.game.trades.listMyTrades({ userId: c.second.id })).items[0].code, 'I1');
});
