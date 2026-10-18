import { isDeepStrictEqual } from 'node:util';
import { requireGame } from '../../utils/GameError.js';
import { activeUnit, calculateAdvancedDamage, initializeAdvancedBattle, resolveAdvancedAction } from '../battle/advancedEngine.js';
import { validateCombatProfile, validateEffectDefinition } from '../battle/combatContent.js';

export const STORY_COMBAT_VERSION = 2;
export const STORY_DEFENSE_PERCENT = 70;
const CUSTODIAN = 'custodian';
const ECHO = 'echo';
const FAR_FUTURE = '9999-12-31T23:59:59.999Z';
const INTENTS = Object.freeze(['strike', 'charge', 'unleash', 'exposed']);
const integer = (value, minimum, maximum = Number.MAX_SAFE_INTEGER) => Number.isSafeInteger(value) && value >= minimum && value <= maximum;
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
const hint = (type, text, fields = {}) => ({ type, text, ...fields });
const missingTutorial = tutorial => !tutorial.attack || !tutorial.defend || !tutorial.skill;

const LEGACY_ENCOUNTERS = Object.freeze({
  P03: Object.freeze({ id: 'P03', name: 'Eco desorientado', kind: 'tutorial', element: 'dark',
    stats: Object.freeze({ hp: 110, attack: 13, defense: 12, speed: 6 }) }),
  I03: Object.freeze({ id: 'I03', name: 'Eco de Tinta', kind: 'miniboss', element: 'dark',
    stats: Object.freeze({ hp: 240, attack: 32, defense: 20, speed: 9 }) })
});

export const STORY_ENCOUNTERS = Object.freeze({ ...LEGACY_ENCOUNTERS,
  I04: Object.freeze({ id: 'I04', name: 'Acechador de Tinta', kind: 'ambush', element: 'dark',
    stats: Object.freeze({ hp: 170, attack: 26, defense: 18, speed: 12 }) }),
  I05: Object.freeze({ id: 'I05', name: 'Guardián Marchito', kind: 'boss', element: 'dark',
    stats: Object.freeze({ hp: 240, attack: 34, defense: 22, speed: 8 }) }),
  II05: Object.freeze({ id: 'II05', name: 'Mercader Sin Rostro', kind: 'boss', element: 'dark',
    stats: Object.freeze({ hp: 270, attack: 29, defense: 20, speed: 11 }) })
});

export function storyEncounter(encounterId, version = STORY_COMBAT_VERSION) {
  requireGame([1, 2].includes(version), 'INVALID_STORY_COMBAT_VERSION');
  const encounter = (version === 1 ? LEGACY_ENCOUNTERS : STORY_ENCOUNTERS)[encounterId];
  requireGame(encounter, 'STORY_ENCOUNTER_NOT_FOUND');
  return structuredClone(encounter);
}

function validSnapshot(unit) {
  return unit && typeof unit.id === 'string' && unit.id.length > 0 && unit.id.length <= 200 &&
    typeof unit.characterId === 'string' && typeof unit.characterName === 'string' && integer(unit.level, 1, 20) &&
    unit.stats && ['hp', 'attack', 'defense', 'speed'].every(key => integer(unit.stats[key], key === 'defense' ? 0 : 1, 100000)) &&
    validateCombatProfile({ version: unit.profileVersion, element: unit.element, ability: unit.ability }) &&
    Array.isArray(unit.attacks) && unit.attacks.length === 2 && new Set(unit.attacks.map(a => a.id)).size === 2 &&
    unit.attacks.every(attack => attack && typeof attack.id === 'string' && typeof attack.name === 'string' &&
      integer(attack.power, 1, 10000) && integer(attack.accuracy, 1, 100) && integer(attack.cooldown, 0, 5) &&
      ['physical', 'magic'].includes(attack.type) && ['neutral', 'fire', 'water', 'nature', 'light', 'dark'].includes(attack.element) &&
      Array.isArray(attack.effects) && attack.effects.every(validateEffectDefinition));
}

const enemyAttack = (id, name, power) => ({ id, name, power, accuracy: 100, type: 'physical', element: 'dark',
  effects: [], cooldown: 0, combatVersion: 1 });

