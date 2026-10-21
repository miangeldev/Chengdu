import fs from 'node:fs';
import path from 'node:path';
import { createHash, randomUUID } from 'node:crypto';
import { isDeepStrictEqual } from 'node:util';
import { DATA_DIR } from '../CTU-database.js';
import { GameError, requireGame } from '../utils/GameError.js';
import { seedCharacters } from '../game/characters/catalog.js';
import { createRepositories } from '../repositories/index.js';
import { migrateLegacyUsers } from './migrations/001-users.js';
import { migrateBattlesV2 } from './migrations/002-battles.js';
import { migrateProgressionV3 } from './migrations/003-progression.js';
import { migrateCollectionV4 } from './migrations/004-collection.js';
import { migrateBalanceV5 } from './migrations/005-balance.js';
import { migrateEconomyV6 } from './migrations/006-economy.js';
import { migrateMarketV7 } from './migrations/007-market.js';
import { migrateCombatV8 } from './migrations/008-combat.js';
import { migrateContentV9 } from './migrations/009-content.js';
import { migrateCommunityV11 } from './migrations/011-community.js';
import { migrateStoryV12 } from './migrations/012-story.js';
import { migrateSpiritsV13 } from './migrations/013-spirits.js';
import { migrateCompetitiveV10 } from './migrations/010-competitive.js';
import { seedCampaigns, seedEventAttacks, seedEventCharacters } from '../game/content/catalog.js';
import { seedSpiritsAttacks, seedSpiritsCampaign, seedSpiritsCharacters } from '../game/content/spiritsCatalog.js';
import { progressionBaseline } from '../game/progression/rules.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { seedPacks } from '../game/packs/catalog.js';
import { dailyTimestamp } from '../game/economy/dailyPolicy.js';
import { COLLECTIONS, collectionsForVersion, SCHEMA_VERSION, validateDatabase, validateTransition } from './validation.js';
import { acquireWriterLock } from './writerLock.js';
import { atomicWrite, parseJSON, readText, syncDirectory } from './files.js';

const MANIFEST = '_database.json';
const JOURNAL = '_journal.json';
const FILES = [...COLLECTIONS.map(name => `${name}.json`), MANIFEST];
const filesForVersion = version => [...collectionsForVersion(version).map(name => `${name}.json`), MANIFEST];
const serialize = value => JSON.stringify(value, null, 2) + '\n';
const digest = body => createHash('sha256').update(JSON.stringify(body)).digest('hex');
const fileDigest = text => createHash('sha256').update(text).digest('hex');
// Some Android/shared filesystems expose these syscalls but reject them. The
// captured JSON can still be backed up with the durable ordinary-write path.
const BACKUP_FALLBACK_CODES = new Set(['ENOSYS', 'ENOTSUP', 'EOPNOTSUPP', 'EINVAL', 'EXDEV', 'EPERM', 'EACCES', 'EMLINK']);

