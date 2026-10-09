Miguel, aquí sí conviene diseñarlo como un juego de verdad y no como una colección de comandos sueltos. Si construyes primero `.ctuatacar`, luego `.ctuabrir`, luego mercado, luego niveles, vas a terminar reescribiendo media arquitectura cuando descubras que los sistemas se contradicen.

La prioridad debería ser:

> **núcleo del juego → propiedad → combate → progresión → obtención → economía → mercado → contenido → eventos → optimización**

No al revés.

Voy a plantearlo como si fueras a desarrollar Chengdú Cards como un proyecto serio y mantenible.

---

# 1. Visión general del proyecto

La idea central podría ser:

> Un juego dentro de WhatsApp donde los usuarios coleccionan personajes únicos, forman equipos, combaten contra otros jugadores, progresan, consiguen nuevas unidades mediante distintas actividades y pueden comerciarlas.

Los personajes tienen una especie/base:

```text
Dragón Carmesí
```

pero las unidades reales son únicas:

```text
Dragón Carmesí #0001
Dragón Carmesí #0002
Dragón Carmesí #0003
```

Cada unidad puede tener:

```text
ID único
propietario
serial
nivel
XP
estadísticas individuales
traits
variante
historial
victorias
derrotas
fecha de creación
origen
```

Eso te da el modelo tipo NFT sin blockchain.

---

# 2. Define primero los pilares del juego

Antes del código, necesitas decidir qué hace divertido al sistema.

Yo usaría cinco pilares.

### Colección

El jugador quiere conseguir personajes.

```text
comunes
raros
épicos
legendarios
míticos
ediciones especiales
únicos
```

### Propiedad

Cada unidad pertenece exactamente a una persona.

```text
Dragon Carmesí #007
owner → Miguel
```

### Combate

Los jugadores tienen razones para usar lo que coleccionan.

### Progresión

Las unidades evolucionan:

```text
nivel
XP
estadísticas
habilidades
maestría
```

### Economía

Las unidades y recursos tienen valor porque pueden:

```text
ganarse
gastarse
intercambiarse
venderse
```

Si una funcionalidad futura no fortalece al menos uno de estos pilares, probablemente sea ruido.

---

# 3. Estructura conceptual

Yo dividiría Chengdú en cuatro dominios.

```text
USUARIOS
   ↓
coleccionan

UNIDADES
   ↓
basadas en

PERSONAJES
   ↓
utilizadas en

COMBATES
```

Y alrededor:

```text
       economía
          │
          ↓
usuarios ←→ unidades ←→ mercado
   │          │
   │          ↓
   └────→ combates
              │
              ↓
          recompensas
```

Esta separación debería existir también en el código.

---

# 4. Arquitectura recomendada

Partiendo de tu estructura actual, podrías evolucionar hacia esto:

```text
src/
│
├── commands/
│   CTU-....js
(
    ├── user/
│   │   ├── cturegistro.js
│   │   ├── ctuperfil.js
│   │   └── ctucartera.js
│   │
│   ├── characters/
│   │   ├── ctupersonajes.js
│   │   ├── ctuunidad.js
│   │   └── ctuequipo.js
│   │
│   ├── battle/
│   │   ├── ctupelea.js
│   │   ├── ctuaceptar.js
│   │   ├── ctuatacar.js
│   │   └── cturendirse.js
│   │
│   ├── economy/
│   │   ├── ctubalance.js
│   │   ├── ctudiario.js
│   │   └── ctutrabajar.js
│   │
│   ├── market/
│   │   ├── ctumercado.js
│   │   ├── ctuvender.js
│   │   └── ctucomprar.js
│   │
│   └── admin/
│       └── ...
)
│
├── game/
│   ├── users/
│   ├── characters/
│   ├── units/
│   ├── battle/
│   ├── economy/
│   ├── market/
│   ├── rewards/
│   ├── progression/
│   ├── drops/
│   └── events/
│
├── ChengdúData/
│   ├── databases.js
│   ├── usuarios.json
│   ├── personajes.json
│   ├── unidades.json
│   ├── combates.json
│   ├── mercado.json
│   └── config.json
│
└── utils/
```

Una regla debería ser prácticamente sagrada:

> **Los comandos no contienen lógica de juego.**

Un comando debería ser algo así:

```js
export async function run(sock, msg, args) {
  const resultado = atacar(...);

  await sock.sendMessage(from, {
    text: resultado.message
  });
}
```

No esto:

```js
// 300 líneas calculando batalla dentro de ctuatacar.js
```

---

# 5. Modelo de datos inicial

Esta parte merece diseñarse antes de empezar los sistemas.

## usuarios.json

El usuario debería contener información del jugador, no copias completas de sus personajes.

```json
[
  {
    "id": "521999999999@s.whatsapp.net",
    "nombre": "Miguel",

    "createdAt": "2026-10-07T20:00:00Z",

    "economia": {
      "monedas": 1000,
      "gemas": 0
    },

    "progreso": {
      "nivel": 1,
      "xp": 0
    },

    "estadisticas": {
      "victorias": 0,
      "derrotas": 0,
      "combates": 0
    },

    "equipo": [],

    "config": {
      "notificaciones": true
    }
  }
]
```

No guardaría:

```json
"personajes": [...]
```

como fuente de propiedad.

La propiedad vive en `unidades.json`.

---

# 6. personajes.json

Contiene las plantillas.

```json
[
  {
    "id": "dragon_carmesi",

    "nombre": "Dragón Carmesí",

    "rareza": "legendario",

    "stats": {
      "vida": 120,
      "ataque": 32,
      "defensa": 18,
      "velocidad": 11
    },

    "variacionStats": {
      "vida": 8,
      "ataque": 3,
      "defensa": 3,
      "velocidad": 2
    },

    "habilidades": [
      "llamarada",
      "garra_dragon"
    ],

    "supply": {
      "tipo": "limitado",
      "maximo": 500
    },

    "obtenible": true
  }
]
```

Este archivo responde:

> ¿Qué es un Dragón Carmesí?

No:

> ¿Quién tiene el Dragón #37?

---

# 7. unidades.json

Este probablemente termine siendo uno de los archivos más importantes.

```json
[
  {
    "id": "DRGC-000037",

    "characterId": "dragon_carmesi",

    "serial": 37,

    "ownerId": "521999999999@s.whatsapp.net",

    "createdAt": "2026-10-07T20:00:00Z",

    "origin": {
      "type": "boss",
      "eventId": "dragon_ancestral_01"
    },

    "progress": {
      "level": 3,
      "xp": 140
    },

    "stats": {
      "vida": 124,
      "ataque": 34,
      "defensa": 17,
      "velocidad": 12
    },

    "traits": [
      "agresivo"
    ],

    "variant": "normal",

    "battleStats": {
      "wins": 7,
      "losses": 2
    }
  }
]
```

La regla:

```text
ownerId
```

es la fuente definitiva de propiedad.

Para saber lo que tiene Miguel:

