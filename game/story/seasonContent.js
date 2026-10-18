// Season-one continuation. Scenes are independent reading pages; choices and
// battles advance only the current step. These are fictional places and customs.
const reward = (coins, userXp, unitXp, fragmentos = 0, esencias = 0, memory = null) => ({
  coins, userXp, unitXp, materials: { fragmentos, esencias, sellos: 0 }, memory
});
const step = (id, scene, extra = {}) => ({ id, scene, ...extra });
const choice = (id, label, key, value, consequence) => ({ id, label, key, value, consequence });
const variant = (when, scene) => ({ when, scene });

export const SEASON_CHAPTERS = [
  { id: 'montanas', title: 'Las Montañas del Espejo', location: 'Cumbres del Espejo', plannedMissions: 5,
    missionCodes: ['III-01', 'III-02', 'III-03', 'III-04', 'III-05'] },
  { id: 'casas', title: 'Las Casas Divididas', location: 'Distrito de las Casas', plannedMissions: 5,
    missionCodes: ['IV-01', 'IV-02', 'IV-03', 'IV-04', 'IV-05'] },
  { id: 'archivo', title: 'El Último Nombre', location: 'Archivo Original', plannedMissions: 6,
    missionCodes: ['V-01', 'V-02', 'V-03', 'V-04', 'V-05', 'V-06'] },
  { id: 'epilogo', title: 'El Archivo Abierto', location: 'Plaza del Archivo', plannedMissions: 2,
    missionCodes: ['E-01', 'E-02'] }
];

export const SEASON_MEMORIES = [
  { id: 'reflejo_de_custodia', title: 'El reflejo que escucha', description: 'El Centinela reconoció una fuerza capaz de cambiar de respuesta y Bao dejó de esconder su firma.' },
  { id: 'tregua_de_las_casas', title: 'Dos estandartes, un refugio', description: 'Las Casas protegieron a sus vecinos antes de discutir quién debía gobernar el Archivo.' },
  { id: 'ultima_inscripcion', title: 'La última inscripción', description: 'Detuviste el Sello sin borrar los nombres que intentaba encadenar.' },
  { id: 'vinculos_libres', title: 'Un vínculo puede continuar', description: 'El Archivo fue restaurado y la comunidad asumió nuevas responsabilidades para proteger la libertad de elegir.' },
  { id: 'primeras_paginas', title: 'Las primeras páginas', description: 'La crónica conserva a quienes ayudaste y las decisiones que dieron forma a tu viaje.' },
  { id: 'archivo_abierto', title: 'El Archivo Abierto', description: 'Recibiste el reconocimiento de Custodio del Alba; una criatura sin registro anunció una historia todavía desconocida.' },
  { id: 'cancion_del_bosque', title: 'Los sonidos perdidos', description: 'Recuperaste tres fragmentos de una canción sin confundir escuchar con poseer su voz.' },
  { id: 'entrega_de_tao', title: 'Una entrega con nombre', description: 'Tao completó la ruta de un registro perdido y su destinataria pudo decidir cómo conservarlo.' },
  { id: 'paso_compartido', title: 'El paso de Huan', description: 'Ayudaste a Huan a encontrar a una criatura que necesitaba espacio para volver por voluntad propia.' },
  { id: 'casa_sin_ensena', title: 'Una puerta sin enseña', description: 'Custodios sin clan abrieron un refugio que no pidió afiliación para recibir ayuda.' },
  { id: 'prueba_raices', title: 'Lectura de raíces', description: 'Volviste a superar una prueba del Archivo sin convertirla en una fuente repetible de dinero o experiencia.' },
  { id: 'prueba_reflejos', title: 'Respuestas distintas', description: 'El Archivo conserva tu práctica de una estrategia que sabe cambiar.' },
  { id: 'prueba_eleccion', title: 'Custodia en práctica', description: 'Revisitaste el desafío de proteger sin inmovilizar a tus compañeros.' }
];

