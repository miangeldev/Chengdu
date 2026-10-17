import { equal } from './equality.js';
import { requireGame } from '../utils/GameError.js';
import { STORY_CAMPAIGN_ID, STORY_CONTENT_VERSION, getStoryMission } from '../game/story/catalog.js';
import { createStoryBattle, resolveStoryAction } from '../game/story/combat.js';
import { reduceStoryProgress, storyProgressId, storyRewardId } from '../game/story/progress.js';
import { storyUnitSnapshot } from '../game/story/snapshot.js';
import { effectiveUnitStats, displayUnitCharacterName } from '../game/evolution/rules.js';
import { advancedAttack } from '../game/battle/combatContent.js';
import { expiredStoredLock } from './lockProof.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field: `story.${field}` });
const integer = (value, min = 0) => Number.isSafeInteger(value) && value >= min;
const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const text = value => typeof value === 'string' && value.trim() === value && value.length > 0 && value.length <= 200;
const validCampaign = row => row.campaignId === STORY_CAMPAIGN_ID && row.contentVersion === STORY_CONTENT_VERSION;
const mapOf = rows => new Map(rows.map(row => [row.id, row]));
const ownerAt = (state, unitId, version) => state.eventos.records.find(event => event.unitId === unitId &&
  (event.ownershipVersion ?? 0) === version)?.toOwnerId;
function ownershipDate(state, unitId, version, at) {
  const event = state.eventos.records.find(event => event.unitId === unitId && (event.ownershipVersion ?? 0) === version);
  const next = state.eventos.records.find(event => event.unitId === unitId && event.ownershipVersion === version + 1);
  // Different committed operations can share a clock tick. Equality remains
  // valid; a strictly later award cannot belong to the previous owner.
  return event && Date.parse(at) >= Date.parse(event.createdAt) && (!next || Date.parse(at) <= Date.parse(next.createdAt));
}
const sameRefs = (refs, snapshots) => equal(refs, snapshots.map(snapshot => ({ unitId: snapshot.id, ownershipVersion: snapshot.ownershipVersion })));

// Replaying each prefix once also supplies the exact combat result seen by an
// older action. A later victory must never turn an earlier attack into a win.
function battleHistory(record) {
  const original = record.combat;
  let combat = createStoryBattle({ id: record.id, encounterId: original.encounterId,
    units: original.unitSnapshots, now: record.createdAt });
  const prefixes = [combat];
  for (const action of original.actions) {
    combat = resolveStoryAction(combat, { action: action.action, choice: action.choice,
      rolls: action.rolls, now: action.createdAt }).battle;
    prefixes.push(combat);
  }
  check(equal(combat, original), 'combatReplay');
  return prefixes;
}

