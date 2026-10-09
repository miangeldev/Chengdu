import fs from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import { GameError } from '../utils/GameError.js';

export function syncDirectory(directory) {
  const fd = fs.openSync(directory, 'r');
  try { fs.fsyncSync(fd); } finally { fs.closeSync(fd); }
}

export function readText(file) {
  try { return fs.readFileSync(file, 'utf8'); } catch (cause) {
    if (cause.code === 'ENOENT') return null;
    throw new GameError('STORAGE_READ_FAILED', { file }, { cause });
  }
}

export function parseJSON(text, file) {
  try { return JSON.parse(text); } catch (cause) {
    throw new GameError('DATABASE_CORRUPT', { file }, { cause });
  }
}

export function atomicWrite(file, text) {
  const directory = path.dirname(file);
  const temporary = path.join(directory, `.${path.basename(file)}.${randomUUID()}.tmp`);
  let fd;
  try {
    fd = fs.openSync(temporary, 'wx', 0o600);
    fs.writeFileSync(fd, text, 'utf8');
    fs.fsyncSync(fd);
    fs.closeSync(fd);
    fd = undefined;
    fs.renameSync(temporary, file);
    syncDirectory(directory);
  } catch (cause) {
    throw new GameError('STORAGE_WRITE_FAILED', { file }, { cause });
  } finally {
    if (fd !== undefined) fs.closeSync(fd);
    if (fs.existsSync(temporary)) fs.unlinkSync(temporary);
  }
}