```js
unidades.filter(
  unidad => unidad.ownerId === sender
);
```

---

# 8. FASE 0 — Documento de diseño

Antes de programar el juego, dedica una fase pequeña a definir las reglas.

No hagas 100 páginas.

Un documento simple debería responder:

| Pregunta | Decisión |
|---|---|
| Tamaño de equipo | 3 |
| Combate | turnos |
| Duración objetivo | 3-8 minutos |
| Nivel máximo | inicialmente 20 |
| Rarezas | 5 |
| Comercio | sí |
| Supply limitado | algunos personajes |
| Variación estadísticas | sí |
| PvP | sí |
| PvE | posteriormente |
| Energía | probablemente no inicialmente |
| Muerte permanente | no |
| Blockchain | no |
| Duplicados | sí, como unidades diferentes |

Una de las peores cosas que puedes hacer es cambiar continuamente las reglas fundamentales mientras programas.

### Resultado de la fase

Debes tener:

```text
reglas básicas
modelo de personajes
modelo de propiedad
modelo de combate
modelo de progresión
```

Nada más.

---

# 9. FASE 1 — Infraestructura

Aquí no hay juego todavía.

Construyes los cimientos.

Ya empezaste bien con tu sistema multi-JSON.

Deberías terminar:

```text
crearDatabase()
cargar()
guardar()
existe()
eliminar()
```

Después probablemente añadiría:

```js
actualizar()
```

pero no es obligatorio.

También deberías definir funciones de acceso.

Ejemplo:

```js
getUsuario(id)
crearUsuario(id, nombre)
existeUsuario(id)

getUnidad(id)
getUnidadesUsuario(id)

getPersonaje(id)
```

Aquí empieza una separación importante.

No quieres que todo tu código haga:

```js
usuariosDB.cargar()
```

continuamente.

Mejor:

```js
getUsuario(sender)
```

De esa manera, si dentro de seis meses migras de JSON a SQLite, el juego ni se entera.

---

# 10. Capa repositorio

Incluso usando JSON, puedes crear:

```text
repositories/
```

Por ejemplo:

```text
repositories/
├── usuariosRepository.js
├── unidadesRepository.js
├── personajesRepository.js
├── combatesRepository.js
└── mercadoRepository.js
```

Entonces:

```js
export function getUsuario(id) {
  const usuarios = usuariosDB.cargar();

  return usuarios.find(
    usuario => usuario.id === id
  );
}
```

Y:

```js
export function saveUsuario(usuario) {
  ...
}
```

Eso puede parecer demasiado arquitectónico ahora.

Pero el beneficio es enorme.

Tu juego nunca necesita conocer:

```text
JSON
fs
rutas
SQLite
Mongo
Postgres
```

Solo conoce:

```text
getUsuario()
getUnidad()
saveUnidad()
```

---

# 11. FASE 2 — Registro y perfil

Primero termina completamente el sistema de usuario.

Comandos mínimos:

```text
.cturegistro Miguel

.ctuperfil

.ctubalance
```

También deberías impedir:

```text
registro duplicado
nombres vacíos
nombres absurdamente largos
```

Yo añadiría identificadores internos si quieres separar WhatsApp de tu sistema.

Ejemplo:

```json
{
  "id": "USR-000001",
  "jid": "521...",
  "nombre": "Miguel"
}
```

Aunque inicialmente usar `sender` como ID funciona perfectamente.

---

# 12. FASE 3 — Catálogo de personajes

Antes de permitir obtenerlos, construye el catálogo.

Empieza pequeño.

No hagas 100 personajes.

Haz aproximadamente:

```text
8-12 personajes
```

con diferentes roles.

Por ejemplo:

| Personaje | Tipo |
|---|---|
| Panda Guerrero | tanque |
| Mago Carmesí | atacante |
| Monje Celestial | equilibrado |
| Lobo Sombrío | velocidad |
| Guardián Jade | defensa |
| Bruja Lunar | estados |
| Dragón Carmesí | atacante |
| Espíritu Bambú | soporte |

La variedad importa más que la cantidad.

---

# 13. Roles de combate

Puedes tener algo así:

```text
Tanque
Atacante
Velocista
Control
Soporte
Equilibrado
```

Pero no necesariamente debes guardarlo como una regla dura.

Puede simplemente describir su estilo.

---

# 14. FASE 4 — Sistema de unidades

Aquí empieza el sistema NFT-like.

Necesitas una función central:

```js
crearUnidad(characterId, ownerId, options)
```

Esta función debería ser la **única forma legítima de generar personajes nuevos**.

Ejemplo conceptual:

```js
crearUnidad(
  'dragon_carmesi',
  sender,
  {
    origin: 'starter'
  }
);
```

Internamente:

```text
verificar personaje
↓
verificar supply
↓
calcular serial
↓
generar ID
↓
generar stats
↓
generar traits
↓
generar variante
↓
asignar propietario
↓
guardar
↓
actualizar supply
```

Nunca generes unidades directamente desde comandos.

---

# 15. IDs de unidades

Haz IDs legibles.

Por ejemplo:

```text
PAND-000042
DRGC-000037
MGLU-000014
```

Eso funciona muchísimo mejor en WhatsApp que:

```text
8f60af90-4386-4d0c-...
```

Porque puedes hacer:

```text
.ctuunidad DRGC-000037
```

---

# 16. Seriales

Mantén separado:

```text
id
```

y:

```text
serial
```

Ejemplo:

```json
{
  "id": "DRGC-000037",
  "serial": 37
}
```

Después puedes cambiar formato de IDs sin perder el concepto de:

```text
Dragón Carmesí #37
```

---

# 17. Supply

Aquí debes diferenciar dos conceptos.

### Supply ilimitado

```json
{
  "type": "unlimited"
}
```

### Supply limitado

```json
{
  "type": "limited",
  "max": 500
}
```

La función:

```js
crearUnidad()
```

debería comprobarlo.

Nunca permitas que cada sistema calcule supply por su cuenta.

---

# 18. FASE 5 — Starter

Antes de cofres, bosses y mercado, necesitas que el jugador pueda empezar.

Después:

```text
.cturegistro Miguel
```

podrías permitir:

```text
.ctustarter
```

y mostrar:

```text
Elige tu personaje inicial:

1. Panda Guerrero
2. Mago Carmesí
3. Lobo Sombrío
```

Puedes usar tres personajes equilibrados.

Después:

```text
.ctustarter 2
```

crea:

```text
Mago Carmesí #XXXX
```

y pasa a ser propiedad permanente.

Eso da valor inmediatamente al sistema.

---

# 19. No permitas farmear starters

Guarda:

```json
{
  "starterClaimed": true
}
```

o en progreso:

```json
{
  "rewards": {
    "starter": true
  }
}
```

No confíes en que el comando sea usado correctamente.

La lógica debe protegerse sola.

---

# 20. FASE 6 — Equipos

Después de tener unidades, introduce:

```text
.ctupersonajes
```

