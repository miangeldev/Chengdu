# Auditoría de `project.md`: fases 0–32

Fecha de revisión: 13 de octubre de 2026, Ciudad de México.

Se leyeron los **4.235 renglones** del documento, incluidos los modelos de
datos, las fases 0–36, el roadmap por versiones y las recomendaciones de sus
118 apartados. La referencia es `project.md`; no existe `project.ms`.

Esta matriz describe el **estado encontrado al iniciar esta entrega**, sobre
Beta 0.9 y esquema 10. La existencia de una versión publicada no equivale a
haber implementado todas las fases numeradas del documento. Las filas pendientes
deben cerrarse con código, integración y pruebas; este archivo no las declara
completas por anticipado.

## Cómo interpretar el alcance

- **Implementada**: existe el flujo principal jugable, con persistencia y
  protección de sus invariantes. No implica que todos los ejemplos ilustrativos
  del documento deban convertirse en contenido obligatorio.
- **Parcial**: existe una parte de la fase, pero falta una capacidad concreta.
- **Pendiente**: falta su dominio o no hay un flujo utilizable por jugadores.
- **Recomendación**: una posibilidad futura o un ejemplo, no una obligación
  asumida para esta entrega.

`project.md` es un documento de diseño con ejemplos y alternativas. Por ejemplo,
cinco rarezas son admitidas por el modelo, pero no exige un personaje mítico en
el catálogo inicial; el eléctrico es un ejemplo de elemento, no una condición
para que el sistema elemental funcione. Tampoco exige blockchain, dinero real,
SQLite, ilustraciones o infraestructura de analítica externa para lanzar clanes.

Las decisiones posteriores del usuario prevalecen: supply por personaje de
50/35/20/10 según rareza, diferencias moderadas de fuerza conservando roles,
mensajes de WhatsApp compactos con acciones copiables, páginas numéricas y una
hora mínima entre apariciones.

## Matriz completa de fases anteriores

