import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuinventario', async ({ game, identity, args, cmd }) => {
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  const inventory = await game.content.getInventory(user.id);
  const craft = game.crafting ? await game.crafting.getInventory(user.id) : null;
  return card('INVENTARIO', [
    `👤 *${displayName(user.name)}*\n🎟️ *${inventory.tickets} ${inventory.tickets === 1 ? 'ticket' : 'tickets'} de captura*`,
    inventory.titles.length ? `🎖️ *Títulos*\n${inventory.titles.map(displayName).join(' · ')}` : '🎖️ Tus títulos llegarán al desbloquear logros.',
    inventory.badges.length ? `🏵️ *Insignias*\n${inventory.badges.map(displayName).join(' · ')}` : null,
    craft ? `🪵 ${craft.materials.fragmentos} fragmentos · ✨ ${craft.materials.esencias} esencias · 🔮 ${craft.materials.sellos} sellos\n🔨 ${cmd('ctucrafting')}` : null,
    craft?.badges.length ? '🪵 Insignia: Artesano del Bambú' : null,
    '🎟️ Cada captura usa un ticket. Consíguelos completando misiones, logros y eventos.'
  ], `📋 Misiones: ${cmd('ctumisiones')}\n🏅 Logros: ${cmd('ctulogros')}\n🎴 Aparición del grupo: ${cmd('ctuspawn')}`);
});
