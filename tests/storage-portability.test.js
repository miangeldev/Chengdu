import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import { readRecords, register, setup } from './helpers.js';

const filesystemError = code => Object.assign(new Error(`simulated filesystem failure: ${code}`), { code });

function verifyCompactBackup(directory, id) {
  const backup = path.join(directory, 'backups', id);
  const snapshot = JSON.parse(fs.readFileSync(path.join(backup, 'snapshot.json'), 'utf8'));
  assert.equal(snapshot.version, 2);
  for (const [file, expected] of Object.entries(snapshot.files)) {
    const actual = fs.readFileSync(path.join(backup, file), 'utf8');
    assert.equal(createHash('sha256').update(actual).digest('hex'), expected, file);
    assert.notEqual(fs.statSync(path.join(backup, file)).ino, fs.statSync(path.join(directory, file)).ino, file);
  }
}

test('routine backups work when hard links are unavailable on the filesystem', async t => {
  const c = setup(t);
  const user = await register(c.game);
  const before = new Set(fs.readdirSync(path.join(c.directory, 'backups')));
  const originalLink = fs.linkSync;
  let links = 0;
  fs.linkSync = function () {
    links++;
    throw filesystemError('ENOSYS');
  };
  try {
    await c.storage.withTransaction(repos => repos.users.replace({ ...user, settings: { notifications: false } }));
  } finally { fs.linkSync = originalLink; }
  assert.ok(links > 0, 'the transaction tried to reuse unchanged backup files');
  assert.equal((await c.game.users.getUser(user.id)).settings.notifications, false);
  const added = fs.readdirSync(path.join(c.directory, 'backups')).filter(id => !before.has(id));
  assert.equal(added.length, 1);
  verifyCompactBackup(c.directory, added[0]);
});

for (const code of ['ENOSYS', 'EOPNOTSUPP', 'EINVAL']) {
  test(`routine backups fall back safely when reflink copying reports ${code}`, async t => {
    const c = setup(t);
    await c.game.validateDatabase();
    const before = new Set(fs.readdirSync(path.join(c.directory, 'backups')));
    const originalCopy = fs.copyFileSync;
    let clones = 0;
    fs.copyFileSync = function (source, target, mode, ...args) {
      if (mode & fs.constants.COPYFILE_FICLONE) {
        clones++;
        throw filesystemError(code);
      }
      return Reflect.apply(originalCopy, this, [source, target, mode, ...args]);
    };
    let user;
    try { user = await register(c.game); }
    finally { fs.copyFileSync = originalCopy; }
    assert.ok(clones > 0, 'the transaction tried reflink copying');
    assert.equal((await c.game.users.getUser(user.id)).name, user.name);
    const added = fs.readdirSync(path.join(c.directory, 'backups')).filter(id => !before.has(id));
    assert.equal(added.length, 1);
    verifyCompactBackup(c.directory, added[0]);
    await c.game.close();
    assert.equal((await c.open().game.validateDatabase()).users, 1);
  });
}

for (const code of ['ENOSPC', 'EIO']) {
  test(`backup ${code} errors remain visible and do not block reads before a journal exists`, async t => {
    const c = setup(t);
    await c.game.validateDatabase();
    const originalCopy = fs.copyFileSync;
    const cause = filesystemError(code);
    fs.copyFileSync = function (source, target, mode, ...args) {
      if (mode & fs.constants.COPYFILE_FICLONE) throw cause;
      return Reflect.apply(originalCopy, this, [source, target, mode, ...args]);
    };
    try {
      await assert.rejects(register(c.game), error => {
        assert.equal(error.code, 'STORAGE_WRITE_FAILED');
        assert.equal(error.cause, cause);
        assert.equal(error.details.causeCode, code);
        assert.match(error.stack, /etapa=backup/);
        assert.ok(error.stack.includes(`causa=${code}`));
        return true;
      });
    } finally { fs.copyFileSync = originalCopy; }
    assert.equal(fs.existsSync(path.join(c.directory, '_journal.json')), false);
    assert.deepEqual(readRecords(c.directory, 'usuarios'), []);
    assert.equal((await c.game.validateDatabase()).users, 0);
    const user = await register(c.game);
    assert.equal((await c.game.users.getUser(user.id)).name, user.name);
  });
}

test('a recovery-required error retains the original interrupted commit and its operation', async t => {
  const c = setup(t);
  const user = await register(c.game);
  await c.game.close();
  const interruption = new Error('simulated interrupted journal publication');
  const failed = c.open({ fault: stage => { if (stage === 'prepared') throw interruption; } });
  let originalError;
  await assert.rejects(failed.storage.withTransaction(repos => repos.users.replace({ ...user, settings: { notifications: false } })), error => {
    assert.equal(error.code, 'STORAGE_WRITE_FAILED');
    assert.equal(error.cause, interruption);
    originalError = error;
    return true;
  });
  const journal = JSON.parse(fs.readFileSync(path.join(c.directory, '_journal.json'), 'utf8'));
  for (let attempt = 0; attempt < 2; attempt++) {
    await assert.rejects(failed.game.users.getUser(user.id), error => {
      assert.equal(error.code, 'STORAGE_RECOVERY_REQUIRED');
      assert.equal(error.cause, originalError);
      assert.equal(error.details.originalCode, originalError.code);
      assert.equal(error.details.causeCode, originalError.details.causeCode);
      assert.equal(error.details.operationId, journal.body.id);
      assert.equal(typeof error.details.stage, 'string');
      return true;
    });
  }
  assert.equal(readRecords(c.directory, 'usuarios')[0].settings.notifications, true);
  await failed.game.close();
  assert.equal((await c.open().game.users.getUser(user.id)).settings.notifications, true);
});

test('lock cleanup failures do not replace the original database-open error', async t => {
  const c = setup(t);
  fs.writeFileSync(path.join(c.directory, 'usuarios.json'), '{broken');
  const unlink = fs.unlinkSync;
  const cleanupError = filesystemError('EACCES');
  fs.unlinkSync = function (file, ...args) {
    if (path.basename(String(file)) === '.writer.lock') throw cleanupError;
    return Reflect.apply(unlink, this, [file, ...args]);
  };
  try {
    await assert.rejects(c.game.validateDatabase(), error => {
      assert.equal(error.code, 'DATABASE_CORRUPT');
      assert.equal(error.cleanupError, cleanupError);
      return true;
    });
  } finally { fs.unlinkSync = unlink; }
});
