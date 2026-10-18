# Historia 0.13 — temporada completa, fases 4 a 7

**Las Cartas Sin Nombre** continúa hasta el cierre de **Los Nombres Perdidos**:
32 misiones principales, cinco Trazos y el epílogo del Archivo Abierto. Las
[reglas de la biblia](../Chengdu_Cards_Biblia_Modo_Historia.md) siguen guiando
el canon; los guardados y premios de versiones 1 y 2 conservan sus reglas.

## Recorrido y producción

| Tramo | Contenido |
| --- | --- |
| Prólogo y capítulos I–II | Las catorce misiones anteriores conservan decisiones, identidad y premios únicos. |
| III · Las Montañas del Espejo | Huan, preparación del equipo, los tres reflejos, pasado de Bao y Centinela del Espejo. |
| IV · Las Casas Divididas | Escuchar a las Casas, proteger a aliados, reconstruir el pabellón y enfrentar la Campana del Conflicto. |
| V · El Último Nombre | Guardianes olvidados, responsabilidad de Bao, intervención de Huan y enfrentamiento final por fases. |
| Epílogo · El Archivo Abierto | Reconoce tus decisiones, entrega Custodio del Alba y abre las Pruebas del Archivo. |

Las misiones extensas se dividen en escenas cortas con un siguiente paso claro.
`.ctuhistoria` indica la misión y la escena actual; continuar, elegir y combatir
mantienen una respuesta por acción. La lectura queda guardada y se puede repartir
en sesiones. Las 18 misiones restantes suman **95 escenas y 11.021 palabras de
texto base**, sin contar variantes, opcionales ni mensajes de combate. A 220
palabras por minuto y tres segundos por acción narrativa, la estimación es
**54,8 minutos**, antes de añadir los turnos de combate y los reintentos.
Supera el objetivo de 30 minutos sin introducir esperas artificiales; no es una
medición con jugadores y depende del ritmo de lectura y de juego.

`npm run story:season` permite reproducir el conteo, sus supuestos y el
presupuesto de premios. La continuación añade 2.170 XP por compañero de la
expedición y 550 ChengCoins; la campaña principal completa suma 3.665 XP y
1.110 ChengCoins en premios únicos. Un starter nuevo termina cerca del nivel
9, sin que el modo Historia exija evolucionarlo.

| Fase de Historia | Entrega terminada |
| --- | --- |
| 4 | Capítulo III, duelo amistoso que admite derrota, tres roles con aliados narrativos, Centinela y tercer Trazo. |
| 5 | Capítulo IV, protección sucesiva de Tao, Mei y Yun, reconstrucción asíncrona con clan o ruta individual, Campana y cuarto Trazo. |
| 6 | Capítulo V, cuatro puertas con pistas, voces olvidadas, confesión de Bao, Archivista de tres fases y tres desenlaces. |
| 7 | Epílogo, cinco Trazos, título social permanente, cuatro opcionales, escenas archivadas, tres pruebas y métricas agregadas. |

## Jefes y aprendizaje obligatorio

Los jefes tienen encuentros de reconocimiento: **una o dos derrotas obligatorias
según el jefe y cuatro ante el Archivista**. La interfaz lo anuncia antes de
actuar, muestra las derrotas completadas y explica que un intento de reconocimiento
todavía no admite victoria. Después de terminar el aprendizaje se abre el intento
en el que sí puedes vencer.

Las derrotas quedan registradas por encuentro; **rendirse no avanza el requisito**.
El Eco de Tinta y el Guardián exigen una; Mercader, Centinela y Campana exigen
dos; el Archivista exige cuatro. Cada reconocimiento termina en un máximo de
20 acciones. Reiniciar la historia abre otro recorrido y vuelve a comenzar el
aprendizaje, conservando los premios ya entregados.
Perder no retira unidades, monedas ni XP, y los intentos no crean premios nuevos.
La señal del enemigo, las pistas y los controles disponibles ayudan a aprender
su mecánica sin ocultar las restricciones del reconocimiento.

| Acción | Uso |
| --- | --- |
| `.ctuhistoria apoyar` | Recupera vida del equipo y consume el turno; tiene recarga. |
| `.ctuhistoria purificar` | Reduce tensión o sellos cuando el encuentro lo permite; tiene recarga. |
| `.ctuhistoria proteger` | Protege a aliados en peligro y resuelve la fase Elección del final. |
| `.ctuhistoria defender` | Se mantiene como respuesta a los ataques cargados. |
| `.ctuhistoria romper` / `.ctuhistoria observar` | Conservan las mecánicas de raíces y señuelos. |
| `.ctuhistoria inspeccionar` | Consulta gratuita de la situación; no sustituye una acción táctica. |

El Centinela exige variar las técnicas; atacar continuamente aumenta la tensión
de la Campana. El Archivista alterna Memoria, Control y Elección: leer la señal,
alternar acciones, purificar y proteger tienen funciones concretas. La interfaz
ofrece sólo las acciones disponibles y conserva las recargas y los efectos visibles.

## Rutas opcionales y cooperación

`.ctuhistoria opcionales` muestra cuatro rutas: I-A, II-A, III-A y IV-A. Las
rutas aún cerradas no revelan su contenido. Para entrar en una disponible:
`.ctuhistoria opcional III-A`. Los controles habituales sirven dentro de la ruta.

`.ctuhistoria volver` pausa la actividad y vuelve al avance principal. Durante
un combate debes usar primero `.ctuhistoria rendirse`; la interfaz explica ese
paso y mantiene la campaña guardada. Completar una ruta opcional no reemplaza
el recorrido principal ni vuelve a entregar premios ya reclamados.

