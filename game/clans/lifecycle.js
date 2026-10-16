import { requireGame } from '../../utils/GameError.js';
import { randomUUID } from 'node:crypto';
import { reduceClan, openWar, stamp } from './policy.js';
import { reduceWar, qualifyingBattle } from './warPolicy.js';
import { creditCoinsInTransaction, debitCoinsInTransaction } from '../economy/coinOperations.js';
export async function clanContext(repos) {
  return { clans:await repos.clans.all(), wars:await repos.clanWars.all(), actions:await repos.clanActions.all(), users:new Set((await repos.users.all()).map(u => u.id)) };
}
export async function appendClanAction(repos, {clanId,userId,kind,request={},operationKey,now}) {
  const before = await repos.clans.get(clanId), context = await clanContext(repos);
  const action = {id:`CLA-${randomUUID()}`,clanId,userId,kind,request,operationKey,createdAt:now,before:before ?? null,after:null,movements:[],warCursor:await repos.clanWarActions.count()};
  action.after=reduceClan(before,action,context);
  const amount = kind === 'create' ? 300 : ['deposit','withdraw'].includes(kind) ? request.amount : 0;
  if (amount) { const uid = kind === 'withdraw' ? request.targetUserId : userId, user=await repos.users.get(uid), sourceType={create:'clan_creation',deposit:'clan_deposit',withdraw:'clan_withdraw'}[kind],sourceId=`${action.id}:${uid}`;
    requireGame(stamp(now)>=stamp(user.updatedAt),'INVALID_CLOCK');
    const type=kind === 'withdraw' ? 'credit' : 'debit'; const changed = await (type === 'credit' ? creditCoinsInTransaction : debitCoinsInTransaction)(repos,user,amount,now,{type:sourceType,id:sourceId});
    action.movements.push({userId:uid,type,sourceType,sourceId,amount,balanceBefore:user.economy.coins,balanceAfter:changed.economy.coins});
  }
  if (before) await repos.clans.replace(action.after); else await repos.clans.insert(action.after);
  await repos.clanActions.insert(action);return action;
}
export async function appendWarAction(repos,{warId,userId,kind,request={},operationKey,now}) {
  const before = await repos.clanWars.get(warId), context = {...await clanContext(repos),battles:await repos.battles.all(),rewards:await repos.rewards.all()};
  const action={id:`WACT-${randomUUID()}`,warId,userId,kind,request,operationKey,createdAt:now,before:before ?? null,after:null,movements:[],clanCursor:context.actions.length};
  action.after=reduceWar(before,action,context);
  if (kind === 'claim') { const amount=action.after.claims.at(-1).coins,user=await repos.users.get(userId),sourceId=`${action.id}:${userId}`;
    const changed=await creditCoinsInTransaction(repos,user,amount,now,{type:'clan_war_reward',id:sourceId});
    action.movements.push({userId,type:'credit',sourceType:'clan_war_reward',sourceId,amount,balanceBefore:user.economy.coins,balanceAfter:changed.economy.coins});
  }
  if (before) await repos.clanWars.replace(action.after);else await repos.clanWars.insert(action.after);
  await repos.clanWarActions.insert(action);
  if (kind === 'accept' || action.after.status === 'finished' && before?.status !== 'finished') {
    for (const clanId of action.after.clanIds) await appendClanAction(repos,{clanId,userId:null,kind:kind === 'accept' ? 'war_entry' : 'war_result',request:{warId},operationKey:`clan:${kind}:${warId}:${clanId}`,now});
  }
  return action;
}
export async function expireClanWars(repos,now) {
  if (!repos.clanWars) return 0;const rows=await repos.clanWars.filter(w => openWar(w) && stamp(w.expiresAt) <= stamp(now));
  for (const war of rows) await appendWarAction(repos,{warId:war.id,userId:null,kind:'expire',operationKey:`war-expire:${war.id}`,now});return rows.length;
}
export async function clanWarForBattle(repos,userId,opponentId,advanced,now) {
  if (!advanced || !repos.clanWars) return null;await expireClanWars(repos,now);
  const war=await repos.clanWars.findBy('status', 'active', w => [userId,opponentId].every(uid => w.rosters.some(r => r.userIds.includes(uid))) && w.rosters.find(r => r.userIds.includes(userId))?.clanId !== w.rosters.find(r => r.userIds.includes(opponentId))?.clanId);
  return war ? {version:1,warId:war.id,clanIds:[userId,opponentId].map(uid => war.rosters.find(r => r.userIds.includes(uid)).clanId)} : null;
}
export async function settleClanWarBattle(repos,battle,now) {
  if (!battle.clanWar) return;await expireClanWars(repos,now);const war=await repos.clanWars.get(battle.clanWar.warId);
  // The caller has not published the final battle yet. Publish it before the
  // receipt so the same atomic transaction contains authoritative evidence.
  await repos.battles.replace(battle);
  if (war?.status !== 'active' || !qualifyingBattle(war,battle,await repos.rewards.all()) || war.battleIds.some(id => id === battle.id)) return;
  const pair=battle.players.map(p => p.userId).sort().join(':');
  if ((await repos.battles.all()).some(b => war.battleIds.includes(b.id) && b.players.map(p => p.userId).sort().join(':') === pair)) return;
  await appendWarAction(repos,{warId:war.id,userId:null,kind:'battle',request:{battleId:battle.id},operationKey:`war-battle:${battle.id}`,now});
}
