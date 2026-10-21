import { requireGame } from '../../utils/GameError.js';
import { dailyTimestamp } from '../economy/dailyPolicy.js';
import { safeAdd } from '../progression/rules.js';
import { SPIRITS_BOSS_ID, spiritsMaskAt } from './spiritsCatalog.js';
import { fatalityAttack } from '../battle/fatality.js';

export function encounterDeadline(now, milliseconds) {
  const timestamp = safeAdd(dailyTimestamp(now), milliseconds);
  requireGame(Number.isFinite(new Date(timestamp).getTime()), 'INVALID_CLOCK');
  const result = new Date(timestamp).toISOString();
  dailyTimestamp(result);
  return result;
}

// Boss combat deliberately keeps its own, frozen policy. It never changes a
// unit's PvP HP, cooldowns, statistics or progression.
export function resolveBossAttack(snapshot, unitSnapshot, choice, roll, hp, attackCount = 0) {
  requireGame(['1', '2', '3'].includes(String(choice)), 'INVALID_ATTACK');
  requireGame(Number.isSafeInteger(roll) && roll >= 1 && roll <= 100, 'INVALID_RANDOM_ROLL');
  const attack = String(choice) === '3' ? fatalityAttack(unitSnapshot, choice) : unitSnapshot.attacks[Number(choice) - 1];
  requireGame(attack && Number.isSafeInteger(hp) && hp > 0, 'INVALID_ATTACK');
  const mask = snapshot.id === SPIRITS_BOSS_ID ? spiritsMaskAt(attackCount) : null;
  const magic = attack.type === 'magic';
  const accuracy = Math.max(1, Math.min(100, attack.accuracy + (mask && !(mask.id === 'azul' && magic) ? mask.accuracy : 0)));
  const defense = Math.max(0, snapshot.defense + (mask ? magic ? mask.magicDefense : mask.defense : 0));
  const hit = roll <= accuracy;
  const critical = hit && roll <= 5;
  const raw = Math.max(1, Math.round((unitSnapshot.stats.attack + attack.power) * 100 / (100 + defense)));
  const damage = hit ? Math.min(hp, critical ? Math.round(raw * 1.5) : raw) : 0;
  return { hit, critical, damage, hpBefore: hp, hpAfter: hp - damage, attackName: attack.name,
    ...(mask ? { maskId: mask.id, maskName: mask.name, maskAbility: mask.ability, effectiveDefense: defense, effectiveAccuracy: accuracy } : {}) };
}

export function bossContributions(actions) {
  const participants = new Map();
  for (const action of actions) {
    const previous = participants.get(action.userId) ?? { userId: action.userId, damage: 0, attacks: 0, first: participants.size };
    participants.set(action.userId, { ...previous, damage: safeAdd(previous.damage, action.details.damage), attacks: safeAdd(previous.attacks, 1) });
  }
  return [...participants.values()].sort((a, b) => b.damage - a.damage || a.first - b.first);
}

export function bossRewardFor(snapshot, contributions, userId, lastUserId) {
  const contribution = contributions.find(participant => participant.userId === userId);
  if (!contribution || contribution.damage <= 0) return null;
  const components = ['participation'];
  if (contributions.find(participant => participant.damage > 0)?.userId === userId) components.push('top');
  if (lastUserId === userId) components.push('last');
  const amounts = { coins: 0, userXp: 0, tickets: 0, ticketCost: 0 };
  for (const component of components) for (const field of ['coins', 'userXp', 'tickets']) {
    amounts[field] = safeAdd(amounts[field], snapshot.rewards[component][field]);
  }
  return { ...amounts, damage: contribution.damage, components };
}

export function encounterCodeAt(encounter, index) {
  requireGame(Number.isSafeInteger(index) && index >= 0 && Number.isSafeInteger(index + 1), 'NUMERIC_OVERFLOW');
  return `${encounter.kind === 'boss' ? 'B' : 'S'}${index + 1}`;
}

export function referenceMatches(encounters, encounterId, code, kind) {
  if (code === null || code === undefined) return true;
  if (typeof code !== 'string') return false;
  const match = /^([BS])([1-9]\d*)$/i.exec(code.trim());
  if (match) {
    const index = Number(match[2]) - 1;
    const encounter = encounters[index];
    return encounter?.id === encounterId && encounter.kind === kind && match[1].toUpperCase() === (kind === 'boss' ? 'B' : 'S');
  }
  return code.trim().toLowerCase() === encounterId.toLowerCase();
}

export function activeCampaign(campaign, now) {
  return Boolean(campaign) && dailyTimestamp(now) >= dailyTimestamp(campaign.startsAt) && dailyTimestamp(now) < dailyTimestamp(campaign.endsAt);
}
