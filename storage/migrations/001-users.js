import { createHash } from 'node:crypto';
import { normalizeIdentity, validName } from '../../utils/identity.js';
import { requireGame } from '../../utils/GameError.js';

// Deterministic IDs keep retries stable even before the journal reaches commit.
export function migrateLegacyUsers(records, now) {
  requireGame(Array.isArray(records), 'UNSUPPORTED_LEGACY_DATA');
  const mapping = [];
  const users = records.map(record => {
    requireGame(record && Object.keys(record).every(key => ['id', 'nombre'].includes(key)), 'UNSUPPORTED_LEGACY_DATA');
    const identity = normalizeIdentity({ provider: 'whatsapp', subject: record.id });
    const id = `USR-${createHash('sha256').update(`whatsapp:${identity.subject}`).digest('hex').slice(0, 32)}`;
    mapping.push({ subject: identity.subject, userId: id });
    return {
      id, identities: [identity], name: validName(record.nombre), createdAt: null, updatedAt: now,
      economy: { coins: 0 }, progress: { level: 1, xp: 0 },
      battleStats: { wins: 0, losses: 0, matches: 0 }, team: [], settings: { notifications: true }
    };
  });
  return { users, mapping: { id: 'migration:users-v0', kind: 'migrationMap', entries: mapping } };
}
