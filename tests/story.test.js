import test from 'node:test';
import assert from 'node:assert/strict';
import { register, setup, readRecords } from './helpers.js';
import { createStoryBattle } from '../game/story/combat.js';
import { validateDatabase, COLLECTIONS } from '../storage/validation.js';
import fs from 'node:fs';
import path from 'node:path';

const NOW = '2026-10-17T20:00:00.000Z';
function api(c, userId) {
  let sequence = 0;
  const invoke = (kind, args = {}) => c.game.story[kind]({ userId, operationKey: `story-test:${++sequence}`, ...args });
  return { invoke, get: () => c.game.story.getState({ userId }) };
}
async function reachTutorial(c, user, a = api(c, user.id)) {
  await a.invoke('start'); await a.invoke('choose', { choice: '1' });
  await c.game.starter.claimStarter({ userId: user.id, choice: 'panda' });
  await a.invoke('continue'); await a.invoke('continue'); return a;
}
async function fight(a, tactical = true) {
  for (let i = 0; i < 90; i++) {
    const state = await a.get(), battle = state.battle;
    if (battle?.status !== 'active') return state;
    const active = battle.team.find(unit => unit.active);
    const action = !tactical ? 'attack' : battle.enemy.phase === 'unleash' || !battle.tutorial.defend ? 'defend' :
      !battle.tutorial.attack ? 'attack' : active.attacks[1].ready ? 'skill' : 'attack';
    await a.invoke('act', { action, ...(action === 'attack' ? { choice: '1' } : {}) });
  }
  assert.fail('Encounter did not finish');
}
async function reachBoss(c, user) {
  const a = await reachTutorial(c, user); await fight(a);
  await a.invoke('continue'); await a.invoke('choose', { choice: '2' });
  await a.invoke('choose', { choice: '1' }); await a.invoke('choose', { choice: '1' }); return a;
}
const stateOf = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

