import { contentOperationKey, defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { contentDate, prizeText, renderContentReward } from '../interfaces/whatsapp/contentFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctumisiones', async ({ game, identity, args, context, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  if (args[0]?.toLowerCase() === 'reclamar') {
    requireGame(args.length === 2 && ['1', '2', '3'].includes(args[1]), 'INVALID_MISSION');
    const result = await game.content.claimMission({ userId: user.id, code: args[1], operationKey: contentOperationKey('mission', context, user.id) });
    return renderContentReward('MISIÓN | PREMIO', result, cmd, `📋 Tus misiones: *${cmd('ctumisiones')}*`);
  }
  requireGame(args.length === 0, 'INVALID_ARGUMENTS');
  const result = await game.content.getMissions(user.id);
  return card('MISIONES DIARIAS', result.missions.map(mission => [
    `${mission.claimed ? '✅' : mission.complete ? '🎁' : '📋'} *${mission.code}. ${displayName(mission.name)}*`,
    displayName(mission.description),
    `📊 ${Math.min(mission.current, mission.target)}/${mission.target} · ${mission.claimed ? 'Premio reclamado' : mission.complete ? '¡Completada!' : 'En progreso'}`,
    prizeText(mission.reward),
    mission.complete && !mission.claimed ? `👉 *${cmd('ctumisiones', `reclamar ${mission.code}`)}*` : null
  ].filter(Boolean).join('\n')), `🔄 Cambian: ${contentDate(result.resetsAt)}\n📍 Hora de Ciudad de México. Sólo cuentan partidas con recompensa.`);
});
