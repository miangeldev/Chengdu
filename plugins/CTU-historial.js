import { defineCommand, pageArguments } from '../interfaces/whatsapp/command.js';
import { card, dateText, displayName, section } from '../interfaces/whatsapp/format.js';
import { rewardText } from '../interfaces/whatsapp/battleFormat.js';
import { requireGame } from '../utils/GameError.js';

const resultText = (battle, userId) => battle.status === 'expired' ? '⌛ Inactividad' : battle.winnerId === null ? '⚖️ Empate' : battle.winnerId === userId ? '🏆 Victoria' : '💔 Derrota';

export const { command, run, createRun } = defineCommand('ctuhistorial', async ({ game, identity, args, cmd }) => {
  requireGame(args.length <= 1, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  if (args[0]?.startsWith('BTL-')) {
    const battle = await game.battle.getHistoryBattle({ userId: user.id, battleId: args[0] });
    const turns = battle.actions.map(action => {
      const player = battle.players.find(p => p.userId === action.actorId);
      if (action.type === 'surrender') return `🏳️ ${displayName(player.name)} se rindió.`;
      const attack = player.unit.attacks.find(a => a.id === action.attackId);
      return `T${action.turnNumber} · ${displayName(player.name)}: ${displayName(attack.name)}\n${action.hit ? `💥 ${action.damage} de daño · Rival: ${action.afterHp} HP` : '💨 Falló'}`;
    });
    return card('PARTIDA', [
      `${resultText(battle, user.id)} · ${dateText(battle.finishedAt)}\n${battle.players.map(p => `${displayName(p.name)} · ${displayName(p.unit.characterName)} · Niv. ${p.unit.level}`).join('\n')}`,
      section('⚔️ *TURNOS*', turns.join('\n\n') || 'Sin ataques.'),
      rewardText(battle)
    ], `👉 *${cmd('ctuhistorial')}*`);
  }
  const page = await game.battle.getHistory({ userId: user.id, ...pageArguments(args) });
  if (!page.items.length) return card('HISTORIAL', ['📜 Aún no tienes combates terminados.'], `👉 *${cmd('ctupelea', '@jugador')}*`);
  return card('HISTORIAL', page.items.map(battle => {
    const rival = battle.players.find(p => p.userId !== user.id);
    const reward = battle.settlement?.rewards.find(r => r.userId === user.id);
    return `${resultText(battle, user.id)} vs *${displayName(rival.name)}*\n📅 ${dateText(battle.finishedAt)} · ${battle.actions.filter(a => a.type === 'attack').length} turnos` +
      (reward && battle.settlement.reason === 'rewarded' ? `\n🎁 +${reward.coins} ChengCoins · +${reward.userXp} XP` : '') +
      `\n🔎 ${cmd('ctuhistorial', battle.id)}`;
  }), page.nextCursor ? `📄 Siguiente: *${cmd('ctuhistorial', page.nextCursor)}*` : `👉 Tu saldo: *${cmd('ctubalance')}*`);
});