La reconstrucción de IV-03 utiliza `.ctuhistoria aportar`, también disponible
como `.ctuhistoria contribuir`. El sistema comprueba la pertenencia real al clan;
la variante individual permite la misma progresión principal. Las aportaciones
son narrativas y no conceden permiso para ejecutar intercambios o retiros reales.

## Desenlace y permanencia

El destino del Sello ofrece tres resoluciones: **El Archivo Protegido**, **Las
Voces Abiertas** y **El Consejo del Bambú**. Todas conservan el Archivo restaurado
y los vínculos libres; cambian el reconocimiento personal y el epílogo.

Al terminar E-02 se obtiene **Custodio del Alba**. El título se puede consultar
y seleccionar mediante `.ctusocial titulos`. Las decisiones y el recuerdo final
quedan registrados sin convertir el desenlace en una modificación del mercado,
de los clanes o de la propiedad de unidades.

| Comando | Contenido después de la campaña |
| --- | --- |
| `.ctuhistoria escenas III-04 1` | Releer una escena de una misión completada; cada página conserva una escena. |
| `.ctuhistoria pruebas` | Consultar las Pruebas del Archivo disponibles. |
| `.ctuhistoria prueba 1` | Iniciar un encuentro de entrenamiento; los premios de campaña no se duplican. |
| `.ctudiario historia` | Resumen del viaje, decisiones recientes, recuerdos y Trazos conocidos. |
| `.ctudiario historia cronica 2` | Consultar cuatro entradas detalladas por página; también personajes, trazos, decisiones, recuerdos y atlas. |

El archivo de escenas es de lectura: conserva las decisiones del recuerdo
guardado, no cambia el canon ni crea recompensas. Las Pruebas del Archivo
permiten seguir usando el sistema de combate sin una fuente repetible de XP,
ChengCoins o materiales. El cierre prepara la siguiente temporada sin iniciarla.
Cada prueba conserva un recuerdo cosmético en su primera superación; repetirla
no duplica ese recuerdo ni concede recursos.

## Compatibilidad, economía y revisión

La entrega utiliza contenido narrativo de **versión 3** y mantiene el esquema
de datos 12. Las acciones y los encuentros antiguos se reproducen con sus
versiones originales. Continuar una campaña anterior conserva sus unidades,
propietarios, decisiones, XP y premios; el reinicio oculto de pruebas sigue sin
duplicar recibos ni recursos.

El ajuste de premios de 0.12 se conserva en las catorce misiones iniciales.
La XP del PvP online no cambia. Los premios narrativos siguen ligados a la
primera finalización y a unidades reales del equipo; una derrota de aprendizaje
no es un método de entrenamiento repetible.

```sh
node --test --test-isolation=none tests/whatsapp-story-season.test.js
npm run preview:whatsapp
npm run story:season
npm run balance:story:season -- 50
node scripts/simulate-story-balance.js 20 --accessibility
npm run story:metrics -- /ruta/absoluta/datos
npm test -- --test-isolation=none
```

Las pruebas y ejemplos usan partidas temporales, sin contactar con WhatsApp.
Las métricas agregadas distinguen inactividad de abandono confirmado y miden
la longitud de mensajes. Separan los reconocimientos obligatorios de otros
intentos y no confunden una prueba activa con una campaña principal pendiente.
La duración humana, retención y satisfacción se deben
contrastar con partidas reales del bot anfitrión.

### Balance reproducible

Se comprobaron 3.600 duelos con los tres starters comunes, solos y en equipos
de tres, a los niveles anteriores al premio de cada jefe. La tabla muestra el
rango de victorias de la política táctica en 50 semillas por combinación,
**después de cumplir las derrotas obligatorias**. No representa resultados de
jugadores reales ni mezcla el reconocimiento con intentos que permiten ganar.

| Encuentro | Nivel probado | Reconocimientos exigidos | Victoria táctica |
| --- | --- | --- | --- |
| Eco de Tinta | 3 | 1 | 88–100% |
| Guardián Marchito | 4 | 1 | 94–100% |
| Mercader Sin Rostro | 5 | 2 | 50–100% |
| Centinela del Espejo | 6 | 2 | 72–100% |
| Campana del Conflicto | 7 | 2 | 96–100% |
| Archivista | 8 | 4 | 66–100% |

La política de repetir el ataque básico obtuvo 0% en esas combinaciones.
Otros 1.200 duelos con 20 semillas y 60 casos de tiradas fijas comprobaron los
encuentros intermedios, los tres vecinos y las pruebas posteriores. Todos los
casos fijos terminaron en victoria sin evolución; las pruebas finales conservan
derrotas posibles y un límite de 50 turnos.

La vista previa generada contiene 405 ejemplos, incluidos 210 mensajes de
Historia y diario, con un máximo de 2.957 unidades UTF-16 y ninguno por encima
del presupuesto de lectura de 4.096. Los 40 JSON locales conservaron sus hashes
tras validar la base en esquema 12; los ejemplos y las pruebas usan otras bases.

Se verificaron **961 casos de prueba** entre la suite general y la repetición
dirigida del recorrido completo, incluidos los tres finales, las cuatro rutas
opcionales, las tres pruebas, el título persistente y el reinicio sin duplicar
premios. Las pruebas de recuperación cubren seis puntos de interrupción del
guardado de una derrota de reconocimiento.
