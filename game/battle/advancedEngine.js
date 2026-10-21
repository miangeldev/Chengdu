import { requireGame } from '../../utils/GameError.js';
import { BATTLE_IDLE_MS, deadline } from './engine.js';
import { COMBAT_EFFECTS, COMBAT_ELEMENTS } from './combatContent.js';
import { fatalityAttack, fatalityEnabled, validateFatality } from './fatality.js';
import { GUARDIAN_MASKS, hasMaskRotation } from './masks.js';

export const MAX_ADVANCED_TURNS = 100;
export const battleUnits = player => player.units ?? (player.unit ? [player.unit] : []);
export const activeUnit = player => player.units ? player.units[player.activeIndex] : player.unit;
const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;

export function validateRuntimeEffect(value) {
  return !!value && COMBAT_EFFECTS.includes(value.type) && integer(value.remaining, 1, 5) &&
    integer(value.potency, 1, value.type === 'shield' ? 1000 : value.type === 'stun' ? 1 : 50) &&
    typeof value.sourceUnitId === 'string' && value.sourceUnitId.length > 0 && integer(value.appliedAtTurn, 0, MAX_ADVANCED_TURNS);
}

const event = (type, fields = {}) => ({ type, unitId: null, sourceUnitId: null, effect: null, amount: null, remaining: null,
  element: null, fromIndex: null, toIndex: null, ...fields });
const timestamp = now => typeof now === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(now) &&
  Number.isFinite(Date.parse(now)) && new Date(now).toISOString() === (now.includes('.') ? now : now.replace('Z', '.000Z'));

export function elementalMultiplier(attackElement, defendingElement) {
  requireGame(COMBAT_ELEMENTS.includes(attackElement) && COMBAT_ELEMENTS.includes(defendingElement), 'INVALID_ELEMENT');
  if (attackElement === 'neutral' || defendingElement === 'neutral' || attackElement === defendingElement) return 100;
  if ((attackElement === 'light' && defendingElement === 'dark') || (attackElement === 'dark' && defendingElement === 'light')) return 125;
  const strongAgainst = { fire: 'nature', nature: 'water', water: 'fire' };
  if (strongAgainst[attackElement] === defendingElement) return 125;
  if (strongAgainst[defendingElement] === attackElement) return 80;
  return 100;
}

export function calculateAdvancedDamage(attack, attacker, defender) {
  const attackBonus = attacker.effects.find(e => e.type === 'attack_up')?.potency ?? 0;
  const defensePenalty = defender.effects.find(e => e.type === 'defense_down')?.potency ?? 0;
  requireGame([attack.power, attacker.stats.attack, defender.stats.defense].every(Number.isSafeInteger), 'NUMERIC_OVERFLOW');
  const attackStat = BigInt(attacker.stats.attack) * BigInt(100 + attackBonus) / 100n;
  const defenseStat = BigInt(defender.stats.defense) * BigInt(100 - defensePenalty) / 100n;
  const calculated = BigInt(attack.power) + attackStat - defenseStat;
  const raw = calculated > 0n ? calculated : 1n;
  const scaled = raw * BigInt(elementalMultiplier(attack.element, defender.element)) / 100n;
  const damage = Number(scaled > 0n ? scaled : 1n);
  requireGame(Number.isSafeInteger(damage), 'NUMERIC_OVERFLOW');
  return damage;
}

export function selectedAdvancedAttack(player, choice) {
  const unit = activeUnit(player);
  const fatality = fatalityAttack(unit, choice);
  if (fatality) return fatality;
  const index = ['1', '2'].indexOf(String(choice));
  const attack = index >= 0 ? unit.attacks[index] : unit.attacks.find(a => a.id === choice);
  requireGame(attack, 'INVALID_ATTACK');
  return attack;
}

function applyEffect(target, source, definition, turn, events) {
  if (target.hp === 0) return;
  const existing = target.effects.find(e => e.type === definition.type);
  const next = { type: definition.type, remaining: Math.max(existing?.remaining ?? 0, definition.duration),
    potency: Math.max(existing?.potency ?? 0, definition.potency), sourceUnitId: source.id, appliedAtTurn: turn };
  if (existing) target.effects[target.effects.indexOf(existing)] = next;
  else target.effects.push(next);
  // Stable order prevents content declaration order from changing ticking rules.
  target.effects.sort((a, b) => COMBAT_EFFECTS.indexOf(a.type) - COMBAT_EFFECTS.indexOf(b.type));
  events.push(event('effect_applied', { unitId: target.id, sourceUnitId: source.id, effect: next.type, amount: next.potency, remaining: next.remaining }));
}

