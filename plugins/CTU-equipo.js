import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName, unitTitle } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuequipo', async ({ game, identity, args, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  let team;
  if (!args.length || (args.length === 1 && args[0] === 'ver')) team = await game.teams.getTeam(user.id);
  else {
    const operation = ({ usar: 'use', agregar: 'add', quitar: 'remove', limpiar: 'clear' })[args[0]];
    requireGame(operation && args.length === (operation === 'clear' ? 1 : 2), 'INVALID_TEAM');
    team = await game.teams.updateTeam({ userId: user.id, operation, unitId: args[1] });
  }
  const unit = team.units[0];
  return card('EQUIPO', [
    `🛡️ *${displayName(team.user.name)}*`,
    unit ? `${unitTitle(unit)} · Nv. ${unit.progress.level}\n${unit.lock ? '🔒 En combate' : '✅ Listo para combatir'}` : 'Tu equipo está vacío.'
  ], unit ? `👉 *${unit.lock ? cmd('ctucombate') : cmd('ctupelea', '@jugador')}*\n🔎 Stats y ataques: ${cmd('ctuficha')}` : `👉 Elige en tu colección: *${cmd('ctupersonajes')}*`);
});
