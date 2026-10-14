import { requireGame } from '../utils/GameError.js';
import { reduceClan, stamp } from '../game/clans/policy.js';
import { reduceWar } from '../game/clans/warPolicy.js';
const check=(v,field)=>requireGame(v,'DATABASE_CORRUPT',{field});
const equal=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
function latest(actions,key) {const map=new Map();for(const action of actions)map.set(action[key],action.after);return [...map.values()];}
function moneyProof(action,type,userId,amount) {
  if(!type){check(action.movements.length===0,'clan.noMoney');return;}
  check(action.movements.length===1,'clan.moneyCount');const m=action.movements[0];
  check(m.userId===userId && m.type===(['clan_creation','clan_deposit'].includes(type)?'debit':'credit') && m.sourceType===type && m.sourceId===`${action.id}:${userId}` && m.amount===amount,'clan.moneySource');
}
export function validateClanData(state) {
  const ca=state.accionesclan.records,wa=state.accionesguerra.records,users=new Set(state.usuarios.records.map(u=>u.id));
  const clans=new Map(),keys=new Set();
  for(let i=0;i<ca.length;i++) {const a=ca[i];
    check(/^CLA-[a-f0-9-]{36}$/.test(a.id) && /^CLN-[a-f0-9-]{36}$/.test(a.clanId) && (a.userId===null || users.has(a.userId)) && typeof a.operationKey==='string' && a.operationKey.length>0 && a.operationKey.length<=200 && !keys.has(a.operationKey) && Number.isSafeInteger(a.warCursor) && a.warCursor>=0 && a.warCursor<=wa.length && Array.isArray(a.movements),'clan.action');keys.add(a.operationKey);
    check(wa.slice(0,a.warCursor).every(w=>stamp(w.createdAt)<=stamp(a.createdAt)),'clan.warCursor');
    check(equal(a.before,clans.get(a.clanId)??null),'clan.chain');
    const after=reduceClan(a.before,a,{clans:[...clans.values()],wars:latest(wa.slice(0,a.warCursor),'warId'),actions:ca.slice(0,i),users});
    check(equal(after,a.after),'clan.replay');clans.set(a.clanId,after);
    const type={create:'clan_creation',deposit:'clan_deposit',withdraw:'clan_withdraw'}[a.kind];moneyProof(a,type,a.kind==='withdraw'?a.request.targetUserId:a.userId,a.kind==='create'?300:a.request.amount);
  }
  check(equal([...clans.values()],state.clanes.records),'clan.finalState');
  const wars=new Map(),warKeys=new Set();
  for(let i=0;i<wa.length;i++) {const a=wa[i];
    check(/^WACT-[a-f0-9-]{36}$/.test(a.id) && /^WAR-[a-f0-9-]{36}$/.test(a.warId) && (a.userId===null || users.has(a.userId)) && typeof a.operationKey==='string' && a.operationKey.length>0 && a.operationKey.length<=200 && !warKeys.has(a.operationKey) && Number.isSafeInteger(a.clanCursor) && a.clanCursor>=0 && a.clanCursor<=ca.length && Array.isArray(a.movements),'clanWar.action');warKeys.add(a.operationKey);
    check(ca.slice(0,a.clanCursor).every(c=>stamp(c.createdAt)<=stamp(a.createdAt)) && equal(a.before,wars.get(a.warId)??null),'clanWar.chain');
    const after=reduceWar(a.before,a,{clans:latest(ca.slice(0,a.clanCursor),'clanId'),wars:[...wars.values()],battles:state.combates.records,rewards:state.recompensas.records});
    check(equal(after,a.after),'clanWar.replay');wars.set(a.warId,after);
    moneyProof(a,a.kind==='claim'?'clan_war_reward':null,a.userId,a.kind==='claim'?a.after.claims.at(-1).coins:0);
    if(a.kind==='accept' || a.after.status==='finished' && a.before?.status!=='finished') {
      const kind=a.kind==='accept'?'war_entry':'war_result';
      for(const clanId of a.after.clanIds) check(ca.filter(c=>c.kind===kind && c.clanId===clanId && c.request.warId===a.warId && c.createdAt===a.createdAt).length===1,'clanWar.treasuryComplete');
    }
  }
  check(equal([...wars.values()],state.guerrasclan.records),'clanWar.finalState');
  // Clan metadata is frozen with the challenge, so old PvP cannot be relabelled.
  for(const battle of state.combates.records) if(battle.clanWar) {
    const m=battle.clanWar,war=wars.get(m.warId);
    check(m.version===1 && battle.rulesVersion===2 && war?.acceptedAt && stamp(battle.createdAt)>=stamp(war.acceptedAt) && stamp(battle.createdAt)<stamp(war.expiresAt) && Array.isArray(m.clanIds) && m.clanIds.length===2 && new Set(m.clanIds).size===2 && battle.players.every((p,i)=>war.rosters.some(r=>r.clanId===m.clanIds[i] && r.userIds.includes(p.userId))),'clanWar.battleMetadata');
  }
}
export function validateClanTransition(before,after,context={}) {
  for(const name of ['accionesclan','accionesguerra']) {
    check(equal(before[name].records,after[name].records.slice(0,before[name].records.length)),`${name}.appendOnly`);
    for(const a of after[name].records.slice(before[name].records.length)) {
      check(context.now && stamp(a.createdAt)<=stamp(context.now),'clan.trustedClock');
      check(name === 'accionesclan' ? a.warCursor >= before.accionesguerra.records.length : a.clanCursor >= before.accionesclan.records.length, 'clan.currentPermissions');
    }
  }
  for(const battle of before.combates.records) check(equal(battle.clanWar,after.combates.records.find(b=>b.id===battle.id)?.clanWar),'clanWar.battleImmutable');
  for(const b of after.combates.records.slice(before.combates.records.length)) if(b.clanWar) {
    const war=before.guerrasclan.records.find(w=>w.id===b.clanWar.warId);
    check(war?.status==='active','clanWar.battleCurrentWar');
  }
}