function enter(player, opponent, turn, events) {
  const unit = activeUnit(player);
  unit.participated = true;
  if (!unit.ability || unit.abilityUsed) return;
  unit.abilityUsed = true;
  events.push(event('ability', { unitId: unit.id }));
  for (const definition of unit.ability.effects) applyEffect(definition.target === 'self' ? unit : activeUnit(opponent), unit, definition, turn, events);
}

function idleDeadline(battle, now) {
  const expiresAt = deadline(now, BATTLE_IDLE_MS);
  return battle.competitive && Date.parse(battle.competitive.endsAt) < Date.parse(expiresAt)
    ? battle.competitive.endsAt : expiresAt;
}

export function initializeAdvancedBattle(previous) {
  const battle = structuredClone(previous);
  requireGame(battle.rulesVersion === 2 && Array.isArray(battle.players) && battle.players.length === 2 && battle.players.every(p => Array.isArray(p.units) && p.units.length >= 1 && p.units.length <= 3), 'INVALID_BATTLE_FORMAT');
  requireGame(timestamp(battle.acceptedAt), 'INVALID_TIMESTAMP');
  for (const player of battle.players) {
    player.activeIndex = 0;
    for (const unit of player.units) {
      requireGame(validateFatality(unit, battle.acceptedAt), 'INVALID_FATALITY');
      if (unit.fatality) unit.fatality.used = false;
      if (hasMaskRotation(unit) && fatalityEnabled(battle.acceptedAt)) unit.mask = { index: -1, turns: 0 };
      else delete unit.mask;
      unit.hp = unit.stats.hp;
      unit.effects = [];
      unit.cooldowns = {};
      unit.abilityUsed = false;
      unit.participated = false;
    }
  }
  battle.actions = [];
  battle.openingEvents = [];
  for (const player of battle.players) for (const unit of player.units) {
    if (unit.fatality?.unlocked) battle.openingEvents.push(event('fatality_ready', { unitId: unit.id }));
  }
  battle.status = 'active';
  battle.turnNumber = 1;
  battle.turnUserId = activeUnit(battle.players[1]).stats.speed > activeUnit(battle.players[0]).stats.speed ? battle.players[1].userId : battle.players[0].userId;
  battle.updatedAt = battle.acceptedAt;
  battle.expiresAt = idleDeadline(battle, battle.acceptedAt);
  battle.winnerId = null;
  battle.finishReason = null;
  battle.finishedAt = null;
  enter(battle.players[0], battle.players[1], 0, battle.openingEvents);
  enter(battle.players[1], battle.players[0], 0, battle.openingEvents);
  return battle;
}

function removeEffect(unit, effect, events) {
  unit.effects = unit.effects.filter(e => e !== effect);
  events.push(event('effect_expired', { unitId: unit.id, sourceUnitId: effect.sourceUnitId, effect: effect.type }));
}

function startTurn(unit, events, turn) {
  if (hasMaskRotation(unit) && unit.mask && unit.hp > 0) {
    if (unit.mask.index === 1) {
      for (const effect of [...unit.effects]) if (effect.type === 'attack_up' && effect.sourceUnitId === unit.id && effect.potency === 6) removeEffect(unit, effect, events);
    }
    unit.mask.index = unit.mask.turns % GUARDIAN_MASKS.length;
    unit.mask.turns += 1;
    const stance = GUARDIAN_MASKS[unit.mask.index];
    events.push(event('mask_changed', { unitId: unit.id, maskId: stance.id, maskName: stance.name }));
    applyEffect(unit, unit, stance.effect, turn, events);
  }
  let stunned = false;
  for (const effect of [...unit.effects]) {
    if (unit.hp === 0) break;
    if (!['poison', 'burn', 'regeneration', 'stun'].includes(effect.type)) continue;
    effect.remaining -= 1;
    if (effect.type === 'stun') {
      stunned = true;
      events.push(event('stun', { unitId: unit.id, sourceUnitId: effect.sourceUnitId, effect: effect.type, remaining: effect.remaining }));
    } else {
      const amount = Math.max(1, Number(BigInt(unit.stats.hp) * BigInt(effect.potency) / 100n));
      const delta = effect.type === 'regeneration' ? Math.min(unit.stats.hp - unit.hp, amount) : Math.min(unit.hp, amount);
      unit.hp += effect.type === 'regeneration' ? delta : -delta;
      if (delta > 0) events.push(event('effect_tick', { unitId: unit.id, sourceUnitId: effect.sourceUnitId, effect: effect.type, amount: delta, remaining: effect.remaining }));
    }
    if (effect.remaining === 0) removeEffect(unit, effect, events);
  }
  return stunned;
}

