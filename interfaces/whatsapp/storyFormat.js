import { card, characterIcon, displayName, healthBar } from './format.js';
import { STORY_MEMORIES } from '../../game/story/catalog.js';

const safe = value => displayName(value ?? '');
const lines = value => (Array.isArray(value) ? value : [value]).filter(Boolean).map(safe).join('\n');
const chapterName = mission => mission?.code?.startsWith('P') ? 'Prólogo · El despertar del Custodio' : 'Capítulo I · El Bosque que Olvidó su Voz';
const completed = progress => progress?.status === 'complete';
const phaseLabels = { charge: 'Tinta en concentración', unleash: 'Descarga preparada', exposed: 'Defensas abiertas' };
const effectLabels = { poison: '☠️ Veneno', burn: '🔥 Quemadura', stun: '💫 Aturdido', shield: '🛡️ Escudo', regeneration: '💚 Regeneración', attack_up: '⚔️ Ataque aumentado', defense_down: '🛡️ Defensa reducida' };
const effectsText = unit => (unit.effects ?? []).map(effect => effectLabels[effect.type] ? `${effectLabels[effect.type]}${effect.type === 'shield' ? ` ${effect.potency}` : effect.remaining ? ` ${effect.remaining}T` : ''}` : null).filter(Boolean).join(' · ');

function battleView(battle) {
  if (!battle?.players) return battle;
  const player = battle.players.find(value => value.userId === 'custodian') ?? battle.players[0];
  const opponent = battle.players.find(value => value.userId === 'echo') ?? battle.players[1];
  const enemy = opponent.units[opponent.activeIndex];
  return {
    status: battle.status, finishReason: battle.finishReason, round: battle.turnNumber, tutorial: battle.tutorial,
    enemy: { name: enemy.characterName, hp: enemy.hp, maxHp: enemy.stats.hp, intent: battle.enemyIntent?.text, phase: battle.enemyPhase ?? null },
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
    '📖 Prólogo y primeras tres misiones del bosque.\n💾 Cada escena y turno quedan guardados; puedes volver cuando quieras.'
  ], `👉 *${cmd('ctuhistoria', 'iniciar')}*\n📖 Guía: ${cmd('ctuhistoria', 'ayuda')}`);

  const duplicate = result.alreadyProcessed ? '♻️ Este mensaje ya se procesó. Tu progreso sigue guardado.' : null;
  const battle = battleView(result.battle);
  const body = [duplicate, mission ? `🎋 *${chapterName(mission)}*\n📍 *${safe(mission.code)} · ${safe(mission.title)}*` : null,
    `📖 Avance: ${completed(progress) ? 7 : Math.min(7, progress.missionIndex ?? 0)}/7 misiones`];
  body.push(result.consequence ? `🖋️ ${safe(result.consequence)}` : null);
  if (battle?.status === 'active' || battle?.status === 'lost') {
    if (battle.lastEvents?.length && !result.alreadyProcessed) body.push(lines(battle.lastEvents));
    const active = battle.team.find(unit => unit.active) ?? battle.team[0];
    body.push(`❤️ *EXPEDICIÓN*\n${characterIcon(active.characterId)} *${safe(active.name)}*\n${hpText(active, healthBars)}${effectsText(active) ? `\n${effectsText(active)}` : ''}${battle.team.filter(unit => !unit.active).map(unit => `\n${unit.slot}. ${safe(unit.name)}: ${unit.hp > 0 ? hpText(unit, false) : '💤 KO'}`).join('')}`);
    body.push(`👁️ *${safe(battle.enemy.name)}*\n${hpText(battle.enemy, healthBars)}${phaseLabels[battle.enemy.phase] ? `\n${phaseLabels[battle.enemy.phase]}` : ''}${effectsText(battle.enemy) ? `\n${effectsText(battle.enemy)}` : ''}`);
    if (battle.status === 'lost') {
      const surrender = battle.finishReason === 'surrender';
      body.push(`${surrender ? '🏳️ *Te retiraste del encuentro.*' : '🌧️ *Esta vez la expedición cayó.*'}\nTu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.`);
      body.push(`💡 ${safe(result.hint ?? mission?.hint ?? 'Observa la señal enemiga: defender antes de un golpe cargado puede cambiar el combate. Prepara tu equipo y vuelve a intentarlo.')}`);
      return card(`HISTORIA | ${surrender ? 'RETIRADA' : 'DERROTA'}`, body, `🔁 *${cmd('ctuhistoria', 'reintentar')}*\n🛡️ Preparar: ${cmd('ctuequipo')}\n🔎 Pista: ${cmd('ctuhistoria', 'pista')}`);
    }
    const intent = typeof battle.enemy.intent === 'object' ? battle.enemy.intent.text : battle.enemy.intent;
    body.push(intent ? `⚠️ *SEÑAL ENEMIGA*\n${safe(intent)}` : null);
    if (inspect) body.push(`🔎 ${safe(result.hint ?? mission?.hint ?? 'Defender reduce el daño recibido. La habilidad y los cambios consumen un turno; revisa la señal antes de actuar.')}`);
    const attacks = (active.attacks ?? []).map(attack => `${attack.choice}. ${safe(attack.name)} · ${attack.power} POT${attack.cooldown ? ` · ⏳ ${attack.cooldown}T` : ''}`).join('\n');
    body.push(`🎯 *Tu turno*${attacks ? `\n${attacks}` : ''}`);
    const ready = (active.attacks ?? []).filter(attack => attack.ready !== false && !attack.cooldown);
    const actions = ready.map(attack => cmd('ctuhistoria', `atacar ${attack.choice}`));
    actions.push(cmd('ctuhistoria', 'defender'));
    if (ready.some(attack => String(attack.choice) === '2')) actions.push(cmd('ctuhistoria', 'habilidad'));
    const reserve = battle.team.find(unit => !unit.active && unit.hp > 0);
    if (reserve) actions.push(cmd('ctuhistoria', `cambiar ${reserve.slot}`));
    body.push(actions.map(action => `👉 ${action}`).join('\n'));
    body.push('💾 El turno se conserva al salir.');
    return card(`HISTORIA | T${battle.round ?? 1}`, body);
  }

  if (battle?.status === 'won') {
    if (battle.lastEvents?.length && !result.alreadyProcessed) body.push(lines(battle.lastEvents));
    body.push(`🌿 *¡Encuentro superado!*\n${safe(battle.enemy?.name ?? 'El Eco')} deja de luchar. El vínculo sigue intacto.`);
  }
  body.push(rewardText(reward, result.team));
  const evolutionCandidate = result.team?.find(unit => (unit.level ?? unit.progress?.level ?? 0) >= 5);
  if (completed(progress)) return card('HISTORIA | FASE 1 COMPLETA', [...body,
    '📜 *Tu primera expedición queda escrita.*\nHas completado el prólogo y las primeras tres misiones del bosque. Tus decisiones y recuerdos quedan guardados.',
    '🔒 El resto del Capítulo I llegará en la siguiente fase.'
  ], `📖 ${cmd('ctudiario', 'historia')}\n🎋 ${cmd('cturecuerdos')}\n${evolutionCandidate ? `🔮 Consulta tu evolución: ${cmd('ctuevolucion', evolutionCandidate.id)}` : `🔎 Consulta tus compañeros: ${cmd('ctuficha')}`}`);
  body.push(lines(mission?.scene));
  if (result.team?.length) body.push(`🛡️ Equipo preparado: ${result.team.length}/3 compañeros`);
  body.push(mission?.objective ? `🧭 *Objetivo:* ${safe(mission.objective)}` : null);
  if (inspect) body.push(`💡 ${safe(result.hint ?? mission?.hint ?? 'Lee las opciones y elige la que represente a tu Custodio. Las decisiones se guardan sin bloquear tu avance.')}`);
  body.push(decisionText(mission, cmd));
  const footer = progress.stage === 'starter' ? result.team?.length
    ? `🎴 Tu compañero ya está preparado.\n👉 *${cmd('ctuhistoria', 'continuar')}*`
    : `🎴 Elige tu primer compañero: *${cmd('ctustarter')}*\n👉 Después: ${cmd('ctuhistoria', 'continuar')}` : mission?.choices?.length ? `📖 ${cmd('ctudiario', 'historia')}`
    : `👉 *${cmd('ctuhistoria', 'continuar')}*\n🛡️ ${cmd('ctuequipo')} · 📖 ${cmd('ctudiario', 'historia')}`;
  return card('HISTORIA', body, footer);
}

