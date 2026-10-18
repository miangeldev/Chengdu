import { card, characterIcon, displayName, healthBar } from './format.js';
import { STORY_MEMORIES } from '../../game/story/catalog.js';
import { requireGame } from '../../utils/GameError.js';

const safe = value => displayName(value ?? '');
const lines = value => (Array.isArray(value) ? value : [value]).filter(Boolean).map(safe).join('\n');
const chapterName = mission => {
  const code = mission?.code ?? '';
  const prefix = code.split('-')[0];
  const titles = { P: 'El despertar del Custodio', I: 'El Bosque que Olvidó su Voz', II: 'El Mercado de los Ecos', III: 'Las Montañas del Espejo', IV: 'Las Casas Divididas', V: 'El Último Nombre', E: 'El Archivo Abierto' };
  const title = mission?.chapterTitle ?? titles[prefix] ?? 'Diario del Custodio';
  return `${prefix === 'P' ? 'Prólogo' : prefix === 'E' ? 'Epílogo' : titles[prefix] ? `Capítulo ${prefix}` : 'Archivo'} · ${safe(title)}`;
};
const completed = progress => progress?.status === 'complete';
const phaseLabels = { charge: 'Tinta en concentración', unleash: 'Descarga preparada', exposed: 'Defensas abiertas', roots: 'Barrera de raíces', illusions: 'Señuelos activos', trick_strike: 'Golpe entre sombras', reflect: 'Reflejo activo', tension: 'Tensión de la Campana', memory: 'Memoria', control: 'Control', choice: 'Elección', protect: 'Protección' };
const effectLabels = { poison: '☠️ Veneno', burn: '🔥 Quemadura', stun: '💫 Aturdido', shield: '🛡️ Escudo', regeneration: '💚 Regeneración', attack_up: '⚔️ Ataque aumentado', defense_down: '🛡️ Defensa reducida' };
const effectsText = unit => (unit.effects ?? []).map(effect => effectLabels[effect.type] ? `${effectLabels[effect.type]}${effect.type === 'shield' ? ` ${effect.potency}` : effect.remaining ? ` ${effect.remaining}T` : ''}` : null).filter(Boolean).join(' · ');

function battleView(battle) {
  if (!battle?.players) return battle;
  const player = battle.players.find(value => value.userId === 'custodian') ?? battle.players[0];
  const opponent = battle.players.find(value => value.userId === 'echo') ?? battle.players[1];
  const enemy = opponent.units[opponent.activeIndex];
  return {
    status: battle.status, finishReason: battle.finishReason, acceptedDefeat: battle.acceptedDefeat, round: battle.turnNumber, tutorial: battle.tutorial,
    encounterId: battle.encounterId, availableActions: battle.availableActions, learning: battle.learning,
    enemy: { name: enemy.characterName, hp: enemy.hp, maxHp: enemy.stats.hp, intent: battle.enemyIntent?.text, phase: battle.enemyIntent?.type ?? battle.enemyPhase ?? null, mechanics: battle.enemyMechanics ?? null },
    team: player.units.map((unit, index) => ({ slot: index + 1, name: unit.characterName, characterId: unit.characterId,
      hp: unit.hp, maxHp: unit.stats.hp, level: unit.level, active: index === player.activeIndex,
      effects: unit.effects, attacks: unit.attacks.map((attack, attackIndex) => ({ choice: attackIndex + 1, name: attack.name,
        power: attack.power, cooldown: unit.cooldowns?.[attack.id] ?? 0, ready: (unit.cooldowns?.[attack.id] ?? 0) === 0 })) })),
    lastEvents: (battle.actions.at(-1)?.events ?? []).map(event => event.text).filter(Boolean)
  };
}

function hpText(unit, bars) {
  return `${bars ? `${healthBar(unit.hp, unit.maxHp)} ` : ''}${unit.hp}/${unit.maxHp} HP`;
}

