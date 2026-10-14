import { card, characterIcon, displayName, healthBar } from './format.js';
import { competitiveBattleOpening, competitiveBattleResult, seasonEndedBattle } from './competitiveFormat.js';

const timeText = date => new Date(date).toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false });

function message(label, sections) {
  return card(label, sections);
}

export function actionText(battle, action) {
  if (battle.rulesVersion === 2) return advancedActionText(battle, action);
  if (!action) return null;
  const player = battle.players.find(p => p.userId === action.actorId);
  if (action.type === 'surrender') return `🏳️ ${displayName(player.name)} se rindió.`;
  const target = battle.players.find(p => p.userId === action.targetId);
  const attack = player.unit.attacks.find(a => a.id === action.attackId);
  return `${characterIcon(player.unit.characterId)} *${displayName(player.unit.characterName)}* usó _${displayName(attack.name)}_\n` +
    (action.hit ? `💥 *${action.damage} de daño* a ${displayName(target.unit.characterName)}` : '💨 ¡El ataque falló!');
}

function statusText(battle, bars) {
  const rows = battle.players.filter(p => p.unit).map(p => {
    const label = `${characterIcon(p.unit.characterId)} ${displayName(p.name)}`;
    const hp = `${p.unit.hp}/${p.unit.stats.hp} HP`;
    return bars ? `${label}\n${healthBar(p.unit.hp, p.unit.stats.hp)} ${hp}` : `${label}: ${hp}`;
  });
  return rows.length ? `❤️ *ESTADO*\n${rows.join('\n')}` : null;
}

export function rewardText(battle) {
  if (!battle.settlement) return battle.rewardVersion === 0 && battle.acceptedAt ? '📜 Combate anterior a las recompensas del MVP 0.3.' : null;
  const reason = battle.settlement.reason;
  if (reason !== 'rewarded' && seasonEndedBattle(battle)) return '🎁 Sin recompensa: la temporada cerró antes de terminar el combate.';
  if (reason !== 'rewarded') return `🎁 Sin recompensa: ${
    { early_surrender: 'rendición antes de 4 ataques entre ambos jugadores.', pair_limit: 'ya alcanzaron 3 combates con recompensa entre ustedes en 24 h.', inactivity: 'el combate terminó por inactividad.' }[reason]
  }`;
  if (battle.rulesVersion === 2) return '🎁 *RECOMPENSAS*\n' + battle.settlement.rewards.map(reward => {
    const player = battle.players.find(p => p.userId === reward.userId);
    const units = reward.unitRewards ?? [];
    const rows = [`${displayName(player.name)}: ${reward.coins ? `+${reward.coins} ChengCoins · ` : ''}+${reward.userXp} XP`];
    for (const receipt of units) {
      const unit = player.units.find(value => value.id === receipt.unitId);
      rows.push(`${characterIcon(unit.characterId)} ${displayName(unit.characterName)}: +${receipt.xp} XP${receipt.levelAfter > receipt.levelBefore ? ` · 🌱 Nv. ${receipt.levelAfter}` : ''}`);
    }
    if (reward.userLevelAfter > reward.userLevelBefore) rows.push(`🌱 ${displayName(player.name)} subió al nivel ${reward.userLevelAfter}`);
    return rows.join('\n');
  }).join('\n');
  return '🎁 *RECOMPENSAS*\n' + battle.settlement.rewards.map(reward => {
    const player = battle.players.find(p => p.userId === reward.userId);
    const levels = [];
    if (reward.userLevelAfter > reward.userLevelBefore) levels.push(`👤 ${displayName(player.name)} subió al nivel ${reward.userLevelAfter}`);
    if (reward.unitLevelAfter > reward.unitLevelBefore) levels.push(`${characterIcon(player.unit.characterId)} ${displayName(player.unit.characterName)} subió al nivel ${reward.unitLevelAfter}`);
    return `${displayName(player.name)}: ${reward.coins ? `+${reward.coins} ChengCoins · ` : ''}+${reward.userXp} XP\n${characterIcon(player.unit.characterId)} Unidad: +${reward.unitXp} XP` + (levels.length ? `\n🌱 ${levels.join('\n🌱 ')}` : '');
  }).join('\n');
}

