import { defineCommand, pageArguments } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';

const sources = { battle_reward: '🏆 Combate', pack_opening: '🎁 Sobre', daily_reward: '📅 Diario', market_purchase: '🛒 Compra de unidad', market_sale: '🤝 Venta de unidad' };
const movementDate = value => new Date(value).toLocaleString('es-MX', {
  timeZone: 'America/Mexico_City', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});

export const { command, run, createRun } = defineCommand('ctumovimientos', async ({ game, args, identity, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  const page = await game.economy.getMovements(user.id, pageArguments(args));
  if (!page.items.length) return card('MOVIMIENTOS', ['📜 Aún no tienes movimientos de ChengCoins.'], `👉 Reclamar diario: *${cmd('ctudiario')}*`);
  return card('MOVIMIENTOS', page.items.map(movement =>
    `${movement.type === 'credit' ? '📥' : '📤'} *${movement.type === 'credit' ? '+' : '-'}${movement.amount} ChengCoins* · ${sources[movement.sourceType] ?? '💰 Movimiento'}\n📅 ${movementDate(movement.createdAt)}`
  ), page.nextCursor ? `📄 Siguiente: *${cmd('ctumovimientos', page.nextCursor)}*` : `👉 Tu saldo: *${cmd('ctubalance')}*`);
});
