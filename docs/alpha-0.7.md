# Alpha 0.7 — Combate avanzado

La etapa 0.7 de `project.md`, allí nombrada Beta, se entrega como Alpha 0.7 a
petición del proyecto. Incorpora equipos 3v3, estados, buffs, debuffs, elementos,
cambios y habilidades sobre la base completa de las fases anteriores.

## Plan y fases de implementación

| Fase | Entrega y criterio de cierre |
| --- | --- |
| 0.7.1 — Reglas y datos versionados | Reglas avanzadas versión 2; partidas clásicas versión 1; perfiles de contenido versión 1; esquema 8 con migración y respaldo sin recompensas retroactivas. |
| 0.7.2 — Equipos | Una a tres unidades propias distintas, selección en orden, añadir/quitar/limpiar y reordenar; equipo bloqueado durante combate. |
| 0.7.3 — Motor de acciones | Turnos, precisión, cambios, KO, entradas automáticas y cierre; reproducción determinista de acciones. |
| 0.7.4 — Elementos, efectos y habilidades | Modificadores elementales, estados, buffs, debuffs, pasivas declarativas y recargas. |
| 0.7.5 — Progresión y mercado | Recompensas versión 2; XP total repartida sólo entre participantes; límites por pareja, ledger, locks y propiedad conservados. |
| 0.7.6 — WhatsApp | Una respuesta por turno con activos, reservas y opciones válidas; fichas detalladas, historial humano y errores útiles. |
| 0.7.7 — Integración | Pruebas de fases anteriores y nuevas, recuperación, revisión de previews y validación de la base real. |

La [planificación detallada](plan-alpha-0.7.md) especifica cada criterio de cierre.
El estado final de las verificaciones y la migración local se registra en
`project.md`. La conexión real de WhatsApp pertenece al bot anfitrión;
las pruebas y previews de este módulo usan un socket simulado.

## Las fases anteriores siguen integradas

| Versión | Comportamiento que se conserva |
| --- | --- |
| MVP 0.1 | Identidad autenticada, registro, starter único, catálogo, colección, emisión y seriales globales. |
| MVP 0.2 | Grupos, desafíos, aceptación/rechazo/cancelación, reglas clásicas, precisión, snapshots y reintentos únicos. |
| MVP 0.3 | Nivel y XP independientes, ChengCoins, estadísticas, historial propio y límites de premios. |
| Alpha 0.4 | Sobre Básico, drops según disponibilidad, rasgos, variantes y recibos que sobreviven a reinicios. |
| Balance 0.4.1 | Bases de combate versionadas; supply común 50, raro 35, épico 20, legendario 10; mítico futuro 5. |
| Alpha 0.5 | Diario de 100 cada 24 h, tienda, ledger y movimientos privados. |
| Alpha 0.6 | Mercado, comisión del 5%, vencimiento de siete días, locks, compraventas e historia de propietarios. |
| Alpha 0.6.1 | Páginas numéricas cortas en siete listados, con filtros y navegación Anterior/Siguiente. |

No se reinician colecciones, saldos, niveles, seriales ni cupos. Comprar una
unidad mantiene su progreso y procedencia. Venderla la retira del equipo y
bloquea únicamente esa unidad; una unidad de combate no se publica.

## Equipo y modos

```text
.ctuequipo
.ctuequipo usar PAND-000001 MAGC-000001 LOBO-000001
.ctuequipo agregar MONJ-000001
.ctuequipo quitar MAGC-000001
.ctuequipo ordenar 2 1 3
.ctuequipo limpiar
```

Cada ID aparece una vez. `usar` reemplaza toda la selección, `agregar` añade
al final y `quitar` mantiene el orden restante. `ordenar` exige una permutación
exacta de las posiciones actuales. La posición 1 abre la partida. El equipo
no concede propiedad ni admite una unidad ajena, en venta o bloqueada.

`.ctupelea @jugador` usa reglas avanzadas y exige equipos del mismo tamaño:
uno, dos o tres. Los sufijos `1v1`, `2v2` y `3v3` exigen ese tamaño exacto;
ambos jugadores vuelven a cumplirlo al aceptar. Los equipos pueden cambiar
durante el desafío pendiente. Al aceptar se congelan snapshots y se bloquean
todas las unidades. Cada jugador admite un desafío o combate abierto, entre grupos.

