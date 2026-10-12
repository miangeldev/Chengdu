import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../game/createGame.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { setup, register, readRecords, updateCharacter } from './helpers.js';

const actor = '521999999999@s.whatsapp.net';
const other = '521111111111@s.whatsapp.net';
const group = '120363111@g.us';
const DAY_MS = 86_400_000;

function messaging(game, { prefix = '!', transport = null } = {}) {
  const replies = [];
  const route = createCommandRouter({ game, prefix, debug: false });
  const sock = { sendMessage: transport ?? (async (_, payload) => replies.push(payload.text)) };
  let sequence = 0;
  async function send(body, { messageId = `economy-${++sequence}`, sender = actor, inGroup = false } = {}) {
    const count = replies.length;
    const key = { remoteJid: inGroup ? group : sender, ...(inGroup ? { participant: sender } : {}) };
    if (messageId !== null) key.id = messageId;
    assert.equal(await route(sock, { key }, body), true);
    assert.equal(replies.length, count + 1);
    const text = replies.at(-1);
    assert.match(text, /🃏 \*CHENGDÚ CARDS \|/);
    assert.match(text, /━━━━━━━━━━━━━━/);
    assert.doesNotMatch(text, /No pude confirmar|Debug activado|@s.whatsapp.net|DAILY-|USR-|coin:/);
    if (prefix !== '.') assert.doesNotMatch(text, /\.ctu/);
    return text;
  }
  return { send, route, replies };
}

test('WhatsApp daily gives one receipt, explains cooldown in Mexico City, and keeps original replay balances', async t => {
  let now = '2026-10-11T20:00:00Z';
  const { game, directory } = setup(t, { clock: () => now });
  const user = await register(game);
  const { send } = messaging(game);
  const firstWallet = await send('!ctubalance');
  assert.match(firstWallet, /\*0 ChengCoins\*/);
  assert.match(firstWallet, /Ingresos: 0.*Gastos: 0/);
  assert.match(firstWallet, /Diario: \+100 ChengCoins cada 24 h/);
  assert.match(firstWallet, /!ctudiario/);
  const first = await send('!ctudiario', { messageId: 'first-daily' });
  assert.match(first, /\*\+100 ChengCoins\*/);
  assert.match(first, /Saldo: \*100 ChengCoins\*/);
  assert.match(first, /12 oct 2026, 14:00/);
  assert.match(first, /Ciudad de México/);
  assert.match(first, /!ctutienda/);
  assert.ok(first.length < 600);
  const replay = await send('!ctudiario', { messageId: 'first-daily' });
  assert.match(replay, /ya reclamó tu diario/);
  assert.match(replay, /Saldo tras ese reclamo: \*100 ChengCoins\*/);
  const wait = await send('!ctudiario');
  assert.match(wait, /Ya reclamaste tu diario/);
  assert.match(wait, /12 oct 2026, 14:00/);
  assert.match(wait, /!ctubalance/);
  assert.doesNotMatch(wait, /\+100 ChengCoins/);
  assert.match(await send('!ctudiario', { messageId: null }), /No pude identificar este mensaje/);
  assert.match(await send('!ctudiario extra'), /argumentos no son válidos/);
  assert.equal(readRecords(directory, 'diarios').length, 1);
  assert.equal((await game.economy.getBalance(user.id)).coins, 100);
  now = '2026-10-12T20:00:00Z';
  assert.match(await send('!ctudiario'), /Saldo: \*200 ChengCoins\*/);
  const oldReceipt = await send('!ctudiario', { messageId: 'first-daily' });
  assert.match(oldReceipt, /Saldo tras ese reclamo: \*100 ChengCoins\*/);
  assert.equal((await game.economy.getBalance(user.id)).coins, 200);
  assert.equal(readRecords(directory, 'diarios').length, 2);
  assert.equal((await game.users.getUser(user.id)).progress.xp, 0);
  assert.equal((await game.units.getUserUnits(user.id)).items.length, 0);
});

