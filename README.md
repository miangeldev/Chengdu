# Chengdú Cards — MVP 0.2

Módulo de juego para un bot de WhatsApp: registro, perfil, catálogo de ocho
personajes, starter único, colección, equipos y combate 1 contra 1 por turnos.
La interfaz usa secciones, emojis, negritas, saltos de línea y separadores ASCII.
Los datos persisten en varios JSON, con repositorios, servicios y commits recuperables.

Requiere Node.js 22 o superior en Linux; verificado con Node.js 26.8.2. No tiene dependencias
externas. Esta carpeta contiene el juego y su adaptador de comandos; la sesión de
WhatsApp y el arranque del bot se integran desde el proyecto anfitrión.

## Preparar y verificar

```sh
npm test
npm run db:validate
```

El segundo comando inicializa la base vacía y el catálogo si se trata de una
instalación nueva; en instalaciones existentes valida o migra el formato original
de usuarios. Desde el esquema 1, añade ataques y combates con una migración
recuperable, conservando unidades e identidades. La ruta por defecto es `ChengdúData/` junto al módulo, independiente
del directorio desde el que se ejecute el bot.

Para una ruta distinta:

```sh
npm run db:validate -- /ruta/absoluta/datos
```

Las pruebas usan directorios temporales, un socket simulado y procesos hijos;
no se conectan a WhatsApp ni escriben jugadores de prueba en la base del juego.

## Comandos

| Comando | Uso |
| --- | --- |
| `.cturegistro Miguel` | Crear jugador; nombre de 1–40 caracteres. |
| `.ctuperfil` | Ver perfil propio, monedas iniciales y estado del starter. |
| `.ctucatalogo` | Ver las plantillas del catálogo. |
| `.ctustarter` | Ver las tres opciones iniciales. |
| `.ctustarter panda` | Elegir Panda Guerrero; también `mago`, `lobo`, `1`, `2` o `3`. |
| `.ctupersonajes` | Ver colección propia. |
| `.ctuunidad PAND-000001` | Ver una unidad y su propietario público. |
| `.ctuayuda` | Guía de comandos y pasos para empezar. |
| `.ctuequipo usar PAND-000001` | Seleccionar una unidad propia; sin argumentos muestra el equipo. |
| `.ctupelea @jugador` | Enviar un desafío en un grupo. |
| `.ctuaceptar` | Aceptar un desafío recibido. |
| `.cturechazar` | Rechazarlo. |
| `.ctucancelar` | Retirar el desafío enviado. |
| `.ctuatacar 1` / `.ctuatacar 2` | Usar un ataque durante tu turno. |
| `.ctucombate` | Ver el estado o resultado reciente en ese grupo. |
| `.cturendirse` | Rendirse y terminar el combate. |

Catálogo y colección muestran el comando de la siguiente página cuando existe.
Un starter repetido devuelve la unidad original; cambiar la opción no crea otra.
El detalle público muestra el ID interno y nombre del propietario, sin su JID.

## Primer combate

Ambos jugadores se registran, reclaman el starter y usan `.ctuequipo usar ID`.
En un grupo, uno menciona al otro con `.ctupelea @jugador`; el destinatario usa
`.ctuaceptar`. El más rápido empieza y el bot muestra los ataques disponibles.

El ataque 1 tiene potencia 25 y precisión 100%; el ataque 2 tiene potencia 40 y
precisión 80%. Cada turno muestra daño, HP y quién debe actuar. Al ganar o rendirse,
se actualizan estadísticas y se liberan ambas unidades. XP, monedas ganadas y
recompensas corresponden al siguiente milestone.

Los desafíos vencen en 5 minutos y los combates tras 30 minutos sin una acción.
La expiración se procesa al consultar perfil, unidades, equipos o batallas; el
anfitrión también puede llamar a `game.battle.sweepExpired()` periódicamente.

## Revisar la interfaz

```sh
npm run preview:whatsapp
```

Genera [14 ejemplos de los mensajes](docs/whatsapp-preview.md) usando una base
temporal y jugadores ficticios: registro, perfil, colección, starter, equipo,
desafío, turnos, errores y resultado. No envía mensajes a WhatsApp real.

## Integración con el bot

