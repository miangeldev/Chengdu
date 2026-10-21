import test from 'node:test';
import assert from 'node:assert/strict';
import { advancedSetup, startAdvanced } from './advanced-helpers.js';
import { setup, register, readRecords } from './helpers.js';

const NOW = '2026-10-25T06:00:00.000Z';

for (const mode of ['classic', '1v1']) test(`${mode}: opening RNG, one-use Fatality, retry and restart persist without rerolls`, async t => {
  let draws = 0;
  const c = await advancedSetup(t, { clock: () => NOW, randomRoll: () => { draws++; return 0; },
    characters: [['zorro_llamas_errantes'], ['panda_guerrero']] });
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, mode });
  const acceptRequest = { userId: c.b.id, chatId: c.chatId, operationKey: 'fatality-accept' };
  let battle = (await c.game.battle.accept(acceptRequest)).battle;
  assert.equal(draws, 1);
  assert.equal((await c.game.battle.accept(acceptRequest)).duplicate, true);
  assert.equal(draws, 1);
  const attackRequest = { userId: c.a.id, chatId: c.chatId, choice: '3', operationKey: 'fatality-attack' };
  const result = await c.game.battle.attack(attackRequest); battle = result.battle;
  assert.equal(result.action.attackId, 'zorro_llamas_errantes_fatality');
  assert.equal(draws, 2);
  assert.equal((await c.game.battle.attack(attackRequest)).duplicate, true);
  assert.equal(draws, 2);
  await c.game.close(); Object.assign(c, c.open());
  assert.deepEqual((await c.game.battle.attack(attackRequest)).battle, battle);
  assert.equal(draws, 2);
  const runtime = mode === 'classic' ? battle.players[0].unit : battle.players[0].units[0];
  assert.equal(runtime.fatality.used, true);
  if (battle.status === 'active') {
    battle = (await c.game.battle.attack({ userId: c.b.id, chatId: c.chatId, choice: '1', operationKey: 'fatality-response' })).battle;
    await assert.rejects(c.game.battle.attack({ ...attackRequest, operationKey: 'fatality-again' }), { code: 'FATALITY_ALREADY_USED' });
    await c.game.battle.surrender({ userId: c.a.id, chatId: c.chatId, operationKey: 'fatality-close' });
  }
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('advanced masks progress independently, pause on the bench and cannot be reset by a database write', async t => {
  const c = await advancedSetup(t, { clock: () => NOW, randomRoll: () => 99,
    characters: [['guardian_mil_mascaras', 'panda_guerrero'], ['guardian_mil_mascaras', 'panda_guerrero']] });
  let battle = await startAdvanced(c, '2v2');
  for (let turn = 0; turn < 6; turn++) {
    battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId,
      choice: '1', operationKey: `mask-turn:${turn}` })).battle;
  }
  assert.equal(battle.players[0].units[0].mask.index, 2);
  assert.equal(battle.players[1].units[0].mask.index, 2);
  assert.equal(battle.players[0].units[0].mask.turns, 3);
  assert.equal(battle.actions.flatMap(action => action.events).filter(event => event.type === 'mask_changed').length, 6);
  battle = (await c.game.battle.switchUnit({ userId: battle.turnUserId, chatId: c.chatId, choice: '2', operationKey: 'mask-bench' })).battle;
  assert.equal(battle.players[0].units[0].mask.turns, 4);
  for (let index = 0; index < 3; index++) battle = (await c.game.battle.attack({ userId: battle.turnUserId,
    chatId: c.chatId, choice: '1', operationKey: `mask-bench-turn:${index}` })).battle;
  assert.equal(battle.players[0].units[0].mask.turns, 4);
  battle = (await c.game.battle.switchUnit({ userId: battle.turnUserId, chatId: c.chatId, choice: '1', operationKey: 'mask-return' })).battle;
  assert.equal(battle.players[0].units[0].mask.turns, 4);
  assert.equal(battle.players[0].units[0].mask.index, 0);
  await assert.rejects(c.storage.withTransaction(async repos => {
    const record = await repos.battles.get(battle.id); record.players[0].units[0].mask.turns = 0;
    await repos.battles.replace(record);
  }), { code: 'DATABASE_CORRUPT' });
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('story opening freezes one Fatality roll and rejects snapshot or runtime manipulation', async t => {
  let draws = 0;
  const c = setup(t, { clock: () => NOW, randomRoll: () => { draws++; return 0; } });
  const user = await register(c.game);
  const unit = await c.game.units.createUnit({ ownerId: user.id, characterId: 'zorro_llamas_errantes',
    origin: { type: 'admin', sourceId: 'fatality-story-fixture' }, operationKey: 'fatality-story-unit' });
  await c.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  let seq = 0;
  const invoke = (kind, args = {}) => c.game.story[kind]({ userId: user.id, operationKey: `fatality-story:${++seq}`, ...args });
  await invoke('start'); await invoke('choose', { choice: '1' }); await invoke('continue');
  let state = await invoke('continue');
  assert.equal(state.battle.encounterId, 'P03');
  assert.equal(draws, 1);
  assert.equal(state.battle.team[0].attacks[2].choice, '3');
  const opening = readRecords(c.directory, 'combateshistoria')[0];
  await assert.rejects(c.storage.withTransaction(async repos => {
    const record = await repos.storyBattles.get(opening.id); record.combat.unitSnapshots[0].fatality.attack.power = 9999;
    await repos.storyBattles.replace(record);
  }), { code: 'DATABASE_CORRUPT' });
  const request = { userId: user.id, operationKey: 'fatality-story-once', action: 'attack', choice: '3' };
  state = await c.game.story.act(request);
  assert.equal(draws, 3);
  assert.equal(state.battle.team[0].attacks.some(attack => attack.choice === '3'), false);
  assert.equal((await c.game.story.act(request)).alreadyProcessed, true);
  assert.equal(draws, 3);
  await c.game.close(); Object.assign(c, c.open());
  const resumed = await c.game.story.getState({ userId: user.id });
  assert.deepEqual(resumed.battle, state.battle);
  assert.equal((await c.game.validateDatabase()).valid, true);
});
