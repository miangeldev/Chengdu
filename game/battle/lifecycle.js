import { settleClanWarBattle } from '../clans/lifecycle.js';
import { requireGame } from '../../utils/GameError.js';
import { rewardBattle } from '../rewards/battleRewards.js';
import { battleUnits } from './advancedEngine.js';
import { settleCompetitiveBattle } from '../competitive/lifecycle.js';

export const isOpenBattle = battle => ['pending', 'active'].includes(battle.status);

function increment(stats, field) {
  const value = stats[field] + 1;
  requireGame(Number.isSafeInteger(value), 'NUMERIC_OVERFLOW');
  return { ...stats, [field]: value };
}

export async function settleBattle(repos, battle, now, { idleUserId = null } = {}) {
  if (battle.acceptedAt !== null) {
    for (const player of battle.players) {
      const user = await repos.users.get(player.userId);
      let userStats = increment(user.battleStats, 'matches');
      if (battle.winnerId !== null) {
        const field = battle.winnerId === player.userId ? 'wins' : 'losses';
        userStats = increment(userStats, field);
      }
      await repos.users.replace({ ...user, battleStats: userStats, updatedAt: now });
      for (const snapshot of battleUnits(player)) {
        const unit = await repos.units.get(snapshot.id);
        requireGame(unit.lock?.type === 'battle' && unit.lock.referenceId === battle.id, 'DATABASE_CORRUPT');
        let unitStats = unit.battleStats;
        if (battle.winnerId !== null && (battle.rulesVersion === 1 || snapshot.participated)) {
          unitStats = increment(unitStats, battle.winnerId === player.userId ? 'wins' : 'losses');
        }
        await repos.units.replace({ ...unit, lock: null, battleStats: unitStats, updatedAt: now });
      }
    }
    await rewardBattle(repos, battle, now);
    if (battle.competitive) await settleCompetitiveBattle(repos, battle, now, { idleUserId });
    await settleClanWarBattle(repos, battle, now);
  }
  await repos.battles.replace(battle);
  return battle;
}

export async function expireBattles(repos, now) {
  const expired = await repos.battles.filter(b => isOpenBattle(b) &&
    (Date.parse(b.expiresAt) <= Date.parse(now) || (b.competitive && Date.parse(b.competitive.endsAt) <= Date.parse(now))));
  for (const battle of expired) {
    const idleUserId = battle.acceptedAt === null ? null : battle.turnUserId;
    battle.status = 'expired';
    battle.finishReason = battle.acceptedAt === null ? 'challenge_timeout' : 'inactivity';
    battle.finishedAt = now;
    battle.updatedAt = now;
    battle.turnUserId = null;
    await settleBattle(repos, battle, now, { idleUserId });
  }
  return expired.length;
}
