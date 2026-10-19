import test from 'node:test';
import assert from 'node:assert/strict';
import { activeUnit } from '../game/battle/advancedEngine.js';
import { createStoryBattle, resolveStoryAction, replayStoryBattle, validateStoryBattle, storyBattleView,
  storyCombatPolicy, storyCombatVersion, storyBattleHistory, upgradeStoryBattle, STORY_ENCOUNTERS } from '../game/story/combat.js';
import { createStoryBattle as createV3, resolveStoryAction as resolveV3 } from '../game/story/combatV3.js';
import { storyBalanceSnapshot, simulateStorySeason } from '../scripts/simulate-story-balance.js';

const NOW = '2026-10-18T00:00:00.000Z';
const act = (battle, action = 'attack', choice = '1') => resolveStoryAction(battle, { action, choice, rolls: [0, 0], now: NOW }).battle;
function create(encounterId, { version = 4, defeats = 0, unit = storyBalanceSnapshot('panda_guerrero', 8), context = {} } = {}) {
  return createStoryBattle({ id: 'combat-v4-test', encounterId, version, units: [unit], now: NOW,
    learning: { defeats, required: storyCombatPolicy(encounterId, version).requiredDefeats }, context });
}
function overpowered(characterId = 'panda_guerrero') {
  const unit = storyBalanceSnapshot(characterId, 20);
  unit.stats.attack = 100000;
  return unit;
}
function finishWithBasic(battle) {
  for (let turn = 0; battle.status === 'active' && turn < 50; turn++) battle = act(battle);
  return battle;
}

test('combate v4: solamente los cinco jefes de capítulo exigen derrotas de reconocimiento', () => {
  assert.deepEqual(Object.keys(STORY_ENCOUNTERS).filter(id => storyCombatPolicy(id).requiredDefeats > 0), ['I05', 'II05', 'III05', 'IV05', 'V05']);
  assert.deepEqual(['I05', 'II05', 'III05', 'IV05', 'V05'].map(id => storyCombatPolicy(id).requiredDefeats), [1, 2, 2, 2, 4]);
  for (const id of ['P03', 'I03', 'I04', 'III01', 'III03', 'IV02A', 'IV02B', 'IV02C', 'V02', 'V04', 'TRIAL1', 'TRIAL2', 'TRIAL3']) {
    const battle = create(id);
    assert.equal(battle.learning.required, 0, id);
    assert.equal(battle.learning.scouting, false, id);
  }
  assert.deepEqual([1, 2, 3].map(storyCombatVersion), [1, 2, 4]);
  assert.equal(storyCombatPolicy('I03', 3).requiredDefeats, 1);
});

for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio', 'bruja_lunar']) {
  test(`combate v4: ${characterId} puede ganar el tutorial solo atacando sin lecciones obligatorias`, () => {
    const before = create('P03', { unit: storyBalanceSnapshot(characterId, characterId === 'bruja_lunar' ? 10 : 1) });
    const battle = finishWithBasic(before);
    assert.equal(battle.version, 4);
    assert.equal(battle.status, 'won');
    assert.equal(battle.tutorial.defend, false);
    assert.equal(battle.tutorial.skill, false);
    assert.equal(activeUnit(battle.players[1]).hp, 0);
    assert.ok(battle.actions.every(entry => entry.action === 'attack'));
    assert.ok(!battle.actions.flatMap(entry => entry.events).some(entry => entry.type === 'tutorial_guidance' || entry.type === 'tutorial_rescue'));
    assert.equal(validateStoryBattle(battle), true);
    assert.deepEqual(before, create('P03', { unit: storyBalanceSnapshot(characterId, characterId === 'bruja_lunar' ? 10 : 1) }));
  });
}

test('combate v4: el Eco no responde después de quedar fuera de combate y las prácticas son opcionales', () => {
  const before = create('P03', { unit: overpowered('bruja_lunar') });
  assert.match(before.enemyIntent.text, /prácticas opcionales/);
  assert.match(storyBattleView(before).enemy.mechanics, /Puedes vencer atacando/);
  assert.equal(storyBattleView(before).availableActions.includes('support'), false);
  const battle = act(before);
  assert.equal(battle.status, 'won');
  assert.equal(battle.core.actions.length, 1);
  assert.equal(activeUnit(battle.players[0]).hp, activeUnit(before.players[0]).hp);
  assert.equal(activeUnit(battle.players[1]).hp, 0);
  const knockouts = battle.actions[0].events.filter(entry => entry.type === 'knockout');
  assert.equal(knockouts.length, 1);
  assert.equal(knockouts[0].unitId, activeUnit(battle.players[1]).id);
  assert.equal(validateStoryBattle(battle), true);
});

