import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { STARTERS } from '../game/characters/catalog.js';
import { card, characterIcon, displayName, rarityIcon, rarityName, roleName, section } from '../interfaces/whatsapp/format.js';
import { traitName, variantName } from '../game/units/collectibles.js';

const traitDetail = trait => `${displayName(traitName(trait))}${({ robust: ' (+3% HP, redondeado hacia abajo)', aggressive: ' (+1 ataque)', resolute: ' (+1 defensa)' })[trait] ?? ''}`;

export const { command, run, createRun } = defineCommand('ctuficha', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length <= 1, 'INVALID_ARGUMENTS');
  let result;
  if (args.length) {
    const query = args[0].toLowerCase();
    const starter = STARTERS.find(s => [s.choice, s.number, s.characterId].includes(query));
    if (starter || query.includes('_')) {
      const { character, attacks } = await game.characters.getCharacterDetails(starter?.characterId ?? query);
      result = { units: [{
        id: character.id, characterId: character.id, characterName: character.name,
        stats: character.baseStats, hp: character.baseStats.hp, attacks, template: character
      }] };
    } else result = await game.units.getCombatDetails({ unitId: args[0] });
  }
  else {
    const user = await game.users.getUserByIdentity(identity());
    result = await game.units.getCombatDetails({
      userId: user.id, chatId: context.chatId.endsWith('@g.us') ? context.chatId : null
    });
  }
  if (!result.units.length) return card('FICHA', [
    '🛡️ Selecciona una unidad para consultar sus ataques.'
  ], `👉 *${cmd('ctupersonajes')}*\n🔎 Comparar personaje: ${cmd('ctuficha', 'panda')}`);

  return card('FICHA', result.units.map(unit => section(
    `${characterIcon(unit.characterId)} *${displayName(unit.characterName)}*${unit.owner ? ` · ${displayName(unit.owner.name)}` : ''}`,
    `🆔 ${unit.id}\n${unit.level ? `🌱 Nivel ${unit.level}\n` : ''}` +
    (!unit.template && (unit.traits?.length || (unit.variant && unit.variant !== 'normal')) ? `${unit.variant && unit.variant !== 'normal' ? `✨ ${displayName(variantName(unit.variant))}\n` : ''}${unit.traits?.length ? `🧬 ${unit.traits.map(unit.traitVersion === 1 ? traitDetail : trait => displayName(traitName(trait))).join(' · ')}\n` : ''}` : '') +
    (unit.template ? `${rarityIcon(unit.template.rarity)} ${rarityName(unit.template.rarity)} · ${roleName(unit.template.role)}\n📦 Emisión: ${unit.template.supply.type === 'limited' ? `${unit.template.supply.max} unidades como máximo` : 'Ilimitada'}${!unit.template.obtainable || unit.template.supply.grandfatheredIssued !== undefined ? '\n🔒 Emisión cerrada' : ''}\n📚 Estadísticas base\n` : '') +
    `❤️ Vida: ${unit.hp}/${unit.stats.hp} HP\n⚔️ Ataque: ${unit.stats.attack} · 🛡️ Defensa: ${unit.stats.defense} · 💨 Velocidad: ${unit.stats.speed}\n\n` +
    unit.attacks.map((attack, i) => `${i === 0 ? '1️⃣' : '2️⃣'} *${displayName(attack.name)}* · ${attack.type === 'physical' ? 'Físico' : displayName(attack.type)}\nPotencia: ${attack.power} POT · Precisión: ${attack.accuracy}%`).join('\n\n') +
    (unit.inBattle ? '\n📌 Datos del combate activo.' : '')
  )), `💡 Daño: potencia + ataque − defensa (mín. 1).\nFallar consume el turno.`);
});
