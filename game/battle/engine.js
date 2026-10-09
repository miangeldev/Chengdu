import { requireGame } from '../../utils/GameError.js';

export const MAX_TURNS = 50;
export const CHALLENGE_TTL_MS = 5 * 60 * 1000;
export const BATTLE_IDLE_MS = 30 * 60 * 1000;
export const deadline = (now, duration) => new Date(Date.parse(now) + duration).toISOString();

export function firstPlayer(players) {
  return players[1].unit.stats.speed > players[0].unit.stats.speed ? players[1].userId : players[0].userId;
}

export function selectedAttack(player, choice) {
  const index = typeof choice === 'string' ? ['1', '2'].indexOf(choice) : -1;
  const attack = index >= 0 ? player.unit.attacks[index] : player.unit.attacks.find(a => a.id === choice);
  requireGame(attack, 'INVALID_ATTACK');
  return attack;
}

export function calculateDamage(attack, attacker, defender) {
  const raw = attack.power + attacker.attack - defender.defense;
  requireGame(Number.isSafeInteger(raw), 'NUMERIC_OVERFLOW');
  return Math.max(1, raw);
}

export function resolveAttack(previous, { userId, choice, operationKey = null, now, roll }) {
  requireGame(previous.status === 'active', 'BATTLE_NOT_ACTIVE');
  requireGame(previous.players.some(p => p.userId === userId), 'BATTLE_NOT_PARTICIPANT');
  requireGame(previous.turnUserId === userId, 'NOT_YOUR_TURN');
  requireGame(Number.isSafeInteger(roll) && roll >= 0 && roll < 100, 'INVALID_RANDOM_ROLL');
  const battle = structuredClone(previous);
  const attacker = battle.players.find(p => p.userId === userId);
  const defender = battle.players.find(p => p.userId !== userId);
  const attack = selectedAttack(attacker, choice);
  const hit = roll < attack.accuracy;
  const beforeHp = defender.unit.hp;
  const damage = hit ? Math.min(beforeHp, calculateDamage(attack, attacker.unit.stats, defender.unit.stats)) : 0;
  defender.unit.hp -= damage;
  const action = {
    seq: battle.actions.length + 1, turnNumber: battle.turnNumber, type: 'attack',
    actorId: userId, targetId: defender.userId, attackId: attack.id,
    hit, damage, beforeHp, afterHp: defender.unit.hp, operationKey, createdAt: now
  };
  battle.actions.push(action);
  battle.updatedAt = now;
  if (defender.unit.hp === 0 || battle.turnNumber >= MAX_TURNS) {
    battle.status = 'finished';
    battle.winnerId = defender.unit.hp === 0 ? userId : null;
    battle.finishReason = defender.unit.hp === 0 ? 'knockout' : 'turn_limit';
    battle.finishedAt = now;
    battle.turnUserId = null;
  } else {
    battle.turnUserId = defender.userId;
    battle.turnNumber += 1;
    battle.expiresAt = deadline(now, BATTLE_IDLE_MS);
  }
  return { battle, action };
}
