import { pathToFileURL } from 'node:url';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { seedEventAttacks, seedEventCharacters } from '../game/content/catalog.js';
import { seedSpiritsAttacks, seedSpiritsCharacters } from '../game/content/spiritsCatalog.js';
import { SPIRITS_RELEASE_AT } from '../game/content/eventPolicy.js';
import { advancedAttack, combatProfile } from '../game/battle/combatContent.js';
import { activeUnit, calculateAdvancedDamage, initializeAdvancedBattle, resolveAdvancedAction } from '../game/battle/advancedEngine.js';
import { attachFatality } from '../game/battle/fatality.js';
import { effectiveStats } from '../game/progression/rules.js';
import { chooseAdvancedAction, createAdvancedRoll } from './simulate-advanced-balance.js';

const catalog = [...seedCharacters(), ...seedEventCharacters(), ...seedSpiritsCharacters()];
const definitions = new Map([...seedAttacks(), ...seedEventAttacks(), ...seedSpiritsAttacks()].map(attack => [attack.id, attack]));
const newIds = seedSpiritsCharacters().map(character => character.id);
const opponents = catalog.filter(character => !newIds.includes(character.id));

function snapshot(id, owner, index, level, random) {
  const character = catalog.find(character => character.id === id), profile = character.combat ?? combatProfile(id);
  const stats = effectiveStats(character.baseStats, level);
  return attachFatality({ id: `${owner}:${index}:${id}`, characterId: id, characterName: character.name,
    characterRevision: character.revision, level, stats, hp: stats.hp, profileVersion: profile.version,
    element: profile.element, ability: structuredClone(profile.ability), attacks: character.attackIds.map(id => advancedAttack(definitions.get(id))) }, SPIRITS_RELEASE_AT, random);
}

export function simulateSpiritsDuel({ first, second, level = 1, seed = 73, challenger = 'first', useFatality = true } = {}) {
  const random = createAdvancedRoll(seed);
  const players = [{ userId: 'first', name: 'Primero', units: first.map((id, index) => snapshot(id, 'first', index, level, random)), activeIndex: 0 },
    { userId: 'second', name: 'Segundo', units: second.map((id, index) => snapshot(id, 'second', index, level, random)), activeIndex: 0 }];
  if (challenger === 'second') players.reverse();
  let battle = initializeAdvancedBattle({ id: 'BTL-spirits-reference', rulesVersion: 2, acceptedAt: SPIRITS_RELEASE_AT,
    createdAt: SPIRITS_RELEASE_AT, players });
  const switches = { first: 0, second: 0 };
  while (battle.status === 'active') {
    const player = battle.players.find(player => player.userId === battle.turnUserId), actor = activeUnit(player);
    const target = activeUnit(battle.players.find(other => other.userId !== player.userId));
    let decision = chooseAdvancedAction(battle, { switchesUsed: switches[player.userId] });
    if (useFatality && decision.type === 'attack' && actor.fatality?.unlocked && !actor.fatality.used && !actor.effects.some(effect => effect.type === 'stun')) {
      const normal = actor.attacks[Number(decision.choice) - 1], special = actor.fatality.attack;
      const shield = target.effects.find(effect => effect.type === 'shield')?.potency ?? 0;
      const expected = move => Math.min(target.hp, Math.max(0, calculateAdvancedDamage(move, actor, target) - shield)) * move.accuracy / 100;
      const normalUtility = normal.effects.length * 5;
      if (expected(special) > expected(normal) + normalUtility) decision = { type: 'attack', choice: '3' };
    }
    if (decision.type === 'switch') switches[player.userId]++;
    const now = new Date(Date.parse(SPIRITS_RELEASE_AT) + (battle.actions.length + 1) * 1000).toISOString();
    battle = resolveAdvancedAction(battle, { ...decision, userId: player.userId, now, roll: decision.type === 'attack' ? random() : null }).battle;
  }
  return battle;
}

const compositions = [
  { name: 'Máscaras y llamas', first: ['guardian_mil_mascaras', 'zorro_llamas_errantes', 'panda_guerrero'], second: ['dragon_carmesi', 'bruja_lunar', 'espiritu_bambu'] },
  { name: 'Una máscara entre comunes', first: ['guardian_mil_mascaras', 'panda_guerrero', 'mago_carmesi'], second: ['monje_celestial', 'guardian_jade', 'bruja_lunar'] },
  { name: 'Llamas y control', first: ['zorro_llamas_errantes', 'bruja_lunar', 'lobo_sombrio'], second: ['dragon_carmesi', 'monje_celestial', 'guardian_jade'] },
  { name: 'Tres Máscaras', first: ['guardian_mil_mascaras', 'guardian_mil_mascaras', 'guardian_mil_mascaras'], second: ['dragon_carmesi', 'bruja_lunar', 'espiritu_bambu'] },
  { name: 'Tres Llamas', first: ['zorro_llamas_errantes', 'zorro_llamas_errantes', 'zorro_llamas_errantes'], second: ['dragon_carmesi', 'bruja_lunar', 'espiritu_bambu'] }
];

