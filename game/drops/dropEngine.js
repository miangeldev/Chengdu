import { randomInt } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { TRAITS, TRAIT_VERSION, VARIANTS } from '../units/collectibles.js';

const RARITIES = ['common', 'rare', 'epic', 'legendary', 'mythic'];
// node:crypto.randomInt requires its exclusive upper bound to be below 2 ** 48.
export const MAX_DROP_WEIGHT = 2 ** 48 - 1;

function weightedTotal(entries) {
  requireGame(Array.isArray(entries) && entries.length > 0, 'INVALID_PACK');
  let total = 0;
  for (const entry of entries) {
    requireGame(Number.isSafeInteger(entry?.weight) && entry.weight > 0 &&
      Number.isSafeInteger(total + entry.weight) && total + entry.weight <= MAX_DROP_WEIGHT, 'INVALID_PACK');
    total += entry.weight;
  }
  requireGame(total > 0, 'INVALID_PACK');
  return total;
}

function validatePool(pack) {
  weightedTotal(pack?.pool);
  const rarities = new Set();
  const characterIds = new Set();
  for (const entry of pack.pool) {
    requireGame(RARITIES.includes(entry.rarity) && !rarities.has(entry.rarity) &&
      Array.isArray(entry.characterIds) && entry.characterIds.length > 0, 'INVALID_PACK');
    rarities.add(entry.rarity);
    for (const id of entry.characterIds) {
      requireGame(typeof id === 'string' && id.length > 0 && !characterIds.has(id), 'INVALID_PACK');
      characterIds.add(id);
    }
  }
}

export function validatePackDefinition(pack) {
  requireGame(typeof pack?.id === 'string' && /^[a-z][a-z0-9_]*$/.test(pack.id) &&
    Number.isSafeInteger(pack.revision) && pack.revision > 0 &&
    typeof pack.name === 'string' && pack.name.length > 0 && pack.name.length <= 200 &&
    Number.isSafeInteger(pack.price) && pack.price > 0, 'INVALID_PACK');
  validatePool(pack);
  weightedTotal(pack.traitWeights);
  const traitCounts = new Set();
  for (const entry of pack.traitWeights) {
    requireGame(Number.isSafeInteger(entry.count) && entry.count >= 0 && entry.count <= 2 &&
      !traitCounts.has(entry.count), 'INVALID_PACK');
    traitCounts.add(entry.count);
  }
  weightedTotal(pack.variantWeights);
  const variants = new Set();
  for (const entry of pack.variantWeights) {
    requireGame(VARIANTS.some(variant => variant.id === entry.id) && !variants.has(entry.id), 'INVALID_PACK');
    variants.add(entry.id);
  }
  return true;
}

function counterFor(counters, characterId) {
  const id = `mint:${characterId}`;
  if (Array.isArray(counters)) return counters.find(counter => counter.id === id);
  if (counters instanceof Map) return counters.get(id) ?? counters.get(characterId);
  return counters?.[id] ?? counters?.[characterId];
}

export function availablePool(pack, characters, counters) {
  validatePool(pack);
  requireGame(Array.isArray(characters), 'INVALID_PACK');
  const byId = new Map(characters.map(character => [character.id, character]));
  const entries = [];
  for (const entry of pack.pool) {
    const candidates = entry.characterIds.map(id => byId.get(id)).filter(character => {
      if (!character?.obtainable || character.rarity !== entry.rarity) return false;
      // A migrated excess stays frozen even if later content increases its cap.
      // Older unlimited definitions have no marker and keep their availability.
      if (character.supply.grandfatheredIssued !== undefined) return false;
      if (character.supply.type !== 'limited') return true;
      const counter = counterFor(counters, character.id);
      requireGame(Number.isSafeInteger(counter?.issuedCount) && counter.issuedCount >= 0 &&
        Number.isSafeInteger(character.supply.max) && character.supply.max >= 0, 'DATABASE_CORRUPT');
      return counter.issuedCount < character.supply.max;
    }).sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
    if (candidates.length > 0) {
      entries.push({ rarity: entry.rarity, weight: entry.weight, characters: candidates });
    }
  }
  return { entries, totalWeight: entries.reduce((total, entry) => total + entry.weight, 0) };
}

function draw(upper, randomIntFn) {
  const value = randomIntFn(upper);
  requireGame(Number.isSafeInteger(value) && value >= 0 && value < upper, 'INVALID_RANDOM_ROLL', { upper });
  return value;
}

function pickWeighted(entries, total, randomIntFn) {
  let roll = draw(total, randomIntFn);
  for (const entry of entries) {
    if (roll < entry.weight) return entry;
    roll -= entry.weight;
  }
  // Validation guarantees a match; this protects callers against mutated definitions.
  requireGame(false, 'INVALID_PACK');
}

export function rollDrop(pack, available, randomIntFn = upper => randomInt(upper)) {
  validatePackDefinition(pack);
  requireGame(Array.isArray(available?.entries) && Number.isSafeInteger(available.totalWeight) &&
    available.totalWeight >= 0, 'INVALID_PACK');
  if (available.entries.length === 0) {
    requireGame(available.totalWeight === 0, 'INVALID_PACK');
    requireGame(false, 'PACK_UNAVAILABLE');
  }
  const total = weightedTotal(available.entries);
  requireGame(total === available.totalWeight &&
    new Set(available.entries.map(entry => entry.rarity)).size === available.entries.length, 'INVALID_PACK');
  for (const entry of available.entries) {
    const pool = pack.pool.find(candidate => candidate.rarity === entry.rarity);
    requireGame(pool && pool.weight === entry.weight && Array.isArray(entry.characters) &&
      entry.characters.length > 0 && new Set(entry.characters.map(character => character?.id)).size === entry.characters.length &&
      entry.characters.every(character => character?.obtainable === true && character.rarity === entry.rarity &&
        pool.characterIds.includes(character.id)), 'INVALID_PACK');
  }
  requireGame(typeof randomIntFn === 'function', 'INVALID_RANDOM_ROLL');
  const rarity = pickWeighted(available.entries, total, randomIntFn);
  const candidates = [...rarity.characters].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
  const character = candidates[draw(candidates.length, randomIntFn)];
  const count = pickWeighted(pack.traitWeights, weightedTotal(pack.traitWeights), randomIntFn).count;
  const remaining = [...TRAITS];
  const traits = [];
  for (let i = 0; i < count; i++) {
    const [trait] = remaining.splice(draw(remaining.length, randomIntFn), 1);
    traits.push(trait.id);
  }
  const variant = pickWeighted(pack.variantWeights, weightedTotal(pack.variantWeights), randomIntFn).id;
  return { character, traits, variant, traitVersion: TRAIT_VERSION };
}
