import { requireGame } from '../../utils/GameError.js';

export function migrateEconomyV6(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 6, revision: collection._meta.revision + 1, updatedAt: now };
  }
  state.diarios = { _meta: { schemaVersion: 6, revision: 0, updatedAt: now }, records: [] };
  return state;
}
