import test from 'node:test';
import assert from 'node:assert/strict';
import { runEvolutionSimulation } from '../scripts/simulate-evolution-balance.js';

test('evolution balance compares reproducible real 1v1 and 3v3 matches with paired seeds and current policy', () => {
  const report = runEvolutionSimulation({ samples: 2, seed: 73 });
  assert.deepEqual(report, runEvolutionSimulation({ samples: 2, seed: 73 }));
  assert.equal(report.policyVersion, 2);
  assert.equal(report.totalDuels, 360);
  assert.equal(report.comparisons.find(row => row.level === 5 && row.variant === 'current').bonusPercent, 4);
  assert.equal(report.comparisons.find(row => row.level === 10 && row.variant === 'current').bonusPercent, 5);
  for (const row of report.comparisons) {
    assert.equal(row.individual.length, 3);
    for (const result of [...row.individual, row.team]) {
      assert.ok(result.wins + result.draws <= result.duels);
      assert.ok(result.scorePercent >= 0 && result.scorePercent <= 100);
      assert.ok(Number.isFinite(result.deltaPoints));
      assert.ok(result.meanActions > 0 && result.meanActions <= 100);
      if (row.variant === 'baseline') assert.equal(result.deltaPoints, 0);
    }
  }
});

test('evolution balance rejects invalid sample counts and seeds before starting', () => {
  for (const samples of [0, 1.5, 1001, NaN]) assert.throws(() => runEvolutionSimulation({ samples }), RangeError);
  assert.throws(() => runEvolutionSimulation({ samples: 1, seed: -1 }), RangeError);
});
