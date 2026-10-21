import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { setup, register, readRecords } from './helpers.js';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';
import { spiritsProgress } from '../game/content/spiritsRules.js';

const raw = directory => Object.fromEntries(COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

async function fixture(t, start = '2026-10-25T06:00:00.000Z', drop = 0) {
  let now = start;
  const c = setup(t, { clock: () => now, randomRoll: () => 0, randomDropInt: () => typeof drop === 'function' ? drop() : drop });
  const a = await register(c.game), b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  return { ...c, a, b, ua, ub, chatId: 'spirits@g.us', now: () => now, setTime: value => { now = value; }, advance: ms => { now = new Date(Date.parse(now) + ms).toISOString(); } };
}

async function fight(c, opponent) {
  await c.game.battle.challenge({ userId: c.a.id, opponentId: opponent.id, chatId: c.chatId, mode: 'classic' });
  let battle = (await c.game.battle.accept({ userId: opponent.id, chatId: c.chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
  return battle;
}

async function defeatBoss(c) {
  let boss = await c.game.encounters.getBoss({ bossId: 'mil_mascaras', userId: c.a.id });
  let index = 0;
  while (boss.status === 'active' && index < 40) {
    const userId = index % 2 ? c.b.id : c.a.id;
    const result = await c.game.encounters.attackBoss({ userId, chatId: c.chatId, code: boss.code, choice: '1', operationKey: `mask-hit:${index++}` });
    boss = result.boss; c.advance(30_000);
  }
  assert.equal(boss.status, 'defeated');
  return boss;
}

test('spirits mechanics open at the Faroles deadline and close at the exact event deadline', async t => {
  const c = await fixture(t, '2026-10-25T05:59:59.999Z');
  assert.equal((await c.game.spirits.getState()).status, 'upcoming');
  await assert.rejects(c.game.encounters.getBoss({ bossId: 'mil_mascaras' }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.spirits.claimSeal({ userId: c.a.id, seal: 1, operationKey: 'early-seal' }), { code: 'EVENT_NOT_ACTIVE' });
  assert.equal(readRecords(c.directory, 'encuentros').length, 0);
  c.setTime('2026-10-25T06:00:00.000Z');
  const boss = await c.game.encounters.getBoss({ bossId: 'mascaras', userId: c.a.id });
  assert.equal((await c.game.encounters.getBoss({ bossId: 'mil_mascaras' })).id, boss.id);
  assert.equal((await c.game.spirits.getState()).status, 'active');
  c.setTime('2026-11-02T06:00:00.000Z');
  assert.equal((await c.game.spirits.getState()).status, 'ended');
  await assert.rejects(c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, operationKey: 'late-hit' }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.spirits.claimSeal({ userId: c.a.id, seal: 'luz', operationKey: 'late-seal' }), { code: 'EVENT_NOT_ACTIVE' });
  assert.equal(readRecords(c.directory, 'accionesespiritus').length, 0);
});

test('mask rotation changes real defense and accuracy, remains shared across groups and freezes on restart', async t => {
  const c = await fixture(t);
  let boss = await c.game.encounters.getBoss({ bossId: 'mil_mascaras', userId: c.a.id });
  assert.equal(boss.mask.id, 'jade');
  const actions = [];
  for (let i = 0; i < 7; i++) {
    const result = await c.game.encounters.attackBoss({ userId: c.a.id, chatId: i % 2 ? 'another@g.us' : c.chatId, code: boss.code, choice: '1', operationKey: `rotation:${i}` });
    actions.push(result.action.details); boss = result.boss; c.advance(30_000);
  }
  assert.deepEqual(actions.map(row => row.maskId), ['jade', 'jade', 'jade', 'azul', 'azul', 'azul', 'carmesi']);
  assert.equal(actions[0].effectiveDefense, 46);
  assert.equal(actions[3].effectiveAccuracy, 85);
  assert.equal(actions[6].effectiveDefense, 14);
  assert.ok(actions[6].damage > actions[0].damage);
  await c.game.close();
  const reopened = c.open().game;
  assert.equal((await reopened.encounters.getBoss({ bossId: boss.code })).mask.id, 'carmesi');
  assert.equal((await reopened.validateDatabase()).valid, true);
});

test('three spiritual seals unlock both limited characters once without spending coins, XP or tickets', async t => {
  const c = await fixture(t);
  for (let index = 0; index < 3; index++) {
    let opponent = c.b;
    if (index > 0) {
      opponent = await register(c.game, `Rival ${index}`, `52100000000${index}`);
      const unit = (await c.game.starter.claimStarter({ userId: opponent.id, choice: 'lobo' })).unit;
      await c.game.teams.setTeam({ userId: opponent.id, unitIds: [unit.id] });
    }
    await fight(c, opponent);
  }
  const earned = await c.game.spirits.getState({ userId: c.a.id });
  assert.ok(earned.fragments >= 6);
  await c.game.spirits.claimSeal({ userId: c.a.id, seal: 'luz', operationKey: 'seal:1' });
  await assert.rejects(c.game.spirits.redeem({ userId: c.a.id, character: 'zorro', operationKey: 'too-early' }), { code: 'SPIRITS_SEALS_REQUIRED' });
  await defeatBoss(c);
  await c.game.spirits.claimSeal({ userId: c.a.id, seal: '2', operationKey: 'seal:2' });
  await c.game.spirits.claimSeal({ userId: c.a.id, seal: 'nombre', operationKey: 'seal:3' });
  const before = readRecords(c.directory, 'usuarios').find(user => user.id === c.a.id);
  const race = await Promise.all(['first', 'second'].map(key => c.game.spirits.redeem({ userId: c.a.id, character: 'zorro', operationKey: `redeem:${key}` })));
  assert.deepEqual(race.map(result => result.alreadyClaimed), [false, true]);
  assert.equal(race[0].unit.id, race[1].unit.id);
  const guardian = await c.game.spirits.redeem({ userId: c.a.id, character: 'guardian', operationKey: 'redeem:guardian' });
  assert.equal(guardian.unit.origin.type, 'spirits');
  assert.equal(readRecords(c.directory, 'usuarios').find(user => user.id === c.a.id).economy.coins, before.economy.coins);
  assert.equal(readRecords(c.directory, 'accionesespiritus').length, 5);
  const state = raw(c.directory);
  assert.equal(validateDatabase(state).valid, true);
  const corrupt = structuredClone(state);
  corrupt.accionesespiritus.records[0].evidence.fragments++;
  assert.throws(() => validateDatabase(corrupt), { code: 'DATABASE_CORRUPT' });
  c.setTime('2026-11-02T06:00:00.000Z');
  assert.equal((await c.game.spirits.redeem({ userId: c.a.id, character: 'guardian', operationKey: 'redeem:guardian' })).unit.id, guardian.unit.id);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('fragments reject surrender, old matches and repeated rivals, with at most three unique rivals daily', () => {
  const campaign = { id: 'espiritus_2026', startsAt: '2026-10-25T06:00:00.000Z', endsAt: '2026-11-02T06:00:00.000Z' };
  const battle = (id, rival, extra = {}) => ({ id, status: 'finished', acceptedAt: campaign.startsAt, finishedAt: '2026-10-25T08:00:00.000Z',
    settlement: { reason: 'rewarded' }, winnerId: 'a', players: [{ userId: 'a' }, { userId: rival }], ...extra });
  const state = { campanas: { records: [campaign] }, combates: { records: [battle('1', 'b'), battle('2', 'b'), battle('3', 'c'), battle('4', 'd'), battle('5', 'e'),
    battle('old', 'f', { acceptedAt: '2026-10-24T08:00:00.000Z' }), battle('surrender', 'g', { status: 'surrendered' })] } };
  const progress = spiritsProgress(state, 'a', '2026-10-25T09:00:00.000Z');
  assert.equal(progress.fragments, 9);
  assert.deepEqual(progress.fragmentBattleIds, ['1', '3', '4']);
});

test('Fatality has one frozen opening roll per unit and community encounter and cannot be reused', async t => {
  const c = await fixture(t);
  const unit = await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'guardian_mil_mascaras', origin: { type: 'admin', sourceId: 'fatality-fixture' }, operationKey: 'fatality-unit' });
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [unit.id] });
  const boss = await c.game.encounters.getBoss({ userId: c.a.id });
  const first = await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: 'open-fatality' });
  assert.equal(first.action.details.unitSnapshot.fatality.roll, 0);
  assert.ok(first.boss.availableAttacks.some(attack => attack.choice === '3'));
  c.advance(30_000);
  const used = await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '3', operationKey: 'use-fatality' });
  assert.equal(used.boss.availableAttacks.some(attack => attack.choice === '3'), false);
  c.advance(30_000);
  await assert.rejects(c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '3', operationKey: 'abuse-fatality' }), { code: 'FATALITY_ALREADY_USED' });
  await c.game.close();
  const reopened = c.open({ randomDropInt: () => 99 }).game;
  const next = await reopened.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: 'after-restart' });
  assert.equal(next.action.details.unitSnapshot.fatality.roll, 0);
  assert.equal(next.action.details.unitSnapshot.fatality.used, true);
  assert.equal((await reopened.validateDatabase()).valid, true);
});

