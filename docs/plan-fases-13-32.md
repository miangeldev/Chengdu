# Plan de entrega — Comunidad 0.10 / Fase 32

Solicitud: implementar clanes y revisar todos los requisitos anteriores en
`project.md`, respetando las decisiones posteriores del usuario. Revisión de
los 4.235 renglones originales y 118 apartados en
[auditoría](auditoria-fases-0-32.md). Contratos finales en
[fases 13–32](fases-13-32.md).

| Hito | Resultado concreto | Evidencia |
| --- | --- | --- |
| 1 · Revisión integral | Separar huecos jugables de ejemplos y recomendaciones futuras. | Auditoría con las 33 fases y dependencias de datos. |
| 2 · Persistencia | Esquema 11, once colecciones nuevas, migración sin premios automáticos, fuentes del ledger. | Migración 011, validadores por dominio, recuperación en todos los archivos. |
| 3 · Intercambios | Ofertas de unidades/monedas, doble confirmación, escrow, locks, transferencia central y devolución. | `game/trades/`, pruebas de servicio, concurrencia y recuperación. |
| 4 · Crafting y evolución | Recursos auditables, recetas reales, forma con +5% y nacimiento intacto. | `game/crafting/`, `game/evolution/`, snapshots históricos y fuentes de coste. |
| 5 · Social | Perfil y colección públicos, showcase, títulos ganados, favoritos y comparación. | `game/social/`, preferencias con proof de propiedad, tests de privacidad/transferencia. |
| 6 · Clanes | Roles, miembros, permisos, tesorería, clasificación, guerras, premios y moderación. | `game/clans/`, replay de acciones, autoridad histórica, pruebas de guerras completas. |
| 7 · Orígenes anteriores | Personajes directos de PvP, misión, logro, boss, evento, podio y promoción. | `game/acquisition/`, fuentes verdaderas, resultado único y supply global. |
| 8 · WhatsApp y documentación | Acciones breves C1/G1/I1, siete plugins, ayuda, inventario, ejemplos y backlog honesto. | Router compartido, pruebas de una respuesta por acción, preview y guías. |

La aceptación exige que la suite completa pase, que los ejemplos se generen
sobre datos temporales y que la migración real conserve todos los registros
anteriores con backup y sin cuentas de prueba. Los totales y la evidencia final
se registran después de completar esas verificaciones.

## NOW / NEXT / LATER

- **NOW:** cierre de fases 0–32 con los sistemas de esta tabla, persistencia,
  documentación, interfaz y validación integrada.
- **NEXT:** fases 33–36: ampliar controles de abuso con datos reales, telemetría
  agregada y herramientas administrativas globales, balance y cierre V1.0.
  Las protecciones actuales son necesarias y están integradas; no sustituyen
  seguimiento de producción.
- **LATER:** SQLite si la concurrencia lo justifica, más recetas/formas/eventos,
  subastas, torneos, profesiones, mapas o mascotas según decisiones explícitas.

La integración real conserva el observador de actividad del anfitrión y un único
escritor por carpeta. El reinicio del host es necesario para cargar los plugins
nuevos si su proceso ya estaba iniciado.

## Verificación de cierre

- Suite completa: **683/683 pruebas** con `npm test -- --test-isolation=none`.
- Ajustes de texto/orden y expiración: **37/37 pruebas** pertinentes; la
  confirmación final de invitaciones y permisos pasó **11/11 pruebas** de
  interfaz y comandos.
- WhatsApp: **53 plugins** y **188 ejemplos** generados con base temporal.
- Migración local: **10→11**, 24 colecciones / 44 registros preservados, once
  colecciones nuevas vacías, cero usuarios/unidades de prueba.
- Backup: `ChengdúData/backups/703971b6-9c35-4215-bd51-f5837f664655/`.
- Validación local: válida, esquema 11, catálogo de 10 personajes, sin journal
  ni writer lock pendiente. `git diff --check` sin incidencias.

Los ocho hitos están cerrados con el alcance funcional descrito. La sesión de
WhatsApp real continúa siendo responsabilidad del anfitrión; reiniciarlo carga
los nuevos plugins del módulo.
