import test from 'node:test';
import assert from 'node:assert/strict';
import { createCommandRouter, commands } from '../interfaces/whatsapp/index.js';
import { GameError } from '../utils/GameError.js';
import { renderStory } from '../interfaces/whatsapp/storyFormat.js';
import { commandText } from '../interfaces/whatsapp/format.js';
import { setup, register } from './helpers.js';

const cmd = (name, args) => commandText('!', name, args);
const progress = { status: 'playing', missionIndex: 0, run: 1, stage: 'choice', decisions: {}, memories: [] };
const firstMission = { code: 'P-01', title: 'Una invitación bajo el bambú', scene: ['Bao guarda una carta bajo el bambú.', '«¿Qué deseas conocer primero?»'], choices: [{ id: '1', label: 'Preguntar por el Archivo' }, { id: '2', label: 'Preguntar por las criaturas' }] };
const current = () => ({ progress, mission: firstMission, battle: null, team: [], reward: null });
const journal = { summary: ['Bao te recibió en la plaza.'], chronicle: [{ title: 'Una invitación', text: 'Elegiste conocer el Archivo.' }],
  characters: [{ title: 'Maestro Bao', text: 'Tu mentor guarda un antiguo sello.' }], traces: [{ title: 'Carta blanca', text: 'Su inscripción todavía es un misterio.' }],
  decisions: ['Preguntaste por el Archivo.'], memories: [{ title: 'Las campanas del Archivo', text: 'Un recuerdo inaugural.' }], atlas: ['Plaza del Bambú'] };

function fixture(overrides = {}) {
  const calls = [], replies = [], logs = [];
  const state = { current: current() };
  const story = Object.fromEntries(['getState', 'start', 'continue', 'choose', 'act', 'retry', 'reset'].map(method => [method, async request => {
    calls.push({ method, request });
    return { ...state.current, alreadyProcessed: false };
  }]));
  story.getJournal = async request => { calls.push({ method: 'getJournal', request }); return journal; };
  story.getMap = async request => { calls.push({ method: 'getMap', request }); return { chapters: [{ title: 'Prólogo', status: 'active', missions: [{ code: 'P-01', title: 'Una invitación bajo el bambú', status: 'active' }] }, { title: 'Capítulo I', status: 'locked', missions: [{ code: 'I-05', title: 'Nombre secreto del jefe', status: 'locked' }] }] }; };
  const game = { users: { getUserByIdentity: async identity => { assert.deepEqual(identity, { provider: 'whatsapp', subject: '521999999999@s.whatsapp.net' }); return { id: 'user-private', name: 'Miguel' }; } },
    story: { ...story, ...overrides }, economy: { claimDaily: async request => { calls.push({ method: 'claimDaily', request }); return { claim: { amount: 100, balanceAfter: 300, nextClaimAt: '2026-10-18T12:00:00.000Z' }, alreadyClaimed: false }; } } };
  const route = createCommandRouter({ game, prefix: '!', automaticSpawns: false, debug: false, logger: (...args) => logs.push(args) });
  let sequence = 0;
  async function send(body, { messageId = `story-ui-${++sequence}` } = {}) {
    const before = replies.length;
    const message = { key: { remoteJid: 'stories@g.us', participant: '521999999999:4@s.whatsapp.net', id: messageId } };
    assert.equal(await route({ sendMessage: async (_, payload) => replies.push(payload.text) }, message, body), true);
    assert.equal(replies.length, before + 1, 'Each story action sends one reply');
    const text = replies.at(-1);
    assert.doesNotMatch(text, /No pude confirmar|Debug activado|@s.whatsapp.net|user-private|\.ctu/);
    assert.equal(logs.length, 0);
    return text;
  }
  return { game, calls, state, replies, send };
}

