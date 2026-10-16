import { equal } from './equality.js';
import { expiredStoredLock } from './lockProof.js';
import { displayUnitCharacterName } from '../game/evolution/rules.js';
import { validateEvolutionSnapshot } from './evolutionSnapshot.js';
import { evolvedStats } from '../game/evolution/rules.js';
import { createHash } from 'node:crypto';
import { requireGame } from '../utils/GameError.js';
import { BOSSES, CONTENT_POLICY_VERSION, SPAWN_POLICY } from '../game/content/catalog.js';
import { activeCampaign, bossContributions, encounterDeadline, resolveBossAttack } from '../game/content/encounterRules.js';
import { ownershipAt } from '../game/units/ownership.js';
import { effectiveStats } from '../game/progression/rules.js';
import { advancedAttack } from '../game/battle/combatContent.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });

const integer = (value, min = 0) => Number.isSafeInteger(value) && value >= min;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const group = value => typeof value === 'string' && value.length <= 200 && /^[^\s]+@g\.us$/.test(value);
const activityId = chatId => `group:${createHash('sha256').update(chatId).digest('hex')}`;
const nextCheck = now => new Date((Math.floor(Date.parse(now) / SPAWN_POLICY.checkIntervalMs) + 1) * SPAWN_POLICY.checkIntervalMs).toISOString();

