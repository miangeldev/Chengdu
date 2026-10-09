import { DATA_DIR } from '../CTU-database.js';
import { createGame } from '../game/createGame.js';
import { unlockStaleWriter } from '../storage/writerLock.js';

const [action, directory = DATA_DIR] = process.argv.slice(2);
let game;
try {
  if (action === 'unlock') {
    console.log(unlockStaleWriter(directory) ? 'Lock de un proceso terminado retirado.' : 'No existe lock.');
  } else if (action === 'validate') {
    game = createGame({ directory });
    console.log(JSON.stringify(await game.validateDatabase(), null, 2));
  } else {
    console.error('Uso: node scripts/database.js validate|unlock [directorio]');
    process.exitCode = 1;
  }
} catch (error) {
  console.error(`No se completó la operación: ${error.code ?? error.message}`);
  process.exitCode = 1;
} finally {
  await game?.close();
}
