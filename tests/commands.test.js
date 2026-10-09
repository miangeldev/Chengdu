import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter, commands } from '../interfaces/whatsapp/index.js';
import { register, setup } from './helpers.js';
import { defineCommand } from '../interfaces/whatsapp/command.js';
import { GameError } from '../utils/GameError.js';

test('unexpected command failures retain the error and command in the server log only', async () => {
  const error = new TypeError('cmd is not a function');
  const logs = [];
  const replies = [];
  const command = defineCommand('ctuprueba', async () => { throw error; });
  const run = command.createRun({}, { prefix: '!', logger: (...args) => logs.push(args) });
  await run({ sendMessage: async (_, payload) => replies.push(payload.text) }, { key: { remoteJid: '521999999999@s.whatsapp.net' } });
  assert.equal(logs.length, 1);
  assert.equal(logs[0][0], 'UNEXPECTED_ERROR');
  assert.equal(logs[0][1].command, '!ctuprueba');
  assert.equal(logs[0][1].runtime, process.version);
  assert.equal(logs[0][1].error, error);
  assert.match(logs[0][1].error.stack, /TypeError: cmd is not a function/);
  assert.match(replies[0], /No pude confirmar/);
  assert.doesNotMatch(replies[0], /TypeError|cmd is not a function|commands\.test\.js/);
});

test('the default server logger includes the original stack and nested storage cause', async t => {
  const cause = Object.assign(new Error('permission denied'), { code: 'EACCES' });
  const error = new GameError('STORAGE_WRITE_FAILED', {}, { cause });
  const log = t.mock.method(console, 'error', () => {});
  const command = defineCommand('ctuprueba', async () => { throw error; });
  let reply;
  await command.createRun({})({ sendMessage: async (_, payload) => { reply = payload.text; } }, { key: { remoteJid: '521999999999@s.whatsapp.net' } });
  assert.equal(log.mock.callCount(), 1);
  const [summary, original] = log.mock.calls[0].arguments;
  assert.match(summary, /Chengdú: STORAGE_WRITE_FAILED \| comando=\.ctuprueba \| Node=v/);
  assert.equal(original, error);
  assert.equal(original.cause, cause);
  assert.doesNotMatch(reply, /EACCES|permission denied/);
});

test('a non-Error rejection still logs and sends the generic failure reply', async () => {
  const logs = [];
  const command = defineCommand('ctuprueba', async () => { throw null; });
  let reply;
  await command.createRun({}, { logger: (...args) => logs.push(args) })({ sendMessage: async (_, payload) => { reply = payload.text; } }, { key: { remoteJid: '521999999999@s.whatsapp.net' } });
  assert.equal(logs[0][0], 'UNEXPECTED_ERROR');
  assert.equal(logs[0][1].error, null);
  assert.match(reply, /No pude confirmar/);
});

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
