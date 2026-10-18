import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { setup, register } from './helpers.js';
import { COLLECTIONS } from '../storage/validation.js';
import { analyzeStoryProgress, analyzeStoryMessages, storyPreviewMessages } from '../game/story/metrics.js';
import { storyMissions, STORY_TRIALS } from '../game/story/catalog.js';
import { runStoryMetrics } from '../scripts/story-metrics.js';

const NOW = '2026-10-20T12:00:00.000Z';
const OLD = '2026-10-17T12:00:00.000Z';
const FIRST = storyMissions(1)[0].id, TUTORIAL = storyMissions(1)[2].id;

test('season metrics keep the main ending complete while a trial is active and separate forced reconnaissance', () => {
  const trial = STORY_TRIALS[0];
  const progress = [{ userId: 'private-season', contentVersion: 3, status: 'playing', missionIndex: 32,
    activityId: trial.id, updatedAt: OLD, completedMissionIds: storyMissions(3).map(mission => mission.id), completedActivityIds: [] }];
  const battles = [
    { id: 'scout', userId: 'private-season', missionId: storyMissions(3)[28].id, status: 'lost', closeReason: 'lost', combat: { learning: { scouting: true }, finishReason: 'knockout' } },
    { id: 'retreat', userId: 'private-season', missionId: storyMissions(3)[28].id, status: 'lost', closeReason: 'lost', combat: { learning: { scouting: true }, finishReason: 'surrender' } },
    { id: 'trial', userId: 'private-season', missionId: trial.id, status: 'active', closeReason: null, combat: { learning: { scouting: false } } }
  ];
  const report = analyzeStoryProgress({ progress, battles, now: NOW });
  assert.equal(report.players.currentSliceComplete, 1); assert.equal(report.players.pending, 0);
  assert.equal(report.players.inactivePending, 0);
  assert.equal(report.byContentVersion[2].availableMissions, 32);
  assert.equal(report.missions.find(mission => mission.code === trial.code).currentPlayers, 1);
  assert.deepEqual(report.reconnaissance, { attempts: 2, defeats: 1, withdrawals: 1 });
  assert.doesNotMatch(JSON.stringify(report), /private-season|userId/);
});

test('story metrics count unique players and mission completions across resets while separating legacy slices', () => {
  const resetUser = { userId: 'private-a', contentVersion: 2, status: 'playing', missionIndex: 2,
    updatedAt: OLD, completedMissionIds: [FIRST] };
  const legacyUser = { userId: 'private-b', contentVersion: 1, status: 'complete', missionIndex: 7,
    updatedAt: OLD, completedMissionIds: storyMissions(1).map(mission => mission.id) };
  const freshUser = { userId: 'private-c', contentVersion: 2, status: 'playing', missionIndex: 0,
    updatedAt: NOW, completedMissionIds: [] };
  const finished = { ...legacyUser, userId: resetUser.userId };
  const actions = [{ id: 'a1', userId: resetUser.userId, contentVersion: 1, kind: 'act', createdAt: OLD, after: finished },
    { id: 'a2', userId: resetUser.userId, contentVersion: 2, kind: 'reset', createdAt: OLD, after: resetUser },
    { id: 'a3', userId: resetUser.userId, contentVersion: 2, kind: 'retry', createdAt: OLD,
      before: { missionIndex: 2 }, after: resetUser }];
  const report = analyzeStoryProgress({ progress: [resetUser, legacyUser, freshUser], actions: [...actions, actions[2]],
    battles: [{ id: 'b1', userId: resetUser.userId, missionId: TUTORIAL, status: 'lost', closeReason: 'lost' },
      { id: 'b2', userId: resetUser.userId, missionId: TUTORIAL, status: 'lost', closeReason: 'reset' },
      { id: 'b3', userId: resetUser.userId, missionId: TUTORIAL, status: 'active', closeReason: null },
      { id: 'b4', userId: legacyUser.userId, missionId: TUTORIAL, status: 'won', closeReason: 'won' }], now: NOW });
  assert.deepEqual(report.players, { started: 3, currentSliceComplete: 1, pending: 2, everCompletedAnySlice: 2, inactivePending: 1 });
  assert.deepEqual(report.byContentVersion[0], { contentVersion: 1, availableMissions: 7, players: 1,
    currentSliceComplete: 1, pending: 0, inactivePending: 0 });
  assert.equal(report.byContentVersion[1].availableMissions, 14);
  assert.deepEqual(report.combat, { attempts: 4, wins: 1, losses: 1, active: 1, cancelled: 1, retries: 1 });
  assert.equal(report.missions[0].completedPlayers, 2);
  const tutorial = report.missions.find(mission => mission.code === 'P-03');
  assert.equal(tutorial.currentPlayers, 1);
  assert.equal(tutorial.inactiveCurrentPlayers, 1);
  assert.equal(tutorial.completedPlayers, 2);
  assert.equal(report.inactivity.confirmedAbandonment, false);
  assert.doesNotMatch(JSON.stringify(report), /private-|userId|@s\.whatsapp\.net|"id"/);
});

