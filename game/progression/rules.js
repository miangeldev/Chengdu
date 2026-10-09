import { requireGame } from '../../utils/GameError.js';

export const PROGRESSION_VERSION = 1;
export const LEVEL_CAPS = Object.freeze({ user: 50, unit: 20 });

export function safeAdd(value, amount) {
  requireGame(Number.isSafeInteger(value) && value >= 0 && Number.isSafeInteger(amount) && amount >= 0 && Number.isSafeInteger(value + amount), 'NUMERIC_OVERFLOW');
  return value + amount;
}

export function xpToNextLevel(progress, kind) {
  requireGame(Object.hasOwn(LEVEL_CAPS, kind), 'INVALID_PROGRESSION');
  return progress.level >= LEVEL_CAPS[kind] ? null : progress.level * 100;
}

// XP is the unspent progress toward the next level; surplus is never discarded.
export function grantXp(progress, amount, kind) {
  requireGame(Number.isSafeInteger(progress?.level) && progress.level >= 1, 'INVALID_PROGRESSION');
  const next = { ...progress, xp: safeAdd(progress.xp, amount) };
  let needed = xpToNextLevel(next, kind);
  if (amount === 0) return next;
  while (needed !== null && next.xp >= needed) {
    next.xp -= needed;
    next.level += 1;
    needed = xpToNextLevel(next, kind);
  }
  return next;
}

export function effectiveStats(initialStats, level, version = PROGRESSION_VERSION) {
  requireGame([0, 1].includes(version) && Number.isSafeInteger(level) && level >= 1, 'INVALID_PROGRESSION');
  const steps = version === 0 ? 0 : Math.min(level - 1, LEVEL_CAPS.unit - 1);
  return {
    hp: safeAdd(initialStats.hp, steps * 2),
    attack: safeAdd(initialStats.attack, Math.floor(steps / 5)),
    defense: safeAdd(initialStats.defense, Math.floor(steps / 5)),
    speed: initialStats.speed
  };
}

export function progressionBaseline(type, entity) {
  return {
    id: `progression:${entity.id}`, kind: 'progressionBaseline', entityType: type,
    entityId: entity.id, progress: structuredClone(entity.progress),
    ...(type === 'user' ? { coins: entity.economy.coins } : {})
  };
}
