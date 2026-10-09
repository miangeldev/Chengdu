import { requireGame } from './GameError.js';

function compare(a, b) {
  for (let i = 0; i < a.length; i++) {
    if (a[i] < b[i]) return -1;
    if (a[i] > b[i]) return 1;
  }
  return 0;
}

export function paginate(records, { cursor = null, limit = 10 } = {}, scope, key = r => [r.createdAt ?? '', r.id]) {
  requireGame(Number.isSafeInteger(limit) && limit >= 1 && limit <= 25, 'INVALID_PAGE_SIZE');
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
