import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { seedCampaigns } from '../game/content/catalog.js';
import { seedSpiritsCampaign, seedSpiritsCharacters } from '../game/content/spiritsCatalog.js';
import { eventRevenge, revengeCampaignIds, spawnWeights, SPIRITS_RELEASE_AT } from '../game/content/eventPolicy.js';
import { COLLECTIONS, validateDatabase, validateTransition } from '../storage/validation.js';
import { readRecords, register, setup, updateCharacter } from './helpers.js';

const raw = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

test('the successor starts at the exact Faroles deadline and both revenge windows last 24 hours', () => {
  const faroles = seedCampaigns()[0], spirits = seedSpiritsCampaign(SPIRITS_RELEASE_AT);
  assert.equal(spirits.startsAt, faroles.endsAt);
  for (const event of [faroles, spirits]) {
    const revenge = eventRevenge(event, event.endsAt);
    assert.equal(Date.parse(event.endsAt) - Date.parse(revenge.startsAt), 86_400_000);
    assert.equal(eventRevenge(event, new Date(Date.parse(revenge.startsAt) - 1).toISOString()).active, false);
    assert.equal(eventRevenge(event, revenge.startsAt).active, true);
    assert.equal(eventRevenge(event, new Date(Date.parse(event.endsAt) - 1).toISOString()).active, true);
    assert.equal(revenge.active, false);
  }
  assert.deepEqual(revengeCampaignIds([faroles, spirits], faroles.endsAt), []);
});

test('revenge assigns precisely 75% to the complete event pool and keeps relative rarity weights', () => {
  const pool = [
    { rarity: 'common' }, { rarity: 'common' }, { rarity: 'rare' },
    { rarity: 'legendary', eventId: 'espiritus_2026' }, { rarity: 'epic', eventId: 'espiritus_2026' }
  ];
  const weights = spawnWeights(pool, ['espiritus_2026']);
  assert.equal((weights[3] + weights[4]) / weights.reduce((sum, weight) => sum + weight, 0), 0.75);
  assert.equal(weights[4] / weights[3], 4);
  assert.equal(weights[0] / weights[2], 3);
  assert.deepEqual(spawnWeights(pool.slice(0, 3), ['espiritus_2026']), [30, 30, 10]);
  assert.deepEqual(spawnWeights(pool.slice(3), ['espiritus_2026']), [1, 4]);
  assert.deepEqual(spawnWeights([], ['espiritus_2026']), []);
});

