import test from 'node:test';
import assert from 'node:assert/strict';
import { grantXp } from '../game/progression/rules.js';
import { rewardAmounts, rewardSummary } from '../game/rewards/battlePolicy.js';
import { materialRewardFor, materialSources } from '../game/crafting/policy.js';
import { validateEconomyData } from '../storage/economyValidation.js';
import { validateProgressionData } from '../storage/progressionValidation.js';
import { validateCraftingData } from '../storage/craftingValidation.js';
import { setup, register, readRecords } from './helpers.js';

const NOW = '2026-10-17T00:00:00.000Z';
const EMPTY = { fragmentos: 0, esencias: 0, sellos: 0 };
const corrupt = work => assert.throws(work, error => error.code === 'DATABASE_CORRUPT');

function fixture() {
  const state = Object.fromEntries(['usuarios', 'unidades', 'estado', 'combates', 'eventos', 'recompensas', 'aperturas', 'diarios', 'ventas',
    'premioscontenido', 'premiostemporada', 'premioshistoria', 'economia', 'accionesintercambio', 'accionesclan', 'accionesguerra', 'artesania', 'evoluciones'].map(name => [name, { records: [] }]));
  for (const id of ['a', 'b']) {
    const progress = { level: 1, xp: 0 }, stats = { hp: 120, attack: 25, defense: 23, speed: 8 };
    state.usuarios.records.push({ id, progress: { ...progress }, economy: { coins: 0 } });
    state.unidades.records.push({ id: `unit-${id}`, ownerId: id, ownershipVersion: 0, characterId: 'panda_guerrero', progress: { ...progress },
      initialStats: stats, combatBaseStats: stats, statGrowthVersion: 2, traits: [], traitVersion: 1 });
    state.estado.records.push({ id: `progression:${id}`, kind: 'progressionBaseline', entityType: 'user', entityId: id, progress: { ...progress }, coins: 0 },
      { id: `progression:unit-${id}`, kind: 'progressionBaseline', entityType: 'unit', entityId: `unit-${id}`, progress: { ...progress } });
    state.eventos.records.push({ type: 'unit_created', unitId: `unit-${id}`, toOwnerId: id });
  }
  return state;
}

function appendAward(state, reward, type) {
  const user = state.usuarios.records.find(user => user.id === reward.userId);
  reward.createdAt = NOW;
  reward.balanceBefore = user.economy.coins;
  reward.balanceAfter = user.economy.coins + reward.coins;
  reward.userProgressBefore = structuredClone(user.progress);
  reward.userProgressAfter = grantXp(user.progress, reward.userXp, 'user');
  user.progress = reward.userProgressAfter;
  user.economy.coins = reward.balanceAfter;
  state.economia.records.push({ id: `coin:${reward.id}`, userId: user.id, sourceType: type, sourceId: reward.id, type: 'credit', amount: reward.coins,
    balanceBefore: reward.balanceBefore, balanceAfter: reward.balanceAfter, createdAt: NOW });
  return reward;
}

function story(state, index, unitXp, materials = EMPTY) {
  const unit = state.unidades.records[0];
  const progressBefore = structuredClone(unit.progress), progressAfter = grantXp(progressBefore, unitXp, 'unit');
  const reward = appendAward(state, { id: `story:${index}:a`, userId: 'a', coins: index === 1 ? 0 : 45, userXp: 20,
    unitXp, materials: structuredClone(materials), unitRewards: [{ unitId: unit.id, ownershipVersion: 0, xp: unitXp, progressBefore, progressAfter }] }, 'story_reward');
  state.premioshistoria.records.push(reward);
  unit.progress = progressAfter;
  return reward;
}

function pvp(state, index) {
  const battle = { id: `BTL-test-${index}`, rulesVersion: 1, rewardVersion: 1, status: 'finished', acceptedAt: NOW, finishedAt: NOW,
    finishReason: 'knockout', winnerId: 'a', players: ['a', 'b'].map(userId => ({ userId, unit: { id: `unit-${userId}` } })), actions: [] };
  const rewards = battle.players.map(player => {
    const unit = state.unidades.records.find(unit => unit.id === player.unit.id);
    const amounts = rewardAmounts(battle, player.userId, 'rewarded');
    const reward = appendAward(state, { id: `reward:${battle.id}:${player.userId}`, version: 1, reason: 'rewarded', battleId: battle.id,
      userId: player.userId, unitId: unit.id, ...amounts, unitProgressBefore: structuredClone(unit.progress), unitProgressAfter: grantXp(unit.progress, amounts.unitXp, 'unit') }, 'battle_reward');
    unit.progress = reward.unitProgressAfter;
    state.recompensas.records.push(reward);
    return reward;
  });
  battle.settlement = { version: 1, reason: 'rewarded', createdAt: NOW, rewards: rewards.map(rewardSummary) };
  state.combates.records.push(battle);
}

