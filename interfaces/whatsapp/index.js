import * as clan from '../../plugins/CTU-clan.js';
import * as intercambio from '../../plugins/CTU-intercambio.js';
import * as crafting from '../../plugins/CTU-crafting.js';
import * as evolucion from '../../plugins/CTU-evolucion.js';
import * as recompensas from '../../plugins/CTU-recompensas.js';
import * as social from '../../plugins/CTU-social.js';
import * as showcase from '../../plugins/CTU-showcase.js';
import * as registro from '../../plugins/CTU-registro.js';
import * as perfil from '../../plugins/CTU-perfil.js';
import * as catalogo from '../../plugins/CTU-catalogo.js';
import * as starter from '../../plugins/CTU-starter.js';
import * as personajes from '../../plugins/CTU-personajes.js';
import * as unidad from '../../plugins/CTU-unidad.js';
import * as ayuda from '../../plugins/CTU-ayuda.js';
import * as equipo from '../../plugins/CTU-equipo.js';
import * as pelea from '../../plugins/CTU-pelea.js';
import * as aceptar from '../../plugins/CTU-aceptar.js';
import * as atacar from '../../plugins/CTU-atacar.js';
import * as rendirse from '../../plugins/CTU-rendirse.js';
import * as combate from '../../plugins/CTU-combate.js';
import * as rechazar from '../../plugins/CTU-rechazar.js';
import * as cancelar from '../../plugins/CTU-cancelar.js';
import * as ficha from '../../plugins/CTU-ficha.js';
import * as balance from '../../plugins/CTU-balance.js';
import * as historial from '../../plugins/CTU-historial.js';
import * as sobres from '../../plugins/CTU-sobres.js';
import * as abrir from '../../plugins/CTU-abrir.js';
import * as diario from '../../plugins/CTU-diario.js';
import * as tienda from '../../plugins/CTU-tienda.js';
import * as movimientos from '../../plugins/CTU-movimientos.js';
import * as mercado from '../../plugins/CTU-mercado.js';
import * as vender from '../../plugins/CTU-vender.js';
import * as comprar from '../../plugins/CTU-comprar.js';
import * as retirar from '../../plugins/CTU-retirar.js';
import * as ventas from '../../plugins/CTU-ventas.js';
import * as propiedad from '../../plugins/CTU-propiedad.js';
import * as cambiar from '../../plugins/CTU-cambiar.js';
import * as misiones from '../../plugins/CTU-misiones.js';
import * as logros from '../../plugins/CTU-logros.js';
import * as inventario from '../../plugins/CTU-inventario.js';
import * as boss from '../../plugins/CTU-boss.js';
import * as bossatacar from '../../plugins/CTU-bossatacar.js';
import * as bosstop from '../../plugins/CTU-bosstop.js';
import * as spawn from '../../plugins/CTU-spawn.js';
import * as capturar from '../../plugins/CTU-capturar.js';
import * as explorar from '../../plugins/CTU-explorar.js';
import * as eventos from '../../plugins/CTU-eventos.js';
import * as evento from '../../plugins/CTU-evento.js';
import * as ranked from '../../plugins/CTU-ranked.js';
import * as rank from '../../plugins/CTU-rank.js';
import * as top from '../../plugins/CTU-top.js';
import * as temporada from '../../plugins/CTU-temporada.js';
import * as temporadas from '../../plugins/CTU-temporadas.js';
import * as historia from '../../plugins/CTU-historia.js';
import * as continuar from '../../plugins/CTU-continuar.js';
import * as capitulos from '../../plugins/CTU-capitulos.js';
import * as mision from '../../plugins/CTU-mision.js';
import * as recuerdos from '../../plugins/CTU-recuerdos.js';
import * as reiniciarHistoria from '../../plugins/CTU-reiniciarhistoria.js';
import { identityFor } from './command.js';
import { commandText } from './format.js';
import { renderSpawn } from './contentFormat.js';
import { game as defaultGame } from '../../game/index.js';

export const commands = Object.freeze([registro, perfil, catalogo, starter, personajes, unidad, ayuda, equipo, pelea, aceptar, atacar, rendirse, combate, rechazar, cancelar, ficha, balance, historial, sobres, abrir, diario, tienda, movimientos, mercado, vender, comprar, retirar, ventas, propiedad, cambiar, misiones, logros, inventario, boss, bossatacar, bosstop, spawn, capturar, explorar, eventos, evento, ranked, rank, top, temporada, temporadas, clan, intercambio, crafting, evolucion, recompensas, social, showcase, historia, continuar, capitulos, mision, recuerdos, reiniciarHistoria]);

export async function observeGameActivity(sock, msg, { game = defaultGame, prefix = '.', logger = console.error } = {}) {
  if (!msg?.key?.remoteJid?.endsWith('@g.us') || msg.key.fromMe || !msg.key.id || !msg.key.participant) return false;
  let result;
  try { result = await game.encounters.observeGroupActivity({ identity: identityFor(sock, msg), chatId: msg.key.remoteJid, messageId: msg.key.id }); }
  catch (error) {
    if (!['USER_NOT_FOUND', 'INVALID_IDENTITY'].includes(error.code)) logger(`Chengdú: aparición | ${error.code ?? 'UNEXPECTED_ERROR'}`, error);
    return false;
  }
  if (!result.spawned) return false;
  await sock.sendMessage(msg.key.remoteJid, { text: renderSpawn(result.spawn, (command, args = '') => commandText(prefix, command, args)) });
  return true;
}

// Host supplies authenticated msg metadata and the text extracted from the message.
export function createCommandRouter({ game = defaultGame, prefix = '.', logger, debug, battleHealthBars, automaticSpawns = true } = {}) {
  const handlers = new Map(commands.map(c => [c.command, c.createRun(game, { logger, prefix, debug, battleHealthBars })]));
  return async function handleGameCommand(sock, msg, body) {
    if (typeof body !== 'string') return false;
    if (!body.startsWith(prefix)) {
      if (automaticSpawns && body.trim()) await observeGameActivity(sock, msg, { game, prefix, logger });
      return false;
    }
    const [name, ...args] = body.slice(prefix.length).trim().split(/\s+/u);
    const run = handlers.get(name.toLowerCase());
    if (!run) return false;
    await run(sock, msg, args);
    return true;
  };
}
