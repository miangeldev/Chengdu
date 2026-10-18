import { requireGame } from '../../utils/GameError.js';
import * as prior from './progressV2.js';
import { STORY_CAMPAIGN_ID, STORY_CONTENT_VERSION, STORY_TRACES, storyMissions, getStoryMission,
  activeStoryMission, currentStoryStep, storyEncounterFor } from './catalog.js';
export const storyProgressId = prior.storyProgressId;
export const storyRewardId = prior.storyRewardId;
export function stageForMission(mission, stepIndex = 0) {
  if (mission?.kind !== 'sequence') return prior.stageForMission(mission);
  const step = mission.steps[stepIndex];
  return !step ? 'complete' : step.choices?.length ? 'choice' : step.communityObjective ? 'community' : 'ready';
}
export function initialStoryProgress(userId, now, previous = null, version = STORY_CONTENT_VERSION) {
  if (version < 3) return prior.initialStoryProgress(userId, now, previous, version);
  return { ...prior.initialStoryProgress(userId, now, previous, 2), contentVersion: 3,
    activityId: null, activities: {}, completedActivityIds: [], suspended: null, contributions: {} };
}
export function upgradeStoryProgress(previous, now, version = STORY_CONTENT_VERSION) {
  if (version < 3) return prior.upgradeStoryProgress(previous, now, version);
  requireGame(previous && [1,2].includes(previous.contentVersion), 'STORY_INVALID_ACTION');
  requireGame(Date.parse(now) >= Date.parse(previous.updatedAt), 'INVALID_CLOCK');
  const progress = { ...structuredClone(previous), contentVersion: 3, traces: previous.traces ?? [],
    sceneStep: previous.sceneStep ?? 0, activityId: null, activities: {}, completedActivityIds: [], suspended: null,
    contributions: {}, updatedAt: now };
  if (progress.status === 'complete') { progress.status = 'playing'; progress.stage = stageForMission(getStoryMission(progress.missionIndex, 3)); }
  return progress;
}
const cursor = progress => ({ stage: progress.stage, sceneStep: progress.sceneStep, lastBattleId: progress.lastBattleId,
  lastConsequence: progress.lastConsequence, status: progress.status });
