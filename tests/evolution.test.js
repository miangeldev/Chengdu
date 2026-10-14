import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { readRecords } from './helpers.js';
import { COLLECTIONS, validateDatabase, validateTransition } from '../storage/validation.js';
import { craftingFixture, craftSeal, earnSealMaterials, fightForMaterials } from './crafting-fixtures.js';
import { effectiveUnitStats, evolvedStats, evolutionSnapshot, displayUnitCharacterName, formForCharacter, evolutionBonusPercent, evolutionPolicy, validEvolutionShape } from '../game/evolution/rules.js';

test('evolution forms preserve rarity and apply a bounded versioned five-percent improvement', () => {
  const after = { version: 1, formId: 'panda_maestro', receiptId: 'EVO-00000000-0000-0000-0000-000000000000', evolvedAt: '2026-10-13T12:00:00.000Z' };
  assert.deepEqual(evolvedStats({ hp: 138, attack: 26, defense: 24, speed: 8 }, after, 'panda_guerrero'),
    { hp: 144, attack: 27, defense: 25, speed: 8 });
  assert.equal(formForCharacter('mago_carmesi').name, 'Mago Arcano');
  assert.equal(formForCharacter('lobo_sombrio').name, 'Lobo Lunar');
  assert.equal(formForCharacter('dragon_carmesi'), null);
  assert.throws(() => evolvedStats({ hp: 138, attack: 26, defense: 24, speed: 8 }, { ...after, version: 99 }, 'panda_guerrero'), { code: 'INVALID_EVOLUTION' });
  assert.equal(evolutionSnapshot({}), null);
});

test('evolution preserves unit ID, serial, original stats, supply, ownership, team and history', async t => {
  const c = await craftingFixture(t, { level: 10 });
  await earnSealMaterials(c);
  await craftSeal(c);
  const before = readRecords(c.directory, 'unidades').find(row => row.id === c.unit.id);
  const counters = readRecords(c.directory, 'estado').filter(row => row.kind === 'mintCounter');
  const history = readRecords(c.directory, 'eventos');
  const beforeCoins = (await c.game.economy.getBalance(c.user.id)).coins;
  const evolved = await c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'evolve' });
  assert.equal(evolved.alreadyEvolved, false);
  const after = readRecords(c.directory, 'unidades').find(row => row.id === c.unit.id);
  for (const field of ['id', 'characterId', 'characterRevision', 'serial', 'ownerId', 'ownershipVersion', 'origin', 'createdAt',
    'initialStats', 'combatBaseStats', 'progress', 'traits', 'variant', 'traitVersion', 'battleStats', 'lock']) assert.deepEqual(after[field], before[field], field);
  assert.equal(after.evolution.formId, 'panda_maestro');
  assert.deepEqual(readRecords(c.directory, 'estado').filter(row => row.kind === 'mintCounter'), counters);
  assert.deepEqual(readRecords(c.directory, 'eventos'), history);
  assert.deepEqual((await c.game.teams.getTeam(c.user.id)).units.map(row => row.id), [c.unit.id]);
  assert.equal((await c.game.economy.getBalance(c.user.id)).coins, beforeCoins - 300);
  assert.equal((await c.game.crafting.getInventory(c.user.id)).materials.sellos, 0);
  const detail = await c.game.units.getUnit(c.unit.id);
  assert.equal(detail.characterName, 'Panda Maestro');
  assert.deepEqual(detail.currentStats, evolved.evolution.statsAfter);
  assert.equal(displayUnitCharacterName(after, detail.character), 'Panda Maestro');
  assert.equal((await c.game.units.getCombatDetails({ unitId: c.unit.id })).units[0].characterName, 'Panda Maestro');
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('evolution is unique under concurrent requests and survives replay after restart', async t => {
  const c = await craftingFixture(t, { level: 10, choice: 'mago' });
  await earnSealMaterials(c); await craftSeal(c);
  const results = await Promise.allSettled(['evo-a', 'evo-b'].map(operationKey =>
    c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey })));
  assert.equal(results.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(results.find(result => result.status === 'rejected').reason.code, 'UNIT_ALREADY_EVOLVED');
  const receipt = results.find(result => result.status === 'fulfilled').value.evolution;
  const coins = (await c.game.economy.getBalance(c.user.id)).coins;
  await c.game.close();
  const reopened = c.open().game;
  c.setTime('invalid');
  const replayed = await reopened.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: receipt.operationKey });
  assert.equal(replayed.alreadyEvolved, true);
  assert.deepEqual(replayed.evolution, receipt);
  c.setTime('2026-10-15T12:00:00.000Z');
  assert.equal((await reopened.economy.getBalance(c.user.id)).coins, coins);
  assert.equal(readRecords(c.directory, 'evoluciones').length, 1);
  assert.equal(readRecords(c.directory, 'economia').filter(row => row.sourceType === 'evolution_cost').length, 1);
});

