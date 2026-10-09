import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { card, characterIcon, displayName, rarityIcon, rarityName, roleName } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctustarter', async ({ game, args, identity, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  requireGame(args.length <= 1, 'INVALID_STARTER');
  if (!args.length) {
    const profile = await game.users.getProfile(user.id);
    if (profile.starterClaim) return card('STARTER', ['🎁 Ya reclamaste tu starter.'], `🔎 Ver personaje: *${cmd('ctuficha', profile.starterClaim.unitId)}*`);
    const options = await game.starter.getStarterOptions();
    return card('STARTER', [
      '🎁 Elige tu primer personaje. Solo puedes reclamar uno.',
      ...options.map(o => `${characterIcon(o.characterId)} *${displayName(o.character?.name ?? o.characterId)}*${o.character ? ` · ${roleName(o.character.role)}` : ''}\n${o.available ? `👉 *${cmd('ctustarter', o.choice)}*` : '🔒 No disponible'}`)
    ], `🔎 Comparar stats: ${cmd('ctuficha', 'panda')}, ${cmd('ctuficha', 'mago')} o ${cmd('ctuficha', 'lobo')}`);
  }
  const result = await game.starter.claimStarter({ userId: user.id, choice: args[0] });
  const character = await game.characters.getCharacter(result.unit.characterId);
  return card('STARTER', [
    result.alreadyClaimed ? '🎁 Ya reclamaste tu starter.' : '🎉 ¡Tu primer personaje está listo!',
    `${characterIcon(character.id)} *${displayName(character.name)}*\n${rarityIcon(character.rarity)} ${rarityName(character.rarity)} · Nivel ${result.unit.progress.level}`
  ], result.alreadyClaimed ? `🔎 Ver personaje: *${cmd('ctuficha', result.unit.id)}*` : `🛡️ Preparar equipo:\n👉 *${cmd('ctuequipo', `usar ${result.unit.id}`)}*`);
});
