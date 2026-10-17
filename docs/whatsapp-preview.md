# Vista previa de los mensajes de WhatsApp

Generada con `npm run preview:whatsapp`, usando jugadores ficticios y una base temporal.
Los asteriscos muestran el formato de negrita que aplica WhatsApp.

## Registro

```text
🃏 *CHENGDÚ CARDS | REGISTRO*
━━━━━━━━━━━━━━
✅ Registro completado
¡Bienvenido, *Miguel*!

🌱 Nivel 1 · 💰 0 ChengCoins

🎁 Elige tu primer personaje:
👉 *.ctustarter*
```

## Diario: primera recompensa, sin XP

```text
🃏 *CHENGDÚ CARDS | DIARIO*
━━━━━━━━━━━━━━
🎁 *+100 ChengCoins*

💰 Saldo: *100 ChengCoins*

⏳ Próximo diario: *12 oct 2026, 14:00*
📍 Hora de Ciudad de México · Un reclamo cada 24 h.

👉 Conseguir personajes: *.ctutienda*
```

## Repetir el diario: recibo original, sin otro crédito

```text
🃏 *CHENGDÚ CARDS | DIARIO*
━━━━━━━━━━━━━━
↩️ Este mensaje ya reclamó tu diario. Aquí está su recibo original.

🎁 100 ChengCoins recibidos en ese reclamo
Saldo tras ese reclamo: *100 ChengCoins*

📅 Reclamo del 11 oct 2026, 14:00
📍 Hora de Ciudad de México.

👉 Consultar saldo actual: *.ctubalance*
```

## Diario: espera hasta cumplir 24 horas

```text
🃏 *CHENGDÚ CARDS | DIARIO*
━━━━━━━━━━━━━━
⏳ Ya reclamaste tu diario. Se puede reclamar una vez cada 24 h.

📅 Próximo diario: *12 oct 2026, 14:00*
📍 Hora de Ciudad de México.

👉 Tu saldo: *.ctubalance*
```

## Tienda: costes y disponibilidad

```text
🃏 *CHENGDÚ CARDS | TIENDA*
━━━━━━━━━━━━━━
🎁 *Sobre Básico*
💰 500 ChengCoins · ✅ Disponible
👉 *.ctuabrir basico*

🎲 Un personaje por sobre.
🔎 Probabilidades y rasgos: .ctusobres

💰 Consultar saldo: *.ctubalance*
```

## Elección de starter

```text
🃏 *CHENGDÚ CARDS | STARTER*
━━━━━━━━━━━━━━
🎁 Elige tu primer personaje. Solo puedes reclamar uno.

🐼 *Panda Guerrero* · Tanque
👉 *.ctustarter panda*

🔥 *Mago Carmesí* · Atacante
👉 *.ctustarter mago*

🐺 *Lobo Sombrío* · Velocista
👉 *.ctustarter lobo*

🔎 Comparar stats: .ctuficha panda, .ctuficha mago o .ctuficha lobo
```

## Comparar un personaje antes de elegir

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero*
🆔 panda_guerrero
⚪ Común · Tanque
📦 Emisión: 50 unidades como máximo
📚 Estadísticas base
❤️ Vida: 120/120 HP
⚔️ Ataque: 25 · 🛡️ Defensa: 23 · 💨 Velocidad: 8

🌿 Naturaleza
✨ *Piel de Bambú*
Al entrar por primera vez obtiene un escudo de 12 puntos durante 2 turnos propios.

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%
🌿 Naturaleza · Sin recarga

2️⃣ *Impacto del Panda* · Físico
Potencia: 36 POT · Precisión: 85%
🌿 Naturaleza · Recarga: 2 turnos propios
🛡️ Escudo 12 puntos · 2 turnos propios

💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.
🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego
☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.
Fallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.
```

## Starter reclamado

```text
🃏 *CHENGDÚ CARDS | STARTER*
━━━━━━━━━━━━━━
🎉 ¡Tu primer personaje está listo!

🐼 *Panda Guerrero*
⚪ Común · Nivel 1

🛡️ Preparar equipo:
👉 *.ctuequipo usar PAND-000001*
```

## Perfil

```text
🃏 *CHENGDÚ CARDS | PERFIL*
━━━━━━━━━━━━━━
👤 *Miguel*
🌱 Nivel 1 · ✨ 0/100 XP
💰 100 ChengCoins · 🎴 1 unidad

⚔️ 0 combates
🏆 0 victorias · 💔 0 derrotas · ⚖️ 0 sin ganador

🌟 Tu vitrina: .ctushowcase
✍️ Personalizar: .ctusocial ayuda

👉 Tu colección: *.ctupersonajes*
🏅 Tu clasificación: .cturank
```

## Colección

```text
🃏 *CHENGDÚ CARDS | COLECCIÓN*
━━━━━━━━━━━━━━
🎴 *Miguel*

🐼 *Panda Guerrero* · Nv. 1
⚪ Común · ✅ Disponible
↳ .ctuequipo usar PAND-000001

📄 *Página 1 de 1*
🔎 Detalles: .ctuficha ID
```

## Ficha de unidad

```text
🃏 *CHENGDÚ CARDS | UNIDAD*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero #0001*
🆔 PAND-000001
⚪ Común · Tanque · Normal

👤 Propietario: Miguel
✅ Disponible

🌱 Nivel 1 · ✨ 0/100 XP
🏆 0 victorias · 💔 0 derrotas

🧬 Sin rasgos

📜 Personaje inicial · 11 de octubre de 2026

🔎 Stats y ataques: *.ctuficha PAND-000001*
📜 Propietarios: .ctupropiedad PAND-000001
```

## Catálogo

```text
🃏 *CHENGDÚ CARDS | CATÁLOGO*
━━━━━━━━━━━━━━
🌙 *Bruja Lunar*
🟣 Épico · Control
↳ .ctuficha bruja_lunar

🐉 *Dragón Carmesí*
🟡 Legendario · Atacante
↳ .ctuficha dragon_carmesi

🎋 *Espíritu Bambú*
🟣 Épico · Soporte
↳ .ctuficha espiritu_bambu

👻 *Guardián Espectral*
🟣 Épico · Tanque · 🏮 Evento
↳ .ctuficha guardian_espectral

🛡️ *Guardián Jade*
🔵 Raro · Tanque
↳ .ctuficha guardian_jade

📄 *Página 1 de 2*
➡️ Siguiente: *.ctucatalogo 2*
🎁 Elegir starter: .ctustarter
```

## Catálogo: siguiente página con un número corto

```text
🃏 *CHENGDÚ CARDS | CATÁLOGO*
━━━━━━━━━━━━━━
🐺 *Lobo Sombrío*
⚪ Común · Velocista · 🎁 Starter
↳ .ctuficha lobo_sombrio

🔥 *Mago Carmesí*
⚪ Común · Atacante · 🎁 Starter
↳ .ctuficha mago_carmesi

🧘 *Monje Celestial*
🔵 Raro · Equilibrado
↳ .ctuficha monje_celestial

🐼 *Panda Guerrero*
⚪ Común · Tanque · 🎁 Starter
↳ .ctuficha panda_guerrero

🦊 *Zorro de los Faroles*
🔵 Raro · Velocista · 🏮 Evento
↳ .ctuficha zorro_faroles

📄 *Página 2 de 2*
⬅️ Anterior: *.ctucatalogo 1*
🎁 Elegir starter: .ctustarter
```

## Catálogo: volver a la primera página

```text
🃏 *CHENGDÚ CARDS | CATÁLOGO*
━━━━━━━━━━━━━━
🌙 *Bruja Lunar*
🟣 Épico · Control
↳ .ctuficha bruja_lunar

🐉 *Dragón Carmesí*
🟡 Legendario · Atacante
↳ .ctuficha dragon_carmesi

🎋 *Espíritu Bambú*
🟣 Épico · Soporte
↳ .ctuficha espiritu_bambu

👻 *Guardián Espectral*
🟣 Épico · Tanque · 🏮 Evento
↳ .ctuficha guardian_espectral

🛡️ *Guardián Jade*
🔵 Raro · Tanque
↳ .ctuficha guardian_jade

📄 *Página 1 de 2*
➡️ Siguiente: *.ctucatalogo 2*
🎁 Elegir starter: .ctustarter
```

## Guía de comandos

```text
🃏 *CHENGDÚ CARDS | AYUDA*
━━━━━━━━━━━━━━
🌱 *Empezar*
.cturegistro Nombre · Registro
.ctustarter · Primer personaje

📖 *Historia del Custodio*
.ctuhistoria · Prólogo y primeras misiones del bosque
.ctuhistoria ayuda · Decisiones, combates y reintentos
.ctudiario historia · Tu crónica, pistas y recuerdos

🎴 *Colección*
.ctuperfil · Tu progreso
.ctupersonajes · Elegir unidad
.ctucatalogo · Ver personajes
.ctuficha [ID o personaje] · Stats, precisión, elemento y pasiva
.ctuunidad ID · Propietario y procedencia

🎁 *Sobres*
.ctusobres · Precios y probabilidades
.ctuabrir basico · Obtener un personaje

💰 *Economía*
.ctudiario · +100 ChengCoins cada 24 h
.ctutienda · Comprar sobres
.ctumovimientos · Tus ingresos y gastos

🛍️ *Mercado*
.ctumercado · Unidades en venta
.ctumercado raro / .ctumercado precio · Filtrar
.ctumercado M1 · Detalles del anuncio M1
.ctucomprar M1 · Comprar ese anuncio
.ctuvender ID PRECIO · Publicar una unidad
.ctumercado mios · Tus anuncios
.cturetirar M1 · Retirar tu anuncio M1
.ctuventas · Tus compras y ventas
.ctupropiedad ID · Historia de propietarios

🛡️ *Equipo*
.ctuequipo · Ver 1 a 3 unidades
.ctuequipo usar ID1 ID2 ID3 · Seleccionar en orden
.ctuequipo agregar ID / .ctuequipo quitar ID
.ctuequipo ordenar 2 1 3 · Cambiar quien abre
.ctuequipo limpiar · Vaciar

✨ *Progreso*
.ctubalance · Saldo y recompensas
.ctuhistorial · Tus partidas
.ctuhistorial ID · Turnos y recompensa

🏅 *Clasificatorias*
.cturanked @jugador · Equipos 1v1, 2v2 o 3v3; cambia Elo
.cturank · Tu Elo, rango y colocación
.ctutop / .ctutop 2 · Ranking mundial
.ctutemporada · Fechas y premios
.ctutemporada T1 reclamar · Cobrar tras el cierre
.ctutemporadas · Archivo de temporadas
Clasificación oficial: 5 partidas válidas y 3 rivales distintos.
.ctupelea @jugador continúa siendo amistoso.

🏯 *Comunidad y evolución*
.ctuclan · Clanes, tesorería y guerras
.ctuclan ayuda · Gestión y permisos
.ctuintercambio ayuda · Intercambiar unidades y monedas
.ctucrafting · Materiales y recetas
.ctuevolucion ID · Evolucionar sin cambiar la identidad
.ctusocial ayuda · Favorito, títulos y perfil público
.ctushowcase · Tu vitrina
.cturecompensas · Personajes de premios y promociones

📄 *Páginas*
.ctucatalogo 2 · Ir a la página 2
.ctumercado raro 2 · Página 2 del filtro
Los listados muestran Anterior y Siguiente.

🌿 *Aventuras*
.ctumisiones · Misiones de hoy
.ctumisiones reclamar 1 · Cobrar una misión completada
.ctulogros · Logros y títulos permanentes
.ctulogros reclamar L1 · Cobrar un logro
.ctuinventario · Tickets, títulos e insignias
.ctuboss · Boss cooperativo mundial
.ctubossatacar 2 B1 · Atacar con tu primera unidad equipada
.ctubosstop · Aportaciones y participación
.ctuspawn / .ctuexplorar · Aparición del grupo
.ctucapturar S1 · Capturar por un ticket
.ctueventos · Calendario
.ctuevento faroles reclamar · Bienvenida del festival

⚔️ *Combate en grupo*
.ctupelea @jugador · Mismo tamaño de equipos
.ctupelea @jugador 3v3 · 1v1, 2v2 o 3v3
.ctupelea @jugador clasico · Reglas originales
.ctuaceptar / .cturechazar · Responder
.ctucancelar · Retirar desafío
.ctuatacar 1 / .ctuatacar 2 · Atacar
.ctucambiar 2 · Entrar con reserva; consume turno
.ctucombate · Ver turno
.cturendirse · Rendirse
```

## Equipo

```text
🃏 *CHENGDÚ CARDS | EQUIPO*
━━━━━━━━━━━━━━
🛡️ *Miguel* · 1/3 unidades

1️⃣ 🐼 *Panda Guerrero* · Nv. 1
⚔️ Abre el combate

✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
🔀 Orden: .ctuequipo ordenar 1
```

## Ficha del equipo: precisión y estadísticas

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Miguel
🆔 PAND-000001
🌱 Nivel 1
❤️ Vida: 120/120 HP
⚔️ Ataque: 25 · 🛡️ Defensa: 23 · 💨 Velocidad: 8

🌿 Naturaleza
✨ *Piel de Bambú*
Al entrar por primera vez obtiene un escudo de 12 puntos durante 2 turnos propios.

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%
🌿 Naturaleza · Sin recarga

2️⃣ *Impacto del Panda* · Físico
Potencia: 36 POT · Precisión: 85%
🌿 Naturaleza · Recarga: 2 turnos propios
🛡️ Escudo 12 puntos · 2 turnos propios

💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.
🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego
☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.
Fallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.
```

## Desafío

```text
🃏 *CHENGDÚ CARDS | DESAFÍO*
━━━━━━━━━━━━━━
⚔️ *Miguel* desafió a *Lukas*

📣 *Lukas, ¿aceptas?*
👉 *.ctuaceptar* o *.cturechazar*

⏳ Vence a las 14:05 (CDMX).
↩️ Retirar: .ctucancelar
```

## Comienzo del combate

```text
🃏 *CHENGDÚ CARDS | INICIO | T1*
━━━━━━━━━━━━━━
⚔️ *Miguel* vs *Lukas*
🐺 *Lobo Sombrío* toma la iniciativa.

❤️ *ESTADO*
🐼 Miguel
▓▓▓▓▓▓▓▓▓▓ 120/120 HP
🐺 Lukas
▓▓▓▓▓▓▓▓▓▓ 95/95 HP

🎯 *Turno de Lukas*
1️⃣ Garra Sombría · 25 POT
2️⃣ Colmillo Nocturno · 40 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔎 Detalles: .ctuficha
```

## Ficha detallada del combate

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Miguel
🆔 PAND-000001
🌱 Nivel 1
❤️ Vida: 120/120 HP
⚔️ Ataque: 25 · 🛡️ Defensa: 23 · 💨 Velocidad: 8

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%

2️⃣ *Impacto del Panda* · Físico
Potencia: 40 POT · Precisión: 80%
📌 Datos del combate activo.

🐺 *Lobo Sombrío* · Lukas
🆔 LOBO-000001
🌱 Nivel 1
❤️ Vida: 95/95 HP
⚔️ Ataque: 27 · 🛡️ Defensa: 17 · 💨 Velocidad: 16

1️⃣ *Garra Sombría* · Físico
Potencia: 25 POT · Precisión: 100%

2️⃣ *Colmillo Nocturno* · Físico
Potencia: 40 POT · Precisión: 80%
📌 Datos del combate activo.

💡 Daño: potencia + ataque − defensa (mín. 1).
Fallar consume el turno.
```

## Error: todavía no es tu turno

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
⏳ Aún no es tu turno. Consulta .ctucombate para ver quién debe atacar.
```

## Ataque y siguiente turno

```text
🃏 *CHENGDÚ CARDS | T2*
━━━━━━━━━━━━━━
🐺 *Lobo Sombrío* usó _Colmillo Nocturno_
💥 *44 de daño* a Panda Guerrero

❤️ *ESTADO*
🐼 Miguel
▓▓▓▓▓▓▓▒▒▒ 76/120 HP
🐺 Lukas
▓▓▓▓▓▓▓▓▓▓ 95/95 HP

🎯 *Turno de Miguel*
1️⃣ Golpe de Bambú · 25 POT
2️⃣ Impacto del Panda · 40 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔎 Detalles: .ctuficha
```

## Turno compacto: Panda responde

```text
🃏 *CHENGDÚ CARDS | T3*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* usó _Impacto del Panda_
💥 *48 de daño* a Lobo Sombrío

❤️ *ESTADO*
🐼 Miguel
▓▓▓▓▓▓▓▒▒▒ 76/120 HP
🐺 Lukas
▓▓▓▓▓▒▒▒▒▒ 47/95 HP

🎯 *Turno de Lukas*
1️⃣ Garra Sombría · 25 POT
2️⃣ Colmillo Nocturno · 40 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔎 Detalles: .ctuficha
```

## Ataque fallido dentro del turno

```text
🃏 *CHENGDÚ CARDS | T4*
━━━━━━━━━━━━━━
🐺 *Lobo Sombrío* usó _Colmillo Nocturno_
💨 ¡El ataque falló!

❤️ *ESTADO*
🐼 Miguel
▓▓▓▓▓▓▓▒▒▒ 76/120 HP
🐺 Lukas
▓▓▓▓▓▒▒▒▒▒ 47/95 HP

🎯 *Turno de Miguel*
1️⃣ Golpe de Bambú · 25 POT
2️⃣ Impacto del Panda · 40 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔎 Detalles: .ctuficha
```

## Resultado del combate

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* usó _Impacto del Panda_
💥 *47 de daño* a Lobo Sombrío

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 4 turnos · ❤️ 76 HP restantes

🎁 *RECOMPENSAS*
Miguel: +120 ChengCoins · +35 XP
🐼 Unidad: +35 XP
Lukas: +15 XP
🐺 Unidad: +15 XP

⚔️ Otra partida: .ctupelea @jugador
```

## Victoria con subida de nivel de jugador y unidad

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* usó _Impacto del Panda_
💥 *47 de daño* a Lobo Sombrío

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 4 turnos · ❤️ 32 HP restantes

🎁 *RECOMPENSAS*
Miguel: +120 ChengCoins · +35 XP
🐼 Unidad: +35 XP
🌱 👤 Miguel subió al nivel 2
🌱 🐼 Panda Guerrero subió al nivel 2
Lukas: +15 XP
🐺 Unidad: +15 XP

⚔️ Otra partida: .ctupelea @jugador
```

## Perfil con progreso ganado