function enemyUnit(encounter, version = 1) {
  if (!Object.hasOwn(LEGACY_ENCOUNTERS, encounter.id)) return {
    id: `story-enemy:${encounter.id}`, characterId: `story_echo_${encounter.id.toLowerCase()}`,
    characterName: encounter.name, level: encounter.id === 'II05' ? 5 : 4, serial: null,
    stats: structuredClone(encounter.stats), hp: encounter.stats.hp, profileVersion: 1, element: encounter.element, ability: null,
    attacks: [enemyAttack('story_echo_strike', encounter.id === 'I05' ? 'Golpe de Raíces' : encounter.id === 'II05' ? 'Firma Vacía' : 'Garra del Claro',
      encounter.id === 'I05' ? 6 : encounter.id === 'II05' ? 4 : 8),
      enemyAttack('story_echo_unleash', encounter.id === 'I05' ? 'Estallido de Raíces' : encounter.id === 'II05' ? 'Cobro del Vacío' : 'Emboscada de Tinta', encounter.id === 'I04' ? 60 : 70)]
  };
  return { id: `story-enemy:${encounter.id}`, characterId: `story_echo_${encounter.id.toLowerCase()}`,
    characterName: encounter.name, level: encounter.id === 'P03' ? 1 : 4, serial: null,
    stats: structuredClone(encounter.stats), hp: encounter.stats.hp, profileVersion: 1, element: encounter.element, ability: null,
    attacks: [enemyAttack('story_echo_strike', encounter.id === 'P03' ? 'Roce de tinta' : 'Zarpazo de tinta', encounter.id === 'P03' ? 6 : 8),
      enemyAttack('story_echo_unleash', 'Descarga de tinta', version === 2 && encounter.id === 'I03' ? 74 : 75)] };
}

function intentFor(encounterId, round, version = 1) {
  if (version === 2 && !Object.hasOwn(LEGACY_ENCOUNTERS, encounterId)) {
    const phases = encounterId === 'II05' ? ['illusions', 'trick_strike', 'charge', 'unleash', 'exposed'] :
      encounterId === 'I05' ? ['roots', 'charge', 'unleash', 'exposed'] : INTENTS;
    const type = phases[(round - 1) % phases.length];
    const texts = {
      roots: '🌿 Las raíces protegen al Guardián. Rompe la barrera para abrir paso a tus ataques.',
      illusions: '🪞 Tres figuras idénticas rodean el puesto. Observa las huellas para reconocer al Mercader real.',
      trick_strike: 'El Mercader prepara una firma de tinta mientras sus reflejos te distraen.',
      strike: 'El Acechador prepara una garra rápida.',
      charge: 'La tinta se concentra: el próximo golpe será cargado. Prepara tu defensa.',
      unleash: '⚠️ ¡ATAQUE CARGADO INMINENTE! Defiende ahora para reducir el daño un 70%.',
      exposed: '✨ Tras descargar su fuerza, el enemigo queda expuesto: defensa 0 durante tu próxima acción.'
    };
    return { type, text: texts[type] };
  }
  if (encounterId === 'P03') return { type: 'strike', text: 'El Eco está confundido. Bao te guía: ataca, defiende y prueba tu habilidad.' };
  const type = INTENTS[(round - 1) % INTENTS.length];
  const descriptions = {
    strike: 'El Eco prepara un zarpazo corto.',
    charge: 'La tinta empieza a concentrarse: el Eco cargará su siguiente ataque.',
    unleash: '⚠️ ¡DESCARGA INMINENTE! Defiende ahora para reducir el golpe un 70%.',
    exposed: '✨ El Eco está expuesto tras la descarga: su defensa queda en 0 durante tu próxima acción.'
  };
  return { type, text: descriptions[type] };
}

function reflect(battle) {
  battle.players = structuredClone(battle.core.players);
  battle.turnNumber = battle.actions.length + (battle.status === 'active' ? 1 : 0);
  battle.enemyIntent = battle.status === 'active' ? intentFor(battle.encounterId, battle.actions.length + 1, battle.version) : null;
  return battle;
}

