import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { card, characterIcon, displayName, section } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuficha', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length <= 1, 'INVALID_ARGUMENTS');
  let result;
  if (args.length) result = await game.units.getCombatDetails({ unitId: args[0] });
  else {
    const user = await game.users.getUserByIdentity(identity());
    result = await game.units.getCombatDetails({
      userId: user.id, chatId: context.chatId.endsWith('@g.us') ? context.chatId : null
    });
  }
  if (!result.units.length) return card('🔎 *Prepara tu ficha de combate*', [
    'Selecciona una unidad para consultar sus estadísticas y ataques.'
  ], `🛡️ ${cmd('ctuequipo', 'usar ID')}\n🎴 ${cmd('ctupersonajes')}\n\nTambién puedes consultar una unidad concreta:\n${cmd('ctuficha', 'ID')}`);

  return card('🔎 *Ficha de combate*', result.units.map(unit => section(
    `${characterIcon(unit.characterId)} *${displayName(unit.characterName)}* · ${displayName(unit.owner.name)}`,
    `🆔 ${unit.id}\n\n❤️ Vida: ${unit.hp}/${unit.stats.hp} HP\n⚔️ Ataque: ${unit.stats.attack}\n🛡️ Defensa: ${unit.stats.defense}\n💨 Velocidad: ${unit.stats.speed}\n\n` +
    unit.attacks.map((attack, i) => `${i === 0 ? '1️⃣' : '2️⃣'} *${displayName(attack.name)}*\nPotencia: ${attack.power} POT · Precisión: ${attack.accuracy}%\nTipo: ${attack.type === 'physical' ? 'Físico' : displayName(attack.type)}`).join('\n\n') +
    (unit.inBattle ? '\n\n📌 Datos del combate activo.' : '')
  )), `💡 Daño: potencia + ataque − defensa (mínimo 1).\nUn ataque fallido consume el turno.\n\n⚔️ Ver combate: ${cmd('ctucombate')}`);
});
