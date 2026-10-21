import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { setup, register, readRecords } from './helpers.js';
import { COLLECTIONS, V11_COLLECTIONS, STORY_COLLECTIONS, SCHEMA_VERSION, validateDatabase } from '../storage/validation.js';
import { crearDatabase } from '../CTU-database.js';

const serialize = value => JSON.stringify(value, null, 2) + '\n';
const digest = value => createHash('sha256').update(value).digest('hex');
const now = '2026-10-17T12:00:00.000Z';
let historicalPayload;

// Build actual receipts through the existing services once. Each fault case
// receives a fresh directory containing the complete historical payload.
async function v11Fixture(t) {
  const context = setup(t, { clock: () => now, randomRoll: () => 0, randomDropInt: () => 0 });
  if (!historicalPayload) {
    const a = await register(context.game), b = await register(context.game, 'Lukas', '521111111111');
    const units = [];
    for (const [user, choice] of [[a, 'panda'], [b, 'lobo']]) {
      const unit = (await context.game.starter.claimStarter({ userId: user.id, choice })).unit;
      units.push(unit);
      await context.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
    }
    await context.game.economy.claimDaily({ userId: a.id, operationKey: 'legacy-daily' });
    await context.game.content.claimEvent({ userId: a.id, eventId: 'faroles', operationKey: 'legacy-event' });
    const chatId = 'story-migration@g.us';
    await context.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId, ranked: true });
    let battle = (await context.game.battle.accept({ userId: b.id, chatId })).battle;
    let turns = 0;
    while (battle.status === 'active') {
      assert.ok(turns++ < 100, 'historical match must terminate');
      battle = (await context.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '1' })).battle;
    }
    assert.ok(battle.winnerId, 'fixture must contain a real winner');
    const winner = battle.winnerId === a.id ? a : b;
    const winnerUnit = units[battle.winnerId === a.id ? 0 : 1];
    await context.game.content.claimAchievement({ userId: winner.id, code: 'L1', operationKey: 'legacy-achievement' });
    await context.game.crafting.claimMaterials({ userId: winner.id, operationKey: 'legacy-materials' });
    await context.game.crafting.craft({ userId: winner.id, recipeId: 'insignia_bambu', operationKey: 'legacy-badge' });
    await context.game.social.updatePreferences({ userId: winner.id, favoriteUnitId: winnerUnit.id,
      featuredUnitIds: [winnerUnit.id], selectedTitleCode: 'L1', bio: 'Antes de las campanas', operationKey: 'legacy-social' });
    await context.game.trades.create({ userId: a.id, opponentId: b.id, chatId, operationKey: 'legacy-trade' });
    await context.game.trades.setOffer({ userId: a.id, chatId, code: 'I1', unitIds: [units[0].id], coins: 10, operationKey: 'legacy-offer' });
    await context.game.acquisition.redeemCode({ userId: a.id, code: 'CHENGDU', operationKey: 'legacy-promo' });
    await context.game.close();
    const state = Object.fromEntries(V11_COLLECTIONS.map(name => [name,
      JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'))]));
    for (const collection of Object.values(state)) collection._meta.schemaVersion = 11;
    validateDatabase(state, 11);
    assert.equal(state.usuarios.records.length, 2);
    assert.ok(state.unidades.records.length >= 3);
    assert.equal(state.diarios.records.length, 1);
    assert.equal(state.clasificacion.records.length, 2);
    assert.equal(state.resultadoscompetitivos.records.length, 1);
    assert.ok(state.artesania.records.length >= 2);
    assert.equal(state.perfilessociales.records.length, 1);
    assert.equal(state.intercambios.records.length, 1);
    assert.equal(state.obtenciones.records.length, 1);
    const raw = Object.fromEntries(V11_COLLECTIONS.map(name => [`${name}.json`, serialize(state[name])]));
    raw['_database.json'] = serialize({ database: 'chengdu-cards', schemaVersion: 11 });
    historicalPayload = { state, raw };
  }
  await context.game.close();
  const payload = structuredClone(historicalPayload);
  for (const name of COLLECTIONS.filter(name => !V11_COLLECTIONS.includes(name))) {
    const filename = path.join(context.directory, `${name}.json`);
    if (!fs.existsSync(filename)) continue;
    assert.deepEqual(JSON.parse(fs.readFileSync(filename, 'utf8')).records, [], name);
    fs.unlinkSync(filename);
  }
  for (const [file, contents] of Object.entries(payload.raw)) fs.writeFileSync(path.join(context.directory, file), contents);
  return { ...context, ...payload };
}

function assertPreserved(context) {
  for (const name of V11_COLLECTIONS) {
    const collection = JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'));
    assert.deepEqual(collection.records, context.state[name].records, name);
    assert.equal(collection._meta.schemaVersion, SCHEMA_VERSION);
    assert.equal(collection._meta.revision, context.state[name]._meta.revision + SCHEMA_VERSION - 11);
    assert.equal(collection._meta.updatedAt, now);
  }
  for (const name of STORY_COLLECTIONS) {
    const collection = JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'));
    assert.deepEqual(collection.records, [], name);
    assert.equal(collection._meta.schemaVersion, SCHEMA_VERSION);
    assert.equal(collection._meta.revision, SCHEMA_VERSION - 12);
    assert.equal(collection._meta.updatedAt, now);
  }
}

test('schema 11 gains four empty story collections and preserves all thirty-five historical payloads', async t => {
  const context = await v11Fixture(t);
  assert.equal((await context.open().game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
  assertPreserved(context);
  const snapshots = fs.readdirSync(path.join(context.directory, 'backups')).map(id =>
    JSON.parse(fs.readFileSync(path.join(context.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(snapshot => Object.entries(context.raw).every(([file, contents]) => snapshot.files[file] === contents) &&
    STORY_COLLECTIONS.every(name => snapshot.files[`${name}.json`] === null)));
});

for (const stage of ['prepared', 'committed', ...COLLECTIONS.map(name => `published:${name}.json`), 'published:_database.json']) {
  test(`story migration preserves every record after interruption at ${stage}`, async t => {
    const context = await v11Fixture(t);
    let armed = true;
    const interrupted = context.open({ fault: current => {
      if (armed && current === stage) { armed = false; throw new Error('story migration interrupted'); }
    } }).game;
    await assert.rejects(interrupted.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await interrupted.close();
    assert.equal((await context.open().game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
    assertPreserved(context);
    assert.equal(fs.existsSync(path.join(context.directory, '_journal.json')), false);
  });
}

function historicalJournal(context, { version, phase, published = false }) {
  const filename = 'sobres.json';
  const packs = JSON.parse(context.raw[filename]);
  packs.records[0] = { ...packs.records[0], name: 'Sobre anterior al modo historia', revision: packs.records[0].revision + 1 };
  packs._meta = { ...packs._meta, revision: packs._meta.revision + 1, updatedAt: now };
  const after = serialize(packs);
  const changes = version === 2
    ? { before: { [filename]: context.raw[filename] }, after: { [filename]: after } }
    : { changes: { [filename]: { beforeHash: digest(context.raw[filename]), afterHash: digest(after),
      beforeLength: packs.records.length, afterMeta: packs._meta, replacements: [{ index: 0, record: packs.records[0] }], appended: [] } } };
  const body = { id: randomUUID(), schemaVersion: 11, ...changes,
    unchanged: Object.fromEntries(Object.entries(context.raw).filter(([file]) => file !== filename).map(([file, contents]) => [file, digest(contents)])) };
  const evidence = serialize({ version, phase, body, checksum: digest(JSON.stringify(body)) });
  fs.writeFileSync(path.join(context.directory, '_journal.json'), evidence);
  if (published) fs.writeFileSync(path.join(context.directory, filename), after);
  if (phase === 'committed') context.state.sobres = packs;
  return evidence;
}

for (const version of [2, 3]) {
  for (const phase of ['prepared', 'committed']) {
    for (const published of phase === 'prepared' ? [false] : [false, true]) {
      test(`a schema 11 journal v${version} recovers before migration: ${phase}, published=${published}`, async t => {
        const context = await v11Fixture(t);
        historicalJournal(context, { version, phase, published });
        assert.equal((await context.open().game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
        assertPreserved(context);
        assert.equal(fs.existsSync(path.join(context.directory, '_journal.json')), false);
      });
    }
  }
  test(`a schema 11 journal v${version} refuses conflicting future files and keeps its evidence`, async t => {
    const context = await v11Fixture(t);
    const journal = historicalJournal(context, { version, phase: 'committed' });
    const unexpected = serialize({ _meta: { schemaVersion: 12, revision: 0, updatedAt: now }, records: [] });
    fs.writeFileSync(path.join(context.directory, 'historias.json'), unexpected);
    await assert.rejects(context.open().game.validateDatabase(), { code: 'RECOVERY_CONFLICT' });
    assert.equal(fs.readFileSync(path.join(context.directory, 'historias.json'), 'utf8'), unexpected);
    assert.equal(fs.readFileSync(path.join(context.directory, '_journal.json'), 'utf8'), journal);
    assert.equal(fs.readFileSync(path.join(context.directory, '_database.json'), 'utf8'), context.raw['_database.json']);
  });
}

test('a corrupt historical balance stops story migration without removing its evidence', async t => {
  const context = await v11Fixture(t);
  const users = JSON.parse(context.raw['usuarios.json']);
  users.records[0].economy.coins++;
  const evidence = serialize(users);
  fs.writeFileSync(path.join(context.directory, 'usuarios.json'), evidence);
  await assert.rejects(context.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(path.join(context.directory, 'usuarios.json'), 'utf8'), evidence);
  assert.equal(fs.readFileSync(path.join(context.directory, '_database.json'), 'utf8'), context.raw['_database.json']);
  for (const name of STORY_COLLECTIONS) assert.equal(fs.existsSync(path.join(context.directory, `${name}.json`)), false);
});

test('standalone helpers cannot overwrite any managed story collection', async t => {
  const context = setup(t);
  await context.game.validateDatabase();
  for (const name of STORY_COLLECTIONS) {
    const before = readRecords(context.directory, name);
    const standalone = crearDatabase(name, [], { directory: context.directory, maintenance: true });
    for (const action of [() => standalone.cargar(), () => standalone.guardar([]), () => standalone.eliminar()]) {
      assert.throws(action, { code: 'MANAGED_DATABASE_FILE' });
    }
    assert.deepEqual(readRecords(context.directory, name), before);
  }
});
