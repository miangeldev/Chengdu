import { randomInt, randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { progressionBaseline, PROGRESSION_VERSION } from '../progression/rules.js';

export async function createUnitInTransaction(repos, { characterId, ownerId, origin, operationKey }, clock) {
  requireGame(typeof operationKey === 'string' && operationKey.trim().length > 0 && operationKey.length <= 200, 'INVALID_OPERATION_KEY');
  requireGame(origin && typeof origin.type === 'string' && typeof origin.sourceId === 'string' &&
    origin.type.length > 0 && origin.type.length <= 200 && origin.sourceId.length > 0 && origin.sourceId.length <= 200, 'INVALID_ORIGIN');
  const existing = await repos.events.find(e => e.operationKey === operationKey);
  if (existing) {
    const unit = await repos.units.get(existing.unitId);
    requireGame(existing.toOwnerId === ownerId && unit.characterId === characterId &&
      unit.origin.type === origin.type && unit.origin.sourceId === origin.sourceId, 'OPERATION_CONFLICT');
    return unit;
  }
  requireGame(await repos.users.get(ownerId), 'USER_NOT_FOUND');
  const character = await repos.characters.get(characterId);
  requireGame(character, 'CHARACTER_NOT_FOUND');
  requireGame(character.obtainable, 'CHARACTER_UNAVAILABLE');
  const counter = await repos.state.get(`mint:${character.id}`);
  requireGame(counter, 'DATABASE_CORRUPT');
  requireGame(character.supply.type !== 'limited' || counter.issuedCount < character.supply.max, 'SUPPLY_EXHAUSTED');
  const serial = counter.lastSerial + 1;
  const issuedCount = counter.issuedCount + 1;
  requireGame(Number.isSafeInteger(serial) && Number.isSafeInteger(issuedCount), 'NUMERIC_OVERFLOW');
  const initialStats = {};
  for (const key of ['hp', 'attack', 'defense', 'speed']) {
    const variation = character.statVariation[key];
    initialStats[key] = character.baseStats[key] + (variation ? randomInt(-variation, variation + 1) : 0);
  }
  const now = clock();
  const unit = {
    id: `${character.unitPrefix}-${String(serial).padStart(6, '0')}`,
    characterId, characterRevision: character.revision, serial, ownerId,
    createdAt: now, updatedAt: now, origin: { type: origin.type, sourceId: origin.sourceId }, initialStats,
    progress: { level: 1, xp: 0 }, statGrowthVersion: PROGRESSION_VERSION, traits: [], variant: 'normal',
    battleStats: { wins: 0, losses: 0 }, lock: null
  };
  await repos.units.insert(unit);
  await repos.state.insert(progressionBaseline('unit', unit));
  await repos.state.replace({ ...counter, lastSerial: serial, issuedCount });
  await repos.events.insert({
    id: `EVT-${randomUUID()}`, type: 'unit_created', unitId: unit.id,
    fromOwnerId: null, toOwnerId: ownerId, reason: origin.type, operationKey, createdAt: now
  });
  return unit;
}
