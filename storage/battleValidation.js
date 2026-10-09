import { requireGame } from '../utils/GameError.js';
import { calculateDamage, firstPlayer, MAX_TURNS } from '../game/battle/engine.js';

const check = (value, field) => requireGame(value, 'DATABASE_CORRUPT', { field });
const equal = (a, b) => JSON.stringify(a) === JSON.stringify(b);
const integer = (value, min = 0) => Number.isSafeInteger(value) && value >= min;
const text = value => typeof value === 'string' && value.length > 0 && value.length <= 200;
const date = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(value) && Number.isFinite(Date.parse(value));
export const openBattle = battle => ['pending', 'active'].includes(battle.status);

export function validateBattleData(state) {
  const users = new Map(state.usuarios.records.map(u => [u.id, u]));
  const units = new Map(state.unidades.records.map(u => [u.id, u]));
  const characters = new Map(state.personajes.records.map(c => [c.id, c]));
  const attacks = new Map(state.ataques.records.map(a => [a.id, a]));
  const battles = new Map(state.combates.records.map(b => [b.id, b]));
  const occupied = new Set();
  const activeUnits = new Set();
  const keys = new Set();
  const uniqueKey = key => {
    if (key === null) return;
    check(text(key) && !keys.has(key), 'battle.operationKey');
    keys.add(key);
  };
  for (const a of attacks.values()) {
    check(text(a.name) && integer(a.revision, 1) && integer(a.power, 1) && a.power <= 10000 && integer(a.accuracy, 1) && a.accuracy <= 100 && a.type === 'physical', 'attack');
  }
  for (const character of state.personajes.records) {
    check(character.attackIds.length === 2 && new Set(character.attackIds).size === 2 && character.attackIds.every(id => attacks.has(id)), 'character.attackReferences');
  }
  for (const battle of battles.values()) {
    check(/^BTL-[a-f0-9-]{36}$/.test(battle.id) && battle.rulesVersion === 1 && text(battle.chatId), 'battle.identity');
    check(['pending', 'active', 'finished', 'expired', 'rejected', 'cancelled'].includes(battle.status), 'battle.status');
    check(Array.isArray(battle.players) && battle.players.length === 2 && battle.players[0].userId !== battle.players[1].userId, 'battle.players');
    check(date(battle.createdAt) && date(battle.updatedAt) && date(battle.expiresAt) && integer(battle.turnNumber) && battle.turnNumber <= MAX_TURNS, 'battle.timestamps');
    check(Array.isArray(battle.actions) && battle.actions.length <= MAX_TURNS, 'battle.actions');
    uniqueKey(battle.challengeKey);
    uniqueKey(battle.acceptKey);
    const accepted = battle.acceptedAt !== null;
    check(!accepted || date(battle.acceptedAt), 'battle.acceptedAt');
    for (const p of battle.players) {
      check(users.has(p.userId) && text(p.name), 'battle.playerReferences');
      if (openBattle(battle)) {
        check(!occupied.has(p.userId), 'battle.playerBusy');
        occupied.add(p.userId);
      }
      if (!accepted) { check(p.unit === null, 'battle.pendingUnit'); continue; }
      const u = p.unit;
      check(u && units.get(u.id)?.ownerId === p.userId && units.get(u.id).characterId === u.characterId, 'battle.snapshotReferences');
      check(text(u.characterName) && integer(u.serial, 1) && integer(u.characterRevision, 1) && integer(u.level, 1), 'battle.snapshot');
      check(u.serial === units.get(u.id).serial && u.characterRevision <= characters.get(u.characterId).revision && equal(u.stats, units.get(u.id).initialStats), 'battle.snapshotOrigin');
      for (const key of ['hp', 'attack', 'defense', 'speed']) check(integer(u.stats?.[key], key === 'defense' ? 0 : 1), 'battle.snapshotStats');
      check(integer(u.hp) && u.hp <= u.stats.hp && Array.isArray(u.attacks) && u.attacks.length === 2 && u.attacks[0].id !== u.attacks[1].id, 'battle.snapshotHp');
      for (const attack of u.attacks) {
        check(attacks.has(attack.id) && integer(attack.revision, 1) && attack.revision <= attacks.get(attack.id).revision && text(attack.name) && integer(attack.power, 1) && attack.power <= 10000 && integer(attack.accuracy, 1) && attack.accuracy <= 100 && attack.type === 'physical', 'battle.snapshotAttack');
      }
      if (battle.status === 'active') {
        check(!activeUnits.has(u.id) && equal(units.get(u.id).lock, { type: 'battle', referenceId: battle.id }), 'battle.unitLock');
        activeUnits.add(u.id);
      }
    }
    if (!accepted) {
      check(['pending', 'expired', 'rejected', 'cancelled'].includes(battle.status) && battle.turnNumber === 0 && battle.turnUserId === null && battle.actions.length === 0 && battle.winnerId === null && battle.acceptKey === null, 'battle.pendingState');
    } else {
      check(['active', 'finished', 'expired'].includes(battle.status) && battle.turnNumber >= 1, 'battle.acceptedState');
      const hp = new Map(battle.players.map(p => [p.userId, p.unit.stats.hp]));
      let nextTurn = firstPlayer(battle.players);
      let terminal = false;
      for (let i = 0; i < battle.actions.length; i++) {
        const action = battle.actions[i];
        uniqueKey(action.operationKey);
        check(!terminal && action.seq === i + 1 && action.turnNumber === i + 1 && date(action.createdAt), 'battle.actionSequence');
        const attacker = battle.players.find(p => p.userId === action.actorId);
        const defender = battle.players.find(p => p.userId !== action.actorId);
        check(attacker && ['attack', 'surrender'].includes(action.type), 'battle.actionActor');
        if (action.type === 'surrender') {
          check(i === battle.actions.length - 1 && action.targetId === defender.userId && action.attackId === null && action.hit === null && action.damage === 0 && action.beforeHp === null && action.afterHp === null, 'battle.surrender');
          terminal = true;
          continue;
        }
        const attack = attacker.unit.attacks.find(a => a.id === action.attackId);
        check(action.actorId === nextTurn && action.targetId === defender.userId && attack && typeof action.hit === 'boolean', 'battle.actionTurn');
        check(attack.accuracy !== 100 || action.hit, 'battle.accuracy');
        const beforeHp = hp.get(defender.userId);
        const damage = action.hit ? Math.min(beforeHp, calculateDamage(attack, attacker.unit.stats, defender.unit.stats)) : 0;
        check(action.beforeHp === beforeHp && action.damage === damage && action.afterHp === beforeHp - damage, 'battle.actionDamage');
        hp.set(defender.userId, action.afterHp);
        nextTurn = defender.userId;
        terminal = action.afterHp === 0 || action.seq >= MAX_TURNS;
      }
      for (const p of battle.players) check(p.unit.hp === hp.get(p.userId), 'battle.hpHistory');
      if (battle.status === 'active') {
        check(!terminal && battle.turnUserId === nextTurn && battle.turnNumber === battle.actions.length + 1 && battle.winnerId === null, 'battle.turn');
      } else if (battle.status === 'finished') {
        const last = battle.actions.at(-1);
        check(terminal && last && battle.turnNumber === battle.actions.length, 'battle.finishedHistory');
        if (last.type === 'surrender') check(battle.finishReason === 'surrender' && battle.winnerId === last.targetId, 'battle.surrenderWinner');
        else if (last.afterHp === 0) check(battle.finishReason === 'knockout' && battle.winnerId === last.actorId, 'battle.knockoutWinner');
        else check(battle.finishReason === 'turn_limit' && battle.winnerId === null, 'battle.draw');
      } else check(!terminal && battle.winnerId === null && battle.finishReason === 'inactivity', 'battle.expired');
    }
    if (openBattle(battle)) check(battle.finishedAt === null && battle.finishReason === null, 'battle.openFinish');
    else check(date(battle.finishedAt) && battle.turnUserId === null && (accepted || ({ expired: 'challenge_timeout', rejected: 'rejected', cancelled: 'cancelled' })[battle.status] === battle.finishReason), 'battle.closedFinish');
  }
  for (const unit of units.values()) {
    if (unit.lock !== null) check(unit.lock?.type === 'battle' && battles.get(unit.lock.referenceId)?.status === 'active' && activeUnits.has(unit.id), 'unit.lockReference');
  }
}