// Validated snapshots are shared between requests. Repositories copy on write;
// freezing also prevents a retained repository/predicate from changing authority.
function freeze(value) {
  if (value && typeof value === 'object' && !Object.isFrozen(value)) {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
}

function envelope(records = []) {
  return { _meta: { schemaVersion: SCHEMA_VERSION, revision: 0, updatedAt: null }, records };
}

function initialState() {
  const state = Object.fromEntries(COLLECTIONS.map(name => [name, envelope()]));
  state.personajes.records = [...seedCharacters(), ...seedEventCharacters(), ...seedSpiritsCharacters()];
  state.ataques.records = [...seedAttacks(), ...seedEventAttacks(), ...seedSpiritsAttacks()];
  state.sobres.records = seedPacks();
  state.campanas.records = [...seedCampaigns(), seedSpiritsCampaign(seedCampaigns()[0].endsAt)];
  state.estado.records = state.personajes.records.map(c => ({ id: `mint:${c.id}`, kind: 'mintCounter', characterId: c.id, lastSerial: 0, issuedCount: 0 }));
  return state;
}

function decode(raw, expectedVersion = null) {
  const manifest = parseJSON(raw[MANIFEST], MANIFEST);
  requireGame(Number.isSafeInteger(manifest?.schemaVersion) && manifest.schemaVersion >= 1 && manifest.schemaVersion <= SCHEMA_VERSION &&
    (expectedVersion === null || manifest.schemaVersion === expectedVersion), 'UNSUPPORTED_SCHEMA_VERSION', { file: MANIFEST });
  requireGame(manifest.database === 'chengdu-cards', 'DATABASE_CORRUPT');
  const names = collectionsForVersion(manifest.schemaVersion);
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
  #cache;
  #backupSources = new Map();
  #recentBackups;
  #onExit = () => {
    try { this.#release?.(); } catch { /* Preserve evidence if lock release fails. */ }
  };

  constructor({ directory = DATA_DIR, clock = () => new Date().toISOString(), fault = () => {}, backupRetention = 20 } = {}) {
    requireGame(backupRetention === Infinity || Number.isSafeInteger(backupRetention) && backupRetention >= 1, 'INVALID_BACKUP_RETENTION');
    this.directory = path.resolve(directory);
    this.clock = clock;
    this.fault = fault;
    this.backupRetention = backupRetention;
  }

  #raw(files = FILES) {
    return Object.fromEntries(files.map(file => [file, readText(path.join(this.directory, file))]));
  }

  #load() {
    const stamps = this.#stamps();
    if (this.#cache && FILES.every(file => stamps[file] === this.#cache.stamps[file])) return this.#cache;
    const raw = this.#raw();
    requireGame(FILES.every(file => raw[file] !== null), 'DATABASE_INCOMPLETE');
    const state = freeze(decode(raw, SCHEMA_VERSION));
    requireGame(this.#sameStamps(stamps), 'STORAGE_CONFLICT');
    this.#cache = { raw, state, stamps, hashes: Object.fromEntries(FILES.map(file => [file, fileDigest(raw[file])])) };
    return this.#cache;
  }

  #stamps() {
    return Object.fromEntries(FILES.map(file => {
      try {
        const stat = fs.statSync(path.join(this.directory, file), { bigint: true });
        requireGame(stat.isFile(), 'STORAGE_READ_FAILED', { file });
        return [file, `${stat.dev}:${stat.ino}:${stat.size}:${stat.mtimeNs}:${stat.ctimeNs}`];
      } catch (cause) {
        if (cause.code === 'ENOENT') return [file, null];
        throw cause instanceof GameError ? cause : new GameError('STORAGE_READ_FAILED', { file }, { cause });
      }
    }));
  }

  #sameStamps(stamps) {
    const current = this.#stamps();
    return FILES.every(file => current[file] === stamps[file]);
  }

  #writeJournal(body, phase, version = 1) {
    atomicWrite(path.join(this.directory, JOURNAL), serialize({ version, phase, body, checksum: digest(body) }));
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
    requireGame([1, 2, 3].includes(journal.version) && ['prepared', 'committed'].includes(journal.phase) && body &&
      typeof body.id === 'string' && journal.checksum === digest(body), 'DATABASE_CORRUPT', { file: JOURNAL });
    if (journal.version === 3) {
      this.#recoverPatches(journal);
      return;
    }
    if (journal.version === 2) {
      this.#recoverDelta(journal);
      return;
    }
    requireGame(body.after && typeof body.after[MANIFEST] === 'string', 'DATABASE_CORRUPT');
    const version = parseJSON(body.after[MANIFEST], MANIFEST).schemaVersion;
    const files = filesForVersion(version);
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

  #recoverDelta({ body, phase }) {
    const version = body.schemaVersion;
    requireGame(Number.isSafeInteger(version) && version >= 1 && version <= SCHEMA_VERSION,
      'DATABASE_CORRUPT', { file: JOURNAL });
    const historicalFiles = filesForVersion(version);
    const files = Object.keys(body.after ?? {});
    requireGame(files.length > 0 &&
      files.every(file => historicalFiles.includes(file) && file !== MANIFEST) &&
      body.before && Object.keys(body.before).length === files.length &&
      files.every(file => typeof body.before[file] === 'string' && typeof body.after[file] === 'string') &&
      body.unchanged && Object.keys(body.unchanged).length === historicalFiles.length - files.length &&
      historicalFiles.filter(file => !files.includes(file)).every(file => /^[a-f0-9]{64}$/.test(body.unchanged[file])),
    'DATABASE_CORRUPT', { file: JOURNAL });
    const current = this.#raw();
    requireGame(FILES.filter(file => !historicalFiles.includes(file)).every(file => current[file] === null),
      'RECOVERY_CONFLICT');
    for (const file of historicalFiles) {
      if (files.includes(file)) {
        const expected = phase === 'prepared' ? [body.before[file]] : [body.before[file], body.after[file]];
        requireGame(expected.includes(current[file]), 'RECOVERY_CONFLICT', { file });
      } else {
        requireGame(current[file] !== null && fileDigest(current[file]) === body.unchanged[file], 'RECOVERY_CONFLICT', { file });
      }
    }
    // Rebuild and validate the complete proposed snapshot before publishing any
    // delta, just as for historical full-snapshot journals.
    decode({ ...current, ...body.after }, version);
    if (phase === 'committed') {
      for (const file of files) atomicWrite(path.join(this.directory, file), body.after[file]);
    }
    this.#removeJournal();
  }

  #recoverPatches({ body, phase }) {
    const version = body.schemaVersion;
    requireGame(Number.isSafeInteger(version) && version >= 1 && version <= SCHEMA_VERSION,
      'DATABASE_CORRUPT', { file: JOURNAL });
    const historicalFiles = filesForVersion(version);
    const files = Object.keys(body.changes ?? {});
    requireGame(files.length > 0 &&
      files.every(file => historicalFiles.includes(file) && file !== MANIFEST) && body.unchanged &&
      Object.keys(body.unchanged).length === historicalFiles.length - files.length &&
      historicalFiles.filter(file => !files.includes(file)).every(file => /^[a-f0-9]{64}$/.test(body.unchanged[file])),
    'DATABASE_CORRUPT', { file: JOURNAL });
    const current = this.#raw();
    requireGame(FILES.filter(file => !historicalFiles.includes(file)).every(file => current[file] === null),
      'RECOVERY_CONFLICT');
    const after = {};
    for (const file of historicalFiles) {
      requireGame(current[file] !== null, 'RECOVERY_CONFLICT', { file });
      const hash = fileDigest(current[file]);
      if (!files.includes(file)) {
        requireGame(hash === body.unchanged[file], 'RECOVERY_CONFLICT', { file });
        continue;
      }
      const change = body.changes[file];
      requireGame(change && /^[a-f0-9]{64}$/.test(change.beforeHash) && /^[a-f0-9]{64}$/.test(change.afterHash) &&
        Number.isSafeInteger(change.beforeLength) && change.beforeLength >= 0 && change.afterMeta &&
        Array.isArray(change.replacements) && Array.isArray(change.appended) &&
        new Set(change.replacements.map(row => row?.index)).size === change.replacements.length &&
        change.replacements.every(row => Number.isSafeInteger(row?.index) && row.index >= 0 && row.index < change.beforeLength && row.record),
      'DATABASE_CORRUPT', { file: JOURNAL });
      requireGame(hash === change.beforeHash || phase === 'committed' && hash === change.afterHash, 'RECOVERY_CONFLICT', { file });
      if (hash === change.afterHash) after[file] = current[file];
      else {
        const collection = parseJSON(current[file], file);
        requireGame(Array.isArray(collection.records) && collection.records.length === change.beforeLength, 'DATABASE_CORRUPT', { file: JOURNAL });
        for (const { index, record } of change.replacements) collection.records[index] = record;
        for (const record of change.appended) collection.records.push(record);
        collection._meta = change.afterMeta;
        after[file] = serialize(collection);
        requireGame(fileDigest(after[file]) === change.afterHash, 'DATABASE_CORRUPT', { file: JOURNAL });
      }
    }
    decode({ ...current, ...after }, version);
    if (phase === 'committed') for (const file of files) atomicWrite(path.join(this.directory, file), after[file]);
    this.#removeJournal();
  }

  #backup(body, before = body.before, compact = false) {
    const root = path.join(this.directory, 'backups');
    fs.mkdirSync(root, { recursive: true, mode: 0o700 });
    const backup = path.join(root, body.id);
    fs.mkdirSync(backup, { mode: 0o700 });
    for (const file of FILES) {
      if (before[file] !== null) {
        const hash = compact ? this.#cache.hashes[file] : fileDigest(before[file]);
        const previous = this.#backupSources.get(file);
        const target = path.join(backup, file);
        if (!compact) {
          // Historical migrations back up the captured bytes, even if another
          // program edits a legacy file while the migration is preparing.
          atomicWrite(target, before[file]);
        } else if (previous?.hash === hash && fs.existsSync(previous.file)) {
          try { fs.linkSync(previous.file, target); }
          catch (cause) {
            if (!BACKUP_FALLBACK_CODES.has(cause.code)) throw cause;
            atomicWrite(target, before[file]);
          }
        } else {
          // Never link backups to live files: an external in-place edit must
          // not corrupt the recovery copy as well. Reflink where supported.
          try {
            fs.copyFileSync(path.join(this.directory, file), target, fs.constants.COPYFILE_FICLONE);
          } catch (cause) {
            if (!BACKUP_FALLBACK_CODES.has(cause.code)) throw cause;
            atomicWrite(target, before[file]);
          }
          const fd = fs.openSync(target, 'r');
          try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
        }
        this.#backupSources.set(file, { hash, file: target });
      }
    }
    const files = compact ? this.#cache.hashes : before;
    atomicWrite(path.join(backup, 'snapshot.json'), serialize({ version: compact ? 2 : 1, id: body.id, createdAt: this.clock(), files }));
    syncDirectory(root);
    syncDirectory(this.directory);
  }

  #pruneBackups() {
    if (this.backupRetention === Infinity) return;
    const root = path.join(this.directory, 'backups');
    try {
      if (!this.#recentBackups) {
        this.#recentBackups = fs.readdirSync(root, { withFileTypes: true }).filter(entry => entry.isDirectory()).flatMap(entry => {
          const directory = path.join(root, entry.name);
          const text = readText(path.join(directory, 'snapshot.json'));
          if (text === null) return [];
          // Historical migration backups remain pinned. Only the new compact
          // format participates in bounded routine-backup retention.
          const snapshot = parseJSON(text, 'snapshot.json');
          return snapshot.version === 2 ? [{ directory, created: fs.statSync(directory).mtimeMs }] : [];
        }).sort((a, b) => a.created - b.created).map(entry => entry.directory);
      }
      while (this.#recentBackups.length > this.backupRetention) {
        fs.rmSync(this.#recentBackups[0], { recursive: true });
        this.#recentBackups.shift();
      }
    } catch {
      // Retention is maintenance after a durable commit, never its authority.
      // A failed prune can be retried on the next commit without failing a send.
      this.#recentBackups = undefined;
    }
  }

  #commit(before, state, changedCollections = null) {
    // Initialization and migrations use the historical complete journal.
    // Ordinary transactions have already passed both validation stages.
    if (changedCollections === null) validateDatabase(state);
    const changedFiles = changedCollections === null ? FILES : changedCollections.map(name => `${name}.json`);
    const after = Object.fromEntries(changedFiles.map(file => [file, file === MANIFEST
      ? serialize({ database: 'chengdu-cards', schemaVersion: SCHEMA_VERSION })
      : serialize(state[file.slice(0, -5)])]));
    const compact = changedCollections !== null;
    const body = compact ? {
      id: randomUUID(), schemaVersion: SCHEMA_VERSION,
      changes: Object.fromEntries(changedCollections.map(name => {
        const file = `${name}.json`;
        const previous = this.#cache.state[name].records;
        const records = state[name].records;
        const replacements = [];
        for (let index = 0; index < previous.length; index++) {
          if (previous[index] !== records[index]) replacements.push({ index, record: records[index] });
        }
        return [file, { beforeHash: this.#cache.hashes[file], afterHash: fileDigest(after[file]),
          beforeLength: previous.length, afterMeta: state[name]._meta, replacements, appended: records.slice(previous.length) }];
      })),
      unchanged: Object.fromEntries(FILES.filter(file => !changedFiles.includes(file)).map(file => [file, this.#cache.hashes[file]]))
    } : { id: randomUUID(), before, after };
    let stage = 'verify_before_backup';
    let journalStarted = false;
    try {
      // Refuse to overwrite edits made outside the owning process.
      if (compact) requireGame(this.#sameStamps(this.#cache.stamps), 'STORAGE_CONFLICT');
      else {
        const current = this.#raw();
        requireGame(FILES.every(file => current[file] === before[file]), 'STORAGE_CONFLICT');
      }
      stage = 'backup';
      this.#backup(body, before, compact);
      stage = 'verify_after_backup';
      if (compact) requireGame(this.#sameStamps(this.#cache.stamps), 'STORAGE_CONFLICT');
      else {
        const current = this.#raw();
        requireGame(FILES.every(file => current[file] === before[file]), 'STORAGE_CONFLICT');
      }
      // From this point even a failed directory fsync may have left a journal.
      // Subsequent operations must wait for startup recovery. A backup failure
      // before this boundary cannot have changed any authoritative game file.
      stage = 'prepare_journal';
      journalStarted = true;
      this.#writeJournal(body, 'prepared', compact ? 3 : 1);
      stage = 'prepared';
      this.fault('prepared');
      stage = 'commit_journal';
      this.#writeJournal(body, 'committed', compact ? 3 : 1);
      stage = 'committed';
      this.fault('committed');
      for (const file of FILES) {
        stage = `published:${file}`;
        if (Object.hasOwn(after, file)) atomicWrite(path.join(this.directory, file), after[file]);
        this.fault(`published:${file}`);
      }
      stage = 'remove_journal';
      this.#removeJournal();
      stage = 'cache_snapshot';
      this.#cache = { raw: { ...before, ...after }, state: freeze(state), stamps: this.#stamps(),
        hashes: { ...this.#cache?.hashes, ...Object.fromEntries(Object.entries(after).map(([file, value]) => [file, fileDigest(value)])) } };
      if (compact) {
        this.#recentBackups?.push(path.join(this.directory, 'backups', body.id));
        this.#pruneBackups();
      }
    } catch (cause) {
      let causeCode = cause?.code ?? cause?.name ?? 'UNEXPECTED_ERROR';
      const seen = new Set();
      for (let current = cause; current && typeof current === 'object' && !seen.has(current); current = current.cause) {
        seen.add(current);
        if (typeof current.code === 'string') causeCode = current.code;
      }
      const error = new GameError(cause instanceof GameError ? cause.code : 'STORAGE_WRITE_FAILED',
        { ...(cause instanceof GameError ? cause.details : {}), stage, operationId: body.id, causeCode }, { cause });
      // Some host loggers print only .stack, omitting Error.cause and details.
      // Keep the storage stage and OS error visible in that first log as well.
      error.message = `${error.code} | etapa=${stage} | causa=${causeCode}`;
      if (journalStarted) this.#failed = error;
      throw error;
    }
  }

  #open() {
    if (this.#opened) return;
    fs.mkdirSync(this.directory, { recursive: true, mode: 0o700 });
    this.#release = acquireWriterLock(this.directory);
    process.on('exit', this.#onExit);
    try {
      this.#recover();
      const stamps = this.#stamps();
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
      } else {
        const version = parseJSON(raw[MANIFEST], MANIFEST).schemaVersion;
        const oldFiles = filesForVersion(version);
        requireGame(FILES.filter(file => !oldFiles.includes(file)).every(file => raw[file] === null), 'DATABASE_INCOMPLETE');
        if (version < SCHEMA_VERSION) {
          let state = decode(raw, version);
          const migrations = [null, null, migrateBattlesV2, migrateProgressionV3, migrateCollectionV4,
            migrateBalanceV5, migrateEconomyV6, migrateMarketV7, migrateCombatV8, migrateContentV9, migrateCompetitiveV10, migrateCommunityV11, migrateStoryV12, migrateSpiritsV13];
          const now = this.clock();
          for (let next = version + 1; next <= SCHEMA_VERSION; next++) state = migrations[next](state, now);
          this.#commit(raw, state);
        } else {
          const state = freeze(decode(raw, SCHEMA_VERSION));
          requireGame(this.#sameStamps(stamps), 'STORAGE_CONFLICT');
          this.#cache = { raw, state, stamps, hashes: Object.fromEntries(FILES.map(file => [file, fileDigest(raw[file])])) };
        }
      }
      this.#load();
      this.#opened = true;
    } catch (error) {
      process.removeListener('exit', this.#onExit);
      try { this.#release(); }
      catch (cleanupError) { if (error instanceof Error) error.cleanupError = cleanupError; }
      this.#release = undefined;
      throw error;
    }
  }

  #enqueue(work) {
    if (this.#closing) return Promise.reject(new GameError('DATABASE_CLOSED'));
    const result = this.#tail.then(async () => {
      if (this.#failed) throw new GameError('STORAGE_RECOVERY_REQUIRED', {
        originalCode: this.#failed.code,
        causeCode: this.#failed.details.causeCode,
        stage: this.#failed.details.stage,
        operationId: this.#failed.details.operationId
      }, { cause: this.#failed });
      this.#open();
      return work();
    });
    // The queue needs completion only; do not retain the last response payload
    // (which can itself be a large collection) while the bot is idle.
    this.#tail = result.then(() => {}, () => {});
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
      const draft = { ...before };
      const changed = new Set();
      let active = true;
      const repos = createRepositories(draft, true, {
        beforeWrite(name) {
          requireGame(active, 'TRANSACTION_CLOSED');
          if (draft[name] === before[name]) draft[name] = { ...before[name], records: before[name].records.slice() };
          return draft[name].records;
        },
        onWrite: name => changed.add(name)
      });
      let result;
      try { result = await work(repos); }
      finally { active = false; }
      const copiedResult = structuredClone(result);
      const changedCollections = [...changed].filter(name => !isDeepStrictEqual(before[name].records, draft[name].records));
      if (!changedCollections.length) return copiedResult;
      // Read the injected storage clock after the operation so natural
      // millisecond differences do not turn a valid receipt into a future one.
      // The draft cannot supply or alter this trusted transition timestamp.
      // Idempotent replays do not need a new clock reading or a new commit.
      const now = this.clock();
      dailyTimestamp(now);
      for (const name of changedCollections) {
        const revision = before[name]._meta.revision + 1;
        requireGame(Number.isSafeInteger(revision), 'NUMERIC_OVERFLOW');
        draft[name]._meta = { schemaVersion: SCHEMA_VERSION, revision, updatedAt: now };
      }
      freeze(draft);
      validateDatabase(draft);
      validateTransition(before, draft, { now });
      this.#commit(raw, draft, changedCollections);
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
    this.#cache = undefined;
  }
}
