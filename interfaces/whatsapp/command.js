import { EVOLUTION_MIN_LEVEL } from '../../game/evolution/rules.js';
import { game as defaultGame } from '../../game/index.js';
import { GameError, requireGame } from '../../utils/GameError.js';
import { normalizeIdentity } from '../../utils/identity.js';
import { describeError } from '../../utils/errorDiagnostics.js';
import { whatsappConfig } from '../../CTU-config.js';
import { createHash } from 'node:crypto';
import { card, commandText, displayName, section } from './format.js';
export { displayName, rarityName } from './format.js';

const messages = {
  STORY_NOT_STARTED: '🎋 Bao te espera bajo el bambú. Empieza con .ctuhistoria iniciar',
  STORY_SIDE_LOCKED: '🌿 Esa ruta opcional todavía no se abrió. Consulta .ctuhistoria opcionales y continúa la campaña.',
  STORY_SEASON_REQUIRED: '🏛️ Las Pruebas del Archivo se abren después de completar el epílogo. Continúa con .ctuhistoria',
  STORY_ACTIVITY_LOCKED: '🧭 Ya tienes una ruta opcional o prueba en curso. Continúa con .ctuhistoria o pausa con .ctuhistoria volver; si hay combate, ríndete primero.',
  STORY_SCENE_LOCKED: '📖 Sólo puedes releer escenas de misiones completadas. Consulta tu avance con .ctucapitulos',
  STORY_CONTRIBUTION_REQUIRED: '🤝 Falta tu aportación a esta escena. Confírmala con .ctuhistoria aportar; puedes avanzar con clan o en solitario.',
  STORY_MAIN_REQUIRED: '🎋 Ya estás en la campaña principal. Continúa con .ctuhistoria',
  STORY_INVALID_ACTIVITY: '🔎 Elige una ruta disponible. Consulta .ctuhistoria opcionales, .ctuhistoria pruebas o relee una misión completada con .ctuhistoria escenas III-04 1',
  STORY_NOT_PROTECTABLE: '🛡️ Proteger se usa cuando hay aliados en peligro o durante la fase Elección. Consulta la señal con .ctuhistoria',
  STORY_NOT_PURIFIABLE: '✨ Purificar se usa ante la tensión de la Campana o los sellos del Archivista. Consulta las acciones disponibles con .ctuhistoria',
  STORY_ACTION_COOLDOWN: '⏳ Esa táctica todavía se está recuperando. Usa otra acción disponible y consulta la señal con .ctuhistoria',
  STORY_SKILL_SEALED: '🔒 Tu técnica está sellada temporalmente. Alterna acciones o purifica cuando esté disponible; consulta .ctuhistoria',
  STORY_INVALID_JOURNAL_SECTION: '📖 Elige cronica, personajes, trazos, decisiones, recuerdos o atlas.\nEjemplo: .ctudiario historia cronica 1',
  STORY_INVALID_JOURNAL_PAGE: '📄 Escribe una página entera desde 1.\nEjemplo: .ctudiario historia cronica 2',
  STORY_COMPLETE: '📜 Completaste la ruta de Historia disponible. Consulta tus recuerdos con .cturecuerdos y los próximos capítulos con .ctucapitulos',
  STORY_NOT_BREAKABLE: '🌱 No hay una barrera de raíces que romper ahora. Revisa la señal enemiga con .ctuhistoria y elige otra acción.',
  STORY_NOT_OBSERVABLE: '👁️ Observar se usa ante señuelos activos. Consulta la situación con .ctuhistoria; las pistas se revisan gratis con .ctuhistoria inspeccionar',
  INVALID_STORY_COMBAT_VERSION: '📖 Las reglas de este encuentro no están disponibles en esta versión. Consulta .ctuhistoria y pide al administrador que revise la versión del bot.',
  STORY_INVALID_CHOICE: '🧭 Esa opción no está disponible. Elige uno de los números de tu escena con .ctuhistoria elegir 1. Tu progreso sigue guardado.',
  STORY_CHOICE_REQUIRED: '🧭 Primero elige una opción de la escena con .ctuhistoria elegir 1. Revisa las opciones con .ctuhistoria',
  STORY_STARTER_REQUIRED: '🎴 Necesitas tu primer compañero para crear el vínculo. Usa .ctustarter y vuelve con .ctuhistoria continuar',
  STORY_TEAM_REQUIRED: '🛡️ Prepara de 1 a 3 compañeros antes del encuentro. Consulta .ctuequipo y selecciona con .ctuequipo usar ID',
  STORY_TEAM_LOCKED: '🔒 Un compañero está ocupado en combate, mercado o intercambio. Libéralo o prepara otro equipo con .ctuequipo antes de reintentar.',
  STORY_BATTLE_ACTIVE: '⚔️ El encuentro narrativo sigue en curso. Consulta .ctuhistoria para ver el turno y la señal enemiga.',
  STORY_BATTLE_NOT_ACTIVE: '🎋 No hay un encuentro narrativo activo. Consulta .ctuhistoria para ver el siguiente paso.',
  STORY_RETRY_REQUIRED: '🌧️ Este intento terminó. Puedes preparar otro equipo con .ctuequipo y volver con .ctuhistoria reintentar',
  STORY_INVALID_ACTION: '🎋 Esa acción no está disponible. Consulta .ctuhistoria o .ctuhistoria ayuda; tu progreso sigue guardado.',
  STORY_INVALID_SWITCH: '🔀 Elige una reserva viva con .ctuhistoria cambiar 2 o .ctuhistoria cambiar 3. Cambiar consume un turno.',
  STORY_SKILL_ON_COOLDOWN: '⏳ Tu habilidad está recuperándose. Usa un ataque disponible o defiende; consulta .ctuhistoria para ver la señal enemiga.',
  STORY_RESET_CONFIRMATION: '🧪 Para reiniciar tu campaña de prueba, consulta .ctureiniciarhistoria y confirma con .ctureiniciarhistoria confirmar',
  INVALID_COIN_AMOUNT: '💰 Escribe una cantidad entera válida. Los aportes/retiros de clan van de 10 a 1000000 ChengCoins; una oferta de intercambio admite 0.',
  TRADE_NOT_YOURS: '🔒 Ese intercambio pertenece a otros jugadores.',
  TRADE_NOT_ACTIVE: '🤝 El intercambio ya terminó. Consulta .ctuintercambio mios',
  SELF_TRADE: '🪞 Elige a otro jugador para intercambiar.',
  TRADE_ALREADY_OPEN: '🤝 Ya tienen un intercambio abierto. Consulta .ctuintercambio mios',
  TOO_MANY_TRADES: '⏳ Tienes 5 intercambios abiertos. Completa o cancela uno.',
  EMPTY_TRADE: '🎴 Ofrece al menos una unidad o monedas antes de confirmar.',
  INVALID_TRADE_FILTER: '🤝 Consulta .ctuintercambio mios',
  INVALID_CHAT: '📍 Usa el comando desde una conversación válida.',
  INVALID_TRADE_REFERENCE: '🔎 Usa un código como I1. Consulta .ctuintercambio mios',

  INVALID_CLAN_NAME: "🏯 Escribe un nombre de clan de 3 a 32 caracteres. Ejemplo: .ctuclan crear BAM Casa del Bambú",
  INVALID_CLAN_TAG: "🏷️ La etiqueta usa de 2 a 6 letras o números y debe estar disponible.",
  ALREADY_IN_CLAN: "🏯 Ya perteneces a un clan. Consulta .ctuclan",
  CLAN_NOT_MEMBER: "🏯 Aún no perteneces a un clan. Consulta .ctuclan para ver invitaciones o crear uno.",
  CLAN_NOT_FOUND: "🏯 Ese clan no existe. Consulta .ctuclan top",
  CLAN_PERMISSION_DENIED: "🔒 Tu rol no permite esa acción. Consulta .ctuclan ayuda",
  CLAN_FULL: "👥 El clan llegó a sus 15 miembros.",
  CLAN_INVITATION_REQUIRED: "📨 Necesitas una invitación vigente del clan y una plaza libre.",
  CLAN_INVITATION_INVALID: "📨 Ese jugador ya tiene clan o no puede recibir esa invitación.",
  CLAN_MEMBERSHIP_COOLDOWN: "⏳ Espera 24 h desde tu salida o expulsión para entrar o crear otro clan.",
  CLAN_WAR_ROSTER_LOCKED: "🛡️ La plantilla está reservada para una guerra. Espera a que termine.",
  CLAN_TRANSFER_LEADERSHIP_REQUIRED: "👑 Transfiere el liderazgo antes de salir. Para disolver un clan vacío, retira su tesorería primero.",
  INVALID_CLAN_ROLE: "🛡️ Elige oficial o miembro para otro integrante.",
  CLAN_MEMBER_NOT_FOUND: "👤 Ese jugador no pertenece a tu clan.",
  CLAN_TREASURY_INSUFFICIENT: "💰 Revisa la tesorería y sus fondos. La entrada de guerra cuesta 100 por clan.",
  CLAN_WAR_MEMBERS_REQUIRED: "👥 Ambos clanes necesitan al menos 3 miembros para una guerra.",
  CLAN_WAR_ALREADY_OPEN: "⚔️ Uno de los clanes ya tiene una guerra pendiente o activa.",
  CLAN_WAR_PAIR_COOLDOWN: "⏳ La misma pareja de clanes puede iniciar una guerra cada 7 días.",
  CLAN_WAR_NOT_FOUND: "⚔️ Esa guerra no existe. Consulta .ctuclan guerras",
  CLAN_WAR_NOT_PENDING: "⌛ El desafío ya fue respondido o venció. Consulta .ctuclan guerras",
  CLAN_WAR_REWARD_UNAVAILABLE: "🎁 El premio ya fue cobrado o no participaste en un duelo válido de esa guerra.",
  INVALID_COMMUNITY_CODE: "🔎 Usa un código corto válido: C1 para clanes o G1 para guerras.",
  NO_MATERIALS_AVAILABLE: "🎒 No tienes materiales pendientes. Consíguelos en combates, misiones, logros, jefes o temporadas.",
  INSUFFICIENT_MATERIALS: "🧩 Te faltan materiales. Consulta .ctucrafting y reclama tus materiales pendientes.",
  COSMETIC_ALREADY_OWNED: "🏵️ Ya creaste esa insignia permanente.",
  RECIPE_NOT_FOUND: "🔨 Esa receta no existe. Consulta .ctucrafting",
  EVOLUTION_UNAVAILABLE: "🍃 Este personaje aún no tiene evolución disponible.",
  UNIT_ALREADY_EVOLVED: "🔮 Esa unidad ya evolucionó.",
  EVOLUTION_LEVEL_REQUIRED: `🌱 La evolución requiere nivel ${EVOLUTION_MIN_LEVEL} de unidad. Consulta .ctuficha ID`,
  NOT_UNIT_OWNER: "🔒 Esa unidad no te pertenece. Consulta .ctupersonajes",
  NO_ACQUISITION_REWARDS: "🍃 No tienes premios pendientes de esa categoría. Consulta .cturecompensas",
  PROMO_UNAVAILABLE: "🎁 Ese código no existe o está fuera de sus fechas.",
  PROMO_ALREADY_REDEEMED: "✅ Ya canjeaste ese código. Cada jugador puede usarlo una vez.",
  PROMO_EXHAUSTED: "📦 Se agotaron los canjes de esa promoción.",
  INVALID_SOCIAL_BIO: "✍️ La presentación admite hasta 140 caracteres, sin saltos de línea.",
  SOCIAL_TITLE_NOT_EARNED: "🏅 Ese título aún no está desbloqueado. Consulta .ctusocial titulos",
  INVALID_SOCIAL_COMPARISON: "⚖️ Elige dos unidades distintas: .ctusocial comparar ID1 ID2",
  INVALID_SOCIAL_PREFERENCES: "✍️ Revisa las opciones en .ctusocial ayuda",
  TRADE_EXPIRED: "⌛ El intercambio venció. Sus reservas fueron devueltas.",
  TRADE_NOT_FOUND: "🤝 Ese intercambio no existe. Consulta .ctuintercambio mios",
  TRADE_NOT_PARTICIPANT: "🔒 Ese intercambio pertenece a otros jugadores.",
  TRADE_WRONG_CHAT: "📍 Usa el comando en la conversación donde creaste el intercambio.",
  TRADE_NOT_OPEN: "🤝 El intercambio ya terminó. Consulta .ctuintercambio mios",
  TRADE_OFFER_FROZEN: "🔒 Ambas ofertas quedaron congeladas con la primera confirmación. Puedes confirmar o cancelar.",
  TRADE_EMPTY_OFFER: "🎴 Cada jugador debe ofrecer al menos una unidad o monedas.",
  TRADE_ALREADY_CONFIRMED: "✅ Ya confirmaste. Falta la confirmación del otro jugador.",
  TRADE_PAIR_ALREADY_OPEN: "🤝 Ya tienen un intercambio abierto. Consulta .ctuintercambio mios",
  TRADE_OPEN_LIMIT: "⏳ Tienes 5 intercambios abiertos. Completa o cancela uno.",
  TRADE_SELF: "🪞 Elige a otro jugador para intercambiar.",
  INVALID_TRADE_OFFER: "📝 Ofrece monedas enteras y hasta 3 unidades: .ctuintercambio oferta I1 100 ID1",
  INVALID_TRADE_CODE: "🔎 Usa un código como I1. Consulta .ctuintercambio mios",

  RANKED_MESSAGE_ID_REQUIRED: '📨 No pude identificar este mensaje para confirmar la operación competitiva.\nEnvía el comando en un mensaje nuevo.',
  RANKED_ADVANCED_REQUIRED: '🏅 Las clasificatorias usan equipos 1v1, 2v2 o 3v3.\nEjemplo: .cturanked @jugador 1v1\nSin tamaño, se usa el de ambos equipos.',
  RANKED_ADVANCED_ONLY: '🏅 Las clasificatorias usan equipos 1v1, 2v2 o 3v3.\nEjemplo: .cturanked @jugador 1v1',
  RANKED_INVALID_OPPONENT: '👤 Menciona a un solo jugador del grupo.\nEjemplo: .cturanked @jugador\nTamaño opcional: 1v1, 2v2 o 3v3.',
  INVALID_RANKED_MODE: '🏅 Usa .cturanked @jugador para una clasificatoria o .ctupelea @jugador para una partida amistosa.',
  INVALID_SEASON: '📅 Usa el código corto de la temporada, por ejemplo T1.\nConsulta .ctutemporadas',
  SEASON_NOT_FOUND: '📅 Esa temporada no existe.\nConsulta .ctutemporadas',
  SEASON_NOT_ENDED: '⏳ Los premios de temporada se reclaman después del cierre.\nConsulta la fecha con .ctutemporada',
  SEASON_NOT_STARTED: '📅 La temporada competitiva aún no empezó.\nConsulta .ctutemporadas',
  SEASON_REWARD_NOT_ELIGIBLE: '🏅 Necesitas 5 clasificatorias válidas y 3 rivales distintos en esa temporada para recibir el premio.\nConsulta .cturank T1 usando el código de esa temporada.',
  CONTENT_MESSAGE_ID_REQUIRED: '📨 No pude identificar este mensaje para confirmar la recompensa.\nEnvía el comando en un mensaje nuevo.',
  CONTENT_GROUP_ONLY: '📍 Las apariciones, capturas y ataques a bosses se juegan en un grupo de WhatsApp.\nUsa el comando desde tu grupo.',
  INVALID_MISSION: '📋 Elige una misión con 1, 2 o 3.\nConsulta .ctumisiones',
  MISSION_NOT_FOUND: '📋 Esa misión no existe.\nConsulta .ctumisiones',
  MISSION_NOT_READY: '📋 Aún falta completar esa misión.\nConsulta tu progreso con .ctumisiones',
  INVALID_ACHIEVEMENT: '🏅 Usa el código corto del logro, por ejemplo L1.\nConsulta .ctulogros',
  ACHIEVEMENT_NOT_FOUND: '🏅 Ese logro no existe.\nConsulta .ctulogros',
  ACHIEVEMENT_NOT_UNLOCKED: '🏅 Ese logro todavía no está desbloqueado.\nConsulta tu progreso con .ctulogros',
  ACHIEVEMENT_NOT_READY: '🏅 Ese logro todavía no está desbloqueado.\nConsulta tu progreso con .ctulogros',
  EVENT_NOT_FOUND: '🏮 Ese evento no existe.\nConsulta .ctueventos',
  EVENT_NOT_ACTIVE: '🏮 Ese evento aún no empieza o ya terminó.\nConsulta .ctueventos para ver las fechas.',
  EVENT_NOT_STARTED: '🏮 Ese evento aún no empieza.\nConsulta .ctueventos para ver las fechas.',
  EVENT_CLOSED: '🏮 El evento terminó; sus personajes existentes conservan su progreso y pueden comerciarse.\nConsulta .ctueventos',
  CAMPAIGN_CLOSED: '🏮 La emisión de personajes de ese evento está cerrada.\nConsulta .ctueventos',
  INSUFFICIENT_TICKETS: '🎟️ Necesitas un ticket para capturar.\nGánalos con .ctumisiones, .ctulogros o la bienvenida de .ctuevento faroles reclamar',
  BOSS_NOT_FOUND: '👹 Ese boss no existe.\nConsulta .ctuboss niebla o .ctuboss dragon',
  BOSS_NOT_ACTIVE: '👹 Ese boss ya terminó.\nConsulta .ctuboss para ver el encuentro actual.',
  BOSS_EXPIRED: '⌛ El encuentro con ese boss venció.\nConsulta .ctuboss',
  BOSS_ATTACK_LIMIT: '👹 Ya alcanzaste tu límite de ataques en este encuentro.\nConsulta tus aportaciones con .ctubosstop',
  BOSS_ATTACK_COOLDOWN: '⏳ Tu ataque al boss aún se está recuperando.\nConsulta .ctuboss para ver cuándo puedes volver.',
  BOSS_COOLDOWN: '⏳ Tu ataque al boss aún se está recuperando.\nConsulta .ctuboss para ver cuándo puedes volver.',
  INVALID_BOSS_ATTACK: '⚔️ Elige el ataque 1 o 2.\nEjemplo: .ctubossatacar 1 B1',
  SPAWN_NOT_FOUND: '🎴 No hay una aparición disponible en este grupo.\nConsulta .ctuspawn o usa .ctuexplorar',
  SPAWN_NOT_ACTIVE: '🎴 Esa aparición ya fue capturada o venció.\nConsulta .ctuspawn',
  SPAWN_EXPIRED: '⌛ Esa aparición venció.\nConsulta .ctuspawn',
  SPAWN_WRONG_CHAT: '📍 Esa aparición pertenece a otro grupo.\nCaptúrala desde el grupo donde apareció.',
  ENCOUNTER_NOT_FOUND: '🎴 Ese encuentro no existe.\nConsulta .ctuspawn o .ctuboss',
  INVALID_ENCOUNTER: '🎴 Usa el código corto del encuentro, por ejemplo B1 o S1.',
  MARKET_MESSAGE_ID_REQUIRED: '📨 No pude identificar este mensaje para confirmar la operación del mercado.\nEnvía el comando en un mensaje nuevo.',
  INVALID_MARKET_PRICE: '💰 El precio debe ser un número entero entre 20 y 1000000 ChengCoins.\nEjemplo: .ctuvender PAND-000001 100',
  INVALID_MARKET_FILTER: '🛍️ Usa .ctumercado, .ctumercado mios, .ctumercado raro o .ctumercado precio.\n🔎 Detalles: .ctumercado M1\n🛒 Comprar: .ctucomprar M1',
  LISTING_NOT_FOUND: '🛍️ Ese anuncio no existe.\n👉 Consulta .ctumercado',
  LISTING_NOT_ACTIVE: '🛍️ Ese anuncio ya se vendió, se retiró o venció.\n👉 Consulta .ctumercado',
  LISTING_EXPIRED: '⌛ El anuncio venció y la unidad quedó disponible para su propietario.\n👉 Consulta .ctumercado',
  SELF_PURCHASE: '🪞 Esa unidad ya te pertenece.\n👉 Consulta .ctumercado mios para retirar el anuncio.',
  LISTING_NOT_YOURS: '🔒 Sólo el vendedor puede retirar ese anuncio.\n👉 Tus anuncios: .ctumercado mios',
  UNIT_ALREADY_LISTED: '🛍️ Esa unidad ya está en venta.\n👉 Consulta .ctumercado mios',
  PACK_NOT_FOUND: '🎁 Ese sobre no existe.\n👉 Consulta .ctusobres',
  PACK_UNAVAILABLE: '📦 Este sobre no tiene personajes disponibles por ahora.\n👉 Consulta .ctusobres',
  INSUFFICIENT_COINS: '💰 No tienes suficientes ChengCoins para esta operación.\n👉 Consulta .ctubalance',
  ECONOMY_MESSAGE_ID_REQUIRED: '📨 No pude identificar este mensaje para confirmar el reclamo.\nEnvía de nuevo el comando en un mensaje nuevo.',
  PACK_MESSAGE_ID_REQUIRED: '📨 No pude identificar este mensaje para confirmar la compra.\nEnvía de nuevo el comando en un mensaje nuevo.',
  INVALID_OPERATION_KEY: '📨 No pude identificar esta operación. Envía el comando en un mensaje nuevo.',
  OPERATION_CONFLICT: '📨 Este mensaje ya confirmó otra operación.\nEnvía tu nuevo comando en un mensaje nuevo.',
  HISTORY_NOT_FOUND: '📜 Esa partida no está en el historial. Consulta .ctuhistorial',
  INVALID_NAME: '❌ Escribe un nombre de 1 a 40 caracteres, sin saltos de línea ni caracteres de control.\nEjemplo: .cturegistro Miguel',
  USER_NOT_FOUND: '❌ Primero regístrate con .cturegistro Tu nombre',
  INVALID_IDENTITY: '❌ No pude identificar al remitente. Usa el comando desde una conversación de WhatsApp válida.',
  CHARACTER_NOT_FOUND: '❌ Ese personaje no existe.\n👉 Consulta .ctucatalogo',
  UNIT_NOT_FOUND: '❌ Esa unidad no existe. Ejemplo: .ctuunidad PAND-000001',
  INVALID_STARTER: '❌ Elige panda, mago o lobo (también 1, 2 o 3). Ejemplo: .ctustarter panda',
  CHARACTER_UNAVAILABLE: '❌ Ese personaje no está disponible para obtenerse.',
  SUPPLY_EXHAUSTED: '❌ Ya se emitieron todas las unidades disponibles de ese personaje.',
  INVALID_CURSOR: '❌ La página no es válida. Usa el comando sin argumentos para volver al inicio.',
  INVALID_PAGE: '❌ La página no es válida. Escribe un número entero desde 1.\nEjemplo: .ctucatalogo 2',
  PAGE_NOT_FOUND: '❌ La página no es válida: ese listado no tiene tantos resultados. Vuelve a la página 1.',
  INVALID_PAGE_SIZE: '❌ El tamaño de página debe estar entre 1 y 25.',
  INVALID_ARGUMENTS: '❌ Los argumentos no son válidos.\n👉 Consulta .ctuayuda',
  GROUP_ONLY: '⚔️ Los desafíos y combates se juegan en un grupo de WhatsApp. Usa el comando en el grupo donde está tu oponente.',
  INVALID_OPPONENT: '👤 Menciona a un solo jugador o usa su ID de jugador.\nEjemplo: .ctupelea @jugador\nModo opcional: 1v1, 2v2, 3v3 o clasico.',
  INVALID_BATTLE_MODE: '⚔️ Elige 1v1, 2v2, 3v3 o clasico.\nEjemplo: .ctupelea @jugador 3v3\nSin modo, se usa el tamaño de ambos equipos.',
  TEAM_SIZE_MISMATCH: '🛡️ Ambos jugadores necesitan el mismo número de unidades para este modo.\nRevisen .ctuequipo antes de desafiarse.',
  ADVANCED_BATTLE_REQUIRED: '🔀 Los cambios se usan en combates avanzados.\nInicia otro combate con .ctupelea @jugador',
  INVALID_SWITCH: '🔀 Elige una reserva viva de tu equipo.\nUsa .ctucambiar 2 o .ctucambiar 3; cambiar consume el turno.',
  SWITCH_SAME_UNIT: '🔀 Esa unidad ya está luchando. Elige otra reserva viva.',
  UNIT_DEFEATED: '💤 Esa unidad fue derrotada y ya no puede entrar en este combate.',
  ATTACK_ON_COOLDOWN: '⏳ Ese ataque aún está recuperándose.\nElige el otro ataque o cambia de unidad con .ctucambiar.',
  ATTACK_COOLDOWN: '⏳ Ese ataque aún está recuperándose.\nElige el otro ataque o cambia de unidad con .ctucambiar.',
  INVALID_TEAM_SLOT: '🔀 Esa posición no existe en tu equipo. Elige una reserva viva con .ctucambiar 2 o .ctucambiar 3.',
  UNIT_ALREADY_ACTIVE: '🔀 Esa unidad ya está luchando. Elige otra reserva viva.',
  UNIT_KNOCKED_OUT: '💤 Esa unidad fue derrotada y ya no puede entrar en este combate.',
  OPPONENT_NOT_REGISTERED: '👤 Tu oponente todavía no está registrado. Debe usar .cturegistro y elegir su starter primero.',
  SELF_CHALLENGE: '🪞 No puedes desafiarte a ti mismo. Elige otro jugador del grupo.',
  PLAYER_BUSY: '⏳ Uno de los jugadores ya tiene un desafío pendiente o un combate activo. Consulta .ctucombate en el grupo donde se inició.',
  TEAM_EMPTY: '🛡️ Ambos jugadores necesitan un equipo. Consulta .ctupersonajes y selecciona una unidad con .ctuequipo usar ID.',
  INVALID_TEAM: '🛡️ Tu equipo admite de 1 a 3 unidades.\nUsa .ctuequipo usar ID1 ID2 ID3, agregar ID, quitar ID o limpiar.',
  INVALID_TEAM_ORDER: '🔀 Escribe una vez cada posición actual de tu equipo.\nEjemplo: .ctuequipo ordenar 2 1 3',
  DUPLICATE_TEAM_UNIT: '🛡️ Esa unidad ya está en el equipo. Cada unidad puede ocupar una sola posición.',
  TEAM_FULL: '🛡️ Tu equipo ya tiene 3 unidades.\nQuita una con .ctuequipo quitar ID o usa .ctuequipo usar ID1 ID2 ID3.',
  TEAM_LOCKED: '🔒 No puedes cambiar tu equipo durante un combate.\nPara Historia consulta .ctuhistoria; en PvP usa .ctucombate en el grupo correspondiente.',
  UNIT_NOT_OWNED: '🔒 Esa unidad no te pertenece. Elige una de tu colección con .ctupersonajes.',
  UNIT_NOT_IN_TEAM: '🛡️ Esa unidad no está en tu equipo.',
  UNIT_LOCKED: '🔒 Esa unidad está en combate, en venta o reservada en un intercambio.\n👉 Consulta .ctumercado mios, .ctucombate o .ctuintercambio mios.\n📖 Para un encuentro narrativo: .ctuhistoria',
  BATTLE_NOT_FOUND: '⚔️ No hay un desafío o combate disponible para esta acción en este grupo. Consulta .ctucombate.',
  BATTLE_NOT_ACTIVE: '⚔️ El combate ya terminó o todavía no fue aceptado. Consulta .ctucombate.',
  BATTLE_WRONG_CHAT: '📍 Ese combate pertenece a otro grupo. Usa el comando en el grupo donde se inició.',
  BATTLE_NOT_PARTICIPANT: '👤 No participas en ese combate.',
  CHALLENGE_NOT_YOURS: '📣 Sólo el jugador desafiado puede aceptar o rechazar; sólo el creador puede retirar el desafío.',
  NOT_YOUR_TURN: '⏳ Aún no es tu turno. Consulta .ctucombate para ver quién debe atacar.',
  INVALID_ATTACK: '⚔️ Elige uno de los dos ataques de tu personaje.\nUsa .ctuatacar 1 o .ctuatacar 2.'
};