test('requesting Fatality before the opening is committed cannot reroll it until it unlocks', async t => {
  let rolls = 0;
  const c = await fixture(t, '2026-10-25T06:00:00.000Z', () => { rolls++; return 99; });
  const unit = await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'zorro_llamas_errantes', origin: { type: 'admin', sourceId: 'fixed-opening' }, operationKey: 'fox-unit' });
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [unit.id] });
  const boss = await c.game.encounters.getBoss({ userId: c.a.id });
  for (let index = 0; index < 3; index++) await assert.rejects(c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId,
    code: boss.code, choice: '3', operationKey: `skip-opening:${index}` }), { code: 'FATALITY_NOT_AVAILABLE' });
  assert.equal(rolls, 0);
  assert.equal(readRecords(c.directory, 'accionescontenido').length, 0);
  const opened = await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: 'real-opening' });
  assert.equal(opened.action.details.unitSnapshot.fatality.roll, 99);
  assert.equal(opened.action.details.unitSnapshot.fatality.unlocked, false);
  assert.equal(rolls, 2);
  c.advance(30_000);
  const second = await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: 'fixed-second' });
  assert.equal(second.action.details.unitSnapshot.fatality.roll, 99);
  assert.equal(rolls, 3);
});

let recoveryFixture;
async function recoveryState(t) {
  recoveryFixture ??= (async () => {
    const c = await fixture(t);
    for (let index = 0; index < 3; index++) {
      const rival = index ? await register(c.game, `Recovery ${index}`, `52140000000${index}`) : c.b;
      if (index) {
        const { unit } = await c.game.starter.claimStarter({ userId: rival.id, choice: 'lobo' });
        await c.game.teams.setTeam({ userId: rival.id, unitIds: [unit.id] });
      }
      await fight(c, rival);
    }
    await defeatBoss(c);
    const snapshot = () => Object.fromEntries([...COLLECTIONS.map(name => `${name}.json`), '_database.json']
      .map(file => [file, fs.readFileSync(path.join(c.directory, file), 'utf8')]));
    const beforeSeals = snapshot();
    for (const seal of ['luz', 'mascaras', 'nombre']) await c.game.spirits.claimSeal({ userId: c.a.id, seal, operationKey: `baseline:${seal}` });
    const beforeRedeem = snapshot(), state = raw(c.directory);
    await c.game.close();
    return { beforeSeals, beforeRedeem, state, userId: c.a.id, now: c.now() };
  })();
  return recoveryFixture;
}

