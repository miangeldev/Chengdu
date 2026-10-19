import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';
import { GameError } from '../utils/GameError.js';
import { setup, register } from './helpers.js';
import { activeStoryMission, currentStoryStep } from '../game/story/catalog.js';
import { storySeasonTacticalAction, storyTacticalAction } from '../scripts/simulate-story-balance.js';
import { COLLECTIONS, validateDatabase } from '../storage/validation.js';

const initial = () => ({ campaign: { missionCount: 32, contentVersion: 3, finishStage: 'season' },
  progress: { contentVersion: 3, status: 'playing', missionIndex: 17, stage: 'choice', sceneStep: 1 },
  route: { kind: 'main' }, returnAvailable: false,
  mission: { code: 'III-04', title: 'El recuerdo de Bao', chapterTitle: 'Las Montañas del Espejo', stepNumber: 2, stepCount: 5,
    scene: ['Bao reconoce su firma junto a otra inscripción.'], choices: [{ id: '1', label: 'Escuchar a Bao' }, { id: '2', label: 'Pedirle respuestas' }] }, team: [], battle: null, reward: null });

function fixture(overrides = {}) {
  const state = { value: initial() }, calls = [], replies = [], logs = [];
  const methods = ['getState', 'start', 'continue', 'choose', 'act', 'retry', 'reset', 'startOptional', 'returnToMain', 'startTrial', 'contribute'];
  const story = Object.fromEntries(methods.map(method => [method, async request => { calls.push({ method, request }); return state.value; }]));
  story.getOptionals = async request => { calls.push({ method: 'getOptionals', request }); return { missions: [
    { code: 'I-A', title: 'Los sonidos perdidos', status: 'available' },
    { code: 'II-A', title: 'El paquete de Tao', status: 'complete' },
    { code: 'III-A', title: 'Revelación que todavía no debes leer', status: 'locked' }
  ] }; };
  story.getTrials = async request => { calls.push({ method: 'getTrials', request }); return { trials: [
    { number: 1, title: 'La prueba del espejo', available: true, completed: false },
    { number: 2, title: 'Jefe futuro que aún no conoces', available: false, completed: false }
  ] }; };
  story.getScenes = async request => { calls.push({ method: 'getScenes', request }); return { mission: { code: request.code, title: 'El recuerdo de Bao' }, scene: ['Escena recuperada de tu cuaderno.'], page: request.page, totalPages: 5 }; };
  const game = { users: { getUserByIdentity: async () => ({ id: 'private-user' }) }, story: { ...story, ...overrides } };
  const route = createCommandRouter({ game, prefix: '!', automaticSpawns: false, debug: false, logger: (...args) => logs.push(args) });
  let sequence = 0;
  async function send(body, messageId = `season-ui-${++sequence}`) {
    const before = replies.length;
    assert.equal(await route({ sendMessage: async (_, payload) => replies.push(payload.text) }, { key: { remoteJid: '521999999999@s.whatsapp.net', id: messageId } }, body), true);
    assert.equal(replies.length, before + 1);
    assert.equal(logs.length, 0);
    const text = replies.at(-1);
    assert.doesNotMatch(text, /No pude confirmar|private-user|@s.whatsapp.net|STB-|STA-|raw-script|USR-|\.ctu/);
    return text;
  }
  return { state, calls, replies, send };
}

function combat(learning = null) {
  return { status: 'active', encounterId: 'V05', round: 3, learning,
    availableActions: ['attack', 'defend', 'skill', 'support', 'purify', 'protect'],
    team: [{ slot: 1, characterId: 'panda_guerrero', name: 'Panda Guerrero', hp: 90, maxHp: 140, active: true,
      attacks: [{ choice: '1', name: 'Golpe de Bambú', power: 25, ready: true }, { choice: '2', name: 'Impacto', power: 36, ready: true }] }],
    enemy: { name: 'El Archivista', hp: 600, maxHp: 900, phase: 'control', intent: 'Un sello cubre tu técnica.', mechanics: 'Alterna acciones para proteger los vínculos.' }, lastEvents: [] };
}

