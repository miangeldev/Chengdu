import { requireGame } from '../utils/GameError.js';
import { ACHIEVEMENTS, CONTENT_POLICY_VERSION, MISSIONS } from '../game/content/catalog.js';
import { achievementProgress, contentPeriod, missionProgress } from '../game/content/objectives.js';
import { activeCampaign, bossContributions, bossRewardFor } from '../game/content/encounterRules.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const integer = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const distinct = list => Array.isArray(list) && new Set(list).size === list.length;
const amounts = value => value && ['coins', 'userXp', 'tickets'].every(key => integer(value[key]));

function missionEvidence(state, reward, definition) {
  const evidence = reward.details.evidence;
  check(evidence && distinct(evidence.evidenceBattleIds), 'content.missionEvidence');
  const battles = evidence.evidenceBattleIds.map(id => state.combates.records.find(battle => battle.id === id));
  check(battles.every(Boolean), 'content.missionBattleReferences');
  const progress = missionProgress({ combates: { records: battles } }, reward.userId, reward.details.period, reward.createdAt);
  check(equal(progress, evidence) && (definition.metric === 'characters' ? progress.characters.length : progress[definition.metric]) >= definition.target, 'content.missionEligibility');
}

function achievementEvidence(state, unlock, definition) {
  check(unlock.evidence && (definition.id === 'collector' ? distinct(unlock.evidence.unitIds) : distinct(unlock.evidence.battleIds)), 'content.achievementEvidence');
  const allProgress = achievementProgress(state, unlock.userId, definition.id, unlock.unlockedAt);
  const key = definition.id === 'collector' ? 'unitIds' : 'battleIds';
  if (definition.id === 'undefeated') {
    const settled = state.combates.records.filter(battle => battle.acceptedAt !== null && battle.finishedAt !== null &&
      Date.parse(battle.finishedAt) <= Date.parse(unlock.unlockedAt) && battle.players.some(player => player.userId === unlock.userId));
    const indices = unlock.evidence.battleIds.map(id => settled.findIndex(battle => battle.id === id));
    check(indices.length >= definition.target && indices.every((index, offset) => index >= 0 && (offset === 0 || index === indices[offset - 1] + 1) &&
      settled[index].status === 'finished' && settled[index].settlement?.reason === 'rewarded' && settled[index].winnerId === unlock.userId), 'content.achievementStreak');
  } else {
    check(unlock.evidence[key].length >= definition.target && unlock.evidence[key].every(id => allProgress.evidence[key].includes(id)), 'content.achievementEligibility');
  }
}

