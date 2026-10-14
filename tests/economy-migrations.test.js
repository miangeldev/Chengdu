import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { SCHEMA_VERSION, V5_COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { readRecords, register, setup, stripBetaContentFixture } from './helpers.js';

async function v5Fixture(t, version = 5) {
  const c = setup(t, { clock: () => '2026-10-11T10:00:00.000Z', randomRoll: () => 0, randomDropInt: () => 0 });
  const a = await register(c.game);
  const b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const chatId = 'economy-migration-arena';
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
  let battle = (await c.game.battle.accept({ userId: b.id, chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
  await c.storage.withTransaction(async repos => {
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, price: 100, revision: pack.revision + 1 });
  });
  const opening = await c.game.packs.openPack({ userId: a.id, packId: 'basico', operationKey: 'before-economy-migration' });
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
  await c.game.battle.accept({ userId: b.id, chatId });
  const third = await register(c.game, 'Reserva', '521222222222');
  await c.game.close();
  stripBetaContentFixture(c.directory);
  const state = Object.fromEntries(V5_COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))]));
  for (const collection of Object.values(state)) collection._meta.schemaVersion = version;
  if (version === 4) {
    for (const unit of state.unidades.records) {
      unit.statGrowthVersion = 1;
      delete unit.combatBaseStats;
    }
    for (const record of state.combates.records) for (const player of record.players) if (player.unit) {
      player.unit.statsVersion = 1;
      delete player.unit.combatBaseStats;
    }
  }
  validateDatabase(state, version);
  const raw = Object.fromEntries(V5_COLLECTIONS.map(name => [`${name}.json`, JSON.stringify(state[name], null, 2) + '\n']));
  raw['_database.json'] = JSON.stringify({ database: 'chengdu-cards', schemaVersion: version }, null, 2) + '\n';
  for (const [file, body] of Object.entries(raw)) fs.writeFileSync(path.join(c.directory, file), body);
  for (const name of ['diarios', 'mercado', 'ventas']) fs.unlinkSync(path.join(c.directory, `${name}.json`));
  return { ...c, a, b, ua, ub, third, chatId, opening, raw, state };
}

test('schema 5 economy migration preserves every historical record and creates no retroactive daily awards', async t => {
  const c = await v5Fixture(t);
  const game = c.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
  for (const name of V5_COLLECTIONS) assert.deepEqual(readRecords(c.directory, name).slice(0, c.state[name].records.length), c.state[name].records);
  assert.deepEqual(readRecords(c.directory, 'diarios'), []);
  assert.equal((await game.economy.getBalance(c.a.id)).coins, 20);
  const unit = await game.units.getUnit(c.ua.id);
  assert.deepEqual(unit.initialStats, c.ua.initialStats);
  assert.deepEqual(unit.progress, { level: 1, xp: 35 });
  const snapshots = fs.readdirSync(path.join(c.directory, 'backups')).map(id => JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(s => s.files['economia.json'] === c.raw['economia.json'] && s.files['combates.json'] === c.raw['combates.json'] && s.files['diarios.json'] === null));
});

