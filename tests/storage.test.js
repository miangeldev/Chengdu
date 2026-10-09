import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { spawnSync } from 'node:child_process';
import { pathToFileURL } from 'node:url';
import { crearDatabase, DATA_DIR } from '../CTU-database.js';
import { unlockStaleWriter } from '../storage/writerLock.js';
import { identity, readRecords, register, setup } from './helpers.js';

test('legacy users migrate with a persistent identity map and coherent backup', async t => {
  const { game, directory, open } = setup(t);
  const legacy = JSON.stringify([{ id: identity().subject, nombre: 'Miguel' }]);
  fs.writeFileSync(path.join(directory, 'usuarios.json'), legacy);
  const user = await game.users.getUserByIdentity(identity());
  assert.equal(user.name, 'Miguel');
  assert.equal(user.createdAt, null);
  const mapping = readRecords(directory, 'estado').find(r => r.kind === 'migrationMap');
  assert.deepEqual(mapping.entries, [{ subject: identity().subject, userId: user.id }]);
  const backups = fs.readdirSync(path.join(directory, 'backups'));
  assert.equal(fs.readFileSync(path.join(directory, 'backups', backups[0], 'usuarios.json'), 'utf8'), legacy);
  await game.close();
  const reopened = open().game;
  assert.equal((await reopened.users.getUserByIdentity(identity())).id, user.id);
  assert.equal((await reopened.validateDatabase()).users, 1);
});