test('season scenes show their current step and chapter without exposing the full script', async () => {
  const c = fixture();
  c.state.value.mission.steps = [{ internalId: 'raw-script', scene: ['No muestres el desenlace antes de llegar.'] }];
  const first = await c.send('!ctuhistoria', null);
  assert.match(first, /Capítulo III.*17\/32 misiones.*Escena 2\/5.*Escuchar a Bao.*!ctuhistoria elegir 2/s);
  assert.doesNotMatch(first, /No muestres el desenlace/);
  c.state.value.mission = { ...c.state.value.mission, code: 'IV-03', chapterTitle: 'Las Casas Divididas', title: 'Pactos de bambú', choices: [], communityObjective: 'Ayuda a reconstruir el pabellón.' };
  c.state.value.progress.stage = 'community';
  const community = await c.send('!ctuhistoria');
  assert.match(community, /Capítulo IV.*!ctuhistoria aportar/s);
  assert.doesNotMatch(community, /!ctuhistoria continuar/);
  await c.send('!ctuhistoria aportar');
  assert.equal(c.calls.at(-1).method, 'contribute');
  assert.equal(c.calls.at(-1).request.userId, 'private-user');
  assert.match(c.calls.at(-1).request.operationKey, /^[a-f0-9]{64}$/);
});

test('mandatory boss recognition is explicit and retirement never promises learning credit', async () => {
  const c = fixture();
  c.state.value.mission = { code: 'V-05', title: 'El Archivista', chapterTitle: 'El Último Nombre' };
  c.state.value.progress.stage = 'battle';
  c.state.value.battle = combat({ required: 4, defeats: 0, remaining: 4, scouting: true });
  const first = await c.send('!ctuhistoria');
  assert.match(first, /Capítulo V.*0\/4 derrotas.*todavía no puedes vencer.*Rendirse no cuenta/s);
  c.state.value.battle = { ...combat({ required: 4, defeats: 4, remaining: 0, scouting: true }), status: 'lost', finishReason: 'learning' };
  const lost = await c.send('!ctuhistoria');
  assert.match(lost, /4\/4 derrotas.*Aprendizaje completado.*reintentar/s);
  assert.doesNotMatch(lost, /Faltan 4/);
  c.state.value.battle = { ...combat({ required: 4, defeats: 1, remaining: 3, scouting: true }), status: 'lost', finishReason: 'surrender' };
  assert.match(await c.send('!ctuhistoria'), /RETIRADA.*1\/4 derrotas.*Rendirse no cuenta/s);
});

test('support, purification and protection offer only available tactics and dispatch authenticated mutations', async () => {
  const c = fixture();
  c.state.value.battle = combat();
  c.state.value.progress.stage = 'battle';
  const text = await c.send('!ctuhistoria');
  for (const command of ['apoyar', 'purificar', 'proteger']) assert.ok(text.includes(`!ctuhistoria ${command}`));
  for (const [command, action] of [['apoyar', 'support'], ['purificar', 'purify'], ['proteger', 'protect']]) {
    await c.send(`!ctuhistoria ${command}`);
    assert.equal(c.calls.at(-1).request.action, action);
    assert.equal(c.calls.at(-1).request.userId, 'private-user');
    assert.equal(c.calls.at(-1).request.choice, undefined);
  }
  c.state.value.battle.availableActions = ['attack', 'defend'];
  assert.doesNotMatch(await c.send('!ctuhistoria'), /!ctuhistoria apoyar|!ctuhistoria purificar|!ctuhistoria proteger/);
});

