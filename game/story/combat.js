import { isDeepStrictEqual } from 'node:util';
import { requireGame } from '../../utils/GameError.js';
import { activeUnit, calculateAdvancedDamage, initializeAdvancedBattle, resolveAdvancedAction } from '../battle/advancedEngine.js';
import { createStoryBattle as createLegacy, storyBattleView as legacyView } from './combatV2.js';
import { createStoryBattle as createV3, resolveStoryAction as resolveV3, storyBattleView as viewV3,
  storyEncounter as encounterV3, storyCombatPolicy as policyV3 } from './combatV3.js';

export const STORY_COMBAT_VERSION = 4;
export const storyCombatVersion = contentVersion => contentVersion < 3 ? contentVersion : STORY_COMBAT_VERSION;
export const STORY_DEFENSE_PERCENT = 70;
const PLAYER = 'custodian', ENEMY = 'echo', FAR_FUTURE = '9999-12-31T23:59:59.999Z';
const integer = (value, min = 0, max = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= min && value <= max;
const date = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const event = (type, text, extra = {}) => ({ type, text, ...extra });
const ALIASES = Object.freeze({ TRIAL1: 'I05', TRIAL2: 'III05', TRIAL3: 'V05' });
const definitions = {
  P03: ['Eco desorientado', 'tutorial', 110, 13, 12, 0],
  I03: ['Eco de Tinta', 'miniboss', 245, 22, 20, 0],
  I04: ['Acechador de Tinta', 'ambush', 160, 20, 18, 0],
  I05: ['Guardián Marchito', 'roots', 245, 22, 22, 1],
  II05: ['Mercader Sin Rostro', 'illusions', 270, 21, 20, 2],
  III01: ['Huan', 'duel', 185, 22, 20, 0],
  III03: ['Los Tres Reflejos', 'reflections', 245, 22, 21, 0],
  III05: ['Centinela del Espejo', 'mirror', 240, 22, 23, 2],
  IV02A: ['Eco de la Plaza · Tao', 'protection', 150, 22, 20, 0],
  IV02B: ['Eco de la Plaza · Mei', 'protection', 165, 22, 21, 0],
  IV02C: ['Eco de la Plaza · Yun', 'protection', 180, 23, 21, 0],
  IV05: ['Campana del Conflicto', 'tension', 290, 23, 24, 2],
  V02: ['Guardián Olvidado', 'echoes', 200, 22, 22, 0],
  V04: ['Huan · Juicio del Vínculo', 'duel', 230, 23, 22, 0],
  V05: ['El Archivista', 'final', 360, 20, 24, 4]
};
export const STORY_ENCOUNTERS = Object.freeze(Object.fromEntries(Object.entries({ ...definitions,
  ...Object.fromEntries(Object.entries(ALIASES).map(([id, source]) => [id, definitions[source]])) }).map(([id, row]) => [id, Object.freeze({ id,
    name: row[0], kind: row[1], element: 'dark', stats: Object.freeze({ hp: row[2], attack: row[3], defense: row[4], speed: 10 }),
    requiredDefeats: Object.hasOwn(ALIASES, id) ? 0 : row[5] })])));

export function storyCombatPolicy(encounterId, version = STORY_COMBAT_VERSION) {
  if (version < STORY_COMBAT_VERSION) return policyV3(encounterId, version);
  requireGame(version === STORY_COMBAT_VERSION, 'INVALID_STORY_COMBAT_VERSION');
  requireGame(Object.hasOwn(STORY_ENCOUNTERS, encounterId), 'STORY_ENCOUNTER_NOT_FOUND');
  return { version: STORY_COMBAT_VERSION, requiredDefeats: STORY_ENCOUNTERS[encounterId].requiredDefeats, scoutingTurnLimit: 20 };
}
export function storyEncounter(encounterId, version = STORY_COMBAT_VERSION) {
  if (version < STORY_COMBAT_VERSION) return encounterV3(encounterId, version);
  requireGame(version === STORY_COMBAT_VERSION, 'INVALID_STORY_COMBAT_VERSION');
  requireGame(Object.hasOwn(STORY_ENCOUNTERS, encounterId), 'STORY_ENCOUNTER_NOT_FOUND');
  return structuredClone(STORY_ENCOUNTERS[encounterId]);
}

function attack(id, name, power, effects = []) {
  return { id, name, power, accuracy: 100, type: 'physical', element: 'dark', effects, cooldown: 0, combatVersion: 1 };
}
function opponent(definition, size) {
  const factor = 100 + (size - 1) * 55;
  const stats = { ...definition.stats, hp: Math.ceil(definition.stats.hp * factor / 100) };
  return { id: `story-enemy:${definition.id}`, characterId: `story_${definition.id.toLowerCase()}`, characterName: definition.name,
    level: 6, serial: null, stats, hp: stats.hp, profileVersion: 1, element: 'dark', ability: null,
    attacks: [attack('story_pressure', 'Presión de tinta', 5), attack('story_unleash', 'Descarga de tinta', 75)] };
}
function normalizeContext(context) {
  requireGame(context && typeof context === 'object' && !Array.isArray(context) &&
    Object.keys(context).every(key => ['huanSupport', 'helpedEchoes', 'encounterStep'].includes(key)) &&
    ['huanSupport', 'helpedEchoes'].every(key => context[key] === undefined || typeof context[key] === 'boolean') &&
    (context.encounterStep === undefined || typeof context.encounterStep === 'string' && context.encounterStep.length <= 100), 'INVALID_STORY_CONTEXT');
  return { huanSupport: context.huanSupport ?? false, helpedEchoes: context.helpedEchoes ?? false,
    ...(context.encounterStep === undefined ? {} : { encounterStep: context.encounterStep }) };
}
function learningFor(encounterId, learning) {
  const policy = storyCombatPolicy(encounterId);
  requireGame(learning && typeof learning === 'object' && !Array.isArray(learning) &&
    Object.keys(learning).every(key => ['defeats', 'required'].includes(key)) && integer(learning.defeats ?? 0) &&
    (learning.required === undefined || learning.required === policy.requiredDefeats), 'INVALID_STORY_LEARNING');
  return { defeats: learning.defeats ?? 0, required: policy.requiredDefeats,
    remaining: Math.max(0, policy.requiredDefeats - (learning.defeats ?? 0)), scouting: (learning.defeats ?? 0) < policy.requiredDefeats };
}
function kind(battle) { return STORY_ENCOUNTERS[battle.encounterId].kind; }
function phaseFor(battle) {
  const round = battle.actions.length + 1, mechanic = kind(battle), boss = activeUnit(battle.core.players[1]);
  if (mechanic === 'tutorial') return 'tutorial';
  if (mechanic === 'final') {
    const ratio = boss.hp * 100 / boss.stats.hp;
    const chapter = ratio > 66 ? 'memory' : ratio > 33 ? 'control' : 'choice';
    if (chapter === 'memory') return battle.mechanics.revealed ? (round % 4 === 0 ? 'unleash' : 'memory') : 'memory';
    if (chapter === 'control') return round % 4 === 0 ? 'unleash' : 'control';
    return round % 3 === 0 ? 'protect' : 'choice';
  }
  if (mechanic === 'tension') return battle.mechanics.tension >= 5 ? 'tension' : ['strike', 'charge', 'unleash', 'exposed'][(round - 1) % 4];
  if (mechanic === 'illusions') return ['illusions', 'strike', 'charge', 'unleash', 'exposed'][(round - 1) % 5];
  if (mechanic === 'roots') return ['roots', 'charge', 'unleash', 'exposed'][(round - 1) % 4];
  if (mechanic === 'mirror') return battle.mechanics.copiedSkill ? 'reflect' : ['strike', 'charge', 'unleash', 'exposed'][(round - 1) % 4];
  if (mechanic === 'reflections') return ['damage', 'defense', 'support'][(Math.floor((round - 1) / 3)) % 3];
  if (mechanic === 'protection') return round % 3 === 0 ? 'protect' : 'strike';
  return ['strike', 'charge', 'unleash', 'exposed'][(round - 1) % 4];
}
function reflect(battle) {
  battle.players = structuredClone(battle.core.players);
  battle.turnNumber = battle.actions.length + (battle.status === 'active' ? 1 : 0);
  if (battle.status !== 'active') { battle.enemyIntent = null; return battle; }
  const type = phaseFor(battle);
  const descriptions = {
    tutorial: 'El Eco está confundido. Puedes vencer atacando; defender y usar tu habilidad son prácticas opcionales.',
    strike: 'La tinta prepara un golpe rápido: el enemigo no dejará de presionarte.',
    charge: '⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.',
    unleash: '⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.',
    exposed: 'Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.',
    roots: '🌿 Las raíces vuelven a cubrirlo. Romper abre paso al ataque básico; el Guardián responderá.',
    illusions: '🪞 Renovará sus reflejos. Observar reconoce al original y consume un turno bajo presión.',
    reflect: '🪞 El Centinela copiará tu última habilidad. Defiende o cambia de estrategia antes de repetirla.',
    damage: 'Primer reflejo: demuestra una acción ofensiva; seguirá presionando.',
    defense: 'Segundo reflejo: defender crea una apertura para el equipo.',
    support: 'Tercer reflejo: apoyar restaura el vínculo y daña el reflejo.',
    protect: '🛡️ ¡Protege al equipo y a los aliados de la descarga dirigida!',
    tension: '🔔 Tensión crítica. Purifica antes de que la Campana descargue toda la hostilidad.',
    memory: '📜 MEMORIA: observa qué registro conserva su nombre para atravesar los Ecos.',
    control: '🔒 CONTROL: las habilidades pueden quedar selladas. Purifica o alterna ataques y defensa.',
    choice: '🕊️ ELECCIÓN: protege al equipo cuando el Sello concentre toda su fuerza.'
  };
  battle.enemyIntent = { type, text: descriptions[type] };
  battle.pressure = { everyTurn: true, reservePercent: kind(battle) !== 'tutorial' && battle.core.players[0].units.length > 1 ? 3 : 0 };
  return battle;
}

export function createStoryBattle({ version = STORY_COMBAT_VERSION, learning = {}, context = {}, ...request }) {
  if (version < STORY_COMBAT_VERSION) return createV3({ ...request, version, learning, context });
  requireGame(version === STORY_COMBAT_VERSION, 'INVALID_STORY_COMBAT_VERSION');
  // Reuse the published snapshot validation without changing its implementation.
  createLegacy({ ...request, encounterId: 'P03', version: 2 });
  const definition = storyEncounter(request.encounterId, version);
  const frozenLearning = learningFor(request.encounterId, learning), frozenContext = normalizeContext(context);
  const core = initializeAdvancedBattle({ id: request.id, rulesVersion: 2, acceptedAt: request.now,
    players: [{ userId: PLAYER, name: 'Custodio', units: structuredClone(request.units) },
      { userId: ENEMY, name: definition.name, units: [opponent(definition, request.units.length)] }] });
  core.turnUserId = PLAYER;
  return reflect({ version: STORY_COMBAT_VERSION, id: request.id, encounterId: request.encounterId, status: 'active', createdAt: request.now,
    updatedAt: request.now, finishedAt: null, finishReason: null, turnNumber: 1, unitSnapshots: structuredClone(request.units),
    players: [], actions: [], tutorial: { attack: false, defend: false, skill: false }, enemyIntent: null, learning: frozenLearning,
    context: frozenContext, mechanics: initialMechanics(definition.kind, frozenContext), core });
}

function initialMechanics(mechanic, context) {
  return { barrier: mechanic === 'roots' ? 45 : 0,
    revealed: !['illusions', 'final'].includes(mechanic) || mechanic === 'final' && context.helpedEchoes,
    copiedSkill: null, tension: 0, recklessStreak: 0, supportCooldown: 0, purifyCooldown: 0, sealTurns: 0, finalPhase: 'memory',
    lessons: { damage: false, defense: false, support: false }, npcSafety: mechanic === 'protection' ? 100 : null };
}

// Conversion happens together with the next real action. Published turns remain
// unchanged and are replayed by their original engine before this boundary.
export function upgradeStoryBattle(previous) {
  requireGame(previous && (previous.version === 3 || [1, 2].includes(previous.version) && previous.encounterId === 'P03') &&
    previous.status === 'active' && !previous.combatUpgrade, 'INVALID_STORY_COMBAT_UPGRADE');
  const battle = structuredClone(previous);
  battle.version = STORY_COMBAT_VERSION;
  battle.combatUpgrade = { fromVersion: previous.version, afterActions: previous.actions.length };
  battle.learning = learningFor(battle.encounterId, { defeats: previous.learning?.defeats ?? 0 });
  battle.context ??= normalizeContext({});
  battle.mechanics ??= initialMechanics(kind(battle), battle.context);
  return reflect(battle);
}

function execute(core, userId, type, choice, roll, now) {
  core.expiresAt = FAR_FUTURE;
  return resolveAdvancedAction(core, { userId, type, choice, roll: type === 'attack' ? roll : null, now });
}
function wait(core, userId, now) {
  const actor = activeUnit(core.players.find(player => player.userId === userId));
  const originalAttacks = actor.attacks;
  actor.attacks = [...actor.attacks, attack('story_wait', 'Tomar posición', 1)];
  actor.attacks.at(-1).accuracy = 1;
  const result = execute(core, userId, 'attack', 'story_wait', 99, now);
  result.battle.players.find(player => player.userId === userId).units.find(unit => unit.id === actor.id).attacks = originalAttacks;
  return result;
}
function describe(core, action) {
  const all = core.players.flatMap(player => player.units), actor = all.find(unit => unit.id === action.actorUnitId), target = all.find(unit => unit.id === action.targetUnitId);
  const events = [];
  if (action.attackId && action.attackId !== 'story_wait') {
    const move = (actor?.attacks.find(move => move.id === action.attackId) ?? actor?.fatality?.attack)?.name ?? 'Ofensiva';
    events.push(event(action.hit ? 'attack' : 'miss', action.hit ? `${actor.characterName} usó ${move}: ${action.damage} de daño a ${target.characterName}.` : `${actor.characterName} usó ${move}, pero falló.`,
      { unitId: target.id, sourceUnitId: actor.id, amount: action.damage, attackName: move }));
  }
  for (const effect of action.events) {
    if (effect.type === 'effect_tick') events.push(event('effect_tick', `${all.find(unit => unit.id === effect.unitId)?.characterName}: ${effect.effect === 'regeneration' ? '+' : '-'}${effect.amount} HP por ${effect.effect === 'burn' ? 'quemadura' : effect.effect === 'poison' ? 'veneno' : 'regeneración'}.`, effect));
    if (['switch', 'auto_switch'].includes(effect.type)) events.push(event(effect.type, `${all.find(unit => unit.id === effect.unitId)?.characterName} entra al combate.`, effect));
    if (effect.type === 'knockout') events.push(event('knockout', `${all.find(unit => unit.id === effect.unitId)?.characterName} queda fuera de combate.`, effect));
    if (effect.type === 'stun') events.push(event('stun', `${all.find(unit => unit.id === effect.unitId)?.characterName} está aturdido y no puede actuar este turno.`, effect));
    if (effect.type === 'mask_changed') events.push(event('mask_changed', `🎭 ${all.find(unit => unit.id === effect.unitId)?.characterName} adopta la Máscara ${effect.maskName}.`, effect));
    if (effect.type === 'effect_applied' && effect.effect === 'stun') events.push(event('effect_applied', `${all.find(unit => unit.id === effect.unitId)?.characterName} queda aturdido durante ${effect.remaining} turno(s).`, effect));
  }
  return events;
}
function healParty(core, activePercent, reservePercent, events) {
  const party = core.players[0];
  for (const unit of party.units) {
    if (unit.hp === 0) continue;
    const percent = activeUnit(party).id === unit.id ? activePercent : reservePercent;
    const amount = Math.min(unit.stats.hp - unit.hp, Math.max(1, Math.floor(unit.stats.hp * percent / 100)));
    if (amount > 0) { unit.hp += amount; events.push(event('healed', `${unit.characterName} recupera ${amount} HP.`, { unitId: unit.id, amount })); }
  }
}
function temporaryShield(unit, amount) {
  const original = unit.effects.find(effect => effect.type === 'shield');
  unit.effects = unit.effects.filter(effect => effect.type !== 'shield');
  if (amount + (original?.potency ?? 0) > 0) unit.effects.push({ type: 'shield', remaining: original?.remaining ?? 2,
    potency: amount + (original?.potency ?? 0), sourceUnitId: original?.sourceUnitId ?? unit.id, appliedAtTurn: original?.appliedAtTurn ?? 0 });
  return { original: original ? structuredClone(original) : null, amount, unitId: unit.id };
}
function restoreShield(core, playerIndex, temporary, action) {
  const unit = core.players[playerIndex].units.find(unit => unit.id === temporary.unitId);
  const current = unit.effects.find(effect => effect.type === 'shield');
  const absorbed = action.events.filter(effect => effect.type === 'shield_absorbed' && effect.unitId === unit.id).reduce((sum, effect) => sum + effect.amount, 0);
  const potency = Math.max(0, (current?.potency ?? 0) - Math.max(0, temporary.amount - absorbed));
  unit.effects = unit.effects.filter(effect => effect.type !== 'shield');
  if (temporary.original && potency > 0 && unit.hp > 0) unit.effects.push({ ...temporary.original, potency });
}
function directEnemyDamage(battle, amount, events, source) {
  if (battle.core.status !== 'active') return;
  const boss = activeUnit(battle.core.players[1]);
  const actual = Math.min(boss.hp, amount);
  boss.hp -= actual;
  if (actual > 0) events.push(event(source, `La respuesta del vínculo causa ${actual} de daño al enemigo.`, { unitId: boss.id, amount: actual }));
  if (boss.hp === 0) finishCore(battle.core, PLAYER, 'knockout', battle.updatedAt);
}
function finishCore(core, winnerId, reason, now) {
  core.status = 'finished'; core.winnerId = winnerId; core.finishReason = reason; core.finishedAt = now; core.turnUserId = null;
}
function scoutingDefeat(battle, now, events) {
  const boss = activeUnit(battle.core.players[1]);
  if (boss.hp === 0) {
    boss.hp = 1;
    events.push(event('scouting_barrier', '🛡️ La barrera de reconocimiento desvía el remate: el jefe resiste con 1 HP y responde con su furia.', { unitId: boss.id }));
  }
  for (const unit of battle.core.players[0].units) { unit.hp = 0; unit.effects = []; unit.cooldowns = {}; }
  finishCore(battle.core, ENEMY, 'knockout', now);
  events.push(event('scouting_defeat', '📖 La barrera de reconocimiento desata su furia y derrota al equipo. Este intento cuenta para aprender el patrón; las retiradas no cuentan.'));
}
function visibleMechanics(battle) {
  const m = battle.mechanics, mechanic = kind(battle);
  const learning = battle.learning.scouting ? `📖 Reconocimiento obligatorio: faltan ${battle.learning.remaining} derrotas reales antes de que pueda caer. ` : '';
  const descriptions = {
    tutorial: 'Puedes vencer atacando. Defender y probar tu habilidad son prácticas opcionales; el Eco no tiene derrotas obligatorias.',
    roots: `🌿 Barrera: ${m.barrier}. La carga y la apertura también causan daño.`,
    illusions: m.revealed ? '👁️ Original reconocido. El enemigo sigue atacando.' : '🪞 Señuelos activos: observa bajo presión.',
    reflections: `Prácticas opcionales: daño ${m.lessons.damage ? '✓' : '○'} · defensa ${m.lessons.defense ? '✓' : '○'} · apoyo ${m.lessons.support ? '✓' : '○'}. Puedes vencer sin completarlas todas.`,
    mirror: m.copiedSkill ? `🪞 Copiará ${m.copiedSkill.name}. Defiende la réplica.` : '🪞 Guarda la última habilidad destacada y la devolverá.',
    protection: `🛡️ Seguridad del aliado: ${m.npcSafety}/100. Proteger evita la próxima presión sobre él.`,
    tension: `🔔 Tensión: ${m.tension}/6. Purificar reduce 3 y defender reduce 1.`,
    final: `📜 ${m.finalPhase === 'memory' ? 'MEMORIA' : m.finalPhase === 'control' ? 'CONTROL' : 'ELECCIÓN'} · Sello: ${m.sealTurns} turnos · ${m.revealed ? 'Registros reconocidos' : 'Observa los registros'}`
  };
  if (mechanic === 'tutorial') return descriptions.tutorial;
  return learning + (descriptions[mechanic] ?? 'El rival responde en todos los turnos. El apoyo tiene enfriamiento.') + ` Ofensiva seguida: ${m.recklessStreak}/3; alterna acciones para evitar la represalia.`;
}

export function resolveStoryAction(previous, { action, choice = null, rolls = null, now }) {
  if (previous?.version < STORY_COMBAT_VERSION) return resolveV3(previous, { action, choice, rolls, now });
  requireGame(previous?.version === STORY_COMBAT_VERSION && previous.status === 'active', 'STORY_BATTLE_NOT_ACTIVE');
  requireGame(date(now) && Date.parse(now) >= Date.parse(previous.updatedAt), 'INVALID_TIMESTAMP');
  const random = rolls === null ? [0, 0] : rolls;
  requireGame(Array.isArray(random) && random.length === 2 && random.every(roll => integer(roll, 0, 99)), 'INVALID_RANDOM_ROLL');
  requireGame(['attack', 'defend', 'skill', 'switch', 'surrender', 'break', 'observe', 'support', 'protect', 'purify'].includes(action), 'INVALID_STORY_ACTION');
  const mechanic = kind(previous), phase = previous.enemyIntent.type;
  requireGame(mechanic !== 'tutorial' || ['attack', 'defend', 'skill', 'switch', 'surrender'].includes(action), 'INVALID_STORY_ACTION');
  requireGame(action !== 'break' || previous.mechanics.barrier > 0, 'STORY_NOT_BREAKABLE');
  requireGame(action !== 'observe' || ['illusions', 'final'].includes(mechanic) && !previous.mechanics.revealed, 'STORY_NOT_OBSERVABLE');
  requireGame(action !== 'protect' || mechanic === 'protection' || mechanic === 'final' && previous.mechanics.finalPhase === 'choice', 'STORY_NOT_PROTECTABLE');
  requireGame(action !== 'purify' || ['tension', 'final'].includes(mechanic), 'STORY_NOT_PURIFIABLE');
  requireGame(action !== 'purify' || previous.mechanics.purifyCooldown === 0, 'STORY_ACTION_COOLDOWN');
  requireGame(action !== 'support' || previous.mechanics.supportCooldown === 0, 'STORY_ACTION_COOLDOWN');
  const selectedChoice = action === 'skill' ? '2' : action === 'attack' ? String(choice ?? '1') : action === 'switch' ? String(choice) : null;
  const usesFatality = action === 'attack' && (selectedChoice === '3' || selectedChoice === activeUnit(previous.core.players[0]).fatality?.attack.id);
  requireGame(action !== 'skill' && !(action === 'attack' && selectedChoice === '2') && !usesFatality || previous.mechanics.sealTurns === 0, 'STORY_SKILL_SEALED');
  const battle = structuredClone(previous), events = [], m = battle.mechanics;
  battle.updatedAt = now;
  const player = battle.core.players[0], boss = activeUnit(battle.core.players[1]), actor = activeUnit(player);
  const actorId = actor.id, originalAttacks = structuredClone(actor.attacks), originalFatalityAttack = actor.fatality ? structuredClone(actor.fatality.attack) : null, bossDefense = boss.stats.defense;
  const usedSkill = action === 'skill' || action === 'attack' && selectedChoice === '2' || usesFatality;
  if (phase === 'exposed') boss.stats.defense = Math.max(0, boss.stats.defense - 12);
  let barrier = m.barrier;
  if (action === 'break') { barrier = 0; m.barrier = 0; events.push(event('roots_broken', '💥 Rompes las raíces y diriges un ataque básico. El Guardián responderá.')); }
  const decoy = ['illusions', 'final'].includes(mechanic) && !m.revealed && ['attack', 'skill'].includes(action);
  if (decoy) actor.attacks = actor.attacks.map(attack => ({ ...attack, accuracy: 1 }));
  if (decoy && actor.fatality) actor.fatality.attack.accuracy = 1;
  const enemyShield = barrier > 0 ? temporaryShield(boss, barrier) : null;
  let result;
  if (['defend', 'observe', 'support', 'protect', 'purify'].includes(action)) result = wait(battle.core, PLAYER, now);
  else result = execute(battle.core, PLAYER, action === 'switch' ? 'switch' : action === 'surrender' ? 'surrender' : 'attack',
    action === 'break' ? '1' : selectedChoice, decoy ? 99 : random[0], now);
  battle.core = result.battle;
  battle.core.players[0].units.find(unit => unit.id === actorId).attacks = originalAttacks;
  if (originalFatalityAttack) battle.core.players[0].units.find(unit => unit.id === actorId).fatality.attack = originalFatalityAttack;
  activeUnit(battle.core.players[1]).stats.defense = bossDefense;
  const executed = result.action.type !== 'skip' && action !== 'surrender';
  if (enemyShield) {
    const enemy = activeUnit(battle.core.players[1]);
    m.barrier = enemy.effects.find(effect => effect.type === 'shield')?.potency ?? 0;
    restoreShield(battle.core, 1, enemyShield, result.action);
  }
  if (!decoy || result.action.type === 'skip') events.push(...describe(battle.core, result.action));
  else events.push(event('decoy', '🪞 El golpe se pierde en un registro falso. Observar permite reconocer al original.'));
  if (executed) {
    if (['attack', 'skill', 'break'].includes(action)) { m.lessons.damage = true; battle.tutorial.attack = true; }
    if (action === 'defend') { m.lessons.defense = true; battle.tutorial.defend = true; }
    m.recklessStreak = ['attack', 'skill'].includes(action) ? m.recklessStreak + 1 : 0;
    if (action === 'observe') { m.revealed = true; events.push(event('observed', '👁️ Reconoces el original. Ahora tus ataques pueden alcanzarlo.')); }
    if (action === 'support') { healParty(battle.core, 22, 10, events); m.supportCooldown = 3; m.lessons.support = true; }
    if (action === 'purify') { healParty(battle.core, 18, 6, events); m.purifyCooldown = 3; m.tension = Math.max(0, m.tension - 3); m.sealTurns = Math.max(0, m.sealTurns - 2); events.push(event('purified', '✨ Purificas la tinta y recuperas el control del vínculo.')); }
    if (mechanic === 'tension') m.tension = Math.min(8, Math.max(0, m.tension + (usedSkill ? 3 : action === 'attack' ? 2 : action === 'defend' ? -1 : 0)));
    if (mechanic === 'reflections' && action === 'support') directEnemyDamage(battle, Math.max(12, Math.floor(actor.stats.attack * 0.8)), events, 'support_counter');
  }
  if (battle.learning.scouting && battle.core.status === 'finished' && battle.core.winnerId === PLAYER) scoutingDefeat(battle, now, events);
  if (battle.core.status === 'active') {
    const enemy = activeUnit(battle.core.players[1]);
    const copied = mechanic === 'mirror' ? previous.mechanics.copiedSkill : null;
    const strong = ['unleash', 'protect', 'reflect'].includes(phase) || phase === 'tension' && m.tension >= 5;
    const hostileMove = copied && phase === 'reflect' ? { ...copied, ...(copied.fatality ? { fatality: false } : {}), id: 'story_pressure', name: `Réplica de ${copied.name}`, cooldown: 0, effects: copied.effects.map(effect => ({ ...effect, target: effect.target })) } :
      attack('story_pressure', phase === 'charge' ? 'Hostigamiento de carga' : phase === 'exposed' ? 'Respuesta expuesta' : strong ? 'Descarga del vínculo' : 'Presión de tinta',
        mechanic === 'tutorial' ? 1 : strong ? mechanic === 'final' ? 84 : 75 : ['charge', 'exposed'].includes(phase) ? 2 : 6);
    if (mechanic === 'tension' && phase === 'tension' && m.tension >= 5) hostileMove.power += m.tension * 5;
    if (mechanic !== 'tutorial' && m.recklessStreak >= 3) { hostileMove.power += 45; events.push(event('reckless_counter', '⚠️ Tres ataques seguidos abren tu guardia: el enemigo castiga la ofensiva continua.')); }
    if (battle.learning.scouting) hostileMove.power += Math.min(60, previous.actions.length * 3);
    if (battle.context.huanSupport) hostileMove.power = Math.max(1, hostileMove.power - 2);
    enemy.attacks[0] = hostileMove;
    const originalAttack = enemy.stats.attack;
    const target = activeUnit(battle.core.players[0]);
    // Corrupted enemies maintain pressure even against a defensive roster;
    // shields and active defense still absorb this physical hit normally.
    const floorDamage = mechanic === 'tutorial' ? 1 : Math.max(1, Math.floor(target.stats.hp * 7 / 100));
    const currentDamage = calculateAdvancedDamage(hostileMove, enemy, target);
    enemy.stats.attack += Math.max(0, floorDamage - currentDamage);
    let guard = null;
    if (executed && ['defend', 'protect'].includes(action)) {
      const active = activeUnit(battle.core.players[0]), reduction = action === 'protect' ? 82 : 70;
      guard = temporaryShield(active, Math.floor(calculateAdvancedDamage(hostileMove, enemy, active) * reduction / 100));
      events.push(event('defend', `🛡️ ${action === 'protect' ? 'Proteges el vínculo y a los aliados' : 'Defiendes la ofensiva'} sin detener la presión enemiga.`));
    }
    result = execute(battle.core, ENEMY, 'attack', 'story_pressure', random[1], now);
    battle.core = result.battle;
    activeUnit(battle.core.players[1]).stats.attack = originalAttack;
    if (guard) restoreShield(battle.core, 0, guard, result.action);
    events.push(...describe(battle.core, result.action));
    const enemyActed = result.action.type !== 'skip';
    if (enemyActed && battle.core.status === 'active') {
      const party = battle.core.players[0];
      for (const reserve of (mechanic === 'tutorial' ? [] : party.units).filter(unit => unit.id !== activeUnit(party).id && unit.hp > 0)) {
        const amount = Math.min(reserve.hp, Math.max(1, Math.floor(reserve.stats.hp * (action === 'protect' ? 1 : strong ? 5 : 3) / 100)));
        reserve.hp -= amount;
        events.push(event('reserve_pressure', `${reserve.characterName} recibe ${amount} de presión de tinta en reserva.`, { unitId: reserve.id, amount }));
      }
      if (mechanic === 'protection') {
        m.npcSafety = Math.max(0, Math.min(100, m.npcSafety + (action === 'protect' && executed ? 10 : -12)));
        if (m.npcSafety === 0) { finishCore(battle.core, ENEMY, 'protection', now); events.push(event('protection_failed', 'La presión obliga a evacuar al aliado. Puedes reorganizar el equipo y reintentar.')); }
      }
      const counterActor = battle.core.players[0].units.find(unit => unit.id === actorId);
      if (battle.core.status === 'active' && counterActor.hp > 0 && executed && action === 'defend' && strong) directEnemyDamage(battle, Math.max(10, Math.floor(actor.stats.attack * 0.65)), events, 'guard_counter');
      if (battle.core.status === 'active' && counterActor.hp > 0 && executed && action === 'protect' && phase === 'protect') directEnemyDamage(battle, Math.max(18, Math.floor(actor.stats.attack * 1.2)), events, 'protect_counter');
      if (mechanic === 'tension' && phase === 'tension' && m.tension >= 5) m.tension = Math.max(0, m.tension - 2);
    }
  }
  if (mechanic === 'mirror') m.copiedSkill = executed && usedSkill ? structuredClone(usesFatality ? originalFatalityAttack : originalAttacks[1]) : null;
  if (executed && usedSkill) battle.tutorial.skill = true;
  for (const name of ['supportCooldown', 'purifyCooldown', 'sealTurns']) if (m[name] > 0 && action !== (name === 'supportCooldown' ? 'support' : name === 'purifyCooldown' ? 'purify' : null)) m[name]--;
  if (battle.learning.scouting && battle.core.status === 'finished' && battle.core.winnerId === PLAYER) scoutingDefeat(battle, now, events);
  if (battle.learning.scouting && battle.core.status === 'active' && previous.actions.length + 1 >= 20) scoutingDefeat(battle, now, events);
  if (battle.core.status === 'finished') {
    battle.status = battle.core.winnerId === PLAYER ? 'won' : 'lost'; battle.finishReason = battle.core.finishReason; battle.finishedAt = now;
    events.push(event(battle.status, battle.status === 'won' ? 'El vínculo resiste. El enemigo cede ante tu estrategia.' : action === 'surrender' ? 'Te retiras: las retiradas no cuentan como reconocimiento.' : battle.finishReason === 'protection' ? 'El aliado tuvo que ser evacuado. Tu expedición conserva la vida restante; reorganiza la protección y vuelve a intentarlo.' : battle.finishReason === 'turn_limit' ? 'El enemigo resiste hasta el límite de turnos. Tu expedición conserva la vida restante y puede reintentar el encuentro.' : 'Tu equipo cae bajo la presión. Conservas tus cartas y monedas; revisa la señal y prepara el siguiente intento.'));
  }
  // A reconnaissance barrier can deflect a lethal hit. Only report a knockout
  // when that unit actually remains down in the resulting saved state.
  const units = battle.core.players.flatMap(player => player.units);
  for (let index = events.length - 1; index >= 0; index--) if (events[index].type === 'knockout' &&
    units.find(unit => unit.id === events[index].unitId)?.hp > 0) events.splice(index, 1);
  const entry = { seq: battle.actions.length + 1, action, choice: selectedChoice, rolls: [...random], createdAt: now, events };
  battle.actions.push(entry);
  reflect(battle);
  if (battle.status === 'active') {
    if (mechanic === 'roots' && battle.enemyIntent.type === 'roots') m.barrier = 45;
    if (mechanic === 'illusions' && battle.enemyIntent.type === 'illusions') m.revealed = false;
    if (mechanic === 'final') {
      const hp = activeUnit(battle.core.players[1]);
      const nextPhase = hp.hp * 100 / hp.stats.hp > 66 ? 'memory' : hp.hp * 100 / hp.stats.hp > 33 ? 'control' : 'choice';
      if (nextPhase !== m.finalPhase) { m.finalPhase = nextPhase; if (nextPhase === 'control') m.sealTurns = 2; events.push(event('phase_changed', `El Archivista entra en ${nextPhase === 'control' ? 'CONTROL: sella habilidades durante dos turnos' : 'ELECCIÓN: protege el vínculo cuando concentre su fuerza'}.`)); }
    }
  }
  return { battle, action: entry, events };
}

export function storyBattleHistory(previous) {
  requireGame(previous && Array.isArray(previous.actions), 'INVALID_STORY_BATTLE');
  const marker = previous.combatUpgrade;
  if (marker !== undefined) requireGame(previous.version === STORY_COMBAT_VERSION && marker &&
    Object.keys(marker).length === 2 && (marker.fromVersion === 3 || [1, 2].includes(marker.fromVersion) && previous.encounterId === 'P03') && integer(marker.afterActions) &&
    marker.afterActions < previous.actions.length, 'INVALID_STORY_COMBAT_UPGRADE');
  const sourceVersion = marker ? marker.fromVersion : previous.version;
  const sourceLearning = previous.learning ? { defeats: previous.learning.defeats,
    required: storyCombatPolicy(previous.encounterId, sourceVersion).requiredDefeats } : undefined;
  let battle = createStoryBattle({ id: previous.id, encounterId: previous.encounterId, units: previous.unitSnapshots,
    now: previous.createdAt, version: sourceVersion, ...(sourceLearning ? { learning: sourceLearning, context: previous.context } : {}) });
  const history = [battle];
  for (let index = 0; index < previous.actions.length; index++) {
    if (marker && index === marker.afterActions) battle = upgradeStoryBattle(battle);
    const entry = previous.actions[index];
    battle = resolveStoryAction(battle, { action: entry.action, choice: entry.choice, rolls: entry.rolls, now: entry.createdAt }).battle;
    history.push(battle);
  }
  return history;
}
export function replayStoryBattle(previous) { return storyBattleHistory(previous).at(-1); }
export function validateStoryBattle(battle) { try { return isDeepStrictEqual(battle, replayStoryBattle(battle)); } catch { return false; } }
export function storyBattleView(battle) {
  if (battle.version < STORY_COMBAT_VERSION) return viewV3(battle);
  const view = legacyView(battle), m = battle.mechanics, mechanic = kind(battle);
  for (const [index, unit] of battle.players[0].units.entries()) {
    if (unit.mask) view.team[index].mask = structuredClone(unit.mask);
    if (unit.fatality?.unlocked && !unit.fatality.used) {
      const attack = unit.fatality.attack;
      view.team[index].attacks.push({ choice: '3', name: attack.name, power: attack.power, accuracy: attack.accuracy,
        cooldown: 0, ready: unit.hp > 0 && m.sealTurns === 0, fatality: true, singleUse: true, sealed: m.sealTurns > 0 });
    }
  }
  const available = ['attack', 'defend', 'switch', 'surrender'];
  if (m.sealTurns === 0) available.push('skill');
  if (mechanic !== 'tutorial' && m.supportCooldown === 0) available.push('support');
  if (m.barrier > 0) available.push('break');
  if (['illusions', 'final'].includes(mechanic) && !m.revealed) available.push('observe');
  if (['tension', 'final'].includes(mechanic) && m.purifyCooldown === 0) available.push('purify');
  if (mechanic === 'protection' || mechanic === 'final' && m.finalPhase === 'choice') available.push('protect');
  if (battle.combatUpgrade) {
    const visibleEvents = (battle.actions.at(-1)?.events ?? []).filter(entry => entry.type !== 'tutorial_guidance' &&
      !(entry.type === 'knockout' && battle.core.players.flatMap(player => player.units).find(unit => unit.id === entry.unitId)?.hp > 0));
    view.lastEvents = visibleEvents.map(entry => entry.text).filter(Boolean);
  }
  view.availableActions = available;
  view.enemy.phase = battle.enemyIntent?.type ?? 'finished'; view.enemy.mechanics = visibleMechanics(battle);
  view.learning = structuredClone(battle.learning); view.pressure = structuredClone(battle.pressure);
  if (m.npcSafety !== null) view.npcSafety = m.npcSafety;
  if (m.sealTurns > 0) for (const unit of view.team) unit.attacks[1] = { ...unit.attacks[1], ready: false, sealed: true };
  return view;
}
