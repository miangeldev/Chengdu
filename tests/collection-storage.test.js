import test from 'node:test';
import assert from 'node:assert/strict';
import { readRecords, register, setup } from './helpers.js';

async function fundedCollection(t) {
  const c = setup(t, { randomRoll: () => 0 });
  const a = await register(c.game);
  const b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  const chatId = 'collection-audit-arena';
  async function win() {
    await c.game.battle.challenge({ userId: a.id, opponentId: b.id, chatId });
    let battle = (await c.game.battle.accept({ userId: b.id, chatId })).battle;
    while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId, choice: '2' })).battle;
    assert.equal(battle.winnerId, a.id);
    return battle;
  }
  await win();
  await c.storage.withTransaction(async repos => {
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, price: 100, revision: pack.revision + 1 });
  });
  const result = await c.game.packs.openPack({ userId: a.id, packId: 'basico', operationKey: 'audit-opening' });
  return { ...c, a, b, ua, ub, result, win };
}

test('the coin ledger replays battle credits and pack debits while XP remains independent', async t => {
  const c = await fundedCollection(t);
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 20);
  await c.win();
  const user = await c.game.users.getUser(c.a.id);
  assert.equal(user.economy.coins, 140);
  assert.deepEqual(user.progress, { level: 1, xp: 70 });
  assert.deepEqual(readRecords(c.directory, 'economia').filter(m => m.userId === c.a.id).map(m => [m.type, m.amount, m.balanceBefore, m.balanceAfter]), [
    ['credit', 120, 0, 120], ['debit', 100, 120, 20], ['credit', 120, 20, 140]
  ]);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('coin movements, pack receipts and unit birth collectibles cannot be rewritten', async t => {
  const c = await fundedCollection(t);
  const mutations = [
    async repos => { const u = await repos.users.get(c.a.id); await repos.users.replace({ ...u, economy: { coins: u.economy.coins + 1 } }); },
    async repos => { const m = await repos.economy.find(m => m.sourceType === 'pack_opening'); await repos.economy.replace({ ...m, amount: m.amount - 1 }); },
    async repos => { const m = await repos.economy.find(m => m.sourceType === 'battle_reward'); await repos.economy.replace({ ...m, type: 'debit' }); },
    async repos => { const o = await repos.openings.get(c.result.opening.id); await repos.openings.replace({ ...o, operationKey: 'changed-key' }); },
    async repos => { const u = await repos.units.get(c.result.unit.id); await repos.units.replace({ ...u, traitVersion: 0 }); },
    async repos => { const pack = await repos.packs.get('basico'); await repos.packs.replace({ ...pack, name: 'Nombre nuevo' }); },
    async repos => { const baseline = await repos.state.get(`progression:${c.a.id}`); await repos.state.replace({ ...baseline, coins: 1 }); }
  ];
  for (const mutation of mutations) await assert.rejects(c.storage.withTransaction(mutation), { code: 'DATABASE_CORRUPT' });
  assert.equal((await c.game.economy.getBalance(c.a.id)).coins, 20);
  assert.equal(readRecords(c.directory, 'aperturas').length, 1);
  assert.equal(readRecords(c.directory, 'economia').length, 3);
  assert.equal((await c.game.validateDatabase()).valid, true);
});