```text
🃏 *CHENGDÚ CARDS | PERFIL*
━━━━━━━━━━━━━━
👤 *Miguel*
🌱 Nivel 2 · ✨ 5/200 XP
💰 460 ChengCoins · 🎴 1 unidad

⚔️ 3 combates
🏆 3 victorias · 💔 0 derrotas · ⚖️ 0 sin ganador

🏅 1 logro desbloqueado · 🎟️ 0 tickets
↳ .ctuinventario

🌟 Tu vitrina: .ctushowcase
✍️ Personalizar: .ctusocial ayuda

👉 Tu colección: *.ctupersonajes*
🏅 Tu clasificación: .cturank
```

## Saldo y reglas de recompensa

```text
🃏 *CHENGDÚ CARDS | BALANCE*
━━━━━━━━━━━━━━
💰 *460 ChengCoins*

📥 Ingresos: 460 · 📤 Gastos: 0
🔎 .ctumovimientos

🎁 Diario: +100 ChengCoins cada 24 h
⏳ Próximo: 12 oct 2026, 14:00 (CDMX)

🏆 Victoria: +120 ChengCoins y +35 XP
💔 Derrota: +15 XP · ⚖️ Empate: +20 XP
✨ La unidad participante también recibe esa XP.

⏳ Hasta 3 combates con recompensa contra el mismo rival en 24 h.
🏳️ Rendirse requiere 4 ataques y que ambos hayan atacado.
⌛ La inactividad no otorga recompensas.

👉 Conseguir personajes: *.ctutienda*
```

## Historial compacto de partidas

```text
🃏 *CHENGDÚ CARDS | HISTORIAL*
━━━━━━━━━━━━━━
🏆 Victoria vs *Lukas*
📅 11 de octubre de 2026 · 1v1 clásico · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-079c6928-e02f-4ef2-a6e3-7e8cf53b00a6

🏆 Victoria vs *Lukas*
📅 11 de octubre de 2026 · 1v1 clásico · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-bf28b2c8-6cbd-4354-8933-1b6885e8c2c2

🏆 Victoria vs *Lukas*
📅 11 de octubre de 2026 · 1v1 clásico · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-f96ecff2-f2d2-4a39-9416-261dd8091733

📄 *Página 1 de 1*
👉 Tu saldo: *.ctubalance*
```

## Detalle del historial: turnos y recompensa original

```text
🃏 *CHENGDÚ CARDS | PARTIDA*
━━━━━━━━━━━━━━
🏆 Victoria · 1v1 clásico · 11 de octubre de 2026
Miguel · Panda Guerrero · Niv. 1
Lukas · Lobo Sombrío · Niv. 1

⚔️ *TURNOS*
T1 · Lukas: Colmillo Nocturno
💥 44 de daño · Rival: 76 HP

T2 · Miguel: Impacto del Panda
💥 48 de daño · Rival: 47 HP

T3 · Lukas: Colmillo Nocturno
💥 44 de daño · Rival: 32 HP

T4 · Miguel: Impacto del Panda
💥 47 de daño · Rival: 0 HP

🎁 *RECOMPENSAS*
Miguel: +120 ChengCoins · +35 XP
🐼 Unidad: +35 XP
🌱 👤 Miguel subió al nivel 2
🌱 🐼 Panda Guerrero subió al nivel 2
Lukas: +15 XP
🐺 Unidad: +15 XP

👉 *.ctuhistorial*
```

## Ficha de unidad de nivel 2: HP aumentado

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Miguel
🆔 PAND-000001
🌱 Nivel 2
❤️ Vida: 122/122 HP
⚔️ Ataque: 25 · 🛡️ Defensa: 23 · 💨 Velocidad: 8

🌿 Naturaleza
✨ *Piel de Bambú*
Al entrar por primera vez obtiene un escudo de 12 puntos durante 2 turnos propios.

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%
🌿 Naturaleza · Sin recarga

2️⃣ *Impacto del Panda* · Físico
Potencia: 36 POT · Precisión: 85%
🌿 Naturaleza · Recarga: 2 turnos propios
🛡️ Escudo 12 puntos · 2 turnos propios

💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.
🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego
☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.
Fallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.
```

## Victoria después de alcanzar el límite de recompensas por rival

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* usó _Impacto del Panda_
💥 *47 de daño* a Lobo Sombrío

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 4 turnos · ❤️ 34 HP restantes

🎁 Sin recompensa: ya alcanzaron 3 combates con recompensa entre ustedes en 24 h.

⚔️ Otra partida: .ctupelea @jugador
```

## Diario: siguiente recompensa después del plazo

```text
🃏 *CHENGDÚ CARDS | DIARIO*
━━━━━━━━━━━━━━
🎁 *+100 ChengCoins*

💰 Saldo: *800 ChengCoins*

⏳ Próximo diario: *14 oct 2026, 14:00*
📍 Hora de Ciudad de México · Un reclamo cada 24 h.

👉 Conseguir personajes: *.ctutienda*
```

## Sobres: precio y probabilidades actuales

```text
🃏 *CHENGDÚ CARDS | SOBRES*
━━━━━━━━━━━━━━
🎁 *Sobre Básico* · 500 ChengCoins
⚪ Común: 70% · 🔵 Raro: 22% · 🟣 Épico: 7% · 🟡 Legendario: 1%
✨ Variante: 94% Normal · 5% Shiny · 1% Dorada
🧬 Rasgos: 80% sin rasgos · 19% uno · 1% dos
👉 *.ctuabrir basico*

🎲 Un personaje por sobre. Las probabilidades de rareza se ajustan si una categoría se agota.
Las variantes son cosméticas; los rasgos mejoran stats.

🔎 Consulta el resultado con .ctuficha ID.

💰 Consultar saldo: *.ctubalance*
```

## Apertura: personaje, variante y rasgos

```text
🃏 *CHENGDÚ CARDS | SOBRE ABIERTO*
━━━━━━━━━━━━━━
🎁 *Sobre Básico*

🐉 *Dragón Carmesí*
🟡 Legendario · Dorada

🧬 Firme · Agresivo

💰 500 ChengCoins gastados
Saldo restante: *300 ChengCoins*

👉 Stats y ataques: *.ctuficha DRGC-000001*
🛡️ Seleccionar: .ctuequipo usar DRGC-000001
```

## Colección: variantes y rasgos a simple vista

```text
🃏 *CHENGDÚ CARDS | COLECCIÓN*
━━━━━━━━━━━━━━
🎴 *Miguel*

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · ✅ Disponible
↳ .ctuequipo usar PAND-000001

🐉 *Dragón Carmesí* · ✨ Dorada · Nv. 1
🟡 Legendario · 🧬 2 rasgos · ✅ Disponible
↳ .ctuequipo usar DRGC-000001

📄 *Página 1 de 1*
🔎 Detalles: .ctuficha ID
```

## Unidad obtenida: propietario y procedencia del sobre

```text
🃏 *CHENGDÚ CARDS | UNIDAD*
━━━━━━━━━━━━━━
🐉 *Dragón Carmesí #0001*
🆔 DRGC-000001
🟡 Legendario · Atacante · Dorada

👤 Propietario: Miguel
✅ Disponible

🌱 Nivel 1 · ✨ 0/100 XP
🏆 0 victorias · 💔 0 derrotas

🧬 Firme · Agresivo

📜 Sobre: Sobre Básico · 13 de octubre de 2026

🔎 Stats y ataques: *.ctuficha DRGC-000001*
📜 Propietarios: .ctupropiedad DRGC-000001
```

## Ficha: efectos de los rasgos y estadísticas efectivas

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
🐉 *Dragón Carmesí* · Miguel
🆔 DRGC-000001
🌱 Nivel 1
✨ Dorada
🧬 Firme (+1 defensa) · Agresivo (+1 ataque)
❤️ Vida: 124/124 HP
⚔️ Ataque: 36 · 🛡️ Defensa: 23 · 💨 Velocidad: 12

🔥 Fuego
✨ *Ascua Ancestral*
Al entrar por primera vez aumenta su ataque un 10% durante 2 turnos propios.

1️⃣ *Garra del Dragón* · Físico
Potencia: 25 POT · Precisión: 100%
🔥 Fuego · Sin recarga

2️⃣ *Aliento Carmesí* · Físico
Potencia: 38 POT · Precisión: 80%
🔥 Fuego · Recarga: 2 turnos propios
🔥 Quemadura 4% · 2 turnos propios del rival

💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.
🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego
☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.
Fallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.
```

## Repetir el mismo mensaje: recibo original, sin otro cobro

```text
🃏 *CHENGDÚ CARDS | SOBRE ABIERTO*
━━━━━━━━━━━━━━
↩️ Este mensaje ya abrió un sobre. Aquí está su resultado original.

🐉 *Dragón Carmesí*
🟡 Legendario · Dorada

🧬 Firme · Agresivo

💰 500 ChengCoins pagados en la apertura original
Saldo tras esa apertura: *300 ChengCoins*

👉 Stats y ataques: *.ctuficha DRGC-000001*
🛡️ Seleccionar: .ctuequipo usar DRGC-000001
```

## Saldo después de abrir un sobre

```text
🃏 *CHENGDÚ CARDS | BALANCE*
━━━━━━━━━━━━━━
💰 *300 ChengCoins*

📥 Ingresos: 800 · 📤 Gastos: 500
🔎 .ctumovimientos

🎁 Diario: +100 ChengCoins cada 24 h
⏳ Próximo: 14 oct 2026, 14:00 (CDMX)

🏆 Victoria: +120 ChengCoins y +35 XP
💔 Derrota: +15 XP · ⚖️ Empate: +20 XP
✨ La unidad participante también recibe esa XP.

⏳ Hasta 3 combates con recompensa contra el mismo rival en 24 h.
🏳️ Rendirse requiere 4 ataques y que ambos hayan atacado.
⌛ La inactividad no otorga recompensas.

👉 Conseguir personajes: *.ctutienda*
```

## Repetir un diario antiguo: conserva su saldo original

```text
🃏 *CHENGDÚ CARDS | DIARIO*
━━━━━━━━━━━━━━
↩️ Este mensaje ya reclamó tu diario. Aquí está su recibo original.

🎁 100 ChengCoins recibidos en ese reclamo
Saldo tras ese reclamo: *100 ChengCoins*

📅 Reclamo del 11 oct 2026, 14:00
📍 Hora de Ciudad de México.

👉 Consultar saldo actual: *.ctubalance*
```

## Movimientos: ingresos y gastos propios

```text
🃏 *CHENGDÚ CARDS | MOVIMIENTOS*
━━━━━━━━━━━━━━
📤 *-500 ChengCoins* · 🎁 Sobre
📅 13 oct 2026, 14:00

📥 *+100 ChengCoins* · 📅 Diario
📅 13 oct 2026, 14:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 13 oct 2026, 14:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 13 oct 2026, 14:00

📥 *+0 ChengCoins* · 🏆 Combate
📅 11 oct 2026, 14:00

📄 *Página 1 de 2*
➡️ Siguiente: *.ctumovimientos 2*
👉 Tu saldo: *.ctubalance*
```

## Movimientos: siguiente página

```text
🃏 *CHENGDÚ CARDS | MOVIMIENTOS*
━━━━━━━━━━━━━━
📥 *+120 ChengCoins* · 🏆 Combate
📅 11 oct 2026, 14:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 11 oct 2026, 14:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 11 oct 2026, 14:00

📥 *+100 ChengCoins* · 📅 Diario
📅 11 oct 2026, 14:00

📄 *Página 2 de 2*
⬅️ Anterior: *.ctumovimientos 1*
👉 Tu saldo: *.ctubalance*
```

## Movimientos: volver a la primera página

```text
🃏 *CHENGDÚ CARDS | MOVIMIENTOS*
━━━━━━━━━━━━━━
📤 *-500 ChengCoins* · 🎁 Sobre
📅 13 oct 2026, 14:00

📥 *+100 ChengCoins* · 📅 Diario
📅 13 oct 2026, 14:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 13 oct 2026, 14:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 13 oct 2026, 14:00

📥 *+0 ChengCoins* · 🏆 Combate
📅 11 oct 2026, 14:00

📄 *Página 1 de 2*
➡️ Siguiente: *.ctumovimientos 2*
👉 Tu saldo: *.ctubalance*
```

## Error: saldo insuficiente para otro sobre

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
💰 No tienes suficientes ChengCoins para esta operación.
👉 Consulta .ctubalance
```

## Mercado: aún sin anuncios

```text
🃏 *CHENGDÚ CARDS | MERCADO*
━━━━━━━━━━━━━━
🛍️ No hay unidades en venta con esta selección.

👉 Elegir una unidad para vender: *.ctupersonajes*
```

## Publicar: precio, comisión y vencimiento

```text
🃏 *CHENGDÚ CARDS | EN VENTA*
━━━━━━━━━━━━━━
🎴 ¡Tu unidad ya está en el mercado!

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque

💰 Precio: *100 ChengCoins*
🏦 Comisión del 5%: 5 ChengCoins (redondeo hacia arriba)
📥 Recibirás: *95 ChengCoins*

🔒 En el mercado
🛡️ Retirada del equipo mientras está en venta.
⏳ Vence: 20 oct 2026, 14:00 (CDMX)

👉 Compartir anuncio: *.ctumercado M1*
↩️ Retirar: .cturetirar M1
```

## Mercado: decidir y comprar a simple vista

```text
🃏 *CHENGDÚ CARDS | MERCADO*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque
💰 *100 ChengCoins* · 👤 Miguel
🛒 Comprar: *.ctucomprar M1*
🔎 Detalles: .ctumercado M1

📄 *Página 1 de 1*
🎴 Tus anuncios: .ctumercado mios
💰 Menor precio: .ctumercado precio
```

## Mercado: filtrar por rareza

```text
🃏 *CHENGDÚ CARDS | MERCADO*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque
💰 *100 ChengCoins* · 👤 Miguel
🛒 Comprar: *.ctucomprar M1*
🔎 Detalles: .ctumercado M1

📄 *Página 1 de 1*
🎴 Tus anuncios: .ctumercado mios
💰 Menor precio: .ctumercado precio
```

## Mercado: ordenar por precio

```text
🃏 *CHENGDÚ CARDS | MERCADO*
━━━━━━━━━━━━━━
💰 Del menor al mayor precio.

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque
💰 *100 ChengCoins* · 👤 Miguel
🛒 Comprar: *.ctucomprar M1*
🔎 Detalles: .ctumercado M1

📄 *Página 1 de 1*
🎴 Tus anuncios: .ctumercado mios
💰 Menor precio: .ctumercado precio
```

## Mis anuncios: neto que recibirá el vendedor

```text
🃏 *CHENGDÚ CARDS | MIS ANUNCIOS*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque
💰 *100 ChengCoins* · 📥 Recibirás 95
↩️ Retirar: *.cturetirar M1*
🔎 Detalles: .ctumercado M1

📄 *Página 1 de 1*
🎴 Tus anuncios: .ctumercado mios
💰 Menor precio: .ctumercado precio
```

## Anuncio: ficha congelada y acción de compra

```text
🃏 *CHENGDÚ CARDS | ANUNCIO M1*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque

👤 Vendedor: *Miguel*
💰 Precio: *100 ChengCoins*

❤️ 122 HP · ⚔️ 25 ATQ · 🛡️ 23 DEF · 💨 8 VEL
📌 Stats al publicar.

🔒 En el mercado
⏳ Vence: 20 oct 2026, 14:00 (CDMX)

🛒 Comprar: *.ctucomprar M1*
🔎 Ataques y rasgos: .ctuficha PAND-000001
```

## Colección: unidad bloqueada en el mercado

```text
🃏 *CHENGDÚ CARDS | COLECCIÓN*
━━━━━━━━━━━━━━
🎴 *Miguel*

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · 🔒 En venta
↳ .ctumercado M1

🐉 *Dragón Carmesí* · ✨ Dorada · Nv. 1
🟡 Legendario · 🧬 2 rasgos · ✅ Disponible
↳ .ctuequipo usar DRGC-000001

📄 *Página 1 de 1*
🔎 Detalles: .ctuficha ID
```

## Error: una unidad en venta no puede combatir

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
🔒 Esa unidad está en combate, en venta o reservada en un intercambio.
👉 Consulta .ctumercado mios, .ctucombate o .ctuintercambio mios.
📖 Para un encuentro narrativo: .ctuhistoria
```

## Error: el comprador necesita saldo

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
💰 No tienes suficientes ChengCoins para esta operación.
👉 Consulta .ctubalance
```

## Compra: pago y equipo bajo demanda

```text
🃏 *CHENGDÚ CARDS | COMPRA*
━━━━━━━━━━━━━━
🤝 ¡La unidad ya forma parte de tu colección!

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque

👤 Vendedor: Miguel
💰 100 ChengCoins pagados
Saldo restante: *0 ChengCoins*

👉 Preparar equipo: *.ctuequipo usar PAND-000001*
🔎 Consultar: .ctuficha PAND-000001
```

## Ventas: precio neto y comisión del vendedor

```text
🃏 *CHENGDÚ CARDS | COMPRAS Y VENTAS*
━━━━━━━━━━━━━━
🤝 Venta · +95 ChengCoins
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque
👤 Comprador: Lukas · Comisión: 5
📅 13 oct 2026, 14:00 (CDMX)
🔎 .ctupropiedad PAND-000001

📄 *Página 1 de 1*
👉 Tu saldo: *.ctubalance*
```

## Compras: recibo personal sin saldo de la contraparte

```text
🃏 *CHENGDÚ CARDS | COMPRAS Y VENTAS*
━━━━━━━━━━━━━━
🛒 Compra · 100 ChengCoins
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque
👤 Vendedor: Miguel
📅 13 oct 2026, 14:00 (CDMX)
🔎 .ctupropiedad PAND-000001

📄 *Página 1 de 1*
👉 Tu saldo: *.ctubalance*
```

## Propiedad: nacimiento y transferencia

```text
🃏 *CHENGDÚ CARDS | PROPIEDAD*
━━━━━━━━━━━━━━
🎴 *Panda Guerrero*
👤 Propietario actual: *Lukas*

🌱 Emitida para Miguel
Primera emisión · 11 oct 2026, 14:00 (CDMX)

🤝 Miguel → Lukas
Compra en el mercado · 13 oct 2026, 14:00 (CDMX)

📄 *Página 1 de 1*
👉 Stats y ataques: *.ctuficha PAND-000001*
```

## Colección del comprador: progreso conservado

```text
🃏 *CHENGDÚ CARDS | COLECCIÓN*
━━━━━━━━━━━━━━
🎴 *Lukas*

🐺 *Lobo Sombrío* · Nv. 1
⚪ Común · ✅ Disponible
↳ .ctuequipo usar LOBO-000001

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · ✅ Disponible
↳ .ctuequipo usar PAND-000001

📄 *Página 1 de 1*
🔎 Detalles: .ctuficha ID
```

## Starter antiguo: indica que cambió de propietario

