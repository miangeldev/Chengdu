import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { performance } from 'node:perf_hooks';
import { JsonUnitOfWork } from '../storage/unitOfWork.js';
import { COLLECTIONS, SCHEMA_VERSION, validateDatabase } from '../storage/validation.js';
import { createGame } from '../game/createGame.js';
import { seedCharacters } from '../game/characters/catalog.js';
import { seedCampaigns, seedEventAttacks, seedEventCharacters } from '../game/content/catalog.js';
import { seedAttacks } from '../game/battle/attacks.js';
import { seedPacks } from '../game/packs/catalog.js';
import { progressionBaseline } from '../game/progression/rules.js';
import { dailyPolicy, DAILY_POLICY_VERSION, nextDailyAt } from '../game/economy/dailyPolicy.js';
import { defaultPreferences, SOCIAL_POLICY_VERSION } from '../game/social/policy.js';

const options = Object.fromEntries(process.argv.slice(2).map(arg => {
  const [key, ...value] = arg.replace(/^--/, '').split('=');
  return [key, value.length ? value.join('=') : true];
}));
if (options.help) {
  console.log('Usage: node scripts/benchmark-performance.js [--users=1000] [--history=10] [--iterations=5] [--json]');
  console.log('Creates and removes an isolated synthetic database in the system temporary directory.');
  process.exit(0);
}
for (const key of Object.keys(options)) {
  if (!['users', 'history', 'iterations', 'json'].includes(key)) throw new Error(`Unknown option --${key}`);
}
const positiveInteger = (key, fallback, maximum) => {
  const value = Number(options[key] ?? fallback);
  if (!Number.isSafeInteger(value) || value < 1 || value > maximum) throw new Error(`--${key} must be an integer between 1 and ${maximum}`);
  return value;
};
const userCount = positiveInteger('users', 1000, 100_000);
const history = positiveInteger('history', 10, 1000);
const iterations = positiveInteger('iterations', 5, 100);
const iso = day => new Date(Date.UTC(2025, 0, 1) + day * 86_400_000).toISOString();
const uuid = input => {
  const hex = createHash('sha256').update(input).digest('hex').slice(0, 32);
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};

function fixture() {
  const state = Object.fromEntries(COLLECTIONS.map(name => [name, {
    _meta: { schemaVersion: SCHEMA_VERSION, revision: 0, updatedAt: null }, records: []
  }]));
  state.personajes.records = [...seedCharacters(), ...seedEventCharacters()];
  state.ataques.records = [...seedAttacks(), ...seedEventAttacks()];
  state.sobres.records = seedPacks();
  state.campanas.records = seedCampaigns();
  state.estado.records = state.personajes.records.map(character => ({
    id: `mint:${character.id}`, kind: 'mintCounter', characterId: character.id, lastSerial: 0, issuedCount: 0
  }));
  const policy = dailyPolicy();
  for (let i = 0; i < userCount; i++) {
    const user = {
      id: `USR-${uuid(`user:${i}`)}`, identities: [{ provider: 'whatsapp', subject: `${5215500000000 + i}@s.whatsapp.net` }],
      name: `Jugador ${i + 1}`, createdAt: iso(0), updatedAt: iso(history),
      economy: { coins: 0 }, progress: { level: 1, xp: 0 },
      battleStats: { wins: 0, losses: 0, matches: 0 }, team: [], settings: { notifications: true }
    };
    state.usuarios.records.push(user);
    state.estado.records.push(progressionBaseline('user', user));
    let preferences = defaultPreferences();
    for (let j = 0; j < history; j++) {
      const createdAt = iso(j), id = `DAILY-${uuid(`daily:${i}:${j}`)}`;
      const balanceBefore = user.economy.coins, balanceAfter = balanceBefore + policy.amount;
      state.diarios.records.push({ id, userId: user.id, operationKey: `daily:${i}:${j}`, createdAt,
        policyVersion: DAILY_POLICY_VERSION, amount: policy.amount, cooldownMs: policy.cooldownMs,
        nextClaimAt: nextDailyAt(createdAt), balanceBefore, balanceAfter });
      state.economia.records.push({ id: `coin:${id}`, userId: user.id, type: 'credit',
        sourceType: 'daily_reward', sourceId: id, amount: policy.amount, balanceBefore, balanceAfter, createdAt });
      user.economy.coins = balanceAfter;
      const after = { ...preferences, bio: `Perfil de prueba ${i + 1}, actualización ${j + 1}` };
      state.accionessociales.records.push({ id: `SOC-${uuid(`social:${i}:${j}`)}`, userId: user.id,
        operationKey: `social:${i}:${j}`, policyVersion: SOCIAL_POLICY_VERSION,
        createdAt, before: preferences, after, request: { bio: after.bio } });
      preferences = after;
    }
    state.perfilessociales.records.push({ id: `social:${user.id}`, userId: user.id,
      policyVersion: SOCIAL_POLICY_VERSION, preferences, createdAt: iso(0), updatedAt: iso(history - 1) });
  }
  return state;
}

