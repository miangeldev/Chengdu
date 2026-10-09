# MVP 0.2 — Equipos y combate

Fecha: 2026-10-08. Estado: implementación local validada. Continúa el milestone de
batalla de `../project.md`; la sesión real de WhatsApp la proporciona el bot anfitrión.

## Flujo jugable

1. Cada jugador se registra y reclama su starter.
2. Selecciona una unidad propia: `.ctuequipo usar PAND-000001`.
3. En un grupo, desafía a otro jugador registrado: `.ctupelea @jugador`.
4. Sólo el destinatario acepta con `.ctuaceptar` o rechaza con `.cturechazar`.
5. El bot muestra HP, unidad, turno y dos ataques. El jugador activo usa
   `.ctuatacar 1` o `.ctuatacar 2`.
6. El combate termina por HP agotado, rendición, límite de turnos o inactividad.
   Se actualizan estadísticas y se liberan las unidades en el mismo commit.

El creador puede retirar un desafío pendiente con `.ctucancelar`.
`.ctucombate` muestra el estado o el resultado más reciente del jugador en ese
grupo. Los comandos de batalla admiten grupos; equipos y colección también se
consultan en conversaciones privadas.

Cada turno se presenta en un único mensaje compacto: resultado del ataque
anterior, daño o fallo, HP de ambos jugadores y dos ataques con su potencia.
Las barras de vida usan diez caracteres `▓` y `▒`; se pueden ocultar con
`battleHealthBars: false` en `CTU-config.js` o en las opciones del router.
Los IDs, seriales, precisión y atributos no aparecen en el mensaje normal.

`.ctuficha` muestra estadísticas y precisión de ambas unidades durante una
batalla; antes de ella muestra el equipo seleccionado. En privado también puede
consultarse el combate activo propio. `.ctuficha ID` permite inspeccionar una
unidad concreta. Las unidades ocupadas muestran sus stats y ataques fijados en
el combate, aunque el catálogo se haya actualizado. La ficha es una consulta;
no consume el turno. Inicio, victoria, empate y cierre tienen mensajes propios.

El mismo formato compacto se aplica al resto de la interfaz: un encabezado y
separador, resúmenes breves y una acción principal. Catálogo y colección muestran
cinco entradas por página. Los IDs se reservan para acciones que deben identificar
una unidad concreta o para inspección; el perfil muestra progreso y estadísticas.
`.ctuficha panda`, `mago`, `lobo` o un ID de personaje del catálogo permite consultar
stats base y ataques antes de elegir starter, incluso sin haberse registrado.
`.ctuunidad ID` reúne serial, propietario, progreso y procedencia; su enlace de
ficha permite consultar las estadísticas y precisión. La ayuda agrupa usos breves.

## Reglas de esta versión

| Regla | Decisión |
| --- | --- |
| Equipo jugable | Una unidad; el modelo conserva una lista para ampliar a tres. |
| Inicio | Mayor velocidad; en empate inicia quien desafió. |
| Ataque 1 | Potencia 25, precisión 100%. |
| Ataque 2 | Potencia 40, precisión 80%. |
| Daño | `max(1, power + attack - defense)`, limitado al HP restante. |
| Fallo de precisión | Daño cero y cambio de turno. |
| HP | Vive dentro del snapshot de combate; la unidad original conserva sus stats. |
| Desafío pendiente | Vence en 5 minutos; reserva ambos jugadores. |
| Combate activo | Vence tras 30 minutos sin una acción válida. |
| Límite de seguridad | 50 ataques; si ambos siguen con HP, termina sin ganador. |
| Rendición | Permitida en cualquier turno; gana el otro jugador. |
| Estadísticas | Al cerrar una batalla aceptada, ambos suman un combate; sólo con ganador se suman victoria/derrota. |
| Recompensas | XP, monedas y drops corresponden a 0.3 y posteriores. |

No hay estados, elementos, críticos ni habilidades especiales en esta versión.
Los nombres de ataque son datos del catálogo y no condiciones del motor.

## Arquitectura y datos

