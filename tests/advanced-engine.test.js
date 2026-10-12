import test from 'node:test';
import assert from 'node:assert/strict';
import { seedAttacks } from '../game/battle/attacks.js';
import { BALANCED_STATS } from '../game/characters/balance.js';
import { advancedAttack, attackCombatProfile, combatProfile, validateAttackCombatProfile, validateCombatProfile } from '../game/battle/combatContent.js';
import { activeUnit, calculateAdvancedDamage, elementalMultiplier, initializeAdvancedBattle, MAX_ADVANCED_TURNS, replayAdvancedBattle, resolveAdvancedAction, validateRuntimeEffect } from '../game/battle/advancedEngine.js';

const initialTime = '2026-10-11T12:00:00.000Z';
const baseAttack = (id, changes = {}) => ({ id, name: id, revision: 1, power: 25, accuracy: 100, type: 'physical',
  element: 'neutral', effects: [], cooldown: 0, combatVersion: 1, ...changes });
function unit(id, changes = {}) {
  return { id, characterId: 'custom', characterName: id, stats: { hp: 200, attack: 20, defense: 20, speed: 10 },
    element: 'neutral', ability: null, attacks: [baseAttack(`${id}_1`), baseAttack(`${id}_2`, { power: 35, accuracy: 80, cooldown: 2 })], ...changes };
}
function prepare(first = [unit('a1')], second = [unit('b1')]) {
  return initializeAdvancedBattle({ id: 'BTL-test', rulesVersion: 2, acceptedAt: initialTime, createdAt: initialTime,
    players: [{ userId: 'a', name: 'Miguel', units: first, activeIndex: 0 }, { userId: 'b', name: 'Lukas', units: second, activeIndex: 0 }] });
}
function act(battle, type = 'attack', choice = '1', options = {}) {
  const next = new Date(Date.parse(battle.updatedAt) + 1000).toISOString();
  return resolveAdvancedAction(battle, { userId: battle.turnUserId, type, choice, now: next, roll: type === 'attack' ? 0 : null,
    operationKey: `action:${battle.actions.length + 1}`, ...options });
}
function current(battle, id) { return activeUnit(battle.players.find(p => p.userId === id)); }
function runtimeEffect(type, potency, remaining = 2, sourceUnitId = 'b1') {
  return { type, potency, remaining, sourceUnitId, appliedAtTurn: 0 };
}

test('advanced content preserves classic attacks and defines validated profiles for all eight characters', () => {
  for (const [id, stats] of Object.entries(BALANCED_STATS)) {
    const character = combatProfile(id);
    assert.equal(validateCombatProfile(character), true);
    assert.equal(character.version, 1);
    const attacks = seedAttacks().filter(a => a.id.startsWith(`${id}_`));
    assert.deepEqual(attacks.map(a => [a.power, a.accuracy, a.type]), [[25, 100, 'physical'], [40, 80, 'physical']]);
    for (const attack of attacks) assert.equal(validateAttackCombatProfile(attackCombatProfile(attack.id, attack)), true);
    assert.equal(advancedAttack(attacks[0]).cooldown, 0);
    assert.ok(advancedAttack(attacks[1]).cooldown >= 2);
    assert.ok(stats.hp > 0);
  }
  assert.equal(advancedAttack(seedAttacks().find(a => a.id === 'mago_carmesi_1')).type, 'magic');
  assert.equal(advancedAttack(seedAttacks().find(a => a.id === 'golpe_potente')).cooldown, 2);
  assert.deepEqual(combatProfile('future_character'), { version: 1, element: 'neutral', ability: null });
  assert.deepEqual(combatProfile('constructor'), { version: 1, element: 'neutral', ability: null });
  assert.equal(validateCombatProfile({ version: 2, element: 'fire', ability: null }), false);
  assert.equal(validateAttackCombatProfile({ ...attackCombatProfile('x_2'), cooldown: 6 }), false);
  const profile = combatProfile('panda_guerrero');
  profile.ability.effects[0].potency = 999;
  assert.equal(combatProfile('panda_guerrero').ability.effects[0].potency, 12);
});

