import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS } from '../storage/validation.js';
import { readRecords, register, setup } from './helpers.js';

const contents = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  fs.readFileSync(path.join(directory, `${name}.json`), 'utf8')
]));

test('concurrent daily deliveries credit once, share one cooldown and preserve their original receipt across time and restart', async t => {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const user = await register(c.game);
  const request = { userId: user.id, operationKey: 'daily-message' };
  assert.deepEqual(await c.game.economy.getDailyStatus(user.id), {
    available: true, amount: 100, cooldownMs: 86_400_000, nextClaimAt: null
  });
  const delivered = await Promise.all([c.game.economy.claimDaily(request), c.game.economy.claimDaily(request)]);
  assert.deepEqual(delivered.map(result => result.alreadyClaimed), [false, true]);
  const first = delivered[0].claim;
  assert.deepEqual(first, delivered[1].claim);
  assert.equal(first.amount, 100);
  assert.equal(first.nextClaimAt, '2026-10-12T20:00:00.000Z');
  assert.deepEqual((await c.game.users.getUser(user.id)).progress, user.progress);
  const before = contents(c.directory);
  await assert.rejects(c.game.economy.claimDaily({ ...request, operationKey: 'another-message' }), { code: 'DAILY_NOT_READY' });
  assert.deepEqual(contents(c.directory), before);
  now = '2026-10-12T19:59:59.999Z';
  assert.equal((await c.game.economy.getDailyStatus(user.id)).available, false);
  await assert.rejects(c.game.economy.claimDaily({ ...request, operationKey: 'early' }), { code: 'DAILY_NOT_READY' });
  now = first.nextClaimAt;
  assert.equal((await c.game.economy.getDailyStatus(user.id)).available, true);
  const races = await Promise.allSettled(['day-2-a', 'day-2-b'].map(operationKey => c.game.economy.claimDaily({ ...request, operationKey })));
  assert.equal(races.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(races.find(result => result.status === 'rejected').reason.code, 'DAILY_NOT_READY');
  now = '2026-10-15T20:00:00.000Z';
  await c.game.close();
  c.game = c.open().game;
  const persisted = contents(c.directory);
  const replay = await c.game.economy.claimDaily(request);
  assert.equal(replay.alreadyClaimed, true);
  assert.deepEqual(replay.claim, first);
  assert.deepEqual(contents(c.directory), persisted);
  assert.equal((await c.game.economy.getBalance(user.id)).coins, 200);
  assert.equal(readRecords(c.directory, 'diarios').length, 2);
  assert.equal(readRecords(c.directory, 'economia').length, 2);
});

test('daily rejects cross-user message reuse, invalid keys, a reversed clock and unrepresentable dates without changing money', async t => {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const user = await register(c.game);
  const other = await register(c.game, 'Lukas', '521111111111');
  const request = { userId: user.id, operationKey: 'original' };
  await c.game.economy.claimDaily(request);
  const before = contents(c.directory);
  await assert.rejects(c.game.economy.claimDaily({ ...request, userId: other.id }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.economy.claimDaily({ ...request, userId: 'missing' }), { code: 'USER_NOT_FOUND' });
  for (const operationKey of ['', ' key ', null, 'x'.repeat(201)]) {
    await assert.rejects(c.game.economy.claimDaily({ ...request, operationKey }), { code: 'INVALID_OPERATION_KEY' });
  }
  now = '2026-10-10T20:00:00.000Z';
  await assert.rejects(c.game.economy.claimDaily({ ...request, operationKey: 'clock-backward' }), { code: 'DAILY_NOT_READY' });
  for (const invalid of ['invalid-clock', '2026-02-30T00:00:00Z', '2026-10-11T24:00:00Z']) {
    now = invalid;
    await assert.rejects(c.game.economy.claimDaily({ userId: other.id, operationKey: 'clock-invalid' }), { code: 'INVALID_CLOCK' });
  }
  now = 'invalid-clock';
  // Replays do not consult the clock and remain available during a clock fault.
  assert.equal((await c.game.economy.claimDaily(request)).alreadyClaimed, true);
  now = '9999-12-31T20:00:00.000Z';
  await assert.rejects(c.game.economy.claimDaily({ userId: other.id, operationKey: 'date-overflow' }), { code: 'INVALID_CLOCK' });
  assert.deepEqual(contents(c.directory), before);
});

test('five genuine daily rewards fund a pack, and wallet totals and paginated movements reconcile all sources without exposing other users', async t => {
  let time = Date.parse('2026-10-11T20:00:00.000Z');
  const c = setup(t, { clock: () => new Date(time).toISOString(), randomDropInt: () => 0, randomRoll: () => 0 });
  const user = await register(c.game);
  const other = await register(c.game, 'Lukas', '521111111111');
  const originals = [];
  for (let day = 0; day < 5; day++) {
    const result = await c.game.economy.claimDaily({ userId: user.id, operationKey: `day-${day}` });
    originals.push(result.claim);
    await c.game.economy.claimDaily({ userId: other.id, operationKey: `other-day-${day}` });
    time += 86_400_000;
  }
  assert.deepEqual(await c.game.economy.getBalance(user.id), { coins: 500, income: '500', expenses: '0', openingBalance: 0 });
  const opened = await c.game.packs.openPack({ userId: user.id, packId: 'basico', operationKey: 'paid-pack' });
  assert.equal(opened.opening.balanceAfter, 0);
  assert.deepEqual(await c.game.economy.getBalance(user.id), { coins: 0, income: '500', expenses: '500', openingBalance: 0 });
  assert.deepEqual((await c.game.users.getUser(user.id)).progress, user.progress);
  const firstPage = await c.game.economy.getMovements(user.id, { limit: 2 });
  assert.equal(firstPage.items[0].sourceType, 'pack_opening');
  assert.equal(firstPage.items[1].sourceId, originals[4].id);
  await assert.rejects(c.game.economy.getMovements(other.id, { cursor: firstPage.nextCursor }), { code: 'INVALID_CURSOR' });
  // A new credit sorts before an existing cursor; subsequent pages remain stable.
  await c.game.economy.claimDaily({ userId: user.id, operationKey: 'new-credit' });
  const all = [...firstPage.items];
  let cursor = firstPage.nextCursor;
  while (cursor !== null) {
    const page = await c.game.economy.getMovements(user.id, { limit: 2, cursor });
    all.push(...page.items);
    cursor = page.nextCursor;
  }
  assert.equal(all.length, 6);
  assert.equal(new Set(all.map(movement => movement.id)).size, 6);
  assert.ok(all.every(movement => movement.userId === user.id));
  assert.deepEqual(all.slice(1).map(movement => movement.sourceId), originals.toReversed().map(claim => claim.id));
  const replay = await c.game.economy.claimDaily({ userId: user.id, operationKey: 'day-0' });
  assert.equal(replay.claim.balanceAfter, 100);
  assert.equal(replay.alreadyClaimed, true);
  assert.deepEqual(await c.game.economy.getBalance(user.id), { coins: 100, income: '600', expenses: '500', openingBalance: 0 });
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('daily credits, pack debits and battle rewards share one balance chain while daily leaves unit XP intact', async t => {
  let time = Date.parse('2026-10-11T20:00:00.000Z');
  const c = setup(t, { clock: () => new Date(time).toISOString(), randomDropInt: () => 0, randomRoll: () => 0 });
  const user = await register(c.game);
  const other = await register(c.game, 'Lukas', '521111111111');
  const panda = (await c.game.starter.claimStarter({ userId: user.id, choice: 'panda' })).unit;
  const wolf = (await c.game.starter.claimStarter({ userId: other.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: user.id, unitIds: [panda.id] });
  await c.game.teams.setTeam({ userId: other.id, unitIds: [wolf.id] });
  for (let day = 0; day < 5; day++) {
    await c.game.economy.claimDaily({ userId: user.id, operationKey: `fund-${day}` });
    time += 86_400_000;
  }
  await c.game.packs.openPack({ userId: user.id, packId: 'basico', operationKey: 'opening' });
  assert.deepEqual((await c.game.units.getUnit(panda.id)).progress, panda.progress);
  await c.game.battle.challenge({ userId: user.id, opponentId: other.id, chatId: 'economy-arena' });
  let battle = (await c.game.battle.accept({ userId: other.id, chatId: 'economy-arena' })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: 'economy-arena', choice: '2' })).battle;
  assert.equal(battle.winnerId, user.id);
  assert.deepEqual(await c.game.economy.getBalance(user.id), { coins: 120, income: '620', expenses: '500', openingBalance: 0 });
  assert.deepEqual((await c.game.units.getUnit(panda.id)).progress, { level: 1, xp: 35 });
  assert.equal((await c.game.validateDatabase()).valid, true);
  await c.game.close();
  const restarted = c.open().game;
  assert.deepEqual(await restarted.economy.getBalance(user.id), { coins: 120, income: '620', expenses: '500', openingBalance: 0 });
});
