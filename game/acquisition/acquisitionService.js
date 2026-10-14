import { randomUUID,randomInt } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { createUnitInTransaction } from '../units/unitGenerator.js';
import { displayUnitCharacterName } from '../evolution/rules.js';
import { keyProof,stamp } from '../clans/policy.js';
import { ACQUISITION_VERSION,CHANCES,PROMOTION,rewardSources,acquisitionPool,selectReward } from './policy.js';
async function stateView(repos){return {recompensas:{records:await repos.rewards.all()},combates:{records:await repos.battles.all()},premiostemporada:{records:await repos.seasonRewards.all()},premioscontenido:{records:await repos.contentRewards.all()},personajes:{records:await repos.characters.all()},estado:{records:await repos.state.all()},campanas:{records:await repos.campaigns.all()}};}
async function result(repos,receipt,duplicate){const unit=receipt.unitId?await repos.units.get(receipt.unitId):null;return {receipt,unit:unit?{id:unit.id,name:displayUnitCharacterName(unit,await repos.characters.get(unit.characterId))}:null,alreadyProcessed:duplicate};}
export function createAcquisitionService(storage,clock,randomDropInt=randomInt){
  async function claim({userId,kind,code=null,operationKey}) {keyProof(operationKey);requireGame(Object.hasOwn(CHANCES,kind),'INVALID_ACQUISITION_KIND');
    return storage.withTransaction(async repos=>{const user=await repos.users.get(userId);requireGame(user,'USER_NOT_FOUND');
      const previous=await repos.acquisitions.find(a=>a.operationKey===operationKey);
      if(previous){requireGame(previous.userId===userId && previous.kind===kind && (kind!=='promo'||previous.sourceId===code),'OPERATION_CONFLICT');return result(repos,previous,true);}
      const now=clock();stamp(now);requireGame(stamp(now)>=stamp(user.updatedAt),'INVALID_CLOCK');const state=await stateView(repos),old=await repos.acquisitions.all();let sourceId;
      if(kind==='promo'){requireGame(code===PROMOTION.code && stamp(now)>=stamp(PROMOTION.startsAt) && stamp(now)<stamp(PROMOTION.endsAt),'PROMO_UNAVAILABLE');
        requireGame(!old.some(a=>a.userId===userId && a.kind==='promo' && a.sourceId===code),'PROMO_ALREADY_REDEEMED');requireGame(old.filter(a=>a.kind==='promo' && a.sourceId===code).length<PROMOTION.limit,'PROMO_EXHAUSTED');sourceId=code;
      }else{const source=rewardSources(state,userId,kind).find(r=>stamp(r.createdAt)<=stamp(now) && !old.some(a=>a.userId===userId && a.kind===kind && a.sourceId===r.id));requireGame(source,'NO_ACQUISITION_REWARDS');sourceId=source.id;}
      const pool=acquisitionPool(state,kind,now);requireGame(pool.length>0,'SUPPLY_EXHAUSTED');const roll=randomDropInt(100);requireGame(Number.isSafeInteger(roll) && roll>=0 && roll<100,'INVALID_RANDOM_ROLL');
      const won=roll<CHANCES[kind],selectionRoll=won?randomDropInt(pool.reduce((sum,c)=>sum+c.weight,0)):null;
      const id=`ACQ-${randomUUID()}`,receipt={id,userId,kind,sourceId,operationKey,policyVersion:ACQUISITION_VERSION,createdAt:now,chance:CHANCES[kind],roll,pool,selectionRoll,outcome:won?'minted':'miss',unitId:null};
      if(won){const unit=await createUnitInTransaction(repos,{characterId:selectReward(pool,selectionRoll),ownerId:userId,origin:{type:kind,sourceId:id},operationKey:`acquire:${id}`},()=>now);receipt.unitId=unit.id;}
      await repos.acquisitions.insert(receipt);return result(repos,receipt,false);
    });
  }
  return { listRewards:({userId})=>storage.withRead(async repos=>{requireGame(await repos.users.get(userId),'USER_NOT_FOUND');const state=await stateView(repos),old=await repos.acquisitions.all();const now=clock();stamp(now);
    return {rewards:Object.keys(CHANCES).filter(k=>k!=='promo').map(kind=>({kind,chance:CHANCES[kind],pending:rewardSources(state,userId,kind).filter(r=>!old.some(a=>a.userId===userId && a.kind===kind && a.sourceId===r.id)).length})),promotion:{...PROMOTION,remaining:Math.max(0,PROMOTION.limit-old.filter(a=>a.kind==='promo').length),redeemed:old.some(a=>a.kind==='promo' && a.userId===userId),active:stamp(now)>=stamp(PROMOTION.startsAt)&&stamp(now)<stamp(PROMOTION.endsAt)}};
  }),claimReward:args=>claim(args),redeemCode:({code,...args})=>claim({...args,kind:'promo',code:String(code).trim().toUpperCase()})};
}