| Fase | Requisito concreto de `project.md` | Estado inicial | Evidencia y diferencia pendiente |
| --- | --- | --- | --- |
| 0 · Diseño | Reglas de equipos, combate, propiedad, progresión y rareza; decisiones documentadas. | Implementada | Guías `mvp-0.1.md` a `beta-0.9.md`, `database.md`, políticas versionadas. Equipos de hasta 3, unidades nivel 20, jugador nivel 50, moneda virtual, duplicados como unidades distintas. |
| 1 · Infraestructura | JSON múltiple, repositorios y acceso centralizado; cambiar almacenamiento sin meter reglas en comandos. | Implementada | `CTU-database.js`, `storage/unitOfWork.js`, `repositories/index.js`, `repositories/collection.js`. Escritura serializada, journal recuperable, backup y bloqueo de un escritor. |
| 2 · Registro/perfil | Registrar, perfil y balance; evitar duplicados, nombres vacíos/largos y separar identidad externa. | Implementada | `game/users/userService.js`, `utils/identity.js`, `plugins/CTU-registro.js`, `CTU-perfil.js`, `CTU-balance.js`. Usuario interno `USR-…`, identidad normalizada, nombre 1–40 caracteres. Perfil de terceros corresponde además a fase 31. |
| 3 · Catálogo | Catálogo pequeño con roles variados, previo a obtención. | Implementada | `game/characters/catalog.js`: 8 bases; `game/content/catalog.js`: 2 de evento. Tanque, atacante, velocista, control, soporte y equilibrado. Consulta pública y ficha detallada. |
| 4 · Unidades | Una función legítima de emisión: propietario, supply, serial, stats, traits, variante y origen. | Implementada | `game/units/unitGenerator.js:createUnitInTransaction`; starter, sobres y captura la utilizan. Emisión, contador, baseline y evento comparten commit. `game/units/unitService.js` no permite falsificar starter/sobre por API genérica. |
| 5 · Starter | Tres opciones equilibradas, unidad permanente y reclamo único. | Implementada | `game/rewards/starterService.js`; `STARTERS` en catálogo. Se admiten panda/mago/lobo y 1/2/3. Reintentos conservan la emisión original incluso después de venderla. |
| 6 · Equipos | Colección, equipo por referencias propias y modelo de hasta 3 posiciones. | Implementada | `game/teams/teamService.js`; agregar, quitar, limpiar y ordenar. Propiedad, duplicados, unidades reservadas y equipo en combate se validan en el servidor. |
| 7 · Motor V1 | Desafiar, aceptar, resolver turnos, HP/ataque/defensa/velocidad, ganador y snapshots; sin WhatsApp en motor. | Implementada | `game/battle/engine.js`, `battleService.js`, `lifecycle.js`; adaptador separado en `interfaces/whatsapp/`. Se conserva el modo clásico y los combates históricos. |
| 8 · Ataques | Definiciones separadas de personajes, dos ataques, potencia/precisión/tipo; daño comprensible. | Implementada | `game/battle/attacks.js`, colección `ataques`, `combatContent.js`; precisión visible en ficha aunque oculta en el resumen de turno. Tiradas guardadas para replay. |
| 9 · Efectos | Motor genérico para veneno, quemadura, aturdimiento, escudo, regeneración, buffs/debuffs; eventos renderizables. | Implementada | `game/battle/advancedEngine.js`, `combatContent.js`, `interfaces/whatsapp/battleFormat.js`. Efectos declarativos, duración y potencia; eventos y reproducción de acciones. |
| 10 · Progresión | XP y nivel separados de jugador/unidad; recompensa al ganar y progreso menor al perder; crecimiento acotado. | Implementada | `game/progression/rules.js`, `game/rewards/battleRewards.js`, `battlePolicy.js`. Victoria 120 monedas/35 XP, derrota 15 XP, empate 20 XP; XP de equipo repartida entre participantes, sin multiplicarla por reservas. |
| 11 · Economía | Una moneda, fuentes/sumideros, créditos/débitos centralizados y ledger. | Implementada | `game/economy/coinOperations.js`, `economyService.js`; ChengCoins, diario, premios, sobres y comisión de mercado. `storage/economyValidation.js` reconstruye saldo y origen de movimientos. Las listas de veinte monedas o todos los sinks posibles son ejemplos. |
| 12 · Sobres/drops | Una primera obtención de pago, pesos enteros, disponibilidad/supply comprobada antes del cobro. | Implementada | `game/packs/packService.js`, `game/drops/dropEngine.js`, `game/packs/catalog.js`. Sobre básico de 500; 70/22/7/1 por rareza, renormalización al agotarse una categoría, recibo idempotente. |
| 13 · Orígenes diversos | Starter, sobres, PvP, misiones, logros, eventos, bosses, spawns, ranking y códigos/promociones como vías de obtención. | Parcial | Emisión directa: starter, sobre, spawn y evento mediante captura. Misiones/logros/bosses dan tickets para captura: vía indirecta existente. PvP entrega monedas/XP y ranking monedas/título; no emiten unidades propias. No hay canje de códigos/promociones. La enumeración necesita un alcance explícito; no puede darse por totalmente implementada. |
| 14 · Mercado | Publicar sin transferir, comprar atómicamente, comisión, disponibilidad/propiedad/saldo auténticos. | Implementada | `game/market/marketService.js`, `policy.js`, `references.js`, `game/units/ownership.js`; códigos globales M1/M2, comisión 5%, vencimiento de 7 días, locks, pago/neto/transferencia/recibo en un commit. |
| 15 · Intercambio directo | Oferta bilateral con unidades y monedas, doble aceptación, activos bloqueados, evitar doble gasto o cambiar oferta aceptada. | Pendiente | No hay dominio de trades ni comando `.ctutrade`. `transferUnitInTransaction` sólo acepta `SALE-…` y lock `market`; vender no equivale a intercambiar. |
| 16 · PvP avanzado | 3v3, cambios, orden de equipo, composición y habilidades. | Implementada | `advancedEngine.js`, `battleService.js`, `teamService.js`; 1v1/2v2/3v3, activo/reservas, cambio que consume turno, KO y relevo automático. No se exige un bonus artificial por cada pareja de personajes: la composición ya produce interacciones de efectos. |
| 17 · Elementos | Ventajas y resistencias moderadas, datos separados del comando. | Implementada | `combatContent.js`, `advancedEngine.js`: fuego/agua/naturaleza/luz/oscuro/neutro y multiplicadores suaves. El elemento eléctrico de la lista ilustrativa no es un requisito adicional. |
| 18 · Traits | 0, 1 o 2 rasgos poco frecuentes con diferencias pequeñas y auditables. | Implementada | `game/units/collectibles.js`, `dropEngine.js`: Robusto, Agresivo y Firme; 80/19/1 al abrir sobres. Diferencias moderadas, no 30%; los stats de nacimiento permanecen intactos. Ágil es un ejemplo de rasgo, no un nombre obligatorio. |
| 19 · Variantes | Valor estético independiente de poder competitivo. | Implementada | `collectibles.js`: normal/shiny/dorada, probabilidades 94/5/1 en sobres. No bonifican combate. Dark/Event/Anniversary son ideas adicionales, no una lista cerrada obligatoria. |
| 20 · Procedencia | Cómo y cuándo nació cada unidad; fuente permanente visible al inspeccionar. | Implementada | `unitGenerator.js` guarda `origin.type/sourceId` y fecha; `unitService.js` y `plugins/CTU-unidad.js` muestran origen/campaña/sobre y propietario. Los nuevos orígenes deben incorporar nombres legibles en el renderer. |
| 21 · Propiedad histórica | Cadena de propietarios y métodos, separada de la unidad para crecer sin inflarla. | Implementada para mercado | `eventos`, `ownership.js`, `storage/ownershipValidation.js`, `.ctupropiedad`. Versión consecutiva y vínculo a venta; falta ampliarla a trade al implementar fase 15. El historial público omite JID y claves de operación. |
| 22 · Misiones | Objetivos diarios de combate/variedad, recompensas y ausencia de incentivo a spam. | Implementada | `game/content/catalog.js`, `objectives.js`, `contentService.js`: 2 victorias, 5 partidas y 3 personajes, monedas/XP/tickets; reset CDMX y sólo partidas elegibles. |
| 23 · Logros | Hitos permanentes, títulos/badges, reclamo único. | Implementada | Primera sangre, 25 adquisiciones, 100 partidas y 10 victorias consecutivas en `catalog.js`. Desbloqueo permanente y evidencia; títulos e insignias en inventario. Equipar un título es el hueco social de fase 31. |
| 24 · Ranking | Rangos, clasificación y rating renovable en lugar de dominio eterno de veteranos. | Implementada | `game/competitive/competitiveService.js`, `policy.js`, `lifecycle.js`; Elo K=32, seis rangos, colocación de 5 partidas/3 rivales, `.cturanked`, `.cturank`, `.ctutop`. |
| 25 · Temporadas | Calendario, reset competitivo conservando colección/progreso/historia y premios. | Implementada | Temporadas de 30 días, archivo por T1/T2, standings congelados, monedas/título y reclamo único. Sin reset de unidades, XP, mercado ni logros. Misiones de temporada son una posibilidad del documento, no una obligación de Beta 0.9. |
| 26 · Eventos | Contenido temporal, emisión cerrada al acabar y comercio posterior de unidades existentes. | Implementada | `game/content/catalog.js`, `contentService.js`, `unitGenerator.js`: Festival de los Faroles, ventana 11–25 octubre 2026, dos personajes limitados. Halloween 2027 y sus cantidades eran ejemplos; rigen los límites solicitados por el usuario. |
| 27 · Bosses | Vida compartida, daño por jugador, cooperación, participación/mayor daño/último golpe. | Implementada | `game/content/encounterService.js`, `encounterRules.js`: Niebla y Dragón del Vacío, HP compartida entre grupos, cooldown y límite por participante, premios para todas las contribuciones válidas. No hay emisión directa de unidad por boss: hueco de fase 13. |
| 28 · Spawns | Aparición en grupos, captura, duración/cooldown, oportunidad temporal sin premiar volumen de mensajes. | Implementada | `observeActivity/capture` en `encounterService.js`, `SPAWN_POLICY`, `observeGameActivity` en `interfaces/whatsapp/index.js`. Comprobación 30 minutos, 25%, separación mínima **1 hora**, duración 10 minutos y ticket. La sesión anfitriona debe invocar el observador después de moderación. |
| 29 · Crafting | Materiales/fragmentos y recetas para mejoras/rerolls/cosméticos/evolución; gasto real y persistente. | Pendiente | No hay dominio, inventario de materiales ni recetas. El texto propone varios usos: no obliga a implementarlos todos a la vez, pero sí un flujo real de crafting para cerrar la fase solicitada. |
| 30 · Evoluciones | Cambio de forma de una unidad preservando su identidad/historia; opción recomendada de mantener ID. | Pendiente | No hay recetas ni forma evolutiva. El validador actual liga ID/serial/counter a `characterId`, por lo que cambiar ese campo directamente corrompe la emisión. La extensión necesita un contrato explícito de nacimiento/forma y recibos. |
| 31 · Social | Perfil público, colección, showcase, títulos, favoritos, comparación y vínculo a ranking. | Parcial | Ficha de unidad, propietario e histórico son públicos; hay ranking y títulos obtenidos. `.ctuperfil` y `.ctupersonajes` sólo admiten el propio jugador. No hay showcase, favoritos, comparación ni selección de título para exhibirlo. |
| 32 · Clanes | Roles, miembros, permisos, economía, ranking, guerras, recompensas y moderación. | Pendiente | No hay dominio, colecciones, API ni interfaz de clanes al inicio. Debe implementarse el conjunto funcional indicado en el apartado siguiente. |