const round = value => Math.round(value * 1000) / 1000;
const metrics = [];
let activeIO = null;
const originals = new Map();
for (const method of ['readFileSync', 'writeFileSync', 'copyFileSync', 'fsyncSync']) {
  originals.set(method, fs[method]);
  fs[method] = function (...args) {
    const result = Reflect.apply(originals.get(method), this, args);
    if (activeIO) {
      if (method === 'readFileSync') { activeIO.readFiles++; activeIO.readBytes += Buffer.byteLength(result); }
      if (method === 'writeFileSync') { activeIO.writeFiles++; activeIO.writeBytes += Buffer.byteLength(args[1]); }
      if (method === 'copyFileSync') { activeIO.copyFiles++; activeIO.copyBytes += fs.statSync(args[0]).size; }
      if (method === 'fsyncSync') activeIO.fsyncCalls++;
    }
    return result;
  };
}
async function measure(name, count, operation) {
  const samples = [];
  const io = { readFiles: 0, readBytes: 0, writeFiles: 0, writeBytes: 0, copyFiles: 0, copyBytes: 0, fsyncCalls: 0 };
  for (let index = 0; index < count; index++) {
    activeIO = io;
    const started = performance.now();
    try { await operation(index); } finally {
      samples.push(performance.now() - started);
      activeIO = null;
    }
  }
  samples.sort((a, b) => a - b);
  const result = { name, iterations: count, minMs: round(samples[0]),
    medianMs: round(samples[Math.floor(samples.length / 2)]),
    p95Ms: round(samples[Math.ceil(samples.length * 0.95) - 1]),
    ...Object.fromEntries(Object.entries(io).map(([key, value]) => [key, round(value / count)])) };
  metrics.push(result);
  if (!options.json) console.error(`${name}: median ${result.medianMs} ms, p95 ${result.p95Ms} ms; read ${result.readFiles} files, write ${result.writeFiles} files, fsync ${result.fsyncCalls}`);
}

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chengdu-benchmark-'));
let storage;
try {
  const state = fixture();
  const bytes = Object.values(state).reduce((sum, collection) => sum + Buffer.byteLength(JSON.stringify(collection, null, 2) + '\n'), 0);
  validateDatabase(state);
  for (const [name, collection] of Object.entries(state)) fs.writeFileSync(path.join(directory, `${name}.json`), JSON.stringify(collection, null, 2) + '\n');
  fs.writeFileSync(path.join(directory, '_database.json'), JSON.stringify({ database: 'chengdu-cards', schemaVersion: SCHEMA_VERSION }, null, 2) + '\n');
  const user = state.usuarios.records.at(-1);
  storage = new JsonUnitOfWork({ directory, clock: () => iso(history + 1) });
  const game = createGame({ storage });
  await measure('cold_user_read', 1, () => game.users.getUser(user.id));
  await measure('full_database_validation', iterations, () => validateDatabase(state));
  await measure('warm_user_read', iterations, () => game.users.getUser(user.id));
  await measure('noop_transaction', iterations, () => storage.withTransaction(repos => repos.users.get(user.id)));
  await measure('profile_command', iterations, () => game.users.getProfile(user.id));
  await measure('social_write', iterations, index => game.social.updatePreferences({
    userId: user.id, operationKey: `benchmark:${index}`, bio: `Benchmark ${index}`
  }));
  await measure('queued_20_reads', 1, () => Promise.all(Array.from({ length: 20 }, () => game.users.getUser(user.id))));
  const report = { node: process.version, users: userCount, historyPerUser: history,
    records: Object.fromEntries(Object.entries(state).filter(([, collection]) => collection.records.length).map(([name, collection]) => [name, collection.records.length])),
    fixtureBytes: bytes, fixtureValidated: true, metrics };
  console.log(JSON.stringify(report, null, 2));
} finally {
  activeIO = null;
  if (storage) await storage.close();
  for (const [method, original] of originals) fs[method] = original;
  fs.rmSync(directory, { recursive: true, force: true });
}
