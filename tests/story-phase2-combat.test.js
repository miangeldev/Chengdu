import test from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { activeUnit } from '../game/battle/advancedEngine.js';
import { createStoryBattle, replayStoryBattle, resolveStoryAction, storyBattleView, storyEncounter, validateStoryBattle } from '../game/story/combat.js';
import { simulateStory, storyBalanceSnapshot } from '../scripts/simulate-story-balance.js';

const NOW = '2026-10-17T00:00:00.000Z';
const create = (encounterId, characterId = 'panda_guerrero', version = 2) => createStoryBattle({ id: 'phase-two', encounterId, version,
  units: [storyBalanceSnapshot(characterId, encounterId === 'II05' ? 5 : 4)], now: NOW });
const act = (battle, action, choice = null, rolls = [0, 0]) => resolveStoryAction(battle, { action, choice, rolls, now: NOW }).battle;
const digest = battle => createHash('sha256').update(JSON.stringify(battle)).digest('hex');
const code = (work, expected) => assert.throws(work, error => error.code === expected);

for (const [encounterId, initial, progressed] of [
  ['P03', '49ed0202bf68a18e738e967634f8631a7cad5966ce248392314181ccafc6321a', 'c8f32407c16e26ecd688afb444350143325cd732cf2b55c5a617c3ae6f67cf9b'],
  ['I03', 'd6ebc9f38807a09d343701a3fb2205936f9282a468831701d5aa642eb1a45d73', '137c93b9ec3c07654b9c95d7dacf879bcda194dc05602e63705961ba99b07cde']
]) test(`historia v1: ${encounterId} conserva byte a byte las reglas publicadas antes de ampliar capítulos`, () => {
  let battle = createStoryBattle({ id: 'frozen-legacy', encounterId, version: 1, units: [storyBalanceSnapshot('panda_guerrero', 4)], now: NOW });
  assert.equal(digest(battle), initial);
  for (const action of ['attack', 'defend', 'skill', 'attack']) battle = act(battle, action, action === 'attack' ? '1' : null);
  assert.equal(digest(battle), progressed);
  assert.equal(Object.hasOwn(battle, 'mechanics'), false);
  assert.deepEqual(replayStoryBattle(battle), battle);
  assert.equal(validateStoryBattle(battle), true);
});

test('historia v2: las raíces se pueden romper, vuelven después de la apertura y señalan la descarga', () => {
  let battle = create('I05');
  assert.equal(battle.mechanics.barrier, 50);
  assert.ok(storyBattleView(battle).availableActions.includes('break'));
  const guarded = act(battle, 'attack');
  assert.equal(activeUnit(guarded.players[1]).hp, activeUnit(battle.players[1]).hp);
  assert.ok(guarded.mechanics.barrier > 0 && guarded.mechanics.barrier < 50);
  battle = act(battle, 'break');
  assert.ok(battle.actions[0].events.some(event => event.type === 'roots_broken'));
  assert.ok(activeUnit(battle.players[1]).hp < 240);
  assert.equal(battle.mechanics.barrier, 0);
  assert.equal(battle.core.actions.length, 2);
  assert.equal(storyBattleView(battle).availableActions.includes('break'), false);
  battle = act(battle, 'skill');
  assert.equal(battle.enemyIntent.type, 'unleash');
  assert.match(battle.enemyIntent.text, /Defiende/);
  battle = act(battle, 'defend');
  assert.ok(battle.actions.at(-1).events.some(event => event.type === 'guarded'));
  battle = act(battle, 'attack');
  assert.equal(battle.enemyIntent.type, 'roots');
  assert.equal(battle.mechanics.barrier, 50);
  assert.equal(validateStoryBattle(battle), true);
});

test('historia v2: los señuelos consumen ataques y habilidades; observar revela al original durante el ciclo', () => {
  let battle = create('II05', 'mago_carmesi');
  assert.ok(storyBattleView(battle).availableActions.includes('observe'));
  const original = structuredClone(battle);
  battle = act(battle, 'skill');
  assert.deepEqual(original, create('II05', 'mago_carmesi'));
  assert.equal(activeUnit(battle.players[1]).hp, 270);
  assert.ok(battle.actions[0].events.some(event => event.type === 'decoy'));
  assert.equal(activeUnit(battle.players[0]).cooldowns.mago_carmesi_2, 2);
  battle = act(battle, 'observe');
  assert.equal(battle.mechanics.revealed, true);
  assert.ok(battle.actions.at(-1).events.some(event => event.type === 'observed'));
  assert.equal(battle.actions.at(-1).events.some(event => event.type === 'guarded'), false);
  assert.equal(storyBattleView(battle).availableActions.includes('observe'), false);
  battle = act(battle, 'attack');
  assert.ok(activeUnit(battle.players[1]).hp < 270);
  battle = act(battle, 'defend');
  battle = act(battle, 'skill');
  assert.equal(battle.enemyIntent.type, 'illusions');
  assert.equal(battle.mechanics.revealed, false);
  assert.ok(storyBattleView(battle).availableActions.includes('observe'));
  assert.match(storyBattleView(battle).enemy.mechanics, /Señuelos/);
  assert.equal(validateStoryBattle(battle), true);
});

