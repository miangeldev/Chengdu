import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readRecords } from './helpers.js';
import { seasonFixture, forkSeason, NOW } from './story-season-support.js';
import { STORY_MISSIONS, STORY_SIDE_MISSIONS, STORY_TRIALS, activeStoryMission, currentStoryStep } from '../game/story/catalog.js';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';

const stateOf = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));
const checkpoint = code => state => state.mission?.code === code;

test('the complete season preserves rewards, mandatory reconnaissance, four side stories, three endings and Archive trials', { timeout: 240000 }, async t => {
  const c = await seasonFixture(t);
  assert.equal(STORY_MISSIONS.length, 32); assert.equal(STORY_SIDE_MISSIONS.length, 4); assert.equal(STORY_TRIALS.length, 3);
  await assert.rejects(c.invoke('startOptional', { code: 'III-A' }), { code: 'STORY_NOT_STARTED' });
  await c.invoke('start');
  await assert.rejects(c.invoke('startTrial', { number: 1 }), { code: 'STORY_SEASON_REQUIRED' });
  await assert.rejects(c.game.story.getScenes({ userId: c.user.id, code: 'V-06' }), { code: 'STORY_SCENE_LOCKED' });
  await c.until(state => state.battle?.encounterId === 'I03' && state.battle.status === 'active');
  assert.equal((await c.get()).battle.learning.required, 1);
  await c.invoke('act', { action: 'surrender' });
  let state = await c.invoke('retry'); assert.equal(state.battle.learning.defeats, 0);
  await c.until(state => state.progress.stage === 'defeated');
  state = await c.get(); assert.equal(state.battle.learning.defeats, 1); assert.equal(state.battle.learning.remaining, 0);
  await c.game.close(); Object.assign(c, c.open());
  state = await c.invoke('retry'); assert.equal(state.battle.learning.scouting, false);
  await c.until(checkpoint('II-01'));
  const main = (await c.get()).progress;
  await c.invoke('startOptional', { code: 'I-A' }); await c.step();
  const paused = await c.get(); assert.equal(paused.route.kind, 'optional');
  await c.invoke('returnToMain'); assert.equal((await c.get()).mission.code, 'II-01');
  await c.invoke('startOptional', { code: 'I-A' });
  assert.equal((await c.get()).progress.sceneStep, paused.progress.sceneStep);
  await c.until(state => !state.progress.activityId);
  assert.equal((await c.get()).progress.missionIndex, main.missionIndex);
  const sidePrize = readRecords(c.directory, 'premioshistoria').find(row => row.missionCode === 'I-A');
  await c.invoke('startOptional', { code: 'I-A' }); await c.until(state => !state.progress.activityId);
  assert.equal(readRecords(c.directory, 'premioshistoria').filter(row => row.missionCode === 'I-A').length, 1);
  assert.deepEqual(readRecords(c.directory, 'premioshistoria').find(row => row.missionCode === 'I-A'), sidePrize);
  await c.until(checkpoint('III-01'));
  assert.equal(readRecords(c.directory, 'premioshistoria').filter(row => STORY_MISSIONS.slice(0,7).some(m => m.id === row.missionId)).reduce((n,row) => n + row.unitXp,0), 825);
  await c.until(checkpoint('IV-03'));
  const solo = await forkSeason(t, c, 'solo-route');
  await solo.until(state => state.progress.stage === 'community', { 'IV-03': '2' });
  const soloResult = await solo.invoke('contribute'); assert.equal(soloResult.community.mode, 'solo');
  assert.equal(soloResult.community.contributors, 1);
  await c.game.clans.create({ userId: c.user.id, name: 'Casa del Alba', tag: 'ALBA', operationKey: 'season-clan' });
  await c.until(state => state.progress.stage === 'community');
  const coins = (await c.game.economy.getBalance(c.user.id)).coins;
  const contribution = await c.invoke('contribute'); assert.equal(contribution.community.mode, 'clan');
  assert.equal(contribution.community.contributors, 1);
  assert.equal((await c.game.economy.getBalance(c.user.id)).coins, coins);
  await c.until(checkpoint('V-01'));
  await c.until(state => state.progress.stage === 'choice' && currentStoryStep(activeStoryMission(state.progress),state.progress)?.requiredChoice);
  state = await c.get(); const puzzleStep = state.progress.sceneStep;
  const puzzle = currentStoryStep(activeStoryMission(state.progress),state.progress);
  const wrong = puzzle.choices.find(choice => choice.id !== puzzle.requiredChoice);
  const rewardsBefore = readRecords(c.directory, 'premioshistoria').length;
  await c.invoke('choose', { choice: wrong.id }); assert.equal((await c.get()).progress.sceneStep, puzzleStep);
  assert.equal(readRecords(c.directory, 'premioshistoria').length, rewardsBefore);
  await c.until(checkpoint('V-06'));
  const beforeEnding = await forkSeason(t, c, 'alternative-ending');
  const thirdEnding = await forkSeason(t, c, 'third-ending');
  for (const [context, choice, expected] of [[c,'1','protected'],[beforeEnding,'2','open'],[thirdEnding,'3','council']]) {
    const finished = await context.until(state => state.seasonComplete, { 'V-06': choice });
    assert.equal(finished.ending.id, expected); assert.equal(finished.progress.completedMissionIds.length, 32);
    assert.equal(finished.progress.traces.length, 5); assert.equal(finished.progress.status, 'complete');
    assert.equal(finished.reward?.titleReward.name, 'Custodio del Alba');
    const titles = (await context.game.social.getTitles(context.user.id)).titles;
    assert.ok(titles.some(title => title.code === 'STORY-DAWN'));
    assert.ok(titles.some(title => title.code === `STORY-${expected.toUpperCase()}`));
    assert.equal((await context.game.story.getJournal({ userId: context.user.id })).decisions.at(-1).title, STORY_MISSIONS.at(-1).title);
    assert.equal((await context.game.validateDatabase()).valid, true);
  }
  const allBattles = readRecords(c.directory, 'combateshistoria');
  for (const [encounterId, required] of [['I03',1],['I05',1],['II05',2],['III05',2],['IV05',2],['V05',4]]) {
    const won = allBattles.find(row => row.combat.encounterId === encounterId && row.status === 'won');
    assert.ok(won, encounterId); assert.ok(won.combat.learning.defeats >= required, encounterId);
  }
  for (const mission of STORY_SIDE_MISSIONS.filter(mission => mission.code !== 'I-A')) {
    await c.invoke('startOptional', { code: mission.code }); await c.until(state => !state.progress.activityId);
  }
  assert.equal((await c.get()).progress.completedActivityIds.length, 4);
  await c.game.social.updatePreferences({ userId: c.user.id, operationKey: 'wear-dawn', selectedTitleCode: 'STORY-DAWN' });
  assert.equal((await c.game.social.getProfile({ userId: c.user.id })).title.name, 'Custodio del Alba');
  const userBeforeTrials = await c.game.users.getUser(c.user.id), unitBeforeTrials = await c.game.units.getUnit(c.unit.id);
  for (const trial of STORY_TRIALS) {
    await c.invoke('startTrial', { number: trial.number }); await c.until(state => !state.progress.activityId);
  }
  await c.invoke('startTrial', { number: 3 }); await c.until(state => !state.progress.activityId);
  assert.deepEqual((await c.game.users.getUser(c.user.id)).economy, userBeforeTrials.economy);
  assert.deepEqual((await c.game.units.getUnit(c.unit.id)).progress, unitBeforeTrials.progress);
  for (const trial of STORY_TRIALS) assert.ok((await c.get()).progress.memories.includes(trial.reward.memory));
  const archiveBefore = stateOf(c.directory);
  const archive = await c.game.story.getScenes({ userId: c.user.id, code: 'V-06', page: 1 });
  assert.equal(archive.mission.code, 'V-06'); assert.ok(archive.scene.length > 0);
  await c.game.story.getScenes({ userId: c.user.id, code: 'III-A', page: 1 });
  assert.deepEqual(stateOf(c.directory), archiveBefore);
  const bad = structuredClone(archiveBefore);
  bad.combateshistoria.records.find(row => row.combat.encounterId === 'V05').combat.learning.defeats = 99;
  assert.throws(() => validateDatabase(bad), { code: 'DATABASE_CORRUPT' });
  await c.invoke('reset'); assert.equal((await c.get()).progress.run, 2);
  assert.deepEqual((await c.game.story.getScenes({ userId: c.user.id, code: 'V-06', page: 1 })).scene, archive.scene);
  assert.deepEqual((await c.game.users.getUser(c.user.id)).economy, userBeforeTrials.economy);
  assert.equal((await c.game.social.getProfile({ userId: c.user.id })).title.name, 'Custodio del Alba');
  assert.equal((await c.game.validateDatabase()).valid, true);
});
