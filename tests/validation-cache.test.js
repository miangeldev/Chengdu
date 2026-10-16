import test from 'node:test';
import assert from 'node:assert/strict';
import { runValidation } from '../storage/validationCache.js';

const freeze = value => {
  if (value && typeof value === 'object') {
    for (const child of Object.values(value)) freeze(child);
    Object.freeze(value);
  }
  return value;
};

test('validation proofs reuse unchanged immutable dependencies and invalidate related changes', () => {
  let calls = 0;
  const validate = (state, version) => { calls++; assert.equal(state.used.records[0].version, version); };
  const used = freeze({ records: [{ version: 1 }] });
  runValidation(validate, { used, unrelated: { records: [] } }, 1);
  runValidation(validate, { used, unrelated: { records: [{ id: 'new' }] } }, 1);
  assert.equal(calls, 1);
  assert.throws(() => runValidation(validate, { used: freeze({ records: [{ version: 2 }] }) }, 1));
  assert.equal(calls, 2);
  runValidation(validate, { used: freeze({ records: [{ version: 2 }] }) }, 2);
  assert.equal(calls, 3);
});

test('mutable records and shallow freezes never reuse validation proofs', () => {
  let calls = 0;
  const validate = state => { calls++; assert.equal(state.used.records[0].valid, true); };
  const state = { used: Object.freeze({ records: Object.freeze([{ valid: true }]) }) };
  runValidation(validate, state);
  runValidation(validate, state);
  assert.equal(calls, 2);
  state.used.records[0].valid = false;
  assert.throws(() => runValidation(validate, state));
  assert.equal(calls, 3);
});

test('failed validations do not cache success and optional dependencies invalidate proofs', () => {
  let calls = 0;
  const validate = state => { calls++; assert.equal(state.optional?.records.length ?? 0, 0); };
  runValidation(validate, {});
  assert.throws(() => runValidation(validate, { optional: freeze({ records: [{ id: 'invalid' }] }) }));
  assert.throws(() => runValidation(validate, { optional: freeze({ records: [{ id: 'invalid' }] }) }));
  assert.equal(calls, 3);
});

test('frozen accessors cannot hide mutable validation dependencies', () => {
  let valid = true, calls = 0;
  const validate = state => { calls++; assert.equal(state.used.valid, true); };
  const used = Object.freeze({ get valid() { return valid; } });
  runValidation(validate, { used });
  valid = false;
  assert.throws(() => runValidation(validate, { used }));
  assert.equal(calls, 2);
});

test('presence checks and argument types remain distinct in validation proofs', () => {
  let calls = 0;
  const validate = (state, expected) => { calls++; assert.equal(Object.hasOwn(state, 'optional'), expected); };
  runValidation(validate, {}, false);
  assert.throws(() => runValidation(validate, { optional: undefined }, false));
  assert.equal(calls, 2);
  const checkVersion = (_, expected) => { if (expected !== undefined) throw new Error('unexpected policy'); };
  runValidation(checkVersion, {}, undefined);
  assert.throws(() => runValidation(checkVersion, {}, null));
});

test('freezing a Date does not make its internal state an immutable proof', () => {
  const date = Object.freeze(new Date(0));
  const validate = state => assert.equal(state.used.date.getTime(), 0);
  const used = Object.freeze({ date });
  runValidation(validate, { used });
  date.setTime(1);
  assert.throws(() => runValidation(validate, { used }));
});

test('freezing a dependency after mutation cannot certify an earlier mutable validation', () => {
  let calls = 0;
  const validate = state => { calls++; assert.equal(state.used.records[0].valid, true); };
  const used = { records: [{ valid: true }] };
  runValidation(validate, { used });
  used.records[0].valid = false;
  freeze(used);
  assert.throws(() => runValidation(validate, { used }));
  assert.equal(calls, 2);
});

test('enumerability changes invalidate proofs based on Object.keys', () => {
  const state = { used: freeze({ records: [] }) };
  const validate = value => assert.equal(Object.keys(value).length, 1);
  runValidation(validate, state);
  Object.defineProperty(state, 'used', { enumerable: false });
  assert.throws(() => runValidation(validate, state));
});

test('top-level getters are never stored as immutable dependencies', () => {
  let calls = 0;
  const used = freeze({ records: [] });
  const state = Object.freeze({ get used() { return used; } });
  const validate = value => { calls++; assert.equal(value.used.records.length, 0); };
  runValidation(validate, state);
  runValidation(validate, state);
  assert.equal(calls, 2);
});

test('key and presence tracking do not invoke getters', () => {
  let reads = 0;
  const state = { get used() { reads++; return freeze({ records: [] }); } };
  const validate = value => {
    assert.equal('used' in value, true);
    assert.equal(Object.hasOwn(value, 'used'), true);
    assert.deepEqual(Object.keys(value), ['used']);
  };
  runValidation(validate, state);
  runValidation(validate, state);
  assert.equal(reads, 0);
});
