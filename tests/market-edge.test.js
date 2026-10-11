import test from 'node:test';
import assert from 'node:assert/strict';
import { readRecords, register, setup } from './helpers.js';

async function startBattle(game, challenger, recipient, chatId) {
  await game.battle.challenge({ userId: challenger.id, opponentId: recipient.id, chatId });
  return (await game.battle.accept({ userId: recipient.id, chatId })).battle;
}

async function combatant(game, name, number, choice) {
  const user = await register(game, name, number);
  const unit = (await game.starter.claimStarter({ userId: user.id, choice })).unit;
  await game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  return { user, unit };
}

test('selling a spare unit while both owners fight preserves both active teams and combat snapshots', async t => {
  const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z', randomRoll: () => 0 });
  const seller = await combatant(c.game, 'Miguel', '521999999999', 'panda');
  const buyer = await combatant(c.game, 'Lukas', '521111111111', 'lobo');
  const sellerOpponent = await combatant(c.game, 'Ana', '521222222222', 'mago');
  const buyerOpponent = await combatant(c.game, 'Carlos', '521333333333', 'panda');
  const spare = await c.game.units.createUnit({ ownerId: seller.user.id, characterId: 'monje_celestial',
    origin: { type: 'admin', sourceId: 'market-edge' }, operationKey: 'spare-mint' });
  await c.game.economy.claimDaily({ userId: buyer.user.id, operationKey: 'buyer-funds' });
  const sellerBattle = await startBattle(c.game, seller.user, sellerOpponent.user, 'seller-arena');
  const buyerBattle = await startBattle(c.game, buyer.user, buyerOpponent.user, 'buyer-arena');
  await assert.rejects(c.game.market.createListing({ sellerId: seller.user.id, unitId: seller.unit.id,
    price: 50, operationKey: 'equipped-offer' }), { code: 'UNIT_LOCKED' });
  const { listing } = await c.game.market.createListing({ sellerId: seller.user.id, unitId: spare.id,
    price: 50, operationKey: 'spare-offer' });
  const result = await c.game.market.buyListing({ buyerId: buyer.user.id, listingId: listing.id,
    operationKey: 'spare-purchase' });
  assert.equal(result.unit.ownerId, buyer.user.id);
  assert.equal(result.unit.ownershipVersion, 1);
  assert.equal(result.unit.lock, null);
  assert.deepEqual((await c.game.users.getUser(seller.user.id)).team, [seller.unit.id]);
  assert.deepEqual((await c.game.users.getUser(buyer.user.id)).team, [buyer.unit.id]);
  assert.equal((await c.game.economy.getBalance(seller.user.id)).coins, 47);
  assert.equal((await c.game.economy.getBalance(buyer.user.id)).coins, 50);
  for (const [userId, chatId, battle] of [
    [seller.user.id, 'seller-arena', sellerBattle], [buyer.user.id, 'buyer-arena', buyerBattle]
  ]) {
    assert.deepEqual(await c.game.battle.getMyBattle({ userId, chatId }), battle);
    const next = await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '1' });
    assert.equal(next.battle.status, 'active');
    assert.equal(next.battle.turnNumber, 2);
  }
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('an unlocked secondary unit in a legacy three-unit team cannot be listed during its owner battle', async t => {
  const c = setup(t, { clock: () => '2026-10-11T20:00:00.000Z' });
  const owner = await combatant(c.game, 'Miguel', '521999999999', 'panda');
  const opponent = await combatant(c.game, 'Lukas', '521111111111', 'lobo');
  const secondary = [];
  for (const characterId of ['mago_carmesi', 'monje_celestial']) {
    secondary.push(await c.game.units.createUnit({ ownerId: owner.user.id, characterId,
      origin: { type: 'admin', sourceId: 'market-edge' }, operationKey: `legacy-mint:${characterId}` }));
  }
  // The stored schema still permits teams inherited from the three-unit MVP.
  await c.storage.withTransaction(async repos => {
    const user = await repos.users.get(owner.user.id);
    await repos.users.replace({ ...user, team: [owner.unit.id, ...secondary.map(unit => unit.id)] });
  });
  const battle = await startBattle(c.game, owner.user, opponent.user, 'legacy-arena');
  const collections = ['usuarios', 'unidades', 'combates', 'mercado', 'ventas', 'eventos', 'economia'];
  const before = Object.fromEntries(collections.map(name => [name, readRecords(c.directory, name)]));
  for (const unit of secondary) {
    assert.equal((await c.game.units.getUnit(unit.id)).lock, null);
    await assert.rejects(c.game.market.createListing({ sellerId: owner.user.id, unitId: unit.id,
      price: 20, operationKey: `legacy-offer:${unit.id}` }), { code: 'TEAM_LOCKED' });
  }
  assert.deepEqual(Object.fromEntries(collections.map(name => [name, readRecords(c.directory, name)])), before);
  assert.deepEqual(await c.game.battle.getMyBattle({ userId: owner.user.id, chatId: 'legacy-arena' }), battle);
  await c.game.battle.surrender({ userId: owner.user.id, chatId: 'legacy-arena' });
  const { listing } = await c.game.market.createListing({ sellerId: owner.user.id, unitId: secondary[0].id,
    price: 20, operationKey: 'legacy-after-battle' });
  assert.equal(listing.status, 'active');
  assert.deepEqual((await c.game.users.getUser(owner.user.id)).team, [owner.unit.id, secondary[1].id]);
  assert.equal((await c.game.validateDatabase()).valid, true);
});