`.ctupelea @jugador clasico` usa la primera unidad y las reglas originales.
Las reservas no se bloquean en modo clásico, aunque el equipo no puede editarse
durante la pelea. La API conserva `mode: 'classic'` por defecto para clientes
existentes; WhatsApp solicita explícitamente `mode: 'auto'`.

El más rápido de los dos activos empieza; un empate favorece al desafiante.
Desafíos vencen en cinco minutos y partidas tras treinta minutos sin acción.
El avanzado admite cien acciones y el clásico cincuenta; si ambos conservan
unidades al alcanzar el límite, termina en empate.

## Cambios y participación

`.ctucambiar 2` o `.ctucambiar 3` elige una reserva viva y consume el turno.
Puede volver a la posición 1 cuando esté en reserva. Cambiar al activo actual,
a una posición inexistente o a una unidad derrotada se rechaza sin avanzar.

Al caer un activo entra automáticamente la primera reserva viva en orden.
Esa entrada no consume otra acción ni genera otro mensaje. La victoria exige
derrotar a todas las unidades del rival. Una unidad derrotada pierde sus
efectos y no puede volver a entrar durante esa partida.

Participar significa entrar al campo, incluso por cambio automático. Los dos
activos iniciales participan. Sólo las participantes reciben XP y estadísticas
de unidad. Todas las unidades se liberan al cerrar, aunque nunca hayan entrado.

## Elementos y daño

| Atacante | Ventaja contra | Resistencia del objetivo |
| --- | --- | --- |
| Fuego | Naturaleza | Agua |
| Naturaleza | Agua | Fuego |
| Agua | Fuego | Naturaleza |
| Luz | Oscuridad | Ninguna |
| Oscuridad | Luz | Ninguna |
| Neutral | Ninguno | Ninguna |

Ventaja usa 125% del daño y resistencia 80%; iguales, Neutral y otros cruces
usan 100%. El elemento del ataque se compara con el de la unidad objetivo.

```text
ataque efectivo = floor(ataque × (100 + buff) / 100)
defensa efectiva = floor(defensa × (100 − debuff) / 100)
daño base = max(1, potencia + ataque efectivo − defensa efectiva)
daño elemental = max(1, floor(daño base × multiplicador / 100))
daño a HP = daño elemental − absorción del escudo, limitado al HP restante
```

La precisión se mantiene: una tirada uniforme entera 0–99 acierta si es menor
que la precisión. Fallar consume el turno y activa la recarga, sin aplicar
efectos del ataque. La tirada queda guardada para reproducir la acción.
Esta versión no añade un sorteo de críticos. Físico y Mágico son tipos
declarados; ambos utilizan esta fórmula en 0.7.

## Estados, buffs, debuffs y recargas

| Efecto | Regla |
| --- | --- |
| Veneno / Quemadura | Al comenzar el turno propio pierde el porcentaje indicado de HP máximo, redondeado hacia abajo y con mínimo 1. |
| Regeneración | Al comenzar el turno propio recupera el porcentaje de HP máximo, sin superar el máximo. |
| Aturdimiento | La siguiente acción válida consume el turno sin atacar ni cambiar; se conserva su intención. |
| Escudo | Absorbe puntos de daño directo, sin absorber veneno ni quemadura. Desaparece al agotarse o vencer. |
| Ataque aumentado | Aumenta porcentualmente ataque durante su duración, sin modificar la unidad fuera del combate. |
| Defensa reducida | Reduce porcentualmente defensa durante su duración, sin modificar la unidad fuera del combate. |

Efectos y recargas avanzan sólo en turnos propios del activo. La reserva
conserva HP, estados y recargas congelados hasta volver. Veneno, quemadura,
regeneración y aturdimiento se procesan al comenzar el turno; escudo y
modificadores vencen al cerrar turnos propios. Un efecto aplicado durante
ese mismo turno no pierde inmediatamente duración. Reaplicar un mismo tipo
conserva la mayor duración y potencia, sin apilar duplicados. Una unidad
ya derrotada no recibe efectos.

Recarga 2 impide usar el ataque en los siguientes dos turnos propios del
activo. El básico no tiene recarga. El turno muestra `⏳ 2T` y ofrece ataques
disponibles y reservas vivas. Rechazar una acción no reduce efectos ni recargas.

