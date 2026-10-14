import { requireGame } from '../../utils/GameError.js';

export function migrateCommunityV11(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 11, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const name of ['intercambios', 'accionesintercambio', 'artesania', 'evoluciones', 'perfilessociales', 'accionessociales', 'clanes', 'accionesclan', 'guerrasclan', 'accionesguerra', 'obtenciones']) {
    state[name] = { _meta: { schemaVersion: 11, revision: 0, updatedAt: now }, records: [] };
  }
  return state;
}
