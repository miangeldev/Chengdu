import test from 'node:test';
import assert from 'node:assert/strict';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedPacks } from '../game/packs/catalog.js';
import { availablePool, MAX_DROP_WEIGHT, rollDrop, validatePackDefinition } from '../game/drops/dropEngine.js';
import { applyTraits, TRAITS, TRAIT_VERSION, traitName, variantName } from '../game/units/collectibles.js';

function fixture() {
  const pack = seedPacks()[0];
  const characters = seedCharacters();
  const counters = characters.map(character => ({ id: `mint:${character.id}`, issuedCount: 0, lastSerial: 0 }));
  return { pack, characters, counters, available: availablePool(pack, characters, counters) };
}

function sequence(values, uppers = null) {
  let index = 0;
  return upper => {
    if (uppers) assert.equal(upper, uppers[index], `RNG bound ${index}`);
    assert.ok(index < values.length, 'RNG requested too many draws');
    return values[index++];
  };
}

test('pack seeds are independent and include all eight characters with exact advertised weights', () => {
  const c = fixture();
  assert.equal(validatePackDefinition(c.pack), true);
  assert.equal(c.pack.price, 500);
  assert.deepEqual(c.available.entries.map(entry => [entry.rarity, entry.weight, entry.characters.length]), [
    ['common', 7000, 3], ['rare', 2200, 2], ['epic', 700, 2], ['legendary', 100, 1]
  ]);
  assert.equal(c.available.totalWeight, 10000);
  c.pack.pool[0].characterIds.pop();
  c.pack.traitWeights[0].weight = 1;
  assert.equal(seedPacks()[0].pool[0].characterIds.length, 3);
  assert.equal(seedPacks()[0].traitWeights[0].weight, 8000);
});

test('weighted rarity selection respects every cumulative boundary and stable character order', () => {
  const c = fixture();
  const boundaries = [[0, 'common'], [6999, 'common'], [7000, 'rare'], [9199, 'rare'],
    [9200, 'epic'], [9899, 'epic'], [9900, 'legendary'], [9999, 'legendary']];
  for (const [roll, rarity] of boundaries) {
    const drop = rollDrop(c.pack, c.available, sequence([roll, 0, 0, 0]));
    assert.equal(drop.character.rarity, rarity);
    assert.deepEqual(drop.traits, []);
    assert.equal(drop.variant, 'normal');
    assert.equal(drop.traitVersion, TRAIT_VERSION);
  }
  const characters = [...c.characters].reverse();
  const available = availablePool(c.pack, characters, c.counters);
  assert.deepEqual(available.entries[0].characters.map(character => character.id),
    ['lobo_sombrio', 'mago_carmesi', 'panda_guerrero']);
  for (let index = 0; index < 3; index++) {
    assert.equal(rollDrop(c.pack, available, sequence([0, index, 0, 0])).character.id,
      available.entries[0].characters[index].id);
  }
});

test('supply, obtainable flags and changed rarity remove candidates and renormalize only eligible rarity weights', () => {
  const c = fixture();
  const before = structuredClone(c);
  c.counters.find(counter => counter.id === 'mint:dragon_carmesi').issuedCount = 500;
  c.characters.find(character => character.id === 'bruja_lunar').obtainable = false;
  c.characters.find(character => character.id === 'espiritu_bambu').rarity = 'rare';
  const available = availablePool(c.pack, c.characters, c.counters);
  assert.deepEqual(available.entries.map(entry => [entry.rarity, entry.weight]), [['common', 7000], ['rare', 2200]]);
  assert.equal(available.totalWeight, 9200);
  const drop = rollDrop(c.pack, available, sequence([9199, 1, 0, 0], [9200, 2, 10000, 10000]));
  assert.equal(drop.character.id, 'monje_celestial');
  assert.deepEqual(c.pack, before.pack);
  c.characters.find(character => character.id === 'mago_carmesi').obtainable = false;
  const fewerCommons = availablePool(c.pack, c.characters, c.counters);
  assert.equal(fewerCommons.entries[0].weight, 7000);
  assert.equal(fewerCommons.entries[0].characters.length, 2);
  assert.deepEqual(availablePool(c.pack, c.characters, new Map(c.counters.map(counter => [counter.id, counter]))), fewerCommons);
});

