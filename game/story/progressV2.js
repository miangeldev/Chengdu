import { requireGame } from '../../utils/GameError.js';
import { STORY_CAMPAIGN_ID, STORY_CONTENT_VERSION, STORY_TRACES, isStoryContentVersion, storyMissions, getStoryMission } from './catalogV2.js';

export const storyProgressId = userId => `story:${STORY_CAMPAIGN_ID}:${userId}`;
export const storyRewardId = (userId, missionId) => `SR:${STORY_CAMPAIGN_ID}:${userId}:${missionId}`;
export const stageForMission = mission => mission ? mission.choices.length ? 'choice' : mission.kind === 'starter' ? 'starter' : 'ready' : 'complete';

export function initialStoryProgress(userId, now, previous = null, version = STORY_CONTENT_VERSION) {
  return { id: storyProgressId(userId), userId, campaignId: STORY_CAMPAIGN_ID, contentVersion: version,
    run: (previous?.run ?? 0) + 1, status: 'playing', missionIndex: 0, stage: 'choice',
    decisions: {}, memories: [], completedMissionIds: [], attempts: {}, activeBattleId: null, lastBattleId: null,
    lastConsequence: null, createdAt: previous?.createdAt ?? now, updatedAt: now,
    ...(version >= 2 ? { traces: [], sceneStep: 0 } : {}) };
}

export function upgradeStoryProgress(previous, now, version = STORY_CONTENT_VERSION) {
  requireGame(previous?.contentVersion === 1 && version === 2, 'STORY_INVALID_ACTION');
  requireGame(Date.parse(now) >= Date.parse(previous.updatedAt), 'INVALID_CLOCK');
  const progress = { ...structuredClone(previous), contentVersion: version, traces: [], sceneStep: 0, updatedAt: now };
  if (progress.status === 'complete') {
    progress.status = 'playing';
    progress.stage = stageForMission(getStoryMission(progress.missionIndex, version));
  }
  return progress;
}

function completeMission(progress, mission) {
  progress.completedMissionIds.push(mission.id);
  if (mission.reward.memory && !progress.memories.includes(mission.reward.memory)) progress.memories.push(mission.reward.memory);
  if (mission.code === 'I-02') progress.memories.push(progress.decisions.forest_choice === 'help' ? 'gratitud_del_bosque' : 'huella_de_tinta');
  if (mission.code === 'I-03' && progress.decisions.echo_approach !== 'attack') progress.memories.push('confianza_de_lian');
  if (progress.contentVersion >= 2) {
    const trace = STORY_TRACES.find(trace => trace.missionId === mission.id);
    if (trace && !progress.traces.includes(trace.id)) progress.traces.push(trace.id);
    if (mission.code === 'II-03') progress.memories.push(progress.decisions.impossible_offer === 'reject' ? 'cautela_del_testigo' : 'oferta_imposible');
    if (mission.completionScene?.length) progress.lastConsequence = mission.completionScene.join('\n');
    progress.sceneStep = 0;
  }
  progress.missionIndex++;
  progress.status = progress.missionIndex === storyMissions(progress.contentVersion).length ? 'complete' : 'playing';
  progress.stage = stageForMission(getStoryMission(progress.missionIndex, progress.contentVersion));
  progress.activeBattleId = null;
}

function beginBattle(progress, action) {
  requireGame(typeof action.battleId === 'string', 'STORY_BATTLE_NOT_ACTIVE');
  const mission = getStoryMission(progress.missionIndex, progress.contentVersion);
  progress.activeBattleId = action.battleId; progress.lastBattleId = action.battleId; progress.stage = 'battle';
  progress.attempts[mission.id] = (progress.attempts[mission.id] ?? 0) + 1;
}

export function reduceStoryProgress(previous, action, combat = null) {
  requireGame(action.campaignId === STORY_CAMPAIGN_ID && isStoryContentVersion(action.contentVersion), 'STORY_INVALID_ACTION');
  if (action.kind === 'start') {
    requireGame(previous === null, 'STORY_ALREADY_STARTED');
    return initialStoryProgress(action.userId, action.createdAt, null, action.contentVersion);
  }
  if (action.kind === 'upgrade') return upgradeStoryProgress(previous, action.createdAt, action.contentVersion);
  if (action.kind === 'reset') return initialStoryProgress(action.userId, action.createdAt, previous, action.contentVersion);
  requireGame(previous, 'STORY_NOT_STARTED');
  requireGame(previous.contentVersion === action.contentVersion, 'STORY_INVALID_ACTION');
  requireGame(previous.status !== 'complete', 'STORY_COMPLETE');
  const progress = structuredClone(previous), mission = getStoryMission(progress.missionIndex, progress.contentVersion);
  requireGame(Date.parse(action.createdAt) >= Date.parse(progress.updatedAt), 'INVALID_CLOCK');
  progress.lastConsequence = null; progress.updatedAt = action.createdAt;
  if (action.kind === 'choose') {
    requireGame(progress.stage === 'choice', progress.stage === 'battle' ? 'STORY_BATTLE_ACTIVE' : 'STORY_INVALID_CHOICE');
    const choice = mission.choices.find(value => value.id === action.request.choice);
    requireGame(choice, 'STORY_INVALID_CHOICE');
    progress.decisions[choice.key] = choice.value; progress.lastConsequence = choice.consequence;
    if (mission.encounterId) beginBattle(progress, action);
    else if (mission.kind === 'investigation') { progress.stage = 'investigation'; progress.sceneStep = 1; }
    else completeMission(progress, mission);
  } else if (action.kind === 'continue') {
    requireGame(progress.stage !== 'choice', 'STORY_CHOICE_REQUIRED');
    requireGame(progress.stage !== 'battle', 'STORY_BATTLE_ACTIVE');
    requireGame(progress.stage !== 'defeated', 'STORY_RETRY_REQUIRED');
    if (mission.kind === 'investigation' && progress.sceneStep === 1) progress.sceneStep = 2;
    else if (mission.encounterId) beginBattle(progress, action);
    else completeMission(progress, mission);
  } else if (action.kind === 'act') {
    requireGame(progress.stage === 'battle' && progress.activeBattleId === action.battleId && combat, 'STORY_BATTLE_NOT_ACTIVE');
    if (combat.status === 'won') completeMission(progress, mission);
    else if (combat.status === 'lost') { progress.stage = 'defeated'; progress.activeBattleId = null; }
  } else if (action.kind === 'retry') {
    requireGame(progress.stage === 'defeated', 'STORY_RETRY_REQUIRED'); beginBattle(progress, action);
  } else requireGame(false, 'STORY_INVALID_ACTION');
  return progress;
}
