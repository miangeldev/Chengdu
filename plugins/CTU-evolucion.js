import { defineCommand,contentOperationKey } from '../interfaces/whatsapp/command.js';
import { card,displayName } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';
export const {command,run,createRun}=defineCommand('ctuevolucion',async({game,identity,args,context,cmd})=>{
 const user=await game.users.getUserByIdentity(identity());requireGame(args.length>=1 && args.length<=2 && (args.length===1||args[1].toLowerCase()==='confirmar'),'INVALID_ARGUMENTS');
 if(args.length===2){const r=await game.evolution.evolve({userId:user.id,unitId:args[0],operationKey:contentOperationKey('evolve',context,user.id)});return card('EVOLUCIÓN',[`🔮 ${r.alreadyEvolved?'Evolución ya confirmada':'¡Tu personaje evolucionó!'}\n🎴 ${r.evolution.unitId}`, '✨ +5% en estadísticas, con redondeo hacia abajo.\n🧬 Conserva su ID, serial, rareza, rasgos, origen e historial.'],`🔎 ${cmd('ctuficha',r.evolution.unitId)}`);}
 const r=await game.evolution.getOptions({userId:user.id,unitId:args[0]});return card('EVOLUCIÓN',[r.form?`🔮 *${displayName(r.form.name)}*\n🎴 ${r.unit.id} · Nv. ${r.unit.progress.level}`:'🍃 Este personaje no tiene evolución disponible.',`📋 Requisitos: nivel ${r.minimumLevel} · ${r.coins} ChengCoins · 1 sello\n💰 Tienes ${r.balance} · 🔮 ${r.materials.sellos} sellos`,r.unit.evolution?'✅ Esta unidad ya evolucionó.':r.available?'✨ Lista para evolucionar.':'🌱 Completa los requisitos y libera la unidad si está reservada.'],r.available?`✅ ${cmd('ctuevolucion',`${r.unit.id} confirmar`)}`:`🔨 Sello: ${cmd('ctucrafting')}\n🔎 ${cmd('ctuficha',r.unit.id)}`);
});
