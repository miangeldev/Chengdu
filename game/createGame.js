import { JsonUnitOfWork } from '../storage/unitOfWork.js';
import { createUserService } from './users/userService.js';
import { createCharacterService } from './characters/characterService.js';
import { createUnitService } from './units/unitService.js';
import { createStarterService } from './rewards/starterService.js';
import { createTeamService } from './teams/teamService.js';
import { createBattleService } from './battle/battleService.js';
import { createEconomyService } from './economy/economyService.js';

export function createGame(options = {}) {
  const storage = options.storage ?? new JsonUnitOfWork(options);
  const clock = options.clock ?? storage.clock ?? (() => new Date().toISOString());
  return {
    users: createUserService(storage, clock),
    characters: createCharacterService(storage),
    units: createUnitService(storage, clock),
    starter: createStarterService(storage, clock),
    teams: createTeamService(storage, clock),
    battle: createBattleService(storage, clock, options.randomRoll),
    economy: createEconomyService(storage, clock),
    validateDatabase: () => storage.validateDatabase(),
    close: () => storage.close()
  };
}
