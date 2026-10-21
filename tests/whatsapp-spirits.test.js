import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { renderBattle } from '../interfaces/whatsapp/battleFormat.js';
import { renderBoss } from '../interfaces/whatsapp/contentFormat.js';
import { renderStory } from '../interfaces/whatsapp/storyFormat.js';
import { renderSpirits } from '../interfaces/whatsapp/spiritsFormat.js';
import { commandText } from '../interfaces/whatsapp/format.js';
import { fatalityProfile } from '../game/battle/fatality.js';
import { GameError } from '../utils/GameError.js';

const cmd = (name, args) => commandText('!', name, args);
const campaign = { name: 'La Noche de los Espíritus', startsAt: '2026-10-25T06:00:00.000Z', endsAt: '2026-11-02T06:00:00.000Z' };
function spiritsState(status = 'active') {
  return { campaign, status, fragments: 6, lore: 'Las máscaras despiertan en el antiguo teatro.',
    seals: [{ id: 'luz', name: 'Sello de la Luz', description: 'Reúne 6 fragmentos.', current: 6, target: 6, ready: true, claimed: false },
      { id: 'mascaras', name: 'Sello de las Máscaras', description: 'Inflige 100 de daño y alcanza dos máscaras.', current: 100, target: 100, maskCount: 1, ready: false, claimed: false }],
    characters: [{ id: 'zorro_llamas_errantes', code: 'zorro', name: 'Zorro de las Llamas Errantes', rarity: 'epic', issued: 4, max: 20, claimed: false, available: false, requiredSeals: ['luz', 'mascaras'] }] };
}

function assertPublic(text) {
  assert.doesNotMatch(text, /No pude confirmar|Debug activado|\.ctu|USR-|ACT-|ENC-|SPR-|@s.whatsapp.net|[a-f0-9]{8}-[a-f0-9]{4}-/);
  assert.ok(text.length <= 4096);
}

function routerFixture(overrides = {}) {
  const calls = [], messages = [], errors = [];
  const state = spiritsState();
  const game = { users: { getUserByIdentity: async () => ({ id: 'private-user', name: 'Miguel' }) },
    spirits: { getState: async () => state,
      claimSeal: async request => { calls.push(['seal', request]); return { ...state, seal: state.seals[0], seals: [{ ...state.seals[0], claimed: true }] }; },
      redeem: async request => { calls.push(['redeem', request]); return { ...state, unit: { characterId: 'zorro_llamas_errantes' } }; } },
    encounters: {}, ...overrides };
  const route = createCommandRouter({ game, prefix: '!', debug: true, logger: (...args) => errors.push(args) });
  let sequence = 0;
  async function send(body) {
    const before = messages.length;
    await route({ sendMessage: async (_, payload) => messages.push(payload.text) },
      { key: { remoteJid: 'group@g.us', participant: '521111111111@s.whatsapp.net', id: `spirits-ui-${++sequence}` } }, body);
    assert.equal(messages.length, before + 1);
    assert.equal(errors.length, 0);
    assertPublic(messages.at(-1));
    return messages.at(-1);
  }
  return { game, send, calls };
}

test('upcoming spirits shows the automatic handoff and Mexico City dates without live activity commands', () => {
  const text = renderSpirits(spiritsState('upcoming'), cmd);
  assert.match(text, /25 oct 2026, 00:00.*2 nov 2026, 00:00/);
  assert.match(text, /automáticamente cuando termine el Festival de los Faroles/);
  assert.doesNotMatch(text, /👉 !ctuevento espiritus reclamar|🎭 !ctuevento espiritus jefe/);
  assertPublic(text);
});

test('the spirits menu distinguishes missing seals from exhausted stock and shows the active revenge clearly', () => {
  const state = spiritsState();
  state.revenge = { active: true, eventCharacterChancePercent: 75 };
  const text = renderSpirits(state, cmd);
  assert.match(text, /Requiere 2 sellos/);
  assert.match(text, /Completa y reclama sus sellos/);
  assert.doesNotMatch(text, /Canje cerrado|Emisión agotada/);
  assert.match(text, /75%.*apariciones/);
  assert.match(text, /no crea stock adicional/);
  assertPublic(text);
});

test('seal and redemption commands use short references and send exactly one message', async () => {
  const c = routerFixture();
  const seals = await c.send('!ctuevento espiritus sellos');
  assert.match(seals, /!ctuevento espiritus sello luz/);
  assert.match(seals, /100\/100 · 🎭 1\/2 máscaras/);
  assert.match(await c.send('!ctuevento espiritus sello luz'), /¡Sello recuperado!/);
  assert.equal(c.calls[0][0], 'seal');
  assert.equal(c.calls[0][1].seal, 'luz');
  assert.match(await c.send('!ctuevento espiritus reclamar zorro'), /¡Nuevo compañero!.*\n🦊 Zorro de las Llamas Errantes/);
  assert.equal(c.calls[1][1].character, 'zorro');
  assert.match(await c.send('!ctuevento espiritus cosa'), /!ctuevento espiritus sellos/);
});