test('story commands expose saved scene, numbered choices and direct aliases with one reply', async () => {
  const c = fixture();
  for (const name of ['ctuhistoria', 'ctucontinuar', 'ctucapitulos', 'ctumision', 'cturecuerdos', 'ctureiniciarhistoria']) assert.ok(commands.some(command => command.command === name));
  assert.match(await c.send('!ctuhistoria'), /Una invitación bajo el bambú.*!ctuhistoria elegir 1.*!ctuhistoria elegir 2/s);
  await c.send('!ctuhistoria iniciar');
  await c.send('!ctuhistoria elegir 2');
  assert.equal(c.calls.at(-1).method, 'choose');
  assert.equal(c.calls.at(-1).request.choice, '2');
  assert.equal(c.calls.at(-1).request.userId, 'user-private');
  assert.match(c.calls.at(-1).request.operationKey, /^[a-f0-9]{64}$/);
  await c.send('!ctucontinuar');
  assert.equal(c.calls.at(-1).method, 'continue');
  await c.send('!ctumision');
  assert.equal(c.calls.at(-1).method, 'getState');
  const map = await c.send('!ctucapitulos');
  assert.match(map, /Prólogo.*Capítulo I.*Continúa la campaña/s);
  assert.doesNotMatch(map, /Nombre secreto/);
  assert.match(await c.send('!cturecuerdos'), /Las campanas del Archivo/);
});

test('narrative journal never claims coins and existing daily reward keeps its original command', async () => {
  const c = fixture();
  const narrative = await c.send('!ctudiario historia', { messageId: null });
  assert.match(narrative, /DIARIO DEL CUSTODIO.*Maestro Bao.*Carta blanca.*Preguntaste por el Archivo/s);
  assert.deepEqual(c.calls.map(call => call.method), ['getJournal']);
  assert.match(await c.send('!ctudiario'), /\+100 ChengCoins/);
  assert.equal(c.calls.at(-1).method, 'claimDaily');
  assert.match(await c.send('!ctuhistoria diario'), /DIARIO DEL CUSTODIO/);
  assert.equal(c.calls.filter(call => call.method === 'claimDaily').length, 1);
});

test('test reset is hidden in public help, requires confirmation and keeps source identity private', async () => {
  const c = fixture();
  const general = await c.send('!ctuayuda');
  const specific = await c.send('!ctuhistoria ayuda');
  assert.match(general, /!ctuhistoria/);
  assert.doesNotMatch(general + specific, /ctureiniciarhistoria/);
  const warning = await c.send('!ctureiniciarhistoria');
  assert.match(warning, /recompensas ya entregadas se conservan.*!ctureiniciarhistoria confirmar/s);
  assert.equal(c.calls.length, 0);
  await c.send('!ctureiniciarhistoria confirmar', { messageId: 'reset-same-message' });
  await c.send('!ctureiniciarhistoria confirmar', { messageId: 'reset-same-message' });
  assert.equal(c.calls.length, 2);
  assert.equal(c.calls[0].method, 'reset');
  assert.deepEqual(c.calls[0].request, c.calls[1].request);
  const prior = c.calls.length;
  assert.match(await c.send('!ctureiniciarhistoria si'), /confirmar/);
  assert.equal(c.calls.length, prior);
});

test('battle UI shows enemy warning, compact HP and all tactical actions without unit identifiers', async () => {
  const c = fixture();
  c.state.current = { ...current(), progress: { ...progress, stage: 'battle' }, mission: { code: 'I-03', title: 'Huellas en el bambú' }, battle: {
    status: 'active', round: 3, lastEvents: ['💥 Panda causó 22 de daño.', 'El Eco se cubre con raíces.'],
    enemy: { name: 'Eco de Raíces', hp: 95, maxHp: 140, intent: 'Carga un golpe feroz. Defiende antes de que lo libere.' },
    team: [{ slot: 1, id: 'PAND-000001', name: 'Panda Guerrero', characterId: 'panda_guerrero', hp: 63, maxHp: 120, active: true,
      attacks: [{ choice: 1, name: 'Impacto del Panda', power: 25, cooldown: 0, ready: true }, { choice: 2, name: 'Golpe de Bambú', power: 40, cooldown: 1, ready: false }] },
    { slot: 2, id: 'LOBO-000001', name: 'Lobo Sombrío', hp: 90, maxHp: 90, active: false, attacks: [] }]
  } };
  const text = await c.send('!ctuhistoria');
  assert.match(text, /HISTORIA \| T3/);
  assert.match(text, /63\/120 HP/);
  assert.match(text, /SEÑAL ENEMIGA.*Carga un golpe/s);
  for (const action of ['atacar 1', 'defender', 'cambiar 2']) assert.ok(text.includes(`!ctuhistoria ${action}`));
  assert.doesNotMatch(text, /PAND-000001|LOBO-000001|!ctuhistoria atacar 2|!ctuhistoria habilidad/);
  await c.send('!ctuhistoria defender');
  assert.deepEqual({ action: c.calls.at(-1).request.action, choice: c.calls.at(-1).request.choice }, { action: 'defend', choice: undefined });
  await c.send('!ctuhistoria cambiar 2');
  assert.equal(c.calls.at(-1).request.choice, '2');
  await c.send('!ctuhistoria habilidad');
  assert.equal(c.calls.at(-1).request.action, 'skill');
  await c.send('!ctuhistoria rendirse');
  assert.equal(c.calls.at(-1).request.action, 'surrender');
  const before = c.calls.filter(call => call.method === 'act').length;
  assert.match(await c.send('!ctuhistoria elegir 99'), /opción no está disponible/);
  assert.match(await c.send('!ctuhistoria atacar 3'), /acción no está disponible/);
  assert.equal(c.calls.filter(call => call.method === 'act').length, before);
});

