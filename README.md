# Chengdú Cards — Alpha 0.4.1

Módulo de juego para un bot de WhatsApp: registro, perfil, catálogo de ocho
personajes, starter único, colección, equipos y combate 1 contra 1 por turnos,
con XP, niveles independientes de jugador/unidad, ChengCoins e historial.
Los sobres permiten conseguir nuevas unidades con rareza, rasgos y variantes.
El balance 0.4.1 distingue la fuerza de las rarezas y limita la emisión global
de cada personaje, conservando las unidades y partidas anteriores.
Toda la interfaz usa mensajes compactos, emojis, negritas y un siguiente paso
claro. Los combates muestran barras de vida de texto y dos ataques por turno.
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
de usuarios. Desde los esquemas 1, 2, 3 y 4, migra al esquema 5 con backup y recuperación,
conservando unidades, identidades, saldos, XP, recibos y combates anteriores. La ruta por defecto es `ChengdúData/` junto al módulo, independiente
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
| `.ctuperfil` | Ver nivel, XP hacia el siguiente nivel, monedas y estadísticas. |
| `.ctubalance` | Ver ChengCoins y reglas de recompensa. |
| `.ctusobres` | Ver sobres, precio y probabilidades según disponibilidad. |
| `.ctuabrir basico` | Gastar 500 ChengCoins y obtener una unidad con rasgos/variante. |
| `.ctuhistorial` | Ver tus partidas terminadas, cinco por página y desde cualquier chat. |
| `.ctuhistorial BTL-…` | Consultar turnos, resultado y recompensa original de una partida propia. |
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
| `.ctuficha` / `.ctuficha PAND-000001` | Consultar estadísticas, potencia y precisión del combate, equipo o unidad indicada. |
| `.ctuficha panda` | Comparar la plantilla de un personaje antes de elegir; también `mago`, `lobo` o el ID del catálogo. |
| `.cturendirse` | Rendirse y terminar el combate. |

Catálogo y colección muestran cinco entradas por página, con el comando de la
siguiente página cuando existe. Los IDs aparecen al copiar una acción o consultar
una ficha. Registro, perfil y equipo priorizan el resumen y el próximo paso.
Un starter repetido devuelve la unidad original; cambiar la opción no crea otra.
El detalle público muestra el ID interno y nombre del propietario, sin su JID.

## Abrir un sobre

Combatir da monedas para ampliar la colección. `.ctusobres` muestra el Sobre
Básico, de 500 ChengCoins; `.ctuabrir basico` compra y entrega una unidad en una
sola acción. El recibo muestra personaje, rareza, variante, rasgos y saldo
restante, con comandos para inspeccionar o seleccionar la unidad.

Los pesos iniciales son 70% común, 22% raro, 7% épico y 1% legendario. El motor
excluye personajes agotados o con emisión cerrada; si se agota una rareza,
normaliza los pesos de las demás y muestra las probabilidades actuales. Si no
queda ningún candidato, rechaza la apertura sin cobrar. Los seriales y límites
de emisión se comparten entre todas las fuentes de unidades.

Cada unidad de sobre tiene 80% de salir sin rasgos, 19% con uno y 1% con dos
distintos: Robusto (+3% HP, redondeado hacia abajo), Agresivo (+1 ataque) y
Firme (+1 defensa). Las variantes son 94% Normal, 5% Shiny y 1% Dorada; son
cosméticas. Rasgos/variante se generan una sola vez y no cambian los stats de
nacimiento. `.ctuficha` muestra sus efectos en los stats del nivel actual.

El bot necesita el ID autenticado del mensaje para comprar: repetir el mismo
mensaje devuelve el recibo original sin cobrar ni sortear otra vez, incluso
después de un reinicio o fallo al enviarlo. Un mensaje nuevo solicita otra
apertura. Se guardan precio, revisión del sobre y resultado originales para
conservar el historial cuando cambie el contenido. Detalles en
[Alpha 0.4](docs/alpha-0.4.md).

## Balance y emisión 0.4.1

Las estadísticas de combate ahora favorecen, en promedio, a las rarezas más
altas. Los tres comunes conservan sus enfrentamientos favorables: Panda supera
a Lobo, Lobo a Mago y Mago a Panda. Un común entrenado puede superar a una
unidad de mayor rareza y menor nivel; la rareza no garantiza una victoria.

| Rareza | Máximo global por personaje |
| --- | ---: |
| Común | 50 |
| Raro | 35 |
| Épico | 20 |
| Legendario | 10 |
| Mítico, para contenido futuro | 5 |