test('combate v4: Los Tres Reflejos ceden al caer sin resucitar para imponer defensa y apoyo', () => {
  const battle = act(create('III03', { unit: overpowered() }));
  assert.equal(battle.status, 'won');
  assert.deepEqual(battle.mechanics.lessons, { damage: true, defense: false, support: false });
  assert.equal(activeUnit(battle.players[1]).hp, 0);
  assert.ok(!battle.actions[0].events.some(entry => entry.type === 'reflection_lesson'));
  assert.equal(validateStoryBattle(battle), true);
});

for (const encounterId of ['I05', 'II05', 'III05', 'IV05', 'V05']) {
  test(`combate v4: ${encounterId} desvía el remate durante reconocimiento y cae al cumplir el mínimo`, () => {
    function strike(defeats) {
      let battle = create(encounterId, { defeats, unit: overpowered(), context: { helpedEchoes: true } });
      if (encounterId === 'II05') battle = act(battle, 'observe', null);
      return act(battle, encounterId === 'I05' ? 'break' : 'attack', encounterId === 'I05' ? null : '1');
    }
    const scouting = strike(0);
    assert.equal(scouting.status, 'lost');
    assert.equal(scouting.finishReason, 'knockout');
    assert.equal(activeUnit(scouting.players[1]).hp, 1);
    assert.ok(scouting.players[0].units.every(unit => unit.hp === 0));
    assert.ok(scouting.actions.at(-1).events.some(entry => entry.type === 'scouting_barrier'));
    assert.ok(!scouting.actions.at(-1).events.some(entry => entry.type === 'knockout' && entry.unitId === activeUnit(scouting.players[1]).id));
    assert.equal(validateStoryBattle(scouting), true);
    const victory = strike(storyCombatPolicy(encounterId).requiredDefeats);
    assert.equal(victory.status, 'won');
    assert.equal(activeUnit(victory.players[1]).hp, 0);
    assert.ok(!victory.actions.at(-1).events.some(entry => entry.type === 'scouting_barrier'));
    assert.equal(validateStoryBattle(victory), true);
  });
}

test('combate v4: el miniboss Eco de Tinta admite una victoria desde el primer intento', () => {
  const battle = act(create('I03', { unit: overpowered() }));
  assert.equal(battle.status, 'won');
  assert.equal(battle.learning.required, 0);
  assert.equal(activeUnit(battle.players[1]).hp, 0);
  assert.equal(validateStoryBattle(battle), true);
});

for (const version of [1, 2, 3]) {
  test(`combate v4: tutorial activo v${version} conserva sus turnos y se desbloquea sin reiniciar`, () => {
    const original = act(create('P03', { version, unit: overpowered('bruja_lunar') }));
    assert.equal(original.status, 'active');
    assert.equal(activeUnit(original.players[1]).hp, 1);
    assert.equal(original.tutorial.defend, false);
    const frozen = structuredClone(original);
    const upgraded = upgradeStoryBattle(original);
    assert.deepEqual(original, frozen);
    assert.equal(upgraded.version, 4);
    assert.deepEqual(upgraded.core, original.core);
    assert.deepEqual(upgraded.unitSnapshots, original.unitSnapshots);
    assert.deepEqual(upgraded.actions, original.actions);
    assert.equal(upgraded.updatedAt, original.updatedAt);
    assert.deepEqual(upgraded.combatUpgrade, { fromVersion: version, afterActions: original.actions.length });
    const projected = storyBattleView(upgraded);
    assert.match(projected.enemy.intent, /opcionales/);
    assert.ok(!projected.lastEvents.some(text => /fuera de combate|aún falta/.test(text)));
    const victory = act(upgraded);
    assert.equal(victory.status, 'won');
    assert.equal(victory.actions.length, original.actions.length + 1);
    assert.deepEqual(victory.actions.slice(0, original.actions.length), original.actions);
    const history = storyBattleHistory(victory);
    assert.equal(history.length, victory.actions.length + 1);
    assert.equal(history[0].version, version);
    assert.deepEqual(history[original.actions.length], original);
    assert.deepEqual(history.at(-1), victory);
    assert.deepEqual(replayStoryBattle(victory), victory);
    assert.equal(validateStoryBattle(victory), true);
  });
}