test('a defeat explains retry and preparation while inspection stays read-only', async () => {
  const c = fixture();
  c.state.current = { ...current(), mission: { code: 'I-03', title: 'Huellas en el bambú' }, battle: { status: 'lost', round: 7, lastEvents: ['La raíz cargada alcanzó al equipo.'],
    team: [{ slot: 1, name: 'Panda Guerrero', hp: 0, maxHp: 120, active: true, attacks: [] }], enemy: { name: 'Eco de Raíces', hp: 20, maxHp: 140 } } };
  const defeat = await c.send('!ctuhistoria');
  assert.match(defeat, /DERROTA.*No pierdes cartas ni monedas.*!ctuhistoria reintentar.*!ctuequipo/s);
  await c.send('!ctuhistoria pista');
  assert.equal(c.calls.at(-1).method, 'getState');
  await c.send('!ctuhistoria reintentar');
  assert.equal(c.calls.at(-1).method, 'retry');
});

test('one-time rewards, chosen consequence and phase-one end do not advertise duplicate payouts', () => {
  const receipt = { coins: 100, userXp: 20, unitXp: 200, unitRewards: [{ characterName: 'Panda Guerrero', xp: 200, levelBefore: 2, levelAfter: 3 }], materials: { fragmentos: 2 }, memory: 'La carta blanca' };
  const fresh = renderStory({ ...current(), consequence: 'Lian recuerda que elegiste ayudar.', reward: receipt }, cmd);
  assert.match(fresh, /Lian recuerda.*\+100 ChengCoins.*\+200 XP.*Nv\. 3.*2 fragmentos/s);
  const replay = renderStory({ ...current(), progress: { ...progress, status: 'complete' }, reward: { ...receipt, alreadyClaimed: true } }, cmd);
  assert.match(replay, /FASE 1 COMPLETA.*Premio único ya entregado.*siguiente fase/s);
  assert.doesNotMatch(replay, /\+100|\+200|\+20|\+2/);
});

test('expected story domain errors guide the next action without debug output', async () => {
  const c = fixture({ continue: async () => { throw new GameError('STORY_CHOICE_REQUIRED'); } });
  assert.match(await c.send('!ctucontinuar'), /Primero elige.*!ctuhistoria elegir 1/);
  assert.match(await c.send('!ctuhistoria cualquiercosa'), /acción no está disponible/);
});

