import { requireGame } from '../../utils/GameError.js';
import { creditCoinsInTransaction } from '../economy/coinOperations.js';
import { grantXp } from '../progression/rules.js';
import { STORY_CAMPAIGN_ID, STORY_CONTENT_VERSION } from './catalog.js';
import { storyRewardId } from './progress.js';

export async function rewardStoryMission(repos, { userId, mission, actionId, run, unitRefs, now }) {
  const id = storyRewardId(userId, mission.id), existing = await repos.storyRewards.get(id);
  if (existing) return { ...existing, alreadyClaimed: true };
  const user = await repos.users.get(userId), definition = mission.reward;
  requireGame(user, 'USER_NOT_FOUND');
  requireGame(definition.unitXp === 0 || unitRefs.length > 0, 'STORY_TEAM_REQUIRED');
  const credited = await creditCoinsInTransaction(repos, user, definition.coins, now, { type: 'story_reward', id });
  const unitRewards = [];
  for (const ref of definition.unitXp > 0 ? unitRefs : []) {
    const unit = await repos.units.get(ref.unitId);
    requireGame(unit?.ownerId === userId && unit.ownershipVersion === ref.ownershipVersion && unit.lock === null, 'UNIT_LOCKED');
    const progressAfter = grantXp(unit.progress, definition.unitXp, 'unit');
    unitRewards.push({ unitId: unit.id, ownershipVersion: unit.ownershipVersion, xp: definition.unitXp,
      progressBefore: unit.progress, progressAfter });
    await repos.units.replace({ ...unit, progress: progressAfter, updatedAt: now });
  }
  const userProgressAfter = grantXp(user.progress, definition.userXp, 'user');
  const reward = { id, userId, campaignId: STORY_CAMPAIGN_ID, contentVersion: STORY_CONTENT_VERSION,
    missionId: mission.id, missionCode: mission.code, actionId, run, createdAt: now,
    ...structuredClone(definition), unitRewards,
    balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins,
    userProgressBefore: user.progress, userProgressAfter };
  await repos.users.replace({ ...credited, progress: userProgressAfter });
  await repos.storyRewards.insert(reward);
  return { ...reward, alreadyClaimed: false };
}