export function runSpiritsSimulation({ samples = 100, seed = 73, levels = [1, 5, 15, 20] } = {}) {
  if (!Number.isSafeInteger(samples) || samples < 1 || samples > 1000) throw new RangeError('Muestras entre 1 y 1000.');
  if (!Array.isArray(levels) || levels.some(level => !Number.isSafeInteger(level) || level < 1 || level > 20)) throw new RangeError('Niveles entre 1 y 20.');
  const matches = [], teams = [], referenceMatches = [];
  let count = 0, openingRolls = 0, unlocked = 0, specialUses = 0;
  function measure(first, second, level, matchIndex) {
    const result = { level, samples, scoreWith: 0, scoreWithout: 0, meanActionsWith: 0, unlocks: 0, uses: 0 };
    const hasExclusive = [...first, ...second].some(id => newIds.includes(id));
    for (let sample = 0; sample < samples; sample++) {
      const options = { first, second, level, seed: (seed + matchIndex * 131071 + (sample + 1) * 8191) >>> 0,
        challenger: sample % 2 ? 'second' : 'first' };
      for (const useFatality of (hasExclusive ? [false, true] : [true])) {
        const battle = simulateSpiritsDuel({ ...options, useFatality }); count++;
        const score = battle.winnerId === 'first' ? 1 : battle.winnerId === null ? 0.5 : 0;
        result[useFatality ? 'scoreWith' : 'scoreWithout'] += score * 100 / samples;
        if (useFatality) {
          const exclusive = battle.players.flatMap(player => player.units).filter(unit => unit.fatality);
          const openings = exclusive.filter(unit => unit.fatality.unlocked).length;
          const uses = exclusive.filter(unit => unit.fatality.used).length;
          result.meanActionsWith += battle.actions.length / samples; result.unlocks += openings; result.uses += uses;
          openingRolls += exclusive.length; unlocked += openings; specialUses += uses;
        }
      }
    }
    if (!hasExclusive) result.scoreWithout = result.scoreWith;
    return { ...result, scoreDelta: result.scoreWith - result.scoreWithout };
  }
  for (const level of levels) {
    for (const characterId of newIds) for (const opponent of opponents) matches.push({ characterId, opponentId: opponent.id,
      ...measure([characterId], [opponent.id], level, matches.length + 1) });
    for (const team of compositions) teams.push({ name: team.name, first: team.first, second: team.second,
      ...measure(team.first, team.second, level, 1000 + teams.length) });
    for (const referenceId of ['dragon_carmesi', 'bruja_lunar', 'espiritu_bambu', 'guardian_espectral']) for (const opponent of opponents)
      referenceMatches.push({ characterId: referenceId, opponentId: opponent.id,
        ...measure([referenceId], [opponent.id], level, 2000 + referenceMatches.length) });
  }
  const characterScores = levels.flatMap(level => newIds.map(characterId => {
    const rows = matches.filter(row => row.level === level && row.characterId === characterId);
    return { characterId, rarity: catalog.find(character => character.id === characterId).rarity, level,
      scoreWith: rows.reduce((sum, row) => sum + row.scoreWith, 0) / rows.length,
      scoreWithout: rows.reduce((sum, row) => sum + row.scoreWithout, 0) / rows.length,
      fatalityDelta: rows.reduce((sum, row) => sum + row.scoreDelta, 0) / rows.length };
  }));
  const referenceScores = levels.flatMap(level => ['dragon_carmesi', 'bruja_lunar', 'espiritu_bambu', 'guardian_espectral'].map(characterId => {
    const rows = referenceMatches.filter(row => row.level === level && row.characterId === characterId);
    return { characterId, level, score: rows.reduce((sum, row) => sum + row.scoreWith, 0) / rows.length };
  }));
  return { policyVersion: 1, seed, samples, levels, totalDuels: count, openingRolls, unlocked,
    unlockPercent: unlocked * 100 / openingRolls, specialUses, characterScores, referenceScores, matches, teams, referenceMatches,
    newCharacters: seedSpiritsCharacters().map(character => ({ id: character.id, rarity: character.rarity, stats: character.baseStats, combat: character.combat })),
    limitations: ['Motor real; heurística de referencia, no estrategia óptima.', 'Sin rasgos, variantes ni evoluciones; niveles iguales y retador alternado.',
      'Control y tratamiento comparten semilla y tiradas de apertura. En el control se conserva la tirada y se omite voluntariamente el tercer ataque.',
      'Referencias antiguas usan la misma cesta de diez rivales; incluye el espejo al 50% para permitir la comparación de promedios.',
      'Los porcentajes son estimaciones de estos emparejamientos; las rarezas no buscan idéntica fuerza.'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = runSpiritsSimulation();
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${report.totalDuels} combates · aperturas Fatality: ${report.unlockPercent.toFixed(2)}%`);
    for (const row of report.characterScores) console.log(`${row.characterId} · Nv.${row.level} · ${row.scoreWith.toFixed(1)}% · efecto Fatality ${row.fatalityDelta.toFixed(2)} pp`);
  }
}
