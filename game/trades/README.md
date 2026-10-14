# Intercambios directos

`createTradeService(storage, clock)` usa el mismo Unit of Work que el mercado,
el combate y el resto del juego. Sus comandos deben obtener `userId` del
remitente autenticado y `operationKey` del ID del mensaje de WhatsApp.

## API

| Método | Parámetros | Resultado |
| --- | --- | --- |
| `create` | `userId`, `opponentId`, `chatId`, `operationKey` | `{ trade, alreadyProcessed }` |
| `setOffer` | `userId`, `chatId`, `code`, `unitIds = []`, `coins = 0`, `operationKey` | `{ trade, alreadyProcessed }` |
| `confirm` | `userId`, `chatId`, `code`, `operationKey` | `{ trade, alreadyProcessed }` |
| `cancel` | `userId`, `chatId`, `code`, `operationKey` | `{ trade, alreadyProcessed }` |
| `getTrade` | `userId`, `chatId`, `code` | `trade` |
| `listMyTrades` | `userId`, `chatId = null`, `status = null`, `page = 1`, `limit = 5` | Página numerada con `items` |
| `sweepExpired` | Sin parámetros | Cantidad de intercambios vencidos |

Las vistas añaden `code` (`I1`, `I2`...), `participantNames` y `offeredUnits`.
Cada código corresponde a la posición de creación en la colección; cancelar,
vencer o completar un intercambio no reutiliza su código. Los comandos de un
intercambio solo se ejecutan por sus dos participantes en el chat original.

## Consentimiento y reservas

Un borrador dura 15 minutos desde su creación. Cada participante puede ofrecer
hasta tres unidades propias y monedas. Modificar una oferta reemplaza toda la
oferta de ese participante y no modifica la del otro. Los borradores no
reservan recursos, por lo que ambas ofertas se vuelven a verificar al confirmar.

La primera confirmación congela ambas ofertas. En una única transacción bloquea
todas las unidades con `{ type: 'trade', referenceId: trade.id }` y retira las
monedas de ambos saldos a una reserva contable. Las unidades conservan su lugar
en los equipos, pero el bloqueo impide combatir, venderlas o reservarlas de nuevo.

La segunda confirmación, de la otra persona, transfiere las unidades y acredita
las monedas a sus destinatarios en una única transacción. Los IDs, las
estadísticas, la progresión y el supply se conservan; aumenta únicamente la
versión de propiedad. Las unidades transferidas se retiran del equipo anterior.

Cualquier participante puede cancelar antes de la segunda confirmación. Cancelar
o vencer devuelve exactamente las monedas reservadas a sus propietarios y libera
las unidades, conservando sus equipos. Para cambiar una oferta congelada hay que
cancelar y crear un intercambio nuevo. Hay un máximo de cinco intercambios
abiertos por persona y uno por pareja entre todos los chats.

## Registro y validación

`intercambios` guarda el estado actual. `accionesintercambio` es un historial
inmutable de acciones `create`, `offer`, `confirm`, `cancel` y `expire` con
instantáneas `before`/`after`, movimientos y transferencias. Las reservas incluyen
propietario, versión de propiedad, progresión y resultados de combate.

Cada movimiento de monedas usa la fuente `${action.id}:${userId}` y su recibo es
`coin:${sourceId}`. Las fuentes permitidas son `trade_escrow` (débito),
`trade_settlement` (crédito) y `trade_refund` (crédito). El validador vincula cada
recibo con el importe, la persona y la dirección que exige la oferta congelada.

Las transferencias pasan por `transferUnitInTransaction` con `reason: 'trade'`,
`sourceId: trade.id` y clave `transfer:${trade.id}:${unit.id}`. El historial de
propiedad las vincula con la acción de segunda confirmación y su versión previa.

Las claves de operación no se reutilizan para acciones distintas. Repetir una
acción confirmada después de reiniciar devuelve su resultado sin cobrar, volver
a reservar, transferir ni devolver monedas por segunda vez. El journal del
almacenamiento publica conjuntamente saldos, bloqueos, eventos y recibos.
