# Alpha 0.4 — Colección

Fecha: 2026-10-09. Alcance de `project.md`: sobres, motor de drops,
probabilidades, rasgos y variantes. La interfaz conserva un mensaje por acción,
encabezado y separador comunes, con los detalles de combate bajo demanda.

## Flujo del jugador

Las ChengCoins obtenidas al combatir permiten abrir un sobre. `.ctusobres`
muestra precio y probabilidades actuales; `.ctuabrir basico` confirma la compra
y presenta personaje, rareza, variante, rasgos y saldo restante. Los comandos
para consultar la ficha o seleccionar la unidad se pueden copiar del resultado.

| Comando | Resultado |
| --- | --- |
| `.ctusobres` | Precios, rarezas disponibles y probabilidades de rasgos/variantes. |
| `.ctuabrir basico` | Descontar el precio y obtener una unidad. Acepta `básico`. |
| `.ctupersonajes` | Colección paginada, variante especial y cantidad de rasgos. |
| `.ctuunidad ID` | Identidad, dueño, progreso y sobre de procedencia. |
| `.ctuficha ID` | Stats efectivos, ataques y efectos concretos de los rasgos. |

Sobres y aperturas funcionan en grupos y conversaciones privadas. El mensaje de
apertura no muestra IDs internos de compras ni identidades de WhatsApp. Los IDs
de unidad sólo aparecen dentro de las acciones para inspeccionarla o equiparla.

## Sobre Básico

Precio inicial: **500 ChengCoins**. Cada apertura entrega un personaje de la
selección versionada del sobre.

| Rareza | Probabilidad inicial | Personajes |
| --- | ---: | --- |
| Común | 70% | Panda Guerrero, Mago Carmesí, Lobo Sombrío |
| Raro | 22% | Monje Celestial, Guardián Jade |
| Épico | 7% | Bruja Lunar, Espíritu Bambú |
| Legendario | 1% | Dragón Carmesí |

Primero se elige la rareza y después un personaje disponible de esa categoría,
con la misma probabilidad entre sus candidatos. Un personaje agotado o cuya
emisión esté cerrada deja de participar. Si se agota una categoría completa,
su peso se elimina y se normalizan las otras probabilidades. Por ejemplo, sin
legendarios: común 70/99, raro 22/99 y épico 7/99. `.ctusobres` muestra esos
valores actuales, redondeados a dos decimales. Sin candidatos, la apertura se
rechaza antes de cobrar.

## Rasgos y variantes

Distribución inicial de cantidad de rasgos: 80% ninguno, 19% uno y 1% dos.
Se eligen entre los siguientes, sin repetir el mismo rasgo en una unidad:

| Rasgo | Efecto |
| --- | --- |
| Robusto | +3% HP, redondeado hacia abajo. |
| Agresivo | +1 ataque. |
| Firme | +1 defensa. |

Los efectos se calculan sobre los stats del nivel actual; no alteran los stats
de nacimiento ni las reglas de precisión. Un combate aceptado conserva su
snapshot de stats y ataques durante toda la partida. Un cambio posterior de
catálogo no recalcula un combate que ya empezó.

Variantes: 94% Normal, 5% Shiny y 1% Dorada (`golden`). Son cosméticas y no
modifican HP, ataque, defensa ni velocidad. Rasgos y variante se generan una
sola vez, junto con la emisión de la unidad, y conservan una versión de reglas.
Las unidades anteriores mantienen sus rasgos/variantes e identidad; la
migración no les asigna efectos nuevos de forma retroactiva.

Estos precios, pesos y bonos son decisiones de balance inicial, centralizadas
en el catálogo de sobres y las reglas de coleccionables. Las definiciones y
resultados históricos se guardan con su versión para permitir ampliar el
contenido más adelante sin reinterpretar compras anteriores.

## Compra única y recibo histórico

El bot requiere el ID autenticado del mensaje de WhatsApp para abrir un sobre.
Combina ID, conversación y jugador en una clave de operación. Reprocesar ese
mismo mensaje devuelve el resultado y recibo originales, aunque cambien el
nombre del personaje o el saldo actual; no vuelve a sortear ni a cobrar. Un
mensaje nuevo confirma una apertura nueva si existe saldo y contenido.

El recibo conserva precio, saldo antes/después, sobre/revisión, personaje/
revisión, serial, rasgos y variante. El gasto, recibo, emisión, contador global
y unidad se publican en una misma transacción. Si el proceso se interrumpe,
la recuperación publica todo o revierte todo. Una compra no puede usar saldo
negativo ni desbordar enteros seguros. Las aperturas tampoco conceden XP.

El detalle público de una unidad identifica el sobre de origen y a su dueño;
no expone saldos ni datos de compra del propietario a otros jugadores.

## Verificación y ejemplos

Las pruebas de WhatsApp usan jugadores y almacenamiento temporales. Generan
monedas mediante victorias reales, abren un sobre, inspeccionan la unidad y
repiten el mensaje de compra. Comprueban que el saldo se descuenta una vez,
que no se ejecuta otra tirada y que el texto conserva el resultado original.
También verifican prefijo personalizado, una respuesta por comando y errores
de argumentos, saldo insuficiente, mensaje sin ID y operación conflictiva.
Se simula una desconexión al enviar el recibo: después de reiniciar, repetir
el mensaje entrega la compra original sin descontar monedas ni sortear otra vez.

`npm run preview:whatsapp` genera ejemplos de la interfaz con una base temporal
y un generador determinista para ilustrar un personaje legendario de variante
Dorada con dos rasgos. El generador real usa aleatoriedad criptográfica. No se
han creado jugadores ni compras ficticias en la base del proyecto, ni se ha
conectado una sesión real de WhatsApp durante esta verificación.

Ejemplos: [whatsapp-preview.md](whatsapp-preview.md).
Contrato de datos y migraciones: [database.md](database.md).
