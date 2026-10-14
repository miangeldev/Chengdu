import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { setup,register,readRecords } from './helpers.js';
import { COLLECTIONS,validateDatabase } from '../storage/validation.js';
import { clansFixture } from './community-fixtures.js';
async function war(c){await c.game.clans.challengeWar({userId:c.users[0].id,opponentClanCode:'C2',operationKey:'war'});return c.game.clans.acceptWar({userId:c.users[3].id,code:'G1',operationKey:'accept'});}
async function duel(c,index){const [a,b]=[c.users[index],c.users[index+3]],chatId=`war-${index}@g.us`;const challenge=await c.game.battle.challenge({userId:a.id,opponentId:b.id,chatId,mode:'1v1',operationKey:`battle:${index}:${readRecords(c.directory,'combates').length}`});let battle=(await c.game.battle.accept({userId:b.id,chatId})).battle;
 for(let n=0;n<4 && battle.status==='active';n++)battle=(await c.game.battle.attack({userId:battle.turnUserId,chatId,choice:'1'})).battle;
 if(battle.status==='active')battle=(await c.game.battle.surrender({userId:b.id,chatId})).battle;return battle;}

test('clan roles, invitation, membership, treasury and moderation use authoritative receipts',async t=>{const c=await clansFixture(t),a=c.users[0],b=c.users[1];
 assert.equal((await c.game.clans.getClan({userId:a.id})).clan.code,'C1');assert.equal((await c.game.clans.listClans()).items.length,2);
 await assert.rejects(c.game.clans.withdraw({userId:b.id,amount:10,operationKey:'forbidden'}),{code:'CLAN_PERMISSION_DENIED'});
 await c.game.clans.withdraw({userId:a.id,targetUserId:b.id,amount:20,operationKey:'withdraw'});assert.equal((await c.game.users.getUser(b.id)).economy.coins,420);
 assert.equal((await c.game.clans.getClan({userId:a.id})).clan.treasury,80);
 await c.game.clans.setRole({userId:a.id,targetUserId:b.id,role:'officer',operationKey:'promote'});
 await c.game.clans.ban({userId:b.id,targetUserId:c.users[2].id,operationKey:'ban'});await assert.rejects(c.game.clans.join({userId:c.users[2].id,code:'C1',operationKey:'banned'}),{code:'CLAN_INVITATION_REQUIRED'});
 await c.game.clans.unban({userId:a.id,targetUserId:c.users[2].id,operationKey:'unban'});await c.game.clans.invite({userId:b.id,opponentId:c.users[2].id,operationKey:'reinvite'});
 await assert.rejects(c.game.clans.join({userId:c.users[2].id,code:'C1',operationKey:'earlyjoin'}),{code:'CLAN_MEMBERSHIP_COOLDOWN'});
 await assert.rejects(c.game.clans.leave({userId:a.id,operationKey:'leader-leave'}),{code:'CLAN_TRANSFER_LEADERSHIP_REQUIRED'});
 await c.game.clans.transferLeadership({userId:a.id,targetUserId:b.id,operationKey:'newleader'});await c.game.clans.leave({userId:a.id,operationKey:'leave'});
 assert.equal((await c.game.clans.getClan({userId:b.id})).clan.members[0].role,'leader');assert.equal((await c.game.validateDatabase()).valid,true);
});
test('war freezes rosters, counts real distinct PvP pairs, ranks clans and grants each earned prize once',async t=>{const c=await clansFixture(t);const w=(await war(c)).war;assert.deepEqual(w.scores,[0,0]);assert.equal(w.rosters[0].userIds.length,3);assert.equal((await c.game.clans.getClan({userId:c.users[0].id})).clan.treasury,0);
 await assert.rejects(c.game.clans.leave({userId:c.users[1].id,operationKey:'leave-war'}),{code:'CLAN_WAR_ROSTER_LOCKED'});
 await assert.rejects(c.game.clans.kick({userId:c.users[0].id,targetUserId:c.users[1].id,operationKey:'kick-war'}),{code:'CLAN_WAR_ROSTER_LOCKED'});
 const b=await duel(c,0);assert.equal(b.clanWar.warId,w.id);await duel(c,0);assert.deepEqual((await c.game.clans.getWar({userId:c.users[0].id,code:'G1'})).war.scores,[1,0]);
 await duel(c,1);await duel(c,2);const closed=(await c.game.clans.getWar({userId:c.users[0].id,code:'G1'})).war;assert.equal(closed.status,'finished');assert.equal(closed.winnerClanId,w.clanIds[0]);assert.deepEqual(closed.scores,[3,0]);
 assert.equal((await c.game.clans.getClan({userId:c.users[0].id})).clan.treasury,500);assert.equal((await c.game.clans.listClans()).items[0].seasonPoints,3);
 const before=(await c.game.users.getUser(c.users[1].id)).economy.coins;await c.game.clans.claimWarReward({userId:c.users[1].id,code:'G1',operationKey:'prize'});assert.equal((await c.game.users.getUser(c.users[1].id)).economy.coins,before+150);
 assert.equal((await c.game.clans.claimWarReward({userId:c.users[1].id,code:'G1',operationKey:'prize'})).alreadyProcessed,true);await assert.rejects(c.game.clans.claimWarReward({userId:c.users[1].id,code:'G1',operationKey:'again'}),{code:'CLAN_WAR_REWARD_UNAVAILABLE'});
 await assert.rejects(c.game.clans.challengeWar({userId:c.users[0].id,opponentClanCode:'C2',operationKey:'farm'}),{code:'CLAN_WAR_PAIR_COOLDOWN'});assert.equal((await c.game.validateDatabase()).valid,true);
});
test('expiry closes both challenges and wars, preserves treasury and refuses inactive personal prizes',async t=>{const c=await clansFixture(t);await war(c);c.setNow('2026-10-17T08:00:00.000Z');const w=(await c.game.clans.getWar({userId:c.users[0].id})).war;assert.equal(w.status,'finished');assert.equal(w.winnerClanId,null);assert.equal((await c.game.clans.getClan({userId:c.users[0].id})).clan.treasury,150);
 await assert.rejects(c.game.clans.claimWarReward({userId:c.users[0].id,code:'G1',operationKey:'afk'}),{code:'CLAN_WAR_REWARD_UNAVAILABLE'});
});
test('persisted and transactional tampering cannot forge treasury, roles, war score or wallet movements',async t=>{const c=await clansFixture(t);await war(c);await duel(c,0);
 const state=Object.fromEntries(COLLECTIONS.map(name=>[name,JSON.parse(fs.readFileSync(path.join(c.directory,`${name}.json`),'utf8'))]));
 for(const mutate of [s=>s.clanes.records[0].treasury++,s=>s.clanes.records[0].members[1].role='leader',s=>s.guerrasclan.records[0].scores[0]++,s=>s.accionesclan.records[0].movements[0].amount=0,s=>s.accionesguerra.records.find(a=>a.kind==='battle').request.battleId='fake']){const bad=structuredClone(state);mutate(bad);assert.throws(()=>validateDatabase(bad),{code:'DATABASE_CORRUPT'});}
 await assert.rejects(c.storage.withTransaction(async repos=>{const clan=await repos.clans.get(state.clanes.records[0].id);await repos.clans.replace({...clan,treasury:99999});}),{code:'DATABASE_CORRUPT'});
});