## Requisitos mínimos verificables para fase 32

La lista explícita de `project.md:2401` tiene ocho componentes. Crear un clan y
mostrar sus miembros sólo resolvería una parte. El cierre debe demostrar:

| Componente | Flujo que debe poder jugarse | Invariantes y pruebas necesarias |
| --- | --- | --- |
| Roles | Líder, responsables y miembros; nombramiento y sucesión del liderazgo. | Un líder por clan activo; el cliente no escoge su autoridad; nadie asciende/expulsa a un superior sin permiso. |
| Miembros | Crear, consultar, invitar o solicitar entrada, aceptar y salir. | Un jugador no integra dos clanes; invitación auténtica con destinatario, cupo y vencimiento; sin miembros huérfanos. |
| Permisos | Operaciones autorizadas por pertenencia y rol persistente. | El servidor autentica al actor; códigos y argumentos no conceden privilegios. |
| Economía | Recursos o tesorería del clan, contribuciones y gastos con razón e historial. | Monedas debitadas/créditos vinculados a recibos; saldo nunca negativo, enteros seguros, ningún traspaso duplicado. Si no hay retiros, debe explicarse claramente. |
| Ranking | Clasificación entre clanes y desempates deterministas. | Datos reproducibles a partir de actividad válida; páginas numéricas/códigos cortos; el número de mensajes no aporta puntos. |
| Guerras | Desafío, aceptación, duración, participación mediante juego y resultado. | Dos clanes distintos, ventanas/cupos, jugadores elegibles y resultados auténticos; no editar puntuación desde el comando. Concurrencia y expiración protegidas. |
| Recompensas | Premio por guerra/participación con condiciones visibles y reclamo único. | Sólo el servidor calcula importe y elegibilidad; resultado, saldo, recibo y ledger coherentes; límites de repetición para evitar acuerdos de farmeo. |
| Moderación | Expulsar, bloquear entrada y resolver abandono/disolución. | Acciones auditadas, jerarquía respetada; salida/expulsión durante guerra no inventa ni elimina contribuciones; líder no deja clan sin sucesor. |