test('migrated opening balances remain separate from recorded lifetime income and expenses', async t => {
  const c = await v5Fixture(t);
  const state = structuredClone(c.state);
  state.usuarios.records.find(u => u.id === c.a.id).economy.coins += 500;
  state.estado.records.find(r => r.id === `progression:${c.a.id}`).coins += 500;
  for (const name of ['recompensas', 'aperturas', 'economia']) for (const source of state[name].records.filter(r => r.userId === c.a.id)) {
    source.balanceBefore += 500;
    source.balanceAfter += 500;
  }
  state.usuarios.records.find(u => u.id === c.third.id).economy.coins = 500;
  state.estado.records.find(r => r.id === `progression:${c.third.id}`).coins = 500;
  validateDatabase(state, 5);
  for (const name of V5_COLLECTIONS) fs.writeFileSync(path.join(c.directory, `${name}.json`), JSON.stringify(state[name]));
  const game = c.open().game;
  assert.deepEqual(await game.economy.getBalance(c.a.id), { coins: 520, income: '120', expenses: '100', openingBalance: 500 });
  assert.deepEqual(await game.economy.getBalance(c.third.id), { coins: 500, income: '0', expenses: '0', openingBalance: 500 });
  await game.economy.claimDaily({ userId: c.third.id, operationKey: 'daily-after-legacy-balance' });
  assert.deepEqual(await game.economy.getBalance(c.third.id), { coins: 600, income: '100', expenses: '0', openingBalance: 500 });
});

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:economia.json', 'published:diarios.json', 'published:_database.json']) {
  test(`schema 5 economy migration recovers at ${stage}`, async t => {
    const c = await v5Fixture(t);
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted economy migration'); } }).game;
    await assert.rejects(failed.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
    for (const name of V5_COLLECTIONS) assert.deepEqual(readRecords(c.directory, name).slice(0, c.state[name].records.length), c.state[name].records);
    assert.deepEqual(readRecords(c.directory, 'diarios'), []);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const version of [4, 5]) for (const phase of ['prepared', 'committed']) {
  test(`old schema ${version} ${phase} journal is recovered before the daily collection is introduced`, async t => {
    const c = await v5Fixture(t, version);
    const after = { ...c.raw };
    const packs = JSON.parse(after['sobres.json']);
    packs.records[0].name = 'Sobre Histórico';
    packs.records[0].revision++;
    after['sobres.json'] = JSON.stringify(packs, null, 2) + '\n';
    const body = { id: randomUUID(), before: c.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(c.directory, '_journal.json'), JSON.stringify({ version: 1, phase, body, checksum }));
    if (phase === 'committed') fs.writeFileSync(path.join(c.directory, 'sobres.json'), after['sobres.json']);
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, SCHEMA_VERSION);
    assert.equal(readRecords(c.directory, 'sobres')[0].name, phase === 'committed' ? 'Sobre Histórico' : c.state.sobres.records[0].name);
    for (const name of ['usuarios', 'recompensas', 'aperturas', 'economia', 'combates']) assert.deepEqual(readRecords(c.directory, name).slice(0, c.state[name].records.length), c.state[name].records);
    assert.deepEqual(readRecords(c.directory, 'diarios'), []);
  });
}

test('a corrupt schema 5 ledger is rejected before creating daily data', async t => {
  const c = await v5Fixture(t);
  const ledger = structuredClone(c.state.economia);
  ledger.records[0].balanceAfter++;
  const text = JSON.stringify(ledger);
  fs.writeFileSync(path.join(c.directory, 'economia.json'), text);
  await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(path.join(c.directory, 'economia.json'), 'utf8'), text);
  assert.equal(fs.existsSync(path.join(c.directory, 'diarios.json')), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(c.directory, '_database.json'), 'utf8')).schemaVersion, 5);
});

test('unexpected daily data in a schema 5 directory is preserved and blocks migration', async t => {
  const c = await v5Fixture(t);
  const evidence = '{"unexpected":"receipt evidence"}';
  fs.writeFileSync(path.join(c.directory, 'diarios.json'), evidence);
  await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_INCOMPLETE' });
  assert.equal(fs.readFileSync(path.join(c.directory, 'diarios.json'), 'utf8'), evidence);
  assert.equal(JSON.parse(fs.readFileSync(path.join(c.directory, '_database.json'), 'utf8')).schemaVersion, 5);
});

test('overflow of a migrated opening balance rolls back the complete daily claim', async t => {
  const c = await v5Fixture(t);
  const users = structuredClone(c.state.usuarios);
  users.records.find(u => u.id === c.third.id).economy.coins = Number.MAX_SAFE_INTEGER;
  const entries = structuredClone(c.state.estado);
  entries.records.find(r => r.id === `progression:${c.third.id}`).coins = Number.MAX_SAFE_INTEGER;
  fs.writeFileSync(path.join(c.directory, 'usuarios.json'), JSON.stringify(users));
  fs.writeFileSync(path.join(c.directory, 'estado.json'), JSON.stringify(entries));
  const game = c.open().game;
  await game.validateDatabase();
  const before = Object.fromEntries([...V5_COLLECTIONS, 'diarios'].map(name => [name, fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8')]));
  await assert.rejects(game.economy.claimDaily({ userId: c.third.id, operationKey: 'overflow-daily' }), { code: 'NUMERIC_OVERFLOW' });
  for (const [name, body] of Object.entries(before)) assert.equal(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'), body);
  assert.equal((await game.economy.getBalance(c.third.id)).coins, Number.MAX_SAFE_INTEGER);
  assert.deepEqual(readRecords(c.directory, 'diarios'), []);
});
