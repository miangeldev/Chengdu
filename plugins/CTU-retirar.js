import { defineCommand, marketOperationKey } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { marketUnitText } from '../interfaces/whatsapp/marketFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('cturetirar', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length === 1, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  const { listing, alreadyCancelled, expired } = await game.market.cancelListing({ sellerId: user.id, listingId: args[0], operationKey: marketOperationKey('cancel', context, user.id) });
  return card('ANUNCIO', [
    expired ? '⌛ El anuncio venció y dejó de ofrecerse en el mercado.' : alreadyCancelled ? '↩️ Este anuncio ya se había retirado.' : '↩️ Anuncio retirado. Tu unidad está disponible de nuevo.',
    marketUnitText(listing.unitSnapshot),
    '💰 Retirar o dejar vencer el anuncio no cobra comisión.'
  ], `👉 Tu colección: *${cmd('ctupersonajes')}*`);
});
