import { requireGame } from '../utils/GameError.js';
import { safeAdd } from '../game/progression/rules.js';
import { validatePackDefinition } from '../game/drops/dropEngine.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const integer = (value, minimum = 0) => Number.isSafeInteger(value) && value >= minimum;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
const rarities = ['common', 'rare', 'epic', 'legendary', 'mythic'];
const variants = ['normal', 'shiny', 'golden'];
const traits = ['robust', 'aggressive', 'resolute'];

function definition(pack, characters) {
  validatePackDefinition(pack);
  check(text(pack.id), 'pack.id');
  const seen = new Set();
  for (const bucket of pack.pool) {
    check(Array.isArray(bucket.characterIds) && bucket.characterIds.length > 0, 'pack.characters');
    for (const id of bucket.characterIds) {
      check(text(id) && characters.has(id) && !seen.has(id), 'pack.characterReference');
      seen.add(id);
    }
  }
}

function unitTraits(unit) {
  check([0, 1].includes(unit.traitVersion), 'unit.traitVersion');
  if (unit.traitVersion === 0) return;
  check(Array.isArray(unit.traits) && unit.traits.length <= 2 && new Set(unit.traits).size === unit.traits.length &&
    unit.traits.every(id => traits.includes(id)) && variants.includes(unit.variant), 'unit.collectibles');
}

export function validatePackData(state) {
  const users = new Map(state.usuarios.records.map(u => [u.id, u]));
  const units = new Map(state.unidades.records.map(u => [u.id, u]));
  const characters = new Map(state.personajes.records.map(c => [c.id, c]));
  const packs = new Map(state.sobres.records.map(p => [p.id, p]));
  const openings = new Map(state.aperturas.records.map(o => [o.id, o]));
  const rewards = new Map(state.recompensas.records.map(r => [r.id, r]));
  for (const pack of packs.values()) definition(pack, characters);
  for (const unit of units.values()) unitTraits(unit);
  const operationKeys = new Set();
  for (const opening of openings.values()) {
    const key = opening.operationKey;
    check(typeof opening.id === 'string' && /^OPEN-[a-f0-9-]{32,36}$/.test(opening.id) && users.has(opening.userId) &&
      packs.has(opening.packId) && text(opening.operationKey) && !operationKeys.has(key) && date(opening.createdAt), 'opening.metadata');
    operationKeys.add(key);
    definition(opening.packSnapshot, characters);
    check(opening.packSnapshot.id === opening.packId && opening.packSnapshot.revision === opening.packRevision && opening.packRevision <= packs.get(opening.packId).revision &&
      opening.price === opening.packSnapshot.price && integer(opening.balanceBefore) && integer(opening.balanceAfter) &&
      opening.balanceBefore >= opening.price && opening.balanceAfter === opening.balanceBefore - opening.price, 'opening.price');
    const result = opening.result;
    const character = characters.get(result?.characterId);
    const unit = units.get(opening.unitId);
    const event = state.eventos.records.find(e => e.unitId === opening.unitId);
    check(character && unit && event && result.traitVersion === 1 && text(result.characterName) && rarities.includes(result.rarity) &&
      opening.packSnapshot.pool.some(p => p.rarity === result.rarity && p.characterIds.includes(result.characterId)), 'opening.result');
    check(unit.ownerId === opening.userId && unit.characterId === result.characterId && unit.characterRevision === result.characterRevision &&
      unit.serial === result.serial && equal(unit.traits, result.traits) && unit.variant === result.variant && unit.traitVersion === result.traitVersion &&
      unit.origin.type === 'pack' && unit.origin.sourceId === opening.id && unit.createdAt === opening.createdAt &&
      event.operationKey === `opening:${opening.id}`, 'opening.unitOrigin');
    check(opening.packSnapshot.traitWeights.some(e => e.count === result.traits.length) &&
      opening.packSnapshot.variantWeights.some(e => e.id === result.variant), 'opening.collectibleWeights');
  }
  for (const unit of units.values()) {
    if (unit.origin.type === 'pack' && unit.traitVersion === 1) check(openings.get(unit.origin.sourceId)?.unitId === unit.id, 'unit.opening');
  }

  const balances = new Map(state.estado.records.filter(r => r.kind === 'progressionBaseline' && r.entityType === 'user').map(r => [r.entityId, r.coins]));
  const linked = new Set();
  for (const movement of state.economia.records) {
    check(users.has(movement.userId) && ['credit', 'debit'].includes(movement.type) &&
      ['battle_reward', 'pack_opening'].includes(movement.sourceType) && text(movement.sourceId) &&
      movement.id === `coin:${movement.sourceId}` && !linked.has(movement.sourceId) && date(movement.createdAt) && integer(movement.amount), 'coinMovement.metadata');
    linked.add(movement.sourceId);
    const source = movement.sourceType === 'battle_reward' ? rewards.get(movement.sourceId) : openings.get(movement.sourceId);
    check(source && source.userId === movement.userId && source.createdAt === movement.createdAt &&
      source.balanceBefore === movement.balanceBefore && source.balanceAfter === movement.balanceAfter, 'coinMovement.source');
    check(movement.balanceBefore === balances.get(movement.userId), 'coinMovement.balanceBefore');
    if (movement.sourceType === 'battle_reward') {
      check(movement.type === 'credit' && movement.amount === source.coins &&
        movement.balanceAfter === safeAdd(movement.balanceBefore, movement.amount), 'coinMovement.credit');
    } else {
      check(movement.type === 'debit' && movement.amount === source.price && integer(movement.amount, 1) &&
        movement.balanceBefore >= movement.amount && movement.balanceAfter === movement.balanceBefore - movement.amount, 'coinMovement.debit');
    }
    balances.set(movement.userId, movement.balanceAfter);
  }
  check(linked.size === rewards.size + openings.size && [...rewards.keys(), ...openings.keys()].every(id => linked.has(id)), 'coinMovement.complete');
  for (const user of users.values()) check(user.economy.coins === balances.get(user.id), 'coinMovement.userTotals');
}

export function validatePackTransition(before, after) {
  for (const name of ['aperturas', 'economia']) {
    check(equal(before[name].records, after[name].records.slice(0, before[name].records.length)), `${name}.appendOnly`);
  }
  const previousUnits = new Set(before.unidades.records.map(u => u.id));
  for (const unit of after.unidades.records.filter(u => !previousUnits.has(u.id))) check(unit.traitVersion === 1, 'unit.newTraitVersion');
  for (const opening of after.aperturas.records.slice(before.aperturas.records.length)) {
    const pack = before.sobres.records.find(p => p.id === opening.packId);
    const character = before.personajes.records.find(c => c.id === opening.result.characterId);
    const unit = after.unidades.records.find(u => u.id === opening.unitId);
    check(pack && equal(opening.packSnapshot, pack) && character && character.obtainable &&
      character.revision === opening.result.characterRevision && character.name === opening.result.characterName &&
      character.rarity === opening.result.rarity && unit && !previousUnits.has(unit.id), 'opening.newSource');
    const counter = before.estado.records.find(r => r.id === `mint:${character.id}`);
    check(counter && (character.supply.type !== 'limited' || counter.issuedCount < character.supply.max), 'opening.availableSupply');
    for (const key of ['hp', 'attack', 'defense', 'speed']) {
      check(unit.initialStats[key] >= character.baseStats[key] - character.statVariation[key] &&
        unit.initialStats[key] <= character.baseStats[key] + character.statVariation[key], 'opening.birthStats');
    }
  }
}
