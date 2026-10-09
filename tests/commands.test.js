import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter, commands } from '../interfaces/whatsapp/index.js';
import { register, setup } from './helpers.js';

test('the WhatsApp commands complete the MVP flow with a simulated socket', async t => {
  const { game } = setup(t);
  const replies = [];
  const sock = { sendMessage: async (from, payload) => { replies.push({ from, ...payload }); } };
  const msg = { key: { remoteJid: '120363111@g.us', participant: '521999999999@s.whatsapp.net' } };
  const route = createCommandRouter({ game });
  assert.equal(commands.length, 15);
  for (const body of ['.cturegistro Miguel', '.ctuperfil', '.ctucatalogo', '.ctustarter', '.ctustarter 1', '.ctupersonajes', '.ctuunidad PAND-000001']) {
    assert.equal(await route(sock, msg, body), true);
  }
  assert.equal(replies.length, 7);
  assert.ok(replies.every(r => r.from === msg.key.remoteJid));
  assert.ok(replies.every(r => !r.text.includes('@s.whatsapp.net')));
  assert.match(replies[0].text, /Registro completado/);
  assert.match(replies[4].text, /PAND-000001/);
  assert.match(replies[6].text, /Propietario: Miguel/);
  await route(sock, msg, '.ctustarter lobo');
  assert.match(replies.at(-1).text, /Ya reclamaste/);
  assert.equal((await game.validateDatabase()).units, 1);
  assert.equal(await route(sock, msg, '.other'), false);
  assert.equal(await route(sock, msg, 'hello'), false);
});

test('group metadata, device JIDs, self messages and invalid requests use the correct identity', async t => {
  const { game } = setup(t);
  const replies = [];
  const sock = { user: { id: '521222222222:4@s.whatsapp.net' }, sendMessage: async (from, payload) => replies.push(payload.text) };
  const route = createCommandRouter({ game });
  await route(sock, { key: { remoteJid: '120363111@g.us' } }, '.cturegistro No participant');
  assert.match(replies.at(-1), /identificar/);
  await route(sock, { key: { remoteJid: '521333333333@s.whatsapp.net', fromMe: true } }, '.cturegistro Bot');
  assert.equal((await game.users.getUserByIdentity({ provider: 'whatsapp', subject: '521222222222@s.whatsapp.net' })).name, 'Bot');
  const msg = { key: { remoteJid: '521999999999@s.whatsapp.net' } };
  await route(sock, msg, '.ctuperfil');
  assert.match(replies.at(-1), /Primero regístrate/);
  await route(sock, msg, '.cturegistro');
  assert.match(replies.at(-1), /1 a 40/);
  await route(sock, msg, '.cturegistro Miguel');
  await route(sock, msg, '.cturegistro Otro');
  assert.match(replies.at(-1), /Ya estás registrado como Miguel/);
  await route(sock, msg, '.ctustarter dragon');
  assert.match(replies.at(-1), /Elige panda/);
  await route(sock, msg, '.ctuunidad unknown');
  assert.match(replies.at(-1), /no existe/);
});

test('transport failure does not repeat a mutation or send automatically', async t => {
  const { game } = setup(t);
  const user = await register(game);
  const route = createCommandRouter({ game });
  let sends = 0;
  const sock = { sendMessage: async () => { sends++; throw new Error('offline'); } };
  const msg = { key: { remoteJid: '521999999999@s.whatsapp.net' } };
  await assert.rejects(route(sock, msg, '.ctustarter panda'), /offline/);
  assert.equal(sends, 1);
  assert.equal((await game.users.getProfile(user.id)).starterClaim.unitId, 'PAND-000001');
  await assert.rejects(route(sock, msg, '.ctustarter panda'), /offline/);
  assert.equal((await game.validateDatabase()).units, 1);
});
