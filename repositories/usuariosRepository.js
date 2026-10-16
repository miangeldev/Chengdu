import { collectionRepository } from './collection.js';

const IDENTITY_INDEX = Symbol('identity');
const identityKey = ({ provider, subject }) => JSON.stringify([provider, subject]);

export function usuariosRepository(records, writable, options) {
  const repository = collectionRepository(records, writable, {
    ...options,
    indexes: { [IDENTITY_INDEX]: user => user.identities.map(identityKey) }
  });
  return {
    ...repository,
    async getByIdentity({ provider, subject }) {
      return repository.findBy(IDENTITY_INDEX, identityKey({ provider, subject }));
    }
  };
}
