# Modelo de datos — Alpha 0.4.1 y su evolución

Estado: contrato implementado hasta 0.4.1 (esquema 5), basado en `../project.md`.
Los mecanismos descritos como futuros aún requieren servicios y migraciones.
El alcance se divide en [fundación 0.1](mvp-0.1.md), [combate 0.2](mvp-0.2.md)
[progresión 0.3](mvp-0.3.md), [colección 0.4](alpha-0.4.md)
y [balance 0.4.1](balance-0.4.1.md).

## Convenciones y fuentes de verdad

- Propiedades nuevas en inglés; textos y comandos de usuario en español.
  La migración convierte `nombre` en `name` sin cambiar el nombre elegido.
- IDs internos de usuarios estables, independientes del JID. La identidad
  WhatsApp se resuelve antes de invocar servicios; no se deduce desde argumentos.
- `units.ownerId` es la fuente de propiedad. No almacenar una colección duplicada
  dentro de usuarios; `team` contiene referencias y no concede propiedad.
- Fechas ISO 8601 en UTC, convertidas a zona local sólo al presentar. Fechas
  históricas desconocidas se guardan como `null`; no inventar una fecha de registro.
- Monedas, XP, contadores y seriales: enteros seguros no negativos; seriales
  positivos. Rechazar un incremento que exceda el rango seguro de JavaScript.
- Campos ausentes de un esquema anterior se añaden mediante migración. Un campo
  inválido en una base vigente debe fallar validación, no convertirse en un default.

## Archivos y versiones

| Archivo previsto | Responsabilidad |
| --- | --- |
| `usuarios.json` | Jugadores e identidades vinculadas. |
| `personajes.json` | Plantillas de contenido versionadas. |
| `unidades.json` | Unidades, propietario y progreso individual. |
| `estado.json` | Contadores, reclamos y saldos/progresos iniciales auditados. |
| `eventos.json` | Creaciones auditables; después, cambios de propiedad. |
| `ataques.json` | Definiciones de ataques versionadas, potencia y precisión. |
| `combates.json` | Desafíos, snapshots, acciones, turnos y resultados. |
| `recompensas.json` | Premios por jugador/batalla, motivo, cantidades y valores antes/después. |
| `sobres.json` | Definiciones versionadas: precio, pool, pesos de rareza/rasgos/variante. |
| `aperturas.json` | Compras únicas, snapshot del sobre, resultado y recibo originales. |
| `economia.json` | Créditos/débitos inmutables, fuente y saldo antes/después. |

Además, `_database.json` marca la instalación, `_journal.json` coordina un commit
pendiente y `backups/` conserva snapshots coherentes del estado anterior.
El esquema 5 conserva las once colecciones del esquema 4; con el manifest,
cada snapshot del journal contiene doce archivos.

Cada colección emplea esta envoltura; el adaptador oculta la envoltura a servicios:

```json
{
  "_meta": {
    "schemaVersion": 5,
    "revision": 0,
    "updatedAt": null
  },
  "records": []
}
```

`schemaVersion` identifica estructura, `revision` identifica escrituras del
archivo. Son distintos de la versión del juego y de la revisión de una plantilla.
Los archivos afectados por una operación se coordinan mediante un journal; sus
revisiones no tienen que coincidir cuando una operación sólo afecta una colección.

## Usuario

```json
{
  "id": "USR-<uuid>",
  "identities": [{ "provider": "whatsapp", "subject": "<jid-validado>" }],
  "name": "Miguel",
  "createdAt": "2026-10-07T20:00:00Z",
  "updatedAt": "2026-10-07T20:00:00Z",
  "economy": { "coins": 0 },
  "progress": { "level": 1, "xp": 0 },
  "battleStats": { "wins": 0, "losses": 0, "matches": 0 },
  "team": [],
  "settings": { "notifications": true }
}
```

