import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { renderBattle } from '../interfaces/whatsapp/battleFormat.js';
import { commandText } from '../interfaces/whatsapp/format.js';
import { register, setup } from './helpers.js';

async function arena(t, characters = ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
  const context = setup(t, { randomRoll: () => 0 });
  const a = await register(context.game);
  const b = await register(context.game, 'Lukas', '521111111111');
  const teams = [];
  for (const user of [a, b]) {
    const units = [];
    for (const [index, characterId] of characters.entries()) units.push(await context.game.units.createUnit({ characterId,
      ownerId: user.id, origin: { type: 'test_reward', sourceId: `${user.id}:${index}` }, operationKey: `${user.id}:${index}` }));
    teams.push(units);
  }
  const replies = [];
  const logs = [];
  const router = createCommandRouter({ game: context.game, prefix: '!', debug: false, battleHealthBars: false, logger: message => logs.push(message) });
  const sock = { sendMessage: async (chatId, payload) => replies.push({ chatId, text: payload.text }) };
  const group = '120363111@g.us';
  const numbers = ['521999999999@s.whatsapp.net', '521111111111@s.whatsapp.net'];
  let sequence = 0;
  const send = async (index, body, mentions = [], id = null) => {
    const count = replies.length;
    await router(sock, { key: { remoteJid: group, participant: numbers[index], id: id ?? `advanced-${++sequence}` },
      message: { extendedTextMessage: { contextInfo: { mentionedJid: mentions } } } }, body);
    assert.equal(replies.length, count + 1);
    assert.equal(logs.length, 0, logs.join('\n'));
    return replies.at(-1).text;
  };
  return { ...context, a, b, teams, replies, send, group, numbers };
}

test('WhatsApp default challenge uses three-unit advanced combat, switches once and keeps every event in one response', async t => {
  const { game, a, b, teams, replies, send, group, numbers } = await arena(t);
  for (const index of [0, 1]) {
    const team = await send(index, `!ctuequipo usar ${teams[index].map(unit => unit.id).join(' ')}`);
    assert.match(team, /3\/3 unidades/);
    assert.match(team, /Panda Guerrero/);
    assert.match(team, /Mago Carmesí/);
    assert.match(team, /Lobo Sombrío/);
  }
  const challenge = await send(0, '!ctupelea @Lukas', [numbers[1]]);
  assert.match(challenge, /\*3v3\*/);
  const opening = await send(1, '!ctuaceptar');
  assert.match(opening, /Piel de Bambú/);
  assert.match(opening, /🪑 2 .*Mago Carmesí/);
  assert.match(opening, /!ctucambiar 2/);
  assert.match(opening, /!ctucambiar 3/);
  assert.doesNotMatch(opening, /USR-|BTL-|PAND-|MAGC-|LOBO-|Precisión:|Defensa:|Velocidad:|\bUUID\b/);
  const change = await send(0, '!ctucambiar 2', [], 'switch-once');
  assert.match(change, /eligió a .*Mago Carmesí/);
  assert.match(change, /Sangre Carmesí/);
  assert.match(change, /Turno de Lukas/);
  let battle = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  assert.equal(battle.rulesVersion, 2);
  assert.equal(battle.actions.length, 1);
  assert.equal(battle.players[0].activeIndex, 1);
  const replay = await send(0, '!ctucambiar 2', [], 'switch-once');
  assert.match(replay, /Esta acción ya se había registrado/);
  assert.doesNotMatch(replay, /eligió a|Sangre Carmesí/);
  battle = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  assert.equal(battle.actions.length, 1);
  await send(1, '!ctuatacar 1');
  await send(0, '!ctuatacar 2');
  const status = await send(0, '!ctucombate');
  assert.match(status, /Quemadura/);
  await send(1, '!ctuatacar 1');
  const cooldown = await send(0, '!ctuatacar 2');
  assert.match(cooldown, /recuperándose/);
  const options = await send(0, '!ctucombate');
  assert.match(options, /⏳ 2T/);
  assert.match(options, /!ctuatacar 1/);
  assert.doesNotMatch(options, /👉[^\n]*!ctuatacar 2/);
  const ficha = await send(0, `!ctuficha ${teams[0][2].id}`);
  assert.match(ficha, /Unidad en reserva/);
  assert.match(ficha, /Mirada Nocturna/);
  assert.match(ficha, /Precisión:/);
  const beforeComplete = replies.length;
  battle = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  while (battle.status === 'active') {
    await send(battle.turnUserId === a.id ? 0 : 1, '!ctuatacar 1');
    battle = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  }
  assert.ok(replies.slice(beforeComplete).some(reply => reply.text.includes('fuera de combate')));
  assert.ok(replies.slice(beforeComplete).some(reply => reply.text.includes('entra al combate')));
  const final = replies.at(-1).text;
  assert.match(final, /VICTORIA/);
  assert.match(final, /RECOMPENSAS/);
  assert.match(final, /120 ChengCoins/);
  assert.match(final, /3v3/);
  const history = await send(0, '!ctuhistorial');
  assert.match(history, /3v3/);
  const detail = await send(0, `!ctuhistorial ${battle.id}`);
  assert.match(detail, /TURNOS/);
  assert.match(detail, /eligió a/);
  assert.doesNotMatch(detail, /effect_applied|sourceUnitId|actorUnitId|regeneration|defense_down/);
  assert.equal((await game.users.getUser(b.id)).battleStats.matches, 1);
});

