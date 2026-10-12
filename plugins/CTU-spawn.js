import { defineCommand, groupContext } from '../interfaces/whatsapp/command.js';
import { renderSpawn } from '../interfaces/whatsapp/contentFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuspawn', async ({ game, args, context, cmd }) => {
  groupContext(context);
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  return renderSpawn(await game.encounters.getSpawn({ chatId: context.chatId }), cmd);
});
