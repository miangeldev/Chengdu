import { requireGame } from '../../utils/GameError.js';

// Listings are retained in append order, including closed ones. The ordinal is
// global, so a code never changes with filters, pagination or listing status.
export const listingCodeAt = index => `M${index + 1}`;

export async function getListingCode(repos, id) {
  const index = (await repos.listings.all()).findIndex(listing => listing.id === id);
  requireGame(index >= 0, 'DATABASE_CORRUPT');
  return listingCodeAt(index);
}

export async function resolveListingId(repos, reference) {
  requireGame(typeof reference === 'string' && reference.trim().length > 0 && reference.length <= 100, 'LISTING_NOT_FOUND');
  const value = reference.trim();
  if (/^M\d+$/i.test(value)) {
    const ordinal = Number(value.slice(1));
    const listing = Number.isSafeInteger(ordinal) && ordinal > 0
      ? (await repos.listings.all())[ordinal - 1] : null;
    // Keep an unknown reference unresolved: normal lookups reject it, and a
    // retry with a different reference still reports an operation conflict.
    return listing?.id ?? value.toUpperCase();
  }
  // Old messages and integrations can continue using the internal UUID.
  return `LIST-${value.replace(/^LIST-/i, '').toLowerCase()}`;
}
