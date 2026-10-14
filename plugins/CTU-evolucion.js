import { defineCommand, contentOperationKey } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { evolutionBonusPercent } from '../game/evolution/rules.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuevolucion', async ({ game, identity, args, context, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  requireGame(args.length >= 1 && args.length <= 2 && (args.length === 1 || args[1].toLowerCase() === 'confirmar'), 'INVALID_ARGUMENTS');
  if (args.length === 2) {
    const result = await game.evolution.evolve({ userId: user.id, unitId: args[0],
      operationKey: contentOperationKey('evolve', context, user.id) });
    const { evolution } = result;
    const bonus = evolutionBonusPercent(evolution.after, evolution.level);
    return card('EVOLUCIÓN', [
      `🔮 ${result.alreadyEvolved ? 'Evolución ya confirmada' : '¡Tu personaje evolucionó!'}\n🎴 ${evolution.unitId}`,
      `✨ Bono al evolucionar: +${bonus}% en estadísticas, redondeado hacia abajo.\n${bonus < 5 ? '🌱 Al llegar al nivel 10 sube a +5% automáticamente.\n' : ''}🧬 Conserva su ID, serial, rareza, rasgos, origen e historial.`
    ], `🔎 ${cmd('ctuficha', evolution.unitId)}`);
  }
  const result = await game.evolution.getOptions({ userId: user.id, unitId: args[0] });
  const stages = result.stages.map(stage => `Nv. ${stage.minimumLevel}: +${stage.bonusPercent}%`).join(' · ');
  return card('EVOLUCIÓN', [
    result.form ? `🔮 *${displayName(result.form.name)}*\n🎴 ${result.unit.id} · Nv. ${result.unit.progress.level}` : '🍃 Este personaje no tiene evolución disponible.',
    `📋 Requisitos: nivel ${result.minimumLevel} · ${result.coins} ChengCoins · 1 sello\n💰 Tienes ${result.balance} · 🔮 ${result.materials.sellos} sellos`,
    result.form ? `✨ ${stages}\n${result.unit.evolution ? 'Bono actual' : 'Bono al cumplir los requisitos'}: +${result.bonusPercent}% · redondeo hacia abajo.${result.stages.length > 1 ? '\n🌱 El bono crece con el nivel, sin otro sello ni pago.' : ''}` : null,
    result.unit.evolution ? '✅ Esta unidad ya evolucionó.' : result.available ? '✨ Lista para evolucionar.' : '🌱 Completa los requisitos y libera la unidad si está reservada.'
  ], result.available ? `✅ ${cmd('ctuevolucion', `${result.unit.id} confirmar`)}` : `🔨 Sello: ${cmd('ctucrafting')}\n🔎 ${cmd('ctuficha', result.unit.id)}`);
});
