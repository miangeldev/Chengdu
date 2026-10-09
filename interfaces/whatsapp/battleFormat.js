import { card, characterIcon, displayName, healthBar } from './format.js';

const timeText = date => new Date(date).toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false });

function message(label, sections) {
  return card(label, sections);
}

function actionText(battle, action) {
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

export function renderBattle(result, cmd, { healthBars = true } = {}) {
  const battle = result.battle ?? result;
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
  body.push(`⚔️ Otra partida: ${cmd('ctupelea', '@jugador')}`);
  return message(label, body);
}
