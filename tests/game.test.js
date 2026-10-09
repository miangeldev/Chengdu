import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { identity, readRecords, register, setup, updateCharacter } from './helpers.js';

test('register → starter → collection and ownership survive reopening', async t => {
  const context = setup(t);
  let game = context.game;
  const miguel = await register(game);
  const juan = await register(game, 'Juan', '521111111111');
  const panda = await game.starter.claimStarter({ userId: miguel.id, choice: 'panda' });
  const lobo = await game.starter.claimStarter({ userId: juan.id, choice: '3' });
  assert.equal(panda.unit.id, 'PAND-000001');
  assert.equal(lobo.unit.id, 'LOBO-000001');
  assert.notEqual(miguel.id, identity().subject);
  assert.equal((await game.units.getUserUnits(miguel.id)).items[0].id, panda.unit.id);
  assert.equal((await game.units.getUserUnits(juan.id)).items[0].id, lobo.unit.id);
  const detail = await game.units.getUnit('pand-000001');
  assert.deepEqual(detail.owner, { id: miguel.id, name: 'Miguel' });
  assert.ok(!JSON.stringify(detail).includes('@s.whatsapp.net'));
  detail.initialStats.hp = 1;
  assert.equal((await game.units.getUnit(panda.unit.id)).initialStats.hp, 120);
  await game.close();
  game = context.open().game;
  assert.equal((await game.users.getUserByIdentity(identity())).id, miguel.id);
  assert.equal((await game.users.getProfile(miguel.id)).starterClaim.unitId, panda.unit.id);
  assert.deepEqual((await game.units.getUserUnits(juan.id)).items.map(u => u.id), [lobo.unit.id]);
  assert.deepEqual(await game.validateDatabase(), { valid: true, schemaVersion: 5, users: 2, characters: 8, units: 2, claims: 2 });
});

test('simultaneous registrations and normalized device JIDs cannot duplicate a player', async t => {
  const { game } = setup(t);
  const results = await Promise.allSettled([register(game), register(game)]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'USER_ALREADY_EXISTS');
  const user = results.find(r => r.status === 'fulfilled').value;
  assert.equal((await game.users.getUserByIdentity({ provider: 'whatsapp', subject: '521999999999:12@s.whatsapp.net' })).id, user.id);
  await assert.rejects(game.users.registerUser({ identity: { provider: 'whatsapp', subject: '521999999999:8@s.whatsapp.net' }, name: 'Otro' }), { code: 'USER_ALREADY_EXISTS' });
  const lid = await game.users.registerUser({ identity: { provider: 'whatsapp', subject: '521999999999@lid' }, name: 'LID distinto' });
  assert.notEqual(lid.id, user.id);
});

test('a host-verified additional identity resolves to the same player and starter', async t => {
  const { game } = setup(t);
  const user = await register(game);
  await game.starter.claimStarter({ userId: user.id, choice: 'panda' });
  const alias = { provider: 'whatsapp', subject: '555555555555@lid' };
  await game.users.linkIdentity({ userId: user.id, identity: alias });
  await game.users.linkIdentity({ userId: user.id, identity: alias });
  const same = await game.users.getUserByIdentity(alias);
  assert.equal(same.id, user.id);
  assert.equal(same.identities.length, 2);
  assert.equal((await game.starter.claimStarter({ userId: same.id, choice: 'lobo' })).unit.id, 'PAND-000001');
  const other = await register(game, 'Juan', '521111111111');
  await assert.rejects(game.users.linkIdentity({ userId: other.id, identity: alias }), { code: 'IDENTITY_ALREADY_LINKED' });
});