export function validateStoryData(state) {
  const users = mapOf(state.usuarios.records), units = mapOf(state.unidades.records);
  const characters = mapOf(state.personajes.records), attacks = mapOf(state.ataques.records);
  const battles = mapOf(state.combateshistoria.records), rewards = mapOf(state.premioshistoria.records);
  const histories = new Map(), activeUnits = new Set(), activeUsers = new Set();
  for (const battle of battles.values()) {
    const mission = getStoryMission(battle.missionId);
    check(/^STB-[a-f0-9-]{36}$/.test(battle.id) && users.has(battle.userId) && validCampaign(battle) &&
      integer(battle.run, 1) && mission?.encounterId === battle.combat?.encounterId &&
      date(battle.createdAt) && date(battle.updatedAt) && Date.parse(battle.updatedAt) >= Date.parse(battle.createdAt), 'battleMetadata');
    const prefixes = battleHistory(battle); histories.set(battle.id, prefixes);
    check(battle.status === battle.combat.status && battle.updatedAt === battle.combat.updatedAt, 'battleStatus');
    check(battle.status === 'active' ? battle.closedAt === null && battle.closeReason === null :
      battle.closedAt === battle.combat.finishedAt && ['won', 'lost', 'reset'].includes(battle.closeReason) &&
      (battle.closeReason === 'reset' ? battle.status === 'lost' && battle.combat.actions.at(-1)?.action === 'surrender' : battle.closeReason === battle.status), 'battleClosure');
    check(battle.combat.id === battle.id, 'battleId');
    for (const snapshot of battle.combat.unitSnapshots) {
      const unit = units.get(snapshot.id);
      check(unit && unit.characterId === snapshot.characterId && unit.serial === snapshot.serial &&
        snapshot.ownerId === battle.userId && integer(snapshot.ownershipVersion) && snapshot.ownershipVersion <= unit.ownershipVersion &&
        ownerAt(state, unit.id, snapshot.ownershipVersion) === battle.userId &&
        snapshot.statsVersion === unit.statGrowthVersion && snapshot.traitVersion === unit.traitVersion &&
        equal(snapshot.traits, unit.traits) && snapshot.variant === unit.variant &&
        equal(snapshot.combatBaseStats, unit.combatBaseStats) && integer(snapshot.level, 1) && snapshot.level <= unit.progress.level &&
        Date.parse(battle.createdAt) >= Date.parse(unit.createdAt), 'historicalSnapshot');
      const evolution = snapshot.evolution;
      check(evolution === null || equal(evolution, unit.evolution) && Date.parse(evolution.evolvedAt) <= Date.parse(battle.createdAt), 'snapshotEvolution');
      const historicUnit = { ...unit, progress: { level: snapshot.level, xp: 0 }, evolution };
      check(equal(snapshot.stats, effectiveUnitStats(historicUnit)) && snapshot.hp === snapshot.stats.hp, 'snapshotStats');
      const character = characters.get(unit.characterId);
      check(integer(snapshot.characterRevision, 1) && snapshot.characterRevision <= character.revision, 'snapshotRevision');
      if (snapshot.characterRevision === character.revision) check(equal(snapshot.attacks.map(attack => attack.id), character.attackIds) &&
        snapshot.characterName === displayUnitCharacterName(historicUnit, character) && snapshot.profileVersion === character.combat.version &&
        snapshot.element === character.combat.element && equal(snapshot.ability, character.combat.ability), 'snapshotProfile');
      for (const frozen of snapshot.attacks) {
        const attack = attacks.get(frozen.id);
        check(attack && integer(frozen.revision, 1) && frozen.revision <= attack.revision &&
          (frozen.revision !== attack.revision || equal(frozen, advancedAttack(attack))), 'snapshotAttack');
      }
      check(ownershipDate(state, unit.id, snapshot.ownershipVersion, battle.createdAt), 'snapshotOwnershipDate');
      if (battle.status === 'active') {
        check(!activeUnits.has(unit.id) && unit.ownerId === battle.userId && unit.lock?.type === 'story' &&
          unit.lock.referenceId === battle.id && unit.progress.level === snapshot.level &&
          unit.ownershipVersion === snapshot.ownershipVersion && equal(unit.evolution ?? null, snapshot.evolution), 'activeUnit');
        activeUnits.add(unit.id);
      }
    }
    if (battle.status === 'active') {
      check(!activeUsers.has(battle.userId) && equal(users.get(battle.userId).team, battle.combat.unitSnapshots.map(unit => unit.id)), 'activeTeam');
      activeUsers.add(battle.userId);
    }
  }
  for (const unit of units.values()) if (unit.lock?.type === 'story') check(activeUnits.has(unit.id), 'orphanLock');

  const chains = new Map(), keys = new Set(), firstCompletions = new Map(), creations = new Set(), steps = new Set(), stepCounts = new Map();
  for (const action of state.accioneshistoria.records) {
    const previous = chains.get(action.userId) ?? null;
    check(/^STA-[a-f0-9-]{36}$/.test(action.id) && users.has(action.userId) && validCampaign(action) && date(action.createdAt) &&
      text(action.operationKey) && !keys.has(action.operationKey) && equal(action.before, previous) &&
      (!users.get(action.userId).createdAt || Date.parse(action.createdAt) >= Date.parse(users.get(action.userId).createdAt)) &&
      (!previous || Date.parse(action.createdAt) >= Date.parse(previous.updatedAt)), 'actionMetadata');
    keys.add(action.operationKey);
    const request = action.request;
    check(request && typeof request === 'object' && !Array.isArray(request) && (
      action.kind === 'choose' ? equal(Object.keys(request), ['choice']) && typeof request.choice === 'string' :
      action.kind === 'act' ? equal(Object.keys(request), ['action', 'choice']) && typeof request.action === 'string' &&
        (request.choice === null || typeof request.choice === 'string') :
      ['start', 'continue', 'retry', 'reset'].includes(action.kind) && equal(request, {})), 'request');
    const battle = action.battleId ? battles.get(action.battleId) : null;
    const prefix = battle && integer(action.battleActionSeq, 1) ? histories.get(battle.id)[action.battleActionSeq] : null;
    if (battle) {
      check(battle.userId === action.userId && battle.run === (previous?.run ?? 1) && battle.missionId === getStoryMission(previous?.missionIndex)?.id, 'actionBattleOwner');
      if (action.battleActionSeq === null) {
        check(['choose', 'continue', 'retry'].includes(action.kind) && !creations.has(battle.id) && battle.createdAt === action.createdAt &&
          (action.kind === 'retry' ? previous?.stage === 'defeated' : !['battle', 'defeated'].includes(previous?.stage)), 'battleStart');
        creations.add(battle.id);
      } else {
        const step = battle.combat.actions[action.battleActionSeq - 1], key = `${battle.id}:${action.battleActionSeq}`;
        check(prefix && step && !steps.has(key) && action.battleActionSeq === (stepCounts.get(battle.id) ?? 0) + 1 && previous?.activeBattleId === battle.id &&
          ['act', 'reset'].includes(action.kind) && step.createdAt === action.createdAt &&
          step.action === (action.kind === 'reset' ? 'surrender' : request.action) &&
          step.choice === (action.kind === 'reset' ? null : request.action === 'skill' ? '2' :
            request.action === 'attack' ? request.choice ?? '1' : request.action === 'switch' ? request.choice : null), 'battleStep');
        steps.add(key);
        stepCounts.set(battle.id, action.battleActionSeq);
      }
    } else check(action.battleId === null && action.battleActionSeq === null && action.kind !== 'act' && !previous?.activeBattleId, 'missingBattle');
    const expected = reduceStoryProgress(previous, action, prefix);
    check(equal(action.after, expected) && action.run === expected.run && Array.isArray(action.unitRefs), 'progressReplay');
    const mission = previous ? getStoryMission(previous.missionIndex) : null;
    const completed = previous && expected.missionIndex === previous.missionIndex + 1;
    if (completed) {
      const id = storyRewardId(action.userId, mission.id), reward = rewards.get(id);
      check(action.rewardId === id && reward, 'completionReward');
      if (!firstCompletions.has(id)) {
        firstCompletions.set(id, action);
        check(reward.actionId === action.id && reward.createdAt === action.createdAt && reward.run === expected.run &&
          (mission.reward.unitXp === 0 ? action.unitRefs.length === 0 : action.unitRefs.length >= 1 && action.unitRefs.length <= 3) &&
          (!battle || sameRefs(action.unitRefs, battle.combat.unitSnapshots)), 'firstReward');
      } else check(action.unitRefs.length === 0, 'replayedReward');
    } else check(action.rewardId === null && action.unitRefs.length === 0, 'unearnedReward');
    chains.set(action.userId, expected);
  }
  check(chains.size === state.historias.records.length && firstCompletions.size === rewards.size && creations.size === battles.size &&
    steps.size === [...battles.values()].reduce((sum, battle) => sum + battle.combat.actions.length, 0), 'coverage');
  for (const progress of state.historias.records) check(progress.id === storyProgressId(progress.userId) &&
    equal(progress, chains.get(progress.userId)) && (progress.activeBattleId ? battles.get(progress.activeBattleId)?.status === 'active' : !activeUsers.has(progress.userId)), 'savedProgress');
  for (const reward of rewards.values()) {
    const action = firstCompletions.get(reward.id), mission = getStoryMission(reward.missionId);
    check(action && mission && validCampaign(reward) && reward.userId === action.userId && reward.missionCode === mission.code &&
      ['coins', 'userXp', 'unitXp', 'materials', 'memory'].every(key => equal(reward[key], mission.reward[key])) &&
      Array.isArray(reward.unitRewards) && reward.unitRewards.length === action.unitRefs.length &&
      new Set(action.unitRefs.map(ref => ref.unitId)).size === action.unitRefs.length, 'rewardDefinition');
    for (let index = 0; index < action.unitRefs.length; index++) {
      const ref = action.unitRefs[index], grant = reward.unitRewards[index];
      check(units.has(ref.unitId) && integer(ref.ownershipVersion) && ownerAt(state, ref.unitId, ref.ownershipVersion) === action.userId &&
        grant.unitId === ref.unitId && grant.ownershipVersion === ref.ownershipVersion && grant.xp === mission.reward.unitXp &&
        Date.parse(reward.createdAt) >= Date.parse(units.get(ref.unitId).createdAt) &&
        ownershipDate(state, ref.unitId, ref.ownershipVersion, reward.createdAt), 'rewardUnit');
    }
  }
}

