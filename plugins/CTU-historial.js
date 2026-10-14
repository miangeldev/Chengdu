import { defineCommand, pageArguments, pageNavigation } from '../interfaces/whatsapp/command.js';
import { card, dateText, displayName, section } from '../interfaces/whatsapp/format.js';
import { actionText, eventText, rewardText } from '../interfaces/whatsapp/battleFormat.js';
import { competitiveBattleResult, seasonEndedBattle } from '../interfaces/whatsapp/competitiveFormat.js';
import { requireGame } from '../utils/GameError.js';

const resultText = (battle, userId) => seasonEndedBattle(battle) ? '🏁 Cierre de temporada' : battle.status === 'expired' ? '⌛ Inactividad' : battle.winnerId === null ? '⚖️ Empate' : battle.winnerId === userId ? '🏆 Victoria' : '💔 Derrota';

export const { command, run, createRun } = defineCommand('ctuhistorial', async ({ game, identity, args, prefix, cmd }) => {
  requireGame(args.length <= 1, 'INVALID_ARGUMENTS');
  const user = await game.users.getUserByIdentity(identity());
  if (args[0]?.startsWith('BTL-')) {
    const battle = await game.battle.getHistoryBattle({ userId: user.id, battleId: args[0] });
    const turns = battle.actions.map(action => {
      if (battle.rulesVersion === 2) return `T${action.turnNumber} · ${actionText(battle, action)}`;
      const player = battle.players.find(p => p.userId === action.actorId);
      if (action.type === 'surrender') return `🏳️ ${displayName(player.name)} se rindió.`;
      const attack = player.unit.attacks.find(a => a.id === action.attackId);
      return `T${action.turnNumber} · ${displayName(player.name)}: ${displayName(attack.name)}\n${action.hit ? `💥 ${action.damage} de daño · Rival: ${action.afterHp} HP` : '💨 Falló'}`;
    });
    return card('PARTIDA', [
      `${resultText(battle, user.id)} · ${battle.format ?? '1v1'}${battle.rulesVersion === 1 ? ' clásico' : ''}${battle.competitive ? ` · 🏅 Ranked ${battle.competitive.seasonCode}` : ''} · ${dateText(battle.finishedAt)}\n${battle.players.map(p => `${displayName(p.name)} · ${(p.units ?? [p.unit]).map(unit => `${displayName(unit.characterName)} · Niv. ${unit.level}`).join(' / ')}`).join('\n')}`,
      battle.rulesVersion === 2 ? section('✨ *ENTRADA*', (battle.openingEvents ?? []).map(event => eventText(battle, event)).filter(Boolean).join('\n')) : null,
      section('⚔️ *TURNOS*', turns.join('\n\n') || 'Sin ataques.'),
      rewardText(battle),
      competitiveBattleResult(battle)
    ], `👉 *${cmd('ctuhistorial')}*`);
  }
  const page = await game.battle.getHistory({ userId: user.id, ...pageArguments(args) });
  if (!page.items.length) return card('HISTORIAL', ['📜 Aún no tienes combates terminados.'], `👉 *${cmd('ctupelea', '@jugador')}*`);
  return card('HISTORIAL', page.items.map(battle => {
    const rival = battle.players.find(p => p.userId !== user.id);
    const reward = battle.settlement?.rewards.find(r => r.userId === user.id);
    const ranked = battle.competitive?.settlement?.players.find(player => player.userId === user.id);
    return `${resultText(battle, user.id)} vs *${displayName(rival.name)}*\n📅 ${dateText(battle.finishedAt)} · ${battle.format ?? '1v1'}${battle.rulesVersion === 1 ? ' clásico' : ''} · ${battle.actions.filter(a => battle.rulesVersion === 2 ? a.commandType !== 'surrender' : a.type === 'attack').length} turnos` +
      (reward && battle.settlement.reason === 'rewarded' ? `\n🎁 +${reward.coins} ChengCoins · +${reward.userXp} XP` : '') +
      (battle.competitive ? `\n🏅 Ranked ${battle.competitive.seasonCode}${ranked ? ` · ${ranked.ratingAfter} Elo (${ranked.delta > 0 ? '+' : ''}${ranked.delta})` : ''}` : '') +
      `\n🔎 ${cmd('ctuhistorial', battle.id)}`;
  }), `${pageNavigation(page, 'ctuhistorial', prefix)}\n👉 Tu saldo: *${cmd('ctubalance')}*`);
});
