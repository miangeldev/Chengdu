import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { SCHEMA_VERSION, COLLECTIONS, CONTENT_COLLECTIONS, V8_COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { readRecords, register, setup, stripBetaContentFixture } from './helpers.js';
import { crearDatabase } from '../CTU-database.js';

const serialize = value => JSON.stringify(value, null, 2) + '\n';
const stateOf = directory => Object.fromEntries(COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

test('standalone database helpers cannot edit any of the six managed content collections', async t => {
  const c = setup(t); await c.game.validateDatabase();
  const before = stateOf(c.directory);
  for (const name of CONTENT_COLLECTIONS) {
    const standalone = crearDatabase(name, [], { directory: c.directory, maintenance: true });
    for (const action of [() => standalone.cargar(), () => standalone.guardar([]), () => standalone.eliminar()]) assert.throws(action, { code: 'MANAGED_DATABASE_FILE' });
  }
  assert.deepEqual(stateOf(c.directory), before);
});

async function legacy(t) {
  const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z', randomRoll: () => 0 });
  const a = await register(c.game), b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const chatId = 'migration-beta@g.us';
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId, mode: 'classic' });
  let battle = (await c.game.battle.accept({ userId: b.id, chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
  await c.game.economy.claimDaily({ userId: b.id, operationKey: 'historic-daily' });
  const listing = (await c.game.market.createListing({ sellerId: a.id, unitId: ua.id, price: 21, operationKey: 'historic-listing' })).listing;
  await c.game.market.buyListing({ buyerId: b.id, listingId: listing.code, operationKey: 'historic-purchase' });
  await c.game.close(); stripBetaContentFixture(c.directory);
  const state = Object.fromEntries(V8_COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))]));
  for (const collection of Object.values(state)) collection._meta.schemaVersion = 8;
  validateDatabase(state, 8);
  const raw = Object.fromEntries(V8_COLLECTIONS.map(name => [`${name}.json`, serialize(state[name])]));
  raw['_database.json'] = serialize({ database: 'chengdu-cards', schemaVersion: 8 });
  for (const [file, text] of Object.entries(raw)) fs.writeFileSync(path.join(c.directory, file), text);
  return { ...c, a, b, ua, ub, state, raw };
}

function preserved(c) {
  for (const name of V8_COLLECTIONS) {
    const expected = c.state[name].records;
    const actual = readRecords(c.directory, name);
    assert.deepEqual(['personajes', 'estado', 'ataques'].includes(name) ? actual.slice(0, expected.length) : actual, expected, name);
    const meta = JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))._meta;
    assert.equal(meta.schemaVersion, SCHEMA_VERSION);
    assert.equal(meta.revision, c.state[name]._meta.revision + SCHEMA_VERSION - 8);
  }
  for (const name of CONTENT_COLLECTIONS.filter(name => name !== 'campanas')) assert.deepEqual(readRecords(c.directory, name), []);
  for (const name of COLLECTIONS.filter(name => !V8_COLLECTIONS.includes(name) && !CONTENT_COLLECTIONS.includes(name))) {
    assert.deepEqual(readRecords(c.directory, name), [], name);
  }
  assert.equal(readRecords(c.directory, 'campanas').length, 2);
  assert.equal(readRecords(c.directory, 'personajes').length, c.state.personajes.records.length + 4);
  assert.equal(readRecords(c.directory, 'ataques').length, c.state.ataques.records.length + 8);
}

test('schema 8 upgrades to content without resetting market aliases, owners, XP, supply or historical awards', async t => {
  const c = await legacy(t);
  const game = c.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
  preserved(c);
  assert.equal((await game.market.getListing('M1')).status, 'sold');
  const snapshots = fs.readdirSync(path.join(c.directory, 'backups')).map(id => JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(snapshot => Object.entries(c.raw).every(([file, text]) => snapshot.files[file] === text)));
});

