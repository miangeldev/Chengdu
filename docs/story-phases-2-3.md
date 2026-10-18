# Historia 0.12 — fases 2 y 3

La campaña **Las Cartas Sin Nombre** completa el Bosque de los Susurros y abre
el Mercado de los Ecos: **14 misiones**, tres encuentros nuevos, dos Trazos y
decisiones con consecuencias visibles. La referencia de diseño sigue siendo
[la biblia de Historia](../Chengdu_Cards_Biblia_Modo_Historia.md).

## Plan de entrega

1. Conservar las siete misiones, acciones, encuentros y premios originales como
   contenido de versión 1, para reproducir los guardados existentes.
2. Completar I-04 e I-05 con Nube, barreras, ataques anunciados, restauración del
   Guardián y Primer Trazo.
3. Construir II-01 a II-05 con comerciantes legítimos, autenticidad, oferta
   simulada, investigación de dos pistas y Mercader Sin Rostro.
4. Integrar los controles tácticos en WhatsApp y mantener inspección gratuita,
   guardado, reintentos y una respuesta por acción.
5. Reducir un 25% el presupuesto del recorrido inicial para nuevos premios,
   manteniendo XP útil hacia la evolución y conservando lo ya entregado.
6. Permitir continuar un guardado de fase 1 mediante una actualización auditada
   del contenido, con sus decisiones y premios anteriores intactos.
7. Verificar propiedad histórica, bloqueo de unidades, recompensas únicas,
   versiones anteriores, combates y la campaña completa desde WhatsApp simulado.
8. Generar ejemplos revisables y documentar los límites de la siguiente fase.

## Contenido nuevo

| Misión | Experiencia y consecuencia |
| --- | --- |
| I-04 · El claro de la tinta | Nube reconoce un nombre perdido; el Acechador de Tinta prepara una emboscada anunciada. La reacción de Lian recuerda cómo trataste a los Ecos. |
| I-05 · Guardián Marchito | Raíces, cargas y aperturas. Recuperar parte de su memoria concede el Primer Trazo y el recuerdo del Guardián. |
| II-01 · Rumores entre faroles | Mei protege a sus comerciantes. Escuchar con cortesía o mostrar pruebas cambia el testimonio recibido; vuelve una pista del bosque. |
| II-02 · El puesto sin nombre | Inscripción e historial ayudan a distinguir poder aparente de identidad auténtica. |
| II-03 · Una oferta imposible | Aceptar una oferta de ensayo revela una trampa; rechazarla da confianza a un testigo. Cada ruta deja un recuerdo diferente. |
| II-04 · El libro de los ausentes | Yun y Tao relacionan un tejido con un libro de entregas. Elegir una pista cambia el orden real de dos escenas antes de reunir sus conclusiones. |
| II-05 · Mercader Sin Rostro | Observar distingue al original de los señuelos. La victoria recupera el Segundo Trazo y revela para qué se utilizaban los nombres incompletos. |

La oferta de II-03 muestra claramente que es **simulada**. Elegir una respuesta
no cambia propietarios, no retira unidades ni ejecuta un intercambio real.
Los intercambios auténticos siguen usando `.ctuintercambio` y sus dos
confirmaciones habituales.

Los capítulos posteriores y las misiones opcionales I-A y II-A permanecen en
el roadmap. El diario muestra sólo los personajes, lugares y Trazos conocidos;
antes de finalizar el bosque no revela el contenido del Segundo Trazo ni el
papel de personajes posteriores.

`.ctudiario historia` abre un resumen: últimas dos escenas y decisiones, nombres
de personajes y recuerdos, Trazos recuperados y lugares conocidos. El detalle
completo se consulta en secciones de cuatro entradas por página:
`.ctudiario historia cronica 2`, `personajes`, `trazos`, `decisiones`, `recuerdos`
o `atlas`. Cada listado ofrece comandos Anterior y Siguiente. También funciona
`.ctuhistoria diario cronica 2`; consultar el diario no reclama ni gasta recursos.

## Combates y controles