Los ejemplos con `<...>` son marcadores, no registros válidos para producción.
La unicidad de `(provider, subject)` impide que una identidad cree dos jugadores.
El ID interno se genera una vez y se conserva al vincular una identidad nueva.
Resolver aliases de WhatsApp sólo con información verificada del bot anfitrión;
no asumir que todos los identificadores de un remitente son su teléfono ni unir
cuentas por coincidencia de nombre. No mostrar `identities` en perfiles públicos.

Monedas iniciales: 0; bonificaciones posteriores necesitan una operación económica
auditable. Gemas y monedas adicionales se añadirán mediante migración cuando exista
una mecánica que las use. `team` inicia vacío y admite referencias ordenadas para
la futura capacidad de tres unidades; en 0.2 el servicio permite seleccionar una.

## Plantilla de personaje

```json
{
  "id": "panda_guerrero",
  "revision": 2,
  "name": "Panda Guerrero",
  "unitPrefix": "PAND",
  "rarity": "common",
  "role": "tank",
  "baseStats": { "hp": 120, "attack": 25, "defense": 23, "speed": 8 },
  "statVariation": { "hp": 0, "attack": 0, "defense": 0, "speed": 0 },
  "attackIds": ["panda_guerrero_1", "panda_guerrero_2"],
  "supply": { "type": "limited", "max": 50 },
  "obtainable": true,
  "starterEligible": true
}
```

El ejemplo representa una plantilla migrada al balance 0.4.1. Una instalación
nueva puede comenzar con revisión 1; la revisión describe cambios de esa
plantilla, no la versión del esquema. Los valores finales están en
[balance 0.4.1](balance-0.4.1.md).
Rarezas iniciales: `common`, `rare`, `epic`, `legendary`, `mythic`.
`role` es descriptivo; rareza no aplica automáticamente multiplicadores de fuerza.
`attackIds` contiene dos referencias del catálogo de ataques; cada combate
congela sus definiciones completas al ser aceptado.
Una emisión limitada usa `supply.type = limited` y `max` entero positivo.
La variación permitida está acotada a 1,000,000 por stat; en el catálogo inicial
es cero. Los máximos actuales por personaje son común 50, raro 35, épico 20,
legendario 10 y mítico 5 para contenido futuro. La migración conserva un máximo
previo si era menor. El antiguo máximo de 500 de Dragón Carmesí corresponde al
contenido anterior al balance 0.4.1.

`obtainable = false` cierra nuevas emisiones; las unidades existentes continúan
siendo válidas. No borrar ni renombrar IDs o prefijos que ya emitieron unidades.
Los cambios de límites o rareza requieren una decisión de contenido y una
migración. El esquema 5 admite un máximo menor que lo emitido sólo si conserva
el total histórico mediante `supply.grandfatheredIssued`: las unidades anteriores
siguen siendo válidas y no se permiten nuevas emisiones. Ese dato no concede
cupos adicionales. Cambiar stats incrementa `revision`; el balance de unidades
existentes necesita una base de combate versionada y una migración explícita.

## Unidad coleccionable

```json
{
  "id": "PAND-000001",
  "characterId": "panda_guerrero",
  "characterRevision": 1,
  "serial": 1,
  "ownerId": "USR-<uuid>",
  "createdAt": "2026-10-07T20:00:00Z",
  "updatedAt": "2026-10-07T20:00:00Z",
  "origin": { "type": "starter", "sourceId": "starter_v1" },
  "initialStats": { "hp": 120, "attack": 24, "defense": 22, "speed": 8 },
  "combatBaseStats": { "hp": 120, "attack": 25, "defense": 23, "speed": 8 },
  "progress": { "level": 1, "xp": 0 },
  "traits": [],
  "statGrowthVersion": 2,
  "traitVersion": 1,
  "variant": "normal",
  "battleStats": { "wins": 0, "losses": 0 },
  "lock": null
}
```