test('a friendly defeat continues to its saved scene without offering an invalid retry', async () => {
  const c = fixture();
  c.state.value.mission = { code: 'III-01', title: 'Una mano conocida', stepNumber: 3, stepCount: 5,
    scene: ['Huan te ofrece agua y espera tu respuesta.'], choices: [{ id: '1', label: 'Escuchar lo que aprendió Huan' }] };
  c.state.value.battle = { ...combat(), status: 'lost', acceptedDefeat: true };
  c.state.value.progress.stage = 'choice';
  const text = await c.send('!ctuhistoria');
  assert.match(text, /Duelo amistoso concluido.*La historia continúa.*Huan te ofrece agua.*!ctuhistoria elegir 1/s);
  assert.doesNotMatch(text, /DERROTA|!ctuhistoria reintentar|Esta vez la expedición cayó/);
});

test('optional routes preserve the main season and conceal locked quest spoilers', async () => {
  const c = fixture();
  const menu = await c.send('!ctuhistoria opcionales', null);
  assert.match(menu, /!ctuhistoria opcional I-A.*II-A.*Completada/s);
  assert.doesNotMatch(menu, /Revelación que todavía/);
  c.state.value.route = { kind: 'optional', code: 'III-A', title: 'El paso de Huan' };
  c.state.value.progress.status = 'complete';
  c.state.value.progress.stage = 'complete';
  c.state.value.mission = { code: 'III-A', title: 'El paso de Huan', stepNumber: 1, stepCount: 3, scene: ['Huan busca a su compañero.'], choices: [{ id: '1', label: 'Ayudarlo a buscar' }] };
  c.state.value.returnAvailable = true;
  await c.send('!ctuhistoria opcional iii-a');
  assert.equal(c.calls.at(-1).method, 'startOptional');
  assert.equal(c.calls.at(-1).request.code, 'III-A');
  const active = c.replies.at(-1);
  assert.match(active, /MISIÓN OPCIONAL.*El paso de Huan.*elegir 1.*!ctuhistoria volver/s);
  assert.doesNotMatch(active, /TEMPORADA COMPLETA/);
  await c.send('!ctuhistoria volver');
  assert.equal(c.calls.at(-1).method, 'returnToMain');
});

test('scene archive reads numbered saved pages without operation keys or message identifiers', async () => {
  const c = fixture();
  const text = await c.send('!ctuhistoria escenas iii-04 2', null);
  assert.match(text, /ARCHIVO DE ESCENAS.*Escena recuperada.*Página 2 de 5.*!ctuhistoria escenas III-04 1.*!ctuhistoria escenas III-04 3/s);
  assert.deepEqual(c.calls.at(-1), { method: 'getScenes', request: { userId: 'private-user', code: 'III-04', page: 2 } });
  const before = c.calls.length;
  assert.match(await c.send('!ctuhistoria escenas III-04 -1'), /página no es válida/);
  assert.match(await c.send('!ctuhistoria escenas internal-uuid 1'), /Elige una ruta disponible/);
  assert.equal(c.calls.length, before);
});

test('Archive trials list eligible training and do not advertise repeatable campaign prizes', async () => {
  const c = fixture();
  const list = await c.send('!ctuhistoria pruebas', null);
  assert.match(list, /premios de campaña no se vuelven.*!ctuhistoria prueba 1.*Completa el epílogo/s);
  assert.doesNotMatch(list, /Jefe futuro/);
  await c.send('!ctuhistoria prueba 1');
  assert.equal(c.calls.at(-1).method, 'startTrial');
  assert.equal(c.calls.at(-1).request.number, 1);
  assert.match(await c.send('!ctuhistoria prueba 0'), /Elige una ruta disponible/);
});

test('all three endings close the full season with its earned title and postgame actions', async () => {
  const c = fixture();
  c.state.value.progress = { ...c.state.value.progress, status: 'complete', stage: 'complete', missionIndex: 32 };
  c.state.value.mission = null;
  c.state.value.reward = { titleReward: { code: 'STORY-DAWN', name: 'Custodio del Alba', badge: '🌅' } };
  for (const title of ['El Archivo Protegido', 'Las Voces Abiertas', 'El Consejo del Bambú']) {
    c.state.value.ending = { title, summary: 'Los vínculos vuelven a ser libres.' };
    const text = await c.send('!ctuhistoria');
    assert.match(text, /TEMPORADA COMPLETA.*32\/32 misiones.*Custodio del Alba/s);
    assert.ok(text.includes(title));
    assert.match(text, /!ctuhistoria pruebas.*!ctuhistoria opcionales.*!ctusocial titulos/s);
    assert.doesNotMatch(text, /STORY-DAWN|CAPÍTULO II COMPLETO|próximos capítulos/);
  }
});

