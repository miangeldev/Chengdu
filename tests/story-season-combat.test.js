import test from 'node:test';
import assert from 'node:assert/strict';
import { createStoryBattle, resolveStoryAction, replayStoryBattle, storyBattleView, validateStoryBattle, storyCombatPolicy } from '../game/story/combat.js';
import { createStoryBattle as legacyCreate, resolveStoryAction as legacyResolve } from '../game/story/combatV2.js';
import { storyBalanceSnapshot, simulateStorySeason, storySeasonTacticalAction } from '../scripts/simulate-story-balance.js';

const NOW = '2026-10-18T00:00:00.000Z';
const bosses = ['I03', 'I05', 'II05', 'III05', 'IV05', 'V05'];
const levels = { I03: 3, I05: 4, II05: 5, III05: 6, IV05: 7, V05: 8 };
function create(encounterId, { characterId = 'panda_guerrero', level = levels[encounterId] ?? 7, size = 1, defeats = null, context = {} } = {}) {
  const required = storyCombatPolicy(encounterId).requiredDefeats;
  return createStoryBattle({ id: 'season-test', encounterId, version: 3, now: NOW, context,
    units: Array.from({ length: size }, (_, index) => storyBalanceSnapshot(characterId, level, false, `:${index}`)),
    learning: { defeats: defeats ?? required, required } });
}
const act = (battle, action, choice = null, rolls = [0, 0]) => resolveStoryAction(battle, { action, choice, rolls, now: NOW }).battle;
const errorCode = (work, code) => assert.throws(work, error => error.code === code);

for (const version of [1, 2]) test(`temporada: el wrapper conserva íntegra la historia de combate v${version}`, () => {
  const request = { id: 'legacy-season', encounterId: version === 1 ? 'I03' : 'I05', version, now: NOW, units: [storyBalanceSnapshot('panda_guerrero', 6)] };
  let expected = legacyCreate(request), actual = createStoryBattle(request);
  assert.deepEqual(actual, expected);
  for (const action of version === 1 ? ['attack', 'defend', 'skill'] : ['break', 'skill', 'defend', 'attack']) {
    const args = { action, choice: action === 'attack' ? '1' : null, rolls: [0, 0], now: NOW };
    expected = legacyResolve(expected, args).battle;
    actual = resolveStoryAction(actual, args).battle;
    assert.deepEqual(actual, expected);
  }
  assert.deepEqual(replayStoryBattle(actual), actual);
});

test('temporada: los mínimos obligatorios son explícitos, finitos y no permiten una victoria anticipada', () => {
  assert.deepEqual(bosses.map(id => storyCombatPolicy(id).requiredDefeats), [1, 1, 2, 2, 2, 4]);
  for (const encounterId of bosses) {
    const required = storyCombatPolicy(encounterId).requiredDefeats;
    for (let defeats = 0; defeats < required; defeats++) {
      const result = simulateStorySeason({ encounterId, characterId: 'panda_guerrero', level: levels[encounterId], size: 3, defeats, rolls: [0, 0] });
      assert.equal(result.status, 'lost', encounterId);
      assert.equal(result.battle.finishReason, 'knockout');
      assert.ok(result.turns <= 20);
      assert.equal(result.battle.learning.remaining, required - defeats);
      assert.equal(result.battle.learning.scouting, true);
      assert.ok(result.battle.players[0].units.every(unit => unit.hp === 0));
      assert.equal(validateStoryBattle(result.battle), true);
    }
    const available = create(encounterId, { defeats: required });
    assert.equal(available.learning.scouting, false);
  }
});

test('temporada: retirarse conserva vida y no acredita una derrota de reconocimiento', () => {
  const before = create('V05', { defeats: 0, size: 3 });
  assert.match(storyBattleView(before).enemy.mechanics, /Reconocimiento obligatorio.*4 derrotas/);
  const battle = act(before, 'surrender');
  assert.equal(battle.status, 'lost');
  assert.equal(battle.finishReason, 'surrender');
  assert.equal(battle.learning.defeats, 0);
  assert.equal(battle.learning.remaining, 4);
  assert.ok(battle.players[0].units.every(unit => unit.hp === unit.stats.hp));
  assert.match(battle.actions[0].events.at(-1).text, /no cuentan/);
});

