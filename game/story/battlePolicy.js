// Only closed, played knockouts teach a boss's patterns. Voluntary retreats,
// resets and other runs cannot unlock a later attempt.
export function isLearningDefeat(record) {
  return record.status === 'lost' && record.closeReason !== 'reset' &&
    record.combat.finishReason !== 'surrender' && record.combat.actions.at(-1)?.action !== 'surrender';
}
export function storyLearningDefeats(records, { userId, run, missionId, encounterId }) {
  return records.filter(record => record.userId === userId && record.run === run && record.missionId === missionId &&
    record.combat.encounterId === encounterId && isLearningDefeat(record)).length;
}
export function storyBattleContext(progress, step) {
  return { huanSupport: progress.decisions.rival_response === 'forgive' || progress.decisions.huan_helped === 'yes',
    helpedEchoes: progress.decisions.forgotten_echoes === 'help', ...(step ? { encounterStep: step.id } : {}) };
}