export function validateStoryTransition(before, after, context = {}) {
  const actions = after.accioneshistoria.records.slice(before.accioneshistoria.records.length);
  const rewards = after.premioshistoria.records.slice(before.premioshistoria.records.length);
  check(equal(before.accioneshistoria.records, after.accioneshistoria.records.slice(0, before.accioneshistoria.records.length)) &&
    equal(before.premioshistoria.records, after.premioshistoria.records.slice(0, before.premioshistoria.records.length)), 'appendOnly');
  check(actions.length <= 1, 'oneOperation');
  const action = actions[0];
  for (const row of actions) {
    const user = before.usuarios.records.find(user => user.id === row.userId);
    check(user && Date.parse(row.createdAt) >= Date.parse(user.updatedAt) &&
      (!context.now || Date.parse(row.createdAt) <= Date.parse(context.now)), 'trustedClock');
    if (row.kind === 'continue' && getStoryMission(row.before?.missionIndex)?.kind === 'starter')
      check(before.unidades.records.some(unit => unit.ownerId === row.userId), 'starterAuthority');
  }
  for (const progress of after.historias.records) {
    const previous = before.historias.records.find(row => row.id === progress.id);
    if (!equal(previous, progress)) check(action?.userId === progress.userId && equal(action.before, previous ?? null) && equal(action.after, progress), 'progressAuthority');
  }
  for (const battle of after.combateshistoria.records) {
    const previous = before.combateshistoria.records.find(row => row.id === battle.id);
    if (equal(previous, battle)) continue;
    check(action?.battleId === battle.id, 'battleAuthority');
    if (previous) {
      check(previous.status === 'active' && battle.combat.actions.length === previous.combat.actions.length + 1 &&
        equal(previous.combat.actions, battle.combat.actions.slice(0, previous.combat.actions.length)) &&
        equal(previous.combat.unitSnapshots, battle.combat.unitSnapshots) &&
        ['userId', 'campaignId', 'contentVersion', 'run', 'missionId', 'createdAt'].every(key => equal(previous[key], battle[key])), 'battleAppendOnly');
    } else {
      check(battle.status === 'active' && battle.combat.actions.length === 0, 'newBattle');
      const user = before.usuarios.records.find(row => row.id === battle.userId);
      const ids = battle.combat.unitSnapshots.map(unit => unit.id);
      check(user.team.length ? equal(user.team, ids) : ids.length === 1, 'expeditionSelection');
      for (const snapshot of battle.combat.unitSnapshots) {
        const unit = before.unidades.records.find(row => row.id === snapshot.id);
        const character = before.personajes.records.find(row => row.id === unit?.characterId);
        const attacks = character?.attackIds.map(id => before.ataques.records.find(row => row.id === id));
        check(unit && unit.ownerId === battle.userId && expiredStoredLock(before, after, unit, battle.createdAt) &&
          Date.parse(battle.createdAt) >= Date.parse(unit.updatedAt) && equal(snapshot, storyUnitSnapshot(unit, character, attacks)), 'snapshotAuthority');
      }
    }
  }
  for (const reward of rewards) {
    check(action?.rewardId === reward.id && action.id === reward.actionId, 'rewardAuthority');
    const user = before.usuarios.records.find(row => row.id === reward.userId);
    const snapshots = action.battleId ? after.combateshistoria.records.find(row => row.id === action.battleId)?.combat.unitSnapshots : null;
    const expectedIds = user.team.length ? user.team : after.usuarios.records.find(row => row.id === user.id).team;
    check(reward.unitXp === 0 || equal(reward.unitRewards.map(grant => grant.unitId), snapshots?.map(unit => unit.id) ?? expectedIds), 'rewardExpedition');
    for (const grant of reward.unitRewards) {
      const unit = before.unidades.records.find(row => row.id === grant.unitId);
      check(unit && unit.ownerId === reward.userId && unit.ownershipVersion === grant.ownershipVersion &&
        Date.parse(reward.createdAt) >= Date.parse(unit.updatedAt) && equal(grant.progressBefore, unit.progress) &&
        (expiredStoredLock(before, after, unit, reward.createdAt) || unit.lock?.type === 'story' && unit.lock.referenceId === action.battleId &&
          after.combateshistoria.records.find(row => row.id === action.battleId)?.status === 'won'), 'rewardCurrentOwner');
    }
  }
  for (const unit of before.unidades.records) {
    const next = after.unidades.records.find(row => row.id === unit.id);
    if (unit.lock?.type === 'story' || next?.lock?.type === 'story') {
      const referenceId = unit.lock?.type === 'story' ? unit.lock.referenceId : next.lock.referenceId;
      if (!equal(unit.lock, next.lock)) check(action?.battleId === referenceId && next.updatedAt === action.createdAt, 'lockAuthority');
      if (unit.lock?.type === 'story') check(unit.ownerId === next.ownerId && unit.ownershipVersion === next.ownershipVersion &&
        equal(unit.evolution, next.evolution) && (next.lock === null || equal(unit.progress, next.progress)), 'lockedUnitImmutable');
    }
  }
}
