import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';

export async function expireListings(repos, now) {
  const timestamp = dailyTimestamp(now);
  const expired = await repos.listings.filter(listing => listing.status === 'active' && dailyTimestamp(listing.expiresAt) <= timestamp);
  for (const listing of expired) {
    const unit = await repos.units.get(listing.unitId);
    requireGame(unit?.lock?.type === 'market' && unit.lock.referenceId === listing.id, 'DATABASE_CORRUPT');
    await repos.units.replace({ ...unit, lock: null, updatedAt: now });
    await repos.listings.replace({ ...listing, status: 'expired', closedAt: now, updatedAt: now });
  }
  return expired.length;
}
