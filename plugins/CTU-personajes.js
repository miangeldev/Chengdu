import { defineCommand, pageNavigation, pageArguments } from '../interfaces/whatsapp/command.js';
import { card, displayName, rarityIcon, rarityName, unitTitle } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';
import { variantName } from '../game/units/collectibles.js';

export const { command, run, createRun } = defineCommand('ctupersonajes', async ({ game, args, identity, context, prefix, cmd }) => {
  requireGame(context.mentions.length <= 1, 'INVALID_ARGUMENTS');
  if (context.mentions.length) {
    requireGame(args.length >= 1 && args.length <= 2, 'INVALID_ARGUMENTS');
    const player = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: context.mentions[0] });
    const page = await game.social.getCollection({ userId: player.id, ...pageArguments(args.filter(a => !a.startsWith('@'))) });
    return card('COLECCIÓN PÚBLICA', [`🎴 *${displayName(player.name)}*`, ...page.items.map(u => `${rarityIcon(u.rarity)} *${displayName(u.name)}* · Nv. ${u.progress.level}\n🔎 ${cmd('ctuficha', u.id)}`)], pageNavigation(page, 'ctupersonajes', prefix, args.find(a => a.startsWith('@')) ?? '@jugador'));
  }
  const user = await game.users.getUserByIdentity(identity());
  const page = await game.units.getUserUnits(user.id, pageArguments(args));
  const rows = page.items.map(u => `${unitTitle(u)}${u.variant !== 'normal' ? ` · ✨ ${displayName(variantName(u.variant))}` : ''} · Nv. ${u.progress.level}\n${rarityIcon(u.character.rarity)} ${rarityName(u.character.rarity)}${u.traits?.length ? ` · 🧬 ${u.traits.length} ${u.traits.length === 1 ? 'rasgo' : 'rasgos'}` : ''} · ${u.lock?.type === 'market' ? '🔒 En venta' : u.lock?.type === 'trade' ? '🔒 En intercambio' : u.lock ? '🔒 En combate' : '✅ Disponible'}\n↳ ${u.lock?.type === 'market' ? cmd('ctumercado', u.marketCode) : u.lock ? cmd('ctuficha', u.id) : cmd('ctuequipo', `usar ${u.id}`)}`);
  const profile = !rows.length ? await game.users.getProfile(user.id) : null;
  return card('COLECCIÓN', [
    `🎴 *${displayName(user.name)}*`,
    ...rows,
    !rows.length ? 'Tu colección está vacía.' : null
  ], rows.length ? [pageNavigation(page, 'ctupersonajes', prefix), `🔎 Detalles: ${cmd('ctuficha', 'ID')}`].filter(Boolean).join('\n') : profile.starterClaim ? `👉 Conseguir personajes: *${cmd('ctumercado')}*` : `🎁 Reclamar starter: *${cmd('ctustarter')}*`);
});