export const SEASON_MISSIONS = [
  {
    id: 'desafio_huan', code: 'III-01', chapterId: 'montanas', title: 'El desafío de Huan', location: 'Puente de los Espejos', kind: 'sequence',
    steps: [
      step('puente', [
        'El camino deja atrás los puestos del mercado y asciende entre piedras húmedas. En un puente estrecho, Huan ordena tablillas de entrenamiento junto a una criatura que conoce cada una de sus señales. Ha oído hablar de los dos Trazos, pero quiere comprobar cómo diriges un combate sin las indicaciones de Bao.',
        'Huan no cuestiona que los nombres deban recuperarse. Le preocupa que una buena intención se convierta en una promesa que nadie sabe cumplir. Propone un duelo de práctica, con retirada segura y sin clasificación. Bao acepta observar desde el borde del puente: el resultado enseñará algo a ambos Custodios.'
      ]),
      step('duelo', [
        'Huan deja sus insignias sobre una roca para que quede claro el carácter amistoso de la prueba. Su compañero reconoce la señal y toma posición. Nadie arriesga su carta, su propietario ni su puesto en el competitivo; aquí se examina una manera de responder, no el derecho a continuar el viaje.',
        'Bao recuerda que defender también es una decisión y que una habilidad usada por impaciencia puede faltar cuando más se necesita. Huan promete detenerse si el equipo no puede seguir. Ganar o caer conduce al mismo sendero, aunque la conversación posterior conservará lo que ocurrió en este encuentro.'
      ], { encounterId: 'III01', acceptDefeat: true, resultKey: 'huan_duel_result' }),
      step('resultado', [
        'Cuando termina el duelo, Huan recupera sus insignias sin pedir una revancha inmediata. Su criatura bebe junto al puente mientras Bao revisa que ambos equipos estén a salvo. El rival ha visto decisiones concretas: momentos de presión, oportunidades desaprovechadas y respuestas que no caben en una sola cifra de fuerza.',
        'Huan admite que el bosque y el mercado exigieron algo distinto de sus ejercicios. Aún cree que un Custodio debe poder sostener sus promesas cuando el combate se complica. Puedes responder a esa preocupación reconociendo su esfuerzo o exigiendo que también aprenda a escuchar a quienes no luchan como él.'
      ], { variants: [
        variant({ huan_duel_result: 'won' }, ['Huan observa la marca que dejó el último ataque y asiente: «Me ganaste. Eso no significa que ya sepamos cuidar mejor que nadie, pero sería deshonesto decir que sólo llegaste por los consejos de Bao». Su compañero golpea suavemente el suelo; el rival recoge la tablilla donde había anotado tu estrategia.']),
        variant({ huan_duel_result: 'lost' }, ['Huan detiene a su compañero antes de perseguir al tuyo y deja una tablilla junto al puente: «Hoy gané yo. Si utilizo eso para decidir lo que vales, no habré aprendido nada del viaje». Bao señala una oportunidad de defensa que podrás practicar después. La derrota no retira tus premios ni cierra el sendero.'])
      ], choices: [
        choice('1', 'Reconocer su esfuerzo y aprender juntos', 'rival_response', 'forgive', 'Huan guarda la tablilla de la victoria o de la derrota con la misma atención. Acepta compartir sus observaciones durante el ascenso.'),
        choice('2', 'Pedirle que escuche antes de juzgar', 'rival_response', 'firm', 'Huan acepta la crítica, aunque la conversación conserva cierta tensión. Promete demostrar con hechos que sabe revisar sus certezas.')
      ] }),
      step('tablilla', [
        'Lian encuentra una inscripción en el reverso de una tablilla usada como apoyo del puente. No contiene una técnica secreta: registra una antigua expedición en la que varios Custodios cambiaron de función cuando el camino dejó de parecerse a su entrenamiento. Huan reconoce el nombre de su primera maestra.',
        'La nota no convierte el combate en un error ni la prudencia en una solución universal. Habla de observar antes de repetir una respuesta. Bao pide conservar una copia y deja el original en su lugar. Las cartas pueden acumular nuevas experiencias sin que cada descubrimiento tenga que arrancarse de donde pertenece.'
      ]),
      step('partida', [
        'El grupo cruza de uno en uno mientras Huan sujeta la cuerda del puente para quien viene detrás. No hace falta resolver todas las diferencias para realizar esa tarea juntos. Al otro lado se distinguen dos rutas hacia las Cumbres del Espejo, una abierta al viento y otra protegida entre paredes de piedra.',
        'Bao da por terminada la práctica y recuerda que una derrota amistosa no define un destino. Las criaturas recuperan el paso y Lian añade una página sobre Huan a la crónica. La siguiente prueba no tendrá un público que cuente victorias: consistirá en decidir cómo llegar sin dejar a nadie atrás.'
      ])
    ], reward: reward(30, 40, 150)
  },
  {
    id: 'ascenso_espejo', code: 'III-02', chapterId: 'montanas', title: 'El ascenso', location: 'Sendero de las Agujas', kind: 'sequence',
    steps: [
      step('dos_rutas', [
        'La ruta alta permite ver el pabellón de la cumbre, pero el viento empuja grava sobre el sendero. La ruta baja rodea la ladera y conserva marcas de antiguas caravanas. Tao, que ha subido con una entrega, comprueba por su cuenta los dos accesos antes de recomendar que el grupo examine sus condiciones.',
        'No hay un camino reservado para criaturas raras ni una prueba que exija una afinidad concreta. Ambos trayectos permiten continuar; cambia la información que encontrarás y la manera de organizar la marcha. Lian propone registrar la elección para que el regreso también pueda aprovechar lo aprendido durante el ascenso.'
      ], { choices: [
        choice('1', 'Tomar la cornisa y revisar sus apoyos', 'mountain_route', 'ridge', 'Huan prueba cada apoyo antes de pasar. La ruta abierta permite distinguir unas señales grabadas cerca de la cumbre.'),
        choice('2', 'Rodear la ladera con la caravana', 'mountain_route', 'shelter', 'Tao comparte la ruta de los refugios. Bajo un alero se conserva un testimonio que los mapas no habían registrado.')
      ] }),
      step('parada', [
        'A mitad de camino aparece una estación abandonada. Hay espacio para que las criaturas descansen sin ocupar la senda y una caja de herramientas cuya lista de contenidos sigue legible. Bao comprueba la cuerda del pasamanos mientras Tao reorganiza la carga: ayudar no consiste en esperar que todo lo resuelva el compañero más fuerte.',
        'Lian encuentra dos versiones de un mismo mapa. Una señala el trayecto más corto; la otra añade refugios, agua y lugares donde una criatura puede apartarse del ruido. Ninguna sustituye a la otra. La investigadora conserva las diferencias y empieza a preguntar quién había decidido qué información merecía quedar escrita.'
      ]),
      step('hallazgo', [
        'Las señales de la subida no conducen a un tesoro escondido. Describen cómo sostener una marcha cuando un integrante necesita cambiar el ritmo. Huan compara esas indicaciones con sus tablillas de entrenamiento y descubre que algunos espacios para anotar descansos habían sido eliminados en las copias más recientes.',
        'Bao reconoce el sello del Archivo en las dos versiones y evita ofrecer una explicación inmediata. Lian no borra el detalle incómodo para protegerlo. Copia fecha, lugar y cambios visibles, dejando claro qué puede comprobar y qué sigue siendo una pregunta. La investigación empieza a alcanzar también a quienes acompañan al grupo.'
      ], { variants: [
        variant({ mountain_route: 'ridge' }, ['Desde la cornisa, Huan había distinguido las señales que el pabellón oculta a quienes llegan por abajo. Ahora muestra que varias advertían del viento y de los descansos. «Las vimos porque miramos la ruta», dice, «no porque lleváramos una criatura capaz de ignorar todas sus dificultades».']),
        variant({ mountain_route: 'shelter' }, ['El testimonio del alero cuenta cómo una caravana dejó de llamar retraso a cada parada. Tao reconoce una anotación de su familia y solicita copiarla para la casa de té. Lian añade ese relato al mapa, con su procedencia, sin convertirlo en una verdad que deba reemplazar todas las demás.'])
      ] }),
      step('compania', [
        'El sendero se estrecha antes del pabellón. Huan se queda junto a la carga en vez de adelantarse a demostrar que puede llegar primero. Tao explica que el paquete contiene hojas en blanco para restaurar registros, un trabajo menos vistoso que recuperar un Trazo y necesario para que los nombres puedan seguir leyéndose.',
        'Bao agradece la entrega sin convertirla en otra deuda del mensajero. Cada integrante encuentra una tarea concreta y las criaturas recuperan aire antes del último tramo. El ascenso termina con un equipo más preparado, no con una exigencia de comprar poder para saltarse el camino que acaban de recorrer.'
      ]),
      step('umbral', [
        'El pabellón de las Cumbres del Espejo no imita un santuario real: sus muros pertenecen a los antiguos escribas de este mundo fantástico. Tres superficies de piedra reflejan el movimiento del grupo con un pequeño retraso. Entre ellas se distingue una puerta y una frase incompleta sobre maneras distintas de proteger un vínculo.',
        'Lian guarda los mapas antes de entrar y Huan deja sitio para que cada criatura observe los reflejos. Bao anuncia una prueba de daño, defensa y apoyo. No espera tres clases obligatorias ni tres cartas perfectas; quiere comprobar si una misma compañía puede encontrar más de una respuesta cuando cambia la situación.'
      ])
    ], reward: reward(15, 25, 70)
  },
  {
    id: 'tres_reflejos', code: 'III-03', chapterId: 'montanas', title: 'Los tres reflejos', location: 'Pabellón del Espejo', kind: 'sequence',
    steps: [
      step('salas', [
        'La primera superficie devuelve una imagen de tu compañero avanzando; la segunda lo muestra resistiendo una descarga y la tercera conserva la silueta de alguien que cubre una retirada. Las tres pertenecen a la misma criatura. Huan comprende que el pabellón no está ordenando a los visitantes por rareza o por prestigio.',
        'Bao explica que daño, defensa y apoyo describen tareas durante una situación concreta. Una criatura común puede resolver varias de ellas y un equipo pequeño sigue siendo una compañía completa. La prueba respetará las estadísticas reales del grupo y anunciará sus señales para que ninguna respuesta dependa de adivinar una regla oculta.'
      ]),
      step('prioridad', [
        'Lian pide escoger qué observar primero. No hay una respuesta que cambie la potencia de las cartas a escondidas: la elección determina qué aspecto quedará destacado en la crónica. Huan revisa las marcas del suelo y prepara una retirada segura, convencido de que organizarla no resta valor al entrenamiento.',
        'Tras el cristal, una figura espera sin nombre ni pretensión de ser una criatura emitida. Es una construcción de práctica del Archivo y no puede reclamarse como unidad. Sus movimientos permitirán ensayar una ofensiva normal, cubrirse ante un aviso y aprovechar una habilidad cuando exista una oportunidad comprensible.'
      ], { choices: [
        choice('1', 'Observar cuándo conviene atacar', 'reflection_focus', 'damage', 'Lian reserva una columna para las aperturas: un ataque útil llega cuando existe una oportunidad, no sólo cuando está disponible.'),
        choice('2', 'Observar cómo sostener al equipo', 'reflection_focus', 'defense', 'Huan marca los avisos de peligro. La crónica reconocerá las decisiones que permitieron seguir luchando después de un golpe difícil.'),
        choice('3', 'Observar el apoyo y las habilidades', 'reflection_focus', 'support', 'Bao pide mirar las recargas y los efectos visibles. Apoyar también consiste en guardar una herramienta para el momento adecuado.')
      ] }),
      step('prueba', [
        'Los reflejos se reúnen en una figura que alterna gestos de amenaza y recuperación. Antes de moverse deja una señal sobre la superficie de piedra. Bao permanece fuera del círculo; si el equipo cae, la prueba podrá repetirse sin quitar monedas o criaturas, pero el pabellón no concederá una victoria por insistir sin cambiar de estrategia.',
        'Huan recuerda lo visto en el puente y ofrece una indicación breve: «No confundas una habilidad lista con una obligación de gastarla». La puerta sigue cerrada hasta resolver la práctica, aunque no exige evolucionar ni traer una especie determinada. Las decisiones del turno bastan para demostrar lo que el equipo ha aprendido.'
      ], { encounterId: 'III03' }),
      step('lectura', [
        'La figura se deshace en tres líneas y deja visible el registro de las respuestas utilizadas. Bao no señala únicamente el golpe final: muestra el turno que evitó una caída y la habilidad que encontró una apertura. Lian compara esos momentos con la prioridad que elegiste antes de entrar al círculo.',
        'Huan descubre una diferencia entre repetir una técnica correcta y comprender por qué fue útil. La criatura que lo acompaña apoya la cabeza en una de las superficies y su reflejo hace lo mismo un instante después. El rival anota por primera vez una pregunta en el espacio donde antes escribía sólo resultados.'
      ]),
      step('inscripcion', [
        'Detrás de la puerta aparece una inscripción conservada bajo varias reparaciones. Lian reconoce dos firmas junto a la frase sobre la Custodia: una pertenece a Bao y la otra fue raspada con tanto cuidado que el daño parece una decisión. El mentor deja de ordenar los papeles y acepta que el grupo se detenga a leer.',
        'La prueba táctica termina aquí; la siguiente conversación no podrá resolverse ganando otro combate. Huan recoge las tablillas y se queda a escuchar. Bao sabe que cualquier explicación tendrá que incluir lo que hizo, lo que dejó de hacer y la razón por la que el Archivo prefirió conservar una versión más sencilla de su pasado.'
      ])
    ], reward: reward(25, 35, 160, 1)
  },
  {
    id: 'recuerdo_bao', code: 'III-04', chapterId: 'montanas', title: 'El recuerdo de Bao', location: 'Sala de las Dos Firmas', kind: 'sequence',
    steps: [
      step('firma', [
        'Bao coloca su sello junto a la inscripción. Las marcas encajan sin necesidad de que Lian acomode la piedra para favorecer una respuesta. Hace años, él y otro protector propusieron reformas para evitar disputas de Custodia. Algunas ayudaron a conservar registros; otras dejaron sin voz a criaturas que no podían demostrar lo ocurrido.',
        'El compañero de Bao insistió en revisar esas omisiones después de una serie de pérdidas. El Archivo escuchó los casos como excepciones y aplazó los cambios. Bao reconoce que firmó parte de aquellos aplazamientos. Su silencio no causó por sí solo toda la crisis, pero contribuyó a que un problema conocido siguiera creciendo.'
      ]),
      step('pregunta', [
        'Lian pregunta por la firma borrada y Bao confirma que perteneció a quien ahora llaman el Archivista. No presenta al antiguo compañero como alguien que siempre estuvo destinado a hacer daño. Recuerda propuestas valiosas y una ruptura posterior: proteger a todas las criaturas empezó a significar impedirles cambiar de vínculo.',
        'Huan evita interrumpir para decidir de inmediato quién merece confianza. La escena conserva espacio para tu respuesta. Puedes aceptar que Bao siga acompañando al grupo mientras rinde cuentas o exigir que cada revelación futura se apoye en documentos y testimonios compartidos, sin expulsarlo de una trama que todavía necesita su ayuda.'
      ], { choices: [
        choice('1', 'Confiar en él y exigir que siga contando', 'bao_trust', 'trust', 'Bao acepta continuar como compañero, no como dueño de las respuestas. Promete mostrar los documentos que todavía conserva.'),
        choice('2', 'Pedir pruebas y transparencia desde ahora', 'bao_trust', 'question', 'Lian guardará copia de las pruebas y Bao acepta que sus recuerdos también puedan contrastarse. La colaboración continúa con límites más claros.')
      ] }),
      step('documento', [
        'Bao abre una carpeta que había llevado cerrada desde la plaza. Contiene peticiones de traslado, informes sobre pérdidas y cartas de criaturas que deseaban regresar o marcharse. Lian distingue las fuentes antes de resumirlas; un caso verdadero de abuso no autoriza a convertir cualquier transferencia futura en una amenaza inevitable.',
        'La investigadora corrige una nota de su propio cuaderno. También ella había tratado una inscripción incompleta como si el silencio de una criatura borrada demostrara falta de voluntad. Reconocer el error no vuelve inútiles los registros: exige complementarlos con testimonios, dudas visibles y un modo de revisar decisiones injustas.'
      ]),
      step('responsabilidad', [
        'Huan pregunta si un buen propósito puede justificar el Sello Inmutable. Bao responde que comprender el miedo de su antiguo compañero no equivale a darle permiso para imponerlo a todos. Las criaturas necesitarán protección frente a abusos y también una salida cuando el vínculo deje de ser justo. Ninguna de esas necesidades desaparece por nombrar la otra.',
        'Lian deja abiertas dos páginas: una registra lo que el Archivo debe reparar; la otra, lo que es necesario impedir ahora. El grupo no tendrá que elegir entre fingir que nunca hubo daño y aceptar que nadie pueda volver a cambiar. La diferencia tendrá que sostenerse cuando el enemigo ofrezca una respuesta aparentemente más fácil.'
      ]),
      step('hacia_centinela', [
        'En la puerta del pabellón se oye el sonido de una herramienta copiando otra. El Centinela del Espejo guarda un fragmento de la Primera Carta y reproduce las técnicas más vistosas de quienes lo enfrentan. Bao reconoce su diseño, pero no promete una palabra secreta que lo desactive ni una carta rara capaz de evitar la prueba.',
        'Huan relee la pregunta que escribió tras los tres reflejos y propone observar qué se repite. Lian conserva la carpeta con permiso de Bao. El grupo sale de la sala con información incómoda y una tarea concreta: demostrar que aprender incluye dejar de hacer lo mismo cuando la propia respuesta empieza a volverse un obstáculo.'
      ])
    ], reward: reward(15, 25, 60)
  },
  {
    id: 'centinela_espejo', code: 'III-05', chapterId: 'montanas', title: 'Centinela del Espejo', location: 'Terraza de los Reflejos', kind: 'sequence', traceId: 'tercer_trazo',
    steps: [
      step('terraza', [
        'La terraza refleja el cielo en placas oscuras que no contienen agua. En su centro, el Centinela sostiene un Trazo entre dos brazos de piedra. A su alrededor aparecen ecos de habilidades usadas por antiguos visitantes: ninguna imagen conserva una identidad completa ni pretende reemplazar a una criatura real de tu colección.',
        'Bao explica su función original: impedir que un Custodio confundiera una respuesta poderosa con una solución para cualquier situación. El daño de la tinta lo ha vuelto rígido, pero sus señales todavía pueden leerse. Cuando empiece a copiar, convendrá variar el ritmo y reservar la defensa para aquello que anuncie con claridad.'
      ]),
      step('antes_prueba', [
        'Lian revisa la copia de las tres superficies y pregunta qué llevará el grupo de esa lección. No exige una composición de daño, tanque y apoyo ni convierte la evolución en una llave. El equipo disponible puede aprender el patrón; entrenarlo ayuda a resistir errores, pero la pelea tendrá que premiar decisiones además de niveles.',
        'Huan se ofrece a guardar las notas durante el encuentro. Si ayudaste a su orgullo en el puente, lo hace sin convertir el gesto en una deuda. Si la conversación fue más firme, recuerda el compromiso de escuchar antes de juzgar. Ambas rutas mantienen la ayuda necesaria para que el desafío sea difícil y comprensible.'
      ], { choices: [
        choice('1', 'Recordar que una respuesta puede cambiar', 'sentinel_lesson', 'adapt', 'Lian subraya las repeticiones. El equipo entra preparado para leer qué técnica quiere devolverle el Centinela.'),
        choice('2', 'Recordar que resistir también protege', 'sentinel_lesson', 'protect', 'Huan mantiene visible el aviso de defensa. Una apertura vale poco si el equipo cae antes de poder aprovecharla.')
      ] }),
      step('combate', [
        'El Centinela imita un gesto de tu compañero y deja la copia suspendida antes de descargarla. Su movimiento anuncia lo que prepara; no es una orden de atacar siempre con la técnica más fuerte. Bao permanece al borde de la terraza y recuerda que retirarse a entrenar o reintentar después de perder no borrará el avance del viaje.',
        'El tercer Trazo sigue bajo custodia de la construcción. Para recuperarlo habrá que superar una prueba real: alternar herramientas, reconocer la copia y defender cuando corresponda. Huan guarda silencio durante el turno para que la señal del enemigo y las opciones disponibles ocupen el lugar central del mensaje.'
      ], { encounterId: 'III05' }),
      step('tercer_trazo', [
        'La última copia se detiene sin encontrar un movimiento que repetir. Las placas vuelven a reflejar el cielo y el Centinela baja los brazos. Lian recibe el Tercer Trazo con ambas manos, registra de dónde procede y lee una frase que completa parte de la Primera Carta: «Un vínculo sin elección no es un vínculo».',
        'Bao reconoce que esa frase estuvo disponible para su orden durante generaciones. El problema nunca fue únicamente perder un documento; también consistió en decidir qué significaba cuando resultaba incómodo. Huan guarda una copia en su tablilla y admite que entrenar puede incluir escuchar algo que no cabe en el orgullo de una victoria.'
      ]),
      step('descenso', [
        'El descanso junto al pabellón devuelve a la conversación asuntos pequeños: Tao revisa el paquete vacío, las criaturas se apartan del ruido y Lian ordena las páginas para que ninguna noticia borre lo ocurrido antes. Bao agradece que el grupo continúe exigiéndole claridad. La victoria no resuelve todavía la responsabilidad del Archivo.',
        'En el camino de regreso aparecen mensajeros con estandartes distintos. Dos Casas del Bambú se acusan de robar registros durante la crisis y han cerrado una plaza a quienes no muestran sus colores. El siguiente Trazo no espera en otra montaña: está en una ciudad que empieza a confundir pertenecer con tener derecho a recibir ayuda.'
      ])
    ], reward: reward(60, 60, 220, 2, 1, 'reflejo_de_custodia')
  },
  {
    id: 'dos_estandartes', code: 'IV-01', chapterId: 'casas', title: 'Dos estandartes', location: 'Plaza de las Casas', kind: 'sequence',
    steps: [
      step('barrera', [
        'Dos estandartes dividen la plaza y dejan un pasillo demasiado estrecho para los carros de provisiones. El comandante Ren intenta mantener abiertos los accesos mientras representantes de ambas Casas enumeran páginas desaparecidas. Ninguna consigue explicar por qué algunos registros que conservan sus sellos también han perdido los nombres.',
        'Mei ha colocado agua junto a la entrada sin preguntar por afiliación. Tao lleva recados entre lados que se niegan a conversar directamente. Ren solicita escuchar las dos versiones antes de señalar culpables; puedes decidir por dónde empezar, pero ninguna Casa obtendrá por ello el derecho exclusivo a ser considerada parte de la ciudad.'
      ], { choices: [
        choice('1', 'Escuchar primero a la Casa del Patio', 'house_order', 'courtyard', 'La Casa del Patio presenta sus entregas pendientes. Ren asegura que después habrá el mismo espacio para la otra versión.'),
        choice('2', 'Escuchar primero a la Casa del Sendero', 'house_order', 'path', 'La Casa del Sendero muestra sus listas incompletas. Lian reserva otra página para escuchar a sus vecinos sin tratarlos como acusados por defecto.')
      ] }),
      step('primera_version', [
        'La primera representante cuenta que varias criaturas dejaron de responder a los nombres de sus antiguos registros. Sus Custodios temen que una Casa rival esté reuniendo vínculos para ganar influencia. Lian solicita fechas y testimonios: comprende el miedo, pero distingue una pérdida comprobada de la explicación que alguien ha construido alrededor.',
        'Huan pregunta quién protegió las entregas durante el cierre de la plaza y descubre que ambas Casas recurrieron a los mismos mensajeros. Tao enseña sus recibos sin convertir la consulta en una obligación de exhibir datos privados de jugadores reales. Esta disputa pertenece a la narración, no a una inspección pública de conversaciones ajenas.'
      ]),
      step('otra_version', [
        'La otra Casa conserva hojas con daños equivalentes y acusa a sus vecinos utilizando casi las mismas palabras. Ren separa los estandartes para que se vean los dos grupos sin una pared entre ellos. Bao señala una marca conocida junto a los sellos: la tinta parece aprovechar la desconfianza, no respetar las fronteras de cada asociación.',
        'Mei invita a las representantes a revisar una entrega que llegó a su casa de té antes del cierre. El registro demuestra que los nombres comenzaron a borrarse durante el mismo periodo. No absuelve por arte de magia todos los conflictos anteriores, pero sí impide usar esta crisis como prueba automática de que los demás deben ser enemigos.'
      ]),
      step('acuerdo', [
        'Ren propone abrir un acceso común para atender a quienes han quedado entre las barreras. Algunas voces quieren esperar a decidir qué Casa dirigirá el operativo. Lian recuerda que las criaturas y los vecinos no han dejado de necesitar ayuda mientras se discute quién recibirá el reconocimiento por ofrecerla.',
        'Puedes apoyar una mesa compartida de testimonios o un grupo mixto que revise primero los accesos. Las dos opciones reparten responsabilidad sin exigir que tu cuenta pertenezca a un clan. Las Casas del relato seguirán existiendo para todos; una afiliación real puede dar contexto a la participación, pero nunca decide quién tiene permitido continuar.'
      ], { choices: [
        choice('1', 'Abrir una mesa compartida de testimonios', 'house_bridge', 'testimony', 'Lian coordina las copias y ambas Casas presentan sus dudas en la misma mesa. Ren registra quién deberá responder a cada petición.'),
        choice('2', 'Revisar los accesos con un grupo mixto', 'house_bridge', 'access', 'Huan organiza parejas de Casas distintas para despejar el paso. La cooperación comienza con una tarea que nadie puede resolver cerrando otra puerta.')
      ] }),
      step('campana', [
        'Al retirar una barrera, un golpe de campana corta las conversaciones. La vibración no procede de la torre del Archivo: nace de un artefacto cubierto de tinta en el pabellón central. Las voces se vuelven más ásperas y pequeños Ecos empiezan a golpear tablillas que antes apenas llamaban su atención.',
        'Ren ordena despejar la plaza sin cargar contra las criaturas confundidas. Mei señala los puestos donde quedan personas y Yun pide tiempo para sacar un tejido que contiene nombres todavía legibles. La investigación deberá esperar unos turnos: antes de discutir el origen del conflicto hay que impedir que termine atrapando a quienes no lo eligieron.'
      ])
    ], reward: reward(15, 25, 60)
  },
  {
    id: 'plaza_cerrada', code: 'IV-02', chapterId: 'casas', title: 'La plaza cerrada', location: 'Pasajes de la Plaza', kind: 'sequence',
    steps: [
      step('organizar', [
        'Ren divide el rescate en tres recorridos cortos para que nadie pierda de vista su siguiente tarea. Tao debe cruzar con los registros de entrega, Mei mantiene un refugio junto a la fuente y Yun necesita retirar un tejido antes de que la tinta alcance sus bordes. Las tres personas toman decisiones propias durante la evacuación.',
        'El equipo no tiene que esperar a que otros jugadores se conecten. Huan y Bao acompañan a quienes no estarán en tu encuentro inmediato, mientras Lian registra las salidas seguras. Entre desafíos podrás preparar de nuevo a tus compañeros; superar una serie no significa arrastrar una derrota punitiva de un combate al siguiente.'
      ]),
      step('tao', [
        'Tao descubre que el pasillo más ancho termina en una puerta cerrada y cambia la ruta antes de que los demás lo sigan. Un Eco bloquea el acceso alternativo, atraído por los sellos de la carga. El mensajero deja el paquete a salvo y pide que le abran tiempo para retirar el último carro, no que peleen en su lugar para demostrar valor.',
        'Lian señala las salidas y Bao aparta a una criatura asustada de la trayectoria del combate. El enemigo anuncia su ofensiva con el movimiento de la tinta. Tu tarea es contenerlo el tiempo suficiente para que el recorrido vuelva a quedar libre; una victoria abre paso a Tao y la siguiente escena mostrará qué pudo hacer con esa oportunidad.'
      ], { encounterId: 'IV02A' }),
      step('mei', [
        'Con el pasaje despejado, Tao guía a los carros hacia Ren y vuelve para avisar a Mei. Ella ya ha convertido las mesas de la fuente en señales de orientación y atiende a vecinos de ambas Casas. Un segundo Eco se agita al oír la campana; Mei pide conservar una salida para que las criaturas puedan retirarse cuando se disipe la confusión.',
        'Huan sostiene una barrera de madera que protege a quienes esperan, sin utilizarla para encerrar al enemigo. El siguiente encuentro también permite reintentar sin perder las provisiones del relato. Lee la señal del turno y mantén al equipo preparado: golpear sin mirar podría agotar una habilidad antes de que aparezca la apertura necesaria.'
      ], { encounterId: 'IV02B' }),
      step('yun', [
        'Mei conduce a los vecinos hasta la ruta de Tao mientras Yun descuelga el tejido del pabellón. La restauradora localiza una costura reforzada y evita arrancar la pieza del marco. Un tercer Eco se interpone entre ella y la salida; Lian comprueba que el registro de nombres permanece legible y prepara una cubierta para transportarlo.',
        'Bao insiste en que nadie necesita destruir el pabellón para resolver la evacuación. Yun marca el punto por el que moverá el bastidor cuando el acceso quede libre. El desafío conserva un objetivo sencillo: superar la amenaza que anuncia el enemigo y permitir que la restauradora termine su trabajo con las personas y los nombres a salvo.'
      ], { encounterId: 'IV02C' }),
      step('despues', [
        'Tao comprueba que todos los carros llegaron, Mei vuelve a repartir agua y Yun extiende el tejido bajo un techo provisional. Cada rescate dejó una tarea completada por la persona que recibió ayuda. Ren evita atribuir la operación a una sola Casa y registra los nombres de quienes mantuvieron abiertas las rutas durante la confusión.',
        'El descanso permite que las criaturas recuperen su paso y que el grupo observe la plaza desde fuera del ruido. La campana continúa activa, pero ya no tiene a toda la población atrapada alrededor. Antes de enfrentarla, las Casas deberán decidir qué pueden construir juntas para que la siguiente crisis no encuentre las mismas puertas cerradas.'
      ])
    ], reward: reward(35, 45, 180, 1)
  },
  {
    id: 'pactos_bambu', code: 'IV-03', chapterId: 'casas', title: 'Pactos de bambú', location: 'Pabellón Compartido', kind: 'sequence',
    steps: [
      step('pabellon', [
        'El pabellón que guardaba las listas de refugios ha perdido un costado, aunque sus columnas todavía pueden sostener un techo ligero. Ren propone restaurarlo antes de reabrir la plaza. Servirá para recibir testimonios, guardar copias y distribuir ayuda sin obligar a cada vecino a explicar primero a qué asociación pertenece.',
        'Las Casas pueden colaborar mediante aportes de trabajo realizados en momentos distintos. Un Custodio que llega solo también puede completar una tarea equivalente con Bao, Tao y los vecinos. Esta elección no retira monedas o materiales de la cuenta: cualquier contribución real del sistema mantiene sus controles y su reconocimiento visible.'
      ], { choices: [
        choice('1', 'Coordinar el trabajo con la comunidad', 'community_route', 'clan', 'Ren abre una lista común de tareas. Los aportes pueden llegar de forma asíncrona; nadie necesita esperar una reunión de todos los jugadores.'),
        choice('2', 'Preparar una ruta individual con aliados', 'community_route', 'solo', 'Bao y los vecinos distribuyen contigo las mismas tareas esenciales. El avance principal y sus premios no dependen de una afiliación.')
      ] }),
      step('tarea', [
        'Yun distingue las tablillas que necesitan reparación de las que sólo deben secarse. Tao coloca rutas de entrega en una pared accesible y Mei organiza un espacio para quienes no quieren hablar delante de una multitud. Cada parte del pabellón responde a una necesidad concreta que faltaba en la primera versión del proyecto.',
        'La tarea de tu Custodio consiste en revisar que una petición pueda entrar, quedar registrada y recibir respuesta sin perderse entre oficinas. Es trabajo compartido aunque se realice en solitario con aliados narrativos. Ren registra el aporte una sola vez; repetir esta escena no producirá más monedas, XP o materiales.'
      ], { communityObjective: 'pabellon_bambu' }),
      step('regla', [
        'Huan encuentra dos listas de ayuda que repiten a las mismas familias con nombres distintos. Lian propone comprobarlas sin exponer el contenido privado de sus solicitudes. Las Casas empiezan a comprender que un registro compartido necesita reglas de acceso y revisión, no solamente una puerta abierta y una promesa de buena voluntad.',
        'Bao pregunta qué regla debería quedar visible junto a la entrada. Puedes destacar el derecho a recibir respuesta o el derecho a corregir un registro equivocado. Las dos opciones formarán parte del acuerdo; la elección señala cuál defenderás primero cuando la discusión sobre el futuro del Archivo deje de ser una posibilidad lejana.'
      ], { choices: [
        choice('1', 'Toda petición merece una respuesta', 'pavilion_rule', 'response', 'Ren anota un responsable y una forma de volver a consultar cada solicitud. Nadie debería desaparecer detrás de un trámite sin nombre.'),
        choice('2', 'Todo registro debe poder corregirse', 'pavilion_rule', 'review', 'Yun reserva espacio para rectificaciones y testimonios nuevos. Conservar una historia no significa impedir que alguien explique lo que falta en ella.')
      ] }),
      step('voces', [
        'Al terminar el techo, algunas criaturas se acercan a escuchar sin mostrar una carta. Mei les deja sitio y Lian evita interpretar su silencio como consentimiento. El pabellón no resolverá todos los daños del Archivo, pero ofrece una primera prueba de que la protección puede ampliarse sin encerrar a quienes pretende ayudar.',
        'Ren cuenta los aportes de las Casas y los de Custodios independientes en el mismo registro público de tareas, con el mismo valor para la reconstrucción principal. La organización elegida cambia quién te acompañó y lo que recuerdan del trabajo; no convierte a los jugadores solitarios en visitantes de segunda categoría.'
      ]),
      step('visita', [
        'Una persona espera fuera del pabellón con el símbolo del Sello dibujado en una tela. No ha venido a sabotear el refugio: busca noticias de una criatura que perdió durante una disputa. Ren pide a los guardias que mantengan distancia y Mei ofrece un banco antes de que otra discusión vuelva a cerrar la entrada.',
        'Bao reconoce que el Archivista no reunió seguidores sólo mediante amenazas. Algunos encontraron en su promesa una respuesta al daño que nadie quiso revisar. Escucharlos no obliga a aceptar su solución, pero ignorarlos dejaría intacta parte de la razón por la que el Sello sigue pareciendo una esperanza para quienes no han recibido otra.'
      ])
    ], reward: reward(20, 30, 70, 1)
  },
  {
    id: 'voces_sello', code: 'IV-04', chapterId: 'casas', title: 'Voces del Sello', location: 'Banco de los Testimonios', kind: 'sequence',
    steps: [
      step('peticion', [
        'La visitante se presenta como cuidadora de una criatura cuyo registro cambió durante una disputa. Conserva una copia incompleta y varias respuestas que la enviaron de una oficina a otra. Lian distingue lo comprobable de lo que aún debe investigar, sin pedirle que convierta su dolor en una prueba perfecta para merecer atención.',
        'Otras dos personas permanecen junto al símbolo del Sello. Una teme volver a separarse de su compañero; la otra cree que inmovilizar todos los vínculos evitaría que alguien pudiera volver a lucrar con una despedida injusta. Sus razones describen daños reales dentro del relato y una solución que también necesita ser examinada.'
      ], { choices: [
        choice('1', 'Escuchar los testimonios antes de responder', 'seal_voices', 'listen', 'Lian prepara copias para investigar y Bao escucha sin corregir cada frase. El grupo podrá recordar estos casos al discutir con el Archivista.'),
        choice('2', 'Concentrarse primero en detener el artefacto', 'seal_voices', 'ignore', 'Ren recibe las peticiones para que no queden desatendidas. El grupo avanza antes, pero su propia crónica conserva que no escuchó los relatos completos.')
      ] }),
      step('testimonios', [
        'Mei mantiene el banco disponible mientras Ren garantiza que las peticiones lleguen al pabellón. Los casos no desaparecen si tu Custodio decide concentrarse en otra tarea. La comunidad tendrá que investigarlos y reparar lo que corresponda después de detener la crisis; vencer a un antagonista no convierte en falsas las experiencias que utilizó para conseguir apoyo.',
        'Bao señala un límite del Sello: impediría tanto una transferencia abusiva como la salida voluntaria de un vínculo injusto. Una criatura que quisiera marcharse tampoco podría hacerlo. La pregunta no consiste en escoger entre libertad y cuidado, sino en construir una protección que no elimine la voz de quienes necesitan ambas cosas.'
      ]),
      step('respuesta', [
        'Huan pregunta qué promesa puede ofrecer el grupo sin repetir el error de asegurar una solución inmediata. Lian propone comprometer trabajo verificable: conservar fuentes, revisar los casos y permitir apelaciones. La visitante no tiene por qué agradecer antes de saber si esas acciones llegarán a realizarse.',
        'Puedes destacar el derecho de las criaturas a hablar sobre sus vínculos o la obligación del Archivo de responder cuando sus reglas han causado daño. La otra parte seguirá incluida en el acuerdo. Lo que cambie será la frase que tu Custodio llevará después ante alguien convencido de que sólo una prohibición absoluta puede impedir una nueva pérdida.'
      ], { choices: [
        choice('1', 'Defender la voz de cada criatura', 'seal_answer', 'voice', 'Bao guarda la frase: escuchar también exige permitir una respuesta distinta de la que el guardián esperaba oír.'),
        choice('2', 'Exigir responsabilidad al Archivo', 'seal_answer', 'accountability', 'Lian identifica tareas y responsables. La reparación deberá continuar cuando las campanas dejen de sonar y ya no haya una emergencia que la haga visible.')
      ] }),
      step('decantar', [
        'La tela del Sello permanece sobre el banco, ahora junto a una copia de la petición y un medio para consultar su avance. Ren rechaza usarla como prueba automática de hostilidad. Varias personas deciden quedarse en el refugio; otras todavía apoyan al Archivista. La conversación cambia el espacio disponible sin fingir que una frase resuelve de inmediato todas las posiciones.',
        'Huan reconoce que comprender una razón no obliga a aceptarla como respuesta universal. Mei cierra la caja de testimonios con una lista de quiénes pueden consultar cada documento. Las palabras sobre proteger identidades empiezan a tomar la forma menos espectacular, y más exigente, de procedimientos que puedan corregirse cuando fallen.'
      ]),
      step('llamada', [
        'La campana del pabellón central vuelve a golpear y dos representantes interrumpen el trabajo para acusarse de esconder información. Lian comprueba que ambas leen la misma copia, pero oyen la voz de su rival como una amenaza. La tinta amplifica la tensión y convierte cada respuesta precipitada en otra razón para seguir atacando.',
        'Bao pide dejar las peticiones bajo cuidado de Mei y señala el centro de la plaza. La Campana del Conflicto no se vencerá alimentando indefinidamente el ruido que produce. El grupo ha aprendido a detenerse para escuchar; ahora tendrá que sostener ese ritmo dentro de un combate que castiga precisamente la prisa por golpear.'
      ])
    ], reward: reward(20, 30, 60)
  },
  {
    id: 'campana_conflicto', code: 'IV-05', chapterId: 'casas', title: 'Campana del Conflicto', location: 'Pabellón Central', kind: 'sequence', traceId: 'cuarto_trazo',
    steps: [
      step('centro', [
        'La Campana del Conflicto cuelga de una estructura cubierta de tinta que vibra incluso cuando nadie la toca. A su alrededor, cada ataque directo parece dejar otra marca en el metal. Ren ordena retirar a las Casas del círculo para que la pelea no se convierta en una competencia por atribuirse el golpe que hará callar la plaza.',
        'Lian identifica la señal que anuncia una descarga y un patrón distinto cuando la tensión se concentra. Defender o aliviar el ritmo permitirá controlar lo que el artefacto acumula. Bao explica la mecánica antes de entrar: no habrá una penalización escondida por intentar aprender, pero atacar sin descanso alimentará justamente la fuerza del enemigo.'
      ]),
      step('acuerdo', [
        'Las dos Casas deben mantener abierto el acceso mientras tu equipo entra al círculo. Una representante propone llevar sólo su estandarte al pabellón para demostrar unidad bajo su dirección. Ren rechaza que la ayuda dependa de aceptar un símbolo común impuesto. La tregua debe permitir que las diferencias sigan existiendo sin convertirse en una excusa para cerrar el paso.',
        'Huan recuerda el puente y pregunta qué señal usarán para retirarse si el combate sale mal. La decisión no cambia a escondidas las estadísticas ni compra una victoria: deja establecido si el refugio se organizará alrededor de una tarea compartida o de turnos de responsabilidad que ninguna Casa pueda controlar para siempre.'
      ], { choices: [
        choice('1', 'Mantener una tarea común entre las Casas', 'house_pact', 'shared', 'Ren distribuye la protección de los accesos. El acuerdo se sostendrá mientras cada Casa cumpla su parte, sin exigir que renuncie a su nombre.'),
        choice('2', 'Rotar responsabilidades bajo supervisión', 'house_pact', 'rotating', 'Lian registra relevos y revisión mutua. La tregua deja un modo concreto de evitar que proteger la plaza se convierta en apropiarse de ella.')
      ] }),
      step('combate', [
        'El metal devuelve un eco de los primeros golpes y la tinta empieza a reunir tensión. Observa el aviso del enemigo y las acciones disponibles antes de escoger la siguiente respuesta. Huan y Ren mantendrán libres las salidas; si caes, podrás reintentar con tu colección intacta y revisar qué decisión alimentó la descarga.',
        'Las criaturas no necesitan pertenecer a una rareza o una Casa determinada para superar el artefacto. Una habilidad poderosa utilizada en el momento equivocado puede prolongar el peligro. El desafío exige alternar el ritmo y conservar al equipo, la misma idea que resultó difícil sostener cuando la discusión llenó toda la plaza.'
      ], { encounterId: 'IV05' }),
      step('cuarto_trazo', [
        'La campana se detiene con una vibración breve y deja caer la tinta como si el metal recuperara su peso verdadero. Yun encuentra el Cuarto Trazo dentro del soporte y verifica que puede retirarlo sin dañar los registros del pabellón. Ren permite que ambas Casas presencien la entrega y que Lian documente su procedencia.',
        'Las representantes no se convierten de inmediato en amigas, pero aceptan una tregua y un trabajo común de reparación. Mei devuelve las peticiones a la mesa y recuerda que siguen pendientes. La victoria se reconoce por las rutas abiertas y las voces que pueden volver a escucharse, además de por la desaparición de un enemigo.'
      ]),
      step('archivo_original', [
        'Bao reúne los cuatro Trazos y explica dónde se construyó el primer Archivo, antes de que la institución creciera alrededor de sus copias. El Archivista conoce esa sala porque trabajó allí con él. El mentor no guarda la ubicación para decidir cuándo estará preparado el grupo: comparte el mapa y acepta las preguntas que su antiguo silencio provoca.',
        'Ren mantendrá las Casas fuera de una guerra por el control del hallazgo. Mei y Yun conservarán los testimonios mientras Tao organiza el regreso de los registros a sus lugares. El viaje final comienza con una comunidad que todavía discute, pero dispone de más formas de hacerlo que cerrar una puerta o inmovilizar un vínculo.'
      ])
    ], reward: reward(65, 65, 230, 2, 1, 'tregua_de_las_casas')
  },
  {
    id: 'puertas_archivo', code: 'V-01', chapterId: 'archivo', title: 'Puertas del Archivo Original', location: 'Patio de las Inscripciones', kind: 'sequence',
    steps: [
      step('llegada', [
        'El Archivo Original se encuentra detrás de un patio que las ampliaciones habían convertido en un lugar de paso. No hay un paisaje destruido por completo: algunas plantas siguen creciendo entre las losas y una puerta conserva reparaciones de distintas épocas. Bao muestra dónde trabajaba antes de que las oficinas empezaran a confundir su historia con la de toda la ciudad.',
        'Lian coloca copias de los cuatro Trazos sobre una mesa de lectura. Los originales conservan su procedencia y no se consumen al resolver la entrada. La puerta reconoce una secuencia de ideas, no una suma de cartas raras o de propietarios prestigiosos. Las pistas necesarias ya forman parte de las páginas del diario que el grupo puede volver a consultar.'
      ]),
      step('cuatro_marcas', [
        'Las marcas de la puerta representan memoria, autenticidad, elección y responsabilidad compartida. Cada una procede de una parte del viaje y ninguna basta por separado. La memoria sin revisión puede conservar un error; una elección sin cuidado puede dejar a alguien desprotegido. Huan sujeta las copias para que el viento no decida su orden por accidente.',
        'Puedes comenzar la lectura por la identidad de las criaturas o por las responsabilidades de sus Custodios. Después deberás resolver cuatro inscripciones con las pistas de los Trazos y el diario. Una respuesta equivocada conservará la página y ofrecerá una indicación, sin quitar recursos. Bao pide leer el principio completo antes de elegir qué significado le corresponde.'
      ], { choices: [
        choice('1', 'Comenzar por la identidad y la voz', 'archive_gate', 'identity', 'Lian lee los nombres que pudieron recuperarse y deja espacios visibles para los que todavía faltan. La puerta reconoce que una identidad no se reduce a su registro.'),
        choice('2', 'Comenzar por el cuidado y su responsabilidad', 'archive_gate', 'responsibility', 'Bao repasa los errores documentados durante el viaje. La puerta reconoce que custodiar también exige responder cuando una protección ha causado daño.')
      ] }),
      step('contrapeso', [
        'El mecanismo se mueve cuando Huan completa la parte que no escogiste primero. La puerta no concede una victoria a una posición sobre la otra; reúne las dos para impedir que el cuidado se convierta en dominio o que la libertad sirva como excusa para no reparar un abuso. La inscripción inicial vuelve a mostrar algunos de sus trazos.',
        'Bao reconoce una frase que había utilizado de manera demasiado cómoda durante años. «Una identidad se protege», lee, y espera antes de añadir «no se posee por completo». Lian conserva ambas partes juntas. Lo que el grupo deberá demostrar dentro del Archivo no será que nunca cometió errores, sino que puede dejar una forma de corregirlos.'
      ]),
      step('guardianes', [
        'Tras la puerta se oyen voces que repiten nombres incompletos. Varias criaturas permanecen junto a los registros que aún recuerdan, mientras la tinta las obliga a volver a la misma posición. No parecen miembros de una especie nueva ni copias destinadas a aumentar una colección; son Ecos cuya identidad ha quedado atrapada entre órdenes contradictorias.',
        'Huan propone asegurar el pasillo para no enfrentarse a toda la sala de una vez. Bao reconoce las señales del dispositivo y Lian distingue a quienes responden a la palabra ayuda. Antes de llegar al Archivista habrá que decidir cómo atender esas voces sin perder de vista el mecanismo que continúa borrando sus posibilidades de elegir.'
      ]),
      step('umbral_final', [
        'El grupo marca una ruta de regreso y deja instrucciones para los mensajeros de Ren. Nadie promete que la salida seguirá abierta por simple buena fortuna. Tao comprobará desde fuera los avisos acordados y Mei mantendrá el pabellón preparado para recibir a las criaturas que puedan salir, pertenezcan o no a una Casa conocida.',
        'Lian cierra el mapa sobre la mesa y conserva en la mano una hoja vacía para lo que todavía no saben. La historia del Archivo no termina en las pruebas que ya contiene: también necesita espacio para los nombres que sus reglas dejaron fuera. Esa idea acompañará al grupo cuando las primeras voces pidan una respuesta concreta.'
      ])
    ], reward: reward(20, 30, 70, 1)
  },
  {
    id: 'guardianes_olvidados', code: 'V-02', chapterId: 'archivo', title: 'Los guardianes olvidados', location: 'Galería de las Voces', kind: 'sequence',
    steps: [
      step('galeria', [
        'Un Eco repite el nombre de una antigua Custodia sin recordar si desea encontrarla o despedirse. Otro protege una carta en blanco y retrocede cuando alguien intenta tocarla. Lian reconoce que ninguna de esas conductas demuestra por sí sola que una criatura quiera recuperar exactamente el vínculo que aparece en el documento más antiguo.',
        'El dispositivo del fondo acelera su pulso. Bao puede señalar una ruta hacia él, pero las voces de la galería también necesitan una salida segura. Puedes dedicarte a ayudar a las criaturas o concentrarte en detener primero la fuente del daño. El grupo repartirá las tareas para que ninguna elección se convierta en abandonar a los demás a una muerte escrita de antemano.'
      ], { choices: [
        choice('1', 'Ayudar a los Ecos a salir de la galería', 'forgotten_echoes', 'help', 'Huan asegura la ruta y Lian conserva las palabras que cada criatura desea dejar. Bao vigila el pulso del dispositivo mientras ayudas a despejar la galería.'),
        choice('2', 'Concentrarse en el dispositivo', 'forgotten_echoes', 'focus', 'Bao guía la búsqueda de la fuente del daño. Huan y Lian atienden la salida de los Ecos; la crónica recordará que priorizaste detener el mecanismo.')
      ] }),
      step('nombre_elegido', [
        'Una criatura responde cuando Lian le ofrece dos formas de dirigirse a ella y deja de hacerlo cuando la investigadora insiste en la lectura del registro. La diferencia es pequeña y suficiente para cambiar la consulta. El cuaderno conserva una corrección: recordar un nombre no significa obligar a alguien a utilizarlo de la misma manera para siempre.',
        'Bao separa una cinta de tinta de la ruta de salida, pero uno de los Ecos todavía obedece una orden de proteger la galería contra cualquier movimiento. No puede entender la retirada como algo seguro. El encuentro que viene intentará romper esa confusión; la victoria no entregará al enemigo como premio ni decidirá a quién debe acompañar después.'
      ]),
      step('confusion', [
        'El Eco del Umbral reúne tinta alrededor del registro y deja una señal antes de descargarla. Huan mantiene libre el pasillo mientras tu equipo le hace frente. Las criaturas que ya han salido conservan sus cartas y su capacidad de apartarse; no se las convierte en escudos ni en un recurso que deba gastarse para facilitar la pelea.',
        'Lian pide observar qué movimiento repite la orden antigua. Una derrota dejará disponible el reintento y una pista sobre el turno que complicó la retirada. El grupo no necesita una rareza determinada para seguir adelante, pero tampoco podrá ignorar indefinidamente los avisos y esperar que la narración le conceda una victoria automática.'
      ], { encounterId: 'V02' }),
      step('liberacion', [
        'Al separarse la tinta, el Eco deja de proteger el registro contra quienes intentaban salvarlo. No recupera todos sus recuerdos en un instante, pero puede apartarse de la galería y decidir si quiere escuchar la lectura de su carta. Lian conserva esa diferencia como un hecho, sin exigir una gratitud que complete una escena heroica.',
        'El reparto de tareas permitió que las dos rutas terminaran con las criaturas a salvo. La elección sigue teniendo una huella visible: algunas recuerdan tus manos en la salida y otras la rapidez con que abriste el acceso al dispositivo. La crónica conservará la prioridad elegida para que el epílogo reconozca lo que hiciste, sin inventar una catástrofe en la alternativa.'
      ]),
      step('sala_contigua', [
        'En la sala contigua aparece una mesa con herramientas de Bao y del antiguo protector. La disposición del trabajo contradice la versión de un único villano actuando al margen de una institución inocente. También muestra que el plan del Sello fue una decisión posterior: conocer el origen compartido no vuelve inevitables los actos que cada uno eligió después.',
        'Bao solicita un momento antes de llegar al mecanismo principal. No pretende pedir una absolución ni utilizar el peligro para aplazar otra vez la conversación. Huan mantiene vigilada la entrada y Lian abre la carpeta de las peticiones. El mentor tendrá que hablar sabiendo que algunas respuestas ya pueden compararse con pruebas que no controla.'
      ])
    ], reward: reward(30, 40, 150, 1)
  },
  {
    id: 'confesion_bao', code: 'V-03', chapterId: 'archivo', title: 'La confesión de Bao', location: 'Mesa de los Antiguos Protectores', kind: 'sequence',
    steps: [
      step('mesa', [
        'Bao reconoce una herramienta que utilizó para copiar peticiones sin trasladar a su expediente principal los testimonios que las acompañaban. En aquel momento lo llamó ordenar el trabajo. Ahora muestra cómo esa decisión separó hechos que sólo podían entenderse juntos y facilitó que algunas solicitudes parecieran caprichos sin una razón verificable.',
        'Lian no convierte la confesión en una explicación suficiente para toda la crisis. Pregunta qué documentos existen, quiénes pueden revisarlos y qué personas quedaron sin respuesta. Bao entrega la ubicación de las copias y acepta que la investigación continúe después, cuando ya no pueda ampararse en la urgencia de detener el Sello.'
      ]),
      step('compromiso', [
        'El mentor explica que temió perder la confianza de sus compañeros si admitía cuánto conocía del origen del Archivista. Ese miedo lo llevó a decidir otra vez qué información estaban preparados para escuchar los demás. Huan reconoce el patrón sin reducir toda la vida de Bao a ese error: alguien puede haber ayudado y seguir debiendo una reparación.',
        'Puedes insistir en que Bao permanezca como testigo responsable o en que la revisión quede en manos de personas que no dependan de su versión. Ninguna respuesta retira el acceso a los capítulos finales. La escena cambia la forma de su compromiso y lo que la crónica exigirá recordar cuando las campanas hayan dejado de sonar.'
      ], { choices: [
        choice('1', 'Pedir que acompañe y responda como testigo', 'bao_repair', 'witness', 'Bao se compromete a declarar sin hablar por quienes sufrieron las omisiones. Lian conservará las preguntas que todavía no tienen respuesta.'),
        choice('2', 'Pedir una revisión independiente de sus actos', 'bao_repair', 'review', 'Bao entrega sus copias al futuro proceso de revisión. Su colaboración seguirá siendo necesaria, pero no decidirá por sí solo cuándo la reparación está terminada.')
      ] }),
      step('limite', [
        'Bao distingue su responsabilidad de la decisión del Archivista de borrar nombres y construir el Sello. Compartir un pasado no elimina la capacidad de elegir un método diferente. El antiguo protector tendrá que responder por el daño que está causando, incluso si sus primeras reclamaciones identificaron problemas que el Archivo debía haber atendido.',
        'Huan pregunta si las criaturas podrán abandonar también a Custodios que se consideran bondadosos. Bao responde que sí. Proteger la libertad de elegir significa aceptar una despedida que uno mismo no desea, no sólo impedir los abusos cometidos por otros. La respuesta deja de ser cómoda y por eso empieza a parecerse al principio de la Primera Carta.'
      ]),
      step('memoria', [
        'Lian vuelve a leer los nombres que pudo recuperar en el bosque y el mercado. Algunas criaturas buscarán a sus antiguos compañeros; otras elegirán una ruta distinta o necesitarán tiempo para decidir. La restauración del Archivo no debe escribir un final idéntico para todas. Su tarea será conservar herramientas para que puedan continuar sus propias historias.',
        'Bao guarda una sola herramienta y deja las demás sobre la mesa para quienes investiguen después. No destruye la evidencia como gesto de arrepentimiento. Las copias y los testimonios permanecen disponibles con sus límites de acceso. El grupo se prepara para una conversación final que no confundirá reconocer el daño con aceptar una prisión como respuesta.'
      ]),
      step('paso_huan', [
        'Antes del corredor principal, Huan pide revisar el acuerdo del grupo. La fuerza del Sello no proviene únicamente de sus ataques, sino de la promesa de eliminar para siempre un miedo. Si nadie puede separarse, parece decir, nadie tendrá que aprender a sostener una despedida. El rival sabe lo atractivo que puede resultar resolver una incertidumbre mediante una orden.',
        'Bao permite que la conversación continúe sin presentarse como juez. Lian conserva los testimonios y las criaturas esperan una señal que puedan comprender. Huan no decidirá si el protagonista merece existir en la historia, pero sí expresará qué necesita entender para acompañarlo a la sala donde todas esas ideas deberán sostenerse durante el peligro.'
      ])
    ], reward: reward(15, 25, 60)
  },
  {
    id: 'juicio_huan', code: 'V-04', chapterId: 'archivo', title: 'El juicio de Huan', location: 'Corredor de las Decisiones', kind: 'sequence',
    steps: [
      step('rival', [
        'Huan pregunta qué harás si una criatura elige abandonar un vínculo después de que su Custodio haya invertido años en cuidarla. No formula la pregunta para justificar un golpe ni para convertirse en enemigo a última hora. Quiere comprender cómo proteger a ambos sin que la decepción del guardián se convierta en una propiedad sobre la otra parte.',
        'El rival ha visto tus decisiones y su forma de plantear la duda conserva ese recorrido. Puede ofrecer ayuda con confianza o pedir una explicación más concreta antes de comprometerse. Las dos escenas desembocan en apoyo suficiente para continuar: una relación variable enriquece la historia sin convertir una respuesta antigua en una llave que bloquee el final.'
      ], { variants: [
        variant({ huan_helped: 'yes' }, ['Huan recuerda cómo buscaste a su compañera en el desvío de la montaña y respetaste el espacio que necesitaba para volver. «Ya te vi hacerlo cuando no había un público», dice. La pregunta sigue siendo difícil, pero ahora parte de una experiencia compartida y no de una sospecha sobre tus intenciones.']),
        variant({ rival_response: 'forgive' }, ['Huan recupera la tablilla del puente, donde una victoria y una derrota podían enseñarse sin utilizarse para humillar. Reconoce que le diste espacio para cambiar de respuesta y ofrece guardar la retirada del grupo. «Puedo seguir preguntando sin ponerme delante de la puerta», admite mientras prepara el corredor.']),
        variant({ rival_response: 'firm' }, ['Huan recuerda que le pediste escuchar antes de juzgar. Esta vez deja terminar cada explicación y solicita un ejemplo concreto en lugar de otra prueba de fuerza. La relación conserva su tensión, pero el rival cumple el compromiso que asumió: no convierte una duda legítima en permiso para decidir por todos.'])
      ] }),
      step('argumento', [
        'Lian propone responder con algo que el grupo pueda poner en práctica después del combate. Una criatura debe poder expresar su voluntad sin que el registro la vuelva sospechosa; un Custodio que haya sufrido un engaño necesita una vía de reparación. Ninguna de esas garantías puede depender sólo de que la persona encargada sea siempre amable y tenga siempre razón.',
        'Puedes defender la revisión pública de las reglas, una voz propia para las criaturas o el reparto de decisiones entre varias personas. La elección señala el argumento que Huan recordará al acompañarte. Todavía no decide el gobierno final del Archivo: esa resolución llegará cuando el Sello deje de amenazar a quienes tendrán que participar en ella.'
      ], { choices: [
        choice('1', 'Necesitamos reglas que puedan revisarse', 'huan_argument', 'rules', 'Huan acepta distinguir una norma firme de una norma incapaz de corregir un error. Ayudará a mantener los registros disponibles para revisarlos.'),
        choice('2', 'Cada criatura debe conservar su voz', 'huan_argument', 'voice', 'Huan recuerda las decisiones que su propio compañero expresó sin una orden. Guardará una salida para quienes necesiten apartarse del combate.'),
        choice('3', 'Nadie debe decidir todo en solitario', 'huan_argument', 'shared', 'Huan distribuye las tareas con Bao y Lian. El acuerdo tendrá varios responsables y una forma de expresar desacuerdo sin quedar fuera de él.')
      ] }),
      step('ayuda', [
        'Huan comprueba la retirada y coloca señales que puedan leer las personas que entren después. Su contribución no añade en secreto una victoria automática ni exige que hayas ganado el duelo del puente. La ayuda se expresa en una tarea visible: conservar el acceso por el que podrán salir los nombres recuperados y quienes no deban permanecer en la sala.',
        'Bao entrega a Lian la copia de su compromiso y ella reparte las fuentes necesarias para responder al Archivista. Ninguno pretende hablar en nombre de todas las criaturas. El grupo se acerca a la puerta con argumentos incompletos, deberes concretos y la disposición de admitir que una protección justa necesitará seguir cambiando después de esta noche.'
      ]),
      step('preparacion', [
        'A través de la puerta se distinguen tres pulsos del mecanismo. El primero mueve registros y recuerdos, el segundo cierra algunas vías de respuesta y el tercero reúne energía alrededor del vínculo. Lian los nombra Memoria, Control y Elección para que las señales puedan entenderse cuando la conversación se convierta en combate.',
        'Bao recomienda revisar el equipo y entrenar si hace falta. Una criatura evolucionada puede ayudar a resistir un error, pero no es el permiso de entrada a la última misión. Huan insiste en leer la señal del turno, porque el Sello buscará que repitas una respuesta útil hasta que deje de serlo. Nadie promete que el primer intento tenga que terminar en victoria.'
      ]),
      step('puerta', [
        'El grupo entra cuando las rutas de retirada están listas. Las cartas no se ofrecen como pago ni se ponen en juego mediante una decisión de diálogo: cada unidad conserva la identidad y los controles de propiedad del sistema. La lucha que viene resolverá si el artefacto puede seguir imponiéndose, no quién obtiene un derecho ilimitado sobre sus compañeros.',
        'El Archivista levanta la mirada desde una carta blanca y reconoce el sello de Bao. Huan no convierte el encuentro en un ajuste personal; se queda junto a las señales de salida. Lian sostiene el cuaderno abierto para que el relato del antiguo protector pueda contrastarse con voces que habían quedado fuera de sus conclusiones.'
      ])
    ], reward: reward(20, 30, 60)
  },
  {
    id: 'ultimo_nombre', code: 'V-05', chapterId: 'archivo', title: 'El Archivista', location: 'Sala de la Última Inscripción', kind: 'sequence',
    steps: [
      step('motivo', [
        'El Archivista muestra registros de criaturas que fueron tratadas como trofeos y de Custodios que nunca consiguieron una respuesta al pedir ayuda. No todos los documentos son falsos ni todas las pérdidas una excusa. Lian reconoce varios casos y rechaza que admitirlos obligue a aceptar la desaparición de cualquier vínculo futuro.',
        'El antiguo protector afirma que el Sello evitará otra despedida injusta. Bao pregunta por la criatura que quiera marcharse de una relación abusiva y por aquella que elija una nueva amistad. El Archivista no niega que también quedarían detenidas: considera ese precio una forma de seguridad. La contradicción deja de estar escondida detrás de sus buenas intenciones.'
      ]),
      step('respuesta', [
        'El mecanismo continúa borrando los nombres mientras la conversación avanza. Las palabras pueden explicar el conflicto, pero no desactivan por sí solas una decisión que el Archivista todavía está ejecutando. Tu respuesta servirá para señalar qué defenderá el grupo durante el encuentro y qué obligación seguirá existiendo cuando deje de sonar la última descarga.',
        'Bao evita prometer que toda libertad será sencilla o que ninguna criatura volverá a sufrir. Lian señala la diferencia entre conservar una posibilidad y garantizar un resultado. Puedes centrar tu argumento en la voz de los compañeros o en la reparación de los daños; ambos caminos exigen detener el Sello sin destruir las identidades que intenta inmovilizar.'
      ], { choices: [
        choice('1', 'Proteger también significa permitir elegir', 'archivist_answer', 'choice', 'El Archivista oye que su seguridad impediría incluso una salida justa. Bao mantiene visible el espacio por el que una criatura puede apartarse.'),
        choice('2', 'Reparar el daño no autoriza a repetirlo', 'archivist_answer', 'repair', 'Lian reúne las peticiones y las voces que no caben en el plan. La investigación del Archivo continuará, pero el borrado debe detenerse ahora.')
      ] }),
      step('memoria', [
        'En el primer pulso, los registros proyectan Ecos sobre los corredores de la sala. Algunos conservan una voz propia; otros repiten una orden sin reconocer a quién protege. Lian identifica la fase de Memoria y pide distinguir las señales del mecanismo de las criaturas que necesitan salir, evitando que la pelea se convierta en otro borrado indiscriminado.',
        'El Archivista utiliza esas imágenes para repetir los peores casos que conoció. Los testimonios merecen conservarse, pero no pueden decidir por cada vínculo que aún no ha ocurrido. Huan sostiene las rutas preparadas y Bao señala cuándo la energía se concentra. Las pistas no sustituyen tu acción: permiten comprender por qué habrá momentos de ataque y de defensa.'
      ]),
      step('control', [
        'El segundo pulso cierra temporalmente algunas respuestas y cambia el ritmo de la sala. Lian lo llama Control: una herramienta útil no estará disponible en todos los turnos y el equipo tendrá que leer qué puede hacer ahora. El mecanismo anuncia sus cierres antes de exigir una alternativa; la prueba no depende de una orden que el jugador sólo podía conocer fuera del juego.',
        'Bao recuerda el Centinela y la Campana: insistir en la misma respuesta puede alimentar el problema. Si pierdes, las señales y el punto de la derrota servirán para preparar un nuevo intento sin retirar monedas, XP o cartas ganadas antes. Las repeticiones no concederán premios por caer ni debilitarán a escondidas el principio que se está poniendo a prueba.'
      ]),
      step('eleccion', [
        'El último pulso concentra la tinta alrededor del vínculo. El grupo reconoce la fase de Elección por las señales revisadas en el corredor, no por una adivinanza final. Habrá que sostener al equipo y utilizar la apertura correcta, aceptando que proteger no siempre coincide con ejecutar el ataque más grande disponible en ese instante.',
        'Huan confirma que la salida permanece abierta y Lian reúne los Trazos recuperados sin confundirlos con una propiedad sobre el resto del Archivo. El Archivista se niega a detener el artefacto voluntariamente. La pelea será necesaria mientras siga imponiendo el Sello, aunque el grupo conserve la obligación de investigar el daño que utilizó para justificarlo.'
      ]),
      step('combate', [
        'La carta blanca se eleva y los tres pulsos del Sello se ordenan alrededor de la sala. Lee la fase y el aviso que muestra el enemigo antes de elegir una respuesta. Tu colección seguirá siendo tuya si el intento termina en derrota; podrás reintentar o entrenar, pero la victoria deberá llegar de acciones que sostengan al equipo frente a lo que el mecanismo anuncia.',
        'Bao se aparta de la línea de ataque, Huan conserva la retirada y Lian protege los registros que permiten devolver los nombres. Nadie ofrece una criatura como precio de la libertad de otra. El último combate de la campaña empieza con una tarea precisa: interrumpir Memoria, Control y Elección sin repetir la idea de que cuidar significa inmovilizar.'
      ], { encounterId: 'V05' })
    ], completionScene: [
      'La última descarga se apaga antes de alcanzar los registros. El Sello Inmutable se separa de la carta blanca y los nombres dejan de desplazarse hacia el centro de la sala. No todas las criaturas recuerdan de inmediato cuanto perdieron, pero vuelve a existir espacio para que respondan por sí mismas y continúen su recuperación.',
      'Entre las piezas detenidas encontráis el fragmento final, que aún debe reunirse con los otros al restaurar el Archivo. Lian registra el hallazgo sin ocultar los documentos del Archivista y Ren llega para ponerlo bajo custodia de una revisión. Comprender sus motivos no elimina su responsabilidad. Bao entrega sus propias copias: el final del combate no será el final de las preguntas.'
    ], reward: reward(100, 100, 350, 2, 2, 'ultima_inscripcion')
  },
  {
    id: 'destino_sello', code: 'V-06', chapterId: 'archivo', title: 'El destino del Sello', location: 'Mesa de las Cinco Partes', kind: 'sequence', traceId: 'quinto_trazo',
    steps: [
      step('detenido', [
        'Las piezas del Sello permanecen separadas bajo vigilancia y los cinco Trazos pueden leerse sin alimentar el mecanismo. Bao insiste en que la derrota del Archivista no concede a un nuevo Custodio el derecho a decidir todo en su lugar. Ren organiza una consulta con las Casas, personas independientes y voces de criaturas que han recuperado parte de sus recuerdos.',
        'Mei abre el pabellón para quienes no pueden o no quieren entrar al Archivo Original. Yun prepara copias que distinguen la información compartida de los testimonios con acceso limitado. La pregunta ahora es cómo reconstruir una institución capaz de proteger y corregirse, sin borrar la libertad de quienes no estén de acuerdo con su primera respuesta.'
      ]),
      step('tres_propuestas', [
        'La primera propuesta conserva un Archivo con obligaciones claras, vías de reparación y supervisión de sus decisiones. La segunda abre la custodia de los registros a una comunidad más amplia sin publicar testimonios privados. La tercera establece un consejo plural que reparte la revisión entre quienes antes sólo podían pedir que alguien los escuchara.',
        'Las tres protegen los vínculos y permiten nuevos encuentros, despedidas y transferencias legítimas. Ninguna opción desactiva el mercado real, obliga a intercambiar cartas o modifica los controles de doble confirmación. La decisión de tu Custodio determinará el enfoque de su desenlace personal dentro de un canon común: el Archivo restaurado y los vínculos libres.'
      ], { choices: [
        choice('1', 'Archivo Protegido: reglas y reparación', 'archive_ending', 'protected', 'La propuesta prioriza garantías claras, registros fiables y un derecho real a revisar decisiones injustas. El Archivo deberá demostrar que sus reglas también lo obligan a responder.'),
        choice('2', 'Voces Abiertas: comunidad y testimonios', 'archive_ending', 'open', 'La propuesta amplía la participación y reconoce voces que antes no podían entrar al registro. Compartir responsabilidades no elimina la privacidad de quienes confiaron su historia.'),
        choice('3', 'Consejo del Bambú: vigilancia compartida', 'archive_ending', 'council', 'La propuesta distribuye la supervisión entre distintas voces y establece relevos. Nadie podrá tratar su puesto como un derecho permanente a decidir por los demás.')
      ] }),
      step('resolucion', [
        'Lian lee el acuerdo completo, incluida la parte que permite corregirlo. Las criaturas no quedan obligadas a conservar un vínculo por haber ayudado a restaurar el Archivo. Las Casas tampoco reciben una propiedad sobre las rutas o los testimonios que protegieron. La nueva organización tendrá que medirse por lo que permita hacer a quienes lleguen después.',
        'Bao deja su sello antiguo junto a las copias de la revisión. Ren registra la detención del Archivista y las preguntas que su proceso deberá responder. El grupo puede reconocer que algunas de sus denuncias fueron necesarias sin dejar que esa verdad absorba la responsabilidad por los nombres que borró para imponer una respuesta universal.'
      ], { variants: [
        variant({ archive_ending: 'protected' }, ['En tu propuesta, cada decisión importante deja una razón consultable y una ruta de apelación. Yun reserva un espacio para las rectificaciones y Mei mantiene un acceso para quienes no saben utilizar el procedimiento. El Archivo Protegido no se considera terminado: comienza el trabajo de comprobar que su protección también llega a quienes lo cuestionan.']),
        variant({ archive_ending: 'open' }, ['En tu propuesta, el Archivo aprende a recibir voces que no pueden demostrar toda su historia mediante un sello. Lian organiza testimonios con consentimiento y procedencia, y Tao conecta los puntos de consulta de la ciudad. Las Voces Abiertas amplían la custodia de la memoria sin confundir escuchar con exhibir la vida privada de cualquiera.']),
        variant({ archive_ending: 'council' }, ['En tu propuesta, el consejo conserva asientos para posiciones distintas y reglas para revisar a sus propios integrantes. Ren acepta que las Casas no serán las únicas voces y Bao comparecerá como testigo cuando corresponda. El Consejo del Bambú nace con relevos y límites para evitar que compartir una mesa termine creando otra puerta cerrada.'])
      ] }),
      step('primera_carta', [
        'Lian reúne el fragmento final con los otros cuatro y entrega el Quinto Trazo a la crónica restaurada. Su inscripción no concede un poder que resuelva todo desacuerdo futuro. Recuerda una obligación más difícil: conservar la identidad sin poseerla por completo. Queda una copia accesible y un registro de los espacios que todavía no pueden reconstruirse con certeza.',
        'Huan reconoce que ninguna de las propuestas garantiza una ciudad sin conflictos. Eso no las vuelve inútiles: ahora existen modos de plantearlos sin que la primera respuesta sea inmovilizar un vínculo. Las criaturas vuelven a recorrer el patio y algunas se apartan del grupo para decidir, a su propio ritmo, qué significa el camino de regreso.'
      ]),
      step('volver', [
        'El grupo sale del Archivo Original cuando las primeras entregas de registros están preparadas. Tao comprueba sus destinos y Yun separa lo restaurado de lo que necesitará más trabajo. Mei pregunta cuántas sillas harán falta en la casa de té. El mundo no espera un discurso perfecto para volver a ocuparse de quienes lo habitan.',
        'Bao observa la torre desde la plaza sin atribuirle todas las respuestas. Las campanas permanecen en silencio por primera vez desde que comenzó el viaje. El epílogo no elegirá otro final por sorpresa: mostrará cómo las decisiones que conservaste encuentran un lugar en las primeras páginas de un Archivo que vuelve a aceptar historias abiertas.'
      ])
    ], reward: reward(25, 40, 80, 0, 0, 'vinculos_libres')
  },
  {
    id: 'primeras_paginas', code: 'E-01', chapterId: 'epilogo', title: 'Las primeras páginas', location: 'Casa de Té de Mei', kind: 'sequence',
    steps: [
      step('mesa_larga', [
        'Mei reúne varias mesas para que el regreso no se convierta en una ceremonia donde sólo quepan quienes pelearon. Tao comparte noticias de las entregas, Yun trae una copia del tejido restaurado y Ren explica qué peticiones siguen pendientes. La crónica reconocerá la victoria sin utilizarla para ocultar el trabajo que todavía necesita continuidad.',
        'Lian coloca el cuaderno en el centro y solicita revisar dos momentos del viaje. No preguntará cuál fue la opción correcta después de conocer el resultado; mostrará lo que cada decisión permitió ver y lo que dejó para otras manos. Las escenas conservarán tus elecciones, en vez de atribuirte una versión del camino que no recorriste.'
      ]),
      step('bosque', [
        'Las noticias del bosque llegan en una entrega pequeña, sin el sello de una Casa. La Guardiana Nube ha recuperado fragmentos de la canción y varias criaturas han comenzado a reconocer sus senderos. Lian deja espacio para escuchar qué ocurrió con la criatura del arroyo, una de las primeras decisiones que no necesitó derrotar a nadie para importar.',
        'Bao recuerda que ambas rutas permitieron seguir investigando. Ayudar y perseguir no fueron universos incompatibles ni excusas para castigar al jugador con un daño invisible. Cambiaron un encuentro, una pista y la manera en que alguien pudo reconocer tu presencia. La crónica conservará esa diferencia con el tamaño de una historia personal, no con una promesa de haber decidido todo el mundo.'
      ], { variants: [
        variant({ forest_choice: 'help' }, ['La criatura del arroyo se acerca a la puerta y deja unas hojas limpias junto al bastón de Bao. Reconoce a quien se detuvo cuando el rastro todavía podía perderse. No ofrece una carta como pago ni queda obligada a acompañarte: comparte una señal de gratitud y vuelve al sendero que ahora puede elegir sin la tinta sobre sus patas.']),
        variant({ forest_choice: 'pursue' }, ['Lian coloca junto al cuaderno la primera copia del sello que seguiste mientras Bao atendía a la criatura herida. Esa pista permitió reconocer una misma intención en lugares que parecían aislados. La investigadora agradece tu intuición sin atribuirte un rescate distinto; la criatura del arroyo continúa su recuperación con quienes permanecieron a su lado.'])
      ] }),
      step('rival_y_mentor', [
        'Huan trae una tablilla nueva con espacio para preguntas y no sólo para resultados. Bao entrega a Ren una relación de los documentos que ha puesto a disposición de la revisión. Los dos conservan responsabilidades propias después de acompañarte: el rival seguirá aprendiendo a escuchar y el mentor no podrá declarar cerrada por sí solo la parte de la historia que lo afecta.',
        'Lian observa que confiar no tiene por qué significar retirar una pregunta, y exigir una prueba no obliga a negar toda ayuda recibida. Las relaciones del viaje permanecen abiertas a esa diferencia. El epílogo reconoce la forma en que decidiste colaborar sin transformar un gesto amable en una absolución o una respuesta firme en una enemistad automática.'
      ], { variants: [
        variant({ bao_trust: 'question' }, ['Bao se sienta frente a las copias que pediste contrastar. Ha respondido algunas preguntas y conserva por escrito las que todavía requieren investigación independiente. Agradece que el camino continuara sin pedir que olvides el motivo de tus dudas. La mesa compartida demuestra que una confianza con límites también puede sostener una colaboración real.']),
        variant({ bao_trust: 'trust' }, ['Bao recuerda que aceptaste seguir escuchándolo cuando entregó la carpeta de las dos firmas. No utiliza esa confianza para retirar documentos de la revisión. Deja las nuevas copias en la mesa y pide que los compromisos permanezcan visibles, incluso si llega el día en que el grupo tenga motivos para preguntarle otra vez por una parte de su relato.'])
      ] }),
      step('voces_ciudad', [
        'Ren informa que las Casas ya no controlan por separado los accesos al pabellón. Algunas discusiones continúan y varias personas todavía creen que el Sello parecía una respuesta más sencilla. Mei mantiene el banco de testimonios disponible sin exigir una declaración de arrepentimiento a quien necesite acercarse. La reparación no depende de que todos describan el pasado con las mismas palabras.',
        'Puedes escoger qué página leer en voz alta durante la reunión: la ayuda que pudo organizarse sin una afiliación obligatoria o el derecho de una criatura a continuar su historia de otra manera. Las dos se conservarán. La elección identifica el primer compromiso que tu Custodio quiere recordar cuando la aventura deje de ocupar el centro de cada conversación.'
      ], { choices: [
        choice('1', 'Recordar que la comunidad admite distintas rutas', 'epilogue_page', 'community', 'Mei incorpora la página a la mesa común. Las personas sin Casa y las criaturas sin un registro completo conservarán una entrada al trabajo de reconstrucción.'),
        choice('2', 'Recordar que un vínculo conserva su elección', 'epilogue_page', 'choice', 'Lian lee la inscripción recuperada de la Primera Carta. La despedida, la reparación y la nueva amistad seguirán siendo posibilidades que ninguna victoria puede clausurar.')
      ] }),
      step('cronica', [
        'La reunión termina con una crónica que distingue hechos, recuerdos y tareas pendientes. No borra los errores para fabricar una victoria más limpia ni añade sufrimientos a las rutas que no elegiste. La historia de tu Custodio puede recorrerse de nuevo sin volver a emitir los premios que ya recibió; las identidades y los hitos de sus compañeros seguirán conservándose.',
        'Tao propone llevar una copia a la plaza para quienes no estuvieron en la casa de té. Yun revisa que los nombres puedan leerse y Bao guarda su bastón antes de ofrecerse a acompañarlo. Lian deja la última página sin cerrar: todavía falta reconocer el trabajo del viaje y decidir cómo seguir practicando lo aprendido sin convertir el final en otra obligación interminable.'
      ])
    ], reward: reward(15, 25, 60, 0, 0, 'primeras_paginas')
  },
  {
    id: 'historia_continua', code: 'E-02', chapterId: 'epilogo', title: 'La historia continúa', location: 'Plaza del Archivo', kind: 'sequence',
    titleReward: { code: 'STORY-DAWN', name: 'Custodio del Alba' },
    steps: [
      step('alba', [
        'La plaza recibe la crónica sin una barrera que separe a los Custodios por su clasificación. Los compañeros que han evolucionado conservan su identidad y quienes no lo han hecho no quedan fuera del reconocimiento. Bao recuerda el primer encuentro bajo el bambú: una carta no era una promesa de poder, sino una historia que podía continuar contigo.',
        'Ren presenta el reconocimiento de Custodio del Alba como un título del viaje, no como una autorización para decidir por otros. Las criaturas, las personas de las Casas y quienes llegaron solos han contribuido de formas diferentes. El Archivo vuelve a abrir porque pudo escuchar más de una voz, no porque haya encontrado a alguien incapaz de equivocarse.'
      ]),
      step('reconocimiento', [
        'Lian entrega una copia de la crónica y el recuerdo del Archivo Abierto. El título y el recuerdo son reconocimientos únicos de esta campaña: repetir escenas o reiniciar para pruebas no duplicará monedas, experiencia, materiales o unidades. El cierre conserva lo que ya recibiste y deja disponibles las historias opcionales que quieras completar a tu propio ritmo.',
        'Mei pregunta qué lugar debería ocupar la copia de tu Custodio. Puedes dejarla accesible para quienes empiezan o conservarla como una promesa de seguir revisando tus propias decisiones. La otra copia permanecerá en el Archivo. Ninguna respuesta borra el recorrido ni convierte a los compañeros en piezas que sólo valían mientras hacían avanzar la campaña.'
      ], { choices: [
        choice('1', 'Compartir la crónica con nuevos Custodios', 'dawn_promise', 'share', 'Tao prepara una ruta para llevar la copia a la casa de té. Quienes comiencen encontrarán una historia que admite dudas y muestra cómo pedir ayuda.'),
        choice('2', 'Conservar una página para seguir aprendiendo', 'dawn_promise', 'learn', 'Huan deja una tablilla vacía junto a tu copia. El reconocimiento no cierra las preguntas: ofrece un lugar desde el que continuar planteándolas.')
      ] }),
      step('archivo_despues', [
        'Las primeras decisiones de reconstrucción siguen el enfoque que defendiste ante la mesa de los cinco Trazos. El canon compartido no cambia: el Sello está detenido, los nombres se recuperan y los vínculos pueden continuar. Lo personal es qué compromiso quedó destacado en tu crónica y qué voces te recuerdan cuando recorres una ciudad que todavía necesita cuidados.',
        'Bao no declara que el Archivo haya aprendido su lección para siempre. Lian conserva las revisiones, Mei mantiene el banco y Ren acepta las preguntas sobre los accesos. El título del Alba señala un comienzo, no una institución terminada. Tu Custodio podrá participar en esa continuidad sin que el juego exija un clan, una rareza o un triunfo sobre otros jugadores.'
      ], { variants: [
        variant({ archive_ending: 'protected' }, ['El primer acuerdo que lleva tu firma exige una respuesta consultable y un camino de apelación. La gente empieza a reconocer tu crónica por esa insistencia en que proteger también obliga al Archivo a rendir cuentas. La puerta permanece abierta para quien necesite cuestionar una decisión tomada bajo sus propios sellos.']),
        variant({ archive_ending: 'open' }, ['La primera reunión que cita tu crónica reserva espacio a testimonios que antes no encontraban una forma de entrar. Compartir la memoria no significa publicarlo todo: cada voz conserva límites y procedencia. Las Voces Abiertas recuerdan tu decisión de ampliar quién puede participar en la historia sin adueñarse de la historia ajena.']),
        variant({ archive_ending: 'council' }, ['El primer relevo del consejo ocurre antes de que sus integrantes se acostumbren a hablar como si el puesto les perteneciera. Las Casas, las voces independientes y los testimonios de criaturas conservan formas de solicitar revisión. Tu crónica se recuerda como una insistencia en repartir responsabilidades sin repartir la ciudad en propietarios.'])
      ] }),
      step('pruebas', [
        'El Archivo ofrece tres pruebas de práctica para revisitar señales, reflejos y elecciones. Sus encuentros pueden repetirse sin convertirse en una fuente ilimitada de monedas o XP. Las historias laterales también permanecen disponibles: la canción del bosque, una entrega de Tao, el paso de Huan y una casa sin enseña que sigue necesitando manos.',
        'Nadie pide que regreses cada día para conservar el final que alcanzaste. Puedes consultar el diario, cambiar de compañero, evolucionar o compartir una criatura mediante los sistemas seguros de siempre. La campaña añade memoria a esas posibilidades sin sustituir las confirmaciones del mercado o los límites de emisión que conservan la identidad de cada unidad.'
      ]),
      step('sin_registro', [
        'Cuando la plaza empieza a vaciarse, una criatura recién llegada se detiene junto a tu Custodio y pronuncia el nombre con el que le han dado la bienvenida durante el viaje. No parece un Eco: responde con claridad a las preguntas de Lian y recuerda quién es. Sin embargo, ninguna búsqueda encuentra su origen en los registros recuperados de la Primera Carta.',
        'La criatura no sabe explicar de dónde conoce ese nombre. Bao mira el espacio que Lian había dejado abierto en la última página y evita ofrecer otra respuesta antes de escuchar. La temporada termina con el Archivo restaurado y una pregunta nueva: qué lugar corresponde a las historias que siempre existieron, aunque nadie hubiera aprendido todavía a registrarlas.'
      ])
    ], reward: reward(25, 35, 80, 0, 0, 'archivo_abierto')
  }
];