function interleaved() {
  const state = fixture();
  story(state, 1, 100);
  pvp(state, 1);
  story(state, 2, 220, { fragmentos: 2, esencias: 1, sellos: 0 });
  pvp(state, 2);
  return state;
}

function materialClaim(state) {
  return { id: 'CRAFT-00000000-0000-4000-8000-000000000001', userId: 'a', policyVersion: 1, operationKey: 'story:claim:materials',
    createdAt: NOW, economyCursor: state.economia.records.length, kind: 'material_claim', recipeId: null,
    sources: [{ type: 'story', id: 'story:2:a' }], coins: 0, inputs: { ...EMPTY }, outputs: { fragmentos: 2, esencias: 1, sellos: 0 },
    materialsBefore: { ...EMPTY }, materialsAfter: { fragmentos: 2, esencias: 1, sellos: 0 }, badge: null,
    balanceBefore: state.usuarios.records[0].economy.coins, balanceAfter: state.usuarios.records[0].economy.coins };
}

test('historia ledger: XP de usuario y unidad se reproduce intercalando PvP con fechas idénticas', () => {
  const state = interleaved();
  assert.doesNotThrow(() => validateEconomyData(state, 12));
  assert.doesNotThrow(() => validateProgressionData(state, 12));
  assert.deepEqual(state.unidades.records[0].progress, { level: 3, xp: 90 });
  assert.equal(state.usuarios.records[0].economy.coins, 285);
});

test('historia ledger: todo premio requiere movimiento incluso cuando entrega cero monedas', () => {
  const state = interleaved();
  state.economia.records.shift();
  corrupt(() => validateEconomyData(state, 12));
  corrupt(() => validateProgressionData(state, 12));
});

test('historia ledger: no permite fabricar cantidades, propietario ni duplicar acciones XP', () => {
  for (const mutate of [
    state => { state.premioshistoria.records[0].unitRewards[0].xp += 10; },
    state => { state.premioshistoria.records[0].unitRewards[0].ownershipVersion = 1; },
    state => { state.premioshistoria.records[0].unitRewards.push(structuredClone(state.premioshistoria.records[0].unitRewards[0])); },
    state => { state.premioshistoria.records[0].unitRewards[0].progressAfter.xp += 10; }
  ]) {
    const state = interleaved();
    mutate(state);
    corrupt(() => validateProgressionData(state, 12));
  }
  const state = interleaved();
  state.economia.records[0].amount = 50;
  corrupt(() => validateEconomyData(state, 12));
});

test('historia ledger: versiones anteriores siguen aceptando sus premios PvP originales', () => {
  const state = fixture();
  pvp(state, 1);
  pvp(state, 2);
  assert.doesNotThrow(() => validateEconomyData(state, 11));
  assert.doesNotThrow(() => validateProgressionData(state, 11));
  assert.doesNotThrow(() => validateProgressionData(state, 12));
});

test('historia crafting: sólo ofrece materiales reales del usuario y omite recompensas vacías', () => {
  const state = interleaved();
  const sources = materialSources(state, 'a', NOW).filter(source => source.type === 'story');
  assert.deepEqual(sources.map(source => source.id), ['story:2:a']);
  assert.deepEqual(sources[0].materials, { fragmentos: 2, esencias: 1, sellos: 0 });
  const materialCopy = materialRewardFor({ type: 'story', receipt: state.premioshistoria.records[1] });
  materialCopy.fragmentos += 100;
  assert.equal(state.premioshistoria.records[1].materials.fragmentos, 2);
  assert.equal(materialSources(state, 'b', NOW).some(source => source.type === 'story'), false);
  assert.equal(materialSources(state, 'a', '2026-10-16T00:00:00.000Z').some(source => source.type === 'story'), false);
});

test('historia crafting: reclamar requiere recibo anterior en ledger y no permite duplicarlo', () => {
  const state = interleaved();
  state.artesania.records.push(materialClaim(state));
  assert.doesNotThrow(() => validateCraftingData(state));
  const invented = structuredClone(state);
  invented.artesania.records[0].sources[0].id = 'story:invented';
  corrupt(() => validateCraftingData(invented));
  const premature = structuredClone(state);
  Object.assign(premature.artesania.records[0], { economyCursor: 0, balanceBefore: 0, balanceAfter: 0 });
  corrupt(() => validateCraftingData(premature));
  const duplicate = structuredClone(state);
  duplicate.artesania.records.push({ ...materialClaim(duplicate), id: 'CRAFT-00000000-0000-4000-8000-000000000002',
    operationKey: 'story:claim:materials:again', materialsBefore: { fragmentos: 2, esencias: 1, sellos: 0 }, materialsAfter: { fragmentos: 4, esencias: 2, sellos: 0 } });
  corrupt(() => validateCraftingData(duplicate));
});


