import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { card, characterIcon, dateText, displayName, rarityIcon, rarityName, roleName, section, serialText, statsText } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuunidad', async ({ game, args, cmd }) => {
  requireGame(args.length === 1, 'UNIT_NOT_FOUND');
  const unit = await game.units.getUnit(args[0]);
  const origin = unit.origin.type === 'starter' ? 'Personaje inicial' : unit.origin.type;
  return card('🔎 *Ficha de unidad*', [
    section(`${characterIcon(unit.characterId)} *${displayName(unit.character.name)} #${serialText(unit.serial)}*`, `🆔 ${unit.id}\n${rarityIcon(unit.character.rarity)} Rareza: ${rarityName(unit.character.rarity)}\n🎯 Rol: ${roleName(unit.character.role)}\n✨ Variante: ${unit.variant === 'normal' ? 'Normal' : unit.variant}`),
    section('👤 *Propiedad*', `Propietario: ${displayName(unit.owner.name)}\n🪪 ID de jugador:\n${unit.owner.id}\n\n${unit.lock ? '⚔️ Estado: En combate' : '✅ Estado: Disponible'}`),
    section('📊 *Estadísticas individuales*', `${statsText(unit.initialStats)}\n\n🌱 Nivel: ${unit.progress.level}\n✨ XP: ${unit.progress.xp}\n🏆 Victorias: ${unit.battleStats.wins}\n💔 Derrotas: ${unit.battleStats.losses}`),
    section('📜 *Procedencia*', `🎁 Origen: ${origin}\n📅 Creación: ${dateText(unit.createdAt)}`)
  ], `🎴 Ver tu colección:\n${cmd('ctupersonajes')}`);
});