test('an evolved unit cannot be evolved again by editing request arguments or another owner', async t => {
  const c = await craftingFixture(t, { level: 10 });
  await earnSealMaterials(c); await craftSeal(c);
  await c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'bound' });
  await assert.rejects(c.game.evolution.evolve({ userId: c.rival.id, unitId: c.unit.id, operationKey: 'bound' }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.evolution.evolve({ userId: c.user.id, unitId: c.opponentUnit.id, operationKey: 'bound' }), { code: 'OPERATION_CONFLICT' });
  await assert.rejects(c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'again' }), { code: 'UNIT_ALREADY_EVOLVED' });
});

test('evolution enforces level, ownership, seals and battle/market locks without resource loss', async t => {
  const c = await craftingFixture(t);
  await assert.rejects(c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'low-level' }), { code: 'EVOLUTION_LEVEL_REQUIRED' });
  await assert.rejects(c.game.evolution.evolve({ userId: c.rival.id, unitId: c.unit.id, operationKey: 'wrong-owner' }), { code: 'NOT_UNIT_OWNER' });
  assert.equal((await c.game.evolution.getOptions({ userId: c.user.id, unitId: c.unit.id })).available, false);
  const high = await craftingFixture(t, { level: 10 });
  await assert.rejects(high.game.evolution.evolve({ userId: high.user.id, unitId: high.unit.id, operationKey: 'no-seal' }), { code: 'INSUFFICIENT_MATERIALS' });
  await high.game.battle.challenge({ userId: high.user.id, opponentId: high.rival.id, chatId: high.chatId });
  await high.game.battle.accept({ userId: high.rival.id, chatId: high.chatId });
  await assert.rejects(high.game.evolution.evolve({ userId: high.user.id, unitId: high.unit.id, operationKey: 'battle-lock' }), { code: 'UNIT_LOCKED' });
  await high.game.battle.surrender({ userId: high.rival.id, chatId: high.chatId });
  await high.game.market.createListing({ sellerId: high.user.id, unitId: high.unit.id, price: 100, operationKey: 'listing' });
  await assert.rejects(high.game.evolution.evolve({ userId: high.user.id, unitId: high.unit.id, operationKey: 'market-lock' }), { code: 'UNIT_LOCKED' });
  assert.equal(readRecords(high.directory, 'evoluciones').length, 0);
});

test('failed coin debit rolls back the seal spend and leaves the unit unchanged', async t => {
  const c = await craftingFixture(t, { level: 10 });
  await earnSealMaterials(c); await craftSeal(c);
  const listing = (await c.game.market.createListing({ sellerId: c.rival.id, unitId: c.opponentUnit.id,
    price: 100, operationKey: 'spend-listing' })).listing;
  await c.game.market.buyListing({ buyerId: c.user.id, listingId: listing.code, operationKey: 'spend-coins' });
  const beforeActions = readRecords(c.directory, 'artesania');
  const beforeUnits = readRecords(c.directory, 'unidades');
  await assert.rejects(c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'poor' }), { code: 'INSUFFICIENT_COINS' });
  assert.deepEqual(readRecords(c.directory, 'artesania'), beforeActions);
  assert.deepEqual(readRecords(c.directory, 'unidades'), beforeUnits);
  assert.equal((await c.game.crafting.getInventory(c.user.id)).materials.sellos, 1);
});

