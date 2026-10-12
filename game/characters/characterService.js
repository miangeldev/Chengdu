import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { advancedAttack, combatProfile } from '../battle/combatContent.js';

export function createCharacterService(storage, clock = () => new Date().toISOString()) {
  return {
    async getCharacter(characterId) {
      return storage.withRead(async repos => {
        const character = await repos.characters.get(characterId);
        requireGame(character, 'CHARACTER_NOT_FOUND');
        return character;
      });
    },
    async getCharacterDetails(characterId) {
      return storage.withRead(async repos => {
        let character = await repos.characters.get(characterId);
        requireGame(character, 'CHARACTER_NOT_FOUND');
        if (character.eventId) {
          const campaign = await repos.campaigns.get(character.eventId);
          const now = Date.parse(clock());
          character = { ...character, eventStatus: now < Date.parse(campaign.startsAt) ? 'upcoming' : now < Date.parse(campaign.endsAt) ? 'active' : 'ended' };
        }
        const attacks = await Promise.all(character.attackIds.map(id => repos.attacks.get(id)));
        return { character, attacks, combat: structuredClone(character.combat ?? combatProfile(character.id)), advancedAttacks: attacks.map(advancedAttack) };
      });
    },
    async listCharacters(options = {}) {
      return storage.withRead(async repos => {
        const campaigns = new Map((await repos.campaigns.all()).map(campaign => [campaign.id, campaign]));
        const now = Date.parse(clock());
        const rows = (await repos.characters.all()).map(character => {
          const campaign = campaigns.get(character.eventId);
          return { ...character, ...(campaign ? { eventCode: campaign.code, eventStatus: now < Date.parse(campaign.startsAt) ? 'upcoming' : now < Date.parse(campaign.endsAt) ? 'active' : 'ended' } : {}) };
        });
        return paginate(rows, options, 'catalog', c => ['', c.id]);
      });
    }
  };
}
