import test from 'node:test';
import assert from 'node:assert/strict';
import { collectionRepository } from '../repositories/collection.js';
import { createRepositories } from '../repositories/index.js';
import { unidadesRepository } from '../repositories/unidadesRepository.js';
import { usuariosRepository } from '../repositories/usuariosRepository.js';
import { COLLECTIONS } from '../storage/validation.js';
import { paginate } from '../utils/pagination.js';
import { readRecords, register, setup } from './helpers.js';

const stateWith = (name, records) => Object.fromEntries(COLLECTIONS.map(collection => [collection, { records: collection === name ? records : [] }]));

function cow(state) {
  const draft = { ...state }, changed = [], forked = new Set();
  const repos = createRepositories(draft, true, {
    beforeWrite(name) {
      if (!forked.has(name)) {
        draft[name] = { ...draft[name], records: draft[name].records.slice() };
        forked.add(name);
      }
      return draft[name].records;
    },
    onWrite(name) { changed.push(name); }
  });
  return { draft, repos, changed, forked };
}

test('primary and secondary indexes survive repository recreation without scanning records again', async () => {
  let idReads = 0, ownerReads = 0;
  const rows = Array.from({ length: 2000 }, (_, position) => ({
    get id() { idReads++; return `unit-${position}`; },
    get ownerId() { ownerReads++; return position === 1999 ? 'target' : 'other'; }
  }));
  const first = unidadesRepository(rows, false);
  assert.equal((await first.get('unit-1999')).id, 'unit-1999');
  assert.equal((await first.getByOwner('target')).length, 1);
  idReads = ownerReads = 0;
  const next = unidadesRepository(rows, false);
  assert.equal((await next.get('unit-1999')).id, 'unit-1999');
  assert.equal((await next.getByOwner('target')).length, 1);
  assert.equal(idReads, 2);
  assert.equal(ownerReads, 2);
});

test('indexed queries preserve insertion order after replacement and update every indexed field', async () => {
  const rows = [
    { id: 'one', ownerId: 'a', status: 'active' },
    { id: 'two', ownerId: 'b', status: 'ended' },
    { id: 'three', ownerId: 'a', status: 'active' }
  ];
  const repository = unidadesRepository(rows, true);
  assert.deepEqual((await repository.getByOwner('a')).map(row => row.id), ['one', 'three']);
  assert.equal((await repository.findBy('status', 'ended')).id, 'two');
  await repository.replace({ id: 'two', ownerId: 'a', status: 'active' });
  assert.deepEqual((await repository.getByOwner('a')).map(row => row.id), ['one', 'two', 'three']);
  assert.equal(await repository.findBy('status', 'ended'), null);
  await repository.replace({ id: 'one', ownerId: 'b', status: 'ended' });
  await repository.insert({ id: 'four', ownerId: 'a', status: 'ended' });
  assert.deepEqual((await repository.getByOwner('a')).map(row => row.id), ['two', 'three', 'four']);
  assert.deepEqual((await repository.filterBy('status', 'ended')).map(row => row.id), ['one', 'four']);
  assert.equal(await repository.count(), 4);
  assert.equal(await repository.countBy('ownerId', 'a'), 3);
  assert.deepEqual((await repository.distinct('ownerId')).sort(), ['a', 'b']);
  assert.equal((await repository.at(-1)).id, 'four');
  assert.equal(await repository.at(99), null);
  assert.equal(await repository.indexOf('three'), 2);
  assert.equal(await repository.indexOf('absent'), -1);
  await assert.rejects(repository.insert({ id: 'four' }), { code: 'DUPLICATE_RECORD' });
  await assert.rejects(repository.replace({ id: 'absent' }), { code: 'RECORD_NOT_FOUND' });
});

test('identity indexes support multiple identities, unambiguous keys and identity replacement', async () => {
  const repository = usuariosRepository([
    { id: 'one', identities: [{ provider: 'a:b', subject: 'c' }, { provider: 'whatsapp', subject: '123' }] },
    { id: 'two', identities: [{ provider: 'a', subject: 'b:c' }] }
  ], true);
  assert.equal((await repository.getByIdentity({ provider: 'a', subject: 'b:c' })).id, 'two');
  assert.equal((await repository.getByIdentity({ provider: 'whatsapp', subject: '123' })).id, 'one');
  await repository.replace({ id: 'one', identities: [{ provider: 'whatsapp', subject: '456' }] });
  assert.equal(await repository.getByIdentity({ provider: 'whatsapp', subject: '123' }), null);
  assert.equal((await repository.getByIdentity({ provider: 'whatsapp', subject: '456' })).id, 'one');
});

