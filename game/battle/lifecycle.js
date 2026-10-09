import { requireGame } from '../../utils/GameError.js';

export const isOpenBattle = battle => ['pending', 'active'].includes(battle.status);

function increment(stats, field) {
  const value = stats[field] + 1;
  requireGame(Number.isSafeInteger(value), 'NUMERIC_OVERFLOW');
  return { ...stats, [field]: value };
}

export async function settleBattle(repos, battle, now) {
  if (battle.acceptedAt !== null) {
    for (const player of battle.players) {
      const user = await repos.users.get(player.userId);
      const unit = await repos.units.get(player.unit.id);
      requireGame(unit.lock?.referenceId === battle.id, 'DATABASE_CORRUPT');
      let userStats = increment(user.battleStats, 'matches');
      let unitStats = unit.battleStats;
      if (battle.winnerId !== null) {
        const field = battle.winnerId === player.userId ? 'wins' : 'losses';
        userStats = increment(userStats, field);
        unitStats = increment(unitStats, field);
      }
      await repos.users.replace({ ...user, battleStats: userStats, updatedAt: now });
      await repos.units.replace({ ...unit, lock: null, battleStats: unitStats, updatedAt: now });
    }
  }
  await repos.battles.replace(battle);
  return battle;
}

export async function expireBattles(repos, now) {
  const expired = await repos.battles.filter(b => isOpenBattle(b) && Date.parse(b.expiresAt) <= Date.parse(now));
  for (const battle of expired) {
    battle.status = 'expired';
    battle.finishReason = battle.acceptedAt === null ? 'challenge_timeout' : 'inactivity';
    battle.finishedAt = now;
    battle.updatedAt = now;
    battle.turnUserId = null;
    await settleBattle(repos, battle, now);
  }
  return expired.length;
}
