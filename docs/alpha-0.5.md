# Alpha 0.5 — Economía inicial

Fecha: 2026-10-11. Versión del juego: 0.5.0; esquema de datos: 6. Esta fase añade
diario, tienda y consulta de movimientos sobre la economía de Alpha 0.4.
Conserva el balance de combate y los límites globales de emisión de 0.4.1.

## Flujo del jugador

Un jugador registrado puede reclamar 100 ChengCoins con `.ctudiario`. A las
24 horas del último reclamo se habilita el siguiente. Las monedas permiten
comprar un Sobre Básico de 500 ChengCoins desde `.ctutienda` y ampliar la colección.
El saldo y las operaciones se consultan cuando el jugador lo necesita.

| Comando | Resultado |
| --- | --- |
| `.ctudiario` | Reclamar 100 ChengCoins y ver saldo y próxima disponibilidad. |
| `.ctutienda` | Precio y disponibilidad de los sobres, con el comando para comprar. |
| `.ctuabrir basico` | Comprar el Sobre Básico por 500 ChengCoins y obtener una unidad. |
| `.ctusobres` | Probabilidades actuales de personajes, rasgos y variantes. |
| `.ctubalance` | Saldo, ingresos, gastos y disponibilidad del diario. |
| `.ctumovimientos` | Cinco movimientos propios, empezando por los últimos confirmados. |
| `.ctumovimientos CURSOR` | Continuar con el comando que entrega la página anterior. |

Los comandos funcionan en grupo y en privado. Cada acción envía un solo mensaje
con encabezado, separador, resumen y siguiente paso. Tienda muestra precio y
disponibilidad; las probabilidades se consultan con `.ctusobres`. Los movimientos
usan fuente, importe y fecha/hora de Ciudad de México, sin IDs internos ni
identidades de otros jugadores.

## Diario de 24 horas

La espera es una ventana móvil desde el último reclamo, compartida entre todos
los chats del jugador. Si reclama el 11 de octubre a las 14:00 de Ciudad de
México, el próximo se habilita el 12 de octubre a las 14:00. Cambiar de grupo o
esperar a medianoche no adelanta la disponibilidad.

El diario entrega sólo ChengCoins. El importe permanece en 100 por reclamo;
el nivel y la XP de jugador/unidades continúan creciendo mediante combates.
La política de recompensa conserva su versión para validar diarios anteriores
si más adelante cambia el importe o la duración.

El bot necesita el ID autenticado del mensaje para confirmar el reclamo.
Repetir el mismo mensaje devuelve su recibo original y el saldo de aquel
momento, incluso después de un reinicio o si falló el envío de la respuesta.
La interfaz identifica ese resultado como un recibo anterior y permite consultar
el saldo actual. No vuelve a acreditar monedas.

Un mensaje nuevo durante la espera indica la próxima fecha de disponibilidad.
Cuando pasan las 24 horas, un mensaje nuevo solicita el siguiente diario.
Un reloj inválido o que retrocede no habilita un premio anticipado. Cada crédito
respeta el rango de enteros seguros; una operación inválida se cancela completa.

## Tienda y gastos

La tienda reúne los sobres existentes. El Sobre Básico mantiene precio, pesos,
rasgos y variantes de 0.4, y utiliza el mismo contrato transaccional de compra.
Cinco reclamos diarios entregan las 500 ChengCoins necesarias para una apertura.
También se pueden usar monedas obtenidas al combatir.

El gasto se confirma junto con la emisión de la unidad y el recibo de apertura.
Saldo insuficiente o contenido agotado rechazan la compra antes de cobrar. Las
probabilidades se ajustan a los personajes disponibles. Una compra repetida con
el mismo mensaje conserva su resultado y precio originales.

La compra entrega la unidad, sin modificar XP ni regenerar stats, rasgos o
variantes de otras unidades. Estas propiedades de nacimiento siguen siendo
inmutables. Los detalles de emisión y probabilidades están en
[Alpha 0.4](alpha-0.4.md) y [balance 0.4.1](balance-0.4.1.md).