Una guerra que reutiliza el combate debe conservar el resultado histórico de
esas partidas, y un combate competitivo no puede puntuar dos veces por existir
además en una guerra. Las recompensas de clanes deben aparecer en el ledger y
ser verificadas por el mismo mecanismo de integridad del resto del juego.

## Huecos anteriores que deben entrar en esta entrega

1. **Fase 15, trade bilateral.** Unidades y monedas, ofertas versionadas,
   consentimiento de ambos, locks/reserva del saldo, edición que invalide
   aceptación anterior, cancelación y vencimiento. Pago, transferencias y
   desbloqueo atómicos; historial que identifique el intercambio.
2. **Fase 29, crafting funcional.** Inventario de materiales con fuentes
   identificadas, recetas legibles, coste publicado, confirmación transaccional,
   bloqueo de unidades ajenas/ocupadas y deduplicación del recibo.
3. **Fase 30, evolución persistente.** Preservar ID, serial, propietario,
   procedencia, XP e historial; no devolver supply por transformar una unidad,
   no reescribir snapshots de partidas ni resultados de sobres antiguos.
4. **Fase 31, social utilizable.** Consultas públicas por mención sin mostrar
   JID, colección ajena, favorito/showcase, título ganado y comparación. Un
   favorito vendido deja de poder exhibirse como propiedad actual.
