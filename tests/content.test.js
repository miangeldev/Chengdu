import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { COLLECTIONS, validateDatabase, validateTransition } from '../storage/validation.js';
import { achievementProgress, contentPeriod, missionProgress } from '../game/content/objectives.js';
import { readRecords, register, setup, updateCharacter } from './helpers.js';

const raw = directory => Object.fromEntries(COLLECTIONS.map(name => [name, JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));
async function fixture(t) {
  let now = '2026-10-11T20:00:00.000Z';
  const c = setup(t, { clock: () => now, randomRoll: () => 0, randomDropInt: () => 0 });
  const a = await register(c.game), b = await register(c.game, 'Lukas', '521111111111');
  const ua = (await c.game.starter.claimStarter({ userId: a.id, choice: 'panda' })).unit;
  const ub = (await c.game.starter.claimStarter({ userId: b.id, choice: 'lobo' })).unit;
  await c.game.teams.setTeam({ userId: a.id, unitIds: [ua.id] });
  await c.game.teams.setTeam({ userId: b.id, unitIds: [ub.id] });
  return { ...c, a, b, ua, ub, chatId: 'beta-content@g.us', setTime: value => { now = value; }, advance: ms => { now = new Date(Date.parse(now) + ms).toISOString(); } };
}
async function welcome(c, user = c.a) {
  return c.game.content.claimEvent({ userId: user.id, eventId: 'faroles', operationKey: `welcome:${user.id}` });
}
async function fight(c, opponent = c.b) {
  await c.game.battle.challenge({ userId: c.a.id, opponentId: opponent.id, chatId: c.chatId, mode: 'classic' });
  let battle = (await c.game.battle.accept({ userId: opponent.id, chatId: c.chatId })).battle;
  while (battle.status === 'active') battle = (await c.game.battle.attack({ userId: battle.turnUserId, chatId: c.chatId, choice: '2' })).battle;
  return battle;
}

test('missions count five eligible matches and three participating species, with one daily reward and interleaved XP', async t => {
  const c = await fixture(t);
  await assert.rejects(c.game.content.claimMission({ userId: c.a.id, code: '1', operationKey: 'too-soon' }), { code: 'MISSION_NOT_READY' });
  await fight(c); await welcome(c); await fight(c);
  const claimed = await c.game.content.claimMission({ userId: c.a.id, code: '1', operationKey: 'win-mission' });
  assert.equal(claimed.reward.coins, 40);
  assert.equal(claimed.reward.ticketsAfter, 2);
  await c.game.content.claimAchievement({ userId: c.a.id, code: 'L1', operationKey: 'first-win' });
  const mage = await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'mago_carmesi', origin: { type: 'admin', sourceId: 'content-tests' }, operationKey: 'mage' });
  const monk = await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'monje_celestial', origin: { type: 'admin', sourceId: 'content-tests' }, operationKey: 'monk' });
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [mage.id] }); await fight(c);
  const third = await register(c.game, 'Ana', '521222222222');
  const { unit } = await c.game.starter.claimStarter({ userId: third.id, choice: 'lobo' });
  await c.game.teams.setTeam({ userId: third.id, unitIds: [unit.id] });
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [monk.id] }); await fight(c, third);
  await c.game.teams.setTeam({ userId: c.a.id, unitIds: [c.ua.id] }); await fight(c, third);
  const missions = await c.game.content.getMissions(c.a.id);
  assert.deepEqual(missions.missions.map(mission => mission.current), [4, 5, 3]);
  for (const code of ['2', '3']) assert.equal((await c.game.content.claimMission({ userId: c.a.id, code, operationKey: `mission:${code}` })).alreadyClaimed, false);
  const before = raw(c.directory);
  assert.equal((await c.game.content.claimMission({ userId: c.a.id, code: '1', operationKey: 'another-message' })).alreadyClaimed, true);
  assert.deepEqual(raw(c.directory), before);
  c.setTime('2026-10-12T06:00:00.000Z');
  assert.deepEqual((await c.game.content.getMissions(c.a.id)).missions.map(mission => mission.current), [0, 0, 0]);
  assert.equal((await c.game.content.claimMission({ userId: c.a.id, code: '1', operationKey: 'win-mission' })).reward.id, claimed.reward.id);
  await assert.rejects(c.game.content.claimMission({ userId: c.a.id, code: '1', operationKey: 'next-day' }), { code: 'MISSION_NOT_READY' });
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('early surrender and repeated rivals cannot farm missions or preserve an undefeated streak', async t => {
  const c = await fixture(t);
  await c.game.battle.challenge({ userId: c.a.id, opponentId: c.b.id, chatId: c.chatId, mode: 'classic' });
  await c.game.battle.accept({ userId: c.b.id, chatId: c.chatId });
  await c.game.battle.surrender({ userId: c.b.id, chatId: c.chatId });
  assert.deepEqual((await c.game.content.getMissions(c.a.id)).missions.map(m => m.current), [0, 0, 0]);
  for (let index = 0; index < 4; index++) await fight(c);
  assert.equal((await c.game.content.getMissions(c.a.id)).missions[1].current, 3);
  assert.equal(achievementProgress(raw(c.directory), c.a.id, 'undefeated').current, 3);
  assert.equal(readRecords(c.directory, 'premioscontenido').length, 0);
});

