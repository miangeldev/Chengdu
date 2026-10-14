import { defineCommand,contentOperationKey } from '../interfaces/whatsapp/command.js';
import { card,displayName } from '../interfaces/whatsapp/format.js';
import { renderSocial,renderComparison } from '../interfaces/whatsapp/communityFormat.js';
import { requireGame } from '../utils/GameError.js';
export const {command,run,createRun}=defineCommand('ctusocial',async({game,identity,args,context,cmd})=>{
 const user=await game.users.getUserByIdentity(identity()),sub=(args[0]??'ayuda').toLowerCase(),rest=args.slice(1);
 if(sub==='ayuda')return card('PERFIL | PERSONALIZAR',[`❤️ ${cmd('ctusocial','favorito ID')}\n🌟 ${cmd('ctusocial','presentar ID1 ID2 ID3')}\n✍️ ${cmd('ctusocial','bio Tu presentación')}\n🎖️ ${cmd('ctusocial','titulos')}\n🏅 ${cmd('ctusocial','titulo L1')}\n⚖️ ${cmd('ctusocial','comparar ID1 ID2')}\n🧹 Usa ninguno para borrar favorito o título; presentar sin IDs vacía destacados.`, '👥 Colecciones públicas\nMenciona a alguien con .ctuperfil, .ctupersonajes o .ctushowcase.'],`🌟 ${cmd('ctushowcase')}`);
 if(sub==='titulos'){requireGame(rest.length===0,'INVALID_ARGUMENTS');const r=await game.social.getTitles(user.id);return card('TÍTULOS',r.titles.length?r.titles.map(t=>`${t.badge} *${displayName(t.name)}*\n👉 ${cmd('ctusocial',`titulo ${t.code}`)}`):['🌱 Aún no has desbloqueado títulos.'],`🏅 ${cmd('ctulogros')}`);}
 if(sub==='comparar'){requireGame(rest.length===2,'INVALID_ARGUMENTS');return renderComparison(await game.social.compareUnits({userId:user.id,unitIds:rest}),cmd);}
 const patch={};
 if(sub==='favorito'){requireGame(rest.length===1,'INVALID_ARGUMENTS');patch.favoriteUnitId=rest[0].toLowerCase()==='ninguno'?null:rest[0];}
 else if(sub==='presentar'){requireGame(rest.length<=3,'INVALID_ARGUMENTS');patch.featuredUnitIds=rest;}
 else if(sub==='titulo'){requireGame(rest.length===1,'INVALID_ARGUMENTS');patch.selectedTitleCode=rest[0].toLowerCase()==='ninguno'?null:rest[0];}
 else if(sub==='bio')patch.bio=rest.join(' ');
 else requireGame(false,'INVALID_ARGUMENTS');const r=await game.social.updatePreferences({userId:user.id,...patch,operationKey:contentOperationKey(`social:${sub}`,context,user.id)});return renderSocial(r.profile,cmd);
});