test('temporada: ni un golpe perfecto desmesurado evita el reconocimiento obligatorio', () => {
  const unit = storyBalanceSnapshot('panda_guerrero', 20, true);
  unit.stats.attack = 100000;
  const battle = createStoryBattle({ id: 'strong-scout', encounterId: 'V05', version: 3, now: NOW, units: [unit],
    learning: { defeats: 0, required: 4 }, context: { helpedEchoes: true } });
  const defeated = act(battle, 'attack', '1');
  assert.equal(defeated.status, 'lost');
  assert.equal(defeated.finishReason, 'knockout');
  assert.ok(defeated.actions[0].events.some(event => event.type === 'scouting_defeat'));
  assert.equal(validateStoryBattle(defeated), true);
});

for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) test(`temporada: ${characterId} puede vencer con táctica, solo o en equipo, tras cumplir los mínimos`, () => {
  for (const encounterId of bosses) for (const size of [1, 3]) {
    const result = simulateStorySeason({ encounterId, characterId, level: levels[encounterId], size, rolls: [0, 0] });
    assert.equal(result.status, 'won', `${encounterId} / ${size}`);
    assert.equal(result.battle.learning.scouting, false);
    assert.equal(validateStoryBattle(result.battle), true);
    const naive = simulateStorySeason({ encounterId, characterId, level: levels[encounterId], size, policy: 'attack', rolls: [0, 0] });
    assert.equal(naive.status, 'lost', `Repeated attacks must lose: ${encounterId} / ${size}`);
  }
});

test('temporada: la carga y la apertura conservan una ofensiva enemiga real cada turno', () => {
  let battle = create('I05');
  for (const action of ['break', 'skill', 'defend', 'support']) {
    const previousLength = battle.core.actions.length;
    battle = act(battle, action);
    assert.equal(battle.core.actions.length, previousLength + 2);
    const enemy = battle.core.actions.at(-1);
    assert.equal(enemy.actorId, 'echo');
    assert.equal(enemy.commandType, 'attack');
    assert.equal(enemy.attackId, 'story_pressure');
    assert.equal(enemy.hit, true);
  }
  assert.equal(battle.pressure.everyTurn, true);
  assert.equal(validateStoryBattle(battle), true);
});

test('temporada: tres ataques seguidos provocan una represalia anunciada, también contra tres tanques', () => {
  let battle = create('III05', { size: 3 });
  assert.match(storyBattleView(battle).enemy.mechanics, /Ofensiva seguida: 0\/3/);
  battle = act(battle, 'attack'); battle = act(battle, 'attack'); battle = act(battle, 'attack');
  assert.equal(battle.mechanics.recklessStreak, 3);
  assert.ok(battle.actions.at(-1).events.some(event => event.type === 'reckless_counter'));
  battle = act(battle, 'defend');
  assert.equal(battle.mechanics.recklessStreak, 0);
});

test('temporada: los tres reflejos enseñan daño, defensa y apoyo con recuperación limitada', () => {
  let battle = create('III03');
  battle = act(battle, 'support');
  assert.equal(battle.mechanics.supportCooldown, 3);
  assert.equal(battle.mechanics.lessons.support, true);
  errorCode(() => act(battle, 'support'), 'STORY_ACTION_COOLDOWN');
  battle = act(battle, 'defend');
  assert.equal(battle.mechanics.lessons.defense, true);
  battle = act(battle, 'attack');
  assert.equal(battle.mechanics.lessons.damage, true);
  for (let turn = 0; turn < 50 && battle.status === 'active'; turn++) {
    battle = resolveStoryAction(battle, { ...storySeasonTacticalAction(battle), rolls: [0, 0], now: NOW }).battle;
  }
  assert.equal(battle.status, 'won');
  assert.deepEqual(battle.mechanics.lessons, { damage: true, defense: true, support: true });
  assert.equal(validateStoryBattle(battle), true);
});

