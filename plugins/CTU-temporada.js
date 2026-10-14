import { competitiveOperationKey, defineCommand } from '../interfaces/whatsapp/command.js';
import { renderSeason, renderSeasonReward } from '../interfaces/whatsapp/competitiveFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctutemporada', async ({ game, identity, args, context, cmd }) => {
  requireGame(args.length <= 2, 'INVALID_ARGUMENTS');
  const claim = args.some(value => value.toLowerCase() === 'reclamar');
  const codes = args.filter(value => value.toLowerCase() !== 'reclamar');
  requireGame(codes.length <= 1 && (!codes.length || /^T[1-9]\d*$/i.test(codes[0])) && (!claim || args.length <= 2 && args.filter(value => value.toLowerCase() === 'reclamar').length === 1), 'INVALID_SEASON');
  requireGame(!claim || codes.length === 1, 'INVALID_SEASON');
  let user = null;
  try { user = await game.users.getUserByIdentity(identity()); }
  catch (error) { if (error.code !== 'USER_NOT_FOUND' || claim) throw error; }
  if (claim) {
    const seasonCode = codes[0].toUpperCase();
    // Resolve the receipt before reading the current calendar, so a transport
    // retry retains its reward even if the host clock is temporarily invalid.
    const result = await game.competitive.claimSeasonReward({ userId: user.id, seasonCode,
      operationKey: competitiveOperationKey('season-reward', context, user.id) });
    return renderSeasonReward(result, seasonCode, cmd);
  }
  return renderSeason(await game.competitive.getSeason({ seasonCode: codes[0] ?? null, userId: user?.id ?? null }), cmd);
});
