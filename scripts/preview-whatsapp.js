import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGame } from '../game/createGame.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chengdu-preview-'));
let roll = 0;
const game = createGame({ directory, clock: () => '2026-10-08T20:00:00Z', randomRoll: () => roll });
const route = createCommandRouter({ game });
const samples = [];
let latest;
let messageId = 0;
const sock = { sendMessage: async (_chatId, { text }) => { latest = text; } };
const a = '521999999999@s.whatsapp.net';
const b = '521111111111@s.whatsapp.net';
const chatId = '120363111@g.us';

async function send(actor, body, title = null, mentions = []) {
  await route(sock, {
    key: { remoteJid: chatId, participant: actor, id: `preview-${++messageId}` },
    message: { extendedTextMessage: { contextInfo: { mentionedJid: mentions } } }
  }, body);
  if (title) samples.push({ title, text: latest });
}

try {
  await send(a, '.cturegistro Miguel', 'Registro');
  await send(b, '.cturegistro Lukas');
  await send(a, '.ctustarter', 'Elección de starter');
  await send(a, '.ctuficha panda', 'Comparar un personaje antes de elegir');
  await send(a, '.ctustarter panda', 'Starter reclamado');
  await send(b, '.ctustarter lobo');
  await send(a, '.ctuperfil', 'Perfil');
  await send(a, '.ctupersonajes', 'Colección');
  await send(a, '.ctuunidad PAND-000001', 'Ficha de unidad');
  await send(a, '.ctucatalogo', 'Catálogo');
  const catalogPage = await game.characters.listCharacters({ limit: 5 });
  await send(a, `.ctucatalogo ${catalogPage.nextCursor}`, 'Catálogo: siguiente página');
  await send(a, '.ctuayuda', 'Guía de comandos');
  await send(a, '.ctuequipo usar PAND-000001', 'Equipo');
  await send(b, '.ctuequipo usar LOBO-000001');
  await send(a, '.ctuficha', 'Ficha del equipo: precisión y estadísticas');
  await send(a, '.ctupelea @Lukas', 'Desafío', [b]);
  await send(b, '.ctuaceptar', 'Comienzo del combate');
  await send(a, '.ctuficha', 'Ficha detallada del combate');
  await send(a, '.ctuatacar 1', 'Error: todavía no es tu turno');
  await send(b, '.ctuatacar 2', 'Ataque y siguiente turno');
  await send(a, '.ctuatacar 2', 'Turno compacto: Panda responde');
  roll = 99;
  await send(b, '.ctuatacar 2', 'Ataque fallido dentro del turno');
  roll = 0;
  const user = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: a });
  let battle = await game.battle.getMyBattle({ userId: user.id, chatId });
  while (battle.status === 'active') {
    await send(battle.turnUserId === user.id ? a : b, '.ctuatacar 2');
    battle = await game.battle.getMyBattle({ userId: user.id, chatId });
  }
  samples.push({ title: 'Resultado del combate', text: latest });
  // Earn two more real victories in the temporary database to preview a level-up.
  for (let i = 0; i < 2; i++) {
    await send(a, '.ctupelea @Lukas', null, [b]);
    await send(b, '.ctuaceptar');
    battle = await game.battle.getMyBattle({ userId: user.id, chatId });
    while (battle.status === 'active') {
      await send(battle.turnUserId === user.id ? a : b, '.ctuatacar 2');
      battle = await game.battle.getMyBattle({ userId: user.id, chatId });
    }
  }
  samples.push({ title: 'Victoria con subida de nivel de jugador y unidad', text: latest });
  await send(a, '.ctuperfil', 'Perfil con progreso ganado');
  await send(a, '.ctubalance', 'Saldo y reglas de recompensa');
  await send(a, '.ctuhistorial', 'Historial compacto de partidas');
  await send(a, `.ctuhistorial ${battle.id}`, 'Detalle del historial: turnos y recompensa original');
  await send(a, '.ctuficha PAND-000001', 'Ficha de unidad de nivel 2: HP aumentado');
  await send(a, '.ctupelea @Lukas', null, [b]);
  await send(b, '.ctuaceptar');
  battle = await game.battle.getMyBattle({ userId: user.id, chatId });
  while (battle.status === 'active') {
    await send(battle.turnUserId === user.id ? a : b, '.ctuatacar 2');
    battle = await game.battle.getMyBattle({ userId: user.id, chatId });
  }
  samples.push({ title: 'Victoria después de alcanzar el límite de recompensas por rival', text: latest });
  const output = fileURLToPath(new URL('../docs/whatsapp-preview.md', import.meta.url));
  fs.writeFileSync(output, '# Vista previa de los mensajes de WhatsApp\n\n' +
    'Generada con `npm run preview:whatsapp`, usando jugadores ficticios y una base temporal.\n' +
    'Los asteriscos muestran el formato de negrita que aplica WhatsApp.\n\n' +
    samples.map(({ title, text }) => `## ${title}\n\n\x60\x60\x60text\n${text}\n\x60\x60\x60\n`).join('\n'));
  console.log(`${samples.length} ejemplos generados en docs/whatsapp-preview.md.`);
} finally {
  await game.close();
  fs.rmSync(directory, { recursive: true, force: true });
}