test('editing a form or forging an evolution without its authoritative receipt is refused', async t => {
  const c = await craftingFixture(t, { level: 10 });
  await assert.rejects(c.storage.withTransaction(async repos => {
    const unit = await repos.units.get(c.unit.id);
    await repos.units.replace({ ...unit, evolution: { version: 1, formId: 'panda_maestro',
      receiptId: 'EVO-00000000-0000-0000-0000-000000000000', evolvedAt: unit.updatedAt } });
  }), { code: 'DATABASE_CORRUPT' });
  await earnSealMaterials(c); await craftSeal(c);
  await c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'tamper' });
  await assert.rejects(c.storage.withTransaction(async repos => {
    const unit = await repos.units.get(c.unit.id);
    await repos.units.replace({ ...unit, evolution: null });
  }), { code: 'DATABASE_CORRUPT' });
  const filename = path.join(c.directory, 'evoluciones.json');
  const clean = fs.readFileSync(filename, 'utf8');
  const records = JSON.parse(clean);
  records.records[0].statsAfter.attack += 10;
  fs.writeFileSync(filename, JSON.stringify(records));
  await assert.rejects(c.game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  const missingPolicy = JSON.parse(clean);
  delete missingPolicy.records[0].policyVersion;
  fs.writeFileSync(filename, JSON.stringify(missingPolicy));
  await assert.rejects(c.game.validateDatabase(), { code: 'DATABASE_CORRUPT' });
  fs.writeFileSync(filename, clean);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('early evolved combat, market and boss snapshots keep their four-percent form while old histories retain original stats',async t=>{
 const c=await craftingFixture(t,{level:5});
 await c.game.battle.challenge({userId:c.user.id,opponentId:c.rival.id,chatId:c.chatId,mode:'1v1'});await c.game.battle.accept({userId:c.rival.id,chatId:c.chatId});await c.game.battle.surrender({userId:c.rival.id,chatId:c.chatId});
 const oldBattle=readRecords(c.directory,'combates')[0];await earnSealMaterials(c);await craftSeal(c);
 const oldBoss=readRecords(c.directory,'accionescontenido').filter(a=>a.kind==='boss_attack');
 await c.game.evolution.evolve({userId:c.user.id,unitId:c.unit.id,operationKey:'form'});assert.deepEqual(readRecords(c.directory,'combates')[0],oldBattle);assert.deepEqual(readRecords(c.directory,'accionescontenido').filter(a=>a.kind==='boss_attack'),oldBoss);
 await c.game.battle.challenge({userId:c.user.id,opponentId:c.rival.id,chatId:c.chatId,mode:'1v1'});const b=(await c.game.battle.accept({userId:c.rival.id,chatId:c.chatId})).battle;assert.equal(b.players[0].units[0].characterName,'Panda Maestro');assert.equal(b.players[0].units[0].evolution.formId,'panda_maestro');assert.equal(b.players[0].units[0].stats.hp,133);await c.game.battle.surrender({userId:c.rival.id,chatId:c.chatId});
 const listing=(await c.game.market.createListing({sellerId:c.user.id,unitId:c.unit.id,price:100,operationKey:'evolved-listing'})).listing;assert.equal(listing.unitSnapshot.characterName,'Panda Maestro');await c.game.market.cancelListing({sellerId:c.user.id,listingId:listing.code,operationKey:'cancel-listing'});
 await c.game.teams.setTeam({userId:c.user.id,unitIds:[c.unit.id]});c.advance(86400000);const boss=await c.game.encounters.getBoss({bossId:'niebla',userId:c.user.id});await c.game.encounters.attackBoss({userId:c.user.id,chatId:c.chatId,code:boss.code,choice:'1',operationKey:'evolved-boss'});
 assert.equal(readRecords(c.directory,'accionescontenido').at(-1).details.unitSnapshot.evolution.formId,'panda_maestro');assert.equal((await c.game.validateDatabase()).valid,true);
});

const databaseState = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

test('new evolution scaling unlocks at five with four percent and caps at five percent from ten', () => {
  const form = { version: 2, formId: 'panda_maestro', receiptId: 'EVO-00000000-0000-0000-0000-000000000000', evolvedAt: '2026-10-13T12:00:00.000Z' };
  assert.equal(evolutionPolicy().minimumLevel, 5);
  assert.deepEqual(evolutionPolicy().stages, [{ minimumLevel: 5, bonusPercent: 4 }, { minimumLevel: 10, bonusPercent: 5 }]);
  for (const level of [5, 6, 7, 8, 9]) assert.equal(evolutionBonusPercent(form, level), 4);
  for (const level of [10, 11, 15, 20]) assert.equal(evolutionBonusPercent(form, level), 5);
  assert.equal(evolutionBonusPercent(null, 5), 0);
  assert.equal(validEvolutionShape({ ...form, version: '2' }, 'panda_guerrero'), false);
  assert.throws(() => evolutionPolicy(99), { code: 'INVALID_EVOLUTION' });
  assert.throws(() => evolvedStats({ hp: 128, attack: 25, defense: 23, speed: 8 }, form, 'panda_guerrero'), { code: 'INVALID_PROGRESSION' });
  assert.deepEqual(evolvedStats({ hp: 128, attack: 25, defense: 23, speed: 8 }, form, 'panda_guerrero', 5),
    { hp: 133, attack: 26, defense: 23, speed: 8 });
});

test('level four cannot spend resources, while level five can evolve with the same seal and monetary investment', async t => {
  for (const level of [4, 5]) {
    const c = await craftingFixture(t, { level }); await earnSealMaterials(c); await craftSeal(c);
    const options = await c.game.evolution.getOptions({ userId: c.user.id, unitId: c.unit.id });
    assert.equal(options.minimumLevel, 5); assert.equal(options.coins, 300); assert.equal(options.bonusPercent, 4);
    assert.equal(options.available, level === 5);
    const before = databaseState(c.directory);
    if (level === 4) {
      await assert.rejects(c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'too-soon' }),
        { code: 'EVOLUTION_LEVEL_REQUIRED', details: { minimum: 5, level: 4 } });
      assert.deepEqual(databaseState(c.directory), before);
      continue;
    }
    const r = await c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'level-five' });
    assert.equal(r.evolution.policyVersion, 2); assert.equal(r.evolution.after.version, 2); assert.equal(r.evolution.level, 5);
    assert.equal(r.evolution.coins, 300);
    assert.deepEqual(r.evolution.statsAfter, { hp: 133, attack: 26, defense: 23, speed: 8 });
    assert.equal((await c.game.crafting.getInventory(c.user.id)).materials.sellos, 0);
    assert.equal((await c.game.validateDatabase()).valid, true);
  }
});

