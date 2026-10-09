# Modelo de datos para el MVP 0.1 y su evolución

Estado: contrato implementado hasta 0.2 (esquema 2), basado en `../project.md`.
Los mecanismos descritos como futuros aún requieren servicios y migraciones.
El alcance se divide en [fundación 0.1](mvp-0.1.md) y [combate 0.2](mvp-0.2.md).

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
| `estado.json` | Contadores de emisión y reclamos idempotentes. |
| `eventos.json` | Creaciones auditables; después, cambios de propiedad. |
| `ataques.json` | Definiciones de ataques versionadas, potencia y precisión. |
| `combates.json` | Desafíos, snapshots, acciones, turnos y resultados. |

Además, `_database.json` marca la instalación, `_journal.json` coordina un commit
pendiente y `backups/` conserva snapshots coherentes del estado anterior.

Cada colección emplea esta envoltura; el adaptador oculta la envoltura a servicios:

```json
{
  "_meta": {
    "schemaVersion": 2,
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
  "revision": 1,
  "name": "Panda Guerrero",
  "unitPrefix": "PAND",
  "rarity": "common",
  "role": "tank",
  "baseStats": { "hp": 120, "attack": 24, "defense": 22, "speed": 8 },
  "statVariation": { "hp": 0, "attack": 0, "defense": 0, "speed": 0 },
  "attackIds": ["panda_guerrero_1", "panda_guerrero_2"],
  "supply": { "type": "unlimited", "max": null },
  "obtainable": true,
  "starterEligible": true
}
```

Estos números ilustran la estructura; el balance requiere revisión de contenido.
Rarezas iniciales: `common`, `rare`, `epic`, `legendary`, `mythic`.
`role` es descriptivo; rareza no aplica automáticamente multiplicadores de fuerza.
`attackIds` contiene dos referencias del catálogo de ataques; cada combate
congela sus definiciones completas al ser aceptado.
Una emisión limitada usa `supply.type = limited` y `max` entero positivo.
La variación permitida está acotada a 1,000,000 por stat; en el catálogo inicial
es cero. El primer catálogo establece supply 500 para Dragón Carmesí.

`obtainable = false` cierra nuevas emisiones; las unidades existentes continúan
siendo válidas. No borrar ni renombrar IDs o prefijos que ya emitieron unidades.
No reducir `max` por debajo de lo emitido; los cambios de límites o rareza requieren
decisión de contenido explícita. Cambiar stats incrementa `revision` y no reescribe
silenciosamente unidades existentes.

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
  "progress": { "level": 1, "xp": 0 },
  "traits": [],
  "variant": "normal",
  "battleStats": { "wins": 0, "losses": 0 },
  "lock": null
}
```

`initialStats` conserva los valores generados al emitir, con variación aplicada
una sola vez. Los stats efectivos futuros se calcularán con una regla de progresión
versionada y se copiarán al snapshot de combate. El balance de unidades existentes
se hará mediante una operación explícita, no recargando el catálogo en cada turno.

ID, `characterId`, `serial`, origen y fecha de creación son identidad de emisión
inmutable. `ownerId` cambia sólo mediante un servicio transaccional. Para evolución
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

El reclamo es la fuente de verdad del starter; evitar duplicarlo en un booleano
del usuario. Su clave es por usuario, independientemente de `starter_v1`: cambiar
las opciones no concede automáticamente un segundo starter. La unidad referenciada
puede pertenecer a otro jugador después de un intercambio y eso no anula el reclamo.
Las claves de premios futuros incluirán el evento o recompensa específica.

`eventos.json` guarda un registro por creación: `id`, `type = unit_created`,
`unitId`, `fromOwnerId = null`, `toOwnerId`, `reason`, `operationKey`, `createdAt`.
Se escribe en el mismo commit que la unidad. El ID y la clave de operación son
únicos. El historial creciente vive fuera de la unidad; el ledger monetario futuro
tendrá su propia colección y referencias a la operación que lo causó.

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
