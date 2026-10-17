import { requireGame } from '../../utils/GameError.js';

// Story is additive: every previous receipt, identifier, unit, ownership proof
// and frozen battle keeps its exact payload. Only envelope metadata advances.
export function migrateStoryV12(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 12, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const name of ['historias', 'accioneshistoria', 'combateshistoria', 'premioshistoria']) {
    state[name] = { _meta: { schemaVersion: 12, revision: 0, updatedAt: now }, records: [] };
  }
  return state;
}