test('an exhausted pool fails before requesting randomness and missing supply counters fail closed', () => {
  const c = fixture();
  c.characters.forEach(character => { character.obtainable = false; });
  const available = availablePool(c.pack, c.characters, c.counters);
  assert.deepEqual(available, { entries: [], totalWeight: 0 });
  assert.throws(() => rollDrop(c.pack, available, () => { assert.fail('empty pool must not draw'); }), { code: 'PACK_UNAVAILABLE' });
  c.characters.find(character => character.id === 'dragon_carmesi').obtainable = true;
  assert.throws(() => availablePool(c.pack, c.characters, []), { code: 'DATABASE_CORRUPT' });
});

test('trait counts and variants respect exact boundaries and two traits are sampled without replacement', () => {
  const c = fixture();
  for (const [roll, count] of [[0, 0], [7999, 0], [8000, 1], [9899, 1], [9900, 2], [9999, 2]]) {
    const drop = rollDrop(c.pack, c.available, sequence([0, 0, roll, ...Array(count).fill(0), 0]));
    assert.equal(drop.traits.length, count);
    assert.equal(new Set(drop.traits).size, count);
  }
  const lastTraits = rollDrop(c.pack, c.available, sequence([9999, 0, 9999, 2, 1, 9999], [10000, 1, 10000, 3, 2, 10000]));
  assert.deepEqual(lastTraits.traits, ['resolute', 'aggressive']);
  assert.equal(lastTraits.variant, 'golden');
  for (const [roll, expected] of [[0, 'normal'], [9399, 'normal'], [9400, 'shiny'], [9899, 'shiny'], [9900, 'golden'], [9999, 'golden']]) {
    assert.equal(rollDrop(c.pack, c.available, sequence([0, 0, 0, roll])).variant, expected);
  }
});

test('invalid RNG values at every selection stage abort deterministically', () => {
  const c = fixture();
  for (const value of [-1, 10000, 0.5, Number.NaN, Number.POSITIVE_INFINITY, Number.MAX_SAFE_INTEGER + 1, '0', null]) {
    assert.throws(() => rollDrop(c.pack, c.available, () => value), { code: 'INVALID_RANDOM_ROLL' });
  }
  for (const values of [[0, 3], [0, 0, 10000], [0, 0, 9900, 3], [0, 0, 9900, 0, 2], [0, 0, 0, 10000]]) {
    assert.throws(() => rollDrop(c.pack, c.available, sequence(values)), { code: 'INVALID_RANDOM_ROLL' });
  }
});

test('invalid weight totals and incompatible pack choices are rejected before drawing', () => {
  for (const mutate of [
    pack => { pack.pool[0].weight = 0; },
    pack => { pack.pool[0].weight = -1; },
    pack => { pack.pool[0].weight = 1.5; },
    pack => { pack.pool[0].weight = Number.MAX_SAFE_INTEGER; },
    pack => { pack.pool[1].rarity = 'common'; },
    pack => { pack.pool[0].characterIds.push('panda_guerrero'); },
    pack => { pack.traitWeights[1].count = 3; },
    pack => { pack.traitWeights[1].count = 0; },
    pack => { pack.variantWeights[1].id = 'unknown'; },
    pack => { pack.variantWeights[1].id = 'normal'; }
  ]) {
    const c = fixture();
    mutate(c.pack);
    assert.throws(() => rollDrop(c.pack, c.available, () => assert.fail('invalid pack must not draw')), { code: 'INVALID_PACK' });
  }
  const c = fixture();
  c.available.totalWeight -= 1;
  assert.throws(() => rollDrop(c.pack, c.available, () => assert.fail('invalid total must not draw')), { code: 'INVALID_PACK' });
});

