import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { STARTERS } from '../game/characters/catalog.js';
import { card, characterIcon, displayName, rarityIcon, rarityName, roleName, section } from '../interfaces/whatsapp/format.js';
import { traitName, variantName } from '../game/units/collectibles.js';

const traitDetail = trait => `${displayName(traitName(trait))}${({ robust: ' (+3% HP, redondeado hacia abajo)', aggressive: ' (+1 ataque)', resolute: ' (+1 defensa)' })[trait] ?? ''}`;
const elementName = value => ({ neutral: '⚪ Neutral', fire: '🔥 Fuego', water: '💧 Agua', nature: '🌿 Naturaleza', light: '☀️ Luz', dark: '🌙 Oscuridad' })[value] ?? displayName(value);
const effectName = value => ({ poison: '☠️ Veneno', burn: '🔥 Quemadura', stun: '❄️ Aturdimiento', shield: '🛡️ Escudo', regeneration: '💚 Regeneración', attack_up: '⚔️ Ataque aumentado', defense_down: '🛡️ Defensa reducida' })[value] ?? displayName(value);
function effectDetail(effect) {
  const value = effect.type === 'stun' ? '' : effect.type === 'shield' ? ` ${effect.potency} puntos` : ` ${effect.potency}%`;
  return `${effectName(effect.type)}${value} · ${effect.duration} ${effect.duration === 1 ? 'turno propio' : 'turnos propios'}${effect.target === 'enemy' ? ' del rival' : ''}`;
}

export const { command, run, createRun } = defineCommand('ctuficha', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length <= 1, 'INVALID_ARGUMENTS');
  let result;
  if (args.length) {
    const query = args[0].toLowerCase();
    const starter = STARTERS.find(s => [s.choice, s.number, s.characterId].includes(query));
    if (starter || query.includes('_')) {
      const { character, advancedAttacks: attacks, combat } = await game.characters.getCharacterDetails(starter?.characterId ?? query);
      result = { units: [{
        id: character.id, characterId: character.id, characterName: character.name,
        stats: character.baseStats, hp: character.baseStats.hp, attacks, template: character,
        element: combat.element, ability: combat.ability, advanced: true
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
    (unit.advanced ? `${elementName(unit.element)}\n${unit.ability ? `✨ *${displayName(unit.ability.name)}*\n${displayName(unit.ability.description)}${unit.abilityUsed ? '\n📌 Pasiva ya activada en este combate.' : ''}\n` : ''}\n` : '') +
    unit.attacks.map((attack, i) => `${i === 0 ? '1️⃣' : '2️⃣'} *${displayName(attack.name)}* · ${attack.type === 'physical' ? 'Físico' : attack.type === 'magic' ? 'Mágico' : displayName(attack.type)}\nPotencia: ${attack.power} POT · Precisión: ${attack.accuracy}%` +
      (unit.advanced ? `\n${elementName(attack.element)} · ${attack.cooldown ? `Recarga: ${attack.cooldown} turnos propios` : 'Sin recarga'}${unit.cooldowns?.[attack.id] ? ` · ⏳ Faltan ${unit.cooldowns[attack.id]}T` : ''}${attack.effects?.length ? `\n${attack.effects.map(effectDetail).join('\n')}` : ''}` : '')).join('\n\n') +
    (unit.effects?.length ? `\n\n📍 *Efectos activos*\n${unit.effects.map(effect => `${effectName(effect.type)} · ${effect.remaining}T${effect.type === 'shield' ? ` · ${effect.potency} puntos` : ''}`).join('\n')}` : '') +
    (unit.inBattle ? `\n📌 Datos del combate activo.${unit.reserve ? '\n🪑 Unidad en reserva.' : ''}` : '')
  )), result.units.some(unit => unit.advanced) ? `💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.\n🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego\n☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.\nFallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.` : `💡 Daño: potencia + ataque − defensa (mín. 1).\nFallar consume el turno.`);
});