function rewardText(reward, team = []) {
  if (!reward) return null;
  const sections = [];
  if (reward.alreadyClaimed || reward.alreadyRewarded) sections.push('↩️ Premio único ya entregado; repetir esta misión no vuelve a otorgarlo.');
  else {
    const coins = reward.coins ?? reward.amount ?? 0;
    const userXp = reward.userXp ?? 0;
    if (coins || userXp) sections.push(`🎁 ${[coins ? `+${coins} ChengCoins` : null, userXp ? `+${userXp} XP de Custodio` : null].filter(Boolean).join(' · ')}`);
    const units = reward.unitRewards ?? reward.units ?? [];
    for (const unit of units) {
      const name = unit.characterName ?? unit.name ?? team.find(companion => companion.id === unit.unitId)?.name;
      const before = unit.levelBefore ?? unit.progressBefore?.level;
      const after = unit.levelAfter ?? unit.progressAfter?.level;
      sections.push(`✨ ${name ? safe(name) : 'Compañero'}: +${unit.xp ?? unit.unitXp ?? 0} XP${after > before ? ` · 🌱 Nv. ${after}` : ''}`);
    }
    if (!units.length && reward.unitXp) sections.push(`✨ +${reward.unitXp} XP por compañero participante`);
    const materials = reward.materials ?? {};
    const materialsText = [materials.fragmentos ? `${materials.fragmentos} ${materials.fragmentos === 1 ? 'fragmento' : 'fragmentos'}` : null, materials.esencias ? `${materials.esencias} ${materials.esencias === 1 ? 'esencia' : 'esencias'}` : null, materials.sellos ? `${materials.sellos} ${materials.sellos === 1 ? 'sello' : 'sellos'}` : null].filter(Boolean).join(' · ');
    if (materialsText) sections.push(`🧩 ${materialsText}`);
  }
  if (reward.memory) sections.push(`📜 Recuerdo: ${safe(reward.memory.title ?? STORY_MEMORIES.find(memory => memory.id === reward.memory)?.title ?? reward.memory)}`);
  if (reward.titleReward) sections.push(`${reward.titleReward.badge ?? '🏅'} Título: *${safe(reward.titleReward.name)}*`);
  return sections.join('\n') || null;
}

function decisionText(mission, cmd) {
  const choices = mission?.choices ?? [];
  if (!choices.length) return null;
  return choices.map((choice, index) => {
    const id = String(choice.id ?? choice.value ?? index + 1);
    return `${id}. ${safe(choice.label ?? choice.text ?? choice)}\n👉 ${cmd('ctuhistoria', `elegir ${id}`)}`;
  }).join('\n\n');
}

