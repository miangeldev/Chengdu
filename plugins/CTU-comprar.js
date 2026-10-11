import { defineCommand, marketOperationKey } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { marketUnitText } from '../interfaces/whatsapp/marketFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctucomprar', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length === 1, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  const { sale, unit, listing, alreadyPurchased } = await game.market.buyListing({ buyerId: user.id, listingId: args[0], operationKey: marketOperationKey('purchase', context, user.id) });
  const stillOwned = unit.ownerId === user.id;
  return card('COMPRA', [
    alreadyPurchased ? '↩️ Este mensaje ya confirmó la compra. Aquí está su recibo original.' : '🤝 ¡La unidad ya forma parte de tu colección!',
    marketUnitText(listing.unitSnapshot),
    `👤 Vendedor: ${displayName(listing.sellerName)}\n💰 ${sale.price} ChengCoins${alreadyPurchased ? ' pagados en esa compra' : ' pagados'}\n${alreadyPurchased ? 'Saldo tras esa compra' : 'Saldo restante'}: *${sale.buyerBalanceAfter} ChengCoins*`,
    !stillOwned ? '👤 La unidad cambió de propietario desde esa compra.' : null
  ], stillOwned ? `👉 Preparar equipo: *${cmd('ctuequipo', `usar ${unit.id}`)}*\n🔎 Consultar: ${cmd('ctuficha', unit.id)}` : `👉 Tu colección: *${cmd('ctupersonajes')}*`);
});
