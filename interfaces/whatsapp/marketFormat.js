import { characterIcon, displayName, rarityIcon, rarityName, roleName } from './format.js';
import { variantName } from '../../game/units/collectibles.js';

export const marketDateText = value => new Date(value).toLocaleString('es-MX', {
  timeZone: 'America/Mexico_City', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});

export function marketUnitText(unit) {
  return `${characterIcon(unit.characterId)} *${displayName(unit.characterName)}* · Nv. ${unit.level}\n${rarityIcon(unit.rarity)} ${rarityName(unit.rarity)}${unit.role ? ` · ${roleName(unit.role)}` : ''}${unit.variant !== 'normal' ? ` · ✨ ${displayName(variantName(unit.variant))}` : ''}${unit.traits?.length ? ` · 🧬 ${unit.traits.length} ${unit.traits.length === 1 ? 'rasgo' : 'rasgos'}` : ''}`;
}

export const listingStatus = status => ({ active: '🔒 En el mercado', sold: '🤝 Vendido', cancelled: '↩️ Retirado', expired: '⌛ Anuncio vencido' })[status] ?? displayName(status);
