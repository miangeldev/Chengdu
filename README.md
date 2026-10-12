# Chengdú Cards — Beta 0.8

Módulo de juego para un bot de WhatsApp: registro, perfil, catálogo de diez
personajes, starter único, colección, equipos de hasta tres unidades y combates
1v1, 2v2 y 3v3 por turnos. Incluye elementos, pasivas, estados, cambios de unidad,
XP, niveles independientes de jugador/unidad, ChengCoins e historial.
Los sobres permiten conseguir nuevas unidades con rareza, rasgos y variantes.
La economía añade un diario de 100 ChengCoins cada 24 horas, tienda e historial
de ingresos y gastos para cada jugador.
El mercado permite comprar y vender unidades entre jugadores, con comisión,
anuncios que vencen y un historial de propiedad que conserva cada emisión.
La Beta 0.8 añade misiones diarias, logros con títulos e insignias, tickets de
captura, bosses mundiales, apariciones en grupos y el Festival de los Faroles.
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
de usuarios. Desde los esquemas 1 a 8, migra al esquema 9 con backup y recuperación,
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
| `.ctubalance` | Ver ChengCoins, ingresos, gastos y disponibilidad del diario. |
| `.ctudiario` | Reclamar 100 ChengCoins; se habilita de nuevo 24 horas después. |
| `.ctutienda` | Ver sobres, precios y disponibilidad; copiar el comando de compra. |
| `.ctumovimientos` | Ver ingresos y gastos propios, cinco por página. |
| `.ctusobres` | Ver sobres, precio y probabilidades según disponibilidad. |
| `.ctuabrir basico` | Gastar 500 ChengCoins y obtener una unidad con rasgos/variante. |
| `.ctumercado` | Ver unidades en venta, cinco por página. |
| `.ctumercado mios` | Ver anuncios propios; `raro` filtra rareza y `precio` ordena de menor a mayor. |
| `.ctumercado M1` | Inspeccionar el anuncio M1; comprar o retirar según corresponda. |
| `.ctuvender PAND-000001 100` | Publicar una unidad propia por 100 ChengCoins. |
| `.ctucomprar M1` | Comprar el anuncio M1 y recibir la unidad. |
| `.cturetirar M1` | Retirar tu anuncio M1. |
| `.ctuventas` | Ver compras y ventas propias, cinco por página. |
| `.ctupropiedad PAND-000001` | Consultar emisión y cambios de propietario, cinco por página. |
| `.ctumisiones` / `.ctumisiones reclamar 1` | Ver y cobrar los objetivos diarios; también 2 y 3. |
| `.ctulogros` / `.ctulogros reclamar L1` | Logros permanentes, títulos e insignias. |
| `.ctuinventario` | Tickets de captura y títulos obtenidos. |
| `.ctuboss` / `.ctuboss dragon` | Guardián de la Niebla o Dragón del Vacío, compartidos por todos los grupos. |
| `.ctubossatacar 2 B1` | Atacar al boss con la primera unidad equipada, desde un grupo. |
| `.ctubosstop B1` | Aportaciones de participantes, con páginas numéricas. |
| `.ctuspawn` / `.ctuexplorar` | Apariciones del grupo; una oportunidad por ventana temporal. |
| `.ctucapturar S1` | Capturar por un ticket, con propietario y serial únicos. |
| `.ctueventos` / `.ctuevento faroles` | Calendario, personajes exclusivos y supply del festival. |
| `.ctuevento faroles reclamar` | Bienvenida única: 25 monedas, 10 XP y un ticket. |
| `.ctuhistorial` | Ver tus partidas terminadas, cinco por página y desde cualquier chat. |
| `.ctuhistorial BTL-…` | Consultar turnos, resultado y recompensa original de una partida propia. |
| `.ctucatalogo` | Ver las plantillas del catálogo. |
| `.ctustarter` | Ver las tres opciones iniciales. |
| `.ctustarter panda` | Elegir Panda Guerrero; también `mago`, `lobo`, `1`, `2` o `3`. |
| `.ctupersonajes` | Ver colección propia. |
| `.ctuunidad PAND-000001` | Ver una unidad y su propietario público. |
| `.ctuayuda` | Guía de comandos y pasos para empezar. |
| `.ctuequipo usar PAND-000001 MAGC-000001 LOBO-000001` | Seleccionar entre una y tres unidades propias en orden; sin argumentos muestra el equipo. |
| `.ctuequipo agregar ID` / `.ctuequipo quitar ID` | Añadir o quitar una unidad; `limpiar` vacía el equipo. |
| `.ctuequipo ordenar 2 1 3` | Ordenar las posiciones actuales; la primera abre el combate. |
| `.ctupelea @jugador` | Desafío avanzado en grupo; ambos equipos deben tener el mismo tamaño. |
| `.ctupelea @jugador 3v3` | Elegir formato explícito: `1v1`, `2v2` o `3v3`. |
| `.ctupelea @jugador clasico` | Jugar con las reglas originales usando la primera unidad de cada equipo. |
| `.ctuaceptar` | Aceptar un desafío recibido. |
| `.cturechazar` | Rechazarlo. |
| `.ctucancelar` | Retirar el desafío enviado. |
| `.ctuatacar 1` / `.ctuatacar 2` | Usar un ataque durante tu turno. |
| `.ctucambiar 2` / `.ctucambiar 3` | Elegir una reserva viva; consume el turno. |
| `.ctucombate` | Ver el estado o resultado reciente en ese grupo. |
| `.ctuficha` / `.ctuficha PAND-000001` | Consultar estadísticas, precisión, elemento, pasiva, efectos y recargas; también una reserva. |
| `.ctuficha panda` | Comparar la plantilla de un personaje antes de elegir; también `mago`, `lobo` o el ID del catálogo. |
| `.cturendirse` | Rendirse y terminar el combate. |

