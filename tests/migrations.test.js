import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { V1_COLLECTIONS } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

async function v1Fixture(t) {
  const context = setup(t);
  const user = await register(context.game);
  const { unit } = await context.game.starter.claimStarter({ userId: user.id, choice: 'panda' });
  await context.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  const storedUser = await context.game.users.getUser(user.id);
  await context.game.close();
  const raw = {};
  for (const name of V1_COLLECTIONS) {
    const file = path.join(context.directory, `${name}.json`);
    const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
    collection._meta.schemaVersion = 1;
    if (name === 'personajes') for (const character of collection.records) character.attackIds = [];
    if (name === 'estado') collection.records = collection.records.filter(r => r.kind !== 'progressionBaseline');
    raw[`${name}.json`] = JSON.stringify(collection, null, 2) + '\n';
    fs.writeFileSync(file, raw[`${name}.json`]);
  }
  raw['_database.json'] = JSON.stringify({ database: 'chengdu-cards', schemaVersion: 1 }, null, 2) + '\n';
  fs.writeFileSync(path.join(context.directory, '_database.json'), raw['_database.json']);
  for (const name of ['ataques', 'combates', 'recompensas']) fs.unlinkSync(path.join(context.directory, `${name}.json`));
  return { ...context, user: storedUser, unit, raw };
}

test('schema 1 upgrade preserves users, owned units, serials, claims, balances and teams', async t => {
  const c = await v1Fixture(t);
  const game = c.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, 3);
  assert.deepEqual(await game.users.getUser(c.user.id), c.user);
  assert.deepEqual(readRecords(c.directory, 'unidades')[0], c.unit);
  assert.equal((await game.users.getProfile(c.user.id)).starterClaim.unitId, c.unit.id);
  assert.equal(readRecords(c.directory, 'ataques').length, 18);
  assert.deepEqual(readRecords(c.directory, 'combates'), []);
  assert.equal((await game.characters.getCharacter('panda_guerrero')).revision, 2);
  assert.equal(readRecords(c.directory, 'personajes')[0].attackIds.length, 2);
  const snapshots = fs.readdirSync(path.join(c.directory, 'backups')).map(id => JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(snapshot => snapshot.files['usuarios.json'] === c.raw['usuarios.json'] && snapshot.files['unidades.json'] === c.raw['unidades.json']));
  await game.close();
  const count = snapshots.length;
  await c.open().game.validateDatabase();
  assert.equal(fs.readdirSync(path.join(c.directory, 'backups')).length, count);
});

for (const stage of ['prepared', 'committed', 'published:unidades.json', 'published:ataques.json']) {
  test(`schema upgrade recovers safely after interruption at ${stage}`, async t => {
    const c = await v1Fixture(t);
    const failing = c.open({ fault: current => { if (current === stage) throw new Error('migration interrupted'); } }).game;
    await assert.rejects(failing.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await failing.close();
    const recovered = c.open().game;
    assert.equal((await recovered.validateDatabase()).schemaVersion, 3);
    assert.deepEqual(await recovered.users.getUser(c.user.id), c.user);
    assert.deepEqual(readRecords(c.directory, 'unidades')[0], c.unit);
    assert.equal((await recovered.starter.claimStarter({ userId: c.user.id, choice: 'mago' })).unit.id, c.unit.id);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`an old schema-1 ${phase} journal is recovered before upgrading`, async t => {
    const c = await v1Fixture(t);
    const after = { ...c.raw };
    const users = JSON.parse(after['usuarios.json']);
    users.records.push({ ...c.user, id: `USR-${randomUUID()}`, name: 'Juan', team: [], identities: [{ provider: 'whatsapp', subject: '521111111111@s.whatsapp.net' }] });
    after['usuarios.json'] = JSON.stringify(users, null, 2) + '\n';
    const body = { id: randomUUID(), before: c.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(c.directory, '_journal.json'), JSON.stringify({ version: 1, phase, body, checksum }));
    if (phase === 'committed') fs.writeFileSync(path.join(c.directory, 'usuarios.json'), after['usuarios.json']);
    const game = c.open().game;
    const report = await game.validateDatabase();
    assert.equal(report.schemaVersion, 3);
    assert.equal(report.users, phase === 'committed' ? 2 : 1);
    assert.equal((await game.units.getUnit(c.unit.id)).ownerId, c.user.id);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

test('corrupt version-1 data is preserved instead of being replaced during upgrade', async t => {
  const c = await v1Fixture(t);
  const file = path.join(c.directory, 'unidades.json');
  fs.writeFileSync(file, '{broken');
  await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(file, 'utf8'), '{broken');
  assert.equal(fs.existsSync(path.join(c.directory, 'ataques.json')), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(c.directory, '_database.json'), 'utf8')).schemaVersion, 1);
});
