import { requireGame } from './GameError.js';

export function normalizeIdentity(identity) {
  requireGame(identity?.provider === 'whatsapp' && typeof identity.subject === 'string', 'INVALID_IDENTITY');
  const match = identity.subject.match(/^(\d+)(?::\d+)?@(s\.whatsapp\.net|lid)$/);
  requireGame(match, 'INVALID_IDENTITY');
  return { provider: 'whatsapp', subject: `${match[1]}@${match[2]}` };
}

export function validName(name) {
  requireGame(typeof name === 'string', 'INVALID_NAME');
  const trimmed = name.trim();
  requireGame([...trimmed].length >= 1 && [...trimmed].length <= 40 && !/[\p{Cc}\p{Cf}]/u.test(name), 'INVALID_NAME');
  return trimmed;
}