export function validateEncounterData(state) {
  const users = new Set(state.usuarios.records.map(user => user.id));
  const encounters = new Map(state.encuentros.records.map(encounter => [encounter.id, encounter]));
  const actionsByEncounter = new Map(), keys = new Set(), checks = new Map(), latestBosses = new Map(), activeGroups = new Set();
  for (const action of state.accionescontenido.records) {
    check(/^ACT-[a-f0-9-]{36}$/.test(action.id) && users.has(action.userId) && date(action.createdAt) && typeof action.operationKey === 'string' &&
      action.operationKey.length > 0 && action.operationKey.length <= 200 && action.operationKey.trim() === action.operationKey && !keys.has(action.operationKey) && action.details, 'encounter.action');
    keys.add(action.operationKey);
    if (action.kind === 'spawn_check') {
      const d = action.details;
      const previous = checks.get(d.chatId);
      check(action.encounterId === null && group(d.chatId) && (d.roll === null || integer(d.roll, 1) && d.roll <= 100) &&
        Array.isArray(d.eligibleCharacterIds) && new Set(d.eligibleCharacterIds).size === d.eligibleCharacterIds.length &&
        (d.selectionRoll === null || integer(d.selectionRoll) && d.selectionRoll < d.eligibleCharacterIds.length) &&
        (!previous || Date.parse(action.createdAt) >= Date.parse(nextCheck(previous.createdAt))), 'encounter.spawnCheck');
      check(Array.isArray(d.eligibleCharacterWeights) && d.eligibleCharacterWeights.length === d.eligibleCharacterIds.length &&
        d.eligibleCharacterWeights.every(weight => Object.values(SPAWN_POLICY.rarityWeights).includes(weight)), 'encounter.spawnWeights');
      if (d.selectionRoll !== null) {
        const lower = d.eligibleCharacterWeights.slice(0, d.selectionRoll).reduce((sum, weight) => sum + weight, 0);
        check(integer(d.weightRoll) && d.weightRoll >= lower && d.weightRoll < lower + d.eligibleCharacterWeights[d.selectionRoll], 'encounter.weightedSelection');
      } else check(d.weightRoll === null, 'encounter.emptySelection');
      if (d.spawnId !== null) {
        const spawn = encounters.get(d.spawnId);
        check(d.roll !== null && d.roll <= SPAWN_POLICY.chancePercent && spawn?.kind === 'spawn' && spawn.chatId === d.chatId &&
          spawn.createdAt === action.createdAt && d.eligibleCharacterIds[d.selectionRoll] === spawn.snapshot.characterId &&
          (!previous?.lastSpawnAt || Date.parse(action.createdAt) >= Date.parse(previous.lastSpawnAt) + SPAWN_POLICY.minSpawnGapMs), 'encounter.spawnCheckResult');
      } else check(d.selectionRoll === null && d.eligibleCharacterIds.length === 0, 'encounter.noSpawnResult');
      checks.set(d.chatId, { ...action, lastSpawnAt: d.spawnId ? action.createdAt : previous?.lastSpawnAt ?? null });
      continue;
    }
    check(['boss_attack', 'spawn_capture'].includes(action.kind) && encounters.has(action.encounterId), 'encounter.actionReference');
    const list = actionsByEncounter.get(action.encounterId) ?? [];
    list.push(action); actionsByEncounter.set(action.encounterId, list);
  }
  for (const encounter of encounters.values()) {
    check(/^ENC-[a-f0-9-]{36}$/.test(encounter.id) && ['boss', 'spawn'].includes(encounter.kind) && encounter.policyVersion === CONTENT_POLICY_VERSION &&
      date(encounter.createdAt) && date(encounter.updatedAt) && date(encounter.expiresAt) && Date.parse(encounter.updatedAt) >= Date.parse(encounter.createdAt) &&
      Date.parse(encounter.expiresAt) > Date.parse(encounter.createdAt) && encounter.snapshot, 'encounter.metadata');
    const actions = actionsByEncounter.get(encounter.id) ?? [];
    if (encounter.kind === 'boss') {
      const template = BOSSES.find(boss => boss.id === encounter.snapshot.id);
      check(template && equal(template, encounter.snapshot) && encounter.chatId === null && encounter.expiresAt === encounterDeadline(encounter.createdAt, template.durationMs), 'encounter.bossDefinition');
      const previousBoss = latestBosses.get(template.id);
      check(!previousBoss || previousBoss.status !== 'active' && Date.parse(encounter.createdAt) >= Date.parse(previousBoss.createdAt) + previousBoss.snapshot.respawnMs &&
        Date.parse(previousBoss.endedAt) <= Date.parse(encounter.createdAt), 'encounter.bossSequence');
      latestBosses.set(template.id, encounter);
      let hp = template.hp, lastTime = encounter.createdAt;
      const own = new Map();
      for (const action of actions) {
        const d = action.details, unit = state.unidades.records.find(row => row.id === d.unitSnapshot?.id);
        const snapshot = d.unitSnapshot;
        validateEvolutionSnapshot(state, snapshot, action.createdAt);
        check(action.kind === 'boss_attack' && hp > 0 && group(d.chatId) && Date.parse(action.createdAt) >= Date.parse(lastTime) &&
          Date.parse(action.createdAt) < Date.parse(encounter.expiresAt) && unit && snapshot.ownerId === action.userId &&
          ownershipAt(state, unit.id, snapshot.ownershipVersion) === action.userId && snapshot.characterId === unit.characterId &&
          state.eventos.records.some(event => event.unitId === unit.id && (event.ownershipVersion ?? 0) === snapshot.ownershipVersion && event.toOwnerId === action.userId && Date.parse(event.createdAt) <= Date.parse(action.createdAt)) &&
          snapshot.progress?.level <= unit.progress.level && integer(snapshot.progress?.level, 1) && integer(snapshot.progress?.xp) &&
          equal(snapshot.traits, unit.traits) && snapshot.variant === unit.variant && snapshot.traitVersion === unit.traitVersion &&
          equal(snapshot.stats, evolvedStats(effectiveStats(unit.initialStats, snapshot.progress.level, unit.statGrowthVersion, unit.traits, unit.traitVersion, unit.combatBaseStats), snapshot.evolution, unit.characterId, snapshot.progress.level)) &&
          Array.isArray(snapshot.attacks) && snapshot.attacks.length === 2 && snapshot.attacks.every(attack => typeof attack.name === 'string' && integer(attack.power, 1) && attack.power <= 10000 && integer(attack.accuracy, 1) && attack.accuracy <= 100 &&
            integer(attack.revision, 1) && attack.revision <= (state.ataques.records.find(row => row.id === attack.id)?.revision ?? 0)), 'encounter.bossUnit');
        const previous = own.get(action.userId) ?? { attacks: 0, last: null };
        check(previous.attacks < template.maxAttacks && (previous.last === null || Date.parse(action.createdAt) >= Date.parse(previous.last) + template.cooldownMs), 'encounter.bossCooldown');
        const result = resolveBossAttack(template, snapshot, d.choice, d.roll, hp);
        check(['hit', 'critical', 'damage', 'hpBefore', 'hpAfter', 'attackName'].every(field => equal(d[field], result[field])), 'encounter.bossReplay');
        hp = result.hpAfter; lastTime = action.createdAt;
        own.set(action.userId, { attacks: previous.attacks + 1, last: action.createdAt });
      }
      check(encounter.hp === hp && ['active', 'defeated', 'expired'].includes(encounter.status) &&
          (encounter.status === 'defeated' ? hp === 0 && encounter.winnerId === actions.at(-1)?.userId && encounter.endedAt === lastTime : hp > 0 && encounter.winnerId === null), 'encounter.bossState');
      if (encounter.status === 'active') check(encounter.updatedAt === lastTime, 'encounter.bossUpdatedAt');
      const rewards = state.premioscontenido.records.filter(reward => reward.kind === 'boss' && reward.sourceId === encounter.id);
      const participants = bossContributions(actions).filter(participant => participant.damage > 0);
      check(encounter.status === 'defeated' ? rewards.length === participants.length && participants.every(participant => rewards.some(reward => reward.userId === participant.userId)) : rewards.length === 0, 'encounter.bossSettlement');
    } else {
      const s = encounter.snapshot, character = state.personajes.records.find(row => row.id === s.characterId);
      const campaign = s.campaignId ? state.campanas.records.find(row => row.id === s.campaignId) : null;
      const deadline = encounterDeadline(encounter.createdAt, SPAWN_POLICY.durationMs);
      if (encounter.status === 'active') {
        check(!activeGroups.has(encounter.chatId) && encounter.updatedAt === encounter.createdAt, 'encounter.activeSpawnUnique');
        activeGroups.add(encounter.chatId);
      }
      check(group(encounter.chatId) && character && typeof s.characterName === 'string' && ['common', 'rare', 'epic', 'legendary', 'mythic'].includes(s.rarity) &&
        s.ticketCost === SPAWN_POLICY.ticketCost && s.campaignId === (character.eventId ?? null) && (!campaign || activeCampaign(campaign, encounter.createdAt)) &&
        encounter.expiresAt === (campaign && Date.parse(campaign.endsAt) < Date.parse(deadline) ? campaign.endsAt : deadline) &&
        encounter.hp === null && ['active', 'captured', 'expired'].includes(encounter.status), 'encounter.spawnDefinition');
      if (encounter.status === 'captured') {
        const action = actions[0], unit = state.unidades.records.find(row => row.id === action?.details.unitId);
        const birth = state.eventos.records.find(event => event.type === 'unit_created' && event.unitId === unit?.id);
        const reward = state.premioscontenido.records.find(row => row.id === action?.details.rewardId);
        check(actions.length === 1 && action.kind === 'spawn_capture' && action.details.chatId === encounter.chatId &&
          action.userId === encounter.winnerId && action.createdAt === encounter.endedAt && Date.parse(action.createdAt) >= Date.parse(encounter.createdAt) &&
          Date.parse(action.createdAt) < Date.parse(encounter.expiresAt) && unit?.characterId === s.characterId && unit.origin.sourceId === encounter.id &&
          unit.origin.type === (campaign ? 'event' : 'spawn') && birth?.toOwnerId === action.userId && birth.createdAt === action.createdAt &&
          reward?.kind === 'spawn' && reward.sourceId === encounter.id && reward.userId === action.userId && reward.details.unitId === unit.id, 'encounter.capture');
      } else check(actions.length === 0 && encounter.winnerId === null, 'encounter.uncaptured');
    }
    if (encounter.status === 'active') check(encounter.endedAt === null && Date.parse(encounter.updatedAt) < Date.parse(encounter.expiresAt), 'encounter.active');
    else check(date(encounter.endedAt) && encounter.updatedAt === encounter.endedAt &&
      (encounter.status !== 'expired' || Date.parse(encounter.endedAt) >= Date.parse(encounter.expiresAt)), 'encounter.closed');
  }
  for (const activity of state.actividad.records) {
    const latest = checks.get(activity.chatId);
    check(group(activity.chatId) && activity.id === activityId(activity.chatId) && latest && activity.updatedAt === latest.createdAt &&
      activity.nextCheckAt === nextCheck(latest.createdAt) && activity.lastSpawnAt === latest.lastSpawnAt, 'encounter.activity');
  }
  check(state.actividad.records.length === checks.size, 'encounter.activityComplete');
}

