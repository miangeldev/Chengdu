import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, V3_COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { readRecords, register, setup, updateCharacter } from './helpers.js';

// A real schema-3 opening balance: migrate it instead of bypassing coin auditing.
async function funded(t, coins = 1000, options = {}) {
  const c = setup(t, { randomDropInt: () => 0, randomRoll: () => 0, ...options });
  c.user = await register(c.game);
  await c.game.close();
  for (const name of V3_COLLECTIONS) {
    const file = path.join(c.directory, `${name}.json`);
    const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
    collection._meta.schemaVersion = 3;
    if (name === 'usuarios') collection.records[0].economy.coins = coins;
    if (name === 'estado') collection.records.find(r => r.id === `progression:${c.user.id}`).coins = coins;
    fs.writeFileSync(file, JSON.stringify(collection));
  }
  for (const name of ['sobres', 'aperturas', 'economia']) fs.unlinkSync(path.join(c.directory, `${name}.json`));
  fs.writeFileSync(path.join(c.directory, '_database.json'), JSON.stringify({ database: 'chengdu-cards', schemaVersion: 3 }));
  Object.assign(c, c.open());
  await c.game.validateDatabase();
  return c;
}

function contents(directory) {
  return Object.fromEntries(COLLECTIONS.map(name => [name, fs.readFileSync(path.join(directory, `${name}.json`), 'utf8')]));
}

test('opening debits once, emits a unique collectible and preserves its receipt across concurrent delivery and restart', async t => {
  let rolls = 0;
  const c = await funded(t, 1000, { randomDropInt: () => { rolls++; return 0; } });
  const request = { userId: c.user.id, packId: 'basico', operationKey: 'opening-message' };
  const results = await Promise.all([c.game.packs.openPack(request), c.game.packs.openPack(request)]);
  assert.deepEqual(results.map(r => r.alreadyOpened), [false, true]);
  assert.deepEqual(results[0].opening, results[1].opening);
  assert.equal(rolls, 4);
  assert.equal(results[0].opening.price, 500);
  assert.equal(results[0].opening.balanceAfter, 500);
  const unit = results[0].unit;
  assert.equal(unit.ownerId, c.user.id);
  assert.equal(unit.origin.type, 'pack');
  assert.equal(unit.origin.sourceId, results[0].opening.id);
  assert.equal(unit.traitVersion, 1);
  assert.equal(readRecords(c.directory, 'unidades').length, 1);
  assert.equal(readRecords(c.directory, 'aperturas').length, 1);
  assert.equal(readRecords(c.directory, 'economia').length, 1);
  const before = contents(c.directory);
  await c.game.close();
  c.game = c.open({ randomDropInt: () => { throw new Error('a replay cannot roll again'); } }).game;
  const replay = await c.game.packs.openPack(request);
  assert.equal(replay.alreadyOpened, true);
  assert.deepEqual(replay.opening, results[0].opening);
  assert.deepEqual(contents(c.directory), before);
  assert.deepEqual((await c.game.units.getUnit(unit.id)).pack, { id: 'basico', name: 'Sobre Básico', revision: 1 });
});

test('insufficient balance, unknown pack, missing key and invalid RNG leave all collections unchanged', async t => {
  let rolls = 0;
  const c = await funded(t, 499, { randomDropInt: () => { rolls++; return -1; } });
  const request = { userId: c.user.id, packId: 'basico', operationKey: 'failed-message' };
  const before = contents(c.directory);
  await assert.rejects(c.game.packs.openPack(request), { code: 'INSUFFICIENT_COINS' });
  assert.equal(rolls, 0);
  await assert.rejects(c.game.packs.openPack({ ...request, packId: 'inexistente' }), { code: 'PACK_NOT_FOUND' });
  await assert.rejects(c.game.packs.openPack({ ...request, operationKey: null }), { code: 'INVALID_OPERATION_KEY' });
  assert.deepEqual(contents(c.directory), before);
  const enough = await funded(t, 500, { randomDropInt: () => -1 });
  const secondBefore = contents(enough.directory);
  await assert.rejects(enough.game.packs.openPack({ ...request, userId: enough.user.id }), { code: 'INVALID_RANDOM_ROLL' });
  assert.deepEqual(contents(enough.directory), secondBefore);
});

