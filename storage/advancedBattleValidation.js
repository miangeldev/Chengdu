import { validateEvolutionSnapshot } from './evolutionSnapshot.js';
import { evolvedStats, displayUnitCharacterName } from '../game/evolution/rules.js';
import { requireGame } from '../utils/GameError.js';
import { effectiveStats } from '../game/progression/rules.js';
import { ownershipAt } from '../game/units/ownership.js';
import { advancedAttack, validateCombatProfile, validateAttackCombatProfile } from '../game/battle/combatContent.js';
import { replayAdvancedBattle, MAX_ADVANCED_TURNS } from '../game/battle/advancedEngine.js';
import { CHALLENGE_TTL_MS, deadline } from '../game/battle/engine.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const integer = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) || !Number.isFinite(Date.parse(value))) return false;
  const canonical = new Date(value).toISOString();
  return canonical === value || canonical.replace('.000Z', 'Z') === value;
};
const open = battle => ['pending', 'active'].includes(battle.status);
const immutableSnapshot = unit => {
  const { hp, effects, cooldowns, abilityUsed, participated, ...snapshot } = unit;
  return snapshot;
};

function profileOf(unit) {
  return { version: unit.profileVersion, element: unit.element, ability: unit.ability };
}

function validateSnapshot(state, player, unit, battle, activeUnits) {
  const current = state.unidades.records.find(record => record.id === unit?.id);
  const character = state.personajes.records.find(record => record.id === unit?.characterId);
  check(current && character && current.characterId === unit.characterId && integer(unit.ownershipVersion) &&
    ownershipAt(state, unit.id, unit.ownershipVersion) === player.userId, 'battle.advancedSnapshotReferences');
  const acquisition = state.eventos.records.find(event => event.unitId === unit.id &&
    (unit.ownershipVersion === 0 ? event.type === 'unit_created' :
      event.type === 'unit_transferred' && event.ownershipVersion === unit.ownershipVersion));
  check(acquisition && Date.parse(acquisition.createdAt) <= Date.parse(battle.acceptedAt), 'battle.advancedAcquiredBeforeAcceptance');
  check(text(unit.characterName) && integer(unit.serial, 1) && integer(unit.characterRevision, 1) &&
    unit.characterRevision <= character.revision && unit.serial === current.serial && integer(unit.level, 1) && unit.level <= current.progress.level &&
    unit.statsVersion === 2 && equal(unit.combatBaseStats, current.combatBaseStats) &&
    unit.traitVersion === current.traitVersion && equal(unit.traits, current.traits) && unit.variant === current.variant,
  'battle.advancedSnapshotOrigin');
  validateEvolutionSnapshot(state, unit, battle.acceptedAt);
  check(equal(unit.stats, evolvedStats(effectiveStats(current.initialStats, unit.level, unit.statsVersion, unit.traits,
    unit.traitVersion, unit.combatBaseStats), unit.evolution, unit.characterId)), 'battle.advancedSnapshotStats');
  check(integer(unit.hp) && unit.hp <= unit.stats.hp && validateCombatProfile(profileOf(unit)) &&
    Array.isArray(unit.effects) && unit.cooldowns && typeof unit.cooldowns === 'object' && !Array.isArray(unit.cooldowns) &&
    typeof unit.abilityUsed === 'boolean' && typeof unit.participated === 'boolean', 'battle.advancedRuntime');
  check(Array.isArray(unit.attacks) && unit.attacks.length === 2 && unit.attacks[0].id !== unit.attacks[1].id, 'battle.advancedAttacks');
  check(unit.attacks[0].cooldown === 0, 'battle.advancedBasicAttackAvailable');
  for (const attack of unit.attacks) {
    const currentAttack = state.ataques.records.find(record => record.id === attack.id);
    check(currentAttack && integer(attack.revision, 1) && attack.revision <= currentAttack.revision && text(attack.name) &&
      validateAttackCombatProfile({ version: attack.combatVersion, power: attack.power, accuracy: attack.accuracy,
        type: attack.type, element: attack.element, effects: attack.effects, cooldown: attack.cooldown }), 'battle.advancedAttackProfile');
  }
  check(Object.entries(unit.cooldowns).every(([id, cooldown]) => {
    const attack = unit.attacks.find(attack => attack.id === id);
    return attack && integer(cooldown) && cooldown <= attack.cooldown;
  }), 'battle.advancedCooldowns');
  if (battle.status === 'active') {
    check(current.ownerId === player.userId && current.ownershipVersion === unit.ownershipVersion &&
      !activeUnits.has(unit.id) && equal(current.lock, { type: 'battle', referenceId: battle.id }), 'battle.advancedUnitLock');
    activeUnits.add(unit.id);
  }
}

