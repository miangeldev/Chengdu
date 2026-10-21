import { contentPeriod } from './objectives.js';
import { activeCampaign } from './encounterRules.js';
import { SPIRITS_BOSS_ID, SPIRITS_CAMPAIGN_ID, SPIRITS_SEALS } from './spiritsCatalog.js';

const rows = (state, name) => state[name]?.records ?? [];

// Fragments are earned evidence, not a wallet that can drift or be credited twice.
// The normal PvP settlement already rejects self battles, surrenders and farming;
// the event additionally counts only one match per rival per day, up to three.
export function spiritsProgress(state, userId, at) {
  const campaign = rows(state, 'campanas').find(row => row.id === SPIRITS_CAMPAIGN_ID);
  const until = Date.parse(at), seen = new Set(), daily = new Map(), fragmentBattleIds = [];
  const rewardRows = rows(state, 'recompensas');
  const rewardOrder = new Map(rewardRows.filter(row => row.userId === userId).map((row, index) => [row.battleId, index]));
  const battles = [...rows(state, 'combates')].filter(row => !state.recompensas || rewardOrder.has(row.id))
    .sort((a, b) => state.recompensas ? rewardOrder.get(a.id) - rewardOrder.get(b.id) : 0);
  let fragments = 0;
  for (const battle of battles) {
    if (battle.status !== 'finished' || battle.settlement?.reason !== 'rewarded' || !activeCampaign(campaign, battle.acceptedAt) ||
      !activeCampaign(campaign, battle.finishedAt) || Date.parse(battle.finishedAt) > until ||
      !battle.players.some(player => player.userId === userId)) continue;
    const rival = battle.players.find(player => player.userId !== userId)?.userId;
    if (!rival) continue;
    const day = contentPeriod(battle.finishedAt), pair = `${day}:${rival}`;
    if (seen.has(pair) || (daily.get(day) ?? 0) >= 3) continue;
    seen.add(pair); daily.set(day, (daily.get(day) ?? 0) + 1);
    fragments += battle.winnerId === userId ? 3 : 2;
    fragmentBattleIds.push(battle.id);
  }
  const bosses = new Map(rows(state, 'encuentros').filter(row => row.kind === 'boss' && row.snapshot.id === SPIRITS_BOSS_ID).map(row => [row.id, row]));
  const actions = rows(state, 'accionescontenido').filter(action => action.kind === 'boss_attack' && action.userId === userId &&
    bosses.has(action.encounterId) && activeCampaign(campaign, action.createdAt) && Date.parse(action.createdAt) <= until && action.details.damage > 0);
  const masks = [...new Set(actions.map(action => action.details.maskId))].sort();
  const defeatedEncounterIds = [...new Set(actions.map(action => action.encounterId))].filter(id => {
    const boss = bosses.get(id);
    return boss.status === 'defeated' && Date.parse(boss.endedAt) <= until && activeCampaign(campaign, boss.endedAt);
  });
  const damage = actions.reduce((sum, action) => sum + action.details.damage, 0);
  return { fragments, battleCount: fragmentBattleIds.length, fragmentBattleIds, rewardCutoff: rewardRows.length, damage, masks, maskCount: masks.length,
    bossActionIds: actions.map(action => action.id), defeatedEncounterIds };
}

export function spiritsSealReady(id, progress) {
  if (id === 'luz') return progress.fragments >= 6;
  if (id === 'mascaras') return progress.damage >= 100 && progress.maskCount >= 2;
  return id === 'nombre' && progress.defeatedEncounterIds.length > 0;
}

export function spiritsSealEvidence(id, progress) {
  if (id === 'luz') return { battleIds: progress.fragmentBattleIds, fragments: progress.fragments, rewardCutoff: progress.rewardCutoff };
  if (id === 'mascaras') return { actionIds: progress.bossActionIds, damage: progress.damage, masks: progress.masks };
  return { encounterIds: progress.defeatedEncounterIds };
}

export function spiritsSealId(reference) {
  const value = String(reference ?? '').trim().toLowerCase();
  return SPIRITS_SEALS.find(seal => seal.id === value || String(seal.number) === value)?.id ?? null;
}
