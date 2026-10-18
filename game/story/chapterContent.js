// Expansion content is kept separate so the seven original missions remain
// available to the replay and validation of version-one saves.
const reward = (coins, userXp, unitXp, fragmentos = 0, esencias = 0, memory = null) => ({
  coins, userXp, unitXp, materials: { fragmentos, esencias, sellos: 0 }, memory
});
const freeze = value => {
  if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); }
  return value;
};

export const NEW_STORY_MEMORIES = freeze([
  { id: 'nombre_guardian', title: 'El nombre bajo las raíces',
    description: 'Escuchaste al Guardián Marchito cuando pudo recordar qué protegía. Nube confió a tus cuidados el Primer Trazo.' },
  { id: 'valor_de_un_nombre', title: 'El valor de un nombre',
    description: 'Tras los señuelos del Mercado de los Ecos encontraste vínculos incompletos. El Segundo Trazo conserva la voz de quienes querían elegir.' },
  { id: 'cautela_del_testigo', title: 'Una voz que confía',
    description: 'Pediste un registro antes de aceptar una promesa imposible. Tao encontró el valor para contar lo que había visto.' },
  { id: 'oferta_imposible', title: 'La trampa desde dentro',
    description: 'Seguiste una oferta de ensayo y descubriste cómo ocultaban su engaño. Lian recordó tu audacia y el valor de revisar un trato antes de confirmarlo.' }
]);

export const STORY_TRACES = freeze([
  { id: 'primer_trazo', number: 1, title: 'Primer Trazo', chapterId: 'bosque',
    missionId: 'guardian_marchito', missionCode: 'I-05',
    description: 'Un nombre conserva una memoria, pero también puede convertirse en una cadena. Nube te confió este fragmento cuando el bosque volvió a responder.' },
  { id: 'segundo_trazo', number: 2, title: 'Segundo Trazo', chapterId: 'mercado',
    missionId: 'mercader_sin_rostro', missionCode: 'II-05',
    description: 'Un vínculo auténtico guarda una historia y permite continuarla. Los registros del mercado muestran que borrar nombres también puede inmovilizar vínculos.' },
  { id: 'tercer_trazo', number: 3, title: 'Tercer Trazo', chapterId: 'montanas',
    missionId: null, missionCode: null, description: 'Su historia todavía no ha sido descubierta.' },
  { id: 'cuarto_trazo', number: 4, title: 'Cuarto Trazo', chapterId: 'casas',
    missionId: null, missionCode: null, description: 'Su historia todavía no ha sido descubierta.' },
  { id: 'quinto_trazo', number: 5, title: 'Quinto Trazo', chapterId: 'archivo',
    missionId: null, missionCode: null, description: 'Su historia todavía no ha sido descubierta.' }
]);

