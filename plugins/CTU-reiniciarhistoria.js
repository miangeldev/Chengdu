import { contentOperationKey, defineCommand } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { renderStory } from '../interfaces/whatsapp/storyFormat.js';
import { requireGame } from '../utils/GameError.js';

// Development shortcut: intentionally omitted from every public help screen.
export const { command, run, createRun } = defineCommand('ctureiniciarhistoria', async ({ game, identity, args, context, cmd, battleOptions }) => {
  requireGame(args.length === 0 || args.length === 1 && args[0].toLowerCase() === 'confirmar', 'STORY_RESET_CONFIRMATION');
  if (!args.length) return card('REINICIAR HISTORIA', [
    '🧪 *Reinicio de campaña para pruebas*',
    'Vuelve al comienzo del prólogo y termina tu encuentro narrativo actual.\nTus unidades, XP, monedas y recompensas ya entregadas se conservan. Los premios únicos no se vuelven a cobrar.'
  ], `👉 Confirmar: *${cmd('ctureiniciarhistoria', 'confirmar')}*`);
  const user = await game.users.getUserByIdentity(identity());
  const result = await game.story.reset({ userId: user.id, operationKey: contentOperationKey('story:reset', context, user.id) });
  return renderStory({ ...result, consequence: result.consequence ?? 'Campaña reiniciada para pruebas. Tus unidades, XP, monedas y premios anteriores se conservan.' }, cmd, battleOptions);
});
