import test from 'node:test';
import assert from 'node:assert/strict';
import { commands, createCommandRouter } from '../interfaces/whatsapp/index.js';
import { renderBattle } from '../interfaces/whatsapp/battleFormat.js';
import { commandText } from '../interfaces/whatsapp/format.js';
import { SEASON_LENGTH_MS } from '../game/competitive/policy.js';
import { readRecords, register, setup } from './helpers.js';

const alice = '521999999999@s.whatsapp.net';
const bob = '521111111111@s.whatsapp.net';
const group = 'competitive-ui@g.us';

async function fixture(t) {
  let now = '2026-10-13T12:00:00.000Z';
  const context = setup(t, { clock: () => now, randomRoll: () => 0 });
  const a = await register(context.game);
  const b = await register(context.game, 'Lukas', '521111111111');
  for (const [user, choice] of [[a, 'panda'], [b, 'lobo']]) {
    const { unit } = await context.game.starter.claimStarter({ userId: user.id, choice });
    await context.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  }
  const replies = [], errors = [];
  const route = createCommandRouter({ game: context.game, prefix: '!', debug: false, logger: (...error) => errors.push(error) });
  const sock = { sendMessage: async (chatId, payload) => replies.push({ chatId, text: payload.text }) };
  let sequence = 0;
  async function send(body, { actor = alice, chatId = group, id = `competitive-ui:${++sequence}`, mentions = [] } = {}) {
    const count = replies.length;
    const key = { remoteJid: chatId, participant: actor, id };
    assert.equal(await route(sock, { key, message: { extendedTextMessage: { contextInfo: { mentionedJid: mentions } } } }, body), true);
    assert.equal(replies.length, count + 1);
    assert.equal(errors.length, 0, errors.map(error => error[0]).join('\n'));
    const text = replies.at(-1).text;
    assert.match(text, /🃏 \*CHENGDÚ CARDS \|/);
    const visible = body.startsWith('!ctuhistorial') ? text.replace(/BTL-[a-f0-9-]+/g, '') : text;
    assert.doesNotMatch(visible, /No pude confirmar|Debug activado|\.ctu|USR-|BTL-|season:T|rank:|@s.whatsapp.net|[a-f0-9]{8}-[a-f0-9]{4}-/);
    return text;
  }
  return { ...context, a, b, replies, send, setTime: value => { now = value; }, advance: ms => { now = new Date(Date.parse(now) + ms).toISOString(); } };
}

async function fight(context, opponent, ranked = true) {
  const { game, a } = context;
  await game.battle.challenge({ userId: a.id, opponentId: opponent.id, chatId: group, mode: '1v1', ranked });
  let battle = (await game.battle.accept({ userId: opponent.id, chatId: group })).battle;
  while (battle.status === 'active') {
    battle = (await game.battle.attack({ userId: battle.turnUserId, chatId: group, choice: '1' })).battle;
  }
  return battle;
}

test('competitive commands share the router; public seasons, registration, modes and message IDs give useful next steps', async t => {
  const c = await fixture(t);
  for (const command of ['cturanked', 'cturank', 'ctutop', 'ctutemporada', 'ctutemporadas']) assert.ok(commands.some(plugin => plugin.command === command));
  assert.match(await c.send('!cturank'), /Sin clasificación.*1000 Elo/);
  assert.match(await c.send('!cturank'), /0\/5 clasificatorias válidas\n👥 0\/3 rivales distintos/);
  assert.match(await c.send('!ctutop'), /Aún no hay participantes/);
  const visitor = { actor: '521333333333@s.whatsapp.net' };
  assert.match(await c.send('!ctutemporada', visitor), /Temporada 1.*T1/);
  assert.match(await c.send('!ctutemporada', visitor), /Regístrate/);
  assert.match(await c.send('!cturank', visitor), /!cturegistro/);
  assert.match(await c.send('!ctutemporadas'), /!ctutemporada T1/);
  assert.match(await c.send('!cturanked @Lukas', { chatId: alice }), /grupo de WhatsApp/);
  assert.match(await c.send('!cturanked'), /!cturanked @jugador/);
  const modeError = await c.send('!cturanked @Lukas clasico', { mentions: [bob] });
  assert.match(modeError, /1v1, 2v2 o 3v3/);
  assert.doesNotMatch(modeError, /clasico/);
  assert.match(await c.send('!cturanked @Lukas', { mentions: [bob], id: null }), /mensaje nuevo/);
  assert.match(await c.send('!ctutemporada T0'), /código corto/);
  assert.match(await c.send('!ctutemporada reclamar'), /código corto/);
  assert.match(await c.send('!ctutop T0'), /código corto/);
  assert.match(await c.send('!ctutop 0'), /página no es válida/);
  assert.match(await c.send('!ctutemporada T9999'), /temporada no existe/);
  assert.match(await c.send('!ctutemporada T1 reclamar'), /después del cierre/);
  assert.match(await c.send('!ctuayuda'), /!cturanked @jugador.*\n.*!cturank/);
  assert.equal(readRecords(c.directory, 'combates').length, 0);
});