export const EXTENDED_MISSIONS = freeze([
  {
    id: 'claro_tinta', code: 'I-04', chapterId: 'bosque', title: 'El claro de la tinta',
    location: 'Claro de las Raíces', kind: 'battle', encounterId: 'I04',
    scene: [
      'Una figura de niebla aparta el bambú: la Guardiana Nube escucha una canción que ya no sabe terminar.',
      'Nube: «Queda una sílaba bajo las raíces. La tinta se lleva los nombres, pero todavía no ha aprendido a escuchar».',
      'Lian reconoce en una piedra el sello de la carta blanca. A su lado, una sombra se tensa antes de atacar.',
      'Bao: «Mira sus movimientos. Si anuncia el golpe, puedes prepararte antes de recibirlo».'
    ],
    choices: [],
    completionScene: ['Nube retiene la última sílaba y señala las raíces del centro del claro. Allí alguien sigue intentando recordar su deber.'],
    reward: reward(45, 30, 90, 1)
  },
  {
    id: 'guardian_marchito', code: 'I-05', chapterId: 'bosque', title: 'Guardián Marchito',
    location: 'Corazón del Bosque', kind: 'battle', encounterId: 'I05', traceId: 'primer_trazo',
    scene: [
      'El Guardián Marchito levanta un muro de raíces. Bajo la corteza, la tinta repite una orden que ya no comprende.',
      'Nube: «Antes protegía el sendero. Ahora cree que todo el que intenta pasar viene a quitarle algo».',
      'Bao: «Rompe la barrera cuando cierre el paso y defiende cuando concentre la tinta. Estamos aquí para devolverle su voz».'
    ],
    choices: [],
    completionScene: [
      'El Guardián baja las ramas: «Yo... cuidaba el camino. No debía cerrarlo para siempre». Parte de su memoria vuelve con el viento.',
      'Nube te entrega el Primer Trazo. Entre la tinta que se disuelve oyes: «El nombre también puede convertirse en una cadena».'
    ],
    reward: reward(105, 60, 195, 1, 1, 'nombre_guardian')
  },
  {
    id: 'rumores_faroles', code: 'II-01', chapterId: 'mercado', title: 'Rumores entre faroles',
    location: 'Casa de Té de Mei', kind: 'choice', encounterId: null,
    scene: [
      'En el Mercado de los Ecos, Tía Mei enfría una taza junto a un asiento vacío. Hay puestos que han cerrado sin despedirse.',
      'Mei: «Aquí comerciamos con historias que continúan. Esas cartas perfectas, sin nombre de origen, están haciendo callar a la gente».',
      'Lian guarda el Primer Trazo. Necesitáis un testimonio, no acusar a todo el mercado.'
    ],
    choices: [
      { id: '1', label: 'Escuchar a los comerciantes con cortesía', key: 'market_approach', value: 'courtesy',
        consequence: 'Compartes el té antes de preguntar. Mei presenta a Tao, un aprendiz de mensajero: vio una entrega que nadie quiso firmar.' },
      { id: '2', label: 'Mostrar el símbolo y pedir pruebas', key: 'market_approach', value: 'evidence',
        consequence: 'Lian copia el símbolo sin exhibir las cartas de nadie. Un comerciante encuentra la misma marca en un embalaje; Mei os indica dónde apareció.' }
    ],
    reward: reward(20, 20, 40)
  },
  {
    id: 'puesto_sin_nombre', code: 'II-02', chapterId: 'mercado', title: 'El puesto sin nombre',
    location: 'Pasaje de los Sellos', kind: 'choice', encounterId: null,
    scene: [
      'En un puesto vacío brilla una carta sin una sola marca de uso. Su dibujo parece perfecto; el espacio del nombre está intacto.',
      'Lian: «La apariencia puede copiarse. Una identidad tiene origen, huellas y un recorrido que podemos comprobar».',
      'El registro del puesto no identifica a ninguna criatura. Elegís cómo documentar lo que falta.'
    ],
    choices: [
      { id: '1', label: 'Examinar la inscripción y el sello', key: 'authenticity_check', value: 'inscription',
        consequence: 'La inscripción termina donde debería empezar el nombre. Lian conserva una copia: la carta representa poder, pero no acredita un vínculo auténtico.' },
      { id: '2', label: 'Investigar su procedencia e historial', key: 'authenticity_check', value: 'history',
        consequence: 'El vendedor anterior tampoco conocía a su Custodio. Lian anota el hueco: un historial verificable cuenta cambios reales de propietario y conserva la identidad de cada unidad.' }
    ],
    reward: reward(25, 20, 55, 1)
  },
  {
    id: 'oferta_imposible', code: 'II-03', chapterId: 'mercado', title: 'Una oferta imposible',
    location: 'Callejón de las Promesas', kind: 'choice', encounterId: null,
    scene: [
      'Un desconocido ofrece una carta invencible a cambio del compañero más querido de tu Custodio. No muestra nombre ni registro.',
      'Bao deja sobre la mesa una carta de ensayo: «Podemos seguirle el juego para entenderlo. Decide cómo te acercarías».',
      '🧪 Esta oferta es simulada: tus cartas, propietarios y ChengCoins no se intercambian.'
    ],
    choices: [
      { id: '1', label: 'Aceptar la oferta dentro del relato', key: 'impossible_offer', value: 'accept',
        consequence: 'Ofreces la carta de ensayo. El desconocido intenta cerrar el trato antes de que puedas mirar la suya; Lian descubre un hilo de tinta hacia un almacén. «Tu audacia mostró la trampa. En un intercambio real, revisa ambas ofertas antes de confirmar».' },
      { id: '2', label: 'Rechazar y pedir un registro verificable', key: 'impossible_offer', value: 'reject',
        consequence: 'El desconocido recoge su mercancía. Tao sale de un portal: «Creí que nadie preguntaría por los nombres». Confía en ti y cuenta dónde guardan los registros ausentes.' }
    ],
    reward: reward(20, 20, 50)
  },
  {
    id: 'libro_ausentes', code: 'II-04', chapterId: 'mercado', title: 'El libro de los ausentes',
    location: 'Taller de la Señora Yun', kind: 'investigation', encounterId: null,
    scene: [
      'Tao deja un libro de entregas sobre la mesa. La Señora Yun extiende a su lado un tejido con los mismos espacios en blanco.',
      'Yun: «Una marca cuenta dónde estuvo alguien. Otra conserva lo que quería que recordaran de él. Necesitamos leer ambas».',
      'Lian abre dos páginas del diario. Elige qué pista investigar primero; después revisaréis la otra.'
    ],
    choices: [
      { id: '1', label: 'Revisar primero el libro de entregas', key: 'archive_order', value: 'records',
        consequence: 'Tao ordena los recibos mientras Yun sostiene el tejido a contraluz. Empiezas siguiendo los destinos de las cartas.' },
      { id: '2', label: 'Descifrar primero el patrón del tejido', key: 'archive_order', value: 'weave',
        consequence: 'Yun te enseña dónde cambia la tensión del hilo. Empiezas escuchando el mensaje escondido entre los nombres.' }
    ],
    investigationScenes: {
      records: [
        'Tres entregas llegaron al mismo almacén; sus páginas perdieron los nombres después de ser firmadas.',
        'Tao reconoce una ruta aún utilizada. Lian marca el lugar: «No desaparecieron durante el viaje. Alguien los borró al recibirlos».'
      ],
      weave: [
        'Yun encuentra un hilo que se interrumpe y reaparece junto a otro nombre. La interrupción sigue siempre el mismo patrón.',
        '«No es un adorno», dice. «Es una petición: que les permitan volver a elegir». Lian conserva la frase en su cuaderno.'
      ]
    },
    completionScene: ['Las dos pistas señalan el mismo almacén. Mei reúne a los comerciantes para que los registros auténticos permanezcan a salvo mientras investigáis.'],
    reward: reward(30, 25, 60, 1)
  },
  {
    id: 'mercader_sin_rostro', code: 'II-05', chapterId: 'mercado', title: 'Mercader Sin Rostro',
    location: 'Almacén de los Nombres', kind: 'battle', encounterId: 'II05', traceId: 'segundo_trazo',
    scene: [
      'El Mercader Sin Rostro despliega cartas enormes. Cada silueta promete una fuerza distinta, pero todas dejan la misma sombra sobre el suelo.',
      'Mercader: «Si nadie cambia de dueño, nadie volverá a perder lo que ama». Detrás de él, los nombres del libro empiezan a inmovilizarse.',
      'Lian: «Sus invocaciones no se comportan igual. Observa el patrón antes de gastar tu mejor técnica».'
    ],
    choices: [],
    completionScene: [
      'Las ilusiones se apagan. El Mercader admite que recibía identidades incompletas de alguien que se hacía llamar un antiguo protector del Archivo.',
      'Entre los registros aparece el Segundo Trazo. Lian comprende: «No quieren destruir a las criaturas. Quieren impedir que sus vínculos puedan cambiar».',
      'Tía Mei devuelve el libro a sus comerciantes. Los nombres recuperados vuelven a circular con historias que sus Custodios pueden comprobar.'
    ],
    reward: reward(90, 55, 180, 1, 1, 'valor_de_un_nombre')
  }
]);
