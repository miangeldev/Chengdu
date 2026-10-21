import test from 'node:test';
import assert from 'node:assert/strict';
import { paginate } from '../utils/pagination.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { readRecords, register, setup } from './helpers.js';

const alice = '521999999999@s.whatsapp.net';
const bob = '521111111111@s.whatsapp.net';

function messaging(game) {
  const route = createCommandRouter({ game, prefix: '!', debug: false });
  let reply, sequence = 0;
  const sock = { sendMessage: async (_, payload) => { reply = payload.text; } };
  return async (body, actor = alice) => {
    reply = null;
    assert.equal(await route(sock, { key: { remoteJid: 'pagination@g.us', participant: actor, id: `page-message-${++sequence}` } }, body), true);
    assert.equal(typeof reply, 'string');
    assert.doesNotMatch(reply, /No pude confirmar/);
    // Navigation arguments are numbers, even when item actions still require an ID.
    for (const line of reply.split('\n').filter(line => /Anterior:|Siguiente:/.test(line))) {
      assert.match(line, / \d+\*$/);
      assert.ok(line.length < 100, line);
      assert.doesNotMatch(line, /eyJ|LIST-|BTL-/);
    }
    return reply;
  };
}

test('numbered pagination has totals, boundaries and both directions while existing API cursors keep their stable behavior', () => {
  const records = ['d', 'b', 'a', 'c', 'e', 'f'].map(id => ({ id, createdAt: '2026-10-11T20:00:00Z' }));
  const first = paginate(records, { page: 1, limit: 2 }, 'test');
  assert.deepEqual(first.items.map(record => record.id), ['a', 'b']);
  assert.deepEqual({ ...first, items: [] }, { items: [], page: 1, totalItems: 6, totalPages: 3, previousPage: null, nextPage: 2 });
  const middle = paginate(records, { page: 2, limit: 2 }, 'test');
  assert.deepEqual(middle.items.map(record => record.id), ['c', 'd']);
  assert.equal(middle.previousPage, 1);
  assert.equal(middle.nextPage, 3);
  assert.equal(paginate(records, { page: 3, limit: 2 }, 'test').nextPage, null);
  assert.deepEqual(paginate([], { page: 1 }, 'test'), { items: [], page: 1, totalItems: 0, totalPages: 1, previousPage: null, nextPage: null });
  assert.throws(() => paginate(records, { page: 4, limit: 2 }, 'test'), { code: 'PAGE_NOT_FOUND' });
  for (const page of [0, -1, 1.5, '2', NaN, Infinity]) assert.throws(() => paginate(records, { page }, 'test'), { code: 'INVALID_PAGE' });
  const cursorPage = paginate(records, { limit: 2 }, 'test');
  const next = paginate([...records, { id: '0', createdAt: records[0].createdAt }], { limit: 2, cursor: cursorPage.nextCursor }, 'test');
  assert.deepEqual(next.items.map(record => record.id), ['c', 'd']);
  assert.throws(() => paginate(records, { page: 2, cursor: cursorPage.nextCursor }, 'test'), { code: 'INVALID_PAGE' });
  assert.throws(() => paginate(records, { cursor: cursorPage.nextCursor }, 'another-query'), { code: 'INVALID_CURSOR' });
});

test('WhatsApp catalogue can go forward and back before registration and rejects malformed or nonexistent page numbers', async t => {
  const { game, directory } = setup(t);
  const send = messaging(game);
  const first = await send('!ctucatalogo');
  assert.match(first, /Página 1 de 3/);
  assert.match(first, /Siguiente: \*!ctucatalogo 2\*/);
  assert.doesNotMatch(first, /Anterior:/);
  const second = await send('!ctucatalogo 2');
  assert.match(second, /Página 2 de 3/);
  assert.match(second, /Anterior: \*!ctucatalogo 1\*/);
  assert.match(second, /Siguiente: \*!ctucatalogo 3\*/);
  const third = await send('!ctucatalogo 3');
  assert.match(third, /Página 3 de 3/);
  assert.match(third, /Anterior: \*!ctucatalogo 2\*/);
  assert.doesNotMatch(third, /Siguiente:/);
  const all = (await game.characters.listCharacters()).items;
  assert.ok(all.every(character => first.includes(character.name) || second.includes(character.name) || third.includes(character.name)));
  assert.equal(await send('!ctucatalogo 1'), first);
  for (const value of ['0', '-1', '1.5', 'NaN', 'Infinity', '9007199254740992', '2 extra', '4']) {
    assert.match(await send('!ctucatalogo ' + value), /página no es válida/);
  }
  const legacyCursor = (await game.characters.listCharacters({ limit: 5 })).nextCursor;
  assert.match(await send('!ctucatalogo ' + legacyCursor), /número entero/);
  assert.match(await send('!ctuayuda'), /!ctucatalogo 2.*\n!ctumercado raro 2/);
  assert.equal(readRecords(directory, 'usuarios').length, 0);
});

