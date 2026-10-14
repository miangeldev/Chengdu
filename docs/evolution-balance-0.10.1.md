# Evoluciones accesibles — ajuste 0.10.1

La evolución se desbloquea desde el **nivel 5 de unidad**, con un bono del **4%**
en cada estadística, redondeado hacia abajo. Desde el **nivel 10** sube al **5%**
automáticamente, sin otra receta, sello ni pago. El máximo sigue siendo 5%.

## Acceso y esfuerzo

La XP de unidad necesaria es la suma de los niveles anteriores: `100 × nivel`.
La unidad recibe 35 XP por una victoria válida en solitario, 15 al perder y 20
al empatar. En equipos la XP se reparte entre quienes participaron.

| Hito | XP acumuladas desde nivel 1 | Victorias de 35 XP si no hay otras fuentes |
| --- | ---: | ---: |
| Nueva evolución, nivel 5 | 1.000 | 29 |
| Bono máximo, nivel 10 | 4.500 | 129 |

El acceso requiere un **77,8% menos de XP**. Las partidas necesarias dependen de
resultados, reparto de XP y límites de recompensas; los mensajes enviados no
aportan XP ni materiales. Los límites por pareja y las rendiciones sin premio
siguen aplicándose.

Requisitos de inversión:

- Unidad compatible, propia y disponible, desde nivel 5.
- Un sello: receta de 5 fragmentos + 2 esencias + 100 ChengCoins.
- Evolucionar: 300 ChengCoins y consumir ese sello.
- Total: **400 ChengCoins y materiales**, una vez por unidad.

Panda Guerrero → Panda Maestro, Mago Carmesí → Mago Arcano y Lobo Sombrío →
Lobo Lunar. Cada unidad conserva ID, serial, rareza, origen, rasgos, variante,
progreso e historial. La evolución no emite otra unidad ni devuelve supply.

## Comparación con el motor real

Se compararon 3%, 4% y 5% al nivel 5 contra unidades sin evolución, y el bono
final al nivel 10. El informe contiene **18.000 duelos**, con 100 muestras por
pareja, semilla 73 y retador alternado. Cada alternativa enfrenta las mismas
muestras. Se utilizan ataques, pasivas, elementos, estados, críticos, cooldowns,
reservas y la estrategia adaptativa del simulador existente.

En 1v1 cada inicial enfrenta a los ocho personajes base, incluido su propio
arquetipo. En 3v3 el trío inicial evolucionado enfrenta a las seis composiciones
de referencia. La puntuación considera una victoria como 1 y un empate como
0,5; se presenta como porcentaje medio frente a esas muestras.

| Bono al nivel 5 | Panda | Mago | Lobo | Trío inicial 3v3 |
| --- | ---: | ---: | ---: | ---: |
| Sin evolución | 40,75% | 40,13% | 23,50% | 17,83% |
| 3% | 41,38% | 40,38% | 23,63% | 26,00% |
| **4%, elegido** | **45,00%** | **43,25%** | **23,63%** | **32,67%** |
| 5% inmediato | 48,63% | 43,25% | 23,75% | 34,50% |

El 3% aporta poca diferencia individual por el redondeo. El 4% da una mejora
perceptible a Panda/Mago y una inversión útil en equipos, conservando la fuerza
máxima para el nivel 10. El salto al 5% temprano incrementa más la puntuación
individual del Panda. La mejora del Lobo es menor en estos cruces: rol,
elementos, pasivas y umbrales de KO también determinan el resultado.

Ejemplo de Panda al nivel 5, sin rasgos:

| Estadística | Sin evolución | Con 4% |
| --- | ---: | ---: |
| HP | 128 | 133 |
| Ataque | 25 | 26 |
| Defensa | 23 | 23 |
| Velocidad | 8 | 8 |

A nivel 10 vuelve al mismo máximo del sistema anterior. El bono no agrega
ataques, efectos, elementos, rasgos ni multiplicadores de daño adicionales.
No se redondea hacia arriba: cada stat puede ganar menos del porcentaje teórico.

Este ensayo usa una heurística de referencia, sin rasgos, variantes ni
ponderación por población/supply. Sus puntuaciones describen las muestras;
no son tasas de victoria de producción ni una prueba de estrategia óptima.
Los niveles superiores ya conservaban el 5% en la política anterior.

Reproducir el informe:

```sh
npm run balance:evolution
node scripts/simulate-evolution-balance.js --samples 100 --seed 73 --json
```

Datos: [informe JSON](evolution-balance-0.10.1.json).

## Versionado y datos históricos

La política **1** conserva mínimo nivel 10, coste 300 y bono fijo 5% para
interpretar evoluciones anteriores. La política **2** es la utilizada por las
operaciones nuevas: nivel 5, coste 300, 4% hasta el nivel 9 y 5% desde el 10.
El servidor no permite crear recibos nuevos bajo la política antigua.

Las estadísticas de un recibo se verifican con el nivel en que se evolucionó.
Las de un combate, anuncio o ataque a jefe se verifican con su nivel y forma
congelados. Al llegar a nivel 10 cambian las estadísticas de usos futuros;
los registros anteriores siguen siendo iguales y reproducibles.

El formato de la forma y sus cuatro campos no cambia. Ambos contratos caben
en el esquema 11; este ajuste no necesita migrar ni reescribir registros JSON.
Los reintentos siguen devolviendo el recibo original, incluso con política 1
o con un reloj temporalmente inválido.

## Interfaz

```text
.ctucrafting
.ctucrafting reclamar
.ctucrafting crear sello_evolucion
.ctuevolucion PAND-000001
.ctuevolucion PAND-000001 confirmar
```

La consulta publica nivel mínimo, coste, sello, bono inicial y siguiente etapa.
La confirmación indica el bono realmente obtenido. `.ctuunidad ID` muestra el
bono actual; `.ctuficha ID` muestra los stats de la unidad o del combate activo.
Errores por nivel utilizan el mínimo vigente y los prefijos personalizados.

## Verificación

Las pruebas cubren rechazo en nivel 4 sin gasto, éxito en nivel 5, aumento al
10 por XP de combate real, ausencia de un segundo cobro, costes y locks,
replay tras reinicio, política 1 histórica y bloqueo de downgrade en operaciones
nuevas. También cubren snapshots de combate clásico/avanzado, mercado y boss,
y mensajes con el bono del nivel real. El simulador verifica reproducibilidad,
consistencia de resultados e inputs antes de ejecutar.

Verificación final: **690 pruebas aprobadas** en la suite completa; **18.000
combates** del informe reproducible; **188 ejemplos de WhatsApp** regenerados.
La base local valida en esquema 11 y sus 36 archivos JSON permanecen iguales
byte a byte, sin journal ni lock pendiente. No se introdujeron cuentas de prueba.
