# Beta 0.9 — Competitivo

Esta entrega añade ranking por temporadas y Elo al juego existente. Las
partidas casuales, colecciones, mercado, misiones, bosses y eventos conservan
sus reglas. El esquema de almacenamiento pasa a 10.

## Empezar

Regístrate, reclama un starter disponible y equipa entre una y tres unidades.
Menciona a otro jugador con un equipo del mismo tamaño:

```text
.cturanked @jugador
.cturanked @jugador 3v3
```

Tu rival usa `.ctuaceptar` o `.cturechazar`. Se juega con `.ctuatacar 1`,
`.ctuatacar 2` y, si hay reservas, `.ctucambiar 2` o `.ctucambiar 3`.
`.ctucombate` consulta el estado y `.cturendirse` termina tu participación.
Se usan las reglas avanzadas, elementos, pasivas, efectos, recargas y niveles
del equipo. No existe un formato clásico competitivo.

`.ctupelea` sigue siendo casual y no cambia el Elo. Los formatos competitivos
1v1, 2v2 y 3v3 comparten ranking; no hay una cola de emparejamiento automática.
Un jugador sólo puede tener un desafío o combate abierto, casual o competitivo.

## Elo y colocación

Cada temporada parte de 1000 puntos. La fórmula usa K=32:

```text
esperado = 1 / (1 + 10 ^ ((ratingRival - ratingPropio) / 400))
cambio = redondear(32 × (resultado - esperado))
resultado: victoria=1, empate=0.5, derrota=0
```

Ante dos ratings de 1000, ganar cambia +16 y perder −16. Ganar a un rival
con mayor rating aporta más puntos que ganar a uno con menor rating.
El rating nunca es negativo. Los puntos no son ChengCoins ni XP.

Para tener posición definitiva y premio se necesitan **5 partidas puntuadas
y 3 rivales distintos** en esa temporada. `.cturank` muestra el progreso
de colocación y `.ctutop` identifica a quienes aún están en ese proceso.

| Rango | Rating mínimo | Premio base de cierre |
| --- | ---: | ---: |
| Bronce | 0 | 300 ChengCoins |
| Plata | 1000 | 450 ChengCoins |
| Oro | 1100 | 700 ChengCoins |
| Platino | 1250 | 1000 ChengCoins |
| Diamante | 1450 | 1500 ChengCoins |
| Maestro | 1650 | 2200 ChengCoins |

La clasificación coloca primero a jugadores clasificados, por rating
descendente. Los desempates usan victorias, menor cantidad de partidas y
una identidad interna estable. Después aparecen los provisionales.
El bot muestra nombres y posiciones; no publica sus identidades internas.

## Partidas que puntúan y abandonos

Las victorias, derrotas y empates terminados dentro del calendario pueden
puntuar. Se admiten **hasta tres partidas puntuadas por pareja en 24 horas**,
compartidas entre grupos, formatos y temporadas. Una cuarta partida de la
pareja conserva su historial y muestra que no modifica Elo.

Una rendición antes de cuatro ataques, o sin ataques de ambos jugadores,
no acredita puntos al rival y resta **16** al que se rinde. La inactividad
resta **16** a quien tenía el turno pendiente, sin premiar al rival por esa
expiración. Estas penalizaciones no completan partidas de colocación.
Rechazar, retirar o dejar vencer un desafío sin aceptar no cambia puntos.

Los controles del premio habitual de combate siguen siendo independientes:
el Elo puntuado no garantiza monedas cuando ya se alcanzó el límite económico
de esa pareja. Repetir un mensaje confirmado no repite ataques ni resultados.

## Calendario y conservación

T1 comienza el **13 de octubre de 2026 a las 00:00** y termina el
**12 de noviembre de 2026 a las 00:00**, hora de Ciudad de México.
Cada temporada dura 30 días exactos. T2 comienza en ese instante, y así
sucesivamente. El intervalo es `[inicio, fin)`.

Los desafíos y plazos de turnos se limitan al fin de su temporada.
Una partida todavía abierta al llegar ese instante vence sin puntuación
ni penalización de Elo. No se puede trasladar al calendario siguiente.
La clasificación de la temporada terminada queda congelada.

La siguiente temporada parte de 1000 puntos y colocación nueva. Se conservan
unidades, niveles, ChengCoins, logros, títulos, seriales, propietarios,
mercado y todos los historiales. El bot actualiza las temporadas al consultar
el competitivo o jugar; un apagado no prolonga sus fechas.

## Recompensas

Los jugadores clasificados reciben el premio de su rango **final**, más
un título permanente como `Oro de Chengdú · T1`. El podio añade:

| Posición definitiva | Bono |
| --- | ---: |
| 1 | +1000 ChengCoins |
| 2 | +600 ChengCoins |
| 3 | +300 ChengCoins |

Se reclama después del cierre, una vez por jugador y temporada:

```text
.ctutemporada T1
.ctutemporada T1 reclamar
```

Premio, saldo y movimiento económico se confirman juntos. Un reintento
devuelve el recibo original; no vuelve a pagar. El título se consulta en
`.ctuinventario` y el crédito en `.ctumovimientos`. No hay emisión adicional
de personajes por estos premios ni se consumen tickets para jugar ranked.

## Consultas

```text
.cturank
.cturank T1
.ctutop
.ctutop 2
.ctutop T1 2
.ctutemporada
.ctutemporada T1
.ctutemporadas
.ctutemporadas 2
```

Los listados usan páginas numéricas y códigos estables `T1`, `T2`…
El desafío identifica la temporada y el final del combate muestra los
cambios de Elo sin enviar una segunda notificación. Los turnos mantienen
el formato compacto. Todos los comandos respetan el prefijo del anfitrión.

## Persistencia e integración

Se añaden `temporadas.json`, `clasificacion.json`,
`resultadoscompetitivos.json` y `premiostemporada.json`.
La migración 9→10 conserva los registros anteriores y crea estas cuatro
colecciones vacías, con respaldo y journal. No inventa puntos ni premios
para partidas antiguas.

El cargador `plugins/CTU-*.js` y `interfaces/whatsapp/index.js` incluyen los
comandos nuevos. El anfitrión sigue entregando metadatos autenticados y el
ID del mensaje. No se crea otra instancia de juego ni otro escritor JSON.
Se valida la base antes de aceptar comandos y se espera `game.close()` al
cerrar el proceso. `game.competitive.sweepSeasons()` permite actualizar el
calendario desde un mantenimiento periódico; las consultas también lo hacen.

Los resultados competitivos y premios son inmutables. El rating se reproduce
desde los resultados, y los saldos desde el ledger. Las posiciones congeladas,
motivos, participantes, puntos y premios se validan contra su evidencia.
Las reglas futuras deben introducir una nueva política y conservar los
validadores históricos, en lugar de reinterpretar las partidas existentes.

La planificación y los criterios de cierre están en
[plan-beta-0.9.md](plan-beta-0.9.md).

## Verificación de entrega

**543 pruebas** pasaron con `npm test -- --test-isolation=none`, y
`npm run preview:whatsapp` generó **153 mensajes** de las fases anteriores
y del competitivo. Se probaron reintentos con reloj inválido, concurrencia,
cierre exacto, escritura futura rechazada y recuperación tras interrupciones.
La migración local 9→10 conservó exactamente los registros de las veinte
colecciones anteriores, con cuatro colecciones nuevas vacías y respaldo.
La conexión real de WhatsApp se ejecuta desde el proyecto anfitrión.