```text
🃏 *CHENGDÚ CARDS | STARTER*
━━━━━━━━━━━━━━
🎁 Ya reclamaste tu starter.

🐼 *Panda Guerrero*
⚪ Común · Nivel 2

👤 Ese personaje cambió de propietario.

👉 Tu colección: *.ctupersonajes*
```

## Combate histórico: sigue perteneciendo a sus jugadores tras la venta

```text
🃏 *CHENGDÚ CARDS | PARTIDA*
━━━━━━━━━━━━━━
🏆 Victoria · 1v1 clásico · 13 de octubre de 2026
Miguel · Panda Guerrero · Niv. 2
Lukas · Lobo Sombrío · Niv. 1

⚔️ *TURNOS*
T1 · Lukas: Colmillo Nocturno
💥 44 de daño · Rival: 78 HP

T2 · Miguel: Impacto del Panda
💥 48 de daño · Rival: 47 HP

T3 · Lukas: Colmillo Nocturno
💥 44 de daño · Rival: 34 HP

T4 · Miguel: Impacto del Panda
💥 47 de daño · Rival: 0 HP

🎁 *RECOMPENSAS*
Miguel: +120 ChengCoins · +35 XP
🐼 Unidad: +35 XP
Lukas: +15 XP
🐺 Unidad: +15 XP

👉 *.ctuhistorial*
```

## Preparar una unidad comprada

```text
🃏 *CHENGDÚ CARDS | EQUIPO*
━━━━━━━━━━━━━━
🛡️ *Lukas* · 1/3 unidades

1️⃣ 🐼 *Panda Guerrero* · Nv. 2
⚔️ Abre el combate

✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
🔀 Orden: .ctuequipo ordenar 1
```

## Repetir publicación: conserva el anuncio ya vendido

```text
🃏 *CHENGDÚ CARDS | EN VENTA*
━━━━━━━━━━━━━━
↩️ Este mensaje ya publicó la unidad. Aquí está su anuncio original.

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque

💰 Precio: *100 ChengCoins*
🏦 Comisión del 5%: 5 ChengCoins (redondeo hacia arriba)
📥 Neto del anuncio: *95 ChengCoins*

🤝 Vendido
⏳ Vence: 20 oct 2026, 14:00 (CDMX)

👉 Tus ventas y compras: *.ctuventas*
```

## Reventa: conserva la identidad y el progreso de la unidad

```text
🃏 *CHENGDÚ CARDS | COMPRA*
━━━━━━━━━━━━━━
🤝 ¡La unidad ya forma parte de tu colección!

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque

👤 Vendedor: Lukas
💰 75 ChengCoins pagados
Saldo restante: *320 ChengCoins*

👉 Preparar equipo: *.ctuequipo usar PAND-000001*
🔎 Consultar: .ctuficha PAND-000001
```

## Compra antigua: recibo original después de revender

```text
🃏 *CHENGDÚ CARDS | COMPRA*
━━━━━━━━━━━━━━
↩️ Este mensaje ya confirmó la compra. Aquí está su recibo original.

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque

👤 Vendedor: Miguel
💰 100 ChengCoins pagados en esa compra
Saldo tras esa compra: *0 ChengCoins*

👤 La unidad cambió de propietario desde esa compra.

👉 Tu colección: *.ctupersonajes*
```

## Propiedad: cadena de dos ventas

```text
🃏 *CHENGDÚ CARDS | PROPIEDAD*
━━━━━━━━━━━━━━
🎴 *Panda Guerrero*
👤 Propietario actual: *Miguel*

🌱 Emitida para Miguel
Primera emisión · 11 oct 2026, 14:00 (CDMX)

🤝 Miguel → Lukas
Compra en el mercado · 13 oct 2026, 14:00 (CDMX)

🤝 Lukas → Miguel
Compra en el mercado · 13 oct 2026, 14:00 (CDMX)

📄 *Página 1 de 1*
👉 Stats y ataques: *.ctuficha PAND-000001*
```

## Apertura antigua: recibo original después de vender la unidad

```text
🃏 *CHENGDÚ CARDS | SOBRE ABIERTO*
━━━━━━━━━━━━━━
↩️ Este mensaje ya abrió un sobre. Aquí está su resultado original.

🐉 *Dragón Carmesí*
🟡 Legendario · Dorada

🧬 Firme · Agresivo

💰 500 ChengCoins pagados en la apertura original
Saldo tras esa apertura: *300 ChengCoins*

👤 Esa unidad cambió de propietario desde la apertura.

👉 Tu colección: *.ctupersonajes*
```

## Retirar anuncio: libera la unidad sin comisión

```text
🃏 *CHENGDÚ CARDS | ANUNCIO*
━━━━━━━━━━━━━━
↩️ Anuncio retirado. Tu unidad está disponible de nuevo.

🐉 *Dragón Carmesí* · Nv. 1
🟡 Legendario · Atacante · ✨ Dorada · 🧬 2 rasgos

💰 Retirar o dejar vencer el anuncio no cobra comisión.

👉 Tu colección: *.ctupersonajes*
```

## Repetir retirada: conserva la cancelación

```text
🃏 *CHENGDÚ CARDS | ANUNCIO*
━━━━━━━━━━━━━━
↩️ Este anuncio ya se había retirado.

🐉 *Dragón Carmesí* · Nv. 1
🟡 Legendario · Atacante · ✨ Dorada · 🧬 2 rasgos

💰 Retirar o dejar vencer el anuncio no cobra comisión.

👉 Tu colección: *.ctupersonajes*
```

## Error: el anuncio ya fue retirado

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
🛍️ Ese anuncio ya se vendió, se retiró o venció.
👉 Consulta .ctumercado
```

## Movimientos: compras y ventas junto a diarios y combates

```text
🃏 *CHENGDÚ CARDS | MOVIMIENTOS*
━━━━━━━━━━━━━━
📥 *+19 ChengCoins* · 🤝 Venta de unidad
📅 13 oct 2026, 14:00

📤 *-75 ChengCoins* · 🛒 Compra de unidad
📅 13 oct 2026, 14:00

📥 *+95 ChengCoins* · 🤝 Venta de unidad
📅 13 oct 2026, 14:00

📤 *-500 ChengCoins* · 🎁 Sobre
📅 13 oct 2026, 14:00

📥 *+100 ChengCoins* · 📅 Diario
📅 13 oct 2026, 14:00

📄 *Página 1 de 3*
➡️ Siguiente: *.ctumovimientos 2*
👉 Tu saldo: *.ctubalance*
```

## Vencimiento: rechaza la compra y libera el bloqueo

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
⌛ El anuncio venció y la unidad quedó disponible para su propietario.
👉 Consulta .ctumercado
```

## Anuncio vencido: conserva la ficha histórica

```text
🃏 *CHENGDÚ CARDS | ANUNCIO M5*
━━━━━━━━━━━━━━
🐺 *Lobo Sombrío* · Nv. 1
⚪ Común · Velocista

👤 Vendedor: *Lukas*
💰 Precio: *20 ChengCoins*

❤️ 95 HP · ⚔️ 27 ATQ · 🛡️ 17 DEF · 💨 16 VEL
📌 Stats al publicar.

⌛ Anuncio vencido
⏳ Vence: 20 oct 2026, 14:00 (CDMX)

🔎 Ataques y rasgos: .ctuficha LOBO-000001
```

## Equipo: unidad disponible después del vencimiento

```text
🃏 *CHENGDÚ CARDS | EQUIPO*
━━━━━━━━━━━━━━
🛡️ *Lukas* · 1/3 unidades

1️⃣ 🐺 *Lobo Sombrío* · Nv. 1
⚔️ Abre el combate

✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
🔀 Orden: .ctuequipo ordenar 1
```

## Equipo avanzado: tres unidades y orden de entrada

```text
🃏 *CHENGDÚ CARDS | EQUIPO*
━━━━━━━━━━━━━━
🛡️ *Miguel* · 3/3 unidades

1️⃣ 🐼 *Panda Guerrero* · Nv. 2
⚔️ Abre el combate

2️⃣ 🔥 *Mago Carmesí* · Nv. 1
🪑 Reserva

3️⃣ 🧘 *Monje Celestial* · Nv. 1
🪑 Reserva

✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
🔀 Orden: .ctuequipo ordenar 3 2 1
```

## Equipo: reordenar con slots cortos

```text
🃏 *CHENGDÚ CARDS | EQUIPO*
━━━━━━━━━━━━━━
🛡️ *Miguel* · 3/3 unidades

1️⃣ 🔥 *Mago Carmesí* · Nv. 1
⚔️ Abre el combate

2️⃣ 🐼 *Panda Guerrero* · Nv. 2
🪑 Reserva

3️⃣ 🧘 *Monje Celestial* · Nv. 1
🪑 Reserva

✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
🔀 Orden: .ctuequipo ordenar 3 2 1
```

## Ficha avanzada del equipo: elementos, pasivas y cooldowns

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Miguel
🆔 PAND-000001
🌱 Nivel 2
❤️ Vida: 122/122 HP
⚔️ Ataque: 25 · 🛡️ Defensa: 23 · 💨 Velocidad: 8

🌿 Naturaleza
✨ *Piel de Bambú*
Al entrar por primera vez obtiene un escudo de 12 puntos durante 2 turnos propios.

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%
🌿 Naturaleza · Sin recarga

2️⃣ *Impacto del Panda* · Físico
Potencia: 36 POT · Precisión: 85%
🌿 Naturaleza · Recarga: 2 turnos propios
🛡️ Escudo 12 puntos · 2 turnos propios

🔥 *Mago Carmesí* · Miguel
🆔 MAGC-000001
🌱 Nivel 1
❤️ Vida: 100/100 HP
⚔️ Ataque: 32 · 🛡️ Defensa: 16 · 💨 Velocidad: 10

🔥 Fuego
✨ *Sangre Carmesí*
Al entrar por primera vez aumenta su ataque un 12% durante 2 turnos propios.

1️⃣ *Chispa Carmesí* · Mágico
Potencia: 25 POT · Precisión: 100%
🔥 Fuego · Sin recarga

2️⃣ *Llamarada* · Mágico
Potencia: 36 POT · Precisión: 80%
🔥 Fuego · Recarga: 2 turnos propios
🔥 Quemadura 4% · 2 turnos propios del rival

🧘 *Monje Celestial* · Miguel
🆔 MONJ-000001
🌱 Nivel 1
❤️ Vida: 114/114 HP
⚔️ Ataque: 27 · 🛡️ Defensa: 21 · 💨 Velocidad: 11

☀️ Luz
✨ *Serenidad*
Al entrar por primera vez obtiene un escudo de 6 puntos durante 2 turnos propios y regenera un 8% de su vida máxima al comenzar cada uno de sus próximos 3 turnos, sin superar su vida máxima.

1️⃣ *Palma Celestial* · Físico
Potencia: 25 POT · Precisión: 100%
☀️ Luz · Sin recarga

2️⃣ *Puño del Alba* · Físico
Potencia: 32 POT · Precisión: 90%
☀️ Luz · Recarga: 2 turnos propios
💚 Regeneración 6% · 2 turnos propios

💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.
🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego
☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.
Fallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.
```

## Desafío avanzado: formato 3v3

```text
🃏 *CHENGDÚ CARDS | DESAFÍO*
━━━━━━━━━━━━━━
⚔️ *Miguel* desafió a *Lukas* · *3v3*

🛡️ 3 unidades por jugador · Elementos, pasivas y efectos

📣 *Lukas, ¿aceptas?*
👉 *.ctuaceptar* o *.cturechazar*

⏳ Vence a las 14:05 (CDMX).
↩️ Retirar: .ctucancelar
```

## Inicio 3v3: pasivas, activos y reservas

```text
🃏 *CHENGDÚ CARDS | INICIO | T1*
━━━━━━━━━━━━━━
⚔️ *Miguel* vs *Lukas* · *3v3*
🐺 *Lobo Sombrío* toma la iniciativa.

✨ 🐼 Panda Guerrero: *Piel de Bambú*
🛡️ Escudo → 🐼 Panda Guerrero · 2 turnos
✨ 🐺 Lobo Sombrío: *Mirada Nocturna*
🛡️ Defensa reducida → 🐼 Panda Guerrero · 2 turnos
🛡️ Escudo → 🐺 Lobo Sombrío · 2 turnos

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 2T
🪑 2 🔥 Mago Carmesí: 100/100 HP
3 🧘 Monje Celestial: 114/114 HP

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▓▓▓▓▓▓ 95/95 HP
🛡️ Escudo 10
🪑 2 🛡️ Guardián Jade: 133/133 HP
3 🌙 Bruja Lunar: 108/108 HP

🎯 *Turno de Lukas*
1️⃣ Garra Sombría · 25 POT
2️⃣ Colmillo Nocturno · 35 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 2* / *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Error: las reservas también están bloqueadas en combate

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
🔒 Esa unidad está en combate, en venta o reservada en un intercambio.
👉 Consulta .ctumercado mios, .ctucombate o .ctuintercambio mios.
📖 Para un encuentro narrativo: .ctuhistoria
```

## Cambio voluntario: consume turno y activa la pasiva

```text
🃏 *CHENGDÚ CARDS | T2*
━━━━━━━━━━━━━━
🔀 *Lukas* eligió a 🛡️ *Guardián Jade*
✨ 🛡️ Guardián Jade: *Muralla de Jade*
🛡️ Escudo → 🛡️ Guardián Jade · 2 turnos

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 2T
🪑 2 🔥 Mago Carmesí: 100/100 HP
3 🧘 Monje Celestial: 114/114 HP

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▓▓ 133/133 HP
🛡️ Escudo 18
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 108/108 HP

🎯 *Turno de Miguel*
1️⃣ Golpe de Bambú · 25 POT
2️⃣ Impacto del Panda · 36 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 2* / *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Repetir cambio: muestra el estado sin volver a actuar

```text
🃏 *CHENGDÚ CARDS | T2*
━━━━━━━━━━━━━━
♻️ Esta acción ya se había registrado. Estado actual:

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 2T
🪑 2 🔥 Mago Carmesí: 100/100 HP
3 🧘 Monje Celestial: 114/114 HP

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▓▓ 133/133 HP
🛡️ Escudo 18
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 108/108 HP

🎯 *Turno de Miguel*
1️⃣ Golpe de Bambú · 25 POT
2️⃣ Impacto del Panda · 36 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 2* / *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Mago: ataque aumentado al entrar

```text
🃏 *CHENGDÚ CARDS | T3*
━━━━━━━━━━━━━━
🔀 *Miguel* eligió a 🔥 *Mago Carmesí*
✨ 🔥 Mago Carmesí: *Sangre Carmesí*
⚔️ Ataque aumentado → 🔥 Mago Carmesí · 2 turnos

❤️ *ESTADO*
🔥 *Miguel* · Mago Carmesí
▓▓▓▓▓▓▓▓▓▓ 100/100 HP
⚔️ Ataque aumentado 2T
🪑 1 🐼 Panda Guerrero: 122/122 HP
3 🧘 Monje Celestial: 114/114 HP

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▓▓ 133/133 HP
🛡️ Escudo 18
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 108/108 HP

🎯 *Turno de Lukas*
1️⃣ Golpe de Jade · 25 POT
2️⃣ Martillo del Guardián · 30 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 1* / *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Bruja: veneno de la pasiva dentro del mismo turno

```text
🃏 *CHENGDÚ CARDS | T4*
━━━━━━━━━━━━━━
🔀 *Lukas* eligió a 🌙 *Bruja Lunar*
✨ 🌙 Bruja Lunar: *Marea Lunar*
☠️ Veneno → 🔥 Mago Carmesí · 2 turnos

❤️ *ESTADO*
🔥 *Miguel* · Mago Carmesí
▓▓▓▓▓▓▓▓▓▓ 100/100 HP
☠️ Veneno 2T · ⚔️ Ataque aumentado 2T
🪑 1 🐼 Panda Guerrero: 122/122 HP
3 🧘 Monje Celestial: 114/114 HP

🌙 *Lukas* · Bruja Lunar
▓▓▓▓▓▓▓▓▓▓ 108/108 HP
🪑 1 🐺 Lobo Sombrío: 95/95 HP
2 🛡️ Guardián Jade: 133/133 HP

🎯 *Turno de Miguel*
1️⃣ Chispa Carmesí · 25 POT
2️⃣ Llamarada · 36 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 1* / *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Fuego contra agua: resistencia, quemadura y veneno visibles

```text
🃏 *CHENGDÚ CARDS | T5*
━━━━━━━━━━━━━━
🔥 *Mago Carmesí* usó _Llamarada_
💥 *40 de daño* a Bruja Lunar
☠️ Veneno: 🔥 Mago Carmesí pierde 3 HP
🌿 Ataque poco eficaz
🔥 Quemadura → 🌙 Bruja Lunar · 2 turnos

❤️ *ESTADO*
🔥 *Miguel* · Mago Carmesí
▓▓▓▓▓▓▓▓▓▓ 97/100 HP
☠️ Veneno 1T · ⚔️ Ataque aumentado 1T
🪑 1 🐼 Panda Guerrero: 122/122 HP
3 🧘 Monje Celestial: 114/114 HP

🌙 *Lukas* · Bruja Lunar
▓▓▓▓▓▓▓▒▒▒ 68/108 HP
🔥 Quemadura 2T
🪑 1 🐺 Lobo Sombrío: 95/95 HP
2 🛡️ Guardián Jade: 133/133 HP

🎯 *Turno de Lukas*
1️⃣ Pulso Lunar · 25 POT
2️⃣ Ráfaga de Medianoche · 31 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 1* / *.ctucambiar 2* · Consume turno
🔎 Detalles: .ctuficha
```

## Agua contra fuego: ventaja elemental y veneno

```text
🃏 *CHENGDÚ CARDS | T6*
━━━━━━━━━━━━━━
🌙 *Bruja Lunar* usó _Ráfaga de Medianoche_
💥 *60 de daño* a Mago Carmesí
🔥 Quemadura: 🌙 Bruja Lunar pierde 4 HP
🌟 ¡Ataque muy eficaz!
☠️ Veneno → 🔥 Mago Carmesí · 3 turnos

❤️ *ESTADO*
🔥 *Miguel* · Mago Carmesí
▓▓▓▓▒▒▒▒▒▒ 37/100 HP
☠️ Veneno 3T · ⚔️ Ataque aumentado 1T
🪑 1 🐼 Panda Guerrero: 122/122 HP
3 🧘 Monje Celestial: 114/114 HP

🌙 *Lukas* · Bruja Lunar
▓▓▓▓▓▓▒▒▒▒ 64/108 HP
🔥 Quemadura 1T
🪑 1 🐺 Lobo Sombrío: 95/95 HP
2 🛡️ Guardián Jade: 133/133 HP

🎯 *Turno de Miguel*
1️⃣ Chispa Carmesí · 25 POT
2️⃣ Llamarada · 36 POT · ⏳ 2T

