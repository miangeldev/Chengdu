import { equal } from './equality.js';
import { requireGame } from '../utils/GameError.js';
import { activeCampaign } from '../game/content/encounterRules.js';
import { SPIRITS_CAMPAIGN_ID, SPIRITS_POLICY_VERSION, SPIRITS_REDEMPTIONS, SPIRITS_SEALS } from '../game/content/spiritsCatalog.js';
import { spiritsProgress, spiritsSealEvidence, spiritsSealReady } from '../game/content/spiritsRules.js';

const check = (value, field) => requireGame(value, 'DATABASE_CORRUPT', { field });
const records = (state, name) => state[name]?.records ?? [];
const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value));

function sealProof(state, action) {
  const evidence = action.evidence;
  if (action.sealId === 'luz') {
    check(Array.isArray(evidence.battleIds) && new Set(evidence.battleIds).size === evidence.battleIds.length &&
      Number.isSafeInteger(evidence.rewardCutoff) && evidence.rewardCutoff >= 0 && evidence.rewardCutoff <= records(state, 'recompensas').length, 'spirits.fragmentEvidence');
    // The append-only PvP reward prefix fixes the completion order, including
    // matches committed in the same millisecond. A subset cannot evade caps.
    const proof = { ...state, recompensas: { records: records(state, 'recompensas').slice(0, evidence.rewardCutoff) } };
    const progress = spiritsProgress(proof, action.userId, action.createdAt);
    check(equal(evidence, spiritsSealEvidence('luz', progress)) && spiritsSealReady('luz', progress), 'spirits.fragmentProof');
  } else if (action.sealId === 'mascaras') {
    check(Array.isArray(evidence.actionIds) && new Set(evidence.actionIds).size === evidence.actionIds.length, 'spirits.maskEvidence');
    const selected = new Set(evidence.actionIds);
    const proof = { ...state, accionescontenido: { records: records(state, 'accionescontenido').filter(row => selected.has(row.id)) } };
    const progress = spiritsProgress(proof, action.userId, action.createdAt);
    check(equal(evidence, spiritsSealEvidence('mascaras', progress)) && spiritsSealReady('mascaras', progress), 'spirits.maskProof');
  } else {
    check(Array.isArray(evidence.encounterIds) && evidence.encounterIds.length > 0 && new Set(evidence.encounterIds).size === evidence.encounterIds.length, 'spirits.nameEvidence');
    const progress = spiritsProgress(state, action.userId, action.createdAt);
    check(evidence.encounterIds.every(id => progress.defeatedEncounterIds.includes(id)) && Object.keys(evidence).length === 1, 'spirits.nameProof');
  }
}

export function validateSpiritsData(state) {
  const campaign = records(state, 'campanas').find(row => row.id === SPIRITS_CAMPAIGN_ID);
  const predecessor = records(state, 'campanas').find(row => row.id === 'faroles_2026');
  check(campaign && predecessor && campaign.startsAt === predecessor.endsAt &&
    SPIRITS_REDEMPTIONS.every(definition => campaign.characterIds.includes(definition.characterId) &&
      records(state, 'personajes').some(character => character.id === definition.characterId && character.eventId === campaign.id)), 'spirits.calendarChain');
  const users = new Set(records(state, 'usuarios').map(row => row.id)), keys = new Set(), claims = new Set(), seals = new Map(), minted = new Set();
  for (const action of records(state, 'accionesespiritus')) {
    check(/^SPR-[a-f0-9-]{36}$/.test(action.id) && action.campaignId === SPIRITS_CAMPAIGN_ID && action.policyVersion === SPIRITS_POLICY_VERSION &&
      users.has(action.userId) && ['seal', 'redeem'].includes(action.kind) && date(action.createdAt) && activeCampaign(campaign, action.createdAt) &&
      typeof action.operationKey === 'string' && action.operationKey.length > 0 && action.operationKey.length <= 200 &&
      action.operationKey.trim() === action.operationKey && !keys.has(action.operationKey) && action.evidence && typeof action.evidence === 'object', 'spirits.action');
    keys.add(action.operationKey);
    const claimKey = `${action.userId}:${action.kind}:${action.sealId ?? action.characterId}`;
    check(!claims.has(claimKey), 'spirits.claimUnique'); claims.add(claimKey);
    if (action.kind === 'seal') {
      check(SPIRITS_SEALS.some(seal => seal.id === action.sealId) && action.characterId === null && action.unitId === null, 'spirits.seal');
      sealProof(state, action); seals.set(action.id, action);
    } else {
      const definition = SPIRITS_REDEMPTIONS.find(row => row.characterId === action.characterId);
      check(definition && action.sealId === null && typeof action.unitId === 'string' &&
        equal(action.evidence.sealActionIds?.map(id => seals.get(id)?.sealId), definition.requiredSeals) &&
        action.evidence.sealActionIds.every(id => seals.get(id).userId === action.userId && Date.parse(seals.get(id).createdAt) <= Date.parse(action.createdAt)) &&
        Object.keys(action.evidence).length === 1, 'spirits.redemptionSeals');
      const unit = records(state, 'unidades').find(row => row.id === action.unitId);
      const birth = records(state, 'eventos').find(row => row.type === 'unit_created' && row.unitId === action.unitId);
      check(unit && unit.characterId === action.characterId && unit.origin.type === 'spirits' && unit.origin.sourceId === action.id &&
        unit.createdAt === action.createdAt && birth?.toOwnerId === action.userId && birth.operationKey === `spirits-mint:${action.id}` && !minted.has(unit.id), 'spirits.redemptionMint');
      minted.add(unit.id);
    }
  }
  for (const unit of records(state, 'unidades')) if (unit.origin.type === 'spirits') check(minted.has(unit.id), 'spirits.mintComplete');
}

export function validateSpiritsTransition(before, after, context = {}) {
  const previous = records(before, 'accionesespiritus'), current = records(after, 'accionesespiritus');
  check(equal(previous, current.slice(0, previous.length)), 'spirits.appendOnly');
  const added = current.slice(previous.length);
  check(added.length <= 1, 'spirits.atomicAction');
  for (const action of added) {
    check(context.now && Date.parse(action.createdAt) <= Date.parse(context.now), 'spirits.clock');
    if (action.kind === 'seal') {
      const progress = spiritsProgress(before, action.userId, action.createdAt);
      check(spiritsSealReady(action.sealId, progress) && equal(action.evidence, spiritsSealEvidence(action.sealId, progress)), 'spirits.currentEvidence');
    } else {
      const definition = SPIRITS_REDEMPTIONS.find(row => row.characterId === action.characterId);
      const sourceIds = definition.requiredSeals.map(id => previous.find(row => row.userId === action.userId && row.kind === 'seal' && row.sealId === id)?.id);
      const character = records(before, 'personajes').find(row => row.id === action.characterId);
      const counter = records(before, 'estado').find(row => row.id === `mint:${action.characterId}`);
      check(equal(action.evidence.sealActionIds, sourceIds) && sourceIds.every(Boolean) && character?.obtainable &&
        character.supply.grandfatheredIssued === undefined && counter?.issuedCount < character.supply.max &&
        !records(before, 'unidades').some(row => row.id === action.unitId), 'spirits.redemptionAuthority');
    }
  }
}
