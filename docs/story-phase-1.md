# Historia 0.11 — fundamentos y fase 1

La campaña **Las Cartas Sin Nombre**, temporada **Los Nombres Perdidos**, abre
el prólogo y las primeras tres misiones del Bosque de los Susurros. Se basa en
[la biblia del modo historia](../Chengdu_Cards_Biblia_Modo_Historia.md), con
canon, catálogo narrativo y reglas de combate versionados por separado.

## Alcance de esta entrega

| Misión | Experiencia |
| --- | --- |
| P-01 · Una invitación bajo el bambú | Bao presenta el vínculo; la primera pregunta cambia el diálogo siguiente. |
| P-02 · El primer vínculo | Reutiliza el starter y las unidades que el jugador ya posee. |
| P-03 · Una sombra en la plaza | Tutorial de ataque, defensa y habilidad; Bao protege a los compañeros durante el aprendizaje. |
| P-04 · Las campanas del Archivo | Lian descubre la carta blanca; se obtiene el recuerdo inaugural. |
| I-01 · Sendero en silencio | Elegir entre marcas del bambú y huellas del arroyo cambia la pista que se recuerda después. |
| I-02 · Una criatura herida | Ayudar o perseguir deja un recuerdo distinto y modifica la apertura de I-03. |
| I-03 · Huellas en el bambú | Distinguir Ecos asustados del hostil; encuentro contra el minijefe Eco de Tinta. |

**I-04 e I-05 permanecen bloqueadas.** El Guardián Marchito, el Primer Trazo y
el final del Capítulo I pertenecen a la fase 2. Los capítulos posteriores,
los otros cuatro Trazos, el jefe final y el epílogo conservan su lugar en la
biblia. El diario muestra sólo personajes, decisiones y lugares ya conocidos.

El canon conserva una Chengdú fantástica, los Vínculos de Custodia y el Gran
Archivo del Bambú. Los Ecos son identidades dañadas: algunos atacan y otros
necesitan espacio. Una carta representa un vínculo; cada unidad conserva su
identidad cuando evoluciona o cambia de Custodio. Los recuerdos de campaña
pertenecen al jugador y no se venden como unidades.

En I-03, distinguir al Eco hostil o proteger a los asustados deja el recuerdo
**La confianza de Lian**. Atacar sin distinguirlos pierde ese recuerdo en el
recorrido actual y deja su nota crítica, sin reducir la XP de entrenamiento.

La continuidad del prototipo queda fijada así:

| Decisión persistente | Consecuencia ya visible |
| --- | --- |
| `first_question` | Bao adapta la apertura de P-02 a la pregunta de P-01. |
| `forest_clue` | La entrada de I-02 recuerda la pista elegida en I-01. |
| `forest_choice` | Cambia el recuerdo y la advertencia inicial de I-03. |
| `echo_approach` | Conserva la nota de Lian y decide su recuerdo de confianza. |

El contenido y el combate nacen con versiones independientes `1`. Las
próximas fases deberán conservar estas reglas para reproducir los recibos y
encuentros anteriores; los cambios de política requieren una versión nueva,
igual que las evoluciones. Ampliar el catálogo exige definir la transición del
estado «fase 1 completa» antes de abrir I-04, sin recalcular premios pasados.

## Jugar desde WhatsApp

Empieza con `.ctuhistoria`. Cada respuesta reúne escena o resultado, estado,
objetivo y comandos copiables. Funciona en privado y en grupos; la campaña
pertenece al remitente autenticado y se puede retomar desde otra conversación.

| Comando | Uso |
| --- | --- |
| `.ctuhistoria iniciar` | Empezar el prólogo. |
| `.ctuhistoria` / `.ctumision` | Consultar el estado guardado sin avanzar. |
| `.ctuhistoria continuar` / `.ctucontinuar` | Avanzar una escena o comenzar el encuentro indicado. |
| `.ctuhistoria elegir 1` | Confirmar una de las opciones numeradas de la escena. |
| `.ctuhistoria atacar 1` | Ataque normal; también se admite `atacar 2`. |
| `.ctuhistoria defender` | Cubrirse durante el turno enemigo. |
| `.ctuhistoria habilidad` | Usar la segunda técnica; comparte su recarga con `atacar 2`. |
| `.ctuhistoria cambiar 2` | Entrar con una reserva viva; consume el turno. |
| `.ctuhistoria inspeccionar` / `.ctuhistoria pista` | Revisar la señal y las indicaciones sin gastar turno. |
| `.ctuhistoria rendirse` | Salir del intento y liberar las unidades. |
| `.ctuhistoria reintentar` | Preparar un encuentro nuevo después de una derrota. |
| `.ctuequipo` | Consultar y preparar de uno a tres compañeros entre encuentros. |
| `.ctudiario historia` | Abrir resumen, crónica, personajes, pistas, decisiones, recuerdos y atlas. |
| `.ctucapitulos` | Consultar avance y contenido bloqueado. |
| `.cturecuerdos` | Consultar recuerdos narrativos obtenidos. |
| `.ctuhistoria ayuda` | Ver los controles en una sola respuesta. |

`.ctudiario` conserva el reclamo de **100 ChengCoins cada 24 horas**. La
consulta `.ctudiario historia` sólo lee la campaña: no reclama dinero ni
necesita un identificador de mensaje para operar.

Las escenas, decisiones y turnos se guardan al confirmar cada acción. El
encuentro conserva su turno al salir; mientras siga activo, las unidades
permanecen reservadas. No pueden venderse, intercambiarse, evolucionarse ni
retirarse del equipo. Las fichas consultan sus estadísticas, vida, ataques y
recargas congelados para ese encuentro, incluso si cambia después el catálogo.

