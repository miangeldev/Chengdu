import { defineCommand } from '../interfaces/whatsapp/command.js';
import { renderRank } from '../interfaces/whatsapp/competitiveFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('cturank', async ({ game, identity, args, cmd }) => {
  requireGame(args.length <= 1 && (!args.length || /^T[1-9]\d*$/i.test(args[0])), 'INVALID_SEASON');
  const user = await game.users.getUserByIdentity(identity());
  const result = await game.competitive.getRank({ userId: user.id, seasonCode: args[0] ?? null });
  return renderRank(result, cmd);
});
