# Beta 0.8 — Contenido para jugar en comunidad

Fecha: 2026-10-11. Versión 0.8.0, esquema 9. Esta entrega implementa los cinco
sistemas previstos en `project.md`, sobre todas las fases 0.1–0.7.1.
Los ocho hitos están en [plan-beta-0.8.md](plan-beta-0.8.md).

## Empezar a jugar

Regístrate, reclama un starter y prepara tu equipo como antes. Consulta
`.ctumisiones` para ver los objetivos del día, `.ctulogros` para tus hitos y
`.ctueventos` para el calendario. Un ticket permite capturar una aparición.
La bienvenida del Festival de los Faroles permite obtener el primer ticket
sin completar antes una misión; cada jugador puede cobrarla una vez.

| Comando | Resultado |
| --- | --- |
| `.ctumisiones` | Tres objetivos de hoy, progreso, premios y siguiente acción. |
| `.ctumisiones reclamar 1` | Cobrar una misión completada; también 2 y 3. |
| `.ctulogros [página]` | Progreso permanente y premios pendientes. |
| `.ctulogros reclamar L1` | Cobrar un logro desbloqueado. |
| `.ctuinventario` | Tickets, títulos e insignias. |
| `.ctuboss` | Guardián de la Niebla compartido por todos los grupos. |
| `.ctuboss dragon` | Dragón del Vacío, con 100.000 HP. |
| `.ctuboss B1` | Consultar un encuentro concreto, incluso después de terminar. |
| `.ctubossatacar 2 B1` | Atacar con la primera unidad equipada; también ataque 1. |
| `.ctubosstop B1 [página]` | Aportaciones de sus participantes. |
| `.ctuspawn` | Aparición activa del grupo y captura disponible. |
| `.ctuexplorar` | Consultar la oportunidad temporal de aparición del grupo. |
| `.ctucapturar S1` | Capturar una aparición por un ticket; sin código usa la actual. |
| `.ctueventos [página]` | Eventos próximos, disponibles y terminados. |
| `.ctuevento faroles` | Fechas, personajes, supply y bienvenida del festival. |
| `.ctuevento faroles reclamar` | Recibir la bienvenida una sola vez. |

Los encuentros tienen códigos cortos estables `B<n>` y `S<n>`. El número
pertenece a la secuencia global de encuentros: puede haber saltos en cada tipo.
No se calcula por página ni se reutiliza al vencer o capturar. El mercado
conserva los códigos `M<n>` y los comandos anteriores.

## Misiones diarias

Cambian a las 00:00 de Ciudad de México. El servidor guarda fechas UTC; la
interfaz muestra la hora local y el próximo cambio. La política actual usa el
calendario de CDMX, UTC−6 durante las fechas de este contenido.

| Código | Objetivo | ChengCoins | XP de jugador | Tickets |
| --- | --- | ---: | ---: | ---: |
| 1 | Gana 2 combates válidos | 40 | 15 | 1 |
| 2 | Juega 5 combates válidos | 60 | 20 | 1 |
| 3 | Usa 3 personajes diferentes en combates válidos | 50 | 20 | 1 |

Una partida válida está finalizada y tiene liquidación `rewarded`. Las
rendiciones tempranas, inactividad y enfrentamientos que superan el límite
por pareja no generan progreso premiado. La tercera misión cuenta especies
diferentes que participaron: llevar una reserva sin usarla o varias copias
del mismo personaje no completa el objetivo.

El progreso se calcula desde las partidas verificadas. El premio se reclama
una vez por misión, jugador y día. Un reintento del mensaje antiguo conserva
su recibo original incluso después del cambio de día o de un reinicio.
Enviar mensajes no proporciona progreso.

## Logros permanentes

| Código | Objetivo | Título | ChengCoins / XP / tickets |
| --- | --- | --- | --- |
| L1 | Primera victoria válida | Primer filo | 60 / 20 / 1 |
| L2 | Obtener 25 unidades distintas históricas | Guardián de la colección | 250 / 75 / 3 |
| L3 | Jugar 100 combates válidos | Veterano de Chengdú | 350 / 100 / 3 |
| L4 | Ganar 10 combates válidos consecutivos | Invicto | 200 / 80 / 2 |

