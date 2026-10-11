import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctubalance', async ({ game, identity, args, cmd }) => {
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  const { coins, income, expenses, openingBalance } = await game.economy.getBalance(user.id);
  const daily = await game.economy.getDailyStatus(user.id);
  return card('BALANCE', [
    `💰 *${coins} ChengCoins*`,
    `📥 Ingresos: ${income} · 📤 Gastos: ${expenses}${openingBalance ? `\n📜 Saldo inicial conservado: ${openingBalance}` : ''}\n🔎 ${cmd('ctumovimientos')}`,
    `🎁 Diario: +${daily.amount} ChengCoins cada 24 h\n${daily.available ? `👉 *${cmd('ctudiario')}*` : `⏳ Próximo: ${new Date(daily.nextClaimAt).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' })} (CDMX)`}`,
    '🏆 Victoria: +120 ChengCoins y +35 XP\n💔 Derrota: +15 XP · ⚖️ Empate: +20 XP\n✨ La unidad participante también recibe esa XP.',
    '⏳ Hasta 3 combates con recompensa contra el mismo rival en 24 h.\n🏳️ Rendirse requiere 4 ataques y que ambos hayan atacado.\n⌛ La inactividad no otorga recompensas.'
  ], `👉 Conseguir personajes: *${cmd('ctutienda')}*`);
});