test('element circle uses soft multipliers, resistance, neutral and mutual light/dark advantage', () => {
  for (const [strong, weak] of [['fire', 'nature'], ['nature', 'water'], ['water', 'fire']]) {
    assert.equal(elementalMultiplier(strong, weak), 125);
    assert.equal(elementalMultiplier(weak, strong), 80);
  }
  assert.equal(elementalMultiplier('light', 'dark'), 125);
  assert.equal(elementalMultiplier('dark', 'light'), 125);
  assert.equal(elementalMultiplier('neutral', 'fire'), 100);
  assert.equal(elementalMultiplier('water', 'water'), 100);
  assert.throws(() => elementalMultiplier('electric', 'water'), { code: 'INVALID_ELEMENT' });
  const attacker = { ...unit('a'), effects: [] };
  const defender = { ...unit('b', { element: 'nature' }), effects: [] };
  assert.equal(calculateAdvancedDamage(baseAttack('fire', { power: 40, element: 'fire' }), attacker, defender), 50);
  assert.equal(calculateAdvancedDamage(baseAttack('water', { power: 40, element: 'water' }), attacker, defender), 32);
});

test('damage percentages are exact near the maximum integer and reject overflow', () => {
  const attacker = { stats: { attack: Number.MAX_SAFE_INTEGER - 100 }, effects: [] };
  const defender = { stats: { defense: 0 }, element: 'neutral', effects: [] };
  const attack = baseAttack('huge', { power: 1 });
  assert.equal(calculateAdvancedDamage(attack, attacker, defender), Number.MAX_SAFE_INTEGER - 99);
  defender.element = 'nature';
  assert.throws(() => calculateAdvancedDamage({ ...attack, element: 'fire' }, attacker, defender), { code: 'NUMERIC_OVERFLOW' });
  assert.equal(calculateAdvancedDamage(baseAttack('tiny', { power: 1 }), { stats: { attack: 1 }, effects: [] },
    { stats: { defense: 1000 }, element: 'neutral', effects: [] }), 1);
});

test('initialization chooses speed, freezes origin and applies each entry passive once', () => {
  const panda = { ...combatProfile('panda_guerrero') };
  const battle = prepare([unit('panda', panda), unit('reserve')], [unit('fast', { stats: { hp: 200, attack: 20, defense: 20, speed: 11 } })]);
  assert.equal(battle.turnUserId, 'b');
  assert.equal(current(battle, 'a').effects[0].potency, 12);
  assert.equal(current(battle, 'a').abilityUsed, true);
  assert.equal(battle.players[0].units[1].participated, false);
  assert.equal(battle.openingEvents.filter(e => e.type === 'ability').length, 1);
  const initial = structuredClone(battle);
  const result = act(battle);
  assert.equal(result.action.damage, 13);
  assert.equal(result.action.events.find(e => e.type === 'shield_absorbed').amount, 12);
  assert.deepEqual(battle, initial);
  let next = act(result.battle, 'switch', '2').battle;
  next = act(next).battle;
  next = act(next, 'switch', '1').battle;
  assert.equal(current(next, 'a').abilityUsed, true);
  assert.equal(next.actions.at(-1).events.some(e => e.type === 'ability'), false);
  assert.deepEqual(replayAdvancedBattle(next), next);
});

test('Wolf entry mitigation improves survival without changing its established birth statistics', () => {
  const wolf = unit('wolf', { ...combatProfile('lobo_sombrio'), stats: { ...BALANCED_STATS.lobo_sombrio } });
  let battle = prepare([wolf]);
  assert.deepEqual(current(battle, 'a').stats, { hp: 95, attack: 27, defense: 17, speed: 16 });
  assert.equal(current(battle, 'a').effects.find(e => e.type === 'shield').potency, 10);
  assert.equal(current(battle, 'b').effects.find(e => e.type === 'defense_down').potency, 10);
  battle = act(battle).battle;
  const reply = act(battle);
  assert.equal(reply.action.damage, 18);
  assert.equal(reply.action.events.find(e => e.type === 'shield_absorbed').amount, 10);
  assert.equal(current(reply.battle, 'a').hp, 77);
  assert.deepEqual(replayAdvancedBattle(reply.battle), reply.battle);
});

test('Monk entry shield and regeneration improve its role while retaining birth statistics and full-HP limits', () => {
  const monk = unit('monk', { ...combatProfile('monje_celestial'), stats: { ...BALANCED_STATS.monje_celestial } });
  let battle = prepare([monk]);
  assert.deepEqual(current(battle, 'a').stats, { hp: 114, attack: 27, defense: 21, speed: 11 });
  assert.equal(current(battle, 'a').effects.find(e => e.type === 'shield').potency, 6);
  battle = act(battle).battle;
  assert.equal(current(battle, 'a').hp, 114);
  assert.equal(current(battle, 'a').effects.find(e => e.type === 'regeneration').remaining, 2);
  battle = act(battle).battle;
  assert.equal(current(battle, 'a').hp, 96);
  const recovered = act(battle);
  assert.equal(recovered.action.events.find(e => e.type === 'effect_tick' && e.effect === 'regeneration').amount, 9);
  assert.equal(current(recovered.battle, 'a').hp, 105);
  assert.deepEqual(replayAdvancedBattle(recovered.battle), recovered.battle);
});

