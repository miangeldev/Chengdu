import { createHash } from 'node:crypto';
import { GameError, requireGame } from '../../utils/GameError.js';
import { defineCommand } from './command.js';
import { card } from './format.js';
import { renderBattle } from './battleFormat.js';

function operationKey(kind, context, userId) {
  if (typeof context.messageId !== 'string' || !context.messageId) return null;
  return createHash('sha256').update(JSON.stringify([kind, context.chatId, userId, context.messageId])).digest('hex');
}

export function defineBattleCommand(command, kind) {
  return defineCommand(command, async ({ game, identity, args, context, cmd, battleOptions }) => {
    requireGame(context.chatId.endsWith('@g.us'), 'GROUP_ONLY');
    const user = await game.users.getUserByIdentity(identity());
    const request = { userId: user.id, chatId: context.chatId, operationKey: operationKey(kind, context, user.id) };
    let result;
    if (kind === 'challenge') {
      requireGame(args.length === 1, 'INVALID_OPPONENT');
      let opponent;
      if (Array.isArray(context.mentions) && context.mentions.length === 1) {
        try { opponent = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: context.mentions[0] }); }
        catch (error) { if (error.code === 'USER_NOT_FOUND') throw new GameError('OPPONENT_NOT_REGISTERED'); throw error; }
      } else {
        requireGame(Array.isArray(context.mentions) && context.mentions.length === 0 && args[0].startsWith('USR-'), 'INVALID_OPPONENT');
        opponent = await game.users.getUser(args[0]);
      }
      result = await game.battle.challenge({ ...request, opponentId: opponent.id });
    } else if (kind === 'attack') {
      requireGame(args.length === 1 && ['1', '2'].includes(args[0]), 'INVALID_ATTACK');
      result = await game.battle.attack({ ...request, choice: args[0] });
    } else {
      requireGame(args.length <= 1, 'INVALID_ARGUMENTS');
      request.battleId = args[0] ?? null;
      if (kind === 'accept') result = await game.battle.accept(request);
      if (kind === 'surrender') result = await game.battle.surrender(request);
      if (kind === 'reject' || kind === 'cancel') result = await game.battle.closeChallenge({ ...request, reject: kind === 'reject' });
      if (kind === 'status') {
        const battle = await game.battle.getMyBattle(request);
        if (!battle) return card('⚔️ *Tu arena está libre*', ['Todavía no hay combates tuyos en este grupo.'], `👉 Desafiar a otro jugador:\n${cmd('ctupelea', '@jugador')}`);
        result = { battle };
      }
    }
    return renderBattle(result, cmd, battleOptions);
  });
}