`initialStats` conserva los valores generados al emitir, con variación aplicada
una sola vez. El ejemplo muestra una unidad anterior migrada: conserva sus
stats de nacimiento y añade `combatBaseStats` para el balance vigente.
Las unidades nuevas comienzan con `combatBaseStats` igual a `initialStats`.
Con `statGrowthVersion: 2`, los stats efectivos parten de esa base y del nivel:
`+2 HP` por nivel ganado, `+1 ataque/defensa` por cada cinco, hasta nivel 20; la
velocidad no cambia. Después se aplican los rasgos de su versión. Los snapshots
nuevos copian `combatBaseStats` junto con `statsVersion: 2`; ambas bases y la
versión permiten validar el resultado sin consultar el catálogo actual.
Las versiones históricas 0 y 1 conservan sus reglas sobre los stats de nacimiento.
No se recarga la plantilla para recalcular una unidad o un turno ya iniciado.

ID, `characterId`, `serial`, origen y fecha de creación son identidad de emisión
inmutable. `combatBaseStats` se fija al emitir o migrar y tampoco admite cambios
ordinarios; un balance futuro requiere otra versión y migración. `ownerId` cambia
sólo mediante un servicio transaccional. Para evolución
futura, añadir una referencia de forma/evolución separada: no cambiar el personaje
de emisión, porque alteraría el significado del serial y el supply original.
En 0.2 también se valida que el propietario permanezca igual al de emisión;
habilitar transferencias requerirá extender la validación y los eventos.

`lock` actual: `null` o `{ "type": "battle", "referenceId": "BTL-..." }`.
El cierre, rendición o expiración del combate libera el lock mediante un commit
que actualiza sus estadísticas. Mercado, trade y administración requerirán tipos
y validadores adicionales. Un deadline vencido se procesa explícitamente; no se
ignora el lock sólo porque pasó el tiempo.

## Contadores, reclamos y auditoría

Los registros de `estado.json` se distinguen por `kind`:

```json
{
  "id": "mint:panda_guerrero",
  "kind": "mintCounter",
  "characterId": "panda_guerrero",
  "lastSerial": 1,
  "issuedCount": 1
}
```

```json
{
  "id": "starter:USR-<uuid>",
  "kind": "claim",
  "userId": "USR-<uuid>",
  "rewardType": "starter",
  "sourceId": "starter_v1",
  "unitId": "PAND-000001",
  "createdAt": "2026-10-07T20:00:00Z"
}
```

Supply significa total histórico emitido, no unidades activas ni propietarios.
`lastSerial` nunca baja; eliminar o retirar una unidad no devuelve cupos ni seriales.
Futuras bajas deben conservar un registro o tombstone de emisión.
Los cupos se comparten entre starters, sobres y otras fuentes, entre todos los
jugadores. Una variante o rasgo no inicia otro contador. El máximo por personaje
permanece independiente del número de propietarios.

El reclamo es la fuente de verdad del starter; evitar duplicarlo en un booleano
del usuario. Su clave es por usuario, independientemente de `starter_v1`: cambiar
las opciones no concede automáticamente un segundo starter. La unidad referenciada
puede pertenecer a otro jugador después de un intercambio y eso no anula el reclamo.
Las claves de premios futuros incluirán el evento o recompensa específica.

`eventos.json` guarda un registro por creación: `id`, `type = unit_created`,
`unitId`, `fromOwnerId = null`, `toOwnerId`, `reason`, `operationKey`, `createdAt`.
Se escribe en el mismo commit que la unidad. El ID y la clave de operación son
únicos. El historial creciente vive fuera de la unidad; `economia.json` tiene
referencias a las recompensas y aperturas que causaron cada crédito o débito.

## Persistencia consistente con varios JSON

Renombrar un archivo temporal protege una escritura individual; no hace atómica
la modificación de varios archivos. El contrato mínimo del adaptador será:

1. Admitir un único proceso escritor y serializar la operación completa en una
   cola, incluyendo lecturas y validación. Recuperar operaciones pendientes antes
   de abrir el bot a comandos. Bloquear lectores mientras se publica un commit.
2. Cargar y validar los archivos bajo ese control; construir el nuevo estado en
   memoria sin tocar los originales.
3. Escribir temporales y journal preparado con contenido anterior/nuevo,
   revisiones esperadas e ID de operación; sincronizarlos antes de continuar.