👉 *.ctuatacar 1*
🔀 *.ctucambiar 1* / *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Error: una habilidad en cooldown no consume el turno

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
⏳ Ese ataque aún está recuperándose.
Elige el otro ataque o cambia de unidad con .ctucambiar.
```

## Ataque básico: permite avanzar mientras se recupera la habilidad

```text
🃏 *CHENGDÚ CARDS | T7*
━━━━━━━━━━━━━━
🔥 *Mago Carmesí* usó _Chispa Carmesí_
💥 *31 de daño* a Bruja Lunar
☠️ Veneno: 🔥 Mago Carmesí pierde 5 HP
🌿 Ataque poco eficaz
⚔️ Ataque aumentado terminó en 🔥 Mago Carmesí

❤️ *ESTADO*
🔥 *Miguel* · Mago Carmesí
▓▓▓▓▒▒▒▒▒▒ 32/100 HP
☠️ Veneno 2T
🪑 1 🐼 Panda Guerrero: 122/122 HP
3 🧘 Monje Celestial: 114/114 HP

🌙 *Lukas* · Bruja Lunar
▓▓▓▓▒▒▒▒▒▒ 33/108 HP
🔥 Quemadura 1T
🪑 1 🐺 Lobo Sombrío: 95/95 HP
2 🛡️ Guardián Jade: 133/133 HP

🎯 *Turno de Lukas*
1️⃣ Pulso Lunar · 25 POT
2️⃣ Ráfaga de Medianoche · 31 POT · ⏳ 2T

👉 *.ctuatacar 1*
🔀 *.ctucambiar 1* / *.ctucambiar 2* · Consume turno
🔎 Detalles: .ctuficha
```

## KO y relevo automático: entra la siguiente unidad viva

```text
🃏 *CHENGDÚ CARDS | T8*
━━━━━━━━━━━━━━
🌙 *Bruja Lunar* usó _Pulso Lunar_
💥 *32 de daño* a Mago Carmesí
🔥 Quemadura: 🌙 Bruja Lunar pierde 4 HP
🔥 Quemadura terminó en 🌙 Bruja Lunar
🌟 ¡Ataque muy eficaz!
💤 🔥 Mago Carmesí quedó fuera de combate
⚔️ 🐼 Panda Guerrero entra al combate

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 1T
🪑 2 🔥 Mago Carmesí: 💤 KO
3 🧘 Monje Celestial: 114/114 HP

🌙 *Lukas* · Bruja Lunar
▓▓▓▒▒▒▒▒▒▒ 29/108 HP
🪑 1 🐺 Lobo Sombrío: 95/95 HP
2 🛡️ Guardián Jade: 133/133 HP

🎯 *Turno de Miguel*
1️⃣ Golpe de Bambú · 25 POT
2️⃣ Impacto del Panda · 36 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Ataque con escudo y victoria sobre una unidad, sin cerrar el equipo

```text
🃏 *CHENGDÚ CARDS | T9*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* usó _Impacto del Panda_
💥 *29 de daño* a Bruja Lunar
🌟 ¡Ataque muy eficaz!
🛡️ Escudo → 🐼 Panda Guerrero · 2 turnos
💤 🌙 Bruja Lunar quedó fuera de combate
⚔️ 🐺 Lobo Sombrío entra al combate
🛡️ Defensa reducida terminó en 🐼 Panda Guerrero

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12
🪑 2 🔥 Mago Carmesí: 💤 KO
3 🧘 Monje Celestial: 114/114 HP

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▓▓▓▓▓▓ 95/95 HP
🛡️ Escudo 10
🪑 2 🛡️ Guardián Jade: 133/133 HP
3 🌙 Bruja Lunar: 💤 KO

🎯 *Turno de Lukas*
1️⃣ Garra Sombría · 25 POT
2️⃣ Colmillo Nocturno · 35 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 2* · Consume turno
🔎 Detalles: .ctuficha
```

## Escudo: daño bloqueado dentro de la respuesta

```text
🃏 *CHENGDÚ CARDS | T11*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* usó _Golpe de Bambú_
💥 *4 de daño* a Guardián Jade
🛡️ 🛡️ Guardián Jade bloqueó 18 de daño
🛡️ Escudo terminó en 🛡️ Guardián Jade

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12
🪑 2 🔥 Mago Carmesí: 💤 KO
3 🧘 Monje Celestial: 114/114 HP

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▓▓ 129/133 HP
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 💤 KO

🎯 *Turno de Lukas*
1️⃣ Golpe de Jade · 25 POT
2️⃣ Martillo del Guardián · 30 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔀 *.ctucambiar 1* · Consume turno
🔎 Detalles: .ctuficha
```

## Guardián: aplica aturdimiento con su habilidad

```text
🃏 *CHENGDÚ CARDS | T12*
━━━━━━━━━━━━━━
🛡️ *Guardián Jade* usó _Martillo del Guardián_
💥 *18 de daño* a Panda Guerrero
🛡️ 🐼 Panda Guerrero bloqueó 12 de daño
🛡️ Escudo terminó en 🐼 Panda Guerrero
❄️ Aturdido → 🐼 Panda Guerrero · 1 turnos

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▒ 104/122 HP
❄️ Aturdido 1T
🪑 2 🔥 Mago Carmesí: 💤 KO
3 🧘 Monje Celestial: 114/114 HP

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▓▓ 129/133 HP
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 💤 KO

🎯 *Turno de Miguel*
1️⃣ Golpe de Bambú · 25 POT
2️⃣ Impacto del Panda · 36 POT · ⏳ 1T

👉 *.ctuatacar 1*
🔀 *.ctucambiar 3* · Consume turno
🔎 Detalles: .ctuficha
```

## Aturdimiento: un turno omitido y estado actualizado

```text
🃏 *CHENGDÚ CARDS | T13*
━━━━━━━━━━━━━━
❄️ 🐼 Panda Guerrero no pudo actuar
❄️ Aturdido terminó en 🐼 Panda Guerrero

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▒ 104/122 HP
🪑 2 🔥 Mago Carmesí: 💤 KO
3 🧘 Monje Celestial: 114/114 HP

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▓▓ 129/133 HP
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 💤 KO

🎯 *Turno de Lukas*
1️⃣ Golpe de Jade · 25 POT
2️⃣ Martillo del Guardián · 30 POT · ⏳ 3T

👉 *.ctuatacar 1*
🔀 *.ctucambiar 1* · Consume turno
🔎 Detalles: .ctuficha
```

## Monje: entrada con regeneración

```text
🃏 *CHENGDÚ CARDS | T15*
━━━━━━━━━━━━━━
🔀 *Miguel* eligió a 🧘 *Monje Celestial*
✨ 🧘 Monje Celestial: *Serenidad*
💚 Regeneración → 🧘 Monje Celestial · 3 turnos
🛡️ Escudo → 🧘 Monje Celestial · 2 turnos

❤️ *ESTADO*
🧘 *Miguel* · Monje Celestial
▓▓▓▓▓▓▓▓▓▓ 114/114 HP
🛡️ Escudo 6 · 💚 Regeneración 3T
🪑 1 🐼 Panda Guerrero: 79/122 HP
2 🔥 Mago Carmesí: 💤 KO

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▓▓ 129/133 HP
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 💤 KO

🎯 *Turno de Lukas*
1️⃣ Golpe de Jade · 25 POT
2️⃣ Martillo del Guardián · 30 POT · ⏳ 2T

👉 *.ctuatacar 1*
🔀 *.ctucambiar 1* · Consume turno
🔎 Detalles: .ctuficha
```

## Regeneración: recuperación al comienzo del turno

```text
🃏 *CHENGDÚ CARDS | T17*
━━━━━━━━━━━━━━
🧘 *Monje Celestial* usó _Palma Celestial_
💥 *24 de daño* a Guardián Jade
💚 Regeneración: 🧘 Monje Celestial recupera 9 HP

❤️ *ESTADO*
🧘 *Miguel* · Monje Celestial
▓▓▓▓▓▓▓▓▓▒ 102/114 HP
💚 Regeneración 2T
🪑 1 🐼 Panda Guerrero: 79/122 HP
2 🔥 Mago Carmesí: 💤 KO

🛡️ *Lukas* · Guardián Jade
▓▓▓▓▓▓▓▓▒▒ 105/133 HP
🪑 1 🐺 Lobo Sombrío: 95/95 HP
3 🌙 Bruja Lunar: 💤 KO

🎯 *Turno de Lukas*
1️⃣ Golpe de Jade · 25 POT
2️⃣ Martillo del Guardián · 30 POT · ⏳ 1T

👉 *.ctuatacar 1*
🔀 *.ctucambiar 1* · Consume turno
🔎 Detalles: .ctuficha
```

## Ficha de una unidad de banca derrotada: snapshot del combate

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
🔥 *Mago Carmesí* · Miguel
🆔 MAGC-000001
🌱 Nivel 1
❤️ Vida: 0/100 HP
⚔️ Ataque: 32 · 🛡️ Defensa: 16 · 💨 Velocidad: 10

🔥 Fuego
✨ *Sangre Carmesí*
Al entrar por primera vez aumenta su ataque un 12% durante 2 turnos propios.
📌 Pasiva ya activada en este combate.

1️⃣ *Chispa Carmesí* · Mágico
Potencia: 25 POT · Precisión: 100%
🔥 Fuego · Sin recarga

2️⃣ *Llamarada* · Mágico
Potencia: 36 POT · Precisión: 80%
🔥 Fuego · Recarga: 2 turnos propios
🔥 Quemadura 4% · 2 turnos propios del rival
📌 Datos del combate activo.
🪑 Unidad en reserva.

💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.
🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego
☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.
Fallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.
```

## Final 3v3: monedas únicas y XP repartida entre participantes

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
🐺 *Lobo Sombrío* usó _Garra Sombría_
💥 *21 de daño* a Panda Guerrero
💤 🐼 Panda Guerrero quedó fuera de combate

🐺 *¡Lukas derrotó a Miguel!*

⚔️ 3v3 · 31 turnos · ❤️ 29 HP restantes

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▒▒▒▒▒▒▒▒▒▒ 0/122 HP
🪑 2 🔥 Mago Carmesí: 💤 KO
3 🧘 Monje Celestial: 💤 KO

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▒▒▒▒▒▒ 29/95 HP
🪑 2 🛡️ Guardián Jade: 💤 KO
3 🌙 Bruja Lunar: 💤 KO

🎁 *RECOMPENSAS*
Miguel: +15 XP
🐼 Panda Guerrero: +5 XP
🔥 Mago Carmesí: +5 XP
🧘 Monje Celestial: +5 XP
Lukas: +120 ChengCoins · +35 XP
🐺 Lobo Sombrío: +12 XP
🛡️ Guardián Jade: +12 XP
🌙 Bruja Lunar: +11 XP
🌱 Lukas subió al nivel 2

⚔️ Otra partida: .ctupelea @jugador
```

## Historial avanzado: cambios, efectos y relevo de cada turno

```text
🃏 *CHENGDÚ CARDS | PARTIDA*
━━━━━━━━━━━━━━
💔 Derrota · 3v3 · 20 de octubre de 2026
Miguel · Panda Guerrero · Niv. 2 / Mago Carmesí · Niv. 1 / Monje Celestial · Niv. 1
Lukas · Lobo Sombrío · Niv. 1 / Guardián Jade · Niv. 1 / Bruja Lunar · Niv. 1

✨ *ENTRADA*
✨ 🐼 Panda Guerrero: *Piel de Bambú*
🛡️ Escudo → 🐼 Panda Guerrero · 2 turnos
✨ 🐺 Lobo Sombrío: *Mirada Nocturna*
🛡️ Defensa reducida → 🐼 Panda Guerrero · 2 turnos
🛡️ Escudo → 🐺 Lobo Sombrío · 2 turnos

⚔️ *TURNOS*
T1 · 🔀 *Lukas* eligió a 🛡️ *Guardián Jade*
✨ 🛡️ Guardián Jade: *Muralla de Jade*
🛡️ Escudo → 🛡️ Guardián Jade · 2 turnos

T2 · 🔀 *Miguel* eligió a 🔥 *Mago Carmesí*
✨ 🔥 Mago Carmesí: *Sangre Carmesí*
⚔️ Ataque aumentado → 🔥 Mago Carmesí · 2 turnos

T3 · 🔀 *Lukas* eligió a 🌙 *Bruja Lunar*
✨ 🌙 Bruja Lunar: *Marea Lunar*
☠️ Veneno → 🔥 Mago Carmesí · 2 turnos

T4 · 🔥 *Mago Carmesí* usó _Llamarada_
💥 *40 de daño* a Bruja Lunar
☠️ Veneno: 🔥 Mago Carmesí pierde 3 HP
🌿 Ataque poco eficaz
🔥 Quemadura → 🌙 Bruja Lunar · 2 turnos

T5 · 🌙 *Bruja Lunar* usó _Ráfaga de Medianoche_
💥 *60 de daño* a Mago Carmesí
🔥 Quemadura: 🌙 Bruja Lunar pierde 4 HP
🌟 ¡Ataque muy eficaz!
☠️ Veneno → 🔥 Mago Carmesí · 3 turnos

T6 · 🔥 *Mago Carmesí* usó _Chispa Carmesí_
💥 *31 de daño* a Bruja Lunar
☠️ Veneno: 🔥 Mago Carmesí pierde 5 HP
🌿 Ataque poco eficaz
⚔️ Ataque aumentado terminó en 🔥 Mago Carmesí

T7 · 🌙 *Bruja Lunar* usó _Pulso Lunar_
💥 *32 de daño* a Mago Carmesí
🔥 Quemadura: 🌙 Bruja Lunar pierde 4 HP
🔥 Quemadura terminó en 🌙 Bruja Lunar
🌟 ¡Ataque muy eficaz!
💤 🔥 Mago Carmesí quedó fuera de combate
⚔️ 🐼 Panda Guerrero entra al combate

T8 · 🐼 *Panda Guerrero* usó _Impacto del Panda_
💥 *29 de daño* a Bruja Lunar
🌟 ¡Ataque muy eficaz!
🛡️ Escudo → 🐼 Panda Guerrero · 2 turnos
💤 🌙 Bruja Lunar quedó fuera de combate
⚔️ 🐺 Lobo Sombrío entra al combate
🛡️ Defensa reducida terminó en 🐼 Panda Guerrero

T9 · 🔀 *Lukas* eligió a 🛡️ *Guardián Jade*
🛡️ Escudo terminó en 🐺 Lobo Sombrío

T10 · 🐼 *Panda Guerrero* usó _Golpe de Bambú_
💥 *4 de daño* a Guardián Jade
🛡️ 🛡️ Guardián Jade bloqueó 18 de daño
🛡️ Escudo terminó en 🛡️ Guardián Jade

T11 · 🛡️ *Guardián Jade* usó _Martillo del Guardián_
💥 *18 de daño* a Panda Guerrero
🛡️ 🐼 Panda Guerrero bloqueó 12 de daño
🛡️ Escudo terminó en 🐼 Panda Guerrero
❄️ Aturdido → 🐼 Panda Guerrero · 1 turnos

T12 · ❄️ 🐼 Panda Guerrero no pudo actuar
❄️ Aturdido terminó en 🐼 Panda Guerrero

T13 · 🛡️ *Guardián Jade* usó _Golpe de Jade_
💥 *25 de daño* a Panda Guerrero

T14 · 🔀 *Miguel* eligió a 🧘 *Monje Celestial*
✨ 🧘 Monje Celestial: *Serenidad*
💚 Regeneración → 🧘 Monje Celestial · 3 turnos
🛡️ Escudo → 🧘 Monje Celestial · 2 turnos

T15 · 🛡️ *Guardián Jade* usó _Golpe de Jade_
💥 *21 de daño* a Monje Celestial
🛡️ 🧘 Monje Celestial bloqueó 6 de daño
🛡️ Escudo terminó en 🧘 Monje Celestial

T16 · 🧘 *Monje Celestial* usó _Palma Celestial_
💥 *24 de daño* a Guardián Jade
💚 Regeneración: 🧘 Monje Celestial recupera 9 HP

T17 · 🛡️ *Guardián Jade* usó _Golpe de Jade_
💥 *27 de daño* a Monje Celestial

T18 · 🧘 *Monje Celestial* usó _Palma Celestial_
💥 *24 de daño* a Guardián Jade
💚 Regeneración: 🧘 Monje Celestial recupera 9 HP

T19 · 🛡️ *Guardián Jade* usó _Golpe de Jade_
💥 *27 de daño* a Monje Celestial

T20 · 🧘 *Monje Celestial* usó _Palma Celestial_
💥 *24 de daño* a Guardián Jade
💚 Regeneración: 🧘 Monje Celestial recupera 9 HP
💚 Regeneración terminó en 🧘 Monje Celestial

T21 · 🛡️ *Guardián Jade* usó _Golpe de Jade_
💥 *27 de daño* a Monje Celestial

T22 · 🧘 *Monje Celestial* usó _Palma Celestial_
💥 *24 de daño* a Guardián Jade

T23 · 🛡️ *Guardián Jade* usó _Golpe de Jade_
💥 *27 de daño* a Monje Celestial

T24 · 🧘 *Monje Celestial* usó _Palma Celestial_
💥 *24 de daño* a Guardián Jade

T25 · 🛡️ *Guardián Jade* usó _Golpe de Jade_
💥 *12 de daño* a Monje Celestial
💤 🧘 Monje Celestial quedó fuera de combate
⚔️ 🐼 Panda Guerrero entra al combate

T26 · 🐼 *Panda Guerrero* usó _Golpe de Bambú_
💥 *9 de daño* a Guardián Jade
💤 🛡️ Guardián Jade quedó fuera de combate
⚔️ 🐺 Lobo Sombrío entra al combate

T27 · 🐺 *Lobo Sombrío* usó _Garra Sombría_
💥 *29 de daño* a Panda Guerrero

T28 · 🐼 *Panda Guerrero* usó _Golpe de Bambú_
💥 *33 de daño* a Lobo Sombrío

T29 · 🐺 *Lobo Sombrío* usó _Garra Sombría_
💥 *29 de daño* a Panda Guerrero

T30 · 🐼 *Panda Guerrero* usó _Golpe de Bambú_
💥 *33 de daño* a Lobo Sombrío

T31 · 🐺 *Lobo Sombrío* usó _Garra Sombría_
💥 *21 de daño* a Panda Guerrero
💤 🐼 Panda Guerrero quedó fuera de combate

🎁 *RECOMPENSAS*
Miguel: +15 XP
🐼 Panda Guerrero: +5 XP
🔥 Mago Carmesí: +5 XP
🧘 Monje Celestial: +5 XP
Lukas: +120 ChengCoins · +35 XP
🐺 Lobo Sombrío: +12 XP
🛡️ Guardián Jade: +12 XP
🌙 Bruja Lunar: +11 XP
🌱 Lukas subió al nivel 2

👉 *.ctuhistorial*
```

