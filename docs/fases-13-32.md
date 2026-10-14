# Comunidad y clanes — versión 0.10.0

Entrega de las fases 13, 15, 29, 30, 31 y 32 de `project.md`, con revisión
completa de sus fases anteriores. Esquema JSON **11**. Las funciones anteriores
permanecen operativas; el catálogo conserva sus 10 personajes y los límites de
50 comunes, 35 raros, 20 épicos y 10 legendarios. Las apariciones conservan
**una hora mínima** entre spawns, comprobación cada 30 minutos, oportunidad del
25% y duración de 10 minutos.

## Clanes: empezar y reunir compañeros

```text
.ctuclan
.ctuclan crear BAM Casa del Bambú
.ctuclan invitar @Miguel
.ctuclan unirse C1
.ctuclan ver C1
.ctuclan top
.ctuclan top 2
```

Crear cuesta **300 ChengCoins**, retirados del juego, y requiere no pertenecer
a otro clan. La etiqueta tiene 2–6 letras/números y es única; el nombre admite
3–32 caracteres. Cada clan tiene un líder y hasta 15 integrantes. Sólo una
invitación de líder/oficial vigente permite entrar; dura 24 horas. Nadie puede
pertenecer a dos clanes. Después de salir o ser expulsado deben pasar 24 horas
antes de crear o entrar en otro.

Los códigos C1/C2 y G1/G2 son globales, permanentes y no se reciclan. Las listas
usan páginas numéricas. Los UUID se reservan para almacenamiento interno.

| Acción | Líder | Oficial | Miembro |
| --- | --- | --- | --- |
| Invitar jugadores | Sí | Sí | No |
| Aportar a la tesorería | Sí | Sí | Sí |
| Retirar a favor de un integrante | Sí | No | No |
| Ascender/degradar y transferir liderazgo | Sí | No | No |
| Expulsar/bloquear miembros ordinarios | Sí | Sí | No |
| Expulsar/bloquear oficiales | Sí | No | No |
| Desafiar, aceptar, rechazar o cancelar una guerra | Sí | Sí | No |
| Cobrar un premio personal ganado | Sí | Sí | Sí |

```text
.ctuclan rol @Miguel oficial
.ctuclan rol @Miguel miembro
.ctuclan lider @Miguel
.ctuclan expulsar @Miguel
.ctuclan ban @Miguel
.ctuclan unban @Miguel
.ctuclan salir
```

Nadie expulsa al líder ni se expulsa a sí mismo. El líder transfiere el mando
antes de salir; si es el último miembro, primero retira la tesorería y luego
su salida disuelve el clan. La etiqueta y el historial siguen reservados.
Durante un desafío pendiente no se cambia la plantilla; durante una guerra
activa no salen ni se expulsan los tres participantes reservados.

## Tesorería

```text
.ctuclan depositar 100
.ctuclan retirar 100
.ctuclan retirar 100 @Miguel
.ctuclan historial
.ctuclan historial 2
```

Aportes y retiros: enteros entre 10 y 1.000.000 ChengCoins. El aporte debita
el saldo real del jugador; el retiro debita la tesorería y acredita al miembro
indicado. Si falla un permiso, saldo o escritura, la operación completa se
revierte o se recupera desde el journal. Cada movimiento guarda actor, antes,
después, razón y recibo; el ledger personal muestra su origen legible.

## Guerras y clasificación

```text
.ctuclan guerra C2
.ctuclan aceptar G1
.ctuclan rechazar G1
.ctuclan cancelar G1
.ctuclan war G1
.ctuclan guerras
.ctuclan premio G1
```

Ambos clanes necesitan 3 miembros y sólo pueden mantener una guerra pendiente
o activa. El destinatario tiene 30 minutos para aceptar. Aceptar consume **100
de cada tesorería**; fija tres jugadores de cada lado: líder, seguido por los
integrantes más antiguos, con desempate determinista. La duración es 24 horas.
Cada pareja de clanes puede desafiarse una vez cada siete días.

Los participantes juegan `.ctupelea @rival` o `.cturanked @rival` en cualquiera
de sus grupos. La pertenencia a la guerra se congela al crear el desafío. Los
combates clásicos, anteriores a la aceptación, fuera de la plantilla, vencidos,
empatados, rendiciones demasiado tempranas y duelos bloqueados por el límite
normal de recompensas no puntúan. Una pareja de jugadores cuenta **una sola
vez** por guerra, aunque dispute varios duelos. Primero en alcanzar 3 victorias
gana; al vencer el plazo gana quien tenga mayor marcador, o se declara empate.
Un duelo puede resolver su Elo habitual y aportar a la guerra: no multiplica
sus recibos de combate ni entrega Elo adicional por ser de clan.

