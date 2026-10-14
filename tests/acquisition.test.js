import test from 'node:test';import assert from 'node:assert/strict';import fs from 'node:fs';import path from 'node:path';
import { setup,register,readRecords } from './helpers.js';import { COLLECTIONS,validateDatabase } from '../storage/validation.js';
import { craftingFixture,defeatBoss,fightForMaterials } from './crafting-fixtures.js';
test('promotion emits one original limited unit, retains origin across retries and rejects duplicate new requests',async t=>{
 const c=setup(t,{clock:()=> '2026-10-13T08:00:00.000Z',randomDropInt:()=>0}),u=await register(c.game);
 const req={userId:u.id,code:'chengdu',operationKey:'promo'};const a=await c.game.acquisition.redeemCode(req);assert.equal(a.receipt.outcome,'minted');assert.equal(a.unit.id,'PAND-000001');assert.equal(readRecords(c.directory,'unidades')[0].origin.type,'promo');
 await c.game.close();Object.assign(c,c.open({clock:()=>null,randomDropInt:()=>{throw Error('no reroll');}}));const replay=await c.game.acquisition.redeemCode(req);assert.equal(replay.alreadyProcessed,true);assert.equal(replay.unit.id,a.unit.id);assert.equal(readRecords(c.directory,'unidades').length,1);
 await c.game.close();Object.assign(c,c.open({clock:()=> '2026-10-13T08:00:00.000Z'}));await assert.rejects(c.game.acquisition.redeemCode({...req,operationKey:'another'}),{code:'PROMO_ALREADY_REDEEMED'});
});
test('real PvP, mission, achievement, boss and event receipts provide direct unit sources without altering old awards',async t=>{
 const c=await craftingFixture(t);await fightForMaterials(c);await defeatBoss(c);
 await c.game.content.claimEvent({userId:c.user.id,eventId:'faroles',operationKey:'event-reward'});
 await c.game.content.claimAchievement({userId:c.user.id,code:'L1',operationKey:'first-blood'});
 const old=readRecords(c.directory,'premioscontenido');const pending=await c.game.acquisition.listRewards({userId:c.user.id});assert.equal(pending.rewards.find(r=>r.kind==='boss').pending,1);assert.equal(pending.rewards.find(r=>r.kind==='event').pending,1);
 for(const kind of ['pvp','achievement']){const reward=await c.game.acquisition.claimReward({userId:c.user.id,kind,operationKey:`drop:${kind}`});assert.equal(reward.receipt.outcome,'minted');}
 const r=await c.game.acquisition.claimReward({userId:c.user.id,kind:'boss',operationKey:'boss-drop'});assert.equal(r.receipt.outcome,'minted');assert.equal(readRecords(c.directory,'unidades').find(u=>u.id===r.unit.id).origin.type,'boss');
 const event=await c.game.acquisition.claimReward({userId:c.user.id,kind:'event',operationKey:'event-drop'});assert.ok(['ZORR','ESPE'].includes(event.unit.id.split('-')[0]));assert.deepEqual(readRecords(c.directory,'premioscontenido'),old);
 assert.equal((await c.game.validateDatabase()).valid,true);
});
test('failed drop persists one decision, sources cannot be invented, and expired promotions mint nothing',async t=>{
 const c=await craftingFixture(t);await defeatBoss(c);await c.game.close();Object.assign(c,c.open({randomDropInt:()=>99}));const req={userId:c.user.id,kind:'boss',operationKey:'miss'};
 assert.equal((await c.game.acquisition.claimReward(req)).receipt.outcome,'miss');assert.equal((await c.game.acquisition.claimReward(req)).alreadyProcessed,true);await assert.rejects(c.game.acquisition.claimReward({...req,operationKey:'second'}),{code:'NO_ACQUISITION_REWARDS'});
 await assert.rejects(c.game.acquisition.claimReward({userId:c.user.id,kind:'ranking',operationKey:'fake'}),{code:'NO_ACQUISITION_REWARDS'});c.setTime('2026-11-13T00:00:00.000Z');await assert.rejects(c.game.acquisition.redeemCode({userId:c.user.id,code:'CHENGDU',operationKey:'expired'}),{code:'PROMO_UNAVAILABLE'});
});
test('reward receipt, source, RNG and mint link tampering are rejected',async t=>{
 const c=setup(t,{clock:()=> '2026-10-13T08:00:00.000Z',randomDropInt:()=>0}),u=await register(c.game);await c.game.acquisition.redeemCode({userId:u.id,code:'CHENGDU',operationKey:'promo'});
 const s=Object.fromEntries(COLLECTIONS.map(n=>[n,JSON.parse(fs.readFileSync(path.join(c.directory,`${n}.json`),'utf8'))]));
 for(const edit of [s=>s.obtenciones.records[0].sourceId='FREE',s=>s.obtenciones.records[0].roll=100,s=>s.obtenciones.records[0].unitId='fake',s=>s.obtenciones.records[0].pool[0].issuedBefore=40]){const bad=structuredClone(s);edit(bad);assert.throws(()=>validateDatabase(bad),{code:'DATABASE_CORRUPT'});}
});

test('mission unit rewards require completed claimed objectives and cannot be duplicated',async t=>{
 const c=await craftingFixture(t);const wins=new Map();
 for(let n=0;n<3;n++){const b=await fightForMaterials(c);wins.set(b.winnerId,(wins.get(b.winnerId)??0)+1);if(wins.get(b.winnerId)>=2){const player=b.winnerId;await c.game.content.claimMission({userId:player,code:'1',operationKey:'mission'});const r=await c.game.acquisition.claimReward({userId:player,kind:'mission',operationKey:'mission-drop'});assert.equal(r.receipt.outcome,'minted');assert.equal(readRecords(c.directory,'unidades').find(u=>u.id===r.unit.id).origin.type,'mission');return;}}
 assert.fail('a player must earn two of the three valid wins');
});
test('season podium grants a direct ranking unit through the finite mint supply',async t=>{
 let now='2026-10-13T08:00:00.000Z';const c=setup(t,{clock:()=>now,randomRoll:()=>0,randomDropInt:()=>0}),users=[];
 for(let i=0;i<4;i++){const u=await register(c.game,`Rival ${i}`,`52155444000${i}`);users.push(u);const unit=(await c.game.starter.claimStarter({userId:u.id,choice:i?'lobo':'panda'})).unit;await c.game.teams.setTeam({userId:u.id,unitIds:[unit.id]});}
 for(let n=0;n<5;n++){const rival=users[n%3+1],chatId='rank-source@g.us';await c.game.battle.challenge({userId:users[0].id,opponentId:rival.id,chatId,ranked:true});let b=(await c.game.battle.accept({userId:rival.id,chatId})).battle;while(b.status==='active')b=(await c.game.battle.attack({userId:b.turnUserId,chatId,choice:'1'})).battle;}
 now='2026-11-12T06:00:00.000Z';await c.game.competitive.claimSeasonReward({userId:users[0].id,seasonCode:'T1',operationKey:'podium'});const reward=await c.game.acquisition.claimReward({userId:users[0].id,kind:'ranking',operationKey:'rank-unit'});assert.equal(reward.receipt.outcome,'minted');assert.equal(readRecords(c.directory,'unidades').find(u=>u.id===reward.unit.id).origin.type,'ranking');assert.equal((await c.game.validateDatabase()).valid,true);
});