test('name and identity validation rejects invalid input before persisting', async t => {
  const { game } = setup(t);
  for (const name of ['', '   ', 'x'.repeat(41), 'A\nB', 'A\u200bB']) {
    await assert.rejects(game.users.registerUser({ identity: identity(), name }), { code: 'INVALID_NAME' });
  }
  for (const subject of ['group@g.us', 'status@broadcast', '', 'garbage@s.whatsapp.net']) {
    await assert.rejects(game.users.registerUser({ identity: { provider: 'whatsapp', subject }, name: 'Miguel' }), { code: 'INVALID_IDENTITY' });
  }
  const user = await register(game, '  🐼'.repeat(1) + '🐼'.repeat(39) + '  ');
  assert.equal([...user.name].length, 40);
  assert.equal((await game.validateDatabase()).users, 1);
});

test('concurrent different starter choices mint exactly once; replay does not write', async t => {
  const { game, directory } = setup(t);
  const user = await register(game);
  const results = await Promise.all([
    game.starter.claimStarter({ userId: user.id, choice: 'panda' }),
    game.starter.claimStarter({ userId: user.id, choice: 'mago' })
  ]);
  assert.equal(results[0].unit.id, results[1].unit.id);
  assert.deepEqual(results.map(r => r.alreadyClaimed), [false, true]);
  assert.equal(readRecords(directory, 'unidades').length, 1);
  assert.equal(readRecords(directory, 'eventos').length, 1);
  assert.equal(readRecords(directory, 'estado').filter(r => r.kind === 'claim').length, 1);
  const before = fs.readFileSync(path.join(directory, 'estado.json'), 'utf8');
  const replay = await game.starter.claimStarter({ userId: user.id, choice: 'invalid' });
  assert.equal(replay.unit.id, results[0].unit.id);
  assert.equal(fs.readFileSync(path.join(directory, 'estado.json'), 'utf8'), before);
});

test('only one of two contenders receives the last limited-supply starter', async t => {
  const { game, storage, directory } = setup(t);
  const a = await register(game);
  const b = await register(game, 'Juan', '521111111111');
  await updateCharacter(storage, 'mago_carmesi', { supply: { type: 'limited', max: 1 } });
  const results = await Promise.allSettled([
    game.starter.claimStarter({ userId: a.id, choice: 'mago' }),
    game.starter.claimStarter({ userId: b.id, choice: 'mago' })
  ]);
  assert.equal(results.filter(r => r.status === 'fulfilled').length, 1);
  assert.equal(results.find(r => r.status === 'rejected').reason.code, 'SUPPLY_EXHAUSTED');
  assert.equal(readRecords(directory, 'unidades').length, 1);
  assert.equal((await game.users.getProfile(b.id)).starterClaim, null);
});

test('mint API verifies owner, availability, origin and operation key', async t => {
  const { game, storage, directory } = setup(t);
  const user = await register(game);
  const args = { characterId: 'dragon_carmesi', ownerId: user.id, origin: { type: 'admin', sourceId: 'fixture' }, operationKey: 'admin:1' };
  await assert.rejects(game.units.createUnit({ ...args, ownerId: 'unknown' }), { code: 'USER_NOT_FOUND' });
  await assert.rejects(game.units.createUnit({ ...args, characterId: 'unknown' }), { code: 'CHARACTER_NOT_FOUND' });
  await assert.rejects(game.units.createUnit({ ...args, operationKey: '' }), { code: 'INVALID_OPERATION_KEY' });
  await assert.rejects(game.units.createUnit({ ...args, origin: { type: 'starter', sourceId: 'fixture' } }), { code: 'INVALID_ORIGIN' });
  const first = await game.units.createUnit(args);
  const replay = await game.units.createUnit(args);
  assert.deepEqual(first, replay);
  await assert.rejects(game.units.createUnit({ ...args, characterId: 'panda_guerrero' }), { code: 'OPERATION_CONFLICT' });
  await updateCharacter(storage, 'dragon_carmesi', { obtainable: false });
  assert.equal((await game.units.createUnit(args)).id, first.id);
  await assert.rejects(game.units.createUnit({ ...args, operationKey: 'admin:2' }), { code: 'CHARACTER_UNAVAILABLE' });
  assert.equal(readRecords(directory, 'eventos').length, 1);
});