Los listados muestran cinco entradas por página y usan números cortos. Sin número
se abre la página 1; `.ctucatalogo 2`, `.ctupersonajes 2`, `.ctuhistorial 2`,
`.ctumovimientos 2` y `.ctuventas 2` abren la segunda. El mercado conserva el filtro:
`.ctumercado 2`, `.ctumercado raro 2`, `.ctumercado precio 2` o `.ctumercado mios 2`.
La propiedad se consulta con `.ctupropiedad PAND-000001 2`.
Cada lista indica «Página 1 de 3» y ofrece Anterior/Siguiente cuando corresponde,
sin mostrar cursores largos. Cada consulta refleja el estado actual del listado.
Los historiales y anuncios propios siempre se filtran por el remitente autenticado.
Los IDs aparecen al copiar una acción o consultar una ficha. Registro, perfil y
equipo priorizan el resumen y el próximo paso. Los movimientos muestran primero
las últimas operaciones confirmadas.
El reclamo de starter siempre conserva la unidad original. Si ya cambió de
propietario, la respuesta dirige a la colección actual. El detalle público
muestra el nombre del propietario y la procedencia, sin su JID.

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

## Diario, tienda y movimientos 0.5

`.ctudiario` entrega 100 ChengCoins a un jugador registrado. El siguiente reclamo
se habilita exactamente 24 horas después del anterior, incluyendo entre grupos
y conversaciones privadas. La recompensa entrega monedas y conserva el mismo
importe en cada reclamo; el progreso de jugador y unidades se obtiene combatiendo.
El bot muestra la próxima fecha y hora en Ciudad de México.

El ID autenticado del mensaje evita premios duplicados. Repetir el mismo mensaje
devuelve el recibo original, incluso después de reiniciar o si no se pudo enviar
la primera respuesta. Un mensaje nuevo durante la espera muestra cuándo vuelve
a estar disponible. Un reloj inválido o que retrocede no adelanta otro premio.

`.ctutienda` reúne los sobres existentes con precio y disponibilidad. El gasto
actual es el Sobre Básico de 500 ChengCoins, comprado con `.ctuabrir basico`.
`.ctusobres` conserva las probabilidades detalladas. La compra entrega una unidad
sin cambiar la XP ni volver a generar rasgos o variantes de unidades anteriores.