4. Persistir el marcador de commit: es el punto que decide el resultado. Si falla
   antes de ese marcador, descartar lo preparado; si está comprometido, completar
   el nuevo estado en recuperación, incluso si sólo algunos archivos se publicaron.
5. Publicar todos los archivos, sincronizar entradas del directorio y finalizar
   el journal. Responder éxito sólo tras publicación completa. Si hay fallo después
   del marcador, detener nuevas operaciones hasta completar la recuperación.

La implementación deberá probar interrupciones en cada etapa, detectar journal
corrupto y preservar backups anteriores. Una instancia adicional no puede escribir
en la misma carpeta; verificar exclusividad al arrancar. No prometer consistencia
para procesos externos que editan archivos al margen del adaptador.

El journal guarda las imágenes anterior y nueva completas antes del marcador de
commit, en lugar de una colección de temporales independientes. Para una instalación
nueva preparada, la recuperación termina la inicialización vacía mediante un nuevo
marcador durable; no concede registros ni recompensas de jugadores. Las operaciones
de jugadores preparadas se descartan. Un lock de un proceso terminado se libera
con la herramienta `db:unlock` antes de recuperar; un PID vivo nunca se desbloquea.

## Migración y validación

La primera migración reconoce el array legado de usuarios como esquema 0.
Genera un mapa persistido `jid → userId`, convierte `nombre`, añade defaults y
establece `createdAt = null` si no existe información histórica. Guarda el mapa
y los cambios juntos con backup; repetir después de un fallo produce el mismo
ID. El alcance automático inicial es el array `{ id: jid, nombre }` que generaba
el registro original. Si aparecen unidades legadas u otros campos, se rechaza la
migración sin modificar los originales. Una migración específica deberá reescribir
`ownerId`, equipos y demás referencias mediante ese mapa en el mismo proceso.
No inferir reclamos inexistentes.

Versiones posteriores usan migraciones ordenadas `vN → vN+1`, con validación
antes y después, sin alterar originales antes del commit. Rechazar una versión
más nueva que la soportada. Antes de migrar, conservar una copia coherente de
todos los archivos y journal; verificar que se pueda restaurar.

`validateDatabase()` comprueba estructura y relaciones: IDs e identidades únicos;
propietarios y plantillas existentes; `(characterId, serial)` único; contadores
compatibles con emisiones y supply; reclamos y eventos apuntando a unidades
existentes; equipos sin duplicados ni unidades ajenas; valores numéricos válidos.
En 0.2 se validan ataques, snapshots, secuencia de acciones, HP derivado del
historial, turnos, participantes, ganador, locks y estadísticas de cierre.
En 0.3 se reconstruyen saldo y progreso desde el punto inicial y los premios;
se verifican elegibilidad, cantidades, destinatarios, valores antes/después,
umbral de nivel, crecimiento de stats y recibo exacto del cierre. Las transiciones
exigen registros de recompensa append-only y estados finales inmutables.
Las relaciones de mercado se añadirán cuando exista esa funcionalidad.

## Crecimiento y cambio de almacenamiento

Las consultas por usuario se ofrecen paginadas desde 0.1, aunque el adaptador JSON
todavía tenga que leer todos los registros. Medir tamaño de archivos y tiempos de
lectura/commit; una API paginada por sí sola no reduce ese costo.

Antes de requerir múltiples escritores o introducir compras y trades de varios
activos, revisar la migración a SQLite prevista en `project.md`. El destino debe
preservar IDs, seriales, reclamos, claves de operación y timestamps; verificar
conteos y relaciones antes de cambiar de adaptador.

La futura base tendrá restricciones para identidad, serial y claves idempotentes,
relaciones entre jugadores/unidades/plantillas, y consultas indexadas por
propietario. Los historiales de combate, propiedad, ledger y temporadas crecerán
en colecciones o tablas separadas. Nunca resetear unidades ni contadores de emisión
al iniciar una temporada. Archivar auditoría sólo con una política que conserve
reconstrucción e idempotencia.

