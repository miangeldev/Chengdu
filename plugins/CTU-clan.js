import { defineCommand,contentOperationKey,pageArguments,pageNavigation } from '../interfaces/whatsapp/command.js';
import { card,displayName } from '../interfaces/whatsapp/format.js';
import { renderClan,renderWar,renderClanList } from '../interfaces/whatsapp/communityFormat.js';
import { requireGame } from '../utils/GameError.js';
export const {command,run,createRun}=defineCommand('ctuclan',async({game,identity,args,context,cmd,prefix})=>{
 const user=await game.users.getUserByIdentity(identity()),sub=(args[0]??'ver').toLowerCase(),rest=args.slice(1),base={userId:user.id};
 const op=()=>contentOperationKey(`clan:${sub}`,context,user.id);
 const target=async()=>{requireGame(context.mentions.length===1,'INVALID_OPPONENT');return (await game.users.getUserByIdentity({provider:'whatsapp',subject:context.mentions[0]})).id;};
 if(sub==='ayuda')return card('CLANES | GUÍA',[
 `🏯 Crear: ${cmd('ctuclan','crear BAM Casa del Bambú')}\n💰 300 ChengCoins · 15 miembros\n📨 Invitar: ${cmd('ctuclan','invitar @jugador')}\n🤝 Unirse: ${cmd('ctuclan','unirse C1')}\n🚪 Salir: ${cmd('ctuclan','salir')}`,
 `👑 Gestión del líder\n${cmd('ctuclan','rol @jugador oficial')}\n${cmd('ctuclan','lider @jugador')}\n${cmd('ctuclan','expulsar @jugador')}\n${cmd('ctuclan','ban @jugador')} · unban`,
 `💰 Tesorería\n${cmd('ctuclan','depositar 100')}\n${cmd('ctuclan','retirar 100 @jugador')}\n${cmd('ctuclan','historial')}`,
 `⚔️ Guerras: 3 jugadores por clan\n${cmd('ctuclan','guerra C2')}\n${cmd('ctuclan','aceptar G1')} · rechazar G1\n${cmd('ctuclan','war G1')} · guerras\n${cmd('ctuclan','premio G1')}\n💰 Entrada 100 por clan · rival cada 7 días`],`🔎 ${cmd('ctuclan','top')}`);
 if(sub==='ver'){requireGame(rest.length<=1,'INVALID_ARGUMENTS');return renderClan(await game.clans.getClan({...base,code:rest[0]??null}),cmd);}
 if(sub==='top')return renderClanList(await game.clans.listClans(pageArguments(rest)),cmd,prefix);
 if(sub==='war'){requireGame(rest.length<=1,'INVALID_ARGUMENTS');return renderWar(await game.clans.getWar({...base,code:rest[0]??null}),cmd);}
 if(sub==='guerras'){const p=await game.clans.getWarHistory({...base,...pageArguments(rest)});return card('CLAN | GUERRAS',p.items.map(w=>`⚔️ ${displayName(w.clans[0].name)} vs ${displayName(w.clans[1].name)} · ${w.scores.join('–')}\n👉 ${cmd('ctuclan',`war ${w.code}`)}`),pageNavigation(p,'ctuclan',prefix,'guerras'));}
 if(sub==='historial'){const p=await game.clans.getLedger({...base,...pageArguments(rest)});return card('CLAN | TESORERÍA',p.items.map(a=>`💰 ${a.kind==='create'?'-300 personales':`${a.after.treasury-(a.before?.treasury??0)} de tesorería`} ChengCoins · ${displayName(({create:'Fundación',deposit:'Aporte',withdraw:'Retiro',war_entry:'Entrada de guerra',war_result:'Premio de guerra'})[a.kind]??a.kind)}\n🏦 Saldo: ${a.after.treasury}`),pageNavigation(p,'ctuclan',prefix,'historial'));}
 let result;
 if(sub==='crear'){requireGame(rest.length>=2,'INVALID_ARGUMENTS');result=await game.clans.create({...base,tag:rest[0],name:rest.slice(1).join(' '),operationKey:op()});}
 else if(['invitar','expulsar','ban','unban','lider','rol'].includes(sub)) {requireGame(rest.length===(sub==='rol'?2:1),'INVALID_ARGUMENTS');const targetUserId=await target();const method={invitar:'invite',expulsar:'kick',ban:'ban',unban:'unban',lider:'transferLeadership',rol:'setRole'}[sub];result=await game.clans[method]({...base,targetUserId,opponentId:targetUserId,role:{oficial:'officer',miembro:'member'}[rest[1]?.toLowerCase()],operationKey:op()});}
 else if(sub==='unirse'){requireGame(rest.length===1,'INVALID_ARGUMENTS');result=await game.clans.join({...base,code:rest[0],operationKey:op()});}
 else if(sub==='salir'){requireGame(rest.length===0,'INVALID_ARGUMENTS');result=await game.clans.leave({...base,operationKey:op()});}
 else if(['depositar','retirar'].includes(sub)){requireGame(rest.length>=1 && rest.length<=(sub==='retirar'?2:1) && /^\d+$/.test(rest[0]),'INVALID_ARGUMENTS');result=await game.clans[sub==='depositar'?'deposit':'withdraw']({...base,amount:Number(rest[0]),targetUserId:rest.length===2?await target():user.id,operationKey:op()});}
 else if(['guerra','aceptar','rechazar','cancelar','premio'].includes(sub)){requireGame(rest.length===1,'INVALID_ARGUMENTS');const method={guerra:'challengeWar',aceptar:'acceptWar',rechazar:'rejectWar',cancelar:'cancelWar',premio:'claimWarReward'}[sub];result=await game.clans[method]({...base,code:rest[0],opponentClanCode:rest[0],operationKey:op()});if(sub==='premio'){const claim=result.war.claims.find(c=>c.userId===user.id);result.notice=`🎁 ${result.alreadyProcessed?'Premio ya entregado':'¡Premio entregado!'} · +${claim.coins} ChengCoins`;}return renderWar(result,cmd);}
 else requireGame(false,'INVALID_ARGUMENTS');
 const notices={invitar:`📨 Invitación enviada. Puede aceptarla con ${cmd('ctuclan',`unirse ${result.clan.code}`)}`,unirse:'🎋 ¡Ya eres parte del clan!',salir:'🚪 Saliste del clan.',rol:'🛡️ Rol actualizado.',lider:'👑 Liderazgo transferido.',expulsar:'🚪 Integrante expulsado.',ban:'🛡️ Entrada bloqueada para ese jugador.',unban:'🔓 Bloqueo de entrada retirado.',depositar:`✅ Aportaste ${rest[0]} ChengCoins.`,retirar:`✅ Retiro entregado: ${rest[0]} ChengCoins.`};
 result.notice=result.alreadyProcessed?'📨 Esta operación ya fue confirmada.':notices[sub]??null;return renderClan(result,cmd);
});
