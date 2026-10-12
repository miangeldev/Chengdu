import { requireGame } from '../../utils/GameError.js';
import { grantXp } from '../progression/rules.js';
import { creditCoinsInTransaction } from '../economy/coinOperations.js';
import { REWARD_VERSION, ADVANCED_REWARD_VERSION, advancedUnitRewards, rewardAmounts, rewardDecision, rewardSummary } from './battlePolicy.js';

export async function rewardBattle(repos, battle, now) {
  if (battle.rewardVersion === 0) return;
  requireGame([REWARD_VERSION, ADVANCED_REWARD_VERSION].includes(battle.rewardVersion) && battle.settlement === null, 'DATABASE_CORRUPT');
  const rewarded = await repos.battles.filter(b => b.id !== battle.id && b.settlement?.reason === 'rewarded');
  const reason = rewardDecision(battle, rewarded);
  const summaries = [];
  for (const player of battle.players) {
    const user = await repos.users.get(player.userId);
    if (battle.rewardVersion === ADVANCED_REWARD_VERSION) {
      const amounts = rewardAmounts(battle, user.id, reason);
      const credited = await creditCoinsInTransaction(repos, user, amounts.coins, now, { type: 'battle_reward', id: `reward:${battle.id}:${user.id}` });
      const unitRewards = [];
      for (const share of advancedUnitRewards(player, amounts.unitXp)) {
        const unit = await repos.units.get(share.unitId);
        const entry = { ...share, progressBefore: unit.progress, progressAfter: grantXp(unit.progress, share.xp, 'unit') };
        unitRewards.push(entry);
        await repos.units.replace({ ...unit, progress: entry.progressAfter, updatedAt: now });
      }
      const reward = {
        id: `reward:${battle.id}:${user.id}`, battleId: battle.id, userId: user.id,
        version: ADVANCED_REWARD_VERSION, reason, ...amounts, unitRewards, createdAt: now,
        balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins,
        userProgressBefore: user.progress, userProgressAfter: grantXp(user.progress, amounts.userXp, 'user')
      };
      await repos.rewards.insert(reward);
      await repos.users.replace({ ...credited, progress: reward.userProgressAfter });
      summaries.push(rewardSummary(reward));
      continue;
    }
    const unit = await repos.units.get(player.unit.id);
    const amounts = rewardAmounts(battle, user.id, reason);
    const credited = await creditCoinsInTransaction(repos, user, amounts.coins, now, { type: 'battle_reward', id: `reward:${battle.id}:${user.id}` });
    const reward = {
      id: `reward:${battle.id}:${user.id}`, battleId: battle.id, userId: user.id, unitId: unit.id,
      version: REWARD_VERSION, reason, ...amounts, createdAt: now,
      balanceBefore: user.economy.coins, balanceAfter: credited.economy.coins,
      userProgressBefore: user.progress, userProgressAfter: grantXp(user.progress, amounts.userXp, 'user'),
      unitProgressBefore: unit.progress, unitProgressAfter: grantXp(unit.progress, amounts.unitXp, 'unit')
    };
    await repos.rewards.insert(reward);
    await repos.users.replace({ ...credited, progress: reward.userProgressAfter });
    await repos.units.replace({ ...unit, progress: reward.unitProgressAfter, updatedAt: now });
    summaries.push(rewardSummary(reward));
  }
  battle.settlement = { version: battle.rewardVersion, reason, createdAt: now, rewards: summaries };
}
