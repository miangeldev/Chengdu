import { pathToFileURL } from 'node:url';
import { BALANCED_STATS, BALANCE_VERSION, LEGACY_STATS } from '../game/characters/balance.js';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { calculateDamage, firstPlayer, MAX_TURNS, resolveAttack } from '../game/battle/engine.js';
import { effectiveStats, LEVEL_CAPS } from '../game/progression/rules.js';

const NOW = '2026-10-09T00:00:00.000Z';
const DEFAULT_SAMPLES = 2_000;
const DEFAULT_SEED = 73;
const templates = seedCharacters();
const attacks = new Map(seedAttacks().map(attack => [attack.id, attack]));
const strategies = new Set(['adaptive', '1', '2']);
const aliases = { panda_guerrero: 'Panda', mago_carmesi: 'Mago', lobo_sombrio: 'Lobo',
  monje_celestial: 'Monje', guardian_jade: 'Jade', bruja_lunar: 'Bruja',
  dragon_carmesi: 'Dragón', espiritu_bambu: 'Bambú' };
const rarityNames = { common: 'común', rare: 'raro', epic: 'épico', legendary: 'legendario', mythic: 'mítico' };

// A separate generator per duel keeps results stable across execution order.
export function createSeededRoll(seed = DEFAULT_SEED) {
  if (!Number.isSafeInteger(seed) || seed < 0 || seed > 0xffffffff) {
    throw new RangeError('La semilla debe ser un entero entre 0 y 4294967295.');
  }
  let state = seed >>> 0 || 1;
  return () => {
    state ^= state << 13;
    state ^= state >>> 17;
    state ^= state << 5;
    return (state >>> 0) % 100;
  };
}

function simulatedPlayer(characterId, userId, level, statsTable) {
  const template = templates.find(character => character.id === characterId);
  const base = statsTable[characterId];
  if (!template || !base) throw new RangeError(`Personaje sin estadísticas de referencia: ${characterId}.`);
  if (!Number.isSafeInteger(level) || level < 1 || level > LEVEL_CAPS.unit) {
    throw new RangeError(`El nivel de unidad debe estar entre 1 y ${LEVEL_CAPS.unit}.`);
  }
  // Apply the current growth rules to both catalogs, with no traits or variants.
  const stats = effectiveStats(base, level);
  return { userId, unit: { stats, hp: stats.hp, attacks: template.attackIds.map(id => {
    const attack = attacks.get(id);
    if (!attack) throw new RangeError(`Ataque de referencia no encontrado: ${id}.`);
    return attack;
  }) } };
}

function chooseAttack(battle, strategy) {
  if (strategy !== 'adaptive') return strategy;
  const attacker = battle.players.find(player => player.userId === battle.turnUserId);
  const defender = battle.players.find(player => player.userId !== battle.turnUserId);
  const damage = attacker.unit.attacks.map(attack => calculateDamage(attack, attacker.unit.stats, defender.unit.stats));
  const lethalAccuracy = attacker.unit.attacks.map((attack, index) => damage[index] >= defender.unit.hp ? attack.accuracy : 0);
  if (Math.max(...lethalAccuracy) > 0) return lethalAccuracy[0] >= lethalAccuracy[1] ? '1' : '2';
  const expectedDamage = attacker.unit.attacks.map((attack, index) => damage[index] * attack.accuracy);
  return expectedDamage[1] > expectedDamage[0] ? '2' : '1';
}

// Returns the actual engine result; roll can be injected for deterministic checks.
export function simulateDuel({ firstCharacterId, secondCharacterId, firstLevel = 1, secondLevel = 1,
  statsTable = BALANCED_STATS, strategy = 'adaptive', challenger = 'first', seed = DEFAULT_SEED,
  roll = createSeededRoll(seed) } = {}) {
  if (!strategies.has(strategy)) throw new RangeError('Estrategia válida: adaptive, 1 o 2.');
  if (!['first', 'second'].includes(challenger)) throw new RangeError('El retador debe ser first o second.');
  if (typeof roll !== 'function') throw new TypeError('roll debe ser una función.');
  const first = simulatedPlayer(firstCharacterId, 'first', firstLevel, statsTable);
  const second = simulatedPlayer(secondCharacterId, 'second', secondLevel, statsTable);
  const players = challenger === 'first' ? [first, second] : [second, first];
  let battle = { status: 'active', players, turnUserId: firstPlayer(players), turnNumber: 1, actions: [] };
  while (battle.status === 'active') {
    battle = resolveAttack(battle, { userId: battle.turnUserId, choice: chooseAttack(battle, strategy), now: NOW, roll: roll() }).battle;
  }
  return battle;
}

