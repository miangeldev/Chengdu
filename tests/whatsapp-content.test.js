import test from 'node:test';
import assert from 'node:assert/strict';
import { commands, createCommandRouter } from '../interfaces/whatsapp/index.js';
import { readRecords, register, setup } from './helpers.js';

const alice = '521999999999@s.whatsapp.net', bob = '521111111111@s.whatsapp.net', group = 'beta-ui@g.us';
async function fixture(t) {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now, randomRoll: () => 0, randomDropInt: () => 0 });
  const a = await register(c.game), b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const replies = [], errors = [];
  const sock = { sendMessage: async (chatId, payload) => replies.push({ chatId, text: payload.text }) };
  const route = createCommandRouter({ game: c.game, prefix: '!', debug: false, logger: (...error) => errors.push(error) });
  let sequence = 0;
  async function send(body, { actor = alice, chatId = group, id = `content-ui:${++sequence}`, fromMe = false } = {}) {
    const msg = { key: { remoteJid: chatId, participant: actor, fromMe, id } };
    const count = replies.length;
    assert.equal(await route(sock, msg, body), true);
    assert.equal(replies.length, count + 1);
    const text = replies.at(-1).text;
    assert.match(text, /🃏 \*CHENGDÚ CARDS \|/);
    assert.doesNotMatch(text, /No pude confirmar|Debug activado|\.ctu|USR-|ACT-|ENC-|CR-|@s.whatsapp.net|[a-f0-9]{8}-[a-f0-9]{4}-/);
    assert.equal(errors.length, 0);
    return text;
  }
  return { ...c, a, b, ua, ub, route, sock, replies, send, advance: ms => { now = new Date(Date.parse(now) + ms).toISOString(); }, setTime: value => { now = value; } };
}
async function fights(c, count = 2) {
  for (let index = 0; index < count; index++) {
    await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: group, mode: 'classic' });
    let battle = (await c.game.battle.accept({ userId: c.b.id, chatId: group })).battle;
    while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: group, choice: '2' })).battle;
  }
}

test('all content commands are registered; public calendars and private/group restrictions show useful next steps', async t => {
  const c = await fixture(t);
  for (const name of ['ctumisiones', 'ctulogros', 'ctuinventario', 'ctuboss', 'ctubossatacar', 'ctubosstop', 'ctuspawn', 'ctucapturar', 'ctuexplorar', 'ctueventos', 'ctuevento']) assert.ok(commands.some(plugin => plugin.command === name));
  const visitor = { actor: '521333333333@s.whatsapp.net' };
  assert.match(await c.send('!ctueventos', visitor), /Festival de los Faroles/);
  assert.match(await c.send('!ctuevento faroles', visitor), /Zorro de los Faroles.*\n.*35/);
  assert.match(await c.send('!ctuevento faroles reclamar', visitor), /!cturegistro/);
  assert.match(await c.send('!ctumisiones', visitor), /!cturegistro/);
  assert.match(await c.send('!ctucapturar', { chatId: alice }), /grupo de WhatsApp/);
  assert.match(await c.send('!ctubossatacar 1', { chatId: alice }), /grupo de WhatsApp/);
  assert.match(await c.send('!ctuevento desconocido'), /evento no existe/);
  assert.match(await c.send('!ctuayuda'), /!ctumisiones.*\n.*!ctumisiones reclamar 1/);
});

test('mission, achievement and inventory interfaces provide short claim commands and preserve receipt retries', async t => {
  const c = await fixture(t);
  assert.match(await c.send('!ctumisiones'), /0\/2.*En progreso/);
  assert.match(await c.send('!ctumisiones reclamar 1'), /falta completar/);
  await fights(c);
  assert.match(await c.send('!ctumisiones'), /!ctumisiones reclamar 1/);
  const claimed = await c.send('!ctumisiones reclamar 1', { id: 'mission-original' });
  assert.match(claimed, /40 ChengCoins.*15 XP.*1 ticket/);
  assert.match(await c.send('!ctumisiones reclamar 1', { id: 'mission-original' }), /recibo original/);
  assert.match(await c.send('!ctulogros'), /!ctulogros reclamar L1/);
  assert.match(await c.send('!ctulogros reclamar L1'), /60 ChengCoins.*20 XP.*1 ticket/);
  assert.match(await c.send('!ctuinventario'), /2 tickets de captura/);
  assert.match(await c.send('!ctuinventario'), /Primer filo/);
  assert.match(await c.send('!ctulogros reclamar L4'), /todavía no está desbloqueado/);
  assert.match(await c.send('!ctulogros 2'), /página no es válida/);
  assert.equal(readRecords(c.directory, 'premioscontenido').length, 2);
});