export function createStoryBattle({ id, encounterId, units, now, version = STORY_COMBAT_VERSION }) {
  requireGame(typeof id === 'string' && id.length > 0 && id.length <= 200, 'INVALID_STORY_BATTLE');
  requireGame(timestamp(now), 'INVALID_TIMESTAMP');
  requireGame(Array.isArray(units) && units.length >= 1 && units.length <= 3 && units.every(validSnapshot) &&
    new Set(units.map(unit => unit.id)).size === units.length && units.every(unit => !unit.id.startsWith('story-enemy:')), 'INVALID_STORY_TEAM');
  const encounter = storyEncounter(encounterId, version);
  const snapshots = structuredClone(units);
  const core = initializeAdvancedBattle({ id, rulesVersion: 2, acceptedAt: now,
    players: [{ userId: CUSTODIAN, name: 'Custodio', units: structuredClone(units) },
      { userId: ECHO, name: encounter.name, units: [enemyUnit(encounter, version)] }] });
  // Story encounters always let the Custodian read the signal and act first.
  core.turnUserId = CUSTODIAN;
  const battle = reflect({ version, id, encounterId, status: 'active', createdAt: now, updatedAt: now,
    finishedAt: null, finishReason: null, turnNumber: 1, unitSnapshots: snapshots, players: [], actions: [],
    tutorial: { attack: false, defend: false, skill: false }, enemyIntent: null, core });
  if (version === 2 && !Object.hasOwn(LEGACY_ENCOUNTERS, encounterId)) battle.mechanics = {
    barrier: encounterId === 'I05' ? 50 : 0, revealed: encounterId !== 'II05'
  };
  return battle;
}

function coreAction(core, { userId, type = 'attack', choice = '1', roll = 0, now }) {
  // Story saves a turn indefinitely. The PvP inactivity timer does not apply.
  core.expiresAt = FAR_FUTURE;
  const result = resolveAdvancedAction(core, { userId, type, choice, roll: type === 'attack' ? roll : null, now });
  return result;
}

function waitAction(core, userId, now) {
  const player = core.players.find(p => p.userId === userId);
  const unit = activeUnit(player);
  const attacks = unit.attacks;
  unit.attacks = [...attacks, { id: 'story_wait', name: 'Tomar posición', power: 1, accuracy: 1,
    element: 'neutral', type: 'physical', effects: [], cooldown: 0, combatVersion: 1 }];
  const result = coreAction(core, { userId, choice: 'story_wait', roll: 99, now });
  // A poisoned unit may have fallen and switched: restore the original actor too.
  const original = result.battle.players.find(p => p.userId === userId).units.find(u => u.id === unit.id);
  if (original) original.attacks = attacks;
  return result;
}

function advanceTutorialLimit(core) {
  if (core.finishReason !== 'turn_limit') return;
  core.status = 'active';
  core.winnerId = null;
  core.finishReason = null;
  core.finishedAt = null;
  core.turnUserId = core.actions.at(-1).actorId === CUSTODIAN ? ECHO : CUSTODIAN;
  core.turnNumber = core.actions.length + 1;
}

function storyEvents(core, action, label) {
  const units = core.players.flatMap(player => player.units);
  const nameFor = id => units.find(unit => unit.id === id)?.characterName ?? 'Compañero';
  const texts = [];
  if (action.attackId && action.attackId !== 'story_wait') {
    const actor = units.find(unit => unit.id === action.actorUnitId);
    const attack = actor?.attacks.find(attack => attack.id === action.attackId);
    texts.push(hint(action.hit ? 'attack' : 'miss', action.hit
      ? `${nameFor(action.actorUnitId)} usó ${attack?.name ?? label}: ${action.damage} de daño.`
      : `${nameFor(action.actorUnitId)} usó ${attack?.name ?? label}, pero falló.`,
    { unitId: action.targetUnitId, sourceUnitId: action.actorUnitId, amount: action.damage, attackName: attack?.name ?? label }));
  }
  for (const event of action.events) {
    let text = null;
    if (event.type === 'effect_tick') text = `${nameFor(event.unitId)}: ${event.effect === 'regeneration' ? 'recupera' : 'pierde'} ${event.amount} HP por ${({ poison: 'veneno', burn: 'quemadura', regeneration: 'regeneración' })[event.effect]}.`;
    else if (event.type === 'knockout') text = `${nameFor(event.unitId)} quedó fuera de combate.`;
    else if (['auto_switch', 'switch'].includes(event.type)) text = `${nameFor(event.unitId)} entra al combate.`;
    else if (event.type === 'stun') text = `${nameFor(event.unitId)} está aturdido y pierde su acción.`;
    else if (event.type === 'effect_applied') text = `${nameFor(event.unitId)} recibe ${({ poison: 'veneno', burn: 'quemadura', stun: 'aturdimiento', shield: 'escudo', regeneration: 'regeneración', attack_up: 'ataque aumentado', defense_down: 'defensa reducida' })[event.effect]}.`;
    if (text) texts.push(hint(event.type, text, structuredClone(event)));
  }
  return texts;
}