function simulatePair(firstCharacterId, secondCharacterId, options) {
  let firstWins = 0, secondWins = 0, draws = 0, atTurnLimit = 0, totalTurns = 0;
  for (let index = 0; index < options.samples; index++) {
    const battle = simulateDuel({ ...options, firstCharacterId, secondCharacterId,
      // Alternating the challenger removes a systematic advantage at equal speed.
      challenger: index % 2 === 0 ? 'second' : 'first',
      seed: (options.seed + (index + 1) * 8_191) >>> 0 });
    if (battle.winnerId === 'first') firstWins++;
    else if (battle.winnerId === 'second') secondWins++;
    else draws++;
    totalTurns += battle.actions.length;
    if (battle.actions.length === MAX_TURNS) atTurnLimit++;
  }
  return { firstCharacterId, secondCharacterId, firstLevel: options.firstLevel, secondLevel: options.secondLevel,
    samples: options.samples, firstWins, secondWins, draws, atTurnLimit,
    firstScore: (firstWins + draws * 0.5) / options.samples * 100,
    secondScore: (secondWins + draws * 0.5) / options.samples * 100,
    meanTurns: totalTurns / options.samples };
}

function simulateMatrix(statsTable, level, options) {
  const rows = [];
  for (let firstIndex = 0; firstIndex < templates.length; firstIndex++) {
    for (let secondIndex = firstIndex + 1; secondIndex < templates.length; secondIndex++) {
      rows.push(simulatePair(templates[firstIndex].id, templates[secondIndex].id, {
        ...options, statsTable, firstLevel: level, secondLevel: level,
        seed: (options.seed + (firstIndex + 1) * 128 + secondIndex) >>> 0
      }));
    }
  }
  return rows;
}

export function runSimulation({ samples = DEFAULT_SAMPLES, seed = DEFAULT_SEED, strategy = 'adaptive' } = {}) {
  if (!Number.isSafeInteger(samples) || samples < 1 || samples > 20_000) {
    throw new RangeError('Las muestras por pareja deben estar entre 1 y 20000.');
  }
  createSeededRoll(seed);
  if (!strategies.has(strategy)) throw new RangeError('Estrategia válida: adaptive, 1 o 2.');
  const options = { samples, seed, strategy };
  const legacyLevel1 = simulateMatrix(LEGACY_STATS, 1, options);
  const balancedLevel1 = simulateMatrix(BALANCED_STATS, 1, options);
  const balancedLevel20 = simulateMatrix(BALANCED_STATS, 20, options);
  const progressionChecks = templates.filter(template => template.starterEligible).map(template =>
    simulatePair('dragon_carmesi', template.id, { ...options, statsTable: BALANCED_STATS, firstLevel: 1, secondLevel: 20 }));
  const allPairs = [...legacyLevel1, ...balancedLevel1, ...balancedLevel20, ...progressionChecks];
  return {
    balanceVersion: BALANCE_VERSION, samplesPerPair: samples, seed, strategy, traits: [],
    maxTurns: MAX_TURNS, drawScore: 0.5, initiativeAtEqualSpeed: 'alternating_challenger',
    totalDuels: allPairs.reduce((sum, row) => sum + row.samples, 0),
    draws: allPairs.reduce((sum, row) => sum + row.draws, 0),
    atTurnLimit: allPairs.reduce((sum, row) => sum + row.atTurnLimit, 0),
    characters: templates.map(template => ({ id: template.id, name: template.name, rarity: template.rarity,
      legacyStats: LEGACY_STATS[template.id], balancedStats: BALANCED_STATS[template.id] })),
    legacyLevel1, balancedLevel1, balancedLevel20, progressionChecks
  };
}

function percent(value) {
  return `${value.toFixed(1).replace('.', ',')}%`;
}