for (const stage of ['prepared', 'committed', ...COLLECTIONS.map(name => `published:${name}.json`), 'published:_database.json']) {
  test(`content migration recovers every managed file at ${stage}`, async t => {
    const c = await legacy(t);
    const interrupted = c.open({ fault: current => { if (current === stage) throw new Error('interrupted beta migration'); } }).game;
    await assert.rejects(interrupted.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await interrupted.close(); const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
    preserved(c);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`legacy schema 8 ${phase} journal recovers before content is added`, async t => {
    const c = await legacy(t);
    const after = { ...c.raw }, packs = JSON.parse(after['sobres.json']);
    packs.records[0].name = 'Sobre de antes de la Beta'; packs.records[0].revision++;
    after['sobres.json'] = serialize(packs);
    const body = { id: randomUUID(), before: c.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(c.directory, '_journal.json'), serialize({ version: 1, phase, body, checksum }));
    if (phase === 'committed') { fs.writeFileSync(path.join(c.directory, 'sobres.json'), after['sobres.json']); c.state.sobres = packs; }
    assert.equal((await c.open().game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
    preserved(c);
  });
}

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:economia.json', 'published:premioscontenido.json', 'published:_database.json']) {
  test(`a content reward recovers its coins, XP, tickets and receipt together at ${stage}`, async t => {
    const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z' });
    const user = await register(c.game); await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted reward'); } }).game;
    const request = { userId: user.id, eventId: 'faroles', operationKey: 'recover-welcome' };
    await assert.rejects(failed.content.claimEvent(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close(); const game = c.open().game;
    const replay = await game.content.claimEvent(request);
    assert.equal(replay.alreadyClaimed, stage !== 'prepared');
    assert.equal((await game.users.getUser(user.id)).economy.coins, 25);
    assert.equal((await game.users.getUser(user.id)).progress.xp, 10);
    assert.equal((await game.content.getInventory(user.id)).tickets, 1);
    assert.equal(readRecords(c.directory, 'premioscontenido').length, 1);
    assert.equal(readRecords(c.directory, 'economia').length, 1);
  });
}

test('corrupt legacy ownership blocks content migration while preserving every original file', async t => {
  const c = await legacy(t);
  const events = JSON.parse(c.raw['eventos.json']); events.records.find(event => event.type === 'unit_transferred').ownershipVersion++;
  const evidence = serialize(events); fs.writeFileSync(path.join(c.directory, 'eventos.json'), evidence);
  await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(path.join(c.directory, 'eventos.json'), 'utf8'), evidence);
  for (const name of CONTENT_COLLECTIONS) assert.equal(fs.existsSync(path.join(c.directory, `${name}.json`)), false);
});

for (const stage of ['prepared', 'committed', 'published:unidades.json', 'published:encuentros.json', 'published:premioscontenido.json', 'published:accionescontenido.json']) {
  test(`capture ownership and ticket payment recover together at ${stage}`, async t => {
    const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z', randomDropInt: () => 0 });
    const user = await register(c.game);
    await c.game.content.claimEvent({ userId: user.id, eventId: 'faroles', operationKey: 'capture-ticket' });
    const spawn = await c.game.encounters.createSpawn({ characterId: 'zorro_faroles', chatId: 'capture-recovery@g.us' });
    await c.game.close();
    const request = { userId: user.id, chatId: spawn.chatId, code: spawn.code, operationKey: 'capture-recover' };
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('capture interrupted'); } }).game;
    await assert.rejects(failed.encounters.capture(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close(); const game = c.open().game;
    const result = await game.encounters.capture(request);
    assert.equal(result.alreadyCaptured, stage !== 'prepared');
    assert.equal(result.unit.ownerId, user.id);
    assert.equal(readRecords(c.directory, 'unidades').length, 1);
    assert.equal(readRecords(c.directory, 'eventos').length, 1);
    assert.equal((await game.content.getInventory(user.id)).tickets, 0);
    assert.equal(readRecords(c.directory, 'premioscontenido').filter(reward => reward.kind === 'spawn').length, 1);
    assert.equal(validateDatabase(stateOf(c.directory)).valid, true);
  });
}

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:economia.json', 'published:encuentros.json', 'published:premioscontenido.json']) {
  test(`the final boss hit settles every participant atomically at ${stage}`, async t => {
    let now = '2026-10-11T20:00:00.000Z';
    const c = setup(t, { clock: () => now, randomDropInt: () => 0 });
    const a = await register(c.game), b = await register(c.game, 'Lukas', '521111111111');
    for (const user of [a, b]) {
      const { unit } = await c.game.starter.claimStarter({ userId: user.id, choice: 'panda' });
      await c.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
    }
    let boss = await c.game.encounters.getBoss(), index = 0;
    while (boss.hp > 78) {
      boss = (await c.game.encounters.attackBoss({ userId: index % 2 ? b.id : a.id, chatId: 'boss-recovery@g.us', code: boss.code,
        choice: '2', operationKey: `setup:${index++}` })).boss;
      now = new Date(Date.parse(now) + 30_000).toISOString();
    }
    await c.game.close();
    const request = { userId: a.id, chatId: 'boss-recovery@g.us', code: boss.code, choice: '2', operationKey: 'finishing-hit' };
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted settlement'); } }).game;
    await assert.rejects(failed.encounters.attackBoss(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close(); const game = c.open().game;
    const replay = await game.encounters.attackBoss(request);
    assert.equal(replay.duplicate, stage !== 'prepared');
    assert.equal(replay.boss.status, 'defeated');
    const rewards = readRecords(c.directory, 'premioscontenido');
    assert.equal(rewards.length, 2);
    assert.equal(rewards.reduce((sum, reward) => sum + reward.coins, 0), 220);
    assert.equal((await game.content.getInventory(a.id)).tickets, 1);
    assert.equal((await game.content.getInventory(b.id)).tickets, 1);
    assert.equal(readRecords(c.directory, 'economia').length, 2);
    assert.equal((await game.validateDatabase()).valid, true);
  });
}