test('spawns show capture cost, event provenance and a short action; capture sends one recoverable reply', async t => {
  const c = await fixture(t);
  assert.match(await c.send('!ctuspawn'), /No hay una aparición/);
  await c.send('!ctuevento faroles reclamar');
  const spawned = await c.game.encounters.createSpawn({ characterId: 'guardian_espectral', chatId: group });
  const appearance = await c.send('!ctuspawn');
  assert.match(appearance, /👻 \*Guardián Espectral\*/);
  assert.match(appearance, /Capturar cuesta \*1 ticket\*/);
  assert.match(appearance, new RegExp(`!ctucapturar ${spawned.code}`));
  assert.match(await c.send(`!ctucapturar ${spawned.code}`, { id: 'capture-original' }), /¡Miguel capturó un personaje!/);
  assert.match(await c.send(`!ctucapturar ${spawned.code}`, { id: 'capture-original' }), /No se gastó otro ticket/);
  assert.match(await c.send('!ctuficha ESPE-000001'), /Puño Espectral.*\n.*Velo Espectral/s);
  assert.match(await c.send(`!ctucapturar ${spawned.code}`, { actor: bob }), /ya fue capturada/);
  assert.match(await c.send('!ctuinventario'), /0 tickets/);
});

test('boss turns show damage, criticals, HP bars, attack choices and short ranking navigation', async t => {
  const c = await fixture(t);
  const start = await c.send('!ctuboss');
  assert.match(start, /Guardián de la Niebla.*B1/);
  assert.match(start, /▓▓▓▓▓▓▓▓▓▓ 1000\/1000 HP/);
  assert.match(start, /!ctubossatacar 1 B1/);
  const attack = await c.send('!ctubossatacar 2 B1', { id: 'attack-original' });
  assert.match(attack, /¡CRÍTICO!.*78 de daño/);
  assert.match(attack, /922\/1000 HP/);
  assert.match(await c.send('!ctubossatacar 2 B1', { id: 'attack-original' }), /Ataque ya confirmado/);
  assert.match(await c.send('!ctubossatacar 1 B1'), /recuperando/);
  assert.match(await c.send('!ctubosstop B1'), /Miguel.*\n.*78 de daño/);
  assert.match(await c.send('!ctuboss B1'), /922\/1000 HP/);
  c.advance(30_000);
  assert.match(await c.send('!ctubossatacar 1 B1'), /de daño/);
});

test('ordinary group activity produces one announcement per opportunity and ignores repeats, bot messages and unregistered senders', async t => {
  const c = await fixture(t);
  await c.send('!ctuayuda');
  c.replies.length = 0;
  const msg = { key: { remoteJid: group, participant: alice, id: 'normal-first' } };
  assert.equal(await c.route(c.sock, msg, 'Hola, equipo'), false);
  assert.equal(c.replies.length, 1);
  assert.match(c.replies[0].text, /APARECIÓ UN PERSONAJE/);
  assert.equal(await c.route(c.sock, msg, 'Hola, equipo'), false);
  for (let i = 0; i < 10; i++) await c.route(c.sock, { key: { ...msg.key, id: `noise:${i}` } }, 'Otro mensaje');
  await c.route(c.sock, { key: { ...msg.key, remoteJid: 'bot-group@g.us', fromMe: true } }, 'Mensaje del bot');
  await c.route(c.sock, { key: { ...msg.key, remoteJid: 'guest-group@g.us', participant: '521333333333@s.whatsapp.net' } }, 'Hola');
  assert.equal(c.replies.length, 1);
  assert.equal(readRecords(c.directory, 'accionescontenido').length, 1);
});

test('exploring uses the same time window as ordinary activity and commands each send exactly one reply', async t => {
  const c = await fixture(t);
  assert.match(await c.send('!ctuexplorar'), /APARECIÓ UN PERSONAJE/);
  assert.match(await c.send('!ctuexplorar'), /APARECIÓ UN PERSONAJE/);
  assert.equal(readRecords(c.directory, 'accionescontenido').length, 1);
  const offRoute = createCommandRouter({ game: c.game, automaticSpawns: false });
  const count = c.replies.length;
  assert.equal(await offRoute(c.sock, { key: { remoteJid: 'quiet@g.us', participant: alice, id: 'quiet' } }, 'Hola'), false);
  assert.equal(c.replies.length, count);
});

test('event interface distinguishes upcoming and closed calendars and never offers another welcome after closure', async t => {
  const c = await fixture(t);
  c.setTime('2026-10-11T05:59:59.999Z');
  assert.match(await c.send('!ctuevento faroles'), /Próximamente/);
  assert.match(await c.send('!ctuevento faroles reclamar'), /aún no empieza o ya terminó/);
  c.setTime('2026-10-25T06:00:00.000Z');
  const ended = await c.send('!ctuevento faroles');
  assert.match(ended, /Evento finalizado/);
  assert.doesNotMatch(ended, /👉 Reclamar/);
  assert.match(await c.send('!ctucatalogo 2'), /Evento cerrado/);
});

test('the boss interface stops offering attacks once the player reaches the encounter limit', async t => {
  const c = await fixture(t);
  const boss = await c.game.encounters.getBoss({ bossId: 'dragon' });
  for (let index = 0; index < 20; index++) {
    await c.send(`!ctubossatacar 1 ${boss.code}`);
    c.advance(30_000);
  }
  const limited = await c.send(`!ctuboss ${boss.code}`);
  assert.match(limited, /Te quedan 0 ataques/);
  assert.doesNotMatch(limited, /👉 Atacar|!ctubossatacar/);
  assert.match(limited, /!ctubosstop/);
});
