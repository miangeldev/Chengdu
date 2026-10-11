import { requireGame } from '../../utils/GameError.js';

export function migrateMarketV7(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 7, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const unit of state.unidades.records) unit.ownershipVersion = 0;
  for (const name of ['mercado', 'ventas']) state[name] = { _meta: { schemaVersion: 7, revision: 0, updatedAt: now }, records: [] };
  return state;
}
