import { requireGame } from '../utils/GameError.js';
import { ACQUISITION_VERSION,CHANCES,PROMOTION,rewardSources,acquisitionPool,selectReward,weightPool } from '../game/acquisition/policy.js';
const check=(v,field)=>requireGame(v,'DATABASE_CORRUPT',{field});const eq=(a,b)=>JSON.stringify(a)===JSON.stringify(b);
export function validateAcquisitionData(state){const seen=new Set(),keys=new Set(),minted=new Set();
  for(const a of state.obtenciones.records){check(/^ACQ-[a-f0-9-]{36}$/.test(a.id) && state.usuarios.records.some(u=>u.id===a.userId) && a.policyVersion===ACQUISITION_VERSION && Object.hasOwn(CHANCES,a.kind) && a.chance===CHANCES[a.kind] && Number.isFinite(Date.parse(a.createdAt)) && typeof a.operationKey==='string' && a.operationKey.length>0 && a.operationKey.length<=200 && !keys.has(a.operationKey),'acquisition.metadata');keys.add(a.operationKey);
    const source=`${a.userId}:${a.kind}:${a.sourceId}`;check(!seen.has(source),'acquisition.sourceUnique');seen.add(source);
    if(a.kind==='promo')check(a.sourceId===PROMOTION.code && Date.parse(a.createdAt)>=Date.parse(PROMOTION.startsAt) && Date.parse(a.createdAt)<Date.parse(PROMOTION.endsAt),'acquisition.promotion');
    else check(rewardSources(state,a.userId,a.kind).some(r=>r.id===a.sourceId && Date.parse(r.createdAt)<=Date.parse(a.createdAt)),'acquisition.earnedSource');
    check(Array.isArray(a.pool) && a.pool.length>0 && new Set(a.pool.map(p=>p.characterId)).size===a.pool.length && a.pool.every(p=>state.personajes.records.some(c=>c.id===p.characterId) && Number.isSafeInteger(p.weight) && p.weight>0 && Number.isSafeInteger(p.issuedBefore) && p.issuedBefore>=0 && p.issuedBefore<p.max && p.grandfathered===null),'acquisition.pool');
    check(eq(a.pool, weightPool(a.pool)), 'acquisition.poolWeights');
    check(Number.isSafeInteger(a.roll) && a.roll>=0 && a.roll<100 && a.outcome===(a.roll<a.chance?'minted':'miss'),'acquisition.roll');
    if(a.outcome==='miss'){check(a.unitId===null && a.selectionRoll===null,'acquisition.miss');continue;}
    const unit=state.unidades.records.find(u=>u.id===a.unitId),characterId=selectReward(a.pool,a.selectionRoll),entry=a.pool.find(p=>p.characterId===characterId);
    check(unit && !minted.has(unit.id) && unit.characterId===characterId && unit.characterRevision===entry.revision && unit.serial===entry.issuedBefore+1 && unit.createdAt===a.createdAt && eq(unit.origin,{type:a.kind,sourceId:a.id}) && state.eventos.records.some(e=>e.type==='unit_created' && e.unitId===unit.id && e.toOwnerId===a.userId && e.operationKey===`acquire:${a.id}`),'acquisition.mint');minted.add(unit.id);
  }
  check(state.obtenciones.records.filter(a=>a.kind==='promo').length<=PROMOTION.limit,'acquisition.promoLimit');
  for(const u of state.unidades.records) if(Object.hasOwn(CHANCES,u.origin.type) && !(u.origin.type==='event' && state.encuentros.records.some(e=>e.id===u.origin.sourceId && e.kind==='spawn' && e.status==='captured')))check(minted.has(u.id),'acquisition.complete');
}
export function validateAcquisitionTransition(before,after,context={}){check(eq(before.obtenciones.records,after.obtenciones.records.slice(0,before.obtenciones.records.length)),'acquisition.appendOnly');
  const added=after.obtenciones.records.slice(before.obtenciones.records.length);check(added.length<=1,'acquisition.atomicSource');
  for(const a of added)check(context.now && Date.parse(a.createdAt)<=Date.parse(context.now) && eq(a.pool,acquisitionPool(before,a.kind,a.createdAt)) && (a.kind==='promo'||rewardSources(before,a.userId,a.kind).some(r=>r.id===a.sourceId)),'acquisition.currentAuthority');
}
