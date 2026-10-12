import { contentOperationKey, defineCommand, groupContext } from '../interfaces/whatsapp/command.js';
import { card, characterIcon, displayName, rarityIcon, rarityName } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctucapturar', async ({ game, identity, args, context, cmd }) => {
  groupContext(context);
  requireGame(args.length <= 1 && (args.length === 0 || /^S[1-9]\d*$/i.test(args[0])), 'INVALID_ENCOUNTER');
  const user = await game.users.getUserByIdentity(identity());
  const result = await game.encounters.capture({ userId: user.id, chatId: context.chatId, code: args[0] ?? null,
    operationKey: contentOperationKey('spawn_capture', context, user.id) });
  const snapshot = result.spawn.snapshot;
  return card('CAPTURA', [
    result.alreadyCaptured ? '✅ Este mensaje ya confirmó la captura. No se gastó otro ticket.' : `🎉 *¡${displayName(user.name)} capturó un personaje!*`,
    `${characterIcon(snapshot.characterId)} *${displayName(snapshot.characterName)}*\n${rarityIcon(snapshot.rarity)} ${rarityName(snapshot.rarity)}${snapshot.campaignId ? ' · 🏮 Exclusivo de evento' : ''}`,
    `🎟️ ${result.reward.ticketCost} ticket gastado\n🎟️ Tickets ${result.alreadyCaptured ? 'tras esa captura' : 'disponibles'}: *${result.reward.ticketsAfter}*`,
    `🎴 Unidad: *${result.unit.id}*`
  ], `👉 Tu colección: *${cmd('ctupersonajes')}*\n🔎 Ficha: ${cmd('ctuunidad', result.unit.id)}`);
});
