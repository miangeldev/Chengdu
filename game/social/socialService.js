import { randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { effectiveUnitStats, displayUnitCharacterName } from '../evolution/rules.js';
import { ACHIEVEMENTS, CONTENT_POLICY_VERSION } from '../content/catalog.js';
import { achievementProgress, objectiveState } from '../content/objectives.js';
import { rankTier, rankingEligible } from '../competitive/policy.js';
import { defaultPreferences, earnedTitles, SOCIAL_POLICY_VERSION, validBio } from './policy.js';

async function titleState(repos) {
  return { logros: { records: await repos.achievements.all() },
    premiostemporada: { records: await repos.seasonRewards.all() },
    artesania: { records: repos.craftingActions ? await repos.craftingActions.all() : [] } };
}

async function requireUser(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function unitView(repos, unit) {
  const character = await repos.characters.get(unit.characterId);
  const evolution = unit.evolution?.formId;
  const stats = effectiveUnitStats(unit);
  return { id: unit.id, characterId: unit.characterId, name: displayUnitCharacterName(unit, character),
    rarity: character.rarity, role: character.role, serial: unit.serial, progress: { ...unit.progress },
    variant: unit.variant, traits: [...unit.traits], stats,
    battleStats: { ...unit.battleStats }, createdAt: unit.createdAt,
    origin: { type: unit.origin.type }, evolution: unit.evolution ? { formId: evolution } : null };
}

async function ownedSelection(repos, userId, selection) {
  if (!selection) return null;
  const unit = await repos.units.get(selection.unitId);
  return unit?.ownerId === userId && unit.ownershipVersion === selection.ownershipVersion ? unitView(repos, unit) : null;
}

async function profileView(repos, user, viewerId = null) {
  const stored = await repos.socialProfiles.get(`social:${user.id}`);
  const preferences = stored?.preferences ?? defaultPreferences();
  const titles = earnedTitles(await titleState(repos), user.id);
  const rankings = await repos.rankings.filterBy('userId', user.id);
  const rank = rankings.at(-1);
  const season = rank ? await repos.seasons.get(rank.seasonId) : null;
  const favorite = await ownedSelection(repos, user.id, preferences.favorite);
  const featured = (await Promise.all(preferences.featured.map(selection => ownedSelection(repos, user.id, selection)))).filter(Boolean);
  return { player: { name: user.name, joinedAt: user.createdAt, progress: { ...user.progress },
    battleStats: { ...user.battleStats }, unitCount: (await repos.units.getByOwner(user.id)).length },
    bio: preferences.bio, title: titles.find(row => row.code === preferences.selectedTitleCode) ?? null,
    titles, favorite, featured,
    rank: rank ? { rating: rank.rating, tier: rankTier(rank.rating), eligible: rankingEligible(rank), seasonCode: season?.code ?? null } : null,
    isSelf: viewerId === user.id };
}

export function createSocialService(storage, clock) {
  return {
    async getProfile({ userId, viewerId = null }) {
      return storage.withRead(async repos => {
        if (viewerId !== null) await requireUser(repos, viewerId);
        return profileView(repos, await requireUser(repos, userId), viewerId);
      });
    },
    async getCollection({ userId, page = 1, limit = 5 }) {
      return storage.withRead(async repos => {
        const user = await requireUser(repos, userId);
        const result = paginate(await repos.units.getByOwner(userId), { page, limit }, `publicCollection:${userId}`);
        result.items = await Promise.all(result.items.map(unit => unitView(repos, unit)));
        return { ...result, player: { name: user.name } };
      });
    },
    async getShowcase({ userId }) {
      return storage.withRead(async repos => {
        const user = await requireUser(repos, userId);
        const profile = await profileView(repos, user);
        const units = await repos.units.getByOwner(userId);
        const rarities = { common: 0, rare: 1, epic: 2, legendary: 3, mythic: 4 };
        const withCharacters = await Promise.all(units.map(async unit => ({ unit, rarity: rarities[(await repos.characters.get(unit.characterId)).rarity] })));
        const rarest = [...withCharacters].sort((a, b) => b.rarity - a.rarity || a.unit.id.localeCompare(b.unit.id))[0]?.unit;
        const oldest = [...units].sort((a, b) => a.createdAt.localeCompare(b.createdAt) || a.id.localeCompare(b.id))[0];
        const victories = [...units].sort((a, b) => b.battleStats.wins - a.battleStats.wins || a.id.localeCompare(b.id))[0];
        return { ...profile, highlights: {
          rarest: rarest ? await unitView(repos, rarest) : null,
          oldest: oldest ? await unitView(repos, oldest) : null,
          mostVictories: victories ? await unitView(repos, victories) : null
        } };
      });
    },
    async compareUnits({ userId, unitIds }) {
      requireGame(Array.isArray(unitIds) && unitIds.length === 2 && unitIds.every(value => typeof value === 'string'), 'INVALID_SOCIAL_COMPARISON');
      const ids = unitIds.map(value => value.trim().toUpperCase());
      requireGame(ids[0] !== ids[1], 'INVALID_SOCIAL_COMPARISON');
      return storage.withRead(async repos => {
        await requireUser(repos, userId);
        const units = await Promise.all(ids.map(async id => {
          const unit = await repos.units.get(id);
          requireGame(unit, 'UNIT_NOT_FOUND');
          return unitView(repos, unit);
        }));
        return { units };
      });
    },
    async getTitles(userId) {
      return storage.withTransaction(async repos => {
        await requireUser(repos, userId);
        const now = clock();
        const state = await objectiveState(repos);
        for (const definition of ACHIEVEMENTS) {
          const id = `ACH:${userId}:${definition.id}`;
          if (await repos.achievements.get(id)) continue;
          const progress = achievementProgress(state, userId, definition.id, now);
          if (progress.current >= definition.target) await repos.achievements.insert({ id, userId,
            achievementId: definition.id, policyVersion: CONTENT_POLICY_VERSION, unlockedAt: now,
            snapshot: structuredClone(definition), evidence: progress.evidence });
        }
        return { titles: earnedTitles(await titleState(repos), userId) };
      });
    },
    async updatePreferences({ userId, operationKey, ...patch }) {
      requireGame(typeof operationKey === 'string' && operationKey.trim() === operationKey && operationKey.length > 0 && operationKey.length <= 200, 'INVALID_OPERATION_KEY');
      const keys = Object.keys(patch);
      requireGame(keys.length > 0 && keys.every(key => ['favoriteUnitId', 'featuredUnitIds', 'selectedTitleCode', 'bio'].includes(key)), 'INVALID_SOCIAL_PREFERENCES');
      const request = {};
      if (Object.hasOwn(patch, 'bio')) request.bio = validBio(patch.bio);
      if (Object.hasOwn(patch, 'favoriteUnitId')) {
        requireGame(patch.favoriteUnitId === null || typeof patch.favoriteUnitId === 'string', 'INVALID_SOCIAL_PREFERENCES');
        request.favoriteUnitId = patch.favoriteUnitId === null ? null : patch.favoriteUnitId.trim().toUpperCase();
      }
      if (Object.hasOwn(patch, 'featuredUnitIds')) {
        requireGame(Array.isArray(patch.featuredUnitIds) && patch.featuredUnitIds.length <= 3 && patch.featuredUnitIds.every(id => typeof id === 'string'), 'INVALID_SOCIAL_PREFERENCES');
        request.featuredUnitIds = patch.featuredUnitIds.map(id => id.trim().toUpperCase());
        requireGame(new Set(request.featuredUnitIds).size === request.featuredUnitIds.length, 'INVALID_SOCIAL_PREFERENCES');
      }
      if (Object.hasOwn(patch, 'selectedTitleCode')) {
        requireGame(patch.selectedTitleCode === null || typeof patch.selectedTitleCode === 'string', 'INVALID_SOCIAL_PREFERENCES');
        request.selectedTitleCode = patch.selectedTitleCode === null ? null : patch.selectedTitleCode.trim().toUpperCase();
      }
      return storage.withTransaction(async repos => {
        const user = await requireUser(repos, userId);
        const replay = await repos.socialActions.findBy('operationKey', operationKey);
        if (replay) {
          requireGame(replay.userId === userId && JSON.stringify(replay.request) === JSON.stringify(request), 'OPERATION_CONFLICT');
          return { profile: await profileView(repos, user, userId), action: replay, alreadyUpdated: true };
        }
        const now = clock();
        requireGame(Number.isFinite(Date.parse(now)) && Date.parse(now) >= Date.parse(user.updatedAt), 'INVALID_CLOCK');
        const stored = await repos.socialProfiles.get(`social:${userId}`);
        const before = stored?.preferences ?? defaultPreferences();
        const after = structuredClone(before);
        async function select(id) {
          const unit = await repos.units.get(id);
          requireGame(unit, 'UNIT_NOT_FOUND');
          requireGame(unit.ownerId === userId, 'UNIT_NOT_OWNED');
          return { unitId: unit.id, ownershipVersion: unit.ownershipVersion };
        }
        if (Object.hasOwn(request, 'favoriteUnitId')) after.favorite = request.favoriteUnitId === null ? null : await select(request.favoriteUnitId);
        if (Object.hasOwn(request, 'featuredUnitIds')) after.featured = await Promise.all(request.featuredUnitIds.map(select));
        if (Object.hasOwn(request, 'selectedTitleCode')) {
          requireGame(request.selectedTitleCode === null || earnedTitles(await titleState(repos), userId, now).some(row => row.code === request.selectedTitleCode), 'SOCIAL_TITLE_NOT_EARNED');
          after.selectedTitleCode = request.selectedTitleCode;
        }
        if (Object.hasOwn(request, 'bio')) after.bio = request.bio;
        const action = await repos.socialActions.insert({ id: `SOC-${randomUUID()}`, userId, operationKey,
          policyVersion: SOCIAL_POLICY_VERSION, createdAt: now, before, after, request });
        const record = { id: `social:${userId}`, userId, policyVersion: SOCIAL_POLICY_VERSION,
          preferences: after, createdAt: stored?.createdAt ?? now, updatedAt: now };
        if (stored) await repos.socialProfiles.replace(record); else await repos.socialProfiles.insert(record);
        return { profile: await profileView(repos, user, userId), action, alreadyUpdated: false };
      });
    }
  };
}