// Chapter bosses close their missions so combat rewards always use the winning
// frozen expedition. The short aftermath is displayed with the victory result.
for (const id of ['centinela_espejo', 'campana_conflicto']) {
  const mission = SEASON_MISSIONS.find(mission => mission.id === id);
  const combatIndex = mission.steps.findIndex(step => step.encounterId);
  const aftermath = mission.steps.splice(combatIndex + 1);
  mission.completionScene = aftermath.flatMap(step => step.scene);
  const combat = mission.steps.pop();
  mission.steps.push(step('revisar_senales', [
    'Antes de entrar, Lian vuelve a señalar el patrón que habéis identificado y separa lo comprobado de las suposiciones. El enemigo anunciará sus cambios y conservará una respuesta que pueda entenderse desde el propio combate. Las notas sirven para preparar una decisión, no para prometer que un nivel o una rareza permitirán ignorar todas sus señales.',
    'Huan revisa las salidas y pide comprobar qué compañero está preparado para comenzar. Si el intento termina en derrota, esta conversación y el diario seguirán disponibles. No habrá que reconstruir todo el capítulo ni entregar otra carta para reintentar; el reto será utilizar lo aprendido sin convertir la repetición en una fuente de premios adicionales.'
  ]), step('compromiso_del_equipo', [
    'Bao recuerda el motivo de la prueba: recuperar una parte de la memoria común sin repetir la idea de que vencer concede un derecho absoluto sobre ella. Las criaturas toman posición con sus nombres, rasgos e historias conservados. Su identidad no será reemplazada por el resultado, aunque una victoria añada otro hito al camino que siguen recorriendo.',
    'El grupo deja de discutir para que el aviso del enemigo pueda ocupar el centro de la siguiente página. Lian guardará la información del encuentro y Ren o Huan mantendrán el acceso necesario para retirarse. Lo que viene puede exigir más de un intento; la dificultad se sostendrá en sus señales y en tus respuestas, no en un castigo oculto por haber llegado hasta aquí.'
  ]), combat);
}

