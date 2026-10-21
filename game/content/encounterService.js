import { expireTrades } from '../trades/lifecycle.js';
import { effectiveUnitStats, evolutionSnapshot, displayUnitCharacterName } from '../evolution/rules.js';
import { createHash, randomInt, randomUUID } from 'node:crypto';
import { GameError, requireGame } from '../../utils/GameError.js';
import { normalizeIdentity } from '../../utils/identity.js';
import { paginate } from '../../utils/pagination.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { expireBattles } from '../battle/lifecycle.js';
import { expireListings } from '../market/lifecycle.js';
import { effectiveStats } from '../progression/rules.js';
import { advancedAttack } from '../battle/combatContent.js';
import { createUnitInTransaction } from '../units/unitGenerator.js';
import { BOSSES, CONTENT_POLICY_VERSION, SPAWN_POLICY } from './catalog.js';
import { spawnSelectionProof } from './eventPolicy.js';
import { grantContentReward } from './rewards.js';
import { activeCampaign, bossContributions, bossRewardFor, encounterCodeAt, encounterDeadline, resolveBossAttack } from './encounterRules.js';
import { SPIRITS_BOSS_ID, spiritsBossDefinition, spiritsMaskAt } from './spiritsCatalog.js';
import { attachFatality } from '../battle/fatality.js';

const checkKey = key => requireGame(typeof key === 'string' && key.length > 0 && key.length <= 200 && key.trim() === key, 'INVALID_OPERATION_KEY');
const checkMessageId = messageId => requireGame(typeof messageId === 'string' && messageId.length > 0 && messageId.length <= 200, 'INVALID_OPERATION_KEY');
const group = chatId => requireGame(typeof chatId === 'string' && chatId.length <= 200 && /^[^\s]+@g\.us$/.test(chatId), 'CONTENT_GROUP_ONLY');
const bossTemplate = id => id === SPIRITS_BOSS_ID ? spiritsBossDefinition() : (Array.isArray(BOSSES) ? BOSSES : Object.values(BOSSES)).find(boss => boss.id === id);
const activityId = chatId => `group:${createHash('sha256').update(chatId).digest('hex')}`;
const checkOperationKey = (chatId, messageId) => `spawn-check:${createHash('sha256').update(JSON.stringify([chatId, messageId])).digest('hex')}`;
const noSpawn = () => ({ spawn: null, spawned: false, alreadyChecked: false });

async function participant(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function availableKey(repos, key) {
  requireGame(!await repos.contentActions.findBy('operationKey', key) &&
    !await repos.contentRewards.findBy('operationKey', key), 'OPERATION_CONFLICT');
}

export async function expireEncounters(repos, now) {
  dailyTimestamp(now);
  const expired = await repos.encounters.filterBy('status', 'active', encounter => Date.parse(encounter.expiresAt) <= Date.parse(now));
  for (const encounter of expired) await repos.encounters.replace({ ...encounter, status: 'expired', updatedAt: now, endedAt: now });
  return expired.length;
}

async function view(repos, encounter, userId = null) {
  const result = { ...encounter, code: encounterCodeAt(encounter, await repos.encounters.indexOf(encounter.id)) };
  if (encounter.kind === 'spawn') return result;
  const actions = await repos.contentActions.filterBy('encounterId', encounter.id, action => action.kind === 'boss_attack');
  const contributions = bossContributions(actions);
  const userIds = new Set([...contributions.map(contribution => contribution.userId), encounter.winnerId].filter(Boolean));
  const users = new Map(await Promise.all([...userIds].map(async id => [id, (await repos.users.get(id))?.name])));
  result.participants = contributions.map(({ first, ...contribution }) => ({ ...contribution, name: users.get(contribution.userId) }));
  result.totalDamage = encounter.snapshot.hp - encounter.hp;
  result.totalAttacks = actions.length;
  if (encounter.snapshot.id === SPIRITS_BOSS_ID) {
    result.mask = structuredClone(spiritsMaskAt(actions.length));
    result.nextMaskAtAttack = (Math.floor(actions.length / 3) + 1) * 3 + 1;
  }
  result.winnerName = encounter.winnerId === null ? null : users.get(encounter.winnerId);
  result.nextEncounterAt = encounterDeadline(encounter.createdAt, encounter.snapshot.respawnMs);
  if (encounter.snapshot.eventId) {
    const campaign = await repos.campaigns.get(encounter.snapshot.eventId);
    if (campaign && Date.parse(result.nextEncounterAt) >= Date.parse(campaign.endsAt)) result.nextEncounterAt = null;
  }
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
    if (unit && character) {
      const first = actions.find(action => action.details.unitSnapshot.id === unit.id)?.details.unitSnapshot.fatality;
      const used = actions.some(action => action.details.unitSnapshot.id === unit.id && action.details.choice === '3');
      if (first?.unlocked && !used) result.availableAttacks.push({ choice: '3', name: first.attack.name, power: first.attack.power, fatality: true });
    }
  }
  return result;
}