## Migración del esquema 1 al 2

El arranque recupera primero journals del esquema anterior. La migración añade
`ataques.json` y `combates.json`, agrega dos referencias de ataque a las plantillas
que las tenían vacías y aumenta su revisión de contenido. Conserva identidades,
equipos, monedas, progreso, seriales, propiedad, stats individuales, reclamos y
auditoría. Los nuevos archivos y las envolturas actualizadas se publican juntos,
con imágenes anteriores para recuperar una interrupción.

El catálogo puede variar después de iniciar una pelea; el motor usa los stats y
ataques copiados en `combates.json`. Una batalla aceptada conserva `rulesVersion`,
snapshots de ambas unidades y un máximo de 50 acciones. No se altera un combate
cerrado ni sus estadísticas por repetir una clave de operación. Los contadores
de combate se actualizan sólo en el cierre transaccional.

## Migración del esquema 2 al 3

Se añade `recompensas.json`, `unit.statGrowthVersion: 1` y un registro
`progressionBaseline` por usuario y unidad en `estado.json`. Su ID es
`progression:<entityId>` y contiene `entityType`, `entityId` y `progress`; el de
usuario también contiene `coins`. Ese registro inmutable captura los valores
existentes, incluidos saldos o niveles no nulos, sin corregirlos ni inventar
operaciones anteriores. Un nuevo usuario/unidad comienza con nivel 1, XP 0 y
monedas 0 y recibe su baseline en el mismo commit de creación.

Los combates cerrados existentes reciben `rewardVersion: 0`, `settlement: null` y
no generan recompensas retroactivas. Los pendientes/activos reciben
`rewardVersion: 1`; se liquidan con las reglas 0.3 al terminar. Los snapshots
activos anteriores permanecen intactos: la ausencia histórica de `statsVersion`
representa versión 0 (stats de nacimiento). Las nuevas aceptaciones fijan nivel,
stats efectivos y versión de crecimiento. XP y niveles actuales no reescriben
snapshots antiguos.

La recuperación reconoce journals de esquema 1 (seis archivos), 2 (ocho) y
3 (nueve), incluido el manifest. Una instalación en esquema 1 aplica ambas
migraciones en un único commit con su snapshot previo completo. Una migración
interrumpida se revierte si sólo estaba preparada y se completa si ya estaba
comprometida. La base se valida antes y después de migrar.

## Recompensas y economía 0.3

Cada cierre aceptado en `rewardVersion: 1` agrega dos registros inmutables:

```text
id: reward:<battleId>:<userId>
battleId, userId, unitId, version: 1, reason, createdAt
coins, userXp, unitXp
balanceBefore, balanceAfter
userProgressBefore, userProgressAfter
unitProgressBefore, unitProgressAfter
```

Se conservan incluso con importes cero para explicar rendición temprana,
inactividad o límite por pareja. El recibo `battle.settlement` contiene versión,
motivo, fecha y resúmenes para ambos participantes, con XP/monedas y niveles
anteriores/finales. Las claves por batalla/jugador evitan duplicar premios;
el historial muestra el recibo original, sin recalcularlo con el progreso actual.

Los cambios de monedas pasan por `game/economy/coinOperations.js`, dentro de la
misma transacción que escribe recompensas, XP, resultado, estadísticas y locks.
`game.economy.getBalance()` sólo consulta. No hay compras, retiros, transferencias
ni crédito administrativo en 0.3. En 0.4 se añade el ledger descrito más abajo y
la compra de sobres. Las fuentes y gastos futuros deberán ampliar esta
validación mediante una migración para aceptar nuevas fuentes y gastos, sin
eliminar los registros de premio ni perder sus claves únicas.

`progress.xp` es XP restante para el siguiente nivel, cuyo coste es `100 × nivel`.
Al alcanzarlo se descuenta ese coste; el excedente se conserva. Los límites son
50 para usuario y 20 para unidad; en el límite se sigue acumulando XP sin aumentar
el nivel. Progresos históricos mayores se preservan al migrar; la siguiente
recompensa positiva aplica los umbrales hasta el límite. Una recompensa cero no
cambia un progreso histórico.