test('real story WhatsApp flow resumes, retries and completes phase one without paying twice after reset', async t => {
  const c = setup(t, { randomRoll: () => 0, storyContentVersion: 1 });
  const user = await register(c.game);
  const replies = [], logs = [];
  const route = createCommandRouter({ game: c.game, prefix: '!', automaticSpawns: false, debug: false, logger: (...args) => logs.push(args) });
  let sequence = 0;
  async function send(body, messageId = `real-story-ui-${++sequence}`) {
    const before = replies.length;
    await route({ sendMessage: async (_, payload) => replies.push(payload.text) }, {
      key: { remoteJid: '521999999999@s.whatsapp.net', id: messageId }
    }, body);
    assert.equal(replies.length, before + 1);
    assert.doesNotMatch(replies.at(-1), /No pude confirmar|STB-|STA-|SR:|USR-|@s.whatsapp.net/);
    assert.equal(logs.length, 0);
    return replies.at(-1);
  }
  const get = () => c.game.story.getState({ userId: user.id });
  async function fight() {
    for (let turns = 0; turns < 60; turns++) {
      const state = await get();
      if (state.battle?.status !== 'active') return state;
      const active = state.battle.team.find(unit => unit.active);
      const action = !state.battle.tutorial.attack ? 'atacar 1'
        : !state.battle.tutorial.defend || state.battle.enemy.phase === 'unleash' ? 'defender'
          : !state.battle.tutorial.skill && active.attacks[1].ready ? 'habilidad'
            : active.attacks[1].ready ? 'habilidad' : 'atacar 1';
      await send(`!ctuhistoria ${action}`);
    }
    assert.fail('The encounter should finish in fewer than 60 actions');
  }
  assert.match(await send('!ctuhistoria'), /Bao te espera/);
  await send('!ctuhistoria iniciar');
  assert.match(await send('!ctuhistoria elegir 1'), /Bao:.*Guardamos nombres/s);
  assert.match(await send('!ctucontinuar'), /primer compañero/);
  await send('!ctustarter panda');
  await send('!ctucontinuar');
  await send('!ctucontinuar');
  const savedTurn = (await get()).battle.round;
  assert.match(await send('!ctumision'), new RegExp(`HISTORIA \\| T${savedTurn}`));
  assert.equal((await get()).battle.round, savedTurn);
  assert.match(await send('!ctuequipo limpiar'), /No puedes cambiar tu equipo/);
  assert.equal((await get()).team.length, 1);
  await send('!ctuhistoria atacar 1');
  const fighting = await get();
  const fighter = fighting.battle.team.find(unit => unit.active);
  const details = await c.game.units.getCombatDetails({ unitId: fighting.team[0].id });
  assert.equal(details.units[0].hp, fighter.hp);
  assert.equal(details.units[0].owner.id, user.id);
  assert.equal(details.units[0].owner.name, 'Miguel');
  assert.equal(details.units[0].inStory, true);
  assert.match(await send('!ctuficha'), new RegExp(`Vida: ${fighter.hp}/${fighter.maxHp} HP`));
  await fight();
  assert.equal((await get()).mission.code, 'P-04');
  await send('!ctucontinuar');
  await send('!ctuhistoria elegir 1');
  await send('!ctuhistoria elegir 1');
  await send('!ctuhistoria elegir 1');
  assert.match(await send('!ctuhistoria rendirse'), /RETIRADA.*Te retiraste.*reintentar/s);
  const xpBeforeRetry = (await get()).team[0].progress.xp;
  await send('!ctuhistoria reintentar');
  assert.equal((await get()).team[0].progress.xp, xpBeforeRetry);
  await fight();
  const finished = await get();
  assert.equal(finished.progress.status, 'complete');
  assert.ok(finished.team[0].progress.level >= 5);
  assert.match(replies.at(-1), /FASE 1 COMPLETA/);
  assert.ok(replies.at(-1).includes(`!ctuevolucion ${finished.team[0].id}`));
  assert.match(await send('!ctumovimientos'), /Misión de Historia/);
  const profile = await c.game.users.getProfile(user.id);
  const legacyJournal = await send('!ctudiario historia');
  assert.match(legacyJournal, /La gratitud del bosque/);
  assert.ok(legacyJournal.length < 4096);
  assert.match(await send('!ctudiario historia cronica 1'), /P-01.*P-04.*Página 1 de 2/s);
  assert.match(await send('!ctudiario historia cronica 2'), /I-01.*I-03.*Página 2 de 2/s);
  await send('!ctureiniciarhistoria confirmar');
  const reset = await get();
  assert.equal(reset.progress.run, 2);
  assert.equal(reset.mission.code, 'P-01');
  assert.match(await send('!ctuhistoria elegir 1'), /Premio único ya entregado/);
  const after = await c.game.users.getProfile(user.id);
  assert.deepEqual(after.user.economy, profile.user.economy);
  assert.deepEqual(after.user.progress, profile.user.progress);
  assert.equal((await get()).team[0].progress.xp, finished.team[0].progress.xp);
});

