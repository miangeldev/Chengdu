import { requireGame } from '../../utils/GameError.js';
import { combatProfile, attackCombatProfile } from '../../game/battle/combatContent.js';

// Rules 1 battles keep their frozen snapshots and receipts. Only the catalog
// gains the profiles that newly accepted rules 2 battles will snapshot.
export function migrateCombatV8(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 8, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const character of state.personajes.records) {
    if (character.combat !== undefined) continue;
    requireGame(Number.isSafeInteger(character.revision + 1), 'NUMERIC_OVERFLOW');
    character.combat = combatProfile(character.id);
    character.revision += 1;
  }
  for (const attack of state.ataques.records) {
    if (attack.combat !== undefined) continue;
    requireGame(Number.isSafeInteger(attack.revision + 1), 'NUMERIC_OVERFLOW');
    attack.combat = attackCombatProfile(attack.id, attack);
    attack.revision += 1;
  }
  return state;
}