export function renderStory(result, cmd, { healthBars = true, inspect = false } = {}) {
  const { progress, mission, reward } = result;
  if (!progress) return card('HISTORIA', [
    '🎋 *El despertar del Custodio*',
    'En Chengdú, las cartas conservan historias. Una tinta desconocida está borrando sus nombres.\nBao te espera bajo el bambú: tu primer vínculo puede cambiar lo que viene.',
    (result.campaign?.missionCount ?? 32) >= 32 ? '📖 Temporada completa: prólogo, cinco capítulos y epílogo.\n💾 Cada escena y turno quedan guardados; puedes volver cuando quieras.' : '📖 Prólogo, Bosque de los Susurros y Mercado de los Ecos.\n💾 Cada escena y turno quedan guardados; puedes volver cuando quieras.'
  ], `👉 *${cmd('ctuhistoria', 'iniciar')}*\n📖 Guía: ${cmd('ctuhistoria', 'ayuda')}`);

  const duplicate = result.alreadyProcessed ? '♻️ Este mensaje ya se procesó. Tu progreso sigue guardado.' : null;
  const battle = battleView(result.battle);
  const missionCount = result.mainMissionCount ?? result.campaign?.missionCount ?? (progress.contentVersion >= 3 ? 32 : progress.contentVersion === 2 ? 14 : 7);
  const sideRoute = result.route?.kind && result.route.kind !== 'main';
  const routeFooter = sideRoute && result.returnAvailable ? `↩️ Volver a la campaña: ${cmd('ctuhistoria', 'volver')}` : null;
  const body = [duplicate, sideRoute ? result.route.kind === 'trial' ? '🏛️ *PRUEBA DEL ARCHIVO*' : '🌿 *MISIÓN OPCIONAL*' : null,
    mission ? `🎋 *${chapterName(mission)}*\n📍 *${safe(mission.code)} · ${safe(mission.title)}*` : null,
    `📖 Avance: ${completed(progress) ? missionCount : Math.min(missionCount, progress.missionIndex ?? 0)}/${missionCount} misiones`];
  if (mission?.stepCount) body.push(`📜 *Escena ${mission.stepNumber ?? 1}/${mission.stepCount}*`);
  if (battle?.status !== 'won') body.push(result.consequence ? `🖋️ ${safe(result.consequence)}` : null);
  if (result.community) body.push(`🤝 *Aportación guardada*\n${result.community.mode === 'clan' ? 'Tu aportación forma parte de la reconstrucción con tu clan.' : 'La ruta individual conserva la misma progresión principal.'}`);
  if (battle?.status === 'active' || battle?.status === 'lost' && !battle.acceptedDefeat) {
    if (battle.lastEvents?.length && !result.alreadyProcessed) body.push(lines(battle.lastEvents));
    const active = battle.team.find(unit => unit.active) ?? battle.team[0];
    body.push(`❤️ *EXPEDICIÓN*\n${characterIcon(active.characterId)} *${safe(active.name)}*\n${hpText(active, healthBars)}${effectsText(active) ? `\n${effectsText(active)}` : ''}${battle.team.filter(unit => !unit.active).map(unit => `\n${unit.slot}. ${safe(unit.name)}: ${unit.hp > 0 ? hpText(unit, false) : '💤 KO'}`).join('')}`);
    body.push(`👁️ *${safe(battle.enemy.name)}*\n${hpText(battle.enemy, healthBars)}${phaseLabels[battle.enemy.phase] ? `\n${phaseLabels[battle.enemy.phase]}` : ''}${effectsText(battle.enemy) ? `\n${effectsText(battle.enemy)}` : ''}`);
    if (battle.learning?.required > 0) {
      const learning = battle.learning;
      body.push(`📖 *Aprendizaje del jefe: ${Math.min(learning.defeats, learning.required)}/${learning.required} derrotas*\n${
        battle.status === 'active' && learning.scouting ? 'Este intento es de reconocimiento: todavía no puedes vencer al jefe. Observa sus patrones; necesitas completar las derrotas de aprendizaje.'
          : learning.remaining > 0 ? `Faltan ${learning.remaining} derrotas de aprendizaje antes del intento de victoria.`
            : 'Aprendizaje completado. Ya puedes disputar la victoria.'}\n🏳️ Rendirse no cuenta como derrota de aprendizaje.`);
    }
    if (battle.status === 'lost') {
      const surrender = battle.finishReason === 'surrender';
      body.push(`${surrender ? '🏳️ *Te retiraste del encuentro.*' : '🌧️ *Esta vez la expedición cayó.*'}\nTu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.`);
      const encounterHint = battle.encounterId === 'II05' ? 'Observa los señuelos para revelar al original antes de atacar. Cuando anuncie una descarga, defiende; las técnicas también se gastan si alcanzan una ilusión.'
        : battle.encounterId === 'I05' ? 'Rompe la barrera de raíces antes de gastar tus técnicas y defiende cuando anuncie la descarga. La apertura posterior es tu oportunidad.'
          : 'Observa la señal enemiga: defender antes de un golpe cargado puede cambiar el combate. Prepara tu equipo y vuelve a intentarlo.';
      body.push(`💡 ${safe(result.hint ?? mission?.hint ?? encounterHint)}`);
      return card(`HISTORIA | ${surrender ? 'RETIRADA' : 'DERROTA'}`, body, `🔁 *${cmd('ctuhistoria', 'reintentar')}*\n🛡️ Preparar: ${cmd('ctuequipo')}\n🔎 Pista: ${cmd('ctuhistoria', 'pista')}${routeFooter ? `\n${routeFooter}` : ''}`);
    }
    const intent = typeof battle.enemy.intent === 'object' ? battle.enemy.intent.text : battle.enemy.intent;
    body.push(intent ? `⚠️ *SEÑAL ENEMIGA*\n${safe(intent)}` : null);
    if (typeof battle.enemy.mechanics === 'string' && battle.enemy.mechanics) body.push(`🧩 ${safe(battle.enemy.mechanics)}`);
    if (inspect) body.push(`🔎 ${safe(result.hint ?? mission?.hint ?? 'Defender reduce el daño recibido. La habilidad y los cambios consumen un turno; revisa la señal antes de actuar.')}`);
    const attacks = (active.attacks ?? []).map(attack => `${attack.choice}. ${safe(attack.name)} · ${attack.power} POT${attack.cooldown ? ` · ⏳ ${attack.cooldown}T` : ''}`).join('\n');
    body.push(`🎯 *Tu turno*${attacks ? `\n${attacks}` : ''}`);
    const ready = (active.attacks ?? []).filter(attack => attack.ready !== false && !attack.cooldown);
    const allowed = action => !Array.isArray(battle.availableActions) || battle.availableActions.includes(action);
    const actions = allowed('attack') ? ready.map(attack => cmd('ctuhistoria', `atacar ${attack.choice}`)) : [];
    if (allowed('defend')) actions.push(cmd('ctuhistoria', 'defender'));
    if (allowed('skill') && ready.some(attack => String(attack.choice) === '2')) actions.push(cmd('ctuhistoria', 'habilidad'));
    if (battle.availableActions?.includes('break')) actions.push(`${cmd('ctuhistoria', 'romper')} · Rompe raíces y consume el turno`);
    if (battle.availableActions?.includes('observe')) actions.push(`${cmd('ctuhistoria', 'observar')} · Revela señuelos y consume el turno`);
    if (battle.availableActions?.includes('support')) actions.push(`${cmd('ctuhistoria', 'apoyar')} · Recupera vida del equipo`);
    if (battle.availableActions?.includes('purify')) actions.push(`${cmd('ctuhistoria', 'purificar')} · Reduce tensión o sellos`);
    if (battle.availableActions?.includes('protect')) actions.push(`${cmd('ctuhistoria', 'proteger')} · Protege a tus aliados`);
    const reserve = battle.team.find(unit => !unit.active && unit.hp > 0);
    if (reserve && allowed('switch')) actions.push(cmd('ctuhistoria', `cambiar ${reserve.slot}`));
    body.push(actions.map(action => `👉 ${action}`).join('\n'));
    body.push('💾 El turno se conserva al salir.');
    if (sideRoute) body.push(`↩️ Para pausar esta ruta: ${cmd('ctuhistoria', 'rendirse')} y después ${cmd('ctuhistoria', 'volver')}`);
    return card(`HISTORIA | T${battle.round ?? 1}`, body);
  }

  if (battle?.status === 'won') {
    if (battle.lastEvents?.length && !result.alreadyProcessed) body.push(lines(battle.lastEvents));
    body.push('🌿 *¡Encuentro superado!*');
    body.push(result.consequence ? `🖋️ ${safe(result.consequence)}` : null);
  }
  if (battle?.acceptedDefeat) {
    if (battle.lastEvents?.length && !result.alreadyProcessed) body.push(lines(battle.lastEvents));
    body.push('🤝 *Duelo amistoso concluido.*\nLa historia continúa tras el duelo. Lo aprendido con Huan queda guardado.');
  }
  body.push(rewardText(reward, result.team));
  const evolutionCandidate = result.team?.find(unit => (unit.level ?? unit.progress?.level ?? 0) >= 5);
  if (completed(progress) && !sideRoute) {
    const season = result.campaign?.finishStage === 'season' || missionCount >= 32;
    const extended = missionCount > 7;
    const continuation = result.nextContentAvailable === true;
    return card(season ? 'HISTORIA | TEMPORADA COMPLETA' : extended ? 'HISTORIA | CAPÍTULO II COMPLETO' : 'HISTORIA | FASE 1 COMPLETA', [...body,
      season ? '🌅 *Custodio del Alba*\nHas completado los cinco capítulos y el epílogo. Los cinco Trazos, tus decisiones y los vínculos del viaje quedan guardados.'
        : extended ? '📜 *Dos Trazos, nuevas preguntas.*\nHas completado el prólogo, el Bosque de los Susurros y el Mercado de los Ecos. Tus decisiones y recuerdos quedan guardados.'
        : '📜 *Tu primera expedición queda escrita.*\nHas completado el prólogo y las primeras tres misiones del bosque. Tus decisiones y recuerdos quedan guardados.',
      result.ending ? `🖋️ *${safe(result.ending.title)}*\n${safe(result.ending.summary)}` : null,
      continuation ? extended ? '🏔️ Hay capítulos nuevos. Continúa desde tu avance guardado.' : '🎋 El bosque vuelve a llamarte. Ya puedes continuar hacia el claro de la tinta.'
        : season ? '📖 El Archivo queda abierto: puedes volver a sus escenas, explorar rutas opcionales y entrenar en sus pruebas.' : extended ? '🔒 La siguiente etapa de tu viaje llegará con los próximos capítulos.' : '🔒 El resto del Capítulo I llegará en la siguiente fase.'
    ], `${continuation ? `👉 *${cmd('ctuhistoria', 'continuar')}*\n` : ''}📖 ${cmd('ctudiario', 'historia')}\n🎋 ${cmd('cturecuerdos')}\n${season ? `🏛️ ${cmd('ctuhistoria', 'pruebas')}\n🌿 ${cmd('ctuhistoria', 'opcionales')}\n🏅 ${cmd('ctusocial', 'titulos')}` : evolutionCandidate ? `🔮 Consulta tu evolución: ${cmd('ctuevolucion', evolutionCandidate.id)}` : `🔎 Consulta tus compañeros: ${cmd('ctuficha')}`}`);
  }
  body.push(lines(mission?.scene));
  if (result.team?.length) body.push(`🛡️ Equipo preparado: ${result.team.length}/3 compañeros`);
  body.push(mission?.objective ? `🧭 *Objetivo:* ${safe(mission.objective)}` : null);
  if (inspect) body.push(`💡 ${safe(result.hint ?? mission?.hint ?? 'Lee las opciones y elige la que represente a tu Custodio. Las pistas necesarias están en la escena y el diario.')}`);
  const showChoices = mission?.choices?.length && (sideRoute || progress.stage !== 'investigation');
  if (progress.stage === 'investigation') body.push(`🔎 *Investigación ${progress.sceneStep ?? 1}/2*\nLee esta pista; la siguiente completa la otra parte del hallazgo.`);
  body.push(showChoices ? decisionText(mission, cmd) : null);
  if (mission?.communityObjective) body.push(`🤝 ${safe(typeof mission.communityObjective === 'object' ? mission.communityObjective.text ?? 'Participa en la reconstrucción del pabellón.' : 'Participa en la reconstrucción del pabellón.')}`);
  const footer = mission?.communityObjective ? `👉 *${cmd('ctuhistoria', 'aportar')}*\n📖 ${cmd('ctudiario', 'historia')}` : progress.stage === 'starter' ? result.team?.length
    ? `🎴 Tu compañero ya está preparado.\n👉 *${cmd('ctuhistoria', 'continuar')}*`
    : `🎴 Elige tu primer compañero: *${cmd('ctustarter')}*\n👉 Después: ${cmd('ctuhistoria', 'continuar')}` : showChoices ? `📖 ${cmd('ctudiario', 'historia')}`
    : `👉 *${cmd('ctuhistoria', 'continuar')}*\n🛡️ ${cmd('ctuequipo')} · 📖 ${cmd('ctudiario', 'historia')}`;
  return card('HISTORIA', body, [footer, routeFooter].filter(Boolean).join('\n'));
}

