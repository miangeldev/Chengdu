import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, V12_COLLECTIONS, SCHEMA_VERSION, validateDatabase } from '../storage/validation.js';
import { seedSpiritsCharacters, seedSpiritsAttacks } from '../game/content/spiritsCatalog.js';
import { crearDatabase } from '../CTU-database.js';
import { setup, register } from './helpers.js';

const now = '2026-10-20T12:00:00.000Z';
const serialize = value => JSON.stringify(value, null, 2) + '\n';
let saved;
async function legacy(t) {
  const c = setup(t, { clock: () => now, randomRoll: () => 0 });
  if (!saved) {
    const user = await register(c.game);
    const unit = (await c.game.starter.claimStarter({ userId: user.id, choice: 'panda' })).unit;
    await c.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
    await c.game.content.claimEvent({ userId: user.id, eventId: 'faroles', operationKey: 'historical-welcome' });
    await c.game.story.getState({ userId: user.id });
    await c.game.close();
    const state = Object.fromEntries(V12_COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))]));
    const characters = new Set(seedSpiritsCharacters().map(row => row.id));
    const attacks = new Set(seedSpiritsAttacks().map(row => row.id));
    state.personajes.records = state.personajes.records.filter(row => !characters.has(row.id));
    state.ataques.records = state.ataques.records.filter(row => !attacks.has(row.id));
    state.estado.records = state.estado.records.filter(row => !characters.has(row.characterId));
    state.campanas.records = state.campanas.records.filter(row => row.id !== 'espiritus_2026');
    for (const collection of Object.values(state)) collection._meta.schemaVersion = 12;
    validateDatabase(state, 12);
    saved = { state, raw: { ...Object.fromEntries(V12_COLLECTIONS.map(name => [`${name}.json`, serialize(state[name])])),
      '_database.json': serialize({ database: 'chengdu-cards', schemaVersion: 12 }) } };
  }
  await c.game.close();
  fs.rmSync(path.join(c.directory, 'accionesespiritus.json'), { force: true });
  const copy = structuredClone(saved);
  for (const [name, body] of Object.entries(copy.raw)) fs.writeFileSync(path.join(c.directory, name), body);
  return { ...c, ...copy };
}

function preserved(c) {
  for (const name of V12_COLLECTIONS) {
    const collection = JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'));
    assert.deepEqual(collection.records.slice(0, c.state[name].records.length), c.state[name].records, name);
    assert.equal(collection._meta.schemaVersion, SCHEMA_VERSION);
    assert.equal(collection._meta.revision, c.state[name]._meta.revision + 1);
    const additions = { personajes: 2, ataques: 4, estado: 2, campanas: 1 };
    assert.equal(collection.records.length, c.state[name].records.length + (additions[name] ?? 0), name);
  }
  const actions = JSON.parse(fs.readFileSync(path.join(c.directory, 'accionesespiritus.json'), 'utf8'));
  assert.deepEqual(actions.records, []);
  assert.equal(actions._meta.revision, 0);
  const campaigns = JSON.parse(fs.readFileSync(path.join(c.directory, 'campanas.json'), 'utf8')).records;
  assert.equal(campaigns[1].startsAt, campaigns[0].endsAt);
}

test('schema 12 appends the event, four attacks, two finite editions and an empty ledger without rewriting history', async t => {
  const c = await legacy(t), reopened = c.open().game;
  assert.equal((await reopened.validateDatabase()).schemaVersion, 13);
  preserved(c);
  const backups = fs.readdirSync(path.join(c.directory, 'backups')).map(id =>
    JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(backups.some(backup => Object.entries(c.raw).every(([name, body]) => backup.files[name] === body) && backup.files['accionesespiritus.json'] === null));
  await reopened.close();
  const before = Object.fromEntries(COLLECTIONS.map(name => [name, fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8')]));
  assert.equal((await c.open().game.validateDatabase()).valid, true);
  for (const [name, body] of Object.entries(before)) assert.equal(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'), body);
});

for (const stage of ['prepared', 'committed', ...COLLECTIONS.map(name => `published:${name}.json`), 'published:_database.json']) {
  test(`spirits migration recovers coherently after interruption at ${stage}`, async t => {
    const c = await legacy(t);
    let armed = true;
    const failing = c.open({ fault: point => { if (armed && point === stage) { armed = false; throw new Error('migration interrupted'); } } }).game;
    await assert.rejects(failing.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await failing.close();
    assert.equal((await c.open().game.validateDatabase()).valid, true);
    preserved(c);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

test('the new event ledger is protected from standalone JSON helpers', async t => {
  const c = setup(t); await c.game.validateDatabase();
  const direct = crearDatabase('accionesespiritus', [], { directory: c.directory, maintenance: true });
  for (const work of [() => direct.cargar(), () => direct.guardar([]), () => direct.eliminar()]) assert.throws(work, { code: 'MANAGED_DATABASE_FILE' });
});
