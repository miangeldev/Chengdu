import { requireGame } from '../../utils/GameError.js';
import { ACHIEVEMENTS } from '../content/catalog.js';

export const SOCIAL_POLICY_VERSION = 1;
export const defaultPreferences = () => ({ favorite: null, featured: [], selectedTitleCode: null, bio: '' });

export function validBio(value) {
  requireGame(typeof value === 'string' && [...value].length <= 140 && !/[\p{Cc}\p{Cf}]/u.test(value), 'INVALID_SOCIAL_BIO');
  return value.trim();
}

export function earnedTitles(state, userId, at = null) {
  const cutoff = at === null ? Infinity : Date.parse(at);
  const achievements = (state.logros?.records ?? []).filter(row => row.userId === userId && Date.parse(row.unlockedAt) <= cutoff);
  const result = achievements.map(row => {
    const definition = ACHIEVEMENTS.find(value => value.id === row.achievementId);
    return { code: definition.code, name: definition.title, badge: definition.badge, source: 'achievement' };
  });
  for (const reward of state.premiostemporada?.records ?? []) {
    if (reward.userId !== userId || Date.parse(reward.createdAt) > cutoff) continue;
    result.push({ code: reward.seasonId.split(':').at(-1), name: reward.title, badge: '🏅', source: 'season' });
  }
  if ((state.artesania?.records ?? []).some(row => row.userId === userId && row.kind === 'craft' &&
    row.badge === 'bambu_artesano' && Date.parse(row.createdAt) <= cutoff)) {
    result.push({ code: 'A1', name: 'Artesano del Bambú', badge: '🪵', source: 'craft' });
  }
  return result;
}
