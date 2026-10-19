import test from 'node:test';
import assert from 'node:assert/strict';
import { renderStory } from '../interfaces/whatsapp/storyFormat.js';
import { commandText } from '../interfaces/whatsapp/format.js';
import { createStoryBattle, resolveStoryAction, storyBattleView, validateStoryBattle } from '../game/story/combat.js';
import { storyBalanceSnapshot } from '../scripts/simulate-story-balance.js';

const cmd = (name, args) => commandText('!', name, args);
const now = '2026-10-18T00:00:00.000Z';
const state = battle => ({
  campaign: { missionCount: 32, contentVersion: 3 },
  progress: { contentVersion: 3, status: 'playing', missionIndex: 2, stage: 'battle' },
  mission: { code: 'P-03', title: 'Una sombra en la plaza' }, team: [], battle
});

test('saved tutorial messages never announce an enemy knockout while its current HP is positive', () => {
  const battle = {
    status: 'active', encounterId: 'P03', round: 5,
    enemy: { name: 'Eco desorientado', hp: 1, maxHp: 110, intent: 'Puedes vencer atacando; defender es opcional.' },
    team: [{ slot: 1, characterId: 'bruja_lunar', name: 'Bruja Lunar', hp: 106, maxHp: 110, active: true,
      attacks: [{ choice: '1', name: 'Pulso Lunar', power: 25, ready: true }] }],
    lastEvents: ['Bruja Lunar usó Pulso Lunar: 1 de daño.', 'Eco desorientado quedó fuera de combate.',
      'Eco desorientado usó Roce de tinta: 1 de daño.']
  };
  const before = structuredClone(battle);
  const text = renderStory(state(battle), cmd);
  assert.match(text, /Pulso Lunar: 1 de daño.*Roce de tinta: 1 de daño/s);
  assert.match(text, /Eco desorientado.*1\/110 HP/s);
  assert.doesNotMatch(text, /quedó fuera de combate/);
  assert.deepEqual(battle, before, 'Rendering never rewrites historical combat events');
});

test('a real tutorial victory remains a victory and offers no further combat actions', () => {
  let battle = createStoryBattle({ id: 'tutorial-interface', encounterId: 'P03', version: 4, now,
    units: [storyBalanceSnapshot('bruja_lunar', 20)] });
  const opening = renderStory(state(storyBattleView(battle)), cmd);
  assert.match(opening, /opcional/i);
  assert.doesNotMatch(opening, /Aprendizaje del jefe|todavía no puedes vencer/);
  for (let turns = 0; turns < 10 && battle.status === 'active'; turns++) {
    battle = resolveStoryAction(battle, { action: 'attack', choice: '1', rolls: [0, 0], now }).battle;
  }
  assert.equal(battle.status, 'won', 'A strong companion can defeat the tutorial Eco by attacking');
  assert.equal(battle.tutorial.defend, false);
  assert.equal(battle.tutorial.skill, false);
  assert.equal(validateStoryBattle(battle), true);
  const view = storyBattleView(battle);
  assert.equal(view.enemy.hp, 0);
  const text = renderStory({ ...state(view), progress: { ...state(view).progress, missionIndex: 3, stage: 'ready' },
    mission: { code: 'P-04', title: 'La carta en blanco', scene: ['Bao recoge la tinta que dejó el Eco.'] } }, cmd);
  assert.match(text, /¡Encuentro superado!/);
  assert.doesNotMatch(text, /Tu turno|aún falta|Aprendizaje del jefe|!ctuhistoria atacar|!ctuhistoria defender|!ctuhistoria habilidad/);
});

test('a genuine knockout event is displayed when the enemy has no HP remaining', () => {
  const battle = { status: 'won', enemy: { name: 'Eco desorientado', hp: 0, maxHp: 110 },
    lastEvents: ['Eco desorientado quedó fuera de combate.'], team: [] };
  assert.match(renderStory(state(battle), cmd), /Eco desorientado quedó fuera de combate.*¡Encuentro superado!/s);
});

for (const [reason, expected] of [['protection', /El aliado tuvo que ser evacuado/], ['turn_limit', /El enemigo resistió hasta el límite de turnos/]]) {
  test(`a ${reason} loss does not claim living companions were knocked out`, () => {
    const battle = { status: 'lost', finishReason: reason, encounterId: 'IV02A',
      enemy: { name: 'Eco de la Plaza', hp: 80, maxHp: 150 }, lastEvents: [],
      team: [{ slot: 1, characterId: 'panda_guerrero', name: 'Panda Guerrero', hp: 100, maxHp: 120, active: true, attacks: [] }] };
    const text = renderStory(state(battle), cmd);
    assert.match(text, expected);
    assert.doesNotMatch(text, /expedición cayó|fuera de combate/);
    assert.match(text, /100\/120 HP/);
  });
}
