import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { setup, register } from './helpers.js';
import { COLLECTIONS, validateDatabase, validateTransition } from '../storage/validation.js';
import { createStoryBattle } from '../game/story/combat.js';

const NOW = '2026-10-17T12:00:00.000Z';
const stateOf = directory => Object.fromEntries(COLLECTIONS.map(name => [name,
  JSON.parse(fs.readFileSync(path.join(directory, `${name}.json`), 'utf8'))]));

async function fixture(t, { combat = true, clock = () => NOW } = {}) {
  const context = setup(t, { clock, randomRoll: () => 30 });
  const user = await register(context.game);
  let sequence = 0;
  const invoke = (kind, args = {}) => context.game.story[kind]({ userId: user.id, operationKey: `audit:${++sequence}`, ...args });
  await invoke('start');
  await invoke('choose', { choice: '1' });
  const unit = (await context.game.starter.claimStarter({ userId: user.id, choice: 'panda' })).unit;
  await invoke('continue');
  if (combat) await invoke('continue');
  return { ...context, user, unit, invoke };
}

function rebuildEmptyCombat(state, change) {
  const battle = state.combateshistoria.records[0];
  const snapshots = structuredClone(battle.combat.unitSnapshots);
  change(snapshots[0]);
  battle.combat = createStoryBattle({ id: battle.id, encounterId: battle.combat.encounterId,
    units: snapshots, now: battle.createdAt });
}

for (const [name, corrupt] of [
  ['attack power', unit => { unit.attacks[0].power = 999; }],
  ['attack identity', unit => { unit.attacks[0].id = 'invented_attack'; }],
  ['passive ability', unit => { unit.ability.effects[0].potency = 999; }],
  ['combat element', unit => { unit.element = 'light'; }],
  ['catalog revision', unit => { unit.characterRevision += 100; }]
]) {
  test(`offline story validation rejects a coherent forged ${name} in a current revision snapshot`, async t => {
    const context = await fixture(t);
    const state = stateOf(context.directory);
    rebuildEmptyCombat(state, corrupt);
    assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
  });
}

test('a newly inserted battle must freeze the exact authoritative unit and catalog snapshot', async t => {
  const context = await fixture(t, { combat: false });
  const before = stateOf(context.directory);
  await context.invoke('continue');
  const after = stateOf(context.directory);
  rebuildEmptyCombat(after, unit => { unit.attacks[0].power = 999; });
  assert.throws(() => validateTransition(before, after, { now: NOW }), { code: 'DATABASE_CORRUPT' });
});

test('offline action coverage also preserves the order of combat steps with identical timestamps', async t => {
  const context = await fixture(t);
  await context.invoke('act', { action: 'attack', choice: '1' });
  await context.invoke('act', { action: 'defend' });
  const state = stateOf(context.directory);
  const actions = state.accioneshistoria.records;
  const indexes = actions.map((action, index) => action.kind === 'act' ? index : -1).filter(index => index >= 0);
  [actions[indexes[0]], actions[indexes[1]]] = [actions[indexes[1]], actions[indexes[0]]];
  assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
});

test('offline noncombat rewards cannot predate the rewarded unit emission', async t => {
  let now = NOW;
  const context = setup(t, { clock: () => now });
  const user = await register(context.game);
  await context.game.story.start({ userId: user.id, operationKey: 'birth:start' });
  await context.game.story.choose({ userId: user.id, choice: '1', operationKey: 'birth:choice' });
  now = '2026-10-17T13:00:00.000Z';
  await context.game.starter.claimStarter({ userId: user.id, choice: 'panda' });
  now = '2026-10-17T14:00:00.000Z';
  await context.game.story.continue({ userId: user.id, operationKey: 'birth:continue' });
  const state = stateOf(context.directory), earlier = '2026-10-17T12:30:00.000Z';
  const action = state.accioneshistoria.records.at(-1), reward = state.premioshistoria.records.at(-1);
  action.createdAt = earlier;
  action.after.updatedAt = earlier;
  state.historias.records[0].updatedAt = earlier;
  reward.createdAt = earlier;
  state.economia.records.find(movement => movement.sourceId === reward.id).createdAt = earlier;
  assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
});