5. **Fase 13, completar y explicar orígenes.** Diferenciar una unidad ganada
   directamente de un ticket para captura o monedas para comprar un sobre.
   Si se incorporan drops PvP o promociones, pasar por emisión central, supply
   global y reclamos únicos; nunca fabricar unidades en un plugin.
6. **Fase 32 completa.** Los ocho componentes de la tabla anterior, con ayuda
   y siguientes pasos copiables en la interfaz existente.

## Dependencias de datos que no se pueden ignorar

- `game/units/ownership.js` exige actualmente fuente `SALE-…`, lock `market`
  y venta auténtica. El trade necesita una fuente distinta verificada, no
  relajar esos controles para aceptar cualquier cambio de propietario.
- `storage/validation.js` exige `id = prefix(characterId) + serial`, unicidad
  `(characterId, serial)`, contador igual a emisiones existentes y límites de
  rareza. Una evolución debe separar forma actual de identidad de nacimiento
  o extender explícitamente toda esa reconstrucción.
- `game/economy/coinOperations.js` y `storage/economyValidation.js` sólo
  conocen fuentes existentes. Trades, crafting y tesorería/premios de clan
  necesitan recibos nuevos y reconstrucción completa de saldo.
- `storage/progressionValidation.js` reproduce XP desde baselines y recibos.
  Si una receta concede XP, debe incorporarse a ese replay; un cambio directo
  de `progress` sería inválido aunque la UI parezca correcta.
- Stats, variantes y rasgos usados en combates históricos no pueden
  reinterpretarse con una transformación nueva. Las modificaciones permanentes
  deben guardar su versión y conservar los snapshots ya confirmados.
- La migración debe conservar las 24 colecciones del esquema 10, admitir
  journals históricos y añadir colecciones nuevas sin otorgar premios
  retroactivos. Pruebas con bases temporales; ninguna cuenta de prueba en
  `ChengdúData/` del usuario.

## Revisión transversal de los 118 apartados

