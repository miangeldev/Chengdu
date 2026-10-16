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

// Record-patch journals keep only changed rows. Recover the proposed collection
// from the coherent pre-commit backup for assertions at any publication stage.
export function pendingRecords(directory, journal, collection) {
  const file = `${collection}.json`;
  if (journal.version < 3) return JSON.parse(journal.body.after[file]).records;
  const change = journal.body.changes[file];
  const records = readRecords(path.join(directory, 'backups', journal.body.id), collection);
  for (const { index, record } of change.replacements) records[index] = record;
  return records.concat(change.appended);
}

export async function updateCharacter(storage, characterId, changes) {
  await storage.withTransaction(async repos => {
    const character = await repos.characters.get(characterId);
    await repos.characters.replace({ ...character, ...changes, revision: character.revision + 1 });
  });
}

// Downgrade fixtures must contain only the files/catalog their historical
// schema actually supported. This never runs against the project's database.
export function stripBetaContentFixture(directory) {
  for (const name of ['campanas', 'premioscontenido', 'logros', 'encuentros', 'accionescontenido', 'actividad',
    'temporadas', 'clasificacion', 'resultadoscompetitivos', 'premiostemporada', 'intercambios', 'accionesintercambio', 'artesania', 'evoluciones', 'perfilessociales', 'accionessociales', 'clanes', 'accionesclan', 'guerrasclan', 'accionesguerra', 'obtenciones']) {
    fs.rmSync(path.join(directory, `${name}.json`), { force: true });
  }
  const characterFile = path.join(directory, 'personajes.json');
  const characters = JSON.parse(fs.readFileSync(characterFile, 'utf8'));
  const removed = new Set(characters.records.filter(character => character.eventId === 'faroles_2026').map(character => character.id));
  characters.records = characters.records.filter(character => !removed.has(character.id));
  fs.writeFileSync(characterFile, JSON.stringify(characters, null, 2) + '\n');
  const attackFile = path.join(directory, 'ataques.json');
  const attacks = JSON.parse(fs.readFileSync(attackFile, 'utf8'));
  attacks.records = attacks.records.filter(attack => ![...removed].some(id => attack.id.startsWith(`${id}_`)));
  fs.writeFileSync(attackFile, JSON.stringify(attacks, null, 2) + '\n');
  const stateFile = path.join(directory, 'estado.json');
  const state = JSON.parse(fs.readFileSync(stateFile, 'utf8'));
  state.records = state.records.filter(record => record.kind !== 'mintCounter' || !removed.has(record.characterId));
  fs.writeFileSync(stateFile, JSON.stringify(state, null, 2) + '\n');
}
