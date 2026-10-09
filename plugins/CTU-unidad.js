import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { card, characterIcon, dateText, displayName, rarityIcon, rarityName, roleName, serialText } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuunidad', async ({ game, args, cmd }) => {
  requireGame(args.length === 1, 'UNIT_NOT_FOUND');
  const unit = await game.units.getUnit(args[0]);
  const origin = unit.origin.type === 'starter' ? 'Personaje inicial' : unit.origin.type;
  return card('UNIDAD', [
    `${characterIcon(unit.characterId)} *${displayName(unit.character.name)} #${serialText(unit.serial)}*\n🆔 ${unit.id}\n${rarityIcon(unit.character.rarity)} ${rarityName(unit.character.rarity)} · ${roleName(unit.character.role)} · ${unit.variant === 'normal' ? 'Normal' : displayName(unit.variant)}`,
    `👤 Propietario: ${displayName(unit.owner.name)}\n🪪 ${unit.owner.id}\n${unit.lock ? '🔒 En combate' : '✅ Disponible'}`,
    `🌱 Nivel ${unit.progress.level} · ✨ ${unit.progress.xp} XP\n🏆 ${unit.battleStats.wins} victorias · 💔 ${unit.battleStats.losses} derrotas`,
    `📜 ${displayName(origin)} · ${dateText(unit.createdAt)}`
  ], `🔎 Stats y ataques: *${cmd('ctuficha', unit.id)}*`);
});
