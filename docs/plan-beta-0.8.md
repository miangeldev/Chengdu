# Beta 0.8 — Plan y contrato de implementación

Fecha: 2026-10-11. Se conservan las fases 0.1–0.7.1 y el mercado con códigos cortos.
Alcance tomado de `project.md`: misiones, logros, bosses, spawns y eventos.
Ranking, Elo y temporadas competitivas corresponden a 0.9.

## Hitos de cierre

- [x] 0.8.1: esquema 9, migración 8→9 y recuperación de journals anteriores.
- [x] 0.8.2: misiones diarias de dos victorias, cinco partidas y tres personajes.
- [x] 0.8.3: logros permanentes, títulos, insignias y recompensas únicas.
- [x] 0.8.4: bosses compartidos con participación, mayor daño y último golpe.
- [x] 0.8.5: apariciones y captura atómica en grupos, cooldown y supply global.
- [x] 0.8.6: calendario, premio de bienvenida y personajes exclusivos de evento.
- [x] 0.8.7: comandos, ayuda, mensajes de ejemplo y guía de integración del anfitrión.
- [x] 0.8.8: pruebas completas, carreras, reintentos, migración real y conservación.

Cierre verificado: **439 pruebas**, **130 mensajes de ejemplo**, **9.000 duelos**
de balance, **41 comandos**. La base del proyecto pasó de esquema 8 a 9,
con las catorce colecciones previas conservadas y sin jugadores ni unidades
de prueba. Respaldo: `ChengdúData/backups/601db23e-2439-4957-bc05-96d95a6a68c3/`.
No hay journal ni lock pendiente. La sesión real de WhatsApp sigue perteneciendo
al bot anfitrión; la guía explica cómo conectar comandos y actividad normal.

## Decisiones

Las misiones cambian a medianoche de Ciudad de México. Se cuenta sólo PvP con
liquidación `rewarded`, conservando el antiabuso vigente. Las tres misiones
premian monedas, XP de jugador y un ticket cada una. Los tickets permiten
capturar apariciones; su saldo se reconstruye a partir de recibos, sin editar
el saldo de ChengCoins ni añadir otra cuenta administrativa.

Los logros usan historia permanente de partidas y adquisiciones únicas; vender
o volver a comprar una unidad no pierde ni duplica el progreso. Se desbloquean
al consultar el servicio y conservan título e insignia. El premio se reclama
explícitamente; no hay créditos retroactivos automáticos al migrar.

Los bosses tienen vida compartida en todos los grupos. Los ataques usan una
unidad equipada, propia y libre, guardan un snapshot y no alteran estadísticas
PvP. Hay cooldown y máximo de ataques por jugador/encuentro. La muerte liquida
todos los participantes con daño positivo de manera atómica. Participación,
mayor daño y último golpe son componentes separados del premio.

Cada grupo tiene una comprobación de aparición por ventana temporal y un
intervalo mínimo entre apariciones. No se acumulan probabilidades por cantidad
de mensajes. La captura cuesta un ticket, pertenece al grupo del encuentro y
asigna propietario y serial únicamente al ganador, mediante la fábrica existente.

El Festival de los Faroles dura del 11 al 25 de octubre de 2026, ambos a las
00:00 de Ciudad de México. Tiene dos personajes exclusivos y una bienvenida
reclamable una sola vez. Al terminar, su emisión se cierra permanentemente;
las unidades existentes conservan progreso, procedencia y comercio.

## Contrato compartido de desarrollo

Se añaden seis colecciones: `campanas`, `premioscontenido`, `logros`,
`encuentros`, `accionescontenido`, `actividad`. Repositorios correspondientes:
`campaigns`, `contentRewards`, `achievements`, `encounters`, `contentActions`,
`groupActivity`. Todas las colecciones existentes conservan nombres y orden.

`game/content/catalog.js` exporta `CONTENT_POLICY_VERSION`, `MISSIONS`,
`ACHIEVEMENTS`, `BOSSES`, `SPAWN_POLICY`, `seedCampaigns()` y
`seedEventCharacters()`. Las campañas tienen `id`, `revision`, `name`,
`startsAt`, `endsAt`, `characterIds`, `welcome` y `policyVersion`.
Los personajes exclusivos añaden `eventId` y usan ataques/perfiles existentes,
stats moderados y los máximos por rareza 50/35/20/10.

