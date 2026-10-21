# Equilibrio de La Noche de los Espíritus

El informe reproducible está en [spirits-balance.json](spirits-balance.json). Se genera con:

```sh
node scripts/simulate-spirits-balance.js --json > docs/spirits-balance.json
```

La muestra contiene 36.000 combates del motor real, con semilla 73: niveles 1, 5, 15 y 20; cien muestras por pareja y tratamiento; los diez personajes anteriores como rivales; cinco equipos, incluidos tres ejemplares de cada carta nueva. El control conserva exactamente las tiradas de apertura y omite voluntariamente el ataque Fatality. Se alterna el retador para resolver velocidades iguales. No se incluyen rasgos, variantes ni evoluciones; la estrategia es una heurística, no un jugador óptimo.

| Personaje | Nv. 1 | Nv. 5 | Nv. 15 | Nv. 20 |
| --- | ---: | ---: | ---: | ---: |
| Guardián de las Mil Máscaras | 67,8% | 66,5% | 71,8% | 75,3% |
| Dragón Carmesí, referencia legendaria | 78,3% | 79,7% | 84,2% | 79,4% |
| Zorro de las Llamas Errantes | 66,2% | 67,1% | 61,3% | 64,3% |
| Bruja Lunar, referencia épica | 50,9% | 59,9% | 61,3% | 58,1% |
| Espíritu Bambú, referencia épica | 49,9% | 55,7% | 58,2% | 57,2% |
| Guardián Espectral, referencia épica | 56,6% | 50,9% | 53,7% | 52,6% |

Las referencias usan la misma cesta de diez personajes anteriores, incluido su propio espejo, que aporta un 50%. Los resultados reflejan esos emparejamientos y sus ventajas elementales; no son tasas de victoria previstas para todos los jugadores.

El Guardián quedó en **134 HP, 26 ataque, 25 defensa y 9 velocidad**. Su resistencia depende de alternar Jade, Carmesí y Azul: escudo de 6, ataque +6% y regeneración del 4% de HP máximo. Los escudos refrescan el valor mayor, sin sumarse. La postura avanza al consumir una acción propia y se conserva en el banquillo. Su fuerza total queda por debajo del Dragón en esta referencia, con una función de tanque distinta. La primera propuesta, 158/31/32/11, dominaba el catálogo y fue descartada antes del lanzamiento.

El Zorro quedó en **110 HP, 29 ataque, 21 defensa y 18 velocidad**. Su elemento fuego y su iniciativa favorecen combates contra naturaleza; agua y tanques presentan respuestas claras. Los tres zorros ganan un 44%, 45%, 15% y 10% frente al equipo Dragón/Bruja/Bambú en los cuatro niveles. Tres Guardianes obtienen un 68%, 68%, 50% y 57%: acumular copias no asegura la victoria.

Fatality se sortea una sola vez por unidad y combate: **10%**, una oportunidad de uso, precisión del 90%, potencia 52 para el Guardián y 50 para el Zorro. Gasta el turno y el uso incluso si falla. Respeta defensa, escudos, elementos y las mecánicas de Historia; no ejecuta ni ignora HP. Aturdimiento o KO antes de actuar conservan la oportunidad. Cambiar de personaje o repetir una operación no genera otra tirada.

Las 12.000 aperturas exclusivas produjeron 1.225 activaciones, **10,208%**, compatibles con el 10% configurado. En duelos, utilizar Fatality cambia el promedio del Guardián entre +0,5 y +3,5 puntos porcentuales, y el del Zorro entre +0,4 y +1. Con tres copias hay más oportunidades de apertura; el mayor cambio observado fue +12 puntos para tres zorros de nivel 1, que aun así terminan con un 44% de victorias en ese emparejamiento.

Las cartas presentan sus habilidades desde el lanzamiento de Espíritus y las conservan después del evento. Los combates ya iniciados guardan sus reglas y tiradas; cruzar la fecha de lanzamiento durante una partida no añade ataques ni posturas a mitad del combate. Las pasivas, elementos y posturas se aplican en avanzado e Historia; el modo clásico conserva sus reglas de ataques simples y admite el tercer ataque cuando corresponde.
