import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readRecords } from './helpers.js';
import { craftingFixture, craftSeal, earnSealMaterials, fightForMaterials } from './crafting-fixtures.js';
import { materialSources, materialRewardFor, RECIPES } from '../game/crafting/policy.js';

test('crafting publishes fixed recipes and rewards only valid immutable gameplay sources', () => {
  assert.deepEqual(RECIPES.map(recipe => recipe.id), ['sello_evolucion', 'insignia_bambu']);
  const at = '2026-10-13T12:00:00.000Z';
  const state = { recompensas: { records: [{ id: 'valid', userId: 'a', reason: 'rewarded', createdAt: at },
    { id: 'spam', userId: 'a', reason: 'pair_limit', createdAt: at }, { id: 'other', userId: 'b', reason: 'rewarded', createdAt: at }] },
  premioscontenido: { records: [{ id: 'event', kind: 'event', userId: 'a', createdAt: at },
    { id: 'capture', kind: 'spawn', userId: 'a', createdAt: at }, { id: 'future', kind: 'mission', userId: 'a', createdAt: '2027-01-01T00:00:00.000Z' }] },
  premiostemporada: { records: [{ id: 'season', userId: 'a', createdAt: at }] } };
  assert.deepEqual(materialSources(state, 'a', at).map(source => source.id), ['valid', 'event', 'season']);
  assert.deepEqual(materialRewardFor({ type: 'content', receipt: { kind: 'boss' } }), { fragmentos: 3, esencias: 1, sellos: 0 });
});

test('material claim is user-bound, restart-safe and every reward source is credited once', async t => {
  const c = await craftingFixture(t);
  await assert.rejects(c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'empty' }), { code: 'NO_MATERIALS_AVAILABLE' });
  const battle = await fightForMaterials(c);
  const result = await c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'claim' });
  assert.equal(result.alreadyClaimed, false);
  assert.equal(result.action.sources[0].id, `reward:${battle.id}:${c.user.id}`);
  assert.deepEqual(result.action.materialsAfter, { fragmentos: 2, esencias: 0, sellos: 0 });
  await assert.rejects(c.game.crafting.claimMaterials({ userId: c.rival.id, operationKey: 'claim' }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'claim-again' }), { code: 'NO_MATERIALS_AVAILABLE' });
  await c.game.close();
  const reopened = c.open().game;
  assert.equal((await reopened.crafting.claimMaterials({ userId: c.user.id, operationKey: 'claim' })).action.id, result.action.id);
  assert.deepEqual((await reopened.crafting.getInventory(c.user.id)).materials, result.action.materialsAfter);
  assert.equal((await reopened.validateDatabase()).valid, true);
});

test('ineligible repeated rival matches never create new materials', async t => {
  const c = await craftingFixture(t);
  for (let index = 0; index < 4; index++) await fightForMaterials(c);
  const inventory = await c.game.crafting.getInventory(c.user.id);
  assert.equal(inventory.pendingSources, 3);
  assert.equal(inventory.pendingMaterials.fragmentos, 6);
  await c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'earned' });
  assert.equal((await c.game.crafting.getInventory(c.user.id)).pendingSources, 0);
});

test('crafting consumes resources and coins atomically under concurrency and replay', async t => {
  const c = await craftingFixture(t);
  await earnSealMaterials(c);
  const beforeCoins = (await c.game.economy.getBalance(c.user.id)).coins;
  const race = await Promise.allSettled([craftSeal(c, 'craft-a'), craftSeal(c, 'craft-b')]);
  assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(race.find(result => result.status === 'rejected').reason.code, 'INSUFFICIENT_MATERIALS');
  const crafted = race.find(result => result.status === 'fulfilled').value;
  assert.deepEqual(crafted.action.materialsAfter, { fragmentos: 1, esencias: 0, sellos: 1 });
  assert.equal((await c.game.economy.getBalance(c.user.id)).coins, beforeCoins - 100);
  assert.equal((await c.game.crafting.craft({ userId: c.user.id, recipeId: 'sello_evolucion', operationKey: crafted.action.operationKey })).alreadyCrafted, true);
  assert.equal(readRecords(c.directory, 'economia').filter(row => row.sourceType === 'crafting_cost').length, 1);
  await assert.rejects(c.game.crafting.craft({ userId: c.user.id, recipeId: 'not-a-recipe', operationKey: 'fake' }), { code: 'RECIPE_NOT_FOUND' });
});

test('cosmetic crafting is permanent, does not change units and cannot charge twice', async t => {
  const c = await craftingFixture(t);
  await fightForMaterials(c);
  await c.game.content.claimEvent({ userId: c.user.id, eventId: 'faroles', operationKey: 'welcome' });
  await c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'cosmetic-materials' });
  const unitBefore = readRecords(c.directory, 'unidades');
  const output = await c.game.crafting.craft({ userId: c.user.id, recipeId: 'insignia_bambu', operationKey: 'badge' });
  assert.equal(output.action.badge, 'bambu_artesano');
  assert.deepEqual((await c.game.crafting.getInventory(c.user.id)).badges, ['bambu_artesano']);
  assert.deepEqual(readRecords(c.directory, 'unidades'), unitBefore);
  await assert.rejects(c.game.crafting.craft({ userId: c.user.id, recipeId: 'insignia_bambu', operationKey: 'duplicate-badge' }), { code: 'COSMETIC_ALREADY_OWNED' });
  await assert.rejects(c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'badge' }), { code: 'OPERATION_CONFLICT' });
});

test('forged crafting receipts, duplicate rewards and editable materials are refused', async t => {
  const c = await craftingFixture(t);
  await fightForMaterials(c);
  await c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'valid' });
  const filename = path.join(c.directory, 'artesania.json');
  const clean = fs.readFileSync(filename, 'utf8');
  const tampered = JSON.parse(clean);
  tampered.records[0].materialsAfter.fragmentos += 1;
  fs.writeFileSync(filename, JSON.stringify(tampered));
  await assert.rejects(c.game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  fs.writeFileSync(filename, clean);
  await assert.rejects(c.storage.withTransaction(async repos => {
    const action = (await repos.craftingActions.all())[0];
    await repos.craftingActions.replace({ ...action, operationKey: 'edited' });
  }), { code: 'DATABASE_CORRUPT' });
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('a material claim fails before charging when the clock or operation key is invalid', async t => {
  const c = await craftingFixture(t);
  await c.game.content.claimEvent({ userId: c.user.id, eventId: 'faroles', operationKey: 'clock-event' });
  await assert.rejects(c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: ' ' }), { code: 'INVALID_OPERATION_KEY' });
  c.setTime('invalid');
  await assert.rejects(c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'bad-clock' }), { code: 'INVALID_CLOCK' });
  c.setTime('2026-10-12T12:00:00.000Z');
  await assert.rejects(c.game.crafting.claimMaterials({ userId: c.user.id, operationKey: 'past-clock' }), { code: 'NO_MATERIALS_AVAILABLE' });
});
