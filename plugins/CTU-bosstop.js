import { defineCommand, pageArguments, pageNavigation } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctubosstop', async ({ game, args, prefix, cmd }) => {
  requireGame(args.length <= 2, 'INVALID_ARGUMENTS');
  const hasCode = /^B[1-9]\d*$/i.test(args[0] ?? '');
  const code = hasCode ? args[0] : null;
  const page = await game.encounters.getBossRanking(code, pageArguments(hasCode ? args.slice(1) : args));
  return card('BOSS | APORTACIONES', [
    `👹 *${displayName(page.boss.snapshot.name)}* · ${page.boss.code}`,
    ...(page.items.length ? page.items.map(item => `${item.rank === 1 ? '🥇' : '🤝'} *${item.rank}. ${displayName(item.name)}*\n💥 ${item.damage} de daño · ⚔️ ${item.attacks} ataques`) : ['🌱 Aún nadie ha atacado a este boss.'])
  ], `${pageNavigation(page, 'ctubosstop', prefix, page.boss.code)}\n👹 Ver boss: ${cmd('ctuboss', page.boss.code)}`);
});