function entryText(entry) {
  if (typeof entry === 'string') return safe(entry);
  const title = entry.title ?? entry.name ?? entry.label ?? entry.code;
  const text = entry.text ?? entry.summary ?? entry.description ?? entry.value;
  return [title ? `*${safe(title)}*` : null, text ? lines(text) : null].filter(Boolean).join('\n');
}

export function renderStoryJournal(journal, cmd, { memoriesOnly = false } = {}) {
  if (memoriesOnly) return card('RECUERDOS', [
    '📜 *Memorias del Custodio*',
    journal.memories?.length ? journal.memories.map(entryText).join('\n\n') : 'Aún no tienes recuerdos narrativos. Cada vínculo deja una huella; empieza tu historia.'
  ], `👉 ${cmd('ctuhistoria')}`);
  const sections = [['📍 *Qué pasó antes*', journal.summary], ['📚 *Crónica*', journal.chronicle], ['👥 *Personajes conocidos*', journal.characters],
    ['🖋️ *Trazos y pistas*', journal.traces], ['🧭 *Tus decisiones*', journal.decisions], ['📜 *Recuerdos*', journal.memories], ['🗺️ *Atlas*', journal.atlas]];
  const known = sections.filter(([, value]) => value && (!Array.isArray(value) || value.length));
  return card('DIARIO DEL CUSTODIO', known.length ? known.map(([title, value]) =>
    `${title}\n${Array.isArray(value) ? value.map(entryText).join('\n') : entryText(value)}`)
    : ['🎋 Tu diario todavía espera su primera página.\nEmpieza con la invitación de Bao bajo el bambú.'],
  `👉 ${cmd('ctuhistoria')}\n🗺️ ${cmd('ctucapitulos')}`);
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
  `🔁 ${cmd('ctuhistoria', 'reintentar')} · Tras una derrota\n🛡️ ${cmd('ctuequipo')} · Preparar 1 a 3 compañeros\n📖 ${cmd('ctudiario', 'historia')} · Diario narrativo\n🗺️ ${cmd('ctucapitulos')} · Misiones y bloqueos\n📜 ${cmd('cturecuerdos')} · Recuerdos`,
  '🎁 Los premios de primera finalización aceleran la XP de tus compañeros. Repetir escenas o reintentar no duplica premios.\n🔮 La evolución se abre desde nivel 5; no es obligatoria para avanzar.'
], `👉 ${cmd('ctuhistoria', 'iniciar')}`);