export function validateAdvancedBattle(state, battle, { occupied, activeUnits, uniqueKey }) {
  const challengeDeadline = battle.competitive
    ? new Date(Math.min(Date.parse(deadline(battle.createdAt, CHALLENGE_TTL_MS)), Date.parse(battle.competitive.endsAt))).toISOString()
    : deadline(battle.createdAt, CHALLENGE_TTL_MS);
  check(/^BTL-[a-f0-9-]{36}$/.test(battle.id) && text(battle.chatId) && battle.rulesVersion === 2 && battle.rewardVersion === 2,
    'battle.advancedIdentity');
  check(['pending', 'active', 'finished', 'expired', 'rejected', 'cancelled'].includes(battle.status) &&
    ['auto', '1v1', '2v2', '3v3'].includes(battle.mode) && integer(battle.teamSize, 1) && battle.teamSize <= 3 &&
    battle.format === `${battle.teamSize}v${battle.teamSize}` && (battle.mode === 'auto' || battle.mode === battle.format), 'battle.advancedFormat');
  check(Array.isArray(battle.players) && battle.players.length === 2 && battle.players[0].userId !== battle.players[1].userId,
    'battle.advancedPlayers');
  check(date(battle.createdAt) && date(battle.updatedAt) && date(battle.expiresAt) &&
    Date.parse(battle.updatedAt) >= Date.parse(battle.createdAt) && integer(battle.turnNumber) &&
    battle.turnNumber <= MAX_ADVANCED_TURNS && Array.isArray(battle.actions) && battle.actions.length <= MAX_ADVANCED_TURNS &&
    Array.isArray(battle.openingEvents), 'battle.advancedTimestamps');
  uniqueKey(battle.challengeKey);
  uniqueKey(battle.acceptKey);
  const accepted = battle.acceptedAt !== null;
  check(!accepted || (date(battle.acceptedAt) && Date.parse(battle.acceptedAt) >= Date.parse(battle.createdAt) &&
    Date.parse(battle.acceptedAt) < Date.parse(challengeDeadline)), 'battle.advancedAcceptedAt');
  const allUnits = new Set();
  for (const player of battle.players) {
    check(state.usuarios.records.some(user => user.id === player.userId) && text(player.name) &&
      Array.isArray(player.units) && integer(player.activeIndex), 'battle.advancedPlayerReferences');
    if (open(battle)) {
      check(!occupied.has(player.userId), 'battle.playerBusy');
      occupied.add(player.userId);
    }
    if (!accepted) {
      check(player.units.length === 0 && player.activeIndex === 0, 'battle.advancedPendingUnits');
      continue;
    }
    check(player.units.length === battle.teamSize && player.activeIndex < player.units.length, 'battle.advancedTeamSize');
    if (battle.status === 'active') check(equal(state.usuarios.records.find(user => user.id === player.userId).team,
      player.units.map(unit => unit.id)), 'battle.advancedActiveTeam');
    for (const unit of player.units) {
      check(!allUnits.has(unit?.id), 'battle.advancedUniqueUnit');
      allUnits.add(unit.id);
      validateSnapshot(state, player, unit, battle, activeUnits);
    }
  }
  if (!accepted) {
    check(['pending', 'expired', 'rejected', 'cancelled'].includes(battle.status) && battle.turnNumber === 0 &&
      battle.turnUserId === null && battle.actions.length === 0 && battle.openingEvents.length === 0 &&
      battle.winnerId === null && battle.acceptKey === null, 'battle.advancedPendingState');
    check(battle.expiresAt === challengeDeadline, 'battle.advancedChallengeDeadline');
    if (battle.status === 'pending') check(battle.updatedAt === battle.createdAt, 'battle.advancedPendingTimestamp');
    else {
      check(date(battle.finishedAt) && battle.finishedAt === battle.updatedAt &&
        Date.parse(battle.finishedAt) >= Date.parse(battle.createdAt), 'battle.advancedChallengeClosedTimestamp');
      check(battle.status === 'expired' ? Date.parse(battle.finishedAt) >= Date.parse(battle.expiresAt)
        : Date.parse(battle.finishedAt) <= Date.parse(battle.expiresAt), 'battle.advancedChallengeTimeout');
    }
  } else {
    check(['active', 'finished', 'expired'].includes(battle.status), 'battle.advancedAcceptedState');
    let previousTime = Date.parse(battle.acceptedAt);
    for (const action of battle.actions) {
      uniqueKey(action.operationKey);
      check(date(action.createdAt) && Date.parse(action.createdAt) >= previousTime &&
        Date.parse(action.createdAt) <= Date.parse(battle.updatedAt), 'battle.advancedActionTimestamp');
      previousTime = Date.parse(action.createdAt);
    }
    const replayed = replayAdvancedBattle(battle);
    check(equal(replayed.players, battle.players) && equal(replayed.actions, battle.actions) &&
      equal(replayed.openingEvents, battle.openingEvents) && replayed.turnNumber === battle.turnNumber,
    'battle.advancedReplay');
    if (battle.status === 'expired') {
      check(replayed.status === 'active' && battle.turnUserId === null && battle.winnerId === null &&
        battle.finishReason === 'inactivity' && date(battle.finishedAt) &&
        replayed.expiresAt === battle.expiresAt && battle.finishedAt === battle.updatedAt &&
        Date.parse(battle.finishedAt) >= Date.parse(battle.expiresAt), 'battle.advancedExpired');
    } else {
      check(replayed.status === battle.status && replayed.turnUserId === battle.turnUserId &&
        replayed.winnerId === battle.winnerId && replayed.finishReason === battle.finishReason &&
        replayed.finishedAt === battle.finishedAt && replayed.updatedAt === battle.updatedAt &&
        replayed.expiresAt === battle.expiresAt, 'battle.advancedReplayTerminal');
    }
  }
  if (open(battle)) check(battle.finishedAt === null && battle.finishReason === null, 'battle.openFinish');
  else check(date(battle.finishedAt) && battle.turnUserId === null &&
    (accepted || ({ expired: 'challenge_timeout', rejected: 'rejected', cancelled: 'cancelled' })[battle.status] === battle.finishReason), 'battle.closedFinish');
}

