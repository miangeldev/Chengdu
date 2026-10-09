import { collectionRepository } from './collection.js';

export function usuariosRepository(records, writable) {
  const repository = collectionRepository(records, writable);
  return {
    ...repository,
    async getByIdentity({ provider, subject }) {
      return repository.find(u => u.identities.some(i => i.provider === provider && i.subject === subject));
    }
  };
}