El límite cuenta todas las emisiones históricas del personaje, entre todos los
jugadores y fuentes: starters, sobres y emisiones administrativas. Rasgos y
variantes comparten el mismo cupo. Si un personaje ya tenía un límite menor, se
conserva. Cuando lo emitido anteriormente supera el nuevo máximo, se conservan
esas unidades y se bloquean nuevas emisiones.
El marcador `grandfatheredIssued` mantiene la emisión cerrada aunque después
aumente el máximo o cambie la rareza; el contador conserva ese total heredado.

La migración mantiene los stats de nacimiento y añade una base de combate
versionada a las unidades anteriores. El ajuste conserva sus variaciones
individuales, seriales, propietario, nivel y XP. Los combates ya aceptados y los
recibos anteriores conservan sus valores; la nueva fuerza se aplica a la
siguiente partida. El catálogo no se reescribe en cada arranque.

Consulta los valores finales, la simulación y sus límites en
[balance 0.4.1](docs/balance-0.4.1.md). Para reproducir la comparación:

```sh
npm run balance:simulate
```

## Primer combate

Ambos jugadores se registran, reclaman el starter y usan `.ctuequipo usar ID`.
En un grupo, uno menciona al otro con `.ctupelea @jugador`; el destinatario usa
`.ctuaceptar`. El más rápido empieza y el bot muestra los ataques disponibles.

El ataque 1 tiene potencia 25 y precisión 100%; el ataque 2 tiene potencia 40 y
precisión 80%. Cada turno muestra el resultado anterior, HP y quién debe actuar,
con dos habilidades y su potencia. La precisión y los demás atributos se consultan
en `.ctuficha`; se mantienen en el motor. Durante una batalla, la ficha muestra
los valores fijados al aceptarla, incluidos los de ambas unidades.
Al terminar, se actualizan estadísticas, se liberan ambas unidades y se acredita
la recompensa en el mismo commit. El mensaje final incluye lo ganado por cada
jugador y unidad y las subidas de nivel, sin enviar avisos adicionales.

| Resultado elegible | ChengCoins | XP jugador | XP unidad participante |
| --- | ---: | ---: | ---: |
| Victoria | 120 | 35 | 35 |
| Derrota | 0 | 15 | 15 |
| Empate | 0 | 20 | 20 |

Hasta tres partidas con recompensa por pareja de jugadores en una ventana móvil
de 24 horas, compartida entre grupos y unidades. Una rendición requiere cuatro
ataques y participación de ambos para otorgar premios. La inactividad y los
desafíos sin aceptar no generan XP ni monedas. Estas reglas no impiden jugar
partidas adicionales: sus resultados y estadísticas se conservan.

Subir de nivel cuesta `100 × nivel actual` XP; el excedente se conserva. Jugador
y unidad avanzan por separado, con límites de nivel 50 y 20 respectivamente.
La unidad gana 2 HP por nivel y 1 ataque/defensa cada cinco niveles ganados;
su velocidad y estadísticas de nacimiento permanecen intactas. Los combates
anteriores conservan sus snapshots, y la nueva fuerza se aplica al aceptar la
siguiente partida. Las reglas completas están en [MVP 0.3](docs/mvp-0.3.md).

Los desafíos vencen en 5 minutos y los combates tras 30 minutos sin una acción.
La expiración se procesa al consultar perfil, unidades, equipos, saldo o batallas; el
anfitrión también puede llamar a `game.battle.sweepExpired()` periódicamente.

## Revisar la interfaz

```sh
npm run preview:whatsapp
```

Genera [35 ejemplos de los mensajes](docs/whatsapp-preview.md) usando una base
temporal y jugadores ficticios: registro, perfil, colección, starter, equipo,
desafío, turnos, fichas detalladas, fallo de ataque, errores, recompensas,
subidas de nivel, saldo, historial, sobres y rasgos/variantes.
No envía mensajes a WhatsApp real.

Todas las pantallas usan el encabezado `🃏 CHENGDÚ CARDS | SECCIÓN` y un separador
`━━━━━━━━━━━━━━`. Perfil y listas muestran lo necesario para continuar;
`.ctuficha` reúne atributos y precisión, y `.ctuunidad ID` muestra identidad,
propietario, progreso y procedencia. La ayuda agrupa comandos en una línea por uso.

