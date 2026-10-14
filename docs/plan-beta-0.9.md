# Beta 0.9 — Plan de competitivo

Fecha: 2026-10-13, Ciudad de México. Alcance de `project.md`: ranking, Elo,
temporadas, recompensas y clasificaciones. Se conservan las entregas 0.1–0.8,
los códigos cortos del mercado y la espera de una hora entre apariciones.

## Hitos de cierre

- [x] 0.9.1: contrato competitivo, Elo y rangos con política versionada.
- [x] 0.9.2: esquema 10, migración 9→10 y recuperación de journals históricos.
- [x] 0.9.3: desafíos competitivos sobre el combate avanzado existente.
- [x] 0.9.4: resultados atómicos, deduplicación y controles de repetición/abandono.
- [x] 0.9.5: temporadas de 30 días y clasificación congelada al cierre.
- [x] 0.9.6: premios únicos de temporada, ledger y títulos permanentes.
- [x] 0.9.7: interfaz de WhatsApp, ayuda, páginas numéricas y ejemplos reales.
- [x] 0.9.8: regresiones, migración con conservación y documentación de entrega.

Cierre verificado: **543 pruebas**, **153 mensajes de ejemplo**, **46 comandos**.
La base local pasó de esquema 9 a 10 conservando exactamente los 44 registros
de sus veinte colecciones anteriores. Las cuatro colecciones nuevas están vacías,
sin jugadores ni unidades de prueba, journal o writer lock pendiente.
Respaldo de migración:
`ChengdúData/backups/106ab02a-30ab-4c6f-ad53-a67a0e2d16a1/`.
La sesión real de WhatsApp pertenece al bot anfitrión; los mensajes se comprobaron
con sockets simulados y el flujo real del juego sobre bases temporales.

## Decisiones de producto

`.ctupelea` mantiene sus reglas casuales. `.cturanked` crea un desafío avanzado
competitivo; aceptar, atacar, cambiar y rendirse usan los comandos existentes.
Ambos jugadores necesitan equipos propios, libres y del mismo tamaño. Los
formatos 1v1, 2v2 y 3v3 comparten la clasificación. Las estadísticas y el progreso
de las unidades siguen aplicándose; no se convierten los combates históricos.

La primera temporada comienza el 13 de octubre de 2026 a las 00:00 CDMX.
Cada temporada dura exactamente 30 días y se identifica con `T1`, `T2`…
La siguiente empieza al terminar la anterior. La actividad materializa la
temporada vigente y cierra las anteriores, sin crear decenas de filas vacías
cuando el bot permanece apagado durante mucho tiempo.

El rating inicial es 1000. Elo usa K=32 y la probabilidad esperada a partir de
la diferencia de ratings. Una victoria vale 1, un empate 0.5 y una derrota 0.
Los cambios se calculan sobre los ratings previos de ambos jugadores dentro
de la misma transacción; los comandos no envían puntos ni premios.

Para entrar en la clasificación definitiva y cobrar un premio hacen falta
cinco partidas puntuadas y tres rivales distintos en esa temporada. Los
jugadores en colocación siguen viendo su rating y cuánto les falta.

Sólo se puntúan tres partidas por pareja en una ventana móvil de 24 horas,
con independencia del grupo, formato y de las monedas del combate casual.
Una rendición temprana no da puntos al rival y resta 16 al que abandona.
La inactividad resta 16 al jugador cuyo turno quedó pendiente. La llegada
del límite de temporada no penaliza a ninguno. Rechazar o retirar un desafío
sin aceptar no modifica Elo.

Al cerrar se conserva la clasificación, incluyendo quienes aún estaban
en colocación. El premio depende del rango final y la posición definitiva,
no del máximo temporal alcanzado. Se reclama explícitamente una vez por
jugador y temporada: monedas más un título conmemorativo. Las colecciones,
niveles, saldos, logros e historiales permanecen intactos.

## Contratos de datos

Se añaden cuatro colecciones: `temporadas`, `clasificacion`,
`resultadoscompetitivos`, `premiostemporada`. Sus repositorios son `seasons`,
`rankings`, `competitiveResults` y `seasonRewards`.

`temporadas` conserva calendario, versión de política, estado y clasificación
final. `clasificacion` es una vista reproducible desde los resultados de su
temporada. `resultadoscompetitivos` conserva un recibo inmutable por partida
aceptada y terminada: motivo, jugadores, rating antes/después, delta y resultado.
`premiostemporada` conserva el premio, el título, la fuente única y los saldos.

Sólo los desafíos nuevos de competitivo añaden `battle.competitive`:
`version`, `seasonId`, `seasonCode`, `endsAt`, `settlement`.
Una partida histórica casual no puede adquirir esa marca mediante una edición.
Los desafíos y turnos competitivos no pueden extenderse más allá de `endsAt`.

El cierre del combate publica estadísticas, XP/monedas habituales, desbloqueos,
resultado competitivo y cambios de Elo en el mismo commit. Un reintento conserva
el resultado original. Los premios de temporada usan el ledger existente con
fuente `season_reward`; no se acreditan monedas por editar el rating.

El validador reproduce Elo desde sus recibos y comprueba clasificación,
calendario, ganadores, participantes, motivos, posiciones, títulos y dinero.
Una temporada cerrada, sus resultados y sus premios permanecen inmutables.
Cambios futuros de Elo, rangos o calendario necesitan una nueva política,
conservando el reproductor de la versión histórica.

## Contrato de interfaz

- `.cturanked @jugador [1v1|2v2|3v3]`: desafío competitivo en el grupo.
- `.cturank [T1]`: rating, rango y colocación propia.
- `.ctutop [T1] [página]`: clasificación global, cinco entradas por página.
- `.ctutemporada [T1]`: calendario, requisitos y premio propio.
- `.ctutemporada T1 reclamar`: premio de una temporada terminada.
- `.ctutemporadas [página]`: temporadas disponibles y archivo.

La presentación mantiene emojis, saltos de línea y acciones copiables. El
inicio identifica el competitivo y la temporada; el final muestra sus deltas
de Elo en la misma respuesta del combate. Los turnos mantienen el espacio
para estado, ataques y reservas. No se muestran UUID ni JID en los listados.

## Comprobaciones de cierre

Elo frente a rivales iguales/desiguales, empate, abandono, inactividad, límite
por pareja y cambio de temporada. Reintentos, concurrencia y recuperación de
un commit interrumpido. Invitación/turno al límite exacto de temporada.
Premio repetido, saldo entrelazado con otras fuentes y título permanente.
Corrupción de resultados, rankings, clasificaciones o importes rechazada.
El reloj del almacenamiento autoriza los cierres y las escrituras nuevas;
un cierre adelantado o un recibo futuro se rechaza incluso si su forma es válida.
Los reintentos sin cambios no necesitan una fecha nueva, incluido un reloj nulo.
Regresiones de todas las fases y migración de datos reales con respaldo.
