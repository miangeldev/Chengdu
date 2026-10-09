import { defineCommand, nextPage, pageArguments } from '../interfaces/whatsapp/command.js';
import { card, displayName, rarityIcon, rarityName, unitTitle } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctupersonajes', async ({ game, args, identity, prefix, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  const page = await game.units.getUserUnits(user.id, pageArguments(args));
  return card(`🎴 *Colección de ${displayName(user.name)}*`, page.items.length ? page.items.map(u =>
    `${unitTitle(u)}\n\n🆔 ${u.id}\n${rarityIcon(u.character.rarity)} ${rarityName(u.character.rarity)}\n🌱 Nivel: ${u.progress.level} | ✨ XP: ${u.progress.xp}\n🏆 Victorias: ${u.battleStats.wins}\n${u.lock ? '⚔️ En combate' : '✅ Disponible'}\n\n🔎 Ver ficha:\n${cmd('ctuunidad', u.id)}`
  ) : [`Tu colección está vacía.\n\n🎁 Si aún no elegiste tu starter:\n${cmd('ctustarter')}`], nextPage(page, 'ctupersonajes', prefix) || `📚 Explorar personajes:\n${cmd('ctucatalogo')}`);
});
