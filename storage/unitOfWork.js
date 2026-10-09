import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { DATA_DIR } from '../CTU-database.js';
import { GameError, requireGame } from '../utils/GameError.js';
import { seedCharacters } from '../game/characters/catalog.js';
import { createRepositories } from '../repositories/index.js';
import { migrateLegacyUsers } from './migrations/001-users.js';
import { migrateBattlesV2 } from './migrations/002-battles.js';
import { migrateProgressionV3 } from './migrations/003-progression.js';
import { migrateCollectionV4 } from './migrations/004-collection.js';
import { migrateBalanceV5 } from './migrations/005-balance.js';
import { progressionBaseline } from '../game/progression/rules.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { seedPacks } from '../game/packs/catalog.js';
import { COLLECTIONS, V1_COLLECTIONS, V2_COLLECTIONS, V3_COLLECTIONS, SCHEMA_VERSION, validateDatabase, validateTransition } from './validation.js';
import { acquireWriterLock } from './writerLock.js';
import { atomicWrite, parseJSON, readText, syncDirectory } from './files.js';

const MANIFEST = '_database.json';
const JOURNAL = '_journal.json';
const FILES = [...COLLECTIONS.map(name => `${name}.json`), MANIFEST];
const V1_FILES = [...V1_COLLECTIONS.map(name => `${name}.json`), MANIFEST];
const V2_FILES = [...V2_COLLECTIONS.map(name => `${name}.json`), MANIFEST];
const V3_FILES = [...V3_COLLECTIONS.map(name => `${name}.json`), MANIFEST];
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const digest = body => createHash('sha256').update(JSON.stringify(body)).digest('hex');

function envelope(records = []) {
  return { _meta: { schemaVersion: SCHEMA_VERSION, revision: 0, updatedAt: null }, records };
}

function initialState() {
  const state = Object.fromEntries(COLLECTIONS.map(name => [name, envelope()]));
  state.personajes.records = seedCharacters();
  state.ataques.records = seedAttacks();
  state.sobres.records = seedPacks();
  state.estado.records = state.personajes.records.map(c => ({ id: `mint:${c.id}`, kind: 'mintCounter', characterId: c.id, lastSerial: 0, issuedCount: 0 }));
  return state;
}

function decode(raw, expectedVersion = null) {
  const manifest = parseJSON(raw[MANIFEST], MANIFEST);
  requireGame([1, 2, 3, 4, 5].includes(manifest?.schemaVersion) && (expectedVersion === null || manifest.schemaVersion === expectedVersion), 'UNSUPPORTED_SCHEMA_VERSION', { file: MANIFEST });
  requireGame(manifest.database === 'chengdu-cards', 'DATABASE_CORRUPT');
  const names = manifest.schemaVersion === 1 ? V1_COLLECTIONS : manifest.schemaVersion === 2 ? V2_COLLECTIONS : manifest.schemaVersion === 3 ? V3_COLLECTIONS : COLLECTIONS;
  requireGame(names.every(name => typeof raw[`${name}.json`] === 'string'), 'DATABASE_INCOMPLETE');
  const state = Object.fromEntries(names.map(name => [name, parseJSON(raw[`${name}.json`], `${name}.json`)]));
  validateDatabase(state, manifest.schemaVersion);
  return state;
}

export class JsonUnitOfWork {
  #tail = Promise.resolve();
  #release;
  #opened = false;
  #closing = false;
  #failed = false;
  #onExit = () => {
    try { this.#release?.(); } catch { /* Preserve evidence if lock release fails. */ }
  };

  constructor({ directory = DATA_DIR, clock = () => new Date().toISOString(), fault = () => {} } = {}) {
    this.directory = path.resolve(directory);
    this.clock = clock;
    this.fault = fault;
  }

