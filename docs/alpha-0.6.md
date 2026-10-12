# Alpha 0.6 — Mercado entre jugadores

Fecha: 2026-10-11. Versión del juego: 0.6.0; esquema: 7. El mercado permite
publicar una unidad, comprarla y consultar su historial de propiedad, conservando
la identidad y progreso de cada personaje emitido.

## Publicar, consultar y comprar

Un jugador selecciona una unidad propia con `.ctupersonajes` y publica
`.ctuvender ID PRECIO`. El bot confirma precio, comisión y neto; la unidad sale
del equipo y queda bloqueada mientras el anuncio permanece activo.

| Comando | Resultado |
| --- | --- |
| `.ctumercado` | Cinco unidades en venta, empezando por las publicaciones más recientes. |
| `.ctumercado mios` | Anuncios activos del remitente y acción para retirarlos. |
| `.ctumercado raro` | Filtrar rareza; también común, épico y legendario, o sus IDs en inglés. |
| `.ctumercado precio` | Ordenar de menor a mayor precio. |
| `.ctumercado ver LIST-…` | Snapshot, precio, vendedor, vencimiento y acción correspondiente. |
| `.ctuvender UNIT PRECIO` | Publicar una unidad propia. |
| `.ctucomprar LIST-…` | Pagar el precio y recibir la unidad. |
| `.cturetirar LIST-…` | Retirar un anuncio propio. |
| `.ctuventas` | Compras y ventas del remitente, cinco por página. |
| `.ctupropiedad UNIT` | Emisión y propietarios sucesivos, cinco eventos por página. |

Desde 0.6.1, las páginas se eligen con números cortos: `.ctumercado 2`,
`.ctumercado raro 2`, `.ctumercado mios 2`, `.ctuventas 2` o
`.ctupropiedad PAND-000001 2`. Sin número se abre la página 1. Las listas muestran
la página actual y el total, con comandos para avanzar y volver conservando el
filtro o la unidad. Cada página refleja los resultados actuales; nuevos anuncios
o vencimientos pueden cambiar qué entradas ocupan una página.
Los anuncios propios y ventas se filtran siempre por el remitente autenticado.
Los comandos funcionan en grupo y en privado. Consultar el mercado y sus anuncios
permite comparar antes de registrarse; comprar o vender requiere un jugador autenticado.

Cada acción envía un mensaje con encabezado, separador, resumen y siguiente paso.
La lista prioriza personaje, nivel, rareza y precio. El detalle añade stats y
vencimiento; el vendedor ve retirar y los demás ven comprar. Los IDs aparecen
en los comandos que se copian, sin identidades de WhatsApp ni saldos ajenos.

## Precio, comisión y duración

La política inicial acepta precios enteros entre **20 y 1,000,000 ChengCoins**.
La comisión es **5% redondeado hacia arriba**, descontada del precio pagado.
El comprador paga el precio anunciado; el vendedor recibe el neto.

| Precio | Comisión | Recibe el vendedor |
| ---: | ---: | ---: |
| 20 | 1 | 19 |
| 21 | 2 | 19 |
| 100 | 5 | 95 |

La comisión sale de circulación al vender. Publicar, retirar o dejar vencer
un anuncio no cobra. Un anuncio dura **siete días** desde su publicación y
no admite editar el precio; se puede retirar y publicar de nuevo.

El vencimiento se procesa al consultar u operar el mercado, unidades y equipos,
mediante una transacción que cambia el estado y libera la unidad. No existe un
proceso programado adicional. Comprar un anuncio vencido devuelve el motivo
y confirma su desbloqueo sin cobrar; retirarlo después informa que ya venció.

La política conserva su versión para validar precios, comisiones y duración
de anuncios anteriores. Una regla futura añade otra versión en lugar de cambiar
la interpretación de ventas ya confirmadas.

## Unidad y equipo

Publicar exige que la unidad pertenezca al vendedor y esté libre. Se bloquea con
el anuncio y sale del equipo en el mismo commit. Mientras se ofrece no puede
combatir ni formar otro anuncio. Retirada, vencimiento o compra liberan el lock;
el propietario selecciona después la unidad para su equipo.

El anuncio fija nombre, rareza, rol, nivel, stats efectivos, progreso, rasgos y
variante de la publicación. Ese snapshot permanece intacto aunque cambie el
catálogo. Los ataques se consultan mediante `.ctuficha`; el anuncio conserva
el snapshot de stats y un combate aceptado fija sus propias definiciones.

