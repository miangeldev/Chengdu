import { randomInt, randomUUID } from 'node:crypto';
import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { expireBattles } from '../battle/lifecycle.js';
import { expireListings } from '../market/lifecycle.js';
import { expireTrades } from '../trades/lifecycle.js';
import { validContentKey } from '../content/rewards.js';
import { STORY_CAMPAIGN_ID, STORY_CAMPAIGN_TITLE, STORY_CONTENT_VERSION, STORY_TRACES,
  STORY_MEMORIES, getStoryMission, storyScene, storyMissions, storyChapters, isStoryContentVersion } from './catalog.js';
import { createStoryBattle, resolveStoryAction, storyBattleView, STORY_COMBAT_VERSION } from './combat.js';
import { reduceStoryProgress, storyProgressId, storyRewardId } from './progress.js';
import { rewardStoryMission } from './rewards.js';
import { storyUnitSnapshot } from './snapshot.js';
import { displayUnitCharacterName } from '../evolution/rules.js';

async function registeredUser(repos, userId) {
  const user = await repos.users.get(userId); requireGame(user, 'USER_NOT_FOUND'); return user;
}
async function refreshLocks(repos, now) {
  await expireBattles(repos, now); await expireListings(repos, now); await expireTrades(repos, now);
}
async function expedition(repos, userId, now, { lockedBattleId = null } = {}) {
  let user = await registeredUser(repos, userId);
  let ids = user.team;
  if (ids.length === 0) {
    const first = (await repos.units.getByOwner(userId)).find(unit => unit.lock === null);
    requireGame(first, 'STORY_TEAM_REQUIRED'); ids = [first.id];
    user = { ...user, team: ids, updatedAt: now }; await repos.users.replace(user);
  }
  requireGame(ids.length > 0 && ids.length <= 3, 'STORY_TEAM_REQUIRED');
  return Promise.all(ids.map(async id => {
    const unit = await repos.units.get(id);
    requireGame(unit?.ownerId === userId, 'UNIT_NOT_OWNED');
    requireGame(unit.lock === null || lockedBattleId && unit.lock?.type === 'story' && unit.lock.referenceId === lockedBattleId, 'UNIT_LOCKED');
    requireGame(dailyTimestamp(now) >= dailyTimestamp(unit.updatedAt), 'INVALID_CLOCK');
    return unit;
  }));
}
const references = units => units.map(unit => ({ unitId: unit.id, ownershipVersion: unit.ownershipVersion }));

async function startBattle(repos, userId, mission, run, now, contentVersion) {
  const units = await expedition(repos, userId, now), snapshots = [];
  for (const unit of units) {
    const character = await repos.characters.get(unit.characterId);
    const attacks = await Promise.all(character.attackIds.map(id => repos.attacks.get(id)));
    snapshots.push(storyUnitSnapshot(unit, character, attacks));
  }
  const id = `STB-${randomUUID()}`;
  const combat = createStoryBattle({ id, encounterId: mission.encounterId, units: snapshots, now,
    version: contentVersion === 1 ? 1 : STORY_COMBAT_VERSION });
  const record = { id, userId, campaignId: STORY_CAMPAIGN_ID, contentVersion, run,
    missionId: mission.id, status: combat.status, createdAt: now, updatedAt: now, closedAt: null, closeReason: null, combat };
  for (const unit of units) await repos.units.replace({ ...unit, lock: { type: 'story', referenceId: id }, updatedAt: now });
  await repos.storyBattles.insert(record); return record;
}
async function unlock(repos, battle, now) {
  for (const snapshot of battle.combat.unitSnapshots) {
    const unit = await repos.units.get(snapshot.id);
    requireGame(unit?.ownerId === battle.userId && unit.lock?.type === 'story' && unit.lock.referenceId === battle.id, 'DATABASE_CORRUPT');
    await repos.units.replace({ ...unit, lock: null, updatedAt: now });
  }
}
async function savedView(repos, userId, extras = {}, availableVersion = STORY_CONTENT_VERSION) {
  const user = await registeredUser(repos, userId), progress = await repos.storyProgress.get(storyProgressId(userId));
  const version = progress?.contentVersion ?? availableVersion;
  const definition = progress ? getStoryMission(progress.missionIndex, version) : null;
  const mission = definition ? { ...definition, chapterTitle: storyChapters(version).find(chapter => chapter.id === definition.chapterId)?.title,
    choices: progress.stage === 'choice' ? definition.choices : [], scene: storyScene(definition, progress.decisions, progress.sceneStep ?? 0) } : null;
  const record = progress?.activeBattleId || progress?.stage === 'defeated' ? await repos.storyBattles.get(progress.activeBattleId ?? progress.lastBattleId) : null;
  const team = [];
  for (const unitId of user.team) {
    const unit = await repos.units.get(unitId), character = await repos.characters.get(unit.characterId);
    team.push({ id: unit.id, name: displayUnitCharacterName(unit, character),
      characterName: character.name, level: unit.progress.level, progress: unit.progress, locked: unit.lock !== null });
  }
  return { campaign: { id: STORY_CAMPAIGN_ID, title: STORY_CAMPAIGN_TITLE, contentVersion: version,
    missionCount: storyMissions(version).length, availableMissionCount: storyMissions(availableVersion).length },
    nextContentAvailable: Boolean(progress && version < availableVersion), progress, mission, team,
    battle: record ? storyBattleView(record.combat) : null, reward: null, ...extras };
}

