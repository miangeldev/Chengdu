import test from 'node:test';
import assert from 'node:assert/strict';
import { setup, register, readRecords } from './helpers.js';
import { storyMissions, STORY_MEMORIES } from '../game/story/catalog.js';

const NOW = '2026-10-17T20:00:00.000Z';
async function campaign(t, { starter = 'panda', choices = {}, clock = () => NOW } = {}) {
  const c = setup(t, { storyContentVersion: 2, clock, randomRoll: () => 30 });
  const user = await register(c.game);
  const { unit } = await c.game.starter.claimStarter({ userId: user.id, choice: starter });
  let sequence = 0;
  const get = () => c.game.story.getState({ userId: user.id });
  const invoke = (kind, request = {}) => c.game.story[kind]({ userId: user.id,
    operationKey: `chapters:${++sequence}`, ...request });
  async function step() {
    const state = await get(), mission = state.mission;
    if (!state.progress) return invoke('start');
    if (state.progress.stage === 'choice') return invoke('choose', { choice: choices[mission.code] ?? '1' });
    if (state.progress.stage === 'defeated') return invoke('retry');
    if (state.progress.stage !== 'battle') return invoke('continue');
    const battle = state.battle, active = battle.team.find(unit => unit.active);
    const action = battle.enemy.phase === 'unleash' ? 'defend' : battle.availableActions.includes('break') ? 'break'
      : battle.availableActions.includes('observe') ? 'observe'
        : battle.encounterId === 'P03' && !battle.tutorial.defend ? 'defend'
          : battle.encounterId === 'P03' && !battle.tutorial.attack ? 'attack'
            : active.attacks[1].ready ? 'skill' : 'attack';
    return invoke('act', { action, ...(action === 'attack' ? { choice: '1' } : {}) });
  }
  async function until(done = state => state.progress?.status === 'complete') {
    for (let i = 0; i < 200; i++) {
      const state = await get(); if (done(state)) return state;
      await step();
    }
    assert.fail('Campaign did not reach its checkpoint');
  }
  return { ...c, user, unit, get, invoke, step, until };
}

test('new story rewards reduce the original seven missions by exactly 25 percent in coins and XP', () => {
  const sum = (version, key) => storyMissions(version).slice(0, 7).reduce((total, mission) => total + mission.reward[key], 0);
  assert.equal(sum(1, 'unitXp'), 1100); assert.equal(sum(2, 'unitXp'), 825);
  assert.equal(sum(1, 'coins'), 300); assert.equal(sum(2, 'coins'), 225);
  assert.equal(sum(1, 'userXp'), 300); assert.equal(sum(2, 'userXp'), 225);
  assert.equal(storyMissions(1).length, 7); assert.equal(storyMissions(2).length, 14);
});

for (const starter of ['panda', 'mago', 'lobo']) {
  test(`phases two and three: ${starter} restores the forest and completes all fourteen missions without evolution`, async t => {
    const c = await campaign(t, { starter });
    await c.until(state => state.mission?.code === 'I-04');
    assert.deepEqual((await c.game.units.getUnit(c.unit.id)).progress, { level: 4, xp: 225 });
    const first = readRecords(c.directory, 'premioshistoria');
    assert.equal(first.length, 7); assert.equal(first.reduce((n, r) => n + r.unitXp, 0), 825);
    await c.until(state => state.mission?.code === 'II-01');
    const forest = await c.game.story.getJournal({ userId: c.user.id });
    assert.match(forest.traces[0].text, /1 de 5/);
    assert.equal(forest.traces.length, 2);
    assert.ok(forest.memories.some(memory => /raíces/.test(memory.title)));
    assert.deepEqual((await c.game.units.getUnit(c.unit.id)).progress, { level: 5, xp: 110 });
    const finished = await c.until();
    assert.equal(finished.campaign.missionCount, 14);
    assert.equal(finished.progress.completedMissionIds.length, 14);
    assert.equal(finished.progress.traces.length, 2);
    assert.equal(readRecords(c.directory, 'premioshistoria').length, 14);
    const journal = await c.game.story.getJournal({ userId: c.user.id });
    assert.match(journal.traces[0].text, /2 de 5/);
    assert.ok(journal.memories.some(memory => memory.title === 'El valor de un nombre'));
    assert.doesNotMatch(JSON.stringify(journal), /Archivista|Huan|Tercer Trazo/);
    const unit = await c.game.units.getUnit(c.unit.id);
    assert.deepEqual(unit.progress, { level: 5, xp: 495 });
    assert.equal(unit.evolution, null); assert.equal(unit.lock, null);
    assert.deepEqual(unit.battleStats, { wins: 0, losses: 0 });
    assert.equal((await c.game.validateDatabase()).valid, true);
  });
}

