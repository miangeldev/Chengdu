import { STARTERS } from '../characters/catalog.js';
import { createUnitInTransaction } from '../units/unitGenerator.js';
import { requireGame } from '../../utils/GameError.js';

export function createStarterService(storage, clock) {
  return {
    async getStarterOptions() {
      return storage.withRead(async repos => Promise.all(STARTERS.map(async option => {
        const character = await repos.characters.get(option.characterId);
        const counter = character ? await repos.state.get(`mint:${character.id}`) : null;
        return { ...option, character, available: Boolean(character?.obtainable && character?.starterEligible &&
          character.supply.grandfatheredIssued === undefined &&
          (character.supply.type === 'unlimited' || counter?.issuedCount < character.supply.max)) };
      })));
    },
    async claimStarter({ userId, choice }) {
      return storage.withTransaction(async repos => {
        requireGame(await repos.users.get(userId), 'USER_NOT_FOUND');
        const key = `starter:${userId}`;
        const claim = await repos.state.get(key);
        if (claim) return { unit: await repos.units.get(claim.unitId), alreadyClaimed: true };
        const normalized = typeof choice === 'string' ? choice.trim().toLowerCase() : '';
        const option = STARTERS.find(o => [o.choice, o.number, o.characterId].includes(normalized));
        requireGame(option, 'INVALID_STARTER');
        const character = await repos.characters.get(option.characterId);
        requireGame(character?.starterEligible && character.obtainable, 'CHARACTER_UNAVAILABLE');
        const unit = await createUnitInTransaction(repos, {
          characterId: character.id, ownerId: userId,
          origin: { type: 'starter', sourceId: 'starter_v1' }, operationKey: key
        }, clock);
        await repos.state.insert({
          id: key, kind: 'claim', userId, rewardType: 'starter', sourceId: 'starter_v1',
          unitId: unit.id, createdAt: unit.createdAt
        });
        return { unit, alreadyClaimed: false };
      });
    }
  };
}
