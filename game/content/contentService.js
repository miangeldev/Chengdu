import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { expireBattles } from '../battle/lifecycle.js';
import { ACHIEVEMENTS, CONTENT_POLICY_VERSION, MISSIONS } from './catalog.js';
import { achievementProgress, contentPeriod, missionProgress, nextMissionReset, objectiveState } from './objectives.js';
import { grantContentReward, ticketBalance, validContentKey } from './rewards.js';
import { activeCampaign } from './encounterRules.js';

async function userFor(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function rewardReplay(repos, userId, operationKey, kind, matches) {
  const previous = await repos.contentRewards.find(reward => reward.operationKey === operationKey);
  if (!previous) {
    requireGame(!await repos.contentActions.find(action => action.operationKey === operationKey), 'OPERATION_CONFLICT');
    return null;
  }
  requireGame(previous.userId === userId && previous.kind === kind && matches(previous), 'OPERATION_CONFLICT');
  return { reward: previous, alreadyClaimed: true };
}

async function campaignFor(repos, eventId) {
  requireGame(typeof eventId === 'string', 'EVENT_NOT_FOUND');
  const value = eventId.trim().toLowerCase();
  const campaign = await repos.campaigns.find(event => event.id === value || event.code === value);
  requireGame(campaign, 'EVENT_NOT_FOUND');
  return campaign;
}

async function eventView(repos, campaign, now, userId = null) {
  const active = activeCampaign(campaign, now);
  const status = active ? 'active' : Date.parse(now) < Date.parse(campaign.startsAt) ? 'upcoming' : 'ended';
  const characters = await Promise.all(campaign.characterIds.map(async id => {
    const character = await repos.characters.get(id);
    const counter = await repos.state.get(`mint:${id}`);
    return { id, name: character.name, rarity: character.rarity, issued: counter.issuedCount,
      max: character.supply.max, available: active && character.obtainable && character.supply.grandfatheredIssued === undefined && counter.issuedCount < character.supply.max };
  }));
  const welcomeClaimed = userId !== null && Boolean(await repos.contentRewards.find(reward => reward.kind === 'event' && reward.sourceId === campaign.id && reward.userId === userId));
  return { ...campaign, status, characters, welcomeClaimed };
}

export function createContentService(storage, clock) {
  async function refresh(repos) {
    const now = clock();
    dailyTimestamp(now);
    await expireBattles(repos, now);
    return now;
  }

  async function unlocks(repos, userId, now) {
    const state = await objectiveState(repos);
    const result = [];
    for (const definition of ACHIEVEMENTS) {
      const id = `ACH:${userId}:${definition.id}`;
      let unlock = await repos.achievements.get(id);
      const progress = achievementProgress(state, userId, definition.id, now);
      if (!unlock && progress.current >= definition.target) unlock = await repos.achievements.insert({ id,
        userId, achievementId: definition.id, policyVersion: CONTENT_POLICY_VERSION, unlockedAt: now,
        snapshot: structuredClone(definition), evidence: progress.evidence });
      const claimed = Boolean(await repos.contentRewards.find(reward => reward.kind === 'achievement' && reward.sourceId === definition.id && reward.userId === userId));
      result.push({ ...(unlock?.snapshot ?? definition), current: Math.max(progress.current, unlock ? definition.target : 0),
        unlocked: Boolean(unlock), unlockedAt: unlock?.unlockedAt ?? null, claimed });
    }
    return result;
  }

  return {
    async getMissions(userId) {
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const now = await refresh(repos);
        const period = contentPeriod(now);
        const progress = missionProgress(await objectiveState(repos), userId, period, now);
        const missions = await Promise.all(MISSIONS.map(async definition => {
          const current = definition.metric === 'characters' ? progress.characters.length : progress[definition.metric];
          const claimed = Boolean(await repos.contentRewards.find(reward => reward.userId === userId && reward.kind === 'mission' && reward.sourceId === `${period}:${definition.id}`));
          return { ...definition, current, complete: current >= definition.target, claimed };
        }));
        return { period, resetsAt: nextMissionReset(now), missions };
      });
    },
    async claimMission({ userId, code, operationKey }) {
      validContentKey(operationKey);
      const definition = MISSIONS.find(mission => mission.code === String(code) || mission.id === code);
      requireGame(definition, 'MISSION_NOT_FOUND');
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const replay = await rewardReplay(repos, userId, operationKey, 'mission', reward => reward.details.missionId === definition.id);
        if (replay) return replay;
        const now = await refresh(repos);
        const period = contentPeriod(now);
        const sourceId = `${period}:${definition.id}`;
        const previous = await repos.contentRewards.find(reward => reward.userId === userId && reward.kind === 'mission' && reward.sourceId === sourceId);
        if (previous) return { reward: previous, alreadyClaimed: true };
        const evidence = missionProgress(await objectiveState(repos), userId, period, now);
        const current = definition.metric === 'characters' ? evidence.characters.length : evidence[definition.metric];
        requireGame(current >= definition.target, 'MISSION_NOT_READY');
        return grantContentReward(repos, { userId, kind: 'mission', sourceId, operationKey, ...definition.reward,
          createdAt: now, details: { missionId: definition.id, period, evidence } });
      });
    },
    async getAchievements(userId, options = {}) {
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const now = await refresh(repos);
        return paginate(await unlocks(repos, userId, now), options, `achievements:${userId}`, row => [row.code.padStart(6, '0'), row.id]);
      });
    },
    async claimAchievement({ userId, code, operationKey }) {
      validContentKey(operationKey);
      const definition = ACHIEVEMENTS.find(achievement => achievement.code === String(code).toUpperCase() || achievement.id === code);
      requireGame(definition, 'ACHIEVEMENT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const replay = await rewardReplay(repos, userId, operationKey, 'achievement', reward => reward.sourceId === definition.id);
        if (replay) return replay;
        const previous = await repos.contentRewards.find(reward => reward.kind === 'achievement' && reward.sourceId === definition.id && reward.userId === userId);
        if (previous) return { reward: previous, alreadyClaimed: true };
        const now = await refresh(repos);
        const achievements = await unlocks(repos, userId, now);
        const achievement = achievements.find(row => row.id === definition.id);
        requireGame(achievement.unlocked, 'ACHIEVEMENT_NOT_READY');
        return grantContentReward(repos, { userId, kind: 'achievement', sourceId: definition.id, operationKey,
          ...achievement.reward, createdAt: now, details: { achievementId: definition.id } });
      });
    },
    async getInventory(userId) {
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const now = await refresh(repos);
        const achievements = (await unlocks(repos, userId, now)).filter(row => row.unlocked);
        return { tickets: await ticketBalance(repos, userId), titles: achievements.map(row => row.title),
          badges: achievements.map(row => row.badge), achievementsCount: achievements.length };
      });
    },
    async getEvents(options = {}) {
      return storage.withRead(async repos => {
        const now = clock();
        dailyTimestamp(now);
        const page = paginate(await repos.campaigns.all(), options, 'campaigns', row => [row.startsAt, row.id]);
        page.items = await Promise.all(page.items.map(campaign => eventView(repos, campaign, now)));
        return page;
      });
    },
    async getEvent(eventId, userId = null) {
      return storage.withRead(async repos => {
        if (userId !== null) await userFor(repos, userId);
        const now = clock();
        dailyTimestamp(now);
        return eventView(repos, await campaignFor(repos, eventId), now, userId);
      });
    },
    async claimEvent({ userId, eventId, operationKey }) {
      validContentKey(operationKey);
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const campaign = await campaignFor(repos, eventId);
        const replay = await rewardReplay(repos, userId, operationKey, 'event', reward => reward.sourceId === campaign.id);
        if (replay) return replay;
        const previous = await repos.contentRewards.find(reward => reward.userId === userId && reward.kind === 'event' && reward.sourceId === campaign.id);
        if (previous) return { reward: previous, alreadyClaimed: true };
        const now = await refresh(repos);
        requireGame(activeCampaign(campaign, now), 'EVENT_NOT_ACTIVE');
        return grantContentReward(repos, { userId, kind: 'event', sourceId: campaign.id, operationKey,
          ...campaign.welcome, createdAt: now, details: { campaignId: campaign.id } });
      });
    }
  };
}
