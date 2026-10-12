import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { COLLECTIONS, V6_COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

const serialize = value => JSON.stringify(value, null, 2) + '\n';

async function v6Fixture(t) {
  const c = setup(t, { clock: () => '2026-10-11T10:00:00.000Z', randomRoll: () => 0, randomDropInt: () => 0 });
  const seller = await register(c.game);
  const buyer = await register(c.game, 'Lukas', '521111111111');
  const unit = (await c.game.starter.claimStarter({ userId: seller.id, choice: 'panda' })).unit;
  const opponent = (await c.game.starter.claimStarter({ userId: buyer.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: seller.id, unitIds: [unit.id] });
  await c.game.teams.setTeam({ userId: buyer.id, unitIds: [opponent.id] });
  const chatId = 'market-migration-arena';
  await c.game.battle.challenge({ userId: seller.id, opponentId: buyer.id, chatId });
  let battle = (await c.game.battle.accept({ userId: buyer.id, chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
  await c.storage.withTransaction(async repos => {
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, revision: pack.revision + 1, price: 100 });
  });
  const opening = await c.game.packs.openPack({ userId: seller.id, packId: 'basico', operationKey: 'before-market-opening' });
  const daily = await c.game.economy.claimDaily({ userId: buyer.id, operationKey: 'before-market-daily' });
  await c.game.battle.challenge({ userId: seller.id, opponentId: buyer.id, chatId });
  await c.game.battle.accept({ userId: buyer.id, chatId });
  await c.game.close();
  const state = Object.fromEntries(V6_COLLECTIONS.map(name => [name,
    JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))]));
  for (const collection of Object.values(state)) collection._meta.schemaVersion = 6;
  for (const record of state.unidades.records) delete record.ownershipVersion;
  for (const event of state.eventos.records) delete event.ownershipVersion;
  for (const record of state.combates.records) for (const player of record.players) if (player.unit) delete player.unit.ownershipVersion;
  validateDatabase(state, 6);
  const raw = Object.fromEntries(V6_COLLECTIONS.map(name => [`${name}.json`, serialize(state[name])]));
  raw['_database.json'] = serialize({ database: 'chengdu-cards', schemaVersion: 6 });
  for (const [file, body] of Object.entries(raw)) fs.writeFileSync(path.join(c.directory, file), body);
  for (const name of ['mercado', 'ventas']) fs.unlinkSync(path.join(c.directory, `${name}.json`));
  return { ...c, seller, buyer, unit, opening, daily, raw, state };
}

function assertPreserved(c) {
  for (const name of V6_COLLECTIONS) {
    const expected = name === 'unidades' ? c.state[name].records.map(unit => ({ ...unit, ownershipVersion: 0 })) : c.state[name].records;
    assert.deepEqual(readRecords(c.directory, name), expected, name);
  }
  assert.deepEqual(readRecords(c.directory, 'mercado'), []);
  assert.deepEqual(readRecords(c.directory, 'ventas'), []);
  assert.equal(readRecords(c.directory, 'eventos').some(e => e.type === 'unit_transferred'), false);
  assert.equal(readRecords(c.directory, 'economia').some(m => m.sourceType.startsWith('market_')), false);
}

test('schema 6 market migration preserves every historical record, balance and snapshot without retroactive sales or fees', async t => {
  const c = await v6Fixture(t);
  const game = c.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, 8);
  assertPreserved(c);
  assert.equal((await game.economy.getBalance(c.seller.id)).coins, 20);
  assert.equal((await game.economy.getBalance(c.buyer.id)).coins, 100);
  for (const name of V6_COLLECTIONS) {
    const metadata = JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))._meta;
    assert.equal(metadata.schemaVersion, 8);
    assert.equal(metadata.revision, c.state[name]._meta.revision + 2);
  }
  const snapshots = fs.readdirSync(path.join(c.directory, 'backups')).map(id =>
    JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(snapshot => V6_COLLECTIONS.every(name => snapshot.files[`${name}.json`] === c.raw[`${name}.json`]) &&
    snapshot.files['mercado.json'] === null && snapshot.files['ventas.json'] === null));
});

for (const stage of ['prepared', 'committed', 'published:unidades.json', 'published:mercado.json', 'published:ventas.json', 'published:_database.json']) {
  test(`schema 6 market migration recovers at ${stage}`, async t => {
    const c = await v6Fixture(t);
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted market migration'); } }).game;
    await assert.rejects(failed.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    const journal = JSON.parse(fs.readFileSync(path.join(c.directory, '_journal.json'), 'utf8'));
    assert.equal(Object.keys(journal.body.after).length, COLLECTIONS.length + 1);
    await failed.close();
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 8);
    assertPreserved(c);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`old schema 6 ${phase} journal recovers its thirteen files before introducing market data`, async t => {
    const c = await v6Fixture(t);
    const after = { ...c.raw };
    const packs = JSON.parse(after['sobres.json']);
    packs.records[0].name = 'Sobre Histórico';
    packs.records[0].revision++;
    after['sobres.json'] = serialize(packs);
    const body = { id: randomUUID(), before: c.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(c.directory, '_journal.json'), serialize({ version: 1, phase, body, checksum }));
    if (phase === 'committed') fs.writeFileSync(path.join(c.directory, 'sobres.json'), after['sobres.json']);
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 8);
    if (phase === 'committed') c.state.sobres = packs;
    assertPreserved(c);
    assert.equal(readRecords(c.directory, 'sobres')[0].name, phase === 'committed' ? 'Sobre Histórico' : JSON.parse(c.raw['sobres.json']).records[0].name);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const name of ['mercado', 'ventas']) {
  test(`unexpected ${name} data in a schema 6 directory is preserved and blocks migration`, async t => {
    const c = await v6Fixture(t);
    const evidence = '{"unexpected":"market evidence"}';
    fs.writeFileSync(path.join(c.directory, `${name}.json`), evidence);
    await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_INCOMPLETE' });
    assert.equal(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'), evidence);
    assert.equal(fs.readFileSync(path.join(c.directory, 'unidades.json'), 'utf8'), c.raw['unidades.json']);
    assert.equal(JSON.parse(fs.readFileSync(path.join(c.directory, '_database.json'), 'utf8')).schemaVersion, 6);
  });
}

test('a corrupt legacy mint owner is rejected before creating market files or rewriting ownership', async t => {
  const c = await v6Fixture(t);
  const events = structuredClone(c.state.eventos);
  events.records[0].toOwnerId = c.buyer.id;
  const evidence = serialize(events);
  fs.writeFileSync(path.join(c.directory, 'eventos.json'), evidence);
  await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(path.join(c.directory, 'eventos.json'), 'utf8'), evidence);
  assert.equal(fs.readFileSync(path.join(c.directory, 'unidades.json'), 'utf8'), c.raw['unidades.json']);
  for (const name of ['mercado', 'ventas']) assert.equal(fs.existsSync(path.join(c.directory, `${name}.json`)), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(c.directory, '_database.json'), 'utf8')).schemaVersion, 6);
});