for (const [kind, stages] of [
  ['seal', ['prepared', 'committed', 'published:accionesespiritus.json', 'published:_database.json']],
  ['redeem', ['prepared', 'committed', 'published:unidades.json', 'published:estado.json', 'published:eventos.json', 'published:accionesespiritus.json', 'published:_database.json']]
]) for (const stage of stages) {
  test(`spiritual ${kind} recovers atomically at ${stage} with one receipt and no duplicated assets`, async t => {
    const baseline = await recoveryState(t);
    const c = setup(t, { clock: () => baseline.now });
    await c.game.close();
    const files = kind === 'seal' ? baseline.beforeSeals : baseline.beforeRedeem;
    for (const [file, contents] of Object.entries(files)) fs.writeFileSync(path.join(c.directory, file), contents);
    const failed = c.open({ fault: current => { if (current === stage) throw new Error('spiritual reward interrupted'); } }).game;
    const request = kind === 'seal'
      ? { userId: baseline.userId, seal: 'luz', operationKey: 'recover:seal' }
      : { userId: baseline.userId, character: 'zorro', operationKey: 'recover:redeem' };
    const method = kind === 'seal' ? 'claimSeal' : 'redeem';
    await assert.rejects(failed.spirits[method](request), { code: 'STORAGE_WRITE_FAILED' });
    await failed.close();
    const recovered = c.open().game;
    const replay = await recovered.spirits[method](request);
    assert.equal(replay.alreadyClaimed, stage !== 'prepared');
    const result = raw(c.directory);
    assert.equal(result.accionesespiritus.records.filter(action => action.operationKey === request.operationKey).length, 1);
    assert.deepEqual(result.usuarios.records, baseline.state.usuarios.records);
    assert.deepEqual(result.premioscontenido.records, baseline.state.premioscontenido.records);
    assert.deepEqual(result.economia.records, baseline.state.economia.records);
    if (kind === 'redeem') {
      assert.equal(result.unidades.records.filter(unit => unit.characterId === 'zorro_llamas_errantes').length, 1);
      assert.equal(result.eventos.records.filter(event => event.unitId === replay.unit.id).length, 1);
      assert.equal(result.estado.records.find(row => row.id === 'mint:zorro_llamas_errantes').issuedCount, 1);
    }
    const beforeReplay = raw(c.directory);
    assert.equal((await recovered.spirits[method](request)).alreadyClaimed, true);
    assert.deepEqual(raw(c.directory), beforeReplay);
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
    assert.equal((await recovered.validateDatabase()).valid, true);
  });
}

