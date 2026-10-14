import { setup,register } from './helpers.js';
export async function clansFixture(t) {
 let now='2026-10-13T08:00:00.000Z';const c=setup(t,{clock:()=>now,randomRoll:()=>0});c.setNow=v=>now=v;c.now=()=>now;
 c.users=[];for(let i=0;i<6;i++){const u=await register(c.game,`Jugador ${i+1}`,`52155000000${i}`);c.users.push(u);const unit=(await c.game.starter.claimStarter({userId:u.id,choice:'panda'})).unit;await c.game.teams.setTeam({userId:u.id,unitIds:[unit.id]});}
 for(let d=0;d<4;d++){now=`2026-10-${13+d}T08:00:00.000Z`;for(const u of c.users)await c.game.economy.claimDaily({userId:u.id,operationKey:`daily:${u.id}:${d}`});}
 for(const i of [0,3]){const leader=c.users[i];await c.game.clans.create({userId:leader.id,name:i?'Casa Lunar':'Casa Bambú',tag:i?'LUNA':'BAM',operationKey:`create:${i}`});for(const j of [i+1,i+2]){await c.game.clans.invite({userId:leader.id,opponentId:c.users[j].id,operationKey:`invite:${j}`});await c.game.clans.join({userId:c.users[j].id,code:i?'C2':'C1',operationKey:`join:${j}`});}await c.game.clans.deposit({userId:leader.id,amount:100,operationKey:`deposit:${i}`});}
 return c;
}
