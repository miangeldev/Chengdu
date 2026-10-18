import test from 'node:test';
import assert from 'node:assert/strict';
import { register, setup, readRecords } from './helpers.js';

const NOW = '2026-10-17T20:00:00.000Z';

async function contextFor(t, { teamSize = 1 } = {}) {
  let currentTime = NOW, sequence = 0;
  const context = setup(t, { storyContentVersion: 1, clock: () => currentTime, randomRoll: () => 0 });
  context.user = await register(context.game);
  context.rival = await register(context.game, 'Lukas', '521111111111');
  context.unit = (await context.game.starter.claimStarter({ userId: context.user.id, choice: 'panda' })).unit;
  context.rivalUnit = (await context.game.starter.claimStarter({ userId: context.rival.id, choice: 'lobo' })).unit;
  context.units = [context.unit];
  for (const characterId of ['mago_carmesi', 'lobo_sombrio'].slice(0, teamSize - 1)) context.units.push(await context.game.units.createUnit({
    ownerId: context.user.id, characterId, origin: { type: 'admin', sourceId: 'story-party-test' }, operationKey: `story-party:${characterId}` }));
  await context.game.teams.setTeam({ userId: context.user.id, unitIds: context.units.map(unit => unit.id) });
  await context.game.teams.setTeam({ userId: context.rival.id, unitIds: [context.rivalUnit.id] });
  context.key = name => `story-locks:${name}:${++sequence}`;
  context.setTime = time => { currentTime = time; };
  context.advance = milliseconds => { currentTime = new Date(Date.parse(currentTime) + milliseconds).toISOString(); };
  context.invoke = (kind, args = {}) => context.game.story[kind]({ userId: context.user.id, operationKey: context.key(kind), ...args });
  context.get = () => context.game.story.getState({ userId: context.user.id });
  return context;
}

async function readyTutorial(context) {
  await context.invoke('start');
  await context.invoke('choose', { choice: '1' });
  await context.invoke('continue');
  const state = await context.get();
  assert.equal(state.mission.code, 'P-03');
  assert.equal(state.progress.stage, 'ready');
  return state;
}

async function finishStoryFight(context) {
  for (let turn = 0; turn < 60; turn++) {
    const state = await context.get();
    if (state.battle?.status !== 'active') return state;
    const active = state.battle.team.find(unit => unit.active);
    const action = !state.battle.tutorial.attack ? 'attack'
      : !state.battle.tutorial.defend || state.battle.enemy.phase === 'unleash' ? 'defend'
        : active.attacks[1].ready ? 'skill' : 'attack';
    await context.invoke('act', { action, choice: action === 'attack' ? '1' : null });
  }
  assert.fail('Story encounter must finish');
}

async function openPvp(context, mode = 'classic') {
  const chatId = 'story-expiration-arena';
  await context.game.battle.challenge({ userId: context.user.id, opponentId: context.rival.id, chatId, mode });
  return (await context.game.battle.accept({ userId: context.rival.id, chatId })).battle;
}

for (const mode of ['classic', '1v1']) {
  test(`historia locks: PvP ${mode} vence dentro de continuar y libera la misma unidad para su snapshot`, async t => {
    const context = await contextFor(t);
    await readyTutorial(context);
    const before = await context.game.units.getUnit(context.unit.id);
    const duel = await openPvp(context, mode);
    context.setTime(duel.expiresAt);
    const started = await context.invoke('continue');
    assert.equal(started.progress.stage, 'battle');
    assert.equal(started.battle.team[0].level, before.progress.level);
    const expired = readRecords(context.directory, 'combates')[0];
    assert.equal(expired.status, 'expired');
    const receipts = readRecords(context.directory, 'recompensas');
    assert.equal(receipts.length, 2);
    assert.ok(receipts.every(receipt => receipt.reason === 'inactivity' && receipt.coins === 0 && receipt.unitXp === 0 && receipt.userXp === 0));
    const unit = await context.game.units.getUnit(context.unit.id);
    assert.deepEqual(unit.progress, before.progress);
    assert.equal(unit.lock.type, 'story');
    assert.equal(unit.lock.referenceId, started.progress.activeBattleId);
    assert.equal((await context.game.validateDatabase()).valid, true);
  });
}

