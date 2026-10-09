import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { V3_COLLECTIONS } from '../storage/validation.js';
import { seedPacks } from '../game/packs/catalog.js';
import { balancedLegacyStats } from '../game/characters/balance.js';
import { readRecords, register, setup } from './helpers.js';

async function v3Fixture(t) {
  const c = setup(t, { randomRoll: () => 0 });
  const a = await register(c.game);
  const b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const chatId = 'migration-arena';
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
  let battle = (await c.game.battle.accept({ userId: b.id, chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
  await c.game.battle.accept({ userId: b.id, chatId });
  await c.game.close();
  const raw = {};
  for (const name of V3_COLLECTIONS) {
    const file = path.join(c.directory, `${name}.json`);
    const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
    collection._meta.schemaVersion = 3;
    if (name === 'usuarios') collection.records.find(u => u.id === a.id).economy.coins += 435;
    if (name === 'estado') collection.records.find(r => r.id === `progression:${a.id}`).coins += 435;
    if (name === 'recompensas') for (const reward of collection.records.filter(r => r.userId === a.id)) {
      reward.balanceBefore += 435;
      reward.balanceAfter += 435;
    }
    if (name === 'unidades') for (const unit of collection.records) {
      delete unit.traitVersion;
      delete unit.combatBaseStats;
      unit.statGrowthVersion = 1;
      if (unit.id === ua.id) {
        unit.traits = ['Veterano'];
        unit.variant = 'sepia';
      }
    }
    if (name === 'combates') for (const record of collection.records) for (const player of record.players) {
      if (player.unit) {
        for (const key of ['traits', 'variant', 'traitVersion', 'combatBaseStats']) delete player.unit[key];
        player.unit.statsVersion = 1;
      }
    }
    raw[`${name}.json`] = JSON.stringify(collection, null, 2) + '\n';
    fs.writeFileSync(file, raw[`${name}.json`]);
  }
  raw['_database.json'] = JSON.stringify({ database: 'chengdu-cards', schemaVersion: 3 }, null, 2) + '\n';
  fs.writeFileSync(path.join(c.directory, '_database.json'), raw['_database.json']);
  for (const name of ['sobres', 'aperturas', 'economia']) fs.unlinkSync(path.join(c.directory, `${name}.json`));
  return { ...c, a, b, ua, ub, chatId, raw };
}

test('schema 3 collection migration preserves balances, rewards, identities, legacy traits and frozen battles', async t => {
  const c = await v3Fixture(t);
  const game = c.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, 5);
  assert.equal((await game.economy.getBalance(c.a.id)).coins, 555);
  const unit = await game.units.getUnit(c.ua.id);
  assert.equal(unit.traitVersion, 0);
  assert.deepEqual(unit.traits, ['Veterano']);
  assert.equal(unit.variant, 'sepia');
  assert.equal(unit.serial, c.ua.serial);
  assert.deepEqual(unit.initialStats, c.ua.initialStats);
  assert.deepEqual(unit.currentStats, balancedLegacyStats(c.ua));
  assert.deepEqual(readRecords(c.directory, 'combates'), JSON.parse(c.raw['combates.json']).records);
  assert.deepEqual(readRecords(c.directory, 'recompensas'), JSON.parse(c.raw['recompensas.json']).records);
  assert.deepEqual(readRecords(c.directory, 'sobres'), seedPacks());
  assert.deepEqual(readRecords(c.directory, 'aperturas'), []);
  const movements = readRecords(c.directory, 'economia');
  assert.deepEqual(movements, readRecords(c.directory, 'recompensas').map(reward => ({
    id: `coin:${reward.id}`, userId: reward.userId, type: 'credit', sourceType: 'battle_reward', sourceId: reward.id,
    amount: reward.coins, balanceBefore: reward.balanceBefore, balanceAfter: reward.balanceAfter, createdAt: reward.createdAt
  })));
  assert.equal(movements.filter(m => m.amount === 0).length, 1);
  const snapshots = fs.readdirSync(path.join(c.directory, 'backups')).map(id => JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(s => s.files['usuarios.json'] === c.raw['usuarios.json'] && s.files['recompensas.json'] === c.raw['recompensas.json'] && s.files['economia.json'] === null));
});

for (const stage of ['prepared', 'committed', 'published:unidades.json', 'published:sobres.json', 'published:aperturas.json', 'published:economia.json']) {
  test(`schema 3 collection migration recovers at ${stage}`, async t => {
    const c = await v3Fixture(t);
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('migration interrupted'); } }).game;
    await assert.rejects(failed.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 5);
    assert.equal((await game.economy.getBalance(c.a.id)).coins, 555);
    assert.equal(readRecords(c.directory, 'economia').length, 2);
    assert.deepEqual(readRecords(c.directory, 'combates'), JSON.parse(c.raw['combates.json']).records);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`old schema 3 ${phase} journal is recovered before migrating the coin ledger`, async t => {
    const c = await v3Fixture(t);
    const after = { ...c.raw };
    for (const name of ['usuarios', 'estado', 'recompensas']) {
      const collection = JSON.parse(after[`${name}.json`]);
      if (name === 'usuarios') collection.records.find(u => u.id === c.a.id).economy.coins += 222;
      if (name === 'estado') collection.records.find(r => r.id === `progression:${c.a.id}`).coins += 222;
      if (name === 'recompensas') for (const r of collection.records.filter(r => r.userId === c.a.id)) {
        r.balanceBefore += 222;
        r.balanceAfter += 222;
      }
      after[`${name}.json`] = JSON.stringify(collection, null, 2) + '\n';
    }
    const body = { id: randomUUID(), before: c.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(c.directory, '_journal.json'), JSON.stringify({ version: 1, phase, body, checksum }));
    if (phase === 'committed') fs.writeFileSync(path.join(c.directory, 'usuarios.json'), after['usuarios.json']);
    const game = c.open().game;
    assert.equal((await game.economy.getBalance(c.a.id)).coins, phase === 'committed' ? 777 : 555);
    assert.equal((await game.validateDatabase()).schemaVersion, 5);
    assert.equal(readRecords(c.directory, 'economia')[0].balanceBefore, phase === 'committed' ? 657 : 435);
  });
}

test('corrupt schema 3 balances are rejected before creating collection files', async t => {
  const c = await v3Fixture(t);
  const users = JSON.parse(c.raw['usuarios.json']);
  users.records.find(u => u.id === c.a.id).economy.coins++;
  const text = JSON.stringify(users);
  fs.writeFileSync(path.join(c.directory, 'usuarios.json'), text);
  await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(path.join(c.directory, 'usuarios.json'), 'utf8'), text);
  for (const name of ['sobres', 'aperturas', 'economia']) assert.equal(fs.existsSync(path.join(c.directory, `${name}.json`)), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(c.directory, '_database.json'), 'utf8')).schemaVersion, 3);
});