test('drop records its original catalog and pack while later revisions cannot rewrite it or its birth properties', async t => {
  const rolls = [9999, 0, 9999, 0, 0, 9999];
  const c = await funded(t, 500, { randomDropInt: () => rolls.shift() });
  const request = { userId: c.user.id, packId: 'basico', operationKey: 'golden-dragon' };
  const { opening, unit } = await c.game.packs.openPack(request);
  assert.equal(opening.result.rarity, 'legendary');
  assert.equal(unit.variant, 'golden');
  assert.deepEqual(unit.traits, ['robust', 'aggressive']);
  const detail = await c.game.units.getUnit(unit.id);
  assert.equal(detail.currentStats.hp, unit.initialStats.hp + Math.floor(unit.initialStats.hp * 0.03));
  assert.equal(detail.currentStats.attack, unit.initialStats.attack + 1);
  await updateCharacter(c.storage, unit.characterId, { name: 'Dragón Nuevo', rarity: 'epic', baseStats: { hp: 140, attack: 40, defense: 20, speed: 10 } });
  await c.storage.withTransaction(async repos => {
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, name: 'Sobre Revisado', price: 600, revision: pack.revision + 1 });
  });
  assert.deepEqual((await c.game.packs.openPack(request)).opening, opening);
  const futureRevision = Object.fromEntries(Object.entries(contents(c.directory)).map(([name, raw]) => [name, JSON.parse(raw)]));
  futureRevision.aperturas.records[0].packRevision = 99;
  futureRevision.aperturas.records[0].packSnapshot.revision = 99;
  assert.throws(() => validateDatabase(futureRevision), { code: 'DATABASE_CORRUPT' });
  assert.equal((await c.game.validateDatabase()).valid, true); // Revision 1 receipt remains valid under revision 2.
  assert.deepEqual((await c.game.units.getUnit(unit.id)).initialStats, unit.initialStats);
  for (const change of [{ traits: [] }, { variant: 'normal' }, { traitVersion: 0 }]) {
    await assert.rejects(c.storage.withTransaction(repos => repos.units.replace({ ...unit, ...change })), { code: 'DATABASE_CORRUPT' });
  }
});

test('last limited-supply drop is assigned to one concurrent buyer and unavailable outcomes are excluded before charging', async t => {
  const c = await funded(t, 1000);
  for (const character of (await c.game.characters.listCharacters()).items) {
    await updateCharacter(c.storage, character.id, character.id === 'dragon_carmesi' ? { supply: { type: 'limited', max: 1 } } : { obtainable: false });
  }
  const pack = (await c.game.packs.listPacks()).items[0];
  assert.deepEqual(pack.odds, [{ rarity: 'legendary', weight: 100, totalWeight: 100, characterCount: 1 }]);
  const requests = ['last-1', 'last-2'].map(operationKey => ({ userId: c.user.id, packId: 'basico', operationKey }));
  const results = await Promise.allSettled(requests.map(r => c.game.packs.openPack(r)));
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'PACK_UNAVAILABLE');
  assert.equal(readRecords(c.directory, 'unidades')[0].serial, 1);
  assert.equal((await c.game.economy.getBalance(c.user.id)).coins, 500);
  assert.equal((await c.game.packs.listPacks()).items[0].available, false);
});

test('starters, administrator emissions and packs share serial counters and cannot forge a pack through the mint API', async t => {
  const c = await funded(t, 500, { randomDropInt: upper => upper === 3 ? 2 : 0 });
  const starter = (await c.game.starter.claimStarter({ userId: c.user.id, choice: 'panda' })).unit;
  const admin = await c.game.units.createUnit({ ownerId: c.user.id, characterId: 'panda_guerrero', origin: { type: 'admin', sourceId: 'test' }, operationKey: 'admin-panda' });
  const { unit } = await c.game.packs.openPack({ userId: c.user.id, packId: 'basico', operationKey: 'pack-panda' });
  assert.deepEqual([starter.serial, admin.serial, unit.serial], [1, 2, 3]);
  assert.equal(unit.characterId, starter.characterId);
  assert.deepEqual(unit.initialStats, starter.initialStats);
  await assert.rejects(c.game.units.createUnit({ ownerId: c.user.id, characterId: 'panda_guerrero', origin: { type: 'pack', sourceId: 'fake' }, operationKey: 'fake' }), { code: 'INVALID_ORIGIN' });
});