Resultado:

```text
🎴 Tus personajes

1. Panda Guerrero #124
Lv. 3

2. Lobo Sombrío #027
Lv. 2

3. Mago Carmesí #401
Lv. 1
```

Después:

```text
.ctuequipo
```

Y:

```text
.ctuequipo agregar PAND-000124
```

Inicialmente puedes hacer equipo de:

```text
1 personaje
```

para simplificar el combate.

Pero deja el modelo preparado para tres:

```json
"equipo": [
  "PAND-000124"
]
```

Luego pasas a:

```json
"equipo": [
  "PAND-000124",
  "LOBO-000027",
  "MAGC-000401"
]
```

sin cambiar el modelo.

---

# 21. FASE 7 — Motor de combate V1

Esta es probablemente la fase más importante.

No metas todavía:

```text
mercado
eventos
clanes
misiones
crafting
bosses
```

Termina el combate primero.

---

# 22. Combate mínimo viable

V1:

```text
1 vs 1
```

Stats:

```text
HP
ataque
defensa
velocidad
```

Dos ataques por personaje.

Sin:

```text
elementos
resistencias
buffs
debuffs
clima
equipo
objetos
críticos complejos
```

Todavía.

---

# 23. Flujo de combate

```text
.ctupelea @Juan
```

Crea desafío.

Juan hace:

```text
.ctuaceptar
```

El sistema:

```text
obtiene equipos
↓
crea snapshots
↓
calcula quién inicia
↓
crea combate
```

Después:

```text
.ctuatacar 1
```

Motor:

```text
validar combate
↓
validar jugador
↓
validar turno
↓
validar ataque
↓
resolver ataque
↓
aplicar daño
↓
comprobar derrota
↓
cambiar turno
↓
guardar
```

---

# 24. Combate como estado

`combates.json`:

```json
[
  {
    "id": "BTL-000001",

    "status": "active",

    "players": [
      {
        "id": "usuarioA",
        "unit": {
          "id": "PAND-0012",
          "hp": 120
        }
      },
      {
        "id": "usuarioB",
        "unit": {
          "id": "LOBO-0312",
          "hp": 87
        }
      }
    ],

    "turn": "usuarioA",

    "round": 1,

    "createdAt": "..."
  }
]
```

Importante:

> El combate debe usar snapshots.

No leas permanentemente stats desde `unidades.json` durante cada turno.

Si una unidad sube de nivel o cambia mientras pelea, puedes introducir bugs.

---

# 25. El motor no debe conocer WhatsApp

Idealmente:

```js
const resultado = atacar({
  battleId,
  userId,
  attackId
});
```

devuelve:

```js
{
  success: true,

  damage: 31,

  defeated: false,

  nextTurn: 'usuarioB',

  events: [
    {
      type: 'damage',
      amount: 31
    }
  ]
}
```

El comando convierte eso en texto.

Eso permite posteriormente usar el mismo motor en:

```text
web
Discord
Telegram
API
```

si algún día quieres.

---

# 26. FASE 8 — Sistema de ataques

Separado de personajes.

`ataques.json` podría contener:

```json
[
  {
    "id": "garra_dragon",

    "nombre": "Garra del Dragón",

    "power": 35,

    "accuracy": 90,

    "type": "physical"
  }
]
```

Los personajes solamente dicen:

```json
"attacks": [
  "garra_dragon",
  "llamarada"
]
```

Así puedes reutilizarlos.

---

# 27. Fórmula de daño

No intentes encontrar la fórmula perfecta inicialmente.

Algo sencillo:

```js
damage =
  attack.power +
  attacker.attack -
  defender.defense;
```

y:

```js
Math.max(1, damage)
```

Después puedes mejorar.

Por ejemplo:

```js
damage =
  attack.power *
  (attacker.attack / (attacker.attack + defender.defense));
```

Pero el balance se descubre probando.

No diseñando veinte fórmulas antes de jugar.

---

# 28. Determinismo y aleatoriedad

No hagas que todo dependa de RNG.

Un jugador debería poder entender por qué perdió.

Una combinación saludable:

```text
stats → importante
decisiones → importante
RNG → moderado
```

No:

```text
ganó porque sacó crítico 4 veces
```

---

# 29. FASE 9 — Estados y efectos

Solo después de que V1 funcione.

Puedes introducir:

```text
veneno
quemadura
aturdimiento
escudo
regeneración
ataque aumentado
defensa reducida
```

Pero crea un motor genérico.

Ejemplo:

```js
{
  type: 'poison',
  duration: 3,
  value: 5
}
```

No:

```js
if (personaje === 'bruja') {
 ...
}
```

Esto último escala fatal.

---

# 30. Sistema de eventos del combate

Una arquitectura muy buena sería que cada acción genere eventos.

Ejemplo:

```js
[
  {
    type: 'ATTACK_USED',
    attack: 'llamarada'
  },

  {
    type: 'DAMAGE',
    amount: 32
  },

  {
    type: 'STATUS_APPLIED',
    status: 'burn'
  }
]
```

Después puedes renderizar:

```text
🔥 Dragón Carmesí utilizó Llamarada.

💥 Infligió 32 de daño.

🔥 Lobo Sombrío quedó quemado.
```

Esto te simplifica muchísimo mensajes y futuras interfaces.

---

# 31. FASE 10 — Progresión

Ahora que el combate funciona, puedes darle recompensa.

Al terminar:

```text
ganador:
+XP jugador
+XP unidad
+monedas

perdedor:
+XP menor
```

Nunca hagas que perder dé cero siempre.

Eso provoca abandono.

---

# 32. Nivel del usuario vs nivel del personaje

Mantén ambos separados.

Usuario:

```text
Nivel 12
```

representa progreso general.

Unidad:

```text
Dragón Carmesí #37
Nivel 8
```

representa progreso del personaje.

---

# 33. XP del jugador

Puede desbloquear:

```text
funciones
modos
cosméticos
mayor capacidad de equipos
eventos
```

No necesariamente poder.

---

# 34. XP de unidad

Puede mejorar:

```text
stats
habilidades
maestría
```

Pero cuidado con crecer demasiado.

Una unidad nivel 20 no debería volver inútil una unidad nivel 1 de rareza similar.

---

# 35. Power creep

Este es uno de los riesgos más importantes.

Si cada contenido nuevo debe ser más fuerte que el anterior:

```text
Personaje A → 100 ataque
Personaje B → 120
Personaje C → 150
Personaje D → 200
```

en seis meses el contenido viejo vale cero.

Mejor crear personajes lateralmente distintos.

```text
uno es rápido
otro tanque
otro aplica veneno
otro controla
otro cura
```

No simplemente números mayores.

---

# 36. FASE 11 — Economía básica

Ahora sí.

Primero una sola moneda.

Por ejemplo:

```text
ChengCoins
```

Evita comenzar con:

```text
oro
plata
gemas
cristales
fichas
fragmentos
tickets
energía
```

Eso no es profundidad.

