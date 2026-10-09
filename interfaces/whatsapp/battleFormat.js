import { card, characterIcon, displayName, healthBar, section, serialText } from './format.js';

const timeText = date => new Date(date).toLocaleTimeString('es-MX', { timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', hour12: false });

export function renderBattle(result, cmd) {
  const battle = result.battle ?? result;
  const names = battle.players.map(p => displayName(p.name));
  if (battle.status === 'pending') return card('⚔️ *Desafío 1 contra 1*', [
    `${names[0]} ha desafiado a ${names[1]}.\n\n        VS\n\n${names[0]} ⚔️ ${names[1]}`,
    section(`📣 *${names[1]}, tú decides*`, `✅ Aceptar:\n${cmd('ctuaceptar')}\n\n❌ Rechazar:\n${cmd('cturechazar')}`),
    `⏳ Vence a las ${timeText(battle.expiresAt)} (hora de Ciudad de México).\nLos personajes se fijan al aceptar el desafío.`
  ], `🆔 ${battle.id}\n\nRetirar el desafío:\n${cmd('ctucancelar')}`);

  const body = [];
  if (result.duplicate) body.push('♻️ Esta acción ya se había registrado.\nAquí está el estado actual del combate.');
  else if (result.action) {
    const action = result.action;
    const player = battle.players.find(p => p.userId === action.actorId);
    if (action.type === 'surrender') body.push(`🏳️ ${displayName(player.name)} se ha rendido.`);
    else {
      const attack = player.unit.attacks.find(a => a.id === action.attackId);
      body.push(`⚔️ ${displayName(player.unit.characterName)} usó *${displayName(attack.name)}*.\n\n${action.hit ? `💥 Daño causado: ${action.damage}` : '💨 El ataque falló.'}`);
    }
  }
  for (const player of battle.players) {
    if (!player.unit) continue;
    const unit = player.unit;
    body.push(section(`👤 *${displayName(player.name)}*`,
      `${characterIcon(unit.characterId)} ${displayName(unit.characterName)} #${serialText(unit.serial)}\n🆔 ${unit.id}\n\n❤️ ${unit.hp} / ${unit.stats.hp}\n${healthBar(unit.hp, unit.stats.hp)}`));
  }
  if (battle.status === 'active') {
    const player = battle.players.find(p => p.userId === battle.turnUserId);
    body.push(section(`🎯 *Turno ${battle.turnNumber}: ${displayName(player.name)}*`, player.unit.attacks.map((attack, i) =>
      `${i + 1}. ${displayName(attack.name)}\n⚔️ Potencia: ${attack.power} | 🎯 Precisión: ${attack.accuracy}%\n👉 ${cmd('ctuatacar', String(i + 1))}`
    ).join('\n\n')));
    return card('⚔️ *Combate en curso*', body, `🆔 ${battle.id}\n\nConsultar estado:\n${cmd('ctucombate')}\n\nRendirse:\n${cmd('cturendirse')}`);
  }
  let title;
  if (battle.winnerId) {
    const winner = battle.players.find(p => p.userId === battle.winnerId);
    title = `🏆 *${displayName(winner.name)} gana*`;
    body.push('📊 Las estadísticas de jugadores y unidades ya se actualizaron.');
  } else {
    title = { rejected: '❌ *Desafío rechazado*', cancelled: '↩️ *Desafío retirado*', expired: '⌛ *Tiempo agotado*', finished: '⚖️ *Combate sin ganador*' }[battle.status];
    body.push({ rejected: 'El jugador decidió no aceptar este desafío.', cancelled: 'El creador retiró este desafío.', challenge_timeout: 'El desafío venció sin ser aceptado.', inactivity: 'El combate terminó por inactividad. Las unidades están disponibles otra vez.', turn_limit: 'Se alcanzó el límite de turnos; el combate terminó en empate.' }[battle.finishReason]);
  }
  return card(title, body, `🆔 ${battle.id}\n\n⚔️ Iniciar otro desafío:\n${cmd('ctupelea', '@jugador')}\n\n👤 Ver perfil:\n${cmd('ctuperfil')}`);
}