export function renderBattle(result, cmd, { healthBars = true } = {}) {
  const battle = result.battle ?? result;
  if (battle.rulesVersion === 2) return renderAdvancedBattle(result, cmd, { healthBars });
  const names = battle.players.map(p => displayName(p.name));
  const duplicate = result.duplicate ? '♻️ Esta acción ya se había registrado. Estado actual:' : null;
  if (battle.status === 'pending') return message('DESAFÍO', [
    duplicate,
    `⚔️ *${names[0]}* desafió a *${names[1]}*`,
    `📣 *${names[1]}, ¿aceptas?*\n👉 *${cmd('ctuaceptar')}* o *${cmd('cturechazar')}*`,
    `⏳ Vence a las ${timeText(battle.expiresAt)} (CDMX).\n↩️ Retirar: ${cmd('ctucancelar')}`
  ]);

  // A replay shows the current state without presenting an old attack as new.
  const action = result.duplicate ? null : result.action ??
    (['active', 'finished'].includes(battle.status) ? battle.actions.at(-1) : null);
  const body = [duplicate, actionText(battle, action)];
  if (battle.status === 'active') {
    const player = battle.players.find(p => p.userId === battle.turnUserId);
    const opening = battle.actions.length === 0;
    if (opening) body.push(`⚔️ *${names[0]}* vs *${names[1]}*\n${characterIcon(player.unit.characterId)} *${displayName(player.unit.characterName)}* toma la iniciativa.`);
    body.push(statusText(battle, healthBars));
    body.push(`🎯 *Turno de ${displayName(player.name)}*\n` + player.unit.attacks.map((attack, i) =>
      `${i === 0 ? '1️⃣' : '2️⃣'} ${displayName(attack.name)} · ${attack.power} POT`
    ).join('\n'));
    body.push(`👉 *${cmd('ctuatacar', '1')}* o *${cmd('ctuatacar', '2')}*\n🔎 Detalles: ${cmd('ctuficha')}`);
    return message(opening ? 'INICIO | T1' : `T${battle.turnNumber}`, body);
  }

  let label;
  const turns = battle.actions.filter(a => a.type === 'attack').length;
  const turnText = `${turns} ${turns === 1 ? 'turno' : 'turnos'}`;
  if (battle.winnerId) {
    const winner = battle.players.find(p => p.userId === battle.winnerId);
    const loser = battle.players.find(p => p.userId !== battle.winnerId);
    label = 'VICTORIA';
    body.push(`${characterIcon(winner.unit.characterId)} *¡${displayName(winner.name)} derrotó a ${displayName(loser.name)}!*`);
    body.push(`⚔️ ${turnText} · ❤️ ${winner.unit.hp} HP restantes`);
  } else {
    label = { rejected: 'DESAFÍO RECHAZADO', cancelled: 'DESAFÍO RETIRADO', expired: 'TIEMPO AGOTADO', finished: 'EMPATE' }[battle.status];
    body.push({
      rejected: `❌ ${names[1]} rechazó el desafío.`,
      cancelled: `↩️ ${names[0]} retiró el desafío.`,
      challenge_timeout: '⌛ El desafío venció sin ser aceptado.',
      inactivity: `⌛ Combate terminado por inactividad.\n⚔️ ${turnText} · Sin ganador.`,
      turn_limit: `⚖️ Ambos siguen en pie tras ${turnText}.\nEl combate termina en empate.`
    }[battle.finishReason]);
    body.push(statusText(battle, healthBars));
  }
  body.push(rewardText(battle));
  body.push(`⚔️ Otra partida: ${cmd('ctupelea', '@jugador')}`);
  return message(label, body);
}

const active = player => player.units[player.activeIndex];
const allUnits = battle => battle.players.flatMap(player => player.units ?? []);
const unitFor = (battle, id) => allUnits(battle).find(unit => unit.id === id);
const effectLabels = { poison: '☠️ Veneno', burn: '🔥 Quemadura', stun: '❄️ Aturdido', shield: '🛡️ Escudo', regeneration: '💚 Regeneración', attack_up: '⚔️ Ataque aumentado', defense_down: '🛡️ Defensa reducida', heal: '💚 Curación' };
const effectName = type => effectLabels[type] ?? displayName(type);