function endTurn(unit, originalEffects, oldCooldowns, usedAttackId, turn, events) {
  for (const effect of originalEffects) {
    if (!unit.effects.includes(effect) || ['poison', 'burn', 'regeneration', 'stun'].includes(effect.type) || effect.appliedAtTurn >= turn) continue;
    effect.remaining -= 1;
    if (effect.remaining === 0) removeEffect(unit, effect, events);
  }
  for (const [id, remaining] of Object.entries(oldCooldowns)) {
    if (id === usedAttackId) continue;
    if (remaining <= 1) delete unit.cooldowns[id];
    else unit.cooldowns[id] = remaining - 1;
  }
}

function finish(battle, winnerId, reason, now) {
  battle.status = 'finished';
  battle.winnerId = winnerId;
  battle.finishReason = reason;
  battle.finishedAt = now;
  battle.turnUserId = null;
}

function knockout(battle, player, opponent, turn, now, events) {
  const fallen = activeUnit(player);
  if (fallen.hp > 0) return;
  events.push(event('knockout', { unitId: fallen.id }));
  fallen.effects = [];
  fallen.cooldowns = {};
  const next = player.units.findIndex(u => u.hp > 0);
  if (next === -1) { finish(battle, opponent.userId, 'knockout', now); return; }
  const previousIndex = player.activeIndex;
  player.activeIndex = next;
  events.push(event('auto_switch', { unitId: player.units[next].id, sourceUnitId: fallen.id, fromIndex: previousIndex, toIndex: next }));
  enter(player, opponent, turn, events);
}

function absorbShield(unit, rawDamage, events) {
  const shield = unit.effects.find(e => e.type === 'shield');
  if (!shield) return rawDamage;
  const absorbed = Math.min(rawDamage, shield.potency);
  shield.potency -= absorbed;
  events.push(event('shield_absorbed', { unitId: unit.id, sourceUnitId: shield.sourceUnitId, effect: 'shield', amount: absorbed, remaining: shield.remaining }));
  if (shield.potency === 0) removeEffect(unit, shield, events);
  return rawDamage - absorbed;
}