export function validateBattleTransition(before, after) {
  const next = new Map(after.combates.records.map(b => [b.id, b]));
  const userDeltas = new Map();
  const unitDeltas = new Map();
  const previousIds = new Set(before.combates.records.map(b => b.id));
  for (const battle of after.combates.records.filter(b => !previousIds.has(b.id))) check(battle.status === 'pending', 'battle.newChallenge');
  const add = (map, id, winner, decided) => {
    const delta = map.get(id) ?? { wins: 0, losses: 0, matches: 0 };
    delta.matches += 1;
    if (decided) delta[winner ? 'wins' : 'losses'] += 1;
    map.set(id, delta);
  };
  for (const battle of before.combates.records) {
    const updated = next.get(battle.id);
    check(updated && updated.chatId === battle.chatId && updated.createdAt === battle.createdAt && updated.challengeKey === battle.challengeKey && updated.rulesVersion === battle.rulesVersion && equal(updated.players.map(p => [p.userId, p.name]), battle.players.map(p => [p.userId, p.name])), 'battle.immutable');
    if (!openBattle(battle)) { check(equal(battle, updated), 'battle.closedImmutable'); continue; }
    check(equal(battle.actions, updated.actions.slice(0, battle.actions.length)) && updated.actions.length <= battle.actions.length + 1, 'battle.appendActions');
    if (battle.status === 'active') {
      check(updated.status !== 'pending' && updated.acceptedAt === battle.acceptedAt && updated.acceptKey === battle.acceptKey, 'battle.activeTransition');
      for (let i = 0; i < 2; i++) {
        const { hp: oldHp, ...oldUnit } = battle.players[i].unit;
        const { hp: newHp, ...newUnit } = updated.players[i].unit;
        check(equal(oldUnit, newUnit), 'battle.snapshotImmutable');
        if (updated.status === 'active') {
          const userId = battle.players[i].userId;
          check(equal(before.usuarios.records.find(u => u.id === userId).team, after.usuarios.records.find(u => u.id === userId).team), 'battle.teamLocked');
        }
      }
      if (!openBattle(updated)) {
        for (const p of updated.players) {
          add(userDeltas, p.userId, updated.winnerId === p.userId, updated.winnerId !== null);
          add(unitDeltas, p.unit.id, updated.winnerId === p.userId, updated.winnerId !== null);
        }
      }
    }
  }
  for (const name of ['usuarios', 'unidades']) {
    const deltas = name === 'usuarios' ? userDeltas : unitDeltas;
    const updated = new Map(after[name].records.map(r => [r.id, r]));
    for (const previous of before[name].records) {
      const delta = deltas.get(previous.id) ?? { wins: 0, losses: 0, matches: 0 };
      for (const field of name === 'usuarios' ? ['wins', 'losses', 'matches'] : ['wins', 'losses']) {
        check(updated.get(previous.id).battleStats[field] === previous.battleStats[field] + delta[field], 'battle.statsSettlement');
      }
    }
  }
}
