export const STORY_CAMPAIGN_ID = 'nombres_perdidos';
export const STORY_CONTENT_VERSION = 1;
export const STORY_CAMPAIGN_TITLE = 'Las Cartas Sin Nombre';
export const STORY_SEASON_TITLE = 'Los Nombres Perdidos';

function freeze(value) {
  if (value && typeof value === 'object') {
    Object.values(value).forEach(freeze);
    Object.freeze(value);
  }
  return value;
}

export const STORY_CHAPTERS = freeze([
  { id: 'prologo', title: 'El despertar del Custodio', location: 'Plaza del Archivo',
    missionCodes: ['P-01', 'P-02', 'P-03', 'P-04'], plannedMissions: 4 },
  { id: 'bosque', title: 'El Bosque que Olvidó su Voz', location: 'Bosque de los Susurros',
    missionCodes: ['I-01', 'I-02', 'I-03'], plannedMissions: 5 }
]);

export const STORY_MEMORIES = freeze([
  { id: 'campanas_sin_manos', title: 'Campanas sin manos',
    description: 'La primera llamada del Gran Archivo y una carta que había perdido su nombre.' },
  { id: 'gratitud_del_bosque', title: 'La gratitud del bosque',
    description: 'Te detuviste a ayudar a una criatura herida cuando las huellas podían desaparecer.' },
  { id: 'huella_de_tinta', title: 'Una huella antes del silencio',
    description: 'Seguiste la tinta y reconociste una misma marca en la plaza y en el bosque.' },
  { id: 'confianza_de_lian', title: 'La confianza de Lian',
    description: 'Distinguiste al Eco hostil de las criaturas asustadas. Lian dejó una nota de confianza en tu cuaderno.' }
]);

const reward = (coins, userXp, unitXp, fragmentos = 0, esencias = 0, memory = null) => ({
  coins, userXp, unitXp, materials: { fragmentos, esencias, sellos: 0 }, memory
});

// Content is versioned independently of storage and combat policies. The birth
// identity of a player's unit is never changed by a scene or a narrative choice.
export const STORY_MISSIONS = freeze([
  {
    id: 'invitacion_bambu', code: 'P-01', chapterId: 'prologo', title: 'Una invitación bajo el bambú',
    location: 'Plaza del Archivo', kind: 'choice', encounterId: null,
    scene: [
      'Un panda anciano observa una carta a la sombra del bambú. A su espalda se alza el Gran Archivo.',
      'Bao: «Una carta no es solo poder. Es una historia que acepta continuar contigo».',
      'Desde la torre suena una campana. Bao levanta la mirada: nadie debería estar tocándola.'
    ],
    choices: [
      { id: '1', label: 'Preguntar por el Archivo', key: 'first_question', value: 'archive',
        consequence: 'Bao: «Guardamos nombres y vínculos. Cuando las campanas llaman solas, algo ha dejado de estar donde debería».' },
      { id: '2', label: 'Preguntar por las criaturas', key: 'first_question', value: 'creatures',
        consequence: 'Bao: «Cada una tiene su nombre y su historia. Ser Custodio es acompañarla, no decidir todo por ella».' }
    ],
    reward: reward(20, 20, 0)
  },
  {
    id: 'primer_vinculo', code: 'P-02', chapterId: 'prologo', title: 'El primer vínculo',
    location: 'Patio del Gran Archivo', kind: 'starter', encounterId: null,
    scene: [
      'Bao despliega los registros de las criaturas que pueden formar su primer vínculo.',
      '«No busques la más rara. Busca una compañera cuya forma de luchar quieras aprender».',
      'Tu criatura inicial conserva su identidad, su origen y las aventuras que viváis juntos.'
    ],
    choices: [], reward: reward(0, 20, 100)
  },
  {
    id: 'sombra_plaza', code: 'P-03', chapterId: 'prologo', title: 'Una sombra en la plaza',
    location: 'Plaza del Archivo', kind: 'battle', encounterId: 'P03',
    scene: [
      'Una mancha de tinta cruza la plaza. Dentro tiembla una criatura que parece no reconocer el camino.',
      'Bao: «Es un Eco: una identidad dañada. Vamos a detenerlo sin hacerle más daño del necesario».',
      '«Prueba tus ataques, aprende a cubrirte y observa cuándo conviene usar una habilidad. Estoy aquí si caes».'
    ],
    choices: [], reward: reward(45, 50, 220, 1)
  },
  {
    id: 'campanas_archivo', code: 'P-04', chapterId: 'prologo', title: 'Las campanas del Archivo',
    location: 'Vestíbulo del Gran Archivo', kind: 'scene', encounterId: null,
    scene: [
      'La tinta abandona al Eco, pero las campanas siguen sonando. Lian encuentra una carta completamente blanca.',
      'Lian: «Los registros no están rotos. Les faltan los nombres».',
      'Bao reconoce un sello en el borde y aparta la mirada: «No es la primera vez que veo esa tinta».',
      'Las últimas huellas salen de la plaza y se pierden en el Bosque de los Susurros.'
    ],
    choices: [], reward: reward(35, 30, 80, 1, 0, 'campanas_sin_manos')
  },
  {
    id: 'sendero_silencio', code: 'I-01', chapterId: 'bosque', title: 'Sendero en silencio',
    location: 'Bosque de los Susurros', kind: 'choice', encounterId: null,
    scene: [
      'El sendero conserva el olor de la lluvia, pero no se oye un solo pájaro.',
      'Lian descubre cortes oscuros sobre el bambú. Junto al arroyo, unas huellas arrastran la misma tinta.',
      '«Podemos seguir cualquiera de las dos pistas. Primero quiero entender qué estamos viendo».'
    ],
    choices: [
      { id: '1', label: 'Examinar las marcas del bambú', key: 'forest_clue', value: 'bamboo',
        consequence: 'Los cortes interrumpen viejas inscripciones. Lian copia el patrón: «Alguien está buscando nombres, no madera».' },
      { id: '2', label: 'Seguir las huellas del arroyo', key: 'forest_clue', value: 'stream',
        consequence: 'Un rastro pequeño se desvía del resto. Bao encuentra hojas aplastadas: «Una criatura se ha quedado atrás».' }
    ],
    reward: reward(40, 35, 100, 1)
  },
  {
    id: 'criatura_herida', code: 'I-02', chapterId: 'bosque', title: 'Una criatura herida',
    location: 'Arroyo del Bambú', kind: 'choice', encounterId: null,
    scene: [
      'Una pequeña criatura tiembla entre hojas manchadas de tinta. Más adelante, las huellas todavía están frescas.',
      'Bao deja su bastón junto al arroyo: «Está asustada. Pero la corriente pronto borrará el rastro».',
      'Lian abre su cuaderno. Espera tu decisión.'
    ],
    choices: [
      { id: '1', label: 'Auxiliar a la criatura', key: 'forest_choice', value: 'help',
        consequence: 'Limpias la tinta de una pata y le dejas espacio. Antes de refugiarse, la criatura señala unos arbustos: te está advirtiendo.' },
      { id: '2', label: 'Perseguir las huellas', key: 'forest_choice', value: 'pursue',
        consequence: 'Sigues el rastro y reconoces el sello de la carta blanca. Bao permanece con la criatura mientras Lian documenta tu hallazgo.' }
    ],
    reward: reward(60, 45, 150, 1, 1)
  },
  {
    id: 'huellas_bambu', code: 'I-03', chapterId: 'bosque', title: 'Huellas en el bambú',
    location: 'Cruce de los Ecos', kind: 'choice', encounterId: 'I03',
    scene: [
      'Dos Ecos retroceden hacia el bambú; un tercero avanza, reuniendo tinta alrededor de sus garras.',
      'Lian: «No todos quieren atacarnos. Mira cuál prepara el golpe».',
      'Bao: «Cuando la tinta se concentre, cúbrete. Después de descargarla quedará expuesto».'
    ],
    choices: [
      { id: '1', label: 'Observar y enfrentar solo al Eco hostil', key: 'echo_approach', value: 'observe',
        consequence: 'Reconoces al Eco de Tinta por sus garras oscuras y dejas una salida a los otros. Lian anota tu cuidado al elegir el objetivo.' },
      { id: '2', label: 'Proteger a los Ecos asustados', key: 'echo_approach', value: 'protect',
        consequence: 'Te colocas entre los Ecos asustados y la tinta. Los dos pequeños se apartan; el Eco de Tinta concentra su atención en tu compañero.' },
      { id: '3', label: 'Atacar sin distinguirlos', key: 'echo_approach', value: 'attack',
        consequence: 'Los Ecos pequeños huyen. Bao contiene la estampida, pero Lian cierra el cuaderno: «Había dos que solo tenían miedo». Pierdes el recuerdo de confianza de este recorrido.' }
    ],
    reward: reward(100, 100, 450, 1, 1)
  }
]);

