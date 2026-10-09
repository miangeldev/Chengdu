import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { V4_COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { BALANCED_STATS, LEGACY_STATS, balancedLegacyStats } from '../game/characters/balance.js';
import { effectiveStats, progressionBaseline } from '../game/progression/rules.js';
import { calculateDamage } from '../game/battle/engine.js';
import { readRecords, register, setup } from './helpers.js';

async function v4Fixture(t, { overcap = false, overcapCount = 51, pandaRarity = 'common' } = {}) {
  const c = setup(t, { randomRoll: () => 0, randomDropInt: upper => upper - 1 });
  const a = await register(c.game);
  const b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const chatId = 'balance-arena';
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
  let battle = (await c.game.battle.accept({ userId: b.id, chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
  await c.storage.withTransaction(async repos => {
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, price: 100, revision: pack.revision + 1 });
  });
  const opened = await c.game.packs.openPack({ userId: a.id, packId: 'basico', operationKey: 'legacy-legendary' });
  assert.equal(opened.unit.characterId, 'dragon_carmesi');
  await c.game.teams.setTeam({ userId: a.id, unitIds: [opened.unit.id] });
  await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
  await c.game.battle.accept({ userId: b.id, chatId });
  await c.game.close();
  const state = Object.fromEntries(V4_COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))]));
  for (const collection of Object.values(state)) collection._meta.schemaVersion = 4;
  for (const character of state.personajes.records) {
    character.baseStats = structuredClone(LEGACY_STATS[character.id]);
    character.supply = character.id === 'dragon_carmesi' ? { type: 'limited', max: 500 } : { type: 'unlimited', max: null };
    if (character.id === 'mago_carmesi') character.supply = { type: 'limited', max: 2 };
    if (character.id === 'panda_guerrero') character.rarity = pandaRarity;
  }
  for (const unit of state.unidades.records) {
    unit.initialStats = structuredClone(LEGACY_STATS[unit.characterId]);
    delete unit.combatBaseStats;
    unit.statGrowthVersion = 1;
  }
  for (const oldBattle of state.combates.records) for (const player of oldBattle.players) {
    if (!player.unit) continue;
    const unit = state.unidades.records.find(u => u.id === player.unit.id);
    const snapshot = player.unit;
    snapshot.statsVersion = 1;
    delete snapshot.combatBaseStats;
    snapshot.stats = effectiveStats(unit.initialStats, snapshot.level, 1, snapshot.traits, snapshot.traitVersion);
    snapshot.hp = snapshot.stats.hp;
  }
  for (const oldBattle of state.combates.records) for (const action of oldBattle.actions) {
    if (action.type !== 'attack') continue;
    const actor = oldBattle.players.find(p => p.userId === action.actorId).unit;
    const target = oldBattle.players.find(p => p.userId === action.targetId).unit;
    const attack = actor.attacks.find(a => a.id === action.attackId);
    action.beforeHp = target.hp;
    action.damage = action.hit ? Math.min(target.hp, calculateDamage(attack, actor.stats, target.stats)) : 0;
    action.afterHp = target.hp - action.damage;
    target.hp = action.afterHp;
  }
  if (overcap) {
    const template = state.unidades.records.find(u => u.id === ua.id);
    for (let serial = 2; serial <= overcapCount; serial++) {
      const unit = { ...structuredClone(template), id: `PAND-${String(serial).padStart(6, '0')}`, serial,
        origin: { type: 'admin', sourceId: `legacy-${serial}` }, progress: { level: 1, xp: 0 }, battleStats: { wins: 0, losses: 0 }, lock: null };
      state.unidades.records.push(unit);
      state.estado.records.push(progressionBaseline('unit', unit));
      state.eventos.records.push({ id: `EVT-${randomUUID()}`, type: 'unit_created', unitId: unit.id,
        fromOwnerId: null, toOwnerId: a.id, reason: 'admin', operationKey: `legacy-extra-${serial}`, createdAt: unit.createdAt });
    }
    const counter = state.estado.records.find(r => r.id === 'mint:panda_guerrero');
    counter.lastSerial = overcapCount;
    counter.issuedCount = overcapCount;
  }
  const raw = Object.fromEntries(V4_COLLECTIONS.map(name => [`${name}.json`, JSON.stringify(state[name], null, 2) + '\n']));
  raw['_database.json'] = JSON.stringify({ database: 'chengdu-cards', schemaVersion: 4 }, null, 2) + '\n';
  validateDatabase(state, 4);
  for (const [file, text] of Object.entries(raw)) fs.writeFileSync(path.join(c.directory, file), text);
  return { ...c, a, b, ua, ub, opened, chatId, raw, state };
}

