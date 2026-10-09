import { game as defaultGame } from '../../game/index.js';
import { GameError, requireGame } from '../../utils/GameError.js';
import { normalizeIdentity } from '../../utils/identity.js';
import { describeError } from '../../utils/errorDiagnostics.js';
import { whatsappConfig } from '../../CTU-config.js';
import { card, commandText, displayName, section } from './format.js';
export { displayName, rarityName } from './format.js';

const messages = {
  INVALID_NAME: '❌ Escribe un nombre de 1 a 40 caracteres, sin saltos de línea ni caracteres de control.\nEjemplo: .cturegistro Miguel',
  USER_NOT_FOUND: '❌ Primero regístrate con .cturegistro Tu nombre',
  INVALID_IDENTITY: '❌ No pude identificar al remitente. Usa el comando desde una conversación de WhatsApp válida.',
  CHARACTER_NOT_FOUND: '❌ Ese personaje no existe.',
  UNIT_NOT_FOUND: '❌ Esa unidad no existe. Ejemplo: .ctuunidad PAND-000001',
  INVALID_STARTER: '❌ Elige panda, mago o lobo (también 1, 2 o 3). Ejemplo: .ctustarter panda',
  CHARACTER_UNAVAILABLE: '❌ Ese personaje no está disponible para obtenerse.',
  SUPPLY_EXHAUSTED: '❌ Ya se emitieron todas las unidades disponibles de ese personaje.',
  INVALID_CURSOR: '❌ La página no es válida. Usa el comando sin argumentos para volver al inicio.',
  INVALID_PAGE_SIZE: '❌ El tamaño de página debe estar entre 1 y 25.',
  INVALID_ARGUMENTS: '❌ Los argumentos no son válidos.',
  GROUP_ONLY: '⚔️ Los desafíos y combates se juegan en un grupo de WhatsApp. Usa el comando en el grupo donde está tu oponente.',
  INVALID_OPPONENT: '👤 Menciona a un solo jugador o usa su ID de jugador.\nEjemplo: .ctupelea @jugador',
  OPPONENT_NOT_REGISTERED: '👤 Tu oponente todavía no está registrado. Debe usar .cturegistro y elegir su starter primero.',
  SELF_CHALLENGE: '🪞 No puedes desafiarte a ti mismo. Elige otro jugador del grupo.',
  PLAYER_BUSY: '⏳ Uno de los jugadores ya tiene un desafío pendiente o un combate activo. Consulta .ctucombate en el grupo donde se inició.',
  TEAM_EMPTY: '🛡️ Ambos jugadores necesitan un equipo. Consulta .ctupersonajes y selecciona una unidad con .ctuequipo usar ID.',
  INVALID_TEAM: '🛡️ Usa .ctuequipo para ver tu equipo, .ctuequipo usar ID para elegir una unidad o .ctuequipo limpiar para vaciarlo.',
  TEAM_FULL: '🛡️ Tu equipo ya tiene una unidad. Usa .ctuequipo usar ID para cambiarla.',
  TEAM_LOCKED: '🔒 No puedes cambiar tu equipo durante un combate. Termínalo o usa .cturendirse en el grupo correspondiente.',
  UNIT_NOT_OWNED: '🔒 Esa unidad no te pertenece. Elige una de tu colección con .ctupersonajes.',
  UNIT_NOT_IN_TEAM: '🛡️ Esa unidad no está en tu equipo.',
  UNIT_LOCKED: '🔒 Esa unidad está ocupada en otro combate.',
  BATTLE_NOT_FOUND: '⚔️ No hay un desafío o combate disponible para esta acción en este grupo. Consulta .ctucombate.',
  BATTLE_NOT_ACTIVE: '⚔️ El combate ya terminó o todavía no fue aceptado. Consulta .ctucombate.',
  BATTLE_WRONG_CHAT: '📍 Ese combate pertenece a otro grupo. Usa el comando en el grupo donde se inició.',
  BATTLE_NOT_PARTICIPANT: '👤 No participas en ese combate.',
  CHALLENGE_NOT_YOURS: '📣 Sólo el jugador desafiado puede aceptar o rechazar; sólo el creador puede retirar el desafío.',
  NOT_YOUR_TURN: '⏳ Aún no es tu turno. Consulta .ctucombate para ver quién debe atacar.',
  INVALID_ATTACK: '⚔️ Elige uno de los dos ataques de tu personaje.\nUsa .ctuatacar 1 o .ctuatacar 2.'
};