export function renderStoryOptionals(result, cmd) {
  return card('HISTORIA | OPCIONALES', (result.missions ?? []).map(mission =>
    mission.status === 'locked' ? `🔒 ${safe(mission.code)} · Sigue la campaña para descubrir esta ruta.` :
      `${mission.status === 'complete' ? '✅' : '🌿'} *${safe(mission.code)} · ${safe(mission.title)}*\n${mission.status === 'complete' ? `Completada. Sus premios únicos ya quedaron registrados.\n📖 ${cmd('ctuhistoria', `escenas ${mission.code} 1`)}` : `👉 ${cmd('ctuhistoria', `opcional ${mission.code}`)}`}`),
  `Las rutas opcionales conservan tu avance principal.\n👉 ${cmd('ctuhistoria')}`);
}

export function renderStoryTrials(result, cmd) {
  return card('PRUEBAS DEL ARCHIVO', ['🏛️ Encuentros de entrenamiento tras completar la temporada. Sus premios de campaña no se vuelven a entregar.',
    ...(result.trials ?? []).map(trial => trial.available
      ? `${trial.completed ? '✅' : '⚔️'} *${trial.number}. ${safe(trial.title)}*\n👉 ${cmd('ctuhistoria', `prueba ${trial.number}`)}${trial.completed ? `\n📖 ${cmd('ctuhistoria', `escenas PRUEBA-${trial.number} 1`)}` : ''}`
      : `🔒 Prueba ${trial.number} · Completa el epílogo para abrirla.`)
  ], `👉 ${cmd('ctuhistoria')}`);
}

