import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { setup, register, readRecords } from './helpers.js';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { validateStoryData } from '../storage/storyValidation.js';
import { getStoryMission, storyMissions } from '../game/story/catalog.js';

const NOW = '2026-10-17T20:00:00.000Z';
const stateOf = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));
const filesOf = directory => Object.fromEntries([...COLLECTIONS.map(name => `${name}.json`), '_database.json']
  .map(filename => [filename, fs.readFileSync(path.join(directory, filename), 'utf8')]));

async function contextFor(t, version = 1) {
  let now = NOW, sequence = 0;
  const context = setup(t, { clock: () => now, randomRoll: () => 30, storyContentVersion: version });
  context.user = await register(context.game);
  context.unit = (await context.game.starter.claimStarter({ userId: context.user.id, choice: 'panda' })).unit;
  context.setTime = value => { now = value; };
  context.invoke = (kind, args = {}) => context.game.story[kind]({ userId: context.user.id,
    operationKey: `upgrade-fixture:${++sequence}`, ...args });
  context.get = () => context.game.story.getState({ userId: context.user.id });
  return context;
}

async function step(context, state) {
  if (!state.progress) return context.invoke('start');
  if (state.progress.stage === 'choice') return context.invoke('choose', { choice: '1' });
  if (state.progress.stage === 'defeated') return context.invoke('retry');
  if (state.progress.stage !== 'battle') return context.invoke('continue');
  const active = state.battle.team.find(unit => unit.active);
  const action = !state.battle.tutorial.attack ? 'attack' :
    !state.battle.tutorial.defend || state.battle.enemy.phase === 'unleash' ? 'defend' :
      active.attacks[1].ready ? 'skill' : 'attack';
  return context.invoke('act', { action, choice: action === 'attack' ? '1' : null });
}

async function advanceUntil(context, done) {
  let state = await context.get();
  for (let index = 0; index < 160 && !done(state); index++) state = await step(context, state);
  assert.ok(done(state), 'Story checkpoint must remain reachable with the original common starter');
  return state;
}

async function openCurrent(context) {
  await context.game.close();
  Object.assign(context, context.open({ storyContentVersion: 2 }));
}

test('story catalogs preserve all original prices and XP while the current first slice grants twenty-five percent less', () => {
  const old = storyMissions(1), current = storyMissions(2).slice(0, old.length);
  assert.equal(old.length, 7);
  assert.equal(storyMissions(2).length, 14);
  for (const field of ['coins', 'userXp', 'unitXp']) {
    const previous = old.reduce((sum, mission) => sum + mission.reward[field], 0);
    const reduced = current.reduce((sum, mission) => sum + mission.reward[field], 0);
    assert.equal(reduced, previous * 0.75, field);
  }
  assert.deepEqual(old.map(mission => mission.id), current.map(mission => mission.id));
  assert.equal(getStoryMission(7, 1), null);
  assert.equal(getStoryMission(7, 2).code, 'I-04');
  assert.ok(old.every(mission => Object.isFrozen(mission.reward)));
});

