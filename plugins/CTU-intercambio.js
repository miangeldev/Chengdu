import { defineCommand,contentOperationKey,pageArguments,pageNavigation } from '../interfaces/whatsapp/command.js';
import { card,displayName } from '../interfaces/whatsapp/format.js';
import { renderTrade } from '../interfaces/whatsapp/communityFormat.js';
import { requireGame } from '../utils/GameError.js';
export const {command,run,createRun}=defineCommand('ctuintercambio',async({game,identity,args,context,cmd,prefix})=>{
 const user=await game.users.getUserByIdentity(identity()),sub=(args[0]??'mios').toLowerCase(),rest=args.slice(1),base={userId:user.id,chatId:context.chatId},op=()=>contentOperationKey(`trade:${sub}`,context,user.id);
 if(sub==='ayuda')return card('INTERCAMBIO | GUÍA',[`🤝 ${cmd('ctuintercambio','crear @jugador')}\n📝 ${cmd('ctuintercambio','oferta I1 100 PAND-000001')}\n💰 El número es la cantidad de monedas. Usa 0 si ofreces sólo unidades.\n🎴 Hasta 3 unidades por persona.`, '🔒 La primera confirmación congela ambas ofertas y reserva los bienes.\n✅ La segunda confirmación entrega el intercambio completo.\n↩️ Cancelar o dejar vencer devuelve las reservas.'],`✅ ${cmd('ctuintercambio','confirmar I1')}\n↩️ ${cmd('ctuintercambio','cancelar I1')}\n🔎 ${cmd('ctuintercambio','ver I1')}`);
 if(sub==='mios'){const p=await game.trades.listMyTrades({...base,...pageArguments(rest)});return card('TUS INTERCAMBIOS',p.items.length?p.items.map(t=>`🤝 ${t.participantNames.map(p=>displayName(p.name)).join(' ↔ ')} · ${displayName(t.status)}\n👉 ${cmd('ctuintercambio',`ver ${t.code}`)}`):['🤝 Todavía no tienes intercambios.'],`${pageNavigation(p,'ctuintercambio',prefix,'mios')}\n📨 ${cmd('ctuintercambio','crear @jugador')}`);}
 if(sub==='ver'){requireGame(rest.length===1,'INVALID_ARGUMENTS');return renderTrade({trade:await game.trades.getTrade({...base,code:rest[0]})},cmd);}
 let result;
 if(sub==='crear'){requireGame(rest.length===1 && context.mentions.length===1,'INVALID_OPPONENT');const opponent=await game.users.getUserByIdentity({provider:'whatsapp',subject:context.mentions[0]});result=await game.trades.create({...base,opponentId:opponent.id,operationKey:op()});}
 else if(sub==='oferta'){requireGame(rest.length>=2 && rest.length<=5 && /^\d+$/.test(rest[1]),'INVALID_ARGUMENTS');result=await game.trades.setOffer({...base,code:rest[0],coins:Number(rest[1]),unitIds:rest.slice(2),operationKey:op()});}
 else if(['confirmar','cancelar'].includes(sub)){requireGame(rest.length===1,'INVALID_ARGUMENTS');result=await game.trades[sub==='confirmar'?'confirm':'cancel']({...base,code:rest[0],operationKey:op()});}
 else requireGame(false,'INVALID_ARGUMENTS');return renderTrade(result,cmd);
});
