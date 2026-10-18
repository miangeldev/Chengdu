import { requireGame } from '../../utils/GameError.js';
import { getStoryMission, isStoryContentVersion, storyMissions } from './catalog.js';

const HOUR_MS = 3_600_000;
const timestamp = value => typeof value === 'string' && Number.isFinite(Date.parse(value));
const unique = rows => [...new Map(rows.map(row => [row.id, row])).values()];

/** Aggregated gameplay evidence; no identities or individual histories escape. */
export function analyzeStoryProgress({ progress = [], actions = [], battles = [], now, inactiveHours = 48 }) {
  requireGame(timestamp(now) && Number.isFinite(inactiveHours) && inactiveHours > 0, 'INVALID_STORY_METRICS');
  const at = Date.parse(now), threshold = inactiveHours * HOUR_MS;
  const current = new Map();
  for (const row of progress) {
    if (!isStoryContentVersion(row.contentVersion)) continue;
    const previous = current.get(row.userId);
    if (!previous || Date.parse(row.updatedAt) >= Date.parse(previous.updatedAt)) current.set(row.userId, row);
  }
  const rows = [...current.values()], latest = new Map(rows.map(row => [row.userId, Date.parse(row.updatedAt)]));
  const everComplete = new Set(), completions = new Map(), counters = new Map();
  const definitions = new Map([1, 2].flatMap(version => storyMissions(version)).map(mission => [mission.id, mission]));
  for (const [id] of definitions) {
    completions.set(id, new Set());
    counters.set(id, { attempts: 0, wins: 0, losses: 0, cancelled: 0, retries: 0 });
  }
  function completionEvidence(userId, snapshot) {
    if (!snapshot || !current.has(userId)) return;
    if (snapshot.status === 'complete') everComplete.add(userId);
    for (const id of snapshot.completedMissionIds ?? []) completions.get(id)?.add(userId);
  }
  for (const row of rows) completionEvidence(row.userId, row);
  const recordedActions = unique(actions);
  for (const action of recordedActions) {
    if (!current.has(action.userId) || !isStoryContentVersion(action.contentVersion)) continue;
    completionEvidence(action.userId, action.after);
    if (timestamp(action.createdAt)) latest.set(action.userId, Math.max(latest.get(action.userId), Date.parse(action.createdAt)));
    if (action.kind === 'retry') {
      const mission = getStoryMission(action.before?.missionIndex, action.contentVersion);
      if (mission) counters.get(mission.id).retries++;
    }
  }
  const combat = { attempts: 0, wins: 0, losses: 0, active: 0, cancelled: 0, retries: 0 };
  for (const battle of unique(battles)) {
    if (!current.has(battle.userId) || !definitions.has(battle.missionId)) continue;
    const mission = counters.get(battle.missionId);
    combat.attempts++; mission.attempts++;
    if (battle.status === 'won') { combat.wins++; mission.wins++; }
    else if (battle.closeReason === 'reset') { combat.cancelled++; mission.cancelled++; }
    else if (battle.status === 'lost') { combat.losses++; mission.losses++; }
    else if (battle.status === 'active') combat.active++;
  }
  combat.retries = [...counters.values()].reduce((sum, value) => sum + value.retries, 0);
  const inactive = row => row.status !== 'complete' && at - latest.get(row.userId) >= threshold;
  const completed = rows.filter(row => row.status === 'complete').length;
  const missions = [...definitions].map(([id, definition]) => {
    const currentRows = rows.filter(row => row.status !== 'complete' && getStoryMission(row.missionIndex, row.contentVersion)?.id === id);
    return { code: definition.code, title: definition.title, completedPlayers: completions.get(id).size,
      currentPlayers: currentRows.length, inactiveCurrentPlayers: currentRows.filter(inactive).length, ...counters.get(id) };
  });
  return {
    players: { started: rows.length, currentSliceComplete: completed, pending: rows.length - completed,
      everCompletedAnySlice: everComplete.size, inactivePending: rows.filter(inactive).length },
    inactivity: { thresholdHours: inactiveHours, signal: 'pending_without_story_activity', confirmedAbandonment: false },
    byContentVersion: [1, 2].map(contentVersion => {
      const versionRows = rows.filter(row => row.contentVersion === contentVersion);
      const finished = versionRows.filter(row => row.status === 'complete').length;
      return { contentVersion, availableMissions: storyMissions(contentVersion).length, players: versionRows.length,
        currentSliceComplete: finished, pending: versionRows.length - finished,
        inactivePending: versionRows.filter(inactive).length };
    }),
    combat, missions
  };
}

/** 4096 is a reading budget for comparison, not a WhatsApp transport limit. */
export function analyzeStoryMessages(messages, budgetChars = 4096) {
  requireGame(Array.isArray(messages) && messages.every(message => typeof message === 'string') &&
    Number.isSafeInteger(budgetChars) && budgetChars > 0, 'INVALID_STORY_METRICS');
  const lengths = messages.map(message => message.length).sort((a, b) => a - b);
  const middle = Math.floor(lengths.length / 2);
  return { count: lengths.length, maxChars: lengths.at(-1) ?? 0,
    medianChars: lengths.length === 0 ? 0 : lengths.length % 2 ? lengths[middle] : (lengths[middle - 1] + lengths[middle]) / 2,
    budgetChars, overBudget: lengths.filter(length => length > budgetChars).length,
    measurement: 'UTF-16 code units' };
}

/** Select generated message blocks, including Diario del Custodio, not Historial. */
export function storyPreviewMessages(markdown) {
  requireGame(typeof markdown === 'string', 'INVALID_STORY_METRICS');
  const messages = [];
  for (const match of markdown.matchAll(/^```[^\r\n]*\r?\n([\s\S]*?)^```[\t ]*$/gm)) {
    const body = match[1].replace(/\r?\n$/, '');
    const header = body.split(/\r?\n/).find(line => line.trim()) ?? '';
    if (/\|\s*(?:HISTORIA|DIARIO DEL CUSTODIO|DIARIO\s*\|\s*(?:CR[OÓ]NICA|PERSONAJES|TRAZOS Y PISTAS|DECISIONES|RECUERDOS|ATLAS)|RECUERDOS|CAP[IÍ]TULOS)(?=\s|\*|$)/iu.test(header)) messages.push(body);
  }
  return messages;
}
