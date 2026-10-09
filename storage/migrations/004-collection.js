import { seedPacks } from '../../game/packs/catalog.js';
import { requireGame } from '../../utils/GameError.js';

export function migrateCollectionV4(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 4, revision: collection._meta.revision + 1, updatedAt: now };
  }
  // Existing unit identities and combat snapshots keep their original effects.
  for (const unit of state.unidades.records) unit.traitVersion = 0;
  const envelope = records => ({ _meta: { schemaVersion: 4, revision: 0, updatedAt: now }, records });
  state.sobres = envelope(seedPacks());
  state.aperturas = envelope([]);
  state.economia = envelope(state.recompensas.records.map(reward => ({
    id: `coin:${reward.id}`, userId: reward.userId, type: 'credit', sourceType: 'battle_reward', sourceId: reward.id,
    amount: reward.coins, balanceBefore: reward.balanceBefore, balanceAfter: reward.balanceAfter, createdAt: reward.createdAt
  })));
  return state;
}
