import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { parseJSON, readText, syncDirectory } from './files.js';
import { GameError, requireGame } from '../utils/GameError.js';

export const LOCK_FILE = '.writer.lock';

export function acquireWriterLock(directory) {
  const file = path.join(directory, LOCK_FILE);
  const owner = { pid: process.pid, token: randomUUID(), createdAt: new Date().toISOString() };
  let fd;
  try {
    fd = fs.openSync(file, 'wx', 0o600);
  } catch (cause) {
    throw new GameError(cause.code === 'EEXIST' ? 'DATABASE_LOCKED' : 'STORAGE_WRITE_FAILED', { file }, { cause });
  }
  try {
    fs.writeFileSync(fd, JSON.stringify(owner));
    fs.fsyncSync(fd);
    syncDirectory(directory);
  } catch (cause) {
    fs.unlinkSync(file);
    throw new GameError('STORAGE_WRITE_FAILED', { file }, { cause });
  } finally { fs.closeSync(fd); }
  return () => {
    const current = readText(file);
    if (current !== null && parseJSON(current, file).token === owner.token) {
      fs.unlinkSync(file);
      syncDirectory(directory);
    }
  };
}

// Run with all bot instances stopped. Never reclaim a lock belonging to a live PID.
export function unlockStaleWriter(directory) {
  const file = path.join(path.resolve(directory), LOCK_FILE);
  const original = readText(file);
  if (original === null) return false;
  const owner = parseJSON(original, file);
  requireGame(Number.isSafeInteger(owner.pid) && owner.pid > 0 && typeof owner.token === 'string', 'DATABASE_CORRUPT', { file });
  try {
    process.kill(owner.pid, 0);
    throw new GameError('DATABASE_LOCKED', { file, pid: owner.pid });
  } catch (error) {
    if (error.code !== 'ESRCH') throw error instanceof GameError ? error : new GameError('DATABASE_LOCKED', { file }, { cause: error });
  }
  requireGame(readText(file) === original, 'DATABASE_LOCKED');
  fs.unlinkSync(file);
  syncDirectory(path.dirname(file));
  return true;
}