function characterMeans(rows) {
  return new Map(templates.map(template => {
    const values = rows.filter(row => row.firstCharacterId === template.id || row.secondCharacterId === template.id)
      .map(row => row.firstCharacterId === template.id ? row.firstScore : row.secondScore);
    return [template.id, values.reduce((sum, value) => sum + value, 0) / values.length];
  }));
}

function printMatrix(title, rows) {
  const columns = templates.map(template => aliases[template.id] ?? template.name);
  const scores = new Map(rows.flatMap(row => [[`${row.firstCharacterId}:${row.secondCharacterId}`, row.firstScore],
    [`${row.secondCharacterId}:${row.firstCharacterId}`, row.secondScore]]));
  console.log(`\n${title} · puntuación del personaje de la fila`);
  console.log(''.padEnd(12) + columns.map(label => label.padStart(8)).join(''));
  for (const template of templates) {
    console.log((aliases[template.id] ?? template.name).padEnd(12) + templates.map(opponent =>
      (opponent.id === template.id ? '—' : percent(scores.get(`${template.id}:${opponent.id}`))).padStart(8)).join(''));
  }
}

function printSummary(report) {
  console.log(`Balance Chengdú · versión ${report.balanceVersion}`);
  console.log(`${report.samplesPerPair.toLocaleString('es-MX')} duelos por pareja · semilla ${report.seed} · sin rasgos`);
  console.log(report.strategy === 'adaptive' ? 'Estrategia: mayor probabilidad de KO inmediato; después mayor daño esperado.' :
    `Estrategia de control: usar siempre el ataque ${report.strategy}.`);
  console.log('Ataques y crecimiento: reglas reales. La velocidad decide la iniciativa; retador alternado si empatan.');
  console.log(`Cada empate cuenta 0,5. Límite real: ${report.maxTurns} turnos.`);
  printMatrix('Catálogo anterior · nivel 1', report.legacyLevel1);
  printMatrix('Balance actual · nivel 1', report.balancedLevel1);
  printMatrix('Balance actual · nivel 20', report.balancedLevel20);
  const oldMeans = characterMeans(report.legacyLevel1);
  const newMeans = characterMeans(report.balancedLevel1);
  const level20Means = characterMeans(report.balancedLevel20);
  console.log('\nMedia por calidad · rivales equiprobables');
  console.log('Calidad'.padEnd(14) + ['Antes nv1', 'Actual nv1', 'Actual nv20'].map(label => label.padStart(14)).join(''));
  for (const rarity of new Set(templates.map(template => template.rarity))) {
    const members = templates.filter(template => template.rarity === rarity);
    console.log((rarityNames[rarity] ?? rarity).padEnd(14) + [oldMeans, newMeans, level20Means].map(means =>
      percent(members.reduce((sum, template) => sum + means.get(template.id), 0) / members.length).padStart(14)).join(''));
  }
  console.log('\nProgresión · común nivel 20 contra Dragón nivel 1');
  for (const row of report.progressionChecks) {
    console.log(`${aliases[row.secondCharacterId] ?? row.secondCharacterId}: ${percent(row.secondWins / row.samples * 100)} victorias; ` +
      `Dragón: ${percent(row.firstWins / row.samples * 100)}; empates: ${percent(row.draws / row.samples * 100)}.`);
  }
  console.log(`\n${report.totalDuels.toLocaleString('es-MX')} duelos · ${report.draws} empates · ${report.atTurnLimit} alcanzaron ${report.maxTurns} turnos.`);
  console.log('Límites: política de referencia, sin demostrar estrategia óptima; sin rasgos ni ponderación por supply/población.');
}

function main(args) {
  if (args.includes('--help')) {
    console.log('Uso: node scripts/simulate-balance.js [--samples 2000] [--seed 73] [--strategy adaptive|1|2] [--json]');
    return;
  }
  const options = {};
  let json = false;
  for (let index = 0; index < args.length; index++) {
    const argument = args[index];
    if (argument === '--json') json = true;
    else if (['--samples', '--seed', '--strategy'].includes(argument)) {
      const value = args[++index];
      if (value === undefined) throw new RangeError(`Falta el valor de ${argument}.`);
      options[argument.slice(2)] = argument === '--strategy' ? value : Number(value);
    } else throw new RangeError(`Opción desconocida: ${argument}. Usa --help.`);
  }
  const report = runSimulation(options);
  if (json) console.log(JSON.stringify(report, null, 2));
  else printSummary(report);
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