test('a prepared interrupted migration retries with the same internal user IDs', async t => {
  const context = setup(t, { fault: stage => { if (stage === 'prepared') throw new Error('migration interrupted'); } });
  const original = JSON.stringify([{ id: identity().subject, nombre: 'Miguel' }]);
  fs.writeFileSync(path.join(context.directory, 'usuarios.json'), original);
  await assert.rejects(context.game.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
  const journal = JSON.parse(fs.readFileSync(path.join(context.directory, '_journal.json'), 'utf8'));
  const proposedId = JSON.parse(journal.body.after['usuarios.json']).records[0].id;
  assert.equal(fs.readFileSync(path.join(context.directory, 'usuarios.json'), 'utf8'), original);
  await context.game.close();
  const recovered = context.open({ fault: () => {} }).game;
  assert.equal((await recovered.users.getUserByIdentity(identity())).id, proposedId);
  assert.equal((await recovered.validateDatabase()).users, 1);
});

test('unsupported legacy fields or other legacy collections are preserved and rejected', async t => {
  const { game, directory } = setup(t);
  const legacy = JSON.stringify([{ id: identity().subject, nombre: 'Miguel', coins: 500 }]);
  fs.writeFileSync(path.join(directory, 'usuarios.json'), legacy);
  await assert.rejects(game.validateDatabase(), { code: 'UNSUPPORTED_LEGACY_DATA' });
  assert.equal(fs.readFileSync(path.join(directory, 'usuarios.json'), 'utf8'), legacy);
  fs.writeFileSync(path.join(directory, 'usuarios.json'), '[]');
  fs.writeFileSync(path.join(directory, 'unidades.json'), '[]');
  await assert.rejects(game.validateDatabase(), { code: 'UNSUPPORTED_LEGACY_DATA' });
  assert.equal(fs.readFileSync(path.join(directory, 'unidades.json'), 'utf8'), '[]');
});

test('corrupt JSON and future schema versions do not trigger reset or overwrite', async t => {
  const { game, directory } = setup(t);
  await register(game);
  const file = path.join(directory, 'usuarios.json');
  const good = fs.readFileSync(file, 'utf8');
  const invalid = '{"records":';
  fs.writeFileSync(file, invalid);
  await assert.rejects(register(game, 'Juan', '521111111111'), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(file, 'utf8'), invalid);
  const future = JSON.parse(good);
  future._meta.schemaVersion = 4;
  fs.writeFileSync(file, JSON.stringify(future));
  await assert.rejects(game.validateDatabase(), { code: 'UNSUPPORTED_SCHEMA_VERSION' });
  assert.equal(JSON.parse(fs.readFileSync(file, 'utf8'))._meta.schemaVersion, 4);
});

test('read failures propagate without replacing inaccessible data with an empty array', async t => {
  const { game, directory } = setup(t);
  await register(game);
  const file = path.join(directory, 'usuarios.json');
  const preserved = path.join(directory, 'usuarios-preserved.json');
  fs.renameSync(file, preserved);
  const original = fs.readFileSync(preserved, 'utf8');
  fs.mkdirSync(file);
  await assert.rejects(register(game, 'Juan', '521111111111'), { code: 'STORAGE_READ_FAILED' });
  assert.equal(fs.statSync(file).isDirectory(), true);
  assert.equal(fs.readFileSync(preserved, 'utf8'), original);
});

test('an existing database missing a file is not silently initialized', async t => {
  const { game, directory, open } = setup(t);
  await register(game);
  await game.close();
  fs.unlinkSync(path.join(directory, 'estado.json'));
  await assert.rejects(open().game.validateDatabase(), { code: 'DATABASE_INCOMPLETE' });
  assert.equal(fs.existsSync(path.join(directory, 'estado.json')), false);
});

test('a second writer is refused and read-only repositories cannot mutate', async t => {
  const { game, storage, open } = setup(t);
  await register(game);
  const second = open().game;
  await assert.rejects(second.validateDatabase(), { code: 'DATABASE_LOCKED' });
  await assert.rejects(storage.withRead(repos => repos.users.insert({ id: 'invalid' })), { code: 'READ_ONLY_TRANSACTION' });
  await game.close();
  assert.equal((await second.validateDatabase()).users, 1);
});

test('unserializable transaction results do not commit a mutation', async t => {
  const { game, storage } = setup(t);
  const user = await register(game);
  await assert.rejects(storage.withTransaction(async repos => {
    await repos.users.replace({ ...user, economy: { coins: 100 } });
    return () => {};
  }), { name: 'DataCloneError' });
  assert.equal((await game.users.getUser(user.id)).economy.coins, 0);
});

for (const stage of ['prepared', 'committed', 'published:usuarios.json']) {
  test(`fresh database initialization recovers at ${stage}`, async t => {
    const context = setup(t, { fault: current => { if (current === stage) throw new Error('initialization interrupted'); } });
    await assert.rejects(context.game.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await context.game.close();
    const recovered = context.open({ fault: () => {} }).game;
    assert.deepEqual(await recovered.validateDatabase(), { valid: true, schemaVersion: 3, users: 0, characters: 8, units: 0, claims: 0 });
    assert.equal(fs.existsSync(path.join(context.directory, '_journal.json')), false);
  });
}

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:personajes.json', 'published:unidades.json', 'published:estado.json', 'published:eventos.json', 'published:ataques.json', 'published:combates.json', 'published:recompensas.json', 'published:_database.json']) {
  test(`starter recovery after failure at ${stage}`, async t => {
    const context = setup(t);
    const user = await register(context.game);
    await context.game.close();
    let fired = false;
    const failing = context.open({ fault: current => {
      if (current === stage && !fired) { fired = true; throw new Error('simulated write failure'); }
    } }).game;
    await assert.rejects(failing.starter.claimStarter({ userId: user.id, choice: 'panda' }), { code: 'STORAGE_WRITE_FAILED' });
    await assert.rejects(failing.validateDatabase(), { code: 'STORAGE_RECOVERY_REQUIRED' });
    await failing.close();
    const recovered = context.open().game;
    const report = await recovered.validateDatabase();
    const expected = stage === 'prepared' ? 0 : 1;
    assert.equal(report.units, expected);
    assert.equal(report.claims, expected);
    assert.equal(readRecords(context.directory, 'eventos').length, expected);
    const replay = await recovered.starter.claimStarter({ userId: user.id, choice: 'panda' });
    assert.equal(replay.unit.id, 'PAND-000001');
    assert.equal(replay.alreadyClaimed, expected === 1);
    assert.equal((await recovered.validateDatabase()).units, 1);
    assert.equal(fs.existsSync(path.join(context.directory, '_journal.json')), false);
  });
}

test('recovery rejects external edits and corrupted journals without overwriting evidence', async t => {
  const context = setup(t);
  const user = await register(context.game);
  await context.game.close();
  const failing = context.open({ fault: stage => { if (stage === 'committed') throw new Error('interrupted'); } }).game;
  await assert.rejects(failing.starter.claimStarter({ userId: user.id, choice: 'panda' }));
  await failing.close();
  const file = path.join(context.directory, 'usuarios.json');
  const edited = fs.readFileSync(file, 'utf8') + ' ';
  fs.writeFileSync(file, edited);
  await assert.rejects(context.open().game.validateDatabase(), { code: 'RECOVERY_CONFLICT' });
  assert.equal(fs.readFileSync(file, 'utf8'), edited);
  const journalFile = path.join(context.directory, '_journal.json');
  fs.writeFileSync(journalFile, '{broken');
  await assert.rejects(context.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(journalFile, 'utf8'), '{broken');
});

test('a real process interruption leaves a recoverable commit and cannot unlock a live writer', async t => {
  const context = setup(t);
  const user = await register(context.game);
  assert.throws(() => unlockStaleWriter(context.directory), { code: 'DATABASE_LOCKED' });
  await context.game.close();
  const moduleUrl = pathToFileURL(path.resolve('game/createGame.js')).href;
  const code = `
    import { createGame } from ${JSON.stringify(moduleUrl)};
    const game = createGame({ directory: process.argv[1], fault: stage => {
      if (stage === 'published:unidades.json') process.kill(process.pid, 'SIGKILL');
    } });
    await game.starter.claimStarter({ userId: process.argv[2], choice: 'panda' });
  `;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', code, context.directory, user.id], { encoding: 'utf8', timeout: 10000 });
  assert.equal(child.signal, 'SIGKILL', child.stderr);
  await assert.rejects(context.open().game.validateDatabase(), { code: 'DATABASE_LOCKED' });
  assert.equal(unlockStaleWriter(context.directory), true);
  const recovered = context.open().game;
  assert.equal((await recovered.validateDatabase()).units, 1);
  assert.equal((await recovered.starter.claimStarter({ userId: user.id, choice: 'lobo' })).unit.id, 'PAND-000001');
});

test('normal process exit releases its writer lock', async t => {
  const { directory } = setup(t);
  const moduleUrl = pathToFileURL(path.resolve('game/createGame.js')).href;
  const code = `import { createGame } from ${JSON.stringify(moduleUrl)}; await createGame({ directory: process.argv[1] }).validateDatabase();`;
  const child = spawnSync(process.execPath, ['--input-type=module', '-e', code, directory], { encoding: 'utf8', timeout: 10000 });
  assert.equal(child.status, 0, child.stderr);
  assert.equal(fs.existsSync(path.join(directory, '.writer.lock')), false);
});

test('standalone helpers cannot overwrite managed game collections', async t => {
  const { game, directory } = setup(t);
  await register(game);
  const file = path.join(directory, 'usuarios.json');
  const original = fs.readFileSync(file, 'utf8');
  const unsafe = crearDatabase('usuarios', [], { directory, maintenance: true });
  assert.throws(() => unsafe.guardar([]), { code: 'MANAGED_DATABASE_FILE' });
  assert.throws(() => unsafe.eliminar(), { code: 'MANAGED_DATABASE_FILE' });
  assert.equal(fs.readFileSync(file, 'utf8'), original);
});

test('standalone helper refuses corruption and requires maintenance for deletion', t => {
  const { directory } = setup(t);
  const database = crearDatabase('fixture', [], { directory });
  assert.deepEqual(database.cargar(), []);
  database.guardar([{ id: '1' }]);
  assert.deepEqual(database.cargar(), [{ id: '1' }]);
  assert.throws(() => database.guardar(undefined), { code: 'INVALID_DATABASE_DATA' });
  assert.deepEqual(database.cargar(), [{ id: '1' }]);
  assert.throws(() => database.eliminar(), { code: 'MAINTENANCE_REQUIRED' });
  const file = path.join(directory, 'fixture.json');
  fs.writeFileSync(file, '{broken');
  assert.throws(() => database.cargar(), { code: 'DATABASE_CORRUPT' });
  assert.throws(() => database.guardar([]), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(file, 'utf8'), '{broken');
  assert.throws(() => crearDatabase('../escape', [], { directory }), { code: 'INVALID_DATABASE_NAME' });
  assert.equal(path.isAbsolute(DATA_DIR), true);
});