| Resultado | Premio a tesorería | Premio personal |
| --- | ---: | ---: |
| Victoria | 500 | 150 |
| Derrota | 100 | 50 |
| Empate | 150 | 75 |

El premio de tesorería se liquida automáticamente. El personal requiere haber
disputado al menos un duelo válido contado y se reclama una sola vez con
`.ctuclan premio G1`; estar inscrito sin participar no basta. La elegibilidad
sobrevive a cambios de miembros posteriores al final.

La clasificación de clanes da 3 puntos por victoria y 1 por empate, dentro
de las mismas ventanas de 30 días de las temporadas competitivas. Desempate:
victorias históricas, fecha de fundación e ID estable. Aunque no se haya jugado ranked,
se calcula la temporada con el mismo calendario competitivo; las guerras,
miembros y tesorería no se borran al renovar el ranking.

## Intercambios bilaterales

```text
.ctuintercambio crear @Miguel
.ctuintercambio oferta I1 100 PAND-000001
.ctuintercambio oferta I1 0 LOBO-000001 MAGO-000001
.ctuintercambio ver I1
.ctuintercambio confirmar I1
.ctuintercambio cancelar I1
.ctuintercambio mios
```

Cada jugador ofrece hasta 3 unidades y una cantidad entera de monedas. La propuesta
debe incluir al menos un bien; un regalo también requiere las dos confirmaciones. La primera confirmación congela **las dos ofertas**,
reserva todas las unidades y descuenta ambas aportaciones de monedas a escrow.
La segunda intercambia todos los bienes en una única transacción, sin comisión.
Nadie puede editar, vender, combatir o evolucionar una unidad reservada.

Cancelar o vencer a los 15 minutos devuelve todo exactamente una vez. Las
unidades permanecen en los equipos durante la reserva; sólo una transferencia
completada las retira del equipo del antiguo dueño. Cada jugador puede tener
5 propuestas abiertas y cada pareja sólo una. Los códigos I1 no se reciclan,
y la historia de propiedad distingue mercado de intercambio.

## Crafting y evolución

```text
.ctucrafting
.ctucrafting reclamar
.ctucrafting crear sello_evolucion
.ctucrafting crear insignia_bambu
.ctuevolucion PAND-000001
.ctuevolucion PAND-000001 confirmar
```

Los materiales se recogen de premios realmente ganados y registrados:

| Fuente | Fragmentos | Esencias |
| --- | ---: | ---: |
| Combate con premio válido, por participante | 2 | 0 |
| Misión cobrada | 2 | 0 |
| Logro cobrado | 3 | 1 |
| Premio de jefe | 3 | 1 |
| Bienvenida de evento cobrada | 1 | 0 |
| Premio de temporada cobrado | 3 | 1 |

Cada fuente aporta materiales una vez. El reclamo recoge hasta 100 fuentes por
mensaje; fuentes restantes se recogen con un nuevo mensaje. No se obtiene
material de una derrota por inactividad o una rendición sin premio válido.

| Receta | Materiales | ChengCoins | Resultado |
| --- | --- | ---: | --- |
| `sello_evolucion` | 5 fragmentos + 2 esencias | 100 | 1 sello |
| `insignia_bambu` | 3 fragmentos | 50 | Insignia y título A1, cosméticos permanentes |

Panda Guerrero → Panda Maestro; Mago Carmesí → Mago Arcano; Lobo Sombrío → Lobo
Lunar. Evolucionar exige nivel 10, una unidad propia disponible, un sello y
300 ChengCoins. Mejora los cuatro stats un **5%, redondeado hacia abajo**.

El `characterId` de nacimiento permanece intacto. La forma actual vive en un
campo `evolution` versionado y tiene su recibo. Se conservan ID, serial, rareza,
stats de nacimiento, rasgos, variante, propietario, progreso, equipo, origen e
historial. No se emite otra unidad ni se libera supply. Los combates, anuncios
y ataques a jefes guardan la forma usada: una evolución futura no cambia sus
snapshots ni su reproducción. Sólo se permite una evolución por unidad.

## Perfil público y showcase

```text
.ctuperfil @Miguel
.ctupersonajes @Miguel 2
.ctushowcase
.ctushowcase @Miguel
.ctusocial favorito PAND-000001
.ctusocial presentar PAND-000001 MAGO-000001
.ctusocial bio Coleccionista de bambú
.ctusocial titulos
.ctusocial titulo L1
.ctusocial comparar PAND-000001 LOBO-000001
```