test('story inspection freezes attacks while team clearing and replacement remain locked until reset', async t => {
  const c = setup(t, { randomRoll: () => 0, storyContentVersion: 1 });
  const user = await register(c.game);
  const unit = (await c.game.starter.claimStarter({ userId: user.id, choice: 'panda' })).unit;
  let sequence = 0;
  const operation = () => ({ userId: user.id, operationKey: `story-inspection:${++sequence}` });
  await c.game.story.start(operation());
  await c.game.story.choose({ ...operation(), choice: '1' });
  await c.game.story.continue(operation());
  await c.game.story.continue(operation());
  const original = (await c.game.units.getCombatDetails({ unitId: unit.id })).units[0];
  assert.equal(original.owner.id, user.id);
  assert.equal(original.inStory, true);
  const attackId = original.attacks[0].id;
  await c.storage.withTransaction(async repos => {
    const attack = await repos.attacks.get(attackId);
    await repos.attacks.replace({ ...attack, power: attack.power + 10, combat: { ...attack.combat, power: attack.combat.power + 10 }, revision: attack.revision + 1 });
  });
  const frozen = (await c.game.units.getCombatDetails({ unitId: unit.id })).units[0];
  assert.deepEqual(frozen.attacks, original.attacks);
  await assert.rejects(c.game.teams.updateTeam({ userId: user.id, operation: 'clear' }), { code: 'TEAM_LOCKED' });
  await assert.rejects(c.game.teams.setTeam({ userId: user.id, unitIds: [] }), { code: 'TEAM_LOCKED' });
  await c.game.story.reset(operation());
  const released = (await c.game.units.getCombatDetails({ unitId: unit.id })).units[0];
  assert.equal(released.inBattle, false);
  assert.equal(released.attacks[0].power, original.attacks[0].power + 10);
  await c.game.teams.updateTeam({ userId: user.id, operation: 'clear' });
  assert.equal((await c.game.teams.getTeam(user.id)).units.length, 0);
  assert.equal((await c.game.validateDatabase()).valid, true);
});

test('expanded story UI offers roots and decoy tactics while inspection stays free', async () => {
  const c = fixture();
  const combat = {
    status: 'active', encounterId: 'I05', round: 1, tutorial: {}, availableActions: ['attack', 'defend', 'skill', 'break'],
    team: [{ slot: 1, name: 'Panda Guerrero', hp: 120, maxHp: 126, active: true, attacks: [{ choice: '1', name: 'Golpe de Bambú', power: 25, ready: true }, { choice: '2', name: 'Impacto', power: 36, ready: true }] }],
    enemy: { name: 'Guardián Marchito', hp: 260, maxHp: 260, phase: 'roots', intent: 'Las raíces se cierran sobre el sendero.', mechanics: 'Barrera de raíces: 50 puntos.' }, lastEvents: []
  };
  c.state.current = { ...current(), campaign: { missionCount: 14 }, progress: { ...progress, contentVersion: 2, missionIndex: 8, stage: 'battle' },
    mission: { code: 'I-05', title: 'Guardián Marchito', chapterTitle: 'El Bosque que Olvidó su Voz' }, battle: combat };
  const roots = await c.send('!ctuhistoria');
  assert.match(roots, /8\/14 misiones.*Barrera de raíces: 50 puntos.*!ctuhistoria romper.*consume el turno/s);
  assert.doesNotMatch(roots, /!ctuhistoria observar/);
  await c.send('!ctuhistoria romper');
  assert.equal(c.calls.at(-1).request.action, 'break');
  c.state.current.mission = { code: 'II-05', title: 'Mercader Sin Rostro', chapterTitle: 'El Mercado de los Ecos' };
  c.state.current.progress.missionIndex = 13;
  c.state.current.battle = { ...combat, encounterId: 'II05', availableActions: ['attack', 'defend', 'skill', 'observe'],
    enemy: { ...combat.enemy, name: 'Mercader Sin Rostro', phase: 'illusions', intent: 'Tres figuras dejan una misma huella.', mechanics: 'Señuelos activos: observa para reconocer al original.' } };
  const decoys = await c.send('!ctuhistoria');
  assert.match(decoys, /Capítulo II.*Mercado de los Ecos.*!ctuhistoria observar.*consume el turno/s);
  assert.doesNotMatch(decoys, /!ctuhistoria romper/);
  await c.send('!ctuhistoria observar');
  assert.equal(c.calls.at(-1).request.action, 'observe');
  await c.send('!ctuhistoria inspeccionar');
  assert.equal(c.calls.at(-1).method, 'getState');
});