Si el bot ya carga archivos de comandos, cada `plugins/CTU-*.js` mantiene las
exportaciones `command` y `run(sock, msg, args = [])` del registro original. Todos
comparten la misma instancia de almacenamiento. No registrar también el router
si el cargador ya ejecuta estos comandos.

También se puede conectar el router al manejador existente:

```js
import { game } from './game/index.js';
import { createCommandRouter } from './interfaces/whatsapp/index.js';

// Hacer esto al arrancar, antes de aceptar comandos.
await game.validateDatabase();
await game.battle.sweepExpired();
const routeGameCommand = createCommandRouter({ game });

// El bot anfitrión obtiene body del mensaje y entrega metadatos autenticados.
export async function onIncomingMessage(sock, msg, body) {
  if (await routeGameCommand(sock, msg, body)) return;
  // Continuar con otros comandos del bot.
}
```

El socket debe proporcionar `sendMessage(chatId, { text })`. Se usa
`msg.key.remoteJid` como chat y `msg.key.participant` como remitente en grupos.
Para mensajes propios (`fromMe`) se usa `sock.user.id`. El anfitrión debe filtrar
eventos ajenos a conversaciones admitidas y duplicados de transporte según su
propio ciclo de mensajes. Entregar `msg.key.id` permite deduplicar acciones
aplicadas. Los desafíos resuelven las menciones desde
`msg.message.extendedTextMessage.contextInfo.mentionedJid` (también se admite
contexto en imagen o video); no usan un JID escrito como argumento.

Al cerrar el bot, esperar `await game.close()` después de detener la entrada de
mensajes. El cierre normal del proceso también libera el lock, pero el cierre
explícito espera las operaciones en curso.

Para almacenamiento propio, crear una sola instancia e inyectarla en el router:

```js
import { createGame } from './game/createGame.js';
const game = createGame({ directory: '/ruta/absoluta/datos' });
```

No crear una instancia por mensaje ni dos instancias para la misma carpeta.
Los servicios del juego se pueden usar sin WhatsApp.

## Diagnosticar errores del bot

El mensaje «No pude confirmar la operación» indica que el comando falló. El log
del servidor incluye el comando, la versión de Node.js y el error original con
su traza y causas en un solo texto, incluso si el logger del anfitrión sólo
acepta un argumento. Si inyectas un `logger`, recibe
`logger(message, { code, command, runtime, error })`; `message` ya contiene el
diagnóstico completo.

El debug de WhatsApp está activado en [CTU-config.js](CTU-config.js) durante esta
etapa de desarrollo. En un fallo interno, añade una sección «🐛 Debug activado»
con el comando, versión de Node, excepción, traza y causas. El texto largo se
recorta en WhatsApp y se conserva completo en consola. Para ocultarlo, cambia
`debug: true` a `debug: false` en ese archivo.

También puedes usar la variable de entorno `CTU_DEBUG=1` para activarlo o
`CTU_DEBUG=0` para apagarlo; sobrescribe el archivo de configuración. Si usas el
router, `createCommandRouter({ game, debug: true })` o `debug: false` tienen
prioridad sobre ambos. Los plugins cargados directamente usan la configuración
común y la variable de entorno. Los errores de uso, como un nombre inválido,
conservan su explicación normal.

Después de actualizar plugins, interfaces o servicios, reinicia el proceso del
bot. La recarga de un plugin puede conservar sus módulos importados en la caché
de Node.js y mezclar versiones. Si falla de nuevo, conserva el bloque completo
de la consola desde `Chengdú:` hasta el final de la traza. Para comprobar los
JSON con `npm run db:validate`, detén antes el bot que utiliza esa misma carpeta.

## Identidad y compatibilidad

Los jugadores tienen ID interno permanente; los JID se guardan como identidades
vinculadas. Los sufijos de dispositivo se normalizan. Un LID y un JID telefónico
son identidades distintas hasta que el anfitrión verifique que corresponden al
mismo jugador. Entonces puede invocar la API interna:

```js
await game.users.linkIdentity({
  userId: jugadorVerificado.id,
  identity: { provider: 'whatsapp', subject: jidVerificado }
});
```

