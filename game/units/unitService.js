import { expireTrades } from '../trades/lifecycle.js';
import { createUnitInTransaction } from './unitGenerator.js';
import { requireGame } from '../../utils/GameError.js';
import { expireBattles } from '../battle/lifecycle.js';
import { effectiveUnitStats, displayUnitCharacterName, evolutionSnapshot } from '../evolution/rules.js';
import { expireListings } from '../market/lifecycle.js';
import { getListingCode } from '../market/references.js';
import { advancedAttack, combatProfile } from '../battle/combatContent.js';

async function detail(repos, unit) {
  const owner = await repos.users.get(unit.ownerId);
  const character = await repos.characters.get(unit.characterId);
  const campaign = character.eventId ? await repos.campaigns.get(character.eventId) : null;
  const opening = unit.origin.type === 'pack' ? await repos.openings.get(unit.origin.sourceId) : null;
  return { ...unit, ...(unit.lock?.type === 'market' ? { marketCode: await getListingCode(repos, unit.lock.referenceId) } : {}),
    currentStats: effectiveUnitStats(unit), characterName: displayUnitCharacterName(unit, character),
    evolution: evolutionSnapshot(unit),
    pack: opening ? { id: opening.packId, name: opening.packSnapshot.name, revision: opening.packRevision } : null,
    campaign: campaign ? { id: campaign.id, code: campaign.code, name: campaign.name } : null,
    character, owner: { id: owner.id, name: owner.name } };
}

function snapshotDetail(player, unit = player.units ? player.units[player.activeIndex] : player.unit) {
  return { ...unit, owner: { id: player.userId, name: player.name }, inBattle: true,
    advanced: Array.isArray(player.units), reserve: Array.isArray(player.units) && player.units[player.activeIndex].id !== unit.id };
}

async function combatDetail(repos, unitId) {
  const unit = await repos.units.get(unitId);
  requireGame(unit, 'UNIT_NOT_FOUND');
  if (unit.lock?.type === 'battle') {
    const battle = await repos.battles.get(unit.lock.referenceId);
    const player = battle.players.find(p => (p.units ?? [p.unit]).some(value => value.id === unit.id));
    return snapshotDetail(player, (player.units ?? [player.unit]).find(value => value.id === unit.id));
  }
  if (unit.lock?.type === 'story') {
    const battle = await repos.storyBattles.get(unit.lock.referenceId);
    const owner = await repos.users.get(unit.ownerId);
    const player = battle?.combat.players.find(value => value.userId === 'custodian');
    const snapshot = battle?.combat.unitSnapshots.find(value => value.id === unit.id);
    const current = player?.units.find(value => value.id === unit.id);
    requireGame(battle?.status === 'active' && snapshot && current && owner, 'DATABASE_CORRUPT');
    return { ...snapshotDetail({ ...player, userId: owner.id, name: owner.name }, current), inStory: true };
  }
  const character = await repos.characters.get(unit.characterId);
  const owner = await repos.users.get(unit.ownerId);
  const stats = effectiveUnitStats(unit);
  const combat = character.combat ?? combatProfile(character.id);
  return {
    id: unit.id, characterId: unit.characterId, characterName: displayUnitCharacterName(unit, character), evolution: evolutionSnapshot(unit),
    level: unit.progress.level, stats, hp: stats.hp, traits: unit.traits, variant: unit.variant, traitVersion: unit.traitVersion,
    attacks: (await Promise.all(character.attackIds.map(id => repos.attacks.get(id)))).map(advancedAttack),
    element: combat.element, ability: structuredClone(combat.ability), effects: [], cooldowns: {},
    owner: { id: owner.id, name: owner.name }, inBattle: false, advanced: true
  };
}

export function createUnitService(storage, clock) {
  return {
    async createUnit(options) {
      // Internal API. No player command accepts origin, owner or operationKey.
      requireGame(!['starter', 'pack'].includes(options.origin?.type), 'INVALID_ORIGIN');
      return storage.withTransaction(repos => createUnitInTransaction(repos, options, clock));
    },
    async getUnit(unitId) {
      requireGame(typeof unitId === 'string', 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await expireListings(repos, now);
    await expireTrades(repos, now);
        const unit = await repos.units.get(unitId.trim().toUpperCase());
        requireGame(unit, 'UNIT_NOT_FOUND');
        return detail(repos, unit);
      });
    },
    async getCombatDetails({ userId = null, chatId = null, unitId = null } = {}) {
      requireGame(unitId === null || typeof unitId === 'string', 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await expireListings(repos, now);
    await expireTrades(repos, now);
        if (unitId !== null) return { units: [await combatDetail(repos, unitId.trim().toUpperCase())] };
        const user = await repos.users.get(userId);
        requireGame(user, 'USER_NOT_FOUND');
        const battle = await repos.battles.findBy('status', 'active', b => (chatId === null || b.chatId === chatId) && b.players.some(p => p.userId === userId));
        if (battle) return { units: battle.players.map(player => snapshotDetail(player)),
          reserves: battle.rulesVersion === 2 ? battle.players.flatMap(player => player.units.filter((_, index) => index !== player.activeIndex).map(unit => snapshotDetail(player, unit))) : [],
          rulesVersion: battle.rulesVersion, format: battle.format ?? '1v1' };
        return { units: await Promise.all(user.team.map(id => combatDetail(repos, id))) };
      });
    },
    async getUserUnits(ownerId, options = {}) {
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await expireListings(repos, now);
    await expireTrades(repos, now);
        requireGame(await repos.users.get(ownerId), 'USER_NOT_FOUND');
        const page = await repos.units.pageBy('ownerId', ownerId, options, `collection:${ownerId}`);
        page.items = await Promise.all(page.items.map(unit => detail(repos, unit)));
        return page;
      });
    },
    async getOwnershipHistory(unitId, options = {}) {
      requireGame(typeof unitId === 'string', 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await expireListings(repos, now);
    await expireTrades(repos, now);
        const unit = await repos.units.get(unitId.trim().toUpperCase());
        requireGame(unit, 'UNIT_NOT_FOUND');
        const page = await repos.events.pageBy('unitId', unit.id, options, `ownershipHistory:${unit.id}`,
          event => [String(event.ownershipVersion ?? 0).padStart(16, '0'), event.id]);
        const ownerIds = new Set([unit.ownerId, ...page.items.flatMap(event => [event.fromOwnerId, event.toOwnerId]).filter(Boolean)]);
        const users = new Map(await Promise.all([...ownerIds].map(async id => {
          const user = await repos.users.get(id);
          return [id, { id: user.id, name: user.name }];
        })));
        page.items = page.items.map(event => ({ id: event.id, type: event.type, unitId: event.unitId,
          reason: event.reason, createdAt: event.createdAt, ownershipVersion: event.ownershipVersion ?? 0,
          fromOwner: event.fromOwnerId === null ? null : users.get(event.fromOwnerId), toOwner: users.get(event.toOwnerId) }));
        return { unitId: unit.id, currentOwner: users.get(unit.ownerId), ownershipVersion: unit.ownershipVersion, ...page };
      });
    }
  };
}