test('earning level ten grows the bonus automatically without another seal, charge or rewriting level-nine history', async t => {
  const c = await craftingFixture(t, { level: 9, xp: 890 }); await earnSealMaterials(c); await craftSeal(c);
  const r = await c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'level-nine' });
  const battlesBefore = readRecords(c.directory, 'combates').length;
  const battle = await fightForMaterials(c);
  const snapshot = battle.players.find(p => p.userId === c.user.id).unit;
  assert.equal(snapshot.level, 9); assert.equal(snapshot.evolution.version, 2);
  assert.deepEqual(snapshot.stats, r.evolution.statsAfter);
  const unit = await c.game.units.getUnit(c.unit.id);
  assert.equal(unit.progress.level, 10); assert.equal(evolutionBonusPercent(unit.evolution, unit.progress.level), 5);
  assert.equal(unit.currentStats.defense, 25);
  assert.equal(readRecords(c.directory, 'evoluciones').length, 1);
  assert.deepEqual(readRecords(c.directory, 'evoluciones')[0], r.evolution);
  assert.equal(readRecords(c.directory, 'economia').filter(m => m.sourceType === 'evolution_cost').length, 1);
  assert.equal(readRecords(c.directory, 'combates').length, battlesBefore + 1);
  const historicalBattle = readRecords(c.directory, 'combates').at(-1);
  assert.deepEqual(historicalBattle.players.find(p => p.userId === c.user.id).unit.stats, snapshot.stats);
  assert.equal((await c.game.validateDatabase()).valid, true);
  await c.game.close();
  assert.equal((await c.open().game.validateDatabase()).valid, true);
});

test('original policy-one receipts, forms and five-percent snapshots remain valid and replayable', async t => {
  const c = await craftingFixture(t, { level: 10 }); await earnSealMaterials(c); await craftSeal(c);
  const before = databaseState(c.directory);
  const r = await c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'historical' });
  const historical = databaseState(c.directory);
  historical.evoluciones.records[0].policyVersion = 1;
  historical.evoluciones.records[0].after.version = 1;
  historical.unidades.records.find(u => u.id === c.unit.id).evolution.version = 1;
  assert.equal(validateDatabase(historical).valid, true);
  assert.throws(() => validateTransition(before, historical, { now: r.evolution.createdAt }),
    { code: 'DATABASE_CORRUPT', details: { field: 'evolution.currentPolicy' } });
  await c.game.close();
  for (const name of ['evoluciones', 'unidades']) fs.writeFileSync(path.join(c.directory, `${name}.json`), JSON.stringify(historical[name], null, 2) + '\n');
  Object.assign(c, c.open());
  assert.equal((await c.game.validateDatabase()).valid, true);
  const legacyOptions = await c.game.evolution.getOptions({ userId: c.user.id, unitId: c.unit.id });
  assert.equal(legacyOptions.bonusPercent, 5);
  await c.game.battle.challenge({ userId: c.user.id, opponentId: c.rival.id, chatId: c.chatId, mode: '1v1' });
  const b = (await c.game.battle.accept({ userId: c.rival.id, chatId: c.chatId })).battle;
  assert.equal(b.players[0].units[0].evolution.version, 1);
  assert.deepEqual(b.players[0].units[0].stats, r.evolution.statsAfter);
  const stored = databaseState(c.directory); c.setTime(null);
  const replay = await c.game.evolution.evolve({ userId: c.user.id, unitId: c.unit.id, operationKey: 'historical' });
  assert.equal(replay.alreadyEvolved, true); assert.equal(replay.evolution.policyVersion, 1);
  assert.deepEqual(databaseState(c.directory), stored);
});