test('copy-on-write tracks actual modifications and keeps both snapshots and indexes coherent', async () => {
  const original = stateWith('unidades', [{ id: 'one', ownerId: 'a', nested: { value: 1 } }, { id: 'two', ownerId: 'b' }]);
  const read = createRepositories(original);
  await read.units.getByOwner('a');
  await read.units.get('one');
  const { draft, repos, changed, forked } = cow(original);
  await repos.units.replace(await repos.units.get('one'));
  assert.equal(forked.size, 0);
  assert.deepEqual(changed, []);
  await repos.units.replace({ id: 'one', ownerId: 'b', nested: { value: 2 } });
  await repos.units.insert({ id: 'three', ownerId: 'b' });
  assert.deepEqual(changed, ['unidades', 'unidades']);
  assert.equal(forked.size, 1);
  assert.notEqual(draft.unidades.records, original.unidades.records);
  assert.equal(draft.unidades.records[1], original.unidades.records[1]);
  assert.deepEqual((await repos.units.getByOwner('b')).map(row => row.id), ['one', 'two', 'three']);
  assert.equal((await read.units.getByOwner('a'))[0].nested.value, 1);
  assert.equal(await read.units.get('three'), null);
  assert.equal((await read.units.get('one')).ownerId, 'a');
  assert.equal(await repos.units.count(), 3);
  const after = createRepositories(draft);
  assert.equal((await after.units.get('one')).nested.value, 2);
});

test('read predicates and returned records cannot mutate the cached snapshot', async () => {
  const rows = [{ id: 'one', nested: { tags: ['safe'] } }];
  const repository = collectionRepository(rows, false);
  await assert.rejects(repository.find(row => { row.nested.tags.push('bad'); return true; }), TypeError);
  await assert.rejects(repository.filter(row => { row.id = 'changed'; return true; }), TypeError);
  const found = await repository.find(row => row.nested.tags[0] === 'safe');
  found.nested.tags.push('detached');
  const filtered = await repository.filterBy('id', 'one');
  filtered[0].nested.tags.push('detached again');
  assert.deepEqual((await repository.get('one')).nested.tags, ['safe']);
  await assert.rejects(repository.replace(found), { code: 'READ_ONLY_TRANSACTION' });
});

test('failed cloning does not fork or mark a transaction as changed', async () => {
  const original = stateWith('usuarios', [{ id: 'one', identities: [] }]);
  const { repos, forked, changed } = cow(original);
  await assert.rejects(repos.users.insert({ id: 'two', invalid: () => {} }), { name: 'DataCloneError' });
  await assert.rejects(repos.users.replace({ id: 'one', identities: [], invalid: () => {} }), { name: 'DataCloneError' });
  assert.equal(forked.size, 0);
  assert.deepEqual(changed, []);
  assert.equal(await repos.users.count(), 1);
});

test('indexed pagination and latest queries clone only the requested rows', async () => {
  let payloadReads = 0;
  const rows = Array.from({ length: 1000 }, (_, position) => ({
    id: `row-${String(position).padStart(4, '0')}`, userId: 'one', createdAt: '2026-01-01T00:00:00.000Z',
    get payload() { payloadReads++; return { large: 'value' }; }
  }));
  const repository = collectionRepository(rows, false);
  const page = await repository.pageBy('userId', 'one', { page: 2, limit: 2 }, 'test');
  assert.equal(page.totalItems, 1000);
  assert.deepEqual(page.items.map(row => row.id), ['row-0002', 'row-0003']);
  assert.equal(payloadReads, 2);
  assert.equal((await repository.lastBy('userId', 'one')).id, 'row-0999');
  assert.equal(payloadReads, 3);
});

test('indexed pages retain legacy cursor keys and merge multiple status indexes in append order', async () => {
  const rows = [
    { id: 'one', userId: 'a', status: 'pending' },
    { id: 'two', userId: 'b', status: 'active' },
    { id: 'three', userId: 'a', status: 'finished' },
    { id: 'four', userId: 'a', status: 'active' }
  ];
  const repository = collectionRepository(rows, false);
  const selected = rows.filter(row => row.userId === 'a');
  const key = (row, ordinal) => [String(Number.MAX_SAFE_INTEGER - ordinal).padStart(16, '0'), row.id];
  const keys = new Map(selected.map((row, ordinal) => [row.id, key(row, ordinal)]));
  const expected = paginate(selected, { limit: 1 }, 'ledger', row => keys.get(row.id));
  const actual = await repository.pageBy('userId', 'a', { limit: 1 }, 'ledger', key);
  assert.deepEqual(actual, expected);
  assert.deepEqual(await repository.pageBy('userId', 'a', { limit: 1, cursor: actual.nextCursor }, 'ledger', key),
    paginate(selected, { limit: 1, cursor: expected.nextCursor }, 'ledger', row => keys.get(row.id)));
  assert.deepEqual((await repository.filterIn('status', ['active', 'pending', 'active'])).map(row => row.id), ['one', 'two', 'four']);
  assert.deepEqual((await repository.filterBy('status', 'active', row => row.userId === 'a')).map(row => row.id), ['four']);
  await assert.rejects(repository.pageBy('userId', 'a', {}, 'test', row => { row.id = 'bad'; return ['bad', 'bad']; }), TypeError);
});

