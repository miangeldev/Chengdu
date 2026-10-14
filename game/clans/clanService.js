import { seasonNumberAt, seasonDefinition } from '../competitive/policy.js';
import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { appendClanAction, appendWarAction, expireClanWars } from './lifecycle.js';
import { CLAN_POLICY, membership, keyProof, stamp, rankPoints, openWar } from './policy.js';
async function user(repos,id) { const value=await repos.users.get(id);requireGame(value,'USER_NOT_FOUND');return value; }
async function codeRow(repo,code,prefix) { requireGame(typeof code === 'string' && new RegExp(`^${prefix}[1-9][0-9]*$`).test(code.toUpperCase()),'INVALID_COMMUNITY_CODE'); const rows=await repo.all();const row=rows[Number(code.slice(1))-1];requireGame(row,prefix === 'C' ? 'CLAN_NOT_FOUND' : 'CLAN_WAR_NOT_FOUND');return row; }
async function clanView(repos,clan,viewerId=null) {
  const all=await repos.clans.all();const members=await Promise.all(clan.members.map(async m => ({...m,name:(await user(repos,m.userId)).name})));
  const wars=await repos.clanWars.filter(w => openWar(w) && w.clanIds.includes(clan.id));
  return {...clan,code:`C${all.findIndex(c => c.id === clan.id)+1}`,members,policy:CLAN_POLICY,
    myRole:clan.members.find(m => m.userId === viewerId)?.role ?? null,openWarCode:wars[0] ? `G${(await repos.clanWars.all()).findIndex(w => w.id === wars[0].id)+1}` : null};
}
async function warView(repos,war,viewerId=null) {
  const all=await repos.clanWars.all();const clans=await Promise.all(war.clanIds.map(async id => {const c=await repos.clans.get(id);return {id,name:c.name,tag:c.tag,code:`C${(await repos.clans.all()).findIndex(row => row.id === id)+1}`};}));
  const rosters=await Promise.all(war.rosters.map(async r => ({...r,players:await Promise.all(r.userIds.map(async id => ({userId:id,name:(await user(repos,id)).name})))})));
  const battles=await repos.battles.all();const claimable=war.status === 'finished' && !war.claims.some(c => c.userId === viewerId) && war.battleIds.some(id => battles.find(b => b.id === id)?.players.some(p => p.userId === viewerId));
  return {...war,code:`G${all.findIndex(w => w.id === war.id)+1}`,clans,rosters,claimable,policy:CLAN_POLICY};
}
export function createClanService(storage,clock) {
  async function mutate({userId,kind,operationKey,request={},code=null}) {
    keyProof(operationKey);return storage.withTransaction(async repos => {
      await user(repos,userId);const replay=await repos.clanActions.find(a => a.operationKey === operationKey);
      if (replay) { requireGame(replay.userId === userId && replay.kind === kind && JSON.stringify(replay.request) === JSON.stringify(request) && (!code || replay.clanId === (await codeRow(repos.clans,code,'C')).id),'OPERATION_CONFLICT');return {clan:await clanView(repos,await repos.clans.get(replay.clanId),userId),alreadyProcessed:true}; }
      const now=clock();stamp(now);requireGame(stamp(now)>=stamp((await user(repos,userId)).updatedAt),'INVALID_CLOCK');await expireClanWars(repos,now);
      const clan=kind === 'create' ? null : code ? await codeRow(repos.clans,code,'C') : membership(await repos.clans.all(),userId);
      requireGame(kind === 'create' || clan,'CLAN_NOT_MEMBER');
      const action=await appendClanAction(repos,{clanId:clan?.id ?? `CLN-${randomUUID()}`,userId,kind,request,operationKey,now});
      return {clan:await clanView(repos,action.after,userId),alreadyProcessed:false};
    });
  }
  async function warMutate({userId,kind,operationKey,request={},code=null}) {
    keyProof(operationKey);return storage.withTransaction(async repos => {
      await user(repos,userId);const replay=await repos.clanWarActions.find(a => a.operationKey === operationKey);
      if (replay) { requireGame(replay.userId === userId && replay.kind === kind && (kind !== 'create' || replay.request.opponentClanId === (await codeRow(repos.clans,request.opponentClanCode,'C')).id) && (kind === 'create' || !code || replay.warId === (await codeRow(repos.clanWars,code,'G')).id),'OPERATION_CONFLICT');return {war:await warView(repos,await repos.clanWars.get(replay.warId),userId),alreadyProcessed:true}; }
      const now=clock();stamp(now);requireGame(stamp(now)>=stamp((await user(repos,userId)).updatedAt),'INVALID_CLOCK');await expireClanWars(repos,now);
      let war=null;
      if (kind === 'create') request={opponentClanId:(await codeRow(repos.clans,request.opponentClanCode,'C')).id};
      else war=await codeRow(repos.clanWars,code,'G');
      const action=await appendWarAction(repos,{warId:war?.id ?? `WAR-${randomUUID()}`,userId,kind,request,operationKey,now});
      return {war:await warView(repos,action.after,userId),alreadyProcessed:false};
    });
  }
  async function refresh(work) {return storage.withTransaction(async repos => {const now=clock();stamp(now);await expireClanWars(repos,now);return work(repos,now);});}
  return {
    create:({userId,name,tag,operationKey}) => { requireGame(typeof name === 'string' && typeof tag === 'string', 'INVALID_CLAN_NAME'); return mutate({userId,kind:'create',operationKey,request:{name:name.trim(),tag:tag.trim().toUpperCase()}}); },
    getClan:({userId,code=null}) => refresh(async repos => {await user(repos,userId);const clans=await repos.clans.all();const clan=code ? await codeRow(repos.clans,code,'C') : membership(clans,userId);return {clan:clan ? await clanView(repos,clan,userId) : null,invitations:await Promise.all(clans.filter(c => c.status === 'active' && c.invitations.some(i => i.userId === userId && stamp(i.expiresAt)>stamp(clock()))).map(c => clanView(repos,c,userId)))};}),
    listClans:({page=1,limit=5}={}) => refresh(async (repos,now) => {const number=seasonNumberAt(now),season=number?seasonDefinition(number):null;
      const start=season?.startsAt ?? new Date(Math.floor(stamp(now)/(30*86400000))*30*86400000).toISOString(),end=season?.endsAt ?? new Date(stamp(start)+30*86400000).toISOString();
      const wars=await repos.clanWars.all();const rows=await Promise.all((await repos.clans.all()).filter(c => c.status === 'active').map(async c => ({...await clanView(repos,c),seasonPoints:wars.filter(w => w.status === 'finished' && stamp(w.closedAt)>=stamp(start) && stamp(w.closedAt)<stamp(end)).reduce((sum,w)=>sum+(w.clanIds.includes(c.id)?rankPoints(w,c.id):0),0)})));
      rows.sort((a,b)=>b.seasonPoints-a.seasonPoints || b.stats.wins-a.stats.wins || a.createdAt.localeCompare(b.createdAt));return {...paginate(rows,{page,limit},'clans',r=>[-r.seasonPoints,-r.stats.wins,r.createdAt,r.id]),season:season?.code ?? null,startsAt:start,endsAt:end};}),
    invite:({userId,opponentId,operationKey})=>mutate({userId,kind:'invite',operationKey,request:{targetUserId:opponentId}}),
    join:({userId,code,operationKey})=>mutate({userId,kind:'join',code,operationKey}),
    leave:args=>mutate({...args,kind:'leave'}),
    setRole:({userId,targetUserId,role,operationKey})=>mutate({userId,kind:'role',operationKey,request:{targetUserId,role}}),
    transferLeadership:({userId,targetUserId,operationKey})=>mutate({userId,kind:'leadership',operationKey,request:{targetUserId}}),
    kick:({userId,targetUserId,operationKey})=>mutate({userId,kind:'kick',operationKey,request:{targetUserId}}),
    ban:({userId,targetUserId,operationKey})=>mutate({userId,kind:'ban',operationKey,request:{targetUserId}}),
    unban:({userId,targetUserId,operationKey})=>mutate({userId,kind:'unban',operationKey,request:{targetUserId}}),
    deposit:({userId,amount,operationKey})=>mutate({userId,kind:'deposit',operationKey,request:{amount}}),
    withdraw:({userId,targetUserId=userId,amount,operationKey})=>mutate({userId,kind:'withdraw',operationKey,request:{targetUserId,amount}}),
    getLedger:({userId,page=1,limit=5})=>refresh(async repos=>{const clan=membership(await repos.clans.all(),userId);requireGame(clan,'CLAN_NOT_MEMBER');const rows=await repos.clanActions.filter(a=>a.clanId===clan.id && a.before?.treasury !== a.after.treasury);return {...paginate(rows,{page,limit},`clanLedger:${clan.id}`,r=>[-rows.indexOf(r)]),clan:await clanView(repos,clan,userId)};}),
    challengeWar:({userId,opponentClanCode,operationKey})=>warMutate({userId,kind:'create',operationKey,request:{opponentClanCode}}),
    acceptWar:args=>warMutate({...args,kind:'accept'}),rejectWar:args=>warMutate({...args,kind:'reject'}),cancelWar:args=>warMutate({...args,kind:'cancel'}),
    getWar:({userId,code=null})=>refresh(async repos=>{await user(repos,userId);let war=code?await codeRow(repos.clanWars,code,'G'):null;
      if (!war) {const clan=membership(await repos.clans.all(),userId);requireGame(clan,'CLAN_NOT_MEMBER');war=(await repos.clanWars.filter(w=>w.clanIds.includes(clan.id))).at(-1);}requireGame(war,'CLAN_WAR_NOT_FOUND');return {war:await warView(repos,war,userId)};}),
    getWarHistory:({userId,page=1,limit=5})=>refresh(async repos=>{const clan=membership(await repos.clans.all(),userId);requireGame(clan,'CLAN_NOT_MEMBER');const rows=(await repos.clanWars.filter(w=>w.clanIds.includes(clan.id))).reverse();const result=paginate(rows,{page,limit},`wars:${clan.id}`,r=>[-rows.indexOf(r)]);result.items=await Promise.all(result.items.map(w=>warView(repos,w,userId)));return result;}),
    claimWarReward:args=>warMutate({...args,kind:'claim'}),sweepExpired:()=>refresh(async()=>({swept:true}))
  };
}
