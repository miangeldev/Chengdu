import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createGame } from '../game/createGame.js';
import { createCommandRouter } from '../interfaces/whatsapp/index.js';

const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chengdu-preview-'));
let roll = 0;
let currentTime = '2026-10-11T20:00:00Z';
let contentRoll = null;
const game = createGame({ directory, clock: () => currentTime, randomRoll: () => roll, randomDropInt: upper => contentRoll ? contentRoll(upper) : upper - 1 });
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
  await send(a, '.ctucatalogo 2', 'Catálogo: siguiente página con un número corto');
  await send(a, '.ctucatalogo 1', 'Catálogo: volver a la primera página');
  await send(a, '.ctuayuda', 'Guía de comandos');
  await send(a, '.ctuequipo usar PAND-000001', 'Equipo');
  await send(b, '.ctuequipo usar LOBO-000001');
  await send(a, '.ctuficha', 'Ficha del equipo: precisión y estadísticas');
  await send(a, '.ctupelea @Lukas clasico', 'Desafío', [b]);
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
    await send(a, '.ctupelea @Lukas clasico', null, [b]);
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
  await send(a, '.ctupelea @Lukas clasico', null, [b]);
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
    await send(a, '.ctupelea @Lukas clasico', null, [b]);
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
  const movementPage = await game.economy.getMovements(user.id, { limit: 5, page: 1 });
  if (movementPage.nextPage) {
    await send(a, `.ctumovimientos ${movementPage.nextPage}`, 'Movimientos: siguiente página');
    await send(a, '.ctumovimientos 1', 'Movimientos: volver a la primera página');
  }
  await send(a, '.ctuabrir basico', 'Error: saldo insuficiente para otro sobre');
  await send(a, '.ctumercado', 'Mercado: aún sin anuncios');
  const listingMessageId = 'preview-list-panda';
  await send(a, '.ctuvender PAND-000001 100', 'Publicar: precio, comisión y vencimiento', [], listingMessageId);
  const pandaListing = (await game.market.listListings({ sellerId: user.id })).items[0];
  await send(b, '.ctumercado', 'Mercado: decidir y comprar a simple vista');
  await send(b, '.ctumercado comun', 'Mercado: filtrar por rareza');
  await send(b, '.ctumercado precio', 'Mercado: ordenar por precio');
  await send(a, '.ctumercado mios', 'Mis anuncios: neto que recibirá el vendedor');
  await send(b, `.ctumercado ${pandaListing.code}`, 'Anuncio: ficha congelada y acción de compra');
  await send(a, '.ctupersonajes', 'Colección: unidad bloqueada en el mercado');
  await send(a, '.ctuequipo usar PAND-000001', 'Error: una unidad en venta no puede combatir');
  await send(b, `.ctucomprar ${pandaListing.code}`, 'Error: el comprador necesita saldo');
  await send(b, '.ctudiario');
  const purchaseMessageId = 'preview-purchase-panda';
  await send(b, `.ctucomprar ${pandaListing.code}`, 'Compra: pago y equipo bajo demanda', [], purchaseMessageId);
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
  await send(a, `.ctucomprar ${resale.code}`, 'Reventa: conserva la identidad y el progreso de la unidad');
  await send(b, `.ctucomprar ${pandaListing.code}`, 'Compra antigua: recibo original después de revender', [], purchaseMessageId);
  await send(a, '.ctupropiedad PAND-000001', 'Propiedad: cadena de dos ventas');
  await send(a, `.ctuvender ${obtained.id} 20`);
  const packListing = (await game.market.listListings()).items[0];
  await send(b, `.ctucomprar ${packListing.code}`);
  await send(a, '.ctuabrir basico', 'Apertura antigua: recibo original después de vender la unidad', [], openingMessageId);
  await send(b, `.ctuvender ${obtained.id} 60`);
  const withdrawn = (await game.market.listListings()).items[0];
  const cancelMessageId = 'preview-withdraw';
  await send(b, `.cturetirar ${withdrawn.code}`, 'Retirar anuncio: libera la unidad sin comisión', [], cancelMessageId);
  await send(b, `.cturetirar ${withdrawn.code}`, 'Repetir retirada: conserva la cancelación', [], cancelMessageId);
  await send(a, `.ctucomprar ${withdrawn.code}`, 'Error: el anuncio ya fue retirado');
  await send(a, '.ctumovimientos', 'Movimientos: compras y ventas junto a diarios y combates');
  await send(b, '.ctuvender LOBO-000001 20');
  const expiring = (await game.market.listListings()).items[0];
  currentTime = expiring.expiresAt;
  await send(a, `.ctucomprar ${expiring.code}`, 'Vencimiento: rechaza la compra y libera el bloqueo');
  await send(b, `.ctumercado ${expiring.code}`, 'Anuncio vencido: conserva la ficha histórica');
  await send(b, '.ctuequipo usar LOBO-000001', 'Equipo: unidad disponible después del vencimiento');
  // Expand the same temporary collection through the trusted mint service.
  // These preview-only units never enter the project's database.
  const otherUser = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: b });
  const added = {};
  for (const [ownerId, characterId] of [
    [user.id, 'mago_carmesi'], [user.id, 'monje_celestial'],
    [otherUser.id, 'guardian_jade'], [otherUser.id, 'bruja_lunar']
  ]) {
    added[characterId] = await game.units.createUnit({ ownerId, characterId,
      origin: { type: 'admin', sourceId: 'temporary-whatsapp-preview' }, operationKey: `preview-advanced:${characterId}` });
  }
  const mage = added.mago_carmesi, monk = added.monje_celestial;
  const jade = added.guardian_jade, witch = added.bruja_lunar;
  await send(a, `.ctuequipo usar PAND-000001 ${mage.id} ${monk.id}`, 'Equipo avanzado: tres unidades y orden de entrada');
  await send(a, '.ctuequipo ordenar 2 1 3', 'Equipo: reordenar con slots cortos');
  await send(a, '.ctuequipo ordenar 2 1 3');
  await send(b, `.ctuequipo usar LOBO-000001 ${jade.id} ${witch.id}`);
  await send(a, '.ctuficha', 'Ficha avanzada del equipo: elementos, pasivas y cooldowns');
  await send(a, '.ctupelea @Lukas 3v3', 'Desafío avanzado: formato 3v3', [b]);
  await send(b, '.ctuaceptar', 'Inicio 3v3: pasivas, activos y reservas');
  await send(b, `.ctuvender ${jade.id} 20`, 'Error: las reservas también están bloqueadas en combate');
  const switchMessageId = 'preview-advanced-switch';
  await send(b, '.ctucambiar 2', 'Cambio voluntario: consume turno y activa la pasiva', [], switchMessageId);
  await send(b, '.ctucambiar 2', 'Repetir cambio: muestra el estado sin volver a actuar', [], switchMessageId);
  await send(a, '.ctucambiar 2', 'Mago: ataque aumentado al entrar');
  await send(b, '.ctucambiar 3', 'Bruja: veneno de la pasiva dentro del mismo turno');
  await send(a, '.ctuatacar 2', 'Fuego contra agua: resistencia, quemadura y veneno visibles');
  await send(b, '.ctuatacar 2', 'Agua contra fuego: ventaja elemental y veneno');
  await send(a, '.ctuatacar 2', 'Error: una habilidad en cooldown no consume el turno');
  await send(a, '.ctuatacar 1', 'Ataque básico: permite avanzar mientras se recupera la habilidad');
  await send(b, '.ctuatacar 1', 'KO y relevo automático: entra la siguiente unidad viva');
  await send(a, '.ctuatacar 2', 'Ataque con escudo y victoria sobre una unidad, sin cerrar el equipo');
  await send(b, '.ctucambiar 2');
  await send(a, '.ctuatacar 1', 'Escudo: daño bloqueado dentro de la respuesta');
  await send(b, '.ctuatacar 2', 'Guardián: aplica aturdimiento con su habilidad');
  await send(a, '.ctuatacar 1', 'Aturdimiento: un turno omitido y estado actualizado');
  await send(b, '.ctuatacar 1');
  await send(a, '.ctucambiar 3', 'Monje: entrada con regeneración');
  await send(b, '.ctuatacar 1');
  await send(a, '.ctuatacar 1', 'Regeneración: recuperación al comienzo del turno');
  await send(a, `.ctuficha ${mage.id}`, 'Ficha de una unidad de banca derrotada: snapshot del combate');
  battle = await game.battle.getMyBattle({ userId: user.id, chatId });
  while (battle.status === 'active') {
    await send(battle.turnUserId === user.id ? a : b, '.ctuatacar 1');
    battle = await game.battle.getMyBattle({ userId: user.id, chatId });
  }
  samples.push({ title: 'Final 3v3: monedas únicas y XP repartida entre participantes', text: latest });
  await send(a, `.ctuhistorial ${battle.id}`, 'Historial avanzado: cambios, efectos y relevo de cada turno');
  await send(a, '.ctuequipo', 'Equipo después del combate: seis unidades desbloqueadas');
  await send(a, '.ctuequipo usar PAND-000001');
  await send(b, '.ctuequipo usar LOBO-000001');
  await send(a, '.ctupelea @Lukas', 'Desafío sin modo: combate avanzado 1v1 entre starters', [b]);
  await send(b, '.ctuaceptar', '1v1 avanzado: elementos y pasivas también con una unidad');
  await send(a, '.cturendirse', 'Rendición temprana avanzada: cierra sin premios');
  currentTime = new Date(Date.parse(currentTime) + 2 * 86_400_000).toISOString();
  for (let index = 0; index < 2; index++) {
    await send(a, '.ctupelea @Lukas clasico', null, [b]);
    await send(b, '.ctuaceptar');
    battle = await game.battle.getMyBattle({ userId: user.id, chatId });
    while (battle.status === 'active') {
      await send(battle.turnUserId === user.id ? a : b, '.ctuatacar 2');
      battle = await game.battle.getMyBattle({ userId: user.id, chatId });
    }
  }
  await send(a, '.ctumisiones', 'Misiones: progreso de hoy y comandos cortos para cobrar');
  await send(a, '.ctumisiones reclamar 1', 'Misión cumplida: monedas, XP y ticket de captura', [], 'preview-mission');
  await send(a, '.ctumisiones reclamar 1', 'Misión repetida: recibo original sin otro premio', [], 'preview-mission');
  await send(a, '.ctulogros', 'Logros: historia permanente, títulos e insignias');
  await send(a, '.ctulogros reclamar L1', 'Primera sangre: premio único y título');
  await send(a, '.ctuinventario', 'Inventario: tickets y títulos desbloqueados');
  await send(a, '.ctueventos', 'Calendario: festival con fechas y personajes exclusivos');
  await send(a, '.ctuevento faroles', 'Festival: supply global y bienvenida');
  await send(a, '.ctuevento faroles reclamar', 'Bienvenida del festival: una vez por jugador');
  await send(b, '.ctuevento faroles reclamar');
  contentRoll = upper => upper === 100 ? 0 : upper - 1;
  await send(a, '.ctuexplorar', 'Aparición: un compañero exclusivo y captura por un ticket');
  const apparition = await game.encounters.getSpawn({ chatId });
  if (!apparition) throw new Error('No apareció un personaje en la ventana de ejemplo.');
  await send(a, `.ctucapturar ${apparition.code}`, 'Captura: emisión única y procedencia del festival', [], 'preview-capture');
  await send(a, `.ctucapturar ${apparition.code}`, 'Captura repetida: no consume otro ticket', [], 'preview-capture');
  await send(b, `.ctucapturar ${apparition.code}`, 'Captura perdida: la aparición ya tiene propietario');
  const eventUnit = (await game.units.getUserUnits(user.id, { limit: 25 })).items.find(unit => unit.origin.sourceId === apparition.id);
  await send(a, `.ctuficha ${eventUnit.id}`, 'Personaje del festival: ataques y pasiva propios');
  await send(a, `.ctuunidad ${eventUnit.id}`, 'Procedencia: el festival permanece en la unidad');
  await send(a, `.ctuequipo usar ${eventUnit.id}`);
  await send(a, '.ctuboss', 'Boss cooperativo: vida compartida y ataques disponibles');
  let boss = await game.encounters.getBoss({ userId: user.id });
  await send(a, `.ctubossatacar 2 ${boss.code}`, 'Boss: golpe crítico dentro del mismo mensaje', [], 'preview-boss-first');
  await send(a, `.ctubossatacar 2 ${boss.code}`, 'Boss: un reintento no duplica daño', [], 'preview-boss-first');
  await send(a, `.ctubossatacar 1 ${boss.code}`, 'Boss: cooldown compartido entre grupos');
  boss = await game.encounters.getBoss({ userId: user.id });
  let bossTurn = 0;
  while (boss.status === 'active') {
    currentTime = new Date(Date.parse(currentTime) + 30_000).toISOString();
    await send(bossTurn++ % 2 ? a : b, `.ctubossatacar 2 ${boss.code}`);
    boss = await game.encounters.getBoss({ userId: user.id });
  }
  samples.push({ title: 'Boss derrotado: premios por participar, mayor daño y último golpe', text: latest });
  await send(a, `.ctubosstop ${boss.code}`, 'Boss: aportaciones de todos los participantes');
  await send(a, '.ctuinventario', 'Inventario después de misiones, festival, captura y boss');
  await send(a, '.ctuperfil', 'Perfil: logros y tickets integrados con el progreso');
  await send(a, `.ctuvender ${eventUnit.id} 20`, 'Mercado: un personaje exclusivo también se puede vender');
  const eventListing = (await game.market.listListings({ sellerId: user.id })).items.find(listing => listing.unitId === eventUnit.id);
  currentTime = '2026-10-25T06:00:00.000Z';
  await send(a, '.ctuevento faroles', 'Festival terminado: emisión cerrada y unidades conservadas');
  await send(b, `.ctucomprar ${eventListing.code}`, 'Después del festival: comercio sin nueva emisión');
  await send(b, `.ctuunidad ${eventUnit.id}`, 'Unidad histórica: conserva el festival después de cambiar de dueño');
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