test('investigation views continue each clue without offering the committed decision twice', () => {
  const state = { ...current(), campaign: { missionCount: 14 }, progress: { ...progress, contentVersion: 2, missionIndex: 12, stage: 'investigation', sceneStep: 1 },
    mission: { code: 'II-04', chapterTitle: 'El Mercado de los Ecos', title: 'El libro de los ausentes', scene: ['Yun descubre una petición entre los hilos.'], choices: firstMission.choices } };
  const first = renderStory(state, cmd);
  assert.match(first, /Capítulo II.*Investigación 1\/2.*!ctuhistoria continuar/s);
  assert.doesNotMatch(first, /!ctuhistoria elegir/);
  const second = renderStory({ ...state, progress: { ...state.progress, sceneStep: 2 }, mission: { ...state.mission, scene: ['Tao reconoce la ruta en los recibos.'] } }, cmd);
  assert.match(second, /Tao reconoce.*Investigación 2\/2/s);
  assert.doesNotMatch(second, /Yun descubre|!ctuhistoria elegir/);
});

test('finished version-one save advertises continuation while version two ends after fourteen missions', () => {
  const legacy = renderStory({ ...current(), campaign: { missionCount: 7, availableMissionCount: 14, contentVersion: 1 },
    progress: { ...progress, contentVersion: 1, missionIndex: 7, status: 'complete' }, nextContentAvailable: true }, cmd);
  assert.match(legacy, /FASE 1 COMPLETA.*7\/7 misiones.*El bosque vuelve a llamarte.*!ctuhistoria continuar/s);
  const expanded = renderStory({ ...current(), campaign: { missionCount: 14, availableMissionCount: 14, contentVersion: 2 },
    progress: { ...progress, contentVersion: 2, missionIndex: 14, status: 'complete' }, nextContentAvailable: false }, cmd);
  assert.match(expanded, /CAPÍTULO II COMPLETO.*14\/14 misiones.*Dos Trazos/s);
  assert.doesNotMatch(expanded, /FASE 1 COMPLETA|resto del Capítulo I|!ctuhistoria continuar/);
});

test('expanded story errors explain the available boss mechanics without exposing internals', async () => {
  const c = fixture({ act: async ({ action }) => { throw new GameError(action === 'break' ? 'STORY_NOT_BREAKABLE' : 'STORY_NOT_OBSERVABLE'); } });
  assert.match(await c.send('!ctuhistoria romper'), /No hay una barrera/);
  assert.match(await c.send('!ctuhistoria observar'), /señuelos activos.*gratis/s);
});

