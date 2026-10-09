import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { register, setup } from './helpers.js';

test('WhatsApp team → mentioned challenge → accept → fight completes with formatted messages', async t => {
  const { game } = setup(t, { randomRoll: () => 0 });
  const replies = [];
  const sock = { sendMessage: async (chatId, payload) => replies.push({ chatId, text: payload.text }) };
  const group = '120363111@g.us';
  let id = 0;
  const send = (actor, body, mentions = [], messageId = null) => route(sock, {
    key: { remoteJid: group, participant: actor, id: messageId ?? `message-${++id}` },
    message: { extendedTextMessage: { contextInfo: { mentionedJid: mentions } } }
  }, body);
  const route = createCommandRouter({ game });
  const a = '521999999999@s.whatsapp.net';
  const b = '521111111111@s.whatsapp.net';
  await send(a, '.ctuayuda');
  assert.match(replies.at(-1).text, /ctupelea @jugador/);
  await send(a, '.cturegistro Miguel');
  await send(b, '.cturegistro Juan');
  await send(a, '.ctustarter panda');
  await send(b, '.ctustarter lobo');
  await send(a, '.ctuequipo usar PAND-000001');
  await send(b, '.ctuequipo usar LOBO-000001');
  await send(a, '.ctupelea @Juan', [b]);
  assert.match(replies.at(-1).text, /Desafío 1 contra 1/);
  await send(b, '.ctuaceptar');
  assert.match(replies.at(-1).text, /Turno 1: Juan/);
  const userA = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: a });
  let battle = await game.battle.getMyBattle({ userId: userA.id, chatId: group });
  while (battle.status === 'active') {
    const actor = battle.turnUserId === userA.id ? a : b;
    await send(actor, '.ctuatacar 2');
    battle = await game.battle.getMyBattle({ userId: userA.id, chatId: group });
  }
  assert.match(replies.at(-1).text, /gana/);
  assert.ok(replies.every(r => r.chatId === group && r.text.includes('========================') && r.text.includes('\n\n') && !r.text.includes('@s.whatsapp.net')));
  assert.equal((await game.users.getUser(userA.id)).battleStats.matches, 1);
});

test('private fights and unverified text targets are refused; repeated transport IDs cannot deal double damage', async t => {
  const { game } = setup(t, { randomRoll: () => 0 });
  const a = await register(game);
  const b = await register(game, 'Juan', '521111111111');
  const ua = (await game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const replies = [];
  const sock = { sendMessage: async (from, payload) => replies.push(payload.text) };
  const route = createCommandRouter({ game });
  await route(sock, { key: { remoteJid: '521999999999@s.whatsapp.net' } }, '.ctupelea @Juan');
  assert.match(replies.at(-1), /grupo/);
  const group = '120363111@g.us';
  await route(sock, { key: { remoteJid: group, participant: '521999999999@s.whatsapp.net' } }, '.ctupelea 521111111111@s.whatsapp.net');
  assert.match(replies.at(-1), /Menciona/);
  await game.battle.challenge({ userId: a.id, opponentId: b.id, chatId: group });
  await game.battle.accept({ userId: b.id, chatId: group });
  const msg = { key: { remoteJid: group, participant: '521111111111@s.whatsapp.net', id: 'same-attack-message' } };
  await Promise.all([route(sock, msg, '.ctuatacar 1'), route(sock, msg, '.ctuatacar 1')]);
  assert.equal((await game.battle.getMyBattle({ userId: a.id, chatId: group })).actions.length, 1);
  assert.match(replies.at(-1), /ya se había registrado/);
});

test('help, error instructions and pagination keep the configured prefix', async t => {
  const { game } = setup(t);
  const replies = [];
  const sock = { sendMessage: async (from, payload) => replies.push(payload.text) };
  const route = createCommandRouter({ game, prefix: '!' });
  const msg = { key: { remoteJid: '521999999999@s.whatsapp.net' } };
  await route(sock, msg, '!ctuayuda');
  assert.match(replies.at(-1), /!ctuequipo usar ID/);
  assert.ok(!replies.at(-1).includes('.ctu'));
  await route(sock, msg, '!ctuperfil');
  assert.match(replies.at(-1), /!cturegistro/);
  await route(sock, msg, '!cturegistro Miguel');
  await route(sock, msg, '!ctustarter panda');
  for (let i = 0; i < 10; i++) {
    const user = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: '521999999999@s.whatsapp.net' });
    await game.units.createUnit({ ownerId: user.id, characterId: 'panda_guerrero', origin: { type: 'admin', sourceId: 'test' }, operationKey: `page:${i}` });
  }
  await route(sock, msg, '!ctupersonajes');
  assert.match(replies.at(-1), /!ctupersonajes [A-Za-z0-9_-]+/);
  assert.ok(!replies.at(-1).includes('.ctu'));
});
