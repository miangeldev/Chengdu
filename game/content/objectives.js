import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { ACHIEVEMENTS, CONTENT_TIME_ZONE } from './catalog.js';

export function contentPeriod(value) {
  dailyTimestamp(value);
  return new Intl.DateTimeFormat('en-CA', { timeZone: CONTENT_TIME_ZONE, year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date(value));
}

export function nextMissionReset(value) {
  const period = contentPeriod(value);
  // CDMX uses UTC-6 throughout the current content calendar.
  return new Date(Date.parse(`${period}T06:00:00.000Z`) + 86_400_000).toISOString();
}

function records(state, name) { return state[name]?.records ?? []; }
function settledBattles(state, userId, at) {
  const limit = at === undefined ? Infinity : dailyTimestamp(at);
  return records(state, 'combates').filter(battle => battle.acceptedAt !== null && battle.finishedAt !== null &&
    !['pending', 'active'].includes(battle.status) && Date.parse(battle.finishedAt) <= limit && battle.players.some(player => player.userId === userId));
}

function usedCharacters(battle, userId) {
  const player = battle.players.find(value => value.userId === userId);
  return (player.units ?? [player.unit]).filter(unit => !player.units || unit.participated).map(unit => unit.characterId);
}

export function missionProgress(state, userId, period, at) {
  const eligible = settledBattles(state, userId, at).filter(battle => battle.status === 'finished' &&
    battle.settlement?.reason === 'rewarded' && contentPeriod(battle.finishedAt) === period);
  return { wins: eligible.filter(battle => battle.winnerId === userId).length, battles: eligible.length,
    characters: [...new Set(eligible.flatMap(battle => usedCharacters(battle, userId)))].sort(),
    evidenceBattleIds: eligible.map(battle => battle.id) };
}

export function achievementProgress(state, userId, achievementId, at) {
  requireGame(ACHIEVEMENTS.some(definition => definition.id === achievementId), 'ACHIEVEMENT_NOT_FOUND');
  const settled = settledBattles(state, userId, at);
  const eligible = settled.filter(battle => battle.status === 'finished' && battle.settlement?.reason === 'rewarded');
  if (achievementId === 'collector') {
    const limit = at === undefined ? Infinity : dailyTimestamp(at);
    const unitIds = [...new Set(records(state, 'eventos').filter(event => event.toOwnerId === userId && Date.parse(event.createdAt) <= limit).map(event => event.unitId))];
    return { current: unitIds.length, evidence: { unitIds } };
  }
  if (achievementId === 'first_blood') {
    const wins = eligible.filter(battle => battle.winnerId === userId);
    return { current: Math.min(1, wins.length), evidence: { battleIds: wins.slice(0, 1).map(battle => battle.id) } };
  }
  if (achievementId === 'veteran') return { current: eligible.length, evidence: { battleIds: eligible.map(battle => battle.id) } };
  // A defeat, timeout, draw or non-rewarded match breaks the winning streak.
  // Finishing an exploit match cannot protect a streak from its result.
  let streak = [], best = [];
  for (const battle of settled) {
    if (battle.status === 'finished' && battle.settlement?.reason === 'rewarded' && battle.winnerId === userId) {
      streak.push(battle.id);
      if (streak.length > best.length) best = [...streak];
    } else streak = [];
  }
  return { current: best.length, evidence: { battleIds: best } };
}

export async function objectiveState(repos) {
  return { combates: { records: await repos.battles.all() }, eventos: { records: await repos.events.all() } };
}