test('ranked challenges use advanced combat, show Elo at the end, deduplicate actions and keep casual results separate', async t => {
  const c = await fixture(t);
  const challenge = await c.send('!cturanked @Lukas 1v1', { mentions: [bob], id: 'challenge-original' });
  assert.match(challenge, /DESAFÍO RANKED/);
  assert.match(challenge, /Clasificatoria · T1/);
  assert.match(challenge, /!ctuaceptar/);
  assert.match(await c.send('!cturanked @Lukas 1v1', { mentions: [bob], id: 'challenge-original' }), /ya se había registrado/);
  assert.equal(readRecords(c.directory, 'combates').length, 1);
  const opening = await c.send('!ctuaceptar', { actor: bob });
  assert.match(opening, /INICIO \| T1/);
  assert.match(opening, /Clasificatoria · T1/);
  let battle = await c.game.battle.getMyBattle({ userId: c.a.id, chatId: group });
  assert.equal(battle.rulesVersion, 2);
  const actor = battle.turnUserId === c.a.id ? alice : bob;
  const attack = await c.send('!ctuatacar 1', { actor, id: 'attack-original' });
  assert.doesNotMatch(attack, /Clasificatoria|RANKED|Elo/);
  const replay = await c.send('!ctuatacar 1', { actor, id: 'attack-original' });
  assert.match(replay, /ya se había registrado/);
  battle = await c.game.battle.getMyBattle({ userId: c.a.id, chatId: group });
  assert.equal(battle.actions.length, 1);
  while (battle.status === 'active') {
    await c.send('!ctuatacar 1', { actor: battle.turnUserId === c.a.id ? alice : bob });
    battle = await c.game.battle.getMyBattle({ userId: c.a.id, chatId: group });
  }
  const final = c.replies.at(-1).text;
  assert.match(final, /RANKED · T1/);
  assert.match(final, /1016 Elo.*\(\+16\)/);
  assert.match(final, /984 Elo.*\(-16\)/);
  assert.match(final, /!cturanked @jugador/);
  assert.match(final, /RECOMPENSAS/);
  assert.equal(readRecords(c.directory, 'resultadoscompetitivos').length, 1);
  const rank = await c.game.competitive.getRank({ userId: c.a.id });
  const text = await c.send('!cturank');
  assert.match(text, new RegExp(`${rank.rank.rating} Elo`));
  assert.match(text, /En colocación/);
  const ratedMatches = rank.rank.matches;
  const friendly = await fight(c, c.b, false);
  const friendlyText = renderBattle({ battle: friendly }, (name, args) => commandText('!', name, args));
  assert.doesNotMatch(friendlyText, /RANKED|Elo/);
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.matches, ratedMatches);
  const history = await c.send('!ctuhistorial');
  assert.match(history, new RegExp(`Ranked T1.*${rank.rank.rating} Elo`));
  const detail = await c.send(`!ctuhistorial ${battle.id}`);
  assert.match(detail, /Ranked T1/);
  assert.match(detail, /RANKED · T1/);
  assert.match(detail, /1016 Elo.*\(\+16\)/);
});

test('early surrender and inactivity present the actual penalty once without inventing a valid ranked match', async t => {
  const c = await fixture(t);
  await c.send('!cturanked @Lukas', { mentions: [bob] });
  await c.send('!ctuaceptar', { actor: bob });
  const surrender = await c.send('!cturendirse', { id: 'surrender-original' });
  assert.match(surrender, /984 Elo.*\(-16\)/);
  assert.match(surrender, /rendición temprana/);
  assert.doesNotMatch(surrender, /Elo sin cambios/);
  assert.match(await c.send('!cturendirse', { id: 'surrender-original' }), /ya se había registrado/);
  assert.match(await c.send('!cturank'), /0 clasificatorias válidas/);
  assert.match(await c.send('!cturank'), /1 penalización por abandono/);
  await c.send('!cturanked @Lukas', { mentions: [bob] });
  await c.send('!ctuaceptar', { actor: bob });
  c.advance(31 * 60_000);
  const expired = await c.send('!ctucombate');
  assert.match(expired, /Penalización por inactividad/);
  assert.match(expired, /no cuenta para la colocación/);
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id })).rank.matches, 0);
});

