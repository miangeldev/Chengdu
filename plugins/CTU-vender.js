import { defineCommand, marketOperationKey } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { listingStatus, marketDateText, marketUnitText } from '../interfaces/whatsapp/marketFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuvender', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length === 2, 'INVALID_ARGUMENTS');
  requireGame(/^\d+$/.test(args[1]) && Number.isSafeInteger(Number(args[1])) && Number(args[1]) >= 20 && Number(args[1]) <= 1_000_000, 'INVALID_MARKET_PRICE');
  const user = await game.users.getUserByIdentity(identity());
  const result = await game.market.createListing({ sellerId: user.id, unitId: args[0], price: Number(args[1]), operationKey: marketOperationKey('listing', context, user.id) });
  const { listing } = result;
  return card('EN VENTA', [
    result.alreadyListed ? '↩️ Este mensaje ya publicó la unidad. Aquí está su anuncio original.' : '🎴 ¡Tu unidad ya está en el mercado!',
    marketUnitText(listing.unitSnapshot),
    `💰 Precio: *${listing.price} ChengCoins*\n🏦 Comisión del 5%: ${listing.fee} ChengCoins (redondeo hacia arriba)\n📥 ${listing.status === 'active' ? 'Recibirás' : 'Neto del anuncio'}: *${listing.net} ChengCoins*`,
    `${listingStatus(listing.status)}${listing.status === 'active' ? '\n🛡️ Retirada del equipo mientras está en venta.' : ''}\n⏳ Vence: ${marketDateText(listing.expiresAt)} (CDMX)`
  ], listing.status === 'active' ? `👉 Compartir anuncio: *${cmd('ctumercado', `ver ${listing.id}`)}*\n↩️ Retirar: ${cmd('cturetirar', listing.id)}` : `👉 Tus ventas y compras: *${cmd('ctuventas')}*`);
});