`.ctumovimientos` muestra créditos de combate/diario, gastos de sobres y compras
y ventas de unidades propias.
`.ctubalance` resume saldo, ingresos y gastos históricos; un saldo inicial
conservado al migrar se muestra por separado. El diario, su crédito y el saldo
se confirman en la misma transacción. Detalles en [Alpha 0.5](docs/alpha-0.5.md).

## Comprar y vender unidades 0.6

`.ctuvender ID PRECIO` publica una unidad propia por un precio entero entre
20 y 1,000,000 ChengCoins. El vendedor ve precio, comisión del 5% redondeada
hacia arriba y lo que recibirá. Por ejemplo, una venta de 21 monedas cobra
2 de comisión y entrega 19 al vendedor. La comisión sale de circulación sólo
al completar la compra; publicar, retirar o dejar vencer un anuncio no cobra.

La unidad queda bloqueada en el mercado y sale del equipo. El anuncio dura
siete días. Su vencimiento se procesa al consultar u operar el mercado,
unidades o equipos; no requiere un proceso programado. Tras retirarlo o vencer,
la unidad se puede seleccionar de nuevo para combatir.

`.ctumercado` muestra los anuncios activos; `mios`, las publicaciones propias;
`raro` y otras rarezas filtran; `precio` ordena de menor a mayor. El detalle
conserva nombre, stats, nivel, rasgos y variante fijados al publicar. Desde 0.7.1,
cada anuncio tiene un código corto global (`M1`, `M2`…). La lista muestra
directamente `.ctucomprar M1` y `.ctumercado M1` para ver detalles; en anuncios
propios aparece retirar. El código se conserva al cambiar páginas, filtros,
estado o reiniciar, y nunca se reasigna a otra publicación. Los mensajes antiguos
con UUID siguen funcionando.

`.ctucomprar M1` coordina pago, importe neto del vendedor, comisión,
propiedad, desbloqueo, recibo y auditoría en un mismo commit. La unidad conserva
serial, emisión, stats de nacimiento, progreso y variantes; el nuevo propietario
elige después su equipo. Dos compradores simultáneos producen una única venta.
Las claves de mensaje recuperan recibos anteriores después de un reinicio o
fallo de envío, sin repetir pagos ni recuperar una unidad revendida.

`.ctuventas` muestra sólo las operaciones del jugador; los saldos del otro
participante permanecen privados. `.ctupropiedad ID` muestra la emisión y
los propietarios sucesivos por nombre. El historial de combates conserva sus
participantes originales. Alpha 0.6 implementa transferencias por compraventa;
regalos e intercambios directos requieren servicios posteriores. Detalles en
[Alpha 0.6](docs/alpha-0.6.md).

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

El ataque 1 tiene potencia 25 y precisión 100%. El segundo es propio de cada
personaje, con elemento, efecto y recarga. Cada turno muestra el resultado anterior, HP y quién debe actuar,
con dos habilidades y su potencia. La precisión y los demás atributos se consultan
en `.ctuficha`; se mantienen en el motor. Durante una batalla, la ficha muestra
los valores fijados al aceptarla, incluidos los activos de ambos jugadores;
`.ctuficha ID` permite inspeccionar una reserva.
Al terminar, se actualizan estadísticas, se liberan todas las unidades y se acredita
la recompensa en el mismo commit. El mensaje final incluye lo ganado por cada
jugador y unidad y las subidas de nivel, sin enviar avisos adicionales.

| Resultado elegible | ChengCoins | XP jugador | XP total para unidades participantes |
| --- | ---: | ---: | ---: |
| Victoria | 120 | 35 | 35 |
| Derrota | 0 | 15 | 15 |
| Empate | 0 | 20 | 20 |

En combate avanzado, la XP total de unidades se reparte por igual entre quienes
entraron al campo. El sobrante se asigna en orden de equipo: 35 XP entre tres
participantes son 12, 12 y 11. Una reserva que nunca entró recibe cero XP;
llevar un equipo mayor no multiplica las recompensas.

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

## Contenido Beta 0.8

Las misiones diarias premian dos victorias, cinco partidas y tres personajes
usados en partidas válidas. Cambian a medianoche de CDMX. Los cuatro logros
permanentes reconocen primera victoria, 25 unidades distintas, 100 partidas
y 10 victorias consecutivas; vender unidades no borra el progreso.

