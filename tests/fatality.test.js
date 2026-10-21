import test from 'node:test';
import assert from 'node:assert/strict';
import { attachFatality, fatalityAttack, fatalityEnabled, fatalityProfile, validateFatality, visibleBattleAttacks } from '../game/battle/fatality.js';
import { initializeAdvancedBattle, replayAdvancedBattle, resolveAdvancedAction, calculateAdvancedDamage, activeUnit } from '../game/battle/advancedEngine.js';
import { resolveAttack } from '../game/battle/engine.js';
import { createStoryBattle, resolveStoryAction, replayStoryBattle, storyBattleView } from '../game/story/combat.js';
import { seedSpiritsAttacks, seedSpiritsCharacters } from '../game/content/spiritsCatalog.js';
import { advancedAttack } from '../game/battle/combatContent.js';

const before = '2026-10-25T05:59:59.999Z', now = '2026-10-25T06:00:00.000Z';
const makeUnit = (characterId = 'guardian_mil_mascaras', id = 'unit') => {
  const character = seedSpiritsCharacters().find(character => character.id === characterId);
  return { id, characterId, characterName: character.name, level: 1, stats: structuredClone(character.baseStats),
    hp: character.baseStats.hp, attacks: seedSpiritsAttacks().filter(attack => character.attackIds.includes(attack.id)).map(advancedAttack),
    profileVersion: 1, element: character.combat.element, ability: structuredClone(character.combat.ability) };
};
const open = (first, second = [makeUnit('zorro_llamas_errantes', 'enemy')], at = now) => initializeAdvancedBattle({ id: 'BTL-fatality-test',
  rulesVersion: 2, acceptedAt: at, createdAt: at, players: [
    { userId: 'a', name: 'A', units: first, activeIndex: 0 }, { userId: 'b', name: 'B', units: second, activeIndex: 0 } ] });
const act = (battle, choice = '1', changes = {}) => resolveAdvancedAction(battle, { userId: battle.turnUserId,
  type: 'attack', choice, now: new Date(Date.parse(battle.updatedAt) + 1000).toISOString(), roll: 0, ...changes });

test('Fatality activates at the exact debut boundary and only the two exclusive characters consume an opening roll', () => {
  let draws = 0;
  const roll = () => { draws++; return 0; };
  assert.equal(fatalityEnabled(before), false);
  assert.equal(fatalityEnabled(now), true);
  assert.equal(fatalityEnabled('2027-01-01T00:00:00.000Z'), true);
  assert.equal(attachFatality(makeUnit(), before, roll).fatality, undefined);
  assert.equal(attachFatality({ ...makeUnit(), characterId: 'panda_guerrero' }, now, roll).fatality, undefined);
  assert.equal(draws, 0);
  assert.equal(attachFatality(makeUnit(), now, roll).fatality.unlocked, true);
  assert.equal(attachFatality(makeUnit('zorro_llamas_errantes'), now, roll).fatality.unlocked, true);
  assert.equal(draws, 2);
  assert.equal(fatalityProfile('__proto__'), null);
});

test('all 100 uniform opening outcomes unlock exactly 10, including 9 and excluding 10', () => {
  const outcomes = Array.from({ length: 100 }, (_, roll) => attachFatality(makeUnit(), now, () => roll));
  assert.equal(outcomes.filter(unit => unit.fatality.unlocked).length, 10);
  assert.equal(outcomes[9].fatality.unlocked, true);
  assert.equal(outcomes[10].fatality.unlocked, false);
  for (const unit of outcomes) assert.equal(validateFatality(unit, now), true);
  for (const value of [-1, 100, 1.5, null, NaN]) assert.throws(() => attachFatality(makeUnit(), now, () => value), { code: 'INVALID_RANDOM_ROLL' });
});

test('a battle opened before release gains neither Fatality nor rotating masks when its turns cross the release boundary', () => {
  let battle = open([attachFatality(makeUnit(), before, () => 0)], undefined, before);
  assert.equal(activeUnit(battle.players[0]).mask, undefined);
  assert.equal(activeUnit(battle.players[0]).fatality, undefined);
  const result = act(battle);
  assert.equal(result.action.events.some(event => event.type === 'mask_changed'), false);
  assert.equal(activeUnit(result.battle.players[0]).mask, undefined);
  assert.deepEqual(replayAdvancedBattle(result.battle), result.battle);
});

