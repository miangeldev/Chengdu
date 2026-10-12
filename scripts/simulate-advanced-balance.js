import { pathToFileURL } from 'node:url';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { effectiveStats, LEVEL_CAPS } from '../game/progression/rules.js';
import { advancedAttack, combatProfile, COMBAT_CONTENT_VERSION } from '../game/battle/combatContent.js';
import { activeUnit, calculateAdvancedDamage, initializeAdvancedBattle, MAX_ADVANCED_TURNS, resolveAdvancedAction } from '../game/battle/advancedEngine.js';

const NOW = '2026-10-11T00:00:00.000Z';
const templates = seedCharacters();
const attacks = new Map(seedAttacks().map(a => [a.id, a]));
const DEFAULT_SAMPLES = 200;
const DEFAULT_SEED = 73;
export const TEAM_COMPOSITIONS = Object.freeze([
  Object.freeze({ id: 'starters', name: 'Trío inicial', characters: Object.freeze(['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) }),
  Object.freeze({ id: 'balanced', name: 'Equilibrio y control', characters: Object.freeze(['monje_celestial', 'guardian_jade', 'bruja_lunar']) }),
  Object.freeze({ id: 'fire', name: 'Fuego y luz', characters: Object.freeze(['dragon_carmesi', 'mago_carmesi', 'monje_celestial']) }),
  Object.freeze({ id: 'forest', name: 'Resistencia del bosque', characters: Object.freeze(['panda_guerrero', 'guardian_jade', 'espiritu_bambu']) }),
  Object.freeze({ id: 'control', name: 'Marea y sombras', characters: Object.freeze(['bruja_lunar', 'lobo_sombrio', 'monje_celestial']) }),
  Object.freeze({ id: 'premium', name: 'Fuego, marea y bosque', characters: Object.freeze(['dragon_carmesi', 'bruja_lunar', 'espiritu_bambu']) })
]);

export function createAdvancedRoll(seed = DEFAULT_SEED) {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) throw new RangeError('La semilla debe ser un entero entre 0 y 4294967295.');
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % 100;
  };
}

function snapshot(characterId, ownerId, index, level, catalog = templates, attackDefinitions = attacks) {
  const character = catalog.find(c => c.id === characterId);
  if (!character) throw new RangeError(`Personaje desconocido: ${characterId}.`);
  const profile = character.combat ?? combatProfile(characterId);
  const stats = effectiveStats(character.baseStats, level);
  return { id: `${ownerId}:${index}:${characterId}`, characterId, characterName: character.name, characterRevision: character.revision,
    level, stats, hp: stats.hp, profileVersion: profile.version, element: profile.element, ability: structuredClone(profile.ability),
    attacks: character.attackIds.map(id => advancedAttack(attackDefinitions.get(id))) };
}

function shieldAmount(unit) { return unit.effects.find(e => e.type === 'shield')?.potency ?? 0; }
function damageAfterShield(attack, actor, target) { return Math.max(0, calculateAdvancedDamage(attack, actor, target) - shieldAmount(target)); }
function futureEffectValue(definition, actor, target) {
  const recipient = definition.target === 'self' ? actor : target;
  const existing = recipient.effects.find(e => e.type === definition.type);
  const extraTurns = Math.max(0, definition.duration - (existing?.remaining ?? 0));
  const extraPotency = Math.max(0, definition.potency - (existing?.potency ?? 0));
  const contribution = existing ? extraTurns * definition.potency + Math.min(existing.remaining, definition.duration) * extraPotency : definition.duration * definition.potency;
  if (['poison', 'burn'].includes(definition.type)) return Math.min(recipient.hp, recipient.stats.hp * contribution / 100) * 0.55;
  if (definition.type === 'regeneration') return Math.min(recipient.stats.hp - recipient.hp, recipient.stats.hp * contribution / 100) * 0.6;
  if (definition.type === 'shield') return Math.max(0, definition.potency - shieldAmount(recipient)) * 0.8;
  if (definition.type === 'attack_up') return actor.stats.attack * contribution / 100 * 0.75;
  if (definition.type === 'defense_down') return target.stats.defense * contribution / 100 * 0.6;
  if (definition.type === 'stun') return Math.min(actor.hp, damageAfterShield(target.attacks[0], target, actor)) * Math.min(1, extraTurns) * 0.7;
  return 0;
}

function attackOptions(actor, target, strategy) {
  const available = actor.attacks.map((attack, index) => ({ attack, index })).filter(({ attack, index }) =>
    (strategy !== 'basic' || index === 0) && !(actor.cooldowns[attack.id] > 0));
  return available.map(({ attack, index }) => {
    const damage = Math.min(target.hp, damageAfterShield(attack, actor, target));
    const lethal = damage >= target.hp;
    const utility = attack.effects.reduce((total, effect) => total + futureEffectValue(effect, actor, target), 0);
    return { choice: String(index + 1), score: (damage + utility) * attack.accuracy / 100,
      lethalScore: lethal ? attack.accuracy : 0 };
  }).sort((a, b) => b.lethalScore - a.lethalScore || b.score - a.score || a.choice.localeCompare(b.choice));
}

// This reference policy values one immediate attack against the cost of a switch.
// It is intentionally inspectable; it does not claim to solve combat optimally.
export function chooseAdvancedAction(battle, { strategy = 'adaptive', allowSwitch = true, switchesUsed = 0 } = {}) {
  if (!['adaptive', 'basic'].includes(strategy)) throw new RangeError('Estrategia válida: adaptive o basic.');
  const player = battle.players.find(p => p.userId === battle.turnUserId);
  const target = activeUnit(battle.players.find(p => p.userId !== player.userId));
  const actor = activeUnit(player);
  if (actor.effects.some(e => e.type === 'stun')) return { type: 'attack', choice: '1' };
  const best = attackOptions(actor, target, strategy)[0];
  if (!allowSwitch || switchesUsed >= 2 || best.lethalScore > 0) return { type: 'attack', choice: best.choice };
  const incomingDamage = damageAfterShield(target.attacks[0], target, actor);
  let switchTo = null;
  for (let index = 0; index < player.units.length; index++) {
    if (index === player.activeIndex || player.units[index].hp <= 0) continue;
    const reserve = player.units[index];
    const reserveIncoming = damageAfterShield(target.attacks[0], target, reserve);
    if (reserve.hp <= reserveIncoming * 1.3) continue;
    const reserveScore = attackOptions(reserve, target, strategy)[0].score;
    const survivalBenefit = Math.max(0, incomingDamage - reserveIncoming);
    const entryUtility = reserve.ability && !reserve.abilityUsed ? reserve.ability.effects.reduce((total, e) => total + futureEffectValue(e, reserve, target), 0) : 0;
    const benefit = (reserveScore - best.score) * 2.5 + survivalBenefit * (actor.hp < incomingDamage * 1.3 ? 2 : 1) + entryUtility;
    const cost = best.score + reserveIncoming * 0.4;
    if (benefit > cost && (!switchTo || benefit - cost > switchTo.margin)) switchTo = { choice: String(index + 1), margin: benefit - cost };
  }
  return switchTo ? { type: 'switch', choice: switchTo.choice } : { type: 'attack', choice: best.choice };
}

export function simulateAdvancedDuel({ firstCharacters, secondCharacters, level = 1, strategy = 'adaptive', allowSwitch = true,
  challenger = 'first', seed = DEFAULT_SEED, roll = createAdvancedRoll(seed), catalog = templates, attackDefinitions = attacks } = {}) {
  if (!Number.isSafeInteger(level) || level < 1 || level > LEVEL_CAPS.unit) throw new RangeError(`El nivel debe estar entre 1 y ${LEVEL_CAPS.unit}.`);
  if (!Array.isArray(firstCharacters) || !Array.isArray(secondCharacters) || firstCharacters.length < 1 || firstCharacters.length > 3 ||
    firstCharacters.length !== secondCharacters.length) throw new RangeError('Los equipos deben tener el mismo tamaño, entre 1 y 3 unidades.');
  if (!['adaptive', 'basic'].includes(strategy)) throw new RangeError('Estrategia válida: adaptive o basic.');
  if (!['first', 'second'].includes(challenger)) throw new RangeError('El retador debe ser first o second.');
  if (typeof roll !== 'function') throw new TypeError('roll debe ser una función.');
  const first = { userId: 'first', name: 'Primero', units: firstCharacters.map((id, i) => snapshot(id, 'first', i, level, catalog, attackDefinitions)), activeIndex: 0 };
  const second = { userId: 'second', name: 'Segundo', units: secondCharacters.map((id, i) => snapshot(id, 'second', i, level, catalog, attackDefinitions)), activeIndex: 0 };
  let battle = initializeAdvancedBattle({ id: 'BTL-reference', rulesVersion: 2, acceptedAt: NOW, createdAt: NOW,
    mode: 'advanced', teamSize: firstCharacters.length, players: challenger === 'first' ? [first, second] : [second, first] });
  const switches = { first: 0, second: 0 };
  while (battle.status === 'active') {
    const userId = battle.turnUserId;
    const decision = chooseAdvancedAction(battle, { strategy, allowSwitch, switchesUsed: switches[userId] });
    if (decision.type === 'switch') switches[userId]++;
    const now = new Date(Date.parse(NOW) + (battle.actions.length + 1) * 1000).toISOString();
    battle = resolveAdvancedAction(battle, { ...decision, userId, now, roll: decision.type === 'attack' ? roll() : null }).battle;
  }
  return battle;
}

function pair(first, second, options, index) {
  const result = { firstId: first.id, secondId: second.id, firstName: first.name, secondName: second.name,
    firstCharacters: first.characters, secondCharacters: second.characters, samples: options.samples,
    firstWins: 0, secondWins: 0, draws: 0, knockouts: 0, atTurnLimit: 0, totalActions: 0, totalSwitches: 0 };
  for (let sample = 0; sample < options.samples; sample++) {
    const battle = simulateAdvancedDuel({ ...options, firstCharacters: first.characters, secondCharacters: second.characters,
      challenger: sample % 2 === 0 ? 'first' : 'second', seed: (options.seed + (index + 1) * 131071 + (sample + 1) * 8191) >>> 0 });
    if (battle.winnerId === 'first') result.firstWins++;
    else if (battle.winnerId === 'second') result.secondWins++;
    else result.draws++;
    if (battle.finishReason === 'knockout') result.knockouts++;
    if (battle.finishReason === 'turn_limit') result.atTurnLimit++;
    result.totalActions += battle.actions.length;
    result.totalSwitches += battle.actions.filter(a => a.type === 'switch').length;
  }
  return { ...result, firstScore: (result.firstWins + result.draws * 0.5) / result.samples * 100,
    secondScore: (result.secondWins + result.draws * 0.5) / result.samples * 100,
    knockoutRate: result.knockouts / result.samples * 100, drawRate: result.draws / result.samples * 100,
    meanActions: result.totalActions / result.samples, meanSwitches: result.totalSwitches / result.samples };
}

function matrix(groups, options) {
  const rows = [];
  for (let i = 0; i < groups.length; i++) for (let j = i + 1; j < groups.length; j++) rows.push(pair(groups[i], groups[j], options, i * groups.length + j));
  return rows;
}
function metrics(rows) {
  const totalDuels = rows.reduce((sum, row) => sum + row.samples, 0);
  const totalActions = rows.reduce((sum, row) => sum + row.totalActions, 0);
  const knockouts = rows.reduce((sum, row) => sum + row.knockouts, 0);
  const draws = rows.reduce((sum, row) => sum + row.draws, 0);
  const totalSwitches = rows.reduce((sum, row) => sum + row.totalSwitches, 0);
  return { totalDuels, knockouts, draws, totalActions, knockoutRate: knockouts / totalDuels * 100,
    drawRate: draws / totalDuels * 100, meanActions: totalActions / totalDuels, meanSwitches: totalSwitches / totalDuels };
}

export function runAdvancedSimulation({ samples = DEFAULT_SAMPLES, seed = DEFAULT_SEED, strategy = 'adaptive', allowSwitch = true, level = 1 } = {}) {
  if (!Number.isSafeInteger(samples) || samples < 1 || samples > 2000) throw new RangeError('Las muestras por pareja deben estar entre 1 y 2000.');
  createAdvancedRoll(seed);
  const options = { samples, seed, strategy, allowSwitch, level };
  const singles = templates.map(c => ({ id: c.id, name: c.name, characters: [c.id] }));
  const duels = matrix(singles, options);
  const teams = matrix(TEAM_COMPOSITIONS, options);
  const characterScores = templates.map(character => {
    const scores = duels.filter(row => row.firstId === character.id || row.secondId === character.id)
      .map(row => row.firstId === character.id ? row.firstScore : row.secondScore);
    return { id: character.id, name: character.name, rarity: character.rarity, score: scores.reduce((sum, v) => sum + v, 0) / scores.length };
  });
  const rarityScores = [...new Set(templates.map(c => c.rarity))].map(rarity => {
    const members = characterScores.filter(c => c.rarity === rarity);
    return { rarity, characterCount: members.length, score: members.reduce((sum, c) => sum + c.score, 0) / members.length };
  });
  return { rulesVersion: 2, contentVersion: COMBAT_CONTENT_VERSION, samplesPerPair: samples, seed, level, strategy, allowSwitch,
    maxActions: MAX_ADVANCED_TURNS, drawScore: 0.5, initiativeAtEqualSpeed: 'alternating_challenger',
    policy: { cooldowns: 'skip_unavailable', effects: 'discounted_future_value', switchCost: 'one_action', maximumVoluntarySwitchesPerPlayer: allowSwitch ? 2 : 0 },
    limits: ['Heurística de referencia; no demuestra estrategia óptima.', 'Sin rasgos, variantes ni ponderación por supply o población.',
      'Los equipos usan el orden indicado; las composiciones no agotan todos los equipos posibles.', 'Una pareja favorable no determina el balance global.'],
    characters: templates.map(c => ({ id: c.id, name: c.name, rarity: c.rarity, role: c.role, stats: effectiveStats(c.baseStats, level),
      combat: c.combat ?? combatProfile(c.id), attacks: c.attackIds.map(id => advancedAttack(attacks.get(id))) })),
    compositions: TEAM_COMPOSITIONS, duels, teams, characterScores, rarityScores,
    dominanceChecks: [...duels, ...teams].filter(row => Math.max(row.firstScore, row.secondScore) >= 90)
      .map(row => ({ firstId: row.firstId, secondId: row.secondId, firstScore: row.firstScore, secondScore: row.secondScore })),
    metrics: { duels: metrics(duels), teams: metrics(teams), all: metrics([...duels, ...teams]) } };
}

const percent = value => `${value.toFixed(1).replace('.', ',')}%`;
export function printAdvancedSummary(report) {
  console.log(`Balance avanzado Chengdú · reglas ${report.rulesVersion} · contenido ${report.contentVersion}`);
  console.log(`${report.samplesPerPair} duelos por pareja · semilla ${report.seed} · nivel ${report.level} · ${report.strategy}`);
  console.log('Motor real; dos ataques, cooldowns, pasivas, estados y relevo automático. Retador alternado en empates de velocidad.');
  console.log(`Cambios voluntarios: ${report.allowSwitch ? 'heurística con coste de una acción; máximo 2 por jugador' : 'desactivados'}.`);
  console.log('\n1v1 · puntuación media frente a los siete rivales (empate = 0,5)');
  for (const character of report.characterScores) console.log(`${character.name.padEnd(20)} ${percent(character.score).padStart(7)} · ${character.rarity}`);
  console.log('\n3v3 · composiciones de referencia');
  for (const composition of report.compositions) {
    const scores = report.teams.filter(row => row.firstId === composition.id || row.secondId === composition.id)
      .map(row => row.firstId === composition.id ? row.firstScore : row.secondScore);
    console.log(`${composition.name.padEnd(26)} ${percent(scores.reduce((sum, value) => sum + value, 0) / scores.length).padStart(7)}`);
  }
  for (const [format, data] of [['1v1', report.metrics.duels], ['3v3', report.metrics.teams]]) console.log(`\n${format}: ${data.totalDuels} combates · ` +
    `${percent(data.knockoutRate)} KO · ${percent(data.drawRate)} empates · ${data.meanActions.toFixed(1)} acciones · ${data.meanSwitches.toFixed(2)} cambios por combate.`);
  console.log(`\n${report.dominanceChecks.length} parejas tienen una puntuación de al menos 90% en algún lado; son señales para revisar el matchup.`);
  for (const limit of report.limits) console.log(limit);
}

function main(args) {
  if (args.includes('--help')) {
    console.log('Uso: node scripts/simulate-advanced-balance.js [--samples 200] [--seed 73] [--strategy adaptive|basic] [--level 1] [--no-switch] [--json]');
    return;
  }
  const options = {};
  let json = false;
  for (let index = 0; index < args.length; index++) {
    const arg = args[index];
    if (arg === '--json') json = true;
    else if (arg === '--no-switch') options.allowSwitch = false;
    else if (['--samples', '--seed', '--strategy', '--level'].includes(arg)) {
      const value = args[++index];
      if (value === undefined) throw new RangeError(`Falta el valor de ${arg}.`);
      options[arg.slice(2)] = arg === '--strategy' ? value : Number(value);
    } else throw new RangeError(`Opción desconocida: ${arg}. Usa --help.`);
  }
  const report = runAdvancedSimulation(options);
  if (json) console.log(JSON.stringify(report, null, 2));
  else printAdvancedSummary(report);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
