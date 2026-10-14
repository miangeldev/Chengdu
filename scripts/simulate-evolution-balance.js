import { pathToFileURL } from 'node:url';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { advancedAttack } from '../game/battle/combatContent.js';
import { initializeAdvancedBattle, resolveAdvancedAction } from '../game/battle/advancedEngine.js';
import { effectiveStats } from '../game/progression/rules.js';
import { evolvedStats, evolutionBonusPercent, evolutionPolicy, formForCharacter } from '../game/evolution/rules.js';
import { chooseAdvancedAction, createAdvancedRoll, TEAM_COMPOSITIONS } from './simulate-advanced-balance.js';

const NOW = '2026-10-13T08:00:00.000Z';
const characters = seedCharacters();
const attacks = new Map(seedAttacks().map(attack => [attack.id, attack]));
const starters = characters.filter(character => character.starterEligible);

function snapshot(character, owner, index, level, variant) {
  const base = effectiveStats(character.baseStats, level);
  const form = formForCharacter(character.id);
  const evolution = variant === 'current' && form ? {
    version: evolutionPolicy().version, formId: form.id,
    receiptId: 'EVO-00000000-0000-0000-0000-000000000000', evolvedAt: NOW
  } : null;
  const candidate = variant === 'flat3' ? 3 : variant === 'flat5' ? 5 : 0;
  const stats = evolution ? evolvedStats(base, evolution, character.id, level) :
    Object.fromEntries(Object.entries(base).map(([key, value]) => [key, value + Math.floor(value * candidate / 100)]));
  return { id: `${owner}:${index}:${character.id}`, characterId: character.id, characterName: character.name,
    characterRevision: character.revision, level, evolution, stats, hp: stats.hp,
    profileVersion: character.combat.version, element: character.combat.element,
    ability: structuredClone(character.combat.ability), attacks: character.attackIds.map(id => advancedAttack(attacks.get(id))) };
}

function duel(firstCharacters, secondCharacters, { level, variant, sample, seed }) {
  const players = [
    { userId: 'first', name: 'Evolución', activeIndex: 0,
      units: firstCharacters.map((id, i) => snapshot(characters.find(c => c.id === id), 'first', i, level, variant)) },
    { userId: 'second', name: 'Base', activeIndex: 0,
      units: secondCharacters.map((id, i) => snapshot(characters.find(c => c.id === id), 'second', i, level, 'baseline')) }
  ];
  let battle = initializeAdvancedBattle({ id: 'BTL-evolution-reference', rulesVersion: 2,
    acceptedAt: NOW, createdAt: NOW, mode: 'advanced', teamSize: firstCharacters.length,
    players: sample % 2 === 0 ? players : players.reverse() });
  const roll = createAdvancedRoll(seed), switches = { first: 0, second: 0 };
  while (battle.status === 'active') {
    const userId = battle.turnUserId;
    const decision = chooseAdvancedAction(battle, { switchesUsed: switches[userId] });
    if (decision.type === 'switch') switches[userId]++;
    battle = resolveAdvancedAction(battle, { ...decision, userId,
      now: new Date(Date.parse(NOW) + 1000 * (battle.actions.length + 1)).toISOString(),
      roll: decision.type === 'attack' ? roll() : null }).battle;
  }
  return battle;
}

function comparison(first, opponents, options, groupIndex) {
  let wins = 0, draws = 0, actions = 0;
  const duels = options.samples * opponents.length;
  for (let opponentIndex = 0; opponentIndex < opponents.length; opponentIndex++) {
    for (let sample = 0; sample < options.samples; sample++) {
      // Every candidate faces the same seeded sample and alternating challenger.
      const seed = (options.seed + (groupIndex + 1) * 104729 + (opponentIndex + 1) * 131071 + (sample + 1) * 8191) >>> 0;
      const result = duel(first.characters, opponents[opponentIndex].characters, { ...options, sample, seed });
      if (result.winnerId === 'first') wins++;
      if (result.winnerId === null) draws++;
      actions += result.actions.length;
    }
  }
  return { id: first.id, duels, wins, draws, scorePercent: 100 * (wins + draws * 0.5) / duels,
    meanActions: actions / duels };
}

export function runEvolutionSimulation({ samples = 100, seed = 73 } = {}) {
  if (!Number.isSafeInteger(samples) || samples < 1 || samples > 1000) throw new RangeError('Usa de 1 a 1000 muestras por pareja.');
  createAdvancedRoll(seed);
  const singles = characters.map(c => ({ id: c.id, characters: [c.id] }));
  const results = [];
  for (const level of [5, 10]) {
    for (const variant of level === 5 ? ['baseline', 'flat3', 'current', 'flat5'] : ['baseline', 'current']) {
      const options = { samples, seed, level, variant };
      const individual = starters.map((c, index) => comparison({ id: c.id, characters: [c.id] }, singles, options, index));
      const team = comparison(TEAM_COMPOSITIONS[0], TEAM_COMPOSITIONS, options, 3);
      results.push({ level, variant, bonusPercent: variant === 'current' ? evolutionBonusPercent({ version: evolutionPolicy().version }, level) :
        variant === 'flat3' ? 3 : variant === 'flat5' ? 5 : 0, individual, team });
    }
  }
  for (const row of results) {
    const baseline = results.find(other => other.level === row.level && other.variant === 'baseline');
    for (const character of row.individual) character.deltaPoints = character.scorePercent - baseline.individual.find(c => c.id === character.id).scorePercent;
    row.team.deltaPoints = row.team.scorePercent - baseline.team.scorePercent;
  }
  return { policyVersion: evolutionPolicy().version, samplesPerPair: samples, seed, stages: evolutionPolicy().stages,
    totalDuels: results.reduce((sum, row) => sum + row.team.duels + row.individual.reduce((total, c) => total + c.duels, 0), 0),
    comparisons: results,
    limitations: ['Simulación con heurística adaptativa; no prueba una estrategia óptima ni tasas de producción.',
      'Sin rasgos ni variantes; ocho personajes base y seis composiciones de referencia.',
      'En 3v3 se evoluciona el trío inicial completo y el adversario conserva su equipo base.',
      'Los porcentajes son puntuación media contra los rivales de referencia; un empate vale medio punto.'] };
}

function main(args) {
  const options = {};
  let json = false;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--json') json = true;
    else if (['--samples', '--seed'].includes(args[i])) {
      const key = args[i].slice(2), value = args[++i];
      if (value === undefined) throw new RangeError(`Falta el valor de ${key}.`);
      options[key] = Number(value);
    } else throw new RangeError('Uso: node scripts/simulate-evolution-balance.js [--samples 100] [--seed 73] [--json]');
  }
  const report = runEvolutionSimulation(options);
  if (json) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`Evoluciones · política ${report.policyVersion} · ${report.totalDuels} combates · semilla ${report.seed}`);
    for (const row of report.comparisons) {
      console.log(`Nv. ${row.level} · ${row.variant} · +${row.bonusPercent}%`);
      for (const c of [...row.individual, row.team]) console.log(`  ${c.id}: ${c.scorePercent.toFixed(2)}% · delta ${c.deltaPoints.toFixed(2)} puntos`);
    }
    for (const limit of report.limitations) console.log(limit);
  }
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  try { main(process.argv.slice(2)); }
  catch (error) { console.error(error.message); process.exitCode = 1; }
}