## Dificultad y aprendizaje

P-03 exige practicar ataque, defensa y habilidad. Bao interviene si el jugador
necesita seguir practicando; rendirse sigue siendo una salida voluntaria.

El **Eco de Tinta de I-03** introduce una mecánica de minijefe: zarpazo, carga,
descarga y apertura. La interfaz anuncia qué preparará antes de pedir la acción
del jugador. Defender amortigua un **70%** del golpe de ese turno. Tras la
descarga, el enemigo ofrece una apertura con defensa reducida a cero. Los
ataques, precisión, elementos, efectos, pasivas y recargas usan el motor avanzado.

Ignorar la descarga puede derrotar a un equipo inicial. La pantalla de derrota
explica la señal, ofrece pista, permite preparar otros compañeros y reintentar.
Las derrotas no quitan monedas, unidades ni XP. Los reintentos empiezan con vida
restaurada y capturan el equipo actual; no conceden premios por perder.
Los tres starters comunes permiten avanzar; la evolución y las rarezas altas
no son requisitos de entrada.

El simulador compara **18.000 encuentros**: tres starters, niveles 1, 4 y 5,
nivel 5 evolucionado y dos estrategias, con 750 muestras por combinación.
En nivel 4, la estrategia que lee la descarga y aprovecha la apertura gana
99,9% con Panda, 89,6% con Mago y 93,6% con Lobo. Atacar continuamente pierde
en las tres configuraciones. El informe separa resultados por arquetipo;
no pretende garantizar el resultado de cada intento individual.

## XP, materiales y presupuesto

Los premios completos se entregan **una sola vez por jugador y misión**, aunque
se repita el mensaje, se reintente el combate o se reinicie la campaña de prueba.

| Misión | ChengCoins | XP de Custodio | XP por compañero elegible | Fragmentos | Esencias |
| --- | ---: | ---: | ---: | ---: | ---: |
| P-01 | 20 | 20 | 0 | 0 | 0 |
| P-02 | 0 | 20 | 100 | 0 | 0 |
| P-03 | 45 | 50 | 220 | 1 | 0 |
| P-04 | 35 | 30 | 80 | 1 | 0 |
| I-01 | 40 | 35 | 100 | 1 | 0 |
| I-02 | 60 | 45 | 150 | 1 | 1 |
| I-03 | 100 | 100 | 450 | 1 | 1 |
| **Total** | **300** | **300** | **1.100** | **5** | **2** |

La XP pertenece a unidades reales del equipo: cambiar compañeros entre misiones
reparte el recorrido entre ellos. Mantener un compañero desde P-02 hasta I-03
le permite superar las **1.000 XP necesarias para nivel 5** y consultar su
evolución. Los cinco fragmentos y dos esencias cubren los materiales de un sello;
crear el sello cuesta 100 monedas y evolucionar cuesta otras 300. Las 300 de
Historia más un diario cubren esa inversión, con los requisitos habituales de
propiedad y disponibilidad. Se conserva el bono moderado de +4% desde nivel 5
y +5% desde nivel 10.

Los materiales se consultan y recogen mediante `.ctucrafting`. Esta fase no
emite cartas nuevas por completar escenas y respeta los límites globales por
rareza. La campaña no da Elo ni resultados de PvP.

## Reinicio de pruebas

`.ctureiniciarhistoria` explica el alcance y pide
`.ctureiniciarhistoria confirmar`. Este comando se omite de `.ctuayuda` y de
la ayuda de Historia. Cada jugador puede reiniciar únicamente su propia campaña.

El reinicio cierra el encuentro activo, libera sus reservas, vuelve a P-01 e
incrementa la partida narrativa. Conserva unidades, propietarios, seriales,
monedas, XP, evoluciones y recibos de premios. Las decisiones y el recorrido se
vuelven a elegir; completar misiones ya premiadas muestra el premio anterior
sin volver a acreditarlo. No modifica campañas de otros jugadores.

## Datos y verificación

La versión **0.11.0** utiliza el **esquema 12**, con cuatro colecciones nuevas:
`historias`, `accioneshistoria`, `combateshistoria` y `premioshistoria`. La
migración conserva las 35 colecciones anteriores y añade estas cuatro vacías,
con respaldo y publicación recuperable. La persistencia usa el escritor único
existente y los mismos recibos auditables de monedas, XP y recursos.

Los snapshots de combate congelan identidad, nivel, forma evolucionada,
propiedad, estadísticas, perfil y ataques. Las acciones se pueden reproducir
para validar decisiones, daño, estados, resultado y progreso. Los premios
conservan su misión, beneficiario y unidades; los reenvíos reutilizan el recibo.

```sh
node --test --test-isolation=none tests/whatsapp-story.test.js
npm run balance:story
npm test -- --test-isolation=none
npm run preview:whatsapp
```

Las pruebas de interfaz cubren una respuesta por acción, identidad autenticada,
controles tácticos, consulta gratuita, diario existente, comandos ocultos,
derrota/reintento, finalización y ausencia de pagos duplicados tras reiniciar.
La validación con la sesión real de WhatsApp corresponde al bot anfitrión.

Cierre local del 17 de octubre de 2026: **871 pruebas aprobadas**, **59
comandos**, **213 ejemplos** y **18.000 simulaciones del minijefe**. La base
local pasó de esquema 11 a 12 conservando exactamente los 44 registros de sus
35 colecciones previas. Las cuatro de Historia están vacías; no se dejaron
cuentas de prueba, journal ni lock. El respaldo comprobado se encuentra en
`ChengdúData/backups/3d02d40a-aa49-490a-8015-3b4f55e5a627/`.