El historial se consulta por participante, ordenado por fecha de cierre
descendente con ID de desempate. Los cursores están ligados a cada usuario.
La consulta detallada exige ser participante, incluso al consultarla en privado
o desde otro grupo. Para SQLite, mantener índices por `(userId, finishedAt, id)`
y restricciones únicas por `(battleId, userId)`, además de todas las referencias.

## Sobres, drops y coleccionables 0.4

`sobres.json` contiene el Sobre Básico (`id: basico`, `revision: 1`, `price: 500`).
Su `pool` define rarezas, pesos enteros y IDs de personaje; `traitWeights` define
pesos por cantidad de rasgos y `variantWeights` pesos por variante. El catálogo
se siembra sólo en instalaciones nuevas o durante la migración: no se reemplaza
al arrancar. Un cambio de contenido debe incrementar la revisión del sobre.

El motor comprueba catálogo actual, emisión abierta y contador global antes de
sortear. Elimina candidatos agotados y rarezas sin candidatos; conserva los
pesos relativos restantes. Selecciona uniforme dentro de cada rareza. El mismo
contador asigna seriales para starter, sobre y emisiones administrativas; las
variantes no tienen un supply independiente. Un sobre vacío falla antes del
descuento. La aleatoriedad criptográfica admite pesos enteros con suma menor
que `2^48`; la inyección de un RNG se limita al API interno para pruebas.

Las unidades nuevas tienen `traitVersion: 1`, cero a dos rasgos distintos entre
`robust`, `aggressive` y `resolute`, y una variante `normal`, `shiny` o `golden`.
Se calculan los stats del nivel y después los bonos: Robusto agrega 3% HP
redondeado hacia abajo; Agresivo +1 ataque; Firme +1 defensa. La variante no
modifica stats. `initialStats`, rasgos, variante y versión de rasgos son identidad
de nacimiento inmutable. Los snapshots nuevos copian rasgos, variante y
`traitVersion` además de `statsVersion`; los anteriores siguen usando su regla
histórica. Un futuro cambio de efectos debe añadir otra versión, conservando
la anterior para validar resultados históricos.

Cada apertura guarda un registro append-only en `aperturas.json`:

```text
id: OPEN-<uuid>, userId, packId, packRevision, operationKey, createdAt
price, balanceBefore, balanceAfter, unitId
packSnapshot: definición completa del sobre al comprar
result: characterId, characterRevision, characterName, rarity, serial,
        traits, variant, traitVersion
```

La unidad emitida tiene `origin: {type: "pack", sourceId: opening.id}`. Su evento
usa `operationKey: "opening:" + opening.id`. La validación exige un vínculo
exacto entre recibo, unidad, evento, revisión, rareza, precio y movimiento
monetario. El snapshot de compra puede tener una revisión anterior a la vigente;
una revisión futura se rechaza. No se admite falsificar origen de sobre mediante
el servicio general de emisión.

La clave de apertura es globalmente única. WhatsApp la deriva de identidad,
conversación e ID autenticado del mensaje; sin ese ID se rechaza la compra.
Un replay devuelve la compra persistida antes de comprobar saldo o tirar dados.
El recibo mantiene sus cantidades originales; una consulta pública de unidad
sólo expone nombre/revisión del sobre, sin saldos ni datos privados de compra.

## Movimientos de monedas 0.4

`economia.json` registra créditos de batalla y débitos de sobres, incluso los
créditos cero, para mantener la secuencia exacta de cada saldo:

```text
id: coin:<sourceId>, userId, type: credit|debit
sourceType: battle_reward|pack_opening, sourceId
amount, balanceBefore, balanceAfter, createdAt
```

Cada recompensa y apertura tiene exactamente un movimiento con la misma
identidad, importe, fecha y saldo antes/después. El ledger es append-only;
la validación recorre sus registros desde los baselines existentes y compara
el total con `user.economy.coins`. Una compra puede aparecer entre dos premios
sin romper la reconstrucción. La XP sigue recorriendo sólo recompensas de
batalla. Crédito, débito, recibo y demás cambios se publican en la misma
transacción; no existe una API de jugador para dar o retirar monedas libremente.

