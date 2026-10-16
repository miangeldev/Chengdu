import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { register, setup } from './helpers.js';

test('non-JSON values cannot leave a mutable cached snapshot different from durable JSON', async t => {
  const c = setup(t);
  const user = await register(c.game);
  let accepted = false;
  try {
    await c.storage.withTransaction(repos => repos.users.replace({
      ...user, extraDate: new Date(0), extraMap: new Map([['valid', true]])
    }));
    accepted = true;
  } catch (error) {
    assert.ok(error instanceof Error);
  }
  if (accepted) {
    await c.storage.withRead(repos => repos.users.find(row => {
      if (row.extraDate instanceof Date) row.extraDate.setTime(1);
      if (row.extraMap instanceof Map) row.extraMap.set('valid', false);
      return false;
    }));
  }
  const cached = await c.game.users.getUser(user.id);
  const durable = JSON.parse(fs.readFileSync(path.join(c.directory, 'usuarios.json'), 'utf8')).records[0];
  assert.deepEqual(cached, durable);
});

test('migration backup preserves its captured source and refuses an external edit during backup', async t => {
  const c = setup(t);
  const file = path.join(c.directory, 'usuarios.json');
  const captured = '[]', edited = '[] ';
  fs.writeFileSync(file, captured);
  const root = path.join(c.directory, 'backups');
  const mkdir = fs.mkdirSync;
  let changed = false;
  fs.mkdirSync = function (directory, ...args) {
    const result = Reflect.apply(mkdir, this, [directory, ...args]);
    if (path.dirname(String(directory)) === root && !changed) {
      changed = true;
      fs.writeFileSync(file, edited);
    }
    return result;
  };
  try {
    await assert.rejects(c.game.validateDatabase(), { code: 'STORAGE_CONFLICT' });
  } finally { fs.mkdirSync = mkdir; }
  assert.equal(changed, true);
  assert.equal(fs.readFileSync(file, 'utf8'), edited);
  for (const id of fs.readdirSync(root)) {
    const backup = path.join(root, id);
    const snapshot = JSON.parse(fs.readFileSync(path.join(backup, 'snapshot.json'), 'utf8'));
    assert.equal(fs.readFileSync(path.join(backup, 'usuarios.json'), 'utf8'), snapshot.files['usuarios.json']);
    assert.equal(snapshot.files['usuarios.json'], captured);
  }
});