test('encounters index boss templates independently from spawn histories', async () => {
  const state = stateWith('encuentros', [
    { id: 'boss-one', kind: 'boss', snapshot: { id: 'mist' } },
    { id: 'spawn', kind: 'spawn', chatId: 'group', snapshot: { characterId: 'panda' } },
    { id: 'boss-two', kind: 'boss', snapshot: { id: 'mist' } }
  ]);
  const repos = createRepositories(state);
  assert.equal((await repos.encounters.lastBy('bossId', 'mist')).id, 'boss-two');
  assert.equal(await repos.encounters.lastBy('bossId', 'panda'), null);
});

test('rejected mutations of frozen arrays cannot corrupt existing indexes', async () => {
  const rows = Object.freeze([{ id: 'one', ownerId: 'a' }]);
  const repository = unidadesRepository(rows, true);
  await repository.getByOwner('a');
  await repository.getByOwner('b');
  await assert.rejects(repository.insert({ id: 'two', ownerId: 'b' }), TypeError);
  assert.equal(await repository.get('two'), null);
  await assert.rejects(repository.replace({ id: 'one', ownerId: 'b' }), TypeError);
  assert.equal((await repository.get('one')).ownerId, 'a');
  assert.deepEqual((await repository.getByOwner('a')).map(row => row.id), ['one']);
  assert.deepEqual(await repository.getByOwner('b'), []);
});

test('derived battle and market operation indexes follow nested replacements', async () => {
  const state = stateWith('combates', [{ id: 'battle', players: [{ userId: 'one' }], challengeKey: 'challenge', acceptKey: null, actions: [] }]);
  state.mercado.records.push({ id: 'listing', operationKey: 'create-listing', closeOperationKey: null });
  const repos = createRepositories(state, true);
  assert.equal((await repos.battles.findBy('anyOperationKey', 'challenge')).id, 'battle');
  assert.equal(await repos.battles.findBy('actionOperationKey', 'move'), null);
  assert.equal((await repos.battles.findBy('participantId', 'one')).id, 'battle');
  await repos.battles.replace({ id: 'battle', players: [{ userId: 'two' }], challengeKey: 'challenge', acceptKey: 'accept', actions: [{ operationKey: 'move' }] });
  assert.equal(await repos.battles.findBy('participantId', 'one'), null);
  assert.equal((await repos.battles.findBy('participantId', 'two')).id, 'battle');
  assert.equal((await repos.battles.findBy('actionOperationKey', 'move')).id, 'battle');
  assert.equal((await repos.battles.findBy('anyOperationKey', 'accept')).id, 'battle');
  assert.equal((await repos.listings.findBy('anyOperationKey', 'create-listing')).id, 'listing');
  await repos.listings.replace({ id: 'listing', operationKey: 'create-listing', closeOperationKey: 'close-listing' });
  assert.equal((await repos.listings.findBy('anyOperationKey', 'close-listing')).id, 'listing');
});

test('writes normalize mutable built-ins to their persisted JSON representation', async () => {
  const rows = [];
  const repository = collectionRepository(rows, true);
  const date = new Date('2026-10-16T12:00:00.000Z');
  const value = { id: 'one', extraDate: date, extraMap: new Map([['value', 1]]), extraSet: new Set([1]), optional: undefined };
  assert.deepEqual(await repository.insert(value), { id: 'one', extraDate: date.toISOString(), extraMap: {}, extraSet: {} });
  date.setTime(0);
  assert.equal((await repository.get('one')).extraDate, '2026-10-16T12:00:00.000Z');
  let writes = 0;
  const repeated = collectionRepository(rows, true, { onWrite: () => writes++ });
  await repeated.replace({ ...value, extraDate: new Date('2026-10-16T12:00:00.000Z') });
  assert.equal(writes, 0);
  await assert.rejects(repeated.find(row => { row.extraDate.setTime(0); return true; }), TypeError);
  await assert.rejects(repeated.filter(row => { row.extraMap.set('changed', true); return true; }), TypeError);
  await assert.rejects(repeated.find(row => { row.extraSet.add(2); return true; }), TypeError);
  assert.deepEqual(await repeated.get('one'), JSON.parse(JSON.stringify(rows[0])));
});

test('committed extra Date/Map/Set fields cannot mutate the shared snapshot through read predicates', async t => {
  const { game, storage, directory } = setup(t);
  const user = await register(game);
  await storage.withTransaction(repos => repos.users.replace({ ...user,
    extraDate: new Date('2026-10-16T12:00:00.000Z'), extraMap: new Map([['value', 1]]), extraSet: new Set([1]) }));
  const persisted = readRecords(directory, 'usuarios')[0];
  assert.deepEqual(await game.users.getUser(user.id), persisted);
  await assert.rejects(storage.withRead(repos => repos.users.find(row => { row.extraDate.setTime(0); return true; })), TypeError);
  await assert.rejects(storage.withRead(repos => repos.users.find(row => { row.extraMap.set('changed', true); return true; })), TypeError);
  await assert.rejects(storage.withRead(repos => repos.users.find(row => { row.extraSet.add(2); return true; })), TypeError);
  assert.deepEqual(await game.users.getUser(user.id), persisted);
  assert.deepEqual(readRecords(directory, 'usuarios')[0], persisted);
});