for (const offer of ['1', '2']) {
  test(`the simulated offer (${offer}) grants its narrative memory without transferring any real unit`, async t => {
    const c = await campaign(t, { choices: { 'II-03': offer } });
    await c.until(state => state.mission?.code === 'II-03');
    assert.match(c.get ? (await c.get()).mission.scene.join(' ') : '', /simulada/);
    const events = readRecords(c.directory, 'eventos'), units = readRecords(c.directory, 'unidades');
    const beforeBalance = (await c.game.economy.getBalance(c.user.id)).coins;
    const result = await c.step();
    assert.equal(result.mission.code, 'II-04');
    assert.deepEqual(readRecords(c.directory, 'eventos'), events);
    const after = readRecords(c.directory, 'unidades');
    assert.equal(after.length, units.length);
    for (let i = 0; i < units.length; i++) for (const field of ['id', 'ownerId', 'ownershipVersion', 'origin', 'serial'])
      assert.deepEqual(after[i][field], units[i][field]);
    assert.equal(readRecords(c.directory, 'intercambios').length, 0);
    assert.equal(readRecords(c.directory, 'ventas').length, 0);
    assert.equal((await c.game.economy.getBalance(c.user.id)).coins, beforeBalance + 20);
    const expected = offer === '1' ? 'oferta_imposible' : 'cautela_del_testigo';
    assert.ok(result.progress.memories.includes(expected));
    assert.ok(STORY_MEMORIES.some(memory => memory.id === expected));
  });
}

for (const order of ['1', '2']) {
  test(`the archive investigation (${order}) shows both clues in the chosen order and only pays after reading both`, async t => {
    const c = await campaign(t, { choices: { 'II-04': order } });
    await c.until(state => state.mission?.code === 'II-04');
    const count = readRecords(c.directory, 'premioshistoria').length;
    const chosen = await c.step();
    assert.equal(chosen.progress.stage, 'investigation'); assert.equal(chosen.progress.sceneStep, 1);
    assert.equal(chosen.mission.choices.length, 0);
    assert.match(chosen.mission.scene.join(' '), order === '1' ? /Tres entregas/ : /Yun encuentra un hilo/);
    assert.equal(chosen.reward, null);
    const second = await c.step(); assert.equal(second.progress.sceneStep, 2);
    assert.match(second.mission.scene.join(' '), order === '1' ? /Yun encuentra un hilo/ : /Tres entregas/);
    assert.equal(second.reward, null); assert.equal(readRecords(c.directory, 'premioshistoria').length, count);
    const finished = await c.step(); assert.equal(finished.mission.code, 'II-05');
    assert.equal(finished.reward.unitXp, 60); assert.equal(readRecords(c.directory, 'premioshistoria').length, count + 1);
  });
}

test('resetting the extended campaign cannot duplicate either trace, materials, XP or any of its fourteen prizes', async t => {
  const c = await campaign(t); const finished = await c.until();
  const receipts = readRecords(c.directory, 'premioshistoria');
  const unit = await c.game.units.getUnit(c.unit.id), user = await c.game.users.getUser(c.user.id);
  await c.invoke('reset'); const repeated = await c.until();
  assert.equal(repeated.progress.run, 2);
  assert.deepEqual(repeated.progress.traces, finished.progress.traces);
  assert.deepEqual(readRecords(c.directory, 'premioshistoria'), receipts);
  assert.deepEqual((await c.game.units.getUnit(c.unit.id)).progress, unit.progress);
  const after = await c.game.users.getUser(c.user.id);
  assert.deepEqual(after.progress, user.progress); assert.deepEqual(after.economy, user.economy);
  assert.equal((await c.game.validateDatabase()).valid, true);
});