## Contenido de los ocho personajes

Todos conservan stats y cupos del balance 0.4.1. El básico tiene 25 POT,
100% de precisión, elemento del personaje, sin efecto ni recarga.

| Personaje | Elemento | Pasiva al entrar por primera vez | Especial: POT / precisión / recarga | Efecto especial |
| --- | --- | --- | --- | --- |
| Panda Guerrero | Naturaleza | Piel de Bambú: escudo 12, 2 turnos. | 36 / 85% / 2 | Escudo 12, 2 turnos. |
| Mago Carmesí | Fuego | Sangre Carmesí: ataque +12%, 2 turnos. | 36 / 80% / 2 | Quemadura 4% al rival, 2 turnos. |
| Lobo Sombrío | Oscuridad | Mirada Nocturna: escudo 10 y defensa −10% al rival, 2 turnos. | 35 / 85% / 2 | Defensa −15% al rival, 2 turnos. |
| Monje Celestial | Luz | Serenidad: escudo 6 durante 2 turnos y regeneración 8% durante 3 turnos. | 32 / 90% / 2 | Regeneración 6%, 2 turnos. |
| Guardián Jade | Naturaleza | Muralla de Jade: escudo 18, 2 turnos. | 30 / 85% / 3 | Aturdimiento del rival, 1 turno. |
| Bruja Lunar | Agua | Marea Lunar: veneno 3% al rival, 2 turnos. | 31 / 85% / 2 | Veneno 5% al rival, 3 turnos. |
| Dragón Carmesí | Fuego | Ascua Ancestral: ataque +10%, 2 turnos. | 38 / 80% / 2 | Quemadura 4% al rival, 2 turnos. |
| Espíritu Bambú | Naturaleza | Pulso del Bosque: regeneración 6%, 3 turnos. | 30 / 90% / 2 | Regeneración 7%, 2 turnos. |

Las duraciones son turnos propios de quien recibe el efecto. La pasiva se
activa una vez por unidad y partida; volver a entrar no la reactiva.
Las pasivas ofensivas apuntan al activo rival en ese momento. El contenido
introduce diferencias de rol y no promete igualar cada cruce elemental.
La rareza no agrega multiplicadores ocultos.

## Simulación de balance

```sh
npm run balance:advanced
```

El [informe reproducible](advanced-balance-0.7.json) usa el motor real,
semilla 73 y 200 muestras por pareja: los 28 cruces de ocho personajes 1v1
y 15 cruces de seis composiciones 3v3, con 8.600 partidas en total.
La iniciativa empatada alterna al desafiante. La heurística evita ataques en
recarga, valora efectos y contempla el coste de cambiar, con hasta dos cambios
voluntarios por jugador.

| Formato | Partidas | Acciones medias | Cambios medios | Empates |
| --- | ---: | ---: | ---: | ---: |
| 1v1 | 5.600 | 6,97 | 0,00 | 0 |
| 3v3 | 3.000 | 24,33 | 1,83 | 0 |

Son resultados de una estrategia de referencia al nivel 1, sin rasgos ni
ponderación por supply. Las composiciones no agotan todos los equipos posibles
y el algoritmo no demuestra una estrategia óptima. El informe conserva los
cruces y sus resultados para revisar ventajas elementales y cambios futuros;
un cruce favorable no representa el balance global.

Los [ensayos del Lobo](advanced-balance-sweep-0.7.json) y
[ensayos del Monje](advanced-monk-sweep-0.7.json) reúnen otras 43.000 partidas.
Permitieron escoger aumentos moderados de supervivencia para sus pasivas;
sus stats de nacimiento y cupos permanecen intactos. En el informe final,
la puntuación media 1v1 es 31,9% para Lobo y 39,5% para Monje. Hay cruces con
ventajas amplias; las decisiones y composiciones reales deben seguir informando
futuras revisiones, conservando los perfiles de partidas ya aceptadas.

## Recompensas sin multiplicar la economía