  #raw(files = FILES) {
    return Object.fromEntries(files.map(file => [file, readText(path.join(this.directory, file))]));
  }

  #load() {
    const raw = this.#raw();
    requireGame(FILES.every(file => raw[file] !== null), 'DATABASE_INCOMPLETE');
    return { raw, state: decode(raw, SCHEMA_VERSION) };
  }

  #writeJournal(body, phase) {
    atomicWrite(path.join(this.directory, JOURNAL), serialize({ version: 1, phase, body, checksum: digest(body) }));
  }

  #removeJournal() {
    fs.unlinkSync(path.join(this.directory, JOURNAL));
    syncDirectory(this.directory);
  }

  #recover() {
    const journalText = readText(path.join(this.directory, JOURNAL));
    if (journalText === null) return;
    const journal = parseJSON(journalText, JOURNAL);
    const { body } = journal;
    requireGame(journal.version === 1 && ['prepared', 'committed'].includes(journal.phase) && body &&
      typeof body.id === 'string' && journal.checksum === digest(body), 'DATABASE_CORRUPT', { file: JOURNAL });
    requireGame(body.after && typeof body.after[MANIFEST] === 'string', 'DATABASE_CORRUPT');
    const version = parseJSON(body.after[MANIFEST], MANIFEST).schemaVersion;
    requireGame([1, 2, 3, 4, 5].includes(version), 'UNSUPPORTED_SCHEMA_VERSION');
    const files = version === 1 ? V1_FILES : version === 2 ? V2_FILES : version === 3 ? V3_FILES : FILES;
    for (const state of [body.before, body.after]) {
      requireGame(state && Object.keys(state).length === files.length && files.every(file => Object.hasOwn(state, file)), 'DATABASE_CORRUPT', { file: JOURNAL });
    }
    requireGame(files.every(file => typeof body.after[file] === 'string' && (body.before[file] === null || typeof body.before[file] === 'string')), 'DATABASE_CORRUPT', { file: JOURNAL });
    decode(body.after);
    const current = this.#raw();
    requireGame(FILES.filter(file => !files.includes(file)).every(file => current[file] === null), 'RECOVERY_CONFLICT');
    for (const file of files) {
      const expected = journal.phase === 'prepared' ? [body.before[file]] : [body.before[file], body.after[file]];
      requireGame(expected.includes(current[file]), 'RECOVERY_CONFLICT', { file });
    }
    const freshInitialization = files.every(file => body.before[file] === null);
    // A prepared fresh install contains no player data. Finish the empty seed as
    // a new durable commit so repeated crashes during startup remain recoverable.
    if (journal.phase === 'committed' || freshInitialization) {
      if (journal.phase !== 'committed') this.#writeJournal(body, 'committed');
      for (const file of files) atomicWrite(path.join(this.directory, file), body.after[file]);
    }
    this.#removeJournal();
  }

  #backup(body) {
    const root = path.join(this.directory, 'backups');
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
    const backup = path.join(root, body.id);
    fs.mkdirSync(backup, { mode: 0o700 });
    for (const file of FILES) {
      if (body.before[file] !== null) atomicWrite(path.join(backup, file), body.before[file]);
    }
    atomicWrite(path.join(backup, 'snapshot.json'), serialize({ id: body.id, createdAt: this.clock(), files: body.before }));
    syncDirectory(root);
    syncDirectory(this.directory);
  }

  #commit(before, state) {
    validateDatabase(state);
    const after = Object.fromEntries(COLLECTIONS.map(name => [`${name}.json`, serialize(state[name])]));
    after[MANIFEST] = serialize({ database: 'chengdu-cards', schemaVersion: SCHEMA_VERSION });
    const body = { id: randomUUID(), before, after };
    try {
      // Refuse to overwrite edits made outside the owning process.
      const current = this.#raw();
      requireGame(FILES.every(file => current[file] === before[file]), 'STORAGE_CONFLICT');
      this.#backup(body);
      this.#writeJournal(body, 'prepared');
      this.fault('prepared');
      this.#writeJournal(body, 'committed');
      this.fault('committed');
      for (const file of FILES) {
        atomicWrite(path.join(this.directory, file), after[file]);
        this.fault(`published:${file}`);
      }
      this.#removeJournal();
    } catch (cause) {
      this.#failed = true;
      throw cause instanceof GameError ? cause : new GameError('STORAGE_WRITE_FAILED', {}, { cause });
    }
  }

  #open() {
    if (this.#opened) return;
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    this.#release = acquireWriterLock(this.directory);
    process.on('exit', this.#onExit);
    try {
      this.#recover();
      const raw = this.#raw();
      if (FILES.every(file => raw[file] === null)) {
        // Backup evidence means this directory used to contain an existing database.
        requireGame(!fs.existsSync(path.join(this.directory, 'backups')), 'DATABASE_INCOMPLETE');
        this.#commit(raw, initialState());
      } else if (raw[MANIFEST] === null) {
        requireGame(raw['usuarios.json'] !== null && FILES.filter(file => file !== 'usuarios.json').every(file => raw[file] === null), 'UNSUPPORTED_LEGACY_DATA');
        const users = parseJSON(raw['usuarios.json'], 'usuarios.json');
        const migrated = migrateLegacyUsers(users, this.clock());
        const state = initialState();
        state.usuarios.records = migrated.users;
        state.estado.records.push(migrated.mapping);
        state.estado.records.push(...migrated.users.map(user => progressionBaseline('user', user)));
        this.#commit(raw, state);
      } else if (parseJSON(raw[MANIFEST], MANIFEST).schemaVersion === 1) {
        requireGame(FILES.filter(file => !V1_FILES.includes(file)).every(file => raw[file] === null), 'DATABASE_INCOMPLETE');
        this.#commit(raw, migrateBalanceV5(migrateCollectionV4(migrateProgressionV3(migrateBattlesV2(decode(raw, 1), this.clock()), this.clock()), this.clock()), this.clock()));
      } else if (parseJSON(raw[MANIFEST], MANIFEST).schemaVersion === 2) {
        requireGame(FILES.filter(file => !V2_FILES.includes(file)).every(file => raw[file] === null), 'DATABASE_INCOMPLETE');
        this.#commit(raw, migrateBalanceV5(migrateCollectionV4(migrateProgressionV3(decode(raw, 2), this.clock()), this.clock()), this.clock()));
      } else if (parseJSON(raw[MANIFEST], MANIFEST).schemaVersion === 3) {
        requireGame(FILES.filter(file => !V3_FILES.includes(file)).every(file => raw[file] === null), 'DATABASE_INCOMPLETE');
        this.#commit(raw, migrateBalanceV5(migrateCollectionV4(decode(raw, 3), this.clock()), this.clock()));
      } else if (parseJSON(raw[MANIFEST], MANIFEST).schemaVersion === 4) {
        this.#commit(raw, migrateBalanceV5(decode(raw, 4), this.clock()));
      }
      this.#load();
      this.#opened = true;
    } catch (error) {
      process.removeListener('exit', this.#onExit);
      this.#release();
      this.#release = undefined;
      throw error;
    }
  }

  #enqueue(work) {
    if (this.#closing) return Promise.reject(new GameError('DATABASE_CLOSED'));
    const result = this.#tail.then(async () => {
      requireGame(!this.#failed, 'STORAGE_RECOVERY_REQUIRED');
      this.#open();
      return work();
    });
    this.#tail = result.catch(() => {});
    return result;
  }

  withRead(work) {
    return this.#enqueue(async () => {
      const { state } = this.#load();
      return structuredClone(await work(createRepositories(state)));
    });
  }

  withTransaction(work) {
    return this.#enqueue(async () => {
      const { raw, state: before } = this.#load();
      const draft = structuredClone(before);
      const result = await work(createRepositories(draft, true));
      const copiedResult = structuredClone(result);
      validateDatabase(draft);
      validateTransition(before, draft);
      let changed = false;
      for (const name of COLLECTIONS) {
        if (JSON.stringify(before[name].records) !== JSON.stringify(draft[name].records)) {
          const revision = before[name]._meta.revision + 1;
          requireGame(Number.isSafeInteger(revision), 'NUMERIC_OVERFLOW');
          draft[name]._meta = { schemaVersion: SCHEMA_VERSION, revision, updatedAt: this.clock() };
          changed = true;
        }
      }
      if (changed) this.#commit(raw, draft);
      return copiedResult;
    });
  }

  validateDatabase() {
    return this.#enqueue(() => validateDatabase(this.#load().state));
  }

  async close() {
    this.#closing = true;
    await this.#tail;
    this.#release?.();
    process.removeListener('exit', this.#onExit);
    this.#release = undefined;
    this.#opened = false;
  }
}
