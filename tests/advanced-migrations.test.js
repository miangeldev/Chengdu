import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { V8_COLLECTIONS as COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { combatProfile, attackCombatProfile } from '../game/battle/combatContent.js';
import { advancedSetup } from './advanced-helpers.js';
import { readRecords, stripBetaContentFixture } from './helpers.js';

const serialize = value => JSON.stringify(value, null, 2) + '\n';

async function v7Fixture(t) {
  const context = await advancedSetup(t);
  await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode: 'classic' });
  let battle = (await context.game.battle.accept({ userId: context.b.id, chatId: context.chatId })).battle;
  while (battle.status === 'active') battle = (await context.game.battle.attack({ userId: battle.turnUserId,
    chatId: context.chatId, choice: '2' })).battle;
  await context.game.economy.claimDaily({ userId: context.b.id, operationKey: 'migration-before-daily' });
  const listing = (await context.game.market.createListing({ sellerId: context.a.id, unitId: context.units[0][0].id,
    price: 20, operationKey: 'migration-before-listing' })).listing;
  await context.game.market.buyListing({ buyerId: context.b.id, listingId: listing.id, operationKey: 'migration-before-sale' });
  await context.game.teams.setTeam({ userId: context.a.id, unitIds: [context.units[0][1].id] });
  await context.game.teams.setTeam({ userId: context.b.id, unitIds: [context.units[1][0].id] });
  await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode: 'classic' });
  await context.game.battle.accept({ userId: context.b.id, chatId: context.chatId });
  await context.game.market.createListing({ sellerId: context.a.id, unitId: context.units[0][2].id,
    price: 35, operationKey: 'migration-open-listing' });
  await context.game.close();
  stripBetaContentFixture(context.directory);
  const state = Object.fromEntries(COLLECTIONS.map(name => [name,
    JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'))]));
  for (const collection of Object.values(state)) collection._meta.schemaVersion = 7;
  for (const character of state.personajes.records) delete character.combat;
  for (const attack of state.ataques.records) delete attack.combat;
  for (const row of state.combates.records) for (const player of row.players) if (player.unit) {
    for (const attack of player.unit.attacks) delete attack.combat;
  }
  validateDatabase(state, 7);
  const raw = Object.fromEntries(COLLECTIONS.map(name => [`${name}.json`, serialize(state[name])]));
  raw['_database.json'] = serialize({ database: 'chengdu-cards', schemaVersion: 7 });
  for (const [file, body] of Object.entries(raw)) fs.writeFileSync(path.join(context.directory, file), body);
  return { ...context, state, raw };
}

function assertPreserved(context) {
  for (const name of COLLECTIONS) {
    let expected = context.state[name].records;
    if (name === 'personajes') expected = expected.map(character => ({ ...character, revision: character.revision + 1,
      combat: combatProfile(character.id) }));
    if (name === 'ataques') expected = expected.map(attack => ({ ...attack, revision: attack.revision + 1,
      combat: attackCombatProfile(attack.id, attack) }));
    assert.deepEqual(readRecords(context.directory, name).slice(0, expected.length), expected, name);
  }
}

test('schema 7 combat migration preserves owners, supply, XP, economy, market and every frozen classic battle', async t => {
  const context = await v7Fixture(t);
  const game = context.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, 9);
  assertPreserved(context);
  for (const name of COLLECTIONS) {
    const metadata = JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'))._meta;
    assert.equal(metadata.schemaVersion, 9);
    assert.equal(metadata.revision, context.state[name]._meta.revision + 2);
  }
  assert.equal(readRecords(context.directory, 'combates').find(battle => battle.status === 'active').rulesVersion, 1);
  const backups = fs.readdirSync(path.join(context.directory, 'backups')).map(id =>
    JSON.parse(fs.readFileSync(path.join(context.directory, 'backups', id, 'snapshot.json'), 'utf8')));
  assert.ok(backups.some(snapshot => Object.entries(context.raw).every(([name, body]) => snapshot.files[name] === body)));
});

for (const stage of ['prepared', 'committed', 'published:personajes.json', 'published:ataques.json', 'published:combates.json', 'published:_database.json']) {
  test(`combat migration recovers all fifteen files at ${stage}`, async t => {
    const context = await v7Fixture(t);
    const failed = context.open({ fault: current => { if (current === stage) throw new Error('interrupted combat migration'); } }).game;
    await assert.rejects(failed.validateDatabase(), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const game = context.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 9);
    assertPreserved(context);
    assert.equal(fs.existsSync(path.join(context.directory, '_journal.json')), false);
  });
}

for (const phase of ['prepared', 'committed']) {
  test(`old schema 7 ${phase} journal recovers before adding combat profiles`, async t => {
    const context = await v7Fixture(t);
    const after = { ...context.raw };
    const packs = JSON.parse(after['sobres.json']);
    packs.records[0].name = 'Sobre Histórico';
    packs.records[0].revision++;
    after['sobres.json'] = serialize(packs);
    const body = { id: randomUUID(), before: context.raw, after };
    const checksum = createHash('sha256').update(JSON.stringify(body)).digest('hex');
    fs.writeFileSync(path.join(context.directory, '_journal.json'), serialize({ version: 1, phase, body, checksum }));
    if (phase === 'committed') fs.writeFileSync(path.join(context.directory, 'sobres.json'), after['sobres.json']);
    const game = context.open().game;
    assert.equal((await game.validateDatabase()).schemaVersion, 9);
    if (phase === 'committed') context.state.sobres = packs;
    assertPreserved(context);
  });
}

test('preexisting valid custom combat profiles are preserved rather than overwritten during migration', async t => {
  const context = await v7Fixture(t);
  context.state.personajes.records[0].combat = { version: 1, element: 'neutral', ability: null };
  context.state.ataques.records[0].combat = { ...attackCombatProfile(context.state.ataques.records[0].id), power: 31 };
  for (const name of ['personajes', 'ataques']) fs.writeFileSync(path.join(context.directory, `${name}.json`), serialize(context.state[name]));
  const game = context.open().game;
  assert.equal((await game.validateDatabase()).schemaVersion, 9);
  for (const name of ['personajes', 'ataques']) {
    assert.deepEqual(readRecords(context.directory, name)[0], context.state[name].records[0]);
  }
});

test('corrupt old ownership history blocks migration without rewriting evidence', async t => {
  const context = await v7Fixture(t);
  const events = structuredClone(context.state.eventos);
  events.records.find(event => event.type === 'unit_transferred').ownershipVersion = 99;
  const evidence = serialize(events);
  fs.writeFileSync(path.join(context.directory, 'eventos.json'), evidence);
  await assert.rejects(context.open().game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  assert.equal(fs.readFileSync(path.join(context.directory, 'eventos.json'), 'utf8'), evidence);
  assert.equal(fs.readFileSync(path.join(context.directory, 'personajes.json'), 'utf8'), context.raw['personajes.json']);
  assert.equal(JSON.parse(fs.readFileSync(path.join(context.directory, '_database.json'), 'utf8')).schemaVersion, 7);
});
