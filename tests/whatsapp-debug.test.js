import test from 'node:test';
import assert from 'node:assert/strict';
import { defineCommand } from '../interfaces/whatsapp/command.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { GameError } from '../utils/GameError.js';

const msg = { key: { remoteJid: '521999999999@s.whatsapp.net' } };

function preserveDebugEnvironment(t) {
  const original = process.env.CTU_DEBUG;
  t.after(() => {
    if (original === undefined) delete process.env.CTU_DEBUG;
    else process.env.CTU_DEBUG = original;
  });
}

test('development config enables WhatsApp diagnostics for the direct run export', async t => {
  preserveDebugEnvironment(t);
  delete process.env.CTU_DEBUG;
  const log = t.mock.method(console, 'error', () => {});
  const error = new TypeError('missing handler');
  const command = defineCommand('ctuprueba', async () => { throw error; });
  let reply;
  await command.run({ sendMessage: async (_, payload) => { reply = payload.text; } }, msg);
  assert.match(reply, /Debug activado/);
  assert.match(reply, /UNEXPECTED_ERROR \| comando=\.ctuprueba \| Node=v/);
  assert.match(reply, /TypeError: missing handler/);
  assert.match(reply, /whatsapp-debug\.test\.js/);
  assert.match(reply, /```\n[\s\S]+\n```/);
  assert.equal(log.mock.callCount(), 1);
});

test('router debug exposes nested causes and a single-argument logger retains the entire diagnostic', async () => {
  const cause = Object.assign(new Error('cannot read collection'), { code: 'EACCES' });
  const error = new GameError('STORAGE_READ_FAILED', { file: '/tmp/example.json' }, { cause });
  const game = { characters: { listCharacters: async () => { throw error; } } };
  const logs = [];
  const route = createCommandRouter({ game, prefix: '!', debug: true, logger: message => logs.push(message) });
  let reply;
  await route({ sendMessage: async (_, payload) => { reply = payload.text; } }, msg, '!ctucatalogo');
  for (const text of [reply, logs[0]]) {
    assert.match(text, /STORAGE_READ_FAILED \| comando=!ctucatalogo \| Node=v/);
    assert.match(text, /GameError: STORAGE_READ_FAILED/);
    assert.match(text, /Error: cannot read collection/);
    assert.match(text, /EACCES/);
    assert.match(text, /example\.json/);
  }
});

test('environment switches debug and explicit options take precedence', async t => {
  preserveDebugEnvironment(t);
  const command = defineCommand('ctuprueba', async () => { throw new Error('diagnostic detail'); });
  const cases = [
    { env: '0', debug: undefined, enabled: false },
    { env: 'false', debug: undefined, enabled: false },
    { env: '1', debug: undefined, enabled: true },
    { env: ' TRUE ', debug: undefined, enabled: true },
    { env: '1', debug: false, enabled: false },
    { env: '0', debug: true, enabled: true }
  ];
  for (const { env, debug, enabled } of cases) {
    process.env.CTU_DEBUG = env;
    let reply;
    await command.createRun({}, { debug, logger: () => {} })({ sendMessage: async (_, payload) => { reply = payload.text; } }, msg);
    assert.equal(reply.includes('Debug activado'), enabled);
    assert.equal(reply.includes('diagnostic detail'), enabled);
  }
});

test('long WhatsApp diagnostics are bounded while the logger keeps the full exception', async () => {
  const error = new Error('detail ``` ' + 'x'.repeat(10000));
  const command = defineCommand('ctuprueba', async () => { throw error; });
  let reply;
  let log;
  await command.createRun({}, { debug: true, logger: message => { log = message; } })({ sendMessage: async (_, payload) => { reply = payload.text; } }, msg);
  assert.ok(reply.length < 7000);
  assert.match(reply, /Diagnóstico recortado/);
  assert.equal(reply.match(/```/g).length, 2);
  assert.match(reply, /detail ` ` `/);
  assert.ok(log.includes('x'.repeat(10000)));
  assert.ok(!log.includes('Diagnóstico recortado'));
});
