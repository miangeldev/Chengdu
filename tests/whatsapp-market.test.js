import test from 'node:test';
import assert from 'node:assert/strict';
import { createGame } from '../game/createGame.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { setup, register, readRecords, updateCharacter } from './helpers.js';

const sellerActor = '521999999999@s.whatsapp.net';
const buyerActor = '521111111111@s.whatsapp.net';
const otherActor = '521222222222@s.whatsapp.net';

async function fixture(t) {
  let now = '2026-10-11T20:00:00Z';
  const context = setup(t, { clock: () => now, randomDropInt: () => 0 });
  const seller = await register(context.game);
  const buyer = await register(context.game, 'Lukas', '521111111111');
  const { unit } = await context.game.starter.claimStarter({ userId: seller.id, choice: 'panda' });
  return { ...context, seller, buyer, unit, setTime: value => { now = value; }, clock: () => now };
}

function messaging(game, prefix = '!') {
  const route = createCommandRouter({ game, prefix, debug: false });
  const replies = [];
  const sock = { sendMessage: async (chatId, { text }) => replies.push({ chatId, text }) };
  let sequence = 0;
  async function send(body, { actor = sellerActor, id = `market-ui-${++sequence}` } = {}) {
    const count = replies.length;
    const key = { remoteJid: actor };
    if (id !== null) key.id = id;
    assert.equal(await route(sock, { key }, body), true);
    assert.equal(replies.length, count + 1);
    const text = replies.at(-1).text;
    assert.match(text, /🃏 \*CHENGDÚ CARDS \|/);
    assert.match(text, /━━━━━━━━━━━━━━/);
    assert.doesNotMatch(text, /No pude confirmar|Debug activado|@s.whatsapp.net|USR-|SALE-|EVT-/);
    if (prefix !== '.') assert.doesNotMatch(text, /\.ctu/);
    return text;
  }
  return { send, route, replies, sock };
}

async function fund(game, users, setTime, days = 1) {
  for (let day = 0; day < days; day++) {
    setTime(new Date(Date.parse('2026-10-11T20:00:00Z') + day * 86_400_000).toISOString());
    for (const user of users) await game.economy.claimDaily({ userId: user.id, operationKey: `market-funding:${user.id}:${day}` });
  }
}

