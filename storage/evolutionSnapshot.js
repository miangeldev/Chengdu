import { requireGame } from '../utils/GameError.js';
import { validEvolutionShape } from '../game/evolution/rules.js';
export function validateEvolutionSnapshot(state,snapshot,at) {
  requireGame(validEvolutionShape(snapshot.evolution,snapshot.characterId),'DATABASE_CORRUPT',{field:'evolution.snapshotShape'});
  if(!snapshot.evolution)return;
  const receipt=state.evoluciones?.records.find(r=>r.id===snapshot.evolution.receiptId);
  requireGame(receipt?.unitId===snapshot.id && JSON.stringify(receipt.after)===JSON.stringify(snapshot.evolution) && Date.parse(receipt.createdAt)<=Date.parse(at),'DATABASE_CORRUPT',{field:'evolution.snapshotProof'});
}
