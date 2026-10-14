import { card, displayName } from './format.js';
import { contentDate } from './contentFormat.js';
import { QUALIFYING_MATCHES, QUALIFYING_OPPONENTS, rankTier } from '../../game/competitive/policy.js';

const tierIcons = { Bronce: '🥉', Plata: '🥈', Oro: '🥇', Platino: '💠', Diamante: '💎', Maestro: '👑' };
const medal = position => ({ 1: '🥇', 2: '🥈', 3: '🥉' })[position] ?? '🏅';

export const tierText = tier => `${tierIcons[tier] ?? '🏅'} ${displayName(tier)}`;
export const seasonHeading = season => `📅 *${displayName(season.name)}* · ${season.code}`;
export const seasonDeadline = season => `⌛ ${season.status === 'closed' ? 'Cerró' : 'Cierra'}: ${contentDate(season.endsAt)} (CDMX)`;

function placementText(rank) {
  return `📋 ${Math.min(rank.matches, QUALIFYING_MATCHES)}/${QUALIFYING_MATCHES} clasificatorias válidas\n👥 ${Math.min(rank.opponentIds.length, QUALIFYING_OPPONENTS)}/${QUALIFYING_OPPONENTS} rivales distintos\nCompleta ambos requisitos para entrar al ranking oficial.`;
}

export function rankGlance(rank) {
  if (!rank?.matches && !rank?.penalties) return `🧭 Sin clasificación · *${rank.rating} Elo*`;
  return rank.eligible
    ? `${tierText(rank.tier)} · *${rank.rating} Elo* · Puesto ${rank.position}`
    : `🧭 En colocación · *${rank.rating} Elo*`;
}

export function renderRank(result, cmd) {
  const { season, rank, rewardClaimed } = result;
  return card('RANKED | TU CLASIFICACIÓN', [
    seasonHeading(season),
    `👤 *${displayName(rank.name)}*\n${rankGlance(rank)}`,
    `⚔️ ${rank.matches} clasificatorias válidas\n🏆 ${rank.wins} victorias · 💔 ${rank.losses} derrotas · ⚖️ ${rank.draws} empates${rank.penalties ? `\n⌛ ${rank.penalties} ${rank.penalties === 1 ? 'penalización' : 'penalizaciones'} por abandono` : ''}`,
    !rank.eligible ? placementText(rank) : null,
    seasonDeadline(season),
    rewardClaimed ? '✅ Premio de temporada reclamado.' : null
  ], `🏅 Jugar: *${cmd('cturanked', '@jugador')}*\n🌍 Ranking: ${cmd('ctutop', season.code)}\n🎁 Temporada: ${cmd('ctutemporada', season.code)}`);
}

export function renderLeaderboard(page, navigation, cmd) {
  return card('RANKED | TOP MUNDIAL', [
    seasonHeading(page.season),
    ...(page.items.length ? page.items.map(rank => rank.eligible
      ? `${medal(rank.position)} *${rank.position}. ${displayName(rank.name)}*\n${tierText(rank.tier)} · *${rank.rating} Elo*\n⚔️ ${rank.matches} partidas válidas · 🏆 ${rank.wins} victorias`
      : `🧭 *${displayName(rank.name)}* · En colocación\n📊 ${rank.rating} Elo · 📋 ${Math.min(rank.matches, QUALIFYING_MATCHES)}/${QUALIFYING_MATCHES} partidas · 👥 ${Math.min(rank.opponentIds.length, QUALIFYING_OPPONENTS)}/${QUALIFYING_OPPONENTS} rivales`)
      : ['🌱 Aún no hay participantes.\nLa primera clasificatoria abre el camino.']),
    `🏅 Clasificación oficial: ${QUALIFYING_MATCHES} partidas válidas y ${QUALIFYING_OPPONENTS} rivales distintos.`
  ], [navigation, `👤 Tu clasificación: ${cmd('cturank', page.season.code)}`, `📅 Temporada: ${cmd('ctutemporada', page.season.code)}`].filter(Boolean).join('\n'));
}

