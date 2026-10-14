import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card,displayName,rarityIcon } from '../interfaces/whatsapp/format.js';
import { requireGame } from '../utils/GameError.js';
export const {command,run,createRun}=defineCommand('ctushowcase',async({game,identity,args,context,cmd})=>{
 requireGame(args.length<=1 && context.mentions.length<=1 && (args.length===0||context.mentions.length===1),'INVALID_ARGUMENTS');
 const user=await game.users.getUserByIdentity(context.mentions.length?{provider:'whatsapp',subject:context.mentions[0]}:identity()),p=await game.social.getShowcase({userId:user.id});
 const rows=[['💎 Más rara',p.highlights.rarest],['🌱 Primera unidad',p.highlights.oldest],['🏆 Más victorias',p.highlights.mostVictories]];
 return card('SHOWCASE',[`🌟 *${displayName(p.player.name)}*`,p.favorite?`❤️ Favorito: *${displayName(p.favorite.name)}* · Nv. ${p.favorite.progress.level}`:null,p.featured.length?`🎴 Destacados\n${p.featured.map(u=>`${rarityIcon(u.rarity)} ${displayName(u.name)} · Nv. ${u.progress.level}`).join('\n')}`:null,...rows.filter(([,u])=>u).map(([label,u])=>`${label}\n${rarityIcon(u.rarity)} *${displayName(u.name)}* · Nv. ${u.progress.level}\n🏆 ${u.battleStats.wins} victorias`),p.player.unitCount?null:'🎋 La colección aún está por comenzar.'],`✍️ ${cmd('ctusocial','ayuda')}`);
});
