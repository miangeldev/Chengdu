import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readRecords } from './helpers.js';
import { craftingFixture, craftSeal, earnSealMaterials } from './crafting-fixtures.js';

async function legacyMintFixture(t) {
  const context = await craftingFixture(t, { level: 5 });
  await earnSealMaterials(context);
  await craftSeal(context);
  await context.game.close();
  const filename = path.join(context.directory, 'eventos.json');
  const events = JSON.parse(fs.readFileSync(filename, 'utf8'));
  for (const event of events.records) if (event.type === 'unit_created') delete event.ownershipVersion;
  fs.writeFileSync(filename, JSON.stringify(events, null, 2) + '\n');
  Object.assign(context, context.open());
  assert.equal((await context.game.validateDatabase()).valid, true);
  return context;
}

test('an original custodian can evolve a valid legacy mint that omits ownershipVersion', async t => {
  const context = await legacyMintFixture(t);
  const history = readRecords(context.directory, 'eventos');
  const beforeCoins = (await context.game.economy.getBalance(context.user.id)).coins;
  const result = await context.game.evolution.evolve({ userId: context.user.id, unitId: context.unit.id,
    operationKey: 'legacy-mint:evolve' });
  assert.equal(result.alreadyEvolved, false);
  assert.equal(result.evolution.ownershipVersion, 0);
  assert.equal(result.evolution.after.formId, 'panda_maestro');
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, beforeCoins - 300);
  assert.equal((await context.game.crafting.getInventory(context.user.id)).materials.sellos, 0);
  assert.deepEqual(readRecords(context.directory, 'eventos'), history);
  assert.equal((await context.game.validateDatabase()).valid, true);
  await context.game.close();
  Object.assign(context, context.open());
  const replay = await context.game.evolution.evolve({ userId: context.user.id, unitId: context.unit.id,
    operationKey: 'legacy-mint:evolve' });
  assert.equal(replay.alreadyEvolved, true);
  assert.deepEqual(replay.evolution, result.evolution);
  assert.equal(readRecords(context.directory, 'evoluciones').length, 1);
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, beforeCoins - 300);
});

test('an evolved legacy mint preserves its evolution proof after a real ownership transfer', async t => {
  const context = await legacyMintFixture(t);
  const evolved = await context.game.evolution.evolve({ userId: context.user.id, unitId: context.unit.id,
    operationKey: 'legacy-transfer:evolve' });
  await context.game.economy.claimDaily({ userId: context.rival.id, operationKey: 'legacy-transfer:daily' });
  const listing = (await context.game.market.createListing({ sellerId: context.user.id, unitId: context.unit.id,
    price: 20, operationKey: 'legacy-transfer:list' })).listing;
  await context.game.market.buyListing({ buyerId: context.rival.id, listingId: listing.code,
    operationKey: 'legacy-transfer:purchase' });
  const unit = readRecords(context.directory, 'unidades').find(row => row.id === context.unit.id);
  assert.equal(unit.ownerId, context.rival.id);
  assert.equal(unit.ownershipVersion, 1);
  assert.deepEqual(unit.evolution, evolved.evolution.after);
  assert.equal((await context.game.validateDatabase()).valid, true);
  await context.game.close();
  assert.equal((await context.open().game.validateDatabase()).valid, true);
});