test('exhausted global stock leaves the earned seals and every ledger intact', async t => {
  const baseline = await recoveryState(t);
  const c = setup(t, { clock: () => baseline.now });
  await c.game.close();
  for (const [file, contents] of Object.entries(baseline.beforeRedeem)) fs.writeFileSync(path.join(c.directory, file), contents);
  const opened = c.open();
  await opened.storage.withTransaction(async repos => {
    const character = await repos.characters.get('zorro_llamas_errantes');
    await repos.characters.replace({ ...character, revision: character.revision + 1, supply: { ...character.supply, max: 1 } });
  });
  await opened.game.units.createUnit({ ownerId: baseline.state.usuarios.records[1].id, characterId: 'zorro_llamas_errantes',
    origin: { type: 'admin', sourceId: 'stock-fixture' }, operationKey: 'last-fox' });
  const before = raw(c.directory);
  await assert.rejects(opened.game.spirits.redeem({ userId: baseline.userId, character: 'zorro', operationKey: 'stock-is-gone' }), { code: 'SUPPLY_EXHAUSTED' });
  assert.deepEqual(raw(c.directory), before);
  assert.equal((await opened.game.spirits.getState({ userId: baseline.userId })).seals.filter(seal => seal.claimed).length, 3);
  assert.equal((await opened.game.validateDatabase()).valid, true);
});

test('a theatre started in the last hour expires at the campaign boundary', async t => {
  const c = await fixture(t, '2026-11-02T05:30:00.000Z');
  const boss = await c.game.encounters.getBoss({ bossId: 'mil_mascaras', userId: c.a.id });
  assert.equal(boss.expiresAt, '2026-11-02T06:00:00.000Z');
  assert.equal((await c.game.spirits.getState()).revenge.active, true);
  c.setTime('2026-11-02T06:00:00.000Z');
  await c.game.encounters.sweepExpired();
  assert.equal((await c.game.encounters.getBoss({ bossId: boss.code })).status, 'expired');
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('replaying a confirmed theatre attack after closing returns its receipt with an expired encounter', async t => {
  const c = await fixture(t, '2026-11-02T05:59:00.000Z');
  const boss = await c.game.encounters.getBoss({ bossId: 'mil_mascaras', userId: c.a.id });
  const request = { userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: 'last-minute-hit' };
  const first = await c.game.encounters.attackBoss(request);
  c.setTime('invalid-clock');
  assert.equal((await c.game.encounters.attackBoss(request)).action.id, first.action.id);
  c.setTime('2026-11-02T06:00:00.000Z');
  const before = raw(c.directory);
  const replay = await c.game.encounters.attackBoss(request);
  assert.equal(replay.duplicate, true);
  assert.equal(replay.action.id, first.action.id);
  assert.equal(replay.boss.status, 'expired');
  assert.equal(replay.boss.nextEncounterAt, null);
  assert.deepEqual(readRecords(c.directory, 'accionescontenido'), before.accionescontenido.records);
  assert.deepEqual(readRecords(c.directory, 'premioscontenido'), before.premioscontenido.records);
  assert.equal((await c.game.validateDatabase()).valid, true);
});
