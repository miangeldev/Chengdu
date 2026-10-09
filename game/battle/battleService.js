import { randomInt, randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { BATTLE_IDLE_MS, CHALLENGE_TTL_MS, deadline, firstPlayer, resolveAttack, selectedAttack } from './engine.js';
import { expireBattles, isOpenBattle, settleBattle } from './lifecycle.js';
import { effectiveStats } from '../progression/rules.js';
import { REWARD_VERSION } from '../rewards/battlePolicy.js';
import { paginate } from '../../utils/pagination.js';

function checkKey(key) {
  requireGame(key === null || (typeof key === 'string' && key.length > 0 && key.length <= 200), 'INVALID_OPERATION_KEY');
}

async function participant(repos, userId) {
  const user = await repos.users.get(userId);
  requireGame(user, 'USER_NOT_FOUND');
  return user;
}

async function equipped(repos, user) {
  requireGame(user.team.length >= 1, 'TEAM_EMPTY');
  const unit = await repos.units.get(user.team[0]);
  requireGame(unit && unit.ownerId === user.id, 'UNIT_NOT_OWNED');
  requireGame(unit.lock === null, 'UNIT_LOCKED');
  return unit;
}

async function findBattle(repos, { userId, chatId, battleId = null }, statuses = ['pending', 'active']) {
  requireGame(typeof chatId === 'string' && chatId.length > 0 && chatId.length <= 200, 'INVALID_ARENA');
  const rows = battleId ? [await repos.battles.get(battleId)] : await repos.battles.filter(b => b.chatId === chatId && b.players.some(p => p.userId === userId));
  const battle = rows.filter(Boolean).filter(b => statuses.includes(b.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))[0];
  requireGame(battle, 'BATTLE_NOT_FOUND');
  requireGame(battle.chatId === chatId, 'BATTLE_WRONG_CHAT');
  requireGame(battle.players.some(p => p.userId === userId), 'BATTLE_NOT_PARTICIPANT');
  return battle;
}

async function replayAction(repos, { userId, chatId, battleId, operationKey }, type) {
  if (operationKey === null) return null;
  const battle = await repos.battles.find(b => b.actions.some(a => a.operationKey === operationKey));
  if (!battle) return null;
  const action = battle.actions.find(a => a.operationKey === operationKey);
  requireGame(action.actorId === userId && battle.chatId === chatId && action.type === type && (!battleId || battle.id === battleId), 'OPERATION_CONFLICT');
  return { battle, action, duplicate: true };
}

export function createBattleService(storage, clock, randomRoll = () => randomInt(100)) {
  return {
    async challenge({ userId, opponentId, chatId, operationKey = null }) {
      checkKey(operationKey);
      requireGame(typeof chatId === 'string' && chatId.length > 0 && chatId.length <= 200, 'INVALID_ARENA');
      requireGame(userId !== opponentId, 'SELF_CHALLENGE');
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        if (operationKey !== null) {
          const previous = await repos.battles.find(b => b.challengeKey === operationKey);
          if (previous) {
            requireGame(previous.chatId === chatId && previous.players[0].userId === userId && previous.players[1].userId === opponentId, 'OPERATION_CONFLICT');
            return { battle: previous, duplicate: true };
          }
        }
        const players = [];
        for (const id of [userId, opponentId]) {
          const user = await participant(repos, id);
          await equipped(repos, user);
          requireGame(!await repos.battles.find(b => isOpenBattle(b) && b.players.some(p => p.userId === id)), 'PLAYER_BUSY');
          players.push({ userId: id, name: user.name, unit: null });
        }
        const battle = {
          id: `BTL-${randomUUID()}`, rulesVersion: 1, status: 'pending', chatId, players,
          turnUserId: null, turnNumber: 0, actions: [],
          createdAt: now, updatedAt: now, expiresAt: deadline(now, CHALLENGE_TTL_MS),
          acceptedAt: null, finishedAt: null, winnerId: null, finishReason: null,
          challengeKey: operationKey, acceptKey: null, rewardVersion: REWARD_VERSION, settlement: null
        };
        await repos.battles.insert(battle);
        return { battle, duplicate: false };
      });
    },
    async accept({ userId, chatId, battleId = null, operationKey = null }) {
      checkKey(operationKey);
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await participant(repos, userId);
        if (operationKey !== null) {
          const previous = await repos.battles.find(b => b.acceptKey === operationKey);
          if (previous) {
            requireGame(previous.players[1].userId === userId && previous.chatId === chatId && (!battleId || previous.id === battleId), 'OPERATION_CONFLICT');
            return { battle: previous, duplicate: true };
          }
        }
        const battle = await findBattle(repos, { userId, chatId, battleId });
        requireGame(battle.players[1].userId === userId, 'CHALLENGE_NOT_YOURS');
        if (battle.status === 'active') return { battle, duplicate: true };
        for (const p of battle.players) {
          const user = await participant(repos, p.userId);
          const unit = await equipped(repos, user);
          const character = await repos.characters.get(unit.characterId);
          const attacks = await Promise.all(character.attackIds.map(id => repos.attacks.get(id)));
          requireGame(attacks.length === 2 && attacks.every(Boolean), 'DATABASE_CORRUPT');
          const stats = effectiveStats(unit.initialStats, unit.progress.level, unit.statGrowthVersion, unit.traits, unit.traitVersion, unit.combatBaseStats);
          p.unit = {
            id: unit.id, characterId: unit.characterId, characterRevision: character.revision,
            characterName: character.name, serial: unit.serial, level: unit.progress.level,
            statsVersion: unit.statGrowthVersion, traitVersion: unit.traitVersion, traits: unit.traits, variant: unit.variant,
            combatBaseStats: structuredClone(unit.combatBaseStats),
            stats, hp: stats.hp, attacks
          };
          await repos.units.replace({ ...unit, lock: { type: 'battle', referenceId: battle.id }, updatedAt: now });
        }
        battle.status = 'active';
        battle.acceptedAt = now;
        battle.updatedAt = now;
        battle.expiresAt = deadline(now, BATTLE_IDLE_MS);
        battle.turnNumber = 1;
        battle.turnUserId = firstPlayer(battle.players);
        battle.acceptKey = operationKey;
        await repos.battles.replace(battle);
        return { battle, duplicate: false };
      });
    },
    async attack({ userId, chatId, choice, battleId = null, operationKey = null }) {
      checkKey(operationKey);
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await participant(repos, userId);
        const replay = await replayAction(repos, { userId, chatId, battleId, operationKey }, 'attack');
        if (replay) {
          requireGame(selectedAttack(replay.battle.players.find(p => p.userId === userId), choice).id === replay.action.attackId, 'OPERATION_CONFLICT');
          return replay;
        }
        const previous = await findBattle(repos, { userId, chatId, battleId }, ['active']);
        const result = resolveAttack(previous, { userId, choice, operationKey, now, roll: randomRoll() });
        if (result.battle.status === 'finished') await settleBattle(repos, result.battle, now);
        else await repos.battles.replace(result.battle);
        return { ...result, duplicate: false };
      });
    },
    async surrender({ userId, chatId, battleId = null, operationKey = null }) {
      checkKey(operationKey);
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await participant(repos, userId);
        const replay = await replayAction(repos, { userId, chatId, battleId, operationKey }, 'surrender');
        if (replay) return replay;
        const battle = await findBattle(repos, { userId, chatId, battleId }, ['active']);
        const other = battle.players.find(p => p.userId !== userId);
        const action = {
          seq: battle.actions.length + 1, turnNumber: battle.turnNumber, type: 'surrender', actorId: userId,
          targetId: other.userId, attackId: null, hit: null, damage: 0, beforeHp: null, afterHp: null,
          operationKey, createdAt: now
        };
        battle.actions.push(action);
        battle.status = 'finished';
        battle.winnerId = other.userId;
        battle.finishReason = 'surrender';
        battle.finishedAt = now;
        battle.updatedAt = now;
        battle.turnUserId = null;
        await settleBattle(repos, battle, now);
        return { battle, action, duplicate: false };
      });
    },
    async closeChallenge({ userId, chatId, battleId = null, reject = false }) {
      return storage.withTransaction(async repos => {
        const now = clock();
        await expireBattles(repos, now);
        await participant(repos, userId);
        const battle = await findBattle(repos, { userId, chatId, battleId }, ['pending']);
        requireGame(battle.players[reject ? 1 : 0].userId === userId, 'CHALLENGE_NOT_YOURS');
        battle.status = reject ? 'rejected' : 'cancelled';
        battle.finishReason = battle.status;
        battle.finishedAt = now;
        battle.updatedAt = now;
        await repos.battles.replace(battle);
        return { battle, duplicate: false };
      });
    },
    async getMyBattle({ userId, chatId, battleId = null }) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        await participant(repos, userId);
        if (battleId) return findBattle(repos, { userId, chatId, battleId }, ['pending', 'active', 'finished', 'expired', 'rejected', 'cancelled']);
        const rows = await repos.battles.filter(b => b.chatId === chatId && b.players.some(p => p.userId === userId));
        return rows.reverse().sort((a, b) => Number(isOpenBattle(b)) - Number(isOpenBattle(a)) || b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
      });
    },
    async getHistory({ userId, ...options }) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        await participant(repos, userId);
        const rows = await repos.battles.filter(b => b.acceptedAt !== null && !isOpenBattle(b) && b.players.some(p => p.userId === userId));
        return paginate(rows, options, `battleHistory:${userId}`, b => [String(8_640_000_000_000_000 - Date.parse(b.finishedAt)).padStart(17, '0'), b.id]);
      });
    },
    async getHistoryBattle({ userId, battleId }) {
      return storage.withTransaction(async repos => {
        await expireBattles(repos, clock());
        await participant(repos, userId);
        const battle = await repos.battles.get(battleId);
        requireGame(battle && battle.acceptedAt !== null && !isOpenBattle(battle), 'HISTORY_NOT_FOUND');
        requireGame(battle.players.some(p => p.userId === userId), 'BATTLE_NOT_PARTICIPANT');
        return battle;
      });
    },
    async sweepExpired() {
      return storage.withTransaction(repos => expireBattles(repos, clock()));
    }
  };
}