async function realContext(t) {
  const context = setup(t, { storyContentVersion: 1, clock: () => NOW, randomRoll: () => 0 });
  context.user = await register(context.game);
  context.rival = await register(context.game, 'Lukas', '521111111111');
  context.unit = (await context.game.starter.claimStarter({ userId: context.user.id, choice: 'panda' })).unit;
  context.rivalUnit = (await context.game.starter.claimStarter({ userId: context.rival.id, choice: 'lobo' })).unit;
  await context.game.teams.setTeam({ userId: context.user.id, unitIds: [context.unit.id] });
  await context.game.teams.setTeam({ userId: context.rival.id, unitIds: [context.rivalUnit.id] });
  let sequence = 0;
  context.key = label => `story-ledger:${label}:${++sequence}`;
  return context;
}

async function storyStep(context, userId, state) {
  const operationKey = context.key('campaign');
  if (!state.progress) return context.game.story.start({ userId, operationKey });
  if (state.progress.stage === 'choice') return context.game.story.choose({ userId, choice: '1', operationKey });
  if (state.progress.stage === 'defeated') return context.game.story.retry({ userId, operationKey });
  if (state.progress.stage !== 'battle') return context.game.story.continue({ userId, operationKey });
  const current = state.battle.team.find(unit => unit.active);
  const action = !state.battle.tutorial.attack ? 'attack'
    : !state.battle.tutorial.defend || state.battle.enemy.phase === 'unleash' ? 'defend'
      : current.attacks[1].ready ? 'skill' : 'attack';
  return context.game.story.act({ userId, action, choice: action === 'attack' ? '1' : null, operationKey });
}

async function campaignUntil(context, userId = context.user.id, done = state => state.progress?.status === 'complete') {
  let state = await context.game.story.getState({ userId });
  for (let step = 0; step < 100 && !done(state); step++) state = await storyStep(context, userId, state);
  assert.ok(done(state), 'The campaign must reach its checkpoint within 100 actions');
  return state;
}

async function realPvp(context, mode = 'classic') {
  const chatId = 'story-ledger-arena';
  await context.game.battle.challenge({ userId: context.user.id, opponentId: context.rival.id, chatId, mode });
  let battle = (await context.game.battle.accept({ userId: context.rival.id, chatId })).battle;
  while (battle.status === 'active') battle = (await context.game.battle.attack({ userId: battle.turnUserId, chatId, choice: battle.rulesVersion === 2 ? '1' : '2', operationKey: context.key('pvp') })).battle;
  assert.equal(battle.winnerId, context.user.id);
  assert.equal(battle.settlement.reason, 'rewarded');
  return battle;
}

test('historia real: PvP y campaña alternan XP hasta terminar sin alterar snapshots de combates anteriores', async t => {
  const context = await realContext(t);
  const firstPvp = await realPvp(context);
  assert.equal(firstPvp.players[0].unit.level, 1);
  await campaignUntil(context, context.user.id, state => state.mission?.code === 'P-04');
  const middlePvp = await realPvp(context, '1v1');
  assert.equal(middlePvp.rulesVersion, 2);
  assert.ok(middlePvp.players[0].units[0].level >= 3);
  const finished = await campaignUntil(context);
  assert.equal(finished.progress.status, 'complete');
  assert.deepEqual((await context.game.units.getUnit(context.unit.id)).progress, { level: 5, xp: 170 });
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, 540);
  assert.deepEqual(await context.game.battle.getHistoryBattle({ userId: context.user.id, battleId: firstPvp.id }), firstPvp);
  assert.deepEqual(await context.game.battle.getHistoryBattle({ userId: context.user.id, battleId: middlePvp.id }), middlePvp);
  assert.equal((await context.game.validateDatabase()).valid, true);
  await context.game.close();
  Object.assign(context, context.open());
  assert.equal((await context.game.validateDatabase()).valid, true);
  assert.deepEqual((await context.game.units.getUnit(context.unit.id)).progress, { level: 5, xp: 170 });
});

