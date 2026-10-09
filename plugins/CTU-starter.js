import { defineCommand } from '../interfaces/whatsapp/command.js';
import { requireGame } from '../utils/GameError.js';
import { card, characterIcon, rarityIcon, rarityName, roleName, section, serialText, statsText } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctustarter', async ({ game, args, identity, cmd }) => {
  const user = await game.users.getUserByIdentity(identity());
  requireGame(args.length <= 1, 'INVALID_STARTER');
  if (!args.length) {
    const profile = await game.users.getProfile(user.id);
    if (profile.starterClaim) return card('🎁 *Ya reclamaste tu starter*', [`Tu primer personaje conserva su identidad única.\n\n🆔 ${profile.starterClaim.unitId}`], `🔎 Ver su ficha:\n${cmd('ctuunidad', profile.starterClaim.unitId)}`);
    const options = await game.starter.getStarterOptions();
    return card('🎁 *Elige tu personaje inicial*', options.map(o => section(
      `${o.number}. ${characterIcon(o.characterId)} *${o.character?.name ?? o.characterId}*`,
      o.character ? `🎯 ${roleName(o.character.role)}\n\n${statsText(o.character.baseStats)}\n\n${o.available ? '👉 Elegir:\n' + cmd('ctustarter', o.choice) : '🔒 No disponible'}` : '🔒 No disponible'
    )), '📌 Puedes reclamar un solo starter.\nElige el estilo que más te guste.');
  }
  const result = await game.starter.claimStarter({ userId: user.id, choice: args[0] });
  const character = await game.characters.getCharacter(result.unit.characterId);
  return card(result.alreadyClaimed ? '🎁 *Ya reclamaste tu starter*' : '🎉 *¡Tu primer personaje está listo!*', [
    section(`${characterIcon(character.id)} *${character.name} #${serialText(result.unit.serial)}*`, `🆔 ${result.unit.id}\n${rarityIcon(character.rarity)} Rareza: ${rarityName(character.rarity)}\n🎯 Rol: ${roleName(character.role)}\n🌱 Nivel: ${result.unit.progress.level}`),
    section('📊 *Estadísticas individuales*', statsText(result.unit.initialStats)),
    result.alreadyClaimed ? 'Este es el starter que ya habías reclamado.' : '✅ Esta unidad ahora te pertenece.\nSu ID y serial se conservan durante toda su historia.'
  ], `🛡️ Preparar tu equipo:\n${cmd('ctuequipo', `usar ${result.unit.id}`)}\n\n🔎 Ver ficha completa:\n${cmd('ctuunidad', result.unit.id)}\n\n🎴 Ver colección:\n${cmd('ctupersonajes')}`);
});