Los bosses conservan HP mundial compartido, ataques con snapshot, cooldown de
30 segundos y límite de 20 por jugador/encuentro. El último golpe paga a todos
los participantes con daño, con bonos separados por mayor daño y golpe final.
El Guardián tiene 1.000 HP; el Dragón, 100.000. No alteran estadísticas PvP.

La actividad del grupo tiene una comprobación de aparición por ventana de 30
minutos, probabilidad del 25% y una hora entre apariciones; enviar más mensajes
no añade oportunidades. Capturar cuesta un ticket, dura diez minutos y sólo
puede ganar una persona. Se comprueban supply y calendario antes de emitir.

El Festival de los Faroles abre del 11 al 25 de octubre de 2026 a las 00:00 CDMX.
Zorro de los Faroles tiene 35 emisiones y Guardián Espectral, 20. Ambos usan
ataques y pasivas propios. El cierre impide nuevas emisiones, también por sobres
o administración, y conserva unidades, progreso y mercado.

Reglas y límites en [Beta 0.8](docs/beta-0.8.md), planificación en
[sus ocho hitos](docs/plan-beta-0.8.md). `npm run balance:content` simula el catálogo
completo; el [informe de 9.000 duelos](docs/content-balance-0.8.json) guarda las
definiciones utilizadas y los límites de la comparación.

## Combate avanzado 0.7

Los equipos admiten una, dos o tres unidades distintas. `.ctupelea @jugador`
elige el formato según ambos equipos; `1v1`, `2v2` y `3v3` permiten pedirlo
explícitamente. `.ctuequipo ordenar 2 1 3` cambia quien inicia. El equipo y todas
sus unidades quedan bloqueados al aceptar; los anuncios del mercado bloquean
su unidad y la retiran del equipo como antes.

`.ctucambiar 2` entra con la segunda unidad viva y consume el turno. Al caer una
unidad, entra automáticamente la primera reserva viva sin enviar otra respuesta.
La victoria llega cuando el rival pierde todas sus unidades. Pasivas, daño,
estados, reservas, recargas y ataques disponibles se integran en el mensaje del turno.

Fuego vence a Naturaleza, Naturaleza a Agua y Agua a Fuego. Luz y Oscuridad
tienen ventaja mutua. Ventaja aplica 125% del daño; resistencia, 80%; Neutral
y los demás cruces, 100%. Los estados son veneno, quemadura, aturdimiento,
escudo, regeneración, aumento de ataque y reducción de defensa. Duración y
recarga avanzan en turnos propios de la unidad activa y se congelan en reserva.
Las pasivas se activan una sola vez al entrar por primera vez en la partida.

Las partidas avanzadas tienen un máximo de 100 acciones. `.ctupelea @jugador
clasico` conserva las reglas originales, con primera unidad, dos ataques sin
efectos y máximo de 50 acciones. Los combates y recibos anteriores conservan
sus snapshots y reglas. La API interna mantiene `mode: 'classic'` como valor
por defecto; el adaptador WhatsApp pide `mode: 'auto'`.

Consulta el contenido por personaje, reglas de duración, plan de implementación,
compatibilidad y próximos pasos en [Alpha 0.7](docs/alpha-0.7.md).
`npm run balance:advanced` reproduce 8.600 partidas 1v1/3v3 del motor real;
el [informe](docs/advanced-balance-0.7.json) documenta resultados y límites
de su estrategia de referencia.

## Revisar la interfaz

```sh
npm run preview:whatsapp
```

Genera [130 ejemplos de los mensajes](docs/whatsapp-preview.md) usando una base
temporal y jugadores ficticios: registro, perfil, colección, starter, equipo,
desafío, turnos, fichas detalladas, fallo de ataque, errores, recompensas,
subidas de nivel, saldo, historial, sobres, rasgos/variantes, diario, tienda
y movimientos económicos, mercado e historial de propiedad, misiones, logros,
apariciones, capturas, bosses y eventos.
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

