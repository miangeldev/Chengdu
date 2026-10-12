import { createHash, randomInt, randomUUID } from 'node:crypto';
import { GameError, requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { expireBattles } from '../battle/lifecycle.js';
import { expireListings } from '../market/lifecycle.js';
import { effectiveStats } from '../progression/rules.js';
import { advancedAttack } from '../battle/combatContent.js';
import { createUnitInTransaction } from '../units/unitGenerator.js';
import { BOSSES, CONTENT_POLICY_VERSION, SPAWN_POLICY } from './catalog.js';
import { grantContentReward } from './rewards.js';
import { activeCampaign, bossContributions, bossRewardFor, encounterCodeAt, encounterDeadline, referenceMatches, resolveBossAttack } from './encounterRules.js';

const checkKey = key => requireGame(typeof key === 'string' && key.length > 0 && key.length <= 200 && key.trim() === key, 'INVALID_OPERATION_KEY');
const group = chatId => requireGame(typeof chatId === 'string' && chatId.length <= 200 && /^[^\s]+@g\.us$/.test(chatId), 'CONTENT_GROUP_ONLY');
const bossTemplate = id => (Array.isArray(BOSSES) ? BOSSES : Object.values(BOSSES)).find(boss => boss.id === id);

async function participant(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function availableKey(repos, key) {
  requireGame(!await repos.contentActions.find(action => action.operationKey === key) &&
    !await repos.contentRewards.find(reward => reward.operationKey === key), 'OPERATION_CONFLICT');
}

export async function expireEncounters(repos, now) {
  dailyTimestamp(now);
  const expired = await repos.encounters.filter(encounter => encounter.status === 'active' && Date.parse(encounter.expiresAt) <= Date.parse(now));
  for (const encounter of expired) await repos.encounters.replace({ ...encounter, status: 'expired', updatedAt: now, endedAt: now });
  return expired.length;
}

async function view(repos, encounter, userId = null) {
  const all = await repos.encounters.all();
  const result = { ...encounter, code: encounterCodeAt(encounter, all.findIndex(row => row.id === encounter.id)) };
  if (encounter.kind === 'spawn') return result;
  const actions = await repos.contentActions.filter(action => action.encounterId === encounter.id && action.kind === 'boss_attack');
  const contributions = bossContributions(actions);
  const users = new Map((await repos.users.all()).map(user => [user.id, user.name]));
  result.participants = contributions.map(({ first, ...contribution }) => ({ ...contribution, name: users.get(contribution.userId) }));
  result.totalDamage = encounter.snapshot.hp - encounter.hp;
  result.totalAttacks = actions.length;
  result.winnerName = encounter.winnerId === null ? null : users.get(encounter.winnerId);
  result.nextEncounterAt = encounterDeadline(encounter.createdAt, encounter.snapshot.respawnMs);
  if (userId !== null) {
    const user = await participant(repos, userId);
    result.myContribution = result.participants.find(contribution => contribution.userId === userId) ?? { userId, name: user.name, damage: 0, attacks: 0 };
    const last = actions.filter(action => action.userId === userId).at(-1);
    result.cooldownUntil = last ? encounterDeadline(last.createdAt, encounter.snapshot.cooldownMs) : null;
    result.attacksRemaining = Math.max(0, encounter.snapshot.maxAttacks - result.myContribution.attacks);
    const unit = user.team[0] ? await repos.units.get(user.team[0]) : null;
    const character = unit?.ownerId === userId && unit.lock === null ? await repos.characters.get(unit.characterId) : null;
    result.availableAttacks = character ? await Promise.all(character.attackIds.map(async (id, index) => {
      const attack = advancedAttack(await repos.attacks.get(id));
      return { choice: String(index + 1), name: attack.name, power: attack.power };
    })) : [];
  }
  return result;
}

async function findEncounter(repos, code, kind) {
  requireGame(typeof code === 'string' && code.length <= 100, 'ENCOUNTER_NOT_FOUND');
  const all = await repos.encounters.all();
  const encounter = all.find(row => row.kind === kind && referenceMatches(all, row.id, code, kind));
  requireGame(encounter, 'ENCOUNTER_NOT_FOUND');
  return encounter;
}

async function unitSnapshot(repos, user) {
  requireGame(user.team.length > 0, 'TEAM_EMPTY');
  const unit = await repos.units.get(user.team[0]);
  requireGame(unit?.ownerId === user.id, 'UNIT_NOT_OWNED');
  requireGame(unit.lock === null, 'UNIT_LOCKED');
  const character = await repos.characters.get(unit.characterId);
  return {
    id: unit.id, characterId: unit.characterId, characterName: character.name, ownerId: user.id,
    ownershipVersion: unit.ownershipVersion, progress: structuredClone(unit.progress),
    stats: effectiveStats(unit.initialStats, unit.progress.level, unit.statGrowthVersion, unit.traits, unit.traitVersion, unit.combatBaseStats),
    attacks: (await Promise.all(character.attackIds.map(id => repos.attacks.get(id)))).map(advancedAttack),
    traits: [...unit.traits], variant: unit.variant, traitVersion: unit.traitVersion
  };
}

export function createEncounterService(storage, clock, randomDropInt = upper => randomInt(upper)) {
  function roll(upper) {
    const value = randomDropInt(upper);
    requireGame(Number.isSafeInteger(value) && value >= 0 && value < upper, 'INVALID_RANDOM_ROLL');
    return value;
  }

  async function refresh(repos) {
    const now = clock();
    dailyTimestamp(now);
    await expireBattles(repos, now);
    await expireListings(repos, now);
    await expireEncounters(repos, now);
    return now;
  }

  async function ensureBoss(repos, bossId, now) {
    const normalized = { guardian: 'niebla', 'guardián': 'niebla', 'dragón': 'dragon' }[bossId] ?? bossId;
    const template = bossTemplate(normalized);
    requireGame(template, 'BOSS_NOT_FOUND');
    const latest = (await repos.encounters.filter(encounter => encounter.kind === 'boss' && encounter.snapshot.id === template.id)).at(-1);
    if (latest) {
      requireGame(dailyTimestamp(now) >= dailyTimestamp(latest.updatedAt), 'INVALID_CLOCK');
      if (latest.status === 'active' || Date.parse(now) < Date.parse(latest.createdAt) + latest.snapshot.respawnMs) return latest;
    }
    return repos.encounters.insert({
      id: `ENC-${randomUUID()}`, kind: 'boss', policyVersion: CONTENT_POLICY_VERSION, chatId: null,
      createdAt: now, expiresAt: encounterDeadline(now, template.durationMs), updatedAt: now, endedAt: null,
      status: 'active', snapshot: structuredClone(template), hp: template.hp, winnerId: null
    });
  }

  async function eligibleCharacters(repos, now) {
    const campaigns = new Map((await repos.campaigns.all()).map(campaign => [campaign.id, campaign]));
    const counters = new Map((await repos.state.filter(row => row.kind === 'mintCounter')).map(counter => [counter.characterId, counter]));
    return (await repos.characters.all()).filter(character => character.obtainable &&
      character.supply.grandfatheredIssued === undefined &&
      (character.supply.type !== 'limited' || counters.get(character.id)?.issuedCount < character.supply.max) &&
      (!character.eventId || activeCampaign(campaigns.get(character.eventId), now)));
  }

  async function insertSpawn(repos, character, chatId, now) {
    const campaign = character.eventId ? await repos.campaigns.get(character.eventId) : null;
    requireGame(!character.eventId || activeCampaign(campaign, now), 'EVENT_NOT_ACTIVE');
    const naturalExpiry = encounterDeadline(now, SPAWN_POLICY.durationMs);
    const expiresAt = campaign && Date.parse(campaign.endsAt) < Date.parse(naturalExpiry) ? campaign.endsAt : naturalExpiry;
    return repos.encounters.insert({
      id: `ENC-${randomUUID()}`, kind: 'spawn', policyVersion: CONTENT_POLICY_VERSION, chatId,
      createdAt: now, expiresAt, updatedAt: now, endedAt: null, status: 'active', hp: null, winnerId: null,
      snapshot: { characterId: character.id, characterName: character.name, rarity: character.rarity,
        campaignId: character.eventId ?? null, ticketCost: SPAWN_POLICY.ticketCost }
    });
  }

  const service = {
    async getBoss({ bossId = 'niebla', userId = null } = {}) {
      return storage.withTransaction(async repos => {
        const now = await refresh(repos);
        if (userId !== null) await participant(repos, userId);
        return view(repos, /^B[1-9]\d*$/i.test(bossId) ? await findEncounter(repos, bossId, 'boss') : await ensureBoss(repos, bossId, now), userId);
      });
    },
    async attackBoss({ userId, chatId, code = null, choice = '1', operationKey }) {
      checkKey(operationKey);
      group(chatId);
      requireGame(['1', '2'].includes(String(choice)), 'INVALID_ATTACK');
      const result = await storage.withTransaction(async repos => {
        await participant(repos, userId);
        const previous = await repos.contentActions.find(action => action.operationKey === operationKey);
        if (previous) {
          requireGame(previous.kind === 'boss_attack' && previous.userId === userId && previous.details.chatId === chatId &&
            previous.details.choice === String(choice) && referenceMatches(await repos.encounters.all(), previous.encounterId, code, 'boss'), 'OPERATION_CONFLICT');
          const boss = await repos.encounters.get(previous.encounterId);
          return { boss: await view(repos, boss, userId), action: previous, duplicate: true,
            rewards: await repos.contentRewards.filter(reward => reward.kind === 'boss' && reward.sourceId === boss.id && reward.userId === userId) };
        }
        await availableKey(repos, operationKey);
        const now = await refresh(repos);
        const boss = code === null ? await ensureBoss(repos, 'niebla', now) : await findEncounter(repos, code, 'boss');
        if (boss.status === 'expired') return { failure: 'BOSS_EXPIRED' };
        requireGame(boss.status === 'active', 'BOSS_NOT_ACTIVE');
        requireGame(dailyTimestamp(now) >= dailyTimestamp(boss.updatedAt), 'INVALID_CLOCK');
        const actions = await repos.contentActions.filter(action => action.kind === 'boss_attack' && action.encounterId === boss.id);
        const own = actions.filter(action => action.userId === userId);
        requireGame(own.length < boss.snapshot.maxAttacks, 'BOSS_ATTACK_LIMIT');
        const last = own.at(-1);
        requireGame(!last || Date.parse(now) >= Date.parse(last.createdAt) + boss.snapshot.cooldownMs,
          'BOSS_COOLDOWN', { availableAt: last ? encounterDeadline(last.createdAt, boss.snapshot.cooldownMs) : null });
        const user = await participant(repos, userId);
        const snapshot = await unitSnapshot(repos, user);
        const unit = await repos.units.get(snapshot.id);
        requireGame(dailyTimestamp(now) >= dailyTimestamp(unit.updatedAt), 'INVALID_CLOCK');
        const rolled = roll(100) + 1;
        const damage = resolveBossAttack(boss.snapshot, snapshot, String(choice), rolled, boss.hp);
        const action = await repos.contentActions.insert({
          id: `ACT-${randomUUID()}`, kind: 'boss_attack', encounterId: boss.id, userId, operationKey, createdAt: now,
          details: { unitSnapshot: snapshot, choice: String(choice), roll: rolled, ...damage, chatId }
        });
        const defeated = damage.hpAfter === 0;
        const updated = await repos.encounters.replace({ ...boss, hp: damage.hpAfter, updatedAt: now,
          status: defeated ? 'defeated' : 'active', endedAt: defeated ? now : null, winnerId: defeated ? userId : null });
        const rewards = [];
        if (defeated) {
          const contributions = bossContributions([...actions, action]);
          for (const contribution of contributions.filter(row => row.damage > 0)) {
            const amounts = bossRewardFor(boss.snapshot, contributions, contribution.userId, userId);
            const granted = await grantContentReward(repos, {
              userId: contribution.userId, kind: 'boss', sourceId: boss.id,
              operationKey: `boss-reward:${boss.id}:${contribution.userId}`, createdAt: now,
              coins: amounts.coins, userXp: amounts.userXp, tickets: amounts.tickets, ticketCost: 0,
              details: { encounterId: boss.id, damage: amounts.damage, components: amounts.components }
            });
            rewards.push(granted.reward);
          }
        }
        return { boss: await view(repos, updated, userId), action, duplicate: false, rewards };
      });
      if (result.failure) throw new GameError(result.failure);
      return result;
    },
    async getBossRanking(code = null, options = {}) {
      return storage.withTransaction(async repos => {
        const now = await refresh(repos);
        const boss = code === null ? await ensureBoss(repos, 'niebla', now) : await findEncounter(repos, code, 'boss');
        const result = await view(repos, boss);
        const ranking = result.participants.map((participant, index) => ({ name: participant.name, damage: participant.damage, attacks: participant.attacks, rank: index + 1 }));
        const page = paginate(ranking, options, `bossRanking:${boss.id}`, row => [String(row.rank).padStart(16, '0'), row.name]);
        return { ...page, boss: result };
      });
    },
    async observeActivity({ userId, chatId, messageId }) {
      group(chatId);
      requireGame(typeof messageId === 'string' && messageId.length > 0 && messageId.length <= 200, 'INVALID_OPERATION_KEY');
      const operationKey = `spawn-check:${createHash('sha256').update(JSON.stringify([chatId, messageId])).digest('hex')}`;
      return storage.withTransaction(async repos => {
        await participant(repos, userId);
        const previous = await repos.contentActions.find(action => action.operationKey === operationKey);
        if (previous) {
          requireGame(previous.kind === 'spawn_check' && previous.userId === userId && previous.details.chatId === chatId, 'OPERATION_CONFLICT');
          return { spawn: previous.details.spawnId ? await view(repos, await repos.encounters.get(previous.details.spawnId)) : null, spawned: false, alreadyChecked: true };
        }
        await availableKey(repos, operationKey);
        const now = await refresh(repos);
        const id = `group:${createHash('sha256').update(chatId).digest('hex')}`;
        const activity = await repos.groupActivity.get(id);
        if (activity) {
          requireGame(dailyTimestamp(now) >= dailyTimestamp(activity.updatedAt), 'INVALID_CLOCK');
          if (Date.parse(now) < Date.parse(activity.nextCheckAt)) return { spawn: null, spawned: false, alreadyChecked: false };
        }
        const gapAvailable = !activity?.lastSpawnAt || Date.parse(now) >= Date.parse(activity.lastSpawnAt) + SPAWN_POLICY.minSpawnGapMs;
        const active = await repos.encounters.find(encounter => encounter.kind === 'spawn' && encounter.chatId === chatId && encounter.status === 'active');
        const rolled = gapAvailable && !active ? roll(100) + 1 : null;
        const pool = rolled !== null && rolled <= SPAWN_POLICY.chancePercent ? await eligibleCharacters(repos, now) : [];
        const eligibleCharacterWeights = pool.map(character => SPAWN_POLICY.rarityWeights[character.rarity]);
        const totalWeight = eligibleCharacterWeights.reduce((sum, weight) => sum + weight, 0);
        const weightRoll = totalWeight ? roll(totalWeight) : null;
        let selectionRoll = null;
        if (weightRoll !== null) {
          let remainder = weightRoll;
          for (let index = 0; index < pool.length; index++) {
            if (remainder < eligibleCharacterWeights[index]) { selectionRoll = index; break; }
            remainder -= eligibleCharacterWeights[index];
          }
        }
        const spawn = pool.length ? await insertSpawn(repos, pool[selectionRoll], chatId, now) : null;
        await repos.contentActions.insert({
          id: `ACT-${randomUUID()}`, kind: 'spawn_check', encounterId: null, userId, operationKey, createdAt: now,
          details: { chatId, roll: rolled, selectionRoll, weightRoll, eligibleCharacterWeights, eligibleCharacterIds: pool.map(character => character.id), spawnId: spawn?.id ?? null }
        });
        const nextCheckAt = new Date((Math.floor(Date.parse(now) / SPAWN_POLICY.checkIntervalMs) + 1) * SPAWN_POLICY.checkIntervalMs).toISOString();
        dailyTimestamp(nextCheckAt);
        const updated = { id, chatId, nextCheckAt, lastSpawnAt: spawn ? now : activity?.lastSpawnAt ?? null, updatedAt: now };
        if (activity) await repos.groupActivity.replace(updated);
        else await repos.groupActivity.insert(updated);
        return { spawn: spawn ? await view(repos, spawn) : null, spawned: Boolean(spawn), alreadyChecked: false };
      });
    },
    async getSpawn({ chatId }) {
      group(chatId);
      return storage.withTransaction(async repos => {
        await refresh(repos);
        const spawn = (await repos.encounters.filter(encounter => encounter.kind === 'spawn' && encounter.chatId === chatId && encounter.status === 'active')).at(-1);
        return spawn ? view(repos, spawn) : null;
      });
    },
    async capture({ userId, chatId, code = null, operationKey }) {
      group(chatId);
      checkKey(operationKey);
      const result = await storage.withTransaction(async repos => {
        await participant(repos, userId);
        const previous = await repos.contentActions.find(action => action.operationKey === operationKey);
        if (previous) {
          requireGame(previous.kind === 'spawn_capture' && previous.userId === userId && previous.details.chatId === chatId &&
            referenceMatches(await repos.encounters.all(), previous.encounterId, code, 'spawn'), 'OPERATION_CONFLICT');
          return { spawn: await view(repos, await repos.encounters.get(previous.encounterId)), unit: await repos.units.get(previous.details.unitId),
            reward: await repos.contentRewards.get(previous.details.rewardId), alreadyCaptured: true };
        }
        await availableKey(repos, operationKey);
        const now = await refresh(repos);
        const spawn = code === null ? (await repos.encounters.filter(encounter => encounter.kind === 'spawn' && encounter.chatId === chatId)).at(-1)
          : await findEncounter(repos, code, 'spawn');
        requireGame(spawn, 'SPAWN_NOT_FOUND');
        requireGame(spawn.chatId === chatId, 'SPAWN_WRONG_CHAT');
        if (spawn.status === 'expired') return { failure: 'SPAWN_EXPIRED' };
        requireGame(spawn.status === 'active', 'SPAWN_NOT_ACTIVE');
        requireGame(dailyTimestamp(now) >= dailyTimestamp(spawn.updatedAt), 'INVALID_CLOCK');
        const character = await repos.characters.get(spawn.snapshot.characterId);
        const campaign = spawn.snapshot.campaignId ? await repos.campaigns.get(spawn.snapshot.campaignId) : null;
        requireGame(!spawn.snapshot.campaignId || activeCampaign(campaign, now), 'EVENT_NOT_ACTIVE');
        const unit = await createUnitInTransaction(repos, {
          ownerId: userId, characterId: character.id,
          origin: { type: campaign ? 'event' : 'spawn', sourceId: spawn.id }, operationKey: `spawn-mint:${spawn.id}`
        }, () => now);
        const granted = await grantContentReward(repos, {
          userId, kind: 'spawn', sourceId: spawn.id, operationKey: `capture-reward:${spawn.id}`,
          coins: 0, userXp: 0, tickets: 0, ticketCost: spawn.snapshot.ticketCost, createdAt: now,
          details: { encounterId: spawn.id, unitId: unit.id }
        });
        await repos.contentActions.insert({
          id: `ACT-${randomUUID()}`, kind: 'spawn_capture', encounterId: spawn.id, userId, operationKey, createdAt: now,
          details: { unitId: unit.id, rewardId: granted.reward.id, chatId }
        });
        const captured = await repos.encounters.replace({ ...spawn, status: 'captured', winnerId: userId, endedAt: now, updatedAt: now });
        return { spawn: await view(repos, captured), unit, reward: granted.reward, alreadyCaptured: false };
      });
      if (result.failure) throw new GameError(result.failure);
      return result;
    },
    // Trusted host/test API. No WhatsApp command accepts a character snapshot,
    // ticket price, owner, supply, deadline or arbitrary encounter policy.
    async createSpawn({ characterId, chatId }) {
      group(chatId);
      return storage.withTransaction(async repos => {
        const now = await refresh(repos);
        requireGame(!await repos.encounters.find(encounter => encounter.kind === 'spawn' && encounter.chatId === chatId && encounter.status === 'active'), 'SPAWN_ALREADY_ACTIVE');
        const character = (await eligibleCharacters(repos, now)).find(candidate => candidate.id === characterId);
        requireGame(character, 'CHARACTER_UNAVAILABLE');
        return view(repos, await insertSpawn(repos, character, chatId, now));
      });
    },
    async sweepExpired() {
      return storage.withTransaction(repos => expireEncounters(repos, clock()));
    }
  };
  return service;
}
