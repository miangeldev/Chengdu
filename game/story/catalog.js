import * as prior from './catalogV2.js';
import { SEASON_MISSIONS, SIDE_MISSIONS, ARCHIVE_TRIALS, SEASON_MEMORIES } from './seasonContent.js';
export const STORY_CAMPAIGN_ID = prior.STORY_CAMPAIGN_ID;
export const STORY_CONTENT_VERSION = 3;
export const STORY_CAMPAIGN_TITLE = prior.STORY_CAMPAIGN_TITLE;
export const STORY_SEASON_TITLE = prior.STORY_SEASON_TITLE;
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
const normalizeMission = mission => ({ ...mission, choices: mission.choices ?? [], scene: mission.scene ?? mission.steps?.[0]?.scene ?? [] });
export const STORY_MISSIONS = freeze([...prior.STORY_MISSIONS, ...SEASON_MISSIONS.map(normalizeMission)]);
export const STORY_SIDE_MISSIONS = freeze(SIDE_MISSIONS.map(normalizeMission));
const zeroReward = () => ({ coins: 0, userXp: 0, unitXp: 0, materials: { fragmentos: 0, esencias: 0, sellos: 0 }, memory: null });
export const STORY_TRIALS = freeze(ARCHIVE_TRIALS.map(trial => ({ ...trial, id: trial.id, code: `PRUEBA-${trial.number}`,
  chapterId: 'pruebas', location: 'Patio del Archivo Abierto', kind: 'sequence', choices: [], scene: trial.scene,
  reward: { ...zeroReward(), memory: trial.memory ?? null }, steps: [
    { id: 'prueba', scene: trial.scene, encounterId: trial.encounterId },
    { id: 'resultado', scene: ['La inscripción del patio conserva lo aprendido. Esta prueba puede repetirse sin generar monedas, XP ni materiales.'] }
  ] })));
export const STORY_CHAPTERS = freeze([...prior.STORY_CHAPTERS,
  { id: 'montanas', title: 'Las Montañas del Espejo', location: 'Las Montañas del Espejo', missionCodes: ['III-01','III-02','III-03','III-04','III-05'], plannedMissions: 5 },
  { id: 'casas', title: 'Las Casas Divididas', location: 'Distrito de las Casas', missionCodes: ['IV-01','IV-02','IV-03','IV-04','IV-05'], plannedMissions: 5 },
  { id: 'archivo', title: 'El Último Nombre', location: 'Archivo Original', missionCodes: ['V-01','V-02','V-03','V-04','V-05','V-06'], plannedMissions: 6 },
  { id: 'epilogo', title: 'El Archivo Abierto', location: 'Gran Archivo del Bambú', missionCodes: ['E-01','E-02'], plannedMissions: 2 }
]);
export const STORY_TRACES = freeze(prior.STORY_TRACES.map(trace => ({ ...trace,
  missionId: trace.number >= 3 ? SEASON_MISSIONS.find(mission => mission.code === (trace.number === 3 ? 'III-05' : trace.number === 4 ? 'IV-05' : 'V-06'))?.id : trace.missionId,
  missionCode: trace.number === 3 ? 'III-05' : trace.number === 4 ? 'IV-05' : trace.number === 5 ? 'V-06' : trace.missionCode,
  description: trace.number === 3 ? 'Un vínculo sin elección no es un vínculo.' : trace.number === 4 ? 'Una comunidad puede proteger sin obligar a pertenecer.' :
    trace.number === 5 ? 'La Primera Carta recupera su inscripción cuando los vínculos vuelven a ser libres.' : trace.description })));
export const STORY_MEMORIES = freeze([...prior.STORY_MEMORIES, ...SEASON_MEMORIES]);
export const isStoryContentVersion = version => [1,2,3].includes(version);
export const storyMissions = (version = 3) => version === 3 ? STORY_MISSIONS : prior.storyMissions(version);
export const storyChapters = (version = 3) => version === 3 ? STORY_CHAPTERS : prior.storyChapters(version);
export const storyAllMissions = (version = 3) => version === 3 ? [...STORY_MISSIONS, ...STORY_SIDE_MISSIONS, ...STORY_TRIALS] : storyMissions(version);
export function getStoryMission(reference, version = 3) {
  if (version !== 3) return prior.getStoryMission(reference, version);
  if (Number.isSafeInteger(reference)) return STORY_MISSIONS[reference] ?? null;
  if (typeof reference !== 'string') return null;
  return storyAllMissions(version).find(mission => mission.id === reference.trim() || mission.code === reference.trim().toUpperCase()) ?? null;
}
export const activeStoryMission = progress => progress ? getStoryMission(progress.activityId ?? progress.missionIndex, progress.contentVersion) : null;
export function currentStoryStep(mission, progress) {
  return mission?.kind === 'sequence' ? mission.steps[progress.sceneStep ?? 0] ?? null : null;
}
export function matchesStoryChoices(when = {}, decisions = {}) {
  return Object.entries(when).every(([key, value]) => Array.isArray(value) ? value.includes(decisions[key]) : decisions[key] === value);
}
export function storyEncounterFor(mission, progress) {
  const step = currentStoryStep(mission, progress);
  if (!step) return mission?.encounterId ?? null;
  return !step.encounterWhen || matchesStoryChoices(step.encounterWhen, progress.decisions) ? step.encounterId ?? null : null;
}
export function storyScene(mission, decisions = {}, sceneStep = 0) {
  if (mission?.kind !== 'sequence') return prior.storyScene(mission, decisions, sceneStep);
  const step = mission.steps[sceneStep];
  if (!step) return [];
  const variant = step.variants?.find(variant => matchesStoryChoices(variant.when, decisions));
  return [...(step.scene ?? []), ...(variant?.scene ?? [])];
}
export const STORY_ENDINGS = freeze({
  protected: { id: 'protected', title: 'El Archivo Protegido', summary: 'Restauraste el Archivo con nuevas salvaguardas y registros que protegen sin inmovilizar los vínculos.' },
  open: { id: 'open', title: 'Las Voces Abiertas', summary: 'Abriste la custodia de los registros a la comunidad, con testimonios y acceso transparente.' },
  council: { id: 'council', title: 'El Consejo del Bambú', summary: 'Un consejo plural vigila los cambios y escucha a quienes los viven, sin congelar sus vínculos.' }
});
export function storyTitleReward(mission, decisions) {
  if (mission.code === 'E-02') return { code: 'STORY-DAWN', name: 'Custodio del Alba', badge: '🌅' };
  if (mission.code === 'V-06') {
    const ending = STORY_ENDINGS[decisions.archive_ending];
    return ending ? { code: `STORY-${ending.id.toUpperCase()}`, name: ending.title, badge: '🎋' } : null;
  }
  return null;
}