Es complejidad.

---

# 37. Fuentes de dinero

Ejemplos:

```text
combates
daily
misiones
eventos
bosses
recompensas
```

---

# 38. Sumideros de dinero

Esto es todavía más importante.

Si das dinero pero no hay dónde gastarlo, tendrás inflación infinita.

Necesitas sinks:

```text
sobres
mejoras
comisiones del mercado
cosméticos
rerolls
entrada a ciertos eventos
```

---

# 39. Nunca permitas modificar monedas directamente

Evita:

```js
usuario.monedas += 500;
```

por todo tu código.

Haz:

```js
addCoins(userId, 500, {
  reason: 'battle_reward'
});
```

Y:

```js
removeCoins(userId, 200, {
  reason: 'pack_purchase'
});
```

Esto te permitirá auditar economía posteriormente.

---

# 40. Ledger económico

Eventualmente sería muy útil:

```json
{
  "id": "TX-0000021",
  "userId": "...",
  "type": "credit",
  "amount": 500,
  "reason": "battle_reward",
  "createdAt": "..."
}
```

Esto sirve para detectar exploits.

---

# 41. FASE 12 — Primera forma de obtener personajes

Ahora sí puedes implementar paquetes/sobres.

Yo empezaría con solamente uno.

```text
Sobre Básico
Costo: 500
```

Resultados:

```text
70% común
22% raro
7% épico
1% legendario
```

Pero aquí debes definir algo importante:

Si tienes supply limitado, el sistema de probabilidades debe comprobar disponibilidad.

No puede intentar crear:

```text
Dragón #501
```

si solo existen 500.

---

# 42. Motor de drops

Crea:

```js
rollDrop(poolId)
```

No pongas las probabilidades dentro del comando.

Ejemplo:

```json
{
  "id": "pack_basic",

  "entries": [
    {
      "rarity": "common",
      "weight": 7000
    },
    {
      "rarity": "rare",
      "weight": 2200
    }
  ]
}
```

Utiliza pesos enteros en lugar de floats cuando puedas.

---

# 43. FASE 13 — Orígenes diversos

Después de que abrir sobres funcione, empieza a añadir formas diferentes.

Esta es una de las partes con mayor potencial.

### Starter

Primer personaje.

### Sobres

Economía.

### Drops PvP

Incentivan combatir.

### Misiones

Incentivan objetivos.

### Achievements

Premian habilidad o dedicación.

### Eventos

Crean exclusividad temporal.

### Bosses

Fomentan cooperación.

### Spawns

Crean actividad espontánea en grupos.

### Rankings

Premios competitivos.

### Códigos/promociones

Eventos comunitarios.

---

# 44. FASE 14 — Mercado

No lo construyas antes de que exista suficiente supply.

Un mercado con 10 jugadores y 20 unidades no aporta mucho.

Cuando ya haya colecciones reales:

```text
.ctuvender DRGC-000037 5000
```

crea listing.

Nunca cambies owner todavía.

Podrías marcar:

```json
{
  "listed": true
}
```

o mantenerlo en `mercado.json`.

---

# 45. Compra atómica

Este punto es crítico.

Cuando alguien compra:

```text
verificar listing
↓
verificar owner
↓
verificar balance
↓
descontar comprador
↓
pagar vendedor
↓
cambiar propietario
↓
eliminar listing
```

Todo debe suceder como una única operación lógica.

Con archivos JSON, si fallas a mitad puedes corromper economía.

Por eso aquí empieza a aparecer una futura razón para migrar a SQLite.

---

# 46. Comisión del mercado

Yo pondría desde temprano algo como:

```text
5%
```

porque funciona como sink económico.

Ejemplo:

```text
venta: 10,000

vendedor recibe:
9,500

sistema retira:
500
```

Ayuda contra inflación.

---

# 47. FASE 15 — Intercambio directo

Después del mercado:

```text
.ctutrade @Juan
```

Oferta:

```text
Miguel:
DRGC-000037
+ 1000 monedas

Juan:
LOBO-000052
```

Ambos aceptan.

Aquí necesitas especial cuidado con:

```text
doble gasto
cambiar unidades después de aceptar
saldo insuficiente
unidades vendidas en mercado
```

Cuando una oferta llega al estado de confirmación, deberías bloquear los activos.

---

# 48. FASE 16 — PvP avanzado

Ahora puedes pasar de:

```text
1 vs 1
```

a:

```text
3 vs 3
```

Aquí aparece:

```text
cambio de personaje
orden de equipo
sinergias
habilidades
composición
```

Esto debería ser una fase grande independiente.

---

# 49. Equipo de 3

Modelo:

```json
"team": [
  "DRGC-0037",
  "PAND-0102",
  "MAGC-0048"
]
```

Cada slot puede tener significado.

O simplemente:

```text
activo
reserva
reserva
```

---

# 50. FASE 17 — Sistema elemental

Solo cuando el combate normal sea bueno.

Ejemplo:

```text
🔥 fuego
💧 agua
🌿 naturaleza
⚡ eléctrico
🌑 oscuro
✨ luz
```

Pero te recomiendo no hacer un círculo gigantesco.

Puede empezar:

```text
fuego > naturaleza
naturaleza > agua
agua > fuego
```

y elementos neutrales.

---

# 51. Multiplicadores suaves

No usaría:

```text
x2
```

porque hace demasiado determinante el matchup.

Tal vez:

```text
ventaja: 1.25
resistencia: 0.80
```

Eso deja espacio para habilidad y stats.

---

# 52. FASE 18 — Traits

Aquí tu concepto coleccionable gana muchísimo.

Ejemplo:

```text
Agresivo:
+3% ataque

Robusto:
+3% HP

Ágil:
+3% velocidad
```

Una unidad puede salir con:

```text
0 traits
1 trait
2 traits muy raramente
```

No hagas traits con diferencias del 30%.

Se convertirían en:

```text
unidad buena
unidad basura
```

Eso sería frustrante.

---

# 53. FASE 19 — Variantes

Aquí puedes crear valor de colección sin romper balance.

```text
Normal
Shiny
Dark
Golden
Event
Anniversary
```

Idealmente la variante es estética.

```text
Dragón Carmesí #37
✨ Golden
```

No:

```text
Golden = +50% ataque
```

Si haces eso, conviertes cosméticos raros en pay-to-win.

---

# 54. FASE 20 — Procedencia

Esto puede convertirse en una característica excelente.

Cada unidad debería guardar cómo nació.

```json
"origin": {
  "type": "event",
  "source": "halloween_2026"
}
```

o:

```json
"origin": {
  "type": "boss",
  "source": "abyss_dragon"
}
```

Entonces:

```text
.ctuunidad DRGC-000037
```

puede mostrar:

```text
Origen:
🐉 Recompensa del Dragón del Abismo

Fecha:
13 Nov 2026
```

Eso crea historia.

---

# 55. FASE 21 — Historial de propiedad

No lo necesitas al principio.

