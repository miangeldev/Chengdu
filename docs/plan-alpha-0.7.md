# Plan de Alpha 0.7 — Combate avanzado

Esta fase desarrolla el combate avanzado del roadmap de `project.md` (allí
denominado Beta 0.7), con el nombre Alpha 0.7 solicitado para esta entrega.
Incluye las fases de equipo de tres, estados y eventos, PvP avanzado y elementos.
Conserva los sistemas entregados en 0.1–0.6.1; contenido, misiones, ranking,
temporadas, regalos y trueques siguen en sus fases posteriores.

## 0.7.1 — Reglas y datos versionados

- Mantener las reglas 1 para partidas clásicas y snapshots históricos.
- Añadir reglas 2 y esquema 8 sin cambiar los catorce archivos de colecciones.
- Añadir perfiles declarativos de elemento, pasiva y ataques avanzados al catálogo.
- Preservar nacimiento, stats individuales, XP, owners, supply y recibos anteriores.
- Recuperar journals antiguos antes de migrar y respaldar el conjunto completo.

## 0.7.2 — Equipos y formatos

- Equipos ordenados de una a tres unidades propias, sin duplicados ni unidades en venta.
- Seleccionar, agregar, quitar, limpiar y reordenar slots.
- Combates avanzados 1v1, 2v2 y 3v3 entre equipos del mismo tamaño.
- Bloquear todos los slots durante el combate y liberar todos al cerrar.
- Conservar el modo clásico como alternativa explícita y para clientes anteriores.

## 0.7.3 — Motor de acciones

- Turnos alternos, dos ataques por unidad y prioridad inicial por velocidad.
- Cambio voluntario de personaje que consume una acción.
- Relevo automático a la siguiente reserva viva tras un KO.
- Victoria al derrotar el equipo completo, rendición e inactividad.
- Máximo de cien acciones en combate avanzado para evitar bloqueos permanentes.
- Eventos de daño, efectos, habilidades y relevo dentro de una sola respuesta.
- RNG registrado y replay determinista desde los snapshots, sin consultar contenido nuevo.

## 0.7.4 — Elementos, efectos y habilidades

- Ventajas moderadas: 125% de daño; resistencias: 80%.
- Ciclo fuego → naturaleza → agua → fuego; neutral y enfrentamiento luz/oscuridad.
- Ataques físicos y mágicos, con precisión visible en la ficha.
- Veneno, quemadura, aturdimiento, escudo, regeneración, ataque aumentado y defensa reducida.
- Duración, reemplazo y ticks explícitos; estado conservado al cambiar a la banca.
- Pasivas de entrada declarativas, una activación por unidad y combate.
- Cooldowns de habilidades y un ataque básico siempre disponible.

## 0.7.5 — Integración con progresión y mercado

- Una recompensa de monedas y XP de jugador por cierre, sin multiplicarla por slots.
- Repartir la XP total de unidad entre participantes reales, en orden de equipo.
- Mantener el límite por pareja, el mínimo de ataques para rendición y la inactividad sin premios.
- Reservas que nunca entraron no ganan XP ni victorias/derrotas.
- Impedir vender cualquier slot bloqueado; conservar propiedad e historial tras futuras ventas.
- Saldos, premios, estadísticas y desbloqueos en un único commit recuperable.

## 0.7.6 — WhatsApp

- Mensajes compactos: resultado, activos con HP, banca y dos ataques disponibles.
- Comando `.ctucambiar SLOT` y opciones de cambio sólo cuando son válidas.
- Efectos relevantes en el turno; precisión, elementos, pasivas y cooldowns bajo `.ctuficha`.
- Historial de acciones legible, incluyendo cambios y efectos.
- Mantener páginas numéricas, filtros, prefijo configurable y privacidad.

## 0.7.7 — Validación y entrega

- Pruebas de reglas, elementos, efectos, cooldowns, relevos y límites de turno.
- Pruebas de compra/equipo/locks, propiedad, XP repartida y antifarm entre formatos.
- Duplicados, compras/acciones concurrentes, errores de transporte y reinicios.
- Migraciones desde todas las versiones anteriores, journals interrumpidos y corrupción.
- Suite completa de las fases anteriores, adaptando sólo expectativas de versión
  o funciones que se amplían de manera intencional.
- Simulación de balance reproducible y vistas previas reales en una base temporal.
- Migración de la base del proyecto con respaldo y comparación de registros.
- Documentación de reglas, interfaces, límites y pendientes de fases posteriores.

La conexión real de WhatsApp depende del bot anfitrión, ausente en este workspace.
La validación aquí usa el mismo adaptador con un socket simulado.

## Estado de la entrega 0.7.0

- [x] 0.7.1: reglas y perfiles versionados; esquema 8 migrado con respaldo.
- [x] 0.7.2: equipos, orden y formatos 1v1, 2v2 y 3v3.
- [x] 0.7.3: acciones, cambios, relevos y replay determinista.
- [x] 0.7.4: elementos, siete efectos, pasivas y recargas.
- [x] 0.7.5: recompensas repartidas, antifarm, locks y propiedad histórica.
- [x] 0.7.6: 30 comandos, páginas cortas y 103 vistas previas.
- [x] 0.7.7: 352 pruebas y revisión de integración, balance y recuperación.

La simulación final cubre 8.600 combates y los ensayos de afinado otras 43.000
partidas. La base del proyecto conserva exactamente los registros de doce
colecciones; personajes y ataques conservan sus datos y añaden perfiles.
El respaldo automático de migración es
`ChengdúData/backups/447c29f8-6683-47a1-a9c4-dbc07de91f64/`.
No se introducen jugadores de prueba en la base del proyecto.
Las subfases son hitos de esta misma entrega, no versiones publicadas por separado.
