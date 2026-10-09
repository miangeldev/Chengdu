import { collectionRepository } from './collection.js';

export function personajesRepository(records, writable) {
  return collectionRepository(records, writable);
}