test('temporada: el Centinela copia efectos reales sin heredar un cooldown que bloquee la IA', () => {
  let battle = create('III05', { characterId: 'mago_carmesi' });
  battle = act(battle, 'skill');
  assert.equal(battle.enemyIntent.type, 'reflect');
  assert.equal(battle.mechanics.copiedSkill.id, 'mago_carmesi_2');
  battle = act(battle, 'defend');
  assert.ok(battle.actions.at(-1).events.some(event => event.text?.includes('Réplica de Llamarada')));
  assert.equal(battle.mechanics.copiedSkill, null);
  assert.equal(battle.core.players[1].units[0].cooldowns.story_pressure, undefined);
  assert.equal(validateStoryBattle(battle), true);
});

for (const encounterId of ['IV02A', 'IV02B', 'IV02C']) test(`temporada: ${encounterId} permite proteger al aliado sin clanes ni terceros`, () => {
  let battle = create(encounterId);
  battle = act(battle, 'attack'); battle = act(battle, 'defend');
  assert.equal(battle.mechanics.npcSafety, 76);
  battle = act(battle, 'protect');
  assert.equal(battle.mechanics.npcSafety, 86);
  assert.ok(battle.actions.at(-1).events.some(event => event.type === 'protect_counter'));
  assert.equal(validateStoryBattle(battle), true);
});

test('temporada: purificar reduce la tensión y cancela el exceso de la Campana durante su descarga', () => {
  let battle = create('IV05');
  battle = act(battle, 'skill'); battle = act(battle, 'attack');
  assert.equal(battle.mechanics.tension, 5);
  assert.equal(battle.enemyIntent.type, 'tension');
  battle = act(battle, 'purify');
  assert.equal(battle.mechanics.tension, 2);
  assert.equal(battle.mechanics.purifyCooldown, 3);
  assert.equal(battle.core.actions.at(-1).attackId, 'story_pressure');
  assert.equal(battle.core.players[1].units[0].attacks[0].power, 6);
  errorCode(() => act(battle, 'purify'), 'STORY_ACTION_COOLDOWN');
  assert.equal(validateStoryBattle(battle), true);
});

test('temporada: el Archivista pasa por Memoria, Control y Elección con sello visible y protección táctica', () => {
  let battle = create('V05', { characterId: 'mago_carmesi' });
  let sealed = false, protectedTeam = false;
  for (let turn = 0; turn < 50 && battle.status === 'active'; turn++) {
    if (battle.mechanics.sealTurns > 0) {
      sealed = true;
      const view = storyBattleView(battle);
      assert.equal(view.availableActions.includes('skill'), false);
      assert.equal(view.team.find(unit => unit.active).attacks[1].sealed, true);
      errorCode(() => act(battle, 'skill'), 'STORY_SKILL_SEALED');
    }
    const request = storySeasonTacticalAction(battle);
    if (request.action === 'protect') protectedTeam = true;
    battle = resolveStoryAction(battle, { ...request, rolls: [0, 0], now: NOW }).battle;
  }
  assert.equal(battle.status, 'won');
  assert.equal(sealed, true);
  assert.equal(protectedTeam, true);
  assert.equal(battle.mechanics.finalPhase, 'choice');
  assert.equal(validateStoryBattle(battle), true);
});

test('temporada: las pruebas opcionales no vuelven a imponer derrotas y las decisiones ayudan al final', () => {
  for (const id of ['TRIAL1', 'TRIAL2', 'TRIAL3']) assert.equal(create(id).learning.required, 0);
  assert.ok(create('TRIAL1').mechanics.barrier > 0);
  let copied = act(create('TRIAL2'), 'skill');
  assert.equal(copied.enemyIntent.type, 'reflect');
  assert.equal(copied.mechanics.copiedSkill.id, 'panda_guerrero_2');
  assert.equal(storyBattleView(copied).availableActions.includes('purify'), false);
  const alone = create('V05'), helped = create('V05', { context: { huanSupport: true, helpedEchoes: true } });
  assert.equal(alone.mechanics.revealed, false);
  assert.equal(helped.mechanics.revealed, true);
  assert.equal(storyBattleView(helped).availableActions.includes('observe'), false);
  assert.equal(validateStoryBattle(helped), true);
});

