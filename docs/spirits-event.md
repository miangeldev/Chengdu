# La Noche de los Espíritus

Una niebla recorre el bambú y las máscaras de una compañía olvidada despiertan
en un antiguo teatro. Los Custodios recuperan tres sellos para devolverles sus
nombres. Es un evento ficticio de fantasía con máscaras y teatro inspirados en
Sichuan; no se presenta como Halloween tradicional chino ni como Zhongyuan.

## Calendario automático

Las fechas se interpretan en `America/Mexico_City`:

| Momento | Fecha y hora CDMX |
| --- | --- |
| Revancha de Faroles | 24 de octubre de 2026, 00:00 |
| Cierre de Faroles y apertura de Espíritus | 25 de octubre de 2026, 00:00 |
| Revancha de Espíritus | 1 de noviembre de 2026, 00:00 |
| Cierre de Espíritus | 2 de noviembre de 2026, 00:00 |

El comienzo enlaza con el cierre guardado de Faroles. Se usa el 25 de octubre,
en lugar del 26 de la propuesta, para cumplir la apertura inmediata al terminar
Faroles. No hay que ejecutar un comando de activación: las consultas,
apariciones y operaciones comprueban el reloj. Cada intervalo incluye su inicio
y excluye su final, sin ventanas en las que ambos eventos puedan emitir.

Antes de la apertura, el calendario y la presentación son públicos; fragmentos,
sellos, canjes, apariciones exclusivas y teatro permanecen deshabilitados. Al
cerrar, dejan de generarse nuevas recompensas y personajes del evento. Las
unidades obtenidas conservan su identidad, XP y posibilidad de comerciarse.

## Revancha de las últimas 24 horas

Durante el último día de cada evento, el 75% de las selecciones para una nueva
aparición se dirige al conjunto de personajes disponibles de ese evento. Esto
modifica qué personaje aparece; conserva el ritmo de comprobación, la separación
mínima de una hora y el coste de un ticket por captura. Enviar mensajes extra no
mejora las probabilidades.

La probabilidad sólo se aplica mientras quede emisión de al menos un personaje
del evento. Si se agotan todos, la selección continúa con personajes normales.
No se aumenta la emisión ni se promete que todos los jugadores obtendrán una
carta. Capturas y canjes comparten el mismo límite global de cada personaje.

## Cómo jugar

```text
.ctueventos
.ctuevento espiritus
.ctuevento espiritus reclamar
.ctuevento espiritus fragmentos
.ctuevento espiritus sellos
.ctuevento espiritus jefe
```

La bienvenida entrega 25 ChengCoins, 10 XP de jugador y un ticket una vez por
cuenta. El menú del evento muestra objetivos y comandos cortos para cada paso.

| Sello | Objetivo | Reclamo |
| --- | --- | --- |
| Luz Errante | Reunir 6 fragmentos en PvP válido | `.ctuevento espiritus sello luz` |
| Máscaras | Causar 100 de daño al teatro y alcanzar dos máscaras distintas | `.ctuevento espiritus sello mascaras` |
| Nombre Recobrado | Aportar daño en una victoria comunitaria contra el Guardián | `.ctuevento espiritus sello nombre` |

Los fragmentos de luz son progreso del evento, distinto de los materiales de
artesanía. Una victoria PvP válida aporta 3 y una derrota válida aporta 2. Sólo
cuenta un duelo por rival y día, con un máximo de tres duelos diarios. Ambos
extremos del combate, aceptación y cierre, deben quedar dentro del evento.
Los combates sin recompensa y las retiradas tempranas no cuentan. La Historia
no genera estos fragmentos.

Cada sello se reclama una vez; volver a enviar el mismo mensaje conserva su
resultado original. El progreso se obtiene de combates y acciones confirmados,
para que una caída del bot no lo duplique ni lo pierda.

## El teatro embrujado

```text
.ctuevento espiritus jefe
.ctuboss mascaras
.ctubossatacar 1 B2
.ctubossatacar 2 B2
.ctubosstop B2
```

`B2` es un ejemplo: el propio mensaje muestra el código corto del encuentro
vigente. Los ataques se realizan en grupo con la primera unidad equipada. La
vida y las aportaciones se comparten entre grupos. Cada participante conserva
su espera de 30 segundos y un máximo de 20 ataques por encuentro.

El Guardián tiene 1.800 HP, reaparece según su periodo diario y cambia de máscara
cada tres ataques conjuntos:

| Máscara | Mecánica |
| --- | --- |
| Jade | Aumenta su defensa; la magia atraviesa parte del bastión |
| Azul | Reduce la precisión de los ataques físicos; la magia disipa el velo |
| Carmesí | Abre su defensa y aumenta la precisión de los jugadores |

La respuesta identifica tanto la máscara ante la que se resolvió el ataque como
la máscara actual. Cada contribución afecta una sola vez a los HP comunitarios.
Los premios de participación, mayor daño y último golpe conservan sus recibos.
Para el tercer sello cuenta haber causado daño en un encuentro que finalmente
termine en victoria dentro de las fechas del evento.

## Compañeros exclusivos