// Four readable gates recall the first four Traces. Incorrect answers stay on
// their page with a concrete clue; they never consume rewards or restart a run.
const gates = [
  step('portal_memoria', [
    'La primera placa muestra el sendero del bosque y un nombre al que le faltan varias sílabas. Su pregunta dice: «¿Qué protegimos al devolver una voz?». El Primer Trazo recuerda a una criatura que pudo responder por sí misma cuando la tinta dejó de imponerle una orden. El diario conserva ese encuentro junto a las pistas de Nube.',
    'Bao pide distinguir una identidad de una victoria. El Guardián no se convirtió en un trofeo ni quedó obligado a agradecer el rescate acompañando al grupo. La puerta solicita reconocer qué volvió a ser posible para él. Si una respuesta parece hablar sólo del poder ganado por el Custodio, conviene volver a leer a quién pertenece el nombre.'
  ], { requiredChoice: '2', choices: [
    choice('1', 'La autoridad del vencedor sobre la criatura', 'gate_memory', 'victor', 'La placa sigue cerrada: vencer no convirtió al Guardián en un trofeo. Revisa quién recuperó su voz en el bosque.'),
    choice('2', 'La identidad y la posibilidad de responder', 'gate_memory', 'identity', 'La primera placa se abre. El nombre recuperado pertenece a quien puede responder y continuar su propia historia.'),
    choice('3', 'El derecho a repetir el mismo vínculo', 'gate_memory', 'repeat', 'La placa sigue cerrada: recuperar la memoria no obliga a conservar para siempre una misma relación. Busca qué devolvió la salida de la tinta.')
  ] }),
  step('portal_autenticidad', [
    'La segunda placa presenta una carta de aspecto perfecto junto a un registro con reparaciones visibles. Pregunta: «¿Qué permite reconocer una historia auténtica?». El Segundo Trazo procede del mercado, donde una promesa de fuerza ocultaba que nadie podía identificar a la criatura ni explicar cómo había llegado hasta el puesto.',
    'Lian recuerda que una imagen impecable puede copiarse y que un registro incompleto puede investigarse sin fingir una certeza que no existe. La puerta busca una forma de contrastar procedencia, identidad y recorrido. No solicita escoger la carta más rara: pide una razón que pueda revisarse aunque el vendedor insista en que su oferta parece extraordinaria.'
  ], { requiredChoice: '1', choices: [
    choice('1', 'Una procedencia e historia que puedan comprobarse', 'gate_authenticity', 'history', 'La segunda placa reconoce el recorrido verificable. La copia de una apariencia no reemplaza la identidad de una unidad.'),
    choice('2', 'Una ilustración sin marcas ni reparaciones', 'gate_authenticity', 'appearance', 'La placa no se abre: el puesto sin nombre también parecía perfecto. Revisa qué no podía demostrar aquella oferta.'),
    choice('3', 'La promesa de ser más poderosa que las demás', 'gate_authenticity', 'power', 'La placa sigue cerrada: prometer poder no acredita un vínculo. La pista está en lo que Lian pudo investigar sobre el origen.')
  ] }),
  step('portal_eleccion', [
    'La tercera placa reproduce la frase del Centinela con una palabra ausente: «Un vínculo sin ___ no es un vínculo». El Tercer Trazo la conservó después de una prueba que exigía cambiar de respuesta. Bao pide recordar también la pregunta difícil: qué ocurre cuando una criatura quiere apartarse de alguien que cree haberla cuidado bien.',
    'Huan reconoce que aceptar la voluntad de otro resulta más sencillo cuando coincide con la propia. La inscripción se refiere a la posibilidad de continuar o despedirse, incluso si el Custodio preferiría una respuesta distinta. No ofrece una victoria eterna ni una afinidad obligatoria; pide el principio que el Sello eliminaría al inmovilizar todas las relaciones.'
  ], { requiredChoice: '3', choices: [
    choice('1', 'Victoria', 'gate_choice', 'victory', 'La palabra no encaja: ganar no define si un vínculo es justo. Consulta la inscripción que dejó el Centinela.'),
    choice('2', 'Permanencia', 'gate_choice', 'permanence', 'La placa permanece cerrada: el Sello ofrece permanencia incluso contra la voluntad de una criatura. Esa no era la enseñanza del Tercer Trazo.'),
    choice('3', 'Elección', 'gate_choice', 'choice', 'La frase se completa y la tercera placa se abre. Una historia conserva su vínculo mientras pueda continuar con una voz propia.')
  ] }),
  step('portal_comunidad', [
    'La cuarta placa muestra dos estandartes y una puerta sin enseña. Pregunta: «¿A quién pertenece la posibilidad de recibir ayuda?». El Cuarto Trazo apareció cuando las Casas dejaron de alimentar una campana que convertía cada discusión en otra amenaza. El diario recuerda el pabellón compartido y la ruta equivalente de quienes llegaron solos.',
    'Ren había reconocido el trabajo de las asociaciones y de Custodios independientes sin pedirles un mismo nombre. La placa no exige renunciar a una Casa para cooperar ni pertenecer a una para merecer entrada. Busca la regla que permitió proteger a la plaza antes de decidir quién debía llevar el reconocimiento por hacerlo.'
  ], { requiredChoice: '2', choices: [
    choice('1', 'Sólo a quienes llevan la enseña mayoritaria', 'gate_community', 'majority', 'La última placa sigue cerrada: el pabellón no pedía una afiliación para atender a alguien. Revisa quiénes pudieron participar.'),
    choice('2', 'A la comunidad, incluidas sus rutas independientes', 'gate_community', 'community', 'La cuarta placa se abre. La cooperación no convierte a las personas que juegan solas en invitadas de segunda categoría.'),
    choice('3', 'Sólo al grupo que venció a la Campana', 'gate_community', 'victors', 'La placa no acepta la respuesta: la ayuda no fue un premio exclusivo para combatientes. Recuerda las tareas de Mei, Tao y Yun.')
  ] })
];
SEASON_MISSIONS.find(mission => mission.id === 'puertas_archivo').steps.splice(2, 0, ...gates);

