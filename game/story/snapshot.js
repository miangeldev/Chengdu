import { effectiveUnitStats, evolutionSnapshot, displayUnitCharacterName } from '../evolution/rules.js';
import { advancedAttack } from '../battle/combatContent.js';

export function storyUnitSnapshot(unit, character, attacks) {
  const stats = effectiveUnitStats(unit);
  return { id: unit.id, ownerId: unit.ownerId, characterId: unit.characterId,
    characterRevision: character.revision, characterName: displayUnitCharacterName(unit, character),
    serial: unit.serial, level: unit.progress.level, ownershipVersion: unit.ownershipVersion,
    statsVersion: unit.statGrowthVersion, traitVersion: unit.traitVersion, traits: [...unit.traits], variant: unit.variant,
    combatBaseStats: structuredClone(unit.combatBaseStats), evolution: evolutionSnapshot(unit), stats, hp: stats.hp,
    attacks: attacks.map(advancedAttack), profileVersion: character.combat.version, element: character.combat.element,
    ability: structuredClone(character.combat.ability), effects: [], cooldowns: {}, abilityUsed: false, participated: false };
}
