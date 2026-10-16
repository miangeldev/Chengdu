import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { identity, readRecords, register, setup } from './helpers.js';

const chatId = 'active-spawns@g.us';

function countStorage(storage) {
  const counts = { reads: 0, transactions: 0 };
  for (const [method, counter] of [['withRead', 'reads'], ['withTransaction', 'transactions']]) {
    const original = storage[method].bind(storage);
    storage[method] = work => { counts[counter]++; return original(work); };
  }
  return counts;
}

test('automatic spawns ignore unused groups and perform zero storage work for later ordinary messages', async t => {
  const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z', randomDropInt: () => 0 });
  await register(c.game);
  const counts = countStorage(c.storage);
  const result = await c.game.encounters.observeGroupActivity({ identity: identity(), chatId, messageId: 'first' });
  assert.equal(result.spawned, false);
  assert.deepEqual(counts, { reads: 1, transactions: 0 });
  await Promise.all(Array.from({ length: 100 }, (_, i) => c.game.encounters.observeGroupActivity({
    identity: identity(), chatId: `unused-${i}@g.us`, messageId: `unused:${i}`
  })));
  assert.deepEqual(counts, { reads: 1, transactions: 0 });
  assert.equal(readRecords(c.directory, 'accionescontenido').length, 0);
});

test('one group command enables spawns; a concurrent message burst checks and announces exactly once', async t => {
  const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z', randomDropInt: () => 0 });
  await register(c.game);
  const counts = countStorage(c.storage);
  const replies = [];
  const sock = { sendMessage: async (chat, payload) => replies.push(payload.text) };
  const route = createCommandRouter({ game: c.game });
  const msg = id => ({ key: { remoteJid: chatId, participant: identity().subject, id } });
  await route(sock, msg('help'), '.ctuayuda');
  replies.length = 0;
  assert.deepEqual(counts, { reads: 0, transactions: 0 });
  await Promise.all(Array.from({ length: 100 }, (_, i) => route(sock, msg(`burst:${i}`), 'Hola')));
  assert.equal(replies.length, 1);
  assert.match(replies[0], /APARECIÓ UN PERSONAJE/);
  assert.deepEqual(counts, { reads: 2, transactions: 1 });
  for (let i = 0; i < 100; i++) await route(sock, msg(`later:${i}`), 'Mensaje normal');
  assert.deepEqual(counts, { reads: 2, transactions: 1 });
  assert.equal(readRecords(c.directory, 'accionescontenido').length, 1);
});

test('spawn window hints survive restart and explicit exploration uses reads inside a closed window', async t => {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now, randomDropInt: () => 0 });
  const user = await register(c.game);
  await c.game.encounters.observeActivity({ userId: user.id, chatId, messageId: 'original' });
  await c.game.close();
  const reopened = c.open();
  const counts = countStorage(reopened.storage);
  now = '2026-10-11T20:10:00.000Z';
  assert.equal((await reopened.game.encounters.observeGroupActivity({ identity: identity(), chatId, messageId: 'after-restart' })).spawned, false);
  assert.deepEqual(counts, { reads: 1, transactions: 0 });
  const replay = await reopened.game.encounters.observeActivity({ userId: user.id, chatId, messageId: 'original' });
  assert.equal(replay.alreadyChecked, true);
  assert.ok(replay.spawn);
  assert.equal((await reopened.game.encounters.observeActivity({ userId: user.id, chatId, messageId: 'explicit' })).spawned, false);
  assert.deepEqual(counts, { reads: 3, transactions: 0 });
  now = '2026-10-11T21:00:00.000Z';
  assert.equal((await reopened.game.encounters.observeGroupActivity({ identity: identity(), chatId, messageId: 'next-opportunity' })).spawned, true);
  assert.deepEqual(counts, { reads: 4, transactions: 1 });
});

test('unregistered senders are cached briefly without consuming a group opportunity', async t => {
  const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z', randomDropInt: () => 0 });
  await register(c.game);
  c.game.encounters.activateGroup({ chatId });
  const counts = countStorage(c.storage);
  for (let i = 0; i < 50; i++) await c.game.encounters.observeGroupActivity({ identity: identity('521333333333'), chatId, messageId: `guest:${i}` });
  assert.deepEqual(counts, { reads: 2, transactions: 0 });
  assert.equal(readRecords(c.directory, 'accionescontenido').length, 0);
  assert.equal((await c.game.encounters.observeGroupActivity({ identity: identity(), chatId, messageId: 'registered' })).spawned, true);
  assert.equal(counts.transactions, 1);
});

test('viewing a live or absent spawn only reads; expiration is persisted once when needed', async t => {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const spawn = await c.game.encounters.createSpawn({ chatId, characterId: 'panda_guerrero' });
  const counts = countStorage(c.storage);
  assert.equal((await c.game.encounters.getSpawn({ chatId })).id, spawn.id);
  assert.equal(await c.game.encounters.getSpawn({ chatId: 'empty@g.us' }), null);
  assert.deepEqual(counts, { reads: 2, transactions: 0 });
  now = spawn.expiresAt;
  assert.equal(await c.game.encounters.getSpawn({ chatId }), null);
  assert.equal(readRecords(c.directory, 'encuentros')[0].status, 'expired');
  assert.deepEqual(counts, { reads: 3, transactions: 1 });
  assert.equal(await c.game.encounters.getSpawn({ chatId }), null);
  assert.deepEqual(counts, { reads: 4, transactions: 1 });
});