test('accuracy boundaries and misses persist the roll, consume cooldown and preserve deterministic replay', () => {
  const battle = prepare();
  const miss = act(battle, 'attack', '2', { roll: 80 });
  assert.equal(miss.action.hit, false);
  assert.equal(miss.action.damage, 0);
  assert.equal(miss.action.roll, 80);
  assert.equal(current(miss.battle, 'a').cooldowns.a1_2, 2);
  let next = act(miss.battle).battle;
  assert.throws(() => act(next, 'attack', '2'), { code: 'ATTACK_COOLDOWN' });
  next = act(next).battle;
  next = act(next).battle;
  assert.equal(current(next, 'a').cooldowns.a1_2, 1);
  assert.throws(() => act(next, 'attack', '2'), { code: 'ATTACK_COOLDOWN' });
  next = act(next).battle;
  next = act(next).battle;
  assert.equal(current(next, 'a').cooldowns.a1_2, undefined);
  const hit = act(next, 'attack', '2', { roll: 79 });
  assert.equal(hit.action.hit, true);
  assert.deepEqual(replayAdvancedBattle(hit.battle), hit.battle);
  assert.equal(act(prepare(), 'attack', '1', { roll: 99 }).action.hit, true);
});

test('poison and burn tick only for the active unit, and switching freezes bench duration', () => {
  const poisonAttack = baseAttack('b1_1', { effects: [{ type: 'poison', target: 'enemy', duration: 3, potency: 5 }] });
  let battle = prepare([unit('a1'), unit('a2')], [unit('b1', { attacks: [poisonAttack, baseAttack('b1_2')] })]);
  battle = act(battle).battle;
  battle = act(battle).battle;
  assert.equal(current(battle, 'a').effects[0].remaining, 3);
  const before = current(battle, 'a').hp;
  const switched = act(battle, 'switch', '2');
  battle = switched.battle;
  assert.equal(battle.players[0].units[0].hp, before - 10);
  assert.equal(battle.players[0].units[0].effects[0].remaining, 2);
  assert.equal(current(battle, 'a').id, 'a2');
  battle = act(battle).battle;
  battle = act(battle, 'switch', '1').battle;
  assert.equal(current(battle, 'a').effects[0].remaining, 2);
  assert.equal(current(battle, 'a').hp, before - 10);
  battle = act(battle).battle;
  const tick = act(battle);
  assert.equal(tick.action.events.find(e => e.type === 'effect_tick').amount, 10);
  assert.equal(current(tick.battle, 'a').effects[0].remaining, 2); // Rival refreshed it before re-entry.
  assert.deepEqual(replayAdvancedBattle(tick.battle), tick.battle);
  const burn = prepare();
  current(burn, 'a').effects = [runtimeEffect('burn', 4, 1)];
  const consumed = act(burn);
  assert.equal(current(consumed.battle, 'a').hp, 192);
  assert.equal(current(consumed.battle, 'a').effects.length, 0);
});

test('stun consumes the chosen action once, including a skill on cooldown, without changing the active slot', () => {
  const battle = prepare([unit('a1'), unit('a2')]);
  current(battle, 'a').effects = [runtimeEffect('stun', 1, 1)];
  current(battle, 'a').cooldowns.a1_2 = 2;
  const skipped = act(battle, 'attack', '2');
  assert.equal(skipped.action.type, 'skip');
  assert.equal(skipped.action.commandType, 'attack');
  assert.equal(skipped.action.choice, '2');
  assert.equal(skipped.action.damage, 0);
  assert.equal(skipped.action.attackId, null);
  assert.equal(current(skipped.battle, 'a').cooldowns.a1_2, 1);
  assert.equal(current(skipped.battle, 'a').effects.length, 0);
  const blockedSwitch = act(battle, 'switch', '2');
  assert.equal(blockedSwitch.action.type, 'skip');
  assert.equal(blockedSwitch.action.commandType, 'switch');
  assert.equal(current(blockedSwitch.battle, 'a').id, 'a1');
});