| Principio / apartados | Estado al iniciar | Evidencia o trabajo por continuar |
| --- | --- | --- |
| Separar usuarios, plantillas, unidades y combates; ownership único (§3–7). | Cumplido | Servicios por dominio, `ownerId` único, referencias en equipo. No se duplican colecciones dentro del usuario. |
| Comandos → servicios → repositorios → almacenamiento (§4, §10, §25, §86–88, §116–117). | Cumplido | `defineCommand`, `createGame`, repositorios y `JsonUnitOfWork`; motor sin socket. Extensiones deben conservarlo. |
| IDs legibles y serial separado (§15–17, §85). | Cumplido | PAND-000001 y demás unidades; códigos M/S/B/T de entidades y páginas numéricas. Clanes/trades necesitan códigos igual de cortos. |
| Stats individuales y variación (§6–7). | Soportado, decisión conservadora | `statVariation` y generador admiten variación; catálogo actual usa cero y la individualidad adicional proviene de traits. No introducir RNG excesivo sólo por rellenar ejemplos. |
| Recompensar derrota y moderar crecimiento (§31–35). | Cumplido | XP menor al perder y caps independientes; balance moderado por rareza solicitado por el usuario. Nuevas formas no invalidan colecciones previas. |
| Economía virtual centralizada, fuentes, sumideros y ledger (§36–40, §95–98). | Cumplido | Sin dinero real ni blockchain. Sobres y comisión son sumideros; nuevas fuentes precisan recibos y límites. |
| Transacciones, locks, idempotencia y anti-exploits (§45, §69–73, §102–103). | Implementado para dominios existentes | Serialización, un escritor, locks battle/market, IDs de mensaje y recibos; extender a trade/clan/craft sin atajos. |
| Auditoría de acciones importantes (§74). | Implementada para economía/propiedad/combate/contenido | Eventos, ledger, acciones y recibos inmutables; faltan logs de las funciones aún ausentes. |
| Tests sin WhatsApp e invariantes (§75–76). | Implementado | Suites de concurrencia, corrupción, journal y replay en `tests/`; extender a dominios nuevos. La sesión real depende del host. |
| Balance con datos (§77–78). | Parcial como telemetría de producción | Hay simuladores clásico/avanzado/contenido e informes en `docs/*balance*`; estadísticas por unidad y acciones de combate. Falta un informe agregado de uso/winrate/daño/duración sobre actividad real. Corresponde al cierre V1.0, no sustituirlo con métricas inventadas. |
| Comandos administrativos y permisos globales (§90–91). | Pendiente como herramientas del juego | El host tiene moderación propia, pero no existe `.ctuadmin` ni roles player/moderator/admin/developer en el dominio. Es una recomendación posterior; la moderación interna de clan sí está en fase 32. |
| Versionado, migraciones y validación (§92–94). | Cumplido | Esquemas 1–10, migraciones explícitas, validación de referencias, saldos, supply y replay. Las nuevas fases precisan esquema nuevo y backup. |
| Interfaz de WhatsApp y combates condensados (§99–101). | Cumplido | Un resumen por acción de combate, HP textual, ficha detallada; sin UUID en paginación ni mercado. Aplicar la misma filosofía a trades, recetas, showcase y clanes. |
| JSON hoy, SQLite cuando concurrencia lo justifique (§81–84). | Decisión vigente | Un proceso escritor sobre JSON recuperable. Migrar a SQLite es recomendación condicionada al crecimiento, no una tarea imprescindible de esta entrega. Los subbots separados no pueden escribir simultáneamente la misma carpeta. |
| Docs de decisiones y backlog NOW/NEXT/LATER (§113–115). | Parcial | Hay guías de versiones y planes con hitos; falta un backlog global honesto que identifique fases ausentes, recomendaciones y alcance cerrado. Esta auditoría sirve de trazabilidad inicial. |
| Casas, subastas, torneos automáticos, profesiones, mapa, mascotas, premium (§79, §112). | Fuera de alcance | El documento advierte contra construirlos temprano. No son requisitos faltantes de fases 0–32 ni se añaden por aparecer en una lista. |

## Evidencia de pruebas anteriores

La Beta 0.9 documenta 543 pruebas y 153 mensajes de ejemplo. Para esta revisión
se comprobaron los casos existentes, sin presentar esos totales como validación
de funciones aún no implementadas:

