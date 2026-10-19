import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { setup, register, readRecords } from './helpers.js';
import { forkSeason, NOW } from './story-season-support.js';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { JsonUnitOfWork } from '../storage/unitOfWork.js';
import { createGame } from '../game/createGame.js';

async function stuckTutorial(t, version = 3) {
  const c = setup(t, { clock: () => NOW, randomRoll: () => 30, storyContentVersion: version, storyCombatVersion: version, backupRetention: 2 });
  c.user = await register(c.game);
  c.unit = (await c.game.starter.claimStarter({ userId: c.user.id, choice: 'panda' })).unit;
  let sequence = 0;
  c.invoke = (kind, args = {}) => c.game.story[kind]({ userId: c.user.id, operationKey: `old-tutorial:${++sequence}`, ...args });
  await c.invoke('start'); await c.invoke('choose', { choice: '1' });
  await c.invoke('continue'); await c.invoke('continue');
  for (let turn = 0; turn < 12; turn++) await c.invoke('act', { action: 'attack', choice: '1' });
  c.oldBattle = readRecords(c.directory, 'combateshistoria')[0];
  assert.equal(c.oldBattle.status, 'active');
  assert.equal(c.oldBattle.combat.players[1].units[0].hp, 1);
  assert.equal(c.oldBattle.combat.tutorial.defend, false);
  return c;
}
const filesOf = directory => Object.fromEntries([...COLLECTIONS.map(name => `${name}.json`), '_database.json']
  .map(file => [file, fs.readFileSync(path.join(directory, file), 'utf8')]));

for (const version of [1, 2, 3]) test(`a tutorial stuck at one HP in engine ${version} finishes on the next attack without resetting or rewriting old turns`, async t => {
  const c = await stuckTutorial(t, version), old = c.oldBattle;
  const prizes = readRecords(c.directory, 'premioshistoria');
  await c.game.close(); Object.assign(c, c.open({ storyContentVersion: 3, storyCombatVersion: 4 }));
  const bytes = filesOf(c.directory);
  const projected = await c.game.story.getState({ userId: c.user.id });
  assert.equal(projected.battle.enemy.hp, 1); assert.equal(projected.battle.learning.required, 0);
  assert.doesNotMatch(projected.battle.enemy.intent, /falta defender|aún falta/);
  assert.deepEqual(filesOf(c.directory), bytes, 'Reading the repaired interface must not migrate any file');
  const operation = { userId: c.user.id, action: 'attack', choice: '1', operationKey: 'finish-old-tutorial' };
  const won = await c.game.story.act(operation);
  assert.equal(won.battle.status, 'won'); assert.equal(won.progress.missionIndex, 3);
  assert.equal(won.progress.contentVersion, 3); assert.equal(won.battle.tutorial.defend, false);
  const saved = readRecords(c.directory, 'combateshistoria')[0];
  assert.equal(saved.combat.version, 4); assert.equal(saved.contentVersion, version);
  assert.deepEqual(saved.combat.combatUpgrade, { fromVersion: version, afterActions: old.combat.actions.length });
  assert.deepEqual(saved.combat.actions.slice(0, old.combat.actions.length), old.combat.actions);
  assert.deepEqual(saved.combat.unitSnapshots, old.combat.unitSnapshots);
  assert.deepEqual(readRecords(c.directory, 'premioshistoria').slice(0, prizes.length), prizes);
  const balance = await c.game.economy.getBalance(c.user.id);
  await c.game.close(); Object.assign(c, c.open({ storyContentVersion: 3, storyCombatVersion: 4 }));
  assert.equal((await c.game.validateDatabase()).valid, true);
  assert.equal((await c.game.story.act(operation)).alreadyProcessed, true);
  assert.deepEqual(await c.game.economy.getBalance(c.user.id), balance);
  const forged = Object.fromEntries(COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))]));
  forged.combateshistoria.records[0].combat.combatUpgrade.afterActions--;
  assert.throws(() => validateDatabase(forged), { code: 'DATABASE_CORRUPT' });
});

test('repairing an active tutorial, winning and receiving its reward recover atomically', async t => {
  const c = await stuckTutorial(t);
  for (const stage of ['prepared', 'committed', 'published:combateshistoria.json', 'published:historias.json', 'published:premioshistoria.json', 'published:unidades.json']) {
    const fork = await forkSeason(t, c, `upgrade-recovery:${stage}`);
    await fork.game.close(); let armed = true;
    fork.storage = new JsonUnitOfWork({ directory: fork.directory, clock: () => NOW, fault: point => {
      if (armed && point === stage) { armed = false; throw Error('Interrupted during tutorial repair'); }
    } });
    fork.game = createGame({ storage: fork.storage, randomRoll: () => 30 });
    const operation = { userId: fork.user.id, action: 'attack', choice: '1', operationKey: 'recover-tutorial-win' };
    await assert.rejects(fork.game.story.act(operation), { code: 'STORAGE_WRITE_FAILED' });
    await fork.game.close();
    fork.storage = new JsonUnitOfWork({ directory: fork.directory, clock: () => NOW });
    fork.game = createGame({ storage: fork.storage, randomRoll: () => 30 });
    assert.equal((await fork.game.validateDatabase()).valid, true);
    const retry = await fork.game.story.act(operation);
    assert.equal(retry.alreadyProcessed, stage !== 'prepared');
    assert.equal(retry.progress.missionIndex, 3);
    assert.equal(readRecords(fork.directory, 'premioshistoria').filter(row => row.missionCode === 'P-03').length, 1);
    const saved = readRecords(fork.directory, 'combateshistoria')[0];
    assert.equal(saved.combat.version, 4); assert.equal(saved.status, 'won');
    assert.equal(saved.combat.actions.length, c.oldBattle.combat.actions.length + 1);
    assert.deepEqual(saved.combat.actions.slice(0, c.oldBattle.combat.actions.length), c.oldBattle.combat.actions);
    assert.equal((await fork.game.validateDatabase()).valid, true);
  }
});
