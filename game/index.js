import { gameDatabase } from '../ChengdúData/databases.js';
import { createGame } from './createGame.js';

export { createGame } from './createGame.js';
export const game = createGame({ storage: gameDatabase });
