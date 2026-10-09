import { seedAttacks, characterAttackIds } from '../../game/battle/attacks.js';
import { requireGame } from '../../utils/GameError.js';

export function migrateBattlesV2(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 2, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const character of state.personajes.records) {
    if (character.attackIds.length === 0) {
      requireGame(Number.isSafeInteger(character.revision + 1), 'NUMERIC_OVERFLOW');
      character.attackIds = characterAttackIds(character.id);
      character.revision += 1;
    }
  }
  state.ataques = { _meta: { schemaVersion: 2, revision: 0, updatedAt: now }, records: seedAttacks() };
  state.combates = { _meta: { schemaVersion: 2, revision: 0, updatedAt: now }, records: [] };
  return state;
}
