import { seedCampaigns, SPAWN_POLICY } from './catalog.js';

// Release follows the predecessor's closing boundary, without an idle day.
// Reward/capture windows remain [startsAt, endsAt) in every service.
export const SPIRITS_RELEASE_AT = seedCampaigns().find(campaign => campaign.id === 'faroles_2026').endsAt;
export const REVENGE_DURATION_MS = 24 * 60 * 60 * 1000;
export const REVENGE_EVENT_CHANCE_PERCENT = 75;
export const SPAWN_SELECTION_VERSION = 2;

export function eventRevenge(campaign, now) {
  const startsAt = new Date(Math.max(Date.parse(campaign.startsAt), Date.parse(campaign.endsAt) - REVENGE_DURATION_MS)).toISOString();
  return { startsAt, active: Date.parse(now) >= Date.parse(startsAt) && Date.parse(now) < Date.parse(campaign.endsAt),
    eventCharacterChancePercent: REVENGE_EVENT_CHANCE_PERCENT };
}

export function revengeCampaignIds(campaigns, now) {
  return campaigns.filter(campaign => eventRevenge(campaign, now).active).map(campaign => campaign.id).sort();
}

// Preserve rarity weights within each group. Multiplying by the opposite
// group's total makes the complete event group exactly 3/4 of the pool,
// regardless of how many ordinary characters remain available.
export function spawnWeights(characters, boostedCampaignIds) {
  const boosted = new Set(boostedCampaignIds);
  const base = characters.map(character => SPAWN_POLICY.rarityWeights[character.rarity]);
  const eventTotal = characters.reduce((sum, character, index) => sum + (boosted.has(character.eventId) ? base[index] : 0), 0);
  const regularTotal = characters.reduce((sum, character, index) => sum + (!boosted.has(character.eventId) ? base[index] : 0), 0);
  if (!eventTotal || !regularTotal) return base;
  return characters.map((character, index) => base[index] * (boosted.has(character.eventId) ? regularTotal * 3 : eventTotal));
}

export function spawnSelectionProof(characters, campaigns, now) {
  const boosted = revengeCampaignIds(campaigns, now);
  return { selectionVersion: SPAWN_SELECTION_VERSION, revengeCampaignIds: boosted,
    eligibleCharacterIds: characters.map(character => character.id),
    eligibleCharacterRarities: characters.map(character => character.rarity),
    eligibleCharacterRevisions: characters.map(character => character.revision),
    eligibleCharacterWeights: spawnWeights(characters, boosted) };
}