## Equipo después del combate: seis unidades desbloqueadas

```text
🃏 *CHENGDÚ CARDS | EQUIPO*
━━━━━━━━━━━━━━
🛡️ *Miguel* · 3/3 unidades

1️⃣ 🐼 *Panda Guerrero* · Nv. 2
⚔️ Abre el combate

2️⃣ 🔥 *Mago Carmesí* · Nv. 1
🪑 Reserva

3️⃣ 🧘 *Monje Celestial* · Nv. 1
🪑 Reserva

✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
🔀 Orden: .ctuequipo ordenar 3 2 1
```

## Desafío sin modo: combate avanzado 1v1 entre starters

```text
🃏 *CHENGDÚ CARDS | DESAFÍO*
━━━━━━━━━━━━━━
⚔️ *Miguel* desafió a *Lukas* · *1v1*

🛡️ 1 unidad por jugador · Elementos, pasivas y efectos

📣 *Lukas, ¿aceptas?*
👉 *.ctuaceptar* o *.cturechazar*

⏳ Vence a las 14:05 (CDMX).
↩️ Retirar: .ctucancelar
```

## 1v1 avanzado: elementos y pasivas también con una unidad

```text
🃏 *CHENGDÚ CARDS | INICIO | T1*
━━━━━━━━━━━━━━
⚔️ *Miguel* vs *Lukas* · *1v1*
🐺 *Lobo Sombrío* toma la iniciativa.

✨ 🐼 Panda Guerrero: *Piel de Bambú*
🛡️ Escudo → 🐼 Panda Guerrero · 2 turnos
✨ 🐺 Lobo Sombrío: *Mirada Nocturna*
🛡️ Defensa reducida → 🐼 Panda Guerrero · 2 turnos
🛡️ Escudo → 🐺 Lobo Sombrío · 2 turnos

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 2T

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▓▓▓▓▓▓ 95/95 HP
🛡️ Escudo 10

🎯 *Turno de Lukas*
1️⃣ Garra Sombría · 25 POT
2️⃣ Colmillo Nocturno · 35 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔎 Detalles: .ctuficha
```

## Rendición temprana avanzada: cierra sin premios

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
🏳️ Miguel se rindió.

🐺 *¡Lukas derrotó a Miguel!*

⚔️ 1v1 · 0 turnos · ❤️ 95 HP restantes

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 2T

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▓▓▓▓▓▓ 95/95 HP
🛡️ Escudo 10

🎁 Sin recompensa: rendición antes de 4 ataques entre ambos jugadores.

⚔️ Otra partida: .ctupelea @jugador
```

## Misiones: progreso de hoy y comandos cortos para cobrar

```text
🃏 *CHENGDÚ CARDS | MISIONES DIARIAS*
━━━━━━━━━━━━━━
📋 *1. Dos victorias*
Gana 2 combates válidos.
📊 1/2 · En progreso
💰 +40 ChengCoins · ✨ +15 XP de jugador · 🎟️ +1 ticket

📋 *2. En la arena*
Juega 5 combates válidos.
📊 2/5 · En progreso
💰 +60 ChengCoins · ✨ +20 XP de jugador · 🎟️ +1 ticket

📋 *3. Tres estilos*
Usa 3 personajes diferentes en combates válidos.
📊 1/3 · En progreso
💰 +50 ChengCoins · ✨ +20 XP de jugador · 🎟️ +1 ticket

🔄 Cambian: 23 oct 2026, 00:00
📍 Hora de Ciudad de México. Sólo cuentan partidas con recompensa.
```

## Misión cumplida: monedas, XP y ticket de captura

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
📋 Aún falta completar esa misión.
Consulta tu progreso con .ctumisiones
```

## Misión repetida: recibo original sin otro premio

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
📋 Aún falta completar esa misión.
Consulta tu progreso con .ctumisiones
```

## Logros: historia permanente, títulos e insignias

```text
🃏 *CHENGDÚ CARDS | LOGROS*
━━━━━━━━━━━━━━
🏅 *L1 · Primera sangre*
Gana tu primera batalla válida.
📊 1/1 · Desbloqueado
🎖️ Título: Primer filo
🏵️ ⚔️
💰 +60 ChengCoins · ✨ +20 XP de jugador · 🎟️ +1 ticket
👉 *.ctulogros reclamar L1*

🔒 *L2 · Coleccionista*
Obtén 25 unidades distintas a lo largo de tu historia.
📊 4/25 · En progreso
🎖️ Título: Guardián de la colección
🏵️ 🃏
💰 +250 ChengCoins · ✨ +75 XP de jugador · 🎟️ +3 tickets

🔒 *L3 · Veterano*
Juega 100 combates válidos.
📊 8/100 · En progreso
🎖️ Título: Veterano de Chengdú
🏵️ 🛡️
💰 +350 ChengCoins · ✨ +100 XP de jugador · 🎟️ +3 tickets

🔒 *L4 · Invicto*
Gana 10 combates válidos consecutivos.
📊 3/10 · En progreso
🎖️ Título: Invicto
🏵️ 🏆
💰 +200 ChengCoins · ✨ +80 XP de jugador · 🎟️ +2 tickets

📄 *Página 1 de 1*
🎟️ Tu inventario: .ctuinventario
```

## Primera sangre: premio único y título

```text
🃏 *CHENGDÚ CARDS | LOGRO | PREMIO*
━━━━━━━━━━━━━━
🎁 *¡Premio reclamado!*

💰 +60 ChengCoins · ✨ +20 XP de jugador · 🎟️ +1 ticket

💰 Saldo actual: *519 ChengCoins*
🎟️ Tickets disponibles: *1*

🏅 Tus logros: *.ctulogros*
```

## Inventario: tickets y títulos desbloqueados

```text
🃏 *CHENGDÚ CARDS | INVENTARIO*
━━━━━━━━━━━━━━
👤 *Miguel*
🎟️ *1 ticket de captura*

🎖️ *Títulos*
Primer filo

🏵️ *Insignias*
⚔️

🪵 0 fragmentos · ✨ 0 esencias · 🔮 0 sellos
🔨 .ctucrafting

🎟️ Cada captura usa un ticket. Consíguelos completando misiones, logros y eventos.

📋 Misiones: .ctumisiones
🏅 Logros: .ctulogros
🎴 Aparición del grupo: .ctuspawn
```

## Calendario: festival con fechas y personajes exclusivos

```text
🃏 *CHENGDÚ CARDS | EVENTOS*
━━━━━━━━━━━━━━
🏮 *Festival de los Faroles* · 🟢 Disponible
📅 11 oct 2026, 00:00 → 25 oct 2026, 00:00
🎴 2 personajes exclusivos
👉 *.ctuevento faroles*

📄 *Página 1 de 1*
📍 Horarios de Ciudad de México.
```

## Festival: supply global y bienvenida

```text
🃏 *CHENGDÚ CARDS | EVENTO*
━━━━━━━━━━━━━━
🏮 *Festival de los Faroles*
🟢 ¡El festival está abierto!

📅 11 oct 2026, 00:00 → 25 oct 2026, 00:00
📍 Hora de Ciudad de México.

🎴 *Personajes exclusivos*
🔵 Zorro de los Faroles · Raro
↳ 0/35 emitidos · Disponible
🟣 Guardián Espectral · Épico
↳ 0/20 emitidos · Disponible

🎁 *Bienvenida*
💰 +25 ChengCoins · ✨ +10 XP de jugador · 🎟️ +1 ticket
Un premio por jugador.

🌿 Los personajes del festival pueden aparecer en los grupos; necesitas tickets para capturarlos.

👉 Reclamar: *.ctuevento faroles reclamar*
```

## Bienvenida del festival: una vez por jugador

```text
🃏 *CHENGDÚ CARDS | EVENTO | BIENVENIDA*
━━━━━━━━━━━━━━
🎁 *¡Premio reclamado!*

💰 +25 ChengCoins · ✨ +10 XP de jugador · 🎟️ +1 ticket

💰 Saldo actual: *544 ChengCoins*
🎟️ Tickets disponibles: *2*

🏮 Ver evento: *.ctuevento faroles*
🎴 Apariciones: .ctuspawn
```

## Aparición: un compañero exclusivo y captura por un ticket

```text
🃏 *CHENGDÚ CARDS | ¡APARECIÓ UN PERSONAJE!*
━━━━━━━━━━━━━━
👻 *Guardián Espectral*
🟣 Épico · 🏮 Exclusivo de evento

🎟️ Capturar cuesta *1 ticket*
⌛ Disponible hasta 22 oct 2026, 14:10

👉 Capturar: *.ctucapturar S1*
🎟️ Tus tickets: .ctuinventario
```

## Captura: emisión única y procedencia del festival

```text
🃏 *CHENGDÚ CARDS | CAPTURA*
━━━━━━━━━━━━━━
🎉 *¡Miguel capturó un personaje!*

👻 *Guardián Espectral*
🟣 Épico · 🏮 Exclusivo de evento

🎟️ 1 ticket gastado
🎟️ Tickets disponibles: *1*

🎴 Unidad: *ESPE-000001*

👉 Tu colección: *.ctupersonajes*
🔎 Ficha: .ctuunidad ESPE-000001
```

## Captura repetida: no consume otro ticket

```text
🃏 *CHENGDÚ CARDS | CAPTURA*
━━━━━━━━━━━━━━
✅ Este mensaje ya confirmó la captura. No se gastó otro ticket.

👻 *Guardián Espectral*
🟣 Épico · 🏮 Exclusivo de evento

🎟️ 1 ticket gastado
🎟️ Tickets tras esa captura: *1*

🎴 Unidad: *ESPE-000001*

👉 Tu colección: *.ctupersonajes*
🔎 Ficha: .ctuunidad ESPE-000001
```

## Captura perdida: la aparición ya tiene propietario

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
🎴 Esa aparición ya fue capturada o venció.
Consulta .ctuspawn
```

## Personaje del festival: ataques y pasiva propios

```text
🃏 *CHENGDÚ CARDS | FICHA*
━━━━━━━━━━━━━━
👻 *Guardián Espectral* · Miguel
🆔 ESPE-000001
🌱 Nivel 1
❤️ Vida: 132/132 HP
⚔️ Ataque: 25 · 🛡️ Defensa: 26 · 💨 Velocidad: 9

🌙 Oscuridad
✨ *Custodia de los Faroles*
Al entrar obtiene un escudo de 12 puntos durante 2 turnos propios.

1️⃣ *Puño Espectral* · Físico
Potencia: 25 POT · Precisión: 100%
🌙 Oscuridad · Sin recarga

2️⃣ *Velo Espectral* · Físico
Potencia: 28 POT · Precisión: 85%
🌙 Oscuridad · Recarga: 2 turnos propios
🛡️ Escudo 10 puntos · 2 turnos propios

💡 Daño base: potencia + ataque − defensa; después se aplican efectos y elemento.
🔥 Fuego → 🌿 Naturaleza → 💧 Agua → 🔥 Fuego
☀️ Luz ↔ 🌙 Oscuridad · Ventaja +25%; resistencia −20%.
Fallar y cambiar consumen el turno. Los efectos avanzan sólo mientras la unidad está activa.
```

## Procedencia: el festival permanece en la unidad

```text
🃏 *CHENGDÚ CARDS | UNIDAD*
━━━━━━━━━━━━━━
👻 *Guardián Espectral #0001*
🆔 ESPE-000001
🟣 Épico · Tanque · Normal

👤 Propietario: Miguel
✅ Disponible

🌱 Nivel 1 · ✨ 0/100 XP
🏆 0 victorias · 💔 0 derrotas

🧬 Sin rasgos

📜 Evento: Festival de los Faroles · 22 de octubre de 2026

🔎 Stats y ataques: *.ctuficha ESPE-000001*
📜 Propietarios: .ctupropiedad ESPE-000001
```

## Boss cooperativo: vida compartida y ataques disponibles

```text
🃏 *CHENGDÚ CARDS | BOSS MUNDIAL*
━━━━━━━━━━━━━━
👹 *Guardián de la Niebla* · B2
❤️ ▓▓▓▓▓▓▓▓▓▓ 1000/1000 HP

🤝 0 participantes · 💥 0 de daño conjunto

⌛ Termina: 23 oct 2026, 14:00

🛡️ Resiste los efectos de estado.

🙌 Tu aporte: *0 de daño* · 0 ataques

⚔️ Te quedan 20 ataques en este encuentro.

1️⃣ Puño Espectral · 25 POT
2️⃣ Velo Espectral · 28 POT

👉 Atacar: *.ctubossatacar 1 B2* / *.ctubossatacar 2 B2*
🏅 Aportaciones: .ctubosstop B2
```

## Boss: golpe crítico dentro del mismo mensaje

```text
🃏 *CHENGDÚ CARDS | BOSS MUNDIAL*
━━━━━━━━━━━━━━
👹 *Guardián de la Niebla* · B2
❤️ ▓▓▓▓▓▓▓▓▓▓ 932/1000 HP

⚔️ Velo Espectral
🔥 ¡CRÍTICO! *68 de daño*

🤝 1 participante · 💥 68 de daño conjunto

⌛ Termina: 23 oct 2026, 14:00

🛡️ Resiste los efectos de estado.

🙌 Tu aporte: *68 de daño* · 1 ataques

⏳ Puedes volver a atacar: 14:00:30 (CDMX)

⚔️ Te quedan 19 ataques en este encuentro.

1️⃣ Puño Espectral · 25 POT
2️⃣ Velo Espectral · 28 POT

👉 Atacar: *.ctubossatacar 1 B2* / *.ctubossatacar 2 B2*
🏅 Aportaciones: .ctubosstop B2
```

## Boss: un reintento no duplica daño

```text
🃏 *CHENGDÚ CARDS | BOSS MUNDIAL*
━━━━━━━━━━━━━━
👹 *Guardián de la Niebla* · B2
❤️ ▓▓▓▓▓▓▓▓▓▓ 932/1000 HP

🔁 Ataque ya confirmado; se conserva el resultado original.
⚔️ Velo Espectral
🔥 ¡CRÍTICO! *68 de daño*

🤝 1 participante · 💥 68 de daño conjunto

⌛ Termina: 23 oct 2026, 14:00

🛡️ Resiste los efectos de estado.

🙌 Tu aporte: *68 de daño* · 1 ataques

⏳ Puedes volver a atacar: 14:00:30 (CDMX)

⚔️ Te quedan 19 ataques en este encuentro.

1️⃣ Puño Espectral · 25 POT
2️⃣ Velo Espectral · 28 POT

👉 Atacar: *.ctubossatacar 1 B2* / *.ctubossatacar 2 B2*
🏅 Aportaciones: .ctubosstop B2
```

## Boss: cooldown compartido entre grupos

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
⏳ Tu ataque al boss aún se está recuperando.
Consulta .ctuboss para ver cuándo puedes volver.
```

## Boss derrotado: premios por participar, mayor daño y último golpe

```text
🃏 *CHENGDÚ CARDS | BOSS | RESULTADO*
━━━━━━━━━━━━━━
👹 *Guardián de la Niebla* · B2
❤️ ▒▒▒▒▒▒▒▒▒▒ 0/1000 HP

⚔️ Colmillo Nocturno
🔥 ¡CRÍTICO! *44 de daño*

🤝 2 participantes · 💥 1000 de daño conjunto

🏆 *¡Boss derrotado!*
Los premios de participación, mayor daño y último golpe se entregaron automáticamente.

🙌 Tu aporte: *524 de daño* · 7 ataques

💰 +140 ChengCoins · ✨ +35 XP de jugador · 🎟️ +1 ticket

🌅 Próximo encuentro desde: 23 oct 2026, 14:00

🏅 Aportaciones: .ctubosstop B2
```

## Boss: aportaciones de todos los participantes

```text
🃏 *CHENGDÚ CARDS | BOSS | APORTACIONES*
━━━━━━━━━━━━━━
👹 *Guardián de la Niebla* · B2

🥇 *1. Lukas*
💥 524 de daño · ⚔️ 7 ataques

🤝 *2. Miguel*
💥 476 de daño · ⚔️ 7 ataques

📄 *Página 1 de 1*
👹 Ver boss: .ctuboss B2
```

## Inventario después de misiones, festival, captura y boss

```text
🃏 *CHENGDÚ CARDS | INVENTARIO*
━━━━━━━━━━━━━━
👤 *Miguel*
🎟️ *2 tickets de captura*

🎖️ *Títulos*
Primer filo

🏵️ *Insignias*
⚔️

🪵 0 fragmentos · ✨ 0 esencias · 🔮 0 sellos
🔨 .ctucrafting

🎟️ Cada captura usa un ticket. Consíguelos completando misiones, logros y eventos.

📋 Misiones: .ctumisiones
🏅 Logros: .ctulogros
🎴 Aparición del grupo: .ctuspawn
```

## Perfil: logros y tickets integrados con el progreso

```text
🃏 *CHENGDÚ CARDS | PERFIL*
━━━━━━━━━━━━━━
👤 *Miguel*
🌱 Nivel 2 · ✨ 190/200 XP
💰 624 ChengCoins · 🎴 4 unidades

⚔️ 10 combates
🏆 7 victorias · 💔 3 derrotas · ⚖️ 0 sin ganador

🏅 1 logro desbloqueado · 🎟️ 2 tickets
↳ .ctuinventario

🌟 Tu vitrina: .ctushowcase
✍️ Personalizar: .ctusocial ayuda

👉 Tu colección: *.ctupersonajes*
🏅 Tu clasificación: .cturank
```

## Mercado: un personaje exclusivo también se puede vender

```text
🃏 *CHENGDÚ CARDS | EN VENTA*
━━━━━━━━━━━━━━
🎴 ¡Tu unidad ya está en el mercado!

👻 *Guardián Espectral* · Nv. 1
🟣 Épico · Tanque

💰 Precio: *20 ChengCoins*
🏦 Comisión del 5%: 1 ChengCoins (redondeo hacia arriba)
📥 Recibirás: *19 ChengCoins*

🔒 En el mercado
🛡️ Retirada del equipo mientras está en venta.
⏳ Vence: 29 oct 2026, 14:06 (CDMX)

👉 Compartir anuncio: *.ctumercado M6*
↩️ Retirar: .cturetirar M6
```

## Festival terminado: emisión cerrada y unidades conservadas

```text
🃏 *CHENGDÚ CARDS | EVENTO*
━━━━━━━━━━━━━━
🏮 *Festival de los Faroles*
⌛ Evento finalizado

📅 11 oct 2026, 00:00 → 25 oct 2026, 00:00
📍 Hora de Ciudad de México.

🎴 *Personajes exclusivos*
🔵 Zorro de los Faroles · Raro
↳ 0/35 emitidos · Emisión cerrada o agotada
🟣 Guardián Espectral · Épico
↳ 1/20 emitidos · Emisión cerrada o agotada

