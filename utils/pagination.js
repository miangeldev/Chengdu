import { requireGame } from './GameError.js';

function compare(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

export function paginate(records, { cursor = null, page = null, limit = 10 } = {}, scope, key = r => [r.createdAt ?? '', r.id]) {
  requireGame(Number.isSafeInteger(limit) && limit >= 1 && limit <= 25, 'INVALID_PAGE_SIZE');
  if (page !== null) {
    requireGame(Number.isSafeInteger(page) && page >= 1 && cursor === null, 'INVALID_PAGE');
    const sorted = [...records].sort((a, b) => compare(key(a), key(b)));
    const totalItems = sorted.length;
    const totalPages = Math.max(1, Math.ceil(totalItems / limit));
    requireGame(page <= totalPages, 'PAGE_NOT_FOUND', { totalPages });
    return {
      items: structuredClone(sorted.slice((page - 1) * limit, page * limit)),
      page, totalItems, totalPages,
      previousPage: page > 1 ? page - 1 : null,
      nextPage: page < totalPages ? page + 1 : null
    };
  }
  let after = null;
  if (cursor !== null) {
    requireGame(typeof cursor === 'string' && cursor.length <= 1024 && /^[A-Za-z0-9_-]+$/.test(cursor), 'INVALID_CURSOR');
    try {
      const parsed = JSON.parse(Buffer.from(cursor, 'base64url').toString('utf8'));
      requireGame(parsed.scope === scope && Array.isArray(parsed.key) && parsed.key.length === 2 && parsed.key.every(v => typeof v === 'string'), 'INVALID_CURSOR');
      after = parsed.key;
    } catch {
      requireGame(false, 'INVALID_CURSOR');
    }
  }
  const sorted = [...records].sort((a, b) => compare(key(a), key(b)));
  const candidates = after ? sorted.filter(r => compare(key(r), after) > 0) : sorted;
  const items = candidates.slice(0, limit);
  const nextCursor = candidates.length > limit
    ? Buffer.from(JSON.stringify({ scope, key: key(items.at(-1)) })).toString('base64url')
    : null;
  return { items: structuredClone(items), nextCursor };
}