test('a completed legacy campaign opens read-only and continues at I-04 without changing its seven paid rewards', async t => {
  const context = await contextFor(t);
  const oldState = await advanceUntil(context, state => state.progress?.status === 'complete');
  const rewards = readRecords(context.directory, 'premioshistoria');
  const battles = readRecords(context.directory, 'combateshistoria');
  const user = await context.game.users.getUser(context.user.id);
  const unit = await context.game.units.getUnit(context.unit.id);
  assert.equal(rewards.reduce((sum, reward) => sum + reward.coins, 0), 300);
  assert.equal(rewards.reduce((sum, reward) => sum + reward.unitXp, 0), 1100);
  await openCurrent(context);
  const files = filesOf(context.directory);
  const opened = await context.get();
  assert.equal(opened.nextContentAvailable, true);
  assert.equal(opened.progress.contentVersion, 1);
  assert.deepEqual(opened.progress, oldState.progress);
  await context.game.story.getJournal({ userId: context.user.id });
  await context.game.story.getMap({ userId: context.user.id });
  assert.deepEqual(filesOf(context.directory), files);
  const continued = await context.invoke('continue');
  assert.equal(continued.progress.contentVersion, 2);
  assert.equal(continued.progress.run, oldState.progress.run);
  assert.equal(continued.mission.code, 'I-04');
  assert.equal(continued.progress.stage, 'battle');
  assert.deepEqual(continued.progress.decisions, oldState.progress.decisions);
  assert.deepEqual(continued.progress.completedMissionIds, oldState.progress.completedMissionIds);
  assert.deepEqual(readRecords(context.directory, 'premioshistoria'), rewards);
  assert.deepEqual(readRecords(context.directory, 'combateshistoria').slice(0, battles.length), battles);
  assert.deepEqual((await context.game.users.getUser(context.user.id)).economy, user.economy);
  assert.deepEqual((await context.game.units.getUnit(context.unit.id)).progress, unit.progress);
  const upgrades = readRecords(context.directory, 'accioneshistoria').filter(action => action.kind === 'upgrade');
  assert.equal(upgrades.length, 1);
  assert.equal(upgrades[0].rewardId, null);
  assert.deepEqual(upgrades[0].unitRefs, []);
  assert.equal(upgrades[0].battleId, null);
  assert.deepEqual(upgrades[0].after.traces, []);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('old operation replays run before upgrading and do not require a valid new clock', async t => {
  const context = await contextFor(t);
  await context.invoke('start');
  const request = { userId: context.user.id, choice: '2', operationKey: 'legacy-operation' };
  const previous = await context.game.story.choose(request);
  const rewards = readRecords(context.directory, 'premioshistoria');
  const actions = readRecords(context.directory, 'accioneshistoria');
  await openCurrent(context);
  context.setTime(null);
  const replay = await context.game.story.choose(request);
  assert.equal(replay.alreadyProcessed, true);
  assert.equal(replay.progress.contentVersion, 1);
  assert.equal(replay.nextContentAvailable, true);
  assert.equal(replay.reward.contentVersion, 1);
  assert.equal(replay.reward.coins, previous.reward.coins);
  assert.deepEqual(readRecords(context.directory, 'premioshistoria'), rewards);
  assert.deepEqual(readRecords(context.directory, 'accioneshistoria'), actions);
});

test('an active version-one combat survives upgrade and receives only the current reward on its first victory', async t => {
  const context = await contextFor(t);
  await advanceUntil(context, state => state.progress?.stage === 'battle');
  await context.invoke('act', { action: 'attack', choice: '1' });
  const before = readRecords(context.directory, 'combateshistoria')[0];
  const paid = readRecords(context.directory, 'premioshistoria');
  assert.equal(before.contentVersion, 1);
  assert.equal(before.combat.version, 1);
  await openCurrent(context);
  await context.invoke('act', { action: 'defend' });
  const resumed = readRecords(context.directory, 'combateshistoria')[0];
  assert.equal(resumed.id, before.id);
  assert.equal(resumed.contentVersion, 1);
  assert.equal(resumed.combat.version, 1);
  assert.deepEqual(resumed.combat.unitSnapshots, before.combat.unitSnapshots);
  assert.deepEqual(resumed.combat.actions.slice(0, before.combat.actions.length), before.combat.actions);
  await advanceUntil(context, state => state.mission?.code === 'P-04');
  const rewards = readRecords(context.directory, 'premioshistoria');
  assert.deepEqual(rewards.slice(0, paid.length), paid);
  const tutorial = rewards.find(reward => reward.missionCode === 'P-03');
  assert.equal(tutorial.contentVersion, 2);
  assert.equal(tutorial.unitXp, 165);
  assert.equal(tutorial.coins, 34);
  assert.equal((await context.game.validateDatabase()).valid, true);
  await context.game.close();
  Object.assign(context, context.open({ storyContentVersion: 2 }));
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('concurrent first continuations publish exactly one upgrade and one new encounter', async t => {
  const context = await contextFor(t);
  await advanceUntil(context, state => state.progress?.status === 'complete');
  await openCurrent(context);
  const request = { userId: context.user.id, operationKey: 'concurrent-upgrade' };
  const results = await Promise.all([context.game.story.continue(request), context.game.story.continue(request)]);
  assert.equal(results.filter(result => result.alreadyProcessed).length, 1);
  const actions = readRecords(context.directory, 'accioneshistoria');
  assert.equal(actions.filter(action => action.kind === 'upgrade').length, 1);
  assert.equal(actions.filter(action => action.operationKey === request.operationKey).length, 1);
  assert.equal(readRecords(context.directory, 'combateshistoria').filter(battle => battle.contentVersion === 2).length, 1);
  assert.equal(readRecords(context.directory, 'premioshistoria').length, 7);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('new accounts receive only the reduced first-slice rewards and keep the next chapter unlocked', async t => {
  const context = await contextFor(t, 2);
  const state = await advanceUntil(context, state => state.progress?.missionIndex === 7);
  const rewards = readRecords(context.directory, 'premioshistoria');
  assert.equal(rewards.length, 7);
  assert.ok(rewards.every(reward => reward.contentVersion === 2));
  assert.equal(rewards.reduce((sum, reward) => sum + reward.coins, 0), 225);
  assert.equal(rewards.reduce((sum, reward) => sum + reward.unitXp, 0), 825);
  assert.equal(state.progress.status, 'playing');
  assert.equal(state.mission.code, 'I-04');
  assert.equal(readRecords(context.directory, 'accioneshistoria').some(action => action.kind === 'upgrade'), false);
});

test('upgrade proofs reject missing links, monetary grants, changed identities and repeated downgrades', async t => {
  const context = await contextFor(t);
  await advanceUntil(context, state => state.progress?.status === 'complete');
  await openCurrent(context);
  await context.invoke('continue');
  const original = stateOf(context.directory);
  const corruptions = [
    state => { state.accioneshistoria.records.find(action => action.kind === 'upgrade').operationKey = 'arbitrary-upgrade'; },
    state => { state.accioneshistoria.records.find(action => action.kind === 'upgrade').unitRefs = [{ unitId: context.unit.id, ownershipVersion: 0 }]; },
    state => { state.accioneshistoria.records.find(action => action.kind === 'upgrade').rewardId = state.premioshistoria.records[0].id; },
    state => { state.accioneshistoria.records.find(action => action.kind === 'upgrade').after.run++; },
    state => { state.accioneshistoria.records = state.accioneshistoria.records.filter(action => action.kind !== 'upgrade'); },
    state => { state.accioneshistoria.records.find(action => action.kind === 'upgrade').contentVersion = 1; },
    state => { state.premioshistoria.records[0].contentVersion = 2; }
  ];
  for (const corrupt of corruptions) {
    const state = structuredClone(original);
    corrupt(state);
    assert.throws(() => validateStoryData(state), { code: 'DATABASE_CORRUPT' });
  }
  assert.equal(validateDatabase(original).valid, true);
});
