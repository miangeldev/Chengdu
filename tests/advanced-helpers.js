import { register, setup } from './helpers.js';

export async function advancedSetup(t, options = {}) {
  const context = setup(t, { clock: () => '2026-10-11T10:00:00.000Z', randomRoll: () => 0, ...options });
  context.a = await register(context.game, 'Miguel');
  context.b = await register(context.game, 'Lukas', '521111111111');
  context.units = [];
  const characters = options.characters ?? [['panda_guerrero', 'mago_carmesi', 'lobo_sombrio'], ['lobo_sombrio', 'panda_guerrero', 'mago_carmesi']];
  for (const [index, user] of [context.a, context.b].entries()) {
    const units = [];
    for (const [slot, characterId] of characters[index].entries()) {
      units.push(await context.game.units.createUnit({ ownerId: user.id, characterId,
        origin: { type: 'admin', sourceId: 'advanced-test-fixture' }, operationKey: `advanced-fixture:${index}:${slot}` }));
    }
    context.units.push(units);
    await context.game.teams.setTeam({ userId: user.id, unitIds: units.map(unit => unit.id) });
  }
  context.chatId = 'advanced-test-arena';
  return context;
}

export async function startAdvanced(context, mode = 'auto') {
  await context.game.battle.challenge({ userId: context.a.id, opponentId: context.b.id, chatId: context.chatId, mode });
  return (await context.game.battle.accept({ userId: context.b.id, chatId: context.chatId })).battle;
}

export async function advanceAttacks(context, battle, count = 4) {
  for (let index = 0; index < count && battle.status === 'active'; index++) {
    battle = (await context.game.battle.attack({ userId: battle.turnUserId, chatId: context.chatId,
      choice: '1', operationKey: `attack:${battle.id}:${battle.actions.length + 1}` })).battle;
  }
  return battle;
}
