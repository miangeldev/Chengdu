# Alpha 0.4.1 — Balance y emisión

Fecha: 2026-10-09. Esta revisión ajusta las estadísticas de combate y los límites
de emisión del catálogo de Alpha 0.4. Conserva el progreso, las compras y la
identidad de las unidades existentes mediante la migración al esquema 5.

## Estadísticas finales

Las rarezas superiores tienen más fuerza en promedio. Los comunes conservan
opciones tácticas entre sí: Panda supera a Lobo, Lobo a Mago y Mago a Panda.
El nivel y los enfrentamientos concretos permiten ganar a una rareza superior;
la rareza no aplica un multiplicador oculto ni asegura el resultado.

Valores base del nivel 1, antes de rasgos:

| Personaje | Rareza | HP | Ataque | Defensa | Velocidad |
| --- | --- | ---: | ---: | ---: | ---: |
| Panda Guerrero | Común | 120 | 25 | 23 | 8 |
| Mago Carmesí | Común | 100 | 32 | 16 | 10 |
| Lobo Sombrío | Común | 95 | 27 | 17 | 16 |
| Monje Celestial | Raro | 114 | 27 | 21 | 11 |
| Guardián Jade | Raro | 133 | 23 | 28 | 7 |
| Bruja Lunar | Épico | 108 | 33 | 21 | 13 |
| Dragón Carmesí | Legendario | 124 | 35 | 22 | 12 |
| Espíritu Bambú | Épico | 124 | 27 | 24 | 12 |

Los niveles mantienen las reglas anteriores: +2 HP por nivel ganado y +1
ataque/defensa cada cinco niveles ganados, hasta nivel 20. La velocidad no crece
con el nivel. Los rasgos se aplican después del crecimiento y las variantes
siguen siendo cosméticas. No cambian potencia, precisión, recompensas ni precio
del Sobre Básico.

## Límite global por personaje

| Rareza | Máximo de unidades por personaje |
| --- | ---: |
| Común | 50 |
| Raro | 35 |
| Épico | 20 |
| Legendario | 10 |
| Mítico, para contenido futuro | 5 |

Es un máximo histórico por personaje, compartido entre todos los jugadores,
starters, sobres y emisiones administrativas. Rasgos y variantes comparten el
mismo contador. Cambiar de propietario o retirar una unidad no devuelve cupos
ni permite reutilizar su serial. Un límite anterior más bajo se conserva.

Un personaje agotado deja de participar en los sobres y no admite nuevos
starters ni otras emisiones. Si se agota una rareza completa, el motor elimina
su peso y normaliza las otras probabilidades; `.ctusobres` muestra la
distribución actual. Si no queda contenido, abrir un sobre se rechaza sin cobrar.

Cuando lo ya emitido supera un máximo nuevo, todas las unidades existentes se
conservan. La plantilla registra el total heredado en `grandfatheredIssued` y
bloquea nuevas emisiones. No se restablecen contadores ni se recortan colecciones.
El marcador conserva el cupo disponible en cero aunque después aumente el máximo
o cambie la rareza; el contador debe permanecer igual al total heredado.

## Comparación por simulación

La simulación usa 2,000 combates por pareja, un generador con semilla y los ocho
personajes sin rasgos. Las variantes no influyen. Compara nivel 1 contra nivel 1
y nivel 20 contra nivel 20. La estrategia prioriza un KO posible y, después,
el daño esperado teniendo en cuenta la precisión. No está demostrado que esa
estrategia sea óptima.

Estas tasas son el promedio de victoria contra los otros siete personajes,
con el mismo peso para cada rival y después agrupadas por rareza:

| Rareza | Ambos en nivel 1 | Ambos en nivel 20 |
| --- | ---: | ---: |
| Común | 27.1% | 29.7% |
| Raro | 50.4% | 50.8% |
| Épico | 68.9% | 66.4% |
| Legendario | 80.0% | 76.4% |

El modelo muestra una ventaja promedio creciente por rareza y espacio para
progresar con comunes. Por ejemplo, Panda de nivel 20 contra Dragón de nivel 1
gana aproximadamente 70.5%, frente a 23.2% cuando ambos están en nivel 1.
Eso no implica que todos los comunes ganen a todos los legendarios al entrenarse.

Son resultados del modelo y de esa muestra, no garantías para una partida real.
Rasgos, decisiones de jugadores y el azar pueden cambiar los resultados. Para
reproducir la comparación:

```sh
npm run balance:simulate
```

Implementación: [simulate-balance.js](../scripts/simulate-balance.js).

## Preservación de datos

El esquema 5 mantiene las once colecciones del esquema 4. El cambio de
estadísticas es explícito y versionado; no recarga el catálogo para reinterpretar
unidades o turnos en curso.

Las unidades anteriores conservan `initialStats`, serial, personaje/revisión
de emisión, origen, propietario, XP, nivel, rasgos y variante. Se añade una base
de combate separada, calculada por stat como:

```text
combatBaseStats = initialStats + (stats nuevos − stats canónicos anteriores)
```

Así se preserva la variación individual. La nueva base usa
`statGrowthVersion: 2`; las unidades nuevas parten de sus stats de emisión.
Un balance futuro requiere otra versión y migración, conservando estas reglas
históricas para validar resultados anteriores.

Los combates ya aceptados conservan sus snapshots de versión 0 o 1. Las nuevas
aceptaciones guardan versión 2 y su base de combate inmutable. Los recibos de
sobres, recompensas, movimientos económicos y batallas cerradas permanecen
intactos: no se cobra, paga ni sortea de nuevo durante la migración.

El cambio se publica con backup y recuperación del journal; una interrupción
previa al commit revierte todo y una posterior completa todo. También se
preservan las unidades que excedían los nuevos máximos. El detalle de estructura
y validación está en [database.md](database.md).

Las pruebas comprueban preservación de datos, variaciones individuales,
snapshots activos e históricos, máximos compartidos por todas las fuentes,
emisiones anteriores por encima del límite y recuperación de migraciones.
La simulación local y el adaptador con socket simulado no conectan una sesión
real de WhatsApp.

Esta revisión complementa [Alpha 0.4](alpha-0.4.md), que documenta los sobres,
rasgos y variantes originales, y [MVP 0.3](mvp-0.3.md), que define la progresión.