export function eventText(battle, event) {
  const unit = unitFor(battle, event.unitId);
  const title = unit ? `${characterIcon(unit.characterId)} ${displayName(unit.characterName)}` : '';
  if (event.type === 'ability') return `✨ ${title}: *${displayName(unit?.ability?.name ?? 'Habilidad pasiva')}*`;
  if (event.type === 'effect_applied') return `${effectName(event.effect)}${event.effect === 'heal' ? `: +${event.amount} HP` : ''} → ${title}${event.remaining ? ` · ${event.remaining} turnos` : ''}`;
  if (event.type === 'effect_tick') return `${effectName(event.effect)}: ${title} ${event.effect === 'regeneration' ? 'recupera' : 'pierde'} ${event.amount} HP`;
  if (event.type === 'effect_expired') return `${effectName(event.effect)} terminó en ${title}`;
  if (event.type === 'shield_absorbed') return `🛡️ ${title} bloqueó ${event.amount} de daño`;
  if (event.type === 'elemental') return event.amount > 100 ? '🌟 ¡Ataque muy eficaz!' : event.amount < 100 ? '🌿 Ataque poco eficaz' : null;
  if (event.type === 'knockout') return `💤 ${title} quedó fuera de combate`;
  if (event.type === 'auto_switch') return `⚔️ ${title} entra al combate`;
  if (event.type === 'stun') return `❄️ ${title} no pudo actuar`;
  return null;
}

function advancedActionText(battle, action) {
  if (!action) return null;
  const player = battle.players.find(p => p.userId === action.actorId);
  if (action.type === 'surrender') return `🏳️ ${displayName(player.name)} se rindió.`;
  let primary = null;
  if (action.type === 'switch') {
    const unit = player.units[Number(action.choice) - 1] ?? active(player);
    primary = `🔀 *${displayName(player.name)}* eligió a ${characterIcon(unit.characterId)} *${displayName(unit.characterName)}*`;
  } else if (action.type === 'attack') {
    const unit = unitFor(battle, action.actorUnitId) ?? player.units.find(value => value.attacks.some(attack => attack.id === action.attackId)) ?? active(player);
    const target = unitFor(battle, action.targetUnitId) ?? active(battle.players.find(p => p.userId === action.targetId));
    const attack = unit.attacks.find(value => value.id === action.attackId);
    primary = `${characterIcon(unit.characterId)} *${displayName(unit.characterName)}* usó _${displayName(attack.name)}_\n` +
      (action.hit ? `${action.critical ? '🔥 *¡CRÍTICO!*' : '💥'} *${action.damage} de daño* a ${displayName(target.characterName)}` : '💨 ¡El ataque falló!');
  }
  const events = (action.events ?? []).map(event => eventText(battle, event)).filter(Boolean);
  return [primary, ...events].filter(Boolean).join('\n') || null;
}

function advancedStatusText(battle, bars) {
  return '❤️ *ESTADO*\n' + battle.players.map(player => {
    const unit = active(player);
    const hp = `${unit.hp}/${unit.stats.hp} HP`;
    const effects = unit.effects?.map(effect => `${effectName(effect.type)}${effect.type === 'shield' ? ` ${effect.potency}` : ` ${effect.remaining}T`}`).join(' · ');
    const reserve = player.units.map((value, index) => ({ value, index })).filter(({ index }) => index !== player.activeIndex)
      .map(({ value, index }) => `${index + 1} ${characterIcon(value.characterId)} ${displayName(value.characterName)}: ${value.hp > 0 ? `${value.hp}/${value.stats.hp} HP` : '💤 KO'}`).join('\n');
    return `${characterIcon(unit.characterId)} *${displayName(player.name)}* · ${displayName(unit.characterName)}\n${bars ? `${healthBar(unit.hp, unit.stats.hp)} ` : ''}${hp}${effects ? `\n${effects}` : ''}${reserve ? `\n🪑 ${reserve}` : ''}`;
  }).join('\n\n');
}

