import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { ownershipAt, transferUnitInTransaction } from '../game/units/ownership.js';
import { readRecords, register, setup } from './helpers.js';

async function world(t) {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now, randomRoll: () => 0, randomDropInt: () => 0 });
  c.a = await register(c.game);
  c.b = await register(c.game, 'Lukas', '521111111111');
  c.c = await register(c.game, 'Carlos', '521222222222');
  c.advance = (amount = 86_400_000) => { now = new Date(Date.parse(now) + amount).toISOString(); };
  c.setTime = value => { now = value; };
  c.now = () => now;
  return c;
}

function state(directory) {
  return Object.fromEntries(COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));
}

async function sell(c, sellerId, buyerId, unitId, key, price = 100) {
  const { listing } = await c.game.market.createListing({ sellerId, unitId, price, operationKey: `list:${key}` });
  return c.game.market.buyListing({ buyerId, listingId: listing.id, operationKey: `buy:${key}` });
}

async function fight(c, ownerId, pandaId, wolfId, key) {
  await c.game.teams.setTeam({ userId: ownerId, unitIds: [pandaId] });
  await c.game.teams.setTeam({ userId: c.c.id, unitIds: [wolfId] });
  const chatId = `ownership-arena:${key}`;
  await c.game.battle.challenge({ userId: ownerId, opponentId: c.c.id, chatId });
  let battle = (await c.game.battle.accept({ userId: c.c.id, chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
  assert.equal(battle.winnerId, ownerId);
  return battle;
}

test('trained units retain their birth, XP and combat histories through sales and a return to their original owner', async t => {
  const c = await world(t);
  const panda = (await c.game.starter.claimStarter({ userId: c.a.id, choice: 'panda' })).unit;
  const wolf = (await c.game.starter.claimStarter({ userId: c.c.id, choice: 'lobo' })).unit;
  const originalBattles = [];
  for (let index = 0; index < 3; index++) originalBattles.push(await fight(c, c.a.id, panda.id, wolf.id, `first-${index}`));
  const trained = await c.game.units.getUnit(panda.id);
  assert.deepEqual(trained.progress, { level: 2, xp: 5 });
  await c.game.economy.claimDaily({ userId: c.b.id, operationKey: 'buyer-money' });
  const first = await sell(c, c.a.id, c.b.id, panda.id, 'first');
  assert.equal(first.unit.ownershipVersion, 1);
  assert.equal(first.unit.ownerId, c.b.id);
  assert.deepEqual(first.unit.progress, trained.progress);
  assert.deepEqual(first.unit.battleStats, trained.battleStats);
  assert.deepEqual((await c.game.teams.getTeam(c.a.id)).units, []);
  const nextBattle = await fight(c, c.b.id, panda.id, wolf.id, 'second-owner');
  assert.equal(nextBattle.players[0].unit.ownershipVersion, 1);
  assert.equal(nextBattle.players[0].unit.level, 2);
  const beforeSecond = await c.game.units.getUnit(panda.id);
  const second = await sell(c, c.b.id, c.a.id, panda.id, 'return');
  assert.equal(second.unit.ownershipVersion, 2);
  assert.equal(second.unit.ownerId, c.a.id);
  assert.deepEqual(second.unit.progress, { level: 2, xp: 40 });
  assert.deepEqual(second.unit.battleStats, beforeSecond.battleStats);
  for (const key of ['characterId', 'characterRevision', 'serial', 'origin', 'initialStats', 'combatBaseStats', 'createdAt', 'traits', 'variant', 'traitVersion']) {
    assert.deepEqual(second.unit[key], panda[key]);
  }
  for (const battle of originalBattles) assert.deepEqual(await c.game.battle.getHistoryBattle({ userId: c.a.id, battleId: battle.id }), battle);
  assert.deepEqual(await c.game.battle.getHistoryBattle({ userId: c.b.id, battleId: nextBattle.id }), nextBattle);
  const database = state(c.directory);
  assert.equal(ownershipAt(database, panda.id, 0), c.a.id);
  assert.equal(ownershipAt(database.eventos.records, panda.id, 1), c.b.id);
  assert.equal(ownershipAt(database, panda.id, 2), c.a.id);
  assert.equal(ownershipAt(database, panda.id, 3), null);
  // Old closed snapshots did not store this field; their historical owner is version zero.
  const legacy = structuredClone(database);
  for (const battle of legacy.combates.records) for (const player of battle.players) {
    if (player.unit?.ownershipVersion === 0) delete player.unit.ownershipVersion;
  }
  assert.equal(validateDatabase(legacy).valid, true);
  const badSnapshot = structuredClone(database);
  badSnapshot.combates.records.find(battle => battle.id === nextBattle.id).players[0].unit.ownershipVersion = 0;
  assert.throws(() => validateDatabase(badSnapshot), { code: 'DATABASE_CORRUPT' });
  const firstPage = await c.game.units.getOwnershipHistory(panda.id.toLowerCase(), { limit: 1 });
  assert.deepEqual(firstPage.currentOwner, { id: c.a.id, name: c.a.name });
  assert.equal(firstPage.items[0].type, 'unit_created');
  assert.equal(firstPage.items[0].fromOwner, null);
  assert.deepEqual(firstPage.items[0].toOwner, { id: c.a.id, name: c.a.name });
  const nextPage = await c.game.units.getOwnershipHistory(panda.id, { limit: 1, cursor: firstPage.nextCursor });
  assert.equal(nextPage.items[0].ownershipVersion, 1);
  assert.deepEqual(nextPage.items[0].toOwner, { id: c.b.id, name: c.b.name });
  assert.ok(!JSON.stringify(nextPage).includes('identities'));
  assert.ok(!JSON.stringify(nextPage).includes('operationKey'));
  assert.ok(!JSON.stringify(nextPage).includes('sourceId'));
  await assert.rejects(c.game.units.getOwnershipHistory(wolf.id, { cursor: firstPage.nextCursor }), { code: 'INVALID_CURSOR' });
  await c.game.close();
  c.game = c.open().game;
  assert.equal((await c.game.validateDatabase()).valid, true);
  assert.equal((await c.game.units.getUnit(panda.id)).owner.id, c.a.id);
});

test('pack receipts and starter claims preserve their original buyer after both units have been sold', async t => {
  const c = await world(t);
  for (let day = 0; day < 5; day++) {
    await c.game.economy.claimDaily({ userId: c.a.id, operationKey: `pack-money:${day}` });
    c.advance();
  }
  await c.game.economy.claimDaily({ userId: c.b.id, operationKey: 'first-purchase-money' });
  const request = { userId: c.a.id, packId: 'basico', operationKey: 'birth-pack' };
  const opened = await c.game.packs.openPack(request);
  const starter = (await c.game.starter.claimStarter({ userId: c.a.id, choice: 'lobo' })).unit;
  const counters = readRecords(c.directory, 'estado').filter(record => record.kind === 'mintCounter');
  await sell(c, c.a.id, c.b.id, opened.unit.id, 'pack');
  c.advance();
  await c.game.economy.claimDaily({ userId: c.b.id, operationKey: 'second-purchase-money' });
  await sell(c, c.a.id, c.b.id, starter.id, 'starter');
  const replay = await c.game.packs.openPack(request);
  assert.equal(replay.alreadyOpened, true);
  assert.deepEqual(replay.opening, opened.opening);
  assert.equal(replay.unit.ownerId, c.b.id);
  const starterReplay = await c.game.starter.claimStarter({ userId: c.a.id, choice: 'panda' });
  assert.equal(starterReplay.alreadyClaimed, true);
  assert.equal(starterReplay.unit.id, starter.id);
  assert.equal(starterReplay.unit.ownerId, c.b.id);
  assert.deepEqual(readRecords(c.directory, 'estado').filter(record => record.kind === 'mintCounter'), counters);
  assert.equal(readRecords(c.directory, 'unidades').length, 2);
  assert.equal(readRecords(c.directory, 'eventos').filter(event => event.type === 'unit_created').length, 2);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('mint replay keeps the original emission while owner changes require an authentic consecutive sale event', async t => {
  const c = await world(t);
  const request = { ownerId: c.a.id, characterId: 'panda_guerrero', origin: { type: 'admin', sourceId: 'test' }, operationKey: 'admin-emission' };
  const unit = await c.game.units.createUnit(request);
  await c.game.economy.claimDaily({ userId: c.b.id, operationKey: 'purchase-money' });
  const bought = await sell(c, c.a.id, c.b.id, unit.id, 'admin');
  assert.equal((await c.game.units.createUnit(request)).ownerId, c.b.id);
  assert.equal(readRecords(c.directory, 'unidades').length, 1);
  await assert.rejects(c.game.units.createUnit({ ...request, operationKey: `transfer:${bought.sale.id}` }), { code: 'OPERATION_CONFLICT' });
  const valid = state(c.directory);
  const corruptions = [
    database => { database.unidades.records[0].ownerId = c.a.id; },
    database => { database.unidades.records[0].ownershipVersion = 0; },
    database => { database.eventos.records.find(event => event.type === 'unit_transferred').ownershipVersion = 2; },
    database => { database.eventos.records.find(event => event.type === 'unit_transferred').fromOwnerId = c.c.id; },
    database => { database.eventos.records.find(event => event.type === 'unit_transferred').sourceId = `SALE-${randomUUID()}`; },
    database => { database.eventos.records.reverse(); },
    database => { database.ventas.records[0].fromOwnershipVersion = 4; }
  ];
  for (const corrupt of corruptions) {
    const candidate = structuredClone(valid);
    corrupt(candidate);
    assert.throws(() => validateDatabase(candidate), { code: 'DATABASE_CORRUPT' });
  }
  await assert.rejects(c.storage.withTransaction(async repos => {
    const current = await repos.units.get(unit.id);
    await repos.units.replace({ ...current, ownerId: c.a.id, ownershipVersion: 2 });
  }), { code: 'DATABASE_CORRUPT' });
  await assert.rejects(c.storage.withTransaction(async repos => {
    const event = await repos.events.find(record => record.type === 'unit_transferred');
    await repos.events.replace({ ...event, operationKey: 'edited-history' });
  }), { code: 'DATABASE_CORRUPT' });
  await assert.rejects(c.storage.withTransaction(repos => transferUnitInTransaction(repos,
    { unitId: unit.id, fromOwnerId: c.b.id, toOwnerId: c.c.id, sourceId: `SALE-${randomUUID()}` }, c.now())), { code: 'UNIT_LOCKED' });
  assert.deepEqual(state(c.directory), valid);
});

test('listing locks prevent team use and release through ordinary unit and team reads at expiry', async t => {
  const c = await world(t);
  const unit = (await c.game.starter.claimStarter({ userId: c.a.id, choice: 'panda' })).unit;
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [unit.id] });
  const { listing } = await c.game.market.createListing({ sellerId: c.a.id, unitId: unit.id, price: 100, operationKey: 'listed' });
  assert.deepEqual((await c.game.teams.getTeam(c.a.id)).units, []);
  await assert.rejects(c.game.teams.setTeam({ userId: c.a.id, unitIds: [unit.id] }), { code: 'UNIT_LOCKED' });
  c.setTime(listing.expiresAt);
  await c.game.teams.getTeam(c.a.id);
  assert.equal((await c.game.units.getUnit(unit.id)).lock, null);
  assert.equal((await c.game.market.getListing(listing.id)).status, 'expired');
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [unit.id] });
  assert.equal((await c.game.units.getUnit(unit.id)).ownershipVersion, 0);
  assert.equal(readRecords(c.directory, 'eventos').length, 1);
});
