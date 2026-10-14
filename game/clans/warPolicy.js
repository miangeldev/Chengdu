import { requireGame } from '../../utils/GameError.js';
import { CLAN_POLICY, membership, openWar, plus, stamp, roster, prize } from './policy.js';
const pair = ids => [...ids].sort().join(':');
export function qualifyingBattle(war, battle, rewards) {
  return battle?.rulesVersion === 2 && battle.clanWar?.warId === war.id && battle.clanWar.version === 1 &&
    battle.status === 'finished' && battle.winnerId !== null && stamp(battle.createdAt) >= stamp(war.acceptedAt) &&
    stamp(battle.finishedAt) < stamp(war.expiresAt) && battle.players.length === 2 &&
    battle.players.every((p,i) => war.rosters.some(row => row.clanId === battle.clanWar.clanIds[i] && row.userIds.includes(p.userId))) &&
    new Set(battle.clanWar.clanIds).size === 2 && battle.clanWar.clanIds.every(id => war.clanIds.includes(id)) &&
    rewards.some(r => r.battleId === battle.id && r.userId === battle.winnerId && r.reason === 'rewarded');
}
export function reduceWar(before, action, context) {
  const { kind, userId, request:r, createdAt:now } = action; stamp(now);
  const admin = clan => requireGame(clan?.status === 'active' && clan.members.some(m => m.userId === userId && ['leader','officer'].includes(m.role)), 'CLAN_PERMISSION_DENIED');
  if (kind === 'create') {
    const mine = membership(context.clans,userId), target = context.clans.find(c => c.id === r.opponentClanId && c.status === 'active'); admin(mine);
    requireGame(target && target.id !== mine.id, 'CLAN_NOT_FOUND');
    requireGame(mine.members.length >= CLAN_POLICY.rosterSize && target.members.length >= CLAN_POLICY.rosterSize, 'CLAN_WAR_MEMBERS_REQUIRED');
    requireGame(!context.wars.some(w => openWar(w) && w.clanIds.some(id => [mine.id,target.id].includes(id))), 'CLAN_WAR_ALREADY_OPEN');
    requireGame(!context.wars.some(w => pair(w.clanIds) === pair([mine.id,target.id]) && stamp(now) < stamp(w.createdAt) + CLAN_POLICY.pairCooldownMs), 'CLAN_WAR_PAIR_COOLDOWN');
    return { id:action.warId,policyVersion:1,clanIds:[mine.id,target.id],status:'pending',createdAt:now,updatedAt:now,
      expiresAt:plus(now,CLAN_POLICY.pendingMs),acceptedAt:null,closedAt:null,rosters:[],scores:[0,0],battleIds:[],winnerClanId:null,claims:[] };
  }
  requireGame(before && stamp(now) >= stamp(before.updatedAt),'CLAN_WAR_NOT_FOUND'); const war = structuredClone(before);
  const side = war.clanIds.findIndex(id => context.clans.find(c => c.id === id)?.members.some(m => m.userId === userId));
  if (kind === 'accept' || kind === 'reject' || kind === 'cancel') {
    requireGame(war.status === 'pending' && stamp(now) < stamp(war.expiresAt), 'CLAN_WAR_NOT_PENDING');
    requireGame(side === (kind === 'cancel' ? 0 : 1), 'CLAN_PERMISSION_DENIED'); admin(context.clans.find(c => c.id === war.clanIds[side]));
    if (kind === 'accept') {
      const clans = war.clanIds.map(id => context.clans.find(c => c.id === id));
      requireGame(clans.every(c => c.status === 'active' && c.members.length >= CLAN_POLICY.rosterSize && c.treasury >= CLAN_POLICY.warEntry), 'CLAN_TREASURY_INSUFFICIENT');
      war.status='active';war.acceptedAt=now;war.expiresAt=plus(now,CLAN_POLICY.warMs);war.rosters=clans.map(c => ({clanId:c.id,userIds:roster(c)}));
    } else { war.status=kind === 'reject' ? 'rejected' : 'cancelled';war.closedAt=now; }
  } else if (kind === 'battle') {
    requireGame(userId === null && war.status === 'active' && stamp(now) < stamp(war.expiresAt), 'CLAN_WAR_NOT_ACTIVE');
    const battle = context.battles.find(b => b.id === r.battleId);
    requireGame(qualifyingBattle(war,battle,context.rewards) && battle.finishedAt === now && !war.battleIds.includes(battle.id), 'CLAN_WAR_BATTLE_INVALID');
    requireGame(!war.battleIds.some(id => pair(context.battles.find(b => b.id === id).players.map(p => p.userId)) === pair(battle.players.map(p => p.userId))), 'CLAN_WAR_PAIR_ALREADY_COUNTED');
    war.battleIds.push(battle.id); const winnerIndex = battle.players.findIndex(p => p.userId === battle.winnerId);
    war.scores[war.clanIds.indexOf(battle.clanWar.clanIds[winnerIndex])] += 1;
    if (war.scores.some(score => score >= CLAN_POLICY.targetWins)) { war.status='finished';war.closedAt=now;war.winnerClanId=war.clanIds[war.scores[0] > war.scores[1] ? 0 : 1]; }
  } else if (kind === 'expire') {
    requireGame(userId === null && openWar(war) && stamp(now) >= stamp(war.expiresAt), 'CLAN_WAR_NOT_EXPIRED');
    war.status=war.acceptedAt ? 'finished' : 'expired';war.closedAt=now;
    if (war.acceptedAt && war.scores[0] !== war.scores[1]) war.winnerClanId=war.clanIds[war.scores[0] > war.scores[1] ? 0 : 1];
  } else if (kind === 'claim') {
    requireGame(war.status === 'finished' && !war.claims.some(c => c.userId === userId),'CLAN_WAR_REWARD_UNAVAILABLE');
    const row = war.rosters.find(row => row.userIds.includes(userId));
    requireGame(row && war.battleIds.some(id => context.battles.find(b => b.id === id)?.players.some(p => p.userId === userId)), 'CLAN_WAR_REWARD_UNAVAILABLE');
    war.claims.push({userId,coins:prize(war,row.clanId,true),actionId:action.id,createdAt:now});
  } else requireGame(false,'INVALID_CLAN_WAR_ACTION');
  war.updatedAt=now;return war;
}
