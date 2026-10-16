import { collectionRepository } from './collection.js';

export function unidadesRepository(records, writable, options) {
  const repository = collectionRepository(records, writable, options);
  return { ...repository, async getByOwner(ownerId) { return repository.filterBy('ownerId', ownerId); } };
}