test('cooldowns complete the outgoing turn and then remain frozen throughout bench turns', () => {
  let battle = prepare([unit('a1'), unit('a2')]);
  battle = act(battle, 'attack', '2').battle;
  battle = act(battle).battle;
  battle = act(battle, 'switch', '2').battle;
  assert.equal(battle.players[0].units[0].cooldowns.a1_2, 1);
  battle = act(battle).battle;
  battle = act(battle).battle;
  battle = act(battle).battle;
  assert.equal(battle.players[0].units[0].cooldowns.a1_2, 1);
  battle = act(battle, 'switch', '1').battle;
  battle = act(battle).battle;
  assert.throws(() => act(battle, 'attack', '2'), { code: 'ATTACK_COOLDOWN' });
  battle = act(battle).battle;
  assert.equal(current(battle, 'a').cooldowns.a1_2, undefined);
  assert.deepEqual(replayAdvancedBattle(battle), battle);
});

test('a genuine stun action replays its saved intent and random roll exactly', () => {
  const stun = baseAttack('b1_2', { power: 1, effects: [{ type: 'stun', target: 'enemy', duration: 1, potency: 1 }], cooldown: 2 });
  let battle = prepare([unit('a1')], [unit('b1', { attacks: [baseAttack('b1_1'), stun] })]);
  battle = act(battle).battle;
  battle = act(battle, 'attack', '2').battle;
  const skipped = act(battle, 'attack', '2', { roll: 99 });
  assert.equal(skipped.action.type, 'skip');
  assert.equal(skipped.action.commandType, 'attack');
  assert.equal(skipped.action.roll, 99);
  assert.equal(skipped.action.choice, '2');
  assert.deepEqual(replayAdvancedBattle(skipped.battle), skipped.battle);
});

test('regeneration caps at maximum HP and poison cannot resurrect a knocked out unit', () => {
  const battle = prepare([unit('a1'), unit('a2')]);
  current(battle, 'a').hp = 198;
  current(battle, 'a').effects = [runtimeEffect('regeneration', 10, 1)];
  const recovered = act(battle);
  assert.equal(current(recovered.battle, 'a').hp, 200);
  assert.equal(recovered.action.events.find(e => e.type === 'effect_tick').amount, 2);
  current(battle, 'a').hp = 1;
  current(battle, 'a').effects = [runtimeEffect('poison', 5, 1), runtimeEffect('regeneration', 10, 2)];
  const knockedOut = act(battle);
  assert.equal(knockedOut.action.type, 'skip');
  assert.equal(knockedOut.battle.players[0].units[0].hp, 0);
  assert.equal(current(knockedOut.battle, 'a').id, 'a2');
  assert.equal(knockedOut.battle.players[0].units[0].effects.length, 0);
  assert.equal(knockedOut.battle.turnUserId, 'b');
});

test('buff and debuff affect damage for their duration and repeated shields refresh rather than stack', () => {
  const battle = prepare();
  current(battle, 'a').effects = [runtimeEffect('attack_up', 20, 1)];
  current(battle, 'b').effects = [runtimeEffect('defense_down', 25, 2)];
  const empowered = act(battle);
  assert.equal(empowered.action.damage, 34);
  assert.equal(current(empowered.battle, 'a').effects.length, 0);
  const shield = baseAttack('a1_1', { power: 1, effects: [{ type: 'shield', target: 'self', duration: 2, potency: 15 }] });
  let refreshed = prepare([unit('a1', { attacks: [shield, baseAttack('a1_2')] })],
    [unit('b1', { attacks: [baseAttack('b1_1', { power: 1 }), baseAttack('b1_2')] })]);
  refreshed = act(refreshed).battle;
  refreshed = act(refreshed).battle;
  refreshed = act(refreshed).battle;
  assert.equal(current(refreshed, 'a').effects.filter(e => e.type === 'shield').length, 1);
  assert.equal(current(refreshed, 'a').effects[0].potency, 15);
  assert.equal(current(refreshed, 'a').effects[0].remaining, 2);
  assert.deepEqual(replayAdvancedBattle(refreshed), refreshed);
});

test('knockout automatically activates the next living reserve, and victory requires the entire team to fall', () => {
  const strong = unit('a1', { attacks: [baseAttack('a1_1', { power: 1000 }), baseAttack('a1_2')] });
  let battle = prepare([strong], [unit('b1'), unit('b2', combatProfile('panda_guerrero')), unit('b3')]);
  const first = act(battle);
  assert.equal(first.action.targetUnitId, 'b1');
  assert.equal(first.battle.status, 'active');
  assert.equal(current(first.battle, 'b').id, 'b2');
  assert.ok(first.action.events.some(e => e.type === 'auto_switch'));
  assert.ok(first.action.events.some(e => e.type === 'ability'));
  assert.equal(first.battle.players[1].units[1].participated, true);
  assert.equal(first.battle.players[1].units[2].participated, false);
  battle = act(first.battle).battle;
  battle = act(battle).battle;
  battle = act(battle).battle;
  const final = act(battle);
  assert.equal(final.battle.status, 'finished');
  assert.equal(final.battle.winnerId, 'a');
  assert.equal(final.battle.finishReason, 'knockout');
  assert.equal(final.battle.turnUserId, null);
  assert.deepEqual(replayAdvancedBattle(final.battle), final.battle);
});