export const SIDE_MISSIONS = [
  {
    id: 'sonidos_perdidos', code: 'I-A', chapterId: 'bosque', title: 'Los sonidos perdidos', location: 'Sendero de la Canción', kind: 'sequence', afterMissionId: 'guardian_marchito',
    steps: [
      step('primera_nota', [
        'La Guardiana Nube reconoce el comienzo de una canción y deja de escucharla al llegar al arroyo. No solicita capturar una criatura que pueda cantarla por obligación: pide encontrar las señales que permitían al bosque responder. Lian conserva tres espacios vacíos para notas que tendrán que escucharse en lugares distintos.',
        'Una hoja doblada guarda el primer ritmo entre los golpes del agua y la piedra. Puedes registrarlo por escrito o repetirlo con cuidado para que Nube lo contraste. Lian deja espacio entre las notas: la canción todavía necesita una respuesta del bosque y no conviene llenar cada pausa con lo que el grupo espera encontrar.'
      ], { choices: [
        choice('1', 'Anotar el ritmo junto al arroyo', 'forest_song_method', 'write', 'Lian identifica dónde se escucha cada golpe. La copia permitirá volver a contrastar la canción si otra parte de la memoria se pierde.'),
        choice('2', 'Repetir el ritmo y escuchar la respuesta', 'forest_song_method', 'listen', 'Nube completa una pausa que faltaba. La canción se reconstruye mediante una respuesta compartida y no sólo mediante lo que el cuaderno esperaba encontrar.')
      ] }),
      step('segunda_nota', [
        'La segunda nota aparece en un bambú que aún conserva tinta sobre el nudo. Un Eco de Tinta impide acercarse mientras confunde cada movimiento con un intento de arrancar su nombre. Bao despeja una salida y recuerda que detenerlo no significa reclamarlo como premio ni decidir su siguiente Custodio.',
        'El encuentro anuncia su carga antes de descargarla y deja una apertura después. Las señales ya son conocidas, pero siguen exigiendo una respuesta del equipo. Nube mantiene a las criaturas pequeñas lejos del sendero mientras Bao sostiene una salida hacia el agua; detener la amenaza no debe cerrar el camino por el que podrá retirarse cuando vuelva a reconocerse.'
      ], { encounterId: 'I03' }),
      step('tercera_nota', [
        'Al disiparse la tinta, el bambú devuelve una vibración corta y el Eco puede apartarse del sendero. La tercera nota no estaba oculta detrás de otra batalla: aparece cuando el grupo deja de llenar la pausa con sus propias instrucciones. Nube reconoce el espacio que necesitaba escuchar y solicita repetir la secuencia completa.',
        'Lian compara las tres procedencias antes de unirlas. La nota del arroyo, la del bambú y la pausa final conservarán su lugar en el recuerdo, para que una copia no termine presentándose como la única voz legítima del bosque. Bao permite que la criatura se marche sin exigir una demostración de gratitud.'
      ]),
      step('cancion', [
        'Nube canta las tres partes y se detiene a esperar. Otras voces responden desde senderos donde antes sólo se oía el agua; algunas continúan una melodía diferente. El bosque no recupera un sonido único impuesto a todos. Recupera la posibilidad de reconocer, responder y cambiar una canción sin que la tinta convierta la diferencia en silencio.',
        'La investigadora entrega una copia al refugio y conserva otra para el diario. Nube propone volver a escuchar desde el arroyo cuando cambie la estación, porque una canción viva no necesita sonar siempre igual para conservar su historia. Bao recoge la hoja doblada y deja el lugar como lo encontró, con agua suficiente para que otras voces alcancen la piedra.'
      ])
    ], reward: reward(15, 10, 35, 1, 0, 'cancion_del_bosque')
  },
  {
    id: 'paquete_tao', code: 'II-A', chapterId: 'mercado', title: 'El paquete de Tao', location: 'Ruta de las Tres Puertas', kind: 'sequence', afterMissionId: 'mercader_sin_rostro',
    steps: [
      step('entrega', [
        'Tao encuentra un registro entre los paquetes que el Mercader había marcado como mercancía sin destinatario. La dirección conserva sólo una parte del nombre y una referencia a un taller que cambió de lugar. El mensajero quiere completar la entrega sin publicar el contenido de una carta que nadie le dio permiso para leer en voz alta.',
        'Lian propone dos fuentes accesibles: una copia pública de las rutas y los comerciantes que conocieron el antiguo taller. Puedes escoger cuál consultar primero. Tao conoce el peso y la forma del paquete, pero no el rostro de su destinataria; para encontrarla tendrá que aprender algo que ninguna carrera entre puestos puede resolver por sí sola.'
      ], { choices: [
        choice('1', 'Consultar las rutas públicas de entrega', 'tao_route', 'records', 'Tao encuentra la fecha del traslado y conserva el registro de dónde obtuvo la información. La dirección puede actualizarse sin abrir el contenido privado.'),
        choice('2', 'Preguntar a los comerciantes del taller', 'tao_route', 'neighbors', 'Mei presenta a una vecina que recuerda el traslado. Lian anota su testimonio y Tao solicita permiso antes de utilizarlo para identificar a la destinataria.')
      ] }),
      step('puerta_equivocada', [
        'La primera puerta pertenece a otra persona que comparte parte del nombre. Tao reconoce la coincidencia y evita entregar el registro sólo para dar la ruta por terminada. La vecina indica qué datos pueden comprobarse sin invadir el contenido y recuerda que un error de identificación puede separar una historia de quien todavía quiere conservarla.',
        'Huan revisa el mapa mientras Lian distingue la información confirmada de una suposición. No hará falta un combate para demostrar que el mensajero tiene razón. El grupo retrocede hasta el cruce y pregunta de nuevo; corregir una entrega a tiempo tiene aquí más valor que terminar primero una ruta que llevará la carta a una persona equivocada.'
      ]),
      step('destinataria', [
        'La segunda dirección conserva una señal del antiguo taller bajo la pintura nueva. Su propietaria reconoce el embalaje y solicita comprobar la entrega en un espacio tranquilo. Tao muestra lo que pudo verificar y deja que ella decida cuánto quiere explicar. La historia continúa sin convertir la llegada del protagonista en un derecho a conocer todos sus detalles.',
        'La destinataria conserva el registro de una criatura que eligió marcharse años atrás. No pide recuperarla como si el documento la obligara a regresar. Quiere que su paso por el taller no desaparezca de los nombres que la ciudad recuerda. Lian comprende por qué una entrega pequeña también forma parte de la restauración del Archivo.'
      ]),
      step('recibo', [
        'Tao conserva una constancia de entrega con la información necesaria y deja el resto bajo cuidado de su destinataria. La ruta puede enseñarse a nuevos mensajeros sin exhibir la carta privada. Mei recibe una noticia sencilla: el paquete que parecía no pertenecer a nadie encontró a quien podía decidir cómo continuar su memoria.',
        'Mei deja una taza junto a la puerta cuando Tao regresa. El mensajero solicita una hoja nueva para registrar la ruta corregida y se detiene antes de atribuirse toda la historia que acaba de conocer. Su entrega terminó donde debía: en manos de alguien que pudo decidir qué parte conservar, compartir o guardar para una conversación que todavía no había llegado.'
      ])
    ], reward: reward(15, 10, 35, 1, 0, 'entrega_de_tao')
  },
  {
    id: 'paso_huan', code: 'III-A', chapterId: 'montanas', title: 'El paso de Huan', location: 'Desvío de la Montaña', kind: 'sequence', afterMissionId: 'centinela_espejo',
    steps: [
      step('ausencia', [
        'Huan vuelve al pabellón para buscar una criatura que se apartó del grupo durante el descenso. Sus primeras indicaciones suenan como otra orden de entrenamiento, pero la compañera no responde. El rival admite que la vio detenerse antes y decidió interpretar el gesto como cansancio, sin preguntar qué necesitaba del camino.',
        'Huan conserva la tablilla de los ejercicios junto al pecho y deja de añadir órdenes que nadie está escuchando. Lian aconseja empezar por las señales que dejó la criatura, en vez de recorrer sólo los lugares que él había decidido que debía preferir. La búsqueda comienza cuando el rival acepta mirar el camino desde una perspectiva que todavía desconoce.'
      ]),
      step('rastro', [
        'Las huellas terminan junto a un claro desde el que se ve el puente del primer duelo. Bao identifica un lugar de descanso y sugiere mantener una ruta libre hacia la montaña. Huan quiere acercarse deprisa para demostrar que puede arreglar la ausencia con la misma fuerza con que suele resolver sus ejercicios.',
        'Puedes proponer esperar a una distancia visible o llamarla desde el sendero sin cerrar sus salidas. Huan necesita escoger un gesto que la criatura pueda entender sin convertirse en otra orden. Bao se queda junto al cruce y Lian aparta las ramas que ocultaban el acceso; la búsqueda deja de avanzar sobre ella y empieza a ofrecerle un camino de regreso.'
      ], { choices: [
        choice('1', 'Esperar cerca sin invadir el claro', 'huan_rescue_style', 'space', 'Huan deja una tablilla y se aparta de su trayectoria. La criatura puede acercarse sin atravesar otra orden.'),
        choice('2', 'Llamarla desde una salida abierta', 'huan_rescue_style', 'call', 'Huan pronuncia su nombre una vez y mantiene libre el sendero. Su voz ofrece una referencia en lugar de exigir una respuesta inmediata.')
      ] }),
      step('encuentro', [
        'La criatura sale cuando Huan deja de avanzar hacia ella y reconoce el gesto con el que solían terminar un entrenamiento. No ha olvidado todo ni estaba preparando una traición. Necesitaba separarse del ruido y comprobar que podía regresar sin que su ausencia se convirtiera en una lección sobre obediencia.',
        'Huan reconoce que cuidar también exige interpretar una respuesta que no se parece a un ataque o una defensa. Agradece tu ayuda sin prometer que no volverá a equivocarse. Lian conserva el encuentro como una prueba de que el rival puede cambiar sus hábitos cuando alguien le muestra una situación que sus tablillas no habían previsto.'
      ]),
      step('regreso', [
        'En el regreso, Huan adapta el ritmo a la criatura que acaba de encontrar y pregunta antes de iniciar otro ejercicio. La ayuda tendrá una consecuencia visible cuando deba decidir cómo acompañarte a la sala del Archivista: podrá recordar que respetaste un vínculo incluso cuando no había un público que contara puntos por hacerlo.',
        'El rival guarda la tablilla con una nota sobre la pregunta que no hizo al comenzar el descenso. La criatura camina cerca sin perder el espacio que acaba de recuperar. Al llegar al pabellón, Huan propone escuchar antes de reanudar los ejercicios: no quiere olvidar que una búsqueda puede terminar bien sin demostrar que siempre tuvo razón sobre el camino.'
      ])
    ], reward: reward(20, 15, 45, 1, 0, 'paso_compartido')
  },
  {
    id: 'casa_sin_ensena', code: 'IV-A', chapterId: 'casas', title: 'La casa sin enseña', location: 'Patio de las Puertas Abiertas', kind: 'sequence', afterMissionId: 'campana_conflicto',
    steps: [
      step('sin_estandarte', [
        'En una calle próxima al pabellón, varios Custodios independientes han abierto un refugio sin colocar el estandarte de una Casa. Ren reconoce su ayuda durante la evacuación y les pide explicar qué rutas quedaron fuera del acuerdo. Nadie tendrá que afiliarse para que una petición de seguridad sea considerada parte de la ciudad.',
        'Mei encuentra espacio para guardar provisiones y Yun señala una pared adecuada para las copias. El problema más urgente es orientar a quienes llegan sin conocer los símbolos de las Casas. Puedes comenzar por una señal accesible de entrada o por un registro breve de las necesidades del patio; las dos tareas acabarán formando parte del refugio.'
      ], { choices: [
        choice('1', 'Preparar señales claras para llegar', 'independent_house', 'access', 'Tao dibuja rutas que no dependen de reconocer una enseña. Los primeros visitantes pueden encontrar ayuda sin explicar a qué grupo pertenecen.'),
        choice('2', 'Escuchar primero las necesidades del patio', 'independent_house', 'listen', 'Mei coordina una ronda de testimonios y Yun conserva lo necesario para responder. El refugio comienza por lo que falta, no por lo que una Casa quiere exhibir como aporte.')
      ] }),
      step('organizar', [
        'Las rutas y las peticiones muestran que varias personas necesitan un lugar al que puedan regresar aunque cambie su asociación. Ren revisa las condiciones del acuerdo para que el refugio no dependa de la buena voluntad de una sola representante. La independencia deja de ser una excepción tolerada y se convierte en una forma reconocida de participar.',
        'Huan ayuda a mover las mesas sin colocar su nombre sobre la puerta. Bao pregunta cómo se revisará una queja contra el propio refugio y Lian añade una vía de consulta al registro. Un espacio abierto también puede equivocarse; por eso su promesa de ayudar necesita una manera de escuchar que alguien no recibió lo que esperaba.'
      ]),
      step('primera_visita', [
        'La primera persona que llega conserva el símbolo del Sello entre sus pertenencias. Mei ofrece un asiento y distingue entre solicitar ayuda y repetir una amenaza contra otras criaturas. El refugio no exigirá una afiliación correcta ni una explicación pública de todo el pasado de quien necesite agua y una ruta segura para continuar.',
        'Lian registra sólo la información necesaria para atender la petición. La escena no declara terminadas las diferencias con los seguidores del Archivista: muestra que la ayuda básica puede mantenerse mientras una comunidad investiga responsabilidades y decide cómo prevenir un daño. Las dos tareas necesitan límites, atención y personas dispuestas a seguir respondiendo.'
      ]),
      step('puerta', [
        'Cuando termina el trabajo, el patio conserva una puerta sin enseña y una lista accesible de tareas compartidas. Ren incorpora su ruta a la organización de la plaza sin convertirlo en propiedad de una Casa. Tao comprueba que las indicaciones siguen pudiendo leerse desde la calle y Yun deja material para corregirlas si cambian las necesidades.',
        'Mei deja la llave a disposición de varios responsables y pide que nadie la conserve como si fuera una insignia. El patio tiene por fin una manera de recibir a quienes no saben dónde preguntar. Su historia continuará con necesidades pequeñas y nombres nuevos; por hoy, una persona que llegó sin enseña encontró una puerta que no le pidió inventarse una para entrar.'
      ])
    ], reward: reward(20, 15, 45, 1, 0, 'casa_sin_ensena')
  }
];