- `game/teams/teamService.js`: selección y verificación de propiedad.
- `game/battle/engine.js`: resolución pura de ataque y daño.
- `game/battle/battleService.js`: desafío, aceptación, acciones y consultas.
- `game/battle/lifecycle.js`: cierre, expiración, estadísticas y liberación de locks.
- `game/units/unitService.js`: ficha de estadísticas y ataques actuales o fijados en combate.
- `game/characters/characterService.js`: fichas de plantilla y ataques del catálogo actual.
- `interfaces/whatsapp/format.js`: formato común de tarjetas, secciones y barras de texto.
- `interfaces/whatsapp/battleFormat.js`: presentación del estado y resultado.
- `plugins/CTU-*.js`: comandos compatibles con `command` y `run(sock, msg, args)`.

El esquema 2 añade `ataques.json` y `combates.json`. Cada ataque tiene revisión,
potencia y precisión. Cada combate conserva jugadores, grupo, estado, deadlines,
snapshots de unidades y ataques, turno, acciones, motivo de cierre y ganador.
`rulesVersion: 1` identifica las reglas actuales, separado de la versión del esquema.

Las unidades activas tienen `lock: { type: 'battle', referenceId: battleId }`.
No se permite cambiar el equipo mientras haya combate activo, participar en dos
combates abiertos ni actuar desde otro grupo o como otro jugador. La aceptación
vuelve a verificar las unidades elegidas; los snapshots se fijan en ese momento.

El ID de mensaje autenticado del anfitrión se combina con grupo, usuario y tipo
de acción para generar una clave de operación. Los ataques, rendiciones,
desafíos y aceptaciones repetidos reutilizan su resultado cuando tienen esa clave.
Una acción aplicada no se vuelve a ejecutar; el anfitrión también debe deduplicar
eventos de transporte, incluidas solicitudes inválidas que nunca se aplicaron.
Sin ID de mensaje se siguen validando turno y estado, pero no se identifica un
replay retrasado mediante clave.

## Migración de 0.1

La unidad de trabajo recupera primero cualquier journal antiguo y valida el
esquema 1 completo. Luego realiza un commit del esquema 2 con backup coherente.
Conserva usuarios, identidades, equipos, economía, progreso, unidades, seriales,
orígenes, reclamos y auditoría. Se añaden ataques a las plantillas que tenían la
lista vacía y se incrementa su revisión de contenido; los stats individuales de
las unidades existentes permanecen iguales.

La recuperación admite tanto journals anteriores de seis archivos como los
actuales de ocho. Una migración interrumpida se descarta antes del marcador de
commit o se completa después de él. Nunca se crean unidades de reemplazo ni se
concede otro starter al migrar. Datos corruptos, esquemas futuros y archivos
incompletos se conservan y bloquean la escritura.

## Expiración e integración

La expiración se procesa al consultar perfil, unidades, equipo o combate, y antes
de modificar equipos o batallas. El anfitrión puede llamar a
`game.battle.sweepExpired()` periódicamente para limpiar sin esperar un comando.
El módulo no mantiene un temporizador ni envía mensajes espontáneos.

Las menciones del desafío se obtienen de `mentionedJid` en los metadatos del
mensaje, no interpretando un número escrito como argumento. También se admite
un ID interno `USR-...` de un jugador existente. El anfitrión debe aportar
metadatos autenticados y vincular aliases de identidad sólo después de verificarlos.

## Verificación

78 pruebas ejecutadas con `node --test --test-isolation=none`: registro/starter,
colecciones, propiedad, migraciones, journals antiguos, ataques, turnos, fallos
de precisión, snapshots, duplicados, rendición, expiración, límites, estadísticas
y recuperación de escrituras interrumpidas. Se incluye el flujo completo con un
socket de WhatsApp simulado y la terminación real de un proceso hijo.
También se prueban los 16 plugins con su exportación directa `run` y el registro
del error original en el servidor. La traza en WhatsApp se muestra sólo con debug
activado en `CTU-config.js`, el entorno `CTU_DEBUG` o la opción `debug` del router.
En esta etapa de desarrollo, el archivo de configuración lo habilita por defecto.

Ejemplos de la interfaz: [whatsapp-preview.md](whatsapp-preview.md).
La prueba con una sesión real de WhatsApp sigue pendiente del bot anfitrión.
