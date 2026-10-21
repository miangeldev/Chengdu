import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { createUnitInTransaction } from '../units/unitGenerator.js';
import { activeCampaign } from './encounterRules.js';
import { validContentKey } from './rewards.js';
import { SPIRITS_CAMPAIGN_ID, SPIRITS_BOSS_ID, SPIRITS_LORE, SPIRITS_POLICY_VERSION, SPIRITS_REDEMPTIONS, SPIRITS_SEALS, spiritsBossDefinition } from './spiritsCatalog.js';
import { spiritsProgress, spiritsSealEvidence, spiritsSealId, spiritsSealReady } from './spiritsRules.js';
import { eventRevenge } from './eventPolicy.js';

async function progressState(repos) {
  return { campanas: { records: await repos.campaigns.all() }, combates: { records: await repos.battles.all() },
    recompensas: { records: await repos.rewards.all() }, encuentros: { records: await repos.encounters.all() }, accionescontenido: { records: await repos.contentActions.all() } };
}

async function checkUser(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function stateView(repos, userId, now) {
  const campaign = await repos.campaigns.get(SPIRITS_CAMPAIGN_ID);
  requireGame(campaign, 'EVENT_NOT_FOUND');
  const active = activeCampaign(campaign, now);
  const status = active ? 'active' : Date.parse(now) < Date.parse(campaign.startsAt) ? 'upcoming' : 'ended';
  const progress = spiritsProgress(await progressState(repos), userId, now);
  const history = userId === null ? [] : await repos.spiritsActions.filterBy('userId', userId);
  const seals = SPIRITS_SEALS.map(definition => ({ ...definition,
    current: definition.id === 'luz' ? progress.fragments : definition.id === 'mascaras' ? progress.damage : progress.defeatedEncounterIds.length,
    maskCount: definition.id === 'mascaras' ? progress.maskCount : undefined,
    ready: active && spiritsSealReady(definition.id, progress),
    claimed: history.some(action => action.kind === 'seal' && action.sealId === definition.id) }));
  const characters = await Promise.all(SPIRITS_REDEMPTIONS.map(async redemption => {
    const character = await repos.characters.get(redemption.characterId), counter = await repos.state.get(`mint:${redemption.characterId}`);
    const claimed = history.some(action => action.kind === 'redeem' && action.characterId === character.id);
    const sealsReady = redemption.requiredSeals.every(id => seals.find(seal => seal.id === id)?.claimed);
    return { id: character.id, code: redemption.code, name: character.name, rarity: character.rarity,
      issued: counter.issuedCount, max: character.supply.max, claimed, requiredSeals: [...redemption.requiredSeals],
      available: active && !claimed && sealsReady && character.obtainable && counter.issuedCount < character.supply.max };
  }));
  return { campaign, status, revenge: eventRevenge(campaign, now), lore: SPIRITS_LORE, fragments: progress.fragments, seals, characters, progress,
    boss: { id: SPIRITS_BOSS_ID, name: spiritsBossDefinition().name, available: active } };
}

export function createSpiritsService(storage, clock) {
  async function mutate({ userId, operationKey, kind, reference }) {
    validContentKey(operationKey);
    return storage.withTransaction(async repos => {
      const user = await checkUser(repos, userId);
      const sealId = kind === 'seal' ? spiritsSealId(reference) : null;
      const redemption = kind === 'redeem' ? SPIRITS_REDEMPTIONS.find(row => [row.code, row.characterId].includes(String(reference ?? '').trim().toLowerCase())) : null;
      requireGame(kind === 'seal' ? sealId : redemption, kind === 'seal' ? 'SPIRITS_SEAL_NOT_FOUND' : 'SPIRITS_CHARACTER_NOT_FOUND');
      const characterId = redemption?.characterId ?? null;
      const previous = await repos.spiritsActions.findBy('operationKey', operationKey);
      const now = clock(); dailyTimestamp(now);
      if (previous) {
        requireGame(previous.userId === userId && previous.kind === kind && previous.sealId === sealId && previous.characterId === characterId, 'OPERATION_CONFLICT');
        return { ...await stateView(repos, userId, now), action: previous,
          seal: sealId ? SPIRITS_SEALS.find(row => row.id === sealId) : null, unit: previous.unitId ? await repos.units.get(previous.unitId) : null, alreadyClaimed: true };
      }
      const same = await repos.spiritsActions.findBy('userId', userId, action => action.kind === kind && (kind === 'seal' ? action.sealId === sealId : action.characterId === characterId));
      if (same) return { ...await stateView(repos, userId, now), action: same,
        seal: sealId ? SPIRITS_SEALS.find(row => row.id === sealId) : null, unit: same.unitId ? await repos.units.get(same.unitId) : null, alreadyClaimed: true };
      requireGame(dailyTimestamp(now) >= dailyTimestamp(user.updatedAt), 'INVALID_CLOCK');
      const campaign = await repos.campaigns.get(SPIRITS_CAMPAIGN_ID);
      requireGame(activeCampaign(campaign, now), 'EVENT_NOT_ACTIVE');
      const id = `SPR-${randomUUID()}`;
      let evidence, unit = null;
      if (kind === 'seal') {
        const progress = spiritsProgress(await progressState(repos), userId, now);
        requireGame(spiritsSealReady(sealId, progress), 'SPIRITS_SEAL_NOT_READY');
        evidence = spiritsSealEvidence(sealId, progress);
      } else {
        const seals = await repos.spiritsActions.filterBy('userId', userId, action => action.kind === 'seal');
        requireGame(redemption.requiredSeals.every(required => seals.some(seal => seal.sealId === required)), 'SPIRITS_SEALS_REQUIRED');
        evidence = { sealActionIds: redemption.requiredSeals.map(required => seals.find(seal => seal.sealId === required).id) };
        unit = await createUnitInTransaction(repos, { ownerId: userId, characterId, origin: { type: 'spirits', sourceId: id }, operationKey: `spirits-mint:${id}` }, () => now);
      }
      const action = await repos.spiritsActions.insert({ id, campaignId: SPIRITS_CAMPAIGN_ID, policyVersion: SPIRITS_POLICY_VERSION,
        kind, userId, operationKey, createdAt: now, sealId, characterId, unitId: unit?.id ?? null, evidence });
      return { ...await stateView(repos, userId, now), action, seal: sealId ? SPIRITS_SEALS.find(row => row.id === sealId) : null, unit, alreadyClaimed: false };
    });
  }
  return {
    async getState({ userId = null } = {}) {
      return storage.withRead(async repos => {
        if (userId !== null) await checkUser(repos, userId);
        const now = clock(); dailyTimestamp(now);
        return stateView(repos, userId, now);
      });
    },
    claimSeal: ({ userId, seal, operationKey }) => mutate({ userId, operationKey, kind: 'seal', reference: seal }),
    redeem: ({ userId, character, operationKey }) => mutate({ userId, operationKey, kind: 'redeem', reference: character })
  };
}
