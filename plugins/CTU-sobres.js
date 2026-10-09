import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName, rarityIcon, rarityName, section } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';
import { variantName } from '../game/units/collectibles.js';

const percentage = (weight, total) => `${Number((100 * weight / total).toFixed(2))}%`;
const distribution = (items, label) => {
  const total = items.reduce((sum, item) => sum + item.weight, 0);
  return items.map(item => `${percentage(item.weight, total)} ${label(item)}`).join(' · ');
};

export const { command, run, createRun } = defineCommand('ctusobres', async ({ game, args, cmd }) => {
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  const { items } = await game.packs.listPacks();
  return card('SOBRES', [
    ...items.map(pack => section(`🎁 *${displayName(pack.name)}* · ${pack.price} ChengCoins`,
      pack.available
        ? `${pack.odds.map(odd => `${rarityIcon(odd.rarity)} ${rarityName(odd.rarity)}: ${percentage(odd.weight, odd.totalWeight)}`).join(' · ')}\n✨ Variante: ${distribution(pack.variantWeights, item => displayName(variantName(item.id)))}\n🧬 Rasgos: ${distribution(pack.traitWeights, item => ['sin rasgos', 'uno', 'dos'][item.count])}\n👉 *${cmd('ctuabrir', pack.id)}*`
        : '📦 Sin personajes disponibles por ahora.'
    )),
    !items.length ? 'No hay sobres disponibles por ahora.' : null,
    items.length ? '🎲 Un personaje por sobre. Las probabilidades de rareza se ajustan si una categoría se agota.\nLas variantes son cosméticas; los rasgos mejoran stats.' : null,
    items.length ? `🔎 Consulta el resultado con ${cmd('ctuficha', 'ID')}.` : null
  ], `💰 Consultar saldo: *${cmd('ctubalance')}*`);
});
