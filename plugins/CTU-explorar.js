import { contentOperationKey, defineCommand, groupContext } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { renderSpawn } from '../interfaces/whatsapp/contentFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuexplorar', async ({ game, identity, args, context, cmd }) => {
  groupContext(context);
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  contentOperationKey('spawn_check', context, user.id);
  const result = await game.encounters.observeActivity({ userId: user.id, chatId: context.chatId, messageId: context.messageId });
  const spawn = result.spawn ?? await game.encounters.getSpawn({ chatId: context.chatId });
  return spawn ? renderSpawn(spawn, cmd) : card('EXPLORAR', [
    '🌿 Esta vez no apareció ningún personaje.',
    'Cada ventana del grupo tiene una sola comprobación. Participa con calma; repetir mensajes no aumenta las probabilidades.'
  ], `🎴 Ver aparición: ${cmd('ctuspawn')}\n🎟️ Tus tickets: ${cmd('ctuinventario')}`);
});