async function findEncounter(repos, code, kind) {
  requireGame(typeof code === 'string' && code.length <= 100, 'ENCOUNTER_NOT_FOUND');
  const normalized = code.trim();
  const match = /^([BS])([1-9]\d*)$/i.exec(normalized);
  const encounter = match
    ? await repos.encounters.at(Number(match[2]) - 1)
    : await repos.encounters.get(normalized.replace(/^enc-(.*)$/i, (_prefix, suffix) => `ENC-${suffix.toLowerCase()}`));
  requireGame(encounter?.kind === kind && (!match || match[1].toUpperCase() === (kind === 'boss' ? 'B' : 'S')), 'ENCOUNTER_NOT_FOUND');
  return encounter;
}

async function referenceMatches(repos, encounterId, code, kind) {
  if (code === null || code === undefined) return true;
  if (typeof code !== 'string') return false;
  const match = /^([BS])([1-9]\d*)$/i.exec(code.trim());
  if (!match) return code.trim().toLowerCase() === encounterId.toLowerCase();
  const encounter = await repos.encounters.at(Number(match[2]) - 1);
  return encounter?.id === encounterId && encounter.kind === kind && match[1].toUpperCase() === (kind === 'boss' ? 'B' : 'S');
}

async function unitSnapshot(repos, user) {
  requireGame(user.team.length > 0, 'TEAM_EMPTY');
  const unit = await repos.units.get(user.team[0]);
  requireGame(unit?.ownerId === user.id, 'UNIT_NOT_OWNED');
  requireGame(unit.lock === null, 'UNIT_LOCKED');
  const character = await repos.characters.get(unit.characterId);
  return {
    id: unit.id, characterId: unit.characterId, characterName: displayUnitCharacterName(unit, character), evolution: evolutionSnapshot(unit), ownerId: user.id,
    ownershipVersion: unit.ownershipVersion, progress: structuredClone(unit.progress),
    stats: effectiveUnitStats(unit),
    attacks: (await Promise.all(character.attackIds.map(id => repos.attacks.get(id)))).map(advancedAttack),
    traits: [...unit.traits], variant: unit.variant, traitVersion: unit.traitVersion
  };
}