Pero una vez haya comercio:

```json
"ownershipHistory": [
  {
    "ownerId": "...",
    "acquiredAt": "...",
    "method": "mint"
  },
  {
    "ownerId": "...",
    "acquiredAt": "...",
    "method": "market"
  }
]
```

Esto fortalece muchísimo el aspecto NFT-like.

---

# 56. No guardaría el historial entero dentro de la unidad para siempre

Si el proyecto crece mucho, eso hace gigantesco `unidades.json`.

Eventualmente puedes tener:

```text
transactions.json
```

y obtener historial mediante:

```js
transactions.filter(
  tx => tx.unitId === id
);
```

Eso escala mejor.

---

# 57. FASE 22 — Misiones

Misiones diarias:

```text
Gana 2 combates
Juega 5 combates
Usa 3 personajes diferentes
```

Recompensas:

```text
monedas
XP
tickets
```

Las misiones sirven para guiar comportamiento.

No deberían ser tareas sin sentido como:

```text
manda 100 mensajes
```

porque incentivarán spam.

---

# 58. FASE 23 — Achievements

Diferentes de misiones.

Son hitos permanentes.

```text
Primera sangre
Gana tu primera batalla

Coleccionista
Obtén 25 unidades

Veterano
Juega 100 combates

Invicto
Gana 10 consecutivos
```

Pueden desbloquear:

```text
títulos
personajes
cosméticos
badges
```

---

# 59. FASE 24 — Ranking

No lo implementaría como ranking eterno.

Los jugadores antiguos dominarían para siempre.

Mejor temporadas:

```text
Temporada 1
30-60 días
```

Rank:

```text
Bronce
Plata
Oro
Platino
Diamante
Maestro
```

---

# 60. Rating

Puedes empezar con algo sencillo:

```text
1000 puntos
```

Ganador:

```text
+20
```

Perdedor:

```text
-15
```

Posteriormente puedes implementar Elo.

No hace falta empezar matemáticamente perfecto.

---

# 61. FASE 25 — Temporadas

Las temporadas permiten renovar el juego sin resetear las colecciones.

Puedes resetear:

```text
rating competitivo
misiones de temporada
leaderboards
```

pero conservar:

```text
unidades
niveles
historial
logros
```

---

# 62. FASE 26 — Eventos

Ahora sí puedes crear eventos temporales.

Ejemplo:

```text
Halloween 2027

Duración:
14 días

Personajes:
Calabaza Maldita
Bruja Espectral
Rey Espectral
```

Supply:

```text
5000
500
25
```

Después:

```text
mint cerrado
```

Nunca más se crean.

Pero siguen intercambiándose.

Eso da valor histórico.

---

# 63. FASE 27 — Bosses

Muy buena característica para WhatsApp.

Ejemplo:

```text
🐉 BOSS MUNDIAL

Dragón del Vacío

HP:
100,000
```

Todos atacan.

Guardas:

```text
damageByPlayer
```

Al morir:

```text
recompensa global
top damage
participación
último golpe
```

No des todo únicamente al #1.

Si haces eso, jugadores débiles dejarán de participar.

---

# 64. FASE 28 — Spawns en grupos

Esto puede ser una de las funciones más divertidas específicas de WhatsApp.

Ejemplo:

```text
⚠️ ¡Apareció un personaje!

🐺 Lobo Sombrío #0832

Rareza: Raro
```

Usuarios pueden:

```text
.ctucapturar
```

o incluso combatirlo.

Puedes utilizar:

```text
cooldowns
probabilidad por actividad
tiempo entre spawns
```

Pero cuidado:

No conviertas mandar mensajes en la forma óptima de farmear.

Si:

```text
100 mensajes = spawn
```

los grupos se llenarán de basura.

---

# 65. FASE 29 — Crafting

Esta es una fase que pondría muy tarde.

Podrías obtener:

```text
fragmentos
materiales
esencias
```

para:

```text
mejoras
rerolls
cosméticos
evolución
```

Pero el crafting puede inflar muchísimo la complejidad.

No lo construyas porque “todos los juegos tienen crafting”.

---

# 66. FASE 30 — Evoluciones

Por ejemplo:

```text
Panda Aprendiz
↓
Panda Guerrero
↓
Panda Maestro
```

Hay dos opciones.

### Cambiar la unidad

Mantener ID:

```text
PAND-00042
```

pero cambiar:

```text
characterId
```

### Crear nueva unidad

Destruir anterior y crear otra.

Yo prefiero mantener el mismo ID.

Así conserva historia.

---

# 67. FASE 31 — Sistema social

Cuando ya exista juego suficiente:

```text
perfil público
colección
showcase
títulos
favoritos
comparación
ranking
```

Ejemplo:

```text
.ctushowcase
```

muestra:

```text
Personaje favorito
unidad más rara
unidad más antigua
unidad con más victorias
```

Esto aumenta mucho el valor emocional de la colección.

---

# 68. FASE 32 — Clanes

Muy tarde.

No al principio.

Los clanes requieren:

```text
roles
miembros
permisos
economía
ranking
guerras
recompensas
moderación
```

Son prácticamente otro juego encima.

---

# 69. FASE 33 — Anti-exploits

Esto no es opcional cuando hay economía y comercio.

Debes validar siempre desde el servidor/bot.

Nunca confíes en argumentos del usuario.

Ejemplo:

```text
.ctucomprar UNIT 500
```

No uses el precio enviado.

Busca el precio real en `mercado.json`.

---

# 70. Operaciones delicadas

Especial atención a:

```text
crear unidades
transferir ownership
comprar
vender
trade
recompensas
monedas
supply
```

Todo eso debería pasar por funciones centralizadas.

---

# 71. Nunca permitas esto

```js
unidad.ownerId = nuevoOwner;
```

repartido en veinte archivos.

Haz:

```js
transferUnit({
  unitId,
  from,
  to,
  reason
});
```

Así puedes controlar:

```text
owner correcto
unidad bloqueada
unidad en combate
unidad vendida
historial
transacción
```

---

# 72. Bloqueo de unidades

Una unidad debería poder tener estados:

```text
available
battle
market
trade
locked
```

o simplemente un lock.

Ejemplo:

```json
"lock": {
  "type": "market",
  "referenceId": "MK-00021"
}
```

Así no puedes vender simultáneamente una unidad que ya está en trade.

---

# 73. Idempotencia

Este concepto te va a ahorrar duplicaciones.

Imagina:

```text
usuario gana boss
```

el bot procesa dos veces el evento por accidente.

Sin protección podría recibir:

```text
2 personajes
```

en vez de uno.

Puedes tener un `rewardId` único:

```text
boss_123_miguel
```

y verificar si ya se reclamó.

---

# 74. FASE 34 — Auditoría

Cuando haya economía, crea logs internos de acciones importantes.

No necesariamente archivos `.log` tradicionales.

Una base:

```text
transactions.json
```

podría registrar:

