import { createAcquisitionService } from './acquisition/acquisitionService.js';
import { createClanService } from './clans/clanService.js';
import { createSocialService } from './social/socialService.js';
import { createEvolutionService } from './evolution/evolutionService.js';
import { createCraftingService } from './crafting/craftingService.js';
import { createTradeService } from './trades/tradeService.js';
import { JsonUnitOfWork } from '../storage/unitOfWork.js';
import { createUserService } from './users/userService.js';
import { createCharacterService } from './characters/characterService.js';
import { createUnitService } from './units/unitService.js';
import { createStarterService } from './rewards/starterService.js';
import { createTeamService } from './teams/teamService.js';
import { createBattleService } from './battle/battleService.js';
import { createEconomyService } from './economy/economyService.js';
import { createPackService } from './packs/packService.js';
import { createMarketService } from './market/marketService.js';
import { createContentService } from './content/contentService.js';
import { createEncounterService } from './content/encounterService.js';
import { createSpiritsService } from './content/spiritsService.js';
import { createCompetitiveService } from './competitive/competitiveService.js';
import { createStoryService } from './story/storyService.js';

export function createGame(options = {}) {
  const storage = options.storage ?? new JsonUnitOfWork(options);
  const clock = options.clock ?? storage.clock ?? (() => new Date().toISOString());
  const encounters = createEncounterService(storage, clock, options.randomDropInt);
  return {
    users: createUserService(storage, clock),
    characters: createCharacterService(storage, clock),
    units: createUnitService(storage, clock),
    starter: createStarterService(storage, clock),
    teams: createTeamService(storage, clock),
    battle: createBattleService(storage, clock, options.randomRoll),
    economy: createEconomyService(storage, clock),
    packs: createPackService(storage, clock, options.randomDropInt),
    market: createMarketService(storage, clock),
    content: createContentService(storage, clock),
    encounters,
    spirits: createSpiritsService(storage, clock),
    competitive: createCompetitiveService(storage, clock),
    trades: createTradeService(storage, clock),
    crafting: createCraftingService(storage, clock),
    evolution: createEvolutionService(storage, clock),
    social: createSocialService(storage, clock),
    clans: createClanService(storage, clock),
    acquisition: createAcquisitionService(storage, clock, options.randomDropInt),
    story: createStoryService(storage, clock, options.randomRoll, { contentVersion: options.storyContentVersion, combatVersion: options.storyCombatVersion }),
    validateDatabase: () => storage.validateDatabase(),
    close: () => storage.close()
  };
}
