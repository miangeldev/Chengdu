import { contentOperationKey, defineCommand, pageArguments, pageNavigation } from '../interfaces/whatsapp/command.js';
import { card, displayName } from '../interfaces/whatsapp/format.js';
import { prizeText, renderContentReward } from '../interfaces/whatsapp/contentFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctulogros', async ({ game, identity, args, context, cmd, prefix }) => {
  const user = await game.users.getUserByIdentity(identity());
  if (args[0]?.toLowerCase() === 'reclamar') {
    requireGame(args.length === 2 && /^L[1-9]\d*$/i.test(args[1]), 'INVALID_ACHIEVEMENT');
    const result = await game.content.claimAchievement({ userId: user.id, code: args[1], operationKey: contentOperationKey('achievement', context, user.id) });
    return renderContentReward('LOGRO | PREMIO', result, cmd, `🏅 Tus logros: *${cmd('ctulogros')}*`);
  }
  const page = await game.content.getAchievements(user.id, pageArguments(args));
  return card('LOGROS', page.items.map(achievement => [
    `${achievement.claimed ? '✅' : achievement.unlocked ? '🏅' : '🔒'} *${achievement.code} · ${displayName(achievement.name)}*`,
    displayName(achievement.description),
    `📊 ${Math.min(achievement.current, achievement.target)}/${achievement.target} · ${achievement.claimed ? 'Premio reclamado' : achievement.unlocked ? 'Desbloqueado' : 'En progreso'}`,
    achievement.title ? `🎖️ Título: ${displayName(achievement.title)}` : null,
    achievement.badge ? `🏵️ ${displayName(achievement.badge)}` : null,
    prizeText(achievement.reward),
    achievement.unlocked && !achievement.claimed ? `👉 *${cmd('ctulogros', `reclamar ${achievement.code}`)}*` : null
  ].filter(Boolean).join('\n')), `${pageNavigation(page, 'ctulogros', prefix)}\n🎟️ Tu inventario: ${cmd('ctuinventario')}`);
});
