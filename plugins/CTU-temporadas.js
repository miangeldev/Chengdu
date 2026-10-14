import { defineCommand, pageArguments, pageNavigation } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { seasonDeadline, seasonHeading } from '../interfaces/whatsapp/competitiveFormat.js';

export const { command, run, createRun } = defineCommand('ctutemporadas', async ({ game, args, cmd, prefix }) => {
  const page = await game.competitive.getSeasons(pageArguments(args));
  return card('RANKED | TEMPORADAS', page.items.length ? page.items.map(season => [
    seasonHeading(season),
    `${season.status === 'closed' ? '🏁 Cerrada' : '🏮 En curso'} · 🌍 ${season.participants} participantes`,
    seasonDeadline(season),
    `👉 *${cmd('ctutemporada', season.code)}*`
  ].join('\n')) : ['📅 Aún no se han abierto temporadas.'], `${pageNavigation(page, 'ctutemporadas', prefix)}\n🏅 Tu clasificación: ${cmd('cturank')}`);
});
