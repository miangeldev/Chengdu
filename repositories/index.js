import { usuariosRepository } from './usuariosRepository.js';
import { personajesRepository } from './personajesRepository.js';
import { unidadesRepository } from './unidadesRepository.js';
import { collectionRepository } from './collection.js';

export function createRepositories(state, writable = false, { beforeWrite, onWrite } = {}) {
  function repository(name, factory = collectionRepository, indexes) {
    return factory(state[name].records, writable, {
      beforeWrite: beforeWrite ? () => beforeWrite(name) : undefined,
      onWrite: onWrite ? () => onWrite(name) : undefined,
      indexes
    });
  }
  return {
    users: repository('usuarios', usuariosRepository),
    characters: repository('personajes', personajesRepository),
    units: repository('unidades', unidadesRepository),
    state: repository('estado'),
    events: repository('eventos'),
    attacks: repository('ataques'),
    battles: repository('combates', collectionRepository, {
      participantId: battle => battle.players.map(player => player.userId),
      anyOperationKey: battle => [battle.challengeKey, battle.acceptKey, ...battle.actions.map(action => action.operationKey)].filter(key => key != null),
      actionOperationKey: battle => battle.actions.map(action => action.operationKey).filter(key => key != null)
    }),
    rewards: repository('recompensas'),
    packs: repository('sobres'),
    openings: repository('aperturas'),
    economy: repository('economia'),
    dailyClaims: repository('diarios'),
    listings: repository('mercado', collectionRepository, {
      anyOperationKey: listing => [listing.operationKey, listing.closeOperationKey].filter(key => key != null)
    }),
    sales: repository('ventas'),
    campaigns: repository('campanas'),
    contentRewards: repository('premioscontenido'),
    achievements: repository('logros'),
    encounters: repository('encuentros', collectionRepository, {
      bossId: encounter => encounter.kind === 'boss' ? [encounter.snapshot.id] : []
    }),
    contentActions: repository('accionescontenido'),
    groupActivity: repository('actividad'),
    seasons: repository('temporadas'),
    rankings: repository('clasificacion'),
    competitiveResults: repository('resultadoscompetitivos'),
    seasonRewards: repository('premiostemporada'),
    trades: repository('intercambios', collectionRepository, {
      participantId: trade => trade.participants
    }),
    tradeActions: repository('accionesintercambio'),
    craftingActions: repository('artesania'),
    evolutionActions: repository('evoluciones'),
    socialProfiles: repository('perfilessociales'),
    socialActions: repository('accionessociales'),
    clans: repository('clanes'),
    clanActions: repository('accionesclan'),
    clanWars: repository('guerrasclan'),
    clanWarActions: repository('accionesguerra'),
    acquisitions: repository('obtenciones')
  };
}