El router procesa texto normal del grupo para las apariciones automáticas;
entrégale también esos mensajes. No anuncia nada si no hay una nueva aparición.
`automaticSpawns: false` desactiva ese comportamiento.
Si el anfitrión usa el cargador de plugins, puede importar `observeGameActivity`
del mismo módulo e invocarlo únicamente para mensajes normales autenticados:

```js
import { observeGameActivity } from './interfaces/whatsapp/index.js';
await observeGameActivity(sock, msg);
```

No pasar mensajes del bot ni ejecutar ambos caminos para un mismo comando.

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
`ataques.json`, `combates.json`, `recompensas.json`, `sobres.json`, `aperturas.json`,
`economia.json`, `diarios.json`, `mercado.json`, `ventas.json`, `campanas.json`,
`premioscontenido.json`, `logros.json`, `encuentros.json`, `accionescontenido.json`
y `actividad.json` incluyen versión de esquema 9 y revisión. Son veinte colecciones
y el manifest por snapshot. `_database.json` identifica la instalación.
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
uno ligado a su recompensa, apertura o diario. El reclamo diario tiene un recibo
inmutable y exactamente un crédito económico; ambos se publican junto con el
saldo. Las ventas añaden un débito del comprador y un crédito neto del vendedor,
ligados al recibo y al evento de cambio de propiedad. La XP se reconstruye desde
sus recompensas de combate y contenido, en el orden común del ledger. Los tickets
se reconstruyen desde ganancias y gastos de recibos de contenido. El golpe final
de boss publica todos los premios juntos; una captura publica unidad y gasto de
ticket en el mismo commit.
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

Beta 0.8 pasa **439 pruebas**, genera **130 mensajes de ejemplo** y tiene **41
comandos**. La simulación de contenido verifica **9.000 duelos**. La base local
se migró al esquema 9 con respaldo y conservación de sus registros anteriores.

Las pruebas con `node --test --test-isolation=none` verifican persistencia al
reabrir, registro/starter concurrentes, supply, identidades, cursores, migraciones
desde esquemas 1 a 8, journals antiguos, integridad y recuperación de commits. También
cubren equipos, snapshots, turnos, precisión, duplicados, victoria, rendición,
expiración y estadísticas. Se interrumpe realmente un proceso con `SIGKILL`.
También se comprueban las trazas de error y los 41 plugins mediante sus
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
La economía verifica diarios únicos, espera de 24 horas, reloj inválido o que
retrocede, recibos después de reiniciar, movimientos propios paginados y compras
financiadas por diarios. La migración añade diarios vacíos y conserva los saldos
y registros anteriores, sin conceder recompensas retroactivas.
El mercado verifica precios y comisión exactos, snapshots, propietarios sucesivos,
unidad fuera del equipo al publicarla, bloqueos, cancelación, vencimiento,
historial privado, cursores y compras simultáneas. Se recuperan pagos y propiedad
juntos tras interrupciones, y los recibos antiguos siguen siendo válidos cuando
la unidad se revende o cambia el catálogo.
El combate avanzado verifica equipos de tres, selección y orden, elementos,
pasivas únicas, ticks y duración de estados, escudos, recargas, cambios, KO,
entradas automáticas, reservas congeladas y reparto exacto de XP. Se reproducen
acciones para detectar estados o resultados alterados y se conserva compatibilidad
con partidas clásicas activas e históricas.

Nuevos gastos, regalos e intercambios directos pertenecen
a las siguientes versiones. El modelo conserva progreso, procedencia,
revisiones de contenido, seriales, stats individuales, traits y variante.

Diseño: [fundación 0.1](docs/mvp-0.1.md), [combate 0.2](docs/mvp-0.2.md),
[progresión 0.3](docs/mvp-0.3.md),
[colección 0.4](docs/alpha-0.4.md),
[balance 0.4.1](docs/balance-0.4.1.md),
[economía 0.5](docs/alpha-0.5.md),
[mercado 0.6](docs/alpha-0.6.md),
[combate avanzado 0.7](docs/alpha-0.7.md),
[contenido 0.8](docs/beta-0.8.md),
[modelo de datos](docs/database.md) y
[visión completa](project.md).
