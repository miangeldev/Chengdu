import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { progressionBaseline } from '../game/progression/rules.js';
import { COLLECTIONS, SCHEMA_VERSION } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

test('warm reads and unchanged transactions reuse validated state without reading JSON', async t => {
  const c = setup(t);
  const user = await register(c.game);
  await c.game.users.getProfile(user.id);
  const backups = fs.readdirSync(path.join(c.directory, 'backups'));
  const originalRead = fs.readFileSync;
  let reads = 0;
  fs.readFileSync = function (...args) { reads++; return Reflect.apply(originalRead, this, args); };
  try {
    for (let index = 0; index < 10; index++) {
      const found = await c.game.users.getUserByIdentity(user.identities[0]);
      assert.equal(found.id, user.id);
      await c.game.users.getProfile(user.id);
      await c.storage.withTransaction(repos => repos.users.replace(found));
    }
    assert.equal(reads, 0);
  } finally { fs.readFileSync = originalRead; }
  assert.deepEqual(fs.readdirSync(path.join(c.directory, 'backups')), backups);
});

test('transactions publish only changed collections and reject writes through escaped repositories', async t => {
  const c = setup(t);
  const user = await register(c.game);
  const untouched = path.join(c.directory, 'personajes.json');
  const before = fs.statSync(untouched, { bigint: true });
  let escaped;
  await c.storage.withTransaction(async repos => {
    escaped = repos.users;
    await repos.users.findBy('name', user.name);
    await repos.users.replace({ ...user, settings: { notifications: false } });
  });
  const after = fs.statSync(untouched, { bigint: true });
  assert.equal(after.ino, before.ino);
  assert.equal(after.mtimeNs, before.mtimeNs);
  assert.equal(readRecords(c.directory, 'usuarios')[0].settings.notifications, false);
  await assert.rejects(escaped.replace({ ...user, name: 'Fuera del callback' }), { code: 'TRANSACTION_CLOSED' });
  assert.equal((await c.game.users.getUserByIdentity(user.identities[0])).name, user.name);
  assert.equal(await c.storage.withRead(repos => repos.users.findBy('name', 'Fuera del callback')), null);
});

test('record-patch journals contain only modified rows even when their collection is large', async t => {
  const c = setup(t);
  const user = await register(c.game);
  await c.storage.withTransaction(async repos => {
    for (let index = 0; index < 150; index++) {
      const added = { ...user, id: `USR-${randomUUID()}`, name: `Jugador ${index}`,
        identities: [{ provider: 'whatsapp', subject: `${5215500000000 + index}@s.whatsapp.net` }] };
      await repos.users.insert(added);
      await repos.state.insert(progressionBaseline('user', added));
    }
  });
  await c.game.close();
  const failed = c.open({ fault: stage => { if (stage === 'prepared') throw new Error('interrupted'); } });
  await assert.rejects(failed.storage.withTransaction(repos => repos.users.replace({ ...user, settings: { notifications: false } })), { code: 'STORAGE_WRITE_FAILED' });
  const journalText = fs.readFileSync(path.join(c.directory, '_journal.json'), 'utf8');
  const journal = JSON.parse(journalText);
  assert.equal(journal.version, 3);
  assert.deepEqual(Object.keys(journal.body.changes), ['usuarios.json']);
  assert.equal(journal.body.changes['usuarios.json'].replacements.length, 1);
  assert.equal(journal.body.changes['usuarios.json'].appended.length, 0);
  assert.ok(journalText.length < fs.statSync(path.join(c.directory, 'usuarios.json')).size / 5);
  await failed.game.close();
  const recovered = c.open().game;
  assert.equal((await recovered.users.getUser(user.id)).settings.notifications, true);
  assert.equal((await recovered.validateDatabase()).users, 151);
});

test('external changes during a transaction are preserved and refuse publication', async t => {
  const c = setup(t);
  const user = await register(c.game);
  const file = path.join(c.directory, 'personajes.json');
  const edited = fs.readFileSync(file, 'utf8') + ' ';
  await assert.rejects(c.storage.withTransaction(async repos => {
    await repos.users.replace({ ...user, settings: { notifications: false } });
    fs.writeFileSync(file, edited);
  }), { code: 'STORAGE_CONFLICT' });
  assert.equal(fs.readFileSync(file, 'utf8'), edited);
  assert.equal(readRecords(c.directory, 'usuarios')[0].settings.notifications, true);
  assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
});