Esta API no es un comando de jugador. No enlazar cuentas basándose en nombres o
en identidades que el usuario escriba como argumentos. Si las dos identidades ya
pertenecen a usuarios diferentes, se rechaza el enlace; fusionar cuentas requiere
una migración administrativa específica.

La migración automática admite el formato que producía el comando original:
`[{ "id": "...@s.whatsapp.net", "nombre": "Miguel" }]`. Conserva los nombres,
asigna IDs deterministas y persiste el mapa de identidades. Las fechas de registro
desconocidas quedan en `null`. Si hay otros campos o colecciones legadas, se detiene
y conserva los originales para diseñar su migración sin perder información.

`ChengdúData/databases.js` ahora exporta `gameDatabase`, la unidad de trabajo
compartida. El antiguo acceso directo `usuariosDB.cargar()/guardar()` se reemplazó
por servicios y repositorios. `crearDatabase()` sigue disponible para archivos
independientes; rechaza modificaciones directas de colecciones administradas.

## Persistencia y recuperación

`usuarios.json`, `personajes.json`, `unidades.json`, `estado.json`, `eventos.json`,
`ataques.json` y `combates.json`
incluyen versión de esquema 2 y revisión. `_database.json` identifica la instalación.
`_journal.json` existe mientras hay un commit pendiente. Cada operación que cambia
datos guarda previamente una copia coherente en `backups/<id-operación>/`.

Una cola serializa lecturas y escrituras. El lock `.writer.lock` permite un proceso
por carpeta. Las publicaciones de archivos usan temporales, sincronización y
renombrado; el journal decide si se descarta una operación preparada o se completa
una ya comprometida. La creación de unidad, contador, reclamo y evento de auditoría
ocurre en el mismo commit. Las acciones de combate, estadísticas y locks también
se coordinan mediante el mismo mecanismo. La recuperación se ejecuta antes de atender consultas.

Después de una terminación abrupta que deje el lock, detener las instancias del
bot y ejecutar una sola vez:

```sh
npm run db:unlock
npm run db:validate
```

Ambos admiten un directorio alternativo como último argumento. `db:unlock` sólo
retira el lock si el PID registrado ya no existe. Si el PID sigue vivo, pertenece
a otro proceso por reutilización o el lock está corrupto, se requiere inspección
administrativa; no se borra automáticamente. No lanzar desbloqueos simultáneos.

Si el JSON, journal o versión son inválidos, o hay cambios externos incompatibles
con una recuperación, el juego se detiene sin reemplazarlos por datos vacíos.
Conservar los archivos y backups al diagnosticar. No editar JSON mientras el bot
esté activo. Para restaurar, detenerlo y recuperar el conjunto completo de una
copia coherente; mezclar archivos de snapshots distintos rompe referencias.

Los backups se conservan sin poda automática: controlar su tamaño y definir
retención antes de aumentar el volumen. Los historiales de auditoría están fuera
de las unidades. Las consultas son paginadas, aunque JSON aún carga y valida el
estado completo. Antes de usar múltiples escritores o un mercado de varios
activos, revisar la migración a SQLite prevista en el diseño.

## Alcance validado

75 pruebas verificadas con `node --test --test-isolation=none`: persistencia al
reabrir, registro/starter concurrentes, supply, identidades, cursores, migraciones
desde esquema 1, journals antiguos, integridad y recuperación de commits. También
cubren equipos, snapshots, turnos, precisión, duplicados, victoria, rendición,
expiración y estadísticas. Se interrumpe realmente un proceso con `SIGKILL`.
También se comprueban las trazas de error y los 15 plugins mediante sus
exportaciones `run`, con una base compartida y sin inyectar el juego del router.
El debug se verifica activado y desactivado, con causas anidadas, loggers que
sólo aceptan un argumento y límites de longitud del mensaje de WhatsApp.
La validación con una sesión real de WhatsApp queda pendiente del bot anfitrión.

XP ganado, sobres, transferencias, mercado y combate avanzado pertenecen
a las siguientes versiones. El modelo ya conserva progreso, procedencia,
revisiones de contenido, seriales, stats individuales, traits y variante.

Diseño: [fundación 0.1](docs/mvp-0.1.md), [combate 0.2](docs/mvp-0.2.md),
[modelo de datos](docs/database.md) y
[visión completa](project.md).