export function identityFor(sock, msg) {
  const subject = msg.key.fromMe ? sock.user?.id
    : msg.key.remoteJid.endsWith('@g.us') ? msg.key.participant : msg.key.remoteJid;
  return normalizeIdentity({ provider: 'whatsapp', subject });
}

function defaultLogger(message) {
  console.error(`Chengdú: ${message}`);
}

function debugEnabled(override) {
  if (typeof override === 'boolean') return override;
  if (process.env.CTU_DEBUG === undefined) return whatsappConfig.debug;
  return ['1', 'true'].includes(process.env.CTU_DEBUG.trim().toLowerCase());
}

function debugSection(diagnostic) {
  const limit = 6000;
  const clipped = diagnostic.length > limit
    ? `${diagnostic.slice(0, limit)}\n… [Diagnóstico recortado; traza completa en consola]`
    : diagnostic;
  // Prevent an exception containing backticks from closing the WhatsApp code block.
  return section('🐛 *Debug activado*', `Copia este diagnóstico para revisar el fallo.\n\n\`\`\`\n${clipped.replace(/\`\`\`/g, '\` \` \`')}\n\`\`\``);
}

export function defineCommand(command, handler) {
  function createRun(game, { logger = defaultLogger, prefix = '.', debug, battleHealthBars } = {}) {
    return async function run(sock, msg, args = []) {
      const from = msg?.key?.remoteJid;
      requireGame(typeof from === 'string' && typeof sock?.sendMessage === 'function', 'INVALID_CONTEXT');
      let text;
      try {
        requireGame(Array.isArray(args) && args.every(a => typeof a === 'string'), 'INVALID_ARGUMENTS');
        // Shared by the router and standalone plugins; activating a group is an
        // in-memory hint and adds no database write to the command response.
        if (from.endsWith('@g.us')) game.encounters?.activateGroup?.({ chatId: from });
        const contextInfo = msg.message?.extendedTextMessage?.contextInfo ?? msg.message?.imageMessage?.contextInfo ?? msg.message?.videoMessage?.contextInfo;
        text = await handler({ game, args, identity: () => identityFor(sock, msg), prefix,
          cmd: (name, value) => commandText(prefix, name, value),
          battleOptions: { healthBars: typeof battleHealthBars === 'boolean' ? battleHealthBars : whatsappConfig.battleHealthBars },
          context: { chatId: from, messageId: msg.key.id ?? null, mentions: contextInfo?.mentionedJid ?? [] }
        });
      } catch (error) {
        if (error instanceof GameError && error.code === 'USER_ALREADY_EXISTS') {
          text = card('REGISTRO', [`👤 Ya estás registrado como ${displayName(error.details.name)}.`], `👉 *${commandText(prefix, 'ctuperfil')}*`);
        } else if (error instanceof GameError && error.code === 'DAILY_NOT_READY') {
          const next = error.details?.nextClaimAt;
          const availability = typeof next === 'string' && Number.isFinite(Date.parse(next))
            ? new Date(next).toLocaleString('es-MX', { timeZone: 'America/Mexico_City', day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit', hourCycle: 'h23' }) : null;
          text = card('DIARIO', [
            '⏳ Ya reclamaste tu diario. Se puede reclamar una vez cada 24 h.',
            availability ? `📅 Próximo diario: *${availability}*\n📍 Hora de Ciudad de México.` : null
          ], `👉 Tu saldo: *${commandText(prefix, 'ctubalance')}*`);
        } else if (error instanceof GameError && messages[error.code]) {
          text = card('ERROR', [messages[error.code].replace(/\.ctu/g, () => `${prefix}ctu`)]);
        } else {
          const code = typeof error?.code === 'string' ? error.code : 'UNEXPECTED_ERROR';
          const commandName = commandText(prefix, command);
          const diagnostic = `${code} | comando=${commandName} | Node=${process.version}\n${describeError(error)}`;
          logger(diagnostic, { code, command: commandName, runtime: process.version, error });
          text = card('ERROR', [
            '🛠️ No pude confirmar la operación.\nPide al administrador que revise el bot y vuelve a intentarlo.',
            debugEnabled(debug) ? debugSection(diagnostic) : null
          ]);
        }
      }
      // Transport failures propagate to the host; never retry a send automatically.
      return sock.sendMessage(from, { text });
    };
  }
  return { command, createRun, run: (...args) => createRun(defaultGame)(...args) };
}

export function pageArguments(args) {
  requireGame(args.length <= 1 && (args.length === 0 || /^\d+$/.test(args[0])), 'INVALID_PAGE');
  const page = args.length === 0 ? 1 : Number(args[0]);
  requireGame(Number.isSafeInteger(page) && page >= 1, 'INVALID_PAGE');
  return { page, limit: 5 };
}

export function pageNavigation(page, command, prefix = '.', args = '') {
  if (!page.totalItems) return '';
  const pageCommand = number => commandText(prefix, command, `${args ? `${args} ` : ''}${number}`);
  return [
    `📄 *Página ${page.page} de ${page.totalPages}*`,
    page.previousPage !== null ? `⬅️ Anterior: *${pageCommand(page.previousPage)}*` : null,
    page.nextPage !== null ? `➡️ Siguiente: *${pageCommand(page.nextPage)}*` : null
  ].filter(Boolean).join('\n');
}

export function marketOperationKey(operation, context, userId) {
  requireGame(typeof context.messageId === 'string' && context.messageId.trim().length > 0, 'MARKET_MESSAGE_ID_REQUIRED');
  return createHash('sha256').update(JSON.stringify([`market:${operation}`, context.chatId, userId, context.messageId])).digest('hex');
}

export function contentOperationKey(operation, context, userId) {
  requireGame(typeof context.messageId === 'string' && context.messageId.trim().length > 0, 'CONTENT_MESSAGE_ID_REQUIRED');
  return createHash('sha256').update(JSON.stringify([`content:${operation}`, context.chatId, userId, context.messageId])).digest('hex');
}

export function competitiveOperationKey(operation, context, userId) {
  requireGame(typeof context.messageId === 'string' && context.messageId.trim().length > 0, 'RANKED_MESSAGE_ID_REQUIRED');
  return createHash('sha256').update(JSON.stringify([`competitive:${operation}`, context.chatId, userId, context.messageId])).digest('hex');
}

export function groupContext(context) {
  requireGame(typeof context.chatId === 'string' && context.chatId.endsWith('@g.us'), 'CONTENT_GROUP_ONLY');
  return context.chatId;
}