function renderAdvancedBattle(result, cmd, { healthBars }) {
  const battle = result.battle ?? result;
  const names = battle.players.map(player => displayName(player.name));
  const format = battle.format ?? `${battle.teamSize}v${battle.teamSize}`;
  const duplicate = result.duplicate ? '♻️ Esta acción ya se había registrado. Estado actual:' : null;
  if (battle.status === 'pending') return message(battle.competitive ? 'DESAFÍO RANKED' : 'DESAFÍO', [duplicate,
    `⚔️ *${names[0]}* desafió a *${names[1]}* · *${format}*`,
    competitiveBattleOpening(battle),
    `🛡️ ${battle.teamSize} ${battle.teamSize === 1 ? 'unidad' : 'unidades'} por jugador · Elementos, pasivas y efectos`,
    `📣 *${names[1]}, ¿aceptas?*\n👉 *${cmd('ctuaceptar')}* o *${cmd('cturechazar')}*`,
    `⏳ Vence a las ${timeText(battle.expiresAt)} (CDMX).\n↩️ Retirar: ${cmd('ctucancelar')}`
  ]);
  const action = result.duplicate ? null : result.action ?? (['active', 'finished'].includes(battle.status) ? battle.actions.at(-1) : null);
  const body = [duplicate, actionText(battle, action)];
  if (battle.status === 'active') {
    const player = battle.players.find(value => value.userId === battle.turnUserId);
    const unit = active(player);
    const opening = battle.actions.length === 0;
    if (opening) {
      body.push(`⚔️ *${names[0]}* vs *${names[1]}* · *${format}*\n${characterIcon(unit.characterId)} *${displayName(unit.characterName)}* toma la iniciativa.`);
      body.push(competitiveBattleOpening(battle));
      body.push((battle.openingEvents ?? []).map(event => eventText(battle, event)).filter(Boolean).join('\n'));
    }
    body.push(advancedStatusText(battle, healthBars));
    body.push(`🎯 *Turno de ${displayName(player.name)}*\n` + unit.attacks.map((attack, index) => {
      const wait = unit.cooldowns?.[attack.id] ?? 0;
      return `${index === 0 ? '1️⃣' : '2️⃣'} ${displayName(attack.name)} · ${attack.power} POT${wait ? ` · ⏳ ${wait}T` : ''}`;
    }).join('\n'));
    const attacks = unit.attacks.flatMap((attack, index) => (unit.cooldowns?.[attack.id] ?? 0) === 0 ? [`*${cmd('ctuatacar', String(index + 1))}*`] : []);
    const reserves = player.units.flatMap((value, index) => index !== player.activeIndex && value.hp > 0 ? [`*${cmd('ctucambiar', String(index + 1))}*`] : []);
    body.push(`${attacks.length ? `👉 ${attacks.join(' o ')}\n` : ''}${reserves.length ? `🔀 ${reserves.join(' / ')} · Consume turno\n` : ''}🔎 Detalles: ${cmd('ctuficha')}`);
    return message(opening ? 'INICIO | T1' : `T${battle.turnNumber}`, body);
  }
  let label;
  const turns = battle.actions.filter(value => value.commandType !== 'surrender' && value.type !== 'surrender').length;
  if (battle.winnerId) {
    const winner = battle.players.find(player => player.userId === battle.winnerId);
    const loser = battle.players.find(player => player.userId !== battle.winnerId);
    label = 'VICTORIA';
    body.push(`${characterIcon(active(winner).characterId)} *¡${displayName(winner.name)} derrotó a ${displayName(loser.name)}!*`);
    body.push(`⚔️ ${format} · ${turns} turnos · ❤️ ${winner.units.reduce((total, unit) => total + unit.hp, 0)} HP restantes`);
    body.push(advancedStatusText(battle, healthBars));
  } else {
    label = { rejected: 'DESAFÍO RECHAZADO', cancelled: 'DESAFÍO RETIRADO', expired: 'TIEMPO AGOTADO', finished: 'EMPATE' }[battle.status];
    if (seasonEndedBattle(battle)) {
      label = 'CIERRE DE TEMPORADA';
      body.push(`🏁 La temporada ${battle.competitive.seasonCode} cerró.${battle.acceptedAt ? `\n⚔️ ${turns} turnos · Sin ganador.` : '\nEl desafío quedó cerrado sin ser aceptado.'}`);
    } else {
      body.push({ rejected: `❌ ${names[1]} rechazó el desafío.`, cancelled: `↩️ ${names[0]} retiró el desafío.`, challenge_timeout: '⌛ El desafío venció sin ser aceptado.', inactivity: `⌛ Combate terminado por inactividad.\n⚔️ ${turns} turnos · Sin ganador.`, turn_limit: `⚖️ Ambos conservan unidades tras ${turns} turnos.\nEl combate termina en empate.` }[battle.finishReason]);
    }
    if (battle.acceptedAt) body.push(advancedStatusText(battle, healthBars));
  }
  body.push(rewardText(battle));
  body.push(competitiveBattleResult(battle));
  body.push(`⚔️ Otra partida: ${cmd(battle.competitive ? 'cturanked' : 'ctupelea', '@jugador')}${battle.competitive ? `\n📊 Tu clasificación: ${cmd('cturank')}` : ''}`);
  return message(label, body);
}
