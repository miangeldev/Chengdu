import { defineCommand, pageArguments } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { marketDateText, marketUnitText } from '../interfaces/whatsapp/marketFormat.js';

export const { command, run, createRun } = defineCommand('ctuventas', async ({ game, args, identity, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  const page = await game.market.getSales(user.id, pageArguments(args));
  if (!page.items.length) return card('COMPRAS Y VENTAS', ['📜 Aún no has comprado ni vendido unidades.'], `👉 Explorar: *${cmd('ctumercado')}*`);
  return card('COMPRAS Y VENTAS', page.items.map(sale => {
    const buyer = sale.role === 'buyer';
    return `${buyer ? `🛒 Compra · ${sale.price} ChengCoins` : `🤝 Venta · +${sale.net} ChengCoins`}\n${marketUnitText(sale.unitSnapshot)}\n👤 ${buyer ? `Vendedor: ${displayName(sale.sellerName)}` : `Comprador: ${displayName(sale.buyerName)} · Comisión: ${sale.fee}`}\n📅 ${marketDateText(sale.createdAt)} (CDMX)\n🔎 ${cmd('ctupropiedad', sale.unitId)}`;
  }), page.nextCursor ? `📄 Siguiente: *${cmd('ctuventas', page.nextCursor)}*` : `👉 Tu saldo: *${cmd('ctubalance')}*`);
});