test('WhatsApp market shows fees, freezes listing details, transfers ownership and separates private sale receipts', async t => {
  const { game, storage, directory, seller, buyer, unit, setTime } = await fixture(t);
  await fund(game, [buyer], setTime);
  await game.teams.setTeam({ userId: seller.id, unitIds: [unit.id] });
  const { send } = messaging(game);
  assert.match(await send('!ctumercado'), /No hay unidades en venta/);
  const listed = await send(`!ctuvender ${unit.id} 21`, { id: 'listing-original' });
  assert.match(listed, /Panda Guerrero/);
  assert.match(listed, /Precio: \*21 ChengCoins\*/);
  assert.match(listed, /Comisión del 5%: 2 ChengCoins.*redondeo hacia arriba/);
  assert.match(listed, /Recibirás: \*19 ChengCoins\*/);
  assert.match(listed, /Retirada del equipo/);
  assert.ok(listed.length < 1000);
  const listing = readRecords(directory, 'mercado')[0];
  assert.equal((await game.teams.getTeam(seller.id)).units.length, 0);
  assert.equal((await game.units.getUnit(unit.id)).lock.type, 'market');
  const collection = await send('!ctupersonajes');
  assert.match(collection, /En venta/);
  assert.doesNotMatch(collection, /En combate|!ctuequipo usar/);
  const inspector = await send(`!ctuunidad ${unit.id}`);
  assert.match(inspector, /Propietario: Miguel/);
  assert.match(inspector, /En venta/);
  assert.match(inspector, /!ctupropiedad/);
  const own = await send('!ctumercado mios');
  assert.match(own, /MIS ANUNCIOS/);
  assert.match(own, /!cturetirar LIST-/);
  assert.match(await send('!ctumercado mios', { actor: buyerActor }), /No tienes unidades en venta/);
  assert.match(await send('!ctumercado común'), /Panda Guerrero/);
  assert.match(await send('!ctumercado raro'), /No hay unidades en venta/);
  await updateCharacter(storage, unit.characterId, { name: 'Panda del futuro' });
  const detail = await send(`!ctumercado ver ${listing.id}`, { actor: buyerActor });
  assert.match(detail, /Panda Guerrero/);
  assert.doesNotMatch(detail, /Panda del futuro/);
  assert.match(detail, /120 HP.*25 ATQ.*23 DEF/);
  assert.match(detail, /!ctucomprar LIST-/);
  assert.match(detail, /!ctuficha PAND-000001/);
  const ownDetail = await send(`!ctumercado ver ${listing.id}`);
  assert.match(ownDetail, /!cturetirar LIST-/);
  assert.doesNotMatch(ownDetail, /!ctucomprar/);
  const bought = await send(`!ctucomprar ${listing.id}`, { actor: buyerActor, id: 'purchase-original' });
  assert.match(bought, /21 ChengCoins pagados/);
  assert.match(bought, /Saldo restante: \*79 ChengCoins\*/);
  assert.match(bought, /!ctuequipo usar PAND-000001/);
  assert.doesNotMatch(bought, /Saldo.*19 ChengCoins/);
  assert.equal((await game.economy.getBalance(seller.id)).coins, 19);
  assert.equal((await game.economy.getBalance(buyer.id)).coins, 79);
  assert.match(await send('!ctumovimientos'), /\*\+19 ChengCoins\* · 🤝 Venta de unidad/);
  assert.match(await send('!ctumovimientos', { actor: buyerActor }), /\*-21 ChengCoins\* · 🛒 Compra de unidad/);
  const transferred = await game.units.getUnit(unit.id);
  assert.equal(transferred.ownerId, buyer.id);
  assert.equal(transferred.ownershipVersion, 1);
  assert.equal(transferred.lock, null);
  assert.deepEqual(transferred.initialStats, unit.initialStats);
  assert.equal(transferred.serial, unit.serial);
  assert.equal(transferred.progress.xp, 0);
  const buyerHistory = await send('!ctuventas', { actor: buyerActor });
  assert.match(buyerHistory, /Compra · 21 ChengCoins/);
  assert.match(buyerHistory, /Vendedor: Miguel/);
  const sellerHistory = await send('!ctuventas');
  assert.match(sellerHistory, /Venta · \+19 ChengCoins/);
  assert.match(sellerHistory, /Comprador: Lukas · Comisión: 2/);
  assert.doesNotMatch(sellerHistory, /79 ChengCoins/);
  assert.equal('sellerBalanceAfter' in (await game.market.getSales(buyer.id)).items[0], false);
  assert.equal('buyerBalanceAfter' in (await game.market.getSales(seller.id)).items[0], false);
  const history = await send(`!ctupropiedad ${unit.id}`);
  assert.match(history, /Propietario actual: \*Lukas\*/);
  assert.ok(history.indexOf('Emitida para Miguel') < history.indexOf('Miguel → Lukas'));
  assert.match(history, /Compra en el mercado/);
  const replay = await send(`!ctucomprar ${listing.id}`, { actor: buyerActor, id: 'purchase-original' });
  assert.match(replay, /recibo original/);
  assert.match(replay, /Saldo tras esa compra: \*79 ChengCoins\*/);
  assert.equal(readRecords(directory, 'ventas').length, 1);
  assert.match(await send(`!ctustarter panda`), /cambió de propietario/);
  assert.match(await send('!ctustarter'), /!ctupersonajes/);
  assert.doesNotMatch(await send('!ctupersonajes'), /Reclamar starter/);
});

