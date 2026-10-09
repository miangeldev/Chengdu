import { GameError, requireGame } from '../utils/GameError.js';
import { normalizeIdentity, validName } from '../utils/identity.js';
import { validateBattleData, validateBattleTransition } from './battleValidation.js';

export const V1_COLLECTIONS = Object.freeze(['usuarios', 'personajes', 'unidades', 'estado', 'eventos']);
export const COLLECTIONS = Object.freeze([...V1_COLLECTIONS, 'ataques', 'combates']);
export const SCHEMA_VERSION = 2;
const integer = (v, minimum = 0) => Number.isSafeInteger(v) && v >= minimum;
const text = v => typeof v === 'string' && v.length > 0 && v.length <= 200;
const date = v => typeof v === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(v) && Number.isFinite(Date.parse(v));
const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

function unique(records, key, field) {
  const seen = new Set();
  for (const record of records) {
    const value = key(record);
    check(!seen.has(value), field);
    seen.add(value);
  }
}

function stats(value, variation = false) {
  check(value && typeof value === 'object', 'stats');
  for (const key of ['hp', 'attack', 'defense', 'speed']) {
    check(integer(value[key], variation || key === 'defense' ? 0 : 1), `stats.${key}`);
  }
}

function progress(value) {
  check(value && integer(value.level, 1) && integer(value.xp), 'progress');
}

