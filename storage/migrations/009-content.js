import { requireGame } from '../../utils/GameError.js';
import { seedCampaigns, seedEventAttacks, seedEventCharacters } from '../../game/content/catalog.js';

// Add content definitions and empty history; preserve every historical receipt,
// ownership chain, battle snapshot and balance. Unlocks are earned on demand.
export function migrateContentV9(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 9, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const name of ['campanas', 'premioscontenido', 'logros', 'encuentros', 'accionescontenido', 'actividad']) {
    state[name] = { _meta: { schemaVersion: 9, revision: 0, updatedAt: now }, records: [] };
  }
  state.campanas.records = seedCampaigns();
  for (const attack of seedEventAttacks()) if (!state.ataques.records.some(row => row.id === attack.id)) state.ataques.records.push(attack);
  for (const character of seedEventCharacters()) {
    const existing = state.personajes.records.find(row => row.id === character.id);
    // Imported catalogs may already contain these definitions. Never overwrite
    // a user catalog or reset its serial counter while adding another edition.
    if (existing) continue;
    requireGame(!state.personajes.records.some(row => row.unitPrefix === character.unitPrefix), 'DATABASE_CORRUPT', { field: 'content.characterPrefixCollision' });
    state.personajes.records.push(character);
    state.estado.records.push({ id: `mint:${character.id}`, kind: 'mintCounter', characterId: character.id, lastSerial: 0, issuedCount: 0 });
  }
  return state;
}