test('all release paths are disabled beforehand and automatically open at the closing Faroles boundary', async t => {
  let now = '2026-10-25T05:59:59.999Z';
  const c = setup(t, { clock: () => now, randomDropInt: () => 0 });
  const user = await register(c.game);
  assert.equal((await c.game.content.getEvent('espiritus')).status, 'upcoming');
  for (const character of seedSpiritsCharacters()) {
    await assert.rejects(c.game.units.createUnit({ ownerId: user.id, characterId: character.id,
      origin: { type: 'admin', sourceId: 'release-test' }, operationKey: character.id }), { code: 'EVENT_NOT_ACTIVE' });
    await assert.rejects(c.game.encounters.createSpawn({ characterId: character.id, chatId: 'schedule@g.us' }), { code: 'CHARACTER_UNAVAILABLE' });
  }
  await assert.rejects(c.game.content.claimEvent({ userId: user.id, eventId: 'espiritus', operationKey: 'welcome' }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.encounters.getBoss({ bossId: 'mil_mascaras', userId: user.id }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.spirits.claimSeal({ userId: user.id, seal: 'luz', operationKey: 'early-seal' }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.spirits.redeem({ userId: user.id, character: 'zorro', operationKey: 'early-redeem' }), { code: 'EVENT_NOT_ACTIVE' });
  now = SPIRITS_RELEASE_AT;
  assert.equal((await c.game.content.getEvent('faroles')).status, 'ended');
  assert.equal((await c.game.content.getEvent('espiritus')).status, 'active');
  assert.equal((await c.game.content.claimEvent({ userId: user.id, eventId: 'espiritus', operationKey: 'welcome' })).alreadyClaimed, false);
  const generic = await c.game.acquisition.listRewards({ userId: user.id });
  assert.equal(generic.rewards.find(reward => reward.kind === 'event').pending, 0);
  await assert.rejects(c.game.acquisition.claimReward({ userId: user.id, kind: 'event', operationKey: 'no-seal-bypass' }), { code: 'NO_ACQUISITION_REWARDS' });
  assert.equal((await c.game.encounters.getBoss({ bossId: 'mil_mascaras', userId: user.id })).status, 'active');
  const spawn = await c.game.encounters.createSpawn({ characterId: 'zorro_llamas_errantes', chatId: 'schedule@g.us' });
  const captured = await c.game.encounters.capture({ userId: user.id, chatId: 'schedule@g.us', code: spawn.code, operationKey: 'first-exclusive' });
  assert.equal(captured.unit.characterId, 'zorro_llamas_errantes');
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('the last event spawn expires at event end, then mint, capture, seals and boss attacks close', async t => {
  let now = '2026-11-02T05:59:59.999Z';
  const c = setup(t, { clock: () => now, randomDropInt: () => 0 });
  const user = await register(c.game);
  await c.game.content.claimEvent({ userId: user.id, eventId: 'espiritus', operationKey: 'welcome' });
  const spawn = await c.game.encounters.createSpawn({ characterId: 'guardian_mil_mascaras', chatId: 'closing@g.us' });
  const boss = await c.game.encounters.getBoss({ bossId: 'mil_mascaras', userId: user.id });
  assert.equal(spawn.expiresAt, '2026-11-02T06:00:00.000Z');
  assert.equal(boss.expiresAt, spawn.expiresAt);
  now = spawn.expiresAt;
  assert.equal((await c.game.content.getEvent('espiritus')).status, 'ended');
  assert.equal((await c.game.content.getEvent('espiritus')).revenge.active, false);
  await assert.rejects(c.game.encounters.capture({ userId: user.id, chatId: 'closing@g.us', code: spawn.code, operationKey: 'late' }), { code: 'SPAWN_EXPIRED' });
  await assert.rejects(c.game.spirits.claimSeal({ userId: user.id, seal: 'luz', operationKey: 'late-seal' }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.spirits.redeem({ userId: user.id, character: 'guardian', operationKey: 'late-redeem' }), { code: 'EVENT_NOT_ACTIVE' });
  await assert.rejects(c.game.encounters.attackBoss({ userId: user.id, chatId: 'closing@g.us', code: boss.code, choice: '1', operationKey: 'late-attack' }), { code: 'EVENT_NOT_ACTIVE' });
  assert.equal(readRecords(c.directory, 'unidades').length, 0);
});

test('owned exclusive characters retain Fatality after the event while new issuance stays closed', async t => {
  let now = SPIRITS_RELEASE_AT;
  const c = setup(t, { clock: () => now, randomRoll: () => 0 });
  const owner = await register(c.game), opponent = await register(c.game, 'Lukas', '521111111111');
  const fox = await c.game.units.createUnit({ ownerId: owner.id, characterId: 'zorro_llamas_errantes',
    origin: { type: 'admin', sourceId: 'permanent-trait-test' }, operationKey: 'owned-fox' });
  const panda = (await c.game.starter.claimStarter({ userId: opponent.id, choice: 'panda' })).unit;
  await c.game.teams.setTeam({ userId: owner.id, unitIds: [fox.id] });
  await c.game.teams.setTeam({ userId: opponent.id, unitIds: [panda.id] });
  now = '2027-01-01T06:00:00.000Z';
  await c.game.battle.challenge({ userId: owner.id, opponentId: opponent.id, chatId: 'permanent@g.us', mode: 'classic' });
  const started = await c.game.battle.accept({ userId: opponent.id, chatId: 'permanent@g.us' });
  assert.equal(started.battle.players[0].unit.fatality.unlocked, true);
  const result = await c.game.battle.attack({ userId: owner.id, chatId: 'permanent@g.us', choice: '3', operationKey: 'future-fatality' });
  assert.equal(result.battle.players[0].unit.fatality.used, true);
  await assert.rejects(c.game.units.createUnit({ ownerId: owner.id, characterId: 'zorro_llamas_errantes',
    origin: { type: 'admin', sourceId: 'closed-future-test' }, operationKey: 'closed-future' }), { code: 'EVENT_NOT_ACTIVE' });
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('revenge selection is authoritative, survives restart and removes exhausted event supply', async t => {
  let now = '2026-11-01T06:00:00.000Z';
  const c = setup(t, { clock: () => now, randomDropInt: limit => limit === 100 ? 0 : limit - 1 });
  const user = await register(c.game);
  for (const id of ['guardian_mil_mascaras', 'zorro_llamas_errantes']) await updateCharacter(c.storage, id, { supply: { type: 'limited', max: 1 } });
  const request = { userId: user.id, chatId: 'revenge@g.us', messageId: 'first' };
  const first = await c.game.encounters.observeActivity(request);
  assert.equal(first.spawn.snapshot.campaignId, 'espiritus_2026');
  const before = raw(c.directory), receipt = before.accionescontenido.records[0];
  assert.deepEqual(receipt.details.revengeCampaignIds, ['espiritus_2026']);
  const weights = receipt.details.eligibleCharacterWeights;
  const eventWeight = receipt.details.eligibleCharacterIds.reduce((sum, id, index) => sum + (id === 'guardian_mil_mascaras' || id === 'zorro_llamas_errantes' ? weights[index] : 0), 0);
  assert.equal(eventWeight / weights.reduce((sum, weight) => sum + weight, 0), 0.75);
  const tampered = structuredClone(before);
  tampered.accionescontenido.records[0].details.eligibleCharacterWeights[0]++;
  assert.throws(() => validateDatabase(tampered), { code: 'DATABASE_CORRUPT' });
  const forged = structuredClone(before);
  forged.accionescontenido.records[0].details.eligibleCharacterRevisions[0]++;
  assert.throws(() => validateDatabase(forged), { code: 'DATABASE_CORRUPT' });
  await c.game.close();
  const reopened = c.open().game;
  assert.equal((await reopened.encounters.observeActivity(request)).alreadyChecked, true);
  assert.deepEqual(raw(c.directory), before);
  for (const id of ['guardian_mil_mascaras', 'zorro_llamas_errantes']) await reopened.units.createUnit({ ownerId: user.id, characterId: id,
    origin: { type: 'admin', sourceId: 'exhaustion-test' }, operationKey: `exhaust:${id}` });
  now = '2026-11-01T07:00:00.000Z';
  const ordinary = await reopened.encounters.observeActivity({ ...request, messageId: 'exhausted' });
  assert.equal(ordinary.spawn.snapshot.campaignId, null);
  assert.equal(readRecords(c.directory, 'estado').find(row => row.id === 'mint:guardian_mil_mascaras').issuedCount, 1);
  assert.equal((await reopened.validateDatabase()).valid, true);
  const after = raw(c.directory);
  const latest = after.accionescontenido.records.at(-1);
  const truncated = structuredClone(after);
  const fake = truncated.accionescontenido.records.at(-1).details;
  fake.eligibleCharacterIds.pop(); fake.eligibleCharacterRarities.pop(); fake.eligibleCharacterRevisions.pop(); fake.eligibleCharacterWeights.pop();
  assert.throws(() => validateTransition({ ...after, accionescontenido: { ...after.accionescontenido, records: after.accionescontenido.records.slice(0, -1) } }, truncated), { code: 'DATABASE_CORRUPT' });
  assert.equal(latest.details.eligibleCharacterIds.some(id => id.includes('mil_mascaras') || id.includes('llamas_errantes')), false);
});
