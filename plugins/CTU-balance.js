import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctubalance', async ({ game, identity, args, cmd }) => {
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  const { coins } = await game.economy.getBalance(user.id);
  return card('BALANCE', [
    `💰 *${coins} ChengCoins*`,
    '🏆 Victoria: +120 ChengCoins y +35 XP\n💔 Derrota: +15 XP · ⚖️ Empate: +20 XP\n✨ La unidad participante también recibe esa XP.',
    '⏳ Hasta 3 combates con recompensa contra el mismo rival en 24 h.\n🏳️ Rendirse requiere 4 ataques y que ambos hayan atacado.\n⌛ La inactividad no otorga recompensas.'
  ], `👉 Tus partidas: *${cmd('ctuhistorial')}*`);
});