test('phase one persists decisions, accelerates the starter to level five and cannot farm prizes after reset', async t => {
  const c = setup(t, { clock: () => NOW, randomRoll: () => 30 }); const user = await register(c.game);
  const a = await reachBoss(c, user);
  assert.equal((await a.get()).team[0].level, 4);
  assert.equal((await a.get()).progress.decisions.forest_clue, 'stream');
  await fight(a);
  let state = await a.get(); assert.equal(state.progress.status, 'complete');
  assert.ok(state.progress.memories.includes('confianza_de_lian'));
  assert.deepEqual(state.team[0].progress, { level: 5, xp: 100 });
  const receipts = readRecords(c.directory, 'premioshistoria');
  assert.equal(receipts.length, 7);
  assert.equal(receipts.reduce((sum, row) => sum + row.coins, 0), 300);
  assert.equal(receipts.reduce((sum, row) => sum + row.unitXp, 0), 1100);
  assert.equal(receipts.reduce((sum, row) => sum + row.materials.fragmentos, 0), 5);
  assert.equal(receipts.reduce((sum, row) => sum + row.materials.esencias, 0), 2);
  const profile = await c.game.users.getProfile(user.id);
  await assert.rejects(a.invoke('continue'), { code: 'STORY_COMPLETE' });
  await a.invoke('reset'); await a.invoke('choose', { choice: '2' });
  await a.invoke('continue'); await a.invoke('continue'); await fight(a);
  await a.invoke('continue'); await a.invoke('choose', { choice: '1' });
  await a.invoke('choose', { choice: '2' }); await a.invoke('choose', { choice: '3' }); await fight(a);
  state = await a.get(); assert.equal(state.progress.status, 'complete');
  assert.equal(state.progress.run, 2); assert.equal(state.progress.decisions.forest_choice, 'pursue');
  assert.equal(state.progress.memories.includes('confianza_de_lian'), false);
  assert.deepEqual(state.team[0].progress, { level: 5, xp: 100 });
  assert.deepEqual(readRecords(c.directory, 'premioshistoria'), receipts);
  assert.deepEqual((await c.game.users.getProfile(user.id)).user.economy, profile.user.economy);
  assert.deepEqual((await c.game.users.getProfile(user.id)).user.progress, profile.user.progress);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('two tactical failures allow unlimited fully healed retries without XP, currency or PvP penalties', async t => {
  const c = setup(t, { clock: () => NOW, randomRoll: () => 30 }); const user = await register(c.game);
  const a = await reachBoss(c, user), original = await a.get();
  const profile = await c.game.users.getProfile(user.id);
  for (let i = 0; i < 2; i++) {
    const lost = await fight(a, false); assert.equal(lost.progress.stage, 'defeated');
    assert.equal(lost.team[0].locked, false); assert.deepEqual(lost.team[0].progress, original.team[0].progress);
    assert.deepEqual((await c.game.users.getProfile(user.id)).user.economy, profile.user.economy);
    const retry = await a.invoke('retry');
    assert.equal(retry.battle.team[0].hp, retry.battle.team[0].maxHp);
    assert.equal(retry.battle.enemy.hp, retry.battle.enemy.maxHp);
    assert.equal(retry.battle.round, 1);
  }
  await fight(a); assert.equal((await a.get()).progress.status, 'complete');
  assert.deepEqual((await c.game.users.getProfile(user.id)).user.battleStats, { wins: 0, losses: 0, matches: 0 });
});

test('story turn survives restarts and weeks of inactivity; operation replay never attacks twice', async t => {
  let now = NOW; const c = setup(t, { clock: () => now, randomRoll: () => 30 });
  const user = await register(c.game), a = await reachTutorial(c, user);
  const request = { userId: user.id, action: 'attack', choice: '1', operationKey: 'attack-once' };
  const first = await c.game.story.act(request);
  await c.game.close(); now = '2026-12-17T20:00:00.000Z';
  c.game = c.open().game;
  const resumed = await c.game.story.getState({ userId: user.id });
  assert.deepEqual(resumed.battle, first.battle);
  const replay = await c.game.story.act(request); assert.equal(replay.alreadyProcessed, true);
  assert.deepEqual(replay.battle, first.battle);
  await assert.rejects(c.game.story.act({ ...request, action: 'defend' }), { code: 'OPERATION_CONFLICT' });
  await c.game.story.reset({ userId: user.id, operationKey: 'reset-active' });
  const units = readRecords(c.directory, 'unidades'); assert.equal(units[0].lock, null);
  const battle = readRecords(c.directory, 'combateshistoria')[0];
  assert.equal(battle.closeReason, 'reset'); assert.equal(battle.status, 'lost');
  assert.equal((await c.game.story.getState({ userId: user.id })).progress.run, 2);
});

test('concurrent messages serialize decisions and reject invalid stages without partial payouts', async t => {
  const c = setup(t, { clock: () => NOW }); const user = await register(c.game), a = api(c, user.id);
  await assert.rejects(a.invoke('continue'), { code: 'STORY_NOT_STARTED' });
  await a.invoke('start');
  await assert.rejects(a.invoke('choose', { choice: '999' }), { code: 'STORY_INVALID_CHOICE' });
  await assert.rejects(a.invoke('continue'), { code: 'STORY_CHOICE_REQUIRED' });
  const request = { userId: user.id, choice: '1', operationKey: 'same-choice' };
  const [first, replay] = await Promise.all([c.game.story.choose(request), c.game.story.choose(request)]);
  assert.equal(first.reward.coins, 20); assert.equal(replay.alreadyProcessed, true);
  assert.equal(readRecords(c.directory, 'premioshistoria').length, 1);
  await assert.rejects(a.invoke('continue'), { code: 'STORY_STARTER_REQUIRED' });
  assert.equal(readRecords(c.directory, 'premioshistoria').length, 1);
});

test('saved progress, decisions, rewards and enemy health have independently checked proofs', async t => {
  const c = setup(t, { clock: () => NOW, randomRoll: () => 30 }); const user = await register(c.game);
  const a = await reachTutorial(c, user); await a.invoke('act', { action: 'attack', choice: '1' });
  const original = stateOf(c.directory);
  const corruptions = [
    state => state.historias.records[0].missionIndex++,
    state => state.accioneshistoria.records[1].after.decisions.first_question = 'forged',
    state => state.premioshistoria.records[1].unitXp++,
    state => state.combateshistoria.records[0].combat.players[1].units[0].hp++,
    state => state.unidades.records[0].lock = null,
    state => state.premioshistoria.records.splice(0, 1)
  ];
  for (const corrupt of corruptions) {
    const state = structuredClone(original); corrupt(state);
    assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
  }
});

test('a coherent forged combat snapshot cannot replace an authorized saved encounter', async t => {
  const c = setup(t, { clock: () => NOW, randomRoll: () => 30 }); const user = await register(c.game);
  await reachTutorial(c, user);
  await assert.rejects(c.storage.withTransaction(async repos => {
    const battle = await repos.storyBattles.findBy('userId', user.id);
    const units = structuredClone(battle.combat.unitSnapshots);
    units[0].attacks[0].power = 999;
    const combat = createStoryBattle({ id: battle.id, encounterId: battle.combat.encounterId, units, now: NOW });
    await repos.storyBattles.replace({ ...battle, combat });
  }), { code: 'DATABASE_CORRUPT' });
  assert.equal((await c.game.validateDatabase()).valid, true);
});

for (const stage of ['prepared', 'committed', 'published:usuarios.json', 'published:economia.json',
  'published:historias.json', 'published:accioneshistoria.json', 'published:premioshistoria.json', 'published:_database.json']) {
  test(`story reward and progress recover together at ${stage}`, async t => {
    const c = setup(t, { clock: () => NOW }); const user = await register(c.game), a = api(c, user.id);
    await a.invoke('start'); await c.game.close();
    const failing = c.open({ fault: current => { if (current === stage) throw new Error('story crash'); } }).game;
    const request = { userId: user.id, choice: '1', operationKey: 'recover-story-reward' };
    await assert.rejects(failing.story.choose(request), { code: 'STORAGE_WRITE_FAILED' }); await failing.close();
    const recovered = c.open().game, result = await recovered.story.choose(request);
    assert.equal(result.progress.missionIndex, 1);
    assert.equal(readRecords(c.directory, 'premioshistoria').length, 1);
    assert.equal((await recovered.users.getProfile(user.id)).user.economy.coins, 20);
    assert.equal((await recovered.validateDatabase()).valid, true);
  });
}
