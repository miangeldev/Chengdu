import { defineCommand,contentOperationKey } from '../interfaces/whatsapp/command.js';
import { card } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';
const names={pvp:'⚔️ Victorias PvP',mission:'📋 Misiones',achievement:'🏅 Logros',boss:'👹 Jefes',event:'🏮 Eventos',ranking:'🏆 Podio de temporada'};
const commands={pvp:'pvp',mission:'mision',achievement:'logro',boss:'boss',event:'evento',ranking:'ranking'};
export const {command,run,createRun}=defineCommand('cturecompensas',async({game,identity,args,context,cmd})=>{
 const user=await game.users.getUserByIdentity(identity());requireGame(args.length<=2,'INVALID_ARGUMENTS');
 if(args.length){const sub=args[0].toLowerCase(),kind=Object.keys(commands).find(k=>commands[k]===sub),base={userId:user.id,operationKey:contentOperationKey(`acquisition:${sub}`,context,user.id)};let r;
  if(sub==='codigo'){requireGame(args.length===2,'INVALID_ARGUMENTS');r=await game.acquisition.redeemCode({...base,code:args[1]});}
  else {requireGame(kind && args.length===1,'INVALID_ARGUMENTS');r=await game.acquisition.claimReward({...base,kind});}
  return card('RECOMPENSA',[r.unit?`🎴 ¡Obtuviste *${r.unit.name}*!\n🔎 ${r.unit.id}`:'🍃 Esta vez no salió un personaje.\nEl intento quedó registrado; otra recompensa ganada ofrece una nueva oportunidad.',r.alreadyProcessed?'📨 Este intento ya fue procesado.':null],r.unit?`👉 ${cmd('ctuficha',r.unit.id)}`:`👉 ${cmd('cturecompensas')}`);
 }
 const r=await game.acquisition.listRewards({userId:user.id});return card('RECOMPENSAS',[...r.rewards.map(s=>`${names[s.kind]} · ${s.pending} pendientes\n🎲 ${s.chance}% de personaje${s.pending?`\n👉 ${cmd('cturecompensas',commands[s.kind])}`:''}`),r.promotion.active&&!r.promotion.redeemed&&r.promotion.remaining?`🎁 Bienvenida: ${cmd('cturecompensas',`codigo ${r.promotion.code}`)}\n📦 ${r.promotion.remaining} canjes disponibles`:null,'🎲 Cada premio ganado permite un intento. Los reintentos del mismo mensaje no generan otra tirada.\n🏮 Los personajes exclusivos requieren su evento activo.'],`🎴 ${cmd('ctupersonajes')}`);
});
