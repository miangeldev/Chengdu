import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, validateDatabase, validateTransition } from '../storage/validation.js';
import { effectiveStats } from '../game/progression/rules.js';
import { initializeAdvancedBattle } from '../game/battle/advancedEngine.js';
import { readRecords } from './helpers.js';
import { advanceAttacks, advancedSetup, startAdvanced } from './advanced-helpers.js';

function stateOf(context) {
  return Object.fromEntries(COLLECTIONS.map(name => [name,
    JSON.parse(fs.readFileSync(path.join(context.directory, `${name}.json`), 'utf8'))]));
}

test('advanced battle locks every unit including reserves and prevents market sales or team edits until settlement', async t => {
  const context = await advancedSetup(t);
  const battle = await startAdvanced(context);
  for (const original of context.units.flat()) {
    assert.deepEqual((await context.game.units.getUnit(original.id)).lock, { type: 'battle', referenceId: battle.id });
  }
  await assert.rejects(context.game.market.createListing({ sellerId: context.a.id, unitId: context.units[0][2].id,
    price: 20, operationKey: 'selling-a-reserve' }), { code: 'UNIT_LOCKED' });
  await assert.rejects(context.game.teams.setTeam({ userId: context.a.id, unitIds: [context.units[0][0].id] }), { code: 'TEAM_LOCKED' });
  await context.game.battle.surrender({ userId: context.b.id, chatId: context.chatId });
  for (const original of context.units.flat()) assert.equal((await context.game.units.getUnit(original.id)).lock, null);
  const listing = (await context.game.market.createListing({ sellerId: context.a.id, unitId: context.units[0][2].id,
    price: 20, operationKey: 'reserve-after-settlement' })).listing;
  assert.equal(listing.status, 'active');
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('advanced snapshots remain frozen while catalog profiles change for future battles', async t => {
  const context = await advancedSetup(t);
  const battle = await startAdvanced(context);
  await context.storage.withTransaction(async repos => {
    const character = await repos.characters.get('lobo_sombrio');
    await repos.characters.replace({ ...character, revision: character.revision + 1,
      combat: { version: 1, element: 'neutral', ability: null } });
    const attack = await repos.attacks.get('lobo_sombrio_1');
    await repos.attacks.replace({ ...attack, revision: attack.revision + 1,
      combat: { ...attack.combat, power: 999 } });
  });
  const original = battle.players[1].units[0];
  const result = await context.game.battle.attack({ userId: battle.turnUserId, chatId: context.chatId, choice: '1' });
  assert.deepEqual(result.battle.players[1].units[0].attacks, original.attacks);
  assert.equal(result.battle.players[1].units[0].element, original.element);
  assert.deepEqual(result.battle.players[1].units[0].ability, original.ability);
  assert.ok(result.action.damage < 100);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('advanced deterministic replay rejects forged HP, rolls, effects, cooldowns, participation, turns and event logs', async t => {
  const context = await advancedSetup(t);
  let battle = await startAdvanced(context);
  battle = (await context.game.battle.attack({ userId: battle.turnUserId, chatId: context.chatId,
    choice: '2', operationKey: 'recorded-advanced-roll' })).battle;
  const original = stateOf(context);
  const mutations = [
    record => { record.players[0].units[0].hp++; },
    record => { record.actions[0].damage++; },
    record => { record.actions[0].roll = 99; },
    record => { record.actions[0].seq = 8; },
    record => { record.actions[0].actorUnitId = record.players[1].units[1].id; },
    record => { record.actions[0].events = []; },
    record => { record.players[0].units[0].effects = []; },
    record => { record.players[1].units[0].cooldowns = {}; },
    record => { record.players[0].units[2].participated = true; },
    record => { record.players[0].units[0].abilityUsed = false; },
    record => { record.players[0].activeIndex = 2; },
    record => { record.turnUserId = record.players[1].userId; },
    record => { record.turnNumber++; },
    record => { record.openingEvents = []; },
    record => { record.teamSize = 2; },
    record => { record.mode = '1v1'; },
    record => { record.expiresAt = '2026-10-11T10:40:00.000Z'; }
  ];
  for (const mutate of mutations) {
    const forged = structuredClone(original);
    mutate(forged.combates.records.find(record => record.id === battle.id));
    assert.throws(() => validateDatabase(forged), { code: 'DATABASE_CORRUPT' });
  }
  const changedTeam = structuredClone(original);
  changedTeam.usuarios.records.find(user => user.id === context.a.id).team.pop();
  assert.throws(() => validateDatabase(changedTeam), { code: 'DATABASE_CORRUPT' });
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('advanced history and earned XP survive a market transfer and the next battle snapshots the new owner', async t => {
  const context = await advancedSetup(t);
  let battle = await advanceAttacks(context, await startAdvanced(context));
  battle = (await context.game.battle.surrender({ userId: context.b.id, chatId: context.chatId })).battle;
  const original = structuredClone(battle);
  const unitId = context.units[0][0].id;
  await context.game.economy.claimDaily({ userId: context.b.id, operationKey: 'fund-advanced-history-buyer' });
  const listing = (await context.game.market.createListing({ sellerId: context.a.id, unitId,
    price: 20, operationKey: 'sell-advanced-history-unit' })).listing;
  await context.game.market.buyListing({ buyerId: context.b.id, listingId: listing.id,
    operationKey: 'buy-advanced-history-unit' });
  const transferred = await context.game.units.getUnit(unitId);
  assert.equal(transferred.ownerId, context.b.id);
  assert.equal(transferred.ownershipVersion, 1);
  assert.equal(transferred.progress.xp, 35);
  assert.deepEqual(await context.game.battle.getHistoryBattle({ userId: context.a.id, battleId: battle.id }), original);
  await context.game.teams.setTeam({ userId: context.a.id, unitIds: [context.units[0][1].id] });
  await context.game.teams.setTeam({ userId: context.b.id, unitIds: [unitId] });
  const next = await startAdvanced(context);
  assert.equal(next.players[1].units[0].ownershipVersion, 1);
  assert.equal(next.players[1].units[0].id, unitId);
  assert.equal(original.players[0].units[0].ownershipVersion, 0);
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('an expired advanced battle preserves the replay deadline and cannot hide a forged premature expiration', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const context = await advancedSetup(t, { clock: () => now });
  await startAdvanced(context);
  now = '2026-10-11T10:30:00.000Z';
  await context.game.battle.sweepExpired();
  const original = stateOf(context);
  const mutatedDeadline = structuredClone(original);
  mutatedDeadline.combates.records[0].expiresAt = '2026-10-11T10:01:00.000Z';
  assert.throws(() => validateDatabase(mutatedDeadline), { code: 'DATABASE_CORRUPT' });
  const mutatedTimestamp = structuredClone(original);
  mutatedTimestamp.combates.records[0].updatedAt = '2026-10-11T10:29:00.000Z';
  assert.throws(() => validateDatabase(mutatedTimestamp), { code: 'DATABASE_CORRUPT' });
});

test('advanced invitations retain their five minute deadline and reject impossible or shifted timestamps', async t => {
  let now = '2026-10-11T10:00:00.000Z';
  const context = await advancedSetup(t, { clock: () => now });
  await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode: 'auto' });
  const original = stateOf(context);
  for (const mutate of [
    battle => { battle.expiresAt = '2026-10-11T10:06:00.000Z'; },
    battle => { battle.updatedAt = '2026-10-11T10:01:00.000Z'; },
    battle => { battle.createdAt = '2026-02-30T10:00:00.000Z'; }
  ]) {
    const forged = structuredClone(original);
    mutate(forged.combates.records[0]);
    assert.throws(() => validateDatabase(forged), { code: 'DATABASE_CORRUPT' });
  }
  now = '2026-10-11T10:05:00.000Z';
  await context.game.battle.sweepExpired();
  const expired = stateOf(context);
  assert.equal(expired.combates.records[0].finishReason, 'challenge_timeout');
  const forged = structuredClone(expired);
  forged.combates.records[0].finishedAt = '2026-10-11T10:04:59.000Z';
  forged.combates.records[0].updatedAt = forged.combates.records[0].finishedAt;
  assert.throws(() => validateDatabase(forged), { code: 'DATABASE_CORRUPT' });
});

test('an advanced acceptance cannot be forged at or after its original invitation deadline', async t => {
  const context = await advancedSetup(t);
  await startAdvanced(context);
  const original = stateOf(context);
  for (const [acceptedAt, expiresAt] of [
    ['2026-10-11T10:05:00.000Z', '2026-10-11T10:35:00.000Z'],
    ['2026-10-11T10:06:00.000Z', '2026-10-11T10:36:00.000Z']
  ]) {
    const forged = structuredClone(original);
    forged.combates.records[0].acceptedAt = acceptedAt;
    forged.combates.records[0].updatedAt = acceptedAt;
    forged.combates.records[0].expiresAt = expiresAt;
    assert.throws(() => validateDatabase(forged), { code: 'DATABASE_CORRUPT' });
  }
});

test('advanced snapshots cannot predate acquisition or claim levels that their unit has never reached', async t => {
  const context = await advancedSetup(t);
  await startAdvanced(context);
  const original = stateOf(context);
  const mintedAfterAcceptance = structuredClone(original);
  const futureUnit = mintedAfterAcceptance.unidades.records[0];
  futureUnit.createdAt = '2026-10-11T10:02:00.000Z';
  futureUnit.updatedAt = futureUnit.createdAt;
  mintedAfterAcceptance.eventos.records.find(event => event.unitId === futureUnit.id).createdAt = futureUnit.createdAt;
  assert.throws(() => validateDatabase(mintedAfterAcceptance), { code: 'DATABASE_CORRUPT' });

  const inventedLevel = structuredClone(original);
  const unit = inventedLevel.unidades.records[0];
  const snapshot = inventedLevel.combates.records[0].players[0].units[0];
  snapshot.level = 20;
  snapshot.stats = effectiveStats(unit.initialStats, snapshot.level, unit.statGrowthVersion,
    unit.traits, unit.traitVersion, unit.combatBaseStats);
  inventedLevel.combates.records[0] = initializeAdvancedBattle(inventedLevel.combates.records[0]);
  assert.throws(() => validateDatabase(inventedLevel), { code: 'DATABASE_CORRUPT' });
});

test('acceptance snapshots require the current ordered team, current owner and authorized catalog profiles', async t => {
  const context = await advancedSetup(t);
  const pending = (await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id,
    chatId: context.chatId, mode: 'auto' })).battle;
  const before = stateOf(context);
  await context.game.battle.accept({ userId: context.b.id, chatId: context.chatId });
  const after = stateOf(context);
  const mutations = [
    record => { record.players[0].units.reverse(); },
    record => { record.players[0].units[0].ownershipVersion = 8; },
    record => { record.players[0].units[0].attacks[0].power++; },
    record => { record.players[0].units[0].ability = null; },
    record => { record.players[0].units[0].level++; },
    record => { record.players[0].units[0].characterName = 'Alterado'; }
  ];
  for (const mutate of mutations) {
    const forged = structuredClone(after);
    mutate(forged.combates.records.find(record => record.id === pending.id));
    assert.throws(() => validateTransition(before, forged), { code: 'DATABASE_CORRUPT' });
  }
});

test('a future catalog cannot remove the always available basic attack by assigning it a cooldown', async t => {
  const context = await advancedSetup(t);
  await assert.rejects(context.storage.withTransaction(async repos => {
    const attack = await repos.attacks.get('panda_guerrero_1');
    await repos.attacks.replace({ ...attack, revision: attack.revision + 1, combat: { ...attack.combat, cooldown: 1 } });
  }), { code: 'DATABASE_CORRUPT' });
});

test('valid future combat profiles work regardless of JSON object property order', async t => {
  const context = await advancedSetup(t);
  await context.storage.withTransaction(async repos => {
    for (const character of await repos.characters.all()) {
      await repos.characters.replace({ ...character, revision: character.revision + 1,
        combat: { ability: character.combat.ability, element: character.combat.element, version: character.combat.version } });
    }
  });
  const battle = await startAdvanced(context);
  assert.equal(battle.status, 'active');
  assert.equal((await context.game.validateDatabase()).valid, true);
});

for (const stage of ['prepared', 'committed', 'published:unidades.json', 'published:combates.json']) {
  test(`accepting a 3v3 battle recovers all six locks and snapshots together at ${stage}`, async t => {
    const context = await advancedSetup(t);
    await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode: 'auto' });
    await context.game.close();
    const failed = context.open({ fault: current => { if (current === stage) throw new Error('interrupted advanced acceptance'); } }).game;
    const request = { userId: context.b.id, chatId: context.chatId, operationKey: 'acceptance-crash-message' };
    await assert.rejects(failed.battle.accept(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = context.open().game;
    const rolledBack = stage === 'prepared';
    assert.equal((await recovered.validateDatabase()).valid, true);
    assert.equal(readRecords(context.directory, 'unidades').filter(unit => unit.lock !== null).length, rolledBack ? 0 : 6);
    assert.equal((await recovered.battle.accept(request)).duplicate, !rolledBack);
    assert.equal(readRecords(context.directory, 'unidades').filter(unit => unit.lock?.type === 'battle').length, 6);
    assert.equal(readRecords(context.directory, 'recompensas').length, 0);
  });
}

for (const stage of ['prepared', 'committed', ...COLLECTIONS.map(name => `published:${name}.json`), 'published:_database.json']) {
  test(`3v3 settlement recovers XP, coins, receipts, statistics and all locks together at ${stage}`, async t => {
    const context = await advancedSetup(t);
    const battle = await advanceAttacks(context, await startAdvanced(context));
    const originalCounters = readRecords(context.directory, 'estado').filter(record => record.kind === 'mintCounter');
    await context.game.close();
    const failed = context.open({ fault: current => { if (current === stage) throw new Error('interrupted advanced settlement'); } }).game;
    const request = { userId: context.b.id, chatId: context.chatId, operationKey: 'settlement-crash-message' };
    await assert.rejects(failed.battle.surrender(request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = context.open().game;
    const rolledBack = stage === 'prepared';
    assert.equal((await recovered.validateDatabase()).valid, true);
    const saved = readRecords(context.directory, 'combates').find(record => record.id === battle.id);
    assert.equal(saved.status, rolledBack ? 'active' : 'finished');
    assert.equal(readRecords(context.directory, 'recompensas').length, rolledBack ? 0 : 2);
    assert.equal(readRecords(context.directory, 'economia').length, rolledBack ? 0 : 2);
    assert.equal(readRecords(context.directory, 'unidades').filter(unit => unit.lock !== null).length, rolledBack ? 6 : 0);
    assert.equal((await recovered.economy.getBalance(context.a.id)).coins, rolledBack ? 0 : 120);
    assert.equal((await recovered.battle.surrender(request)).duplicate, !rolledBack);
    assert.equal((await recovered.units.getUnit(context.units[0][0].id)).progress.xp, 35);
    assert.equal((await recovered.users.getUser(context.a.id)).battleStats.matches, 1);
    assert.equal(readRecords(context.directory, 'recompensas').length, 2);
    assert.equal(readRecords(context.directory, 'unidades').every(unit => unit.lock === null), true);
    assert.deepEqual(readRecords(context.directory, 'estado').filter(record => record.kind === 'mintCounter'), originalCounters);
    assert.equal(fs.existsSync(path.join(context.directory, '_journal.json')), false);
  });
}
