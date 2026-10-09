import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { V2_COLLECTIONS } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

async function v2Fixture(t, active = true) {
  const c = setup(t, { randomRoll: () => 0 });
  const a = await register(c.game);
  const b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const chatId = 'arena-1';
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
  await c.game.battle.accept({ userId: b.id, chatId });
  const closed = (await c.game.battle.surrender({ userId: b.id, chatId })).battle;
  if (active) {
    await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
    await c.game.battle.accept({ userId: b.id, chatId });
  }
  await c.game.close();
  const raw = {};
  for (const name of V2_COLLECTIONS) {
    const file = path.join(c.directory, `${name}.json`);
    const collection = JSON.parse(fs.readFileSync(file, 'utf8'));
    collection._meta.schemaVersion = 2;
    if (name === 'usuarios') {
      const user = collection.records.find(u => u.id === a.id);
      user.economy.coins = 555;
      user.progress = { level: 3, xp: 80 };
    }
    if (name === 'unidades') {
      for (const unit of collection.records) { delete unit.statGrowthVersion; delete unit.traitVersion; delete unit.combatBaseStats; }
      collection.records.find(u => u.id === ua.id).progress = { level: 5, xp: 90 };
    }
    if (name === 'estado') collection.records = collection.records.filter(r => r.kind !== 'progressionBaseline');
    if (name === 'combates') for (const battle of collection.records) {
      delete battle.rewardVersion;
      delete battle.settlement;
      for (const p of battle.players) if (p.unit) {
        delete p.unit.statsVersion;
        delete p.unit.combatBaseStats;
        delete p.unit.traitVersion;
        delete p.unit.traits;
        delete p.unit.variant;
        if (battle.status === 'active' && p.userId === a.id) p.unit.level = 5;
      }
    }
    raw[`${name}.json`] = JSON.stringify(collection, null, 2) + '\n';
    fs.writeFileSync(file, raw[`${name}.json`]);
  }
  raw['_database.json'] = JSON.stringify({ database: 'chengdu-cards', schemaVersion: 2 }, null, 2) + '\n';
  fs.writeFileSync(path.join(c.directory, '_database.json'), raw['_database.json']);
  for (const name of ['recompensas', 'sobres', 'aperturas', 'economia']) fs.unlinkSync(path.join(c.directory, `${name}.json`));
  return { ...c, a, b, ua, ub, chatId, closed, raw };
}

test('schema 2 migration preserves opening balances, XP, levels, birth identities and frozen active fights without retroactive rewards', async t => {
  const c = await v2Fixture(t);
  const game = c.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, 5);
  const user = await game.users.getUser(c.a.id);
  assert.deepEqual(user.progress, { level: 3, xp: 80 });
  assert.equal(user.economy.coins, 555);
  const unit = await game.units.getUnit(c.ua.id);
  assert.deepEqual(unit.progress, { level: 5, xp: 90 });
  assert.equal(unit.serial, c.ua.serial);
  assert.equal(unit.characterRevision, c.ua.characterRevision);
  assert.deepEqual(unit.initialStats, c.ua.initialStats);
  assert.equal(unit.currentStats.hp, 128);
  assert.deepEqual(readRecords(c.directory, 'recompensas'), []);
  const legacy = await game.battle.getHistoryBattle({ userId: c.a.id, battleId: c.closed.id });
  assert.equal(legacy.rewardVersion, 0);
  assert.equal(legacy.settlement, null);
  assert.deepEqual(legacy.actions, c.closed.actions);
  let battle = await game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId });
  assert.equal(battle.rewardVersion, 1);
  assert.equal(battle.players[0].unit.level, 5);
  assert.equal(battle.players[0].unit.stats.hp, 120);
  assert.equal((await game.units.getCombatDetails({ unitId: c.ua.id })).units[0].stats.hp, 120);
  while (battle.status === 'active') battle = (await game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
  assert.equal(battle.settlement.reason, 'rewarded');
  assert.equal((await game.economy.getBalance(c.a.id)).coins, 675);
  assert.deepEqual((await game.users.getUser(c.a.id)).progress, { level: 3, xp: 115 });
  assert.deepEqual((await game.units.getUnit(c.ua.id)).progress, { level: 5, xp: 125 });
  const snapshots = fs.readdirSync(path.join(c.directory, 'backups')).map(id => JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(s => s.files['usuarios.json'] === c.raw['usuarios.json'] && s.files['combates.json'] === c.raw['combates.json'] && s.files['recompensas.json'] === null));
});