test('historia real: 300 monedas y materiales más un diario permiten evolucionar; repetir no duplica premios', async t => {
  const context = await realContext(t);
  await campaignUntil(context);
  const before = await context.game.units.getUnit(context.unit.id);
  assert.deepEqual(before.progress, { level: 5, xp: 100 });
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, 300);
  const pending = await context.game.crafting.getInventory(context.user.id);
  assert.deepEqual(pending.pendingMaterials, { fragmentos: 5, esencias: 2, sellos: 0 });
  const claim = await context.game.crafting.claimMaterials({ userId: context.user.id, operationKey: context.key('materials') });
  assert.ok(claim.action.sources.every(source => source.type === 'story'));
  assert.equal(claim.action.sources.length, 5);
  await context.game.economy.claimDaily({ userId: context.user.id, operationKey: context.key('daily') });
  await context.game.crafting.craft({ userId: context.user.id, recipeId: 'sello_evolucion', operationKey: context.key('seal') });
  const oldBattles = readRecords(context.directory, 'combateshistoria');
  const oldMintCounters = readRecords(context.directory, 'estado').filter(record => record.kind === 'mintCounter');
  const evolution = await context.game.evolution.evolve({ userId: context.user.id, unitId: context.unit.id, operationKey: context.key('evolve') });
  assert.equal(evolution.alreadyEvolved, false);
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, 0);
  const evolved = await context.game.units.getUnit(context.unit.id);
  assert.equal(evolved.evolution.formId, 'panda_maestro');
  for (const field of ['id', 'serial', 'characterId', 'origin', 'initialStats', 'traits', 'variant', 'progress']) assert.deepEqual(evolved[field], before[field]);
  assert.deepEqual(readRecords(context.directory, 'estado').filter(record => record.kind === 'mintCounter'), oldMintCounters);
  assert.deepEqual(readRecords(context.directory, 'combateshistoria'), oldBattles);
  assert.ok(oldBattles.every(battle => battle.combat.unitSnapshots[0].evolution === null));
  const paid = readRecords(context.directory, 'premioshistoria');
  const user = await context.game.users.getUser(context.user.id);
  await context.game.story.reset({ userId: context.user.id, operationKey: context.key('reset') });
  const repeated = await campaignUntil(context);
  assert.equal(repeated.progress.run, 2);
  assert.deepEqual(readRecords(context.directory, 'premioshistoria'), paid);
  assert.deepEqual((await context.game.units.getUnit(context.unit.id)).progress, evolved.progress);
  assert.deepEqual((await context.game.users.getUser(context.user.id)).progress, user.progress);
  assert.equal((await context.game.economy.getBalance(context.user.id)).coins, 0);
  assert.deepEqual((await context.game.crafting.getInventory(context.user.id)).pendingMaterials, EMPTY);
  await assert.rejects(context.game.crafting.claimMaterials({ userId: context.user.id, operationKey: context.key('materials-repeat') }), { code: 'NO_MATERIALS_AVAILABLE' });
  assert.equal((await context.game.validateDatabase()).valid, true);
});

test('historia real: vender una unidad entrenada conserva premios históricos y su nuevo dueño puede entrenarla', async t => {
  const context = await realContext(t);
  await campaignUntil(context);
  const oldBattles = readRecords(context.directory, 'combateshistoria');
  const oldRewards = readRecords(context.directory, 'premioshistoria');
  const before = await context.game.units.getUnit(context.unit.id);
  await context.game.economy.claimDaily({ userId: context.rival.id, operationKey: context.key('buyer-daily') });
  const listing = await context.game.market.createListing({ sellerId: context.user.id, unitId: context.unit.id, price: 50, operationKey: context.key('sale') });
  await context.game.market.buyListing({ buyerId: context.rival.id, listingId: listing.listing.code, operationKey: context.key('buy') });
  const transferred = await context.game.units.getUnit(context.unit.id);
  assert.equal(transferred.ownerId, context.rival.id);
  assert.equal(transferred.ownershipVersion, 1);
  assert.deepEqual(transferred.progress, before.progress);
  assert.deepEqual(readRecords(context.directory, 'combateshistoria'), oldBattles);
  assert.deepEqual(readRecords(context.directory, 'premioshistoria'), oldRewards);
  await context.game.teams.setTeam({ userId: context.rival.id, unitIds: [context.unit.id] });
  await campaignUntil(context, context.rival.id, state => state.mission?.code === 'P-03');
  const firstAward = readRecords(context.directory, 'premioshistoria').find(reward => reward.userId === context.rival.id && reward.unitRewards.length > 0);
  assert.equal(firstAward.unitRewards[0].unitId, context.unit.id);
  assert.equal(firstAward.unitRewards[0].ownershipVersion, 1);
  assert.deepEqual((await context.game.units.getUnit(context.unit.id)).progress, { level: 5, xp: 200 });
  assert.deepEqual(readRecords(context.directory, 'combateshistoria').slice(0, oldBattles.length), oldBattles);
  assert.equal((await context.game.validateDatabase()).valid, true);
});
