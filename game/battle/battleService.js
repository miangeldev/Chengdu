import { randomInt, randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { BATTLE_IDLE_MS, CHALLENGE_TTL_MS, deadline, firstPlayer, resolveAttack, selectedAttack } from './engine.js';
import { initializeAdvancedBattle, resolveAdvancedAction } from './advancedEngine.js';
import { advancedAttack } from './combatContent.js';
import { expireBattles, isOpenBattle, settleBattle } from './lifecycle.js';
import { expireListings } from '../market/lifecycle.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { effectiveStats } from '../progression/rules.js';
import { ADVANCED_REWARD_VERSION, REWARD_VERSION } from '../rewards/battlePolicy.js';
import { paginate } from '../../utils/pagination.js';

async function expireGameLocks(repos, now) {
  const battles = await expireBattles(repos, now);
  await expireListings(repos, now);
  return battles;
}

async function committedResult(storage, work) {
  const result = await storage.withTransaction(work);
  // Expiration is a completed game operation even when the requested action
  // no longer has an active battle. Publish its unlocks and zero receipts first.
  requireGame(!result.failure, result.failure);
  return result;
}

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

function normalizeMode(mode) {
  const value = { clasico: 'classic', 'clásico': 'classic', advanced: 'auto', avanzado: 'auto' }[mode] ?? mode;
  requireGame(['classic', 'auto', '1v1', '2v2', '3v3'].includes(value), 'INVALID_BATTLE_MODE');
  return value;
}

async function teamFor(repos, user) {
  requireGame(user.team.length > 0, 'TEAM_EMPTY');
  return Promise.all(user.team.map(async id => {
    const unit = await repos.units.get(id);
    requireGame(unit?.ownerId === user.id, 'UNIT_NOT_OWNED');
    requireGame(unit.lock === null, 'UNIT_LOCKED');
    return unit;
  }));
}

async function assertKeyAvailable(repos, key) {
  if (key === null) return;
  requireGame(!await repos.battles.find(battle => battle.challengeKey === key || battle.acceptKey === key ||
    battle.actions.some(action => action.operationKey === key)), 'OPERATION_CONFLICT');
}

function advancedClock(battle, now) {
  if (battle.rulesVersion === 2) requireGame(dailyTimestamp(now) >= dailyTimestamp(battle.updatedAt), 'INVALID_CLOCK');
}

async function snapshotFor(repos, unit, advanced) {
  const character = await repos.characters.get(unit.characterId);
  const definitions = await Promise.all(character.attackIds.map(id => repos.attacks.get(id)));
  requireGame(definitions.length === 2 && definitions.every(Boolean), 'DATABASE_CORRUPT');
  const stats = effectiveStats(unit.initialStats, unit.progress.level, unit.statGrowthVersion, unit.traits, unit.traitVersion, unit.combatBaseStats);
  return {
    id: unit.id, characterId: unit.characterId, characterRevision: character.revision,
    characterName: character.name, serial: unit.serial, level: unit.progress.level, ownershipVersion: unit.ownershipVersion,
    statsVersion: unit.statGrowthVersion, traitVersion: unit.traitVersion, traits: [...unit.traits], variant: unit.variant,
    combatBaseStats: structuredClone(unit.combatBaseStats), stats, hp: stats.hp,
    attacks: advanced ? definitions.map(advancedAttack) : definitions,
    ...(advanced ? { profileVersion: character.combat.version, element: character.combat.element,
      ability: structuredClone(character.combat.ability), effects: [], cooldowns: {}, abilityUsed: false, participated: false } : {})
  };
}

async function findBattle(repos, { userId, chatId, battleId = null }, statuses = ['pending', 'active'], missingOkay = false) {
  requireGame(typeof chatId === 'string' && chatId.length > 0 && chatId.length <= 200, 'INVALID_ARENA');
  const rows = battleId ? [await repos.battles.get(battleId)] : await repos.battles.filter(b => b.chatId === chatId && b.players.some(p => p.userId === userId));
  const battle = rows.filter(Boolean).filter(b => statuses.includes(b.status)).sort((a, b) => b.createdAt.localeCompare(a.createdAt) || b.id.localeCompare(a.id))[0];
  if (!battle && missingOkay) return null;
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
  requireGame(action.actorId === userId && battle.chatId === chatId && (action.commandType ?? action.type) === type && (!battleId || battle.id === battleId), 'OPERATION_CONFLICT');
  return { battle, action, duplicate: true };
}

export function createBattleService(storage, clock, randomRoll = () => randomInt(100)) {
  return {
    async challenge({ userId, opponentId, chatId, operationKey = null, mode = 'classic' }) {
      checkKey(operationKey);
      const selectedMode = normalizeMode(mode);
      requireGame(typeof chatId === 'string' && chatId.length > 0 && chatId.length <= 200, 'INVALID_ARENA');
      requireGame(userId !== opponentId, 'SELF_CHALLENGE');
      return storage.withTransaction(async repos => {
        if (operationKey !== null) {
          const previous = await repos.battles.find(b => b.challengeKey === operationKey);
          if (previous) {
            requireGame(previous.chatId === chatId && previous.players[0].userId === userId && previous.players[1].userId === opponentId &&
              (previous.mode ?? 'classic') === selectedMode, 'OPERATION_CONFLICT');
            return { battle: previous, duplicate: true };
          }
        }
        await assertKeyAvailable(repos, operationKey);
        const now = clock();
        await expireGameLocks(repos, now);
        const advanced = selectedMode !== 'classic';
        const players = [];
        const sizes = [];
        for (const id of [userId, opponentId]) {
          const user = await participant(repos, id);
          if (advanced) {
            const units = await teamFor(repos, user);
            sizes.push(units.length);
            for (const unit of units) requireGame(dailyTimestamp(now) >= dailyTimestamp(unit.updatedAt), 'INVALID_CLOCK');
          } else await equipped(repos, user);
          requireGame(!await repos.battles.find(b => isOpenBattle(b) && b.players.some(p => p.userId === id)), 'PLAYER_BUSY');
          players.push({ userId: id, name: user.name, ...(advanced ? { units: [], activeIndex: 0 } : { unit: null }) });
        }
        const teamSize = advanced ? selectedMode === 'auto' ? sizes[0] : Number(selectedMode[0]) : 1;
        if (advanced) requireGame(sizes[0] === sizes[1] && sizes[0] === teamSize, 'TEAM_SIZE_MISMATCH', { teamSize, sizes });
        const battle = {
          id: `BTL-${randomUUID()}`, rulesVersion: advanced ? 2 : 1, status: 'pending', chatId, players,
          turnUserId: null, turnNumber: 0, actions: [],
          createdAt: now, updatedAt: now, expiresAt: deadline(now, CHALLENGE_TTL_MS),
          acceptedAt: null, finishedAt: null, winnerId: null, finishReason: null,
          challengeKey: operationKey, acceptKey: null, rewardVersion: advanced ? ADVANCED_REWARD_VERSION : REWARD_VERSION, settlement: null,
          ...(advanced ? { mode: selectedMode, format: `${teamSize}v${teamSize}`, teamSize, openingEvents: [] } : {})
        };
        await repos.battles.insert(battle);
        return { battle, duplicate: false };
      });
    },
    async accept({ userId, chatId, battleId = null, operationKey = null }) {
      checkKey(operationKey);
      return committedResult(storage, async repos => {
        await participant(repos, userId);
        if (operationKey !== null) {
          const previous = await repos.battles.find(b => b.acceptKey === operationKey);
          if (previous) {
            requireGame(previous.players[1].userId === userId && previous.chatId === chatId && (!battleId || previous.id === battleId), 'OPERATION_CONFLICT');
            return { battle: previous, duplicate: true };
          }
        }
        await assertKeyAvailable(repos, operationKey);
        const now = clock();
        await expireGameLocks(repos, now);
        let battle = await findBattle(repos, { userId, chatId, battleId }, ['pending', 'active'], true);
        if (!battle) return { failure: 'BATTLE_NOT_FOUND' };
        requireGame(battle.players[1].userId === userId, 'CHALLENGE_NOT_YOURS');
        if (battle.status === 'active') return { battle, duplicate: true };
        advancedClock(battle, now);
        for (const p of battle.players) {
          const user = await participant(repos, p.userId);
          const units = battle.rulesVersion === 2 ? await teamFor(repos, user) : [await equipped(repos, user)];
          if (battle.rulesVersion === 2) requireGame(units.length === battle.teamSize, 'TEAM_SIZE_MISMATCH', { teamSize: battle.teamSize });
          const snapshots = [];
          for (const unit of units) {
            if (battle.rulesVersion === 2) requireGame(dailyTimestamp(now) >= dailyTimestamp(unit.updatedAt), 'INVALID_CLOCK');
            snapshots.push(await snapshotFor(repos, unit, battle.rulesVersion === 2));
            await repos.units.replace({ ...unit, lock: { type: 'battle', referenceId: battle.id }, updatedAt: now });
          }
          if (battle.rulesVersion === 2) p.units = snapshots;
          else p.unit = snapshots[0];
        }
        battle.status = 'active';
        battle.acceptedAt = now;
        battle.updatedAt = now;
        battle.expiresAt = deadline(now, BATTLE_IDLE_MS);
        battle.turnNumber = 1;
        if (battle.rulesVersion === 2) battle = initializeAdvancedBattle(battle);
        else battle.turnUserId = firstPlayer(battle.players);
        battle.acceptKey = operationKey;
        await repos.battles.replace(battle);
        return { battle, duplicate: false };
      });
    },
    async attack({ userId, chatId, choice, battleId = null, operationKey = null }) {
      checkKey(operationKey);
      return committedResult(storage, async repos => {
        await participant(repos, userId);
        const replay = await replayAction(repos, { userId, chatId, battleId, operationKey }, 'attack');
        if (replay) {
          requireGame(replay.battle.rulesVersion === 2 ? replay.action.choice === String(choice)
            : selectedAttack(replay.battle.players.find(p => p.userId === userId), choice).id === replay.action.attackId, 'OPERATION_CONFLICT');
          return replay;
        }
        await assertKeyAvailable(repos, operationKey);
        const now = clock();
        await expireGameLocks(repos, now);
        const previous = await findBattle(repos, { userId, chatId, battleId }, ['active'], true);
        if (!previous) return { failure: 'BATTLE_NOT_FOUND' };
        advancedClock(previous, now);
        const result = previous.rulesVersion === 2
          ? resolveAdvancedAction(previous, { userId, type: 'attack', choice, operationKey, now, roll: randomRoll() })
          : resolveAttack(previous, { userId, choice, operationKey, now, roll: randomRoll() });
        if (result.battle.status === 'finished') await settleBattle(repos, result.battle, now);
        else await repos.battles.replace(result.battle);
        return { ...result, duplicate: false };
      });
    },
    async switchUnit({ userId, chatId, choice, battleId = null, operationKey = null }) {
      checkKey(operationKey);
      return committedResult(storage, async repos => {
        await participant(repos, userId);
        const replay = await replayAction(repos, { userId, chatId, battleId, operationKey }, 'switch');
        if (replay) {
          requireGame(replay.action.choice === String(choice), 'OPERATION_CONFLICT');
          return replay;
        }
        await assertKeyAvailable(repos, operationKey);
        const now = clock();
        await expireGameLocks(repos, now);
        const previous = await findBattle(repos, { userId, chatId, battleId }, ['active'], true);
        if (!previous) return { failure: 'BATTLE_NOT_FOUND' };
        requireGame(previous.rulesVersion === 2, 'ADVANCED_BATTLE_REQUIRED');
        advancedClock(previous, now);
        const result = resolveAdvancedAction(previous, { userId, type: 'switch', choice, operationKey, now, roll: null });
        if (result.battle.status === 'finished') await settleBattle(repos, result.battle, now);
        else await repos.battles.replace(result.battle);
        return { ...result, duplicate: false };
      });
    },
    async surrender({ userId, chatId, battleId = null, operationKey = null }) {
      checkKey(operationKey);
      return committedResult(storage, async repos => {
        await participant(repos, userId);
        const replay = await replayAction(repos, { userId, chatId, battleId, operationKey }, 'surrender');
        if (replay) return replay;
        await assertKeyAvailable(repos, operationKey);
        const now = clock();
        await expireGameLocks(repos, now);
        const battle = await findBattle(repos, { userId, chatId, battleId }, ['active'], true);
        if (!battle) return { failure: 'BATTLE_NOT_FOUND' };
        advancedClock(battle, now);
        if (battle.rulesVersion === 2) {
          const result = resolveAdvancedAction(battle, { userId, type: 'surrender', choice: null, operationKey, now, roll: null });
          await settleBattle(repos, result.battle, now);
          return { ...result, duplicate: false };
        }
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
      return committedResult(storage, async repos => {
        const now = clock();
        await expireGameLocks(repos, now);
        await participant(repos, userId);
        const battle = await findBattle(repos, { userId, chatId, battleId }, ['pending'], true);
        if (!battle) return { failure: 'BATTLE_NOT_FOUND' };
        advancedClock(battle, now);
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
        await expireGameLocks(repos, clock());
        await participant(repos, userId);
        if (battleId) return findBattle(repos, { userId, chatId, battleId }, ['pending', 'active', 'finished', 'expired', 'rejected', 'cancelled']);
        const rows = await repos.battles.filter(b => b.chatId === chatId && b.players.some(p => p.userId === userId));
        return rows.reverse().sort((a, b) => Number(isOpenBattle(b)) - Number(isOpenBattle(a)) || b.updatedAt.localeCompare(a.updatedAt))[0] ?? null;
      });
    },
    async getHistory({ userId, ...options }) {
      return storage.withTransaction(async repos => {
        await expireGameLocks(repos, clock());
        await participant(repos, userId);
        const rows = await repos.battles.filter(b => b.acceptedAt !== null && !isOpenBattle(b) && b.players.some(p => p.userId === userId));
        return paginate(rows, options, `battleHistory:${userId}`, b => [String(8_640_000_000_000_000 - Date.parse(b.finishedAt)).padStart(17, '0'), b.id]);
      });
    },
    async getHistoryBattle({ userId, battleId }) {
      return storage.withTransaction(async repos => {
        await expireGameLocks(repos, clock());
        await participant(repos, userId);
        const battle = await repos.battles.get(battleId);
        requireGame(battle && battle.acceptedAt !== null && !isOpenBattle(battle), 'HISTORY_NOT_FOUND');
        requireGame(battle.players.some(p => p.userId === userId), 'BATTLE_NOT_PARTICIPANT');
        return battle;
      });
    },
    async sweepExpired() {
      return storage.withTransaction(repos => expireGameLocks(repos, clock()));
    }
  };
}
