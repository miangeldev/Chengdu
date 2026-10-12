import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName, progressText } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuperfil', async ({ game, identity, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  const profile = await game.users.getProfile(user.id);
  const inventory = await game.content.getInventory(user.id);
  const { progress, economy, battleStats } = profile.user;
  const draws = battleStats.matches - battleStats.wins - battleStats.losses;
  return card('PERFIL', [
    `👤 *${displayName(profile.user.name)}*\n🌱 ${progressText(progress, 'user')}\n💰 ${economy.coins} ChengCoins · 🎴 ${profile.unitCount} ${profile.unitCount === 1 ? 'unidad' : 'unidades'}`,
    `⚔️ ${battleStats.matches} combates\n🏆 ${battleStats.wins} victorias · 💔 ${battleStats.losses} derrotas · ⚖️ ${draws} sin ganador`,
    inventory.achievementsCount || inventory.tickets ? `🏅 ${inventory.achievementsCount} ${inventory.achievementsCount === 1 ? 'logro desbloqueado' : 'logros desbloqueados'} · 🎟️ ${inventory.tickets} ${inventory.tickets === 1 ? 'ticket' : 'tickets'}\n↳ ${cmd('ctuinventario')}` : null,
    profile.starterClaim ? null : '🎁 Tu starter está pendiente.'
  ], profile.starterClaim ? `👉 Tu colección: *${cmd('ctupersonajes')}*` : `👉 *${cmd('ctustarter')}*`);
});
