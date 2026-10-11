import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGame } from '../game/createGame.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chengdu-preview-'));
let roll = 0;
let currentTime = '2026-10-11T20:00:00Z';
const game = createGame({ directory, clock: () => currentTime, randomRoll: () => roll, randomDropInt: upper => upper - 1 });
const route = createCommandRouter({ game });
const samples = [];
let latest;
let messageId = 0;
const sock = { sendMessage: async (_chatId, { text }) => { latest = text; } };
const a = '521999999999@s.whatsapp.net';
const b = '521111111111@s.whatsapp.net';
const chatId = '120363111@g.us';

async function send(actor, body, title = null, mentions = [], replayId = null) {
  latest = null;
  const handled = await route(sock, {
    key: { remoteJid: chatId, participant: actor, id: replayId ?? `preview-${++messageId}` },
    message: { extendedTextMessage: { contextInfo: { mentionedJid: mentions } } }
  }, body);
  if (!handled || typeof latest !== 'string' || latest.includes('No pude confirmar')) {
    throw new Error(`No se pudo generar la vista previa de ${body}.`);
  }
  if (title) samples.push({ title, text: latest });
}

try {
  await send(a, '.cturegistro Miguel', 'Registro');
  await send(b, '.cturegistro Lukas');
  const dailyMessageId = 'preview-daily-first';
  await send(a, '.ctudiario', 'Diario: primera recompensa, sin XP', [], dailyMessageId);
  await send(a, '.ctudiario', 'Repetir el diario: recibo original, sin otro crédito', [], dailyMessageId);
  await send(a, '.ctudiario', 'Diario: espera hasta cumplir 24 horas');
  await send(a, '.ctutienda', 'Tienda: costes y disponibilidad');
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
  // Continue real play after the reward window expires, without touching account balances.
  currentTime = '2026-10-13T20:00:00Z';
  for (let i = 0; i < 2; i++) {
    await send(a, '.ctupelea @Lukas', null, [b]);
    await send(b, '.ctuaceptar');
    battle = await game.battle.getMyBattle({ userId: user.id, chatId });
    while (battle.status === 'active') {
      await send(battle.turnUserId === user.id ? a : b, '.ctuatacar 2');
      battle = await game.battle.getMyBattle({ userId: user.id, chatId });
    }
  }
  await send(a, '.ctudiario', 'Diario: siguiente recompensa después del plazo');
  await send(a, '.ctusobres', 'Sobres: precio y probabilidades actuales');
  const openingMessageId = 'preview-pack-purchase';
  await send(a, '.ctuabrir basico', 'Apertura: personaje, variante y rasgos', [], openingMessageId);
  const collection = await game.units.getUserUnits(user.id);
  const obtained = collection.items.find(unit => unit.origin.type === 'pack');
  if (!obtained) throw new Error('La vista previa no obtuvo una unidad del sobre.');
  await send(a, '.ctupersonajes', 'Colección: variantes y rasgos a simple vista');
  await send(a, `.ctuunidad ${obtained.id}`, 'Unidad obtenida: propietario y procedencia del sobre');
  await send(a, `.ctuficha ${obtained.id}`, 'Ficha: efectos de los rasgos y estadísticas efectivas');
  await send(a, '.ctuabrir basico', 'Repetir el mismo mensaje: recibo original, sin otro cobro', [], openingMessageId);
  await send(a, '.ctubalance', 'Saldo después de abrir un sobre');
  await send(a, '.ctudiario', 'Repetir un diario antiguo: conserva su saldo original', [], dailyMessageId);
  await send(a, '.ctumovimientos', 'Movimientos: ingresos y gastos propios');
  const movementPage = await game.economy.getMovements(user.id, { limit: 5 });
  if (movementPage.nextCursor) await send(a, `.ctumovimientos ${movementPage.nextCursor}`, 'Movimientos: siguiente página');
  await send(a, '.ctuabrir basico', 'Error: saldo insuficiente para otro sobre');
  await send(a, '.ctumercado', 'Mercado: aún sin anuncios');
  const listingMessageId = 'preview-list-panda';
  await send(a, '.ctuvender PAND-000001 100', 'Publicar: precio, comisión y vencimiento', [], listingMessageId);
  const pandaListing = (await game.market.listListings({ sellerId: user.id })).items[0];
  await send(a, '.ctumercado', 'Mercado: decidir a simple vista');
  await send(b, '.ctumercado comun', 'Mercado: filtrar por rareza');
  await send(b, '.ctumercado precio', 'Mercado: ordenar por precio');
  await send(a, '.ctumercado mios', 'Mis anuncios: neto que recibirá el vendedor');
  await send(b, `.ctumercado ver ${pandaListing.id}`, 'Anuncio: ficha congelada y acción de compra');
  await send(a, '.ctupersonajes', 'Colección: unidad bloqueada en el mercado');
  await send(a, '.ctuequipo usar PAND-000001', 'Error: una unidad en venta no puede combatir');
  await send(b, `.ctucomprar ${pandaListing.id}`, 'Error: el comprador necesita saldo');
  await send(b, '.ctudiario');
  const purchaseMessageId = 'preview-purchase-panda';
  await send(b, `.ctucomprar ${pandaListing.id}`, 'Compra: pago y equipo bajo demanda', [], purchaseMessageId);
  await send(a, '.ctuventas', 'Ventas: precio neto y comisión del vendedor');
  await send(b, '.ctuventas', 'Compras: recibo personal sin saldo de la contraparte');
  await send(b, '.ctupropiedad PAND-000001', 'Propiedad: nacimiento y transferencia');
  await send(b, '.ctupersonajes', 'Colección del comprador: progreso conservado');
  await send(a, '.ctustarter panda', 'Starter antiguo: indica que cambió de propietario');
  await send(a, `.ctuhistorial ${battle.id}`, 'Combate histórico: sigue perteneciendo a sus jugadores tras la venta');
  await send(b, '.ctuequipo usar PAND-000001', 'Preparar una unidad comprada');
  await send(a, '.ctuvender PAND-000001 100', 'Repetir publicación: conserva el anuncio ya vendido', [], listingMessageId);
  await send(b, '.ctuvender PAND-000001 75');
  const resale = (await game.market.listListings()).items[0];
  await send(a, `.ctucomprar ${resale.id}`, 'Reventa: conserva la identidad y el progreso de la unidad');
  await send(b, `.ctucomprar ${pandaListing.id}`, 'Compra antigua: recibo original después de revender', [], purchaseMessageId);
  await send(a, '.ctupropiedad PAND-000001', 'Propiedad: cadena de dos ventas');
  await send(a, `.ctuvender ${obtained.id} 20`);
  const packListing = (await game.market.listListings()).items[0];
  await send(b, `.ctucomprar ${packListing.id}`);
  await send(a, '.ctuabrir basico', 'Apertura antigua: recibo original después de vender la unidad', [], openingMessageId);
  await send(b, `.ctuvender ${obtained.id} 60`);
  const withdrawn = (await game.market.listListings()).items[0];
  const cancelMessageId = 'preview-withdraw';
  await send(b, `.cturetirar ${withdrawn.id}`, 'Retirar anuncio: libera la unidad sin comisión', [], cancelMessageId);
  await send(b, `.cturetirar ${withdrawn.id}`, 'Repetir retirada: conserva la cancelación', [], cancelMessageId);
  await send(a, `.ctucomprar ${withdrawn.id}`, 'Error: el anuncio ya fue retirado');
  await send(a, '.ctumovimientos', 'Movimientos: compras y ventas junto a diarios y combates');
  await send(b, '.ctuvender LOBO-000001 20');
  const expiring = (await game.market.listListings()).items[0];
  currentTime = expiring.expiresAt;
  await send(a, `.ctucomprar ${expiring.id}`, 'Vencimiento: rechaza la compra y libera el bloqueo');
  await send(b, `.ctumercado ver ${expiring.id}`, 'Anuncio vencido: conserva la ficha histórica');
  await send(b, '.ctuequipo usar LOBO-000001', 'Equipo: unidad disponible después del vencimiento');
  if (!(await game.validateDatabase()).valid) throw new Error('La base temporal de la vista previa no es válida.');
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