El ledger actual cubre esas dos fuentes. Añadir daily, transferencias, otras
monedas o gastos en Alpha 0.5 y posteriores exige extender y versionar las
fuentes y validadores. Conservar IDs, baselines, orden, claves de operación y
referencias al migrar a SQLite; no recomputar compras con precios actuales.

## Migración del esquema 3 al 4

Se añaden `sobres.json`, `aperturas.json` y `economia.json`; los sobres se siembran,
las aperturas empiezan vacías y cada recompensa histórica produce un crédito
determinista `coin:<reward.id>` con sus importes originales. No se acredita
dinero nuevo: el backfill reconstruye movimientos ya incluidos en los saldos.

Cada unidad preexistente recibe `traitVersion: 0`. Se conservan sus strings de
rasgos y variante, sin adquirir nuevos bonos. IDs, seriales, unidades, propietarios,
saldos, XP, estadísticas, orígenes y snapshots activos/cerrados permanecen intactos.
La migración valida el esquema 3 antes de cambiarlo y el 4 antes de publicarlo.

El journal admite esquema 4 con doce archivos, incluido `_database.json`, además
de los journals anteriores de seis, ocho y nueve archivos. Desde esquemas 1 o
2 se aplica toda la cadena en un único commit con backup de los originales.
Las fases preparadas se revierten; las comprometidas se completan. La presencia
inesperada de archivos nuevos junto a un esquema antiguo bloquea la migración
para conservar evidencia, en vez de sobrescribirlos.

## Migración del esquema 4 al 5

El balance 0.4.1 conserva las once colecciones y actualiza sus envolturas al
esquema 5 en un mismo commit con backup. Las plantillas aumentan su revisión,
reciben los stats del balance versionado y pasan a emisión limitada según su
rareza. Si ya tenían un máximo menor, se conserva ese máximo.

Para cada unidad anterior se calcula:

```text
combatBaseStats = initialStats + (stats del balance 0.4.1 − stats canónicos anteriores)
statGrowthVersion = 2
```

El ajuste se aplica por stat y preserva la variación individual de nacimiento.
Un personaje ajeno al catálogo de balance conserva su base anterior. Una unidad
nueva guarda directamente su base de emisión en `combatBaseStats`.
`initialStats`, serial, revisión de emisión, origen, dueño, progreso, rasgos y
variante permanecen intactos. Las recompensas, movimientos de monedas, recibos,
estadísticas y snapshots de combates anteriores tampoco se reescriben.

Si un contador ya supera el nuevo máximo, la plantilla conserva ese total en
`supply.grandfatheredIssued`. Por ejemplo, con 54 unidades comunes ya emitidas:

```json
{ "type": "limited", "max": 50, "grandfatheredIssued": 54 }
```

Se validan las 54 unidades existentes y se bloquea cualquier nueva emisión del
personaje. No se borran unidades ni se reducen contadores para ajustar el máximo.
Cuando existe `grandfatheredIssued`, el cupo disponible es cero y el contador
debe permanecer igual al total heredado. El marcador mantiene la emisión
cerrada incluso si después aumenta el máximo o cambia la rareza.

Una partida aceptada antes de migrar conserva su snapshot de versión 0 o 1 y
se termina con esos valores. Una aceptación posterior fija `statsVersion: 2`
y copia la base de combate en el snapshot; a partir de ella se validan crecimiento
y rasgos sin depender del catálogo vigente. Los resultados ya cerrados siguen
siendo inmutables.

La recuperación admite journals de esquema 5 con doce archivos, además de
todos los anteriores. Desde esquemas previos, el arranque aplica la cadena
completa con validación y un backup coherente. Un cambio posterior de balance
debe añadir otra versión y su migración; modificar una constante histórica o
sobrescribir catálogos al arrancar impediría validar partidas anteriores.
