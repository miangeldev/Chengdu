import test from 'node:test';
import assert from 'node:assert/strict';
import { activeUnit } from '../game/battle/advancedEngine.js';
import { createStoryBattle, replayStoryBattle, resolveStoryAction, storyBattleView, validateStoryBattle } from '../game/story/combat.js';
import { simulateStory, storyBalanceSnapshot, storyTacticalAction } from '../scripts/simulate-story-balance.js';

const NOW = '2026-10-17T00:00:00.000Z';
const create = (characterId = 'panda_guerrero', encounterId = 'I03', level = 4) => createStoryBattle({ id: 'STORY-test', encounterId,
  units: [storyBalanceSnapshot(characterId, level)], now: NOW });
const act = (battle, action, choice = null, rolls = [0, 0], now = NOW) => resolveStoryAction(battle, { action, choice, rolls, now }).battle;
const throwsCode = (work, code) => assert.throws(work, error => error.code === code);

for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
  test(`historia: ${characterId} gana por táctica sin evolución y puede perder tres intentos reales`, () => {
    const tactical = simulateStory({ characterId, level: 4, policy: 'tactical', rolls: [0, 0] });
    assert.equal(tactical.status, 'won');
    assert.equal(validateStoryBattle(tactical.battle), true);
    for (let attempt = 0; attempt < 3; attempt++) {
      const failed = simulateStory({ characterId, level: 4, policy: 'attack', rolls: [0, 0], seed: attempt });
      assert.equal(failed.status, 'lost');
      assert.equal(failed.battle.finishReason, 'knockout');
      assert.ok(failed.battle.actions.at(-1).events.some(event => event.type === 'lost' && event.text.includes('defiende')));
    }
    assert.equal(simulateStory({ characterId, level: 4, policy: 'tactical', rolls: [0, 0] }).status, 'won');
  });
}

test('historia: el ataque cargado se anuncia y defender reduce el daño sin crear escudo permanente', () => {
  let battle = act(create('mago_carmesi'), 'attack');
  assert.equal(battle.enemyIntent.type, 'charge');
  battle = act(battle, 'attack');
  assert.equal(battle.enemyIntent.type, 'unleash');
  assert.match(battle.enemyIntent.text, /Defiende ahora/);
  const reckless = act(battle, 'attack');
  const defended = act(battle, 'defend');
  const damage = defended.actions.at(-1).events.find(event => event.type === 'guarded').amount;
  assert.equal(reckless.status, 'lost');
  assert.equal(defended.status, 'active');
  assert.ok(damage > 0 && damage < 30);
  assert.equal(activeUnit(defended.players[0]).effects.some(effect => effect.type === 'shield'), false);
  assert.equal(defended.enemyIntent.type, 'exposed');
  const attackWhenExposed = act(defended, 'attack');
  assert.ok(attackWhenExposed.actions.at(-1).events.some(event => event.type === 'exposed'));
  assert.equal(activeUnit(attackWhenExposed.players[1]).stats.defense, 20);
  assert.equal(validateStoryBattle(attackWhenExposed), true);
});

test('historia: los ataques conservan quemadura, habilidades de entrada y cooldown del motor PvP', () => {
  const battle = act(create('mago_carmesi'), 'skill');
  const mage = activeUnit(battle.players[0]);
  assert.ok(battle.core.openingEvents.some(event => event.type === 'ability' && event.unitId === mage.id));
  assert.equal(mage.cooldowns[mage.attacks[1].id], 2);
  assert.ok(battle.actions[0].events.some(event => event.type === 'effect_tick' && event.effect === 'burn'));
  throwsCode(() => act(battle, 'skill'), 'ATTACK_COOLDOWN');
  const defended = act(battle, 'defend');
  assert.equal(activeUnit(defended.players[0]).cooldowns[mage.attacks[1].id], 1);
});

test('historia: el tutorial protege al jugador y pide ataque, defensa y habilidad antes de ganar', () => {
  let battle = create('mago_carmesi', 'P03', 2);
  for (let turn = 0; turn < 70; turn++) battle = act(battle, 'attack');
  assert.equal(battle.status, 'active');
  assert.equal(battle.tutorial.attack, true);
  assert.equal(battle.tutorial.defend, false);
  assert.equal(activeUnit(battle.players[1]).hp, 1);
  assert.ok(battle.actions.some(action => action.events.some(event => event.type === 'tutorial_guidance')));
  assert.ok(battle.actions.some(action => action.events.some(event => event.type === 'tutorial_rescue')));
  battle = act(battle, 'defend');
  battle = act(battle, 'skill');
  assert.equal(battle.status, 'won');
  assert.deepEqual(battle.tutorial, { attack: true, defend: true, skill: true });
  assert.equal(validateStoryBattle(battle), true);
});

test('historia: aprender las tres acciones permite terminar el tutorial con cada starter', () => {
  for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
    const result = simulateStory({ characterId, level: 2, encounterId: 'P03', rolls: [0, 0] });
    assert.equal(result.status, 'won');
    assert.deepEqual(result.battle.tutorial, { attack: true, defend: true, skill: true });
  }
});