test('combate v4: actualizar I03 retira su requisito sin curar ni alterar turnos anteriores', () => {
  const original = act(create('I03', { version: 3 }), 'defend', null);
  const upgraded = upgradeStoryBattle(original);
  assert.equal(upgraded.learning.required, 0);
  assert.equal(upgraded.learning.scouting, false);
  assert.deepEqual(upgraded.core, original.core);
  const result = act(upgraded);
  assert.equal(validateStoryBattle(result), true);
  assert.deepEqual(storyBattleHistory(result)[original.actions.length], original);
});

test('combate v4: los combates v3 sin actualizar mantienen exactamente su replay publicado', () => {
  const request = { id: 'exact-v3', encounterId: 'III03', version: 3, now: NOW, units: [overpowered()], learning: { defeats: 0, required: 0 } };
  let expected = createV3(request), actual = createStoryBattle(request);
  assert.deepEqual(actual, expected);
  for (const action of ['attack', 'defend', 'support']) {
    const command = { action, choice: action === 'attack' ? '1' : null, rolls: [0, 0], now: NOW };
    expected = resolveV3(expected, command).battle;
    actual = resolveStoryAction(actual, command).battle;
    assert.deepEqual(actual, expected);
    assert.equal(validateStoryBattle(actual), true);
  }
});

test('combate v4: perder la protección no puede convertirse en victoria por un contraataque posterior', () => {
  const unit = storyBalanceSnapshot('panda_guerrero', 20); unit.stats.attack = 78;
  let battle = create('IV02A', { unit });
  for (let turn = 0; turn < 9 && battle.status === 'active'; turn++) battle = act(battle, 'defend', null);
  assert.equal(battle.status, 'lost');
  assert.equal(battle.finishReason, 'protection');
  assert.equal(battle.mechanics.npcSafety, 0);
  assert.ok(activeUnit(battle.players[1]).hp > 0);
  assert.ok(activeUnit(battle.players[0]).hp > 0);
  assert.ok(battle.actions.at(-1).events.some(entry => entry.type === 'protection_failed'));
  assert.ok(!battle.actions.at(-1).events.some(entry => entry.type === 'guard_counter' || entry.type === 'won'));
  assert.match(battle.actions.at(-1).events.at(-1).text, /evacuado/);
  assert.equal(validateStoryBattle(battle), true);
});

test('combate v4: un defensor que cae no contraataca desde fuera de combate', () => {
  const unit = storyBalanceSnapshot('lobo_sombrio', 8), reserve = storyBalanceSnapshot('lobo_sombrio', 8, false, ':reserve');
  unit.stats.hp = 70; unit.stats.defense = 0;
  let battle = createStoryBattle({ id: 'fallen-counter', encounterId: 'I03', now: NOW, units: [unit, reserve] });
  // Reach the discharge with the first fighter below the guarded hit's damage.
  for (let turn = 0; turn < 2; turn++) battle = act(battle);
  const result = act(battle, 'defend', null);
  assert.equal(result.core.players[0].units[0].hp, 0);
  assert.equal(result.core.players[0].activeIndex, 1);
  assert.ok(!result.actions.at(-1).events.some(entry => entry.type === 'guard_counter'));
  assert.equal(validateStoryBattle(result), true);
});

test('combate v4: no se puede falsificar el límite de actualización ni alterar turnos históricos', () => {
  const old = act(create('P03', { version: 3, unit: overpowered() }));
  const result = act(upgradeStoryBattle(old));
  for (const mutate of [
    battle => { battle.combatUpgrade.afterActions = battle.actions.length; },
    battle => { battle.combatUpgrade.afterActions = -1; },
    battle => { battle.combatUpgrade.fromVersion = 4; },
    battle => { battle.combatUpgrade.extra = true; },
    battle => { battle.actions[0].events[0].text = 'turno reescrito'; },
    battle => { battle.learning.required = 100; }
  ]) {
    const changed = structuredClone(result); mutate(changed);
    assert.equal(validateStoryBattle(changed), false);
  }
  assert.throws(() => upgradeStoryBattle(create('I03', { version: 2 })), error => error.code === 'INVALID_STORY_COMBAT_UPGRADE');
  assert.throws(() => upgradeStoryBattle(result), error => error.code === 'INVALID_STORY_COMBAT_UPGRADE');
});

for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
  test(`combate v4: ${characterId} conserva acceso a todos los jefes después de aprender el patrón`, () => {
    for (const [encounterId, level] of Object.entries({ I03: 3, I05: 4, II05: 5, III05: 6, IV05: 7, V05: 8 })) {
      const result = simulateStorySeason({ encounterId, characterId, level, version: 4, rolls: [0, 0] });
      assert.equal(result.status, 'won', encounterId);
      assert.equal(validateStoryBattle(result.battle), true, encounterId);
    }
  });
}
