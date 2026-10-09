import { createHash } from 'node:crypto';
import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, characterIcon, displayName, rarityIcon, rarityName } from '../interfaces/whatsapp/format.js';
import { traitName, variantName } from '../game/units/collectibles.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuabrir', async ({ game, args, identity, context, cmd }) => {
  requireGame(args.length === 1, 'INVALID_ARGUMENTS');
  requireGame(typeof context.messageId === 'string' && context.messageId.trim().length > 0, 'PACK_MESSAGE_ID_REQUIRED');
  const user = await game.users.getUserByIdentity(identity());
  const packId = args[0].toLowerCase().normalize('NFD').replace(/\p{Diacritic}/gu, '');
  const operationKey = createHash('sha256').update(JSON.stringify(['pack', context.chatId, user.id, context.messageId])).digest('hex');
  const { opening, unit, alreadyOpened } = await game.packs.openPack({ userId: user.id, packId, operationKey });
  const result = opening.result;
  const traits = result.traits ?? [];
  return card('SOBRE ABIERTO', [
    alreadyOpened ? '↩️ Este mensaje ya abrió un sobre. Aquí está su resultado original.' : `🎁 *${displayName(opening.packSnapshot.name)}*`,
    `${characterIcon(result.characterId)} *${displayName(result.characterName)}*\n${rarityIcon(result.rarity)} ${rarityName(result.rarity)} · ${displayName(variantName(result.variant))}`,
    `🧬 ${traits.length ? traits.map(traitName).map(displayName).join(' · ') : 'Sin rasgos'}`,
    `💰 ${opening.price} ChengCoins${alreadyOpened ? ' pagados en la apertura original' : ' gastados'}\n${alreadyOpened ? 'Saldo tras esa apertura' : 'Saldo restante'}: *${opening.balanceAfter} ChengCoins*`
  ], `👉 Stats y ataques: *${cmd('ctuficha', unit.id)}*\n🛡️ Seleccionar: ${cmd('ctuequipo', `usar ${unit.id}`)}`);
});
