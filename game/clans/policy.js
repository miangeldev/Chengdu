import { requireGame } from '../../utils/GameError.js';
import { safeAdd } from '../progression/rules.js';
export const CLAN_POLICY = Object.freeze({ version: 1, createCost: 300, maxMembers: 15, inviteMs: 86400000,
  membershipCooldownMs: 86400000, rosterSize: 3, warEntry: 100, pendingMs: 1800000, warMs: 86400000,
  pairCooldownMs: 604800000, targetWins: 3 });
export const openWar = war => ['pending', 'active'].includes(war.status);
export const stamp = at => { requireGame(typeof at === 'string' && Number.isFinite(Date.parse(at)), 'INVALID_CLOCK'); return Date.parse(at); };
export const plus = (at, ms) => new Date(stamp(at) + ms).toISOString();
export const keyProof = key => requireGame(typeof key === 'string' && key.trim() === key && key.length > 0 && key.length <= 200, 'INVALID_OPERATION_KEY');
export const membership = (clans, userId) => clans.find(clan => clan.status === 'active' && clan.members.some(m => m.userId === userId)) ?? null;
export function rankPoints(war, clanId) { return war.status !== 'finished' ? 0 : war.winnerClanId === null ? 1 : war.winnerClanId === clanId ? 3 : 0; }
export function prize(war, clanId, personal = false) {
  requireGame(war.status === 'finished', 'CLAN_WAR_NOT_FINISHED');
  return war.winnerClanId === null ? (personal ? 75 : 150) : war.winnerClanId === clanId ? (personal ? 150 : 500) : (personal ? 50 : 100);
}
export function roster(clan) {
  return [...clan.members].sort((a,b) => (a.role === 'leader' ? -1 : b.role === 'leader' ? 1 : a.joinedAt.localeCompare(b.joinedAt) || a.userId.localeCompare(b.userId))).slice(0, CLAN_POLICY.rosterSize).map(m => m.userId);
}
export function reduceClan(before, action, context) {
  const { kind, userId, request: r, createdAt: now } = action;
  stamp(now);
  if (kind === 'create') {
    requireGame(!before && !membership(context.clans, userId), 'ALREADY_IN_CLAN');
    requireGame(typeof r.name === 'string' && r.name.trim() === r.name && [...r.name].length >= 3 && [...r.name].length <= 32 && !/[\p{Cc}\p{Cf}*`_~]/u.test(r.name), 'INVALID_CLAN_NAME');
    requireGame(typeof r.tag === 'string' && /^[A-Z0-9]{2,6}$/.test(r.tag) && !context.clans.some(c => c.tag === r.tag), 'INVALID_CLAN_TAG');
    const left = context.actions.filter(a => a.kind === 'leave' && a.userId === userId || ['kick', 'ban'].includes(a.kind) && a.request.targetUserId === userId && a.before.members.some(m => m.userId === userId)).at(-1);
    requireGame(!left || stamp(now) >= stamp(left.createdAt) + CLAN_POLICY.membershipCooldownMs, 'CLAN_MEMBERSHIP_COOLDOWN');
    return { id: action.clanId, policyVersion: 1, name: r.name, tag: r.tag, status: 'active', members: [{userId,role:'leader',joinedAt:now}],
      invitations: [], bans: [], treasury: 0, stats: { wins:0, losses:0, draws:0, points:0 }, createdAt: now, updatedAt: now };
  }
  requireGame(before?.status === 'active' && stamp(now) >= stamp(before.updatedAt), 'CLAN_NOT_FOUND');
  const clan = structuredClone(before), actor = clan.members.find(m => m.userId === userId), target = clan.members.find(m => m.userId === r.targetUserId);
  const admin = () => requireGame(actor && ['leader','officer'].includes(actor.role), 'CLAN_PERMISSION_DENIED');
  const leader = () => requireGame(actor?.role === 'leader', 'CLAN_PERMISSION_DENIED');
  const member = () => requireGame(actor, 'CLAN_NOT_MEMBER');
  const reserved = uid => context.wars.some(w => openWar(w) && w.clanIds.includes(clan.id) && (w.status === 'pending' || w.rosters.some(row => row.userIds.includes(uid))));
  if (kind === 'invite') { admin(); requireGame(context.users.has(r.targetUserId) && !membership(context.clans,r.targetUserId) && !clan.bans.includes(r.targetUserId), 'CLAN_INVITATION_INVALID');
    requireGame(clan.members.length < CLAN_POLICY.maxMembers, 'CLAN_FULL'); clan.invitations = clan.invitations.filter(i => i.userId !== r.targetUserId && stamp(i.expiresAt) > stamp(now));
    clan.invitations.push({userId:r.targetUserId,invitedBy:userId,createdAt:now,expiresAt:plus(now,CLAN_POLICY.inviteMs)});
  } else if (kind === 'join') {
    requireGame(!membership(context.clans,userId) && clan.members.length < CLAN_POLICY.maxMembers && !clan.bans.includes(userId) && clan.invitations.some(i => i.userId === userId && stamp(i.expiresAt) > stamp(now)), 'CLAN_INVITATION_REQUIRED');
    const left = context.actions.filter(a => a.kind === 'leave' && a.userId === userId || ['kick','ban'].includes(a.kind) && a.request.targetUserId === userId && a.before.members.some(m => m.userId === userId)).at(-1);
    requireGame(!left || stamp(now) >= stamp(left.createdAt) + CLAN_POLICY.membershipCooldownMs, 'CLAN_MEMBERSHIP_COOLDOWN');
    requireGame(!context.wars.some(w => openWar(w) && w.clanIds.includes(clan.id)), 'CLAN_WAR_ROSTER_LOCKED');
    clan.members.push({userId,role:'member',joinedAt:now}); clan.invitations = clan.invitations.filter(i => i.userId !== userId);
  } else if (kind === 'leave') { member(); requireGame(!reserved(userId), 'CLAN_WAR_ROSTER_LOCKED');
    requireGame(actor.role !== 'leader' || clan.members.length === 1 && clan.treasury === 0, 'CLAN_TRANSFER_LEADERSHIP_REQUIRED');
    clan.members = clan.members.filter(m => m.userId !== userId); if (clan.members.length === 0) { clan.status = 'disbanded'; clan.invitations = []; }
  } else if (kind === 'role') { leader(); requireGame(target && target.userId !== userId && ['officer','member'].includes(r.role), 'INVALID_CLAN_ROLE'); target.role = r.role;
  } else if (kind === 'leadership') { leader(); requireGame(target && target.userId !== userId, 'CLAN_MEMBER_NOT_FOUND'); actor.role = 'officer'; target.role = 'leader';
  } else if (['kick','ban','unban'].includes(kind)) { admin(); requireGame(r.targetUserId !== userId && context.users.has(r.targetUserId), 'CLAN_PERMISSION_DENIED');
    if (target) { requireGame(target.role !== 'leader' && (actor.role === 'leader' || target.role === 'member'), 'CLAN_PERMISSION_DENIED'); requireGame(!reserved(target.userId), 'CLAN_WAR_ROSTER_LOCKED'); }
    if (kind === 'kick') requireGame(target, 'CLAN_MEMBER_NOT_FOUND');
    if (kind !== 'unban') { clan.members = clan.members.filter(m => m.userId !== r.targetUserId); clan.invitations = clan.invitations.filter(i => i.userId !== r.targetUserId); }
    if (kind === 'ban') clan.bans = [...new Set([...clan.bans,r.targetUserId])];
    if (kind === 'unban') clan.bans = clan.bans.filter(id => id !== r.targetUserId);
  } else if (kind === 'deposit' || kind === 'withdraw') {
    requireGame(Number.isSafeInteger(r.amount) && r.amount >= 10 && r.amount <= 1000000, 'INVALID_COIN_AMOUNT');
    if (kind === 'deposit') { member(); clan.treasury = safeAdd(clan.treasury,r.amount); }
    else { leader(); requireGame(target && clan.treasury >= r.amount, 'CLAN_TREASURY_INSUFFICIENT'); clan.treasury -= r.amount; }
  } else if (kind === 'war_entry') { requireGame(userId === null && context.wars.some(w => w.id === r.warId && w.acceptedAt === now && w.clanIds.includes(clan.id)), 'CLAN_WAR_INVALID');
    requireGame(clan.treasury >= CLAN_POLICY.warEntry, 'CLAN_TREASURY_INSUFFICIENT'); clan.treasury -= CLAN_POLICY.warEntry;
  } else if (kind === 'war_result') { const war = context.wars.find(w => w.id === r.warId); requireGame(userId === null && war?.status === 'finished' && war.closedAt === now && war.clanIds.includes(clan.id) && !context.actions.some(a => a.kind === kind && a.clanId === clan.id && a.request.warId === r.warId), 'CLAN_WAR_INVALID');
    clan.treasury = safeAdd(clan.treasury,prize(war,clan.id)); const field = war.winnerClanId === null ? 'draws' : war.winnerClanId === clan.id ? 'wins' : 'losses';
    clan.stats[field] = safeAdd(clan.stats[field],1); clan.stats.points = safeAdd(clan.stats.points,rankPoints(war,clan.id));
  } else requireGame(false,'INVALID_CLAN_ACTION');
  clan.updatedAt = now; return clan;
}
