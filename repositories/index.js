import { usuariosRepository } from './usuariosRepository.js';
import { personajesRepository } from './personajesRepository.js';
import { unidadesRepository } from './unidadesRepository.js';
import { collectionRepository } from './collection.js';

export function createRepositories(state, writable = false) {
  return {
    users: usuariosRepository(state.usuarios.records, writable),
    characters: personajesRepository(state.personajes.records, writable),
    units: unidadesRepository(state.unidades.records, writable),
    state: collectionRepository(state.estado.records, writable),
    events: collectionRepository(state.eventos.records, writable),
    attacks: collectionRepository(state.ataques.records, writable),
    battles: collectionRepository(state.combates.records, writable)
  };
}