function protectTutorial(battle, events) {
  const core = battle.core;
  advanceTutorialLimit(core);
  if (core.status !== 'finished') return;
  if (core.winnerId === CUSTODIAN && missingTutorial(battle.tutorial)) {
    const enemy = activeUnit(core.players[1]);
    enemy.hp = 1;
    core.status = 'active'; core.winnerId = null; core.finishReason = null; core.finishedAt = null;
    core.turnUserId = core.actions.at(-1).actorId === CUSTODIAN ? ECHO : CUSTODIAN; core.turnNumber = core.actions.length + 1;
    const missing = [!battle.tutorial.attack && 'atacar', !battle.tutorial.defend && 'defender', !battle.tutorial.skill && 'usar tu habilidad'].filter(Boolean);
    events.push(hint('tutorial_guidance', `Bao calma al Eco: aún falta ${missing.join(' y ')}. Practica sin miedo; tu compañero está a salvo.`));
  } else if (core.winnerId === ECHO) {
    for (const unit of core.players[0].units) {
      unit.hp = unit.stats.hp; unit.effects = []; unit.cooldowns = {};
    }
    core.players[0].activeIndex = 0;
    core.status = 'active'; core.winnerId = null; core.finishReason = null; core.finishedAt = null;
    core.turnUserId = CUSTODIAN; core.turnNumber = core.actions.length + 1;
    events.push(hint('tutorial_rescue', 'Bao protege a tus compañeros y restaura su vida. Este entrenamiento no tiene penalización.'));
  }
}

function guard(core, attack) {
  const defender = activeUnit(core.players[0]);
  const attacker = activeUnit(core.players[1]);
  const original = defender.effects.find(effect => effect.type === 'shield');
  const reduction = Math.floor(calculateAdvancedDamage(attack, attacker, defender) * STORY_DEFENSE_PERCENT / 100);
  const shield = { type: 'shield', remaining: original?.remaining ?? 1, potency: reduction + (original?.potency ?? 0),
    sourceUnitId: original?.sourceUnitId ?? defender.id, appliedAtTurn: original?.appliedAtTurn ?? core.turnNumber };
  defender.effects = defender.effects.filter(effect => effect.type !== 'shield');
  if (shield.potency > 0) defender.effects.push(shield);
  return { unitId: defender.id, reduction, original: original ? structuredClone(original) : null };
}

function removeGuard(core, defense, action) {
  const unit = core.players[0].units.find(unit => unit.id === defense.unitId);
  const current = unit.effects.find(effect => effect.type === 'shield');
  const absorbed = action.events.filter(event => event.type === 'shield_absorbed' && event.unitId === unit.id).reduce((sum, event) => sum + event.amount, 0);
  const unusedGuard = Math.max(0, defense.reduction - absorbed);
  const remainder = Math.max(0, (current?.potency ?? 0) - unusedGuard);
  unit.effects = unit.effects.filter(effect => effect.type !== 'shield');
  if (remainder > 0 && defense.original && unit.hp > 0) unit.effects.push({ ...defense.original, potency: remainder });
}