| Comando | Regla |
| --- | --- |
| `.ctuhistoria romper` | Sólo ante barreras del Guardián: rompe las raíces y ejecuta un ataque básico. Consume el turno. |
| `.ctuhistoria observar` | Sólo ante señuelos sin revelar del Mercader: identifica al original hasta el siguiente ciclo de ilusiones. Consume el turno. |
| `.ctuhistoria defender` | Amortigua un 70% del daño del turno; úsalo cuando la señal anuncie la descarga. |
| `.ctuhistoria habilidad` | Usa la segunda técnica y respeta su recarga. Un señuelo puede hacer desperdiciarla. |
| `.ctuhistoria inspeccionar` / `.ctuhistoria pista` | Consulta gratuita del estado y de la señal; no revela al Mercader como una acción táctica. |
| `.ctuhistoria reintentar` | Tras una derrota, inicia el encuentro con vida restaurada y el equipo actual. |

El mensaje ofrece las tácticas cuando corresponden, explica barreras y señuelos
y mantiene visibles vida, recargas y efectos relevantes. Los golpes cargados se
anuncian antes de actuar; después llega una apertura con defensa enemiga en cero.
Leer la señal importa más que repetir la técnica de mayor potencia.

Las derrotas permiten entrenar o preparar otro equipo sin perder monedas,
unidades ni XP. Los premios se entregan una vez por misión; perder, reintentar o
reiniciar la historia no constituye una fuente repetible de recursos.

## Reducción de premios y presupuesto actual

El contenido de versión 2 reduce el presupuesto de las siete misiones iniciales
un **25%**: de 300 a 225 ChengCoins, de 300 a 225 XP de Custodio y de 1.100 a
825 XP por compañero que recorra sus misiones elegibles. El ajuste distribuye
el redondeo entre misiones para conservar esos totales exactos. Los materiales
iniciales pasan de cinco fragmentos y dos esencias a cuatro fragmentos y una
esencia.

Los premios nuevos de I-04 a II-05 ya incluyen su ajuste. Los recibos de versión
1 conservan sus cantidades originales; no se retiran recursos ni se recalcula
la XP de un compañero que ya los recibió.

| Tramo | ChengCoins | XP de Custodio | XP por compañero elegible | Fragmentos | Esencias |
| --- | ---: | ---: | ---: | ---: | ---: |
| P-01 a I-03, versión 2 | 225 | 225 | 825 | 4 | 1 |
| I-04 | 45 | 30 | 90 | 1 | 0 |
| I-05 | 105 | 60 | 195 | 1 | 1 |
| II-01 | 20 | 20 | 40 | 0 | 0 |
| II-02 | 25 | 20 | 55 | 1 | 0 |
| II-03 | 20 | 20 | 50 | 0 | 0 |
| II-04 | 30 | 25 | 60 | 1 | 0 |
| II-05 | 90 | 55 | 180 | 1 | 1 |
| **Campaña disponible completa** | **560** | **455** | **1.495** | **9** | **3** |

Un compañero nuevo que recorra el tramo completo alcanza **nivel 5 después de
I-05**: acumula 1.110 XP. Al terminar II-05 suma 1.495, cerca de nivel 6. El
recorrido sigue acelerando la evolución sin convertir la campaña en una granja
repetible. Cambiar compañeros entre misiones reparte el recorrido entre ellos.

Una victoria válida con premio en PvP 1v1 entrega 35 XP a la unidad. El tramo
inicial anterior equivalía a unas **31,4 victorias premiadas**; el actual,
a **23,6**. Historia conserva así una vía rápida de entrenamiento con premios
únicos por jugador y misión. **La XP del combate online no cambia**, incluidos
sus límites de recompensas y el reparto entre participantes cuando hay equipos.

Crear un sello conserva el coste de cinco fragmentos, dos esencias y 100
ChengCoins. Evolucionar sigue costando un sello y 300 monedas, con +4% desde
nivel 5 y +5% automático desde nivel 10. Un diario permite adelantar la inversión;
la campaña completa aporta monedas y materiales suficientes para una evolución.

## Guardados anteriores y reparación de propiedad

