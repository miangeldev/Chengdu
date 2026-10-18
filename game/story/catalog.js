import * as legacy from './catalogV1.js';
import { EXTENDED_MISSIONS, NEW_STORY_MEMORIES, STORY_TRACES } from './chapterContent.js';

export const STORY_CAMPAIGN_ID = legacy.STORY_CAMPAIGN_ID;
export const STORY_CONTENT_VERSION = 2;
export const STORY_CAMPAIGN_TITLE = legacy.STORY_CAMPAIGN_TITLE;
export const STORY_SEASON_TITLE = legacy.STORY_SEASON_TITLE;
export { STORY_TRACES };

function freeze(value) {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
}
freeze(STORY_TRACES);

// Version one remains authoritative for committed receipts and actions.
const reduced = [
  [15, 15, 0, 0, 0], [0, 15, 75, 0, 0], [34, 38, 165, 1, 0],
  [26, 22, 60, 1, 0], [30, 26, 75, 0, 0], [45, 34, 112, 1, 0], [75, 75, 338, 1, 1]
];
export const STORY_MISSIONS = freeze([
  ...legacy.STORY_MISSIONS.map((mission, index) => {
    const [coins, userXp, unitXp, fragmentos, esencias] = reduced[index];
    return { ...structuredClone(mission), reward: { coins, userXp, unitXp,
      materials: { fragmentos, esencias, sellos: 0 }, memory: mission.reward.memory } };
  }),
  ...EXTENDED_MISSIONS
]);
export const STORY_CHAPTERS = freeze([
  structuredClone(legacy.STORY_CHAPTERS[0]),
  { ...structuredClone(legacy.STORY_CHAPTERS[1]), missionCodes: ['I-01', 'I-02', 'I-03', 'I-04', 'I-05'] },
  { id: 'mercado', title: 'El Mercado de los Ecos', location: 'Mercado de las Linternas',
    missionCodes: ['II-01', 'II-02', 'II-03', 'II-04', 'II-05'], plannedMissions: 5 }
]);
export const STORY_MEMORIES = freeze([...legacy.STORY_MEMORIES, ...NEW_STORY_MEMORIES]);
export const isStoryContentVersion = version => version === 1 || version === 2;
export const storyMissions = (version = STORY_CONTENT_VERSION) => version === 1 ? legacy.STORY_MISSIONS : version === 2 ? STORY_MISSIONS : [];
export const storyChapters = (version = STORY_CONTENT_VERSION) => version === 1 ? legacy.STORY_CHAPTERS : version === 2 ? STORY_CHAPTERS : [];

export function getStoryMission(reference, version = STORY_CONTENT_VERSION) {
  const missions = storyMissions(version);
  if (Number.isSafeInteger(reference)) return missions[reference] ?? null;
  if (typeof reference !== 'string') return null;
  return missions.find(mission => mission.code === reference.trim().toUpperCase() || mission.id === reference.trim()) ?? null;
}

export function storyScene(mission, decisions = {}, sceneStep = 0) {
  if (!mission) return [];
  if (mission.kind === 'investigation' && sceneStep > 0) {
    const first = decisions.archive_order === 'weave' ? 'weave' : 'records';
    const selected = sceneStep === 1 ? first : first === 'weave' ? 'records' : 'weave';
    return [...mission.investigationScenes[selected]];
  }
  const scene = legacy.storyScene(mission, decisions);
  if (mission.code === 'I-04') scene.unshift(decisions.echo_approach === 'attack'
    ? 'Lian mantiene su distancia después de la estampida. Aun así, te ayuda a reconocer el sello de tinta.'
    : 'Lian vuelve a abrir su cuaderno: «Distinguiste a los asustados. Aquí también tendremos que mirar antes de atacar».');
  if (mission.code === 'II-01') scene.unshift(decisions.forest_choice === 'help'
    ? 'Bao recuerda a la criatura del arroyo: «En un mercado, escuchar también puede ser una forma de cuidar».'
    : 'Lian reconoce el sello que seguiste en el bosque. Su rastro también llega a estos puestos.');
  if (mission.code === 'II-02') scene.unshift(decisions.market_approach === 'courtesy'
    ? 'Tao os acompaña desde la casa de té. Reconoce el puesto que nadie quiso mencionar durante la entrega.'
    : 'El embalaje marcado que encontrasteis con Mei estaba destinado a este puesto. Lian compara las dos marcas.');
  if (mission.code === 'II-03') scene.unshift(decisions.authenticity_check === 'history'
    ? 'El vacío en la procedencia vuelve a repetirse en la oferta del desconocido: nadie acredita a su Custodio anterior.'
    : 'La carta del desconocido tiene la misma interrupción en la inscripción que examinaste en el puesto vacío.');
  if (mission.code === 'II-04') scene.unshift(decisions.impossible_offer === 'reject'
    ? 'El testigo que confió en tu negativa te señala el taller de la restauradora.'
    : 'La trampa de la oferta te dejó una pista: el vendedor ocultaba el mismo patrón del tejido.');
  if (mission.code === 'II-05') scene.unshift(decisions.archive_order === 'weave'
    ? 'La petición que descifró Yun vuelve a sonar detrás de las siluetas: quienes están allí quieren volver a elegir.'
    : 'La ruta de entregas del libro termina en este almacén. Tao reconoce las cajas que dejaron los últimos mensajeros.');
  return scene;
}
