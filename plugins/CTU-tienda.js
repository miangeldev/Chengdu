import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctutienda', async ({ game, args, cmd }) => {
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  const { items } = await game.packs.listPacks();
  return card('TIENDA', [
    ...items.map(pack => `🎁 *${displayName(pack.name)}*\n💰 ${pack.price} ChengCoins · ${pack.available ? '✅ Disponible' : '📦 Agotado'}\n${pack.available ? `👉 *${cmd('ctuabrir', pack.id)}*` : 'Sin personajes disponibles por ahora.'}`),
    !items.length ? 'No hay artículos disponibles por ahora.' : null,
    items.length ? `🎲 Un personaje por sobre.\n🔎 Probabilidades y rasgos: ${cmd('ctusobres')}` : null
  ], `💰 Consultar saldo: *${cmd('ctubalance')}*`);
});