test('surrender is available outside the turn and does not trigger poison or regeneration', () => {
  const battle = prepare();
  current(battle, 'b').effects = [runtimeEffect('poison', 5, 2)];
  const surrendered = act(battle, 'surrender', null, { userId: 'b' });
  assert.equal(surrendered.battle.winnerId, 'a');
  assert.equal(surrendered.battle.finishReason, 'surrender');
  assert.equal(current(surrendered.battle, 'b').hp, 200);
  assert.deepEqual(surrendered.action.events, []);
});

test('100 consumed actions produce a draw with exact replay, including voluntary switches', () => {
  let battle = prepare([unit('a1'), unit('a2')], [unit('b1'), unit('b2')]);
  for (let i = 0; i < MAX_ADVANCED_TURNS; i++) {
    const player = battle.players.find(p => p.userId === battle.turnUserId);
    battle = act(battle, 'switch', String(player.activeIndex === 0 ? 2 : 1)).battle;
  }
  assert.equal(battle.actions.length, 100);
  assert.equal(battle.status, 'finished');
  assert.equal(battle.winnerId, null);
  assert.equal(battle.finishReason, 'turn_limit');
  assert.equal(battle.turnNumber, 100);
  assert.deepEqual(replayAdvancedBattle(battle), battle);
});

test('invalid intent, clock, roll and arena participant do not mutate the original battle', () => {
  const battle = prepare([unit('a1'), unit('a2')]);
  const unchanged = structuredClone(battle);
  for (const [type, choice, options, code] of [
    ['attack', '3', {}, 'INVALID_ATTACK'], ['attack', '1', { roll: 100 }, 'INVALID_RANDOM_ROLL'],
    ['attack', '1', { roll: -1 }, 'INVALID_RANDOM_ROLL'], ['attack', '1', { userId: 'b' }, 'NOT_YOUR_TURN'],
    ['attack', '1', { userId: 'stranger' }, 'BATTLE_NOT_PARTICIPANT'], ['switch', '3', {}, 'INVALID_TEAM_SLOT'],
    ['switch', '1', {}, 'UNIT_ALREADY_ACTIVE'], ['attack', '1', { now: '2026-02-30T12:00:00.000Z' }, 'INVALID_TIMESTAMP'],
    ['attack', '1', { now: '2026-10-11T11:59:59.000Z' }, 'INVALID_TIMESTAMP'],
    ['attack', '1', { now: battle.expiresAt }, 'BATTLE_EXPIRED']
  ]) assert.throws(() => act(battle, type, choice, options), { code });
  battle.players[0].units[1].hp = 0;
  assert.throws(() => act(battle, 'switch', '2'), { code: 'UNIT_KNOCKED_OUT' });
  battle.players[0].units[1].hp = 200;
  assert.deepEqual(battle, unchanged);
  assert.equal(validateRuntimeEffect(runtimeEffect('poison', 5)), true);
  assert.equal(validateRuntimeEffect(runtimeEffect('poison', 5, 0)), false);
  assert.equal(act(prepare(), 'attack', '1', { now: '2026-10-11T12:00:01Z' }).action.createdAt, '2026-10-11T12:00:01Z');
});

test('frozen content and saved randomness replay a battle after the live catalog changes', () => {
  const attacks = seedAttacks().filter(a => a.id.startsWith('mago_carmesi_')).map(advancedAttack);
  let battle = prepare([unit('mago', { ...combatProfile('mago_carmesi'), attacks })], [unit('panda', combatProfile('panda_guerrero'))]);
  battle = act(battle, 'attack', '2', { roll: 30 }).battle;
  battle = act(battle).battle;
  battle = act(battle).battle;
  const persisted = structuredClone(battle);
  attacks[0].power = 999;
  attacks[1].effects = [];
  assert.deepEqual(replayAdvancedBattle(persisted), persisted);
  const forged = structuredClone(persisted);
  forged.players[1].units[0].hp += 1;
  assert.notDeepEqual(replayAdvancedBattle(forged).players, forged.players);
  forged.actions[0].damage += 1;
  assert.notDeepEqual(replayAdvancedBattle(forged).actions, forged.actions);
});
