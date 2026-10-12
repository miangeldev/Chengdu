import { card, characterIcon, displayName, healthBar, rarityIcon, rarityName } from './format.js';

export const contentDate = value => new Date(value).toLocaleString('es-MX', {
  timeZone: 'America/Mexico_City', day: 'numeric', month: 'short', year: 'numeric',
  hour: '2-digit', minute: '2-digit', hourCycle: 'h23'
});
const contentTime = value => new Date(value).toLocaleString('es-MX', {
  timeZone: 'America/Mexico_City', hour: '2-digit', minute: '2-digit', second: '2-digit', hourCycle: 'h23'
});

export function prizeText(prize) {
  return [prize.coins ? `💰 +${prize.coins} ChengCoins` : null,
    prize.userXp ? `✨ +${prize.userXp} XP de jugador` : null,
    prize.tickets ? `🎟️ +${prize.tickets} ${prize.tickets === 1 ? 'ticket' : 'tickets'}` : null].filter(Boolean).join(' · ');
}

export function renderContentReward(title, result, cmd, footer = null) {
  const reward = result.reward;
  return card(title, [
    result.alreadyClaimed ? '✅ Ese premio ya se reclamó. Este es su recibo original.' : '🎁 *¡Premio reclamado!*',
    prizeText(reward),
    `💰 Saldo ${result.alreadyClaimed ? 'tras ese reclamo' : 'actual'}: *${reward.balanceAfter} ChengCoins*\n🎟️ Tickets ${result.alreadyClaimed ? 'tras ese reclamo' : 'disponibles'}: *${reward.ticketsAfter}*`
  ], footer ?? `👉 Tu inventario: *${cmd('ctuinventario')}*`);
}

export function renderSpawn(spawn, cmd) {
  if (!spawn) return card('APARICIONES', ['🌿 No hay una aparición disponible en este grupo.',
    'Las apariciones llegan al participar en el grupo. Cada ventana tiene una sola comprobación; enviar más mensajes no aumenta la probabilidad.'
  ], `🔎 Explorar: *${cmd('ctuexplorar')}*\n🎟️ Tus tickets: ${cmd('ctuinventario')}`);
  const snapshot = spawn.snapshot;
  const active = spawn.status === 'active';
  return card(active ? '¡APARECIÓ UN PERSONAJE!' : 'APARICIÓN', [
    `${characterIcon(snapshot.characterId)} *${displayName(snapshot.characterName)}*\n${rarityIcon(snapshot.rarity)} ${rarityName(snapshot.rarity)}${snapshot.campaignId ? ' · 🏮 Exclusivo de evento' : ''}`,
    active ? `🎟️ Capturar cuesta *${snapshot.ticketCost} ticket${snapshot.ticketCost === 1 ? '' : 's'}*\n⌛ Disponible hasta ${contentDate(spawn.expiresAt)}`
      : spawn.status === 'captured' ? '✅ Esta aparición ya tiene dueño.' : '⌛ Esta aparición venció.'
  ], active ? `👉 Capturar: *${cmd('ctucapturar', spawn.code)}*\n🎟️ Tus tickets: ${cmd('ctuinventario')}` : `🔎 Aparición actual: ${cmd('ctuspawn')}`);
}

export function renderBoss(boss, cmd, { action = null, duplicate = false, rewards = [], userId = null } = {}) {
  const snapshot = boss.snapshot;
  const maxHp = snapshot.hp ?? snapshot.maxHp;
  const isActive = boss.status === 'active';
  const canAttack = isActive && boss.availableAttacks?.length && (boss.attacksRemaining === undefined || boss.attacksRemaining > 0);
  const ownReward = rewards.find(reward => reward.userId === userId);
  const damage = action?.details?.damage;
  const contribution = boss.myContribution;
  const sections = [
    `👹 *${displayName(snapshot.name)}* · ${boss.code}\n❤️ ${healthBar(boss.hp, maxHp)} ${boss.hp}/${maxHp} HP`,
    action ? `${duplicate ? '🔁 Ataque ya confirmado; se conserva el resultado original.\n' : ''}⚔️ ${displayName(action.details.attackName)}\n${damage > 0 ? `${action.details.critical ? '🔥 ¡CRÍTICO! ' : '💥 '}*${damage} de daño*` : '💨 Tu ataque falló.'}` : null,
    `🤝 ${boss.participants.length} ${boss.participants.length === 1 ? 'participante' : 'participantes'} · 💥 ${boss.totalDamage} de daño conjunto`,
    isActive ? `⌛ Termina: ${contentDate(boss.expiresAt)}` : boss.status === 'defeated' ? '🏆 *¡Boss derrotado!*\nLos premios de participación, mayor daño y último golpe se entregaron automáticamente.' : '⌛ El encuentro venció.',
    isActive ? '🛡️ Resiste los efectos de estado.' : null,
    contribution ? `🙌 Tu aporte: *${contribution.damage} de daño* · ${contribution.attacks} ataques` : null,
    ownReward ? prizeText(ownReward) : null,
    !isActive && boss.nextEncounterAt ? `🌅 Próximo encuentro desde: ${contentDate(boss.nextEncounterAt)}` : null,
    isActive && boss.cooldownUntil ? `⏳ Puedes volver a atacar: ${contentTime(boss.cooldownUntil)} (CDMX)` : null,
    isActive && boss.attacksRemaining !== undefined ? `⚔️ Te quedan ${boss.attacksRemaining} ataques en este encuentro.` : null,
    canAttack ? boss.availableAttacks.map(attack => `${attack.choice === '1' ? '1️⃣' : '2️⃣'} ${displayName(attack.name)} · ${attack.power} POT`).join('\n') : null
  ];
  return card(isActive ? 'BOSS MUNDIAL' : 'BOSS | RESULTADO', sections,
    [canAttack ? `👉 Atacar: *${cmd('ctubossatacar', `1 ${boss.code}`)}* / *${cmd('ctubossatacar', `2 ${boss.code}`)}*` : null,
      `🏅 Aportaciones: ${cmd('ctubosstop', boss.code)}`,
      isActive && !boss.availableAttacks?.length ? `🛡️ Prepara tu equipo: ${cmd('ctuequipo')}` : null].filter(Boolean).join('\n'));
}