function resolveStoryActionV1(previous, { action, choice = null, rolls = null, now }, { defensiveWait = true } = {}) {
  requireGame(previous?.version === 1 && previous.status === 'active', 'STORY_BATTLE_NOT_ACTIVE');
  requireGame(['attack', 'defend', 'skill', 'switch', 'surrender'].includes(action), 'INVALID_STORY_ACTION');
  requireGame(timestamp(now) && Date.parse(now) >= Date.parse(previous.updatedAt), 'INVALID_TIMESTAMP');
  const random = rolls === null ? [0, 0] : rolls;
  requireGame(Array.isArray(random) && random.length === 2 && random.every(roll => integer(roll, 0, 99)), 'INVALID_RANDOM_ROLL');
  const normalizedChoice = action === 'skill' ? '2' : action === 'attack' ? String(choice ?? '1') : action === 'switch' ? String(choice) : null;
  requireGame(action !== 'attack' || ['1', '2'].includes(normalizedChoice), 'INVALID_ATTACK');
  const battle = structuredClone(previous);
  const events = [];
  const intent = battle.enemyIntent.type;
  const player = battle.core.players[0];
  const enemy = battle.core.players[1];
  const oldDefense = activeUnit(enemy).stats.defense;
  if (intent === 'exposed') {
    activeUnit(enemy).stats.defense = 0;
    events.push(hint('exposed', 'Aprovechas la apertura: el Eco tiene la defensa reducida a 0.'));
  }
  let result;
  if (action === 'defend') result = waitAction(battle.core, CUSTODIAN, now);
  else result = coreAction(battle.core, { userId: CUSTODIAN, type: action === 'switch' ? 'switch' : action === 'surrender' ? 'surrender' : 'attack',
    choice: normalizedChoice, roll: random[0], now });
  battle.core = result.battle;
  activeUnit(battle.core.players[1]).stats.defense = oldDefense;
  const executed = result.action.type !== 'skip' && action !== 'surrender';
  if (executed) {
    if (action === 'attack' && normalizedChoice === '1') battle.tutorial.attack = true;
    if (action === 'skill' || action === 'attack' && normalizedChoice === '2') battle.tutorial.skill = true;
    if (action === 'defend') battle.tutorial.defend = true;
  }
  if (action === 'defend' && executed && defensiveWait) events.push(hint('defend', `${activeUnit(player).characterName} se cubre: reduce el próximo daño de este turno un 70%.`));
  events.push(...storyEvents(battle.core, result.action, 'Ataque'));
  if (battle.encounterId === 'P03' && action !== 'surrender') protectTutorial(battle, events);
  if (battle.core.status === 'active' && battle.core.turnUserId === ECHO) {
    if (['charge', 'exposed'].includes(intent)) {
      result = waitAction(battle.core, ECHO, now);
      battle.core = result.battle;
      events.push(...storyEvents(battle.core, result.action, 'Tinta'));
      if (result.action.type !== 'skip' && battle.core.status === 'active') events.push(hint(intent,
        intent === 'charge' ? '⚠️ El Eco concentra toda su tinta. ¡Defiende en tu próxima acción!' : 'El Eco intenta recuperar el equilibrio.'));
    } else {
      const attack = activeUnit(battle.core.players[1]).attacks[intent === 'unleash' ? 1 : 0];
      const defense = action === 'defend' && executed && defensiveWait ? guard(battle.core, attack) : null;
      result = coreAction(battle.core, { userId: ECHO, choice: attack.id, roll: random[1], now });
      battle.core = result.battle;
      if (defense) removeGuard(battle.core, defense, result.action);
      events.push(...storyEvents(battle.core, result.action, attack.name));
      if (defense && result.action.hit) events.push(hint('guarded', `🛡️ Tu defensa amortiguó la ofensiva: recibiste ${result.action.damage} de daño.`, { amount: result.action.damage }));
    }
    if (battle.encounterId === 'P03') protectTutorial(battle, events);
  }
  if (battle.core.status === 'finished') {
    battle.status = battle.core.winnerId === CUSTODIAN ? 'won' : 'lost';
    battle.finishReason = action === 'surrender' ? 'surrender' : battle.core.finishReason;
    battle.finishedAt = now;
    events.push(hint(battle.status, battle.status === 'won' ? 'El Eco se serena. Tu vínculo resistió la tinta.'
      : action === 'surrender' ? 'Te retiras a salvo. Puedes preparar otro equipo y volver a intentarlo.'
        : 'La tinta supera a tu equipo. No pierdes monedas ni unidades. Reintenta, entrena o cambia de equipo; defiende cuando el Eco anuncie la descarga.'));
  }
  const entry = { seq: battle.actions.length + 1, action, choice: normalizedChoice, rolls: [...random], createdAt: now, events };
  battle.actions.push(entry);
  battle.updatedAt = now;
  reflect(battle);
  return { battle, action: entry, events };
}