for (const stage of ['prepared', 'committed', 'published:estado.json', 'published:combates.json', 'published:recompensas.json']) {
  test(`schema 2 progression migration recovers at ${stage}`, async t => {
    const c = await v2Fixture(t);
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('migration interrupted'); } }).game;
    await assert.rejects(failed.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 5);
    assert.equal((await game.economy.getBalance(c.a.id)).coins, 555);
    assert.deepEqual(readRecords(c.directory, 'recompensas'), []);
    assert.equal((await game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId })).players[0].unit.stats.hp, 120);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`old schema 2 ${phase} journal is recovered before migrating opening balances`, async t => {
    const c = await v2Fixture(t, false);
    const after = { ...c.raw };
    const users = JSON.parse(after['usuarios.json']);
    users.records.find(u => u.id === c.a.id).economy.coins = 777;
    after['usuarios.json'] = JSON.stringify(users, null, 2) + '\n';
    const body = { id: randomUUID(), before: c.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(c.directory, '_journal.json'), JSON.stringify({ version: 1, phase, body, checksum }));
    if (phase === 'committed') fs.writeFileSync(path.join(c.directory, 'usuarios.json'), after['usuarios.json']);
    const game = c.open().game;
    assert.equal((await game.economy.getBalance(c.a.id)).coins, phase === 'committed' ? 777 : 555);
    assert.equal((await game.validateDatabase()).schemaVersion, 5);
    assert.deepEqual(readRecords(c.directory, 'recompensas'), []);
  });
}

test('corrupt schema 2 battle data is rejected before any progression file is created', async t => {
  const c = await v2Fixture(t);
  const file = path.join(c.directory, 'combates.json');
  const corrupt = JSON.parse(c.raw['combates.json']);
  corrupt.records[1].players[0].unit.hp = 999;
  const text = JSON.stringify(corrupt);
  fs.writeFileSync(file, text);
  await assert.rejects(c.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(file, 'utf8'), text);
  assert.equal(fs.existsSync(path.join(c.directory, 'recompensas.json')), false);
  assert.equal(JSON.parse(fs.readFileSync(path.join(c.directory, '_database.json'), 'utf8')).schemaVersion, 2);
});

for (const field of ['coins', 'xp']) {
  test(`overflow of migrated ${field} rolls back the entire winning attack`, async t => {
    const c = await v2Fixture(t);
    const file = path.join(c.directory, 'usuarios.json');
    const users = JSON.parse(c.raw['usuarios.json']);
    const user = users.records.find(u => u.id === c.a.id);
    if (field === 'coins') user.economy.coins = Number.MAX_SAFE_INTEGER;
    else user.progress.xp = Number.MAX_SAFE_INTEGER;
    fs.writeFileSync(file, JSON.stringify(users));
    const game = c.open().game;
    let battle = await game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId });
    for (let i = 0; i < 3; i++) battle = (await game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
    const before = await game.users.getUser(c.a.id);
    await assert.rejects(game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2', operationKey: 'overflowing-win' }), { code: 'NUMERIC_OVERFLOW' });
    assert.deepEqual(await game.users.getUser(c.a.id), before);
    assert.deepEqual(await game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId }), battle);
    assert.equal((await game.units.getUnit(c.ua.id)).lock.referenceId, battle.id);
    assert.deepEqual(readRecords(c.directory, 'recompensas'), []);
    assert.equal((await game.validateDatabase()).valid, true);
  });
}
