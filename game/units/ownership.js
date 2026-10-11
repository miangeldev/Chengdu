import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';

function eventsFrom(eventsOrState) {
  return Array.isArray(eventsOrState) ? eventsOrState : eventsOrState?.eventos?.records ?? [];
}

// Version zero belongs to the immutable emission, even after several sales.
export function ownershipAt(eventsOrState, unitId, version = 0) {
  if (!Number.isSafeInteger(version) || version < 0) return null;
  const events = eventsFrom(eventsOrState);
  const mint = events.find(event => event.unitId === unitId && event.type === 'unit_created');
  if (!mint) return null;
  if (version === 0) return mint.toOwnerId;
  return events.find(event => event.unitId === unitId && event.type === 'unit_transferred' && event.ownershipVersion === version)?.toOwnerId ?? null;
}

export async function transferUnitInTransaction(repos, { unitId, fromOwnerId, toOwnerId, sourceId }, now) {
  requireGame(typeof sourceId === 'string' && /^SALE-[a-f0-9-]{32,36}$/.test(sourceId), 'INVALID_TRANSFER_SOURCE');
  const operationKey = `transfer:${sourceId}`;
  const previous = await repos.events.find(event => event.operationKey === operationKey);
  if (previous) {
    requireGame(previous.type === 'unit_transferred' && previous.unitId === unitId && previous.fromOwnerId === fromOwnerId &&
      previous.toOwnerId === toOwnerId && previous.sourceId === sourceId, 'OPERATION_CONFLICT');
    return { unit: await repos.units.get(unitId), event: previous };
  }
  const unit = await repos.units.get(unitId);
  requireGame(unit, 'UNIT_NOT_FOUND');
  requireGame(unit.ownerId === fromOwnerId, 'UNIT_NOT_OWNED');
  requireGame(fromOwnerId !== toOwnerId, 'SELF_TRANSFER');
  const buyer = await repos.users.get(toOwnerId);
  requireGame(buyer, 'USER_NOT_FOUND');
  requireGame(unit.lock?.type === 'market', 'UNIT_LOCKED');
  const listing = await repos.listings.get(unit.lock.referenceId);
  requireGame(listing && listing.status === 'active' && listing.unitId === unitId && listing.sellerId === fromOwnerId &&
    listing.ownershipVersion === unit.ownershipVersion, 'DATABASE_CORRUPT');
  const ownershipVersion = unit.ownershipVersion + 1;
  requireGame(Number.isSafeInteger(unit.ownershipVersion) && unit.ownershipVersion >= 0 && Number.isSafeInteger(ownershipVersion), 'NUMERIC_OVERFLOW');
  const updated = { ...unit, ownerId: toOwnerId, ownershipVersion, lock: null, updatedAt: now };
  const event = await repos.events.insert({
    id: `EVT-${randomUUID()}`, type: 'unit_transferred', unitId,
    fromOwnerId, toOwnerId, reason: 'market', sourceId, operationKey, ownershipVersion, createdAt: now
  });
  await repos.units.replace(updated);
  // Fetch the current seller so coin credits in this transaction remain intact.
  const seller = await repos.users.get(fromOwnerId);
  requireGame(seller, 'USER_NOT_FOUND');
  if (seller.team.includes(unitId)) await repos.users.replace({ ...seller, team: seller.team.filter(id => id !== unitId), updatedAt: now });
  return { unit: updated, event };
}
