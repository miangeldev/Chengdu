import test from 'node:test';
import assert from 'node:assert/strict';
import { register, setup } from './helpers.js';

async function mintTeam(game, owner, prefix, characters = ['panda_guerrero', 'mago_carmesi', 'lobo_sombrio']) {
  return Promise.all(characters.map((characterId, index) => game.units.createUnit({ characterId, ownerId: owner.id,
    origin: { type: 'test_reward', sourceId: `${prefix}:${index}` }, operationKey: `${prefix}:${index}` })));
}

test('three-unit teams preserve explicit order, reject duplicates and enforce ownership and capacity', async t => {
  const { game } = setup(t);
  const user = await register(game);
  const rival = await register(game, 'Lukas', '521111111111');
  const units = await mintTeam(game, user, 'team');
  const foreign = (await mintTeam(game, rival, 'foreign', ['monje_celestial']))[0];
  let team = await game.teams.setTeam({ userId: user.id, unitIds: units.map(unit => unit.id.toLowerCase()) });
  assert.equal(team.maxSize, 3);
  assert.deepEqual(team.units.map(unit => unit.id), units.map(unit => unit.id));
  team = await game.teams.updateTeam({ userId: user.id, operation: 'order', positions: [2, 1, 3] });
  assert.deepEqual(team.units.map(unit => unit.id), [units[1].id, units[0].id, units[2].id]);
  await assert.rejects(game.teams.updateTeam({ userId: user.id, operation: 'order', positions: [1, 1, 3] }), { code: 'INVALID_TEAM_ORDER' });
  await assert.rejects(game.teams.setTeam({ userId: user.id, unitIds: [units[0].id, units[0].id] }), { code: 'DUPLICATE_TEAM_UNIT' });
  await assert.rejects(game.teams.setTeam({ userId: user.id, unitIds: [foreign.id] }), { code: 'UNIT_NOT_OWNED' });
  await assert.rejects(game.teams.updateTeam({ userId: user.id, operation: 'add', unitId: units[0].id }), { code: 'DUPLICATE_TEAM_UNIT' });
  const extra = (await mintTeam(game, user, 'fourth', ['guardian_jade']))[0];
  await assert.rejects(game.teams.updateTeam({ userId: user.id, operation: 'add', unitId: extra.id }), { code: 'TEAM_FULL' });
  team = await game.teams.updateTeam({ userId: user.id, operation: 'remove', unitId: units[0].id });
  assert.equal(team.units.length, 2);
  team = await game.teams.updateTeam({ userId: user.id, operation: 'add', unitId: extra.id });
  assert.deepEqual(team.units.map(unit => unit.id), [units[1].id, units[2].id, extra.id]);
  team = await game.teams.updateTeam({ userId: user.id, operation: 'clear' });
  assert.deepEqual(team.units, []);
});

test('advanced combat locks the whole team and inspection finds a frozen reserve snapshot', async t => {
  const { game, storage } = setup(t, { randomRoll: () => 0 });
  const a = await register(game);
  const b = await register(game, 'Lukas', '521111111111');
  const au = await mintTeam(game, a, 'a');
  const bu = await mintTeam(game, b, 'b');
  await game.teams.setTeam({ userId: a.id, unitIds: au.map(unit => unit.id) });
  await game.teams.setTeam({ userId: b.id, unitIds: bu.map(unit => unit.id) });
  await game.battle.challenge({ userId: a.id, opponentId: b.id, chatId: 'group@g.us', mode: '3v3' });
  const { battle } = await game.battle.accept({ userId: b.id, chatId: 'group@g.us' });
  for (const unit of [...au, ...bu]) assert.equal((await game.units.getUnit(unit.id)).lock.referenceId, battle.id);
  await assert.rejects(game.teams.updateTeam({ userId: a.id, operation: 'clear' }), { code: 'TEAM_LOCKED' });
  const reserve = battle.players[0].units[1];
  await storage.withTransaction(async repos => {
    const character = await repos.characters.get(reserve.characterId);
    await repos.characters.replace({ ...character, name: 'Nombre futuro', revision: character.revision + 1 });
    const attack = await repos.attacks.get(reserve.attacks[1].id);
    await repos.attacks.replace({ ...attack, combat: { ...attack.combat, power: 999 }, revision: attack.revision + 1 });
  });
  const detail = await game.units.getCombatDetails({ unitId: reserve.id });
  assert.equal(detail.units[0].reserve, true);
  assert.equal(detail.units[0].characterName, reserve.characterName);
  assert.equal(detail.units[0].attacks[1].power, reserve.attacks[1].power);
  const arena = await game.units.getCombatDetails({ userId: a.id, chatId: 'group@g.us' });
  assert.equal(arena.units.length, 2);
  assert.equal(arena.reserves.length, 4);
  await game.battle.surrender({ userId: a.id, chatId: 'group@g.us' });
  for (const unit of [...au, ...bu]) assert.equal((await game.units.getUnit(unit.id)).lock, null);
  await game.teams.updateTeam({ userId: a.id, operation: 'order', positions: [3, 2, 1] });
});