function decisionValue(decisions, key) {
  const value = decisions?.[key];
  return value && typeof value === 'object' ? value.value : value;
}

/** A fresh array prevents view callers from mutating the frozen canon. */
export function storyScene(mission, decisions = {}) {
  const selected = typeof mission === 'object' && mission !== null ? mission : getStoryMission(mission);
  if (!selected) return [];
  const scene = [...selected.scene];
  if (selected.code === 'P-02') {
    scene.unshift(decisionValue(decisions, 'first_question') === 'creatures'
      ? 'Bao: «Preguntaste por las criaturas. Ahora podrás conocer a una por su propio nombre».'
      : 'Bao: «Antes de entrar en el Archivo, necesitas conocer a tu primer compañero».');
  }
  if (selected.code === 'I-02') {
    scene.unshift(decisionValue(decisions, 'forest_clue') === 'stream'
      ? 'Las huellas pequeñas del arroyo terminan junto a una raíz: habéis encontrado a la criatura rezagada.'
      : 'El patrón del bambú vuelve a aparecer en una hoja. Al apartarla, Lian descubre a quien se refugia debajo.');
  }
  if (selected.code === 'I-03') {
    scene.unshift(decisionValue(decisions, 'forest_choice') === 'help'
      ? 'La criatura que ayudaste silba desde su refugio y señala las garras oscuras. Su advertencia llega a tiempo.'
      : 'La pista que perseguiste lleva al mismo sello. Lian reconoce su brillo antes de que las garras se carguen de tinta.');
  }
  return scene;
}

/** Indexes are zero-based; player-facing references use P-01 / I-01. */
export function getStoryMission(reference) {
  if (Number.isSafeInteger(reference)) return STORY_MISSIONS[reference] ?? null;
  if (typeof reference !== 'string') return null;
  const code = reference.trim().toUpperCase();
  return STORY_MISSIONS.find(mission => mission.code === code || mission.id === reference.trim()) ?? null;
}
