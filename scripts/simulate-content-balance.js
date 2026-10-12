import { pathToFileURL } from 'node:url';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { seedEventAttacks, seedEventCharacters } from '../game/content/catalog.js';
import { simulateAdvancedDuel } from './simulate-advanced-balance.js';

export function runContentSimulation({ samples = 200, seed = 73 } = {}) {
  if (!Number.isSafeInteger(samples) || samples < 1 || samples > 2000) throw new RangeError('Muestras entre 1 y 2000.');
  const catalog = [...seedCharacters(), ...seedEventCharacters()];
  const attackDefinitions = new Map([...seedAttacks(), ...seedEventAttacks()].map(attack => [attack.id, attack]));
  const pairs = [];
  for (let first = 0; first < catalog.length; first++) for (let second = first + 1; second < catalog.length; second++) {
    const row = { firstId: catalog[first].id, secondId: catalog[second].id, firstWins: 0, secondWins: 0, draws: 0 };
    for (let sample = 0; sample < samples; sample++) {
      const battle = simulateAdvancedDuel({ firstCharacters: [row.firstId], secondCharacters: [row.secondId], catalog, attackDefinitions,
        challenger: sample % 2 ? 'second' : 'first', seed: (seed + (first * 10 + second + 1) * 131071 + (sample + 1) * 8191) >>> 0 });
      if (battle.winnerId === 'first') row.firstWins++;
      else if (battle.winnerId === 'second') row.secondWins++;
      else row.draws++;
    }
    pairs.push({ ...row, samples, firstScore: (row.firstWins + row.draws / 2) * 100 / samples });
  }
  const characters = catalog.map(character => {
    const scores = pairs.filter(pair => [pair.firstId, pair.secondId].includes(character.id)).map(pair => pair.firstId === character.id ? pair.firstScore : 100 - pair.firstScore);
    return { id: character.id, name: character.name, rarity: character.rarity, event: Boolean(character.eventId), stats: character.baseStats, combat: character.combat,
      attacks: character.attackIds.map(id => attackDefinitions.get(id)), supply: character.supply.max,
      score: scores.reduce((sum, score) => sum + score, 0) / scores.length };
  });
  return { policyVersion: 1, rulesVersion: 2, samplesPerPair: samples, seed, totalDuels: samples * pairs.length, characters, pairs,
    limits: ['Heurística de referencia; no demuestra estrategia óptima.', 'Nivel 1, sin rasgos ni variantes. Iniciativa alternada; todas las parejas incluidas.', 'Los personajes del evento comparten el límite por rareza y no cambian estadísticas de unidades anteriores.'] };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const report = runContentSimulation();
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else {
    console.log(`${report.totalDuels} combates del catálogo Beta 0.8.`);
    for (const character of report.characters) console.log(`${character.name}: ${character.score.toFixed(1)}% · ${character.rarity}${character.event ? ' · evento' : ''}`);
    for (const limit of report.limits) console.log(limit);
  }
}
