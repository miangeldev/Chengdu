import { requireGame } from '../../utils/GameError.js';
import { STORY_CAMPAIGN_ID, STORY_CONTENT_VERSION, STORY_MISSIONS, getStoryMission } from './catalog.js';

export const storyProgressId = userId => `story:${STORY_CAMPAIGN_ID}:${userId}`;
export const storyRewardId = (userId, missionId) => `SR:${STORY_CAMPAIGN_ID}:${userId}:${missionId}`;
export const stageForMission = mission => mission ? mission.choices.length ? 'choice' : mission.kind === 'starter' ? 'starter' : 'ready' : 'complete';

export function initialStoryProgress(userId, now, previous = null) {
  return { id: storyProgressId(userId), userId, campaignId: STORY_CAMPAIGN_ID, contentVersion: STORY_CONTENT_VERSION,
    run: (previous?.run ?? 0) + 1, status: 'playing', missionIndex: 0, stage: 'choice',
    decisions: {}, memories: [], completedMissionIds: [], attempts: {}, activeBattleId: null, lastBattleId: null,
    lastConsequence: null, createdAt: previous?.createdAt ?? now, updatedAt: now };
}

function completeMission(progress, mission) {
  progress.completedMissionIds.push(mission.id);
  if (mission.reward.memory && !progress.memories.includes(mission.reward.memory)) progress.memories.push(mission.reward.memory);
  if (mission.code === 'I-02') progress.memories.push(progress.decisions.forest_choice === 'help' ? 'gratitud_del_bosque' : 'huella_de_tinta');
  if (mission.code === 'I-03' && progress.decisions.echo_approach !== 'attack') progress.memories.push('confianza_de_lian');
  progress.missionIndex++;
  progress.status = progress.missionIndex === STORY_MISSIONS.length ? 'complete' : 'playing';
  progress.stage = stageForMission(getStoryMission(progress.missionIndex));
  progress.activeBattleId = null;
}

function beginBattle(progress, action) {
  requireGame(typeof action.battleId === 'string', 'STORY_BATTLE_NOT_ACTIVE');
  const mission = getStoryMission(progress.missionIndex);
  progress.activeBattleId = action.battleId; progress.lastBattleId = action.battleId; progress.stage = 'battle';
  progress.attempts[mission.id] = (progress.attempts[mission.id] ?? 0) + 1;
}

// A small, versioned reducer makes every saved choice, retry and reset auditable.
export function reduceStoryProgress(previous, action, combat = null) {
  requireGame(action.campaignId === STORY_CAMPAIGN_ID && action.contentVersion === STORY_CONTENT_VERSION, 'STORY_INVALID_ACTION');
  if (action.kind === 'start') {
    requireGame(previous === null, 'STORY_ALREADY_STARTED');
    return initialStoryProgress(action.userId, action.createdAt);
  }
  if (action.kind === 'reset') return initialStoryProgress(action.userId, action.createdAt, previous);
  requireGame(previous, 'STORY_NOT_STARTED');
  requireGame(previous.status !== 'complete', 'STORY_COMPLETE');
  const progress = structuredClone(previous), mission = getStoryMission(progress.missionIndex);
  requireGame(Date.parse(action.createdAt) >= Date.parse(progress.updatedAt), 'INVALID_CLOCK');
  progress.lastConsequence = null; progress.updatedAt = action.createdAt;
  if (action.kind === 'choose') {
    requireGame(progress.stage === 'choice', progress.stage === 'battle' ? 'STORY_BATTLE_ACTIVE' : 'STORY_INVALID_CHOICE');
    const choice = mission.choices.find(value => value.id === action.request.choice);
    requireGame(choice, 'STORY_INVALID_CHOICE');
    progress.decisions[choice.key] = choice.value; progress.lastConsequence = choice.consequence;
    if (mission.encounterId) beginBattle(progress, action); else completeMission(progress, mission);
  } else if (action.kind === 'continue') {
    requireGame(progress.stage !== 'choice', 'STORY_CHOICE_REQUIRED');
    requireGame(progress.stage !== 'battle', 'STORY_BATTLE_ACTIVE');
    requireGame(progress.stage !== 'defeated', 'STORY_RETRY_REQUIRED');
    if (mission.encounterId) beginBattle(progress, action); else completeMission(progress, mission);
  } else if (action.kind === 'act') {
    requireGame(progress.stage === 'battle' && progress.activeBattleId === action.battleId && combat, 'STORY_BATTLE_NOT_ACTIVE');
    if (combat.status === 'won') completeMission(progress, mission);
    else if (combat.status === 'lost') { progress.stage = 'defeated'; progress.activeBattleId = null; }
  } else if (action.kind === 'retry') {
    requireGame(progress.stage === 'defeated', 'STORY_RETRY_REQUIRED'); beginBattle(progress, action);
  } else requireGame(false, 'STORY_INVALID_ACTION');
  return progress;
}
