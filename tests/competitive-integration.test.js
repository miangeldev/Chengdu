import test from 'node:test';
import assert from 'node:assert/strict';
import { seasonDefinition } from '../game/competitive/policy.js';
import { readRecords, register, setup } from './helpers.js';

async function fixture(t) {
  let now = '2026-10-13T20:00:00.000Z';
  const c = setup(t, { clock: () => now, randomRoll: () => 0, randomDropInt: () => 0 });
  const a = await register(c.game);
  const b = await register(c.game, 'Lukas', '521111111111');
  for (const [user, choice] of [[a, 'panda'], [b, 'lobo']]) {
    const { unit } = await c.game.starter.claimStarter({ userId: user.id, choice });
    await c.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  }
  return { ...c, a, b, chatId: 'competitive-boundary@g.us', setTime(value) { now = value; } };
}

test('ranked requires advanced rules and challenge replays cannot change between casual and competitive', async t => {
  const c = await fixture(t);
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId,
    ranked: true, mode: 'classic' }), { code: 'RANKED_ADVANCED_ONLY' });
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId,
    ranked: 'true' }), { code: 'INVALID_RANKED_MODE' });
  const casual = await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId,
    mode: 'auto', operationKey: 'casual-challenge' });
  assert.equal(casual.battle.competitive, undefined);
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId,
    mode: 'auto', ranked: true, operationKey: 'casual-challenge' }), { code: 'OPERATION_CONFLICT' });
  await c.game.battle.closeChallenge({ userId: c.a.id, chatId: c.chatId });
  const ranked = await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId,
    ranked: true, operationKey: 'ranked-challenge' });
  assert.equal(ranked.battle.rulesVersion, 2);
  assert.equal(ranked.battle.competitive.seasonCode, 'T1');
  await assert.rejects(c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId,
    mode: 'auto', operationKey: 'ranked-challenge' }), { code: 'OPERATION_CONFLICT' });
});

test('a ranked invitation near season end expires at the boundary without locks, Elo or a result receipt', async t => {
  const c = await fixture(t);
  const end = seasonDefinition(1).endsAt;
  c.setTime(new Date(Date.parse(end) - 30_000).toISOString());
  const { battle } = await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id,
    chatId: c.chatId, ranked: true });
  assert.equal(battle.expiresAt, end);
  c.setTime(end);
  await assert.rejects(c.game.battle.accept({ userId: c.b.id, chatId: c.chatId }), { code: 'BATTLE_NOT_FOUND' });
  const expired = await c.game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId });
  assert.equal(expired.status, 'expired');
  assert.equal(expired.finishReason, 'challenge_timeout');
  assert.equal(expired.acceptedAt, null);
  assert.equal(readRecords(c.directory, 'resultadoscompetitivos').length, 0);
  assert.ok(readRecords(c.directory, 'unidades').every(unit => unit.lock === null));
  assert.ok(readRecords(c.directory, 'clasificacion').every(rank => rank.rating === 1000));
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('ranked turn deadlines and their replay stay bounded by the season; cutoff does not penalize either player', async t => {
  const c = await fixture(t);
  const end = seasonDefinition(1).endsAt;
  c.setTime(new Date(Date.parse(end) - 30_000).toISOString());
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, ranked: true });
  let { battle } = await c.game.battle.accept({ userId: c.b.id, chatId: c.chatId });
  assert.equal(battle.expiresAt, end);
  c.setTime(new Date(Date.parse(end) - 20_000).toISOString());
  ({ battle } = await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '1' }));
  assert.equal(battle.status, 'active');
  assert.equal(battle.expiresAt, end);
  const awaitingPlayer = battle.turnUserId;
  c.setTime(end);
  await assert.rejects(c.game.battle.attack({ userId: awaitingPlayer, chatId: c.chatId, choice: '1' }), { code: 'BATTLE_NOT_FOUND' });
  battle = await c.game.battle.getMyBattle({ userId: c.a.id, chatId: c.chatId });
  assert.equal(battle.status, 'expired');
  assert.equal(battle.competitive.settlement.reason, 'season_closed');
  assert.ok(battle.competitive.settlement.players.every(player => player.delta === 0));
  assert.ok(readRecords(c.directory, 'clasificacion').every(rank => rank.rating === 1000 && rank.penalties === 0));
  assert.ok(readRecords(c.directory, 'unidades').every(unit => unit.lock === null));
  await c.game.close();
  const reopened = c.open().game;
  assert.equal((await reopened.validateDatabase()).valid, true);
  const current = await reopened.competitive.getSeason();
  assert.equal(current.code, 'T2');
  assert.equal((await reopened.competitive.getSeason({ seasonCode: 'T1' })).status, 'closed');
});

test('ordinary inactivity penalizes the pending actor once, without awarding their opponent', async t => {
  const c = await fixture(t);
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, ranked: true });
  const { battle } = await c.game.battle.accept({ userId: c.b.id, chatId: c.chatId });
  const idleUserId = battle.turnUserId;
  c.setTime(battle.expiresAt);
  assert.equal(await c.game.battle.sweepExpired(), 1);
  assert.equal(await c.game.battle.sweepExpired(), 0);
  const receipts = readRecords(c.directory, 'resultadoscompetitivos');
  assert.equal(receipts.length, 1);
  assert.equal(receipts[0].reason, 'inactivity');
  assert.equal(receipts[0].idleUserId, idleUserId);
  assert.equal(receipts[0].players.find(player => player.userId === idleUserId).delta, -16);
  assert.equal(receipts[0].players.find(player => player.userId !== idleUserId).delta, 0);
  assert.ok(readRecords(c.directory, 'clasificacion').every(rank => rank.matches === 0));
  assert.equal((await c.game.validateDatabase()).valid, true);
});
