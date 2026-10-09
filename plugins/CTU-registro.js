import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('cturegistro', async ({ game, args, identity, cmd }) => {
  const user = await game.users.registerUser({ identity: identity(), name: args.join(' ') });
  return card('REGISTRO', [
    `✅ Registro completado\n¡Bienvenido, *${displayName(user.name)}*!`,
    `🌱 Nivel ${user.progress.level} · 💰 ${user.economy.coins} ChengCoins`
  ], `🎁 Elige tu primer personaje:\n👉 *${cmd('ctustarter')}*`);
});