test('opening rolls, actor, clock, unlocked flag and exact attack definition cannot be forged', () => {
  const unit = attachFatality(makeUnit(), now, () => 9);
  for (const mutate of [u => { u.fatality.roll = 10; }, u => { u.fatality.attack.power = 10000; },
    u => { u.characterId = 'panda_guerrero'; }, u => { u.fatality.extra = true; }, u => { u.fatality.used = 'yes'; }]) {
    const forged = structuredClone(unit); mutate(forged); assert.equal(validateFatality(forged, now), false);
  }
  assert.equal(validateFatality(unit, before), false);
  assert.deepEqual(unit.attacks.length, 2);
  assert.deepEqual(visibleBattleAttacks(unit).map(attack => attack.slot), [1, 2, 3]);
  const unavailable = attachFatality(makeUnit(), now, () => 10);
  assert.deepEqual(visibleBattleAttacks(unavailable).map(attack => attack.slot), [1, 2]);
  assert.throws(() => fatalityAttack(unavailable, '3'), { code: 'FATALITY_NOT_AVAILABLE' });
});

test('advanced Fatality consumes a real turn and one use, respects shields, and replays exactly after switching', () => {
  const first = attachFatality(makeUnit(), now, () => 0), reserve = attachFatality(makeUnit('zorro_llamas_errantes', 'reserve'), now, () => 99);
  const target = makeUnit('guardian_mil_mascaras', 'enemy');
  target.stats.hp = 600; target.stats.speed = 1;
  let battle = open([first, reserve], [target]);
  assert.equal(battle.openingEvents.filter(event => event.type === 'fatality_ready').length, 1);
  const result = act(battle, '3'); battle = result.battle;
  assert.equal(result.action.attackId, first.fatality.attack.id);
  assert.equal(result.action.events.some(event => event.type === 'fatality_used'), true);
  assert.ok(result.action.events.some(event => event.type === 'shield_absorbed'));
  assert.ok(result.action.damage > 0 && result.action.damage < target.stats.hp);
  assert.equal(battle.players[0].units[0].fatality.used, true);
  battle = act(battle).battle;
  assert.throws(() => act(battle, '3'), { code: 'FATALITY_ALREADY_USED' });
  battle = act(battle, '2', { type: 'switch', roll: null }).battle;
  battle = act(battle).battle;
  battle = act(battle, '1', { type: 'switch', roll: null }).battle;
  assert.equal(battle.players[0].units[0].fatality.used, true);
  assert.equal(visibleBattleAttacks(battle.players[0].units[0]).length, 2);
  assert.deepEqual(replayAdvancedBattle(battle), battle);
});

test('a miss consumes Fatality but a stun or poison knockout consumes no special use', () => {
  const unit = attachFatality(makeUnit('zorro_llamas_errantes'), now, () => 0);
  let battle = open([unit]);
  const miss = act(battle, '3', { roll: 99 });
  assert.equal(miss.action.hit, false); assert.equal(miss.action.damage, 0);
  assert.equal(miss.battle.players[0].units[0].fatality.used, true);
  battle = open([unit]);
  activeUnit(battle.players[0]).effects.push({ type: 'stun', potency: 1, remaining: 1, sourceUnitId: 'enemy', appliedAtTurn: 0 });
  const skipped = act(battle, '3');
  assert.equal(skipped.action.type, 'skip');
  assert.equal(skipped.battle.players[0].units[0].fatality.used, false);
  battle = open([unit]);
  activeUnit(battle.players[0]).hp = 1;
  activeUnit(battle.players[0]).effects.push({ type: 'poison', potency: 50, remaining: 1, sourceUnitId: 'enemy', appliedAtTurn: 0 });
  const knockout = act(battle, '3');
  assert.equal(knockout.action.type, 'skip');
  assert.equal(knockout.battle.players[0].units[0].fatality.used, false);
});

test('classic Fatality has the same single-use cost and never guarantees a knockout', () => {
  const first = attachFatality(makeUnit(), now, () => 0), second = makeUnit('guardian_mil_mascaras', 'target');
  const battle = { status: 'active', turnUserId: 'a', turnNumber: 1, actions: [], players: [
    { userId: 'a', unit: first }, { userId: 'b', unit: second } ] };
  const result = resolveAttack(battle, { userId: 'a', choice: '3', now, roll: 0 });
  assert.ok(result.action.damage > 0 && result.action.damage < second.stats.hp);
  assert.equal(result.battle.status, 'active');
  assert.equal(result.battle.players[0].unit.fatality.used, true);
  assert.equal(battle.players[0].unit.fatality.used, false);
});