test('WhatsApp five daily rewards fund a shop purchase and paginate only the current player movements', async t => {
  let now = '2026-10-11T20:00:00Z';
  const { game, storage } = setup(t, { clock: () => now, randomDropInt: () => 0 });
  const user = await register(game);
  await register(game, 'Lukas', '521111111111');
  const { send } = messaging(game);
  assert.match(await send('!ctumovimientos'), /Aún no tienes movimientos/);
  const shop = await send('!ctutienda');
  assert.match(shop, /Sobre Básico/);
  assert.match(shop, /500 ChengCoins · ✅ Disponible/);
  assert.match(shop, /!ctuabrir basico/);
  assert.match(shop, /!ctusobres/);
  assert.doesNotMatch(shop, /70%|22%|Robusto|Precisión/);
  assert.ok(shop.length < 550);
  for (let i = 0; i < 5; i++) {
    now = new Date(Date.parse('2026-10-11T20:00:00Z') + i * DAY_MS).toISOString();
    await send('!ctudiario', { messageId: `earned-day-${i}`, inGroup: i % 2 === 0 });
  }
  await send('!ctudiario', { sender: other, inGroup: true });
  assert.equal((await game.economy.getBalance(user.id)).coins, 500);
  assert.match(await send('!ctuabrir basico'), /500 ChengCoins gastados/);
  const wallet = await send('!ctubalance');
  assert.match(wallet, /\*0 ChengCoins\*/);
  assert.match(wallet, /Ingresos: 500.*Gastos: 500/);
  assert.match(wallet, /!ctumovimientos/);
  const movements = await send('!ctumovimientos');
  assert.match(movements, /\*-500 ChengCoins\* · 🎁 Sobre/);
  assert.equal((movements.match(/\*\+100 ChengCoins\*/g) ?? []).length, 4);
  assert.ok(movements.indexOf('-500 ChengCoins') < movements.indexOf('+100 ChengCoins'));
  assert.match(movements, /15 oct 2026, 14:00/);
  assert.doesNotMatch(movements, /OPEN-|BTL-|Lukas|balanceBefore|sourceType/);
  const nextCommand = movements.match(/Siguiente: \*([^*]+)\*/)?.[1];
  assert.equal(nextCommand, '!ctumovimientos 2');
  const last = await send(nextCommand);
  assert.equal((last.match(/\*\+100 ChengCoins\*/g) ?? []).length, 1);
  assert.match(last, /11 oct 2026, 14:00/);
  assert.match(last, /Página 2 de 2/);
  assert.match(last, /Anterior: \*!ctumovimientos 1\*/);
  assert.doesNotMatch(last, /Siguiente:/);
  assert.match(await send(nextCommand, { sender: other }), /página no es válida/);
  const otherMovements = await send('!ctumovimientos', { sender: other });
  assert.equal((otherMovements.match(/\*\+100 ChengCoins\*/g) ?? []).length, 1);
  assert.doesNotMatch(otherMovements, /-500/);
  assert.match(await send('!ctumovimientos cursor extra'), /página no es válida/);
  assert.match(await send('!ctutienda extra'), /argumentos no son válidos/);
  const catalog = await game.characters.listCharacters();
  for (const character of catalog.items) await updateCharacter(storage, character.id, { obtainable: false });
  const emptyShop = await send('!ctutienda');
  assert.match(emptyShop, /📦 Agotado/);
  assert.doesNotMatch(emptyShop, /!ctuabrir basico/);
  const help = await send('!ctuayuda');
  assert.match(help, /!ctudiario.*\n!ctutienda.*\n!ctumovimientos/);
});

test('WhatsApp daily transport failure is recoverable after restart with the same authenticated message', async t => {
  const now = '2026-10-11T20:00:00Z';
  const { game, storage, directory } = setup(t, { clock: () => now });
  const user = await register(game);
  const msg = { key: { remoteJid: group, participant: actor, id: 'diario-disconnected' } };
  const initialRoute = createCommandRouter({ game, debug: false });
  await assert.rejects(initialRoute({ sendMessage: async () => { throw new Error('Socket disconnected'); } }, msg, '.ctudiario'), /Socket disconnected/);
  assert.equal((await game.economy.getBalance(user.id)).coins, 100);
  await storage.close();
  const reopened = createGame({ directory, clock: () => '2026-10-12T20:00:00Z' });
  t.after(() => reopened.close());
  const replies = [];
  const route = createCommandRouter({ game: reopened, debug: false });
  assert.equal(await route({ sendMessage: async (_, { text }) => replies.push(text) }, msg, '.ctudiario'), true);
  assert.equal(replies.length, 1);
  assert.match(replies[0], /ya reclamó tu diario/);
  assert.match(replies[0], /Saldo tras ese reclamo: \*100 ChengCoins\*/);
  assert.equal(readRecords(directory, 'diarios').length, 1);
  assert.equal((await reopened.economy.getBalance(user.id)).coins, 100);
  assert.equal((await reopened.economy.getDailyStatus(user.id)).available, true);
});