Consultar logros o inventario comprueba los hitos y guarda el desbloqueo,
título e insignia. El premio se cobra explícitamente. La migración no concede
monedas, XP ni tickets de manera retroactiva.

Las adquisiciones cuentan IDs de unidad únicos de emisiones y transferencias;
vender no elimina el progreso, y comprar varias veces la misma unidad no lo
aumenta. La racha usa partidas aceptadas en su orden histórico: derrota,
empate, expiración o partida sin recompensa la interrumpen. Una vez obtenido,
el logro no se pierde al perder una racha posterior.

## Bosses mundiales

El Guardián de la Niebla tiene 1.000 HP, dura 24 horas y vuelve a estar disponible
desde las 24 horas posteriores a su aparición. El Dragón del Vacío tiene
100.000 HP y un intervalo/duración de 72 horas. Se crea el encuentro vigente
al consultar o participar; un boss derrotado no se reemplaza inmediatamente.
La pantalla indica desde cuándo estará disponible el siguiente.

La vida es compartida entre todos los grupos. Atacar exige registro y una
primera unidad equipada, propia y libre; no toma unidades prestadas ni en
venta/combate. Cada jugador puede atacar como máximo 20 veces por encuentro,
con 30 segundos entre ataques, aunque cambie de grupo. El ataque conserva
snapshot de unidad, propietario, versión, habilidad elegida y tirada.

Los ataques usan la potencia y precisión de la ficha avanzada. El daño propio
de boss es `round((ataque + potencia) × 100 / (100 + defensa del boss))`,
mínimo 1 si acierta. La tirada es 1–100; 1–5 produce crítico de ×1,5 si acierta.
El daño se limita a la vida restante. El boss resiste estados y no usa pasivas,
elementos ni recargas por habilidad de PvP; esta regla aparece en su pantalla.
No modifica vida, estadísticas PvP, locks ni XP de las unidades.

| Componente | ChengCoins | XP de jugador | Tickets |
| --- | ---: | ---: | ---: |
| Participación con daño positivo | 80 | 20 | 1 |
| Mayor daño, adicional | 40 | 10 | 0 |
| Último golpe, adicional | 20 | 5 | 0 |

El empate en mayor daño se resuelve por primer participante de ese daño.
Todos los participantes con daño reciben su parte; los bonos pueden coincidir
en una persona. La acción final confirma vida cero y todos los premios juntos.
Los bosses vencidos no entregan premios de victoria. Ataques repetidos conservan
su resultado y nunca descuentan HP ni pagan otra vez.

## Apariciones y captura

La actividad autenticada de un grupo habilita una comprobación por ventana de
30 minutos, con 25% de probabilidad y un mínimo de 6 horas entre apariciones.
Todos los mensajes adicionales de esa ventana comparten la misma oportunidad;
no se acumula probabilidad por volumen. `.ctuexplorar` usa exactamente esa misma
regla. El bot ignora actividad propia y remitentes sin registro.

La selección disponible usa pesos por personaje: común 30, raro 10, épico 4,
legendario 1, mítico 1. Se excluyen personajes cerrados, agotados y campañas
inactivas. Los pesos se renormalizan entre los candidatos restantes; no son
porcentajes fijos de rareza. El personaje aparece durante 10 minutos, acortados
si termina su evento antes.

La aparición muestra especie y rareza. El serial real se asigna al capturar.
La captura cuesta un ticket, exige el grupo original y vuelve a comprobar
supply y ventana del evento. Una carrera sólo produce un propietario; los
perdedores no gastan tickets. Sin ticket o con supply agotado no hay emisión
ni pago parcial. La unidad conserva procedencia `spawn` o `event` y entra en
la colección, sin equiparse automáticamente.

## Festival de los Faroles