🎁 *Bienvenida*
💰 +25 ChengCoins · ✨ +10 XP de jugador · 🎟️ +1 ticket
✅ Ya reclamaste este premio.

🎴 Las unidades obtenidas conservan su progreso y pueden comerciarse.

📅 Calendario: .ctueventos
```

## Después del festival: comercio sin nueva emisión

```text
🃏 *CHENGDÚ CARDS | COMPRA*
━━━━━━━━━━━━━━
🤝 ¡La unidad ya forma parte de tu colección!

👻 *Guardián Espectral* · Nv. 1
🟣 Épico · Tanque

👤 Vendedor: Miguel
💰 20 ChengCoins pagados
Saldo restante: *436 ChengCoins*

👉 Preparar equipo: *.ctuequipo usar ESPE-000001*
🔎 Consultar: .ctuficha ESPE-000001
```

## Unidad histórica: conserva el festival después de cambiar de dueño

```text
🃏 *CHENGDÚ CARDS | UNIDAD*
━━━━━━━━━━━━━━
👻 *Guardián Espectral #0001*
🆔 ESPE-000001
🟣 Épico · Tanque · Normal

👤 Propietario: Lukas
✅ Disponible

🌱 Nivel 1 · ✨ 0/100 XP
🏆 0 victorias · 💔 0 derrotas

🧬 Sin rasgos

📜 Evento: Festival de los Faroles · 22 de octubre de 2026

🔎 Stats y ataques: *.ctuficha ESPE-000001*
📜 Propietarios: .ctupropiedad ESPE-000001
```

## Competitivo: Elo inicial y requisitos de colocación

```text
🃏 *CHENGDÚ CARDS | RANKED | TU CLASIFICACIÓN*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1

👤 *Miguel*
🧭 Sin clasificación · *1000 Elo*

⚔️ 0 clasificatorias válidas
🏆 0 victorias · 💔 0 derrotas · ⚖️ 0 empates

📋 0/5 clasificatorias válidas
👥 0/3 rivales distintos
Completa ambos requisitos para entrar al ranking oficial.

⌛ Cierra: 12 nov 2026, 00:00 (CDMX)

🏅 Jugar: *.cturanked @jugador*
🌍 Ranking: .ctutop T1
🎁 Temporada: .ctutemporada T1
```

## Competitivo: clasificación todavía sin partidas

```text
🃏 *CHENGDÚ CARDS | RANKED | TOP MUNDIAL*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1

🌱 Aún no hay participantes.
La primera clasificatoria abre el camino.

🏅 Clasificación oficial: 5 partidas válidas y 3 rivales distintos.

👤 Tu clasificación: .cturank T1
📅 Temporada: .ctutemporada T1
```

## Temporada T1: calendario, rangos y premios

```text
🃏 *CHENGDÚ CARDS | RANKED | TEMPORADA*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1
🏮 En curso

🌅 Inicio: 13 oct 2026, 00:00 (CDMX)
⌛ Cierra: 12 nov 2026, 00:00 (CDMX)

🌍 0 participantes · 🏅 0 con clasificación oficial

👤 *Miguel*
🧭 Sin clasificación · *1000 Elo*
📋 0/5 clasificatorias válidas
👥 0/3 rivales distintos
Completa ambos requisitos para entrar al ranking oficial.

📊 Bronce → Plata → Oro → Platino → Diamante → Maestro
Los premios se reclaman al cerrar la temporada.
El podio recibe un extra; no se emiten personajes.

🌍 Ranking: .ctutop T1
📚 Temporadas: .ctutemporadas
⚔️ Jugar: .cturanked @jugador
```

## Temporadas: códigos cortos y archivo

```text
🃏 *CHENGDÚ CARDS | RANKED | TEMPORADAS*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1
🏮 En curso · 🌍 0 participantes
⌛ Cierra: 12 nov 2026, 00:00 (CDMX)
👉 *.ctutemporada T1*

📄 *Página 1 de 1*
🏅 Tu clasificación: .cturank
```

## Desafío competitivo: temporada y reglas visibles

```text
🃏 *CHENGDÚ CARDS | DESAFÍO RANKED*
━━━━━━━━━━━━━━
⚔️ *Miguel* desafió a *Lukas* · *1v1*

🏅 *Clasificatoria · T1*
📊 Elo y progreso de temporada.

🛡️ 1 unidad por jugador · Elementos, pasivas y efectos

📣 *Lukas, ¿aceptas?*
👉 *.ctuaceptar* o *.cturechazar*

⏳ Vence a las 00:05 (CDMX).
↩️ Retirar: .ctucancelar
```

## Inicio competitivo: un solo mensaje con turno y equipo

```text
🃏 *CHENGDÚ CARDS | INICIO | T1*
━━━━━━━━━━━━━━
⚔️ *Miguel* vs *Lukas* · *1v1*
🐺 *Lobo Sombrío* toma la iniciativa.

🏅 *Clasificatoria · T1*
📊 Elo y progreso de temporada.

✨ 🐼 Panda Guerrero: *Piel de Bambú*
🛡️ Escudo → 🐼 Panda Guerrero · 2 turnos
✨ 🐺 Lobo Sombrío: *Mirada Nocturna*
🛡️ Defensa reducida → 🐼 Panda Guerrero · 2 turnos
🛡️ Escudo → 🐺 Lobo Sombrío · 2 turnos

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 2T

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▓▓▓▓▓▓ 97/97 HP
🛡️ Escudo 10

🎯 *Turno de Lukas*
1️⃣ Garra Sombría · 25 POT
2️⃣ Colmillo Nocturno · 35 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔎 Detalles: .ctuficha
```

## Turno competitivo: mantiene el formato compacto

```text
🃏 *CHENGDÚ CARDS | T2*
━━━━━━━━━━━━━━
🐺 *Lobo Sombrío* usó _Garra Sombría_
💥 *20 de daño* a Panda Guerrero
🛡️ 🐼 Panda Guerrero bloqueó 12 de daño
🛡️ Escudo terminó en 🐼 Panda Guerrero

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▒ 102/122 HP
🛡️ Defensa reducida 2T

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▓▓▓▓▓▓ 97/97 HP
🛡️ Escudo 10

🎯 *Turno de Miguel*
1️⃣ Golpe de Bambú · 25 POT
2️⃣ Impacto del Panda · 36 POT

👉 *.ctuatacar 1* o *.ctuatacar 2*
🔎 Detalles: .ctuficha
```

## Resultado competitivo: Elo y premio habitual en la misma respuesta

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* usó _Golpe de Bambú_
💥 *8 de daño* a Lobo Sombrío
💤 🐺 Lobo Sombrío quedó fuera de combate

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 1v1 · 8 turnos · ❤️ 12 HP restantes

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▒▒▒▒▒▒▒▒▒ 12/122 HP

🐺 *Lukas* · Lobo Sombrío
▒▒▒▒▒▒▒▒▒▒ 0/97 HP

🎁 *RECOMPENSAS*
Miguel: +120 ChengCoins · +35 XP
🐼 Panda Guerrero: +35 XP
🌱 Miguel subió al nivel 3
Lukas: +15 XP
🐺 Lobo Sombrío: +15 XP

🏅 *RANKED · T1*
👤 Miguel: *1016 Elo* (+16) · 🥈 Plata
👤 Lukas: *984 Elo* (-16) · 🥉 Bronce

⚔️ Otra partida: .cturanked @jugador
📊 Tu clasificación: .cturank
```

## Repetir el último turno: conserva el Elo original

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
♻️ Esta acción ya se había registrado. Estado actual:

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 1v1 · 8 turnos · ❤️ 12 HP restantes

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▒▒▒▒▒▒▒▒▒ 12/122 HP

🐺 *Lukas* · Lobo Sombrío
▒▒▒▒▒▒▒▒▒▒ 0/97 HP

🎁 *RECOMPENSAS*
Miguel: +120 ChengCoins · +35 XP
🐼 Panda Guerrero: +35 XP
🌱 Miguel subió al nivel 3
Lukas: +15 XP
🐺 Lobo Sombrío: +15 XP

🏅 *RANKED · T1*
👤 Miguel: *1016 Elo* (+16) · 🥈 Plata
👤 Lukas: *984 Elo* (-16) · 🥉 Bronce

⚔️ Otra partida: .cturanked @jugador
📊 Tu clasificación: .cturank
```

## Historial: distingue el competitivo del casual

```text
🃏 *CHENGDÚ CARDS | HISTORIAL*
━━━━━━━━━━━━━━
🏆 Victoria vs *Lukas*
📅 25 de octubre de 2026 · 1v1 · 8 turnos
🎁 +120 ChengCoins · +35 XP
🏅 Ranked T1 · 1016 Elo (+16)
🔎 .ctuhistorial BTL-8da282ee-f2f9-4de5-aafe-922bf22d6050

💔 Derrota vs *Lukas*
📅 22 de octubre de 2026 · 1v1 clásico · 5 turnos
🎁 +0 ChengCoins · +15 XP
🔎 .ctuhistorial BTL-46dc4881-a037-4739-b8ac-7183df1cb174

🏆 Victoria vs *Lukas*
📅 22 de octubre de 2026 · 1v1 clásico · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-8bdabf65-efc2-42cc-973c-6b50a87d655f

💔 Derrota vs *Lukas*
📅 20 de octubre de 2026 · 1v1 · 0 turnos
🔎 .ctuhistorial BTL-17e7aef7-2f49-40d3-8bb6-29beed003032

💔 Derrota vs *Lukas*
📅 20 de octubre de 2026 · 3v3 · 31 turnos
🎁 +0 ChengCoins · +15 XP
🔎 .ctuhistorial BTL-5f4245cb-8f7d-4828-a537-07585ffb4a3d

📄 *Página 1 de 3*
➡️ Siguiente: *.ctuhistorial 2*
👉 Tu saldo: *.ctubalance*
```

## Colocación: una partida y un rival

```text
🃏 *CHENGDÚ CARDS | RANKED | TU CLASIFICACIÓN*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1

👤 *Miguel*
🧭 En colocación · *1016 Elo*

⚔️ 1 clasificatorias válidas
🏆 1 victorias · 💔 0 derrotas · ⚖️ 0 empates

📋 1/5 clasificatorias válidas
👥 1/3 rivales distintos
Completa ambos requisitos para entrar al ranking oficial.

⌛ Cierra: 12 nov 2026, 00:00 (CDMX)

🏅 Jugar: *.cturanked @jugador*
🌍 Ranking: .ctutop T1
🎁 Temporada: .ctutemporada T1
```

## Competitivo: rendirse temprano penaliza sin regalar puntos

```text
🃏 *CHENGDÚ CARDS | VICTORIA*
━━━━━━━━━━━━━━
🏳️ Miguel se rindió.

🐺 *¡Lukas derrotó a Miguel!*

⚔️ 1v1 · 0 turnos · ❤️ 97 HP restantes

❤️ *ESTADO*
🐼 *Miguel* · Panda Guerrero
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12 · 🛡️ Defensa reducida 2T

🐺 *Lukas* · Lobo Sombrío
▓▓▓▓▓▓▓▓▓▓ 97/97 HP
🛡️ Escudo 10

🎁 Sin recompensa: rendición antes de 4 ataques entre ambos jugadores.

🏅 *RANKED · T1*
👤 Miguel: *1000 Elo* (-16) · 🥈 Plata
👤 Lukas: *984 Elo* (0) · 🥉 Bronce
🏳️ Penalización por rendición temprana; no cuenta para la colocación.

⚔️ Otra partida: .cturanked @jugador
📊 Tu clasificación: .cturank
```

## Competitivo: colocado tras cinco partidas y tres rivales

```text
🃏 *CHENGDÚ CARDS | RANKED | TU CLASIFICACIÓN*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1

👤 *Miguel*
🥈 Plata · *1059 Elo* · Puesto 1

⚔️ 5 clasificatorias válidas
🏆 5 victorias · 💔 0 derrotas · ⚖️ 0 empates
⌛ 1 penalización por abandono

⌛ Cierra: 12 nov 2026, 00:00 (CDMX)

🏅 Jugar: *.cturanked @jugador*
🌍 Ranking: .ctutop T1
🎁 Temporada: .ctutemporada T1
```

## Clasificación: oficiales y provisionales, sin UUID

```text
🃏 *CHENGDÚ CARDS | RANKED | TOP MUNDIAL*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1

🥇 *1. Miguel*
🥈 Plata · *1059 Elo*
⚔️ 5 partidas válidas · 🏆 5 victorias

🧭 *Lukas* · En colocación
📊 984 Elo · 📋 1/5 partidas · 👥 1/3 rivales

🧭 *Camila* · En colocación
📊 972 Elo · 📋 2/5 partidas · 👥 1/3 rivales

🧭 *Ana* · En colocación
📊 969 Elo · 📋 2/5 partidas · 👥 1/3 rivales

🏅 Clasificación oficial: 5 partidas válidas y 3 rivales distintos.

📄 *Página 1 de 1*
👤 Tu clasificación: .cturank T1
📅 Temporada: .ctutemporada T1
```

## Premio de temporada: todavía hay que esperar al cierre

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
⏳ Los premios de temporada se reclaman después del cierre.
Consulta la fecha con .ctutemporada
```

## Temporada terminada: posición y premio congelados

```text
🃏 *CHENGDÚ CARDS | RANKED | TEMPORADA*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1
🏁 Cerrada · Clasificación final

🌅 Inicio: 13 oct 2026, 00:00 (CDMX)
⌛ Cerró: 12 nov 2026, 00:00 (CDMX)

🌍 4 participantes · 🏅 1 con clasificación oficial

👤 *Miguel*
🥈 Plata · *1059 Elo* · Puesto 1

🎁 *Tu premio final*
💰 +1450 ChengCoins
🎖️ Plata de Chengdú · T1

👉 *.ctutemporada T1 reclamar*
🌍 Ranking: .ctutop T1
📚 Temporadas: .ctutemporadas
```

## Premio de cierre: monedas y título permanente

```text
🃏 *CHENGDÚ CARDS | RANKED | PREMIO DE TEMPORADA*
━━━━━━━━━━━━━━
🎁 *¡Premio de temporada reclamado!*

📅 T1 · 🥈 Plata · Puesto 1
📊 1059 Elo finales

💰 +1450 ChengCoins
🎖️ Plata de Chengdú · T1

💳 Saldo actual: *2693 ChengCoins*

🎒 Tus títulos: .ctuinventario
🌍 Clasificación final: .ctutop T1
```

## Premio repetido: no paga otra vez

```text
🃏 *CHENGDÚ CARDS | RANKED | PREMIO DE TEMPORADA*
━━━━━━━━━━━━━━
✅ Este premio ya se reclamó. Se conserva su recibo original.

📅 T1 · 🥈 Plata · Puesto 1
📊 1059 Elo finales

💰 +1450 ChengCoins
🎖️ Plata de Chengdú · T1

💳 Saldo tras ese reclamo: *2693 ChengCoins*

🎒 Tus títulos: .ctuinventario
🌍 Clasificación final: .ctutop T1
```

## Inventario: conserva el título de temporada

```text
🃏 *CHENGDÚ CARDS | INVENTARIO*
━━━━━━━━━━━━━━
👤 *Miguel*
🎟️ *2 tickets de captura*

🎖️ *Títulos*
Primer filo · Plata de Chengdú · T1

🏵️ *Insignias*
⚔️

🪵 0 fragmentos · ✨ 0 esencias · 🔮 0 sellos
🔨 .ctucrafting

🎟️ Cada captura usa un ticket. Consíguelos completando misiones, logros y eventos.

📋 Misiones: .ctumisiones
🏅 Logros: .ctulogros
🎴 Aparición del grupo: .ctuspawn
```

## Movimientos: premio competitivo junto a las otras fuentes

```text
🃏 *CHENGDÚ CARDS | MOVIMIENTOS*
━━━━━━━━━━━━━━
📥 *+1450 ChengCoins* · 🏅 Premio de temporada
📅 12 nov 2026, 00:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 25 oct 2026, 00:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 25 oct 2026, 00:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 25 oct 2026, 00:00

📥 *+120 ChengCoins* · 🏆 Combate
📅 25 oct 2026, 00:00

📄 *Página 1 de 6*
➡️ Siguiente: *.ctumovimientos 2*
👉 Tu saldo: *.ctubalance*
```

## Temporada T2: Elo inicial nuevo, colección conservada

```text
🃏 *CHENGDÚ CARDS | RANKED | TU CLASIFICACIÓN*
━━━━━━━━━━━━━━
📅 *Temporada 2* · T2

👤 *Miguel*
🧭 Sin clasificación · *1000 Elo*

⚔️ 0 clasificatorias válidas
🏆 0 victorias · 💔 0 derrotas · ⚖️ 0 empates

📋 0/5 clasificatorias válidas
👥 0/3 rivales distintos
Completa ambos requisitos para entrar al ranking oficial.

⌛ Cierra: 12 dic 2026, 00:00 (CDMX)

🏅 Jugar: *.cturanked @jugador*
🌍 Ranking: .ctutop T2
🎁 Temporada: .ctutemporada T2
```

## Archivo: clasificación final de T1

```text
🃏 *CHENGDÚ CARDS | RANKED | TOP MUNDIAL*
━━━━━━━━━━━━━━
📅 *Temporada 1* · T1

🥇 *1. Miguel*
🥈 Plata · *1059 Elo*
⚔️ 5 partidas válidas · 🏆 5 victorias

🧭 *Lukas* · En colocación
📊 984 Elo · 📋 1/5 partidas · 👥 1/3 rivales

🧭 *Camila* · En colocación
📊 972 Elo · 📋 2/5 partidas · 👥 1/3 rivales

🧭 *Ana* · En colocación
📊 969 Elo · 📋 2/5 partidas · 👥 1/3 rivales

🏅 Clasificación oficial: 5 partidas válidas y 3 rivales distintos.

📄 *Página 1 de 1*
👤 Tu clasificación: .cturank T1
📅 Temporada: .ctutemporada T1
```

## Archivo de temporadas después del cambio de calendario

```text
🃏 *CHENGDÚ CARDS | RANKED | TEMPORADAS*
━━━━━━━━━━━━━━
📅 *Temporada 2* · T2
🏮 En curso · 🌍 0 participantes
⌛ Cierra: 12 dic 2026, 00:00 (CDMX)
👉 *.ctutemporada T2*

📅 *Temporada 1* · T1
🏁 Cerrada · 🌍 4 participantes
⌛ Cerró: 12 nov 2026, 00:00 (CDMX)
👉 *.ctutemporada T1*

📄 *Página 1 de 1*
🏅 Tu clasificación: .cturank
```

## Social: favorito y perfil personalizado

