import { defineCommand, pageArguments, pageNavigation } from '../interfaces/whatsapp/command.js';
import { renderLeaderboard } from '../interfaces/whatsapp/competitiveFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctutop', async ({ game, args, cmd, prefix }) => {
  requireGame(args.length <= 2, 'INVALID_ARGUMENTS');
  const hasCode = /^T[1-9]\d*$/i.test(args[0] ?? '');
  if (/^T/i.test(args[0] ?? '')) requireGame(hasCode, 'INVALID_SEASON');
  const seasonCode = hasCode ? args[0] : null;
  const page = await game.competitive.getLeaderboard({ seasonCode, ...pageArguments(hasCode ? args.slice(1) : args) });
  return renderLeaderboard(page, pageNavigation(page, 'ctutop', prefix, page.season.code), cmd);
});
