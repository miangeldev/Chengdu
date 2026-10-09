import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, section, displayName } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('cturegistro', async ({ game, args, identity, cmd }) => {
  const user = await game.users.registerUser({ identity: identity(), name: args.join(' ') });
  return card('✅ *Registro completado*', [
    `¡Bienvenido, ${displayName(user.name)}!\nTu aventura en Chengdú comienza aquí.`,
    section('👤 *Tu cuenta*', `Nombre: ${displayName(user.name)}\n🆔 ID de jugador:\n${user.id}\n\n🌱 Nivel inicial: 1\n💰 ChengCoins: 0`),
    section('🎁 *Tu primer personaje te espera*', 'Elige entre Panda Guerrero, Mago Carmesí y Lobo Sombrío.\nCada unidad tiene un ID y serial propios.')
  ], `👉 *Siguiente paso*\n\n${cmd('ctustarter')}\n\n📖 Todos los comandos:\n${cmd('ctuayuda')}`);
});