test('schema 4 balance migration preserves births, progression, receipts, ledger and old fight snapshots', async t => {
  const c = await v4Fixture(t);
  const game = c.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, 5);
  const characters = readRecords(c.directory, 'personajes');
  for (const character of characters) {
    assert.deepEqual(character.baseStats, BALANCED_STATS[character.id]);
    assert.equal(character.revision, c.state.personajes.records.find(p => p.id === character.id).revision + 1);
  }
  assert.deepEqual(characters.find(p => p.id === 'mago_carmesi').supply, { type: 'limited', max: 2 });
  assert.deepEqual(characters.find(p => p.id === 'dragon_carmesi').supply, { type: 'limited', max: 10 });
  const dragon = await game.units.getUnit(c.opened.unit.id);
  const before = c.state.unidades.records.find(u => u.id === dragon.id);
  for (const field of ['id', 'serial', 'characterRevision', 'initialStats', 'traits', 'variant', 'traitVersion', 'progress', 'origin']) assert.deepEqual(dragon[field], before[field]);
  assert.equal(dragon.statGrowthVersion, 2);
  assert.deepEqual(dragon.combatBaseStats, balancedLegacyStats(before));
  for (const name of ['usuarios', 'estado', 'eventos', 'combates', 'recompensas', 'sobres', 'aperturas', 'economia']) {
    assert.deepEqual(readRecords(c.directory, name), c.state[name].records);
  }
  const frozen = (await game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId })).players.find(p => p.userId === c.a.id).unit;
  assert.equal(frozen.statsVersion, 1);
  assert.deepEqual(frozen.stats, effectiveStats(before.initialStats, 1, 1, before.traits, before.traitVersion));
  await game.battle.surrender({ userId: c.b.id, chatId: c.chatId });
  await game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId });
  const fresh = (await game.battle.accept({ userId: c.b.id, chatId: c.chatId })).battle.players.find(p => p.userId === c.a.id).unit;
  assert.equal(fresh.statsVersion, 2);
  assert.deepEqual(fresh.stats, effectiveStats(dragon.initialStats, 1, 2, dragon.traits, dragon.traitVersion, dragon.combatBaseStats));
  const snapshots = fs.readdirSync(path.join(c.directory, 'backups')).map(id => JSON.parse(fs.readFileSync(path.join(c.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(snapshots.some(s => s.files['unidades.json'] === c.raw['unidades.json'] && s.files['personajes.json'] === c.raw['personajes.json']));
});

test('legacy over-cap emissions remain owned and playable while the character is frozen for further minting', async t => {
  const c = await v4Fixture(t, { overcap: true });
  const opened = c.open();
  const game = opened.game;
  assert.equal((await game.validateDatabase()).schemaVersion, 5);
  const panda = readRecords(c.directory, 'personajes').find(p => p.id === 'panda_guerrero');
  assert.deepEqual(panda.supply, { type: 'limited', max: 50, grandfatheredIssued: 51 });
  assert.equal(readRecords(c.directory, 'unidades').filter(u => u.characterId === panda.id).length, 51);
  await assert.rejects(game.units.createUnit({ ownerId: c.a.id, characterId: panda.id, origin: { type: 'admin', sourceId: 'extra' }, operationKey: 'extra-after-cap' }), { code: 'SUPPLY_EXHAUSTED' });
  await assert.rejects(opened.storage.withTransaction(async repos => {
    const character = await repos.characters.get(panda.id);
    await repos.characters.replace({ ...character, revision: character.revision + 1, supply: { ...character.supply, grandfatheredIssued: 52 } });
  }), { code: 'DATABASE_CORRUPT' });
  await assert.rejects(opened.storage.withTransaction(async repos => {
    const unit = await repos.units.get(c.ua.id);
    await repos.units.replace({ ...unit, combatBaseStats: { ...unit.combatBaseStats, hp: unit.combatBaseStats.hp + 1 } });
  }), { code: 'DATABASE_CORRUPT' });
  assert.equal((await game.validateDatabase()).valid, true);
});

test('grandfathered emissions stay frozen after a later rarity change raises the supply cap', async t => {
  const c = await v4Fixture(t, { overcap: true, overcapCount: 36, pandaRarity: 'rare' });
  const opened = c.open();
  const game = opened.game;
  assert.equal((await game.validateDatabase()).schemaVersion, 5);
  assert.deepEqual(readRecords(c.directory, 'personajes').find(p => p.id === 'panda_guerrero').supply,
    { type: 'limited', max: 35, grandfatheredIssued: 36 });
  await opened.storage.withTransaction(async repos => {
    const character = await repos.characters.get('panda_guerrero');
    await repos.characters.replace({ ...character, revision: character.revision + 1, rarity: 'common',
      supply: { ...character.supply, max: 50 } });
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, revision: pack.revision + 1, price: 1,
      pool: [{ rarity: 'common', weight: 1, characterIds: [character.id] }] });
  });
  const freshUser = await register(game, 'Sin starter', '521222222222');
  assert.equal((await game.starter.getStarterOptions()).find(o => o.choice === 'panda').available, false);
  assert.equal((await game.packs.listPacks()).items[0].available, false);
  await assert.rejects(game.units.createUnit({ ownerId: c.a.id, characterId: 'panda_guerrero',
    origin: { type: 'admin', sourceId: 'quality-change' }, operationKey: 'frozen-admin' }), { code: 'SUPPLY_EXHAUSTED' });
  await assert.rejects(game.starter.claimStarter({ userId: freshUser.id, choice: 'panda' }), { code: 'SUPPLY_EXHAUSTED' });
  await assert.rejects(game.packs.openPack({ userId: c.a.id, packId: 'basico', operationKey: 'frozen-pack' }), { code: 'PACK_UNAVAILABLE' });
  assert.equal(readRecords(c.directory, 'unidades').filter(u => u.characterId === 'panda_guerrero').length, 36);
  assert.equal(readRecords(c.directory, 'estado').find(r => r.id === 'mint:panda_guerrero').issuedCount, 36);
  assert.equal((await game.validateDatabase()).valid, true);
});