test('weighted totals accept the crypto bound and future mythic definitions', () => {
  const c = fixture();
  c.pack.pool = [{ rarity: 'mythic', weight: MAX_DROP_WEIGHT, characterIds: ['dragon_carmesi'] }];
  c.characters.find(character => character.id === 'dragon_carmesi').rarity = 'mythic';
  const available = availablePool(c.pack, c.characters, c.counters);
  assert.equal(available.totalWeight, MAX_DROP_WEIGHT);
  const drop = rollDrop(c.pack, available, sequence([MAX_DROP_WEIGHT - 1, 0, 0, 0], [MAX_DROP_WEIGHT, 1, 10000, 10000]));
  assert.equal(drop.character.rarity, 'mythic');
  c.pack.pool[0].weight += 1;
  assert.throws(() => validatePackDefinition(c.pack), { code: 'INVALID_PACK' });
});

test('caller-supplied available candidates cannot inject characters, duplicate entries or alter rarity', () => {
  for (const mutate of [
    available => { available.entries[0].characters[0] = { ...available.entries[0].characters[0], id: 'injected' }; },
    available => { available.entries[0].characters[0] = { ...available.entries[0].characters[0], rarity: 'legendary' }; },
    available => { available.entries[0].characters[0] = { ...available.entries[0].characters[0], obtainable: false }; },
    available => { available.entries[0].characters.push(available.entries[0].characters[0]); },
    available => { available.entries.push(available.entries[0]); available.totalWeight += available.entries[0].weight; },
    available => { available.entries[0].characters[0] = null; }
  ]) {
    const c = fixture();
    mutate(c.available);
    assert.throws(() => rollDrop(c.pack, c.available, () => assert.fail('injected candidates must not draw')), { code: 'INVALID_PACK' });
  }
});

test('trait effects stay small, preserve birth stats and keep legacy unknown traits inert', () => {
  const initialStats = { hp: 120, attack: 24, defense: 22, speed: 8 };
  assert.deepEqual(applyTraits(initialStats, ['robust', 'aggressive'], 1), { hp: 123, attack: 25, defense: 22, speed: 8 });
  assert.deepEqual(applyTraits(initialStats, ['resolute'], 1), { hp: 120, attack: 24, defense: 23, speed: 8 });
  assert.deepEqual(applyTraits(initialStats, ['unknown', 'robust'], 0), initialStats);
  assert.deepEqual(initialStats, { hp: 120, attack: 24, defense: 22, speed: 8 });
  assert.notEqual(applyTraits(initialStats, [], 1), initialStats);
  assert.equal(traitName('robust'), 'Robusto');
  assert.equal(traitName('resolute'), 'Firme');
  assert.equal(traitName('legacy'), 'legacy');
  assert.equal(variantName('golden'), 'Dorada');
  assert.equal(TRAITS.length, 3);
  for (const [traits, version] of [[['unknown'], 1], [['robust', 'robust'], 1], [['robust', 'aggressive', 'resolute'], 1], [[], 2]]) {
    assert.throws(() => applyTraits(initialStats, traits, version), { code: 'INVALID_COLLECTIBLES' });
  }
});

test('percentage bonuses round down and reject final overflow without unsafe intermediate multiplication', () => {
  for (const [hp, expected] of [[33, 33], [34, 35], [99, 101], [100, 103], [133, 136]]) {
    assert.equal(applyTraits({ hp, attack: 1, defense: 1, speed: 1 }, ['robust'], 1).hp, expected);
  }
  const hp = 8_000_000_000_000_001;
  assert.equal(applyTraits({ hp, attack: 1, defense: 1, speed: 1 }, ['robust'], 1).hp, 8_240_000_000_000_001);
  assert.throws(() => applyTraits({ hp: Number.MAX_SAFE_INTEGER, attack: 1, defense: 1, speed: 1 }, ['robust'], 1), { code: 'NUMERIC_OVERFLOW' });
  assert.throws(() => applyTraits({ hp: 100, attack: Number.MAX_SAFE_INTEGER, defense: 1, speed: 1 }, ['aggressive'], 1), { code: 'NUMERIC_OVERFLOW' });
});