function identityFor(sock, msg) {
  const subject = msg.key.fromMe ? sock.user?.id
    : msg.key.remoteJid.endsWith('@g.us') ? msg.key.participant : msg.key.remoteJid;
  return normalizeIdentity({ provider: 'whatsapp', subject });
}

function defaultLogger(message) {
  console.error(`Chengdú: ${message}`);
}

function debugEnabled(override) {
  if (typeof override === 'boolean') return override;
  if (process.env.CTU_DEBUG === undefined) return whatsappConfig.debug;
  return ['1', 'true'].includes(process.env.CTU_DEBUG.trim().toLowerCase());
}

function debugSection(diagnostic) {
  const limit = 6000;
  const clipped = diagnostic.length > limit
    ? `${diagnostic.slice(0, limit)}\n… [Diagnóstico recortado; traza completa en consola]`
    : diagnostic;
  // Prevent an exception containing backticks from closing the WhatsApp code block.
  return section('🐛 *Debug activado*', `Copia este diagnóstico para revisar el fallo.\n\n\`\`\`\n${clipped.replace(/\`\`\`/g, '\` \` \`')}\n\`\`\``);
}

export function defineCommand(command, handler) {
  function createRun(game, { logger = defaultLogger, prefix = '.', debug, battleHealthBars } = {}) {
    return async function run(sock, msg, args = []) {
      const from = msg?.key?.remoteJid;
      requireGame(typeof from === 'string' && typeof sock?.sendMessage === 'function', 'INVALID_CONTEXT');
      let text;
      try {
        requireGame(Array.isArray(args) && args.every(a => typeof a === 'string'), 'INVALID_ARGUMENTS');
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ?? msg.message?.imageMessage?.contextInfo ?? msg.message?.videoMessage?.contextInfo;
        text = await handler({ game, args, identity: () => identityFor(sock, msg), prefix,
          cmd: (name, value) => commandText(prefix, name, value),
          battleOptions: { healthBars: typeof battleHealthBars === 'boolean' ? battleHealthBars : whatsappConfig.battleHealthBars },
          context: { chatId: from, messageId: msg.key.id ?? null, mentions: contextInfo?.mentionedJid ?? [] }
        });
      } catch (error) {
        if (error instanceof GameError && error.code === 'USER_ALREADY_EXISTS') {
          text = card('👤 *Registro existente*', [`Ya estás registrado como ${displayName(error.details.name)}.`, `📌 Consulta tu perfil:\n${commandText(prefix, 'ctuperfil')}`]);
        } else if (error instanceof GameError && messages[error.code]) {
          text = card('⚠️ *Revisa tu comando*', [messages[error.code].replace(/\.ctu/g, () => `${prefix}ctu`)], `📖 Consulta los comandos:\n${commandText(prefix, 'ctuayuda')}`);
        } else {
          const code = typeof error?.code === 'string' ? error.code : 'UNEXPECTED_ERROR';
          const commandName = commandText(prefix, command);
          const diagnostic = `${code} | comando=${commandName} | Node=${process.version}\n${describeError(error)}`;
          logger(diagnostic, { code, command: commandName, runtime: process.version, error });
          text = card('🛠️ *No pude confirmar la operación*', [
            'Pide al administrador que revise el bot y vuelve a intentarlo.',
            debugEnabled(debug) ? debugSection(diagnostic) : null
          ]);
        }
      }
      // Transport failures propagate to the host; never retry a send automatically.
      return sock.sendMessage(from, { text });
    };
  }
  return { command, createRun, run: (...args) => createRun(defaultGame)(...args) };
}

export function pageArguments(args) {
  requireGame(args.length <= 1, 'INVALID_CURSOR');
  return { cursor: args[0] ?? null };
}

export function nextPage(page, command, prefix = '.') {
  return page.nextCursor ? `📄 *Siguiente página*\n\n${commandText(prefix, command, page.nextCursor)}` : '';
}
