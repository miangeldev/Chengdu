import { randomUUID } from 'node:crypto';
import { GameError, requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { expireBattles } from '../battle/lifecycle.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { creditCoinsInTransaction, debitCoinsInTransaction } from '../economy/coinOperations.js';
import { effectiveStats } from '../progression/rules.js';
import { transferUnitInTransaction } from '../units/ownership.js';
import { expireListings } from './lifecycle.js';
import { MARKET_POLICY_VERSION, marketExpiresAt, quoteMarket } from './policy.js';
import { getListingCode, listingCodeAt, resolveListingId } from './references.js';

function operationKey(value) {
  requireGame(typeof value === 'string' && value.length > 0 && value.length <= 200 && value.trim() === value, 'INVALID_OPERATION_KEY');
}

function normalizedId(value, code) {
  requireGame(typeof value === 'string' && value.trim().length > 0 && value.length <= 100, code);
  const id = value.trim();
  return code === 'UNIT_NOT_FOUND' ? id.toUpperCase() : `LIST-${id.replace(/^LIST-/i, '').toLowerCase()}`;
}

async function userFor(repos, id) {
  const user = await repos.users.get(id);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function keyUsed(repos, key) {
  return await repos.listings.find(listing => listing.operationKey === key || listing.closeOperationKey === key) ||
    await repos.sales.find(sale => sale.operationKey === key);
}

async function publicListing(repos, listing, code = null) {
  const seller = await repos.users.get(listing.sellerId);
  return { ...listing, code: code ?? await getListingCode(repos, listing.id), sellerName: seller.name, ...quoteMarket(listing.price, listing.policyVersion) };
}

async function publicSale(repos, sale, userId) {
  const seller = await repos.users.get(sale.sellerId);
  const buyer = await repos.users.get(sale.buyerId);
  const listing = await repos.listings.get(sale.listingId);
  const result = { ...sale, sellerName: seller.name, buyerName: buyer.name, unitSnapshot: listing.unitSnapshot,
    role: userId === sale.buyerId ? 'buyer' : 'seller' };
  if (result.role === 'buyer') {
    delete result.sellerBalanceBefore;
    delete result.sellerBalanceAfter;
  } else {
    delete result.buyerBalanceBefore;
    delete result.buyerBalanceAfter;
  }
  return result;
}

function snapshot(unit, character) {
  return {
    id: unit.id, characterId: unit.characterId, characterRevision: unit.characterRevision,
    characterName: character.name, rarity: character.rarity, role: character.role,
    serial: unit.serial, ownershipVersion: unit.ownershipVersion, level: unit.progress.level,
    progress: structuredClone(unit.progress), traits: [...unit.traits], variant: unit.variant, traitVersion: unit.traitVersion,
    stats: effectiveStats(unit.initialStats, unit.progress.level, unit.statGrowthVersion, unit.traits, unit.traitVersion, unit.combatBaseStats)
  };
}

export function createMarketService(storage, clock) {
  async function refresh(repos) {
    const now = clock();
    dailyTimestamp(now);
    await expireBattles(repos, now);
    await expireListings(repos, now);
    return now;
  }

  return {
    async listListings({ cursor = null, page = null, limit = 5, rarity = null, characterId = null, sellerId = null, sort = 'newest' } = {}) {
      requireGame(rarity === null || ['common', 'rare', 'epic', 'legendary', 'mythic'].includes(rarity), 'INVALID_MARKET_FILTER');
      requireGame(['newest', 'price_asc', 'price_desc'].includes(sort) &&
        (characterId === null || typeof characterId === 'string') && (sellerId === null || typeof sellerId === 'string'), 'INVALID_MARKET_FILTER');
      return storage.withTransaction(async repos => {
        await refresh(repos);
        if (sellerId !== null) await userFor(repos, sellerId);
        const all = await repos.listings.all();
        const indices = new Map(all.map((listing, index) => [listing.id, index]));
        const candidates = all.filter(listing => listing.status === 'active' &&
          (rarity === null || listing.unitSnapshot.rarity === rarity) &&
          (characterId === null || listing.unitSnapshot.characterId === characterId) && (sellerId === null || listing.sellerId === sellerId));
        const scope = `market:${JSON.stringify([rarity, characterId, sellerId, sort])}`;
        const key = listing => [String(sort === 'newest' ? Number.MAX_SAFE_INTEGER - indices.get(listing.id)
          : sort === 'price_asc' ? listing.price : Number.MAX_SAFE_INTEGER - listing.price).padStart(16, '0'), listing.id];
        const result = paginate(candidates, { cursor, page, limit }, scope, key);
        result.items = await Promise.all(result.items.map(listing => publicListing(repos, listing, listingCodeAt(indices.get(listing.id)))));
        return result;
      });
    },
    async getListing(listingId) {
      return storage.withTransaction(async repos => {
        const id = await resolveListingId(repos, listingId);
        await refresh(repos);
        const listing = await repos.listings.get(id);
        requireGame(listing, 'LISTING_NOT_FOUND');
        return publicListing(repos, listing);
      });
    },
    async createListing({ sellerId, unitId, price, operationKey: key }) {
      operationKey(key);
      const id = normalizedId(unitId, 'UNIT_NOT_FOUND');
      return storage.withTransaction(async repos => {
        await userFor(repos, sellerId);
        const previous = await repos.listings.find(listing => listing.operationKey === key);
        if (previous) {
          requireGame(previous.sellerId === sellerId && previous.unitId === id && previous.price === price, 'OPERATION_CONFLICT');
          return { listing: await publicListing(repos, previous), alreadyListed: true };
        }
        requireGame(!await keyUsed(repos, key), 'OPERATION_CONFLICT');
        quoteMarket(price);
        const now = await refresh(repos);
        const user = await userFor(repos, sellerId);
        const unit = await repos.units.get(id);
        requireGame(unit, 'UNIT_NOT_FOUND');
        requireGame(unit.ownerId === sellerId, 'UNIT_NOT_OWNED');
        requireGame(unit.lock?.type !== 'market', 'UNIT_ALREADY_LISTED');
        requireGame(unit.lock === null, 'UNIT_LOCKED');
        if (user.team.includes(id)) {
          requireGame(!await repos.battles.find(battle => battle.status === 'active' && battle.players.some(player => player.userId === sellerId)), 'TEAM_LOCKED');
        }
        requireGame(dailyTimestamp(now) >= dailyTimestamp(unit.updatedAt), 'INVALID_CLOCK');
        const character = await repos.characters.get(unit.characterId);
        const listing = await repos.listings.insert({
          id: `LIST-${randomUUID()}`, sellerId, unitId: id, ownershipVersion: unit.ownershipVersion,
          price, policyVersion: MARKET_POLICY_VERSION, operationKey: key, createdAt: now,
          expiresAt: marketExpiresAt(now), updatedAt: now, status: 'active', closedAt: null, closeOperationKey: null, saleId: null,
          unitSnapshot: snapshot(unit, character)
        });
        await repos.units.replace({ ...unit, lock: { type: 'market', referenceId: listing.id }, updatedAt: now });
        if (user.team.includes(id)) await repos.users.replace({ ...user, team: user.team.filter(value => value !== id), updatedAt: now });
        return { listing: await publicListing(repos, listing), alreadyListed: false };
      });
    },
    async buyListing({ buyerId, listingId, operationKey: key }) {
      operationKey(key);
      const result = await storage.withTransaction(async repos => {
        await userFor(repos, buyerId);
        const id = await resolveListingId(repos, listingId);
        const previous = await repos.sales.find(sale => sale.operationKey === key);
        if (previous) {
          requireGame(previous.buyerId === buyerId && previous.listingId === id, 'OPERATION_CONFLICT');
          return { sale: await publicSale(repos, previous, buyerId), unit: await repos.units.get(previous.unitId),
            listing: await publicListing(repos, await repos.listings.get(id)), alreadyPurchased: true };
        }
        requireGame(!await keyUsed(repos, key), 'OPERATION_CONFLICT');
        const now = await refresh(repos);
        const listing = await repos.listings.get(id);
        requireGame(listing, 'LISTING_NOT_FOUND');
        // Publish the expired lock release before returning this expected failure.
        if (listing.status === 'expired') return { failure: 'LISTING_EXPIRED' };
        requireGame(listing.status === 'active', 'LISTING_NOT_ACTIVE');
        requireGame(listing.sellerId !== buyerId, 'SELF_PURCHASE');
        const buyer = await userFor(repos, buyerId);
        const seller = await userFor(repos, listing.sellerId);
        const unit = await repos.units.get(listing.unitId);
        requireGame(unit?.ownerId === seller.id && unit.ownershipVersion === listing.ownershipVersion &&
          unit.lock?.type === 'market' && unit.lock.referenceId === listing.id, 'DATABASE_CORRUPT');
        requireGame(dailyTimestamp(now) >= dailyTimestamp(listing.createdAt), 'INVALID_CLOCK');
        const { fee, net } = quoteMarket(listing.price, listing.policyVersion);
        const saleId = `SALE-${randomUUID()}`;
        const debited = await debitCoinsInTransaction(repos, buyer, listing.price, now, { type: 'market_purchase', id: saleId });
        const credited = await creditCoinsInTransaction(repos, seller, net, now, { type: 'market_sale', id: saleId });
        const transferred = await transferUnitInTransaction(repos, { unitId: unit.id, fromOwnerId: seller.id, toOwnerId: buyer.id, sourceId: saleId }, now);
        const sale = await repos.sales.insert({
          id: saleId, listingId: listing.id, unitId: unit.id, sellerId: seller.id, buyerId, operationKey: key,
          createdAt: now, policyVersion: listing.policyVersion, price: listing.price, fee, net,
          buyerBalanceBefore: buyer.economy.coins, buyerBalanceAfter: debited.economy.coins,
          sellerBalanceBefore: seller.economy.coins, sellerBalanceAfter: credited.economy.coins,
          fromOwnershipVersion: unit.ownershipVersion, toOwnershipVersion: transferred.unit.ownershipVersion, transferEventId: transferred.event.id
        });
        const closed = await repos.listings.replace({ ...listing, status: 'sold', updatedAt: now, closedAt: now, closeOperationKey: key, saleId });
        return { sale: await publicSale(repos, sale, buyerId), unit: transferred.unit, listing: await publicListing(repos, closed), alreadyPurchased: false };
      });
      if (result.failure) throw new GameError(result.failure);
      return result;
    },
    async cancelListing({ sellerId, listingId, operationKey: key }) {
      operationKey(key);
      return storage.withTransaction(async repos => {
        await userFor(repos, sellerId);
        const id = await resolveListingId(repos, listingId);
        const previous = await repos.listings.find(listing => listing.status === 'cancelled' && listing.closeOperationKey === key);
        if (previous) {
          requireGame(previous.sellerId === sellerId && previous.id === id, 'OPERATION_CONFLICT');
          return { listing: await publicListing(repos, previous), alreadyCancelled: true };
        }
        requireGame(!await keyUsed(repos, key), 'OPERATION_CONFLICT');
        const now = await refresh(repos);
        const listing = await repos.listings.get(id);
        requireGame(listing, 'LISTING_NOT_FOUND');
        requireGame(listing.sellerId === sellerId, 'LISTING_NOT_YOURS');
        if (listing.status === 'expired') return { listing: await publicListing(repos, listing), alreadyCancelled: false, expired: true };
        requireGame(listing.status === 'active', 'LISTING_NOT_ACTIVE');
        requireGame(dailyTimestamp(now) >= dailyTimestamp(listing.createdAt), 'INVALID_CLOCK');
        const unit = await repos.units.get(listing.unitId);
        await repos.units.replace({ ...unit, lock: null, updatedAt: now });
        const closed = await repos.listings.replace({ ...listing, status: 'cancelled', updatedAt: now, closedAt: now, closeOperationKey: key });
        return { listing: await publicListing(repos, closed), alreadyCancelled: false };
      });
    },
    async getSales(userId, options = {}) {
      return storage.withRead(async repos => {
        await userFor(repos, userId);
        const records = await repos.sales.filter(sale => sale.buyerId === userId || sale.sellerId === userId);
        const indices = new Map(records.map((sale, index) => [sale.id, index]));
        const page = paginate(records, options, `marketSales:${userId}`, sale => [
          String(Number.MAX_SAFE_INTEGER - indices.get(sale.id)).padStart(16, '0'), sale.id
        ]);
        page.items = await Promise.all(page.items.map(sale => publicSale(repos, sale, userId)));
        return page;
      });
    }
  };
}