export function renderStoryScenes(result, cmd) {
  return card('ARCHIVO DE ESCENAS', [`📖 *${safe(result.mission.code)} · ${safe(result.mission.title)}*`, lines(result.scene),
    '🔎 Lectura del recuerdo guardado. No cambia tus decisiones ni vuelve a entregar premios.'
  ], [`📄 *Página ${result.page} de ${result.totalPages}*`,
    result.page > 1 ? `⬅️ ${cmd('ctuhistoria', `escenas ${result.mission.code} ${result.page - 1}`)}` : null,
    result.page < result.totalPages ? `➡️ ${cmd('ctuhistoria', `escenas ${result.mission.code} ${result.page + 1}`)}` : null,
    `👉 ${cmd('ctuhistoria')}`].filter(Boolean).join('\n'));
}

function entryText(entry) {
  if (typeof entry === 'string') return safe(entry);
  const title = entry.title ?? entry.name ?? entry.label ?? entry.code;
  const text = entry.text ?? entry.summary ?? entry.description ?? entry.value;
  return [title ? `*${safe(title)}*` : null, text ? lines(text) : null].filter(Boolean).join('\n');
}

const JOURNAL_SECTIONS = Object.freeze({
  cronica: { key: 'chronicle', title: 'Crónica' }, personajes: { key: 'characters', title: 'Personajes' },
  trazos: { key: 'traces', title: 'Trazos y pistas' }, decisiones: { key: 'decisions', title: 'Decisiones' },
  recuerdos: { key: 'memories', title: 'Recuerdos' }, atlas: { key: 'atlas', title: 'Atlas' }
});
const journalEntries = value => (Array.isArray(value) ? value : value ? [value] : []);
const entryTitle = entry => typeof entry === 'string' ? safe(entry) : safe(entry.title ?? entry.name ?? entry.label ?? entry.code ?? entry.text ?? '');

