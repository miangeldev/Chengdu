import { contentOperationKey, defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName, rarityIcon, rarityName } from '../interfaces/whatsapp/format.js';
import { contentDate, prizeText, renderContentReward } from '../interfaces/whatsapp/contentFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuevento', async ({ game, identity, args, context, cmd }) => {
  requireGame(args.length >= 1 && args.length <= 2 && (args.length === 1 || args[1].toLowerCase() === 'reclamar'), 'INVALID_ARGUMENTS');
  const eventId = args[0];
  let user = null;
  try { user = await game.users.getUserByIdentity(identity()); }
  catch (error) { if (error.code !== 'USER_NOT_FOUND') throw error; }
  if (args.length === 2) {
    requireGame(user, 'USER_NOT_FOUND');
    const result = await game.content.claimEvent({ userId: user.id, eventId, operationKey: contentOperationKey('event', context, user.id) });
    return renderContentReward('EVENTO | BIENVENIDA', result, cmd, `🏮 Ver evento: *${cmd('ctuevento', eventId)}*\n🎴 Apariciones: ${cmd('ctuspawn')}`);
  }
  const event = await game.content.getEvent(eventId, user?.id ?? null);
  const code = event.code ?? event.slug ?? eventId;
  return card('EVENTO', [
    `🏮 *${displayName(event.name)}*\n${event.status === 'active' ? '🟢 ¡El festival está abierto!' : event.status === 'upcoming' ? '⏳ Próximamente' : '⌛ Evento finalizado'}`,
    `📅 ${contentDate(event.startsAt)} → ${contentDate(event.endsAt)}\n📍 Hora de Ciudad de México.`,
    `🎴 *Personajes exclusivos*\n${event.characters.map(character => `${rarityIcon(character.rarity)} ${displayName(character.name)} · ${rarityName(character.rarity)}\n↳ ${character.issued}/${character.max} emitidos · ${character.available ? 'Disponible' : 'Emisión cerrada o agotada'}`).join('\n')}`,
    `🎁 *Bienvenida*\n${prizeText(event.welcome)}\n${event.welcomeClaimed ? '✅ Ya reclamaste este premio.' : 'Un premio por jugador.'}`,
    event.status === 'ended' ? '🎴 Las unidades obtenidas conservan su progreso y pueden comerciarse.' : '🌿 Los personajes del festival pueden aparecer en los grupos; necesitas tickets para capturarlos.'
  ], event.status === 'active' && !event.welcomeClaimed ? `👉 Reclamar: *${cmd('ctuevento', `${code} reclamar`)}*` : `📅 Calendario: ${cmd('ctueventos')}`);
});