## Movimientos y saldo

El historial económico integra créditos de combate, créditos de diario y gastos
de sobres. Sólo se consulta la cuenta del remitente autenticado. Los cursores se
vinculan a su jugador; usar uno de otra cuenta devuelve un error de página.

La lista muestra primero las operaciones confirmadas más recientes, siguiendo
el orden del ledger. Dos movimientos pueden compartir fecha y distintas fuentes
pueden registrar un reloj anterior; la secuencia de confirmación conserva el
orden de saldos. La página siguiente continúa esa secuencia sin mezclar cuentas.

El balance resume monedas actuales, ingresos y gastos históricos. Un saldo
inicial preservado al migrar se presenta por separado. La API calcula los
totales con `BigInt` y devuelve ingresos/gastos como strings decimales, para
conservar precisión aunque superen el rango de un saldo individual. El saldo
actual continúa siendo un entero seguro.

## Datos, migración y recuperación

El esquema 6 añade `diarios.json`. Cada recibo conserva jugador, clave de
operación, fecha, política, importe, duración de espera, próxima disponibilidad
y saldo antes/después. La política 1 entrega 100 monedas y espera 86,400,000 ms.

Cada diario tiene exactamente un movimiento `daily_reward` en `economia.json`
con el mismo jugador, importe, fecha y saldos. Recibo, crédito y saldo se
publican en el mismo commit. Los registros son inmutables; repetir una operación
recupera lo guardado y no recrea el crédito.

El mapa histórico `DAILY_POLICIES` conserva las reglas por versión. Añadir una
política exige mantener las anteriores para validar sus recibos, en lugar de
reemplazar una constante y reinterpretar todos los reclamos existentes.

La migración 5 → 6 preserva exactamente los registros de las once colecciones
anteriores y comienza con diarios vacíos. Conserva usuarios, saldo, XP, unidades,
stats de nacimiento/combate, seriales, límites, compras y combates. No concede
monedas retroactivas. Las doce colecciones y el manifest suman trece archivos
por snapshot del journal.

La recuperación admite journals anteriores antes de migrar y guarda un backup
coherente. Una interrupción anterior al commit revierte todo lo preparado;
después del commit completa todo lo comprometido. El reclamo nunca se confirma
con sólo su saldo o sólo su recibo. Detalles en [database.md](database.md).

## Crecimiento de la economía

El catálogo inicial suma 270 cupos globales, compartidos entre starters, sobres
y emisiones administrativas. Los límites anteriores más bajos y las emisiones
ya realizadas pueden reducir lo disponible. Los diarios y premios de batalla
continúan funcionando cuando se agotan los sobres.

La evolución de la economía debe estudiar acumulación de monedas y gastos a
largo plazo, incorporando gastos repetibles o comisiones cuando las nuevas
mecánicas los justifiquen. Mercado y transferencias corresponden a fases
posteriores y requieren sus propias operaciones y validadores; no amplían
automáticamente el supply ni cambian identidades de nacimiento.

## Verificación

Las pruebas usan almacenamiento temporal y un socket simulado. Comprueban
reclamo inicial, frontera exacta de 24 horas, mensajes repetidos, concurrencia,
reloj inválido o que retrocede, saldos y recibos después de reiniciar, auditoría
y recuperación de interrupciones. La migración preserva los datos y comienza
sin diarios ni premios retroactivos.

El adaptador verifica una respuesta por comando, prefijo personalizado, hora
de Ciudad de México, tienda compacta, páginas propias, rechazo de cursores
ajenos y una compra financiada con cinco diarios. También simula una desconexión
al entregar el diario: tras reiniciar, repetir el mensaje recupera el recibo
original sin pagar otra vez. La conexión con una sesión real de WhatsApp
permanece pendiente del bot anfitrión.

Ejemplos de mensajes: [whatsapp-preview.md](whatsapp-preview.md).
Diseño de progresión: [MVP 0.3](mvp-0.3.md).
