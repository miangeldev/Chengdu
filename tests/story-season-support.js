import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { setup, register } from './helpers.js';
import { JsonUnitOfWork } from '../storage/unitOfWork.js';
import { createGame } from '../game/createGame.js';
import { activeStoryMission, currentStoryStep } from '../game/story/catalog.js';
import { storySeasonTacticalAction, storyTacticalAction } from '../scripts/simulate-story-balance.js';

export const NOW = '2026-10-18T20:00:00.000Z';
export function seasonDriver(context, tag = 'season') {
  let sequence = 0;
  context.invoke = (kind, args = {}) => context.game.story[kind]({ userId: context.user.id,
    operationKey: `${tag}:${++sequence}`, ...args });
  context.get = () => context.game.story.getState({ userId: context.user.id });
  context.step = async (choices = {}) => {
    const state = await context.get(), progress = state.progress;
    if (!progress) return context.invoke('start');
    if (progress.stage === 'choice') {
      const step = currentStoryStep(activeStoryMission(progress), progress);
      return context.invoke('choose', { choice: choices[`${state.mission.code}:${step?.id}`] ??
        choices[state.mission.code] ?? step?.requiredChoice ?? '1' });
    }
    if (progress.stage === 'community') return context.invoke('contribute');
    if (progress.stage === 'defeated') return context.invoke('retry');
    if (progress.stage !== 'battle') return context.invoke('continue');
    const record = await context.storage.withRead(repos => repos.storyBattles.get(progress.activeBattleId));
    const request = record.combat.version < 3 || record.combat.encounterId === 'P03'
      ? storyTacticalAction(record.combat) : storySeasonTacticalAction(record.combat);
    return context.invoke('act', request);
  };
  context.until = async (predicate, choices = {}, limit = 1200) => {
    let state = await context.get();
    for (let index = 0; index < limit && !predicate(state); index++) state = await context.step(choices);
    assert.ok(predicate(state), `Checkpoint unreachable: ${state.mission?.code}/${state.progress?.stage}, ${state.battle?.encounterId}`);
    return state;
  };
  return context;
}
export async function seasonFixture(t, options = {}) {
  const context = setup(t, { clock: () => NOW, randomRoll: () => 30, backupRetention: 2, ...options });
  context.user = await register(context.game);
  context.unit = (await context.game.starter.claimStarter({ userId: context.user.id, choice: options.starter ?? 'panda' })).unit;
  return seasonDriver(context);
}
// Fork an actual committed checkpoint. All receipts, ownership history and
// action proofs remain intact; no mission or reward is fabricated for tests.
export async function forkSeason(t, context, tag, options = {}) {
  await context.game.close();
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chengdu-season-fork-'));
  fs.cpSync(context.directory, directory, { recursive: true });
  const storage = new JsonUnitOfWork({ directory, clock: () => NOW, backupRetention: 2, ...options });
  const fork = { directory, storage, game: createGame({ storage, randomRoll: () => 30, ...options }), user: context.user, unit: context.unit };
  t.after(async () => { await fork.game.close(); fs.rmSync(directory, { recursive: true, force: true }); });
  Object.assign(context, context.open());
  return seasonDriver(fork, tag);
}