test('offline story start cannot predate the registered account', async t => {
  const context = setup(t, { clock: () => NOW });
  const user = await register(context.game);
  await context.game.story.start({ userId: user.id, operationKey: 'before-account' });
  const state = stateOf(context.directory), earlier = '2026-10-16T12:00:00.000Z';
  const action = state.accioneshistoria.records[0];
  action.createdAt = earlier;
  action.after.createdAt = earlier;
  action.after.updatedAt = earlier;
  state.historias.records[0] = structuredClone(action.after);
  assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
});

test('historical story ownership must exist at the snapshot time rather than at a later transfer', async t => {
  let now = NOW;
  const context = setup(t, { clock: () => now, randomRoll: () => 30 });
  const seller = await register(context.game), buyer = await register(context.game, 'Lukas', '521111111111');
  const unit = (await context.game.starter.claimStarter({ userId: seller.id, choice: 'panda' })).unit;
  await context.game.economy.claimDaily({ userId: buyer.id, operationKey: 'ownership:daily' });
  now = '2026-10-17T13:00:00.000Z';
  const listing = (await context.game.market.createListing({ sellerId: seller.id, unitId: unit.id,
    price: 20, operationKey: 'ownership:listing' })).listing;
  now = '2026-10-17T14:00:00.000Z';
  await context.game.market.buyListing({ buyerId: buyer.id, listingId: listing.code, operationKey: 'ownership:purchase' });
  await context.game.teams.setTeam({ userId: buyer.id, unitIds: [unit.id] });
  now = '2026-10-17T15:00:00.000Z';
  for (const [index, [kind, args]] of [['start', {}], ['choose', { choice: '1' }], ['continue', {}], ['continue', {}]].entries()) {
    await context.game.story[kind]({ userId: buyer.id, operationKey: `ownership:${index}`, ...args });
  }
  const state = stateOf(context.directory), earlier = '2026-10-17T13:30:00.000Z';
  for (const action of state.accioneshistoria.records) {
    action.createdAt = earlier;
    for (const progress of [action.before, action.after]) if (progress) {
      progress.createdAt = earlier;
      progress.updatedAt = earlier;
    }
  }
  for (const progress of state.historias.records) {
    progress.createdAt = earlier;
    progress.updatedAt = earlier;
  }
  for (const reward of state.premioshistoria.records) {
    reward.createdAt = earlier;
    state.economia.records.find(movement => movement.sourceId === reward.id).createdAt = earlier;
  }
  const battle = state.combateshistoria.records[0];
  battle.createdAt = earlier;
  battle.updatedAt = earlier;
  battle.combat = createStoryBattle({ id: battle.id, encounterId: battle.combat.encounterId,
    units: battle.combat.unitSnapshots, now: earlier });
  assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
});

test('story receipts cannot direct XP to a different account even when the XP totals are coherent', async t => {
  const context = await fixture(t, { combat: false });
  const rival = await register(context.game, 'Lukas', '521111111111');
  const rivalUnit = (await context.game.starter.claimStarter({ userId: rival.id, choice: 'panda' })).unit;
  const state = stateOf(context.directory);
  const reward = state.premioshistoria.records.find(row => row.missionCode === 'P-02');
  const action = state.accioneshistoria.records.find(row => row.id === reward.actionId);
  const original = state.unidades.records.find(row => row.id === context.unit.id);
  const redirected = state.unidades.records.find(row => row.id === rivalUnit.id);
  const grant = reward.unitRewards[0];
  original.progress = structuredClone(grant.progressBefore);
  redirected.progress = structuredClone(grant.progressAfter);
  grant.unitId = rivalUnit.id;
  action.unitRefs[0].unitId = rivalUnit.id;
  assert.throws(() => validateDatabase(state), { code: 'DATABASE_CORRUPT' });
});

test('a future timestamp cannot be supplied through a coherent new story action', async t => {
  let now = NOW;
  const context = setup(t, { clock: () => now });
  const user = await register(context.game);
  const before = stateOf(context.directory);
  now = '2026-10-17T13:00:00.000Z';
  await context.game.story.start({ userId: user.id, operationKey: 'future:start' });
  const after = stateOf(context.directory);
  assert.throws(() => validateTransition(before, after, { now: NOW }), { code: 'DATABASE_CORRUPT' });
});