export function validateEncounterTransition(before, after) {
  check(equal(before.accionescontenido.records, after.accionescontenido.records.slice(0, before.accionescontenido.records.length)), 'encounter.actionsAppendOnly');
  check(equal(before.encuentros.records.map(row => row.id), after.encuentros.records.slice(0, before.encuentros.records.length).map(row => row.id)), 'encounter.order');
  for (const old of before.encuentros.records) {
    const current = after.encuentros.records.find(row => row.id === old.id);
    if (old.status !== 'active') check(equal(old, current), 'encounter.closedImmutable');
    else {
      for (const field of ['id', 'kind', 'policyVersion', 'chatId', 'createdAt', 'expiresAt', 'snapshot']) check(equal(old[field], current[field]), 'encounter.sourceImmutable');
      check(Date.parse(current.updatedAt) >= Date.parse(old.updatedAt), 'encounter.monotonic');
    }
  }
  for (const encounter of after.encuentros.records.slice(before.encuentros.records.length)) {
    if (encounter.kind === 'boss') {
      const previous = before.encuentros.records.filter(row => row.kind === 'boss' && row.snapshot.id === encounter.snapshot.id).at(-1);
      check(!previous || Date.parse(encounter.createdAt) >= Date.parse(previous.createdAt) + previous.snapshot.respawnMs &&
        after.encuentros.records.find(row => row.id === previous.id).status !== 'active', 'encounter.bossRespawn');
    } else {
      check(!before.encuentros.records.some(row => row.kind === 'spawn' && row.chatId === encounter.chatId && row.status === 'active' && Date.parse(row.expiresAt) > Date.parse(encounter.createdAt)), 'encounter.singleSpawn');
      const character = before.personajes.records.find(row => row.id === encounter.snapshot.characterId);
      const counter = before.estado.records.find(row => row.id === `mint:${character?.id}`);
      check(character?.obtainable && character.supply.grandfatheredIssued === undefined && counter.issuedCount < character.supply.max &&
        encounter.snapshot.characterName === character.name && encounter.snapshot.rarity === character.rarity, 'encounter.spawnAvailable');
    }
  }
  for (const action of after.accionescontenido.records.slice(before.accionescontenido.records.length)) if (action.kind === 'boss_attack') {
    const user = before.usuarios.records.find(row => row.id === action.userId), s = action.details.unitSnapshot;
    const unit = before.unidades.records.find(row => row.id === s.id);
    const character = before.personajes.records.find(row => row.id === unit?.characterId);
    const expired = expiredStoredLock(before, after, unit, action.createdAt);
    check(user?.team[0] === unit?.id && unit.ownerId === action.userId && unit.ownershipVersion === s.ownershipVersion &&
      (unit.lock === null || expired) && equal(unit.progress, s.progress) && s.characterName === displayUnitCharacterName(unit, character) && equal(s.evolution ?? null, unit.evolution ?? null) &&
      equal(s.attacks, character.attackIds.map(id => advancedAttack(before.ataques.records.find(row => row.id === id)))), 'encounter.attackSource');
  }
}