```json
{
  "id": "TX-123",

  "type": "unit_transfer",

  "unitId": "DRGC-0037",

  "from": "A",

  "to": "B",

  "reason": "market",

  "createdAt": "..."
}
```

Esto es muchísimo más útil que:

```text
[INFO] database modified
```

porque te permite reconstruir qué ocurrió.

---

# 75. FASE 35 — Tests

Si el proyecto se vuelve serio, aquí no hay escapatoria.

Las funciones más importantes deberían poder probarse sin WhatsApp.

Ejemplo:

```js
calcularDanio()
crearUnidad()
transferUnit()
comprarUnidad()
procesarTurno()
```

Puedes escribir tests para:

```text
no crear supply > máximo
no comprar sin monedas
no transferir unidad ajena
no atacar fuera de turno
no atacar después de terminar combate
```

---

# 76. Testea invariantes, no solo ejemplos

Una invariante sería:

> Toda unidad tiene exactamente un propietario.

Otra:

> El balance de un usuario nunca puede ser negativo.

Otra:

> Ningún serial puede repetirse para un mismo personaje.

Otra:

> No pueden existir dos batallas activas incompatibles para la misma unidad.

Esas reglas son más importantes que probar textos del bot.

---

# 77. FASE 36 — Balance

No intentes balancear mirando números.

Registra datos.

Por personaje:

```text
veces usado
victorias
derrotas
winrate
daño promedio
duración combate
```

Si:

```text
Dragón Carmesí:
68% winrate
```

probablemente tienes un problema.

---

# 78. Telemetría sencilla

Podrías guardar estadísticas agregadas.

```json
{
  "dragon_carmesi": {
    "matches": 420,
    "wins": 268
  }
}
```

No necesitas analítica empresarial.

Solo suficiente información para tomar decisiones.

---

# 79. Qué NO construir temprano

Hay una cantidad enorme de cosas tentadoras:

```text
clanes
casas
skins
crafting
torneos automáticos
subastas
profesiones
mascotas
quests narrativas
mapa
world boss
raids
guild wars
achievements gigantes
premium pass
```

No las hagas todavía.

Porque si:

```text
coleccionar → combatir → progresar
```

no es divertido, todas esas funciones solo esconden el problema.

---

# 80. Roadmap recomendado real

Si fuera tu proyecto, lo dividiría así.

## MVP 0.1 — Fundación

```text
DB multi-json
repositories
registro
perfil
catálogo personajes
unidades
ownership
starter
```

Resultado:

> El usuario puede registrarse y tener un personaje único.

---

## MVP 0.2 — Batalla

```text
equipos
1v1
ataques
daño
turnos
ganador
estadísticas
```

Resultado:

> Dos jugadores pueden pelear correctamente.

---

## MVP 0.3 — Progresión

```text
XP
niveles
recompensas
monedas
battle history
```

Resultado:

> Combatir produce progreso.

---

## Alpha 0.4 — Colección

```text
sobres
drops
rareza
supply
seriales
traits
variantes
```

Resultado:

> Conseguir personajes es interesante.

---

## Alpha 0.5 — Economía

```text
monedas
sources
sinks
daily
costes
ledger
```

Resultado:

> La economía tiene circulación.

---

## Alpha 0.6 — Mercado

```text
listings
comprar
vender
transferencias
historial
fees
locks
```

Resultado:

> Los personajes tienen una economía entre jugadores.

---

## Beta 0.7 — Combate avanzado

```text
3v3
estados
buffs
debuffs
elementos
switches
habilidades
```

Resultado:

> El combate tiene profundidad.

---

## Beta 0.8 — Contenido

```text
misiones
achievements
bosses
spawns
eventos
```

Resultado:

> Hay razones diversas para jugar.

---

## Beta 0.9 — Competitivo

```text
ranking
Elo
temporadas
recompensas
leaderboards
```

Resultado:

> Existe endgame competitivo.

---

## V1.0

```text
balance
anti-exploits
tests
administración
migraciones
analytics
documentación
```

Resultado:

> Sistema suficientemente sólido para crecer.

---

# 81. Algo importante sobre tu JSON

Tu sistema JSON actual es una muy buena elección para desarrollar.

No necesitas meter MongoDB porque “es profesional”.

Eso sería hacer infraestructura antes de necesitarla.

Pero debes saber cuándo JSON deja de ser apropiado.

---

# 82. Cuándo migrar de JSON

Mientras tengas:

```text
decenas
cientos
pocos miles
```

de unidades y baja concurrencia, probablemente estarás bien.

Cuando tengas muchas operaciones simultáneas de:

```text
mercado
combate
transferencias
economía
```

pueden aparecer problemas.

Especialmente porque:

```js
cargar()
modificar()
guardar()
```

puede tener condiciones de carrera.

---

# 83. Tu siguiente base probablemente debería ser SQLite

No Mongo.

No PostgreSQL inicialmente.

**SQLite.**

Porque te da:

```text
transacciones
índices
unicidad
consultas
foreign keys
atomicidad
```

sin necesitar un servidor.

Y puedes mantener exactamente tu API:

```js
getUsuario()
getUnidad()
transferUnit()
```

Si hiciste bien la capa repository, migrar será bastante sencillo.

---

# 84. Constraints importantes cuando migres

Ejemplo:

```sql
UNIQUE(character_id, serial)
```

garantiza:

> nunca existirán dos Dragón Carmesí #37.

También:

```sql
PRIMARY KEY(unit_id)
```

y relaciones para ownership.

La base empieza a proteger tu juego.

---

# 85. Diseño de comandos

Intentaría mantenerlos consistentes.

Por ejemplo:

```text
.cturegistro
.ctuperfil

.ctupersonajes
.ctuunidad
.ctuequipo

.ctupelea
.ctuatacar
.cturendirse

.ctubalance
.ctudiario

.ctuabrir
.ctutienda

.ctumercado
.ctuvender
.ctucomprar
```

Evita crear 80 comandos.

Cuando tenga sentido usa subcomandos:

```text
.ctuequipo ver
.ctuequipo agregar
.ctuequipo quitar
```

en lugar de:

```text
.ctuverEquipo
.ctuagregarEquipo
.ctuquitarEquipo
```

---

# 86. Capa de servicios

Yo acabaría con algo parecido a:

```text
services/
│
├── userService.js
├── unitService.js
├── battleService.js
├── economyService.js
├── marketService.js
├── dropService.js
└── rewardService.js
```

Ejemplo:

```js
unitService.createUnit()
unitService.transferUnit()
unitService.getUserUnits()
```

---

# 87. Los repositories hacen almacenamiento

```text
repository
↓
leer / guardar
```

Los services hacen reglas:

```text
service
↓
decidir si puede hacerse
```

Los commands hacen interfaz:

```text
command
↓
recibir WhatsApp
mostrar respuesta
```

Conceptualmente:

```text
WhatsApp
   ↓
Command
   ↓
Service
   ↓
Repository
   ↓
Database
```