test('historia locks: PvP expirado y premio de escena se publican juntos en su orden correcto', async t => {
  const context = await contextFor(t);
  await readyTutorial(context);
  await context.invoke('continue');
  await finishStoryFight(context);
  const state = await context.get();
  assert.equal(state.mission.code, 'P-04');
  const before = await context.game.units.getUnit(context.unit.id);
  const duel = await openPvp(context, '1v1');
  context.setTime(duel.expiresAt);
  const completed = await context.invoke('continue');
  assert.equal(completed.mission.code, 'I-01');
  assert.deepEqual(completed.reward.unitRewards[0].progressBefore, before.progress);
  assert.deepEqual(completed.reward.unitRewards[0].progressAfter, { level: 3, xp: 100 });
  const unit = await context.game.units.getUnit(context.unit.id);
  assert.equal(unit.lock, null);
  const movements = readRecords(context.directory, 'economia');
  assert.deepEqual(movements.slice(-3).map(row => row.sourceType), ['battle_reward', 'battle_reward', 'story_reward']);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('historia locks: un anuncio vencido permite recuperar automáticamente el único compañero', async t => {
  const context = await contextFor(t);
  await readyTutorial(context);
  const listing = await context.game.market.createListing({ sellerId: context.user.id, unitId: context.unit.id, price: 50, operationKey: context.key('listing') });
  assert.deepEqual((await context.game.users.getUser(context.user.id)).team, []);
  context.setTime(listing.listing.expiresAt);
  const started = await context.invoke('continue');
  assert.equal(started.battle.team[0].id, context.unit.id);
  assert.equal(readRecords(context.directory, 'mercado')[0].status, 'expired');
  assert.deepEqual((await context.game.users.getUser(context.user.id)).team, [context.unit.id]);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('historia locks: intercambio vencido devuelve reservas y permite empezar con tres compañeros', async t => {
  const context = await contextFor(t, { teamSize: 3 });
  await readyTutorial(context);
  const chatId = 'story-expiration-trade';
  const created = await context.game.trades.create({ userId: context.user.id, opponentId: context.rival.id, chatId, operationKey: context.key('trade') });
  await context.game.trades.setOffer({ userId: context.user.id, code: created.trade.code, chatId, unitIds: [context.unit.id], coins: 10, operationKey: context.key('offer') });
  const locked = await context.game.trades.confirm({ userId: context.user.id, code: created.trade.code, chatId, operationKey: context.key('confirm') });
  assert.equal(locked.trade.status, 'locked');
  await assert.rejects(context.invoke('continue'), { code: 'UNIT_LOCKED' });
  assert.equal((await context.get()).progress.stage, 'ready');
  assert.equal(readRecords(context.directory, 'combateshistoria').length, 0);
  context.setTime(locked.trade.expiresAt);
  const started = await context.invoke('continue');
  assert.equal(started.battle.team.length, 3);
  assert.equal(readRecords(context.directory, 'intercambios')[0].status, 'expired');
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, 20);
  for (const unit of context.units) assert.equal((await context.game.units.getUnit(unit.id)).lock.type, 'story');
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('historia locks: los tres expedicionarios pueden cambiarse y quedan protegidos de mercado, intercambios y evolución', async t => {
  const context = await contextFor(t, { teamSize: 3 });
  await readyTutorial(context);
  await context.invoke('continue');
  const chatId = 'story-locked-trade';
  const created = await context.game.trades.create({ userId: context.user.id, opponentId: context.rival.id, chatId, operationKey: context.key('trade') });
  for (const unit of context.units) {
    await assert.rejects(context.game.market.createListing({ sellerId: context.user.id, unitId: unit.id, price: 50, operationKey: context.key('listing') }), { code: 'UNIT_LOCKED' });
    await assert.rejects(context.game.trades.setOffer({ userId: context.user.id, code: created.trade.code, chatId, unitIds: [unit.id], operationKey: context.key('offer') }), { code: 'UNIT_LOCKED' });
    await assert.rejects(context.game.evolution.evolve({ userId: context.user.id, unitId: unit.id, operationKey: context.key('evolve') }), { code: 'UNIT_LOCKED' });
  }
  await assert.rejects(context.game.teams.setTeam({ userId: context.user.id, unitIds: [context.unit.id] }), { code: 'TEAM_LOCKED' });
  await assert.rejects(context.game.battle.challenge({ userId: context.user.id, opponentId: context.rival.id, chatId }), { code: 'UNIT_LOCKED' });
  assert.equal(readRecords(context.directory, 'mercado').length, 0);
  assert.equal(readRecords(context.directory, 'evoluciones').length, 0);
  const second = await context.invoke('act', { action: 'switch', choice: '2' });
  assert.equal(second.battle.team.find(unit => unit.active).id, context.units[1].id);
  const third = await context.invoke('act', { action: 'switch', choice: '3' });
  assert.equal(third.battle.team.find(unit => unit.active).id, context.units[2].id);
  await finishStoryFight(context);
  const rewarded = (await context.get()).reward;
  assert.equal(rewarded, null);
  const receipt = readRecords(context.directory, 'premioshistoria').find(row => row.missionCode === 'P-03');
  assert.equal(receipt.unitRewards.length, 3);
  assert.ok(receipt.unitRewards.every(reward => reward.xp === 220));
  for (const original of context.units) {
    const unit = await context.game.units.getUnit(original.id);
    assert.deepEqual(unit.progress, { level: 3, xp: 20 });
    assert.equal(unit.lock, null);
    assert.equal(unit.serial, original.serial);
  }
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('historia locks: expirar un intercambio al completar una escena devuelve monedas y concede XP juntos', async t => {
  const context = await contextFor(t);
  await readyTutorial(context);
  await context.invoke('continue');
  await finishStoryFight(context);
  assert.equal((await context.get()).mission.code, 'P-04');
  const chatId = 'story-scene-trade';
  const created = await context.game.trades.create({ userId: context.user.id, opponentId: context.rival.id, chatId, operationKey: context.key('trade') });
  await context.game.trades.setOffer({ userId: context.user.id, code: created.trade.code, chatId, unitIds: [context.unit.id], coins: 10, operationKey: context.key('offer') });
  const locked = await context.game.trades.confirm({ userId: context.user.id, code: created.trade.code, chatId, operationKey: context.key('confirm') });
  context.setTime(locked.trade.expiresAt);
  const next = await context.invoke('continue');
  assert.equal(next.mission.code, 'I-01');
  assert.equal(next.reward.unitRewards[0].xp, 80);
  assert.equal((await context.game.units.getUnit(context.unit.id)).lock, null);
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, 100);
  assert.equal(readRecords(context.directory, 'intercambios')[0].status, 'expired');
  assert.equal((await context.game.validateDatabase()).valid, true);
});
