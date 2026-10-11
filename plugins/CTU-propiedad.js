import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { marketDateText } from '../interfaces/whatsapp/marketFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctupropiedad', async ({ game, args, cmd }) => {
  requireGame(args.length >= 1 && args.length <= 2, 'INVALID_ARGUMENTS');
  const unit = await game.units.getUnit(args[0]);
  const page = await game.units.getOwnershipHistory(unit.id, { limit: 5, cursor: args[1] ?? null });
  return card('PROPIEDAD', [
    `🎴 *${displayName(unit.character.name)}*\n👤 Propietario actual: *${displayName(page.currentOwner?.name ?? unit.owner.name)}*`,
    ...page.items.map(event => `${event.fromOwner ? `🤝 ${displayName(event.fromOwner.name)} → ${displayName(event.toOwner.name)}` : `🌱 Emitida para ${displayName(event.toOwner.name)}`}\n${event.fromOwner ? 'Compra en el mercado' : 'Primera emisión'} · ${marketDateText(event.createdAt)} (CDMX)`)
  ], page.nextCursor ? `📄 Siguiente: *${cmd('ctupropiedad', `${unit.id} ${page.nextCursor}`)}*` : `👉 Stats y ataques: *${cmd('ctuficha', unit.id)}*`);
});