test('collection, market, movement, sale and ownership lists all navigate with short numbers and keep their query context', async t => {
  let time = Date.parse('2026-10-11T20:00:00Z');
  const c = setup(t, { clock: () => new Date(time).toISOString() });
  const seller = await register(c.game);
  const buyer = await register(c.game, 'Lukas', '521111111111');
  for (let day = 0; day < 2; day++) {
    for (const user of [seller, buyer]) await c.game.economy.claimDaily({ userId: user.id, operationKey: `fund:${user.id}:${day}` });
    time += 86_400_000;
  }
  const units = [];
  for (let i = 0; i < 6; i++) units.push(await c.game.units.createUnit({ ownerId: seller.id, characterId: 'monje_celestial', origin: { type: 'admin', sourceId: 'pagination' }, operationKey: `mint:${i}` }));
  const send = messaging(c.game);
  assert.match(await send('!ctupersonajes'), /Siguiente: \*!ctupersonajes 2\*/);
  const collection2 = await send('!ctupersonajes 2');
  assert.match(collection2, /Página 2 de 2/);
  assert.match(collection2, /Anterior: \*!ctupersonajes 1\*/);
  const listings = [];
  for (let i = 0; i < units.length; i++) listings.push((await c.game.market.createListing({ sellerId: seller.id, unitId: units[i].id, price: 20 + i, operationKey: `offer:${i}` })).listing);
  for (const mode of ['', ' raro', ' precio', ' mios']) {
    assert.match(await send(`!ctumercado${mode}`), new RegExp(`Siguiente: \\*!ctumercado${mode} 2\\*`));
    const second = await send(`!ctumercado${mode} 2`);
    assert.match(second, /Página 2 de 2/);
    assert.match(second, new RegExp(`Anterior: \\*!ctumercado${mode} 1\\*`));
    assert.doesNotMatch(second, /Siguiente:/);
  }
  assert.match(await send('!ctumercado comun 2'), /página no es válida/);
  for (const listing of listings) await c.game.market.buyListing({ buyerId: buyer.id, listingId: listing.id, operationKey: `purchase:${listing.id}` });
  for (const actor of [alice, bob]) {
    assert.match(await send('!ctuventas', actor), /Siguiente: \*!ctuventas 2\*/);
    assert.match(await send('!ctuventas 2', actor), /Anterior: \*!ctuventas 1\*/);
    assert.match(await send('!ctumovimientos', actor), /Siguiente: \*!ctumovimientos 2\*/);
    assert.match(await send('!ctumovimientos 2', actor), /Anterior: \*!ctumovimientos 1\*/);
  }
  // The same numeric page is interpreted for each authenticated sender, never as a token for somebody else's account.
  assert.match(await send('!ctuventas 2'), /🤝 Venta/);
  assert.match(await send('!ctuventas 2', bob), /🛒 Compra/);
  assert.doesNotMatch(await send('!ctuventas 2', bob), /🤝 Venta/);
  assert.match(await send('!ctupersonajes'), /colección está vacía/);
  assert.match(await send('!ctupersonajes 2', bob), /Página 2 de 2/);
  let owner = buyer, purchaser = seller;
  for (let i = 0; i < 4; i++) {
    const { listing } = await c.game.market.createListing({ sellerId: owner.id, unitId: units[0].id, price: 20, operationKey: `resale:${i}` });
    await c.game.market.buyListing({ buyerId: purchaser.id, listingId: listing.id, operationKey: `rebuy:${i}` });
    [owner, purchaser] = [purchaser, owner];
  }
  const history = await send(`!ctupropiedad ${units[0].id}`);
  assert.match(history, new RegExp(`Siguiente: \\*!ctupropiedad ${units[0].id} 2\\*`));
  const history2 = await send(`!ctupropiedad ${units[0].id} 2`);
  assert.match(history2, /Página 2 de 2/);
  assert.match(history2, new RegExp(`Anterior: \\*!ctupropiedad ${units[0].id} 1\\*`));
  assert.doesNotMatch(history2, /Siguiente:/);
  const middle = await send('!ctumovimientos 2');
  assert.match(middle, /Página 2 de 3/);
  assert.match(middle, /Anterior: \*!ctumovimientos 1\*/);
  assert.match(middle, /Siguiente: \*!ctumovimientos 3\*/);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('numbered battle history pages keep detail links and never expose another player matches', async t => {
  let time = Date.parse('2026-10-11T20:00:00Z');
  const { game } = setup(t, { clock: () => new Date(time).toISOString() });
  const user = await register(game);
  const rival = await register(game, 'Lukas', '521111111111');
  await register(game, 'Ana', '521222222222');
  const panda = (await game.starter.claimStarter({ userId: user.id, choice: 'panda' })).unit;
  const wolf = (await game.starter.claimStarter({ userId: rival.id, choice: 'lobo' })).unit;
  await game.teams.setTeam({ userId: user.id, unitIds: [panda.id] });
  await game.teams.setTeam({ userId: rival.id, unitIds: [wolf.id] });
  for (let i = 0; i < 6; i++) {
    time += 1000;
    await game.battle.challenge({ userId: user.id, opponentId: rival.id, chatId: 'pagination@g.us' });
    await game.battle.accept({ userId: rival.id, chatId: 'pagination@g.us' });
    await game.battle.surrender({ userId: user.id, chatId: 'pagination@g.us' });
  }
  const send = messaging(game);
  assert.match(await send('!ctuhistorial'), /Siguiente: \*!ctuhistorial 2\*/);
  const second = await send('!ctuhistorial 2');
  assert.match(second, /Página 2 de 2/);
  assert.match(second, /Anterior: \*!ctuhistorial 1\*/);
  assert.doesNotMatch(second, /Siguiente:/);
  const detailCommand = second.match(/🔎 (!ctuhistorial BTL-[a-f0-9-]+)/)[1];
  assert.match(await send(detailCommand), /CHENGDÚ CARDS \| PARTIDA/);
  const outsider = '521222222222@s.whatsapp.net';
  assert.match(await send('!ctuhistorial', outsider), /Aún no tienes combates/);
  assert.match(await send('!ctuhistorial 2', outsider), /página no es válida/);
  assert.match(await send(detailCommand, outsider), /No participas/);
});
