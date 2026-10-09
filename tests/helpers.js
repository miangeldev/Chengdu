import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createGame } from '../game/createGame.js';
import { JsonUnitOfWork } from '../storage/unitOfWork.js';

export const identity = (number = '521999999999') => ({ provider: 'whatsapp', subject: `${number}@s.whatsapp.net` });

export function setup(t, options = {}) {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chengdu-test-'));
  const stores = [];
  function open(overrides = {}) {
    const storage = new JsonUnitOfWork({ directory, ...options, ...overrides });
    stores.push(storage);
    return { storage, game: createGame({ storage, randomRoll: overrides.randomRoll ?? options.randomRoll, randomDropInt: overrides.randomDropInt ?? options.randomDropInt }) };
  }
  const context = { directory, open, ...open() };
  t.after(async () => {
    for (const store of stores) await store.close();
    fs.rmSync(directory, { recursive: true, force: true });
  });
  return context;
}

export async function register(game, name = 'Miguel', number = '521999999999') {
  return game.users.registerUser({ identity: identity(number), name });
}

export function readRecords(directory, collection) {
  return JSON.parse(fs.readFileSync(path.join(directory, `${collection}.json`), 'utf8')).records;
}

export async function updateCharacter(storage, characterId, changes) {
  await storage.withTransaction(async repos => {
    const character = await repos.characters.get(characterId);
    await repos.characters.replace({ ...character, ...changes, revision: character.revision + 1 });
  });
}