```text
🃏 *CHENGDÚ CARDS | PERFIL PÚBLICO*
━━━━━━━━━━━━━━
👤 *Miguel* · Nv. 3
🎴 3 unidades · 🏆 12 victorias

❤️ Favorito: *Panda Guerrero* · Nv. 3

🌟 .ctushowcase
✍️ .ctusocial ayuda
```

## Social: sólo permite destacar unidades propias

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
🔒 Esa unidad no te pertenece. Elige una de tu colección con .ctupersonajes.
```

## Social: presentación pública

```text
🃏 *CHENGDÚ CARDS | PERFIL PÚBLICO*
━━━━━━━━━━━━━━
👤 *Miguel* · Nv. 3
🎴 3 unidades · 🏆 12 victorias

💬 Coleccionista de bambú

❤️ Favorito: *Panda Guerrero* · Nv. 3

🌟 .ctushowcase
✍️ .ctusocial ayuda
```

## Social: elegir entre títulos realmente ganados

```text
🃏 *CHENGDÚ CARDS | TÍTULOS*
━━━━━━━━━━━━━━
⚔️ *Primer filo*
👉 .ctusocial titulo L1

🏅 *Plata de Chengdú · T1*
👉 .ctusocial titulo T1

🏅 .ctulogros
```

## Social: mostrar el título de temporada

```text
🃏 *CHENGDÚ CARDS | PERFIL PÚBLICO*
━━━━━━━━━━━━━━
👤 *Miguel* · Nv. 3
🏅 Plata de Chengdú · T1
🎴 3 unidades · 🏆 12 victorias

💬 Coleccionista de bambú

❤️ Favorito: *Panda Guerrero* · Nv. 3

🌟 .ctushowcase
✍️ .ctusocial ayuda
```

## Perfil público: sin saldo ni identidad externa

```text
🃏 *CHENGDÚ CARDS | PERFIL PÚBLICO*
━━━━━━━━━━━━━━
👤 *Miguel* · Nv. 3
🏅 Plata de Chengdú · T1
🎴 3 unidades · 🏆 12 victorias

💬 Coleccionista de bambú

❤️ Favorito: *Panda Guerrero* · Nv. 3

🌟 .ctushowcase @jugador

```

## Colección pública: página numérica por mención

```text
🃏 *CHENGDÚ CARDS | COLECCIÓN PÚBLICA*
━━━━━━━━━━━━━━
🎴 *Miguel*

⚪ *Panda Guerrero* · Nv. 3
🔎 .ctuficha PAND-000001

⚪ *Mago Carmesí* · Nv. 1
🔎 .ctuficha MAGC-000001

🔵 *Monje Celestial* · Nv. 1
🔎 .ctuficha MONJ-000001

📄 *Página 1 de 1*
```

## Showcase: favorito, rareza, antigüedad y victorias

```text
🃏 *CHENGDÚ CARDS | SHOWCASE*
━━━━━━━━━━━━━━
🌟 *Miguel*

❤️ Favorito: *Panda Guerrero* · Nv. 3

💎 Más rara
🔵 *Monje Celestial* · Nv. 1
🏆 0 victorias

🌱 Primera unidad
⚪ *Panda Guerrero* · Nv. 3
🏆 12 victorias

🏆 Más victorias
⚪ *Panda Guerrero* · Nv. 3
🏆 12 victorias

✍️ .ctusocial ayuda
```

## Comparar unidades sin entrar en combate

```text
🃏 *CHENGDÚ CARDS | COMPARAR*
━━━━━━━━━━━━━━
⚪ *Panda Guerrero* · Nv. 3
Común · PAND-000001
❤️ Vida: 124
⚔️ Ataque: 25
🛡️ Defensa: 23
💨 Velocidad: 8

⚪ *Lobo Sombrío* · Nv. 2
Común · LOBO-000001
❤️ Vida: 97
⚔️ Ataque: 27
🛡️ Defensa: 17
💨 Velocidad: 16

🔎 Ataques: .ctuficha ID
```

## Crafting: materiales disponibles y recetas copiables

```text
🃏 *CHENGDÚ CARDS | CRAFTING*
━━━━━━━━━━━━━━
🪵 0 fragmentos · ✨ 0 esencias · 🔮 0 sellos

🎁 17 recompensas con materiales pendientes
👉 .ctucrafting reclamar

🔨 *Sello de evolución*
💰 100 ChengCoins
🧩 5 fragmentos · 2 esencias
👉 .ctucrafting crear sello_evolucion

🔨 *Insignia de bambú*
💰 50 ChengCoins
🧩 3 fragmentos
👉 .ctucrafting crear insignia_bambu

🎒 .ctuinventario
🔮 Evolución: .ctuevolucion ID
```

## Crafting: recoger materiales de premios auténticos

```text
🃏 *CHENGDÚ CARDS | MATERIALES*
━━━━━━━━━━━━━━
🎒 ¡Materiales recogidos!

🪵 36 fragmentos · ✨ 3 esencias · 🔮 0 sellos

🔨 .ctucrafting
```

## Crafting: insignia cosmética permanente

```text
🃏 *CHENGDÚ CARDS | CRAFTING*
━━━━━━━━━━━━━━
🔨 ¡Creación completada!
insignia＿bambu

🪵 33 fragmentos · ✨ 3 esencias · 🔮 0 sellos

💰 Coste: 50 ChengCoins

🔮 .ctuevolucion ID
🎒 .ctuinventario
```

## Crafting: preparar un sello de evolución

```text
🃏 *CHENGDÚ CARDS | CRAFTING*
━━━━━━━━━━━━━━
🔨 ¡Creación completada!
sello＿evolucion

🪵 28 fragmentos · ✨ 1 esencias · 🔮 1 sellos

💰 Coste: 100 ChengCoins

🔮 .ctuevolucion ID
🎒 .ctuinventario
```

## Evolución: requisitos, coste e identidad conservada

```text
🃏 *CHENGDÚ CARDS | EVOLUCIÓN*
━━━━━━━━━━━━━━
🔮 *Panda Maestro*
🎴 PAND-000001 · Nv. 3

📋 Requisitos: nivel 5 · 300 ChengCoins · 1 sello
💰 Tienes 2543 · 🔮 1 sellos

✨ Nv. 5: +4% · Nv. 10: +5%
Bono al cumplir los requisitos: +4% · redondeo hacia abajo.
🌱 El bono crece con el nivel, sin otro sello ni pago.

🌱 Completa los requisitos y libera la unidad si está reservada.

🔨 Sello: .ctucrafting
🔎 .ctuficha PAND-000001
```

## Obtención: premios pendientes y código de bienvenida limitado

```text
🃏 *CHENGDÚ CARDS | RECOMPENSAS*
━━━━━━━━━━━━━━
⚔️ Victorias PvP · 11 pendientes
🎲 10% de personaje
👉 .cturecompensas pvp

📋 Misiones · 0 pendientes
🎲 10% de personaje

🏅 Logros · 1 pendientes
🎲 20% de personaje
👉 .cturecompensas logro

👹 Jefes · 1 pendientes
🎲 10% de personaje
👉 .cturecompensas boss

🏮 Eventos · 1 pendientes
🎲 10% de personaje
👉 .cturecompensas evento

🏆 Podio de temporada · 1 pendientes
🎲 100% de personaje
👉 .cturecompensas ranking

🎁 Bienvenida: .cturecompensas codigo CHENGDU
📦 20 canjes disponibles

🎲 Cada premio ganado permite un intento. Los reintentos del mismo mensaje no generan otra tirada.
🏮 Los personajes exclusivos requieren su evento activo.

🎴 .ctupersonajes
```

## Promoción: un personaje común con supply real

```text
🃏 *CHENGDÚ CARDS | RECOMPENSA*
━━━━━━━━━━━━━━
🎴 ¡Obtuviste *Panda Guerrero*!
🔎 PAND-000002

👉 .ctuficha PAND-000002
```

## Promoción: reintentar conserva la misma unidad

```text
🃏 *CHENGDÚ CARDS | RECOMPENSA*
━━━━━━━━━━━━━━
🎴 ¡Obtuviste *Panda Guerrero*!
🔎 PAND-000002

📨 Este intento ya fue procesado.

👉 .ctuficha PAND-000002
```

## Premio del podio: personaje directo además de monedas y título

```text
🃏 *CHENGDÚ CARDS | RECOMPENSA*
━━━━━━━━━━━━━━
🎴 ¡Obtuviste *Panda Guerrero*!
🔎 PAND-000003

👉 .ctuficha PAND-000003
```

## Intercambio: dos ofertas y siguientes pasos cortos

```text
🃏 *CHENGDÚ CARDS | INTERCAMBIO*
━━━━━━━━━━━━━━
🤝 *Miguel ↔ Lukas* · I1
📝 Propuesta editable

👤 *Miguel*
💰 0 ChengCoins
🎴 Sin unidades
⏳ Sin confirmar

👤 *Lukas*
💰 0 ChengCoins
🎴 Sin unidades
⏳ Sin confirmar

📝 .ctuintercambio oferta I1 100 ID1
✅ .ctuintercambio confirmar I1
↩️ .ctuintercambio cancelar I1
⏳ Vence en 15 min. Revisen ambas ofertas antes de confirmar.
```

## Intercambio: ofrecer monedas

```text
🃏 *CHENGDÚ CARDS | INTERCAMBIO*
━━━━━━━━━━━━━━
🤝 *Miguel ↔ Lukas* · I1
📝 Propuesta editable

👤 *Miguel*
💰 10 ChengCoins
🎴 Sin unidades
⏳ Sin confirmar

👤 *Lukas*
💰 0 ChengCoins
🎴 Sin unidades
⏳ Sin confirmar

📝 .ctuintercambio oferta I1 100 ID1
✅ .ctuintercambio confirmar I1
↩️ .ctuintercambio cancelar I1
⏳ Vence en 15 min. Revisen ambas ofertas antes de confirmar.
```

## Intercambio: revisar ambas ofertas

```text
🃏 *CHENGDÚ CARDS | INTERCAMBIO*
━━━━━━━━━━━━━━
🤝 *Miguel ↔ Lukas* · I1
📝 Propuesta editable

👤 *Miguel*
💰 10 ChengCoins
🎴 Sin unidades
⏳ Sin confirmar

👤 *Lukas*
💰 20 ChengCoins
🎴 Sin unidades
⏳ Sin confirmar

📝 .ctuintercambio oferta I1 100 ID1
✅ .ctuintercambio confirmar I1
↩️ .ctuintercambio cancelar I1
⏳ Vence en 15 min. Revisen ambas ofertas antes de confirmar.
```

## Intercambio: primera confirmación reserva ambos saldos

```text
🃏 *CHENGDÚ CARDS | INTERCAMBIO*
━━━━━━━━━━━━━━
🤝 *Miguel ↔ Lukas* · I1
🔒 Ofertas congeladas; bienes reservados

👤 *Miguel*
💰 10 ChengCoins
🎴 Sin unidades
✅ Confirmó

👤 *Lukas*
💰 20 ChengCoins
🎴 Sin unidades
⏳ Sin confirmar

📝 .ctuintercambio oferta I1 100 ID1
✅ .ctuintercambio confirmar I1
↩️ .ctuintercambio cancelar I1
⏳ Vence en 15 min. Revisen ambas ofertas antes de confirmar.
```

## Intercambio: segunda confirmación completa todo

```text
🃏 *CHENGDÚ CARDS | INTERCAMBIO*
━━━━━━━━━━━━━━
🤝 *Miguel ↔ Lukas* · I1
✅ Intercambio completado

👤 *Miguel*
💰 10 ChengCoins
🎴 Sin unidades
✅ Confirmó

👤 *Lukas*
💰 20 ChengCoins
🎴 Sin unidades
✅ Confirmó

👉 .ctuintercambio mios
```

## Intercambio: historial con códigos I1

```text
🃏 *CHENGDÚ CARDS | TUS INTERCAMBIOS*
━━━━━━━━━━━━━━
🤝 Miguel ↔ Lukas · completed
👉 .ctuintercambio ver I1

📄 *Página 1 de 1*
📨 .ctuintercambio crear @jugador
```

## Clan: fundación, miembros y tesorería

```text
🃏 *CHENGDÚ CARDS | CLAN*
━━━━━━━━━━━━━━
🏯 *[BAM] Casa del Bambú* · C1
👥 1/15 miembros · 💰 0 en tesorería

👑 Líder · Miguel

0 victorias · 0 derrotas · 0 empates

💰 Aportar: .ctuclan depositar 100
📨 Invitar: .ctuclan invitar @jugador
📖 Opciones: .ctuclan ayuda
```

## Clan: una segunda casa en Chengdú

```text
🃏 *CHENGDÚ CARDS | CLAN*
━━━━━━━━━━━━━━
🏯 *[LUNA] Casa Lunar* · C2
👥 1/15 miembros · 💰 0 en tesorería

👑 Líder · Lukas

0 victorias · 0 derrotas · 0 empates

💰 Aportar: .ctuclan depositar 100
📨 Invitar: .ctuclan invitar @jugador
📖 Opciones: .ctuclan ayuda
```

## Clan: aporte con recibo y saldo real

```text
🃏 *CHENGDÚ CARDS | CLAN*
━━━━━━━━━━━━━━
✅ Aportaste 100 ChengCoins.

🏯 *[BAM] Casa del Bambú* · C1
👥 3/15 miembros · 💰 100 en tesorería

👑 Líder · Miguel
🎴 Miembro · Compañero 1
🎴 Miembro · Compañero 2

0 victorias · 0 derrotas · 0 empates

💰 Aportar: .ctuclan depositar 100
📨 Invitar: .ctuclan invitar @jugador
📖 Opciones: .ctuclan ayuda
```

## Clan: nombrar oficial

```text
🃏 *CHENGDÚ CARDS | CLAN*
━━━━━━━━━━━━━━
🛡️ Rol actualizado.

🏯 *[BAM] Casa del Bambú* · C1
👥 3/15 miembros · 💰 100 en tesorería

👑 Líder · Miguel
🛡️ Oficial · Compañero 1
🎴 Miembro · Compañero 2

0 victorias · 0 derrotas · 0 empates

💰 Aportar: .ctuclan depositar 100
📨 Invitar: .ctuclan invitar @jugador
📖 Opciones: .ctuclan ayuda
```

## Clanes: clasificación de temporada y códigos C1

```text
🃏 *CHENGDÚ CARDS | CLANES | CLASIFICACIÓN*
━━━━━━━━━━━━━━
🏅 Puntos de la temporada T2: victoria 3 · empate 1

🏯 *[LUNA] Casa Lunar*
🏅 0 puntos · 👥 3/15
👉 .ctuclan ver C2

🏯 *[BAM] Casa del Bambú*
🏅 0 puntos · 👥 3/15
👉 .ctuclan ver C1

📄 *Página 1 de 1*
```

## Guerra: invitación, entrada y plazo de respuesta

```text
🃏 *CHENGDÚ CARDS | GUERRA DE CLANES*
━━━━━━━━━━━━━━
⚔️ *Casa del Bambú vs Casa Lunar* · G1
📨 Desafío pendiente · marcador *0–0*

👥 Se fijarán 3 jugadores por clan.
💰 Entrada: 100 de cada tesorería.
⏳ Aceptar antes de 30 minutos.

✅ .ctuclan aceptar G1
❌ .ctuclan rechazar G1
```

## Guerra: plantillas de tres y marcador inicial

```text
🃏 *CHENGDÚ CARDS | GUERRA DE CLANES*
━━━━━━━━━━━━━━
⚔️ *Casa del Bambú vs Casa Lunar* · G1
⚔️ En curso · marcador *0–0*

🛡️ *[BAM]*
Miguel · Compañero 2 · Compañero 1

🛡️ *[LUNA]*
Lukas · Camila · Ana

🎯 Primero en ganar 3 duelos, o mejor marcador al vencer 24 h.
Cada pareja de jugadores cuenta una vez.

👉 Desafía a un rival de la plantilla: .ctupelea @jugador
📊 .ctuclan war G1
```

## Guerras: historial con código G1

```text
🃏 *CHENGDÚ CARDS | CLAN | GUERRAS*
━━━━━━━━━━━━━━
⚔️ Casa del Bambú vs Casa Lunar · 0–0
👉 .ctuclan war G1

📄 *Página 1 de 1*
```

## Tesorería: aportes y entradas auditables

```text
🃏 *CHENGDÚ CARDS | CLAN | TESORERÍA*
━━━━━━━━━━━━━━
💰 -100 de tesorería ChengCoins · Entrada de guerra
🏦 Saldo: 0

💰 100 de tesorería ChengCoins · Aporte
🏦 Saldo: 100

💰 -300 personales ChengCoins · Fundación
🏦 Saldo: 0

📄 *Página 1 de 1*
```

## Guerra: cierre por plazo sin premio personal para inactivos

```text
🃏 *CHENGDÚ CARDS | GUERRA DE CLANES*
━━━━━━━━━━━━━━
⚔️ *Casa del Bambú vs Casa Lunar* · G1
🏁 Finalizada · marcador *0–0*

🛡️ *[BAM]*
Miguel · Compañero 2 · Compañero 1

🛡️ *[LUNA]*
Lukas · Camila · Ana

🎁 Tesorería: victoria +500 · derrota +100 · empate +150.
👤 Premio personal: victoria +150 · derrota +50 · empate +75, para quienes disputaron duelos válidos.

📜 .ctuclan guerras
```

## Inventario ampliado: materiales, sellos e insignia artesanal

```text
🃏 *CHENGDÚ CARDS | INVENTARIO*
━━━━━━━━━━━━━━
👤 *Miguel*
🎟️ *2 tickets de captura*

🎖️ *Títulos*
Primer filo · Plata de Chengdú · T1

🏵️ *Insignias*
⚔️

🪵 28 fragmentos · ✨ 1 esencias · 🔮 1 sellos
🔨 .ctucrafting

🪵 Insignia: Artesano del Bambú

🎟️ Cada captura usa un ticket. Consíguelos completando misiones, logros y eventos.

📋 Misiones: .ctumisiones
🏅 Logros: .ctulogros
🎴 Aparición del grupo: .ctuspawn
```

## Historia: invitación al viaje del Custodio

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *El despertar del Custodio*

En Chengdú, las cartas conservan historias. Una tinta desconocida está borrando sus nombres.
Bao te espera bajo el bambú: tu primer vínculo puede cambiar lo que viene.

📖 Prólogo y primeras tres misiones del bosque.
💾 Cada escena y turno quedan guardados; puedes volver cuando quieras.

👉 *.ctuhistoria iniciar*
📖 Guía: .ctuhistoria ayuda
```

## Historia P-01: escena y decisiones numeradas

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-01 · Una invitación bajo el bambú*

📖 Avance: 0/7 misiones

