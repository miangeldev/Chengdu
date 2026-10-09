# Preparación del MVP 0.1

Fecha: 2026-10-07. Fuente: `../project.md`, especialmente secciones 80,
92–94, 105 y 118. Estado: implementación local completada con pruebas automatizadas.
El contrato de datos está en `database.md`; las instrucciones de ejecución e
integración están en `../README.md`. La prueba en WhatsApp real requiere el bot
anfitrión, que no forma parte de esta carpeta.

La etapa siguiente también está implementada: [MVP 0.2](mvp-0.2.md). Los módulos
de comando se encuentran ahora en `plugins/`. Este documento conserva el alcance
y las decisiones de la fundación.

## Resultado y alcance

Un usuario puede registrarse, elegir una sola vez su personaje inicial, consultar
su perfil, listar su colección y mostrar una unidad única con propietario.
El flujo debe conservarse después de reiniciar el bot.

| Comando | Comportamiento previsto |
| --- | --- |
| `.cturegistro Miguel` | Registrar al remitente con nombre válido; impedir duplicados. |
| `.ctuperfil` | Mostrar el perfil propio y el estado del starter. |
| `.ctucatalogo` | Consultar plantillas disponibles, con paginación. |
| `.ctustarter` | Mostrar las tres opciones iniciales. |
| `.ctustarter panda` | Reclamar Panda Guerrero; admitir también `mago`, `lobo` y números 1–3. |
| `.ctupersonajes` | Listar las unidades propias, con paginación. |
| `.ctuunidad PAND-000001` | Mostrar identidad, serial, stats, origen y propietario público. |

`ctucatalogo` es una propuesta para distinguir catálogo de colección. Conservar
el contrato de los módulos existentes: exportaciones `command` y
`run(sock, msg, args)`.

Combate, gestión de equipos, premios de XP, sobres, mercado y transferencias
jugables corresponden a las siguientes versiones. Sus referencias y límites de
datos quedan definidos en [database.md](database.md).

## Estado inicial observado durante la preparación

- `CTU-database.js` ya implementa `crearDatabase`, `cargar`, `guardar`, `existe`
  y `eliminar`, con lecturas/escrituras síncronas.
- `ChengdúData/databases.js` declara únicamente `usuariosDB`, con un array inicial.
- `commands/CTU-registro.js` valida nombre no vacío y duplicado por remitente,
  pero contiene acceso a almacenamiento y reglas del dominio.
- No hay archivos de jugadores, catálogo o unidades presentes en esta revisión.
- No hay `package.json`, arranque del bot, cargador de comandos ni pruebas en esta
  carpeta. La integración real con WhatsApp dependerá del bot que cargue estos módulos.
- La carpeta no tiene repositorio Git inicializado.

## Decisiones de arquitectura

```text
Comandos de WhatsApp
        ↓
Servicios de usuarios / personajes / unidades / starter
        ↓
Repositorios dentro de una unidad de trabajo
        ↓
Adaptador multi-JSON
```

Los comandos obtienen una identidad del contexto autenticado y presentan
resultados. Los servicios validan reglas. Los repositorios consultan y persisten
entidades. El adaptador conoce archivos, versiones y recuperación.

Conservar la estructura actual, sin trasladar todo a `src/`:

```text
CTU-database.js
ChengdúData/databases.js
plugins/CTU-*.js
game/users/userService.js
game/characters/characterService.js
game/units/unitService.js
game/units/unitGenerator.js
game/rewards/starterService.js
repositories/usuariosRepository.js
repositories/personajesRepository.js
repositories/unidadesRepository.js
storage/unitOfWork.js
storage/migrations/
utils/GameError.js
docs/
tests/
```

Esta estructura se implementó junto con un adaptador en `interfaces/whatsapp/`,
pruebas, un catálogo inicial y herramientas de validación y desbloqueo.

La API de servicios y repositorios será asíncrona, aunque el primer adaptador use
archivos síncronos. `withTransaction(async repos => ...)` delimita operaciones
que modifican varios registros. Los repositorios recibidos en esa operación
comparten estado y commit; no escriben archivos por separado durante el servicio.
Esto permite cambiar de almacenamiento sin cambiar los comandos ni las reglas.

## Hallazgos iniciales resueltos en la implementación

| Hallazgo | Consecuencia | Trabajo previsto |
| --- | --- | --- |
| `DATA_DIR = './ChengdúData'` | El bot puede leer o crear otra base al arrancar desde otro directorio. | Resolver ruta desde el módulo; permitir ruta explícita en pruebas. |
| `cargar()` atrapa cualquier error y retorna el valor inicial | Una lectura fallida puede parecer una base vacía y facilitar una sobrescritura. | Error explícito ante corrupción o falta de permisos; inicializar sólo archivos ausentes en una base nueva. |
| `guardar()` escribe sobre el archivo final | Una interrupción puede dejar JSON parcial. | Temporal en el mismo directorio, sincronización y sustitución; backup y recuperación. |
| No hay commit entre archivos | Puede existir unidad sin reclamo registrado, o reclamo sin unidad. | Journal recuperable y una cola de escritura que cubra toda la operación. |
| Registro escribe directamente | Las reglas se duplicarían en nuevos comandos. | Migrar a `userService` y repositorio. |
| El usuario actual usa el JID como ID | Propiedad ligada al transporte y posibles cambios de identificador. | ID interno estable y vinculación de identidades; migración explícita. |

El arranque debe distinguir una instalación nueva de una existente incompleta:
un archivo de estado faltante en una base existente requiere recuperación, no
reinicialización silenciosa. Proteger `eliminar()` como operación de mantenimiento;
no exponerlo a servicios del juego.

## Orden de implementación

