import test from 'node:test';
import assert from 'node:assert/strict';
import { setup, register, readRecords } from './helpers.js';

const NOW = '2026-10-17T20:00:00.000Z';
for (const [operation, stages] of [
  ['upgrade', ['prepared', 'committed', 'published:historias.json', 'published:accioneshistoria.json']],
  ['reward', ['prepared', 'committed', 'published:usuarios.json', 'published:economia.json',
    'published:historias.json', 'published:accioneshistoria.json', 'published:premioshistoria.json']]
]) for (const stage of stages) {
  test(`versioned story ${operation} recovers at ${stage} without duplicate upgrades or XP`, async t => {
    const c = setup(t, { clock: () => NOW, storyContentVersion: 1 });
    const user = await register(c.game);
    const { unit } = await c.game.starter.claimStarter({ userId: user.id, choice: 'panda' });
    await c.game.story.start({ userId: user.id, operationKey: 'recovery:start' });
    await c.game.story.choose({ userId: user.id, choice: '1', operationKey: 'recovery:choice' });
    const paid = readRecords(c.directory, 'premioshistoria')[0];
    await c.game.close();
    let transaction = 0;
    const failing = c.open({ storyContentVersion: 2, fault: current => {
      if (current === 'prepared') transaction++;
      if (transaction === (operation === 'upgrade' ? 1 : 2) && current === stage) throw new Error('versioned story interrupted');
    } }).game;
    const request = { userId: user.id, operationKey: 'recovery:continue' };
    await assert.rejects(failing.story.continue(request), { code: 'STORAGE_WRITE_FAILED' });
    await failing.close();
    const recovered = c.open({ storyContentVersion: 2 }).game;
    const result = await recovered.story.continue(request);
    assert.equal(result.progress.contentVersion, 2);
    assert.equal(result.mission.code, 'P-03');
    const actions = readRecords(c.directory, 'accioneshistoria');
    assert.equal(actions.filter(action => action.kind === 'upgrade').length, 1);
    assert.equal(actions.filter(action => action.operationKey === request.operationKey).length, 1);
    const prizes = readRecords(c.directory, 'premioshistoria');
    assert.equal(prizes.length, 2); assert.deepEqual(prizes[0], paid);
    assert.equal(prizes[1].contentVersion, 2); assert.equal(prizes[1].unitXp, 75);
    assert.deepEqual((await recovered.units.getUnit(unit.id)).progress, { level: 1, xp: 75 });
    assert.equal((await recovered.economy.getBalance(user.id)).coins, 20);
    const replay = await recovered.story.continue(request); assert.equal(replay.alreadyProcessed, true);
    assert.deepEqual(readRecords(c.directory, 'premioshistoria'), prizes);
    assert.equal((await recovered.validateDatabase()).valid, true);
  });
}
