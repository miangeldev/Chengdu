import { defineCommand } from '../interfaces/whatsapp/command.js';
import { renderBoss } from '../interfaces/whatsapp/contentFormat.js';
import { requireGame } from '../utils/GameError.js';

export const { command, run, createRun } = defineCommand('ctuboss', async ({ game, identity, args, cmd }) => {
  requireGame(args.length <= 1, 'INVALID_ARGUMENTS');
  let user = null;
  try { user = await game.users.getUserByIdentity(identity()); }
  catch (error) { if (error.code !== 'USER_NOT_FOUND') throw error; }
  const boss = await game.encounters.getBoss({ bossId: args[0] ?? 'niebla', userId: user?.id ?? null });
  return renderBoss(boss, cmd, { userId: user?.id ?? null });
});
