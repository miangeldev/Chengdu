import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createUnitInTransaction } from '../game/units/unitGenerator.js';
import { COLLECTIONS } from '../storage/validation.js';
import { readRecords, register, setup, updateCharacter } from './helpers.js';

const contents = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  fs.readFileSync(path.join(directory, `${name}.json`), 'utf8')
]));

for (const [characterId, max] of [
  ['panda_guerrero', 50], ['monje_celestial', 35],
  ['bruja_lunar', 20], ['dragon_carmesi', 10]
]) {
  test(`default ${characterId} supply admits exactly ${max} units across concurrent mint requests`, async t => {
    const { game, storage, directory } = setup(t);
    const owner = await register(game);
    const contender = await register(game, 'Lukas', '521111111111');
    const origin = { type: 'admin', sourceId: 'balance-test' };
    // Exercise the real minter for the first max - 1 units in a single transaction.
    await storage.withTransaction(async repos => {
      for (let i = 0; i < max - 1; i++) {
        await createUnitInTransaction(repos, {
          characterId, ownerId: owner.id, origin, operationKey: `seed:${i}`
        }, storage.clock);
      }
    });
    const finalRequest = { characterId, ownerId: owner.id, origin, operationKey: 'last-unit' };
    const results = await Promise.allSettled([
      game.units.createUnit(finalRequest),
      characterId === 'panda_guerrero'
        ? game.starter.claimStarter({ userId: contender.id, choice: 'panda' })
        : game.units.createUnit({ ...finalRequest, ownerId: contender.id, operationKey: 'contender' })
    ]);
    assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
    assert.equal(results.find(result => result.status === 'rejected').reason.code, 'SUPPLY_EXHAUSTED');
    const minted = readRecords(directory, 'unidades');
    assert.equal(minted.length, max);
    assert.deepEqual(minted.map(unit => unit.serial), Array.from({ length: max }, (_, i) => i + 1));
    const counter = readRecords(directory, 'estado').find(record => record.id === `mint:${characterId}`);
    assert.equal(counter.issuedCount, max);
    assert.equal(counter.lastSerial, max);
    const before = contents(directory);
    await assert.rejects(game.units.createUnit({ ...finalRequest, operationKey: 'one-too-many' }), { code: 'SUPPLY_EXHAUSTED' });
    assert.deepEqual(contents(directory), before);
    assert.equal((await game.units.createUnit(finalRequest)).serial, max); // Replay still works at the cap.
    if (characterId === 'panda_guerrero') {
      assert.equal((await game.starter.getStarterOptions()).find(option => option.choice === 'panda').available, false);
      const odds = (await game.packs.listPacks()).items[0].odds;
      assert.equal(odds.find(entry => entry.rarity === 'common').characterCount, 2);
    }
    assert.equal((await game.validateDatabase()).valid, true);
  });
}

test('future catalog revisions respect rarity supply caps and leave existing combat profiles intact', async t => {
  const { game, storage, directory } = setup(t);
  const owner = await register(game);
  const { unit } = await game.starter.claimStarter({ userId: owner.id, choice: 'panda' });
  const before = contents(directory);
  for (const supply of [{ type: 'unlimited', max: null }, { type: 'limited', max: 51 }]) {
    await assert.rejects(updateCharacter(storage, 'panda_guerrero', { supply }), { code: 'DATABASE_CORRUPT' });
    assert.deepEqual(contents(directory), before);
  }
  await assert.rejects(updateCharacter(storage, 'monje_celestial', { supply: { type: 'limited', max: 36 } }), { code: 'DATABASE_CORRUPT' });
  const original = await game.units.getUnit(unit.id);
  const futureStats = { hp: 150, attack: 30, defense: 25, speed: 10 };
  await updateCharacter(storage, 'panda_guerrero', { baseStats: futureStats });
  const existing = await game.units.getUnit(unit.id);
  assert.deepEqual(existing.initialStats, original.initialStats);
  assert.deepEqual(existing.combatBaseStats, original.combatBaseStats);
  assert.deepEqual(existing.currentStats, original.currentStats);
  const next = await game.units.createUnit({
    characterId: 'panda_guerrero', ownerId: owner.id,
    origin: { type: 'admin', sourceId: 'next-edition' }, operationKey: 'next-edition'
  });
  assert.deepEqual(next.initialStats, futureStats);
  assert.deepEqual(next.combatBaseStats, futureStats);
  assert.ok(next.characterRevision > unit.characterRevision);
  assert.equal((await game.validateDatabase()).valid, true);
});