Un panda anciano observa una carta a la sombra del bambú. A su espalda se alza el Gran Archivo.
Bao: «Una carta no es solo poder. Es una historia que acepta continuar contigo».
Desde la torre suena una campana. Bao levanta la mirada: nadie debería estar tocándola.

1. Preguntar por el Archivo
👉 .ctuhistoria elegir 1

2. Preguntar por las criaturas
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia P-02: la primera pregunta deja una consecuencia

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-02 · El primer vínculo*

📖 Avance: 1/7 misiones

🖋️ Bao: «Cada una tiene su nombre y su historia. Ser Custodio es acompañarla, no decidir todo por ella».

🎁 +20 ChengCoins · +20 XP de Custodio

Bao: «Preguntaste por las criaturas. Ahora podrás conocer a una por su propio nombre».
Bao despliega los registros de las criaturas que pueden formar su primer vínculo.
«No busques la más rara. Busca una compañera cuya forma de luchar quieras aprender».
Tu criatura inicial conserva su identidad, su origen y las aventuras que viváis juntos.

🎴 Elige tu primer compañero: *.ctustarter*
👉 Después: .ctuhistoria continuar
```

## Historia: primer vínculo y XP de compañero

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-03 · Una sombra en la plaza*

📖 Avance: 2/7 misiones

🎁 +20 XP de Custodio
✨ Panda Guerrero: +100 XP · 🌱 Nv. 2

Una mancha de tinta cruza la plaza. Dentro tiembla una criatura que parece no reconocer el camino.
Bao: «Es un Eco: una identidad dañada. Vamos a detenerlo sin hacerle más daño del necesario».
«Prueba tus ataques, aprende a cubrirte y observa cuándo conviene usar una habilidad. Estoy aquí si caes».

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia P-03: tutorial con señal y controles tácticos

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-03 · Una sombra en la plaza*

📖 Avance: 2/7 misiones

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 12

👁️ *Eco desorientado*
▓▓▓▓▓▓▓▓▓▓ 110/110 HP

⚠️ *SEÑAL ENEMIGA*
El Eco está confundido. Bao te guía: ataca, defiende y prueba tu habilidad.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad

💾 El turno se conserva al salir.
```

## Historia: ataque y respuesta del Eco en un solo mensaje

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-03 · Una sombra en la plaza*

📖 Avance: 2/7 misiones

Panda Guerrero usó Golpe de Bambú: 38 de daño.
Eco desorientado usó Roce de tinta: 0 de daño.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 122/122 HP
🛡️ Escudo 11

👁️ *Eco desorientado*
▓▓▓▓▓▓▓▒▒▒ 72/110 HP

⚠️ *SEÑAL ENEMIGA*
El Eco está confundido. Bao te guía: ataca, defiende y prueba tu habilidad.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad

💾 El turno se conserva al salir.
```

## Historia: aprender a cubrirse

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-03 · Una sombra en la plaza*

📖 Avance: 2/7 misiones

Panda Guerrero se cubre: reduce el próximo daño de este turno un 70%.
Eco desorientado usó Roce de tinta: 1 de daño.
🛡️ Tu defensa amortiguó la ofensiva: recibiste 1 de daño.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 121/122 HP

👁️ *Eco desorientado*
▓▓▓▓▓▓▓▒▒▒ 72/110 HP

⚠️ *SEÑAL ENEMIGA*
El Eco está confundido. Bao te guía: ataca, defiende y prueba tu habilidad.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad

💾 El turno se conserva al salir.
```

## Historia: técnica y recarga compartida

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-03 · Una sombra en la plaza*

📖 Avance: 2/7 misiones

Panda Guerrero usó Impacto del Panda: 49 de daño.
Panda Guerrero recibe escudo.
Eco desorientado usó Roce de tinta: 0 de daño.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 121/122 HP
🛡️ Escudo 11

👁️ *Eco desorientado*
▓▓▓▒▒▒▒▒▒▒ 23/110 HP

⚠️ *SEÑAL ENEMIGA*
El Eco está confundido. Bao te guía: ataca, defiende y prueba tu habilidad.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender

💾 El turno se conserva al salir.
```

## Historia: victoria del tutorial y premio único

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-04 · Las campanas del Archivo*

📖 Avance: 3/7 misiones

Panda Guerrero usó Golpe de Bambú: 23 de daño.
Eco desorientado quedó fuera de combate.
El Eco se serena. Tu vínculo resistió la tinta.

🌿 *¡Encuentro superado!*
Eco desorientado deja de luchar. El vínculo sigue intacto.

🎁 +45 ChengCoins · +50 XP de Custodio
✨ Panda Guerrero: +220 XP · 🌱 Nv. 3
🧩 1 fragmento

La tinta abandona al Eco, pero las campanas siguen sonando. Lian encuentra una carta completamente blanca.
Lian: «Los registros no están rotos. Les faltan los nombres».
Bao reconoce un sello en el borde y aparta la mirada: «No es la primera vez que veo esa tinta».
Las últimas huellas salen de la plaza y se pierden en el Bosque de los Susurros.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia P-04: campanas, carta blanca y recuerdo inaugural

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-01 · Sendero en silencio*

📖 Avance: 4/7 misiones

🎁 +35 ChengCoins · +30 XP de Custodio
✨ Panda Guerrero: +80 XP
🧩 1 fragmento
📜 Recuerdo: Campanas sin manos

El sendero conserva el olor de la lluvia, pero no se oye un solo pájaro.
Lian descubre cortes oscuros sobre el bambú. Junto al arroyo, unas huellas arrastran la misma tinta.
«Podemos seguir cualquiera de las dos pistas. Primero quiero entender qué estamos viendo».

🛡️ Equipo preparado: 1/3 compañeros

1. Examinar las marcas del bambú
👉 .ctuhistoria elegir 1

2. Seguir las huellas del arroyo
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia I-01: una pista modifica la escena siguiente

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-02 · Una criatura herida*

📖 Avance: 5/7 misiones

🖋️ Los cortes interrumpen viejas inscripciones. Lian copia el patrón: «Alguien está buscando nombres, no madera».

🎁 +40 ChengCoins · +35 XP de Custodio
✨ Panda Guerrero: +100 XP
🧩 1 fragmento

El patrón del bambú vuelve a aparecer en una hoja. Al apartarla, Lian descubre a quien se refugia debajo.
Una pequeña criatura tiembla entre hojas manchadas de tinta. Más adelante, las huellas todavía están frescas.
Bao deja su bastón junto al arroyo: «Está asustada. Pero la corriente pronto borrará el rastro».
Lian abre su cuaderno. Espera tu decisión.

🛡️ Equipo preparado: 1/3 compañeros

1. Auxiliar a la criatura
👉 .ctuhistoria elegir 1

2. Perseguir las huellas
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia I-02: la gratitud de una criatura importa después

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/7 misiones

🖋️ Limpias la tinta de una pata y le dejas espacio. Antes de refugiarse, la criatura señala unos arbustos: te está advirtiendo.

🎁 +60 ChengCoins · +45 XP de Custodio
✨ Panda Guerrero: +150 XP · 🌱 Nv. 4
🧩 1 fragmento · 1 esencia

La criatura que ayudaste silba desde su refugio y señala las garras oscuras. Su advertencia llega a tiempo.
Dos Ecos retroceden hacia el bambú; un tercero avanza, reuniendo tinta alrededor de sus garras.
Lian: «No todos quieren atacarnos. Mira cuál prepara el golpe».
Bao: «Cuando la tinta se concentre, cúbrete. Después de descargarla quedará expuesto».

🛡️ Equipo preparado: 1/3 compañeros

1. Observar y enfrentar solo al Eco hostil
👉 .ctuhistoria elegir 1

2. Proteger a los Ecos asustados
👉 .ctuhistoria elegir 2

3. Atacar sin distinguirlos
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia I-03: Eco de Tinta y mecánica de minijefe

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/7 misiones

🖋️ Reconoces al Eco de Tinta por sus garras oscuras y dejas una salida a los otros. Lian anota tu cuidado al elegir el objetivo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/126 HP
🛡️ Escudo 12

👁️ *Eco de Tinta*
▓▓▓▓▓▓▓▓▓▓ 240/240 HP

⚠️ *SEÑAL ENEMIGA*
El Eco prepara un zarpazo corto.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad

💾 El turno se conserva al salir.
```

## Historia: retirada voluntaria, pista y reintento sin pérdida de cartas

```text
🃏 *CHENGDÚ CARDS | HISTORIA | RETIRADA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/7 misiones

Te retiras a salvo. Puedes preparar otro equipo y volver a intentarlo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/126 HP
🛡️ Escudo 12

👁️ *Eco de Tinta*
▓▓▓▓▓▓▓▓▓▓ 240/240 HP

🏳️ *Te retiraste del encuentro.*
Tu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.

💡 Observa la señal enemiga: defender antes de un golpe cargado puede cambiar el combate. Prepara tu equipo y vuelve a intentarlo.

🔁 *.ctuhistoria reintentar*
🛡️ Preparar: .ctuequipo
🔎 Pista: .ctuhistoria pista
```

## Historia: nueva expedición con vida restaurada

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/7 misiones

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/126 HP
🛡️ Escudo 12

👁️ *Eco de Tinta*
▓▓▓▓▓▓▓▓▓▓ 240/240 HP

⚠️ *SEÑAL ENEMIGA*
El Eco prepara un zarpazo corto.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad

💾 El turno se conserva al salir.
```

## Historia: defender la descarga anunciada

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/7 misiones

Panda Guerrero se cubre: reduce el próximo daño de este turno un 70%.
Eco de Tinta usó Descarga de tinta: 26 de daño.
🛡️ Tu defensa amortiguó la ofensiva: recibiste 26 de daño.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 95/126 HP

👁️ *Eco de Tinta*
▓▓▓▓▓▓▓▓▓▒ 210/240 HP
Defensas abiertas

⚠️ *SEÑAL ENEMIGA*
✨ El Eco está expuesto tras la descarga: su defensa queda en 0 durante tu próxima acción.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad

💾 El turno se conserva al salir.
```

## Historia: aprovechar la apertura del minijefe

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T5*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/7 misiones

Aprovechas la apertura: el Eco tiene la defensa reducida a 0.
Panda Guerrero usó Impacto del Panda: 61 de daño.
Panda Guerrero recibe escudo.
El Eco intenta recuperar el equilibrio.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 95/126 HP
🛡️ Escudo 12

👁️ *Eco de Tinta*
▓▓▓▓▓▓▓▒▒▒ 149/240 HP

⚠️ *SEÑAL ENEMIGA*
El Eco prepara un zarpazo corto.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender

💾 El turno se conserva al salir.
```

## Historia: fase 1 completa y compañero preparado para evolucionar

```text
🃏 *CHENGDÚ CARDS | HISTORIA | FASE 1 COMPLETA*
━━━━━━━━━━━━━━
📖 Avance: 7/7 misiones

Panda Guerrero usó Golpe de Bambú: 28 de daño.
Eco de Tinta quedó fuera de combate.
El Eco se serena. Tu vínculo resistió la tinta.

🌿 *¡Encuentro superado!*
Eco de Tinta deja de luchar. El vínculo sigue intacto.

🎁 +100 ChengCoins · +100 XP de Custodio
✨ Panda Guerrero: +450 XP · 🌱 Nv. 5
🧩 1 fragmento · 1 esencia

📜 *Tu primera expedición queda escrita.*
Has completado el prólogo y las primeras tres misiones del bosque. Tus decisiones y recuerdos quedan guardados.

🔒 El resto del Capítulo I llegará en la siguiente fase.

📖 .ctudiario historia
🎋 .cturecuerdos
🔮 Consulta tu evolución: .ctuevolucion PAND-000006
```

## Diario narrativo: resumen, crónica y decisiones sin cobrar el diario económico

```text
🃏 *CHENGDÚ CARDS | DIARIO DEL CUSTODIO*
━━━━━━━━━━━━━━
📍 *Qué pasó antes*
Has superado el prólogo y la primera expedición del bosque. La tinta continúa hacia un claro todavía cerrado.

📚 *Crónica*
*P-01 · Una invitación bajo el bambú*
Un panda anciano observa una carta a la sombra del bambú. A su espalda se alza el Gran Archivo.
*P-02 · El primer vínculo*
Bao despliega los registros de las criaturas que pueden formar su primer vínculo.
*P-03 · Una sombra en la plaza*
Una mancha de tinta cruza la plaza. Dentro tiembla una criatura que parece no reconocer el camino.
*P-04 · Las campanas del Archivo*
La tinta abandona al Eco, pero las campanas siguen sonando. Lian encuentra una carta completamente blanca.
*I-01 · Sendero en silencio*
El sendero conserva el olor de la lluvia, pero no se oye un solo pájaro.
*I-02 · Una criatura herida*
Una pequeña criatura tiembla entre hojas manchadas de tinta. Más adelante, las huellas todavía están frescas.
*I-03 · Huellas en el bambú*
Dos Ecos retroceden hacia el bambú; un tercero avanza, reuniendo tinta alrededor de sus garras.

👥 *Personajes conocidos*
*Maestro Bao*
Mentor y antiguo guardián del Archivo. Te ayuda a comprender a tus compañeros.
*Lian*
Investiga los nombres borrados y recuerda cómo tratas a los Ecos.

🖋️ *Trazos y pistas*
*Trazos de la Primera Carta*
0 de 5. Aún no has recuperado ninguno.

🧭 *Tus decisiones*
*Una invitación bajo el bambú*
Preguntar por las criaturas. Bao: «Cada una tiene su nombre y su historia. Ser Custodio es acompañarla, no decidir todo por ella».
*Sendero en silencio*
Examinar las marcas del bambú. Los cortes interrumpen viejas inscripciones. Lian copia el patrón: «Alguien está buscando nombres, no madera».
*Una criatura herida*
Auxiliar a la criatura. Limpias la tinta de una pata y le dejas espacio. Antes de refugiarse, la criatura señala unos arbustos: te está advirtiendo.
*Huellas en el bambú*
Observar y enfrentar solo al Eco hostil. Reconoces al Eco de Tinta por sus garras oscuras y dejas una salida a los otros. Lian anota tu cuidado al elegir el objetivo.

📜 *Recuerdos*
*Campanas sin manos*
La primera llamada del Gran Archivo y una carta que había perdido su nombre.
*La gratitud del bosque*
Te detuviste a ayudar a una criatura herida cuando las huellas podían desaparecer.
*La confianza de Lian*
Distinguiste al Eco hostil de las criaturas asustadas. Lian dejó una nota de confianza en tu cuaderno.

🗺️ *Atlas*
*Plaza del Archivo*
El despertar del Custodio
*Bosque de los Susurros*
El Bosque que Olvidó su Voz

👉 .ctuhistoria
🗺️ .ctucapitulos
```

## Historia: avance y siguientes misiones bloqueadas

```text
🃏 *CHENGDÚ CARDS | CAPÍTULOS*
━━━━━━━━━━━━━━
🎋 *El despertar del Custodio*
✅ P-01 · Una invitación bajo el bambú
✅ P-02 · El primer vínculo
✅ P-03 · Una sombra en la plaza
✅ P-04 · Las campanas del Archivo

🎋 *El Bosque que Olvidó su Voz*
✅ I-01 · Sendero en silencio
✅ I-02 · Una criatura herida
✅ I-03 · Huellas en el bambú
🔒 I-04 · El claro de la tinta · Próxima fase
🔒 I-05 · Encuentro del capítulo · Próxima fase

👉 .ctuhistoria
```

## Historia: recuerdos personales no comerciables

```text
🃏 *CHENGDÚ CARDS | RECUERDOS*
━━━━━━━━━━━━━━
📜 *Memorias del Custodio*

*Campanas sin manos*
La primera llamada del Gran Archivo y una carta que había perdido su nombre.

*La gratitud del bosque*
Te detuviste a ayudar a una criatura herida cuando las huellas podían desaparecer.

*La confianza de Lian*
Distinguiste al Eco hostil de las criaturas asustadas. Lian dejó una nota de confianza en tu cuaderno.

👉 .ctuhistoria
```

## Historia: materiales auténticos para el primer sello

```text
🃏 *CHENGDÚ CARDS | CRAFTING*
━━━━━━━━━━━━━━
🪵 0 fragmentos · ✨ 0 esencias · 🔮 0 sellos

🎁 5 recompensas con materiales pendientes
👉 .ctucrafting reclamar

🔨 *Sello de evolución*
💰 100 ChengCoins
🧩 5 fragmentos · 2 esencias
👉 .ctucrafting crear sello_evolucion

🔨 *Insignia de bambú*
💰 50 ChengCoins
🧩 3 fragmentos
👉 .ctucrafting crear insignia_bambu

🎒 .ctuinventario
🔮 Evolución: .ctuevolucion ID
```

## Pruebas de Historia: confirmación del reinicio personal

```text
🃏 *CHENGDÚ CARDS | REINICIAR HISTORIA*
━━━━━━━━━━━━━━
🧪 *Reinicio de campaña para pruebas*

Vuelve al comienzo del prólogo y termina tu encuentro narrativo actual.
Tus unidades, XP, monedas y recompensas ya entregadas se conservan. Los premios únicos no se vuelven a cobrar.

👉 Confirmar: *.ctureiniciarhistoria confirmar*
```

## Pruebas de Historia: nueva partida conservando premios y unidades

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-01 · Una invitación bajo el bambú*

📖 Avance: 0/7 misiones

🖋️ Campaña reiniciada para pruebas. Tus unidades, XP, monedas y premios anteriores se conservan.

Un panda anciano observa una carta a la sombra del bambú. A su espalda se alza el Gran Archivo.
Bao: «Una carta no es solo poder. Es una historia que acepta continuar contigo».
Desde la torre suena una campana. Bao levanta la mirada: nadie debería estar tocándola.

🛡️ Equipo preparado: 1/3 compañeros

1. Preguntar por el Archivo
👉 .ctuhistoria elegir 1

2. Preguntar por las criaturas
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Pruebas de Historia: repetir una misión no vuelve a entregar sus monedas

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-02 · El primer vínculo*

📖 Avance: 1/7 misiones

🖋️ Bao: «Guardamos nombres y vínculos. Cuando las campanas llaman solas, algo ha dejado de estar donde debería».

↩️ Premio único ya entregado; repetir esta misión no vuelve a otorgarlo.

Bao: «Antes de entrar en el Archivo, necesitas conocer a tu primer compañero».
Bao despliega los registros de las criaturas que pueden formar su primer vínculo.
«No busques la más rara. Busca una compañera cuya forma de luchar quieras aprender».
Tu criatura inicial conserva su identidad, su origen y las aventuras que viváis juntos.

🛡️ Equipo preparado: 1/3 compañeros

🎴 Tu compañero ya está preparado.
👉 *.ctuhistoria continuar*
```