export function renderSeason(season, cmd) {
  const rank = season.rank;
  const reward = season.reward;
  const canClaim = season.status === 'closed' && rank?.eligible && !season.rewardClaimed;
  return card('RANKED | TEMPORADA', [
    `${seasonHeading(season)}\n${season.status === 'closed' ? '🏁 Cerrada · Clasificación final' : '🏮 En curso'}`,
    `🌅 Inicio: ${contentDate(season.startsAt)} (CDMX)\n${seasonDeadline(season)}`,
    `🌍 ${season.participants} participantes · 🏅 ${season.eligibleParticipants} con clasificación oficial`,
    rank ? `👤 *${displayName(rank.name)}*\n${rankGlance(rank)}${!rank.eligible ? `\n${placementText(rank)}` : ''}` : '🌱 Regístrate y prepara tu equipo para participar.',
    reward ? `🎁 *${season.status === 'closed' ? 'Tu premio final' : 'Tu premio si cerrara ahora'}*\n💰 +${reward.coins} ChengCoins\n🎖️ ${displayName(reward.title)}` : null,
    season.rewardClaimed ? '✅ Ya reclamaste el premio de esta temporada.' : null,
    season.status === 'closed' && rank && !rank.eligible ? '📜 La temporada cerró sin completar los requisitos para su premio.' : null,
    season.status === 'active' ? '📊 Bronce → Plata → Oro → Platino → Diamante → Maestro\nLos premios se reclaman al cerrar la temporada.\nEl podio recibe un extra; no se emiten personajes.' : null
  ], [canClaim ? `👉 *${cmd('ctutemporada', `${season.code} reclamar`)}*` : null,
    `🌍 Ranking: ${cmd('ctutop', season.code)}`,
    `📚 Temporadas: ${cmd('ctutemporadas')}`,
    season.status === 'active' ? `⚔️ Jugar: ${cmd('cturanked', '@jugador')}` : null].filter(Boolean).join('\n'));
}

export function renderSeasonReward(result, seasonCode, cmd) {
  const reward = result.reward;
  return card('RANKED | PREMIO DE TEMPORADA', [
    result.alreadyClaimed ? '✅ Este premio ya se reclamó. Se conserva su recibo original.' : '🎁 *¡Premio de temporada reclamado!*',
    `📅 ${seasonCode} · ${tierText(reward.tier)} · Puesto ${reward.position}\n📊 ${reward.rating} Elo finales`,
    `💰 +${reward.coins} ChengCoins\n🎖️ ${displayName(reward.title)}`,
    `💳 Saldo ${result.alreadyClaimed ? 'tras ese reclamo' : 'actual'}: *${reward.balanceAfter} ChengCoins*`
  ], `🎒 Tus títulos: ${cmd('ctuinventario')}\n🌍 Clasificación final: ${cmd('ctutop', seasonCode)}`);
}

export function competitiveBattleOpening(battle) {
  return battle.competitive ? `🏅 *Clasificatoria · ${battle.competitive.seasonCode}*\n📊 Elo y progreso de temporada.` : null;
}

export function seasonEndedBattle(battle) {
  return Boolean(battle.competitive && battle.status === 'expired' &&
    (battle.competitive.settlement?.reason === 'season_closed' || Date.parse(battle.finishedAt) >= Date.parse(battle.competitive.endsAt)));
}

export function competitiveBattleResult(battle) {
  const settlement = battle.competitive?.settlement;
  if (!settlement) return null;
  if (settlement.reason === 'rated' || settlement.reason === 'inactivity' || settlement.reason === 'early_surrender') {
    const rows = settlement.players.map(receipt => {
      const player = battle.players.find(value => value.userId === receipt.userId);
      const delta = receipt.delta > 0 ? `+${receipt.delta}` : String(receipt.delta);
      return `👤 ${displayName(player.name)}: *${receipt.ratingAfter} Elo* (${delta}) · ${tierText(rankTier(receipt.ratingAfter))}`;
    });
    return `🏅 *RANKED · ${battle.competitive.seasonCode}*\n${rows.join('\n')}${settlement.reason === 'inactivity' ? '\n⌛ Penalización por inactividad; no cuenta para la colocación.' : settlement.reason === 'early_surrender' ? '\n🏳️ Penalización por rendición temprana; no cuenta para la colocación.' : ''}`;
  }
  const reason = {
    pair_limit: 'Se alcanzó el límite de partidas válidas entre estos rivales.',
    early_surrender: 'La rendición fue demasiado temprana para la clasificación.',
    season_closed: 'La temporada cerró antes de resolver esta partida.'
  }[settlement.reason] ?? 'Esta partida no cuenta para la clasificación.';
  return `🏅 *RANKED · ${battle.competitive.seasonCode}*\n📊 Elo sin cambios.\n${reason}`;
}