test('real expanded WhatsApp campaign completes fourteen missions, two ordered clues and two Trazos', async t => {
  const c = setup(t, { randomRoll: () => 0 });
  const user = await register(c.game);
  const replies = [], logs = [];
  const route = createCommandRouter({ game: c.game, prefix: '!', automaticSpawns: false, debug: false, logger: (...args) => logs.push(args) });
  let sequence = 0;
  async function send(body) {
    const before = replies.length;
    await route({ sendMessage: async (_, payload) => replies.push(payload.text) }, { key: { remoteJid: '521999999999@s.whatsapp.net', id: `expanded-story-ui-${++sequence}` } }, body);
    assert.equal(replies.length, before + 1);
    assert.doesNotMatch(replies.at(-1), /No pude confirmar|STB-|STA-|SR:|USR-|@s.whatsapp.net/);
    assert.equal(logs.length, 0);
    return replies.at(-1);
  }
  await send('!ctustarter panda');
  await send('!ctuhistoria iniciar');
  const initialJournal = await send('!ctudiario historia');
  assert.doesNotMatch(initialJournal, /Tía Mei|Guardiana Nube|Señora Yun|Mercader Sin Rostro|Archivista/);
  const used = new Set();
  let firstTraceChecked = false, simulatedChecked = false, investigationFirst = false, investigationSecond = false;
  for (let step = 0; step < 180; step++) {
    const state = await c.game.story.getState({ userId: user.id });
    assert.equal(state.campaign.missionCount, 14);
    if (state.progress.status === 'complete') break;
    if (state.mission.code === 'II-01' && !firstTraceChecked) {
      const diary = await send('!ctudiario historia');
      assert.match(diary, /1 de 5 recuperados.*Primer Trazo/s);
      assert.doesNotMatch(diary, /Segundo Trazo|Señora Yun|Archivista/);
      firstTraceChecked = true;
    }
    if (state.progress.stage === 'battle') {
      const battle = state.battle, active = battle.team.find(unit => unit.active);
      const tutorial = battle.encounterId === 'P03';
      const action = tutorial && !battle.tutorial.attack ? 'atacar 1'
        : battle.enemy.phase === 'unleash' || tutorial && !battle.tutorial.defend ? 'defender'
          : battle.availableActions.includes('break') ? 'romper'
            : battle.availableActions.includes('observe') ? 'observar'
              : active.attacks[1].ready ? 'habilidad' : 'atacar 1';
      used.add(action);
      await send(`!ctuhistoria ${action}`);
    } else if (state.progress.stage === 'choice') {
      if (state.mission.code === 'II-03') {
        assert.match(await send('!ctumision'), /oferta es simulada.*no se intercambian/s);
        const unitsBefore = (await c.game.units.getUserUnits(user.id)).items.map(unit => ({ id: unit.id, ownerId: unit.ownerId, ownershipVersion: unit.ownershipVersion }));
        await send('!ctuhistoria elegir 2');
        assert.deepEqual((await c.game.units.getUserUnits(user.id)).items.map(unit => ({ id: unit.id, ownerId: unit.ownerId, ownershipVersion: unit.ownershipVersion })), unitsBefore);
        simulatedChecked = true;
      } else await send(`!ctuhistoria elegir ${state.mission.code === 'II-04' ? '2' : '1'}`);
    } else if (state.progress.stage === 'investigation') {
      const clue = await send('!ctumision');
      assert.doesNotMatch(clue, /!ctuhistoria elegir/);
      if (state.progress.sceneStep === 1) {
        assert.match(clue, /hilo que se interrumpe.*Investigación 1\/2/s);
        investigationFirst = true;
      } else {
        assert.match(clue, /Tres entregas.*Investigación 2\/2/s);
        investigationSecond = true;
      }
      await send('!ctucontinuar');
    } else if (state.progress.stage === 'defeated') assert.fail('The full UI route should win when reading each boss signal');
    else await send('!ctucontinuar');
  }
  const finished = await c.game.story.getState({ userId: user.id });
  assert.equal(finished.progress.status, 'complete');
  assert.equal(finished.progress.completedMissionIds.length, 14);
  assert.equal(finished.progress.traces.length, 2);
  const earnedXp = value => value.xp + value.level * (value.level - 1) * 50;
  assert.equal(earnedXp(finished.team[0].progress), 1495);
  assert.ok(firstTraceChecked && simulatedChecked && investigationFirst && investigationSecond);
  assert.ok(used.has('romper') && used.has('observar'));
  assert.match(replies.at(-1), /CAPÍTULO II COMPLETO.*Segundo Trazo/s);
  const beforeJournal = await c.game.users.getUser(user.id);
  const journal = await send('!ctudiario historia');
  assert.match(journal, /2 de 5 recuperados.*Segundo Trazo.*Una voz que confía/s);
  assert.doesNotMatch(journal, /Archivista|Centinela del Espejo/);
  assert.ok(journal.length < 4096, `The journal summary should fit a compact message: ${journal.length}`);
  const earliest = await send('!ctudiario historia cronica 1');
  assert.match(earliest, /P-01.*P-04.*Página 1 de 4/s);
  assert.doesNotMatch(earliest, /II-05/);
  assert.match(await send('!ctuhistoria diario cronica 2'), /I-01.*I-04.*Página 2 de 4/s);
  assert.match(await send('!ctudiario historia cronica 4'), /II-04.*II-05.*Página 4 de 4/s);
  const beforeReset = await c.game.users.getUser(user.id);
  assert.deepEqual(beforeReset.economy, beforeJournal.economy);
  assert.deepEqual(beforeReset.progress, beforeJournal.progress);
  assert.equal(beforeReset.economy.coins, 560);
  assert.equal(earnedXp(beforeReset.progress), 455);
  await send('!ctureiniciarhistoria confirmar');
  assert.match(await send('!ctuhistoria elegir 1'), /Premio único ya entregado/);
  const afterReset = await c.game.users.getUser(user.id);
  assert.deepEqual(afterReset.economy, beforeReset.economy);
  assert.deepEqual(afterReset.progress, beforeReset.progress);
});

