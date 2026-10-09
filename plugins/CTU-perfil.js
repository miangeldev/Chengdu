import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, dateText, displayName, section } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuperfil', async ({ game, identity, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  const profile = await game.users.getProfile(user.id);
  return card(`👤 *Perfil de ${displayName(profile.user.name)}*`, [
    section('🪪 *Identidad*', `🆔 ${profile.user.id}\n📅 Registro: ${dateText(profile.user.createdAt)}`),
    section('🌱 *Progreso y colección*', `Nivel: ${profile.user.progress.level}\n✨ XP: ${profile.user.progress.xp}\n💰 ChengCoins: ${profile.user.economy.coins}\n🎴 Unidades: ${profile.unitCount}`),
    section('⚔️ *Historial de combate*', `🏆 Victorias: ${profile.user.battleStats.wins}\n💔 Derrotas: ${profile.user.battleStats.losses}\n⚖️ Sin ganador: ${profile.user.battleStats.matches - profile.user.battleStats.wins - profile.user.battleStats.losses}\n🎮 Combates completados: ${profile.user.battleStats.matches}`),
    section('🎁 *Personaje inicial*', profile.starterClaim ? `✅ Starter reclamado\n${profile.starterClaim.unitId}` : `⏳ Aún no elegiste tu starter.\n${cmd('ctustarter')}`)
  ], `👉 Ver tu colección:\n${cmd('ctupersonajes')}\n\n📖 Ver comandos:\n${cmd('ctuayuda')}`);
});
