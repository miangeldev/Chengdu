import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { advancedAttack, combatProfile } from '../battle/combatContent.js';

export function createCharacterService(storage) {
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
        const character = await repos.characters.get(characterId);
        requireGame(character, 'CHARACTER_NOT_FOUND');
        const attacks = await Promise.all(character.attackIds.map(id => repos.attacks.get(id)));
        return { character, attacks, combat: structuredClone(character.combat ?? combatProfile(character.id)), advancedAttacks: attacks.map(advancedAttack) };
      });
    },
    async listCharacters(options = {}) {
      return storage.withRead(async repos => paginate(
        await repos.characters.all(), options, 'catalog', c => ['', c.id]
      ));
    }
  };
}