for (const stage of ['prepared', 'committed', 'published:personajes.json', 'published:unidades.json', 'published:combates.json', 'published:_database.json']) {
  test(`schema 4 balance migration recovers at ${stage}`, async t => {
    const c = await v4Fixture(t);
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted balance migration'); } }).game;
    await assert.rejects(failed.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 5);
    assert.deepEqual(readRecords(c.directory, 'aperturas'), c.state.aperturas.records);
    assert.deepEqual(readRecords(c.directory, 'economia'), c.state.economia.records);
    assert.deepEqual(readRecords(c.directory, 'combates'), c.state.combates.records);
    assert.equal(readRecords(c.directory, 'unidades').find(u => u.id === c.opened.unit.id).statGrowthVersion, 2);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`old schema 4 ${phase} journal is recovered before balancing the catalog`, async t => {
    const c = await v4Fixture(t);
    const after = { ...c.raw };
    const characters = JSON.parse(after['personajes.json']);
    characters.records.find(p => p.id === 'mago_carmesi').supply.max = 1;
    after['personajes.json'] = JSON.stringify(characters, null, 2) + '\n';
    const body = { id: randomUUID(), before: c.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(c.directory, '_journal.json'), JSON.stringify({ version: 1, phase, body, checksum }));
    if (phase === 'committed') fs.writeFileSync(path.join(c.directory, 'personajes.json'), after['personajes.json']);
    const game = c.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 5);
    assert.equal(readRecords(c.directory, 'personajes').find(p => p.id === 'mago_carmesi').supply.max, phase === 'committed' ? 1 : 2);
    assert.deepEqual(readRecords(c.directory, 'combates'), c.state.combates.records);
    assert.deepEqual(readRecords(c.directory, 'economia'), c.state.economia.records);
  });
}

test('overflow while computing a legacy combat base leaves all original schema 4 files untouched', async t => {
  const c = await v4Fixture(t);
  const state = structuredClone(c.state);
  const dragon = state.unidades.records.find(u => u.id === c.opened.unit.id);
  dragon.initialStats.hp = Number.MAX_SAFE_INTEGER;
  const active = state.combates.records.find(b => b.status === 'active');
  const snapshot = active.players.find(p => p.userId === c.a.id).unit;
  snapshot.stats.hp = Number.MAX_SAFE_INTEGER;
  snapshot.hp = Number.MAX_SAFE_INTEGER;
  validateDatabase(state, 4);
  const before = Object.fromEntries(V4_COLLECTIONS.map(name => [`${name}.json`, JSON.stringify(state[name], null, 2) + '\n']));
  before['_database.json'] = c.raw['_database.json'];
  for (const [file, body] of Object.entries(before)) fs.writeFileSync(path.join(c.directory, file), body);
  const snapshotsBefore = fs.readdirSync(path.join(c.directory, 'backups'));
  await assert.rejects(c.open().game.validateDatabase(), { code: 'NUMERIC_OVERFLOW' });
  for (const [file, body] of Object.entries(before)) assert.equal(fs.readFileSync(path.join(c.directory, file), 'utf8'), body);
  assert.deepEqual(fs.readdirSync(path.join(c.directory, 'backups')), snapshotsBefore);
  assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
});
