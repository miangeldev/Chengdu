# Rendimiento y medición reproducible

El coste principal estaba en repetir trabajo proporcional a toda la base de
datos para cada solicitud. Una lectura releía 36 archivos y volvía a reproducir
los historiales. Una transacción sin cambios además clonaba la base, serializaba
todas las colecciones y validaba todas las transiciones. Una escritura generaba
un respaldo completo, dos journals con ambos snapshots y publicaba 36 archivos.
La cola única acumulaba ese coste entre mensajes y comandos simultáneos.

Los snapshots validados se mantienen ahora en memoria y los repositorios copian
sólo al escribir. Los índices reutilizan referencias de colecciones inmutables.
Una transacción sin cambios termina sin publicar archivos. El journal habitual
conserva registros reemplazados y apéndices; publica las colecciones afectadas.
La validación de cada dominio se reutiliza sólo cuando todas las colecciones
consultadas conservan sus referencias y están profundamente congeladas. Cambiar
una dependencia obliga a validar de nuevo. Los estados mutables, las referencias
históricas y las migraciones conservan sus comprobaciones.

Las búsquedas de contadores, emisiones y primeras acciones sociales usan mapas;
la transición omite registros que mantienen exactamente la misma referencia.
Las comparaciones de historiales compartidos evitan serializar sus registros.

## Ejecutar el benchmark

Se necesita Node.js 22 o posterior. El script crea una base independiente en el
directorio temporal del sistema, la valida y la elimina al terminar. No lee ni
modifica los datos de `ChengdúData`.

```sh
node scripts/benchmark-performance.js --users=1000 --history=10 --iterations=3
node scripts/benchmark-performance.js --users=1000 --history=10 --iterations=3 --json > /tmp/chengdu-performance.json
node scripts/benchmark-performance.js --users=3000 --history=10 --iterations=3 --json > /tmp/chengdu-performance-large.json
```

`--users` controla jugadores y perfiles; `--history` crea esa cantidad de
reclamos diarios, movimientos monetarios y actualizaciones sociales por jugador.
Los IDs, fechas, recibos, saldos y cadenas sociales son deterministas y válidos.
`--iterations` controla las repeticiones; el arranque y el lote de 20 lecturas
se miden una vez. El reporte incluye tamaño de la base, mediana, p95 y operaciones
de archivos por ejecución. Con tres repeticiones el p95 corresponde al máximo
observado; conviene aumentar las repeticiones para estudiar percentiles.

Los contadores interceptan llamadas síncronas de Node a lectura, escritura,
copia y fsync. `writeBytes` mide bytes enviados a `writeFileSync`; `copyBytes`
mide el tamaño lógico de archivos copiados para respaldos. La suma representa
volumen lógico escrito o copiado; reflinks y hardlinks pueden ocupar menos bloques
físicos. Los contadores no incluyen el coste de `stat`, ni equivalen a mediciones
de disco del sistema operativo. Las copias iniciales del fixture quedan fuera
de las mediciones.

## Resultados observados

Mediciones locales con Node.js v26.8.2, 1000 jugadores y 10 operaciones históricas
por jugador: 10 000 diarios, 10 000 movimientos monetarios y 10 000 acciones
sociales, además de perfiles y catálogo. Tamaño JSON: 15 666 890 bytes. Las
cifras comparan medianas de tres ejecuciones sobre el mismo fixture; el lote
concurrente y el arranque son muestras únicas. Los tiempos dependen del hardware
y de la carga de la máquina.

| Operación | Antes, ms | Después, ms |
| --- | ---: | ---: |
| Consultar jugador, caché caliente | 281.629 | 0.267 |
| Transacción sin cambios | 744.223 | 0.279 |
| Comando de perfil | 718.113 | 0.417 |
| Actualizar biografía | 1756.407 | 153.726 |
| Lote de 20 lecturas encoladas | 5234.722 | 4.475 |
| Primera lectura, incluye arranque | 603.394 | 288.220 |
| Validación completa de fixture mutable | 253.362 | 153.737 |

Una actualización social pasa de 75 escrituras y 153 llamadas a fsync a 5
escrituras y 26.333 llamadas a fsync en promedio. Las lecturas calientes, los
perfiles sin vencimientos y las transacciones sin cambios no leen ni escriben
archivos de datos. Aún consultan metadatos para detectar cambios externos.

Antes se escribían unos 118.13 MB por actualización social. Después se envían
6.98 MB a `writeFileSync` y se copian 9.87 MB para respaldos: 16.85 MB lógicos
en promedio, incluyendo el primer respaldo. En la primera escritura del proceso
se copian los 36 archivos; las siguientes comparten los archivos de respaldos
inmutables y sólo copian las colecciones cuyo contenido cambió. El tamaño físico
adicional depende del soporte de reflinks y hardlinks del sistema de archivos.

Un segundo escenario validó 5000 jugadores con el mismo historial por jugador:
78 446 890 bytes JSON, 50 000 registros en cada historial. Sus medianas fueron
0.263 ms para consultar un jugador, 0.294 ms para la transacción sin cambios y
0.460 ms para perfil; el lote de 20 lecturas tardó 4.078 ms. La primera lectura
tardó 1569.180 ms y actualizar una biografía 725.769 ms. Esto confirma que las
consultas dejan de escalar con la historia, mientras que el arranque y escribir
una colección grande mantienen su coste proporcional. No se midió baseline
original de este segundo tamaño.

Reportes completos: [antes, 1000 jugadores](benchmarks/before-1000.json),
[después, 1000 jugadores](benchmarks/after-1000.json) y
[después, 5000 jugadores](benchmarks/after-5000.json).

## Apariciones y actividad de grupos

Las comprobaciones automáticas consideran grupos activados mediante comandos
CTU y mensajes de jugadores registrados. La primera oportunidad resuelve el
estado necesario y conserva en memoria la próxima ventana. Los mensajes
adicionales dentro de esa ventana y los grupos inactivos conocidos no abren
transacciones por cada mensaje. Las ráfagas del mismo grupo comparten una sola
comprobación en curso. Los comandos de consulta de encuentros evitan escribir
cuando no hay encuentros vencidos que cerrar.

Las pruebas de `tests/spawn-performance.test.js` cuentan operaciones reales de
almacenamiento para grupos activos e inactivos y para ráfagas concurrentes.

## Alcance y límites

Este benchmark mide almacenamiento y servicios locales. No mide WhatsApp,
red, descarga de medios ni envío de mensajes. El fixture ejercita historia
económica y social; no contiene batallas, transferencias, clanes ni capturas.
Una producción con muchas batallas y acciones requiere medir también esos
comandos con su distribución real de datos.

El arranque sigue leyendo y validando toda la base. La memoria sigue creciendo
con el tamaño de JSON y sus objetos. Una escritura vuelve a serializar la
colección modificada y valida los dominios relacionados; un historial muy grande
en esa misma colección conserva un coste proporcional a su tamaño. El caché
reduce el coste recurrente, pero no elimina esos límites del almacenamiento JSON.
Las comprobaciones de integridad y recuperación permanecen activas.

Los cambios mantienen el esquema 11 y recuperan journals de las versiones
anteriores. Los respaldos rutinarios nuevos se conservan hasta el límite
configurado; los respaldos históricos de migración se preservan. La retención
reduce acumulación futura, no limpia automáticamente todo el contenido histórico
de una instalación.