export function resolveStoryAction(previous, request) {
  if (previous?.version === 1) return resolveStoryActionV1(previous, request);
  requireGame(previous?.version === 2 && previous.status === 'active', 'STORY_BATTLE_NOT_ACTIVE');
  if (Object.hasOwn(LEGACY_ENCOUNTERS, previous.encounterId)) {
    const result = resolveStoryActionV1({ ...previous, version: 1 }, request);
    result.battle.version = 2;
    return result;
  }
  const { action, choice = null, rolls = null, now } = request;
  requireGame(rolls === null || Array.isArray(rolls) && rolls.length === 2 && rolls.every(roll => integer(roll, 0, 99)), 'INVALID_RANDOM_ROLL');
  requireGame(['attack', 'defend', 'skill', 'switch', 'surrender', 'break', 'observe'].includes(action), 'INVALID_STORY_ACTION');
  requireGame(action !== 'break' || previous.encounterId === 'I05' && previous.mechanics.barrier > 0, 'STORY_NOT_BREAKABLE');
  requireGame(action !== 'observe' || previous.encounterId === 'II05' && !previous.mechanics.revealed, 'STORY_NOT_OBSERVABLE');
  const source = structuredClone(previous), phase = source.enemyIntent.type;
  const originalActor = activeUnit(source.core.players[0]), originalAttacks = structuredClone(originalActor.attacks);
  const notices = [];
  let barrier = source.mechanics.barrier;
  const revealed = action === 'observe' ? true : source.mechanics.revealed;
  if (action === 'break') {
    barrier = 0;
    notices.push(hint('roots_broken', '💥 Rompes la barrera de raíces y abres paso a tu ataque básico.'));
  }
  const decoy = previous.encounterId === 'II05' && !revealed && ['attack', 'skill'].includes(action);
  if (decoy) originalActor.attacks = originalActor.attacks.map(attack => ({ ...attack, accuracy: 1 }));
  if (barrier > 0) activeUnit(source.core.players[1]).effects.push({ type: 'shield', remaining: 5, potency: barrier,
    sourceUnitId: activeUnit(source.core.players[1]).id, appliedAtTurn: source.core.turnNumber });
  source.version = 1;
  source.encounterId = 'I03';
  source.enemyIntent = { ...source.enemyIntent, type: ({ roots: 'strike', illusions: 'charge', trick_strike: 'strike' })[phase] ?? phase };
  const actualAction = action === 'break' ? 'attack' : action === 'observe' ? 'defend' : action;
  const result = resolveStoryActionV1(source, { action: actualAction, choice: action === 'break' ? '1' : choice,
    rolls: decoy ? [99, rolls?.[1] ?? 0] : rolls, now }, { defensiveWait: action !== 'observe' });
  const battle = result.battle, entry = result.action;
  battle.version = 2;
  battle.encounterId = previous.encounterId;
  const actor = battle.core.players[0].units.find(unit => unit.id === originalActor.id);
  actor.attacks = originalAttacks;
  const enemy = activeUnit(battle.core.players[1]);
  if (barrier > 0) {
    battle.mechanics.barrier = enemy.effects.find(effect => effect.type === 'shield')?.potency ?? 0;
    enemy.effects = enemy.effects.filter(effect => effect.type !== 'shield');
    if (battle.mechanics.barrier === 0) notices.push(hint('roots_broken', 'Las raíces ceden ante tus golpes. La barrera se ha roto.'));
  } else battle.mechanics.barrier = 0;
  battle.mechanics.revealed = revealed;
  if (action === 'observe') {
    notices.push(hint('observed', '👁️ Reconoces la única figura que deja huellas. El Mercader real queda revelado hasta que renueve sus ilusiones.'));
    battle.tutorial = structuredClone(previous.tutorial);
  }
  if (decoy) {
    entry.events = entry.events.filter(event => !(event.type === 'miss' && event.sourceUnitId === originalActor.id));
    notices.push(hint('decoy', '🪞 Tu ataque atraviesa un señuelo. La habilidad conserva su enfriamiento; observa antes de golpear.'));
  }
  if (phase === 'illusions') entry.events = entry.events.filter(event => event.type !== 'charge');
  entry.action = action;
  entry.choice = action === 'break' || action === 'observe' ? null : entry.choice;
  entry.rolls = rolls === null ? [0, 0] : structuredClone(rolls);
  entry.events.unshift(...notices);
  if (battle.status === 'won') {
    const event = entry.events.find(event => event.type === 'won');
    event.text = battle.encounterId === 'I05' ? 'La tinta abandona las raíces. El Guardián recuerda parte de su nombre.' :
      battle.encounterId === 'II05' ? 'Las ilusiones se deshacen. Recuperas el registro de los nombres que el Mercader ocultaba.' : 'La emboscada termina. El claro vuelve a quedar en silencio.';
  }
  if (battle.status === 'lost' && battle.finishReason !== 'surrender') {
    const event = entry.events.find(event => event.type === 'lost');
    event.text = battle.encounterId === 'I05' ? 'Las raíces detienen a tu equipo. No pierdes cartas ni monedas: rompe la barrera, guarda tus habilidades y defiende la descarga.' :
      battle.encounterId === 'II05' ? 'El Mercader te pierde entre reflejos. No pierdes cartas ni monedas: observa antes de atacar y defiende cuando concentre la tinta.' :
        'La emboscada supera a tu equipo. No pierdes cartas ni monedas: la carga anuncia cuándo defender.';
  }
  reflect(battle);
  if (battle.status === 'active' && battle.enemyIntent.type === 'roots') battle.mechanics.barrier = 50;
  if (battle.status === 'active' && battle.enemyIntent.type === 'illusions') battle.mechanics.revealed = false;
  result.events = entry.events;
  return result;
}