function leaveActivity(progress, completed = false) {
  const id = progress.activityId;
  progress.activities[id] = { ...cursor(progress), status: completed ? 'complete' : 'playing' };
  if (completed && !progress.completedActivityIds.includes(id)) progress.completedActivityIds.push(id);
  Object.assign(progress, progress.suspended);
  progress.activityId = null; progress.suspended = null; progress.activeBattleId = null;
}
function complete(progress, mission) {
  if (mission.reward.memory && !progress.memories.includes(mission.reward.memory)) progress.memories.push(mission.reward.memory);
  const trace = STORY_TRACES.find(trace => trace.missionId === mission.id);
  if (trace && !progress.traces.includes(trace.id)) progress.traces.push(trace.id);
  if (mission.completionScene?.length) progress.lastConsequence = mission.completionScene.join('\n');
  if (progress.activityId) { const consequence = progress.lastConsequence; leaveActivity(progress, true); progress.lastConsequence = consequence; return; }
  if (!progress.completedMissionIds.includes(mission.id)) progress.completedMissionIds.push(mission.id);
  progress.missionIndex++; progress.sceneStep = 0;
  progress.status = progress.missionIndex === storyMissions(3).length ? 'complete' : 'playing';
  progress.stage = stageForMission(getStoryMission(progress.missionIndex, 3));
  progress.activeBattleId = null;
}
function advance(progress, mission) {
  if (progress.sceneStep + 1 >= mission.steps.length) complete(progress, mission);
  else { progress.sceneStep++; progress.stage = stageForMission(mission, progress.sceneStep); progress.activeBattleId = null; }
}
function beginBattle(progress, action, mission) {
  requireGame(typeof action.battleId === 'string', 'STORY_BATTLE_NOT_ACTIVE');
  progress.activeBattleId = action.battleId; progress.lastBattleId = action.battleId; progress.stage = 'battle';
  const key = mission.kind === 'sequence' ? `${mission.id}:${progress.sceneStep}` : mission.id;
  progress.attempts[key] = (progress.attempts[key] ?? 0) + 1;
}
export function completedStoryMission(previous, next, action) {
  if (!previous || !['continue','choose','act'].includes(action.kind)) return null;
  const mission = activeStoryMission(previous);
  if (previous.activityId) return next.activityId === null && next.completedActivityIds.includes(previous.activityId) ? mission : null;
  return next.missionIndex === previous.missionIndex + 1 ? mission : null;
}
export function reduceStoryProgress(previous, action, combat = null) {
  if (action.contentVersion < 3) return prior.reduceStoryProgress(previous, action, combat);
  requireGame(action.campaignId === STORY_CAMPAIGN_ID && action.contentVersion === 3, 'STORY_INVALID_ACTION');
  if (action.kind === 'start') { requireGame(previous === null, 'STORY_ALREADY_STARTED'); return initialStoryProgress(action.userId, action.createdAt); }
  if (action.kind === 'upgrade') return upgradeStoryProgress(previous, action.createdAt);
  if (action.kind === 'reset') return initialStoryProgress(action.userId, action.createdAt, previous);
  requireGame(previous?.contentVersion === 3, 'STORY_NOT_STARTED');
  requireGame(Date.parse(action.createdAt) >= Date.parse(previous.updatedAt), 'INVALID_CLOCK');
  const progress = structuredClone(previous), mission = activeStoryMission(progress), step = currentStoryStep(mission, progress);
  progress.updatedAt = action.createdAt; progress.lastConsequence = null;
  if (action.kind === 'optional' || action.kind === 'trial') {
    requireGame(!progress.activityId, 'STORY_ACTIVITY_LOCKED');
    requireGame(progress.stage !== 'battle', 'STORY_BATTLE_ACTIVE');
    const selected = getStoryMission(action.request.code, 3);
    requireGame(selected && (action.kind === 'trial' ? selected.code.startsWith('PRUEBA-') : /-A$/.test(selected.code)), 'STORY_INVALID_ACTIVITY');
    requireGame(action.kind === 'trial' ? progress.missionIndex === storyMissions(3).length :
      progress.completedMissionIds.includes(selected.afterMissionId), action.kind === 'trial' ? 'STORY_SEASON_REQUIRED' : 'STORY_SIDE_LOCKED');
    progress.suspended = cursor(progress); progress.activityId = selected.id;
    const saved = progress.activities[selected.id];
    Object.assign(progress, saved?.status === 'playing' ? saved : { sceneStep: 0, stage: stageForMission(selected), status: 'playing', lastBattleId: null, lastConsequence: null });
    progress.status = 'playing';
    return progress;
  }
  if (action.kind === 'return') {
    requireGame(progress.activityId, 'STORY_MAIN_REQUIRED'); requireGame(progress.stage !== 'battle', 'STORY_BATTLE_ACTIVE');
    leaveActivity(progress); return progress;
  }
  requireGame(progress.status !== 'complete' && mission, 'STORY_COMPLETE');
  if (mission.kind !== 'sequence') {
    const legacyBefore = { ...progress, contentVersion: 2 };
    const legacyAction = { ...action, contentVersion: 2 };
    const next = prior.reduceStoryProgress(legacyBefore, legacyAction, combat);
    next.contentVersion = 3;
    if (next.missionIndex > progress.missionIndex && next.missionIndex === 14) { next.status = 'playing'; next.stage = stageForMission(getStoryMission(14, 3)); }
    return next;
  }
  if (action.kind === 'contribute') {
    requireGame(progress.stage === 'community' && step.communityObjective && action.community, 'STORY_CONTRIBUTION_REQUIRED');
    requireGame(action.community.objective === step.communityObjective, 'STORY_INVALID_ACTION');
    progress.contributions[step.communityObjective] = structuredClone(action.community);
    progress.lastConsequence = action.community.clanId ? 'Tu aporte quedó unido a los de tu Casa. Cada Custodio puede contribuir a su ritmo.' : 'Has reconstruido tu parte del pabellón. El camino individual conserva la misma progresión.';
    advance(progress, mission); return progress;
  }
  if (action.kind === 'choose') {
    requireGame(progress.stage === 'choice', 'STORY_INVALID_CHOICE');
    const choice = step.choices.find(choice => choice.id === action.request.choice);
    requireGame(choice, 'STORY_INVALID_CHOICE');
    progress.decisions[choice.key] = choice.value; progress.lastConsequence = choice.consequence;
    if (step.requiredChoice && choice.id !== step.requiredChoice) return progress;
    if (storyEncounterFor(mission, progress)) beginBattle(progress, action, mission); else advance(progress, mission);
  } else if (action.kind === 'continue') {
    requireGame(progress.stage !== 'choice', 'STORY_CHOICE_REQUIRED');
    requireGame(progress.stage !== 'community', 'STORY_CONTRIBUTION_REQUIRED');
    requireGame(progress.stage !== 'battle', 'STORY_BATTLE_ACTIVE');
    requireGame(progress.stage !== 'defeated', 'STORY_RETRY_REQUIRED');
    if (storyEncounterFor(mission, progress)) beginBattle(progress, action, mission); else advance(progress, mission);
  } else if (action.kind === 'retry') {
    requireGame(progress.stage === 'defeated', 'STORY_RETRY_REQUIRED'); beginBattle(progress, action, mission);
  } else if (action.kind === 'act') {
    requireGame(progress.stage === 'battle' && progress.activeBattleId === action.battleId && combat, 'STORY_BATTLE_NOT_ACTIVE');
    if (combat.status === 'won' || combat.status === 'lost' && step.acceptDefeat && combat.finishReason !== 'surrender') {
      if (step.resultKey) progress.decisions[step.resultKey] = combat.status;
      advance(progress, mission);
    } else if (combat.status === 'lost') { progress.stage = 'defeated'; progress.activeBattleId = null; }
  } else requireGame(false, 'STORY_INVALID_ACTION');
  return progress;
}
