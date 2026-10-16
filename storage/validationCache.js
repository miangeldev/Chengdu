// Domain validators are synchronous and depend on the collections they read.
// A successful proof can be reused only while every dependency is unchanged
// and deeply immutable. Weak references never keep old database snapshots alive.
const proofs = new WeakMap();
const deeplyFrozen = new WeakSet();

function descriptorFlags(state, name) {
  const descriptor = Reflect.getOwnPropertyDescriptor(state, name);
  return descriptor ? `${Object.hasOwn(descriptor, 'value') ? 'value' : 'accessor'}:${descriptor.enumerable}:${descriptor.configurable}:${descriptor.writable}` : null;
}

function immutable(value) {
  if (typeof value === 'function') return false;
  if (value === null || typeof value !== 'object') return true;
  if (deeplyFrozen.has(value)) return true;
  const pending = [value], visited = new Set();
  while (pending.length) {
    const current = pending.pop();
    if (visited.has(current) || deeplyFrozen.has(current)) continue;
    const prototype = Object.getPrototypeOf(current);
    if (!Array.isArray(current) && prototype !== Object.prototype && prototype !== null) return false;
    if (!Object.isFrozen(current)) return false;
    visited.add(current);
    for (const key of Reflect.ownKeys(current)) {
      const descriptor = Object.getOwnPropertyDescriptor(current, key);
      // A frozen accessor can still depend on mutable state outside its object.
      if (!Object.hasOwn(descriptor, 'value')) return false;
      if (typeof descriptor.value === 'function') return false;
      if (descriptor.value !== null && typeof descriptor.value === 'object') pending.push(descriptor.value);
    }
  }
  for (const current of visited) deeplyFrozen.add(current);
  return true;
}

export function runValidation(validator, state, ...args) {
  if (args.some(value => value !== null && !['string', 'number', 'boolean', 'undefined'].includes(typeof value))) {
    return validator(state, ...args);
  }
  let versions = proofs.get(validator);
  if (!versions) { versions = new Map(); proofs.set(validator, versions); }
  const key = JSON.stringify(args.map(value => [typeof value,
    typeof value === 'number' ? (Object.is(value, -0) ? '-0' : String(value)) : value]));
  const previous = versions.get(key);
  if (previous && (!previous.keys || equalKeys(previous.keys, Reflect.ownKeys(state))) &&
    [...previous.dependencies].every(([name, proof]) => {
      const value = proof.observed ? state[name] : undefined;
      return proof.present === Reflect.has(state, name) && proof.own === Object.hasOwn(state, name) &&
        proof.descriptor === descriptorFlags(state, name) &&
        (!proof.observed || (proof.reference ? value !== undefined && proof.reference.deref() === value && immutable(value) : Object.is(proof.value, value)));
    })) return previous.result;

  const dependencies = new Map();
  let keys = null;
  const track = (name, read = true) => {
    const descriptor = Reflect.getOwnPropertyDescriptor(state, name);
    const observed = read || Boolean(descriptor && Object.hasOwn(descriptor, 'value'));
    const value = read ? Reflect.get(state, name) : descriptor?.value;
    // Inspecting keys or presence must not invoke accessors. Preserve a value
    // already observed by an earlier ordinary read of the same property.
    if (!read && dependencies.has(name)) return value;
    dependencies.set(name, { observed, present: Reflect.has(state, name), own: Object.hasOwn(state, name), descriptor: descriptorFlags(state, name),
      ...(value !== null && (typeof value === 'object' || typeof value === 'function') ?
        { reference: new WeakRef(value) } : { value }) });
    return value;
  };
  const tracked = new Proxy(state, {
    get: (_, name) => track(name),
    has: (_, name) => { track(name, false); return Reflect.has(state, name); },
    getOwnPropertyDescriptor: (_, name) => { track(name, false); return Reflect.getOwnPropertyDescriptor(state, name); },
    ownKeys: () => { keys = Reflect.ownKeys(state); return keys; }
  });
  const result = validator(tracked, ...args);
  // Validators return no data. Do not retain a caller-supplied result that could
  // itself reference a database snapshot and defeat the weak-reference policy.
  if (result !== undefined) return result;
  // A proof made over mutable data cannot become valid merely because that data
  // was frozen later: it could have changed between validation and freezing.
  if ([...dependencies.values()].some(proof => proof.descriptor?.startsWith('accessor:') ||
    proof.reference && !immutable(proof.reference.deref()))) return result;
  // Only the current successful proof per policy version is retained.
  versions.set(key, { dependencies, keys, result });
  return result;
}

function equalKeys(first, second) {
  return first.length === second.length && first.every((key, index) => key === second[index]);
}