La vitrina muestra favorito, destacados, unidad más rara, primera unidad y
unidad con más victorias. Favorito y destacados deben pertenecer al jugador;
si cambian de dueño dejan de mostrarse, conservando la selección histórica.
La presentación admite hasta 140 caracteres sin controles/saltos de línea.
Los títulos se eligen entre logros ganados (L1–L4), temporada cobrada (T1…) y
crafting A1. `favorito ninguno`, `titulo ninguno`, `presentar` y `bio` sin texto
permiten limpiar cada preferencia. El perfil público muestra progreso y rango;
no expone JID, identidades externas, wallet ni claves de operación.

## Obtención directa de personajes

`.cturecompensas` lista recompensas ganadas cuyo intento de personaje todavía
no fue consumido; no se pide copiar el UUID del premio.

| Comando | Fuente necesaria | Oportunidad de personaje |
| --- | --- | ---: |
| `.cturecompensas pvp` | Victoria con recompensa válida | 10% |
| `.cturecompensas mision` | Misión cobrada | 10% |
| `.cturecompensas logro` | Logro cobrado | 20% |
| `.cturecompensas boss` | Premio de jefe registrado | 10% |
| `.cturecompensas evento` | Bienvenida de evento cobrada; evento activo | 10% |
| `.cturecompensas ranking` | Premio de temporada cobrado, posición 1–3 | 100% |
| `.cturecompensas codigo CHENGDU` | Código de bienvenida | 100%, común |

Cada fuente/jugador tiene una única tirada, incluida la fallida; repetir el
mismo mensaje conserva el resultado y no genera otra. Nuevos premios ganados
dan oportunidades nuevas. El código admite **20 canjes globales**, uno por
jugador, del 13 de octubre al 13 de noviembre de 2026, intervalo UTC con final
exclusivo. Un premio ordinario usa catálogo base; el de evento usa personajes
exclusivos actualmente disponibles. La selección conserva pesos de rareza
70/22/7/1 y elección uniforme dentro de cada rareza disponible. Las categorías
agotadas se excluyen y los pesos restantes se renormalizan. Con todo el pool
agotado, el intento no se consume.

Starter, sobres y capturas mantienen sus flujos. Todos usan la misma emisión
central, contadores monotónicos y supply; las formas evolucionadas no forman
parte de un pool de mint. Ningún comando acepta origen o permisos inventados.

## Integración y persistencia

El anfitrión que importa `commands` o `createCommandRouter` carga los siete
plugins nuevos automáticamente. Reutiliza el singleton `game`; no abras otro
escritor sobre `ChengdúData`. Sigue invocando `observeGameActivity` después de
su moderación para apariciones automáticas. Esta entrega no modifica la sesión
del dispositivo anfitrión, cuyos `index.js`/`handler.js` no están en este repo.

El esquema 11 incorpora once colecciones vacías: `intercambios`,
`accionesintercambio`, `artesania`, `evoluciones`, `perfilessociales`,
`accionessociales`, `clanes`, `accionesclan`, `guerrasclan`, `accionesguerra` y
`obtenciones`. La migración conserva literalmente los registros de las 24
colecciones anteriores y sólo avanza sus metadatos. No concede monedas,
materiales, evoluciones, unidades o clanes retroactivos. Las fuentes previas
legítimas pueden reclamarse explícitamente mediante las interfaces nuevas.

Todos los recibos de acción son inmutables, los cambios de clan/guerra se
reproducen desde su historial y las monedas se reconstruyen desde el ledger.
Los cursores internos de auditoría no aparecen en comandos de paginación.
Las pruebas usan bases temporales y cubren recuperación en cada archivo,
concurrencia, permisos, falsificación, vencimiento y reintentos.

## Alcance posterior

Las fases 33–36 siguen separadas en el roadmap: ampliación de anti-exploits,
observabilidad de producción, herramientas administrativas globales y cierre
de V1.0. Ya existen validaciones de integridad y simuladores; eso no equivale a
haber probado el bot conectado a WhatsApp real ni a disponer de telemetría de
producción. SQLite, subastas, torneos, profesiones, mapas, premium y mascotas
siguen como decisiones posteriores, según el propio documento.

## Evidencia de cierre

La suite completa pasó **683 pruebas**. Se verificaron también los últimos
ajustes de interfaz con pruebas pertinentes, y se generaron **188 ejemplos**
de los **53 comandos**. La base local se migró 10→11 preservando sus 44
registros anteriores en 24 colecciones y agregando once vacías, con backup
coherente y sin journal/lock pendiente. Las pruebas y ejemplos no añadieron
jugadores a esa base.
