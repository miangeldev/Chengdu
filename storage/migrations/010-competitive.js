import { requireGame } from '../../utils/GameError.js';

// Ranked play starts with a new ledger. Historical casual battles, coin
// receipts, owners, progress, campaigns and activity remain byte-for-byte
// identical inside their records; only collection metadata advances.
export function migrateCompetitiveV10(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 10, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const name of ['temporadas', 'clasificacion', 'resultadoscompetitivos', 'premiostemporada']) {
    state[name] = { _meta: { schemaVersion: 10, revision: 0, updatedAt: now }, records: [] };
  }
  return state;
}
