import { JsonUnitOfWork } from '../storage/unitOfWork.js';

// One shared writer for every command. No files are created until the first call.
export const gameDatabase = new JsonUnitOfWork();
