export const REWARD_VERSION = 1;
export const REWARD_WINDOW_MS = 24 * 60 * 60 * 1000;
export const REWARDED_PAIR_LIMIT = 3;

export function rewardDecision(battle, rewardedBattles = []) {
  if (battle.status !== 'finished') return 'inactivity';
  const attacks = battle.actions.filter(a => a.type === 'attack');
  if (battle.finishReason === 'surrender' && (attacks.length < 4 ||
    !battle.players.every(p => attacks.some(a => a.actorId === p.userId)))) return 'early_surrender';
  const pair = battle.players.map(p => p.userId).sort().join(':');
  const start = Date.parse(battle.finishedAt) - REWARD_WINDOW_MS;
  const count = rewardedBattles.filter(b => b.players.map(p => p.userId).sort().join(':') === pair &&
    Date.parse(b.finishedAt) > start && Date.parse(b.finishedAt) <= Date.parse(battle.finishedAt)).length;
  return count >= REWARDED_PAIR_LIMIT ? 'pair_limit' : 'rewarded';
}

export function rewardAmounts(battle, userId, reason) {
  if (reason !== 'rewarded') return { coins: 0, userXp: 0, unitXp: 0 };
  if (battle.winnerId === null) return { coins: 0, userXp: 20, unitXp: 20 };
  const winner = battle.winnerId === userId;
  return { coins: winner ? 120 : 0, userXp: winner ? 35 : 15, unitXp: winner ? 35 : 15 };
}

export function rewardSummary(reward) {
  return {
    userId: reward.userId, unitId: reward.unitId,
    coins: reward.coins, userXp: reward.userXp, unitXp: reward.unitXp,
    userLevelBefore: reward.userProgressBefore.level, userLevelAfter: reward.userProgressAfter.level,
    unitLevelBefore: reward.unitProgressBefore.level, unitLevelAfter: reward.unitProgressAfter.level
  };
}