El turno envía un solo mensaje de texto, sin IDs, seriales ni atributos extra.
Inicio y final usan sus propios encabezados. Las barras tienen diez caracteres:
`▓▒▒▒▒▒▒▒▒▒ 10/100 HP`. Para ocultarlas, cambia `battleHealthBars: true` a `false`
en `CTU-config.js` o usa `createCommandRouter({ game, battleHealthBars: false })`;
el HP numérico se sigue mostrando.

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
`ataques.json`, `combates.json`, `recompensas.json`, `sobres.json`, `aperturas.json`
y `economia.json` incluyen versión de esquema 5 y revisión. `_database.json` identifica la instalación.
`_journal.json` existe mientras hay un commit pendiente. Cada operación que cambia
datos guarda previamente una copia coherente en `backups/<id-operación>/`.

Una cola serializa lecturas y escrituras. El lock `.writer.lock` permite un proceso
por carpeta. Las publicaciones de archivos usan temporales, sincronización y
renombrado; el journal decide si se descarta una operación preparada o se completa
una ya comprometida. La creación de unidad, contador, reclamo y evento de auditoría
ocurre en el mismo commit. Las acciones de combate, estadísticas y locks también
se coordinan mediante el mismo mecanismo, incluyendo saldos, XP y registros de
recompensa. La recuperación se ejecuta antes de atender consultas. Las recompensas
se registran una vez por jugador y batalla; repetir el mensaje final reutiliza
el recibo sin volver a acreditarlo. La compra de un sobre coordina gasto, unidad,
contador, evento de emisión y recibo mediante el mismo mecanismo. El saldo se
reconstruye desde el valor inicial y los créditos/débitos de `economia.json`, cada
uno ligado a su recompensa o apertura. La XP se reconstruye desde sus recompensas.
Las compras no conceden XP. Las unidades anteriores conservan sus rasgos y variantes
sin adquirir efectos nuevos retroactivamente. El balance 0.4.1 añade una base de
combate separada, preserva los stats de nacimiento y mantiene intactos los
snapshots de partidas anteriores.

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

168 pruebas verificadas con `node --test --test-isolation=none`: persistencia al
reabrir, registro/starter concurrentes, supply, identidades, cursores, migraciones
desde esquemas 1, 2, 3 y 4, journals antiguos, integridad y recuperación de commits. También
cubren equipos, snapshots, turnos, precisión, duplicados, victoria, rendición,
expiración y estadísticas. Se interrumpe realmente un proceso con `SIGKILL`.
También se comprueban las trazas de error y los 20 plugins mediante sus
exportaciones `run`, con una base compartida y sin inyectar el juego del router.
El debug se verifica activado y desactivado, con causas anidadas, loggers que
sólo aceptan un argumento y límites de longitud del mensaje de WhatsApp.
La interfaz de combate verifica una respuesta por turno, ausencia de IDs y
precisión en el mensaje normal, barras opcionales y fichas con ataques fijados.
También se verifican la navegación del catálogo y las fichas de plantilla antes
del registro, leyendo estadísticas y ataques actualizados sin emitir unidades.
La validación con una sesión real de WhatsApp queda pendiente del bot anfitrión.
Se verifican umbrales y excedentes de XP, límites de nivel, crecimiento acotado,
recompensas únicas incluso con mensajes simultáneos o interrupciones, límites por
pareja, historial paginado y acceso restringido a los participantes. La migración
preserva saldos/progresos anteriores y snapshots de combates activos, sin premios
retroactivos. El saldo, la XP y los recibos rechazan modificaciones sin su operación.

Se verifican drops por pesos enteros, disponibilidad y supply, rasgos sin
duplicados, variantes cosméticas, compras concurrentes, reinicios y recuperación
del pago/emisión/recibo en conjunto. Las pruebas de WhatsApp obtienen monedas
combatiendo y recuperan una compra cuyo primer recibo no llegó por desconexión.
El balance verifica bases de combate versionadas, conservación de variaciones,
límites por rareza, emisiones anteriores por encima del máximo y snapshots
históricos que conservan sus estadísticas originales.

Daily, nuevos gastos, transferencias, mercado y combate avanzado pertenecen
a las siguientes versiones. El modelo ya conserva progreso, procedencia,
revisiones de contenido, seriales, stats individuales, traits y variante.

Diseño: [fundación 0.1](docs/mvp-0.1.md), [combate 0.2](docs/mvp-0.2.md),
[progresión 0.3](docs/mvp-0.3.md),
[colección 0.4](docs/alpha-0.4.md),
[balance 0.4.1](docs/balance-0.4.1.md),
[modelo de datos](docs/database.md) y
[visión completa](project.md).