test('story Fatality respects illusions, sealed skills and the mirror boss rather than bypassing mechanics', () => {
  const unit = attachFatality(makeUnit(), now, () => 0);
  let battle = createStoryBattle({ id: 'STB-fatality', encounterId: 'II05', units: [unit], now, version: 4, learning: { defeats: 2 } });
  assert.equal(storyBattleView(battle).team[0].attacks[2].choice, '3');
  const attack = resolveStoryAction(battle, { action: 'attack', choice: '3', rolls: [0, 99], now });
  assert.equal(attack.battle.core.players[0].units[0].fatality.used, true);
  assert.ok(attack.action.events.some(event => event.type === 'decoy'));
  assert.equal(storyBattleView(attack.battle).team[0].attacks.length, 2);
  assert.deepEqual(replayStoryBattle(attack.battle), attack.battle);
  battle = createStoryBattle({ id: 'STB-fatality-sealed', encounterId: 'V05', units: [unit], now, version: 4, learning: { defeats: 4 } });
  battle.mechanics.sealTurns = 2;
  assert.equal(storyBattleView(battle).team[0].attacks[2].ready, false);
  assert.throws(() => resolveStoryAction(battle, { action: 'attack', choice: '3', now }), { code: 'STORY_SKILL_SEALED' });
  battle = createStoryBattle({ id: 'STB-fatality-mirror', encounterId: 'III05', units: [unit], now, version: 4, learning: { defeats: 2 } });
  battle = resolveStoryAction(battle, { action: 'attack', choice: '3', now }).battle;
  assert.equal(battle.mechanics.copiedSkill.id, unit.fatality.attack.id);
  battle = resolveStoryAction(battle, { action: 'defend', now }).battle;
  assert.deepEqual(replayStoryBattle(battle), battle);
});

test('Fatality increases one hit moderately and does not scale into an execution against full-health peers', () => {
  for (const characterId of ['guardian_mil_mascaras', 'zorro_llamas_errantes']) {
    const actor = { ...makeUnit(characterId), effects: [] }, target = { ...makeUnit(), effects: [] };
    const special = fatalityProfile(characterId);
    const normalDamage = calculateAdvancedDamage(actor.attacks[1], actor, target);
    const specialDamage = calculateAdvancedDamage(special, actor, target);
    assert.ok(specialDamage > normalDamage);
    assert.ok(specialDamage - normalDamage <= 20);
    assert.ok(specialDamage < target.stats.hp / 2);
    assert.equal(special.effects.length, 0);
    // Per encounter, 10% opening chance limits the expected extra damage.
    assert.ok((specialDamage - normalDamage) * 0.1 <= 2);
  }
});

test('Rostro Cambiante rotates three actual styles without stacking shields or extending the attack buff', () => {
  const first = makeUnit(), second = makeUnit('guardian_mil_mascaras', 'enemy');
  first.stats.speed = 100; second.stats.hp = 1000;
  let battle = open([first], [second]);
  const jade = act(battle); battle = jade.battle;
  assert.equal(jade.action.events.find(event => event.type === 'mask_changed').maskId, 'jade');
  assert.equal(activeUnit(battle.players[0]).effects.find(effect => effect.type === 'shield').potency, 6);
  battle = act(battle).battle;
  const crimson = act(battle); battle = crimson.battle;
  assert.equal(crimson.action.events.find(event => event.type === 'mask_changed').maskId, 'carmesi');
  assert.ok(crimson.action.damage > jade.action.damage);
  battle = act(battle).battle;
  const blue = act(battle); battle = blue.battle;
  assert.equal(blue.action.events.find(event => event.type === 'mask_changed').maskId, 'azul');
  assert.equal(blue.action.events.find(event => event.type === 'effect_tick' && event.effect === 'regeneration').amount, 5);
  assert.equal(activeUnit(battle.players[0]).effects.some(effect => effect.type === 'attack_up'), false);
  // Azure removes Carmesí before this action, so its hit returns to normal power.
  assert.equal(blue.action.damage, 26);
  assert.deepEqual(replayAdvancedBattle(battle), battle);
});
