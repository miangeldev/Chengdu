import { defineCommand,contentOperationKey } from '../interfaces/whatsapp/command.js';
import { card,displayName } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';
const material=m=>`🪵 ${m.fragmentos} fragmentos · ✨ ${m.esencias} esencias · 🔮 ${m.sellos} sellos`;
export const {command,run,createRun}=defineCommand('ctucrafting',async({game,identity,args,context,cmd})=>{
 const user=await game.users.getUserByIdentity(identity());requireGame(args.length<=2,'INVALID_ARGUMENTS');const sub=(args[0]??'recetas').toLowerCase(),op=()=>contentOperationKey(`craft:${sub}`,context,user.id);
 if(sub==='reclamar'){requireGame(args.length===1,'INVALID_ARGUMENTS');const r=await game.crafting.claimMaterials({userId:user.id,operationKey:op()});return card('MATERIALES',[r.alreadyClaimed?'📨 Materiales ya entregados.':'🎒 ¡Materiales recogidos!',material(r.action.materialsAfter)],`🔨 ${cmd('ctucrafting')}`);}
 if(sub==='crear'){requireGame(args.length===2,'INVALID_ARGUMENTS');const r=await game.crafting.craft({userId:user.id,recipeId:args[1],operationKey:op()});return card('CRAFTING',[`🔨 ${r.alreadyCrafted?'Creación ya confirmada':'¡Creación completada!'}\n${displayName(args[1])}`,material(r.action.materialsAfter),`💰 Coste: ${r.action.coins} ChengCoins`],`🔮 ${cmd('ctuevolucion','ID')}\n🎒 ${cmd('ctuinventario')}`);}
 requireGame(['recetas','materiales'].includes(sub) && args.length<=1,'INVALID_ARGUMENTS');const i=await game.crafting.getInventory(user.id),r=await game.crafting.getRecipes(user.id);
 return card('CRAFTING',[material(i.materials),i.pendingSources?`🎁 ${i.pendingSources} recompensas con materiales pendientes\n👉 ${cmd('ctucrafting','reclamar')}`:'🌿 Consigue materiales en combates, misiones, logros, jefes y temporadas.',...r.recipes.map(recipe=>`🔨 *${displayName(recipe.name??recipe.id)}*\n💰 ${recipe.coins} ChengCoins\n🧩 ${Object.entries(recipe.inputs).filter(([,n])=>n).map(([k,n])=>`${n} ${k}`).join(' · ')}\n👉 ${cmd('ctucrafting',`crear ${recipe.id}`)}`)],`🎒 ${cmd('ctuinventario')}\n🔮 Evolución: ${cmd('ctuevolucion','ID')}`);
});