La compra cambia propietario y aumenta la versión de propiedad. Conserva ID,
serial, personaje/revisión de emisión, origen, stats de nacimiento y combate,
XP, nivel, rasgos, variante y estadísticas. La unidad no se emite de nuevo ni
consume otro cupo de supply. La transferencia tampoco otorga XP.

Los límites del catálogo siguen vigentes. Cambiar propietarios hace
circular las unidades existentes y no restablece contadores ni crea otra
variante. Detalles del balance: [0.4.1](balance-0.4.1.md).

## Pagos únicos y recibos

Los comandos que publican, compran o retiran requieren el ID autenticado del
mensaje. La clave combina operación, conversación y jugador; un reintento
recupera el anuncio o recibo existente, incluso tras reiniciar o fallar el envío.
Un mensaje reutilizado con parámetros distintos devuelve un conflicto.

El pago de compra, crédito neto del vendedor, comisión, propietario, cierre del
anuncio, desbloqueo y evento de transferencia se confirman juntos. Dos compradores
simultáneos o una compra y una retirada producen un único resultado final.
Saldo insuficiente, compra propia o un anuncio cerrado no generan otro pago.

Una compra repetida conserva su precio y saldo originales. Si la unidad ya se
revendió, el recibo lo indica y dirige a la colección actual; no la recupera para
el comprador anterior. El starter y los sobres también conservan su emisión
original tras una venta y sus respuestas reconocen el cambio de propietario.

`.ctumovimientos` integra el gasto de compra y el crédito neto de venta. El precio
y comisión permanecen en el recibo; no se crea una cuenta administrativa para
la diferencia. Las monedas obtenidas por combate o diario sirven para comprar,
con las mismas reglas de saldo y recuperación que [Alpha 0.5](alpha-0.5.md).

## Historial y privacidad

`.ctuventas` sólo muestra operaciones donde participó el remitente. El comprador
ve sus importes y saldos, el vendedor los suyos; la API omite los saldos del otro
participante. Los nombres, unidad y precio permiten identificar la operación
sin mostrar IDs internos de jugadores ni JIDs.

`.ctupropiedad UNIT` es público y presenta emisión y transferencias por versión,
desde el primer dueño hasta el actual. La respuesta pública omite claves de
operación y referencias administrativas. El origen de starter o sobre permanece
en la unidad; una compra no se presenta como otra emisión.

Los combates y recompensas anteriores conservan sus participantes y datos.
La validación usa el dueño de aquella versión de propiedad; una venta posterior
no cambia el historial de combate del vendedor ni lo atribuye al comprador.

Alpha 0.6 implementa transferencias por compraventa. Regalos, intercambios
directos y otras operaciones de propiedad requieren servicios y validadores
propios en fases posteriores.

## Migración y crecimiento futuro

El esquema 7 añade `mercado.json`, `ventas.json` y una versión de propiedad
inicial de cero a unidades anteriores. Conserva eventos originales, saldos,
progreso, supply, seriales, catálogo, compras, diarios, combates y recompensas.
Los anuncios y ventas empiezan vacíos, sin inventar transacciones retroactivas.

Las catorce colecciones y el manifest suman quince archivos por snapshot del
journal. El arranque recupera journals anteriores antes de migrar, valida todo
y conserva un backup coherente. Si el proceso se interrumpe antes del commit,
revierte lo preparado; si ya estaba comprometido, completa todos los cambios.
Pago y propiedad no se publican como resultados separados.

Los eventos de emisión y transferencia, recibos y movimientos crecen fuera
de las unidades. Una migración futura a SQLite debe preservar IDs, seriales,
versiones, claves de operación, cursores equivalentes y orden de movimientos,
con restricciones únicas por anuncio/venta y vínculos de propiedad verificables.
Las nuevas mecánicas deben añadir políticas y fuentes sin reinterpretar datos
históricos. Contrato completo: [database.md](database.md).

## Verificación

Las pruebas usan bases temporales y un socket simulado. Cubren precio y redondeo,
snapshot tras cambios de catálogo, equipo y locks, compradores simultáneos,
compra frente a retirada, vencimiento exacto, saldos privados y filtros paginados.
Se comprueban propiedad y recibos después de revender una unidad, incluyendo
starters y unidades de sobre que ya habían combatido.

También se simulan desconexiones al entregar el recibo e interrupciones durante
la publicación de archivos, para recuperar pagos, unidad, evento y venta una
sola vez. La migración conserva datos previos y recupera journals antiguos.
La conexión a una sesión real de WhatsApp permanece pendiente del bot anfitrión.

Ejemplos: [whatsapp-preview.md](whatsapp-preview.md).
Diseño de colección: [Alpha 0.4](alpha-0.4.md).