export function createStoryService(storage, clock, randomRoll = () => randomInt(100), { contentVersion = STORY_CONTENT_VERSION } = {}) {
  requireGame(isStoryContentVersion(contentVersion), 'STORY_INVALID_ACTION');
  const view = (repos, userId, extras = {}) => savedView(repos, userId, extras, contentVersion);
  async function mutate({ userId, operationKey, ...request }, kind) {
    validContentKey(operationKey);
    const normalized = kind === 'choose' ? { choice: String(request.choice ?? '') } : kind === 'act' ?
      { action: request.action, choice: request.choice == null ? null : String(request.choice) } : {};
    const outcome = await storage.withTransaction(async repos => {
      const user = await registeredUser(repos, userId);
      const replay = await repos.storyActions.findBy('operationKey', operationKey);
      if (replay) {
        requireGame(replay.userId === userId && replay.kind === kind && JSON.stringify(replay.request) === JSON.stringify(normalized), 'OPERATION_CONFLICT');
        const oldReward = replay.rewardId ? await repos.storyRewards.get(replay.rewardId) : null;
        return view(repos, userId, { alreadyProcessed: true, reward: oldReward ? { ...oldReward, alreadyClaimed: true } : null });
      }
      const before = await repos.storyProgress.get(storyProgressId(userId));
      if (kind === 'start' && before) return view(repos, userId, { alreadyProcessed: true });
      const now = clock(); dailyTimestamp(now);
      requireGame(Date.parse(now) >= Date.parse(user.updatedAt) && (!before || Date.parse(now) >= Date.parse(before.updatedAt)), 'INVALID_CLOCK');
      if (before && before.contentVersion < contentVersion) {
        const upgrade = { id: `STA-${randomUUID()}`, userId, campaignId: STORY_CAMPAIGN_ID, contentVersion,
          run: before.run, kind: 'upgrade', request: {}, operationKey: `story-upgrade:${before.id}:${before.contentVersion}:${contentVersion}`,
          createdAt: now, before, after: null, battleId: null, battleActionSeq: null, unitRefs: [], rewardId: null };
        upgrade.after = reduceStoryProgress(before, upgrade);
        await repos.storyProgress.replace(upgrade.after); await repos.storyActions.insert(upgrade);
        return { upgradedStory: true };
      }
      requireGame(!before || before.contentVersion === contentVersion, 'STORY_INVALID_ACTION');
      await refreshLocks(repos, now);
      const mission = before ? getStoryMission(before.missionIndex, contentVersion) : null;
      let battle = null, units = [];
      if (kind !== 'start' && kind !== 'reset') requireGame(before, 'STORY_NOT_STARTED');
      if (kind === 'continue' && mission?.kind === 'starter') {
        requireGame((await repos.units.getByOwner(userId)).length > 0, 'STORY_STARTER_REQUIRED');
      }
      const begin = (kind === 'retry' && before?.stage === 'defeated') ||
        (kind === 'continue' && before?.stage === 'ready' && mission?.encounterId) ||
        (kind === 'choose' && before?.stage === 'choice' && mission?.choices.some(c => c.id === normalized.choice) && mission.encounterId);
      if (begin) battle = await startBattle(repos, userId, mission, before.run, now, contentVersion);
      let sequence = null;
      if (kind === 'act' || kind === 'reset' && before?.activeBattleId) {
        const id = before?.activeBattleId; requireGame(id, 'STORY_BATTLE_NOT_ACTIVE');
        battle = await repos.storyBattles.get(id); requireGame(battle?.status === 'active' && battle.userId === userId, 'STORY_BATTLE_NOT_ACTIVE');
        const action = kind === 'reset' ? 'surrender' : normalized.action;
        let result;
        try {
          result = resolveStoryAction(battle.combat, { action, choice: normalized.choice ?? null,
            rolls: action === 'surrender' ? null : [randomRoll(), randomRoll()], now });
        } catch (error) {
          const codes = { INVALID_STORY_ACTION: 'STORY_INVALID_ACTION', INVALID_ATTACK: 'STORY_INVALID_ACTION',
            INVALID_SWITCH: 'STORY_INVALID_SWITCH', INVALID_TEAM_SLOT: 'STORY_INVALID_SWITCH',
            UNIT_ALREADY_ACTIVE: 'STORY_INVALID_SWITCH', UNIT_KNOCKED_OUT: 'STORY_INVALID_SWITCH',
            ATTACK_ON_COOLDOWN: 'STORY_SKILL_ON_COOLDOWN', ATTACK_COOLDOWN: 'STORY_SKILL_ON_COOLDOWN' };
          if (codes[error.code]) error.code = codes[error.code];
          throw error;
        }
        const combat = result.battle; sequence = combat.actions.length;
        battle = { ...battle, combat, status: combat.status, updatedAt: now,
          closedAt: combat.status === 'active' ? null : now,
          closeReason: combat.status === 'active' ? null : kind === 'reset' ? 'reset' : combat.status };
        await repos.storyBattles.replace(battle);
        if (battle.status !== 'active') await unlock(repos, battle, now);
      }
      const action = { id: `STA-${randomUUID()}`, userId, campaignId: STORY_CAMPAIGN_ID, contentVersion,
        run: before?.run ?? 1, kind, request: normalized, operationKey, createdAt: now,
        before, after: null, battleId: battle?.id ?? null, battleActionSeq: sequence, unitRefs: [], rewardId: null };
      action.after = reduceStoryProgress(before, action, battle?.combat ?? null);
      action.run = action.after.run;
      let reward = null;
      const completed = before && action.after.missionIndex === before.missionIndex + 1;
      if (completed) {
        const previousReward = await repos.storyRewards.get(storyRewardId(userId, mission.id));
        if (!previousReward && mission.reward.unitXp > 0) {
          if (battle) units = await Promise.all(battle.combat.unitSnapshots.map(s => repos.units.get(s.id)));
          else units = await expedition(repos, userId, now);
          action.unitRefs = references(units);
        }
        reward = await rewardStoryMission(repos, { userId, mission, actionId: action.id, run: action.after.run, unitRefs: action.unitRefs, now, contentVersion });
        action.rewardId = reward.id;
      }
      if (before) await repos.storyProgress.replace(action.after); else await repos.storyProgress.insert(action.after);
      await repos.storyActions.insert(action);
      return view(repos, userId, { reward, alreadyProcessed: false, consequence: action.after.lastConsequence,
        ...(kind === 'act' && battle?.status === 'won' ? { battle: storyBattleView(battle.combat) } : {}) });
    });
    if (outcome.upgradedStory) return mutate({ userId, operationKey, ...request }, kind);
    return outcome;
  }
  return {
    getState: ({ userId }) => storage.withRead(repos => view(repos, userId)),
    start: args => mutate(args, 'start'), continue: args => mutate(args, 'continue'), choose: args => mutate(args, 'choose'),
    act: args => mutate(args, 'act'), retry: args => mutate(args, 'retry'), reset: args => mutate(args, 'reset'),
    getJournal: ({ userId }) => storage.withRead(async repos => {
      const state = await view(repos, userId), progress = state.progress;
      if (!progress) return { summary: 'Bao te espera en la Plaza del Archivo. Inicia tu historia para abrir el diario.', chronicle: [], characters: [], traces: [], decisions: [], memories: [], atlas: [] };
      const missions = storyMissions(progress.contentVersion), chapters = storyChapters(progress.contentVersion);
      const seen = missions.slice(0, Math.min(progress.missionIndex + 1, missions.length));
      const choices = seen.flatMap(m => m.choices.filter(c => progress.decisions[c.key] === c.value).map(c => ({ title: m.title, text: `${c.label}. ${c.consequence}` })));
      return { summary: progress.status === 'complete' ? progress.contentVersion === 1
        ? 'Has superado el prólogo y la primera expedición del bosque. El claro te espera cuando continúes la historia.'
        : 'Has restaurado al Guardián y desenmascarado al Mercader Sin Rostro. Conservas dos Trazos; el viaje hacia el Puente de los Espejos continúa en la próxima fase.'
        : `Continúas ${state.mission.code}: ${state.mission.title}. Tu avance y tus decisiones están guardados.`,
        chronicle: seen.filter(m => progress.completedMissionIds.includes(m.id)).map(m => ({ title: `${m.code} · ${m.title}`,
          text: progress.contentVersion >= 2 && m.completionScene?.length ? m.completionScene.join(' ') : m.scene[0] })),
        characters: [{ title: 'Maestro Bao', text: 'Mentor y antiguo guardián del Archivo. Te ayuda a comprender a tus compañeros.' },
          ...(progress.missionIndex >= 3 ? [{ title: 'Lian', text: 'Investiga los nombres borrados y recuerda cómo tratas a los Ecos.' }] : []),
          ...(progress.contentVersion >= 2 && progress.missionIndex >= 7 ? [{ title: 'Guardiana Nube', text: 'Reconoce los símbolos que la tinta dejó en el bosque.' }] : []),
          ...(progress.contentVersion >= 2 && progress.missionIndex >= 8 ? [{ title: 'Guardián Marchito', text: progress.completedMissionIds.includes('guardian_marchito')
            ? 'La tinta dejó sus raíces. Ha recuperado parte de su memoria y recuerda que protegía el camino.' : 'Una antigua criatura del bosque reúne raíces alrededor de un nombre borrado.' }] : []),
          ...(progress.contentVersion >= 2 && progress.missionIndex >= 9 ? [{ title: 'Tía Mei', text: 'Defiende a los comerciantes honestos del Mercado de los Ecos.' }] : []),
          ...(progress.contentVersion >= 2 && (progress.decisions.market_approach === 'courtesy' || progress.decisions.impossible_offer === 'reject' || progress.missionIndex >= 12)
            ? [{ title: 'Tao', text: 'Aprendiz de mensajero y testigo de las entregas sin firma del mercado.' }] : []),
          ...(progress.contentVersion >= 2 && progress.missionIndex >= 12 ? [{ title: 'Señora Yun', text: 'Restaura tejidos y registros dañados para devolver sus nombres.' }] : []),
          ...(progress.contentVersion >= 2 && progress.missionIndex >= 13 ? [{ title: 'Mercader Sin Rostro', text: progress.completedMissionIds.includes('mercader_sin_rostro')
            ? 'Vendía identidades incompletas entre señuelos. Sus registros revelaron a un antiguo protector del Archivo.' : 'Oculta el original entre invocaciones que prometen poder sin historia.' }] : [])],
        traces: [{ title: 'Trazos de la Primera Carta', text: `${progress.traces?.length ?? 0} de 5 recuperados.` },
          ...STORY_TRACES.filter(trace => progress.traces?.includes(trace.id)).map(trace => ({ title: trace.title, text: trace.description }))], decisions: choices,
        memories: STORY_MEMORIES.filter(m => progress.memories.includes(m.id)).map(m => ({ title: m.title, text: m.description })),
        atlas: chapters.filter(c => seen.some(m => m.chapterId === c.id)).map(c => ({ title: c.location, text: c.title })) };
    }),
    getMap: ({ userId }) => storage.withRead(async repos => {
      const state = await view(repos, userId), completed = state.progress?.completedMissionIds ?? [];
      const chapters = storyChapters(contentVersion), missions = storyMissions(contentVersion);
      return { chapters: chapters.map(chapter => {
        const first = missions.findIndex(mission => mission.chapterId === chapter.id);
        const available = first === 0 || (state.progress?.missionIndex ?? -1) >= first;
        const chapterMissions = missions.filter(m => m.chapterId === chapter.id);
        return { title: chapter.title,
          status: chapterMissions.every(m => completed.includes(m.id)) ? 'Completado' : available ? 'Disponible' : 'Bloqueado',
          missions: chapterMissions.map(m => ({ code: m.code, title: m.title,
            status: completed.includes(m.id) ? 'Completada' : state.mission?.id === m.id ? 'En progreso' : 'Bloqueada' })) };
      }) };
    })
  };
}
