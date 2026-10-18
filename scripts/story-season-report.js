import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { STORY_MISSIONS, STORY_SIDE_MISSIONS, STORY_TRIALS, storyChapters } from '../game/story/catalog.js';
import { storyCombatPolicy } from '../game/story/combat.js';

const words = paragraphs => paragraphs.join(' ').match(/[\p{L}\p{N}]+(?:[’'-][\p{L}\p{N}]+)*/gu)?.length ?? 0;
const sum = (missions, key) => missions.reduce((total, mission) => total + mission.reward[key], 0);

// Conservative reading estimate: base scenes only, excluding branch additions,
// choice descriptions, optional stories, battle messages and repeated attempts.
// This measures content volume, never a timer imposed on the player.
export function storySeasonReport({ wordsPerMinute = 220, secondsPerAction = 3 } = {}) {
  const remaining = STORY_MISSIONS.slice(14);
  const chapterRows = storyChapters(3).filter(chapter => remaining.some(mission => mission.chapterId === chapter.id)).map(chapter => {
    const missions = remaining.filter(mission => mission.chapterId === chapter.id);
    return { chapter: chapter.title, missions: missions.length,
      scenes: missions.reduce((n, mission) => n + mission.steps.length, 0),
      baseWords: missions.reduce((n, mission) => n + words(mission.steps.flatMap(step => step.scene)) + words(mission.completionScene ?? []), 0) };
  });
  const baseWords = chapterRows.reduce((n, chapter) => n + chapter.baseWords, 0);
  const sceneActions = chapterRows.reduce((n, chapter) => n + chapter.scenes, 0);
  const encounters = remaining.flatMap(mission => mission.steps.filter(step => step.encounterId && !step.encounterWhen));
  const mandatoryDefeats = encounters.reduce((n, step) => n + storyCombatPolicy(step.encounterId).requiredDefeats, 0);
  return { mainMissions: STORY_MISSIONS.length, remainingMainMissions: remaining.length,
    optionalMissions: STORY_SIDE_MISSIONS.length, archiveTrials: STORY_TRIALS.length,
    chapters: chapterRows, baseWords, sceneActions, mandatoryDefeats,
    estimate: { wordsPerMinute, secondsPerAction,
      readingMinutes: Math.round(baseWords / wordsPerMinute * 10) / 10,
      sceneActionMinutes: Math.round(sceneActions * secondsPerAction / 60 * 10) / 10,
      totalMinutes: Math.round((baseWords / wordsPerMinute + sceneActions * secondsPerAction / 60) * 10) / 10,
      excludes: ['branch additions', 'optional missions', 'combat turns', 'retries', 'choice descriptions'],
      humanPlaytest: false },
    rewards: { initialFourteenUnitXp: sum(STORY_MISSIONS.slice(0,14),'unitXp'),
      remainingUnitXp: sum(remaining,'unitXp'), totalMainUnitXp: sum(STORY_MISSIONS,'unitXp'),
      remainingCoins: sum(remaining,'coins'), totalMainCoins: sum(STORY_MISSIONS,'coins') } };
}
if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) console.log(JSON.stringify(storySeasonReport(), null, 2));