test('objective calendars use CDMX midnight; historical acquisitions are unique and achievements stay permanent', async t => {
  assert.equal(contentPeriod('2026-10-12T05:59:59.999Z'), '2026-10-11');
  assert.equal(contentPeriod('2026-10-12T06:00:00.000Z'), '2026-10-12');
  const c = await fixture(t); await fight(c);
  const achievements = await c.game.content.getAchievements(c.a.id);
  assert.equal(achievements.items[0].unlocked, true);
  assert.equal((await c.game.content.getInventory(c.a.id)).titles.includes('Primer filo'), true);
  const claimed = await c.game.content.claimAchievement({ userId: c.a.id, code: 'l1', operationKey: 'achievement' });
  await welcome(c, c.b);
  const listing = (await c.game.market.createListing({ sellerId: c.a.id, unitId: c.ua.id, price: 20, operationKey: 'sell-starter' })).listing;
  await c.game.market.buyListing({ buyerId: c.b.id, listingId: listing.code, operationKey: 'buy-starter' });
  assert.equal(achievementProgress(raw(c.directory), c.a.id, 'collector').current, 1);
  assert.equal((await c.game.content.getInventory(c.a.id)).titles.includes('Primer filo'), true);
  await c.game.close(); const reopened = c.open().game;
  c.setTime('invalid-clock');
  assert.equal((await reopened.content.claimAchievement({ userId: c.a.id, code: 'L1', operationKey: 'achievement' })).reward.id, claimed.reward.id);
});

test('event welcome is unique under concurrency and captures spend a ticket only for the winner', async t => {
  const c = await fixture(t);
  const welcomeRace = await Promise.all([welcome(c), c.game.content.claimEvent({ userId: c.a.id, eventId: 'faroles_2026', operationKey: 'another-welcome' })]);
  assert.deepEqual(welcomeRace.map(result => result.alreadyClaimed), [false, true]);
  await welcome(c, c.b);
  const spawn = await c.game.encounters.createSpawn({ characterId: 'panda_guerrero', chatId: c.chatId });
  await assert.rejects(c.game.encounters.capture({ userId: c.a.id, chatId: 'other@g.us', code: spawn.code, operationKey: 'wrong-group' }), { code: 'SPAWN_WRONG_CHAT' });
  const race = await Promise.allSettled([c.a, c.b].map(user => c.game.encounters.capture({ userId: user.id, chatId: c.chatId, code: spawn.code, operationKey: `capture:${user.id}` })));
  assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(race.find(result => result.status === 'rejected').reason.code, 'SPAWN_NOT_ACTIVE');
  const winner = race.find(result => result.status === 'fulfilled').value;
  assert.equal(winner.unit.id, 'PAND-000002');
  assert.equal((await c.game.content.getInventory(winner.unit.ownerId)).tickets, 0);
  const loser = winner.unit.ownerId === c.a.id ? c.b : c.a;
  assert.equal((await c.game.content.getInventory(loser.id)).tickets, 1);
  await c.game.close(); const reopened = c.open().game;
  c.setTime('invalid-clock');
  const replay = await reopened.encounters.capture({ userId: winner.unit.ownerId, chatId: c.chatId, code: spawn.code, operationKey: `capture:${winner.unit.ownerId}` });
  assert.equal(replay.alreadyCaptured, true);
  assert.equal(readRecords(c.directory, 'premioscontenido').filter(reward => reward.kind === 'spawn').length, 1);
});