test('new story errors give concrete next commands instead of internal diagnostics', async () => {
  const c = fixture({ startOptional: async () => { throw new GameError('STORY_SIDE_LOCKED'); },
    startTrial: async () => { throw new GameError('STORY_SEASON_REQUIRED'); },
    getScenes: async () => { throw new GameError('STORY_SCENE_LOCKED'); },
    act: async () => { throw new GameError('STORY_ACTION_COOLDOWN'); } });
  assert.match(await c.send('!ctuhistoria opcional IV-A'), /todavía no se abrió/);
  assert.match(await c.send('!ctuhistoria prueba 1'), /después de completar el epílogo/);
  assert.match(await c.send('!ctuhistoria escenas V-06 1'), /misiones completadas/);
  assert.match(await c.send('!ctuhistoria apoyar'), /todavía se está recuperando/);
});

test('real WhatsApp season saves every step, survives required defeats and opens read-only scenes and optional training', async t => {
  const c = setup(t, { clock: () => '2026-10-18T20:00:00.000Z', randomRoll: () => 30 });
  const user = await register(c.game);
  const replies = [], logs = [];
  const route = createCommandRouter({ game: c.game, prefix: '!', automaticSpawns: false, debug: false,
    logger: (...args) => logs.push(args) });
  let sequence = 0;
  async function send(body, readonly = false) {
    const count = replies.length;
    assert.equal(await route({ sendMessage: async (_, payload) => replies.push(payload.text) },
      { key: { remoteJid: '521999999999@s.whatsapp.net', id: readonly ? null : `whole-season-${++sequence}` } }, body), true);
    assert.equal(replies.length, count + 1);
    const text = replies.at(-1);
    assert.equal(logs.length, 0, JSON.stringify(logs));
    assert.doesNotMatch(text, /No pude confirmar|STB-|STA-|SR:|USR-|@s.whatsapp.net|pabellon_bambu|encounterStep/);
    assert.ok(text.length <= 4096, `${body}: ${text.length} characters`);
    return text;
  }
  const names = { attack: 'atacar', defend: 'defender', skill: 'habilidad', switch: 'cambiar', break: 'romper',
    observe: 'observar', support: 'apoyar', purify: 'purificar', protect: 'proteger' };
  const seen = new Set(), learning = new Map();
  let communitySeen = false;
  async function advance() {
    const state = await c.game.story.getState({ userId: user.id });
    if (state.mission) seen.add(state.mission.code);
    if (state.progress.stage === 'choice') {
      const step = currentStoryStep(activeStoryMission(state.progress), state.progress);
      await send(`!ctuhistoria elegir ${step?.requiredChoice ?? '1'}`);
    } else if (state.progress.stage === 'community') {
      communitySeen = true;
      const view = await send('!ctuhistoria', true);
      assert.match(view, /!ctuhistoria aportar/);
      assert.doesNotMatch(view, /!ctuhistoria continuar/);
      await send('!ctuhistoria aportar');
    } else if (state.progress.stage === 'defeated') {
      if (state.battle.learning?.required) learning.set(state.battle.encounterId, state.battle.learning.defeats);
      await send('!ctuhistoria reintentar');
    } else if (state.progress.stage === 'battle') {
      if (state.battle.learning?.scouting) assert.match(await send('!ctuhistoria', true), /todavía no puedes vencer.*Rendirse no cuenta/s);
      const record = await c.storage.withRead(repos => repos.storyBattles.get(state.progress.activeBattleId));
      const tactic = record.combat.encounterId === 'P03' ? storyTacticalAction(record.combat) : storySeasonTacticalAction(record.combat);
      await send(`!ctuhistoria ${names[tactic.action]}${tactic.choice ? ` ${tactic.choice}` : ''}`);
    } else await send('!ctuhistoria continuar');
  }
  await send('!ctustarter panda');
  await send('!ctuhistoria iniciar');
  for (let index = 0; index < 1400; index++) {
    const state = await c.game.story.getState({ userId: user.id });
    if (state.progress.status === 'complete' && state.route.kind === 'main') break;
    await advance();
  }
  const final = await c.game.story.getState({ userId: user.id });
  assert.equal(final.progress.status, 'complete');
  assert.equal(final.progress.completedMissionIds.length, 32);
  assert.equal(seen.size, 32);
  assert.equal(final.progress.traces.length, 5);
  assert.ok(communitySeen);
  assert.deepEqual([...learning.entries()].sort(), [['I05',1],['II05',2],['III05',2],['IV05',2],['V05',4]].sort());
  assert.match(replies.at(-1), /TEMPORADA COMPLETA.*Custodio del Alba/s);
  const stored = Object.fromEntries(COLLECTIONS.map(name => [name,
    JSON.parse(fs.readFileSync(path.join(c.directory, `${name}.json`), 'utf8'))]));
  const forgedContext = structuredClone(stored);
  forgedContext.combateshistoria.records.find(row => row.combat.context?.encounterStep).combat.context.encounterStep = 'otra-escena';
  assert.throws(() => validateDatabase(forgedContext), error => error.code === 'DATABASE_CORRUPT' &&
    error.details.field === 'story.battleLearningAuthority', 'A replayable combat still needs the original scene context.');
  const forgedTitle = structuredClone(stored);
  forgedTitle.premioshistoria.records.find(row => row.missionCode === 'E-02').titleReward.name = 'Custodio inventado';
  assert.throws(() => validateDatabase(forgedTitle), error => error.code === 'DATABASE_CORRUPT' &&
    error.details.field === 'story.rewardTitle', 'A valid completion cannot mint a different social title.');
  const beforeRead = await c.game.users.getUser(user.id);
  assert.match(await send('!ctudiario historia', true), /5 de 5 recuperados/);
  assert.match(await send('!ctuhistoria escenas III-04 2', true), /ARCHIVO DE ESCENAS.*Página 2 de/s);
  const afterRead = await c.game.users.getUser(user.id);
  assert.deepEqual(afterRead.economy, beforeRead.economy);
  assert.deepEqual(afterRead.progress, beforeRead.progress);
  await send('!ctuhistoria opcional III-A');
  await send('!ctuhistoria volver');
  assert.equal((await c.game.story.getState({ userId: user.id })).route.kind, 'main');
  await send('!ctuhistoria opcional III-A');
  for (let index = 0; index < 20 && (await c.game.story.getState({ userId: user.id })).route.kind !== 'main'; index++) await advance();
  assert.equal((await c.game.story.getState({ userId: user.id })).route.kind, 'main');
  assert.match(await send('!ctuhistoria escenas III-A 1', true), /ARCHIVO DE ESCENAS/);
  assert.match(await send('!ctuhistoria pruebas', true), /!ctuhistoria prueba 3/);
  const beforeTrial = await c.game.users.getUser(user.id);
  await send('!ctuhistoria prueba 1');
  for (let index = 0; index < 100 && (await c.game.story.getState({ userId: user.id })).route.kind !== 'main'; index++) await advance();
  assert.equal((await c.game.story.getState({ userId: user.id })).route.kind, 'main');
  const afterTrial = await c.game.users.getUser(user.id);
  assert.deepEqual(afterTrial.economy, beforeTrial.economy);
  assert.deepEqual(afterTrial.progress, beforeTrial.progress);
  assert.match(await send('!ctuhistoria escenas PRUEBA-1 1', true), /ARCHIVO DE ESCENAS/);
  assert.equal((await c.game.validateDatabase()).valid, true);
});
