import { requireGame } from '../../utils/GameError.js';
import { seedSpiritsAttacks, seedSpiritsCampaign, seedSpiritsCharacters } from '../../game/content/spiritsCatalog.js';

// Only append definitions and a new immutable ledger. Existing editions,
// identifiers, supply counters, receipts and frozen battles retain their data.
export function migrateSpiritsV13(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 13, revision: collection._meta.revision + 1, updatedAt: now };
  }
  state.accionesespiritus = { _meta: { schemaVersion: 13, revision: 0, updatedAt: now }, records: [] };
  const predecessor = state.campanas.records.find(campaign => campaign.id === 'faroles_2026');
  requireGame(predecessor, 'DATABASE_CORRUPT', { field: 'spirits.predecessor' });
  const campaign = seedSpiritsCampaign(predecessor.endsAt);
  requireGame(Date.parse(campaign.startsAt) < Date.parse(campaign.endsAt), 'DATABASE_CORRUPT', { field: 'spirits.calendar' });
  if (!state.campanas.records.some(row => row.id === campaign.id)) state.campanas.records.push(campaign);
  for (const attack of seedSpiritsAttacks()) if (!state.ataques.records.some(row => row.id === attack.id)) state.ataques.records.push(attack);
  for (const character of seedSpiritsCharacters()) {
    if (state.personajes.records.some(row => row.id === character.id)) continue;
    requireGame(!state.personajes.records.some(row => row.unitPrefix === character.unitPrefix), 'DATABASE_CORRUPT', { field: 'spirits.characterPrefixCollision' });
    state.personajes.records.push(character);
    state.estado.records.push({ id: `mint:${character.id}`, kind: 'mintCounter', characterId: character.id, lastSerial: 0, issuedCount: 0 });
  }
  return state;
}