test('insufficient tickets and exhausted supply leave the mint and ticket ledger unchanged', async t => {
  const c = await fixture(t);
  await updateCharacter(c.storage, 'zorro_faroles', { supply: { type: 'limited', max: 1 } });
  const first = await c.game.encounters.createSpawn({ characterId: 'zorro_faroles', chatId: c.chatId });
  const second = await c.game.encounters.createSpawn({ characterId: 'zorro_faroles', chatId: 'other@g.us' });
  const before = raw(c.directory);
  await assert.rejects(c.game.encounters.capture({ userId: c.a.id, chatId: c.chatId, code: first.code, operationKey: 'no-ticket' }), { code: 'INSUFFICIENT_TICKETS' });
  assert.deepEqual(raw(c.directory), before);
  await welcome(c); await welcome(c, c.b);
  await c.game.encounters.capture({ userId: c.a.id, chatId: c.chatId, code: first.code, operationKey: 'last-unit' });
  const exhausted = raw(c.directory);
  await assert.rejects(c.game.encounters.capture({ userId: c.b.id, chatId: 'other@g.us', code: second.code, operationKey: 'exhausted' }), { code: 'SUPPLY_EXHAUSTED' });
  assert.deepEqual(raw(c.directory), exhausted);
});

test('event issuance closes exactly at the deadline while historical units and purchases keep working', async t => {
  const c = await fixture(t); await welcome(c); await welcome(c, c.b);
  c.setTime('2026-10-25T05:59:59.999Z');
  const spawn = await c.game.encounters.createSpawn({ characterId: 'zorro_faroles', chatId: c.chatId });
  assert.equal(spawn.expiresAt, '2026-10-25T06:00:00.000Z');
  const caught = await c.game.encounters.capture({ userId: c.a.id, chatId: c.chatId, code: spawn.code, operationKey: 'event-capture' });
  const listing = (await c.game.market.createListing({ sellerId: c.a.id, unitId: caught.unit.id, price: 20, operationKey: 'event-sale' })).listing;
  c.setTime('2026-10-25T06:00:00.000Z');
  assert.equal((await c.game.content.getEvent('faroles')).status, 'ended');
  await assert.rejects(c.game.units.createUnit({ ownerId: c.a.id, characterId: 'zorro_faroles', origin: { type: 'admin', sourceId: 'closed' }, operationKey: 'closed-mint' }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.encounters.createSpawn({ characterId: 'guardian_espectral', chatId: 'next@g.us' }), { code: 'CHARACTER_UNAVAILABLE' });
  assert.equal((await c.game.market.buyListing({ buyerId: c.b.id, listingId: listing.code, operationKey: 'historic-event-purchase' })).unit.id, caught.unit.id);
  const replay = await c.game.encounters.capture({ userId: c.a.id, chatId: c.chatId, code: spawn.code, operationKey: 'event-capture' });
  assert.equal(replay.alreadyCaptured, true);
  assert.equal(replay.unit.ownerId, c.b.id);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('spawn checks allow one chance per time window, ignore message volume and preserve the one-hour group cooldown across restart', async t => {
  const c = await fixture(t);
  const first = await c.game.encounters.observeActivity({ userId: c.a.id, chatId: c.chatId, messageId: 'first' });
  assert.equal(first.spawned, true);
  for (let i = 0; i < 40; i++) assert.equal((await c.game.encounters.observeActivity({ userId: c.b.id, chatId: c.chatId, messageId: `spam:${i}` })).spawned, false);
  assert.equal(readRecords(c.directory, 'accionescontenido').length, 1);
  c.advance(600_000);
  const expired = await c.game.encounters.capture({ userId: c.a.id, chatId: c.chatId, code: first.spawn.code, operationKey: 'late' }).catch(error => error);
  assert.equal(expired.code, 'SPAWN_EXPIRED');
  assert.equal(readRecords(c.directory, 'encuentros')[0].status, 'expired');
  c.advance(1_200_000);
  assert.equal((await c.game.encounters.observeActivity({ userId: c.a.id, chatId: c.chatId, messageId: 'next-window' })).spawned, false);
  await c.game.close(); const reopened = c.open().game;
  c.setTime('2026-10-11T20:59:59.999Z');
  assert.equal((await reopened.encounters.observeActivity({ userId: c.b.id, chatId: c.chatId, messageId: 'before-gap' })).spawned, false);
  c.setTime('2026-10-11T21:00:00.000Z');
  const second = await reopened.encounters.observeActivity({ userId: c.b.id, chatId: c.chatId, messageId: 'after-gap' });
  assert.equal(second.spawned, true);
  assert.notEqual(second.spawn.code, first.spawn.code);
  assert.equal((await reopened.encounters.observeActivity({ userId: c.a.id, chatId: c.chatId, messageId: 'first' })).alreadyChecked, true);
});

test('boss damage is shared across groups, cooldown prevents farming, and final rewards reach all contributors exactly once', async t => {
  const c = await fixture(t);
  const secondPanda = (await c.game.starter.claimStarter({ userId: c.b.id, choice: 'panda' })).unit;
  // Existing starter remains Lobo; mint a Panda through the trusted API.
  const panda = secondPanda.characterId === 'panda_guerrero' ? secondPanda : await c.game.units.createUnit({ ownerId: c.b.id, characterId: 'panda_guerrero', origin: { type: 'admin', sourceId: 'boss-tests' }, operationKey: 'second-panda' });
  await c.game.teams.setTeam({ userId: c.b.id, unitIds: [panda.id] });
  let boss = await c.game.encounters.getBoss();
  const first = await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '2', operationKey: 'first-boss-attack' });
  boss = first.boss;
  await assert.rejects(c.game.encounters.attackBoss({ userId: c.a.id, chatId: 'different@g.us', code: boss.code, choice: '2', operationKey: 'group-hopping' }), { code: 'BOSS_COOLDOWN' });
  assert.equal((await c.game.encounters.getBoss({ userId: c.b.id })).hp, boss.hp);
  let index = 0;
  while (boss.hp > 78) {
    c.advance(30_000);
    boss = (await c.game.encounters.attackBoss({ userId: index % 2 ? c.a.id : c.b.id, chatId: c.chatId, code: boss.code, choice: '2', operationKey: `attack:${++index}` })).boss;
  }
  c.advance(30_000);
  const race = await Promise.allSettled([c.a, c.b].map(user => c.game.encounters.attackBoss({ userId: user.id, chatId: c.chatId, code: boss.code, choice: '2', operationKey: `last:${user.id}` })));
  assert.equal(race.filter(result => result.status === 'fulfilled').length, 1);
  assert.equal(race.find(result => result.status === 'rejected').reason.code, 'BOSS_NOT_ACTIVE');
  const rewards = readRecords(c.directory, 'premioscontenido').filter(reward => reward.kind === 'boss');
  assert.equal(rewards.length, 2);
  assert.equal(rewards.reduce((total, reward) => total + reward.coins, 0), 220);
  assert.equal(rewards.reduce((total, reward) => total + reward.userXp, 0), 55);
  assert.equal(readRecords(c.directory, 'accionescontenido').reduce((sum, action) => sum + action.details.damage, 0), 1000);
  assert.equal((await c.game.units.getUnit(c.ua.id)).progress.xp, 0);
  assert.equal((await c.game.users.getUser(c.a.id)).battleStats.matches, 0);
  const before = raw(c.directory);
  c.setTime('bad-clock');
  assert.equal((await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '2', operationKey: 'first-boss-attack' })).duplicate, true);
  assert.deepEqual(raw(c.directory), before);
});