export function validateContentData(state) {
  const users = new Set(state.usuarios.records.map(user => user.id));
  const campaigns = new Map(state.campanas.records.map(event => [event.id, event]));
  const codes = new Set();
  for (const campaign of campaigns.values()) {
    check(text(campaign.id) && /^[a-z][a-z0-9_]*$/.test(campaign.id) && text(campaign.code) && /^[a-z][a-z0-9_]*$/.test(campaign.code) && !codes.has(campaign.code) &&
      integer(campaign.revision, 1) && campaign.policyVersion === CONTENT_POLICY_VERSION && text(campaign.name) && date(campaign.startsAt) && date(campaign.endsAt) &&
      Date.parse(campaign.endsAt) > Date.parse(campaign.startsAt) && distinct(campaign.characterIds) && amounts(campaign.welcome), 'content.campaign');
    codes.add(campaign.code);
    for (const id of campaign.characterIds) check(state.personajes.records.some(character => character.id === id && character.eventId === campaign.id), 'content.eventCharacter');
  }
  for (const character of state.personajes.records) if (character.eventId !== undefined) {
    const campaign = campaigns.get(character.eventId);
    check(campaign?.characterIds.includes(character.id) && character.starterEligible === false, 'content.characterCampaign');
    for (const unit of state.unidades.records.filter(unit => unit.characterId === character.id)) check(activeCampaign(campaign, unit.createdAt), 'content.mintWindow');
  }
  const unlocks = new Map();
  for (const unlock of state.logros.records) {
    const definition = ACHIEVEMENTS.find(row => row.id === unlock.achievementId);
    const key = `${unlock.userId}:${unlock.achievementId}`;
    check(users.has(unlock.userId) && definition && unlock.id === `ACH:${key}` && !unlocks.has(key) && date(unlock.unlockedAt) &&
      unlock.policyVersion === CONTENT_POLICY_VERSION && equal(unlock.snapshot, definition), 'content.unlock');
    achievementEvidence(state, unlock, definition);
    unlocks.set(key, unlock);
  }
  const sources = new Set(), keys = new Set(), tickets = new Map();
  for (const reward of state.premioscontenido.records) {
    const key = `${reward.kind}:${reward.sourceId}:${reward.userId}`;
    check(/^CR-[a-f0-9-]{36}$/.test(reward.id) && users.has(reward.userId) && text(reward.sourceId) && text(reward.operationKey) && reward.operationKey.trim() === reward.operationKey &&
      !keys.has(reward.operationKey) && !sources.has(key) && reward.policyVersion === CONTENT_POLICY_VERSION && date(reward.createdAt) && amounts(reward) &&
      integer(reward.ticketCost) && integer(reward.ticketsBefore) && integer(reward.ticketsAfter) && reward.ticketsBefore === (tickets.get(reward.userId) ?? 0) &&
      Number.isSafeInteger(reward.ticketsBefore + reward.tickets) && reward.ticketsAfter === reward.ticketsBefore + reward.tickets - reward.ticketCost &&
      reward.details && typeof reward.details === 'object', 'content.reward');
    keys.add(reward.operationKey); sources.add(key); tickets.set(reward.userId, reward.ticketsAfter);
    let expected;
    if (reward.kind === 'mission') {
      const definition = MISSIONS.find(row => row.id === reward.details.missionId);
      check(definition && reward.details.period === contentPeriod(reward.createdAt) && reward.sourceId === `${reward.details.period}:${definition.id}`, 'content.missionSource');
      missionEvidence(state, reward, definition);
      expected = { ...definition.reward, ticketCost: 0 };
    } else if (reward.kind === 'achievement') {
      const unlock = unlocks.get(`${reward.userId}:${reward.sourceId}`);
      check(unlock && reward.details.achievementId === unlock.achievementId && Date.parse(reward.createdAt) >= Date.parse(unlock.unlockedAt), 'content.achievementSource');
      expected = { ...unlock.snapshot.reward, ticketCost: 0 };
    } else if (reward.kind === 'event') {
      const campaign = campaigns.get(reward.sourceId);
      check(activeCampaign(campaign, reward.createdAt) && reward.details.campaignId === campaign.id, 'content.eventSource');
      expected = { ...campaign.welcome, ticketCost: 0 };
    } else if (reward.kind === 'boss') {
      const boss = state.encuentros.records.find(row => row.id === reward.sourceId && row.kind === 'boss');
      const actions = state.accionescontenido.records.filter(row => row.kind === 'boss_attack' && row.encounterId === boss?.id);
      check(boss?.status === 'defeated' && reward.createdAt === boss.endedAt && reward.details.encounterId === boss.id, 'content.bossSource');
      const result = bossRewardFor(boss.snapshot, bossContributions(actions), reward.userId, boss.winnerId);
      check(result && reward.details.damage === result.damage && equal(reward.details.components, result.components), 'content.bossParticipation');
      expected = result;
    } else if (reward.kind === 'spawn') {
      const spawn = state.encuentros.records.find(row => row.id === reward.sourceId && row.kind === 'spawn');
      const unit = state.unidades.records.find(row => row.id === reward.details.unitId);
      check(spawn?.status === 'captured' && spawn.winnerId === reward.userId && spawn.endedAt === reward.createdAt &&
        reward.details.encounterId === spawn.id && unit?.origin.sourceId === spawn.id && unit.createdAt === reward.createdAt, 'content.spawnSource');
      expected = { coins: 0, userXp: 0, tickets: 0, ticketCost: spawn.snapshot.ticketCost };
    } else check(false, 'content.rewardKind');
    check(['coins', 'userXp', 'tickets', 'ticketCost'].every(field => reward[field] === expected[field]), 'content.rewardAmounts');
  }
}

export function validateContentTransition(before, after) {
  for (const name of ['premioscontenido', 'logros']) check(equal(before[name].records, after[name].records.slice(0, before[name].records.length)), `content.${name}.appendOnly`);
  for (const campaign of before.campanas.records) check(equal(campaign, after.campanas.records.find(row => row.id === campaign.id)), 'content.campaignImmutable');
  for (const character of before.personajes.records) check(character.eventId === after.personajes.records.find(row => row.id === character.id)?.eventId, 'content.eventIdImmutable');
  for (const unlock of after.logros.records.slice(before.logros.records.length)) {
    const definition = ACHIEVEMENTS.find(row => row.id === unlock.achievementId);
    achievementEvidence(before, unlock, definition);
  }
  for (const reward of after.premioscontenido.records.slice(before.premioscontenido.records.length)) if (reward.kind === 'mission') {
    missionEvidence(before, reward, MISSIONS.find(row => row.id === reward.details.missionId));
  }
}
