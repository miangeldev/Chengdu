import { createHash } from 'node:crypto';
import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';
import { renderStoryJournal, storyJournalArguments } from '../interfaces/whatsapp/storyFormat.js';

const availabilityText = value => new Date(value).toLocaleString('es-MX', {
  timeZone: 'America/Mexico_City', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});

export const { command, run, createRun } = defineCommand('ctudiario', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length === 0 || args[0].toLowerCase() === 'historia', 'INVALID_ARGUMENTS');
  if (args.length) {
    const options = storyJournalArguments(args.slice(1));
    const user = await game.users.getUserByIdentity(identity());
    return renderStoryJournal(await game.story.getJournal({ userId: user.id }), cmd, options);
  }
  requireGame(typeof context.messageId === 'string' && context.messageId.trim().length > 0, 'ECONOMY_MESSAGE_ID_REQUIRED');
  const user = await game.users.getUserByIdentity(identity());
  const hash = createHash('sha256').update(JSON.stringify(['daily', context.chatId, user.id, context.messageId])).digest('hex');
  const { claim, alreadyClaimed } = await game.economy.claimDaily({ userId: user.id, operationKey: `daily:${hash}` });
  return card('DIARIO', [
    alreadyClaimed ? '↩️ Este mensaje ya reclamó tu diario. Aquí está su recibo original.' : `🎁 *+${claim.amount} ChengCoins*`,
    alreadyClaimed ? `🎁 ${claim.amount} ChengCoins recibidos en ese reclamo\nSaldo tras ese reclamo: *${claim.balanceAfter} ChengCoins*` : `💰 Saldo: *${claim.balanceAfter} ChengCoins*`,
    alreadyClaimed
      ? `📅 Reclamo del ${availabilityText(claim.createdAt)}\n📍 Hora de Ciudad de México.`
      : `⏳ Próximo diario: *${availabilityText(claim.nextClaimAt)}*\n📍 Hora de Ciudad de México · Un reclamo cada 24 h.`
  ], alreadyClaimed ? `👉 Consultar saldo actual: *${cmd('ctubalance')}*` : `👉 Conseguir personajes: *${cmd('ctutienda')}*`);
});