test('mode, reserve and team errors give short next steps and classic matches preserve the original presentation', async t => {
  const { game, a, b, teams, send, group, numbers } = await arena(t, ['panda_guerrero', 'mago_carmesi']);
  await send(0, `!ctuequipo usar ${teams[0].map(unit => unit.id).join(' ')}`);
  await send(1, `!ctuequipo usar ${teams[1][0].id}`);
  assert.match(await send(0, '!ctupelea @Lukas', [numbers[1]]), /mismo número de unidades/);
  assert.match(await send(0, '!ctupelea @Lukas 4v4', [numbers[1]]), /Elige 1v1, 2v2, 3v3 o clasico/);
  assert.match(await send(0, '!ctuequipo ordenar 1 1'), /una vez cada posición/);
  await send(1, `!ctuequipo agregar ${teams[1][1].id}`);
  await send(0, '!ctupelea @Lukas 2v2', [numbers[1]]);
  await send(1, '!ctuaceptar');
  assert.match(await send(0, '!ctucambiar 1'), /ya está luchando/);
  assert.match(await send(0, '!ctucambiar 3'), /posición no existe/);
  await send(0, '!cturendirse');
  const advanced = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  assert.equal(advanced.settlement.reason, 'early_surrender');
  await send(0, '!ctupelea @Lukas clasico', [numbers[1]]);
  const classic = await send(1, '!ctuaceptar');
  assert.match(classic, /Impacto del Panda · 40 POT/);
  assert.doesNotMatch(classic, /Piel de Bambú|ctucambiar|Mago Carmesí|3v3|2v2/);
  const battle = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  assert.equal(battle.rulesVersion, 1);
  assert.equal(battle.players[0].unit.id, teams[0][0].id);
  assert.equal((await game.units.getUnit(teams[0][1].id)).lock, null);
  assert.match(await send(0, '!ctucambiar 2'), /combates avanzados/);
  await game.battle.surrender({ userId: b.id, chatId: group });
});

test('text effects render healing and elemental advantage without exposing runtime keys', () => {
  const unit = { id: 'MONJ-000001', characterId: 'monje_celestial', characterName: 'Monje Celestial', hp: 100, stats: { hp: 114 },
    level: 1, attacks: [{ id: 'a', name: 'Ataque', power: 20 }, { id: 'b', name: 'Especial', power: 30 }], effects: [], cooldowns: {}, ability: { name: 'Serenidad' } };
  const battle = { rulesVersion: 2, status: 'active', format: '1v1', teamSize: 1, actions: [], openingEvents: [], turnNumber: 2,
    turnUserId: 'a', players: [{ userId: 'a', name: 'Miguel', activeIndex: 0, units: [unit] },
      { userId: 'b', name: 'Lukas', activeIndex: 0, units: [{ ...unit, id: 'MONJ-000002' }] }] };
  const action = { actorId: 'a', targetId: 'b', actorUnitId: unit.id, targetUnitId: 'MONJ-000002', type: 'attack', attackId: 'a', hit: true,
    damage: 20, events: [{ type: 'effect_tick', unitId: unit.id, effect: 'regeneration', amount: 6 },
      { type: 'elemental', unitId: 'MONJ-000002', amount: 125 }] };
  const text = renderBattle({ battle, action }, (name, value) => commandText('.', name, value), { healthBars: false });
  assert.match(text, /recupera 6 HP/);
  assert.match(text, /muy eficaz/);
  assert.doesNotMatch(text, /regeneration|elemental|MONJ-|Precisión:/);
});

test('a stunned switch shows the skipped action and retries preserve its intention without entering the reserve', async t => {
  const { game, a, teams, send, group, numbers } = await arena(t, ['guardian_jade', 'mago_carmesi']);
  for (const index of [0, 1]) await send(index, `!ctuequipo usar ${teams[index].map(unit => unit.id).join(' ')}`);
  await send(0, '!ctupelea @Lukas 2v2', [numbers[1]]);
  await send(1, '!ctuaceptar');
  const stun = await send(0, '!ctuatacar 2');
  assert.match(stun, /Aturdido/);
  const skip = await send(1, '!ctucambiar 2', [], 'stunned-switch');
  assert.match(skip, /no pudo actuar/);
  assert.match(skip, /Turno de Miguel/);
  assert.doesNotMatch(skip, /eligió a|Sangre Carmesí|CHENGDÚ CARDS \| ERROR/);
  let battle = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  assert.equal(battle.actions.at(-1).commandType, 'switch');
  assert.equal(battle.actions.at(-1).type, 'skip');
  assert.equal(battle.players[1].activeIndex, 0);
  assert.equal(battle.players[1].units[1].participated, false);
  const replay = await send(1, '!ctucambiar 2', [], 'stunned-switch');
  assert.match(replay, /Esta acción ya se había registrado/);
  assert.doesNotMatch(replay, /no pudo actuar|eligió a/);
  battle = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  assert.equal(battle.actions.length, 2);
  await game.battle.surrender({ userId: a.id, chatId: group });
  const terminal = await game.battle.getMyBattle({ userId: a.id, chatId: group });
  assert.equal(terminal.settlement.rewards[1].unitRewards.length, 1);
});