test('inactivity is a pending-user signal at forty-eight hours and fresh actions clear it', () => {
  const progress = [{ userId: 'a', contentVersion: 2, status: 'playing', missionIndex: 0,
    updatedAt: '2026-10-18T12:00:00.000Z', completedMissionIds: [] }];
  assert.equal(analyzeStoryProgress({ progress, now: NOW }).players.inactivePending, 1);
  const report = analyzeStoryProgress({ progress, now: NOW,
    actions: [{ id: 'fresh', userId: 'a', contentVersion: 2, kind: 'start', createdAt: NOW, after: progress[0] }] });
  assert.equal(report.players.inactivePending, 0);
  assert.equal(analyzeStoryProgress({ now: NOW }).players.started, 0);
});

test('message analysis measures full strings and treats 4096 as a reading budget', () => {
  const messages = ['a'.repeat(4096), 'b'.repeat(4097), '🐼'];
  const before = [...messages];
  assert.deepEqual(analyzeStoryMessages(messages), { count: 3, maxChars: 4097, medianChars: 4096,
    budgetChars: 4096, overBudget: 1, measurement: 'UTF-16 code units' });
  assert.deepEqual(messages, before);
  assert.equal(analyzeStoryMessages(['ab', 'abcd']).medianChars, 3);
  assert.deepEqual(analyzeStoryMessages([]), { count: 0, maxChars: 0, medianChars: 0,
    budgetChars: 4096, overBudget: 0, measurement: 'UTF-16 code units' });
  const markdown = ['HISTORIA', 'DIARIO DEL CUSTODIO', 'DIARIO | CRÓNICA', 'DIARIO | PERSONAJES', 'RECUERDOS', 'CAPÍTULOS', 'HISTORIAL', 'MERCADO', 'DIARIO']
    .map(title => `\`\`\`text\n🃏 *CHENGDÚ CARDS | ${title}*\nTexto completo.\n\`\`\``).join('\n\n');
  const selected = storyPreviewMessages(markdown);
  assert.equal(selected.length, 6);
  assert.ok(selected.every(message => message.endsWith('Texto completo.')));
  assert.ok(selected.every(message => !message.includes('HISTORIAL')));
});

test('metrics CLI reports aggregates without changing managed JSON or exporting private records', async t => {
  const context = setup(t, { clock: () => OLD });
  const user = await register(context.game, 'Nombre Privado');
  await context.game.story.start({ userId: user.id, operationKey: 'private-operation-key' });
  await context.game.close();
  const preview = path.join(context.directory, 'preview.md');
  fs.writeFileSync(preview, '```text\n🃏 *CHENGDÚ CARDS | HISTORIA*\nUna escena.\n```\n');
  const filenames = [...COLLECTIONS.map(name => `${name}.json`), '_database.json'];
  const before = Object.fromEntries(filenames.map(file => [file, fs.readFileSync(path.join(context.directory, file), 'utf8')]));
  const output = [], errors = [], stream = { write: text => output.push(text), writeError: code => errors.push(code) };
  const status = await runStoryMetrics([context.directory, '--preview', preview, '--now', NOW], stream);
  assert.equal(status, 0, errors.join('\n'));
  const report = JSON.parse(output[0]);
  assert.equal(report.players.started, 1);
  assert.equal(report.players.inactivePending, 1);
  assert.equal(report.messages.count, 1);
  assert.doesNotMatch(output[0], /Nombre Privado|private-operation-key|@s\.whatsapp\.net|USR-/);
  for (const file of filenames) assert.equal(fs.readFileSync(path.join(context.directory, file), 'utf8'), before[file], file);
  assert.equal(fs.existsSync(path.join(context.directory, '.writer.lock')), false);
  output.length = 0;
  const invalidStatus = await runStoryMetrics([context.directory, '--now', 'secret-invalid-date'], stream);
  assert.equal(invalidStatus, 1);
  assert.deepEqual(errors, ['INVALID_STORY_METRICS']);
  assert.deepEqual(output, []);
  assert.equal(fs.existsSync(path.join(context.directory, '.writer.lock')), false);
});

test('metrics reporting refuses migrations and journal recovery while preserving existing evidence', async t => {
  const context = setup(t);
  await context.game.validateDatabase();
  await context.game.close();
  const manifestFile = path.join(context.directory, '_database.json');
  const manifest = fs.readFileSync(manifestFile, 'utf8');
  const historical = JSON.stringify({ database: 'chengdu-cards', schemaVersion: 11 });
  fs.writeFileSync(manifestFile, historical);
  const errors = [], stream = { write: () => assert.fail('An unsafe reporting state must not produce a report'), writeError: code => errors.push(code) };
  assert.equal(await runStoryMetrics([context.directory], stream), 1);
  assert.deepEqual(errors, ['STORY_METRICS_SCHEMA_REQUIRED']);
  assert.equal(fs.readFileSync(manifestFile, 'utf8'), historical);
  fs.writeFileSync(manifestFile, manifest);
  const journalFile = path.join(context.directory, '_journal.json'), evidence = 'private journal evidence';
  fs.writeFileSync(journalFile, evidence);
  assert.equal(await runStoryMetrics([context.directory], stream), 1);
  assert.deepEqual(errors, ['STORY_METRICS_SCHEMA_REQUIRED', 'STORY_METRICS_RECOVERY_REQUIRED']);
  assert.equal(fs.readFileSync(journalFile, 'utf8'), evidence);
  assert.equal(fs.readFileSync(manifestFile, 'utf8'), manifest);
  assert.equal(fs.existsSync(path.join(context.directory, '.writer.lock')), false);
});
