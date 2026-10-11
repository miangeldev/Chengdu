import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { listingStatus, marketDateText, marketUnitText } from '../interfaces/whatsapp/marketFormat.js';
import { GameError, requireGame } from '../utils/GameError.js';

const rarities = { common: 'common', comun: 'common', 'común': 'common', rare: 'rare', raro: 'rare', epic: 'epic', epico: 'epic', 'épico': 'epic', legendary: 'legendary', legendario: 'legendary', mythic: 'mythic', mitico: 'mythic', 'mítico': 'mythic' };

export const { command, run, createRun } = defineCommand('ctumercado', async ({ game, args, identity, cmd }) => {
  requireGame(args.length <= 2, 'INVALID_MARKET_FILTER');
  const mode = args[0]?.toLowerCase();
  if (mode === 'ver') {
    requireGame(args.length === 2, 'INVALID_ARGUMENTS');
    const listing = await game.market.getListing(args[1]);
    let viewer = null;
    try { viewer = await game.users.getUserByIdentity(identity()); }
    catch (error) { if (!(error instanceof GameError && error.code === 'USER_NOT_FOUND')) throw error; }
    const ownListing = viewer?.id === listing.sellerId;
    const stats = listing.unitSnapshot.stats;
    return card('ANUNCIO', [
      marketUnitText(listing.unitSnapshot),
      `👤 Vendedor: *${displayName(listing.sellerName)}*\n💰 Precio: *${listing.price} ChengCoins*`,
      `❤️ ${stats.hp} HP · ⚔️ ${stats.attack} ATQ · 🛡️ ${stats.defense} DEF · 💨 ${stats.speed} VEL\n📌 Stats al publicar.`,
      `${listingStatus(listing.status)}\n⏳ Vence: ${marketDateText(listing.expiresAt)} (CDMX)`
    ], `${listing.status === 'active' ? ownListing ? `↩️ Retirar: *${cmd('cturetirar', listing.id)}*\n` : `🛒 Comprar: *${cmd('ctucomprar', listing.id)}*\n` : ''}🔎 Ataques y rasgos: ${cmd('ctuficha', listing.unitId)}`);
  }

  const own = mode === 'mios' || mode === 'míos';
  const byPrice = mode === 'precio';
  const rarity = rarities[mode] ?? null;
  const filtered = own || byPrice || rarity !== null;
  requireGame(filtered || args.length <= 1, 'INVALID_MARKET_FILTER');
  const options = { limit: 5, cursor: filtered ? args[1] ?? null : args[0] ?? null, sort: byPrice ? 'price_asc' : 'newest', rarity };
  if (own) options.sellerId = (await game.users.getUserByIdentity(identity())).id;
  const page = await game.market.listListings(options);
  const title = own ? 'MIS ANUNCIOS' : 'MERCADO';
  if (!page.items.length) return card(title, [own ? '🎴 No tienes unidades en venta.' : '🛍️ No hay unidades en venta con esta selección.'], `👉 Elegir una unidad para vender: *${cmd('ctupersonajes')}*`);
  const paginationMode = filtered ? `${args[0]} ` : '';
  return card(title, [
    byPrice ? '💰 Del menor al mayor precio.' : null,
    ...page.items.map(listing => `${marketUnitText(listing.unitSnapshot)}\n💰 *${listing.price} ChengCoins* · ${own ? `📥 Recibirás ${listing.net}` : `👤 ${displayName(listing.sellerName)}`}\n👉 ${cmd(own ? 'cturetirar' : 'ctumercado', own ? listing.id : `ver ${listing.id}`)}`)
  ], page.nextCursor ? `📄 Siguiente: *${cmd('ctumercado', `${paginationMode}${page.nextCursor}`)}*` : `🎴 Tus anuncios: ${cmd('ctumercado', 'mios')}\n💰 Menor precio: ${cmd('ctumercado', 'precio')}`);
});