export const ARCHIVE_TRIALS = [
  { id: 'archivo_raices', number: 1, title: 'Lectura de raíces', encounterId: 'TRIAL1', scene: [
    'El Archivo prepara una prueba que recuerda la defensa del bosque. Sus barreras y sus cargas vuelven a anunciarse antes de exigir una respuesta. Puedes practicar con compañeros distintos y retirarte sin perder la conclusión de la campaña; ninguna repetición producirá monedas, experiencia o materiales adicionales.',
    'La primera finalización conservará un reconocimiento narrativo y las siguientes seguirán disponibles como práctica. No se emiten criaturas nuevas ni se altera el resultado del Guardián Marchito en la crónica. Leer señales y defender cuando corresponde vuelve a ser la tarea, con la libertad de ensayar otra forma de resolverla.'
  ], memory: 'prueba_raices' },
  { id: 'archivo_reflejos', number: 2, title: 'Respuestas distintas', encounterId: 'TRIAL2', scene: [
    'La segunda prueba retoma los reflejos de la montaña. El Archivo no te pide repetir la misma composición que ganó la campaña: ofrece un lugar para comprobar si otras herramientas pueden responder al patrón. El registro de práctica conserva sus intentos sin transformar cada victoria en otro premio económico.',
    'Las cartas mantienen su identidad, propietario y evolución al entrar y salir. La dificultad reside en observar y variar una respuesta cuando el reflejo empieza a devolverla. El reconocimiento de primera vez es único; practicar después no añade XP o monedas ni exige mantener una racha para conservar el título obtenido en el epílogo.'
  ], memory: 'prueba_reflejos' },
  { id: 'archivo_eleccion', number: 3, title: 'Custodia en práctica', encounterId: 'TRIAL3', scene: [
    'La última prueba reúne señales del Sello sin reconstruir el dispositivo que amenazó al Archivo. Las fases se anuncian y permiten practicar decisiones de protección con un equipo real. La simulación no puede inmovilizar un vínculo ni convertir una carta del jugador en un precio narrativo para acceder a su final.',
    'Puedes repetir el encuentro por el desafío, consultar el diario o marcharte a otro modo sin perder progreso. El Archivo conserva una sola memoria de primera superación y ninguna recompensa repetida de XP, monedas o materiales. La práctica continúa como una posibilidad del mundo, no como otra obligación diaria para sostener la victoria de la temporada.'
  ], memory: 'prueba_eleccion' }
];