function accessibleCampaignEncounter(encounterId, level, verify = () => {}) {
  for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) for (const size of [1, 3]) {
    const result = simulateStorySeason({ encounterId, characterId, level, size, rolls: [30, 30] });
    const label = `${encounterId}: ${characterId}, Nv.${level}, ${size} unidad(es)`;
    assert.equal(result.status, 'won', label);
    assert.equal(result.battle.learning.required, 0, label);
    assert.equal(result.battle.learning.scouting, false, label);
    assert.ok(result.turns <= 50, label);
    assert.ok(result.battle.unitSnapshots.every(unit => unit.level === level && unit.evolution === null), label);
    assert.equal(validateStoryBattle(result.battle), true, label);
    verify(result.battle, label);
  }
}

test('temporada: Huan y los tres reflejos son accesibles al nivel anterior al premio, sin evolucionar', () => {
  accessibleCampaignEncounter('III01', 5);
  accessibleCampaignEncounter('III03', 6, (battle, label) => {
    assert.deepEqual(battle.mechanics.lessons, { damage: true, defense: true, support: true }, label);
    const actions = battle.actions.map(action => action.action);
    assert.ok(actions.includes('defend') && actions.includes('support'), label);
  });
});

test('temporada: la protección de Tao, Mei y Yun admite los tres starters al Nv.6, solos o con reservas', () => {
  for (const encounterId of ['IV02A', 'IV02B', 'IV02C']) {
    accessibleCampaignEncounter(encounterId, 6, (battle, label) => {
      assert.ok(battle.mechanics.npcSafety > 0, label);
      assert.ok(battle.actions.some(action => action.action === 'protect'), label);
      assert.equal(battle.finishReason, 'knockout', label);
    });
  }
});

test('temporada: ecos, juicio y las tres pruebas cierran combates sin exigir otra derrota de reconocimiento', () => {
  for (const [encounterId, level] of Object.entries({ V02: 7, V04: 8, TRIAL1: 9, TRIAL2: 9, TRIAL3: 9 })) {
    accessibleCampaignEncounter(encounterId, level);
  }
  // Random misses can still cause a legitimate loss; they must never leave a
  // permanently active battle or make an available starter unable to finish.
  for (const characterId of ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
    const attempts = Array.from({ length: 4 }, (_, index) => simulateStorySeason({
      encounterId: 'TRIAL3', characterId, level: 9, size: 3, seed: index + 1 }));
    assert.ok(attempts.some(attempt => attempt.status === 'won'), characterId);
    assert.ok(attempts.every(attempt => ['won', 'lost'].includes(attempt.status) && attempt.turns <= 50), characterId);
  }
});

test('temporada: progreso, presión, aprendizaje y contexto quedan congelados en el replay', () => {
  const original = act(create('V05'), 'observe');
  assert.deepEqual(replayStoryBattle(original), original);
  for (const mutate of [
    battle => { battle.learning.remaining = 99; },
    battle => { battle.pressure.everyTurn = false; },
    battle => { battle.mechanics.sealTurns = 5; },
    battle => { battle.context.helpedEchoes = true; },
    battle => { battle.actions[0].action = 'purify'; }
  ]) {
    const changed = structuredClone(original); mutate(changed); assert.equal(validateStoryBattle(changed), false);
  }
  errorCode(() => createStoryBattle({ id: 'bad-learning', encounterId: 'V05', version: 3, now: NOW,
    units: [storyBalanceSnapshot('panda_guerrero', 8)], learning: { defeats: 0, required: 0 } }), 'INVALID_STORY_LEARNING');
  errorCode(() => create('V05', { context: { freeWin: true } }), 'INVALID_STORY_CONTEXT');
});