export function storyJournalArguments(args = []) {
  requireGame(args.length <= 2, 'STORY_INVALID_JOURNAL_SECTION');
  if (!args.length) return { section: null, page: 1 };
  const section = args[0].normalize('NFD').replace(/\p{M}/gu, '').toLowerCase();
  if (section === 'resumen') {
    requireGame(args.length === 1, 'STORY_INVALID_JOURNAL_PAGE');
    return { section: null, page: 1 };
  }
  requireGame(Object.hasOwn(JOURNAL_SECTIONS, section), 'STORY_INVALID_JOURNAL_SECTION');
  requireGame(args.length === 1 || /^\d+$/.test(args[1]), 'STORY_INVALID_JOURNAL_PAGE');
  const page = args.length === 1 ? 1 : Number(args[1]);
  requireGame(Number.isSafeInteger(page) && page >= 1, 'STORY_INVALID_JOURNAL_PAGE');
  return { section, page };
}

export function renderStoryJournal(journal, cmd, { memoriesOnly = false, section = null, page = 1 } = {}) {
  const selected = section ?? (memoriesOnly ? 'recuerdos' : null);
  if (selected) {
    requireGame(Object.hasOwn(JOURNAL_SECTIONS, selected), 'STORY_INVALID_JOURNAL_SECTION');
    requireGame(Number.isSafeInteger(page) && page >= 1, 'STORY_INVALID_JOURNAL_PAGE');
    const definition = JOURNAL_SECTIONS[selected], entries = journalEntries(journal[definition.key]);
    const totalPages = Math.max(1, Math.ceil(entries.length / 4));
    requireGame(page <= totalPages, 'PAGE_NOT_FOUND');
    const navigation = [
      `📄 *Página ${page} de ${totalPages}*`,
      page > 1 ? `⬅️ ${cmd('ctudiario', `historia ${selected} ${page - 1}`)}` : null,
      page < totalPages ? `➡️ ${cmd('ctudiario', `historia ${selected} ${page + 1}`)}` : null,
      `📖 Resumen: ${cmd('ctudiario', 'historia')}\n👉 ${cmd('ctuhistoria')}`
    ].filter(Boolean).join('\n');
    return card(`DIARIO | ${definition.title.toLocaleUpperCase('es')}`, entries.length
      ? entries.slice((page - 1) * 4, page * 4).map(entryText)
      : ['📜 Todavía no tienes entradas en esta sección. Sigue tu historia para descubrirlas.'], navigation);
  }
  const sections = [
    ['📍 *Qué pasó antes*', journalEntries(journal.summary).map(entryText).join('\n')],
    ['📚 *Últimas escenas*', journalEntries(journal.chronicle).slice(-2).map(entryText).join('\n')],
    ['👥 *Personajes conocidos*', journalEntries(journal.characters).map(entryTitle).join(' · ')],
    ['🖋️ *Trazos y pistas*', journalEntries(journal.traces).map(entryText).join('\n')],
    ['🧭 *Últimas decisiones*', journalEntries(journal.decisions).slice(-2).map(entryText).join('\n')],
    ['📜 *Recuerdos*', journalEntries(journal.memories).map(entryTitle).join(' · ')],
    ['🗺️ *Atlas*', journalEntries(journal.atlas).map(entryTitle).join(' · ')]
  ].filter(([, text]) => text);
  const details = Object.keys(JOURNAL_SECTIONS).map(name => cmd('ctudiario', `historia ${name}`)).join('\n');
  return card('DIARIO DEL CUSTODIO', sections.length ? sections.map(([title, text]) => `${title}\n${text}`)
    : ['🎋 Tu diario todavía espera su primera página.\nEmpieza con la invitación de Bao bajo el bambú.'],
  `📚 *Consultar el detalle*\n${details}\n\n👉 ${cmd('ctuhistoria')}`);
}