test('traits enter a frozen battle snapshot and cosmetic variants do not change stats', async t => {
  const rolls = [0, 2, 9999, 0, 0, 9999];
  const c = await funded(t, 500, { randomDropInt: () => rolls.shift() });
  const { unit } = await c.game.packs.openPack({ userId: c.user.id, packId: 'basico', operationKey: 'traited-panda' });
  const opponent = await register(c.game, 'Lukas', '521111111111');
  const wolf = (await c.game.starter.claimStarter({ userId: opponent.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: c.user.id, unitIds: [unit.id] });
  await c.game.teams.setTeam({ userId: opponent.id, unitIds: [wolf.id] });
  await c.game.battle.challenge({ userId: c.user.id, opponentId: opponent.id, chatId: 'arena' });
  const { battle } = await c.game.battle.accept({ userId: opponent.id, chatId: 'arena' });
  const snapshot = battle.players[0].unit;
  assert.equal(snapshot.variant, 'golden');
  assert.deepEqual(snapshot.traits, ['robust', 'aggressive']);
  assert.equal(snapshot.stats.hp, 123);
  assert.equal(snapshot.stats.attack, 26);
  assert.equal(snapshot.stats.speed, unit.initialStats.speed);
  assert.equal((await c.game.units.getCombatDetails({ unitId: unit.id })).units[0].stats.hp, 123);
  await updateCharacter(c.storage, unit.characterId, { baseStats: { hp: 150, attack: 50, defense: 25, speed: 12 } });
  assert.deepEqual((await c.game.battle.getMyBattle({ userId: c.user.id, chatId: 'arena' })).players[0].unit, snapshot);
});

test('coin audit reconstructs balances when combat credits follow a pack debit', async t => {
  const c = await funded(t, 500);
  await c.game.packs.openPack({ userId: c.user.id, packId: 'basico', operationKey: 'spent-balance' });
  const panda = (await c.game.starter.claimStarter({ userId: c.user.id, choice: 'panda' })).unit;
  const opponent = await register(c.game, 'Lukas', '521111111111');
  const wolf = (await c.game.starter.claimStarter({ userId: opponent.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: c.user.id, unitIds: [panda.id] });
  await c.game.teams.setTeam({ userId: opponent.id, unitIds: [wolf.id] });
  await c.game.battle.challenge({ userId: c.user.id, opponentId: opponent.id, chatId: 'arena' });
  let battle = (await c.game.battle.accept({ userId: opponent.id, chatId: 'arena' })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: 'arena', choice: '2' })).battle;
  assert.equal(battle.winnerId, c.user.id);
  assert.equal((await c.game.economy.getBalance(c.user.id)).coins, 120);
  assert.deepEqual(readRecords(c.directory, 'economia').map(m => m.type), ['debit', 'credit', 'credit']);
  assert.equal((await c.game.validateDatabase()).valid, true);
  await c.game.close();
  assert.equal((await c.open().game.economy.getBalance(c.user.id)).coins, 120);
});

test('opening and movement audits reject forged prices, balances, identities, source edits and missing sources', async t => {
  const c = await funded(t, 1000);
  const { opening } = await c.game.packs.openPack({ userId: c.user.id, packId: 'basico', operationKey: 'protected-opening' });
  const before = contents(c.directory);
  const changes = [
    async repos => { await repos.openings.replace({ ...opening, price: 1 }); },
    async repos => { const movement = (await repos.economy.all())[0]; await repos.economy.replace({ ...movement, amount: 1 }); },
    async repos => { const user = await repos.users.get(c.user.id); await repos.users.replace({ ...user, economy: { coins: 999 } }); },
    async repos => { await repos.economy.insert({ id: 'coin:fake', userId: c.user.id, type: 'credit', sourceType: 'battle_reward', sourceId: 'fake', amount: 100, balanceBefore: 500, balanceAfter: 600, createdAt: opening.createdAt }); },
    async repos => { const pack = await repos.packs.get('basico'); await repos.packs.replace({ ...pack, price: 1 }); }
  ];
  for (const change of changes) await assert.rejects(c.storage.withTransaction(change), { code: 'DATABASE_CORRUPT' });
  assert.deepEqual(contents(c.directory), before);
  await assert.rejects(c.game.packs.openPack({ userId: c.user.id, packId: 'otro', operationKey: opening.operationKey }), { code: 'OPERATION_CONFLICT' });
});

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:unidades.json', 'published:aperturas.json', 'published:economia.json']) {
  test(`pack payment, emission, traits and receipt recover together at ${stage}`, async t => {
    const c = await funded(t, 500);
    const request = { userId: c.user.id, packId: 'basico', operationKey: 'interrupted-opening' };
    await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted pack'); } }).game;
    await assert.rejects(failed.packs.openPack(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const game = c.open().game;
    const committed = stage !== 'prepared';
    assert.equal((await game.economy.getBalance(c.user.id)).coins, committed ? 0 : 500);
    assert.equal(readRecords(c.directory, 'aperturas').length, committed ? 1 : 0);
    assert.equal(readRecords(c.directory, 'unidades').length, committed ? 1 : 0);
    assert.equal((await game.packs.openPack(request)).alreadyOpened, committed);
    assert.equal((await game.economy.getBalance(c.user.id)).coins, 0);
    assert.equal(readRecords(c.directory, 'aperturas').length, 1);
    assert.equal(readRecords(c.directory, 'economia').length, 1);
    assert.equal(readRecords(c.directory, 'eventos').length, 1);
    assert.equal((await game.validateDatabase()).valid, true);
  });
}
