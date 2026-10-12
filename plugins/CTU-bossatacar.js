import { contentOperationKey, defineCommand, groupContext } from '../interfaces/whatsapp/command.js';
import { renderBoss } from '../interfaces/whatsapp/contentFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctubossatacar', async ({ game, identity, args, context, cmd }) => {
  groupContext(context);
  requireGame(args.length >= 1 && args.length <= 2 && ['1', '2'].includes(args[0]) && (args.length === 1 || /^B[1-9]\d*$/i.test(args[1])), 'INVALID_BOSS_ATTACK');
  const user = await game.users.getUserByIdentity(identity());
  const result = await game.encounters.attackBoss({ userId: user.id, chatId: context.chatId, choice: args[0], code: args[1] ?? null,
    operationKey: contentOperationKey('boss_attack', context, user.id) });
  return renderBoss(result.boss, cmd, { ...result, userId: user.id });
});
