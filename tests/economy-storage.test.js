import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { COLLECTIONS, validateDatabase, validateTransition } from '../storage/validation.js';
import { nextDailyAt } from '../game/economy/dailyPolicy.js';
import { pendingRecords, readRecords, register, setup } from './helpers.js';

const databaseState = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

test('daily awards and pack debits share the audited balance while leaving XP and level intact', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const c = setup(t, { clock: () => now, randomDropInt: () => 0 });
  const user = await register(c.game);
  await c.game.economy.claimDaily({ userId: user.id, operationKey: 'day-one' });
  now = '2026-10-12T10:00:00.000Z';
  await c.game.economy.claimDaily({ userId: user.id, operationKey: 'day-two' });
  await c.storage.withTransaction(async repos => {
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, price: 150, revision: pack.revision + 1 });
  });
  await c.game.packs.openPack({ userId: user.id, packId: 'basico', operationKey: 'daily-funded-pack' });
  assert.equal((await c.game.economy.getBalance(user.id)).coins, 50);
  assert.deepEqual((await c.game.users.getUser(user.id)).progress, { level: 1, xp: 0 });
  assert.deepEqual(readRecords(c.directory, 'economia').map(m => [m.sourceType, m.type, m.amount, m.balanceBefore, m.balanceAfter]), [
    ['daily_reward', 'credit', 100, 0, 100], ['daily_reward', 'credit', 100, 100, 200], ['pack_opening', 'debit', 150, 200, 50]
  ]);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('daily source validation rejects missing versions, forged policies, duplicate keys and early chronological claims', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const user = await register(c.game);
  await c.game.economy.claimDaily({ userId: user.id, operationKey: 'first-valid' });
  now = '2026-10-12T10:00:00.000Z';
  await c.game.economy.claimDaily({ userId: user.id, operationKey: 'second-valid' });
  const before = databaseState(c.directory);
  const mutations = [
    state => { delete state.diarios.records[0].policyVersion; },
    state => { state.diarios.records[0].policyVersion = '1'; },
    state => { state.diarios.records[0].policyVersion = 2; },
    state => { state.diarios.records[0].operationKey = ' first-valid'; },
    state => { state.diarios.records[1].operationKey = state.diarios.records[0].operationKey; },
    state => { state.diarios.records[0].amount = 101; },
    state => { state.diarios.records[0].cooldownMs = 1; },
    state => { state.diarios.records[0].nextClaimAt = state.diarios.records[0].createdAt; },
    state => {
      const claim = state.diarios.records[1];
      claim.createdAt = '2026-10-12T09:59:59.999Z';
      claim.nextClaimAt = nextDailyAt(claim.createdAt);
      state.economia.records.find(m => m.sourceId === claim.id).createdAt = claim.createdAt;
    },
    state => { state.economia.records.pop(); },
    state => { state.diarios.records.pop(); },
    state => { state.economia.records[0].sourceType = 'battle_reward'; },
    state => { state.economia.records[0].type = 'debit'; },
    state => { state.usuarios.records[0].economy.coins++; },
    state => {
      const original = state.diarios.records[0];
      const forged = { ...original, id: `DAILY-${randomUUID()}`, operationKey: 'extra-early', balanceBefore: 200, balanceAfter: 300 };
      state.diarios.records.push(forged);
      state.economia.records.push({ id: `coin:${forged.id}`, userId: forged.userId, type: 'credit', sourceType: 'daily_reward',
        sourceId: forged.id, amount: 100, balanceBefore: 200, balanceAfter: 300, createdAt: forged.createdAt });
      state.usuarios.records[0].economy.coins = 300;
    }
  ];
  for (const mutation of mutations) {
    const state = structuredClone(before);
    mutation(state);
    assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
  }
  assert.deepEqual(databaseState(c.directory), before);
});

test('daily receipts and movements remain append-only even for otherwise valid metadata changes', async t => {
  const c = setup(t, { clock: () => '2026-10-11T10:00:00.000Z' });
  const user = await register(c.game);
  const { claim } = await c.game.economy.claimDaily({ userId: user.id, operationKey: 'immutable-daily' });
  const before = databaseState(c.directory);
  await assert.rejects(c.storage.withTransaction(async repos => {
    await repos.dailyClaims.replace({ ...claim, operationKey: 'new-valid-key' });
  }), { code: 'DATABASE_CORRUPT' });
  await assert.rejects(c.storage.withTransaction(async repos => {
    const movement = (await repos.economy.all())[0];
    await repos.economy.replace({ ...movement, extra: 'untracked edit' });
  }), { code: 'DATABASE_CORRUPT' });
  assert.deepEqual(databaseState(c.directory), before);
  const other = await register(c.game, 'Lukas', '521111111111');
  await c.game.economy.claimDaily({ userId: other.id, operationKey: 'other-immutable-daily' });
  const ordered = databaseState(c.directory);
  for (const name of ['diarios', 'economia']) {
    const reversed = structuredClone(ordered);
    reversed[name].records.reverse();
    assert.equal(validateDatabase(reversed).valid, true);
    assert.throws(() => validateTransition(ordered, reversed), { code: 'DATABASE_CORRUPT' });
  }
});

test('clock reversal and unrepresentable cooldown dates never publish a daily award', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const c = setup(t, { clock: () => now });
  const user = await register(c.game);
  await c.game.economy.claimDaily({ userId: user.id, operationKey: 'before-clock-change' });
  const before = databaseState(c.directory);
  now = '2026-10-10T10:00:00.000Z';
  await assert.rejects(c.game.economy.claimDaily({ userId: user.id, operationKey: 'clock-backwards' }), { code: 'DAILY_NOT_READY' });
  for (const invalid of ['not-a-clock', '+275760-09-13T00:00:00.000Z', '9999-12-31T23:59:59.999Z']) {
    now = invalid;
    await assert.rejects(c.game.economy.claimDaily({ userId: user.id, operationKey: `invalid-clock-${invalid}` }), { code: 'INVALID_CLOCK' });
  }
  assert.deepEqual(databaseState(c.directory), before);
});

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:economia.json', 'published:diarios.json', 'published:_database.json']) {
  test(`daily receipt and coin credit recover atomically at ${stage}`, async t => {
    const c = setup(t, { clock: () => '2026-10-11T10:00:00.000Z' });
    const user = await register(c.game);
    const request = { userId: user.id, operationKey: 'interrupted-daily' };
    await c.game.close();
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('interrupted daily award'); } }).game;
    await assert.rejects(failed.economy.claimDaily(request), { code: 'STORAGE_WRITE_FAILED' });
    const journal = JSON.parse(fs.readFileSync(path.join(c.directory, '_journal.json'), 'utf8'));
    const attempted = pendingRecords(c.directory, journal, 'diarios')[0];
    await failed.close();
    const game = c.open().game;
    const committed = stage !== 'prepared';
    assert.equal((await game.economy.getBalance(user.id)).coins, committed ? 100 : 0);
    assert.equal(readRecords(c.directory, 'diarios').length, committed ? 1 : 0);
    assert.equal(readRecords(c.directory, 'economia').length, committed ? 1 : 0);
    const replay = await game.economy.claimDaily(request);
    assert.equal(replay.alreadyClaimed, committed);
    if (committed) assert.deepEqual(replay.claim, attempted);
    else assert.notEqual(replay.claim.id, attempted.id);
    assert.equal((await game.economy.getBalance(user.id)).coins, 100);
    assert.equal(readRecords(c.directory, 'diarios').length, 1);
    assert.equal(readRecords(c.directory, 'economia').length, 1);
    assert.equal((await game.validateDatabase()).valid, true);
  });
}