El **esquema de datos sigue siendo 12**, con las mismas 39 colecciones. La
versión de contenido narrativo es independiente: las acciones antiguas se
reproducen con las misiones, premios y combates que les correspondían.

Una campaña terminada en I-03 muestra que puede continuar.
`.ctuhistoria continuar` registra la actualización a versión 2 y abre I-04, conservando
decisiones, recuerdos, XP, monedas y premios ya entregados. La misma regla de
premio único evita cobrar de nuevo las misiones iniciales después de reiniciar.

También se corrigió la validación de evoluciones que consultaban una emisión
antigua sin `ownershipVersion`: el historial central `ownershipAt` interpreta
esa emisión como versión 0 y comprueba al propietario correcto. La corrección
no requiere editar ni reescribir los JSON ni inventar un evento de transferencia.

Para actualizar el bot anfitrión, copia el módulo completo y reinicia su proceso.
Incluye `storage/evolutionValidation.js` y sus dependencias compartidas; cambiar
sólo un plugin puede dejar cargadas reglas antiguas por la caché de Node.js.

## Verificación y observación

El cierre local de 0.12 reúne **924 pruebas aprobadas**, **59 comandos** y
**237 ejemplos**. Incluye el fallo de propiedad inicial de `.ctuevolucion`,
reenvíos tras reiniciar, venta posterior, actualización v1→v2, recuperación
durante esa actualización y su premio siguiente, y las catorce misiones con
los tres iniciales comunes. El esquema local 12 conserva sus 40 archivos y
44 registros sin reescrituras ni datos de prueba.

La simulación reproducible usa 300 semillas por combinación, estadísticas base
y dos estrategias: repetir el ataque básico o aplicar la táctica del encuentro.
Son **7.200 encuentros** en total. La evolución no es requisito:

| Encuentro | Nivel | Panda táctico | Mago táctico | Lobo táctico |
| --- | ---: | ---: | ---: | ---: |
| Eco de Tinta, v2 | 3 | 99,7% | 89,0% | 93,7% |
| Acechador de Tinta | 4 | 100% | 100% | 100% |
| Guardián Marchito | 4 | 100% | 96,0% | 84,7% |
| Mercader Sin Rostro | 5 | 100% | 97,3% | 88,7% |

Repetir el ataque básico pierde contra el Eco y ambos jefes en esta muestra.
I-03 v2 reduce la descarga de 75 a 74 POT para acompañar la menor XP; la
versión 1 mantiene sus 75 POT y cuatro hashes de replay originales.

```sh
node --test --test-isolation=none tests/whatsapp-story.test.js
npm run balance:story:chapters
npm test -- --test-isolation=none
npm run preview:whatsapp
npm run story:metrics -- /ruta/absoluta/datos
```

La interfaz se prueba con campañas reales temporales: siete misiones antiguas y
catorce actuales, controles de jefes, oferta simulada, ambas pistas de Yun,
Trazos 1/5 y 2/5, consulta sin spoilers y premios únicos después de reiniciar.
Los ejemplos generados permiten revisar la extensión de cada mensaje y el
siguiente paso antes de cargarlo en WhatsApp.

`story:metrics` reúne conteos por misión y versión, victorias, derrotas,
reintentos y campañas pendientes sin actividad narrativa durante al menos 48
horas. Esa inactividad es una señal de seguimiento, no un abandono confirmado.
El informe no expone identidades y también mide los mensajes de la vista previa.
Su presupuesto de 4.096 caracteres sirve para comparar la facilidad de lectura;
no representa el límite de transporte de WhatsApp.

El diario de campaña completa pasó de 5.644 a **2.409 unidades UTF-16** en su
resumen. La crónica detallada conserva todas las escenas en páginas de cuatro
entradas, con navegación numérica y acceso a las decisiones anteriores.

El informe requiere un directorio existente en esquema 12, sin commits
pendientes; se ejecuta con el bot detenido para respetar el escritor único.
No inicializa ni migra la base. Las cifras de uso real requieren partidas del
bot anfitrión; las pruebas simuladas no se presentan como datos de jugadores
reales. Los capítulos posteriores y las misiones opcionales siguen en el roadmap.
