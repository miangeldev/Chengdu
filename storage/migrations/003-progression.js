import { progressionBaseline, PROGRESSION_VERSION } from '../../game/progression/rules.js';
import { requireGame } from '../../utils/GameError.js';

export function migrateProgressionV3(previous, now) {
  const state = structuredClone(previous);
  for (const collection of Object.values(state)) {
    requireGame(Number.isSafeInteger(collection._meta.revision + 1), 'NUMERIC_OVERFLOW');
    collection._meta = { schemaVersion: 3, revision: collection._meta.revision + 1, updatedAt: now };
  }
  for (const user of state.usuarios.records) state.estado.records.push(progressionBaseline('user', user));
  for (const unit of state.unidades.records) {
    unit.statGrowthVersion = PROGRESSION_VERSION;
    state.estado.records.push(progressionBaseline('unit', unit));
  }
  for (const battle of state.combates.records) {
    battle.rewardVersion = ['pending', 'active'].includes(battle.status) ? 1 : 0;
    battle.settlement = null;
  }
  state.recompensas = { _meta: { schemaVersion: 3, revision: 0, updatedAt: now }, records: [] };
  return state;
}
