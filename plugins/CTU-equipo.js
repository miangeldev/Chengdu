import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName, section, statsText, unitTitle } from '../interfaces/whatsapp/format.js';
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
  return card(`🛡️ *Equipo de ${displayName(team.user.name)}*`, team.units.length ? [
    section('🥇 *Unidad activa*', `${unitTitle(team.units[0])}\n\n🆔 ${team.units[0].id}\n\n${statsText(team.units[0].initialStats)}\n\n${team.units[0].lock ? '⚔️ En combate; no puedes cambiarla todavía.' : '✅ Lista para combatir.'}`)
  ] : ['Tu equipo está vacío.\n\n🎴 Consulta tus unidades:\n' + cmd('ctupersonajes') + '\n\n👉 Seleccionar una unidad:\n' + cmd('ctuequipo', 'usar ID')], team.units.length ? `⚔️ Desafiar en un grupo:\n${cmd('ctupelea', '@jugador')}\n\nCambiar unidad:\n${cmd('ctuequipo', 'usar ID')}` : '📌 Los combates actuales utilizan una unidad por jugador.');
});
