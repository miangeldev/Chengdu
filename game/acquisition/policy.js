import { requireGame } from '../../utils/GameError.js';
import { SPIRITS_CAMPAIGN_ID } from '../content/spiritsCatalog.js';
export const ACQUISITION_VERSION=1;
export const CHANCES=Object.freeze({pvp:10,mission:10,achievement:20,boss:10,event:10,ranking:100,promo:100});
export const PROMOTION=Object.freeze({code:'CHENGDU',limit:20,startsAt:'2026-10-13T00:00:00.000Z',endsAt:'2026-11-13T00:00:00.000Z'});
const weights=Object.freeze({common:70,rare:22,epic:7,legendary:1,mythic:1});
export function rewardSources(state,userId,kind) {
  if(kind==='pvp')return state.recompensas.records.filter(r=>r.userId===userId && r.reason==='rewarded' && state.combates.records.some(b=>b.id===r.battleId && b.winnerId===userId));
  if(kind==='ranking')return state.premiostemporada.records.filter(r=>r.userId===userId && r.position>=1 && r.position<=3);
  return state.premioscontenido.records.filter(r=>r.userId===userId && r.kind===kind && !(kind==='event' && r.sourceId===SPIRITS_CAMPAIGN_ID));
}
export function weightPool(pool) {
  const counts = new Map(); for (const c of pool) counts.set(c.rarity, (counts.get(c.rarity) ?? 0) + 1);
  const gcd = (a,b) => b ? gcd(b,a%b) : a;
  let scale = 1; for (const n of counts.values()) scale = scale / gcd(scale,n) * n;
  return pool.map(c => ({ ...c, weight: weights[c.rarity] * scale / counts.get(c.rarity) }));
}
export function acquisitionPool(state,kind,now) {
  const active=id=>state.campanas.records.some(c=>c.id===id && Date.parse(now)>=Date.parse(c.startsAt) && Date.parse(now)<Date.parse(c.endsAt));
  return weightPool(state.personajes.records.filter(c=>c.obtainable && c.eventId!==SPIRITS_CAMPAIGN_ID && (kind==='event'?Boolean(c.eventId && active(c.eventId)):!c.eventId) && (kind!=='promo'||c.rarity==='common')).map(c=>{
    const counter=state.estado.records.find(r=>r.kind==='mintCounter' && r.characterId===c.id);
    return {characterId:c.id,revision:c.revision,rarity:c.rarity,weight:weights[c.rarity],issuedBefore:counter.issuedCount,max:c.supply.max,grandfathered:c.supply.grandfatheredIssued??null};
  }).filter(c=>c.grandfathered===null && c.issuedBefore<c.max));
}
export function selectReward(pool,roll) {
  const total=pool.reduce((sum,c)=>sum+c.weight,0);requireGame(Number.isSafeInteger(roll) && roll>=0 && roll<total,'INVALID_RANDOM_ROLL');
  let cursor=roll;for(const c of pool){if(cursor<c.weight)return c.characterId;cursor-=c.weight;}requireGame(false,'INVALID_RANDOM_ROLL');
}