test('journal summary keeps the latest two entries and full sections use four numeric entries per page', async () => {
  const rich = { ...journal,
    chronicle: Array.from({ length: 10 }, (_, index) => ({ title: `Escena ${index + 1}`, text: `Historia antigua ${index + 1}.` })),
    decisions: Array.from({ length: 6 }, (_, index) => ({ title: `Decisión ${index + 1}`, text: `Elegiste el camino ${index + 1}.` })),
    characters: Array.from({ length: 6 }, (_, index) => ({ title: `Personaje ${index + 1}`, text: 'Ficha larga del personaje.' })),
    memories: Array.from({ length: 6 }, (_, index) => ({ title: `Recuerdo ${index + 1}`, text: 'Descripción larga del recuerdo.' })),
    atlas: Array.from({ length: 6 }, (_, index) => ({ title: `Lugar ${index + 1}`, text: 'Descripción larga del lugar.' })) };
  let reads = 0;
  const c = fixture({ getJournal: async () => { reads++; return rich; } });
  const summary = await c.send('!ctudiario historia', { messageId: null });
  assert.match(summary, /Escena 9.*Escena 10.*Decisión 5.*Decisión 6/s);
  assert.doesNotMatch(summary, /Escena 8|Decisión 4|Ficha larga|Descripción larga/);
  assert.match(summary, /Personaje 1.*Personaje 6.*Recuerdo 1.*Recuerdo 6/s);
  const page1 = await c.send('!ctudiario historia cronica 1', { messageId: null });
  assert.match(page1, /Escena 1.*Escena 4.*Página 1 de 3.*!ctudiario historia cronica 2/s);
  assert.doesNotMatch(page1, /Escena 5|Escena 9/);
  const page2 = await c.send('!ctudiario historia crónica 2');
  assert.match(page2, /Escena 5.*Escena 8.*Página 2 de 3.*!ctudiario historia cronica 1.*!ctudiario historia cronica 3/s);
  assert.equal(await c.send('!ctuhistoria diario cronica 2'), page2);
  assert.match(await c.send('!ctudiario historia personajes 2'), /Personaje 5.*Ficha larga.*Personaje 6/s);
  assert.match(await c.send('!cturecuerdos 2'), /Recuerdo 5.*Descripción larga.*Recuerdo 6/s);
  assert.match(await c.send('!ctudiario historia atlas 2'), /Lugar 5.*Lugar 6/s);
  assert.ok(reads >= 7);
  assert.equal(c.calls.filter(call => call.method === 'claimDaily').length, 0);
});

test('journal rejects unknown sections and invalid pages while every query leaves daily rewards untouched', async () => {
  let reads = 0;
  const c = fixture({ getJournal: async () => { reads++; return journal; } });
  for (const value of ['0', '-1', 'mucho', '1.5', '9007199254740992']) {
    assert.match(await c.send(`!ctudiario historia cronica ${value}`, { messageId: null }), /página entera desde 1/);
  }
  assert.match(await c.send('!ctudiario historia inexistente'), /Elige cronica, personajes/);
  assert.match(await c.send('!ctudiario historia cronica 1 sobra'), /Elige cronica, personajes/);
  assert.equal(reads, 0, 'Malformed arguments should not read the journal');
  assert.match(await c.send('!ctudiario historia cronica 99'), /no tiene tantos resultados/);
  assert.equal(reads, 1);
  assert.equal(c.calls.filter(call => call.method === 'claimDaily').length, 0);
  assert.match(await c.send('!ctudiario'), /\+100 ChengCoins/);
  assert.equal(c.calls.filter(call => call.method === 'claimDaily').length, 1);
});
