import { defineCommand, nextPage, pageArguments } from '../interfaces/whatsapp/command.js';
import { card, characterIcon, displayName, rarityIcon, rarityName, roleName } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctucatalogo', async ({ game, args, prefix, cmd }) => {
  const page = await game.characters.listCharacters(pageArguments(args));
  return card('CATÁLOGO', page.items.length ? page.items.map(c =>
    `${characterIcon(c.id)} *${displayName(c.name)}*\n${rarityIcon(c.rarity)} ${rarityName(c.rarity)} · ${roleName(c.role)}${!c.obtainable ? ' · 🔒 Emisión cerrada' : c.starterEligible ? ' · 🎁 Starter' : ''}\n↳ ${cmd('ctuficha', c.id)}`
  ) : ['📚 No hay personajes en esta página.'], nextPage(page, 'ctucatalogo', prefix) || `🎁 Elegir starter: ${cmd('ctustarter')}`);
});
