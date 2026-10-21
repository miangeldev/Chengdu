import { fatalityEnabled } from './fatality.js';

export const GUARDIAN_MASKS = Object.freeze([
  Object.freeze({ id: 'jade', name: 'Jade', effect: Object.freeze({ type: 'shield', target: 'self', duration: 1, potency: 6 }) }),
  Object.freeze({ id: 'carmesi', name: 'Carmesí', effect: Object.freeze({ type: 'attack_up', target: 'self', duration: 1, potency: 6 }) }),
  Object.freeze({ id: 'azul', name: 'Azul', effect: Object.freeze({ type: 'regeneration', target: 'self', duration: 1, potency: 4 }) })
]);
export const hasMaskRotation = unit => unit.characterId === 'guardian_mil_mascaras' && unit.ability?.id === 'rostro_cambiante';
export function validateGuardianMask(unit, startedAt) {
  if (!hasMaskRotation(unit) || !fatalityEnabled(startedAt)) return unit.mask === undefined;
  return !!unit.mask && Object.keys(unit.mask).length === 2 && Number.isSafeInteger(unit.mask.turns) && unit.mask.turns >= 0 &&
    unit.mask.turns <= 100 && unit.mask.index === (unit.mask.turns === 0 ? -1 : (unit.mask.turns - 1) % GUARDIAN_MASKS.length);
}

