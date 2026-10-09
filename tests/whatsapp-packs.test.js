import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../game/createGame.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { setup, register, updateCharacter } from './helpers.js';

async function fundedGame(t) {
  let now = '2026-10-09T20:00:00Z';
  const { storage, directory } = setup(t, { clock: () => now, randomRoll: () => 0 });
  let draws = 0;
  const game = createGame({ storage, randomRoll: () => 0, randomDropInt: upper => { draws++; return upper - 1; } });
  const user = await register(game);
  const rival = await register(game, 'Lukas', '521111111111');
  const panda = await game.starter.claimStarter({ userId: user.id, choice: 'panda' });
  const wolf = await game.starter.claimStarter({ userId: rival.id, choice: 'lobo' });
  await game.teams.setTeam({ userId: user.id, unitIds: [panda.unit.id] });
  await game.teams.setTeam({ userId: rival.id, unitIds: [wolf.unit.id] });
  const chatId = '120363111@g.us';
  for (let i = 0; i < 5; i++) {
    if (i === 3) now = '2026-10-11T20:00:00Z';
    await game.battle.challenge({ userId: user.id, opponentId: rival.id, chatId });
    let battle = (await game.battle.accept({ userId: rival.id, chatId })).battle;
    while (battle.status === 'active') battle = (await game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
    assert.equal(battle.winnerId, user.id);
  }
  assert.equal((await game.economy.getBalance(user.id)).coins, 600);
  return { game, storage, directory, user, draws: () => draws };
}

function messaging(game) {
  const replies = [];
  const route = createCommandRouter({ game, prefix: '!', debug: false });
  const sock = { sendMessage: async (_, payload) => replies.push(payload.text) };
  let sequence = 0;
  return async (body, id = `pack-message-${++sequence}`) => {
    const count = replies.length;
    const key = { remoteJid: '521999999999@s.whatsapp.net' };
    if (id !== null) key.id = id;
    assert.equal(await route(sock, { key }, body), true);
    assert.equal(replies.length, count + 1);
    const text = replies.at(-1);
    assert.match(text, /🃏 \*CHENGDÚ CARDS \|/);
    assert.match(text, /━━━━━━━━━━━━━━/);
    assert.doesNotMatch(text, /No pude confirmar|@s.whatsapp.net|\.ctu|Debug activado/);
    return text;
  };
}

test('WhatsApp packs show current odds and one compact collectible receipt, with safe message replay', async t => {
  const { game, storage, user, draws } = await fundedGame(t);
  const send = messaging(game);
  const packs = await send('!ctusobres');
  assert.match(packs, /Sobre Básico.*500 ChengCoins/);
  assert.match(packs, /Común: 70%.*Raro: 22%.*Épico: 7%.*Legendario: 1%/);
  assert.match(packs, /94% Normal.*5% Shiny.*1% Dorada/);
  assert.match(packs, /80% sin rasgos.*19% uno.*1% dos/);
  assert.match(packs, /!ctuabrir basico/);
  assert.ok(packs.length < 1000);

  const opened = await send('!ctuabrir básico', 'purchase-one');
  assert.match(opened, /CHENGDÚ CARDS \| SOBRE ABIERTO/);
  assert.match(opened, /Dragón Carmesí/);
  assert.match(opened, /Legendario · Dorada/);
  assert.match(opened, /Firme|Agresivo|Robusto/);
  assert.match(opened, /500 ChengCoins gastados/);
  assert.match(opened, /Saldo restante: \*100 ChengCoins\*/);
  assert.match(opened, /!ctuficha DRGC-000001/);
  assert.match(opened, /!ctuequipo usar DRGC-000001/);
  assert.doesNotMatch(opened, /OPEN-|USR-|Precisión|Defensa:/);
  assert.ok(opened.length < 900);
  const randomCalls = draws();

  await updateCharacter(storage, 'dragon_carmesi', { name: 'Dragón futuro' });
  const repeated = await send('!ctuabrir basico', 'purchase-one');
  assert.match(repeated, /ya abrió un sobre/);
  assert.match(repeated, /Dragón Carmesí/);
  assert.doesNotMatch(repeated, /Dragón futuro/);
  assert.match(repeated, /500 ChengCoins pagados en la apertura original/);
  assert.equal(draws(), randomCalls);
  assert.equal((await game.economy.getBalance(user.id)).coins, 100);
  assert.equal((await game.units.getUserUnits(user.id)).items.length, 2);

  const collection = await send('!ctupersonajes');
  assert.match(collection, /Dorada.*Nv\. 1/);
  assert.match(collection, /2 rasgos/);
  assert.doesNotMatch(collection, /\+1 defensa|Precisión:/);
  const unit = await send('!ctuunidad DRGC-000001');
  assert.match(unit, /Sobre: Sobre Básico/);
  assert.match(unit, /Firme|Agresivo|Robusto/);
  const ficha = await send('!ctuficha DRGC-000001');
  assert.match(ficha, /Dorada/);
  assert.match(ficha, /\+1 defensa/);
  assert.match(ficha, /\+1 ataque/);
  assert.match(ficha, /Ataque: 36 · 🛡️ Defensa: 23/);
  assert.match(await send('!ctuayuda'), /!ctusobres.*\n!ctuabrir basico/);
});

test('WhatsApp pack errors keep the prefix and never debit without a message ID or enough coins', async t => {
  const { game, user, draws } = await fundedGame(t);
  const send = messaging(game);
  assert.match(await send('!ctuabrir basico', null), /No pude identificar este mensaje/);
  assert.equal((await game.economy.getBalance(user.id)).coins, 600);
  assert.equal(draws(), 0);
  assert.match(await send('!ctuabrir'), /argumentos no son válidos/);
  assert.match(await send('!ctuabrir basico extra'), /argumentos no son válidos/);
  assert.match(await send('!ctusobres extra'), /argumentos no son válidos/);
  assert.match(await send('!ctuabrir desconocido'), /Ese sobre no existe.*\n👉 Consulta !ctusobres/);
  await send('!ctuabrir basico', 'paid-opening');
  assert.match(await send('!ctuabrir desconocido', 'paid-opening'), /ya confirmó otra operación/);
  assert.match(await send('!ctuabrir basico'), /No tienes suficientes ChengCoins.*\n👉 Consulta !ctubalance/);
  assert.equal((await game.economy.getBalance(user.id)).coins, 100);
  assert.equal((await game.units.getUserUnits(user.id)).items.length, 2);
});

test('WhatsApp pack odds follow available rarities and explain total exhaustion before a purchase', async t => {
  const { game, storage } = setup(t);
  const user = await register(game);
  const send = messaging(game);
  await updateCharacter(storage, 'dragon_carmesi', { obtainable: false });
  const adjusted = await send('!ctusobres');
  assert.match(adjusted, /Común: 70\.71%.*Raro: 22\.22%.*Épico: 7\.07%/);
  assert.doesNotMatch(adjusted, /Legendario:/);
  const catalog = await game.characters.listCharacters();
  for (const character of catalog.items.filter(character => character.obtainable)) {
    await updateCharacter(storage, character.id, { obtainable: false });
  }
  const exhausted = await send('!ctusobres');
  assert.match(exhausted, /Sin personajes disponibles por ahora/);
  assert.doesNotMatch(exhausted, /!ctuabrir basico/);
  assert.match(await send('!ctuabrir basico'), /no tiene personajes disponibles.*\n👉 Consulta !ctusobres/);
  assert.equal((await game.economy.getBalance(user.id)).coins, 0);
  assert.equal((await game.units.getUserUnits(user.id)).items.length, 0);
});

test('WhatsApp retries an undelivered pack receipt after restart without another debit or random draw', async t => {
  const { game, storage, directory, user } = await fundedGame(t);
  const route = createCommandRouter({ game, debug: false });
  const msg = { key: { remoteJid: '521999999999@s.whatsapp.net', id: 'opening-before-transport-failure' } };
  await assert.rejects(route({ sendMessage: async () => { throw new Error('Socket disconnected'); } }, msg, '.ctuabrir basico'), /Socket disconnected/);
  assert.equal((await game.economy.getBalance(user.id)).coins, 100);
  const obtained = (await game.units.getUserUnits(user.id)).items.find(unit => unit.origin.type === 'pack');
  await storage.close();
  const reopened = createGame({ directory, clock: () => '2026-10-11T20:01:00Z', randomDropInt: () => { throw new Error('Replay must not draw'); } });
  t.after(() => reopened.close());
  const replies = [];
  const reopenedRoute = createCommandRouter({ game: reopened, debug: false });
  assert.equal(await reopenedRoute({ sendMessage: async (_, { text }) => replies.push(text) }, msg, '.ctuabrir basico'), true);
  assert.equal(replies.length, 1);
  assert.match(replies[0], /ya abrió un sobre/);
  assert.match(replies[0], new RegExp(obtained.id));
  assert.equal((await reopened.economy.getBalance(user.id)).coins, 100);
  assert.equal((await reopened.units.getUserUnits(user.id)).items.length, 2);
});