export function validateDatabase(state, schemaVersion = SCHEMA_VERSION) {
  try {
    requireGame([1, 2].includes(schemaVersion), 'UNSUPPORTED_SCHEMA_VERSION');
    for (const name of schemaVersion === 1 ? V1_COLLECTIONS : COLLECTIONS) {
      const collection = state[name];
      check(collection && typeof collection._meta === 'object', name);
      requireGame(collection._meta.schemaVersion === schemaVersion, 'UNSUPPORTED_SCHEMA_VERSION', { collection: name });
      check(integer(collection._meta.revision) && (collection._meta.updatedAt === null || date(collection._meta.updatedAt)), `${name}._meta`);
      check(Array.isArray(collection.records), `${name}.records`);
      for (const r of collection.records) check(r && text(r.id), `${name}.id`);
      unique(collection.records, r => r.id, `${name}.id`);
    }
    const users = state.usuarios.records;
    const characters = state.personajes.records;
    const units = state.unidades.records;
    const entries = state.estado.records;
    const events = state.eventos.records;
    const userById = new Map(users.map(r => [r.id, r]));
    const characterById = new Map(characters.map(r => [r.id, r]));
    const unitById = new Map(units.map(r => [r.id, r]));
    const identities = [];

    for (const u of users) {
      check(/^USR-[a-f0-9-]{32,36}$/.test(u.id), 'user.id');
      check(validName(u.name) === u.name, 'user.name');
      check(Array.isArray(u.identities) && u.identities.length > 0, 'user.identities');
      for (const identity of u.identities) {
        check(equal(normalizeIdentity(identity), identity), 'user.identity');
        identities.push(identity);
      }
      check(u.createdAt === null || date(u.createdAt), 'user.createdAt');
      check(date(u.updatedAt) && integer(u.economy?.coins), 'user.economy');
      progress(u.progress);
      for (const field of ['wins', 'losses', 'matches']) check(integer(u.battleStats?.[field]), `user.${field}`);
      check(u.battleStats.wins + u.battleStats.losses <= u.battleStats.matches, 'user.matches');
      check(Array.isArray(u.team) && u.team.length <= 3 && new Set(u.team).size === u.team.length, 'user.team');
      for (const unitId of u.team) check(unitById.get(unitId)?.ownerId === u.id, 'user.team.owner');
      check(typeof u.settings?.notifications === 'boolean', 'user.settings');
    }
    unique(identities, r => `${r.provider}:${r.subject}`, 'identity.unique');
    unique(characters, r => r.unitPrefix, 'character.prefix');
    for (const c of characters) {
      check(/^[a-z][a-z0-9_]*$/.test(c.id) && /^[A-Z]{2,8}$/.test(c.unitPrefix), 'character.id');
      check(integer(c.revision, 1) && text(c.name) && text(c.role), 'character.metadata');
      check(['common', 'rare', 'epic', 'legendary', 'mythic'].includes(c.rarity), 'character.rarity');
      stats(c.baseStats);
      stats(c.statVariation, true);
      for (const key of ['hp', 'attack', 'defense', 'speed']) {
        check(c.statVariation[key] <= 1_000_000 && Number.isSafeInteger(c.baseStats[key] + c.statVariation[key]) &&
          c.baseStats[key] - c.statVariation[key] >= (key === 'defense' ? 0 : 1), 'character.variation');
      }
      check(Array.isArray(c.attackIds) && c.attackIds.every(text), 'character.attacks');
      check(typeof c.obtainable === 'boolean' && typeof c.starterEligible === 'boolean', 'character.availability');
      check(c.supply?.type === 'unlimited' ? c.supply.max === null : c.supply?.type === 'limited' && integer(c.supply.max, 1), 'character.supply');
    }
    unique(units, r => `${r.characterId}:${r.serial}`, 'unit.serial');
    for (const u of units) {
      const character = characterById.get(u.characterId);
      check(character && userById.has(u.ownerId), 'unit.references');
      check(integer(u.serial, 1) && u.id === `${character.unitPrefix}-${String(u.serial).padStart(6, '0')}`, 'unit.id');
      check(integer(u.characterRevision, 1) && u.characterRevision <= character.revision, 'unit.characterRevision');
      check(date(u.createdAt) && date(u.updatedAt), 'unit.timestamps');
      check(text(u.origin?.type) && text(u.origin?.sourceId), 'unit.origin');
      stats(u.initialStats);
      progress(u.progress);
      check(Array.isArray(u.traits) && u.traits.every(text) && text(u.variant), 'unit.traits');
      check(integer(u.battleStats?.wins) && integer(u.battleStats?.losses) && (schemaVersion === 2 || u.lock === null), 'unit.state');
    }

    const counters = entries.filter(r => r.kind === 'mintCounter');
    const claims = entries.filter(r => r.kind === 'claim');
    check(entries.every(r => ['mintCounter', 'claim', 'migrationMap'].includes(r.kind)), 'state.kind');
    unique(counters, r => r.characterId, 'counter.character');
    for (const character of characters) {
      const counter = counters.find(r => r.characterId === character.id);
      const minted = units.filter(r => r.characterId === character.id);
      const maximum = minted.reduce((value, r) => Math.max(value, r.serial), 0);
      check(counter && counter.id === `mint:${character.id}` && integer(counter.lastSerial) && integer(counter.issuedCount), 'counter');
      check(counter.lastSerial === maximum && counter.issuedCount === minted.length, 'counter.emissions');
      if (character.supply.type === 'limited') check(counter.issuedCount <= character.supply.max, 'counter.supply');
    }
    check(counters.every(r => characterById.has(r.characterId)), 'counter.references');
    unique(events, r => r.operationKey, 'event.operationKey');
    unique(events, r => r.unitId, 'event.unit');
    check(events.length === units.length, 'event.emissions');
    for (const event of events) {
      const unit = unitById.get(event.unitId);
      check(event.type === 'unit_created' && unit && event.fromOwnerId === null && userById.has(event.toOwnerId) && unit.ownerId === event.toOwnerId, 'event.references');
      check(text(event.operationKey) && text(event.reason) && date(event.createdAt), 'event.metadata');
      check(event.reason === unit.origin.type && event.createdAt === unit.createdAt, 'event.origin');
    }
    unique(claims, r => r.userId, 'claim.user');
    for (const claim of claims) {
      const unit = unitById.get(claim.unitId);
      const event = events.find(r => r.unitId === claim.unitId);
      check(claim.id === `starter:${claim.userId}` && userById.has(claim.userId) && unit, 'claim.references');
      check(claim.rewardType === 'starter' && text(claim.sourceId) && date(claim.createdAt), 'claim.metadata');
      check(unit.origin.type === 'starter' && unit.origin.sourceId === claim.sourceId && event.toOwnerId === claim.userId && event.operationKey === claim.id, 'claim.origin');
    }
    for (const unit of units.filter(r => r.origin.type === 'starter')) {
      check(claims.some(r => r.unitId === unit.id), 'starter.claim');
    }
    for (const migration of entries.filter(r => r.kind === 'migrationMap')) {
      check(migration.id === 'migration:users-v0' && Array.isArray(migration.entries), 'migration.map');
      unique(migration.entries, r => r.subject, 'migration.subject');
      for (const item of migration.entries) {
        check(userById.get(item.userId)?.identities.some(r => r.subject === item.subject), 'migration.references');
      }
    }
    if (schemaVersion === 2) validateBattleData(state);
    return { valid: true, schemaVersion, users: users.length, characters: characters.length, units: units.length, claims: claims.length };
  } catch (error) {
    if (error instanceof GameError && ['DATABASE_CORRUPT', 'UNSUPPORTED_SCHEMA_VERSION'].includes(error.code)) throw error;
    throw new GameError('DATABASE_CORRUPT', {}, { cause: error });
  }
}

export function validateTransition(before, after) {
  for (const name of COLLECTIONS) {
    const nextById = new Map(after[name].records.map(r => [r.id, r]));
    for (const previous of before[name].records) {
      const next = nextById.get(previous.id);
      check(next, `${name}.deletion`);
      if (name === 'eventos' || (name === 'estado' && previous.kind !== 'mintCounter')) {
        check(equal(previous, next), `${name}.immutable`);
      }
      if (name === 'unidades') {
        for (const key of ['characterId', 'characterRevision', 'serial', 'ownerId', 'origin', 'initialStats', 'createdAt']) {
          check(equal(previous[key], next[key]), `unit.immutable.${key}`);
        }
      }
      if (name === 'personajes') {
        check(next.unitPrefix === previous.unitPrefix, 'character.prefix.immutable');
        check(next.revision >= previous.revision && (equal(next, previous) || next.revision > previous.revision), 'character.revision');
      }
      if (name === 'ataques') {
        check(next.revision >= previous.revision && (equal(next, previous) || next.revision > previous.revision), 'attack.revision');
      }
      if (name === 'estado' && previous.kind === 'mintCounter') {
        check(next.lastSerial >= previous.lastSerial && next.issuedCount >= previous.issuedCount, 'counter.monotonic');
      }
    }
  }
  validateBattleTransition(before, after);
}
