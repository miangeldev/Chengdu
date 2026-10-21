import { requireGame } from '../../utils/GameError.js';
import { isDeepStrictEqual } from 'node:util';
import { SPIRITS_FATALITIES } from '../content/spiritsCatalog.js';
import { SPIRITS_RELEASE_AT } from '../content/eventPolicy.js';

// A permanent character trait becomes available when its debut event begins.
// The roll belongs to the frozen battle snapshot, never to a turn or a switch.
export const FATALITY_VERSION = 1;
export const FATALITY_CHANCE = 10;
export const FATALITY_STARTS_AT = SPIRITS_RELEASE_AT;
export const fatalityEnabled = now => Number.isFinite(Date.parse(now)) && Date.parse(now) >= Date.parse(FATALITY_STARTS_AT);

export function fatalityProfile(characterId) {
  if (!Object.hasOwn(SPIRITS_FATALITIES, characterId)) return null;
  return { ...structuredClone(SPIRITS_FATALITIES[characterId]), combatVersion: 1, fatality: true };
}

export function attachFatality(snapshot, now, randomRoll) {
  const attack = fatalityProfile(snapshot.characterId);
  if (!attack || !fatalityEnabled(now)) return snapshot;
  const roll = randomRoll();
  requireGame(Number.isSafeInteger(roll) && roll >= 0 && roll < 100, 'INVALID_RANDOM_ROLL');
  return { ...snapshot, fatality: { version: FATALITY_VERSION, roll, unlocked: roll < FATALITY_CHANCE, used: false, attack } };
}

export function validateFatality(unit, now) {
  if (unit.fatality === undefined) return true; // Previously published snapshots retain their original rules.
  const value = unit.fatality, expected = fatalityProfile(unit.characterId);
  return !!value && !!expected && fatalityEnabled(now) && value.version === FATALITY_VERSION &&
    Object.keys(value).length === 5 && ['version', 'roll', 'unlocked', 'used', 'attack'].every(key => Object.hasOwn(value, key)) &&
    Number.isSafeInteger(value.roll) && value.roll >= 0 && value.roll < 100 && value.unlocked === (value.roll < FATALITY_CHANCE) &&
    typeof value.used === 'boolean' && (!value.used || value.unlocked) && isDeepStrictEqual(value.attack, expected);
}

export function fatalityAttack(unit, choice, { allowUsed = false } = {}) {
  const value = unit.fatality;
  if (!value) return null;
  const requested = String(choice) === '3' || value && choice === value.attack.id;
  if (!requested) return null;
  requireGame(value?.unlocked, 'FATALITY_NOT_AVAILABLE');
  requireGame(allowUsed || !value.used, 'FATALITY_ALREADY_USED');
  return value.attack;
}

export function visibleBattleAttacks(unit) {
  return [...unit.attacks.map((attack, index) => ({ ...attack, slot: index + 1 })),
    ...(unit.fatality?.unlocked && !unit.fatality.used ? [{ ...unit.fatality.attack, slot: 3 }] : [])];
}

// Runtime use is proved by the action replay, while all other fields are frozen.
export function immutableFatality(unit) {
  if (unit.fatality === undefined) return {};
  const { used, ...definition } = unit.fatality;
  return { fatality: definition };
}