test('leaderboards use numeric pages and stable season codes; official placement and season prizes survive duplicate claims', async t => {
  const c = await fixture(t);
  const opponents = [c.b];
  for (let index = 0; index < 5; index++) {
    const user = await register(c.game, `Rival ${index + 1}`, `52122222222${index}`);
    const { unit } = await c.game.starter.claimStarter({ userId: user.id, choice: 'panda' });
    await c.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
    opponents.push(user);
  }
  for (const opponent of opponents) await fight(c, opponent);
  const rank = await c.send('!cturank');
  assert.match(rank, /Puesto 1/);
  assert.doesNotMatch(rank, /En colocación/);
  const first = await c.send('!ctutop');
  assert.match(first, /Página 1 de 2/);
  assert.match(first, /!ctutop T1 2/);
  assert.match(first, /1\. Miguel/);
  const second = await c.send('!ctutop T1 2');
  assert.match(second, /Página 2 de 2/);
  assert.match(second, /!ctutop T1 1/);
  assert.doesNotMatch(second, /1\. Miguel/);
  assert.match(await c.send('!ctutop T1 3'), /página no es válida/);
  assert.match(await c.send('!ctutemporada T1'), /premio si cerrara ahora/);
  c.advance(SEASON_LENGTH_MS);
  const closed = await c.send('!ctutemporada T1');
  assert.match(closed, /Cerrada · Clasificación final/);
  assert.match(closed, /!ctutemporada T1 reclamar/);
  assert.match(await c.send('!cturank T1'), /Puesto 1/);
  assert.match(await c.send('!cturank'), /Sin clasificación.*1000 Elo/);
  const balanceBefore = (await c.game.users.getUser(c.a.id)).economy.coins;
  const claimed = await c.send('!ctutemporada T1 reclamar', { id: 'season-prize-original' });
  assert.match(claimed, /Premio de temporada reclamado/);
  assert.match(claimed, /Chengdú · T1/);
  const balanceAfter = (await c.game.users.getUser(c.a.id)).economy.coins;
  assert.ok(balanceAfter > balanceBefore);
  assert.match(await c.send('!ctutemporada T1 reclamar', { id: 'season-prize-original' }), /recibo original/);
  assert.match(await c.send('!ctutemporada T1 reclamar'), /recibo original/);
  assert.equal((await c.game.users.getUser(c.a.id)).economy.coins, balanceAfter);
  assert.equal(readRecords(c.directory, 'premiostemporada').length, 1);
  assert.match(await c.send('!ctutemporada T1'), /Ya reclamaste/);
  assert.match(await c.send('!ctutemporada T1 reclamar', { actor: bob }), /5 clasificatorias válidas y 3 rivales/);
  assert.match(await c.send('!ctuinventario'), /Chengdú · T1/);
  const archive = await c.send('!ctutemporadas');
  assert.match(archive, /!ctutemporada T1/);
  assert.match(archive, /!ctutemporada T2/);
  c.setTime('invalid-clock');
  assert.match(await c.send('!ctutemporada T1 reclamar', { id: 'season-prize-original' }), /recibo original/);
  assert.match(await c.send('!ctutemporada T1 reclamar'), /recibo original/);
  assert.equal((await c.game.users.getUser(c.a.id)).economy.coins, balanceAfter);
  assert.equal(readRecords(c.directory, 'premiostemporada').length, 1);
});

test('season boundaries close pending and active ranked matches without presenting inactivity or abandonment', async t => {
  const c = await fixture(t);
  // Two minutes before the final boundary of T1.
  c.advance(SEASON_LENGTH_MS - 6 * 60 * 60_000 - 2 * 60_000);
  await c.send('!cturanked @Lukas', { mentions: [bob] });
  await c.send('!ctuaceptar', { actor: bob });
  c.advance(2 * 60_000);
  const closed = await c.send('!ctucombate');
  assert.match(closed, /CIERRE DE TEMPORADA/);
  assert.match(closed, /La temporada T1 cerró/);
  assert.match(closed, /Elo sin cambios/);
  assert.doesNotMatch(closed, /inactividad|abandono|Penalización/);
  const battle = await c.game.battle.getMyBattle({ userId: c.a.id, chatId: group });
  const history = await c.send('!ctuhistorial');
  assert.match(history, /Cierre de temporada/);
  const detail = await c.send(`!ctuhistorial ${battle.id}`);
  assert.doesNotMatch(detail, /inactividad|abandono|Penalización/);
  assert.equal((await c.game.competitive.getRank({ userId: c.a.id, seasonCode: 'T1' })).rank.penalties, 0);

  c.advance(SEASON_LENGTH_MS - 2 * 60_000);
  await c.send('!cturanked @Lukas', { mentions: [bob] });
  c.advance(2 * 60_000);
  const pending = await c.send('!ctucombate');
  assert.match(pending, /La temporada T2 cerró/);
  assert.match(pending, /sin ser aceptado/);
  assert.doesNotMatch(pending, /inactividad|abandono|Penalización/);
});
