import { isDeepStrictEqual } from 'node:util';
import { requireGame } from '../utils/GameError.js';
import { paginate } from '../utils/pagination.js';

// Keep indexes across repository instances and read transactions without retaining
// obsolete snapshots. Repository writes are the only supported array mutations.
const indexes = new WeakMap();
const immutableRecords = new WeakSet();
const copy = value => value === undefined ? null : structuredClone(value);
// Keep the cached representation identical to JSON persisted on disk. Freezing
// Date/Map/Set objects cannot prevent their internal state from being mutated.
// structuredClone first retains the rejection of functions and other values
// that repository writes have never accepted.
const normalize = value => JSON.parse(JSON.stringify(structuredClone(value)));

function immutable(value) {
  if (!value || typeof value !== 'object' || immutableRecords.has(value)) return value;
  immutableRecords.add(value);
  Object.freeze(value);
  for (const child of Object.values(value)) immutable(child);
  return value;
}

function indexFor(records) {
  let index = indexes.get(records);
  if (!index || index.length !== records.length) {
    index = { length: records.length, ids: null, fields: new Map() };
    indexes.set(records, index);
  }
  return index;
}

function idsFor(records) {
  const index = indexFor(records);
  if (!index.ids) {
    index.ids = new Map();
    records.forEach((record, position) => {
      if (!index.ids.has(record.id)) index.ids.set(record.id, position);
    });
  }
  return index.ids;
}

function lowerBound(positions, position) {
  let low = 0, high = positions.length;
  while (low < high) {
    const middle = (low + high) >>> 1;
    if (positions[middle] < position) low = middle + 1;
    else high = middle;
  }
  return low;
}

function addPosition(index, key, position) {
  let positions = index.values.get(key);
  if (!positions) index.values.set(key, positions = []);
  const insertion = lowerBound(positions, position);
  if (positions[insertion] !== position) positions.splice(insertion, 0, position);
}

function removePosition(index, key, position) {
  const positions = index.values.get(key);
  const offset = lowerBound(positions, position);
  if (positions[offset] === position) positions.splice(offset, 1);
  if (!positions.length) index.values.delete(key);
}

function fieldIndex(records, field, configuredIndexes) {
  const fields = indexFor(records).fields;
  if (!fields.has(field)) {
    const keys = Object.hasOwn(configuredIndexes, field) ? configuredIndexes[field] : record => [record[field]];
    const index = { keys, values: new Map() };
    records.forEach((record, position) => {
      for (const key of new Set(keys(record))) addPosition(index, key, position);
    });
    fields.set(field, index);
  }
  return fields.get(field);
}

function updateIndex(index, length, previous, record, position) {
  index.length = length;
  if (index.ids) index.ids.set(record.id, position);
  for (const field of index.fields.values()) {
    const before = new Set(previous ? field.keys(previous) : []);
    const after = new Set(field.keys(record));
    for (const key of before) if (!after.has(key)) removePosition(field, key, position);
    for (const key of after) if (!before.has(key)) addPosition(field, key, position);
  }
}

/**
 * beforeWrite supplies a shallow array copy on the first write to a collection.
 * onWrite tracks collections that actually changed. Both callbacks are internal
 * transaction hooks; callers only receive detached records.
 */
export function collectionRepository(initialRecords, writable, { beforeWrite, onWrite, indexes: configuredIndexes = {} } = {}) {
  let records = initialRecords;
  function writeRecords() {
    const next = beforeWrite ? beforeWrite() : records;
    if (next !== records) {
      // A COW fork initially contains the exact same records. Transfer its index
      // instead of rebuilding/copying a potentially huge Map on every commit.
      // The old snapshot can rebuild lazily if it is ever accessed again.
      const index = indexes.get(records);
      if (index && index.length === records.length && next.length === records.length) {
        indexes.delete(records);
        indexes.set(next, index);
      }
      records = next;
    }
    return records;
  }
  function matchingPositions(field, value) {
    // Map uses SameValueZero; preserve strict equality for the NaN edge case.
    if (Number.isNaN(value)) return [];
    return fieldIndex(records, field, configuredIndexes).values.get(value) ?? [];
  }
  function select(positions, predicate) {
    return positions.filter(position => !predicate || predicate(immutable(records[position]), position));
  }
  return {
    async get(id) {
      const position = idsFor(records).get(id);
      return position === undefined ? null : copy(records[position]);
    },
    async all() { return copy(records); },
    async count() { return records.length; },
    async at(position) { return copy(records.at(position)); },
    async indexOf(id) { return idsFor(records).get(id) ?? -1; },
    async find(predicate) {
      for (let position = 0; position < records.length; position++) {
        // Predicates cannot mutate cached state, including nested properties.
        if (predicate(immutable(records[position]), position)) return copy(records[position]);
      }
      return null;
    },
    async filter(predicate) {
      const selected = [];
      for (let position = 0; position < records.length; position++) {
        if (predicate(immutable(records[position]), position)) selected.push(records[position]);
      }
      return copy(selected);
    },
    async findBy(field, value, predicate) {
      const position = matchingPositions(field, value).find(position => !predicate || predicate(immutable(records[position]), position));
      return position === undefined ? null : copy(records[position]);
    },
    async filterBy(field, value, predicate) {
      return copy(select(matchingPositions(field, value), predicate).map(position => records[position]));
    },
    async filterIn(field, values, predicate) {
      const positions = [...new Set(values.flatMap(value => matchingPositions(field, value)))].sort((left, right) => left - right);
      return copy(select(positions, predicate).map(position => records[position]));
    },
    async countBy(field, value) { return matchingPositions(field, value).length; },
    async distinct(field) { return copy([...fieldIndex(records, field, configuredIndexes).values.keys()]); },
    async lastBy(field, value) {
      const position = matchingPositions(field, value).at(-1);
      return position === undefined ? null : copy(records[position]);
    },
    async pageBy(field, value, options, scope, key) {
      const positions = matchingPositions(field, value);
      const selected = positions.map(position => records[position]);
      const keys = key ? new Map(positions.map((position, ordinal) => [records[position], key(immutable(records[position]), ordinal)])) : null;
      return paginate(selected, options, scope, keys ? record => keys.get(record) : undefined);
    },
    async insert(record) {
      requireGame(writable, 'READ_ONLY_TRANSACTION');
      requireGame(!idsFor(records).has(record.id), 'DUPLICATE_RECORD');
      const stored = normalize(record);
      writeRecords();
      const position = records.length;
      const index = indexFor(records);
      records.push(stored);
      // Publish index changes only after a successful array mutation. Frozen
      // snapshots can reject the write without corrupting their cached index.
      updateIndex(index, records.length, null, stored, position);
      onWrite?.();
      return copy(stored);
    },
    async replace(record) {
      requireGame(writable, 'READ_ONLY_TRANSACTION');
      const position = idsFor(records).get(record.id);
      requireGame(position !== undefined, 'RECORD_NOT_FOUND');
      const stored = normalize(record);
      if (isDeepStrictEqual(records[position], stored)) return copy(stored);
      writeRecords();
      const previous = records[position];
      const index = indexFor(records);
      records[position] = stored;
      updateIndex(index, records.length, previous, stored, position);
      onWrite?.();
      return copy(stored);
    }
  };
}