export function replayStoryBattle(previous) {
  let battle = createStoryBattle({ id: previous.id, encounterId: previous.encounterId, units: previous.unitSnapshots, now: previous.createdAt, version: previous.version });
  for (const entry of previous.actions) battle = resolveStoryAction(battle, { action: entry.action, choice: entry.choice, rolls: entry.rolls, now: entry.createdAt }).battle;
  return battle;
}

export function validateStoryBattle(battle) {
  try { return isDeepStrictEqual(battle, replayStoryBattle(battle)); } catch { return false; }
}

export function storyBattleView(battle) {
  const player = battle.players[0];
  const enemy = activeUnit(battle.players[1]);
  const availableActions = ['attack', 'defend', 'skill', 'switch', 'surrender'];
  if (battle.status === 'active' && battle.encounterId === 'I05' && battle.mechanics?.barrier > 0) availableActions.push('break');
  if (battle.status === 'active' && battle.encounterId === 'II05' && !battle.mechanics?.revealed) availableActions.push('observe');
  return { availableActions, status: battle.status, finishReason: battle.finishReason, round: battle.turnNumber, encounterId: battle.encounterId,
    team: player.units.map((unit, index) => ({ slot: index + 1, id: unit.id, characterId: unit.characterId, name: unit.characterName, hp: unit.hp, maxHp: unit.stats.hp,
      level: unit.level, active: index === player.activeIndex, effects: structuredClone(unit.effects),
      attacks: unit.attacks.map((attack, attackIndex) => ({ choice: String(attackIndex + 1), name: attack.name, power: attack.power,
        cooldown: unit.cooldowns[attack.id] ?? 0, ready: unit.hp > 0 && !(unit.cooldowns[attack.id] > 0) })) })),
    enemy: { name: enemy.characterName, hp: enemy.hp, maxHp: enemy.stats.hp, phase: battle.enemyIntent?.type ?? 'finished',
      intent: battle.enemyIntent?.text ?? null,
      mechanics: battle.encounterId === 'I05' ? `🌿 Barrera de raíces: ${battle.mechanics.barrier} puntos.` :
        battle.encounterId === 'II05' ? battle.mechanics.revealed ? '👁️ Original revelado: tus ataques pueden alcanzarlo.' : '🪞 Señuelos activos: observa para reconocer al original.' : null,
      element: enemy.element, effects: structuredClone(enemy.effects) },
    lastEvents: (battle.actions.at(-1)?.events ?? []).map(event => event.text).filter(Boolean), tutorial: structuredClone(battle.tutorial) };
}
