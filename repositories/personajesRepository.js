import { collectionRepository } from './collection.js';

export function personajesRepository(records, writable, options) {
  return collectionRepository(records, writable, options);
}