test('boss attack limits and expiration remain effective after restart', async t => {
  const c = await fixture(t);
  const boss = await c.game.encounters.getBoss({ bossId: 'dragon' });
  for (let index = 0; index < 20; index++) {
    await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: `dragon:${index}` });
    c.advance(30_000);
  }
  await c.game.close(); const reopened = c.open().game;
  await assert.rejects(reopened.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: 'dragon:21' }), { code: 'BOSS_ATTACK_LIMIT' });
  c.setTime(boss.expiresAt);
  await assert.rejects(reopened.encounters.attackBoss({ userId: c.b.id, chatId: c.chatId, code: boss.code, choice: '1', operationKey: 'dragon:expired' }), { code: 'BOSS_EXPIRED' });
  assert.equal(readRecords(c.directory, 'encuentros')[0].status, 'expired');
  assert.equal(readRecords(c.directory, 'premioscontenido').length, 0);
});

test('content receipt, encounter snapshots, order and rewards cannot be tampered with', async t => {
  const c = await fixture(t); await welcome(c);
  const boss = await c.game.encounters.getBoss();
  await c.game.encounters.attackBoss({ userId: c.a.id, chatId: c.chatId, code: boss.code, operationKey: 'protected-action' });
  const before = raw(c.directory);
  for (const change of [state => state.premioscontenido.records[0].ticketsAfter++, state => state.premioscontenido.records[0].userXp++,
    state => state.encuentros.records[0].hp++, state => state.accionescontenido.records[0].details.damage++, state => state.campanas.records[0].endsAt = '2026-10-10T00:00:00.000Z']) {
    const state = structuredClone(before); change(state);
    assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
  }
  const altered = structuredClone(before); altered.campanas.records[0].name = 'Otra edición';
  assert.throws(() => validateTransition(before, altered), { code: 'DATABASE_CORRUPT' });
  assert.deepEqual(raw(c.directory), before);
});

