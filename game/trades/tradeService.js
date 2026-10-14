import { randomUUID } from 'node:crypto';
import { GameError, requireGame } from '../../utils/GameError.js';
import { paginate } from '../../utils/pagination.js';
import { expireBattles } from '../battle/lifecycle.js';
import { expireListings } from '../market/lifecycle.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { creditCoinsInTransaction, debitCoinsInTransaction } from '../economy/coinOperations.js';
import { transferUnitInTransaction } from '../units/ownership.js';
import { closeTradeInTransaction, createTradeAction, expireTrades, finishTradeAction } from './lifecycle.js';
import { isOpenTrade, normalizeTradeOffer, TRADE_MAX_OPEN, tradeExpiresAt, validateTradeChat, validateTradeOperationKey } from './policy.js';
import { resolveTrade, tradeCodeAt } from './references.js';

const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);

async function userFor(repos, id) {
  const user = await repos.users.get(id);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

function authorize(trade, userId, chatId) {
  requireGame(trade.participants.includes(userId), 'TRADE_NOT_YOURS');
  requireGame(trade.chatId === chatId, 'TRADE_WRONG_CHAT');
}

async function publicTrade(repos, trade) {
  const all = await repos.trades.all();
  const participants = await Promise.all(trade.participants.map(id => userFor(repos, id)));
  return { ...trade, code: tradeCodeAt(all.findIndex(row => row.id === trade.id)),
    participantNames: participants.map(user => ({ userId: user.id, name: user.name })),
    offeredUnits: await Promise.all(trade.offers.flatMap(offer => offer.unitIds.map(async id => {
      const unit = await repos.units.get(id);
      const character = await repos.characters.get(unit.characterId);
      return { unitId: id, userId: offer.userId, characterName: character.name, level: unit.progress.level, rarity: character.rarity };
    }))) };
}

export function createTradeService(storage, clock) {
  async function refresh(repos) {
    const now = clock();
    dailyTimestamp(now);
    await expireTrades(repos, now);
    await expireBattles(repos, now);
    await expireListings(repos, now);
    return now;
  }

  async function assetOffer(repos, offer) {
    const user = await userFor(repos, offer.userId);
    requireGame(user.economy.coins >= offer.coins, 'INSUFFICIENT_COINS', { required: offer.coins, coins: user.economy.coins });
    const units = [];
    for (const id of offer.unitIds) {
      const unit = await repos.units.get(id);
      requireGame(unit, 'UNIT_NOT_FOUND');
      requireGame(unit.ownerId === offer.userId, 'UNIT_NOT_OWNED');
      requireGame(unit.lock === null, 'UNIT_LOCKED');
      // A reserved team must remain unchanged while its battle runs.
      if (user.team.includes(id)) requireGame(!await repos.battles.find(battle => battle.status === 'active' &&
        battle.players.some(player => player.userId === user.id)), 'TEAM_LOCKED');
      units.push(unit);
    }
    return { user, units };
  }

  async function mutate({ userId, chatId, code, operationKey }, kind, mutateTrade, expectedOffer = null) {
    validateTradeOperationKey(operationKey);
    validateTradeChat(chatId);
    const result = await storage.withTransaction(async repos => {
      await userFor(repos, userId);
      let trade = await resolveTrade(repos, code);
      authorize(trade, userId, chatId);
      const previous = await repos.tradeActions.find(action => action.operationKey === operationKey);
      if (previous) {
        requireGame(previous.tradeId === trade.id && previous.userId === userId && previous.kind === kind &&
          (expectedOffer === null || equal(previous.after.offers.find(offer => offer.userId === userId), { userId, ...expectedOffer })), 'OPERATION_CONFLICT');
        return { trade: await publicTrade(repos, trade), alreadyProcessed: true };
      }
      const now = await refresh(repos);
      trade = await repos.trades.get(trade.id);
      if (trade.status === 'expired') return { failure: 'TRADE_EXPIRED' };
      requireGame(isOpenTrade(trade), 'TRADE_NOT_ACTIVE');
      requireGame(dailyTimestamp(now) >= dailyTimestamp(trade.updatedAt), 'INVALID_CLOCK');
      const updated = await mutateTrade(repos, trade, now);
      return { trade: await publicTrade(repos, updated), alreadyProcessed: false };
    });
    if (result.failure) throw new GameError(result.failure);
    return result;
  }

  return {
    async create({ userId, opponentId, chatId, operationKey }) {
      validateTradeOperationKey(operationKey);
      validateTradeChat(chatId);
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        await userFor(repos, opponentId);
        requireGame(userId !== opponentId, 'SELF_TRADE');
        const previous = await repos.tradeActions.find(action => action.operationKey === operationKey);
        if (previous) {
          requireGame(previous.kind === 'create' && previous.userId === userId && previous.after.chatId === chatId &&
            equal(previous.after.participants, [userId, opponentId]), 'OPERATION_CONFLICT');
          return { trade: await publicTrade(repos, await repos.trades.get(previous.tradeId)), alreadyProcessed: true };
        }
        const now = await refresh(repos);
        const open = await repos.trades.filter(isOpenTrade);
        requireGame(!open.some(trade => trade.participants.includes(userId) && trade.participants.includes(opponentId)), 'TRADE_ALREADY_OPEN');
        for (const id of [userId, opponentId]) requireGame(open.filter(trade => trade.participants.includes(id)).length < TRADE_MAX_OPEN, 'TOO_MANY_TRADES');
        const trade = { id: `TRD-${randomUUID()}`, chatId, participants: [userId, opponentId],
          offers: [userId, opponentId].map(id => ({ userId: id, unitIds: [], coins: 0 })),
          status: 'draft', confirmations: [], reservations: [], operationKey, createdAt: now,
          expiresAt: tradeExpiresAt(now), updatedAt: now, closedAt: null, closeActionId: null };
        await repos.trades.insert(trade);
        const action = createTradeAction(trade, 'create', userId, operationKey, now);
        action.before = null;
        action.after = structuredClone(trade);
        await repos.tradeActions.insert(action);
        return { trade: await publicTrade(repos, trade), alreadyProcessed: false };
      });
    },

    async setOffer({ userId, chatId, code, unitIds = [], coins = 0, operationKey }) {
      const offer = normalizeTradeOffer(unitIds, coins);
      return mutate({ userId, chatId, code, operationKey }, 'offer', async (repos, trade, now) => {
        requireGame(trade.status === 'draft', 'TRADE_OFFER_FROZEN');
        await assetOffer(repos, { userId, ...offer });
        const action = createTradeAction(trade, 'offer', userId, operationKey, now);
        return finishTradeAction(repos, action, { ...trade, updatedAt: now,
          offers: trade.offers.map(previous => previous.userId === userId ? { userId, ...offer } : previous) });
      }, offer);
    },

    async confirm({ userId, chatId, code, operationKey }) {
      return mutate({ userId, chatId, code, operationKey }, 'confirm', async (repos, trade, now) => {
        requireGame(!trade.confirmations.includes(userId), 'TRADE_ALREADY_CONFIRMED');
        const action = createTradeAction(trade, 'confirm', userId, operationKey, now);
        if (trade.status === 'draft') {
          requireGame(trade.offers.some(offer => offer.coins > 0 || offer.unitIds.length > 0), 'EMPTY_TRADE');
          const reservations = [];
          // Validate both parties before reserving either offer.
          const assets = await Promise.all(trade.offers.map(offer => assetOffer(repos, offer)));
          for (let index = 0; index < trade.offers.length; index++) {
            const offer = trade.offers[index];
            const { user, units } = assets[index];
            for (const unit of units) {
              requireGame(dailyTimestamp(now) >= dailyTimestamp(unit.updatedAt), 'INVALID_CLOCK');
              reservations.push({ unitId: unit.id, userId: user.id, ownershipVersion: unit.ownershipVersion,
                progress: structuredClone(unit.progress), battleStats: structuredClone(unit.battleStats) });
              await repos.units.replace({ ...unit, lock: { type: 'trade', referenceId: trade.id }, updatedAt: now });
            }
            if (offer.coins > 0) {
              const sourceId = `${action.id}:${user.id}`;
              const debited = await debitCoinsInTransaction(repos, user, offer.coins, now, { type: 'trade_escrow', id: sourceId });
              action.movements.push({ userId: user.id, amount: offer.coins, type: 'debit', sourceType: 'trade_escrow', sourceId,
                balanceBefore: user.economy.coins, balanceAfter: debited.economy.coins });
            }
          }
          return finishTradeAction(repos, action, { ...trade, status: 'locked', confirmations: [userId], reservations, updatedAt: now });
        }
        for (const offer of trade.offers) {
          const receiverId = trade.participants.find(id => id !== offer.userId);
          for (const unitId of offer.unitIds) {
            const reservation = trade.reservations.find(row => row.unitId === unitId);
            const transferred = await transferUnitInTransaction(repos, {
              unitId, fromOwnerId: offer.userId, toOwnerId: receiverId, reason: 'trade', sourceId: trade.id
            }, now);
            action.transfers.push({ unitId, fromOwnerId: offer.userId, toOwnerId: receiverId,
              fromOwnershipVersion: reservation.ownershipVersion, toOwnershipVersion: transferred.unit.ownershipVersion,
              eventId: transferred.event.id });
          }
          if (offer.coins > 0) {
            const receiver = await userFor(repos, receiverId);
            const sourceId = `${action.id}:${receiver.id}`;
            const credited = await creditCoinsInTransaction(repos, receiver, offer.coins, now, { type: 'trade_settlement', id: sourceId });
            action.movements.push({ userId: receiver.id, amount: offer.coins, type: 'credit', sourceType: 'trade_settlement', sourceId,
              balanceBefore: receiver.economy.coins, balanceAfter: credited.economy.coins });
          }
        }
        return finishTradeAction(repos, action, { ...trade, status: 'completed', confirmations: [...trade.confirmations, userId],
          updatedAt: now, closedAt: now, closeActionId: action.id });
      });
    },

    async cancel({ userId, chatId, code, operationKey }) {
      return mutate({ userId, chatId, code, operationKey }, 'cancel', (repos, trade, now) => closeTradeInTransaction(repos, trade, {
        status: 'cancelled', userId, operationKey, now
      }));
    },

    async getTrade({ userId, chatId, code }) {
      validateTradeChat(chatId);
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        const trade = await resolveTrade(repos, code);
        authorize(trade, userId, chatId);
        await refresh(repos);
        return publicTrade(repos, await repos.trades.get(trade.id));
      });
    },

    async listMyTrades({ userId, chatId = null, status = null, page = 1, limit = 5 } = {}) {
      requireGame(status === null || ['draft', 'locked', 'completed', 'cancelled', 'expired', 'open'].includes(status), 'INVALID_TRADE_FILTER');
      if (chatId !== null) validateTradeChat(chatId);
      return storage.withTransaction(async repos => {
        await userFor(repos, userId);
        await refresh(repos);
        const all = await repos.trades.all();
        const indices = new Map(all.map((trade, index) => [trade.id, index]));
        const result = paginate(all.filter(trade => trade.participants.includes(userId) &&
          (chatId === null || trade.chatId === chatId) && (status === null || (status === 'open' ? isOpenTrade(trade) : trade.status === status))),
        { page, limit }, `trades:${userId}:${chatId}:${status}`, trade => [String(Number.MAX_SAFE_INTEGER - indices.get(trade.id)).padStart(16, '0'), trade.id]);
        result.items = await Promise.all(result.items.map(trade => publicTrade(repos, trade)));
        return result;
      });
    },

    async sweepExpired() {
      return storage.withTransaction(repos => expireTrades(repos, clock()));
    }
  };
}
