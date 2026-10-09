import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';

export function createCharacterService(storage) {
  return {
    async getCharacter(characterId) {
      return storage.withRead(async repos => {
        const character = await repos.characters.get(characterId);
        requireGame(character, 'CHARACTER_NOT_FOUND');
        return character;
      });
    },
    async listCharacters(options = {}) {
      return storage.withRead(async repos => paginate(
        await repos.characters.all(), options, 'catalog', c => ['', c.id]
      ));
    }
  };
}
