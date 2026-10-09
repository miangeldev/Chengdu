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
import { game as defaultGame } from '../../game/index.js';

export const commands = Object.freeze([registro, perfil, catalogo, starter, personajes, unidad, ayuda, equipo, pelea, aceptar, atacar, rendirse, combate, rechazar, cancelar]);

// Host supplies authenticated msg metadata and the text extracted from the message.
export function createCommandRouter({ game = defaultGame, prefix = '.', logger } = {}) {
  const handlers = new Map(commands.map(c => [c.command, c.createRun(game, { logger, prefix })]));
  return async function handleGameCommand(sock, msg, body) {
    if (typeof body !== 'string' || !body.startsWith(prefix)) return false;
    const [name, ...args] = body.slice(prefix.length).trim().split(/\s+/u);
    const run = handlers.get(name.toLowerCase());
    if (!run) return false;
    await run(sock, msg, args);
    return true;
  };
}