// Small callbacks keep recorded choices useful without creating incompatible
// timelines. Each page appends only its first matching variant.
const callbacks = [
  ['centinela_espejo', 'revisar_senales', 'sentinel_lesson', [
    ['adapt', 'Lian recupera la lección que elegiste: una respuesta puede cambiar sin que el equipo pierda su identidad. Coloca en la misma página el aviso del Centinela y el momento en que deja una apertura. Huan reconoce que variar la estrategia no consiste en ejecutar movimientos distintos sin mirar qué problema necesita resolver cada uno.'],
    ['protect', 'Huan vuelve al aviso de defensa que decidiste mantener visible. La oportunidad de responder dependerá de que el equipo siga preparado después de la copia. Bao pide recordar esa prioridad cuando una habilidad parezca capaz de terminar la prueba inmediatamente: una promesa de daño no elimina el golpe que el enemigo ya está anunciando.']
  ]],
  ['campana_conflicto', 'compromiso_del_equipo', 'house_pact', [
    ['shared', 'Ren confirma que las Casas mantienen las tareas comunes que propusiste antes de entrar. Los accesos siguen bajo cuidado de grupos distintos y ninguna enseña ocupa todo el pabellón. La cooperación continuará siendo visible incluso durante una pelea en la que el ruido intenta convencer a cada representante de que sólo su propia gente puede protegerla.'],
    ['rotating', 'Lian comprueba el primer relevo del acuerdo que defendiste. Una Casa cede la vigilancia del acceso mientras la otra conserva sus anotaciones, y Ren revisa que el cambio no cierre ninguna ruta. La rotación convierte una promesa de equilibrio en un gesto que puede observarse y reclamarse si alguien intenta retener el puesto.']
  ]],
  ['destino_sello', 'detenido', 'seal_answer', [
    ['voice', 'La visitante del banco recuerda la respuesta que destacaste sobre la voz de las criaturas y solicita que puedan revisar también el acuerdo nuevo. Lian reserva un espacio para sus testimonios sin pedir que se adapten primero al formulario de los antiguos protectores. La reconstrucción empieza a escuchar a quienes tendrán que vivir con sus reglas.'],
    ['accountability', 'Ren incorpora al acuerdo la exigencia de responsabilidad que planteaste en el banco. Las peticiones conservarán una ruta de consulta y las oficinas no podrán considerarlas resueltas sólo por haber cambiado de nombre. Bao entrega su carpeta para que esa obligación alcance también a quienes ayudaron a detener la crisis.']
  ]],
  ['puertas_archivo', 'contrapeso', 'archive_gate', [
    ['identity', 'Comenzaste por los nombres y la voz, así que Huan completa ahora la parte sobre responsabilidad. La puerta termina de moverse cuando ambas lecturas permanecen juntas. Proteger una identidad necesita cuidados concretos y esos cuidados deben seguir reconociendo a quien puede aceptar, cuestionar o abandonar un vínculo.'],
    ['responsibility', 'Comenzaste por el deber de cuidar, así que Lian completa ahora la parte sobre identidad y elección. El mecanismo responde cuando las dos ideas dejan de competir por ocupar toda la inscripción. Reparar una pérdida no concede el derecho a escribir de antemano cada relación que una criatura podrá tener después.']
  ]],
  ['guardianes_olvidados', 'liberacion', 'forgotten_echoes', [
    ['help', 'Una de las criaturas que acompañaste hasta el acceso reconoce tu señal cuando la galería queda libre. Se acerca lo suficiente para comprobar la ruta y vuelve con quienes aún necesitan orientación. La prioridad de ayudar dejó una experiencia compartida que podrá recordarse sin exigir que la criatura te acompañe fuera de este lugar.'],
    ['focus', 'Lian te muestra el paso que Huan mantuvo abierto mientras te concentrabas en el dispositivo. La rapidez de esa búsqueda permitió separar la tinta del acceso y reconocer la orden que retenía al Eco. La crónica conserva ese trabajo sin atribuirte las conversaciones que tus compañeros sostuvieron junto a la salida.']
  ]],
  ['ultimo_nombre', 'combate', 'archivist_answer', [
    ['choice', 'Bao mantiene abierta la salida que señalaste al defender la elección. La criatura que necesite apartarse no encontrará una orden que la obligue a demostrar su gratitud quedándose. El Archivista observa ese espacio y vuelve a concentrar el Sello; la diferencia entre cuidar y retener tendrá que sostenerse mientras la sala cambia de fase.'],
    ['repair', 'Lian coloca a resguardo las peticiones que utilizaste para exigir reparación. El grupo no necesita destruir las pruebas del daño para detener el mecanismo que pretende justificar con ellas. Bao confirma que también entregará sus propias copias cuando termine el encuentro y la investigación deje de depender de esta conversación.']
  ]],
  ['tres_reflejos', 'lectura', 'reflection_focus', [
    ['damage', 'Lian vuelve a la columna de aperturas que elegiste observar. El registro muestra que un golpe llegó a ser útil porque otro turno sostuvo al equipo, no porque la criatura intentara atacar con la misma fuerza cada vez. Huan añade esa relación a su tablilla y deja de separar el daño del momento en que pudo producirse.'],
    ['defense', 'Huan reconoce en el registro la prioridad que elegiste antes de entrar: sostener al equipo permitió que hubiera una respuesta después del golpe. No trata la defensa como una ausencia de valor; señala el turno concreto en que una decisión menos vistosa conservó la oportunidad de completar el encuentro.'],
    ['support', 'Bao repasa la habilidad que reservaste para observar el apoyo. Lian conecta su recarga con la apertura posterior y muestra que una herramienta puede ayudar incluso durante los turnos en que se decide no gastarla. El reflejo conserva la secuencia completa, no sólo la imagen más brillante del último ataque.']
  ]],
  ['dos_estandartes', 'primera_version', 'house_order', [
    ['courtyard', 'La Casa del Patio agradece que hayas comenzado por sus entregas pendientes y acepta colocar sus copias junto a las de la otra parte. Ren recuerda el compromiso de dar el mismo tiempo a sus vecinos. Escuchar primero no concederá a esa versión una autoridad que no pueda revisarse cuando aparezca información nueva.'],
    ['path', 'La Casa del Sendero coloca sus listas incompletas sobre la mesa que elegiste visitar primero. Lian solicita conservar sus dudas junto a las copias y anuncia cuándo se escuchará a la otra Casa. El orden permite empezar una conversación; no convierte a los primeros testigos en propietarios de toda la explicación.']
  ]],
  ['pactos_bambu', 'pabellon', 'house_bridge', [
    ['testimony', 'La mesa de testimonios que ayudaste a organizar conserva las primeras solicitudes recibidas durante el cierre. Ahora Lian puede mostrar qué necesita el nuevo pabellón y a quién le falta una respuesta. El acuerdo empieza a construir una continuidad entre escuchar una petición y comprobar que alguien se ha encargado de atenderla.'],
    ['access', 'El grupo mixto que organizaste mantiene libre el acceso por el que llegan las herramientas del pabellón. Huan reconoce a integrantes de ambas Casas trabajando en la misma ruta y solicita que sus relevos queden registrados. La tarea concreta ofrece un punto de partida para cooperar sin exigir que todos compartan una misma versión del conflicto.']
  ]],
  ['voces_sello', 'decantar', 'pavilion_rule', [
    ['response', 'Ren aplica la regla que destacaste en el pabellón: cada petición conserva una persona responsable y una manera de volver a preguntar. La visitante puede consultar lo que ocurra después sin tener que empezar de nuevo su relato ante cada puerta. El acuerdo comienza a medirse por una respuesta que todavía deberá sostenerse.'],
    ['review', 'Yun aplica la regla que elegiste para el pabellón y añade un espacio donde la visitante pueda corregir la copia de su testimonio. Lian conserva ambas versiones con su contexto. El registro deja de presentarse como una conclusión cerrada y empieza a ofrecer una manera de que la propia fuente explique qué parte no fue entendida.']
  ]],
  ['ultimo_nombre', 'respuesta', 'seal_voices', [
    ['listen', 'Lian puede nombrar los casos que escuchaste en el banco sin convertir a sus protagonistas en argumentos que le pertenecen. El Archivista reconoce las peticiones y descubre que el grupo no necesita negarlas para cuestionar su método. Bao vuelve a señalar que quienes sufrieron un vínculo injusto también necesitan conservar una salida.'],
    ['ignore', 'El Archivista pregunta si el grupo conoce las peticiones que llegaron al banco. Ren había conservado las copias, pero tu Custodio no escuchó aquellos relatos completos. Lian admite ese límite en vez de inventar una conversación; la crítica al Sello sigue siendo válida y la tarea de escuchar permanece pendiente.']
  ]],
  ['juicio_huan', 'ayuda', 'huan_argument', [
    ['rules', 'Huan repite tu argumento sobre reglas revisables y solicita dejar por escrito quién comprobará las salidas después. Una garantía no dependerá sólo de que el guardián de turno recuerde una promesa. El rival transforma la discusión en una tarea que otra persona podrá contrastar cuando el grupo ya no esté delante de la puerta.'],
    ['voice', 'Huan repite la idea de conservar una voz propia y consulta a su compañero antes de elegir dónde situarse. El gesto no resuelve todo el conflicto, pero muestra que ha entendido una parte del argumento que defendiste. La criatura toma posición cerca de una salida abierta, con espacio para apartarse si el ruido vuelve a impedirle responder.'],
    ['shared', 'Huan recoge tu argumento sobre responsabilidades repartidas y pide que Bao y Lian revisen con él las señales de retirada. Ninguno conservará una explicación que los demás no puedan consultar. La colaboración permite sostener distintas tareas sin que la persona más segura de sí misma se convierta por ello en dueña de todas las decisiones.']
  ]],
  ['destino_sello', 'primera_carta', 'bao_repair', [
    ['witness', 'Bao cumple el compromiso de permanecer como testigo y entrega una relación de las preguntas que todavía debe responder. No habla en nombre de todas las personas perjudicadas ni considera que acompañar la victoria haya cerrado sus responsabilidades. Lian conserva la lista junto a las copias que permitirán seguir contrastando su relato.'],
    ['review', 'Bao entrega sus copias a la revisión independiente que le pediste antes del corredor. Ren registra su procedencia y Yun conserva los documentos sin permitir que el mentor decida qué parte puede consultarse por resultar cómoda. El proceso continuará cuando el grupo deje de compartir una misma mesa y la urgencia ya no explique los aplazamientos.']
  ]],
  ['historia_continua', 'alba', 'epilogue_page', [
    ['community', 'Mei ha colocado junto a la crónica la página que elegiste leer sobre las rutas de la comunidad. Tao comprueba que pueda encontrarse desde la entrada y Ren la incorpora al acuerdo del pabellón. Las personas que llegaron sin una Casa reconocen allí una ayuda que no les exigió convertirse en alguien distinto para recibirla.'],
    ['choice', 'Lian conserva abierta la página que leíste sobre la elección de los vínculos. Varias criaturas se detienen a escuchar y otras siguen su camino por la plaza; ninguna respuesta se interpreta como una falta de gratitud. El reconocimiento comienza respetando la misma posibilidad de continuar que la crónica quería defender.']
  ]],
  ['historia_continua', 'sin_registro', 'dawn_promise', [
    ['share', 'Tao sale de la plaza con la copia que decidiste compartir y se detiene al escuchar el nombre pronunciado por la criatura desconocida. Mira las hojas que lleva bajo el brazo: la primera persona que encuentre esa crónica también encontrará una página abierta. La nueva pregunta viajará junto a una historia que no finge haber explicado todo el mundo.'],
    ['learn', 'Huan señala la tablilla vacía que dejaste junto a tu copia. La criatura desconocida ha traído una pregunta antes de que el Archivo pudiera felicitarse por conservar todas las respuestas. Bao propone utilizar ese espacio sin apresurarse a llenarlo: aprender también consiste en reconocer una historia cuando todavía no se sabe dónde empieza.']
  ]],
  ['sonidos_perdidos', 'cancion', 'forest_song_method', [
    ['write', 'La copia que decidiste escribir conserva las tres procedencias junto a las pausas que Nube completó después. Lian la entrega sin llamarla versión definitiva y deja espacio para nuevas voces. El cuaderno permite regresar al arroyo para comprobar una memoria, en vez de utilizar lo escrito como una razón para no volver a escuchar.'],
    ['listen', 'Nube repite el ritmo que ofreciste al comienzo y espera la respuesta del agua. La canción del bosque añade una pausa distinta, como si reconociera la pregunta sin quedar obligada a devolver siempre el mismo sonido. Lian registra esa conversación entre voces con la atención que antes reservaba a las inscripciones más antiguas.']
  ]],
  ['paquete_tao', 'destinataria', 'tao_route', [
    ['records', 'La fecha del traslado que encontraste en las rutas públicas permite a Tao explicar por qué llegó hasta esta puerta. La destinataria corrige un detalle del mapa y solicita que se conserve la rectificación. El registro resulta útil precisamente porque puede contrastarse con quien conoce la historia que intenta representar.'],
    ['neighbors', 'La destinataria reconoce el nombre de la vecina que orientó la búsqueda y pide que Tao le agradezca la ayuda sin contarle el contenido de la carta. Lian conserva el permiso junto a la procedencia del testimonio. La información compartida encontró su límite sin dejar de servir para resolver la entrega.']
  ]],
  ['paso_huan', 'encuentro', 'huan_rescue_style', [
    ['space', 'La tablilla que Huan dejó a una distancia prudente sigue sobre la hierba cuando la criatura sale del claro. El rival permite que se acerque a ella antes de recogerla. Has ayudado a construir una referencia visible que no cierra el espacio alrededor de quien todavía estaba decidiendo cómo regresar.'],
    ['call', 'La criatura responde a la única llamada que Huan pronunció desde el sendero. Él reconoce el gesto y evita repetir el nombre como si la primera respuesta tuviera que convertirse en obediencia inmediata. La voz del compañero ofreció un camino que podía elegirse, no otra barrera que fuera necesario superar.']
  ]],
  ['casa_sin_ensena', 'puerta', 'independent_house', [
    ['access', 'Tao revisa las señales que decidiste preparar primero y comprueba que una persona llegada desde otra calle puede entenderlas. El refugio conserva una entrada que no depende de conocer las enseñas ni sus disputas. Ren incorpora esa ruta al acuerdo de la plaza sin utilizarla como frontera de una nueva asociación.'],
    ['listen', 'Mei vuelve a la lista de necesidades que decidiste escuchar antes de mover las mesas. Varias peticiones siguen pendientes y ahora tienen responsables a quienes consultar. El refugio puede explicar por qué organizó cada espacio y dispone de una manera de cambiarlo cuando las personas que lo utilizan señalen algo que todavía falta.']
  ]]
];
for (const [missionId, stepId, key, entries] of callbacks) {
  const selected = [...SEASON_MISSIONS, ...SIDE_MISSIONS].find(mission => mission.id === missionId).steps.find(step => step.id === stepId);
  selected.variants = [...(selected.variants ?? []), ...entries.map(([value, text]) => variant({ [key]: value }, [text]))];
}
