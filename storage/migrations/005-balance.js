import { balancedLegacyStats, migrateBalancedCharacter } from '../../game/characters/balance.js';
import { requireGame } from '../../utils/GameError.js';

export function migrateBalanceV5(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 5, revision: collection._meta.revision + 1, updatedAt: now };
  }
  state.personajes.records = state.personajes.records.map(character => {
    const counter = state.estado.records.find(r => r.id === `mint:${character.id}`);
    requireGame(counter, 'DATABASE_CORRUPT');
    return migrateBalancedCharacter(character, counter.issuedCount);
  });
  for (const unit of state.unidades.records) {
    unit.combatBaseStats = balancedLegacyStats(unit);
    unit.statGrowthVersion = 2;
  }
  // Birth identity, XP, receipts, coin movements and battle snapshots stay intact.
  return state;
}
