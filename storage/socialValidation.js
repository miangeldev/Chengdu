import { equal } from './equality.js';
import { requireGame } from '../utils/GameError.js';
import { ownershipAt } from '../game/units/ownership.js';
import { defaultPreferences, earnedTitles, SOCIAL_POLICY_VERSION } from '../game/social/policy.js';

const check = (condition, field) => requireGame(condition, 'DATABASE_CORRUPT', { field });

const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));

function preferenceProof(state, preferences, userId, at) {
  check(preferences && Object.keys(preferences).sort().join(',') === 'bio,favorite,featured,selectedTitleCode', 'social.preferencesShape');
  check(typeof preferences.bio === 'string' && [...preferences.bio].length <= 140 && preferences.bio.trim() === preferences.bio &&
    !/[\p{Cc}\p{Cf}]/u.test(preferences.bio), 'social.bio');
  check(Array.isArray(preferences.featured) && preferences.featured.length <= 3 &&
    new Set(preferences.featured.map(row => row?.unitId)).size === preferences.featured.length, 'social.featured');
  for (const selection of [preferences.favorite, ...preferences.featured].filter(value => value !== null)) {
    check(selection && Object.keys(selection).sort().join(',') === 'ownershipVersion,unitId' && typeof selection.unitId === 'string' &&
      Number.isSafeInteger(selection.ownershipVersion) && selection.ownershipVersion >= 0 &&
      ownershipAt(state, selection.unitId, selection.ownershipVersion) === userId, 'social.unitOwnershipProof');
    const event = state.eventos.records.find(row => row.unitId === selection.unitId &&
      (row.ownershipVersion ?? 0) === selection.ownershipVersion);
    check(event && Date.parse(event.createdAt) <= Date.parse(at), 'social.unitProofDate');
  }
  check(preferences.selectedTitleCode === null || earnedTitles(state, userId, at).some(row => row.code === preferences.selectedTitleCode), 'social.titleProof');
}

function expectedAfter(before, request, actualAfter) {
  const keys = Object.keys(request);
  check(keys.length > 0 && keys.every(key => ['favoriteUnitId', 'featuredUnitIds', 'selectedTitleCode', 'bio'].includes(key)), 'social.request');
  const after = structuredClone(before);
  if (Object.hasOwn(request, 'favoriteUnitId')) {
    check(request.favoriteUnitId === null || (typeof request.favoriteUnitId === 'string' && request.favoriteUnitId === actualAfter.favorite?.unitId), 'social.favoriteRequest');
    after.favorite = request.favoriteUnitId === null ? null : actualAfter.favorite;
  }
  if (Object.hasOwn(request, 'featuredUnitIds')) {
    check(Array.isArray(request.featuredUnitIds) && equal(request.featuredUnitIds, actualAfter.featured.map(row => row.unitId)), 'social.featuredRequest');
    after.featured = actualAfter.featured;
  }
  if (Object.hasOwn(request, 'selectedTitleCode')) after.selectedTitleCode = request.selectedTitleCode;
  if (Object.hasOwn(request, 'bio')) after.bio = request.bio;
  return after;
}

export function validateSocialData(state) {
  const users = new Set(state.usuarios.records.map(user => user.id));
  const latest = new Map();
  const firstByUser = new Map();
  const keys = new Set();
  const profiles = state.perfilessociales.records;
  for (const action of state.accionessociales.records) {
    check(/^SOC-[a-f0-9-]{36}$/.test(action.id) && users.has(action.userId) && action.policyVersion === SOCIAL_POLICY_VERSION &&
      date(action.createdAt) && typeof action.operationKey === 'string' && action.operationKey.length > 0 &&
      action.operationKey.length <= 200 && action.operationKey.trim() === action.operationKey && !keys.has(action.operationKey), 'social.actionMetadata');
    keys.add(action.operationKey);
    if (!firstByUser.has(action.userId)) firstByUser.set(action.userId, action);
    const previous = latest.get(action.userId);
    check(equal(action.before, previous?.after ?? defaultPreferences()) &&
      (!previous || Date.parse(action.createdAt) >= Date.parse(previous.createdAt)), 'social.actionChain');
    preferenceProof(state, action.after, action.userId, action.createdAt);
    check(action.request && equal(action.after, expectedAfter(action.before, action.request, action.after)), 'social.actionReplay');
    latest.set(action.userId, action);
  }
  check(profiles.length === latest.size && new Set(profiles.map(row => row.userId)).size === profiles.length, 'social.profileCount');
  for (const profile of profiles) {
    const action = latest.get(profile.userId);
    const first = firstByUser.get(profile.userId);
    check(users.has(profile.userId) && profile.id === `social:${profile.userId}` && profile.policyVersion === SOCIAL_POLICY_VERSION &&
      equal(profile.preferences, action?.after) && profile.createdAt === first?.createdAt && profile.updatedAt === action?.createdAt, 'social.profileReplay');
  }
}

export function validateSocialTransition(before, after, context = {}) {
  check(equal(before.accionessociales.records, after.accionessociales.records.slice(0, before.accionessociales.records.length)), 'social.actionsAppendOnly');
  const added = after.accionessociales.records.slice(before.accionessociales.records.length);
  const updatedUsers = new Set(added.map(action => action.userId));
  const profilesById = new Map(after.perfilessociales.records.map(profile => [profile.id, profile]));
  for (const action of added) {
    check(context.now && Date.parse(action.createdAt) <= Date.parse(context.now), 'social.trustedClock');
    const selections = [];
    if (Object.hasOwn(action.request, 'favoriteUnitId') && action.after.favorite) selections.push(action.after.favorite);
    if (Object.hasOwn(action.request, 'featuredUnitIds')) selections.push(...action.after.featured);
    for (const selection of selections) {
      const unit = before.unidades.records.find(row => row.id === selection.unitId);
      check(unit?.ownerId === action.userId && unit.ownershipVersion === selection.ownershipVersion, 'social.currentOwnership');
    }
    if (action.request.selectedTitleCode !== undefined && action.request.selectedTitleCode !== null) {
      check(earnedTitles(before, action.userId, action.createdAt).some(row => row.code === action.request.selectedTitleCode), 'social.currentTitle');
    }
  }
  for (const profile of before.perfilessociales.records) {
    const updated = profilesById.get(profile.id);
    check(updated && profile.createdAt === updated.createdAt && profile.userId === updated.userId &&
      profile.policyVersion === updated.policyVersion && (updatedUsers.has(profile.userId) || equal(profile, updated)), 'social.profileTransition');
  }
}