test('invalid clocks cannot persist collection metadata when only user settings change', async t => {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const user = await register(c.game);
  for (const invalid of [null, 'invalid', '2026-02-30T20:00:00.000Z']) {
    now = invalid;
    await assert.rejects(c.storage.withTransaction(repos => repos.users.replace({ ...user, settings: { notifications: false } })), { code: 'INVALID_CLOCK' });
    assert.equal(await c.storage.withTransaction(() => 'unchanged'), 'unchanged');
  }
  assert.equal(readRecords(c.directory, 'usuarios')[0].settings.notifications, true);
});

test('routine backup retention is bounded and backups do not share live-file inodes', async t => {
  const c = setup(t, { backupRetention: 2 });
  let user = await register(c.game);
  for (let index = 0; index < 5; index++) {
    user = await c.storage.withTransaction(repos => repos.users.replace({ ...user, settings: { notifications: !user.settings.notifications } }));
  }
  const root = path.join(c.directory, 'backups');
  const snapshots = fs.readdirSync(root).map(id => ({ id, ...JSON.parse(fs.readFileSync(path.join(root, id, 'snapshot.json'), 'utf8')) }));
  assert.equal(snapshots.filter(snapshot => snapshot.version === 2).length, 2);
  assert.ok(snapshots.some(snapshot => snapshot.version === 1));
  const live = path.join(c.directory, 'usuarios.json');
  const backups = snapshots.filter(snapshot => snapshot.version === 2).map(snapshot => path.join(root, snapshot.id, 'usuarios.json'));
  const original = backups.map(file => fs.readFileSync(file, 'utf8'));
  for (const file of backups) assert.notEqual(fs.statSync(file).ino, fs.statSync(live).ino);
  fs.writeFileSync(live, '{broken');
  assert.deepEqual(backups.map(file => fs.readFileSync(file, 'utf8')), original);
});

for (const phase of ['prepared', 'committed']) {
  test(`historical collection-delta journals remain recoverable at ${phase}`, async t => {
    const c = setup(t);
    const user = await register(c.game);
    await c.game.close();
    const hash = text => createHash('sha256').update(text).digest('hex');
    const files = [...COLLECTIONS.map(name => `${name}.json`), '_database.json'];
    const raw = Object.fromEntries(files.map(file => [file, fs.readFileSync(path.join(c.directory, file), 'utf8')]));
    const next = JSON.parse(raw['usuarios.json']);
    next.records[0].settings.notifications = false;
    next._meta.revision++;
    const body = { id: randomUUID(), schemaVersion: SCHEMA_VERSION,
      before: { 'usuarios.json': raw['usuarios.json'] }, after: { 'usuarios.json': JSON.stringify(next, null, 2) + '\n' },
      unchanged: Object.fromEntries(files.filter(file => file !== 'usuarios.json').map(file => [file, hash(raw[file])])) };
    fs.writeFileSync(path.join(c.directory, '_journal.json'), JSON.stringify({ version: 2, phase, body, checksum: hash(JSON.stringify(body)) }));
    const game = c.open().game;
    assert.equal((await game.users.getUser(user.id)).settings.notifications, phase === 'prepared');
    assert.equal((await game.validateDatabase()).valid, true);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

test('patch recovery detects edits to untouched collections before publishing', async t => {
  const c = setup(t);
  const user = await register(c.game);
  await c.game.close();
  const failed = c.open({ fault: stage => { if (stage === 'committed') throw new Error('interrupted'); } });
  await assert.rejects(failed.storage.withTransaction(repos => repos.users.replace({ ...user, settings: { notifications: false } })));
  await failed.game.close();
  const file = path.join(c.directory, 'personajes.json');
  const edited = fs.readFileSync(file, 'utf8') + ' ';
  fs.writeFileSync(file, edited);
  await assert.rejects(c.open().game.validateDatabase(), { code: 'RECOVERY_CONFLICT' });
  assert.equal(fs.readFileSync(file, 'utf8'), edited);
  assert.equal(readRecords(c.directory, 'usuarios')[0].settings.notifications, true);
});