test('serial allocation is shared per character and remains unique under concurrent calls', async t => {
  const { game } = setup(t);
  const user = await register(game);
  const units = await Promise.all(Array.from({ length: 12 }, (_, i) => game.units.createUnit({
    characterId: 'panda_guerrero', ownerId: user.id,
    origin: { type: 'admin', sourceId: 'test' }, operationKey: `fixture:${i}`
  })));
  assert.deepEqual(units.map(u => u.serial), Array.from({ length: 12 }, (_, i) => i + 1));
  assert.equal(new Set(units.map(u => u.id)).size, 12);
  assert.equal((await game.validateDatabase()).units, 12);
});

test('initial stats survive template revision changes and mint variation stays in bounds', async t => {
  const { game, storage } = setup(t);
  const user = await register(game);
  const old = await game.starter.claimStarter({ userId: user.id, choice: 'panda' });
  await updateCharacter(storage, 'panda_guerrero', {
    baseStats: { hp: 150, attack: 30, defense: 25, speed: 10 },
    statVariation: { hp: 5, attack: 2, defense: 2, speed: 1 }
  });
  const latest = await game.units.createUnit({ characterId: 'panda_guerrero', ownerId: user.id, origin: { type: 'admin', sourceId: 'test' }, operationKey: 'balance:1' });
  assert.equal((await game.units.getUnit(old.unit.id)).initialStats.hp, 120);
  assert.equal(latest.characterRevision, 2);
  assert.ok(latest.initialStats.hp >= 145 && latest.initialStats.hp <= 155);
});

test('catalog and collections paginate stably; cursors cannot cross owners', async t => {
  const { game } = setup(t, { clock: () => '2026-10-07T20:00:00Z' });
  const user = await register(game);
  const other = await register(game, 'Juan', '521111111111');
  for (let i = 0; i < 5; i++) await game.units.createUnit({ characterId: 'panda_guerrero', ownerId: user.id, origin: { type: 'admin', sourceId: 'test' }, operationKey: `page:${i}` });
  const ids = [];
  let cursor = null;
  do {
    const page = await game.units.getUserUnits(user.id, { cursor, limit: 2 });
    ids.push(...page.items.map(u => u.id));
    if (page.nextCursor) await assert.rejects(game.units.getUserUnits(other.id, { cursor: page.nextCursor }), { code: 'INVALID_CURSOR' });
    cursor = page.nextCursor;
  } while (cursor);
  assert.deepEqual(ids, ['PAND-000001', 'PAND-000002', 'PAND-000003', 'PAND-000004', 'PAND-000005']);
  const first = await game.characters.listCharacters({ limit: 3 });
  const second = await game.characters.listCharacters({ limit: 3, cursor: first.nextCursor });
  assert.equal(new Set([...first.items, ...second.items].map(c => c.id)).size, 6);
  await assert.rejects(game.characters.listCharacters({ cursor: 'not-json' }), { code: 'INVALID_CURSOR' });
  await assert.rejects(game.characters.listCharacters({ limit: 26 }), { code: 'INVALID_PAGE_SIZE' });
});

test('integrity checks reject unowned units, negative balances and changed emission identity', async t => {
  const { game, storage } = setup(t);
  const user = await register(game);
  const { unit } = await game.starter.claimStarter({ userId: user.id, choice: 'panda' });
  for (const changes of [{ ownerId: 'unknown' }, { serial: 2 }, { initialStats: { ...unit.initialStats, hp: 999 } }]) {
    await assert.rejects(storage.withTransaction(repos => repos.units.replace({ ...unit, ...changes })), { code: 'DATABASE_CORRUPT' });
  }
  await assert.rejects(storage.withTransaction(repos => repos.users.replace({ ...user, economy: { coins: -1 } })), { code: 'DATABASE_CORRUPT' });
  assert.equal((await game.units.getUnit(unit.id)).initialStats.hp, 120);
  assert.equal((await game.validateDatabase()).units, 1);
});
