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
    battles: collectionRepository(state.combates.records, writable),
    rewards: collectionRepository(state.recompensas.records, writable),
    packs: collectionRepository(state.sobres.records, writable),
    openings: collectionRepository(state.aperturas.records, writable),
    economy: collectionRepository(state.economia.records, writable),
    dailyClaims: collectionRepository(state.diarios.records, writable),
    listings: collectionRepository(state.mercado.records, writable),
    sales: collectionRepository(state.ventas.records, writable),
    campaigns: collectionRepository(state.campanas.records, writable),
    contentRewards: collectionRepository(state.premioscontenido.records, writable),
    achievements: collectionRepository(state.logros.records, writable),
    encounters: collectionRepository(state.encuentros.records, writable),
    contentActions: collectionRepository(state.accionescontenido.records, writable),
    groupActivity: collectionRepository(state.actividad.records, writable),
    seasons: collectionRepository(state.temporadas.records, writable),
    rankings: collectionRepository(state.clasificacion.records, writable),
    competitiveResults: collectionRepository(state.resultadoscompetitivos.records, writable),
    seasonRewards: collectionRepository(state.premiostemporada.records, writable),
    trades: collectionRepository(state.intercambios.records, writable),
    tradeActions: collectionRepository(state.accionesintercambio.records, writable),
    craftingActions: collectionRepository(state.artesania.records, writable),
    evolutionActions: collectionRepository(state.evoluciones.records, writable),
    socialProfiles: collectionRepository(state.perfilessociales.records, writable),
    socialActions: collectionRepository(state.accionessociales.records, writable),
    clans: collectionRepository(state.clanes.records, writable),
    clanActions: collectionRepository(state.accionesclan.records, writable),
    clanWars: collectionRepository(state.guerrasclan.records, writable),
    clanWarActions: collectionRepository(state.accionesguerra.records, writable),
    acquisitions: collectionRepository(state.obtenciones.records, writable)
  };
}