Esa sería probablemente la arquitectura más importante de todo el proyecto.

---

# 88. Ejemplo real

Usuario escribe:

```text
.ctucomprar DRGC-0037
```

`ctucomprar.js`:

```js
const result = marketService.buyUnit(
  sender,
  unitId
);
```

`marketService`:

```text
verifica listing
verifica dinero
verifica owner
verifica lock
calcula fee
transfiere monedas
transfiere unidad
elimina listing
crea transaction
```

repository:

```text
lee/escribe datos
```

El command solo muestra:

```text
✅ Compraste Dragón Carmesí #37
por 5,000 ChengCoins.
```

Ese es el diseño sano.

---

# 89. Errores

También centralizaría errores.

Ejemplo:

```js
throw new GameError(
  'INSUFFICIENT_FUNDS'
);
```

Y el command renderer convierte:

```text
INSUFFICIENT_FUNDS
```

en:

```text
❌ No tienes suficientes ChengCoins.
```

No necesitas implementarlo inmediatamente, pero eventualmente ayuda mucho.

---

# 90. Sistema de permisos

Más adelante:

```text
player
moderator
admin
developer
```

Para comandos como:

```text
dar personaje
retirar unidad
dar monedas
inspeccionar transacciones
bloquear mercado
```

Los comandos administrativos deberían estar aislados.

---

# 91. Nunca uses comandos admin normales para corregir DB manualmente

Haz herramientas específicas.

Por ejemplo:

```text
.ctuadmin unit inspect ID
.ctuadmin unit transfer ID @user
.ctuadmin economy audit @user
```

Y registra cada uso.

Porque eventualmente tú mismo cometerás errores administrativos.

---

# 92. Versionado de datos

Añadiría desde temprano:

```json
{
  "_meta": {
    "version": 1
  }
}
```

No para backups.

Para migraciones.

Cuando cambies:

```text
schema 1
```

a:

```text
schema 2
```

puedes saber qué conversión necesita cada archivo.

---

# 93. Migraciones

Ejemplo:

Antes:

```json
{
  "coins": 500
}
```

Después:

```json
{
  "economy": {
    "coins": 500
  }
}
```

No quieres editar manualmente cientos de usuarios.

Creas:

```text
migrations/
001-economy-object.js
```

Esto parece exagerado ahora.

Dentro de varios meses probablemente agradecerás haberlo pensado.

---

# 94. Integridad de datos

Deberías poder ejecutar una herramienta:

```text
validateDatabase()
```

que compruebe:

```text
unidades sin owner
owners inexistentes
seriales duplicados
equipo con unidades ajenas
listings inválidos
balances negativos
combates corruptos
```

Eso es muchísimo más útil que simplemente detectar JSON inválido.

---

# 95. Filosofía económica

Hay algo que debes decidir conscientemente:

¿Quieres un juego?

¿O quieres una simulación especulativa de NFT?

Yo elegiría lo primero.

El mercado debe apoyar el juego.

No convertirse en el juego.

Si el loop óptimo termina siendo:

```text
comprar barato
vender caro
```

en lugar de:

```text
coleccionar
crear equipo
combatir
progresar
```

el diseño se desvió.

---

# 96. No uses dinero real inicialmente

Especialmente con propiedad, rareza y mercado.

Mantén:

```text
moneda virtual
```

Sin cash-out.

Sin promesas de valor real.

Sin criptomonedas.

Sin convertir unidades en inversiones.

Eso mantiene el proyecto muchísimo más manejable tanto técnica como conceptualmente.

---

# 97. Rareza ≠ fuerza

Quiero remarcarlo porque puede definir si el juego sobrevive.

Un legendario puede ser:

```text
más raro
más vistoso
más peculiar
más complejo
```

pero no necesariamente:

```text
+80% stats
```

Idealmente un jugador bueno usando unidades accesibles puede vencer a alguien con una colección rara.

---

# 98. Diferencia entre collector value y battle value

Podrías pensar incluso en dos valores independientes.

```text
valor competitivo
```

y:

```text
valor coleccionable
```

Ejemplo:

```text
Panda Fundador #001
```

puede ser muy caro y raro pero no especialmente poderoso.

Eso es sano.

---

# 99. Diseño para WhatsApp

Tienes una ventaja y una limitación.

La ventaja:

```text
comunidad ya existe
interacciones sociales naturales
grupos
menciones
competencia
```

La limitación:

```text
interfaz textual
muchos mensajes cansan
combates largos molestan
menús complejos frustran
```

Por eso optimizaría todo para pocas interacciones.

---

# 100. Combates cortos

Objetivo:

```text
3-8 turnos
```

por personaje.

No:

```text
35 turnos
```

Si cada combate genera 50 mensajes, la gente lo silenciará.

---

# 101. Mensajes condensados

En vez de:

```text
Atacaste.
```

después:

```text
Hiciste 20 daño.
```

después:

```text
Aplicaste quemadura.
```

un solo mensaje:

```text
🔥 Dragón Carmesí usó Llamarada.

💥 32 daño
🔥 Quemadura aplicada

Lobo Sombrío
❤️ 48/80
```

Mucho mejor.

---

# 102. Rate limiting

Necesitarás cooldowns para evitar:

```text
spam
doble comando
acciones simultáneas
```

Particularmente:

```text
capturar
abrir paquetes
atacar
mercado
```

---

# 103. Locks de combate

Cuando proceses:

```text
.ctuatacar
```

debes impedir que dos mensajes simultáneos procesen el mismo turno.

Conceptualmente:

```text
battle.locked = true
```

procesas.

Luego:

```text
false
```

Con JSON esto requiere cuidado.

---

# 104. Roadmap de desarrollo práctico

Si mañana estuviera construyéndolo contigo, el orden exacto sería:

```text
1. Terminar usuarios
2. Crear personajes.json
3. Crear unidades.json
4. Implementar unitRepository
5. Implementar createUnit()
6. Crear starter
7. Crear .ctupersonajes
8. Crear .ctuunidad
9. Crear equipo básico
10. Diseñar ataques
11. Crear battleService
12. Implementar desafío
13. Implementar aceptar
14. Implementar atacar
15. Implementar victoria
16. Añadir rewards
17. Añadir XP
18. Añadir moneda
19. Añadir sobres
20. Añadir supply limitado
21. Añadir traits
22. Añadir mercado
23. Añadir historial
24. Pasar 1v1 → 3v3
25. Añadir estados
26. Añadir eventos
27. Añadir ranking
28. Añadir temporadas
29. Migrar DB si hace falta
```

Ese orden minimiza rehacer trabajo.

---

# 105. Qué construiría ahora mismo

Tu próximo objetivo no debería ser:

```text
mercado
```

ni:

```text
bosses
```

ni:

```text
gacha
```

Tu próximo milestone debería ser:

> **Miguel puede registrarse, recibir una unidad única, verla y demostrar que es su propietario.**

Algo como:

```text
.cturegistro Miguel

✅ Registro completado.

.ctustarter panda

🎉 Has obtenido:

🐼 Panda Guerrero #0001
Rareza: Común
ID: PAND-000001

Este personaje ahora te pertenece.

.ctupersonajes

🎴 Colección de Miguel

🐼 Panda Guerrero #0001
Nivel 1
Victorias 0
```

Cuando eso funcione perfectamente, construyes:

```text
.ctupelea
```

---

# 106. Primer milestone jugable

El primer verdadero hito sería que puedas hacer:

```text
Miguel:
.ctupelea @Juan
```

Juan:

```text
.ctuaceptar
```

Bot:

```text
⚔️ COMBATE

Miguel
🐼 Panda Guerrero #001
❤️ 120

VS

Juan
🐺 Lobo Sombrío #004
❤️ 90

Turno:
Miguel
```

Miguel:

```text
.ctuatacar 1
```

Bot:

```text
🐼 Panda Guerrero usa Golpe Pesado.

💥 24 daño

🐺 Lobo Sombrío
❤️ 66/90

Turno de Juan.
```

Hasta que:

```text
🏆 Miguel gana.

🐼 Panda Guerrero #001
+35 XP

Miguel
+100 ChengCoins
```

Si consigues eso, **ya tienes un juego**.

Todo lo demás es expansión.

---

# 107. Segundo milestone

Después:

```text
.ctuabrir
```

y el jugador obtiene una nueva unidad.

Ahora tienes el loop:

```text
combatir
↓
ganar monedas
↓
obtener personajes
↓
mejorar colección
↓
crear mejor equipo
↓
combatir
```

Eso es tu core loop.

---

# 108. Tercer milestone

Mercado:

```text
coleccionar
↓
obtener duplicados
↓
vender
↓
comprar unidades deseadas
↓
completar colección
```

Ahora aparece la economía social.

---

# 109. Cuarto milestone

Eventos:

```text
contenido temporal
↓
unidades exclusivas
↓
actividad
↓
mercado
↓
prestigio
```

Ahora empieza el metajuego.

---

# 110. Tu métrica principal

Al desarrollar, una pregunta debería guiarte:

> ¿Esto genera una decisión interesante para el jugador?

Ejemplo malo:

```text
+5 ataque automáticamente
```

No hay decisión.

Ejemplo mejor:

```text
elige entre:
+5 ataque
+7 defensa
+4 velocidad
```

Hay decisión.

Ejemplo malo:

```text
abre paquete cada día
```

Rutina.

Ejemplo mejor:

```text
gasta 500 ahora
o ahorra 2500 para un paquete especial
```

Decisión.

---

# 111. Otra métrica importante

Pregunta:

> ¿Esto tiene una razón para existir dentro del loop?

Por ejemplo:

```text
traits
```

sirven porque:

```text
hacen únicas las unidades
```

Bien.

```text
20 monedas diferentes
```

probablemente no.

---

# 112. Lo que más riesgo tiene

Veo cinco riesgos grandes.

| Riesgo | Consecuencia |
|---|---|
| Scope gigantesco | nunca terminas |
| Economía inflacionaria | moneda pierde valor |
| Pay-to-win interno | combate aburrido |
| RNG excesivo | frustración |
| Arquitectura acoplada a comandos | reescrituras |

El primero es probablemente tu enemigo principal ahora.

Porque todas las ideas que hemos comentado son buenas y precisamente por eso es peligroso.

Puedes entusiasmarte con:

```text
bosses
mercado
NFT
eventos
traits
shiny
ranking
clanes
```

y no terminar nunca el combate básico.

---

# 113. Regla de desarrollo

Yo impondría esta regla al proyecto:

> **No empezar una fase nueva hasta que el flujo principal de la anterior pueda jugarse completamente.**

Por ejemplo:

No haces mercado si todavía:

```text
createUnit()
```

tiene bugs.

No haces 3v3 si:

```text
1v1
```

no funciona bien.

No haces eventos si:

```text
economía
```

todavía está rota.

---

# 114. Mantén una carpeta de diseño

Algo así:

```text
docs/
├── game-design.md
├── database.md
├── battle.md
├── economy.md
└── roadmap.md
```

No necesitas escribir novelas.

Solo decisiones.

Por ejemplo:

```text
Nivel máximo: 20
Equipo máximo: 3
Market fee: 5%
Starter: 3 opciones
Supply legendario: variable
```

Eso evita que dentro de tres meses te preguntes:

> ¿Por qué había decidido esto?

---

# 115. Un backlog separado

Ten tres categorías:

```text
NOW
NEXT
LATER
```

Por ejemplo:

### NOW

```text
unidad
starter
colección
```

### NEXT

```text
combate
XP
monedas
```

### LATER

```text
mercado
bosses
temporadas
```

Cuando tengas una idea increíble de:

```text
sistema de fusión celestial
```

no la programas.

La metes en:

```text
LATER
```

Eso protege al proyecto de tus propias ideas.

---

# 116. Arquitectura final que deberías perseguir

Algo así:

```text
WhatsApp
    │
    ▼
Commands
    │
    ▼
Services
    │
    ├──────────────┐
    ▼              ▼
Game Engine     Validators
    │
    ▼
Repositories
    │
    ▼
Database
```

Por dominios:

```text
Users
Characters
Units
Battles
Economy
Market
Rewards
Events
```

Y nunca:

```text
commands/
└── archivo gigante que hace todo
```

---

# 117. Cómo sabrás que el proyecto está bien diseñado

Deberías poder cambiar:

```text
WhatsApp → Discord
```

sin reescribir:

```text
combate
economía
unidades
mercado
```

Deberías poder cambiar:

```text
JSON → SQLite
```

sin reescribir:

```text
commands
battleService
marketService
```

Deberías poder añadir:

```text
nuevo personaje
```

modificando datos, no creando 10 nuevas funciones.

Deberías poder añadir:

```text
nuevo ataque
```

sin modificar el motor.

Eso es modularidad real.

---

# 118. Mi recomendación concreta para Chengdú ahora

Estás exactamente en el punto donde **conviene dejar de añadir comandos y construir primero el dominio interno**.

Yo haría ahora estas piezas:

```text
ChengdúData/
├── usuarios.json
├── personajes.json
├── unidades.json
└── databases.js

game/
├── users/
│   └── userService.js
│
├── characters/
│   └── characterService.js
│
└── units/
    ├── unitService.js
    └── unitGenerator.js
```

Y conseguiría que funcionen perfectamente:

```js
getUser()
registerUser()

getCharacter()

createUnit()
getUnit()
getUserUnits()
transferUnit()
```

Antes de programar una sola pelea.

Porque **propiedad + identidad de unidad** es el fundamento que diferencia tu proyecto de un simple bot RPG.

Después construimos batalla encima.

Y después economía.

Y después mercado.

Ese orden te deja un sistema mucho más limpio y te permite llegar pronto a algo jugable en vez de pasar meses construyendo infraestructura alrededor de un juego que todavía no existe.