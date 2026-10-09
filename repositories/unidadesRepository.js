import { collectionRepository } from './collection.js';

export function unidadesRepository(records, writable) {
  const repository = collectionRepository(records, writable);
  return { ...repository, async getByOwner(ownerId) { return repository.filter(u => u.ownerId === ownerId); } };
}
