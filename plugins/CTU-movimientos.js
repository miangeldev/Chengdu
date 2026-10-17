import { defineCommand, pageArguments, pageNavigation } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';

const sources = { story_reward: '📖 Misión de Historia', trade_escrow: 'Reserva de intercambio', trade_settlement: 'Intercambio completado', trade_refund: 'Reserva devuelta', crafting_cost: 'Crafting', evolution_cost: 'Evolución', clan_creation: 'Fundación de clan', clan_deposit: 'Aporte a la tesorería', clan_withdraw: 'Retiro de tesorería', clan_war_reward: 'Premio de guerra', battle_reward: '🏆 Combate', pack_opening: '🎁 Sobre', daily_reward: '📅 Diario', market_purchase: '🛒 Compra de unidad', market_sale: '🤝 Venta de unidad', content_reward: '🌿 Misiones y aventuras', season_reward: '🏅 Premio de temporada' };
const movementDate = value => new Date(value).toLocaleString('es-MX', {
  timeZone: 'America/Mexico_City', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});

export const { command, run, createRun } = defineCommand('ctumovimientos', async ({ game, args, identity, prefix, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  const page = await game.economy.getMovements(user.id, pageArguments(args));
  if (!page.items.length) return card('MOVIMIENTOS', ['📜 Aún no tienes movimientos de ChengCoins.'], `👉 Reclamar diario: *${cmd('ctudiario')}*`);
  return card('MOVIMIENTOS', page.items.map(movement =>
    `${movement.type === 'credit' ? '📥' : '📤'} *${movement.type === 'credit' ? '+' : '-'}${movement.amount} ChengCoins* · ${sources[movement.sourceType] ?? '💰 Movimiento'}\n📅 ${movementDate(movement.createdAt)}`
  ), `${pageNavigation(page, 'ctumovimientos', prefix)}\n👉 Tu saldo: *${cmd('ctubalance')}*`);
});