test('historia: los turnos guardados reanudan semanas después con snapshots históricos', () => {
  const battle = create('lobo_sombrio');
  const before = structuredClone(battle);
  const resumed = act(battle, 'attack', '1', [0, 0], '2026-11-17T00:00:00.000Z');
  assert.equal(resumed.status, 'active');
  assert.deepEqual(battle, before);
  assert.deepEqual(resumed.unitSnapshots, before.unitSnapshots);
  assert.deepEqual(replayStoryBattle(resumed), resumed);
});

test('historia: el cambio y la derrota automática respetan hasta tres compañeros', () => {
  const units = ['mago_carmesi', 'panda_guerrero', 'lobo_sombrio'].map(id => storyBalanceSnapshot(id, 4));
  let battle = createStoryBattle({ id: 'STORY-party', encounterId: 'I03', units, now: NOW });
  battle = act(battle, 'switch', '2');
  assert.equal(battle.players[0].activeIndex, 1);
  assert.ok(battle.actions.at(-1).events.some(event => event.type === 'switch'));
  throwsCode(() => act(battle, 'switch', '2'), 'UNIT_ALREADY_ACTIVE');
  throwsCode(() => act(battle, 'switch', '4'), 'INVALID_TEAM_SLOT');
  for (let turn = 0; turn < 20 && battle.status === 'active'; turn++) battle = act(battle, 'defend');
  assert.ok(battle.actions.some(action => action.events.some(event => event.type === 'auto_switch')));
  assert.equal(validateStoryBattle(battle), true);
});

test('historia: rendirse no ejecuta otra ofensiva y permite liberar equipo en servicio', () => {
  const battle = act(create(), 'surrender');
  assert.equal(battle.status, 'lost');
  assert.equal(battle.finishReason, 'surrender');
  assert.equal(battle.core.actions.length, 1);
  assert.equal(battle.finishedAt, NOW);
  assert.equal(validateStoryBattle(battle), true);
  throwsCode(() => act(battle, 'attack'), 'STORY_BATTLE_NOT_ACTIVE');
});

test('historia: las formas evolucionadas son snapshots y no condicionan el acceso', () => {
  const evolved = storyBalanceSnapshot('mago_carmesi', 5, true);
  const battle = createStoryBattle({ id: 'STORY-evolution', encounterId: 'I03', units: [evolved], now: NOW });
  assert.deepEqual(battle.unitSnapshots[0].evolution, evolved.evolution);
  assert.equal(activeUnit(battle.players[0]).stats.hp, 112);
  assert.equal(validateStoryBattle(battle), true);
  assert.equal(create('mago_carmesi', 'I03', 1).status, 'active');
});

test('historia: el replay rechaza HP, señales, eventos, snapshots y rolls manipulados', () => {
  const original = act(create(), 'attack');
  const mutations = [
    battle => { battle.players[0].units[0].hp += 1; },
    battle => { battle.core.players[1].units[0].hp += 1; },
    battle => { battle.enemyIntent.type = 'exposed'; },
    battle => { battle.actions[0].events[0].text = 'Premio inventado'; },
    battle => { battle.actions[0].rolls = [100, 0]; },
    battle => { battle.unitSnapshots[0].stats.attack += 500; }
  ];
  for (const mutate of mutations) {
    const changed = structuredClone(original);
    mutate(changed);
    assert.equal(validateStoryBattle(changed), false);
  }
});

test('historia: inspección es una proyección gratuita con ataques, estados y telegráficos', () => {
  let battle = act(create(), 'skill');
  battle = act(battle, 'attack');
  const before = structuredClone(battle);
  const view = storyBattleView(battle);
  assert.deepEqual(battle, before);
  assert.equal(view.round, 3);
  assert.match(view.enemy.intent, /DESCARGA/);
  assert.equal(view.team[0].active, true);
  assert.equal(view.team[0].attacks[1].cooldown, 1);
  assert.equal(typeof view.lastEvents[0], 'string');
  assert.equal(JSON.stringify(view).includes('receiptId'), false);
});

test('historia: entrada inválida no permite crear aliados o acciones fuera de sus perfiles', () => {
  throwsCode(() => createStoryBattle({ id: 'x', encounterId: 'UNKNOWN', units: [storyBalanceSnapshot('mago_carmesi')], now: NOW }), 'STORY_ENCOUNTER_NOT_FOUND');
  throwsCode(() => createStoryBattle({ id: 'x', encounterId: 'I03', units: [], now: NOW }), 'INVALID_STORY_TEAM');
  const unit = storyBalanceSnapshot('panda_guerrero');
  throwsCode(() => createStoryBattle({ id: 'x', encounterId: 'I03', units: [unit, unit], now: NOW }), 'INVALID_STORY_TEAM');
  const battle = create();
  throwsCode(() => act(battle, 'dance'), 'INVALID_STORY_ACTION');
  throwsCode(() => act(battle, 'attack', '3'), 'INVALID_ATTACK');
  throwsCode(() => act(battle, 'attack', '1', [-1, 0]), 'INVALID_RANDOM_ROLL');
  throwsCode(() => act(battle, 'attack', '1', [0]), 'INVALID_RANDOM_ROLL');
  throwsCode(() => act(battle, 'attack', '1', [0, 0], '2026-10-16T00:00:00.000Z'), 'INVALID_TIMESTAMP');
});