Duración: **11–25 de octubre de 2026, 00:00 CDMX**, fin exclusivo. Bienvenida:
25 ChengCoins, 10 XP de jugador y 1 ticket, una vez por jugador.

| Personaje | Rareza / rol | Supply global | Ataques |
| --- | --- | ---: | --- |
| Zorro de los Faroles | Raro / velocista de fuego | 35 | Chispa del Farol, Danza de Luz |
| Guardián Espectral | Épico / tanque de oscuridad | 20 | Puño Espectral, Velo Espectral |

Ambos tienen pasiva y ataques propios. Sólo se emiten durante el festival,
incluso a través de futuras definiciones de sobres o APIs administrativas.
Al cerrar no se crean más, pero se conservan las unidades, seriales, procedencia,
XP y comercio. Un recibo anterior sigue disponible después del cierre o reventa.
La próxima edición debe tener ID de campaña y personajes nuevos; no reabrir
ni extender esta edición.

El [informe de balance](content-balance-0.8.json) guarda 9.000 duelos del motor
avanzado, todas las parejas del catálogo de diez personajes y sus definiciones
exactas. Zorro: 49,8%; Guardián Espectral: 57,4%. Son resultados de la heurística
de referencia, a nivel 1 y sin rasgos; no demuestran una estrategia óptima.
Las estadísticas de los personajes y unidades anteriores no se modifican.

## Integración y persistencia

El router admite `automaticSpawns: true` y procesa texto normal de grupos.
El anfitrión debe pasarle los mensajes autenticados, no sólo comandos.
Si ya tiene un cargador de plugins, usa `observeGameActivity(sock, msg)` sólo
para texto normal de grupos; no ejecutes también el router de comandos.
El observador envía un aviso únicamente cuando crea una aparición. Cada comando
envía una respuesta y usa códigos cortos; las figuras de vida son texto.

El esquema 9 añade seis colecciones: campañas, premios de contenido,
desbloqueos, encuentros, acciones y actividad de grupos. Con las anteriores y
el manifest, cada commit contiene 21 archivos. La fuente `content_reward`
se incorpora al ledger de ChengCoins. La XP de jugador se reproduce en ese
mismo orden, intercalada con premios PvP; los tickets se reconstruyen desde
recibos de contenido con ganancias y gastos. No hay saldo editable paralelo.

La migración conserva las catorce colecciones anteriores, añadiendo solamente
las definiciones/counters del festival, ataques y nuevos archivos. Mantiene
los códigos del mercado, propiedad, supply, saldos, progresión, partidas y
recibos. Recupera journals de los esquemas 1–9 antes de atender operaciones.
Políticas, acciones, premios y desbloqueos históricos no se reescriben.

## Verificación y límites

Entrega verificada con **439 pruebas**, **130 mensajes de ejemplo**, **41 comandos**
y **9.000 duelos de balance**. La base local se migró a esquema 9 con respaldo
coherente y conservación de las catorce colecciones anteriores, sin datos de prueba.

Las pruebas cubren objetivos, antiabuso, CDMX, títulos, premios únicos, tickets,
boss compartido, precisión, críticos, cooldown, límite de ataques, mayor daño,
último golpe, capturas simultáneas, grupo incorrecto, supply, calendario,
sobres de evento, reventa y recibos después de reiniciar.

La recuperación se verifica en todos los 21 puntos de publicación de la
migración, journals antiguos y fallos durante bienvenida, captura y golpe final
de boss. La suite mantiene todas las fases anteriores. Las pruebas y ejemplos
usan bases temporales y sockets simulados; la sesión real depende del anfitrión.

JSON sigue teniendo un escritor y cargando el estado completo. Los backups
no se podan automáticamente. Medir crecimiento antes de grupos numerosos o
múltiples procesos; SQLite debe conservar orden del ledger, códigos de mercado
y encuentros, recibos, versiones, seriales y relaciones de propiedad.
Administración completa, ranking, Elo y temporadas no forman parte de 0.8.