for(const stage of ['prepared','committed','published:clanes.json','published:accionesclan.json','published:economia.json','published:usuarios.json'])test(`clan treasury commit and retry recover together at ${stage}`,async t=>{
 const c=await clansFixture(t),u=c.users[1],before=(await c.game.users.getUser(u.id)).economy.coins;
 await c.game.close();let armed=true;Object.assign(c,c.open({fault:point=>{if(armed && point===stage){armed=false;throw Error('crash');}}}));
 const request={userId:u.id,amount:50,operationKey:'recover-deposit'};
 await assert.rejects(c.game.clans.deposit(request),{code:'STORAGE_WRITE_FAILED'});await c.game.close();Object.assign(c,c.open());
 await c.game.validateDatabase();const committed=stage!=='prepared';assert.equal((await c.game.users.getUser(u.id)).economy.coins,before-(committed?50:0));
 const retried=await c.game.clans.deposit(request);assert.equal(retried.alreadyProcessed,committed);assert.equal((await c.game.users.getUser(u.id)).economy.coins,before-50);assert.equal((await c.game.clans.getClan({userId:u.id})).clan.treasury,150);
});

test('a clan ban on an outsider cannot impose a global membership cooldown',async t=>{
 const c=await clansFixture(t),visitor=await register(c.game,'Visitante','521556667777');
 for(let d=0;d<3;d++){c.setNow(`2026-10-${16+d}T08:00:00.000Z`);await c.game.economy.claimDaily({userId:visitor.id,operationKey:`visitor:${d}`});}
 await c.game.clans.ban({userId:c.users[0].id,targetUserId:visitor.id,operationKey:'outsider-ban'});
 const own=await c.game.clans.create({userId:visitor.id,name:'Casa del Visitante',tag:'VIS',operationKey:'visitor-create'});assert.equal(own.clan.code,'C3');
});