export function renderStoryMap(map, cmd) {
  return card('CAPÍTULOS', (map.chapters ?? []).map(chapter => {
    const locked = ['locked', 'Bloqueado'].includes(chapter.status);
    const icon = locked ? '🔒' : ['complete', 'Completado'].includes(chapter.status) ? '✅' : '🎋';
    return `${icon} *${safe(chapter.title)}*${locked ? '\nContinúa la campaña para abrir este capítulo' : (chapter.missions ?? []).map(mission => {
      const unavailable = ['Próxima fase', 'unavailable'].includes(mission.status);
      return `\n${['complete', 'Completada'].includes(mission.status) ? '✅' : ['active', 'En progreso'].includes(mission.status) ? '📍' : unavailable ? '🔒' : '▫️'} ${safe(mission.code)} · ${safe(mission.title)}${unavailable ? ' · Próxima fase' : ''}`;
    }).join('')}`;
  }), `👉 ${cmd('ctuhistoria')}`);
}

export const renderStoryHelp = cmd => card('HISTORIA | GUÍA', [
  '🎋 *Un Custodio, un vínculo, una historia.*\nAvanza a tu ritmo: las escenas, decisiones y turnos quedan guardados.',
  `📖 ${cmd('ctuhistoria')} · Volver a tu misión\n👉 ${cmd('ctuhistoria', 'continuar')} · Avanzar\n🧭 ${cmd('ctuhistoria', 'elegir 1')} · Elegir una opción`,
  `⚔️ ${cmd('ctuhistoria', 'atacar 1')} · Ataque 1 o 2\n🛡️ ${cmd('ctuhistoria', 'defender')} · Reducir daño\n✨ ${cmd('ctuhistoria', 'habilidad')} · Habilidad con recarga\n🔀 ${cmd('ctuhistoria', 'cambiar 2')} · Entrar con reserva; consume turno\n🔎 ${cmd('ctuhistoria', 'pista')} · Inspección gratuita\n🏳️ ${cmd('ctuhistoria', 'rendirse')} · Terminar el intento`,
  `🌱 ${cmd('ctuhistoria', 'romper')} · Romper barreras de raíces\n👁️ ${cmd('ctuhistoria', 'observar')} · Revelar señuelos\nEstas tácticas aparecen cuando el jefe las necesita y consumen un turno.`,
  `💚 ${cmd('ctuhistoria', 'apoyar')} · Recuperar vida del equipo\n✨ ${cmd('ctuhistoria', 'purificar')} · Reducir tensión o sellos\n🛡️ ${cmd('ctuhistoria', 'proteger')} · Cuidar aliados en peligro\n📖 Los jefes indican sus derrotas de aprendizaje obligatorias; rendirse no las completa.`,
  `🔁 ${cmd('ctuhistoria', 'reintentar')} · Tras una derrota\n🛡️ ${cmd('ctuequipo')} · Preparar 1 a 3 compañeros\n📖 ${cmd('ctudiario', 'historia')} · Diario narrativo\n🗺️ ${cmd('ctucapitulos')} · Misiones y bloqueos\n📜 ${cmd('cturecuerdos')} · Recuerdos`,
  `🌿 ${cmd('ctuhistoria', 'opcionales')} · Rutas adicionales\n↩️ ${cmd('ctuhistoria', 'volver')} · Pausar una ruta sin combate\n📚 ${cmd('ctuhistoria', 'escenas III-04 1')} · Releer una misión completada\n🏛️ ${cmd('ctuhistoria', 'pruebas')} · Entrenar tras el epílogo`,
  '🎁 Los premios de primera finalización aceleran la XP de tus compañeros. Repetir escenas o reintentar no duplica premios.\n🔮 La evolución se abre desde nivel 5; no es obligatoria para avanzar.'
], `👉 ${cmd('ctuhistoria', 'iniciar')}`);
