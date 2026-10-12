import { defineCommand, pageNavigation, pageArguments } from '../interfaces/whatsapp/command.js';
import { card, displayName, rarityIcon, rarityName, unitTitle } from '../interfaces/whatsapp/format.js';
import { variantName } from '../game/units/collectibles.js';

export const { command, run, createRun } = defineCommand('ctupersonajes', async ({ game, args, identity, prefix, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  const page = await game.units.getUserUnits(user.id, pageArguments(args));
  const rows = page.items.map(u => `${unitTitle(u)}${u.variant !== 'normal' ? ` · ✨ ${displayName(variantName(u.variant))}` : ''} · Nv. ${u.progress.level}\n${rarityIcon(u.character.rarity)} ${rarityName(u.character.rarity)}${u.traits?.length ? ` · 🧬 ${u.traits.length} ${u.traits.length === 1 ? 'rasgo' : 'rasgos'}` : ''} · ${u.lock?.type === 'market' ? '🔒 En venta' : u.lock ? '🔒 En combate' : '✅ Disponible'}\n↳ ${u.lock?.type === 'market' ? cmd('ctumercado', `ver ${u.lock.referenceId}`) : u.lock ? cmd('ctuficha', u.id) : cmd('ctuequipo', `usar ${u.id}`)}`);
  const profile = !rows.length ? await game.users.getProfile(user.id) : null;
  return card('COLECCIÓN', [
    `🎴 *${displayName(user.name)}*`,
    ...rows,
    !rows.length ? 'Tu colección está vacía.' : null
  ], rows.length ? [pageNavigation(page, 'ctupersonajes', prefix), `🔎 Detalles: ${cmd('ctuficha', 'ID')}`].filter(Boolean).join('\n') : profile.starterClaim ? `👉 Conseguir personajes: *${cmd('ctumercado')}*` : `🎁 Reclamar starter: *${cmd('ctustarter')}*`);
});
