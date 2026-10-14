import fs from 'node:fs';
import path from 'node:path';
import { setup, register, readRecords } from './helpers.js';

export async function craftingFixture(t, options = {}) {
  let now = '2026-10-13T12:00:00.000Z';
  const context = setup(t, { clock: () => now, randomRoll: () => 0, randomDropInt: () => 0 });
  const user = await register(context.game);
  const rival = await register(context.game, 'Lukas', '521111111111');
  const unit = (await context.game.starter.claimStarter({ userId: user.id, choice: options.choice ?? 'panda' })).unit;
  const opponentUnit = (await context.game.starter.claimStarter({ userId: rival.id, choice: 'lobo' })).unit;

  if (options.level) {
    // A valid historical opening baseline supplies an already-levelled unit.
    // Materials and coins are still earned through real services below.
    await context.game.close();
    for (const name of ['unidades', 'estado']) {
      const filename = path.join(context.directory, `${name}.json`);
      const collection = JSON.parse(fs.readFileSync(filename, 'utf8'));
      const record = collection.records.find(row => name === 'unidades' ? row.id === unit.id : row.id === `progression:${unit.id}`);
      record.progress = { level: options.level, xp: options.xp ?? 0 };
      fs.writeFileSync(filename, JSON.stringify(collection, null, 2) + '\n');
    }
    Object.assign(context, context.open());
  }
  await context.game.teams.setTeam({ userId: user.id, unitIds: [unit.id] });
  await context.game.teams.setTeam({ userId: rival.id, unitIds: [opponentUnit.id] });
  return { ...context, user, rival, unit, opponentUnit, chatId: 'crafting@g.us',
    advance: ms => { now = new Date(Date.parse(now) + ms).toISOString(); },
    setTime: value => { now = value; } };
}

export async function defeatBoss(context) {
  let boss = await context.game.encounters.getBoss({ bossId: 'niebla', userId: context.user.id });
  while (boss.status === 'active') {
    await context.game.encounters.attackBoss({ userId: context.user.id, chatId: context.chatId, code: boss.code,
      choice: '2', operationKey: `boss-material:${boss.id}:${boss.totalAttacks}` });
    context.advance(30_000);
    boss = await context.game.encounters.getBoss({ bossId: 'niebla', userId: context.user.id });
  }
  return boss;
}

export async function earnSealMaterials(context) {
  await context.game.economy.claimDaily({ userId: context.user.id, operationKey: 'first-seal-daily' });
  await defeatBoss(context);
  context.advance(86_400_000);
  await defeatBoss(context);
  await context.game.economy.claimDaily({ userId: context.user.id, operationKey: 'seal-daily' });
  await context.game.crafting.claimMaterials({ userId: context.user.id, operationKey: 'seal-materials' });
}

export async function craftSeal(context, operationKey = 'seal-craft') {
  return context.game.crafting.craft({ userId: context.user.id, recipeId: 'sello_evolucion', operationKey });
}

export async function fightForMaterials(context) {
  await context.game.battle.challenge({ userId: context.user.id, opponentId: context.rival.id, chatId: context.chatId, mode: 'classic' });
  let battle = (await context.game.battle.accept({ userId: context.rival.id, chatId: context.chatId })).battle;
  while (battle.status === 'active') battle = (await context.game.battle.attack({ userId: battle.turnUserId, chatId: context.chatId, choice: '2' })).battle;
  return battle;
}

export function dbState(directory, collections) {
  return Object.fromEntries(collections.map(name => [name, { records: readRecords(directory, name) }]));
}