for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
  test(`historia v2: ${characterId} supera ambos jefes como común sin evolución ni derrotas forzadas`, () => {
    for (const [encounterId, level] of [['I05', 4], ['II05', 5]]) {
      const tactical = simulateStory({ encounterId, characterId, level, policy: 'tactical', rolls: [0, 0] });
      assert.equal(tactical.status, 'won');
      assert.equal(validateStoryBattle(tactical.battle), true);
      const reckless = simulateStory({ encounterId, characterId, level, policy: 'attack', rolls: [0, 0] });
      assert.equal(reckless.status, 'lost');
      assert.ok(reckless.battle.actions.at(-1).events.some(event => event.type === 'lost' && /rompe|observa/.test(event.text)));
    }
  });
}

test('historia v2: la emboscada anuncia el golpe y admite reanudación sin vencer turnos', () => {
  let battle = create('I04');
  battle = act(battle, 'attack');
  battle = act(battle, 'attack');
  assert.equal(battle.enemyIntent.type, 'unleash');
  battle = resolveStoryAction(battle, { action: 'defend', rolls: [0, 0], now: '2026-11-17T00:00:00.000Z' }).battle;
  assert.equal(battle.status, 'active');
  assert.equal(battle.enemyIntent.type, 'exposed');
  assert.equal(validateStoryBattle(battle), true);
});

test('historia v2: inspección es gratuita y no concede observar ni romper por consultar', () => {
  const battle = create('II05');
  const before = structuredClone(battle);
  const first = storyBattleView(battle), second = storyBattleView(battle);
  assert.deepEqual(first, second);
  assert.deepEqual(battle, before);
  assert.equal(battle.mechanics.revealed, false);
  assert.equal(battle.actions.length, 0);
});

test('historia v2: el replay rechaza manipular barreras, revelados y acciones especiales', () => {
  for (const encounterId of ['I05', 'II05']) {
    const battle = act(create(encounterId), encounterId === 'I05' ? 'break' : 'observe');
    const changed = structuredClone(battle);
    changed.mechanics[encounterId === 'I05' ? 'barrier' : 'revealed'] = encounterId === 'I05' ? 100 : false;
    assert.equal(validateStoryBattle(changed), false);
    const fakeEvent = structuredClone(battle);
    fakeEvent.actions[0].action = encounterId === 'I05' ? 'observe' : 'break';
    assert.equal(validateStoryBattle(fakeEvent), false);
  }
});

test('historia v2: valida versión, contexto de mecánica y rolls incluso detrás de señuelos', () => {
  code(() => create('I05', 'panda_guerrero', 1), 'STORY_ENCOUNTER_NOT_FOUND');
  code(() => storyEncounter('I05', 5), 'INVALID_STORY_COMBAT_VERSION');
  code(() => act(create('I05'), 'observe'), 'STORY_NOT_OBSERVABLE');
  code(() => act(create('II05'), 'break'), 'STORY_NOT_BREAKABLE');
  code(() => act(create('II05'), 'skill', null, [100, 0]), 'INVALID_RANDOM_ROLL');
  code(() => act(create('I03', 'panda_guerrero', 1), 'observe'), 'INVALID_STORY_ACTION');
  code(() => act(act(create('I05'), 'break'), 'break'), 'STORY_NOT_BREAKABLE');
});


test('historia v2: I03 permite el recorrido de XP reducido a nivel tres sin cambiar la descarga histórica', () => {
  const old = create('I03', 'mago_carmesi', 1), current = create('I03', 'mago_carmesi', 2);
  assert.equal(old.players[1].units[0].attacks[1].power, 75);
  assert.equal(current.players[1].units[0].attacks[1].power, 74);
  for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
    assert.equal(simulateStory({ encounterId: 'I03', characterId, level: 3, policy: 'tactical', rolls: [0, 0] }).status, 'won');
    assert.equal(simulateStory({ encounterId: 'I03', characterId, level: 3, policy: 'attack', rolls: [0, 0] }).status, 'lost');
  }
});
