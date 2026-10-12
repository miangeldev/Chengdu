// Declarative, versioned content. The classic attack fields are deliberately untouched.
export const COMBAT_CONTENT_VERSION = 1;
export const COMBAT_ELEMENTS = Object.freeze(['neutral', 'fire', 'water', 'nature', 'light', 'dark']);
export const COMBAT_EFFECTS = Object.freeze(['poison', 'burn', 'stun', 'shield', 'regeneration', 'attack_up', 'defense_down']);

const effect = (type, target, duration, potency) => ({ type, target, duration, potency });
const ability = (id, name, description, effects) => ({ id, name, description, trigger: 'on_enter', effects });
const characters = {
  panda_guerrero: { element: 'nature', ability: ability('piel_bambu', 'Piel de Bambú', 'Al entrar por primera vez obtiene un escudo de 12 puntos durante 2 turnos propios.', [effect('shield', 'self', 2, 12)]) },
  mago_carmesi: { element: 'fire', ability: ability('sangre_carmesi', 'Sangre Carmesí', 'Al entrar por primera vez aumenta su ataque un 12% durante 2 turnos propios.', [effect('attack_up', 'self', 2, 12)]) },
  lobo_sombrio: { element: 'dark', ability: ability('mirada_nocturna', 'Mirada Nocturna', 'Al entrar por primera vez obtiene un escudo de 10 puntos durante 2 turnos propios y reduce la defensa del rival un 10% durante 2 turnos propios del rival.', [effect('defense_down', 'enemy', 2, 10), effect('shield', 'self', 2, 10)]) },
  monje_celestial: { element: 'light', ability: ability('serenidad', 'Serenidad', 'Al entrar por primera vez obtiene un escudo de 6 puntos durante 2 turnos propios y regenera un 8% de su vida máxima al comenzar cada uno de sus próximos 3 turnos, sin superar su vida máxima.', [effect('regeneration', 'self', 3, 8), effect('shield', 'self', 2, 6)]) },
  guardian_jade: { element: 'nature', ability: ability('muralla_jade', 'Muralla de Jade', 'Al entrar por primera vez obtiene un escudo de 18 puntos durante 2 turnos propios.', [effect('shield', 'self', 2, 18)]) },
  bruja_lunar: { element: 'water', ability: ability('marea_lunar', 'Marea Lunar', 'Al entrar por primera vez envenena al rival: 3% de vida máxima durante 2 turnos propios del rival.', [effect('poison', 'enemy', 2, 3)]) },
  dragon_carmesi: { element: 'fire', ability: ability('ascua_ancestral', 'Ascua Ancestral', 'Al entrar por primera vez aumenta su ataque un 10% durante 2 turnos propios.', [effect('attack_up', 'self', 2, 10)]) },
  espiritu_bambu: { element: 'nature', ability: ability('pulso_bosque', 'Pulso del Bosque', 'Al entrar por primera vez recupera un 6% de su vida máxima durante 3 turnos propios.', [effect('regeneration', 'self', 3, 6)]) }
};
const specials = {
  panda_guerrero: { power: 36, accuracy: 85, effects: [effect('shield', 'self', 2, 12)] },
  mago_carmesi: { power: 36, accuracy: 80, effects: [effect('burn', 'enemy', 2, 4)] },
  lobo_sombrio: { power: 35, accuracy: 85, effects: [effect('defense_down', 'enemy', 2, 15)] },
  monje_celestial: { power: 32, accuracy: 90, effects: [effect('regeneration', 'self', 2, 6)] },
  guardian_jade: { power: 30, accuracy: 85, cooldown: 3, effects: [effect('stun', 'enemy', 1, 1)] },
  bruja_lunar: { power: 31, accuracy: 85, effects: [effect('poison', 'enemy', 3, 5)] },
  dragon_carmesi: { power: 38, accuracy: 80, effects: [effect('burn', 'enemy', 2, 4)] },
  espiritu_bambu: { power: 30, accuracy: 90, effects: [effect('regeneration', 'self', 2, 7)] }
};

export function combatProfile(characterId) {
  return structuredClone({ version: COMBAT_CONTENT_VERSION,
    ...(Object.hasOwn(characters, characterId) ? characters[characterId] : { element: 'neutral', ability: null }) });
}

export function attackCombatProfile(attackId, base = {}) {
  const match = /^(.*)_([12])$/.exec(attackId);
  const characterId = match?.[1];
  const known = Object.hasOwn(characters, characterId ?? '');
  const special = match?.[2] === '2' || attackId === 'golpe_potente';
  const magic = ['mago_carmesi', 'bruja_lunar', 'espiritu_bambu'].includes(characterId);
  return structuredClone({
    version: COMBAT_CONTENT_VERSION, power: base.power ?? (special ? 40 : 25), accuracy: base.accuracy ?? (special ? 80 : 100),
    type: known && magic ? 'magic' : (base.type ?? 'physical'), element: known ? characters[characterId].element : 'neutral',
    effects: [], cooldown: special ? 2 : 0, ...(special && known ? specials[characterId] : {})
  });
}

export function advancedAttack(attack) {
  const { combat, ...base } = structuredClone(attack);
  const profile = combat ?? attackCombatProfile(attack.id, attack);
  return { ...base, power: profile.power, accuracy: profile.accuracy, type: profile.type,
    element: profile.element, effects: profile.effects, cooldown: profile.cooldown, combatVersion: profile.version };
}

const integer = (value, min, max) => Number.isSafeInteger(value) && value >= min && value <= max;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 500;
export function validateEffectDefinition(value) {
  return value !== null && typeof value === 'object' && COMBAT_EFFECTS.includes(value.type) && ['self', 'enemy'].includes(value.target) &&
    integer(value.duration, 1, 5) && integer(value.potency, 1, value.type === 'shield' ? 1000 : value.type === 'stun' ? 1 : 50);
}
function validateEffects(effects) {
  return Array.isArray(effects) && effects.length <= 3 && effects.every(validateEffectDefinition) &&
    new Set(effects.map(e => `${e.type}:${e.target}`)).size === effects.length;
}
export function validateCombatProfile(value) {
  if (!value || value.version !== 1 || !COMBAT_ELEMENTS.includes(value.element)) return false;
  return value.ability === null || (!!value.ability && text(value.ability.id) && text(value.ability.name) && text(value.ability.description) &&
    value.ability.trigger === 'on_enter' && validateEffects(value.ability.effects));
}
export function validateAttackCombatProfile(value) {
  return !!value && value.version === 1 && integer(value.power, 1, 10000) && integer(value.accuracy, 1, 100) &&
    ['physical', 'magic'].includes(value.type) && COMBAT_ELEMENTS.includes(value.element) && integer(value.cooldown, 0, 5) && validateEffects(value.effects);
}