test('WhatsApp market rejects invalid operations and distinguishes a withdrawn listing from an expired one', async t => {
  const { game, directory, seller, unit, setTime } = await fixture(t);
  const { send } = messaging(game);
  for (const price of ['19', '1000001', '1.5', '2e1', '-20']) assert.match(await send(`!ctuvender ${unit.id} ${price}`), /número entero entre 20 y 1000000/);
  assert.match(await send(`!ctuvender ${unit.id} 20`, { id: null }), /No pude identificar este mensaje/);
  assert.equal(readRecords(directory, 'mercado').length, 0);
  await send(`!ctuvender ${unit.id} 80`);
  let listing = readRecords(directory, 'mercado').at(-1);
  assert.match(await send(`!ctuvender ${unit.id} 80`), /ya está en venta/);
  assert.match(await send(`!ctucomprar ${listing.id}`), /ya te pertenece/);
  assert.match(await send(`!ctucomprar ${listing.id}`, { actor: buyerActor, id: null }), /No pude identificar este mensaje/);
  assert.match(await send(`!ctucomprar ${listing.id}`, { actor: buyerActor }), /No tienes suficientes ChengCoins/);
  assert.match(await send(`!cturetirar ${listing.id}`, { actor: buyerActor }), /Sólo el vendedor/);
  assert.match(await send(`!cturetirar ${listing.id}`, { id: null }), /No pude identificar este mensaje/);
  assert.match(await send(`!ctuequipo usar ${unit.id}`), /en combate o en venta/);
  const cancelled = await send(`!cturetirar ${listing.id}`, { id: 'withdraw-original' });
  assert.match(cancelled, /Anuncio retirado/);
  assert.match(cancelled, /no cobra comisión/);
  assert.match(await send(`!cturetirar ${listing.id}`, { id: 'withdraw-original' }), /ya se había retirado/);
  assert.equal((await game.units.getUnit(unit.id)).lock, null);
  assert.equal((await game.economy.getBalance(seller.id)).coins, 0);
  await send(`!ctuvender ${unit.id} 80`);
  listing = readRecords(directory, 'mercado').at(-1);
  setTime(listing.expiresAt);
  const expired = await send(`!cturetirar ${listing.id}`);
  assert.match(expired, /El anuncio venció/);
  assert.doesNotMatch(expired, /Anuncio retirado/);
  assert.equal((await game.units.getUnit(unit.id)).lock, null);
  assert.match(await send(`!ctucomprar ${listing.id}`, { actor: buyerActor }), /El anuncio venció/);
  assert.match(await send('!ctucomprar LIST-missing', { actor: buyerActor }), /Ese anuncio no existe/);
  assert.match(await send('!ctumercado ver'), /argumentos no son válidos/);
  assert.match(await send('!ctumercado common cursor extra'), /Usa !ctumercado/);
});

test('WhatsApp keeps starter, pack and purchase replays honest after the units have changed owners again', async t => {
  const { game, directory, seller, buyer, unit, setTime } = await fixture(t);
  await fund(game, [seller, buyer], setTime, 5);
  const { send } = messaging(game);
  await send('!ctuabrir basico', { id: 'pack-original' });
  const obtained = (await game.units.getUserUnits(seller.id)).items.find(item => item.origin.type === 'pack');
  await send(`!ctuvender ${unit.id} 21`);
  const starterListing = readRecords(directory, 'mercado').at(-1);
  await send(`!ctucomprar ${starterListing.id}`, { actor: buyerActor });
  assert.doesNotMatch(await send('!ctustarter panda'), /!ctuequipo usar/);
  await send(`!ctuvender ${obtained.id} 100`);
  const packListing = readRecords(directory, 'mercado').at(-1);
  await send(`!ctucomprar ${packListing.id}`, { actor: buyerActor, id: 'pack-purchase-original' });
  const packReplay = await send('!ctuabrir basico', { id: 'pack-original' });
  assert.match(packReplay, /cambió de propietario desde la apertura/);
  assert.match(packReplay, /!ctupersonajes/);
  assert.doesNotMatch(packReplay, /!ctuequipo usar/);
  await send(`!ctuvender ${obtained.id} 20`, { actor: buyerActor });
  const resale = readRecords(directory, 'mercado').at(-1);
  await send(`!ctucomprar ${resale.id}`);
  const originalPurchase = await send(`!ctucomprar ${packListing.id}`, { actor: buyerActor, id: 'pack-purchase-original' });
  assert.match(originalPurchase, /Saldo tras esa compra: \*379 ChengCoins\*/);
  assert.match(originalPurchase, /cambió de propietario desde esa compra/);
  assert.match(originalPurchase, /!ctupersonajes/);
  assert.doesNotMatch(originalPurchase, /!ctuequipo usar/);
  assert.equal((await game.units.getUnit(obtained.id)).ownerId, seller.id);
  assert.equal((await game.units.getUnit(obtained.id)).ownershipVersion, 2);
  assert.equal(readRecords(directory, 'aperturas').length, 1);
  assert.equal(readRecords(directory, 'ventas').length, 3);
  assert.equal((await game.economy.getBalance(buyer.id)).coins, 398);
});

