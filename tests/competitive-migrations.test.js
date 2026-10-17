import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { SCHEMA_VERSION, COLLECTIONS, COMPETITIVE_COLLECTIONS, V9_COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

const serialize = value => JSON.stringify(value, null, 2) + '\n';

async function v9Fixture(t) {
  const context = setup(t, { clock: () => '2026-10-13T08:00:00.000Z', randomRoll: () => 0 });
  const a = await register(context.game), b = await register(context.game, 'Lukas', '521111111111');
  const units = [];
  for (const [index, user] of [a, b].entries()) {
    const unit = (await context.game.starter.claimStarter({ userId: user.id, choice: index ? 'lobo' : 'panda' })).unit;
    units.push(unit);
    await context.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  }
  const chatId = 'competitive-migration@g.us';
  await context.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId, mode: '1v1' });
  let battle = (await context.game.battle.accept({ userId: b.id, chatId })).battle;
  while (battle.status === 'active') {
    battle = (await context.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '1' })).battle;
  }
  await context.game.economy.claimDaily({ userId: a.id, operationKey: 'before-ranked-daily' });
  await context.game.content.claimEvent({ userId: a.id, eventId: 'faroles', operationKey: 'before-ranked-content' });
  await context.game.market.createListing({ sellerId: a.id, unitId: units[0].id, price: 29, operationKey: 'before-ranked-listing' });
  await context.game.close();
  const state = Object.fromEntries(V9_COLLECTIONS.map(name => [name,
    JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'))]));
  for (const collection of Object.values(state)) collection._meta.schemaVersion = 9;
  validateDatabase(state, 9);
  const raw = Object.fromEntries(V9_COLLECTIONS.map(name => [`${name}.json`, serialize(state[name])]));
  raw['_database.json'] = serialize({ database: 'chengdu-cards', schemaVersion: 9 });
  for (const [file, contents] of Object.entries(raw)) fs.writeFileSync(path.join(context.directory, file), contents);
  for (const name of COLLECTIONS.filter(name => !V9_COLLECTIONS.includes(name))) {
    const filename = path.join(context.directory, `${name}.json`);
    assert.deepEqual(JSON.parse(fs.readFileSync(filename, 'utf8')).records, [], name);
    fs.unlinkSync(filename);
  }
  return { ...context, state, raw };
}

function assertPreserved(context) {
  for (const name of V9_COLLECTIONS) {
    assert.deepEqual(readRecords(context.directory, name), context.state[name].records, name);
    const meta = JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'))._meta;
    assert.equal(meta.schemaVersion, SCHEMA_VERSION);
    assert.equal(meta.revision, context.state[name]._meta.revision + SCHEMA_VERSION - 9);
  }
  for (const name of COMPETITIVE_COLLECTIONS) {
    const collection = JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'));
    assert.deepEqual(collection.records, [], name);
    assert.equal(collection._meta.schemaVersion, SCHEMA_VERSION);
    assert.equal(collection._meta.revision, SCHEMA_VERSION - 10);
  }
}

test('schema 9 adds an empty ranked ledger without changing any previous payload', async t => {
  const context = await v9Fixture(t);
  assert.equal((await context.open().game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
  assertPreserved(context);
  assert.ok(readRecords(context.directory, 'combates').every(battle => battle.competitive === undefined));
  const snapshots = fs.readdirSync(path.join(context.directory, 'backups')).map(id =>
    JSON.parse(fs.readFileSync(path.join(context.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(snapshot => Object.entries(context.raw).every(([file, contents]) => snapshot.files[file] === contents) &&
    COMPETITIVE_COLLECTIONS.every(name => snapshot.files[`${name}.json`] === null)));
});

for (const stage of ['prepared', 'committed', ...V9_COLLECTIONS.map(name => `published:${name}.json`),
  ...COMPETITIVE_COLLECTIONS.map(name => `published:${name}.json`), 'published:_database.json']) {
  test(`schema 9 migration recovers old payloads and four new collections at ${stage}`, async t => {
    const context = await v9Fixture(t);
    const interrupted = context.open({ fault: current => { if (current === stage) throw new Error('competitive migration interrupted'); } }).game;
    await assert.rejects(interrupted.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await interrupted.close();
    assert.equal((await context.open().game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
    assertPreserved(context);
    assert.equal(fs.existsSync(path.join(context.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`a schema 9 ${phase} journal is recovered before enabling ranked collections`, async t => {
    const context = await v9Fixture(t);
    const after = { ...context.raw }, packs = JSON.parse(after['sobres.json']);
    packs.records[0].name = 'Sobre histórico Beta 0.8';
    packs.records[0].revision++;
    after['sobres.json'] = serialize(packs);
    const body = { id: randomUUID(), before: context.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(context.directory, '_journal.json'), serialize({ version: 1, phase, body, checksum }));
    if (phase === 'committed') {
      fs.writeFileSync(path.join(context.directory, 'sobres.json'), after['sobres.json']);
      context.state.sobres = packs;
    }
    await context.open().game.validateDatabase();
    assertPreserved(context);
  });
}

test('a corrupt schema 9 balance prevents ranked migration and preserves its evidence', async t => {
  const context = await v9Fixture(t);
  const users = JSON.parse(context.raw['usuarios.json']);
  users.records[0].economy.coins++;
  const evidence = serialize(users);
  fs.writeFileSync(path.join(context.directory, 'usuarios.json'), evidence);
  await assert.rejects(context.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(path.join(context.directory, 'usuarios.json'), 'utf8'), evidence);
  assert.equal(fs.readFileSync(path.join(context.directory, '_database.json'), 'utf8'), context.raw['_database.json']);
  for (const name of COMPETITIVE_COLLECTIONS) assert.equal(fs.existsSync(path.join(context.directory, `${name}.json`)), false);
});