export function validateAdvancedBattleTransition(before, after, battle, updated) {
  check(updated.mode === battle.mode && updated.format === battle.format && updated.teamSize === battle.teamSize,
    'battle.advancedFormatImmutable');
  if (battle.status === 'pending' && updated.acceptedAt !== null) {
    check(updated.status === 'active' && updated.actions.length === 0, 'battle.advancedAcceptTransition');
    for (const player of updated.players) {
      const user = before.usuarios.records.find(record => record.id === player.userId);
      check(equal(user.team, player.units.map(unit => unit.id)), 'battle.advancedSnapshotTeam');
      for (const snapshot of player.units) {
        const unit = before.unidades.records.find(record => record.id === snapshot.id);
        const character = before.personajes.records.find(record => record.id === snapshot.characterId);
        check(unit && unit.ownerId === player.userId && snapshot.ownershipVersion === unit.ownershipVersion &&
          snapshot.characterRevision === character.revision && snapshot.characterName === displayUnitCharacterName(unit, character) && equal(snapshot.evolution ?? null, unit.evolution ?? null) &&
          snapshot.level === unit.progress.level && snapshot.profileVersion === character.combat.version &&
          snapshot.element === character.combat.element && equal(snapshot.ability, character.combat.ability) &&
          equal(snapshot.attacks, character.attackIds.map(id => advancedAttack(before.ataques.records.find(attack => attack.id === id)))),
        'battle.advancedSnapshotAuthority');
      }
    }
  }
  if (battle.status === 'active') {
    check(updated.status !== 'pending' && updated.acceptedAt === battle.acceptedAt && updated.acceptKey === battle.acceptKey &&
      equal(updated.openingEvents, battle.openingEvents), 'battle.advancedActiveTransition');
    for (let index = 0; index < 2; index++) {
      const previous = battle.players[index];
      const next = updated.players[index];
      check(equal(previous.units.map(immutableSnapshot), next.units.map(immutableSnapshot)), 'battle.advancedSnapshotImmutable');
      if (updated.status === 'active') {
        check(equal(before.usuarios.records.find(user => user.id === previous.userId).team,
          after.usuarios.records.find(user => user.id === previous.userId).team), 'battle.teamLocked');
      }
    }
  }
}