test('WhatsApp purchase retries after a transport failure and restart retain the original money and transfer', async t => {
  const { game, storage, directory, seller, buyer, unit, setTime, clock } = await fixture(t);
  await fund(game, [buyer], setTime);
  const created = await game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 80, operationKey: 'listing-before-disconnection' });
  const msg = { key: { remoteJid: buyerActor, id: 'purchase-disconnected' } };
  const route = createCommandRouter({ game, debug: false });
  await assert.rejects(route({ sendMessage: async () => { throw new Error('Socket disconnected'); } }, msg, `.ctucomprar ${created.listing.id}`), /Socket disconnected/);
  assert.equal((await game.economy.getBalance(buyer.id)).coins, 20);
  assert.equal((await game.economy.getBalance(seller.id)).coins, 76);
  await storage.close();
  const reopened = createGame({ directory, clock });
  t.after(() => reopened.close());
  const { send } = messaging(reopened, '.');
  const repeated = await send(`.ctucomprar ${created.listing.id}`, { actor: buyerActor, id: 'purchase-disconnected' });
  assert.match(repeated, /recibo original/);
  assert.match(repeated, /Saldo tras esa compra: \*20 ChengCoins\*/);
  assert.equal(readRecords(directory, 'ventas').length, 1);
  assert.equal((await reopened.units.getUnit(unit.id)).ownershipVersion, 1);
  assert.equal((await reopened.economy.getBalance(seller.id)).coins, 76);
});

test('WhatsApp simultaneous buyers receive one sale and a clear unavailable message', async t => {
  const { game, directory, seller, buyer, unit, setTime } = await fixture(t);
  const other = await register(game, 'Ana', '521222222222');
  await fund(game, [buyer, other], setTime);
  const { listing } = await game.market.createListing({ sellerId: seller.id, unitId: unit.id, price: 80, operationKey: 'racing-buyers-listing' });
  const { route, sock, replies } = messaging(game);
  const results = await Promise.all([buyerActor, otherActor].map(actor => route(sock, { key: { remoteJid: actor, id: 'concurrent-purchase' } }, `!ctucomprar ${listing.id}`)));
  assert.deepEqual(results, [true, true]);
  assert.equal(replies.length, 2);
  assert.equal(replies.filter(reply => reply.text.includes('¡La unidad ya forma parte')).length, 1);
  assert.equal(replies.filter(reply => reply.text.includes('ya se vendió, se retiró o venció')).length, 1);
  assert.equal(readRecords(directory, 'ventas').length, 1);
  assert.equal((await game.economy.getBalance(seller.id)).coins, 76);
  assert.equal((await game.economy.getBalance(buyer.id)).coins + (await game.economy.getBalance(other.id)).coins, 120);
  assert.equal((await game.units.getUnit(unit.id)).ownershipVersion, 1);
});

test('WhatsApp market pagination preserves filters and owner-specific listing cursors', async t => {
  const { game, directory, seller, unit } = await fixture(t);
  const { send } = messaging(game);
  const units = [unit];
  for (let i = 0; i < 5; i++) units.push(await game.units.createUnit({ ownerId: seller.id, characterId: 'panda_guerrero', origin: { type: 'admin', sourceId: `pagination-${i}` }, operationKey: `market-pagination-mint:${i}` }));
  for (let i = 0; i < units.length; i++) await send(`!ctuvender ${units[i].id} ${100 - i * 10}`);
  const market = await send('!ctumercado');
  assert.equal((market.match(/👉 !ctumercado ver LIST-/g) ?? []).length, 5);
  const next = market.match(/Siguiente: \*([^*]+)\*/)[1];
  assert.equal(((await send(next)).match(/👉 !ctumercado ver LIST-/g) ?? []).length, 1);
  const cheap = await send('!ctumercado precio');
  assert.ok(cheap.indexOf('*50 ChengCoins*') < cheap.indexOf('*60 ChengCoins*'));
  assert.match(cheap, /Siguiente: \*!ctumercado precio /);
  const common = await send('!ctumercado comun');
  const commonNext = common.match(/Siguiente: \*([^*]+)\*/)[1];
  assert.match(commonNext, /!ctumercado comun /);
  assert.match(await send(commonNext.replace('comun ', 'raro ')), /página no es válida/);
  const own = await send('!ctumercado mios');
  const ownNext = own.match(/Siguiente: \*([^*]+)\*/)[1];
  assert.match(await send(ownNext, { actor: buyerActor }), /página no es válida/);
  assert.equal(readRecords(directory, 'mercado').length, 6);
});
