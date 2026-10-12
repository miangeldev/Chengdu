import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, displayName, unitTitle } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuequipo', async ({ game, identity, args, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  let team;
  if (!args.length || (args.length === 1 && args[0] === 'ver')) team = await game.teams.getTeam(user.id);
  else {
    const operation = ({ usar: 'use', agregar: 'add', quitar: 'remove', limpiar: 'clear', ordenar: 'order' })[args[0]];
    requireGame(operation, 'INVALID_TEAM');
    if (operation === 'use') {
      requireGame(args.length >= 2 && args.length <= 4, 'INVALID_TEAM');
      team = await game.teams.setTeam({ userId: user.id, unitIds: args.slice(1) });
    } else if (operation === 'order') {
      requireGame(args.length >= 2 && args.length <= 4 && args.slice(1).every(value => /^[1-3]$/.test(value)), 'INVALID_TEAM_ORDER');
      team = await game.teams.updateTeam({ userId: user.id, operation, positions: args.slice(1).map(Number) });
    } else {
      requireGame(args.length === (operation === 'clear' ? 1 : 2), 'INVALID_TEAM');
      team = await game.teams.updateTeam({ userId: user.id, operation, unitId: args[1] });
    }
  }
  const unit = team.units[0];
  const locked = team.units.some(value => value.lock);
  return card('EQUIPO', [
    `🛡️ *${displayName(team.user.name)}* · ${team.units.length}/${team.maxSize} unidades`,
    unit ? team.units.map((value, index) => `${index + 1}️⃣ ${unitTitle(value)} · Nv. ${value.progress.level}${index === 0 ? '\n⚔️ Abre el combate' : '\n🪑 Reserva'}`).join('\n\n') : 'Tu equipo está vacío.',
    unit ? locked ? '🔒 Equipo en combate' : '✅ Listo para combatir' : null
  ], unit ? `👉 *${locked ? cmd('ctucombate') : cmd('ctupelea', '@jugador')}*\n🔎 Stats y ataques: ${cmd('ctuficha')}\n🔀 Orden: ${cmd('ctuequipo', `ordenar ${team.units.map((_, index) => index + 1).reverse().join(' ')}`)}` : `👉 Elige en tu colección: *${cmd('ctupersonajes')}*`);
});