`grantContentReward(repos, options)` vive en `game/content/rewards.js` y recibe
`userId`, `kind` (`mission|achievement|boss|event|spawn`), `sourceId`,
`operationKey`, `coins`, `userXp`, `tickets`, `ticketCost`, `createdAt`,
`details`. Devuelve `{ reward, alreadyClaimed }`. El recibo guarda estos campos
más `id`, `policyVersion`, `balanceBefore/After`, `userProgressBefore/After` y
`ticketsBefore/After`. Cada recibo tiene un crédito de ledger `content_reward`,
incluso si las monedas son cero. La XP se reproduce siguiendo el orden del
ledger compartido con PvP. Los tickets se reproducen en orden de recibos.
Origen único por `(kind, sourceId, userId)`; claves y recibos son inmutables.

Encuentros: `id`, `kind` (`boss|spawn`), `policyVersion`, `chatId` (null para
boss mundial), `createdAt`, `expiresAt`, `updatedAt`, `endedAt`, `status`,
`snapshot`, `hp` (boss), `winnerId` (null mientras activo). Las vistas añaden
`code`: `B<n>` o `S<n>` según posición global conservada en encuentros.
Se conservan encuentros cerrados y nunca se reordenan ni reutilizan códigos.
Snapshots de boss se copian de `BOSSES`; de spawn: `characterId`,
`characterName`, `rarity`, `campaignId`, `ticketCost`.

Acciones: `id`, `kind` (`boss_attack|spawn_capture|spawn_check`),
`encounterId` (null en comprobación), `userId`, `operationKey`, `createdAt`,
`details`. Boss details incluyen `unitSnapshot`, `choice`, `roll`, `damage`,
`hpBefore`, `hpAfter`. Captura incluye `unitId` y `rewardId`. Comprobaciones
incluyen `chatId`, `roll` y `spawnId` (null si no hubo aparición).
La política/fórmula pura y el replay viven en `game/content/encounterRules.js`
y `storage/encounterValidation.js`, respectivamente.

Actividad por grupo: `id` (`group:<hash>`), `chatId`, `nextCheckAt`,
`lastSpawnAt`, `updatedAt`. Sólo comprobaciones temporales modifican esta vista.
`observeActivity({ userId, chatId, messageId })` devuelve `{ spawn, ... }`.
`getSpawn({chatId})`, `capture({userId, chatId, code=null, operationKey})`,
`getBoss({bossId='niebla'})`, `attackBoss({userId, chatId, code=null,
choice='1', operationKey})`, `getBossRanking(code, options)` son las APIs.
Los encuentros devuelven vistas compactas con nombres, código y aportaciones;
no contienen JIDs ni identidades internas en mensajes.

Objetivos: `getMissions(userId)`, `claimMission({userId, code, operationKey})`,
`getAchievements(userId, options)`, `claimAchievement({userId, code,
operationKey})`, `getEvents(options)`, `claimEvent({userId, eventId,
operationKey})`, `getInventory(userId)`. Misiones usan códigos `1/2/3`; logros
`L1/L2/…`; eventos usan slug corto `faroles`. Todo permiso se comprueba en el
servicio. Los comandos no admiten snapshots, premios o atributos arbitrarios.

Desbloqueos en `logros`: `id`, `userId`, `achievementId`, `policyVersion`,
`unlockedAt`, `snapshot` (definición congelada), `evidence` (progreso verificable).
Misiones y logros se calculan con `game/content/objectives.js`, funciones puras
que puede reutilizar el validador. Recibos de misión guardan `missionId`,
`period`, `evidence`; de logro guardan `achievementId`; de evento `campaignId`.

Los servicios públicos están disponibles en `game.content` y `game.encounters`.
Toda emisión exclusiva exige comprobar la ventana de la campaña dentro de
`createUnitInTransaction`, también desde starter, sobres y API administrativa.
El replay de una emisión anterior se resuelve antes de comprobar la ventana.
