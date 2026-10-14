import { renderSocial } from '../interfaces/whatsapp/communityFormat.js';
import { requireGame } from '../utils/GameError.js';
import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName, progressText } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuperfil', async ({ game, identity, args, context, cmd }) => {
  requireGame(args.length <= 1 && context.mentions.length <= 1 && (args.length === 0 || context.mentions.length === 1), 'INVALID_ARGUMENTS');
  if (context.mentions.length) {
    const viewer = await game.users.getUserByIdentity(identity());
    const player = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: context.mentions[0] });
    return renderSocial(await game.social.getProfile({ userId: player.id, viewerId: viewer.id }), cmd);
  }
  const user = await game.users.getUserByIdentity(identity());
  const profile = await game.users.getProfile(user.id);
  const inventory = await game.content.getInventory(user.id);
  const { progress, economy, battleStats } = profile.user;
  const draws = battleStats.matches - battleStats.wins - battleStats.losses;
  return card('PERFIL', [
    `👤 *${displayName(profile.user.name)}*\n🌱 ${progressText(progress, 'user')}\n💰 ${economy.coins} ChengCoins · 🎴 ${profile.unitCount} ${profile.unitCount === 1 ? 'unidad' : 'unidades'}`,
    `⚔️ ${battleStats.matches} combates\n🏆 ${battleStats.wins} victorias · 💔 ${battleStats.losses} derrotas · ⚖️ ${draws} sin ganador`,
    inventory.achievementsCount || inventory.tickets ? `🏅 ${inventory.achievementsCount} ${inventory.achievementsCount === 1 ? 'logro desbloqueado' : 'logros desbloqueados'} · 🎟️ ${inventory.tickets} ${inventory.tickets === 1 ? 'ticket' : 'tickets'}\n↳ ${cmd('ctuinventario')}` : null,
    profile.starterClaim ? null : '🎁 Tu starter está pendiente.',
    game.social ? `🌟 Tu vitrina: ${cmd('ctushowcase')}\n✍️ Personalizar: ${cmd('ctusocial', 'ayuda')}` : null
  ], profile.starterClaim ? `👉 Tu colección: *${cmd('ctupersonajes')}*\n🏅 Tu clasificación: ${cmd('cturank')}` : `👉 *${cmd('ctustarter')}*`);
});