1. **Preparar ejecución e integración.** Definir ESM, runtime compatible y comando
   de pruebas según el bot anfitrión. Mantener las exportaciones actuales. Separar
   datos de prueba y de producción.
2. **Almacenamiento y migración.** Añadir envoltura de versión, validación, rutas
   estables, backups y recuperación del commit. Migrar usuarios existentes sin
   perder nombre ni identidad. Detalles en `database.md`.
3. **Repositorios y usuarios.** Registro mediante servicio; nombre de 1–40 puntos
   de código después de trim, sin caracteres de control. Identidad válida y única;
   perfil con valores iniciales completos.
4. **Catálogo.** Sembrar ocho plantillas de la propuesta original: Panda Guerrero,
   Mago Carmesí, Lobo Sombrío, Monje Celestial, Guardián Jade, Bruja Lunar, Dragón
   Carmesí y Espíritu Bambú. Tres starters disponibles con supply ilimitado.
   Stats y rarezas quedan como datos de contenido revisables, no reglas de código.
5. **Generación de unidades.** Una sola vía de creación; verificar propietario,
   plantilla, disponibilidad, contador y supply; registrar procedencia y stats
   individuales. La variación puede ser cero en 0.1; traits vacíos y variante normal.
6. **Starter.** Reclamo persistente por usuario, unidad y contador en el mismo
   commit. Si se repite la acción, devolver el reclamo original sin generar nada.
7. **Interfaz y cierre.** Perfil, catálogo, colección y detalle; errores del dominio
   convertidos en respuestas cortas; comprobar el flujo persistente completo.

Los prefijos de unidades serán únicos y estables (`PAND`, `MAGC`, `LOBO`, etc.).
Los números se rellenan a seis posiciones como mínimo; superar ese ancho no debe
truncar seriales ni cambiar IDs existentes. La selección por número del starter
mantiene un orden configurado estable.

## Contratos previstos

| Servicio | Operaciones principales |
| --- | --- |
| Usuarios | `registerUser({ identity, name })`, `getUser(userId)` |
| Personajes | `getCharacter(characterId)`, `listCharacters({ cursor, limit })` |
| Unidades | `createUnit({ characterId, ownerId, origin, operationKey })`, `getUnit(unitId)`, `getUserUnits(ownerId, { cursor, limit })` |
| Starter | `getStarterOptions()`, `claimStarter({ userId, choice })` |
| Persistencia | `withTransaction(work)`, `validateDatabase()`, migración y recuperación al arrancar |

`createUnit` es una operación interna del juego: el comando no puede inventar
`ownerId`, `origin`, stats o supply. Cuando starter invoque la creación, ambos
participan de la misma transacción, sin commits anidados.

Las consultas devuelven copias o resultados de lectura, no referencias que
permitan cambiar estado por fuera de un servicio. La colección se ordena por
`createdAt` e `id`, con cursor y un límite inicial de 10, máximo 25.

Errores previstos: `USER_NOT_FOUND`, `USER_ALREADY_EXISTS`, `INVALID_NAME`,
`INVALID_IDENTITY`, `CHARACTER_NOT_FOUND`, `UNIT_NOT_FOUND`, `INVALID_STARTER`,
`CHARACTER_UNAVAILABLE`, `SUPPLY_EXHAUSTED`, `DATABASE_CORRUPT`,
`UNSUPPORTED_SCHEMA_VERSION` y `STORAGE_WRITE_FAILED`.
Una repetición del starter es un resultado idempotente, no una nueva emisión.

## Criterios de aceptación

- Registrar dos jugadores, reclamar starters, listar e inspeccionar sus unidades;
  reiniciar y obtener exactamente los mismos IDs, propietarios y reclamos.
- Rechazar nombres vacíos, largos o con controles; impedir registro duplicado
  también con dos llamadas simultáneas.
- Dos reclamos simultáneos del mismo jugador crean exactamente una unidad,
  incluso si solicitan opciones distintas; el segundo recibe el resultado original.
- Cada unidad apunta a un usuario y plantilla existentes; ID y serial de emisión
  son únicos; contadores no retroceden ni reutilizan números.
- Probar supply limitado con un fixture: dos solicitudes por el último cupo
  producen una sola creación.
- Simular fallo antes y después del punto de commit del starter; recuperar todo
  el estado anterior o todo el nuevo antes de atender comandos.
- JSON corrupto, versión desconocida o errores de lectura impiden escrituras;
  los originales quedan disponibles para diagnóstico y recuperación.
- Migrar un array legado `{ id: jid, nombre }`; repetir la migración conserva
  resultados y referencias sin duplicaciones.
- Consultas paginadas no mezclan colecciones ni exponen el JID de otro usuario.
- Probar servicios sin WhatsApp y comandos con `sock.sendMessage` simulado;
  completar una prueba manual con el bot anfitrión para validar identidad y carga.

## Siguientes versiones

| Momento | Preparación de datos en 0.1 | Funcionalidad posterior |
| --- | --- | --- |
| 0.2 | `team` como lista de IDs; stats iniciales y revisión de plantilla. | Equipos y combate con snapshots persistidos. |
| 0.3 | Progreso separado para usuario/unidad; timestamps UTC. | XP, niveles y recompensas idempotentes. |
| 0.4 | Seriales, supply de emisión, origen, traits y variante. | Sobres, drops y reglas de variación. |
| 0.5–0.6 | Monedas enteras, propietario único, lock opcional y eventos externos. | Ledger, transferencias y mercado atómico. |
| Posterior | Versiones de esquema y repositorios transaccionales. | Migración a SQLite, temporadas y telemetría. |

Preparar contratos y valores iniciales no habilita esas mecánicas. El criterio
para cerrar 0.1 sigue siendo registro → starter → consulta de propiedad persistente.
