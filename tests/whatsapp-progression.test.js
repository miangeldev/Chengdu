import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { setup } from './helpers.js';

test('WhatsApp rewards, level-ups, wallet and history use one reply with details on demand and custom prefix', async t => {
  const { game } = setup(t, { randomRoll: () => 0 });
  const route = createCommandRouter({ game, prefix: '!', debug: false });
  const replies = [];
  const sock = { sendMessage: async (_, payload) => replies.push(payload.text) };
  const a = '521999999999@s.whatsapp.net';
  const b = '521111111111@s.whatsapp.net';
  const group = '120363111@g.us';
  let seq = 0;
  async function send(actor, command, { privateChat = false, messageId = null } = {}) {
    const count = replies.length;
    const msg = { key: { remoteJid: privateChat ? actor : group, participant: actor, id: messageId ?? `msg-${++seq}` } };
    assert.equal(await route(sock, msg, command), true);
    assert.equal(replies.length, count + 1);
    assert.doesNotMatch(replies.at(-1), /No pude confirmar|@s.whatsapp.net|\.ctu/);
    assert.match(replies.at(-1), /━━━━━━━━━━━━━━/);
    return replies.at(-1);
  }
  await send(a, '!cturegistro Miguel');
  await send(b, '!cturegistro Lukas');
  await send(a, '!ctustarter panda');
  await send(b, '!ctustarter lobo');
  await send(a, '!ctuequipo usar PAND-000001');
  await send(b, '!ctuequipo usar LOBO-000001');
  assert.match(await send(a, '!ctuhistorial'), /Aún no tienes/);
  const user = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: a });
  const rival = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: b });
  let battle;
  for (let i = 0; i < 3; i++) {
    await game.battle.challenge({ userId: user.id, opponentId: rival.id, chatId: group });
    battle = (await game.battle.accept({ userId: rival.id, chatId: group })).battle;
    while (battle.status === 'active') {
      await send(battle.turnUserId === user.id ? a : b, '!ctuatacar 2', { messageId: `fight-${i}-T${battle.turnNumber}` });
      battle = await game.battle.getMyBattle({ userId: user.id, chatId: group });
    }
  }
  const final = replies.at(-1);
  assert.match(final, /VICTORIA/);
  assert.match(final, /Miguel: \+120 ChengCoins · \+35 XP/);
  assert.match(final, /Lukas: \+15 XP/);
  assert.match(final, /Miguel subió al nivel 2/);
  assert.match(final, /Panda Guerrero subió al nivel 2/);
  assert.doesNotMatch(final, /BTL-|USR-|PAND-|LOBO-/);
  assert.ok(final.length < 900);
  const replay = await send(a, '!ctuatacar 2', { messageId: 'fight-2-T4' });
  assert.match(replay, /ya se había registrado/);
  assert.equal((await game.economy.getBalance(user.id)).coins, 360);
  const wallet = await send(a, '!ctubalance', { privateChat: true });
  assert.match(wallet, /\*360 ChengCoins\*/);
  assert.match(wallet, /3 combates.*24 h/);
  const profile = await send(a, '!ctuperfil');
  assert.match(profile, /Nivel 2 · ✨ 5\/200 XP/);
  const list = await send(a, '!ctuhistorial', { privateChat: true });
  assert.match(list, /🏆 Victoria vs \*Lukas\*/);
  assert.match(list, /!ctuhistorial BTL-/);
  assert.doesNotMatch(list, /Garra Sombría|Precisión:|Defensa:/);
  const detail = await send(a, `!ctuhistorial ${battle.id}`, { privateChat: true });
  assert.match(detail, /CHENGDÚ CARDS \| PARTIDA/);
  assert.match(detail, /T1 · Lukas: Colmillo Nocturno/);
  assert.match(detail, /🎁 \*RECOMPENSAS\*/);
  assert.match(detail, /subió al nivel 2/);
  const ficha = await send(a, '!ctuficha PAND-000001');
  assert.match(ficha, /Nivel 2/);
  assert.match(ficha, /122\/122 HP/);
  assert.match(await send(a, '!ctubalance extra'), /argumentos no son válidos/);
});