test('permanent objective calculations cover 25 unique acquisitions, 100 matches and ten consecutive victories', () => {
  const battles = Array.from({ length: 100 }, (_, index) => ({ id: `B${index}`, acceptedAt: '2026-10-11T12:00:00.000Z', finishedAt: '2026-10-11T13:00:00.000Z',
    status: 'finished', settlement: { reason: 'rewarded' }, winnerId: index < 10 ? 'a' : 'b', players: [{ userId: 'a', unit: { characterId: 'panda' } }, { userId: 'b', unit: { characterId: 'lobo' } }] }));
  const events = Array.from({ length: 25 }, (_, index) => ({ unitId: `U${index}`, toOwnerId: 'a', createdAt: '2026-10-11T12:00:00.000Z' }));
  const state = { combates: { records: battles }, eventos: { records: [...events, ...events] } };
  assert.equal(achievementProgress(state, 'a', 'collector').current, 25);
  assert.equal(achievementProgress(state, 'a', 'veteran').current, 100);
  assert.equal(achievementProgress(state, 'a', 'undefeated').current, 10);
  assert.equal(missionProgress(state, 'a', '2026-10-11').characters.length, 1);
});

test('the collector title and its ticket reward unlock once after 25 real audited emissions', async t => {
  const c = await fixture(t);
  for (let index = 0; index < 24; index++) await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'panda_guerrero',
    origin: { type: 'admin', sourceId: 'collector-proof' }, operationKey: `collector:${index}` });
  const achievement = (await c.game.content.getAchievements(c.a.id)).items.find(row => row.code === 'L2');
  assert.equal(achievement.current, 25); assert.equal(achievement.unlocked, true);
  const result = await c.game.content.claimAchievement({ userId: c.a.id, code: 'L2', operationKey: 'collector-reward' });
  assert.equal(result.reward.ticketsAfter, 3);
  assert.equal(result.reward.userXp, 75);
  await c.game.units.createUnit({ ownerId: c.a.id, characterId: 'panda_guerrero', origin: { type: 'admin', sourceId: 'collector-proof' }, operationKey: 'collector:extra' });
  assert.equal((await c.game.content.claimAchievement({ userId: c.a.id, code: 'L2', operationKey: 'collector-retry' })).alreadyClaimed, true);
  assert.equal(readRecords(c.directory, 'logros').length, 1);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('packs also respect event issuance windows, keep closed units and recover original paid openings', async t => {
  const c = await fixture(t); await welcome(c);
  await c.storage.withTransaction(async repos => {
    const pack = await repos.packs.get('basico');
    await repos.packs.replace({ ...pack, revision: pack.revision + 1, price: 20, pool: [{ rarity: 'rare', weight: 100, characterIds: ['zorro_faroles'] }] });
  });
  c.setTime('2026-10-11T05:59:59.999Z');
  assert.equal((await c.game.packs.listPacks()).items[0].available, false);
  c.setTime('2026-10-11T20:00:00.000Z');
  const request = { userId: c.a.id, packId: 'basico', operationKey: 'event-pack' };
  const opened = await c.game.packs.openPack(request);
  assert.equal(opened.unit.characterId, 'zorro_faroles');
  c.setTime('2026-10-25T06:00:00.000Z');
  assert.equal((await c.game.packs.listPacks()).items[0].available, false);
  const before = raw(c.directory);
  await assert.rejects(c.game.packs.openPack({ ...request, operationKey: 'closed-pack' }), { code: 'PACK_UNAVAILABLE' });
  assert.equal((await c.game.packs.openPack(request)).alreadyOpened, true);
  assert.deepEqual(raw(c.directory), before);
});
