import { defineCommand, nextPage, pageArguments } from '../interfaces/whatsapp/command.js';
import { card, characterIcon, rarityIcon, rarityName, roleName, section, statsText } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctucatalogo', async ({ game, args, prefix, cmd }) => {
  const page = await game.characters.listCharacters(pageArguments(args));
  return card('📚 *Catálogo de personajes*', page.items.length ? page.items.map(c => section(
    `${characterIcon(c.id)} *${c.name}*`,
    `${rarityIcon(c.rarity)} Rareza: ${rarityName(c.rarity)}\n🎯 Rol: ${roleName(c.role)}\n\n${statsText(c.baseStats)}\n\n${c.starterEligible ? '🎁 Disponible como starter\n' : ''}${c.obtainable ? '✅ Emisión abierta' : '🔒 Emisión cerrada'}\n📦 Supply: ${c.supply.type === 'limited' ? c.supply.max : 'Ilimitado'}`
  )) : ['No hay personajes en esta página.'], nextPage(page, 'ctucatalogo', prefix) || `👉 Elegir tu primer personaje:\n${cmd('ctustarter')}`);
});