export function createEncounterService(storage, clock, randomDropInt = upper => randomInt(upper)) {
  // These are hints only. Every actual opportunity is checked again inside the
  // writer transaction, so concurrent callers and restarts cannot grant a roll.
  const activeGroups = new Set();
  const automaticChecks = new Map();
  const nextChecks = new Map();
  const unknownIdentities = new Map();
  let loadedGroups;

  function rememberCheck(chatId, activity) {
    if (activity) {
      activeGroups.add(chatId);
      nextChecks.set(chatId, { updatedAt: Date.parse(activity.updatedAt), nextCheckAt: Date.parse(activity.nextCheckAt) });
    }
  }

  async function loadGroups() {
    loadedGroups ??= storage.withRead(async repos => {
      for (const activity of await repos.groupActivity.all()) rememberCheck(activity.chatId, activity);
      for (const chatId of await repos.encounters.distinct('chatId')) if (chatId !== null) activeGroups.add(chatId);
    }).catch(error => { loadedGroups = undefined; throw error; });
    return loadedGroups;
  }

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
    await expireTrades(repos, now);
    await expireEncounters(repos, now);
    return now;
  }

  async function ensureBoss(repos, bossId, now) {
    const normalized = { guardian: 'niebla', 'guardián': 'niebla', 'dragón': 'dragon', mascaras: SPIRITS_BOSS_ID, máscaras: SPIRITS_BOSS_ID, espiritus: SPIRITS_BOSS_ID }[bossId] ?? bossId;
    const template = bossTemplate(normalized);
    requireGame(template, 'BOSS_NOT_FOUND');
    const campaign = template.eventId ? await repos.campaigns.get(template.eventId) : null;
    requireGame(!template.eventId || activeCampaign(campaign, now), 'EVENT_NOT_ACTIVE');
    const latest = await repos.encounters.lastBy('bossId', template.id);
    if (latest) {
      requireGame(dailyTimestamp(now) >= dailyTimestamp(latest.updatedAt), 'INVALID_CLOCK');
      if (latest.status === 'active' || Date.parse(now) < Date.parse(latest.createdAt) + latest.snapshot.respawnMs) return latest;
    }
    return repos.encounters.insert({
      id: `ENC-${randomUUID()}`, kind: 'boss', policyVersion: CONTENT_POLICY_VERSION, chatId: null,
      createdAt: now, expiresAt: campaign && Date.parse(campaign.endsAt) < Date.parse(encounterDeadline(now, template.durationMs)) ? campaign.endsAt : encounterDeadline(now, template.durationMs), updatedAt: now, endedAt: null,
      status: 'active', snapshot: structuredClone(template), hp: template.hp, winnerId: null
    });
  }

  async function eligibleCharacters(repos, now) {
    const campaigns = new Map((await repos.campaigns.all()).map(campaign => [campaign.id, campaign]));
    const counters = new Map((await repos.state.filterBy('kind', 'mintCounter')).map(counter => [counter.characterId, counter]));
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

  async function activityResult(repos, userId, chatId, operationKey) {
    const previous = await repos.contentActions.findBy('operationKey', operationKey);
    if (previous) {
      requireGame(previous.kind === 'spawn_check' && previous.userId === userId && previous.details.chatId === chatId, 'OPERATION_CONFLICT');
      return { spawn: previous.details.spawnId ? await view(repos, await repos.encounters.get(previous.details.spawnId)) : null, spawned: false, alreadyChecked: true };
    }
    const now = clock();
    dailyTimestamp(now);
    const activity = await repos.groupActivity.get(activityId(chatId));
    if (activity) {
      rememberCheck(chatId, activity);
      requireGame(dailyTimestamp(now) >= dailyTimestamp(activity.updatedAt), 'INVALID_CLOCK');
      if (Date.parse(now) < Date.parse(activity.nextCheckAt)) return noSpawn();
    }
    return null;
  }

  async function checkActivity(repos, userId, chatId, operationKey) {
    await participant(repos, userId);
    const existing = await activityResult(repos, userId, chatId, operationKey);
    if (existing) return existing;
    await availableKey(repos, operationKey);
    const now = clock();
    dailyTimestamp(now);
    // A spawn never reads unit locks. Expiring markets, battles and trades here
    // used to turn ordinary chat traffic into unrelated global maintenance.
    await expireEncounters(repos, now);
    const id = activityId(chatId);
    const activity = await repos.groupActivity.get(id);
    const gapAvailable = !activity?.lastSpawnAt || Date.parse(now) >= Date.parse(activity.lastSpawnAt) + SPAWN_POLICY.minSpawnGapMs;
    const active = (await repos.encounters.filterBy('status', 'active', encounter => encounter.kind === 'spawn' && encounter.chatId === chatId))[0];
    const rolled = gapAvailable && !active ? roll(100) + 1 : null;
    const pool = rolled !== null && rolled <= SPAWN_POLICY.chancePercent ? await eligibleCharacters(repos, now) : [];
    const selection = spawnSelectionProof(pool, await repos.campaigns.all(), now);
    const { eligibleCharacterWeights } = selection;
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
      details: { chatId, roll: rolled, selectionRoll, weightRoll, ...selection, spawnId: spawn?.id ?? null }
    });
    const nextCheckAt = new Date((Math.floor(Date.parse(now) / SPAWN_POLICY.checkIntervalMs) + 1) * SPAWN_POLICY.checkIntervalMs).toISOString();
    dailyTimestamp(nextCheckAt);
    const updated = { id, chatId, nextCheckAt, lastSpawnAt: spawn ? now : activity?.lastSpawnAt ?? null, updatedAt: now };
    if (activity) await repos.groupActivity.replace(updated);
    else await repos.groupActivity.insert(updated);
    return { ...noSpawn(), spawn: spawn ? await view(repos, spawn) : null, spawned: Boolean(spawn), activity: updated };
  }

  function committedResult(result, chatId) {
    if (result.activity) rememberCheck(chatId, result.activity);
    const { activity, ...publicResult } = result;
    return publicResult;
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
      requireGame(['1', '2', '3'].includes(String(choice)), 'INVALID_ATTACK');
      const result = await storage.withTransaction(async repos => {
        await participant(repos, userId);
        const previous = await repos.contentActions.findBy('operationKey', operationKey);
        if (previous) {
          requireGame(previous.kind === 'boss_attack' && previous.userId === userId && previous.details.chatId === chatId &&
            previous.details.choice === String(choice) && await referenceMatches(repos, previous.encounterId, code, 'boss'), 'OPERATION_CONFLICT');
          let boss = await repos.encounters.get(previous.encounterId);
          const replayNow = clock();
          let replayTime = null;
          try { replayTime = dailyTimestamp(replayNow); }
          catch (error) { if (error.code !== 'INVALID_CLOCK') throw error; }
          if (boss.status === 'active' && replayTime !== null && replayTime >= Date.parse(boss.expiresAt)) {
            boss = await repos.encounters.replace({ ...boss, status: 'expired', updatedAt: replayNow, endedAt: replayNow });
          }
          return { boss: await view(repos, boss, userId), action: previous, duplicate: true,
            rewards: await repos.contentRewards.filterBy('sourceId', boss.id, reward => reward.kind === 'boss' && reward.userId === userId) };
        }
        await availableKey(repos, operationKey);
        const now = await refresh(repos);
        const boss = code === null ? await ensureBoss(repos, 'niebla', now) : await findEncounter(repos, code, 'boss');
        if (boss.snapshot.eventId) requireGame(activeCampaign(await repos.campaigns.get(boss.snapshot.eventId), now), 'EVENT_NOT_ACTIVE');
        if (boss.status === 'expired') return { failure: 'BOSS_EXPIRED' };
        requireGame(boss.status === 'active', 'BOSS_NOT_ACTIVE');
        requireGame(dailyTimestamp(now) >= dailyTimestamp(boss.updatedAt), 'INVALID_CLOCK');
        const actions = await repos.contentActions.filterBy('encounterId', boss.id, action => action.kind === 'boss_attack');
        const own = actions.filter(action => action.userId === userId);
        requireGame(own.length < boss.snapshot.maxAttacks, 'BOSS_ATTACK_LIMIT');
        const last = own.at(-1);
        requireGame(!last || Date.parse(now) >= Date.parse(last.createdAt) + boss.snapshot.cooldownMs,
          'BOSS_COOLDOWN', { availableAt: last ? encounterDeadline(last.createdAt, boss.snapshot.cooldownMs) : null });
        const user = await participant(repos, userId);
        let snapshot = await unitSnapshot(repos, user);
        const first = actions.find(action => action.details.unitSnapshot.id === snapshot.id)?.details.unitSnapshot.fatality;
        // An uncommitted third-attack request must never reroll the opening.
        // The first normal attack publishes that opening before it can be used.
        if (String(choice) === '3') requireGame(first, 'FATALITY_NOT_AVAILABLE');
        if (first) snapshot.fatality = { ...structuredClone(first), used: actions.some(action => action.details.unitSnapshot.id === snapshot.id && action.details.choice === '3') };
        else snapshot = attachFatality(snapshot, now, () => roll(100));
        const unit = await repos.units.get(snapshot.id);
        requireGame(dailyTimestamp(now) >= dailyTimestamp(unit.updatedAt), 'INVALID_CLOCK');
        const rolled = roll(100) + 1;
        const damage = resolveBossAttack(boss.snapshot, snapshot, String(choice), rolled, boss.hp, actions.length);
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
    activateGroup({ chatId }) {
      group(chatId);
      activeGroups.add(chatId);
    },
    async observeGroupActivity({ identity, chatId, messageId }) {
      group(chatId);
      checkMessageId(messageId);
      const canonical = normalizeIdentity(identity);
      await loadGroups();
      if (!activeGroups.has(chatId)) return noSpawn();
      const now = dailyTimestamp(clock());
      const next = nextChecks.get(chatId);
      if (next && now >= next.updatedAt && now < next.nextCheckAt) return noSpawn();
      // A burst must not enqueue one writer transaction per message while the
      // first opportunity is still committing.
      if (automaticChecks.has(chatId)) return noSpawn();
      const unknownUntil = unknownIdentities.get(canonical.subject);
      if (unknownUntil && now < unknownUntil) return noSpawn();
      const operationKey = checkOperationKey(chatId, messageId);
      const check = (async () => {
        const eligibility = await storage.withRead(async repos => {
          const user = await repos.users.getByIdentity(canonical);
          if (!user) return { result: { ...noSpawn(), unknownIdentity: true } };
          return { userId: user.id, result: await activityResult(repos, user.id, chatId, operationKey) };
        });
        if (eligibility.result) return eligibility.result;
        return storage.withTransaction(repos => checkActivity(repos, eligibility.userId, chatId, operationKey));
      })();
      automaticChecks.set(chatId, check);
      try {
        const result = await check;
        if (result.unknownIdentity) {
          // Bound memory even when a public group contains many visitors.
          if (unknownIdentities.size >= 10_000) unknownIdentities.delete(unknownIdentities.keys().next().value);
          unknownIdentities.set(canonical.subject, now + 60_000);
          return noSpawn();
        }
        unknownIdentities.delete(canonical.subject);
        return committedResult(result, chatId);
      } finally {
        automaticChecks.delete(chatId);
      }
    },
    async observeActivity({ userId, chatId, messageId }) {
      group(chatId);
      checkMessageId(messageId);
      const operationKey = checkOperationKey(chatId, messageId);
      // Explicit exploration preserves receipt replay and user validation while
      // avoiding the expensive writer/transition path for closed windows.
      const existing = await storage.withRead(async repos => {
        await participant(repos, userId);
        return activityResult(repos, userId, chatId, operationKey);
      });
      if (existing) return existing;
      const result = await storage.withTransaction(repos => checkActivity(repos, userId, chatId, operationKey));
      return committedResult(result, chatId);
    },
    async getSpawn({ chatId }) {
      group(chatId);
      const current = await storage.withRead(async repos => {
        const now = clock();
        dailyTimestamp(now);
        const spawn = (await repos.encounters.filterBy('status', 'active', encounter => encounter.kind === 'spawn' && encounter.chatId === chatId))[0];
        if (!spawn) return { spawn: null, expired: false };
        if (Date.parse(spawn.expiresAt) <= Date.parse(now)) return { spawn: null, expired: true };
        return { spawn: await view(repos, spawn), expired: false };
      });
      if (!current.expired) return current.spawn;
      return storage.withTransaction(async repos => {
        const now = clock();
        dailyTimestamp(now);
        const spawn = (await repos.encounters.filterBy('status', 'active', encounter => encounter.kind === 'spawn' && encounter.chatId === chatId))[0];
        if (!spawn) return null;
        if (Date.parse(spawn.expiresAt) > Date.parse(now)) return view(repos, spawn);
        await repos.encounters.replace({ ...spawn, status: 'expired', updatedAt: now, endedAt: now });
        return null;
      });
    },
    async capture({ userId, chatId, code = null, operationKey }) {
      group(chatId);
      checkKey(operationKey);
      const result = await storage.withTransaction(async repos => {
        await participant(repos, userId);
        const previous = await repos.contentActions.findBy('operationKey', operationKey);
        if (previous) {
          requireGame(previous.kind === 'spawn_capture' && previous.userId === userId && previous.details.chatId === chatId &&
            await referenceMatches(repos, previous.encounterId, code, 'spawn'), 'OPERATION_CONFLICT');
          return { spawn: await view(repos, await repos.encounters.get(previous.encounterId)), unit: await repos.units.get(previous.details.unitId),
            reward: await repos.contentRewards.get(previous.details.rewardId), alreadyCaptured: true };
        }
        await availableKey(repos, operationKey);
        const now = await refresh(repos);
        const spawn = code === null ? await repos.encounters.lastBy('chatId', chatId)
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
      const spawn = await storage.withTransaction(async repos => {
        const now = await refresh(repos);
        requireGame(!(await repos.encounters.filterBy('status', 'active', encounter => encounter.kind === 'spawn' && encounter.chatId === chatId)).length, 'SPAWN_ALREADY_ACTIVE');
        const character = (await eligibleCharacters(repos, now)).find(candidate => candidate.id === characterId);
        requireGame(character, 'CHARACTER_UNAVAILABLE');
        return view(repos, await insertSpawn(repos, character, chatId, now));
      });
      activeGroups.add(chatId);
      return spawn;
    },
    async sweepExpired() {
      return storage.withTransaction(repos => expireEncounters(repos, clock()));
    }
  };
  return service;
}
