import { requireGame } from '../utils/GameError.js';

export function collectionRepository(records, writable) {
  const copy = value => value === undefined ? null : structuredClone(value);
  return {
    async get(id) { return copy(records.find(r => r.id === id)); },
    async all() { return copy(records); },
    async find(predicate) { return copy(records.find(predicate)); },
    async filter(predicate) { return copy(records.filter(predicate)); },
    async insert(record) {
      requireGame(writable, 'READ_ONLY_TRANSACTION');
      requireGame(!records.some(r => r.id === record.id), 'DUPLICATE_RECORD');
      records.push(structuredClone(record));
      return copy(record);
    },
    async replace(record) {
      requireGame(writable, 'READ_ONLY_TRANSACTION');
      const index = records.findIndex(r => r.id === record.id);
      requireGame(index !== -1, 'RECORD_NOT_FOUND');
      records[index] = structuredClone(record);
      return copy(record);
    }
  };
}
