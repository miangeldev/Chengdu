# MVP 0.3 — Progresión

Fecha: 2026-10-08. Alcance de `project.md`: XP, niveles, recompensas, monedas e
historial de combate. Implementación local; la sesión real de WhatsApp sigue
siendo responsabilidad del bot anfitrión.

## Flujo y mensajes

Combatir ahora produce progreso. Una partida elegible paga 120 ChengCoins y
35 XP al ganador; quien pierde recibe 15 XP. Un empate da 20 XP a ambos. La
unidad que participó recibe la misma cantidad de XP que su jugador. Las otras
unidades de la colección conservan su progreso.

El final del combate muestra resultado, recompensa de ambos y subidas de nivel
en un único mensaje. Los mensajes normales siguen mostrando sólo HP, resultado
del ataque y dos habilidades; precisión y stats se consultan con `.ctuficha`.
El formato común conserva encabezado, separador, emojis y una acción principal.

| Comando | Resultado |
| --- | --- |
| `.ctuperfil` | Nivel, XP restante/necesaria, saldo y estadísticas. |
| `.ctubalance` | Saldo y condiciones de recompensa. |
| `.ctuhistorial` | Cinco partidas propias terminadas, de más reciente a más antigua. |
| `.ctuhistorial CURSOR` | Siguiente página, usando el comando que devuelve la lista. |
| `.ctuhistorial BTL-…` | Turnos, participantes, niveles al inicio y recibo original. |
| `.ctuunidad ID` | Progreso individual y procedencia. |
| `.ctuficha ID` | Estadísticas efectivas o snapshot si la unidad está combatiendo. |

El historial funciona desde grupos o conversaciones privadas. Sólo los
participantes pueden consultar los detalles de una batalla. Los IDs se presentan
en el comando para abrir una partida, sin mostrar JIDs de WhatsApp.

## Progresión y balance inicial

El coste del siguiente nivel es `100 × nivel actual`: nivel 1 necesita 100 XP,
nivel 2 necesita 200, etc. La XP es residual; 105 XP desde nivel 1 da nivel 2 con
5/200 XP. Los niveles de jugador y unidad son independientes aunque reciban la
misma XP en una batalla. Al cambiar de unidad, el jugador sigue su progreso y
sólo la nueva unidad suma la XP de esa partida.

Límites: jugador 50, unidad 20. La XP se conserva y sigue acumulándose en el
nivel máximo. Los niveles del jugador no aumentan el daño de su unidad.

Cada nivel ganado por la unidad agrega 2 HP. Cada cinco niveles ganados agrega
1 ataque y 1 defensa. La velocidad permanece igual. En nivel 20 el crecimiento
máximo es 38 HP, 3 ataque y 3 defensa; no se sobrescriben `initialStats`, serial,
origen ni revisión de emisión. Los stats efectivos se calculan con una regla
versionada y se fijan al aceptar el siguiente combate.

Estos importes, umbrales y límites son decisiones de balance inicial, no valores
impuestos por el documento. Están centralizados en `game/progression/rules.js`
y `game/rewards/battlePolicy.js`. Cambiar reglas existentes exige preservar las
versiones históricas y migrar el contrato; no cambiar un recibo ya liquidado.

## Elegibilidad y premios únicos

Hasta tres combates con premio por pareja de jugadores en una ventana móvil de
24 horas, compartida entre grupos y unidades. Las partidas adicionales siguen
actualizando estadísticas e historial, con premio cero y explicación del motivo.
Cambiar de rival tiene su propio límite. La ventana vence exactamente a las 24 h.

El KO es elegible. Una rendición sólo es elegible si hubo al menos cuatro
ataques y ambos jugadores atacaron. La rendición temprana y la inactividad dan
cero XP/monedas y no consumen el cupo. Los desafíos rechazados, retirados o
vencidos sin aceptar no crean premios ni aparecen como partidas jugadas.

Cada cierre aceptado guarda un premio por jugador, incluso cuando es cero, con
referencias a batalla y unidad, motivo, importes y saldo/progreso antes/después.
El cierre, XP, niveles, monedas, estadísticas y desbloqueo de unidades se publican
en un mismo commit. Una clave repetida devuelve el estado y recibo existentes;
no vuelve a pagar. Desbordar un entero seguro cancela la operación completa.

## Migración y crecimiento futuro

El esquema 3 añade `recompensas.json`, baselines inmutables de saldo/progreso,
versión de crecimiento de unidad y versión/recibo de premio en los combates.
La migración preserva usuarios, unidades, identidades, equipos, seriales,
stats de nacimiento, balances, XP y resultados. No concede premios retroactivos.

Las batallas activas de 0.2 conservan sus stats y ataques originales y reciben
los premios 0.3 al terminar. Las cerradas se consultan con una indicación de que
preceden a las recompensas. El arranque recupera cualquier journal anterior
antes de migrar y valida el conjunto completo. Todos los cambios tienen backup.

Los premios se guardan fuera de usuarios y unidades para permitir historial,
auditoría y futuras migraciones a SQLite. Las monedas se acreditan mediante una
operación económica central dentro del cierre transaccional. Sobres y gastos
requieren ampliar el contrato económico en la siguiente fase; no existen aquí.
JSON todavía carga y valida todo el estado, aunque las consultas sean paginadas.
La retención de backups y el cambio de almacenamiento siguen siendo decisiones
pendientes antes de aumentar el volumen o permitir múltiples escritores.

## Verificación

Las pruebas cubren XP exacta/excedente, múltiples niveles, límites, crecimiento,
recompensas separadas, cambios de unidad/rival/grupo, cupo por pareja, rendición,
empate, inactividad, concurrencia, replays y reinicios. Se simulan interrupciones
antes/después del commit y entre publicaciones para comprobar que monedas, XP,
locks y resultados se recuperen juntos y sin duplicados.

Se verifica migración desde los esquemas 1 y 2, journals antiguos, saldos/XP
previos no nulos, snapshots activos, ausencia de premios retroactivos y rechazo
de corrupción. El adaptador se prueba con un socket simulado: una respuesta por
turno, recompensas reales, subidas de nivel, saldo, historial privado y prefijo
personalizado. No se ha conectado una sesión real de WhatsApp.

Ejemplos generados: [whatsapp-preview.md](whatsapp-preview.md).
Contrato de almacenamiento: [database.md](database.md).
