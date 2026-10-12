import { defineCommand, pageArguments, pageNavigation } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { contentDate } from '../interfaces/whatsapp/contentFormat.js';

export const { command, run, createRun } = defineCommand('ctueventos', async ({ game, args, prefix, cmd }) => {
  const page = await game.content.getEvents(pageArguments(args));
  return card('EVENTOS', page.items.length ? page.items.map(event => [
    `🏮 *${displayName(event.name)}* · ${event.status === 'active' ? '🟢 Disponible' : event.status === 'upcoming' ? '⏳ Próximamente' : '⌛ Finalizado'}`,
    `📅 ${contentDate(event.startsAt)} → ${contentDate(event.endsAt)}`,
    `🎴 ${event.characters.length} personajes exclusivos`,
    `👉 *${cmd('ctuevento', event.code ?? event.slug ?? 'faroles')}*`
  ].join('\n')) : ['📅 Aún no hay eventos en el calendario.'], `${pageNavigation(page, 'ctueventos', prefix)}\n📍 Horarios de Ciudad de México.`);
});
