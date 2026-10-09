const LINE = '------------------------';
const BORDER = '========================';

export function card(title, sections = [], footer = null) {
  return [BORDER, '🎴 *CHENGDÚ CARDS*', title, BORDER, '', sections.filter(Boolean).join(`\n\n${LINE}\n\n`), footer ? `\n${LINE}\n\n${footer}` : '', '', BORDER].join('\n');
}

export const section = (title, body) => `${title}\n\n${body}`;
export const commandText = (prefix, name, args = '') => `${prefix}${name}${args ? ` ${args}` : ''}`;
export const displayName = name => String(name).replace(/[*_~`]/g, c => ({ '*': '＊', '_': '＿', '~': '～', '`': '｀' })[c]);
export const rarityName = rarity => ({ common: 'Común', rare: 'Raro', epic: 'Épico', legendary: 'Legendario', mythic: 'Mítico' })[rarity] ?? rarity;
export const rarityIcon = rarity => ({ common: '⚪', rare: '🔵', epic: '🟣', legendary: '🟡', mythic: '🔴' })[rarity] ?? '🎴';
export const roleName = role => ({ tank: 'Tanque', attacker: 'Atacante', speed: 'Velocista', balanced: 'Equilibrado', control: 'Control', support: 'Soporte' })[role] ?? role;
export const characterIcon = id => ({ panda_guerrero: '🐼', mago_carmesi: '🔥', lobo_sombrio: '🐺', monje_celestial: '🧘', guardian_jade: '🛡️', bruja_lunar: '🌙', dragon_carmesi: '🐉', espiritu_bambu: '🎋' })[id] ?? '🎴';
export const statsText = stats => `❤️ Vida: ${stats.hp}\n⚔️ Ataque: ${stats.attack}\n🛡️ Defensa: ${stats.defense}\n💨 Velocidad: ${stats.speed}`;
export const serialText = serial => String(serial).padStart(4, '0');
export const dateText = date => date ? new Date(date).toLocaleDateString('es-MX', { timeZone: 'America/Mexico_City', day: 'numeric', month: 'long', year: 'numeric' }) : 'Fecha no registrada';
export const unitTitle = unit => `${characterIcon(unit.characterId)} *${displayName(unit.character.name)} #${serialText(unit.serial)}*`;

export function healthBar(hp, maxHp) {
  const filled = Math.ceil(Math.max(0, Math.min(1, hp / maxHp)) * 10);
  return `${'▓'.repeat(filled)}${'▒'.repeat(10 - filled)}`;
}
