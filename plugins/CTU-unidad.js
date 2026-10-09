import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { card, characterIcon, dateText, displayName, progressText, rarityIcon, rarityName, roleName, serialText } from '../interfaces/whatsapp/format.js';
import { traitName, variantName } from '../game/units/collectibles.js';

export const { command, run, createRun } = defineCommand('ctuunidad', async ({ game, args, cmd }) => {
  requireGame(args.length === 1, 'UNIT_NOT_FOUND');
  const unit = await game.units.getUnit(args[0]);
  const origin = unit.origin.type === 'starter' ? 'Personaje inicial' : unit.origin.type === 'pack' ? `Sobre: ${unit.pack?.name ?? 'Apertura de sobre'}` : unit.origin.type;
  return card('UNIDAD', [
    `${characterIcon(unit.characterId)} *${displayName(unit.character.name)} #${serialText(unit.serial)}*\n🆔 ${unit.id}\n${rarityIcon(unit.character.rarity)} ${rarityName(unit.character.rarity)} · ${roleName(unit.character.role)} · ${displayName(variantName(unit.variant))}`,
    `👤 Propietario: ${displayName(unit.owner.name)}\n🪪 ${unit.owner.id}\n${unit.lock ? '🔒 En combate' : '✅ Disponible'}`,
    `🌱 ${progressText(unit.progress, 'unit')}\n🏆 ${unit.battleStats.wins} victorias · 💔 ${unit.battleStats.losses} derrotas`,
    `🧬 ${unit.traits?.length ? unit.traits.map(traitName).map(displayName).join(' · ') : 'Sin rasgos'}`,
    `📜 ${displayName(origin)} · ${dateText(unit.createdAt)}`
  ], `🔎 Stats y ataques: *${cmd('ctuficha', unit.id)}*`);
});