- `tests/game.test.js`: identidades, reclamo de starter simultáneo, último cupo,
  seriales, variación y propiedad.
- `tests/battle.test.js`, `advanced-*.test.js`: snapshots, turno, concurrencia,
  efectos, reservas, expiración y resultado único.
- `tests/progression.test.js`: crecimiento, XP separada, límite por pareja,
  recompensa repetida y conservación de historial.
- `tests/packs.test.js`, `market*.test.js`, `ownership.test.js`: pago/emisión,
  variantes estéticas, doble compra, fee, locks y cadenas de propietario.
- `tests/content.test.js`: objetivos válidos, spam sin más oportunidades,
  límite exacto de una hora, captura única, evento cerrado y cooperación.
- `tests/competitive*.test.js`: Elo, colocación, temporada, replay, premios,
  corrupción de datos y preservación de partidas casuales.
- `tests/storage.test.js` y migraciones: un escritor, recuperación, archivos
  incompletos, conservación de datos y rechazo de ediciones sin recibo.
- `tests/whatsapp-*.test.js`: mensajes compactos, prefijos, privacidad,
  siguiente acción, páginas cortas y deduplicación de operaciones.

El cierre de la entrega debe actualizar las filas que realmente se hayan
implementado con sus archivos y pruebas finales. Cualquier recomendación
posterior que permanezca pendiente debe seguir visible como tal.

## Cierre funcional de la entrega 0.10

La matriz inicial se conserva como evidencia de lo encontrado. Los huecos
concretos se resolvieron en esta entrega, con las siguientes implementaciones:

| Fase antes incompleta | Implementación final | Evidencia de verificación |
| --- | --- | --- |
| 13 · Orígenes | Premios directos de victoria PvP, misión, logro, boss, evento, podio y código limitado. | `game/acquisition/`, `acquisitionValidation.js`, `tests/acquisition.test.js`; fuentes realmente ganadas, tirada única y emisión central. |
| 15 · Intercambio | Dos ofertas, unidades/monedas, doble confirmación, escrow, locks y devolución al cancelar/vencer. | `game/trades/`, `tradeValidation.js`, tests de seis unidades, concurrencia, restart y recovery. |
| 21 · Propiedad | Fuente de transferencia de trade verificada, conservando la cadena de mercado. | `ownership.js`, `ownershipValidation.js`, `.ctupropiedad` distingue ambos métodos. |
| 29 · Crafting | Materiales de fuentes únicas, sello evolutivo e insignia cosmética con coste real. | `game/crafting/`, `craftingValidation.js`, tests de gasto, corrupción y replay. |
| 30 · Evolución | Tres formas, +5% moderado, nivel 10, sello y coste; identidad y supply intactos. | `game/evolution/`, recibos y pruebas de snapshots previos/futuros en combate, mercado y boss. |
| 31 · Social | Perfil y colección pública por mención, vitrina, favorito, destacados, títulos ganados y comparación. | `game/social/`, preferencias auditadas, ocultación tras transferir, privacidad y UI. |
| 32 · Clanes | Roles, miembros, permisos, tesorería, ranking, guerras, premios y moderación. | `game/clans/`, `clanValidation.js`, guerras completas, autoridad, cooldowns y recovery de monedas. |

La documentación funcional y sus decisiones está en
[fases 13–32](fases-13-32.md); la trazabilidad de los ocho hitos está en
[el plan de entrega](plan-fases-13-32.md). Las recomendaciones de producción,
administración global, SQLite y contenido posterior mantienen el estado
indicado en la revisión transversal. Se preservan las fases anteriores, los
límites de supply acordados y una hora mínima entre apariciones.

Cierre verificado: **683 pruebas** de la suite completa y **37 pruebas** tras
el último ajuste, **53 plugins** y **188 ejemplos**. La base local pasó de
esquema 10 a 11 preservando 24 colecciones y 44 registros, con once colecciones
vacías y respaldo coherente. No se añadieron jugadores de prueba ni quedó
journal/lock pendiente.
