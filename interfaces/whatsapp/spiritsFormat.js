import { card, characterIcon, displayName, rarityIcon, rarityName } from './format.js';
import { contentDate } from './contentFormat.js';

const safe = value => displayName(value ?? '');
const stateCampaign = state => state.campaign ?? state;

export function eventRevengeText(event) {
  const revenge = event.revenge;
  if (!revenge?.active) return null;
  return `🔥 *¡Revancha activa!*\n🎴 ${revenge.eventCharacterChancePercent ?? 75}% de las apariciones eligen personajes del evento mientras quede emisión.\n🎟️ Capturar sigue costando un ticket. La revancha no crea stock adicional.`;
}

function sealText(seal, cmd, active) {
  return `${seal.claimed ? '✅' : seal.ready ? '🧧' : '🔒'} *${safe(seal.name)}*\n${safe(seal.description)}${seal.current !== undefined && seal.target !== undefined ? `\n📍 ${Math.min(seal.current, seal.target)}/${seal.target}` : ''}${seal.maskCount !== undefined ? ` · 🎭 ${Math.min(seal.maskCount, 2)}/2 máscaras` : ''}${active && seal.ready && !seal.claimed ? `\n👉 ${cmd('ctuevento', `espiritus sello ${seal.id}`)}` : ''}`;
}

function characterText(character, cmd, active) {
  const code = character.code ?? (character.id === 'guardian_mil_mascaras' ? 'guardian' : 'zorro');
  const count = Array.isArray(character.requiredSeals) ? character.requiredSeals.length : character.requiredSeals;
  return `${characterIcon(character.id)} *${safe(character.name)}*\n${rarityIcon(character.rarity)} ${rarityName(character.rarity)} · ${character.issued}/${character.max} emitidos\n${character.claimed ? '✅ Ya obtuviste tu canje de misión.' : character.issued >= character.max ? '📦 Emisión agotada.' : !active ? '🔒 Canjes cerrados.' : `🧧 Requiere ${count} sellos${character.available ? `\n👉 ${cmd('ctuevento', `espiritus reclamar ${code}`)}` : '\nCompleta y reclama sus sellos para desbloquear el canje.'}`}`;
}

export function renderSpirits(state, cmd, { section = 'estado', result = null } = {}) {
  const campaign = stateCampaign(state);
  const active = state.status === 'active';
  const status = active ? '🟢 ¡El teatro ha despertado!' : state.status === 'upcoming' ? '⏳ Próximamente' : '⌛ Evento finalizado';
  const body = [
    `🏮 *${safe(campaign.name ?? 'La Noche de los Espíritus')}*\n${status}`,
    `📅 ${contentDate(campaign.startsAt)} → ${contentDate(campaign.endsAt)}\n📍 Horarios de Ciudad de México.`,
    result?.alreadyClaimed ? '↩️ Ya recuperaste este premio.' : result?.unit ? `🎉 *¡Nuevo compañero!*\n${characterIcon(result.unit.characterId)} ${safe(result.unit.characterName ?? state.characters.find(character => character.id === result.unit.characterId)?.name ?? 'Compañero del evento')}` : result?.seal ? `🧧 *¡Sello recuperado!*\n${safe(typeof result.seal === 'object' ? result.seal.name : state.seals.find(seal => seal.id === result.seal)?.name ?? result.seal)}` : null,
    eventRevengeText({ ...campaign, revenge: state.revenge ?? campaign.revenge })
  ];
  if (!active) body.push(state.status === 'upcoming'
    ? '🔒 Fragmentos, sellos, canjes y teatro se abrirán automáticamente cuando termine el Festival de los Faroles.'
    : '🎴 Tus personajes y progreso del evento se conservan. Los fragmentos, el teatro y los nuevos canjes están cerrados.');

  if (section === 'fragmentos') {
    body.push(`✨ *${state.fragments ?? 0} fragmentos de luz espiritual*`,
      '⚔️ Participa en combates válidos durante el evento para reunir luz. Las retiradas tempranas y los duelos sin recompensa no aportan fragmentos.',
      '🧧 La luz permite recuperar el primer sello; no consume tickets ni fragmentos de artesanía.');
  } else if (section === 'sellos') {
    body.push(...(state.seals ?? []).map(seal => sealText(seal, cmd, active)));
  } else {
    if (state.lore) body.push(safe(Array.isArray(state.lore) ? state.lore.join('\n') : state.lore));
    body.push(`✨ Luz espiritual: *${state.fragments ?? 0} fragmentos*\n🧧 Sellos recuperados: *${(state.seals ?? []).filter(seal => seal.claimed).length}/3*`,
      ...(state.characters ?? []).map(character => characterText(character, cmd, active)),
      '💀 *Fatality*\nEstos dos compañeros tienen un 10% de despertar una tercera técnica al iniciar un combate. Se usa una vez en ese combate; puede fallar y respeta defensas. Consulta sus detalles con la ficha.');
  }
  return card('ESPÍRITUS', body, active
    ? `✨ ${cmd('ctuevento', 'espiritus fragmentos')}\n🧧 ${cmd('ctuevento', 'espiritus sellos')}\n🎭 ${cmd('ctuevento', 'espiritus jefe')}\n🎁 Bienvenida: ${cmd('ctuevento', 'espiritus reclamar')}\n🎟️ Capturas: ${cmd('ctuspawn')}`
    : `📅 ${cmd('ctueventos')}\n🎴 Tus compañeros: ${cmd('ctupersonajes')}`);
}
