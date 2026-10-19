import test from 'node:test';
import assert from 'node:assert/strict';
import { readRecords } from './helpers.js';
import { seasonFixture, forkSeason, NOW } from './story-season-support.js';
import { resolveStoryAction } from '../game/story/combat.js';
import { storySeasonTacticalAction } from '../scripts/simulate-story-balance.js';

test('a completed fourteen-mission save opens chapter III without rewriting paid receipts or legacy fights', { timeout: 90000 }, async t => {
  const c = await seasonFixture(t, { storyContentVersion: 2 });
  const completed = await c.until(state => state.progress?.status === 'complete');
  const prizes = readRecords(c.directory, 'premioshistoria'), battles = readRecords(c.directory, 'combateshistoria');
  const user = await c.game.users.getUser(c.user.id), unit = await c.game.units.getUnit(c.unit.id);
  await c.game.close(); Object.assign(c, c.open({ storyContentVersion: 3 }));
  assert.equal((await c.get()).nextContentAvailable, true);
  const continued = await c.invoke('continue');
  assert.equal(continued.progress.contentVersion, 3); assert.equal(continued.mission.code, 'III-01');
  assert.deepEqual(continued.progress.traces, completed.progress.traces);
  assert.deepEqual(readRecords(c.directory, 'premioshistoria'), prizes);
  assert.deepEqual(readRecords(c.directory, 'combateshistoria'), battles);
  assert.deepEqual((await c.game.users.getUser(c.user.id)).economy, user.economy);
  assert.deepEqual((await c.game.units.getUnit(c.unit.id)).progress, unit.progress);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('an in-progress version-two boss keeps its exact rules after upgrading the surrounding campaign', { timeout: 90000 }, async t => {
  const c = await seasonFixture(t, { storyContentVersion: 2 });
  await c.until(state => state.battle?.encounterId === 'II05' && state.battle.status === 'active');
  const before = readRecords(c.directory, 'combateshistoria').at(-1);
  await c.game.close(); Object.assign(c, c.open({ storyContentVersion: 3 }));
  await c.step();
  const after = readRecords(c.directory, 'combateshistoria').at(-1);
  assert.equal(after.contentVersion, 2); assert.equal(after.combat.version, 2);
  assert.deepEqual(after.combat.unitSnapshots, before.combat.unitSnapshots);
  await c.until(state => state.mission?.code === 'III-01');
  assert.equal((await c.get()).progress.contentVersion, 3);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('a mandatory reconnaissance knockout and its learning credit recover atomically at every publication stage', { timeout: 180000 }, async t => {
  const c = await seasonFixture(t);
  await c.until(state => state.battle?.encounterId === 'I05' && state.battle.status === 'active');
  let request;
  for (let turn = 0; turn < 25; turn++) {
    const progress = (await c.get()).progress;
    const battle = (await c.storage.withRead(repos => repos.storyBattles.get(progress.activeBattleId))).combat;
    request = storySeasonTacticalAction(battle);
    const next = resolveStoryAction(battle, { ...request, choice: request.choice ?? null, now: NOW, rolls: [30,30] }).battle;
    if (next.status === 'lost') break;
    await c.invoke('act', request);
  }
  assert.ok(request);
  for (const stage of ['prepared','committed','published:combateshistoria.json','published:accioneshistoria.json','published:historias.json','published:unidades.json']) {
    const fork = await forkSeason(t, c, `recovery:${stage}`);
    await fork.game.close();
    let armed = true;
    const { JsonUnitOfWork } = await import('../storage/unitOfWork.js');
    const { createGame } = await import('../game/createGame.js');
    fork.storage = new JsonUnitOfWork({ directory: fork.directory, clock: () => NOW, fault: point => {
      if (armed && point === stage) { armed = false; throw Error('Simulated process interruption'); }
    } });
    fork.game = createGame({ storage: fork.storage, randomRoll: () => 30 });
    const operation = { userId: fork.user.id, operationKey: `knockout:${stage}`, ...request };
    await assert.rejects(fork.game.story.act(operation), { code: 'STORAGE_WRITE_FAILED' });
    await fork.game.close();
    fork.storage = new JsonUnitOfWork({ directory: fork.directory, clock: () => NOW });
    fork.game = createGame({ storage: fork.storage, randomRoll: () => 30 });
    await fork.game.validateDatabase();
    const result = await fork.game.story.act(operation);
    assert.equal(result.alreadyProcessed, stage !== 'prepared');
    assert.equal(result.progress.stage, 'defeated'); assert.equal(result.battle.learning.defeats, 1);
    assert.equal(readRecords(fork.directory, 'combateshistoria').filter(row => row.combat.encounterId === 'I05' && row.status === 'lost').length, 1);
    const retry = await fork.invoke('retry'); assert.equal(retry.battle.learning.remaining, 0);
    assert.equal((await fork.game.validateDatabase()).valid, true);
  }
});