| Personaje | Rareza | Emisión global | Canje de misión |
| --- | --- | --- | --- |
| Zorro de las Llamas Errantes | Épico | 20 | Sellos Luz y Máscaras |
| Guardián de las Mil Máscaras | Legendario | 10 | Los tres sellos |

```text
.ctuevento espiritus reclamar zorro
.ctuevento espiritus reclamar guardian
```

Cada cuenta puede canjear una vez a cada personaje, mientras quede emisión.
También aparecen en grupos durante el evento y se capturan con tickets. No
forman parte de los sobres normales ni de la elección de starter. La ficha
detalla estadísticas y técnicas:

```text
.ctuficha zorro_llamas_errantes
.ctuficha guardian_mil_mascaras
```

El Guardián jugable también cambia de rostro en reglas avanzadas y en los nuevos
combates de Historia: Jade obtiene un escudo de 6 puntos, Carmesí aumenta el
ataque un 6% en esa acción y Azul recupera un 4% de HP máximo. La postura avanza
al comenzar su acción; no otorga turnos extra. El Zorro utiliza fuego espiritual
e ilusiones, con quemaduras moderadas. Las pasivas, efectos y precisión completos
se consultan en la ficha.

## Fatality

Estos compañeros estrenan una tercera técnica que puede despertar con un 10%
de probabilidad al iniciar el combate, por unidad. La tirada se guarda: consultar
el estado, cambiar de reserva, repetir mensajes o reiniciar el bot no la repite.
La técnica permanece vinculada al personaje obtenido después del cierre del
evento.

| Personaje | Técnica | Potencia | Precisión |
| --- | --- | --- | --- |
| Guardián de las Mil Máscaras | Mil Rostros, un Destino | 52 | 90% |
| Zorro de las Llamas Errantes | Última Llama del Umbral | 50 | 90% |

Es una oportunidad de ataque más fuerte, no una ejecución automática: aplica
las defensas, escudos, afinidades y otras reglas del modo. Consume turno y su
único uso incluso si falla. No entrega premios adicionales. La opción 3 sólo
aparece cuando está disponible; las opciones 1 y 2 se conservan.

```text
.ctuatacar 3
.ctuhistoria atacar 3
.ctubossatacar 3 B2
```

En el teatro, la apertura de cada unidad se resuelve y guarda al realizar su
primer ataque en ese encuentro; si despierta, el mensaje ofrece la opción 3.
Cambiar la unidad activa o de grupo no vuelve a tirar una apertura ya guardada.
La ficha muestra precisión, potencia y si la técnica despertó o ya se consumió.

## Equilibrio comprobado

Las estadísticas base finales son **134 HP / 26 ATK / 25 DEF / 9 VEL** para el
Guardián y **110 HP / 29 ATK / 21 DEF / 18 VEL** para el Zorro. Se verificaron
36.000 duelos en niveles 1, 5, 15 y 20 mediante una heurística reproducible del
motor real, sin afirmar que juegue de forma óptima. El Guardián obtiene un
67–75% en la cesta de rivales anteriores, frente al 78–84% del Dragón Carmesí.
Fatality cambia los resultados individuales entre +0,4 y +3,5 puntos
porcentuales; mantiene respuestas tácticas y ventajas elementales.

Tres copias tienen un 27,1% de probabilidad de que al menos una despierte la
técnica. Cada copia conserva su propia tirada y un único uso: cambiar de unidad
no renueva oportunidades. Los equipos con tres Guardianes obtuvieron un
50–68% frente al equipo de referencia, sin una victoria asegurada. El
[informe de datos](spirits-balance.json) y las
[notas de equilibrio](spirits-balance.md) detallan los emparejamientos y límites.

## Entrega y comprobación

1. Catálogo y calendario: altas de campaña, cartas y ataques sin alterar las
   unidades emitidas ni los recibos anteriores.
2. Habilitación temporal: apertura y cierre exactos, incluidas la revancha y la
   selección de apariciones con stock real.
3. Progreso de sellos: pruebas de PvP y teatro, canjes únicos y recuperación de
   operaciones.
4. Teatro reutilizable: jefe comunitario con máscaras, aportaciones y liquidación.
5. Fatality: tirada congelada, tercer ataque, uso único y conservación de
   combates anteriores.
6. WhatsApp: navegación, ayuda, barras, comandos cortos, mensajes de fechas y
   errores con el prefijo configurado. Se conserva la preferencia de no mostrar
   contadores internos de derrotas de la Historia.
7. Validación: pruebas con datos temporales y vistas previas, sin cuentas de
   prueba en los datos del proyecto.

No se añade un comando raíz nuevo; las actividades se agrupan en
`.ctuevento espiritus` y los encuentros reutilizan `.ctuboss`.

Verificación de entrega: `npm test` aprueba **1.093 casos**. La vista previa
regenerada contiene **412 ejemplos** y la simulación reproducible compara
**36.000 duelos**. Se comprobó la recuperación de migración, sellos y canjes tras
interrumpir escrituras; los reintentos no duplican unidades, premios ni tiradas.
La DB local pasó al esquema 13 con respaldo completo y sin modificar el contenido
de sus 44 registros anteriores; ahora contiene 41 JSON y 53 registros, sin
jugadores ni unidades de prueba.