Victoria mantiene 120 ChengCoins, 35 XP de jugador y 35 XP total de unidades;
derrota, 15 XP de jugador y 15 XP total de unidades; empate, 20 y 20.
La XP de unidades se divide entre participantes; el sobrante va en orden
de equipo. Para tres participantes y 35 XP se guardan 12, 12 y 11. Una reserva
sin entrar recibe cero. Siguen los umbrales de 100 × nivel actual y máximos
de jugador 50 y unidad 20.

El límite es tres partidas con premio por pareja en 24 horas, compartido entre
grupos, unidades y modos. Rendirse exige cuatro ataques registrados y ataques
de ambos jugadores. Cambiar o quedar aturdido no sustituye esos ataques.
Inactividad, rendición temprana y límite por pareja producen recibos cero;
resultado y estadísticas se conservan.

Cada cierre guarda dos recibos, uno por jugador, con lista de premios de
unidades participantes. Cada jugador tiene un movimiento de monedas ligado
a ese recibo. Cambiar de unidad no genera un premio adicional.

## WhatsApp y privacidad

El turno reúne resultado anterior, eventos relevantes, activos, reservas
compactas, ataques y cambios disponibles. No muestra UUID, seriales,
defensa, velocidad ni precisión. Inicio y victoria tienen presentación propia;
las barras son texto y pueden desactivarse.

`.ctuficha` muestra los dos activos de una partida; `.ctuficha UNIT-ID`
encuentra también reservas y muestra su snapshot congelado. Fuera de combate
muestra el perfil avanzado vigente. La partida clásica activa conserva su
ficha original. La ficha de plantilla funciona antes de registrarse y no emite.

`.ctuhistorial` mantiene páginas numéricas, resultado, modo y premio. El detalle
presenta ataques, cambios, efectos, KO y entradas en lenguaje humano. Sólo
los participantes acceden, incluso después de vender alguna unidad.

Reintentar el mismo mensaje autenticado conserva desafío, aceptación o acción,
sin consumir otra tirada ni avanzar el turno. Muestra el estado actual con
aviso de repetición, sin presentar el ataque antiguo como nuevo. Cambiar
el contenido de un mensaje ya confirmado produce conflicto.

## Migración, auditoría y datos a futuro

El esquema 8 conserva los catorce JSON. La migración 7→8 añade
`character.combat` y `attack.combat`, perfiles declarativos versionados,
e incrementa las revisiones del contenido incorporado. Preserva stats clásicos,
unidades, propiedad, XP, monedas, emisiones, sobres y recibos. Un personaje
personalizado recibe perfil Neutral sin pasiva; ataques desconocidos conservan
sus datos base al construir su perfil.

Partidas anteriores permanecen con `rulesVersion: 1` y snapshots intactos.
Las avanzadas guardan `rulesVersion: 2`, formato, tamaño, equipo ordenado,
índice activo, perfiles congelados, HP, efectos, recargas, participación y uso
de pasiva. Cada acción guarda intención, resultado, tirada y eventos. El
validador reproduce la secuencia para comprobar estado y resultado; no usa
el catálogo actual para resolver acciones históricas.

Propiedad se comprueba mediante `ownershipVersion`, también tras revender.
Saldo y XP se reconstruyen con recibos inmutables. Cerrar publica premios,
progreso, estadísticas y liberación de todas las unidades en un commit recuperable.

Un balance posterior exige nuevas revisiones/perfiles o reglas, sin cambiar
constantes históricas. Estados nuevos, críticos, energía, evoluciones, PvE y
temporadas tendrán sus contratos y fuentes de premios. Regalos e intercambios
requieren transferencia propia. La siguiente etapa puede añadir misiones,
achievements, bosses, spawns y eventos sin reiniciar identidades, unidades o supply.

## Verificación reproducible

```sh
npm test -- --test-isolation=none
npm run preview:whatsapp
npm run db:validate
```

Las pruebas ejercitan una partida 3v3 completa: cambios, recargas, efectos,
KO, entradas automáticas y premios. Verifican errores, reintentos, presentación
clásica, reservas congeladas, saldos/XP, propiedad e integridad histórica.
Almacenamiento comprueba migraciones, falsificación y recuperación antes y
después del marcador de commit.

La [vista previa](whatsapp-preview.md) contiene respuestas de comandos reales
contra una base temporal. El anfitrión carga los 30 plugins o el router y
reinicia el proceso del bot tras instalar los cambios.