test('the theatre route reuses the world boss and inactive mechanics report the event calendar', async () => {
  let request;
  const c = routerFixture({ encounters: { getBoss: async value => { request = value; throw new GameError('EVENT_NOT_ACTIVE'); } } });
  assert.match(await c.send('!ctuevento espiritus jefe'), /aún no empieza o ya terminó/);
  assert.equal(request.bossId, 'mil_mascaras');
});

test('theatre masks and an available third attack have explicit readable actions', () => {
  const boss = { code: 'B2', snapshot: { name: 'Guardián de las Mil Máscaras', hp: 1800 }, hp: 1500, status: 'active', totalDamage: 300,
    expiresAt: campaign.endsAt, participants: [{ userId: 'private-user' }], mask: { name: 'Máscara Azul', description: 'Los ataques pierden precisión.' }, nextMaskAtAttack: 6,
    availableAttacks: [{ choice: '1', name: 'Ascua Errante', power: 25 }, { choice: '3', name: 'Última Llama', power: 50, fatality: true }] };
  const text = renderBoss(boss, cmd);
  assert.match(text, /TEATRO EMBRUJADO/);
  assert.match(text, /Máscara Azul.*\nLos ataques pierden precisión/);
  assert.match(text, /💀 3️⃣ Última Llama · 50 POT · Un uso/);
  assert.match(text, /!ctubossatacar 3 B2/);
  assert.doesNotMatch(text, /!ctubossatacar 2 B2/);
  assertPublic(text);
});

function battleFixture(rulesVersion = 2) {
  const attack = fatalityProfile('zorro_llamas_errantes');
  const unit = { id: 'unit-a', characterId: 'zorro_llamas_errantes', characterName: 'Zorro Errante', stats: { hp: 118 }, hp: 118,
    attacks: [{ id: 'basic', name: 'Ascua', power: 25 }, { id: 'skill', name: 'Ilusión', power: 33 }], effects: [], cooldowns: {},
    fatality: { version: 1, roll: 0, unlocked: true, used: false, attack } };
  const opponent = { ...unit, id: 'unit-b', characterId: 'panda_guerrero', characterName: 'Panda Guerrero', fatality: undefined };
  return { status: 'active', rulesVersion, turnNumber: 1, turnUserId: 'a', teamSize: 1, actions: [], openingEvents: [{ type: 'fatality_ready', unitId: 'unit-a' }],
    players: rulesVersion === 2 ? [{ userId: 'a', name: 'Miguel', units: [unit], activeIndex: 0 }, { userId: 'b', name: 'Lukas', units: [opponent], activeIndex: 0 }]
      : [{ userId: 'a', name: 'Miguel', unit }, { userId: 'b', name: 'Lukas', unit: opponent }] };
}

test('classic and advanced combat expose Fatality only while unused and still describe its saved attack after use', () => {
  for (const version of [1, 2]) {
    const battle = battleFixture(version);
    const unit = version === 2 ? battle.players[0].units[0] : battle.players[0].unit;
    assert.match(renderBattle(battle, cmd), /!ctuatacar 3/);
    unit.fatality.used = true;
    battle.turnNumber = 2;
    battle.actions.push({ type: 'attack', actorId: 'a', targetId: 'b', actorUnitId: 'unit-a', targetUnitId: 'unit-b', attackId: unit.fatality.attack.id, hit: true, damage: 50, events: [] });
    const text = renderBattle(battle, cmd);
    assert.match(text, /¡FATALITY!.*\n💥 \*50 de daño\*/);
    assert.doesNotMatch(text, /!ctuatacar 3/);
    assertPublic(text);
  }
});

test('story displays the third technique without exposing internal mandatory defeat counts', () => {
  const text = renderStory({ progress: { status: 'playing', missionIndex: 9, contentVersion: 3 },
    mission: { code: 'II-03', title: 'El teatro' }, battle: { status: 'active', round: 2,
      learning: { defeats: 0, required: 2, remaining: 2 },
      team: [{ name: 'Zorro Errante', characterId: 'zorro_llamas_errantes', hp: 118, maxHp: 118, active: true,
        attacks: [{ choice: 1, name: 'Ascua', power: 25 }, { choice: 3, name: 'Última Llama', power: 50, fatality: true }] }],
      enemy: { name: 'Máscara errante', hp: 100, maxHp: 100 }, availableActions: ['attack', 'defend'] } }, cmd);
  assert.match(text, /💀 3\. Última Llama · 50 POT · Un uso/);
  assert.match(text, /!ctuhistoria atacar 3/);
  assert.doesNotMatch(text, /derrotas|reconocimiento obligatorio|remaining|required/i);
  assertPublic(text);
});