export function resolveAdvancedAction(previous, { userId, type = 'attack', choice = null, operationKey = null, now, roll = null }) {
  requireGame(previous.status === 'active', 'BATTLE_NOT_ACTIVE');
  requireGame(['attack', 'switch', 'surrender'].includes(type), 'INVALID_BATTLE_ACTION');
  requireGame(previous.players.some(p => p.userId === userId), 'BATTLE_NOT_PARTICIPANT');
  requireGame(type === 'surrender' || previous.turnUserId === userId, 'NOT_YOUR_TURN');
  requireGame(timestamp(now) && Date.parse(now) >= Date.parse(previous.updatedAt), 'INVALID_TIMESTAMP');
  requireGame(Date.parse(now) < Date.parse(previous.expiresAt), 'BATTLE_EXPIRED');
  requireGame(operationKey === null || typeof operationKey === 'string' && operationKey.length > 0 && operationKey.length <= 200, 'INVALID_OPERATION_KEY');
  requireGame(type !== 'attack' || integer(roll, 0, 99), 'INVALID_RANDOM_ROLL');
  requireGame(type === 'attack' || roll === null, 'INVALID_RANDOM_ROLL');
  const battle = structuredClone(previous);
  const player = battle.players.find(p => p.userId === userId);
  const opponent = battle.players.find(p => p.userId !== userId);
  const actor = activeUnit(player);
  const target = activeUnit(opponent);
  const attack = type === 'attack' ? selectedAdvancedAttack(player, choice) : null;
  if (attack && !actor.effects.some(e => e.type === 'stun')) requireGame(!(actor.cooldowns[attack.id] > 0), 'ATTACK_COOLDOWN', { remaining: actor.cooldowns[attack.id] });
  const switchIndex = type === 'switch' && /^[1-3]$/.test(String(choice)) ? Number(choice) - 1 : -1;
  if (type === 'switch') {
    requireGame(switchIndex >= 0 && switchIndex < player.units.length, 'INVALID_TEAM_SLOT');
    requireGame(switchIndex !== player.activeIndex, 'UNIT_ALREADY_ACTIVE');
    requireGame(player.units[switchIndex].hp > 0, 'UNIT_KNOCKED_OUT');
  }
  const action = { seq: battle.actions.length + 1, turnNumber: battle.turnNumber, type, commandType: type,
    choice: choice === null ? null : String(choice), actorId: userId, targetId: opponent.userId, actorUnitId: actor.id, targetUnitId: target.id,
    attackId: null, hit: null, damage: 0, beforeHp: null, afterHp: null, operationKey, createdAt: now, roll, events: [] };
  const oldCooldowns = { ...actor.cooldowns };
  const originalEffects = [...actor.effects];
  let usedAttackId = null;
  if (type === 'surrender') finish(battle, opponent.userId, 'surrender', now);
  else {
    const stunned = startTurn(actor, action.events, action.turnNumber);
    if (actor.hp === 0) {
      action.type = 'skip';
      knockout(battle, player, opponent, action.turnNumber, now, action.events);
    } else if (stunned) action.type = 'skip';
    else if (type === 'switch') {
      const previousIndex = player.activeIndex;
      player.activeIndex = switchIndex;
      action.events.push(event('switch', { unitId: activeUnit(player).id, sourceUnitId: actor.id, fromIndex: previousIndex, toIndex: switchIndex }));
      enter(player, opponent, action.turnNumber, action.events);
    } else {
      if (attack.fatality) {
        actor.fatality.used = true;
        action.events.push(event('fatality_used', { unitId: actor.id }));
      }
      action.attackId = attack.id;
      action.hit = roll < attack.accuracy;
      action.beforeHp = target.hp;
      if (action.hit) {
        const multiplier = elementalMultiplier(attack.element, target.element);
        if (multiplier !== 100) action.events.push(event('elemental', { unitId: target.id, sourceUnitId: actor.id, amount: multiplier, element: attack.element }));
        action.damage = Math.min(target.hp, absorbShield(target, calculateAdvancedDamage(attack, actor, target), action.events));
        target.hp -= action.damage;
        for (const definition of attack.effects) applyEffect(definition.target === 'self' ? actor : target, actor, definition, action.turnNumber, action.events);
      }
      action.afterHp = target.hp;
      if (attack.cooldown > 0) { actor.cooldowns[attack.id] = attack.cooldown; usedAttackId = attack.id; }
      if (target.hp === 0) knockout(battle, opponent, player, action.turnNumber, now, action.events);
    }
    if (actor.hp > 0) endTurn(actor, originalEffects, oldCooldowns, usedAttackId, action.turnNumber, action.events);
  }
  battle.actions.push(action);
  battle.updatedAt = now;
  if (battle.status === 'active' && battle.actions.length >= MAX_ADVANCED_TURNS) finish(battle, null, 'turn_limit', now);
  if (battle.status === 'active') {
    battle.turnUserId = opponent.userId;
    battle.turnNumber = battle.actions.length + 1;
    battle.expiresAt = idleDeadline(battle, now);
  } else battle.turnNumber = battle.actions.length;
  return { battle, action };
}

export function replayAdvancedBattle(previous) {
  const actions = previous.actions;
  let battle = initializeAdvancedBattle(previous);
  for (const action of actions) {
    const result = resolveAdvancedAction(battle, { userId: action.actorId, type: action.commandType, choice: action.choice,
      operationKey: action.operationKey, now: action.createdAt, roll: action.roll });
    battle = result.battle;
  }
  return battle;
}
