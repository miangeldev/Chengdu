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
.ctuhistoria · Prólogo, Bosque y Mercado de los Ecos
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
🔎 .ctuhistorial BTL-0f170234-b4b1-4630-9791-d732998cb666

🏆 Victoria vs *Lukas*
📅 11 de octubre de 2026 · 1v1 clásico · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-45416013-4459-44c9-b824-19eb28729069

🏆 Victoria vs *Lukas*
📅 11 de octubre de 2026 · 1v1 clásico · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-8b0711d3-d3a9-4b1c-ae40-8cd0319a5260

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
🔎 .ctuhistorial BTL-35a671d7-eaed-43ea-a26b-cb39f447d2ca

💔 Derrota vs *Lukas*
📅 22 de octubre de 2026 · 1v1 clásico · 5 turnos
🎁 +0 ChengCoins · +15 XP
🔎 .ctuhistorial BTL-995767e2-34c7-4ea2-ae45-143be7ee727f

🏆 Victoria vs *Lukas*
📅 22 de octubre de 2026 · 1v1 clásico · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-ab8ccea8-6763-4fbd-897e-910320058401

💔 Derrota vs *Lukas*
📅 20 de octubre de 2026 · 1v1 · 0 turnos
🔎 .ctuhistorial BTL-cce8457d-83e9-436c-b3f9-c91a7cd3216d

💔 Derrota vs *Lukas*
📅 20 de octubre de 2026 · 3v3 · 31 turnos
🎁 +0 ChengCoins · +15 XP
🔎 .ctuhistorial BTL-cd575976-2f28-4e2e-86e6-63d8f80e18ca

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

## Historia: invitación a la temporada completa

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *El despertar del Custodio*

En Chengdú, las cartas conservan historias. Una tinta desconocida está borrando sus nombres.
Bao te espera bajo el bambú: tu primer vínculo puede cambiar lo que viene.

📖 Temporada completa: prólogo, cinco capítulos y epílogo.
💾 Cada escena y turno quedan guardados; puedes volver cuando quieras.

👉 *.ctuhistoria iniciar*
📖 Guía: .ctuhistoria ayuda
```

## Historia P-01: primera escena y decisiones numeradas

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-01 · Una invitación bajo el bambú*

📖 Avance: 0/32 misiones

Un panda anciano observa una carta a la sombra del bambú. A su espalda se alza el Gran Archivo.
Bao: «Una carta no es solo poder. Es una historia que acepta continuar contigo».
Desde la torre suena una campana. Bao levanta la mirada: nadie debería estar tocándola.

1. Preguntar por el Archivo
👉 .ctuhistoria elegir 1

2. Preguntar por las criaturas
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia P-01: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-01 · Una invitación bajo el bambú*

📖 Avance: 0/32 misiones

Un panda anciano observa una carta a la sombra del bambú. A su espalda se alza el Gran Archivo.
Bao: «Una carta no es solo poder. Es una historia que acepta continuar contigo».
Desde la torre suena una campana. Bao levanta la mirada: nadie debería estar tocándola.

1. Preguntar por el Archivo
👉 .ctuhistoria elegir 1

2. Preguntar por las criaturas
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia P-02: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-02 · El primer vínculo*

📖 Avance: 1/32 misiones

🖋️ Bao: «Guardamos nombres y vínculos. Cuando las campanas llaman solas, algo ha dejado de estar donde debería».

🎁 +15 ChengCoins · +15 XP de Custodio

Bao: «Antes de entrar en el Archivo, necesitas conocer a tu primer compañero».
Bao despliega los registros de las criaturas que pueden formar su primer vínculo.
«No busques la más rara. Busca una compañera cuya forma de luchar quieras aprender».
Tu criatura inicial conserva su identidad, su origen y las aventuras que viváis juntos.

🎴 Elige tu primer compañero: *.ctustarter*
👉 Después: .ctuhistoria continuar
```

## Historia P-03: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-03 · Una sombra en la plaza*

📖 Avance: 2/32 misiones

🎁 +15 XP de Custodio
✨ Panda Guerrero: +75 XP

Una mancha de tinta cruza la plaza. Dentro tiembla una criatura que parece no reconocer el camino.
Bao: «Es un Eco: una identidad dañada. Vamos a detenerlo sin hacerle más daño del necesario».
«Prueba tus ataques, aprende a cubrirte y observa cuándo conviene usar una habilidad. Estoy aquí si caes».

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia P-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Prólogo · El despertar del Custodio*
📍 *P-04 · Las campanas del Archivo*

📖 Avance: 3/32 misiones

Panda Guerrero usó Golpe de Bambú: 23 de daño a Eco desorientado.
Eco desorientado queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🎁 +34 ChengCoins · +38 XP de Custodio
✨ Panda Guerrero: +165 XP · 🌱 Nv. 2
🧩 1 fragmento

La tinta abandona al Eco, pero las campanas siguen sonando. Lian encuentra una carta completamente blanca.
Lian: «Los registros no están rotos. Les faltan los nombres».
Bao reconoce un sello en el borde y aparta la mirada: «No es la primera vez que veo esa tinta».
Las últimas huellas salen de la plaza y se pierden en el Bosque de los Susurros.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia I-01: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-01 · Sendero en silencio*

📖 Avance: 4/32 misiones

🎁 +26 ChengCoins · +22 XP de Custodio
✨ Panda Guerrero: +60 XP · 🌱 Nv. 3
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

## Historia I-02: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-02 · Una criatura herida*

📖 Avance: 5/32 misiones

🖋️ Los cortes interrumpen viejas inscripciones. Lian copia el patrón: «Alguien está buscando nombres, no madera».

🎁 +30 ChengCoins · +26 XP de Custodio
✨ Panda Guerrero: +75 XP

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

## Historia I-03: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/32 misiones

🖋️ Limpias la tinta de una pata y le dejas espacio. Antes de refugiarse, la criatura señala unos arbustos: te está advirtiendo.

🎁 +45 ChengCoins · +34 XP de Custodio
✨ Panda Guerrero: +112 XP
🧩 1 fragmento

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

## Historia I-03: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-03 · Huellas en el bambú*

📖 Avance: 6/32 misiones

Panda Guerrero usó Golpe de Bambú: 30 de daño a Eco de Tinta.
Eco de Tinta usó Hostigamiento de carga: 4 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 120/124 HP

👁️ *Eco de Tinta*
▓▓▓▓▓▓▓▓▒▒ 174/245 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 El rival responde en todos los turnos. El apoyo tiene enfriamiento. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia I-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-04 · El claro de la tinta*

📖 Avance: 7/32 misiones

Panda Guerrero usó Golpe de Bambú: 6 de daño a Eco de Tinta.
Eco de Tinta queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🎁 +75 ChengCoins · +75 XP de Custodio
✨ Panda Guerrero: +338 XP · 🌱 Nv. 4
🧩 1 fragmento · 1 esencia

Lian vuelve a abrir su cuaderno: «Distinguiste a los asustados. Aquí también tendremos que mirar antes de atacar».
Una figura de niebla aparta el bambú: la Guardiana Nube escucha una canción que ya no sabe terminar.
Nube: «Queda una sílaba bajo las raíces. La tinta se lleva los nombres, pero todavía no ha aprendido a escuchar».
Lian reconoce en una piedra el sello de la carta blanca. A su lado, una sombra se tensa antes de atacar.
Bao: «Mira sus movimientos. Si anuncia el golpe, puedes prepararte antes de recibirlo».

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia I-04: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-04 · El claro de la tinta*

📖 Avance: 7/32 misiones

Panda Guerrero usó Golpe de Bambú: 32 de daño a Acechador de Tinta.
Acechador de Tinta usó Hostigamiento de carga: 2 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 124/126 HP

👁️ *Acechador de Tinta*
▓▓▓▓▓▓▒▒▒▒ 85/160 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 El rival responde en todos los turnos. El apoyo tiene enfriamiento. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia I-05: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-05 · Guardián Marchito*

📖 Avance: 8/32 misiones

Panda Guerrero usó Golpe de Bambú: 14 de daño a Acechador de Tinta.
Acechador de Tinta queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🖋️ Nube retiene la última sílaba y señala las raíces del centro del claro. Allí alguien sigue intentando recordar su deber.

🎁 +45 ChengCoins · +30 XP de Custodio
✨ Panda Guerrero: +90 XP
🧩 1 fragmento

El Guardián Marchito levanta un muro de raíces. Bajo la corteza, la tinta repite una orden que ya no comprende.
Nube: «Antes protegía el sendero. Ahora cree que todo el que intenta pasar viene a quitarle algo».
Bao: «Rompe la barrera cuando cierre el paso y defiende cuando concentre la tinta. Estamos aquí para devolverle su voz».

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia I-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-05 · Guardián Marchito*

📖 Avance: 8/32 misiones

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/126 HP
🛡️ Escudo 12

👁️ *Guardián Marchito*
▓▓▓▓▓▓▓▓▓▓ 245/245 HP
Barrera de raíces

⚠️ *SEÑAL ENEMIGA*
🌿 Las raíces vuelven a cubrirlo. Romper abre paso al ataque básico; el Guardián responderá.

🧩 🌿 Barrera: 45. La carga y la apertura también causan daño. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria romper · Rompe raíces y consume el turno
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia I-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-05 · Guardián Marchito*

📖 Avance: 8/32 misiones

💥 Rompes las raíces y diriges un ataque básico. El Guardián responderá.
Panda Guerrero usó Golpe de Bambú: 28 de daño a Guardián Marchito.
Guardián Marchito usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/126 HP
🛡️ Escudo 4

👁️ *Guardián Marchito*
▓▓▓▓▓▓▓▓▓▒ 217/245 HP
Tinta en concentración

⚠️ *SEÑAL ENEMIGA*
⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.

🧩 🌿 Barrera: 0. La carga y la apertura también causan daño. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia I-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-05 · Guardián Marchito*

📖 Avance: 8/32 misiones

Panda Guerrero usó Impacto del Panda: 39 de daño a Guardián Marchito.
Guardián Marchito usó Hostigamiento de carga: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/126 HP
🛡️ Escudo 4

👁️ *Guardián Marchito*
▓▓▓▓▓▓▓▓▒▒ 178/245 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🌿 Barrera: 0. La carga y la apertura también causan daño. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia I-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-05 · Guardián Marchito*

📖 Avance: 8/32 misiones

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Guardián Marchito usó Descarga del vínculo: 20 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▒ 106/126 HP

👁️ *Guardián Marchito*
▓▓▓▓▓▓▓▒▒▒ 162/245 HP
Defensas abiertas

⚠️ *SEÑAL ENEMIGA*
Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.

🧩 🌿 Barrera: 0. La carga y la apertura también causan daño. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia I-05: derrota guardada y reintento

```text
🃏 *CHENGDÚ CARDS | HISTORIA | DERROTA*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-05 · Guardián Marchito*

📖 Avance: 8/32 misiones

💥 Rompes las raíces y diriges un ataque básico. El Guardián responderá.
Panda Guerrero usó Golpe de Bambú: 27 de daño a Guardián Marchito.
🛡️ La barrera desvía el remate: el jefe resiste con 1 HP y responde con su furia.
💥 El jefe libera una descarga que supera la defensa del equipo.
Tu equipo cae bajo la presión. Conservas tus cartas y monedas; revisa la señal y prepara el siguiente intento.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▒▒▒▒▒▒▒▒▒▒ 0/126 HP

👁️ *Guardián Marchito*
▓▒▒▒▒▒▒▒▒▒ 1/245 HP

🌧️ *Esta vez la expedición cayó.*
Tu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.

💡 Rompe la barrera de raíces antes de gastar tus técnicas y defiende cuando anuncie la descarga. La apertura posterior es tu oportunidad.

🔁 *.ctuhistoria reintentar*
🛡️ Preparar: .ctuequipo
🔎 Pista: .ctuhistoria pista
```

## Historia I-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo I · El Bosque que Olvidó su Voz*
📍 *I-05 · Guardián Marchito*

📖 Avance: 8/32 misiones

Panda Guerrero usó Impacto del Panda: 39 de daño a Guardián Marchito.
Guardián Marchito usó Hostigamiento de carga: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/126 HP
🛡️ Escudo 4

👁️ *Guardián Marchito*
▓▓▓▓▓▓▓▓▒▒ 178/245 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🌿 Barrera: 0. La carga y la apertura también causan daño. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-01: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-01 · Rumores entre faroles*

📖 Avance: 9/32 misiones

Panda Guerrero usó Golpe de Bambú: 39 de daño a Guardián Marchito.
Guardián Marchito queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🖋️ El Guardián baja las ramas: «Yo... cuidaba el camino. No debía cerrarlo para siempre». Parte de su memoria vuelve con el viento.
Nube te entrega el Primer Trazo. Entre la tinta que se disuelve oyes: «El nombre también puede convertirse en una cadena».

🎁 +105 ChengCoins · +60 XP de Custodio
✨ Panda Guerrero: +195 XP · 🌱 Nv. 5
🧩 1 fragmento · 1 esencia
📜 Recuerdo: El nombre bajo las raíces

Bao recuerda a la criatura del arroyo: «En un mercado, escuchar también puede ser una forma de cuidar».
En el Mercado de los Ecos, Tía Mei enfría una taza junto a un asiento vacío. Hay puestos que han cerrado sin despedirse.
Mei: «Aquí comerciamos con historias que continúan. Esas cartas perfectas, sin nombre de origen, están haciendo callar a la gente».
Lian guarda el Primer Trazo. Necesitáis un testimonio, no acusar a todo el mercado.

🛡️ Equipo preparado: 1/3 compañeros

1. Escuchar a los comerciantes con cortesía
👉 .ctuhistoria elegir 1

2. Mostrar el símbolo y pedir pruebas
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia II-02: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-02 · El puesto sin nombre*

📖 Avance: 10/32 misiones

🖋️ Compartes el té antes de preguntar. Mei presenta a Tao, un aprendiz de mensajero: vio una entrega que nadie quiso firmar.

🎁 +20 ChengCoins · +20 XP de Custodio
✨ Panda Guerrero: +40 XP

Tao os acompaña desde la casa de té. Reconoce el puesto que nadie quiso mencionar durante la entrega.
En un puesto vacío brilla una carta sin una sola marca de uso. Su dibujo parece perfecto; el espacio del nombre está intacto.
Lian: «La apariencia puede copiarse. Una identidad tiene origen, huellas y un recorrido que podemos comprobar».
El registro del puesto no identifica a ninguna criatura. Elegís cómo documentar lo que falta.

🛡️ Equipo preparado: 1/3 compañeros

1. Examinar la inscripción y el sello
👉 .ctuhistoria elegir 1

2. Investigar su procedencia e historial
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia II-03: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-03 · Una oferta imposible*

📖 Avance: 11/32 misiones

🖋️ La inscripción termina donde debería empezar el nombre. Lian conserva una copia: la carta representa poder, pero no acredita un vínculo auténtico.

🎁 +25 ChengCoins · +20 XP de Custodio
✨ Panda Guerrero: +55 XP
🧩 1 fragmento

La carta del desconocido tiene la misma interrupción en la inscripción que examinaste en el puesto vacío.
Un desconocido ofrece una carta invencible a cambio del compañero más querido de tu Custodio. No muestra nombre ni registro.
Bao deja sobre la mesa una carta de ensayo: «Podemos seguirle el juego para entenderlo. Decide cómo te acercarías».
🧪 Esta oferta es simulada: tus cartas, propietarios y ChengCoins no se intercambian.

🛡️ Equipo preparado: 1/3 compañeros

1. Aceptar la oferta dentro del relato
👉 .ctuhistoria elegir 1

2. Rechazar y pedir un registro verificable
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia II-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-04 · El libro de los ausentes*

📖 Avance: 12/32 misiones

🖋️ Ofreces la carta de ensayo. El desconocido intenta cerrar el trato antes de que puedas mirar la suya; Lian descubre un hilo de tinta hacia un almacén. «Tu audacia mostró la trampa. En un intercambio real, revisa ambas ofertas antes de confirmar».

🎁 +20 ChengCoins · +20 XP de Custodio
✨ Panda Guerrero: +50 XP

La trampa de la oferta te dejó una pista: el vendedor ocultaba el mismo patrón del tejido.
Tao deja un libro de entregas sobre la mesa. La Señora Yun extiende a su lado un tejido con los mismos espacios en blanco.
Yun: «Una marca cuenta dónde estuvo alguien. Otra conserva lo que quería que recordaran de él. Necesitamos leer ambas».
Lian abre dos páginas del diario. Elige qué pista investigar primero; después revisaréis la otra.

🛡️ Equipo preparado: 1/3 compañeros

1. Revisar primero el libro de entregas
👉 .ctuhistoria elegir 1

2. Descifrar primero el patrón del tejido
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia II-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-04 · El libro de los ausentes*

📖 Avance: 12/32 misiones

🖋️ Tao ordena los recibos mientras Yun sostiene el tejido a contraluz. Empiezas siguiendo los destinos de las cartas.

Tres entregas llegaron al mismo almacén; sus páginas perdieron los nombres después de ser firmadas.
Tao reconoce una ruta aún utilizada. Lian marca el lugar: «No desaparecieron durante el viaje. Alguien los borró al recibirlos».

🛡️ Equipo preparado: 1/3 compañeros

🔎 *Investigación 1/2*
Lee esta pista; la siguiente completa la otra parte del hallazgo.

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia II-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-04 · El libro de los ausentes*

📖 Avance: 12/32 misiones

Yun encuentra un hilo que se interrumpe y reaparece junto a otro nombre. La interrupción sigue siempre el mismo patrón.
«No es un adorno», dice. «Es una petición: que les permitan volver a elegir». Lian conserva la frase en su cuaderno.

🛡️ Equipo preparado: 1/3 compañeros

🔎 *Investigación 2/2*
Lee esta pista; la siguiente completa la otra parte del hallazgo.

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia II-05: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

🖋️ Las dos pistas señalan el mismo almacén. Mei reúne a los comerciantes para que los registros auténticos permanezcan a salvo mientras investigáis.

🎁 +30 ChengCoins · +25 XP de Custodio
✨ Panda Guerrero: +60 XP
🧩 1 fragmento

La ruta de entregas del libro termina en este almacén. Tao reconoce las cajas que dejaron los últimos mensajeros.
El Mercader Sin Rostro despliega cartas enormes. Cada silueta promete una fuerza distinta, pero todas dejan la misma sombra sobre el suelo.
Mercader: «Si nadie cambia de dueño, nadie volverá a perder lo que ama». Detrás de él, los nombres del libro empiezan a inmovilizarse.
Lian: «Sus invocaciones no se comportan igual. Observa el patrón antes de gastar tu mejor técnica».

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 128/128 HP
🛡️ Escudo 12

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▓▓ 270/270 HP
Señuelos activos

⚠️ *SEÑAL ENEMIGA*
🪞 Renovará sus reflejos. Observar reconoce al original y consume un turno bajo presión.

🧩 🪞 Señuelos activos: observa bajo presión. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria observar · Revela señuelos y consume el turno
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

👁️ Reconoces el original. Ahora tus ataques pueden alcanzarlo.
Mercader Sin Rostro usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 128/128 HP
🛡️ Escudo 4

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▓▓ 270/270 HP

⚠️ *SEÑAL ENEMIGA*
La tinta prepara un golpe rápido: el enemigo no dejará de presionarte.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

Panda Guerrero usó Impacto del Panda: 41 de daño a Mercader Sin Rostro.
Mercader Sin Rostro usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 128/128 HP
🛡️ Escudo 4

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▓▒ 229/270 HP
Tinta en concentración

⚠️ *SEÑAL ENEMIGA*
⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

Panda Guerrero usó Golpe de Bambú: 30 de daño a Mercader Sin Rostro.
Mercader Sin Rostro usó Hostigamiento de carga: 4 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 124/128 HP

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▒▒ 199/270 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T5*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Mercader Sin Rostro usó Descarga del vínculo: 25 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 99/128 HP

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▒▒▒ 183/270 HP
Defensas abiertas

⚠️ *SEÑAL ENEMIGA*
Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: derrota guardada y reintento

```text
🃏 *CHENGDÚ CARDS | HISTORIA | DERROTA*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

👁️ Reconoces el original. Ahora tus ataques pueden alcanzarlo.
Mercader Sin Rostro usó Presión de tinta: 14 de daño a Panda Guerrero.
Panda Guerrero queda fuera de combate.
Tu equipo cae bajo la presión. Conservas tus cartas y monedas; revisa la señal y prepara el siguiente intento.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▒▒▒▒▒▒▒▒▒▒ 0/128 HP

👁️ *Mercader Sin Rostro*
▓▓▒▒▒▒▒▒▒▒ 31/270 HP

🌧️ *Esta vez la expedición cayó.*
Tu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.

💡 Observa los señuelos para revelar al original antes de atacar. Cuando anuncie una descarga, defiende; las técnicas también se gastan si alcanzan una ilusión.

🔁 *.ctuhistoria reintentar*
🛡️ Preparar: .ctuequipo
🔎 Pista: .ctuhistoria pista
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 128/128 HP
🛡️ Escudo 12

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▓▓ 270/270 HP
Señuelos activos

⚠️ *SEÑAL ENEMIGA*
🪞 Renovará sus reflejos. Observar reconoce al original y consume un turno bajo presión.

🧩 🪞 Señuelos activos: observa bajo presión. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria observar · Revela señuelos y consume el turno
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

👁️ Reconoces el original. Ahora tus ataques pueden alcanzarlo.
Mercader Sin Rostro usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 128/128 HP
🛡️ Escudo 4

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▓▓ 270/270 HP

⚠️ *SEÑAL ENEMIGA*
La tinta prepara un golpe rápido: el enemigo no dejará de presionarte.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

Panda Guerrero usó Impacto del Panda: 41 de daño a Mercader Sin Rostro.
Mercader Sin Rostro usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 128/128 HP
🛡️ Escudo 4

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▓▒ 229/270 HP
Tinta en concentración

⚠️ *SEÑAL ENEMIGA*
⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

Panda Guerrero usó Golpe de Bambú: 30 de daño a Mercader Sin Rostro.
Mercader Sin Rostro usó Hostigamiento de carga: 4 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 124/128 HP

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▒▒ 199/270 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T5*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Mercader Sin Rostro usó Descarga del vínculo: 25 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 99/128 HP

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▒▒▒ 183/270 HP
Defensas abiertas

⚠️ *SEÑAL ENEMIGA*
Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia II-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo II · El Mercado de los Ecos*
📍 *II-05 · Mercader Sin Rostro*

📖 Avance: 13/32 misiones

Panda Guerrero usó Golpe de Bambú: 30 de daño a Mercader Sin Rostro.
Mercader Sin Rostro usó Hostigamiento de carga: 3 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 125/128 HP

👁️ *Mercader Sin Rostro*
▓▓▓▓▓▓▓▓▒▒ 199/270 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 👁️ Original reconocido. El enemigo sigue atacando. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-01: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-01 · El desafío de Huan*

📖 Avance: 14/32 misiones

📜 *Escena 1/5*

Panda Guerrero usó Impacto del Panda: 1 de daño a Mercader Sin Rostro.
Mercader Sin Rostro queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🖋️ Las ilusiones se apagan. El Mercader admite que recibía identidades incompletas de alguien que se hacía llamar un antiguo protector del Archivo.
Entre los registros aparece el Segundo Trazo. Lian comprende: «No quieren destruir a las criaturas. Quieren impedir que sus vínculos puedan cambiar».
Tía Mei devuelve el libro a sus comerciantes. Los nombres recuperados vuelven a circular con historias que sus Custodios pueden comprobar.

🎁 +90 ChengCoins · +55 XP de Custodio
✨ Panda Guerrero: +180 XP
🧩 1 fragmento · 1 esencia
📜 Recuerdo: El valor de un nombre

El camino deja atrás los puestos del mercado y asciende entre piedras húmedas. En un puente estrecho, Huan ordena tablillas de entrenamiento junto a una criatura que conoce cada una de sus señales. Ha oído hablar de los dos Trazos, pero quiere comprobar cómo diriges un combate sin las indicaciones de Bao.
Huan no cuestiona que los nombres deban recuperarse. Le preocupa que una buena intención se convierta en una promesa que nadie sabe cumplir. Propone un duelo de práctica, con retirada segura y sin clasificación. Bao acepta observar desde el borde del puente: el resultado enseñará algo a ambos Custodios.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-01: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-01 · El desafío de Huan*

📖 Avance: 14/32 misiones

📜 *Escena 2/5*

Huan deja sus insignias sobre una roca para que quede claro el carácter amistoso de la prueba. Su compañero reconoce la señal y toma posición. Nadie arriesga su carta, su propietario ni su puesto en el competitivo; aquí se examina una manera de responder, no el derecho a continuar el viaje.
Bao recuerda que defender también es una decisión y que una habilidad usada por impaciencia puede faltar cuando más se necesita. Huan promete detenerse si el equipo no puede seguir. Ganar o caer conduce al mismo sendero, aunque la conversación posterior conservará lo que ocurrió en este encuentro.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-01: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-01 · El desafío de Huan*

📖 Avance: 14/32 misiones

📜 *Escena 2/5*

Panda Guerrero usó Golpe de Bambú: 30 de daño a Huan.
Huan usó Hostigamiento de carga: 4 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 124/128 HP

👁️ *Huan*
▓▓▓▓▓▓▓▒▒▒ 114/185 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 El rival responde en todos los turnos. El apoyo tiene enfriamiento. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-01: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-01 · El desafío de Huan*

📖 Avance: 14/32 misiones

📜 *Escena 3/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Huan usó Descarga del vínculo: 23 de daño a Panda Guerrero.
La respuesta del vínculo causa 15 de daño al enemigo.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

Cuando termina el duelo, Huan recupera sus insignias sin pedir una revancha inmediata. Su criatura bebe junto al puente mientras Bao revisa que ambos equipos estén a salvo. El rival ha visto decisiones concretas: momentos de presión, oportunidades desaprovechadas y respuestas que no caben en una sola cifra de fuerza.
Huan admite que el bosque y el mercado exigieron algo distinto de sus ejercicios. Aún cree que un Custodio debe poder sostener sus promesas cuando el combate se complica. Puedes responder a esa preocupación reconociendo su esfuerzo o exigiendo que también aprenda a escuchar a quienes no luchan como él.
Huan observa la marca que dejó el último ataque y asiente: «Me ganaste. Eso no significa que ya sepamos cuidar mejor que nadie, pero sería deshonesto decir que sólo llegaste por los consejos de Bao». Su compañero golpea suavemente el suelo; el rival recoge la tablilla donde había anotado tu estrategia.

🛡️ Equipo preparado: 1/3 compañeros

1. Reconocer su esfuerzo y aprender juntos
👉 .ctuhistoria elegir 1

2. Pedirle que escuche antes de juzgar
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia III-01: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-01 · El desafío de Huan*

📖 Avance: 14/32 misiones

📜 *Escena 4/5*

🖋️ Huan guarda la tablilla de la victoria o de la derrota con la misma atención. Acepta compartir sus observaciones durante el ascenso.

Lian encuentra una inscripción en el reverso de una tablilla usada como apoyo del puente. No contiene una técnica secreta: registra una antigua expedición en la que varios Custodios cambiaron de función cuando el camino dejó de parecerse a su entrenamiento. Huan reconoce el nombre de su primera maestra.
La nota no convierte el combate en un error ni la prudencia en una solución universal. Habla de observar antes de repetir una respuesta. Bao pide conservar una copia y deja el original en su lugar. Las cartas pueden acumular nuevas experiencias sin que cada descubrimiento tenga que arrancarse de donde pertenece.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-01: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-01 · El desafío de Huan*

📖 Avance: 14/32 misiones

📜 *Escena 5/5*

El grupo cruza de uno en uno mientras Huan sujeta la cuerda del puente para quien viene detrás. No hace falta resolver todas las diferencias para realizar esa tarea juntos. Al otro lado se distinguen dos rutas hacia las Cumbres del Espejo, una abierta al viento y otra protegida entre paredes de piedra.
Bao da por terminada la práctica y recuerda que una derrota amistosa no define un destino. Las criaturas recuperan el paso y Lian añade una página sobre Huan a la crónica. La siguiente prueba no tendrá un público que cuente victorias: consistirá en decidir cómo llegar sin dejar a nadie atrás.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-02: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-02 · El ascenso*

📖 Avance: 15/32 misiones

📜 *Escena 1/5*

🎁 +30 ChengCoins · +40 XP de Custodio
✨ Panda Guerrero: +150 XP · 🌱 Nv. 6

La ruta alta permite ver el pabellón de la cumbre, pero el viento empuja grava sobre el sendero. La ruta baja rodea la ladera y conserva marcas de antiguas caravanas. Tao, que ha subido con una entrega, comprueba por su cuenta los dos accesos antes de recomendar que el grupo examine sus condiciones.
No hay un camino reservado para criaturas raras ni una prueba que exija una afinidad concreta. Ambos trayectos permiten continuar; cambia la información que encontrarás y la manera de organizar la marcha. Lian propone registrar la elección para que el regreso también pueda aprovechar lo aprendido durante el ascenso.

🛡️ Equipo preparado: 1/3 compañeros

1. Tomar la cornisa y revisar sus apoyos
👉 .ctuhistoria elegir 1

2. Rodear la ladera con la caravana
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia III-02: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-02 · El ascenso*

📖 Avance: 15/32 misiones

📜 *Escena 2/5*

🖋️ Huan prueba cada apoyo antes de pasar. La ruta abierta permite distinguir unas señales grabadas cerca de la cumbre.

A mitad de camino aparece una estación abandonada. Hay espacio para que las criaturas descansen sin ocupar la senda y una caja de herramientas cuya lista de contenidos sigue legible. Bao comprueba la cuerda del pasamanos mientras Tao reorganiza la carga: ayudar no consiste en esperar que todo lo resuelva el compañero más fuerte.
Lian encuentra dos versiones de un mismo mapa. Una señala el trayecto más corto; la otra añade refugios, agua y lugares donde una criatura puede apartarse del ruido. Ninguna sustituye a la otra. La investigadora conserva las diferencias y empieza a preguntar quién había decidido qué información merecía quedar escrita.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-02: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-02 · El ascenso*

📖 Avance: 15/32 misiones

📜 *Escena 3/5*

Las señales de la subida no conducen a un tesoro escondido. Describen cómo sostener una marcha cuando un integrante necesita cambiar el ritmo. Huan compara esas indicaciones con sus tablillas de entrenamiento y descubre que algunos espacios para anotar descansos habían sido eliminados en las copias más recientes.
Bao reconoce el sello del Archivo en las dos versiones y evita ofrecer una explicación inmediata. Lian no borra el detalle incómodo para protegerlo. Copia fecha, lugar y cambios visibles, dejando claro qué puede comprobar y qué sigue siendo una pregunta. La investigación empieza a alcanzar también a quienes acompañan al grupo.
Desde la cornisa, Huan había distinguido las señales que el pabellón oculta a quienes llegan por abajo. Ahora muestra que varias advertían del viento y de los descansos. «Las vimos porque miramos la ruta», dice, «no porque lleváramos una criatura capaz de ignorar todas sus dificultades».

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-02: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-02 · El ascenso*

📖 Avance: 15/32 misiones

📜 *Escena 4/5*

El sendero se estrecha antes del pabellón. Huan se queda junto a la carga en vez de adelantarse a demostrar que puede llegar primero. Tao explica que el paquete contiene hojas en blanco para restaurar registros, un trabajo menos vistoso que recuperar un Trazo y necesario para que los nombres puedan seguir leyéndose.
Bao agradece la entrega sin convertirla en otra deuda del mensajero. Cada integrante encuentra una tarea concreta y las criaturas recuperan aire antes del último tramo. El ascenso termina con un equipo más preparado, no con una exigencia de comprar poder para saltarse el camino que acaban de recorrer.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-02: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-02 · El ascenso*

📖 Avance: 15/32 misiones

📜 *Escena 5/5*

El pabellón de las Cumbres del Espejo no imita un santuario real: sus muros pertenecen a los antiguos escribas de este mundo fantástico. Tres superficies de piedra reflejan el movimiento del grupo con un pequeño retraso. Entre ellas se distingue una puerta y una frase incompleta sobre maneras distintas de proteger un vínculo.
Lian guarda los mapas antes de entrar y Huan deja sitio para que cada criatura observe los reflejos. Bao anuncia una prueba de daño, defensa y apoyo. No espera tres clases obligatorias ni tres cartas perfectas; quiere comprobar si una misma compañía puede encontrar más de una respuesta cuando cambia la situación.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-03: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 1/5*

🎁 +15 ChengCoins · +25 XP de Custodio
✨ Panda Guerrero: +70 XP

La primera superficie devuelve una imagen de tu compañero avanzando; la segunda lo muestra resistiendo una descarga y la tercera conserva la silueta de alguien que cubre una retirada. Las tres pertenecen a la misma criatura. Huan comprende que el pabellón no está ordenando a los visitantes por rareza o por prestigio.
Bao explica que daño, defensa y apoyo describen tareas durante una situación concreta. Una criatura común puede resolver varias de ellas y un equipo pequeño sigue siendo una compañía completa. La prueba respetará las estadísticas reales del grupo y anunciará sus señales para que ninguna respuesta dependa de adivinar una regla oculta.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-03: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 2/5*

Lian pide escoger qué observar primero. No hay una respuesta que cambie la potencia de las cartas a escondidas: la elección determina qué aspecto quedará destacado en la crónica. Huan revisa las marcas del suelo y prepara una retirada segura, convencido de que organizarla no resta valor al entrenamiento.
Tras el cristal, una figura espera sin nombre ni pretensión de ser una criatura emitida. Es una construcción de práctica del Archivo y no puede reclamarse como unidad. Sus movimientos permitirán ensayar una ofensiva normal, cubrirse ante un aviso y aprovechar una habilidad cuando exista una oportunidad comprensible.

🛡️ Equipo preparado: 1/3 compañeros

1. Observar cuándo conviene atacar
👉 .ctuhistoria elegir 1

2. Observar cómo sostener al equipo
👉 .ctuhistoria elegir 2

3. Observar el apoyo y las habilidades
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia III-03: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 3/5*

🖋️ Lian reserva una columna para las aperturas: un ataque útil llega cuando existe una oportunidad, no sólo cuando está disponible.

Los reflejos se reúnen en una figura que alterna gestos de amenaza y recuperación. Antes de moverse deja una señal sobre la superficie de piedra. Bao permanece fuera del círculo; si el equipo cae, la prueba podrá repetirse sin quitar monedas o criaturas, pero el pabellón no concederá una victoria por insistir sin cambiar de estrategia.
Huan recuerda lo visto en el puente y ofrece una indicación breve: «No confundas una habilidad lista con una obligación de gastarla». La puerta sigue cerrada hasta resolver la práctica, aunque no exige evolucionar ni traer una especie determinada. Las decisiones del turno bastan para demostrar lo que el equipo ha aprendido.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-03: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 3/5*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 130/130 HP
🛡️ Escudo 12

👁️ *Los Tres Reflejos*
▓▓▓▓▓▓▓▓▓▓ 245/245 HP

⚠️ *SEÑAL ENEMIGA*
Primer reflejo: demuestra una acción ofensiva; seguirá presionando.

🧩 Prácticas opcionales: daño ○ · defensa ○ · apoyo ○. Puedes vencer sin completarlas todas. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-03: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 3/5*

Panda Guerrero recupera 6 HP.
La respuesta del vínculo causa 20 de daño al enemigo.
Los Tres Reflejos usó Presión de tinta: 9 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 121/130 HP

👁️ *Los Tres Reflejos*
▓▓▓▓▓▓▓▒▒▒ 154/245 HP

⚠️ *SEÑAL ENEMIGA*
Segundo reflejo: defender crea una apertura para el equipo.

🧩 Prácticas opcionales: daño ✓ · defensa ○ · apoyo ✓. Puedes vencer sin completarlas todas. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad

💾 El turno se conserva al salir.
```

## Historia III-03: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T7*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 3/5*

Panda Guerrero usó Golpe de Bambú: 30 de daño a Los Tres Reflejos.
Los Tres Reflejos usó Presión de tinta: 6 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▒ 112/130 HP

👁️ *Los Tres Reflejos*
▓▓▓▓▒▒▒▒▒▒ 83/245 HP

⚠️ *SEÑAL ENEMIGA*
Tercer reflejo: apoyar restaura el vínculo y daña el reflejo.

🧩 Prácticas opcionales: daño ✓ · defensa ✓ · apoyo ✓. Puedes vencer sin completarlas todas. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-03: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 4/5*

Panda Guerrero usó Golpe de Bambú: 22 de daño a Los Tres Reflejos.
Los Tres Reflejos queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

La figura se deshace en tres líneas y deja visible el registro de las respuestas utilizadas. Bao no señala únicamente el golpe final: muestra el turno que evitó una caída y la habilidad que encontró una apertura. Lian compara esos momentos con la prioridad que elegiste antes de entrar al círculo.
Huan descubre una diferencia entre repetir una técnica correcta y comprender por qué fue útil. La criatura que lo acompaña apoya la cabeza en una de las superficies y su reflejo hace lo mismo un instante después. El rival anota por primera vez una pregunta en el espacio donde antes escribía sólo resultados.
Lian vuelve a la columna de aperturas que elegiste observar. El registro muestra que un golpe llegó a ser útil porque otro turno sostuvo al equipo, no porque la criatura intentara atacar con la misma fuerza cada vez. Huan añade esa relación a su tablilla y deja de separar el daño del momento en que pudo producirse.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-03: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-03 · Los tres reflejos*

📖 Avance: 16/32 misiones

📜 *Escena 5/5*

Detrás de la puerta aparece una inscripción conservada bajo varias reparaciones. Lian reconoce dos firmas junto a la frase sobre la Custodia: una pertenece a Bao y la otra fue raspada con tanto cuidado que el daño parece una decisión. El mentor deja de ordenar los papeles y acepta que el grupo se detenga a leer.
La prueba táctica termina aquí; la siguiente conversación no podrá resolverse ganando otro combate. Huan recoge las tablillas y se queda a escuchar. Bao sabe que cualquier explicación tendrá que incluir lo que hizo, lo que dejó de hacer y la razón por la que el Archivo prefirió conservar una versión más sencilla de su pasado.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-04 · El recuerdo de Bao*

📖 Avance: 17/32 misiones

📜 *Escena 1/5*

🎁 +25 ChengCoins · +35 XP de Custodio
✨ Panda Guerrero: +160 XP
🧩 1 fragmento

Bao coloca su sello junto a la inscripción. Las marcas encajan sin necesidad de que Lian acomode la piedra para favorecer una respuesta. Hace años, él y otro protector propusieron reformas para evitar disputas de Custodia. Algunas ayudaron a conservar registros; otras dejaron sin voz a criaturas que no podían demostrar lo ocurrido.
El compañero de Bao insistió en revisar esas omisiones después de una serie de pérdidas. El Archivo escuchó los casos como excepciones y aplazó los cambios. Bao reconoce que firmó parte de aquellos aplazamientos. Su silencio no causó por sí solo toda la crisis, pero contribuyó a que un problema conocido siguiera creciendo.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-04: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-04 · El recuerdo de Bao*

📖 Avance: 17/32 misiones

📜 *Escena 2/5*

Lian pregunta por la firma borrada y Bao confirma que perteneció a quien ahora llaman el Archivista. No presenta al antiguo compañero como alguien que siempre estuvo destinado a hacer daño. Recuerda propuestas valiosas y una ruptura posterior: proteger a todas las criaturas empezó a significar impedirles cambiar de vínculo.
Huan evita interrumpir para decidir de inmediato quién merece confianza. La escena conserva espacio para tu respuesta. Puedes aceptar que Bao siga acompañando al grupo mientras rinde cuentas o exigir que cada revelación futura se apoye en documentos y testimonios compartidos, sin expulsarlo de una trama que todavía necesita su ayuda.

🛡️ Equipo preparado: 1/3 compañeros

1. Confiar en él y exigir que siga contando
👉 .ctuhistoria elegir 1

2. Pedir pruebas y transparencia desde ahora
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia III-04: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-04 · El recuerdo de Bao*

📖 Avance: 17/32 misiones

📜 *Escena 3/5*

🖋️ Bao acepta continuar como compañero, no como dueño de las respuestas. Promete mostrar los documentos que todavía conserva.

Bao abre una carpeta que había llevado cerrada desde la plaza. Contiene peticiones de traslado, informes sobre pérdidas y cartas de criaturas que deseaban regresar o marcharse. Lian distingue las fuentes antes de resumirlas; un caso verdadero de abuso no autoriza a convertir cualquier transferencia futura en una amenaza inevitable.
La investigadora corrige una nota de su propio cuaderno. También ella había tratado una inscripción incompleta como si el silencio de una criatura borrada demostrara falta de voluntad. Reconocer el error no vuelve inútiles los registros: exige complementarlos con testimonios, dudas visibles y un modo de revisar decisiones injustas.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-04: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-04 · El recuerdo de Bao*

📖 Avance: 17/32 misiones

📜 *Escena 4/5*

Huan pregunta si un buen propósito puede justificar el Sello Inmutable. Bao responde que comprender el miedo de su antiguo compañero no equivale a darle permiso para imponerlo a todos. Las criaturas necesitarán protección frente a abusos y también una salida cuando el vínculo deje de ser justo. Ninguna de esas necesidades desaparece por nombrar la otra.
Lian deja abiertas dos páginas: una registra lo que el Archivo debe reparar; la otra, lo que es necesario impedir ahora. El grupo no tendrá que elegir entre fingir que nunca hubo daño y aceptar que nadie pueda volver a cambiar. La diferencia tendrá que sostenerse cuando el enemigo ofrezca una respuesta aparentemente más fácil.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-04: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-04 · El recuerdo de Bao*

📖 Avance: 17/32 misiones

📜 *Escena 5/5*

En la puerta del pabellón se oye el sonido de una herramienta copiando otra. El Centinela del Espejo guarda un fragmento de la Primera Carta y reproduce las técnicas más vistosas de quienes lo enfrentan. Bao reconoce su diseño, pero no promete una palabra secreta que lo desactive ni una carta rara capaz de evitar la prueba.
Huan relee la pregunta que escribió tras los tres reflejos y propone observar qué se repite. Lian conserva la carpeta con permiso de Bao. El grupo sale de la sala con información incómoda y una tarea concreta: demostrar que aprender incluye dejar de hacer lo mismo cuando la propia respuesta empieza a volverse un obstáculo.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-05: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 1/5*

🎁 +15 ChengCoins · +25 XP de Custodio
✨ Panda Guerrero: +60 XP

La terraza refleja el cielo en placas oscuras que no contienen agua. En su centro, el Centinela sostiene un Trazo entre dos brazos de piedra. A su alrededor aparecen ecos de habilidades usadas por antiguos visitantes: ninguna imagen conserva una identidad completa ni pretende reemplazar a una criatura real de tu colección.
Bao explica su función original: impedir que un Custodio confundiera una respuesta poderosa con una solución para cualquier situación. El daño de la tinta lo ha vuelto rígido, pero sus señales todavía pueden leerse. Cuando empiece a copiar, convendrá variar el ritmo y reservar la defensa para aquello que anuncie con claridad.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-05: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 2/5*

Lian revisa la copia de las tres superficies y pregunta qué llevará el grupo de esa lección. No exige una composición de daño, tanque y apoyo ni convierte la evolución en una llave. El equipo disponible puede aprender el patrón; entrenarlo ayuda a resistir errores, pero la pelea tendrá que premiar decisiones además de niveles.
Huan se ofrece a guardar las notas durante el encuentro. Si ayudaste a su orgullo en el puente, lo hace sin convertir el gesto en una deuda. Si la conversación fue más firme, recuerda el compromiso de escuchar antes de juzgar. Ambas rutas mantienen la ayuda necesaria para que el desafío sea difícil y comprensible.

🛡️ Equipo preparado: 1/3 compañeros

1. Recordar que una respuesta puede cambiar
👉 .ctuhistoria elegir 1

2. Recordar que resistir también protege
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia III-05: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 3/5*

🖋️ Lian subraya las repeticiones. El equipo entra preparado para leer qué técnica quiere devolverle el Centinela.

Antes de entrar, Lian vuelve a señalar el patrón que habéis identificado y separa lo comprobado de las suposiciones. El enemigo anunciará sus cambios y conservará una respuesta que pueda entenderse desde el propio combate. Las notas sirven para preparar una decisión, no para prometer que un nivel o una rareza permitirán ignorar todas sus señales.
Huan revisa las salidas y pide comprobar qué compañero está preparado para comenzar. Si el intento termina en derrota, esta conversación y el diario seguirán disponibles. No habrá que reconstruir todo el capítulo ni entregar otra carta para reintentar; el reto será utilizar lo aprendido sin convertir la repetición en una fuente de premios adicionales.
Lian recupera la lección que elegiste: una respuesta puede cambiar sin que el equipo pierda su identidad. Coloca en la misma página el aviso del Centinela y el momento en que deja una apertura. Huan reconoce que variar la estrategia no consiste en ejecutar movimientos distintos sin mirar qué problema necesita resolver cada uno.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-05: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 4/5*

Bao recuerda el motivo de la prueba: recuperar una parte de la memoria común sin repetir la idea de que vencer concede un derecho absoluto sobre ella. Las criaturas toman posición con sus nombres, rasgos e historias conservados. Su identidad no será reemplazada por el resultado, aunque una victoria añada otro hito al camino que siguen recorriendo.
El grupo deja de discutir para que el aviso del enemigo pueda ocupar el centro de la siguiente página. Lian guardará la información del encuentro y Ren o Huan mantendrán el acceso necesario para retirarse. Lo que viene puede exigir más de un intento; la dificultad se sostendrá en sus señales y en tus respuestas, no en un castigo oculto por haber llegado hasta aquí.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-05: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

El Centinela imita un gesto de tu compañero y deja la copia suspendida antes de descargarla. Su movimiento anuncia lo que prepara; no es una orden de atacar siempre con la técnica más fuerte. Bao permanece al borde de la terraza y recuerda que retirarse a entrenar o reintentar después de perder no borrará el avance del viaje.
El tercer Trazo sigue bajo custodia de la construcción. Para recuperarlo habrá que superar una prueba real: alternar herramientas, reconocer la copia y defender cuando corresponda. Huan guarda silencio durante el turno para que la señal del enemigo y las opciones disponibles ocupen el lugar central del mensaje.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 130/130 HP
🛡️ Escudo 12

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▓▓ 240/240 HP

⚠️ *SEÑAL ENEMIGA*
La tinta prepara un golpe rápido: el enemigo no dejará de presionarte.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Impacto del Panda: 39 de daño a Centinela del Espejo.
Centinela del Espejo usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 130/130 HP
🛡️ Escudo 3

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▓▒ 201/240 HP
Reflejo activo

⚠️ *SEÑAL ENEMIGA*
🪞 El Centinela copiará tu última habilidad. Defiende o cambia de estrategia antes de repetirla.

🧩 🪞 Copiará Impacto del Panda. Defiende la réplica. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Réplica de Impacto del Panda: 8 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 122/130 HP

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▒▒ 185/240 HP
Descarga preparada
🛡️ Escudo 12

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Descarga del vínculo: 24 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 98/130 HP

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▒▒ 169/240 HP
Defensas abiertas
🛡️ Escudo 12

⚠️ *SEÑAL ENEMIGA*
Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T6*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Réplica de Impacto del Panda: 11 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 87/130 HP

👁️ *Centinela del Espejo*
▓▓▓▓▓▒▒▒▒▒ 114/240 HP
Tinta en concentración
🛡️ Escudo 12

⚠️ *SEÑAL ENEMIGA*
⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: derrota guardada y reintento

```text
🃏 *CHENGDÚ CARDS | HISTORIA | DERROTA*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Descarga del vínculo: 26 de daño a Panda Guerrero.
Panda Guerrero queda fuera de combate.
Tu equipo cae bajo la presión. Conservas tus cartas y monedas; revisa la señal y prepara el siguiente intento.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▒▒▒▒▒▒▒▒▒▒ 0/130 HP

👁️ *Centinela del Espejo*
▓▒▒▒▒▒▒▒▒▒ 15/240 HP

🌧️ *Esta vez la expedición cayó.*
Tu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.

💡 Observa la señal enemiga: defender antes de un golpe cargado puede cambiar el combate. Prepara tu equipo y vuelve a intentarlo.

🔁 *.ctuhistoria reintentar*
🛡️ Preparar: .ctuequipo
🔎 Pista: .ctuhistoria pista
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 130/130 HP
🛡️ Escudo 12

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▓▓ 240/240 HP

⚠️ *SEÑAL ENEMIGA*
La tinta prepara un golpe rápido: el enemigo no dejará de presionarte.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Impacto del Panda: 39 de daño a Centinela del Espejo.
Centinela del Espejo usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 130/130 HP
🛡️ Escudo 3

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▓▒ 201/240 HP
Reflejo activo

⚠️ *SEÑAL ENEMIGA*
🪞 El Centinela copiará tu última habilidad. Defiende o cambia de estrategia antes de repetirla.

🧩 🪞 Copiará Impacto del Panda. Defiende la réplica. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Réplica de Impacto del Panda: 8 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 122/130 HP

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▒▒ 185/240 HP
Descarga preparada
🛡️ Escudo 12

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Descarga del vínculo: 24 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 98/130 HP

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▒▒ 169/240 HP
Defensas abiertas
🛡️ Escudo 12

⚠️ *SEÑAL ENEMIGA*
Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T6*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Réplica de Impacto del Panda: 11 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 87/130 HP

👁️ *Centinela del Espejo*
▓▓▓▓▓▒▒▒▒▒ 114/240 HP
Tinta en concentración
🛡️ Escudo 12

⚠️ *SEÑAL ENEMIGA*
⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Impacto del Panda: 39 de daño a Centinela del Espejo.
Centinela del Espejo usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 130/130 HP
🛡️ Escudo 3

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▓▒ 201/240 HP
Reflejo activo

⚠️ *SEÑAL ENEMIGA*
🪞 El Centinela copiará tu última habilidad. Defiende o cambia de estrategia antes de repetirla.

🧩 🪞 Copiará Impacto del Panda. Defiende la réplica. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia III-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-05 · Centinela del Espejo*

📖 Avance: 18/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Réplica de Impacto del Panda: 7 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 123/130 HP

👁️ *Centinela del Espejo*
▓▓▓▓▓▓▓▓▒▒ 185/240 HP
Descarga preparada
🛡️ Escudo 12

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🪞 Guarda la última habilidad destacada y la devolverá. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia IV-01: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-01 · Dos estandartes*

📖 Avance: 19/32 misiones

📜 *Escena 1/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Centinela del Espejo usó Descarga del vínculo: 22 de daño a Panda Guerrero.
La respuesta del vínculo causa 15 de daño al enemigo.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🖋️ La última copia se detiene sin encontrar un movimiento que repetir. Las placas vuelven a reflejar el cielo y el Centinela baja los brazos. Lian recibe el Tercer Trazo con ambas manos, registra de dónde procede y lee una frase que completa parte de la Primera Carta: «Un vínculo sin elección no es un vínculo».
Bao reconoce que esa frase estuvo disponible para su orden durante generaciones. El problema nunca fue únicamente perder un documento; también consistió en decidir qué significaba cuando resultaba incómodo. Huan guarda una copia en su tablilla y admite que entrenar puede incluir escuchar algo que no cabe en el orgullo de una victoria.
El descanso junto al pabellón devuelve a la conversación asuntos pequeños: Tao revisa el paquete vacío, las criaturas se apartan del ruido y Lian ordena las páginas para que ninguna noticia borre lo ocurrido antes. Bao agradece que el grupo continúe exigiéndole claridad. La victoria no resuelve todavía la responsabilidad del Archivo.
En el camino de regreso aparecen mensajeros con estandartes distintos. Dos Casas del Bambú se acusan de robar registros durante la crisis y han cerrado una plaza a quienes no muestran sus colores. El siguiente Trazo no espera en otra montaña: está en una ciudad que empieza a confundir pertenecer con tener derecho a recibir ayuda.

🎁 +60 ChengCoins · +60 XP de Custodio
✨ Panda Guerrero: +220 XP · 🌱 Nv. 7
🧩 2 fragmentos · 1 esencia
📜 Recuerdo: El reflejo que escucha

Dos estandartes dividen la plaza y dejan un pasillo demasiado estrecho para los carros de provisiones. El comandante Ren intenta mantener abiertos los accesos mientras representantes de ambas Casas enumeran páginas desaparecidas. Ninguna consigue explicar por qué algunos registros que conservan sus sellos también han perdido los nombres.
Mei ha colocado agua junto a la entrada sin preguntar por afiliación. Tao lleva recados entre lados que se niegan a conversar directamente. Ren solicita escuchar las dos versiones antes de señalar culpables; puedes decidir por dónde empezar, pero ninguna Casa obtendrá por ello el derecho exclusivo a ser considerada parte de la ciudad.

🛡️ Equipo preparado: 1/3 compañeros

1. Escuchar primero a la Casa del Patio
👉 .ctuhistoria elegir 1

2. Escuchar primero a la Casa del Sendero
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia IV-01: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-01 · Dos estandartes*

📖 Avance: 19/32 misiones

📜 *Escena 2/5*

🖋️ La Casa del Patio presenta sus entregas pendientes. Ren asegura que después habrá el mismo espacio para la otra versión.

La primera representante cuenta que varias criaturas dejaron de responder a los nombres de sus antiguos registros. Sus Custodios temen que una Casa rival esté reuniendo vínculos para ganar influencia. Lian solicita fechas y testimonios: comprende el miedo, pero distingue una pérdida comprobada de la explicación que alguien ha construido alrededor.
Huan pregunta quién protegió las entregas durante el cierre de la plaza y descubre que ambas Casas recurrieron a los mismos mensajeros. Tao enseña sus recibos sin convertir la consulta en una obligación de exhibir datos privados de jugadores reales. Esta disputa pertenece a la narración, no a una inspección pública de conversaciones ajenas.
La Casa del Patio agradece que hayas comenzado por sus entregas pendientes y acepta colocar sus copias junto a las de la otra parte. Ren recuerda el compromiso de dar el mismo tiempo a sus vecinos. Escuchar primero no concederá a esa versión una autoridad que no pueda revisarse cuando aparezca información nueva.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-01: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-01 · Dos estandartes*

📖 Avance: 19/32 misiones

📜 *Escena 3/5*

La otra Casa conserva hojas con daños equivalentes y acusa a sus vecinos utilizando casi las mismas palabras. Ren separa los estandartes para que se vean los dos grupos sin una pared entre ellos. Bao señala una marca conocida junto a los sellos: la tinta parece aprovechar la desconfianza, no respetar las fronteras de cada asociación.
Mei invita a las representantes a revisar una entrega que llegó a su casa de té antes del cierre. El registro demuestra que los nombres comenzaron a borrarse durante el mismo periodo. No absuelve por arte de magia todos los conflictos anteriores, pero sí impide usar esta crisis como prueba automática de que los demás deben ser enemigos.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-01: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-01 · Dos estandartes*

📖 Avance: 19/32 misiones

📜 *Escena 4/5*

Ren propone abrir un acceso común para atender a quienes han quedado entre las barreras. Algunas voces quieren esperar a decidir qué Casa dirigirá el operativo. Lian recuerda que las criaturas y los vecinos no han dejado de necesitar ayuda mientras se discute quién recibirá el reconocimiento por ofrecerla.
Puedes apoyar una mesa compartida de testimonios o un grupo mixto que revise primero los accesos. Las dos opciones reparten responsabilidad sin exigir que tu cuenta pertenezca a un clan. Las Casas del relato seguirán existiendo para todos; una afiliación real puede dar contexto a la participación, pero nunca decide quién tiene permitido continuar.

🛡️ Equipo preparado: 1/3 compañeros

1. Abrir una mesa compartida de testimonios
👉 .ctuhistoria elegir 1

2. Revisar los accesos con un grupo mixto
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia IV-01: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-01 · Dos estandartes*

📖 Avance: 19/32 misiones

📜 *Escena 5/5*

🖋️ Lian coordina las copias y ambas Casas presentan sus dudas en la misma mesa. Ren registra quién deberá responder a cada petición.

Al retirar una barrera, un golpe de campana corta las conversaciones. La vibración no procede de la torre del Archivo: nace de un artefacto cubierto de tinta en el pabellón central. Las voces se vuelven más ásperas y pequeños Ecos empiezan a golpear tablillas que antes apenas llamaban su atención.
Ren ordena despejar la plaza sin cargar contra las criaturas confundidas. Mei señala los puestos donde quedan personas y Yun pide tiempo para sacar un tejido que contiene nombres todavía legibles. La investigación deberá esperar unos turnos: antes de discutir el origen del conflicto hay que impedir que termine atrapando a quienes no lo eligieron.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-02: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 1/5*

🎁 +15 ChengCoins · +25 XP de Custodio
✨ Panda Guerrero: +60 XP

Ren divide el rescate en tres recorridos cortos para que nadie pierda de vista su siguiente tarea. Tao debe cruzar con los registros de entrega, Mei mantiene un refugio junto a la fuente y Yun necesita retirar un tejido antes de que la tinta alcance sus bordes. Las tres personas toman decisiones propias durante la evacuación.
El equipo no tiene que esperar a que otros jugadores se conecten. Huan y Bao acompañan a quienes no estarán en tu encuentro inmediato, mientras Lian registra las salidas seguras. Entre desafíos podrás preparar de nuevo a tus compañeros; superar una serie no significa arrastrar una derrota punitiva de un combate al siguiente.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-02: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 2/5*

Tao descubre que el pasillo más ancho termina en una puerta cerrada y cambia la ruta antes de que los demás lo sigan. Un Eco bloquea el acceso alternativo, atraído por los sellos de la carga. El mensajero deja el paquete a salvo y pide que le abran tiempo para retirar el último carro, no que peleen en su lugar para demostrar valor.
Lian señala las salidas y Bao aparta a una criatura asustada de la trayectoria del combate. El enemigo anuncia su ofensiva con el movimiento de la tinta. Tu tarea es contenerlo el tiempo suficiente para que el recorrido vuelva a quedar libre; una victoria abre paso a Tao y la siguiente escena mostrará qué pudo hacer con esa oportunidad.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-02: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 2/5*

Panda Guerrero usó Golpe de Bambú: 31 de daño a Eco de la Plaza · Tao.
Eco de la Plaza · Tao usó Presión de tinta: 6 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/132 HP

👁️ *Eco de la Plaza · Tao*
▓▓▓▓▓▓▒▒▒▒ 77/150 HP
Protección

⚠️ *SEÑAL ENEMIGA*
🛡️ ¡Protege al equipo y a los aliados de la descarga dirigida!

🧩 🛡️ Seguridad del aliado: 76/100. Proteger evita la próxima presión sobre él. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria proteger · Protege a tus aliados

💾 El turno se conserva al salir.
```

## Historia IV-02: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 3/5*

Panda Guerrero usó Golpe de Bambú: 4 de daño a Eco de la Plaza · Tao.
Eco de la Plaza · Tao queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

Con el pasaje despejado, Tao guía a los carros hacia Ren y vuelve para avisar a Mei. Ella ya ha convertido las mesas de la fuente en señales de orientación y atiende a vecinos de ambas Casas. Un segundo Eco se agita al oír la campana; Mei pide conservar una salida para que las criaturas puedan retirarse cuando se disipe la confusión.
Huan sostiene una barrera de madera que protege a quienes esperan, sin utilizarla para encerrar al enemigo. El siguiente encuentro también permite reintentar sin perder las provisiones del relato. Lee la señal del turno y mantén al equipo preparado: golpear sin mirar podría agotar una habilidad antes de que aparezca la apertura necesaria.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-02: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 3/5*

Panda Guerrero usó Golpe de Bambú: 30 de daño a Eco de la Plaza · Mei.
Eco de la Plaza · Mei usó Presión de tinta: 6 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/132 HP

👁️ *Eco de la Plaza · Mei*
▓▓▓▓▓▓▒▒▒▒ 94/165 HP
Protección

⚠️ *SEÑAL ENEMIGA*
🛡️ ¡Protege al equipo y a los aliados de la descarga dirigida!

🧩 🛡️ Seguridad del aliado: 76/100. Proteger evita la próxima presión sobre él. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria proteger · Protege a tus aliados

💾 El turno se conserva al salir.
```

## Historia IV-02: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 4/5*

Panda Guerrero usó Golpe de Bambú: 22 de daño a Eco de la Plaza · Mei.
Eco de la Plaza · Mei queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

Mei conduce a los vecinos hasta la ruta de Tao mientras Yun descuelga el tejido del pabellón. La restauradora localiza una costura reforzada y evita arrancar la pieza del marco. Un tercer Eco se interpone entre ella y la salida; Lian comprueba que el registro de nombres permanece legible y prepara una cubierta para transportarlo.
Bao insiste en que nadie necesita destruir el pabellón para resolver la evacuación. Yun marca el punto por el que moverá el bastidor cuando el acceso quede libre. El desafío conserva un objetivo sencillo: superar la amenaza que anuncia el enemigo y permitir que la restauradora termine su trabajo con las personas y los nombres a salvo.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-02: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 4/5*

Panda Guerrero usó Golpe de Bambú: 30 de daño a Eco de la Plaza · Yun.
Eco de la Plaza · Yun usó Presión de tinta: 6 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/132 HP

👁️ *Eco de la Plaza · Yun*
▓▓▓▓▓▓▓▒▒▒ 109/180 HP
Protección

⚠️ *SEÑAL ENEMIGA*
🛡️ ¡Protege al equipo y a los aliados de la descarga dirigida!

🧩 🛡️ Seguridad del aliado: 76/100. Proteger evita la próxima presión sobre él. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria proteger · Protege a tus aliados

💾 El turno se conserva al salir.
```

## Historia IV-02: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-02 · La plaza cerrada*

📖 Avance: 20/32 misiones

📜 *Escena 5/5*

🛡️ Proteges el vínculo y a los aliados sin detener la presión enemiga.
Eco de la Plaza · Yun usó Descarga del vínculo: 13 de daño a Panda Guerrero.
La respuesta del vínculo causa 7 de daño al enemigo.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

Tao comprueba que todos los carros llegaron, Mei vuelve a repartir agua y Yun extiende el tejido bajo un techo provisional. Cada rescate dejó una tarea completada por la persona que recibió ayuda. Ren evita atribuir la operación a una sola Casa y registra los nombres de quienes mantuvieron abiertas las rutas durante la confusión.
El descanso permite que las criaturas recuperen su paso y que el grupo observe la plaza desde fuera del ruido. La campana continúa activa, pero ya no tiene a toda la población atrapada alrededor. Antes de enfrentarla, las Casas deberán decidir qué pueden construir juntas para que la siguiente crisis no encuentre las mismas puertas cerradas.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-03: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-03 · Pactos de bambú*

📖 Avance: 21/32 misiones

📜 *Escena 1/5*

🎁 +35 ChengCoins · +45 XP de Custodio
✨ Panda Guerrero: +180 XP
🧩 1 fragmento

El pabellón que guardaba las listas de refugios ha perdido un costado, aunque sus columnas todavía pueden sostener un techo ligero. Ren propone restaurarlo antes de reabrir la plaza. Servirá para recibir testimonios, guardar copias y distribuir ayuda sin obligar a cada vecino a explicar primero a qué asociación pertenece.
Las Casas pueden colaborar mediante aportes de trabajo realizados en momentos distintos. Un Custodio que llega solo también puede completar una tarea equivalente con Bao, Tao y los vecinos. Esta elección no retira monedas o materiales de la cuenta: cualquier contribución real del sistema mantiene sus controles y su reconocimiento visible.
La mesa de testimonios que ayudaste a organizar conserva las primeras solicitudes recibidas durante el cierre. Ahora Lian puede mostrar qué necesita el nuevo pabellón y a quién le falta una respuesta. El acuerdo empieza a construir una continuidad entre escuchar una petición y comprobar que alguien se ha encargado de atenderla.

🛡️ Equipo preparado: 1/3 compañeros

1. Coordinar el trabajo con la comunidad
👉 .ctuhistoria elegir 1

2. Preparar una ruta individual con aliados
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia IV-03: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-03 · Pactos de bambú*

📖 Avance: 21/32 misiones

📜 *Escena 2/5*

🖋️ Ren abre una lista común de tareas. Los aportes pueden llegar de forma asíncrona; nadie necesita esperar una reunión de todos los jugadores.

Yun distingue las tablillas que necesitan reparación de las que sólo deben secarse. Tao coloca rutas de entrega en una pared accesible y Mei organiza un espacio para quienes no quieren hablar delante de una multitud. Cada parte del pabellón responde a una necesidad concreta que faltaba en la primera versión del proyecto.
La tarea de tu Custodio consiste en revisar que una petición pueda entrar, quedar registrada y recibir respuesta sin perderse entre oficinas. Es trabajo compartido aunque se realice en solitario con aliados narrativos. Ren registra el aporte una sola vez; repetir esta escena no producirá más monedas, XP o materiales.

🛡️ Equipo preparado: 1/3 compañeros

🤝 Participa en la reconstrucción del pabellón.

👉 *.ctuhistoria aportar*
📖 .ctudiario historia
```

## Historia IV-03: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-03 · Pactos de bambú*

📖 Avance: 21/32 misiones

📜 *Escena 3/5*

🖋️ Has reconstruido tu parte del pabellón. El camino individual conserva la misma progresión.

🤝 *Aportación guardada*
La ruta individual conserva la misma progresión principal.

Huan encuentra dos listas de ayuda que repiten a las mismas familias con nombres distintos. Lian propone comprobarlas sin exponer el contenido privado de sus solicitudes. Las Casas empiezan a comprender que un registro compartido necesita reglas de acceso y revisión, no solamente una puerta abierta y una promesa de buena voluntad.
Bao pregunta qué regla debería quedar visible junto a la entrada. Puedes destacar el derecho a recibir respuesta o el derecho a corregir un registro equivocado. Las dos opciones formarán parte del acuerdo; la elección señala cuál defenderás primero cuando la discusión sobre el futuro del Archivo deje de ser una posibilidad lejana.

🛡️ Equipo preparado: 1/3 compañeros

1. Toda petición merece una respuesta
👉 .ctuhistoria elegir 1

2. Todo registro debe poder corregirse
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia IV-03: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-03 · Pactos de bambú*

📖 Avance: 21/32 misiones

📜 *Escena 4/5*

🖋️ Ren anota un responsable y una forma de volver a consultar cada solicitud. Nadie debería desaparecer detrás de un trámite sin nombre.

Al terminar el techo, algunas criaturas se acercan a escuchar sin mostrar una carta. Mei les deja sitio y Lian evita interpretar su silencio como consentimiento. El pabellón no resolverá todos los daños del Archivo, pero ofrece una primera prueba de que la protección puede ampliarse sin encerrar a quienes pretende ayudar.
Ren cuenta los aportes de las Casas y los de Custodios independientes en el mismo registro público de tareas, con el mismo valor para la reconstrucción principal. La organización elegida cambia quién te acompañó y lo que recuerdan del trabajo; no convierte a los jugadores solitarios en visitantes de segunda categoría.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-03: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-03 · Pactos de bambú*

📖 Avance: 21/32 misiones

📜 *Escena 5/5*

Una persona espera fuera del pabellón con el símbolo del Sello dibujado en una tela. No ha venido a sabotear el refugio: busca noticias de una criatura que perdió durante una disputa. Ren pide a los guardias que mantengan distancia y Mei ofrece un banco antes de que otra discusión vuelva a cerrar la entrada.
Bao reconoce que el Archivista no reunió seguidores sólo mediante amenazas. Algunos encontraron en su promesa una respuesta al daño que nadie quiso revisar. Escucharlos no obliga a aceptar su solución, pero ignorarlos dejaría intacta parte de la razón por la que el Sello sigue pareciendo una esperanza para quienes no han recibido otra.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-04 · Voces del Sello*

📖 Avance: 22/32 misiones

📜 *Escena 1/5*

🎁 +20 ChengCoins · +30 XP de Custodio
✨ Panda Guerrero: +70 XP
🧩 1 fragmento

La visitante se presenta como cuidadora de una criatura cuyo registro cambió durante una disputa. Conserva una copia incompleta y varias respuestas que la enviaron de una oficina a otra. Lian distingue lo comprobable de lo que aún debe investigar, sin pedirle que convierta su dolor en una prueba perfecta para merecer atención.
Otras dos personas permanecen junto al símbolo del Sello. Una teme volver a separarse de su compañero; la otra cree que inmovilizar todos los vínculos evitaría que alguien pudiera volver a lucrar con una despedida injusta. Sus razones describen daños reales dentro del relato y una solución que también necesita ser examinada.

🛡️ Equipo preparado: 1/3 compañeros

1. Escuchar los testimonios antes de responder
👉 .ctuhistoria elegir 1

2. Concentrarse primero en detener el artefacto
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia IV-04: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-04 · Voces del Sello*

📖 Avance: 22/32 misiones

📜 *Escena 2/5*

🖋️ Lian prepara copias para investigar y Bao escucha sin corregir cada frase. El grupo podrá recordar estos casos al discutir con el Archivista.

Mei mantiene el banco disponible mientras Ren garantiza que las peticiones lleguen al pabellón. Los casos no desaparecen si tu Custodio decide concentrarse en otra tarea. La comunidad tendrá que investigarlos y reparar lo que corresponda después de detener la crisis; vencer a un antagonista no convierte en falsas las experiencias que utilizó para conseguir apoyo.
Bao señala un límite del Sello: impediría tanto una transferencia abusiva como la salida voluntaria de un vínculo injusto. Una criatura que quisiera marcharse tampoco podría hacerlo. La pregunta no consiste en escoger entre libertad y cuidado, sino en construir una protección que no elimine la voz de quienes necesitan ambas cosas.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-04: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-04 · Voces del Sello*

📖 Avance: 22/32 misiones

📜 *Escena 3/5*

Huan pregunta qué promesa puede ofrecer el grupo sin repetir el error de asegurar una solución inmediata. Lian propone comprometer trabajo verificable: conservar fuentes, revisar los casos y permitir apelaciones. La visitante no tiene por qué agradecer antes de saber si esas acciones llegarán a realizarse.
Puedes destacar el derecho de las criaturas a hablar sobre sus vínculos o la obligación del Archivo de responder cuando sus reglas han causado daño. La otra parte seguirá incluida en el acuerdo. Lo que cambie será la frase que tu Custodio llevará después ante alguien convencido de que sólo una prohibición absoluta puede impedir una nueva pérdida.

🛡️ Equipo preparado: 1/3 compañeros

1. Defender la voz de cada criatura
👉 .ctuhistoria elegir 1

2. Exigir responsabilidad al Archivo
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia IV-04: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-04 · Voces del Sello*

📖 Avance: 22/32 misiones

📜 *Escena 4/5*

🖋️ Bao guarda la frase: escuchar también exige permitir una respuesta distinta de la que el guardián esperaba oír.

La tela del Sello permanece sobre el banco, ahora junto a una copia de la petición y un medio para consultar su avance. Ren rechaza usarla como prueba automática de hostilidad. Varias personas deciden quedarse en el refugio; otras todavía apoyan al Archivista. La conversación cambia el espacio disponible sin fingir que una frase resuelve de inmediato todas las posiciones.
Huan reconoce que comprender una razón no obliga a aceptarla como respuesta universal. Mei cierra la caja de testimonios con una lista de quiénes pueden consultar cada documento. Las palabras sobre proteger identidades empiezan a tomar la forma menos espectacular, y más exigente, de procedimientos que puedan corregirse cuando fallen.
Ren aplica la regla que destacaste en el pabellón: cada petición conserva una persona responsable y una manera de volver a preguntar. La visitante puede consultar lo que ocurra después sin tener que empezar de nuevo su relato ante cada puerta. El acuerdo comienza a medirse por una respuesta que todavía deberá sostenerse.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-04: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-04 · Voces del Sello*

📖 Avance: 22/32 misiones

📜 *Escena 5/5*

La campana del pabellón central vuelve a golpear y dos representantes interrumpen el trabajo para acusarse de esconder información. Lian comprueba que ambas leen la misma copia, pero oyen la voz de su rival como una amenaza. La tinta amplifica la tensión y convierte cada respuesta precipitada en otra razón para seguir atacando.
Bao pide dejar las peticiones bajo cuidado de Mei y señala el centro de la plaza. La Campana del Conflicto no se vencerá alimentando indefinidamente el ruido que produce. El grupo ha aprendido a detenerse para escuchar; ahora tendrá que sostener ese ritmo dentro de un combate que castiga precisamente la prisa por golpear.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-05: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 1/5*

🎁 +20 ChengCoins · +30 XP de Custodio
✨ Panda Guerrero: +60 XP

La Campana del Conflicto cuelga de una estructura cubierta de tinta que vibra incluso cuando nadie la toca. A su alrededor, cada ataque directo parece dejar otra marca en el metal. Ren ordena retirar a las Casas del círculo para que la pelea no se convierta en una competencia por atribuirse el golpe que hará callar la plaza.
Lian identifica la señal que anuncia una descarga y un patrón distinto cuando la tensión se concentra. Defender o aliviar el ritmo permitirá controlar lo que el artefacto acumula. Bao explica la mecánica antes de entrar: no habrá una penalización escondida por intentar aprender, pero atacar sin descanso alimentará justamente la fuerza del enemigo.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-05: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 2/5*

Las dos Casas deben mantener abierto el acceso mientras tu equipo entra al círculo. Una representante propone llevar sólo su estandarte al pabellón para demostrar unidad bajo su dirección. Ren rechaza que la ayuda dependa de aceptar un símbolo común impuesto. La tregua debe permitir que las diferencias sigan existiendo sin convertirse en una excusa para cerrar el paso.
Huan recuerda el puente y pregunta qué señal usarán para retirarse si el combate sale mal. La decisión no cambia a escondidas las estadísticas ni compra una victoria: deja establecido si el refugio se organizará alrededor de una tarea compartida o de turnos de responsabilidad que ninguna Casa pueda controlar para siempre.

🛡️ Equipo preparado: 1/3 compañeros

1. Mantener una tarea común entre las Casas
👉 .ctuhistoria elegir 1

2. Rotar responsabilidades bajo supervisión
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia IV-05: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 3/5*

🖋️ Ren distribuye la protección de los accesos. El acuerdo se sostendrá mientras cada Casa cumpla su parte, sin exigir que renuncie a su nombre.

Antes de entrar, Lian vuelve a señalar el patrón que habéis identificado y separa lo comprobado de las suposiciones. El enemigo anunciará sus cambios y conservará una respuesta que pueda entenderse desde el propio combate. Las notas sirven para preparar una decisión, no para prometer que un nivel o una rareza permitirán ignorar todas sus señales.
Huan revisa las salidas y pide comprobar qué compañero está preparado para comenzar. Si el intento termina en derrota, esta conversación y el diario seguirán disponibles. No habrá que reconstruir todo el capítulo ni entregar otra carta para reintentar; el reto será utilizar lo aprendido sin convertir la repetición en una fuente de premios adicionales.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-05: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 4/5*

Bao recuerda el motivo de la prueba: recuperar una parte de la memoria común sin repetir la idea de que vencer concede un derecho absoluto sobre ella. Las criaturas toman posición con sus nombres, rasgos e historias conservados. Su identidad no será reemplazada por el resultado, aunque una victoria añada otro hito al camino que siguen recorriendo.
El grupo deja de discutir para que el aviso del enemigo pueda ocupar el centro de la siguiente página. Lian guardará la información del encuentro y Ren o Huan mantendrán el acceso necesario para retirarse. Lo que viene puede exigir más de un intento; la dificultad se sostendrá en sus señales y en tus respuestas, no en un castigo oculto por haber llegado hasta aquí.
Ren confirma que las Casas mantienen las tareas comunes que propusiste antes de entrar. Los accesos siguen bajo cuidado de grupos distintos y ninguna enseña ocupa todo el pabellón. La cooperación continuará siendo visible incluso durante una pelea en la que el ruido intenta convencer a cada representante de que sólo su propia gente puede protegerla.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-05: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

El metal devuelve un eco de los primeros golpes y la tinta empieza a reunir tensión. Observa el aviso del enemigo y las acciones disponibles antes de escoger la siguiente respuesta. Huan y Ren mantendrán libres las salidas; si caes, podrás reintentar con tu colección intacta y revisar qué decisión alimentó la descarga.
Las criaturas no necesitan pertenecer a una rareza o una Casa determinada para superar el artefacto. Una habilidad poderosa utilizada en el momento equivocado puede prolongar el peligro. El desafío exige alternar el ritmo y conservar al equipo, la misma idea que resultó difícil sostener cuando la discusión llenó toda la plaza.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 132/132 HP
🛡️ Escudo 12

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▓ 290/290 HP

⚠️ *SEÑAL ENEMIGA*
La tinta prepara un golpe rápido: el enemigo no dejará de presionarte.

🧩 🔔 Tensión: 0/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Impacto del Panda: 38 de daño a Campana del Conflicto.
Campana del Conflicto usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 132/132 HP
🛡️ Escudo 3

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▒ 252/290 HP
Tinta en concentración

⚠️ *SEÑAL ENEMIGA*
⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.

🧩 🔔 Tensión: 3/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

✨ Purificas la tinta y recuperas el control del vínculo.
Campana del Conflicto usó Hostigamiento de carga: 6 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▒ 252/290 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🔔 Tensión: 0/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Campana del Conflicto usó Descarga del vínculo: 24 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 102/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▒ 236/290 HP
Defensas abiertas

⚠️ *SEÑAL ENEMIGA*
Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.

🧩 🔔 Tensión: 0/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T6*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Golpe de Bambú: 27 de daño a Campana del Conflicto.
Campana del Conflicto usó Presión de tinta: 12 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 90/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▒▒▒▒ 159/290 HP
Tensión de la Campana

⚠️ *SEÑAL ENEMIGA*
🔔 Tensión crítica. Purifica antes de que la Campana descargue toda la hostilidad.

🧩 🔔 Tensión: 5/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia IV-05: derrota guardada y reintento

```text
🃏 *CHENGDÚ CARDS | HISTORIA | DERROTA*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

Panda Guerrero recupera 29 HP.
Campana del Conflicto usó Presión de tinta: 37 de daño a Panda Guerrero.
Panda Guerrero queda fuera de combate.
Tu equipo cae bajo la presión. Conservas tus cartas y monedas; revisa la señal y prepara el siguiente intento.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▒▒▒▒▒▒▒▒▒▒ 0/132 HP

👁️ *Campana del Conflicto*
▓▒▒▒▒▒▒▒▒▒ 27/290 HP

🌧️ *Esta vez la expedición cayó.*
Tu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.

💡 Observa la señal enemiga: defender antes de un golpe cargado puede cambiar el combate. Prepara tu equipo y vuelve a intentarlo.

🔁 *.ctuhistoria reintentar*
🛡️ Preparar: .ctuequipo
🔎 Pista: .ctuhistoria pista
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 132/132 HP
🛡️ Escudo 12

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▓ 290/290 HP

⚠️ *SEÑAL ENEMIGA*
La tinta prepara un golpe rápido: el enemigo no dejará de presionarte.

🧩 🔔 Tensión: 0/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T2*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Impacto del Panda: 38 de daño a Campana del Conflicto.
Campana del Conflicto usó Presión de tinta: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 132/132 HP
🛡️ Escudo 3

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▒ 252/290 HP
Tinta en concentración

⚠️ *SEÑAL ENEMIGA*
⚠️ Carga una descarga y te hostiga mientras la prepara. La próxima señal exigirá defensa.

🧩 🔔 Tensión: 3/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

✨ Purificas la tinta y recuperas el control del vínculo.
Campana del Conflicto usó Hostigamiento de carga: 6 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▒ 252/290 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🔔 Tensión: 0/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
Campana del Conflicto usó Descarga del vínculo: 24 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 102/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▒ 236/290 HP
Defensas abiertas

⚠️ *SEÑAL ENEMIGA*
Su defensa cae, pero sigue atacando. Aprovecha la apertura sin descuidar tu vida.

🧩 🔔 Tensión: 0/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T6*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Golpe de Bambú: 27 de daño a Campana del Conflicto.
Campana del Conflicto usó Presión de tinta: 12 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 90/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▒▒▒▒ 159/290 HP
Tensión de la Campana

⚠️ *SEÑAL ENEMIGA*
🔔 Tensión crítica. Purifica antes de que la Campana descargue toda la hostilidad.

🧩 🔔 Tensión: 5/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

✨ Purificas la tinta y recuperas el control del vínculo.
Campana del Conflicto usó Hostigamiento de carga: 5 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 127/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▓▓▓▒ 252/290 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🔔 Tensión: 0/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia IV-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T6*
━━━━━━━━━━━━━━
🎋 *Capítulo IV · Las Casas Divididas*
📍 *IV-05 · Campana del Conflicto*

📖 Avance: 23/32 misiones

📜 *Escena 5/5*

Panda Guerrero usó Golpe de Bambú: 27 de daño a Campana del Conflicto.
Campana del Conflicto usó Presión de tinta: 5 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▒▒ 100/132 HP

👁️ *Campana del Conflicto*
▓▓▓▓▓▓▒▒▒▒ 159/290 HP
Tensión de la Campana

⚠️ *SEÑAL ENEMIGA*
🔔 Tensión crítica. Purifica antes de que la Campana descargue toda la hostilidad.

🧩 🔔 Tensión: 5/6. Purificar reduce 3 y defender reduce 1. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-01: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 1/9*

Panda Guerrero usó Impacto del Panda: 50 de daño a Campana del Conflicto.
Campana del Conflicto queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🖋️ La campana se detiene con una vibración breve y deja caer la tinta como si el metal recuperara su peso verdadero. Yun encuentra el Cuarto Trazo dentro del soporte y verifica que puede retirarlo sin dañar los registros del pabellón. Ren permite que ambas Casas presencien la entrega y que Lian documente su procedencia.
Las representantes no se convierten de inmediato en amigas, pero aceptan una tregua y un trabajo común de reparación. Mei devuelve las peticiones a la mesa y recuerda que siguen pendientes. La victoria se reconoce por las rutas abiertas y las voces que pueden volver a escucharse, además de por la desaparición de un enemigo.
Bao reúne los cuatro Trazos y explica dónde se construyó el primer Archivo, antes de que la institución creciera alrededor de sus copias. El Archivista conoce esa sala porque trabajó allí con él. El mentor no guarda la ubicación para decidir cuándo estará preparado el grupo: comparte el mapa y acepta las preguntas que su antiguo silencio provoca.
Ren mantendrá las Casas fuera de una guerra por el control del hallazgo. Mei y Yun conservarán los testimonios mientras Tao organiza el regreso de los registros a sus lugares. El viaje final comienza con una comunidad que todavía discute, pero dispone de más formas de hacerlo que cerrar una puerta o inmovilizar un vínculo.

🎁 +65 ChengCoins · +65 XP de Custodio
✨ Panda Guerrero: +230 XP
🧩 2 fragmentos · 1 esencia
📜 Recuerdo: Dos estandartes, un refugio

El Archivo Original se encuentra detrás de un patio que las ampliaciones habían convertido en un lugar de paso. No hay un paisaje destruido por completo: algunas plantas siguen creciendo entre las losas y una puerta conserva reparaciones de distintas épocas. Bao muestra dónde trabajaba antes de que las oficinas empezaran a confundir su historia con la de toda la ciudad.
Lian coloca copias de los cuatro Trazos sobre una mesa de lectura. Los originales conservan su procedencia y no se consumen al resolver la entrada. La puerta reconoce una secuencia de ideas, no una suma de cartas raras o de propietarios prestigiosos. Las pistas necesarias ya forman parte de las páginas del diario que el grupo puede volver a consultar.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-01: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 2/9*

Las marcas de la puerta representan memoria, autenticidad, elección y responsabilidad compartida. Cada una procede de una parte del viaje y ninguna basta por separado. La memoria sin revisión puede conservar un error; una elección sin cuidado puede dejar a alguien desprotegido. Huan sujeta las copias para que el viento no decida su orden por accidente.
Puedes comenzar la lectura por la identidad de las criaturas o por las responsabilidades de sus Custodios. Después deberás resolver cuatro inscripciones con las pistas de los Trazos y el diario. Una respuesta equivocada conservará la página y ofrecerá una indicación, sin quitar recursos. Bao pide leer el principio completo antes de elegir qué significado le corresponde.

🛡️ Equipo preparado: 1/3 compañeros

1. Comenzar por la identidad y la voz
👉 .ctuhistoria elegir 1

2. Comenzar por el cuidado y su responsabilidad
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia V-01: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 3/9*

🖋️ Lian lee los nombres que pudieron recuperarse y deja espacios visibles para los que todavía faltan. La puerta reconoce que una identidad no se reduce a su registro.

La primera placa muestra el sendero del bosque y un nombre al que le faltan varias sílabas. Su pregunta dice: «¿Qué protegimos al devolver una voz?». El Primer Trazo recuerda a una criatura que pudo responder por sí misma cuando la tinta dejó de imponerle una orden. El diario conserva ese encuentro junto a las pistas de Nube.
Bao pide distinguir una identidad de una victoria. El Guardián no se convirtió en un trofeo ni quedó obligado a agradecer el rescate acompañando al grupo. La puerta solicita reconocer qué volvió a ser posible para él. Si una respuesta parece hablar sólo del poder ganado por el Custodio, conviene volver a leer a quién pertenece el nombre.

🛡️ Equipo preparado: 1/3 compañeros

1. La autoridad del vencedor sobre la criatura
👉 .ctuhistoria elegir 1

2. La identidad y la posibilidad de responder
👉 .ctuhistoria elegir 2

3. El derecho a repetir el mismo vínculo
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia V-01: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 4/9*

🖋️ La primera placa se abre. El nombre recuperado pertenece a quien puede responder y continuar su propia historia.

La segunda placa presenta una carta de aspecto perfecto junto a un registro con reparaciones visibles. Pregunta: «¿Qué permite reconocer una historia auténtica?». El Segundo Trazo procede del mercado, donde una promesa de fuerza ocultaba que nadie podía identificar a la criatura ni explicar cómo había llegado hasta el puesto.
Lian recuerda que una imagen impecable puede copiarse y que un registro incompleto puede investigarse sin fingir una certeza que no existe. La puerta busca una forma de contrastar procedencia, identidad y recorrido. No solicita escoger la carta más rara: pide una razón que pueda revisarse aunque el vendedor insista en que su oferta parece extraordinaria.

🛡️ Equipo preparado: 1/3 compañeros

1. Una procedencia e historia que puedan comprobarse
👉 .ctuhistoria elegir 1

2. Una ilustración sin marcas ni reparaciones
👉 .ctuhistoria elegir 2

3. La promesa de ser más poderosa que las demás
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia V-01: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 5/9*

🖋️ La segunda placa reconoce el recorrido verificable. La copia de una apariencia no reemplaza la identidad de una unidad.

La tercera placa reproduce la frase del Centinela con una palabra ausente: «Un vínculo sin ＿＿＿ no es un vínculo». El Tercer Trazo la conservó después de una prueba que exigía cambiar de respuesta. Bao pide recordar también la pregunta difícil: qué ocurre cuando una criatura quiere apartarse de alguien que cree haberla cuidado bien.
Huan reconoce que aceptar la voluntad de otro resulta más sencillo cuando coincide con la propia. La inscripción se refiere a la posibilidad de continuar o despedirse, incluso si el Custodio preferiría una respuesta distinta. No ofrece una victoria eterna ni una afinidad obligatoria; pide el principio que el Sello eliminaría al inmovilizar todas las relaciones.

🛡️ Equipo preparado: 1/3 compañeros

1. Victoria
👉 .ctuhistoria elegir 1

2. Permanencia
👉 .ctuhistoria elegir 2

3. Elección
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia V-01: escena 6

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 6/9*

🖋️ La frase se completa y la tercera placa se abre. Una historia conserva su vínculo mientras pueda continuar con una voz propia.

La cuarta placa muestra dos estandartes y una puerta sin enseña. Pregunta: «¿A quién pertenece la posibilidad de recibir ayuda?». El Cuarto Trazo apareció cuando las Casas dejaron de alimentar una campana que convertía cada discusión en otra amenaza. El diario recuerda el pabellón compartido y la ruta equivalente de quienes llegaron solos.
Ren había reconocido el trabajo de las asociaciones y de Custodios independientes sin pedirles un mismo nombre. La placa no exige renunciar a una Casa para cooperar ni pertenecer a una para merecer entrada. Busca la regla que permitió proteger a la plaza antes de decidir quién debía llevar el reconocimiento por hacerlo.

🛡️ Equipo preparado: 1/3 compañeros

1. Sólo a quienes llevan la enseña mayoritaria
👉 .ctuhistoria elegir 1

2. A la comunidad, incluidas sus rutas independientes
👉 .ctuhistoria elegir 2

3. Sólo al grupo que venció a la Campana
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia V-01: escena 7

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 7/9*

🖋️ La cuarta placa se abre. La cooperación no convierte a las personas que juegan solas en invitadas de segunda categoría.

El mecanismo se mueve cuando Huan completa la parte que no escogiste primero. La puerta no concede una victoria a una posición sobre la otra; reúne las dos para impedir que el cuidado se convierta en dominio o que la libertad sirva como excusa para no reparar un abuso. La inscripción inicial vuelve a mostrar algunos de sus trazos.
Bao reconoce una frase que había utilizado de manera demasiado cómoda durante años. «Una identidad se protege», lee, y espera antes de añadir «no se posee por completo». Lian conserva ambas partes juntas. Lo que el grupo deberá demostrar dentro del Archivo no será que nunca cometió errores, sino que puede dejar una forma de corregirlos.
Comenzaste por los nombres y la voz, así que Huan completa ahora la parte sobre responsabilidad. La puerta termina de moverse cuando ambas lecturas permanecen juntas. Proteger una identidad necesita cuidados concretos y esos cuidados deben seguir reconociendo a quien puede aceptar, cuestionar o abandonar un vínculo.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-01: escena 8

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 8/9*

Tras la puerta se oyen voces que repiten nombres incompletos. Varias criaturas permanecen junto a los registros que aún recuerdan, mientras la tinta las obliga a volver a la misma posición. No parecen miembros de una especie nueva ni copias destinadas a aumentar una colección; son Ecos cuya identidad ha quedado atrapada entre órdenes contradictorias.
Huan propone asegurar el pasillo para no enfrentarse a toda la sala de una vez. Bao reconoce las señales del dispositivo y Lian distingue a quienes responden a la palabra ayuda. Antes de llegar al Archivista habrá que decidir cómo atender esas voces sin perder de vista el mecanismo que continúa borrando sus posibilidades de elegir.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-01: escena 9

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-01 · Puertas del Archivo Original*

📖 Avance: 24/32 misiones

📜 *Escena 9/9*

El grupo marca una ruta de regreso y deja instrucciones para los mensajeros de Ren. Nadie promete que la salida seguirá abierta por simple buena fortuna. Tao comprobará desde fuera los avisos acordados y Mei mantendrá el pabellón preparado para recibir a las criaturas que puedan salir, pertenezcan o no a una Casa conocida.
Lian cierra el mapa sobre la mesa y conserva en la mano una hoja vacía para lo que todavía no saben. La historia del Archivo no termina en las pruebas que ya contiene: también necesita espacio para los nombres que sus reglas dejaron fuera. Esa idea acompañará al grupo cuando las primeras voces pidan una respuesta concreta.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-02: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-02 · Los guardianes olvidados*

📖 Avance: 25/32 misiones

📜 *Escena 1/5*

🎁 +20 ChengCoins · +30 XP de Custodio
✨ Panda Guerrero: +70 XP · 🌱 Nv. 8
🧩 1 fragmento

Un Eco repite el nombre de una antigua Custodia sin recordar si desea encontrarla o despedirse. Otro protege una carta en blanco y retrocede cuando alguien intenta tocarla. Lian reconoce que ninguna de esas conductas demuestra por sí sola que una criatura quiera recuperar exactamente el vínculo que aparece en el documento más antiguo.
El dispositivo del fondo acelera su pulso. Bao puede señalar una ruta hacia él, pero las voces de la galería también necesitan una salida segura. Puedes dedicarte a ayudar a las criaturas o concentrarte en detener primero la fuente del daño. El grupo repartirá las tareas para que ninguna elección se convierta en abandonar a los demás a una muerte escrita de antemano.

🛡️ Equipo preparado: 1/3 compañeros

1. Ayudar a los Ecos a salir de la galería
👉 .ctuhistoria elegir 1

2. Concentrarse en el dispositivo
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia V-02: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-02 · Los guardianes olvidados*

📖 Avance: 25/32 misiones

📜 *Escena 2/5*

🖋️ Huan asegura la ruta y Lian conserva las palabras que cada criatura desea dejar. Bao vigila el pulso del dispositivo mientras ayudas a despejar la galería.

Una criatura responde cuando Lian le ofrece dos formas de dirigirse a ella y deja de hacerlo cuando la investigadora insiste en la lectura del registro. La diferencia es pequeña y suficiente para cambiar la consulta. El cuaderno conserva una corrección: recordar un nombre no significa obligar a alguien a utilizarlo de la misma manera para siempre.
Bao separa una cinta de tinta de la ruta de salida, pero uno de los Ecos todavía obedece una orden de proteger la galería contra cualquier movimiento. No puede entender la retirada como algo seguro. El encuentro que viene intentará romper esa confusión; la victoria no entregará al enemigo como premio ni decidirá a quién debe acompañar después.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-02: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-02 · Los guardianes olvidados*

📖 Avance: 25/32 misiones

📜 *Escena 3/5*

El Eco del Umbral reúne tinta alrededor del registro y deja una señal antes de descargarla. Huan mantiene libre el pasillo mientras tu equipo le hace frente. Las criaturas que ya han salido conservan sus cartas y su capacidad de apartarse; no se las convierte en escudos ni en un recurso que deba gastarse para facilitar la pelea.
Lian pide observar qué movimiento repite la orden antigua. Una derrota dejará disponible el reintento y una pista sobre el turno que complicó la retirada. El grupo no necesita una rareza determinada para seguir adelante, pero tampoco podrá ignorar indefinidamente los avisos y esperar que la narración le conceda una victoria automática.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-02: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-02 · Los guardianes olvidados*

📖 Avance: 25/32 misiones

📜 *Escena 3/5*

Panda Guerrero usó Golpe de Bambú: 29 de daño a Guardián Olvidado.
Guardián Olvidado usó Hostigamiento de carga: 4 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 130/134 HP

👁️ *Guardián Olvidado*
▓▓▓▓▓▓▓▒▒▒ 131/200 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 El rival responde en todos los turnos. El apoyo tiene enfriamiento. Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.
```

## Historia V-02: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-02 · Los guardianes olvidados*

📖 Avance: 25/32 misiones

📜 *Escena 4/5*

Panda Guerrero usó Impacto del Panda: 18 de daño a Guardián Olvidado.
Guardián Olvidado queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

Al separarse la tinta, el Eco deja de proteger el registro contra quienes intentaban salvarlo. No recupera todos sus recuerdos en un instante, pero puede apartarse de la galería y decidir si quiere escuchar la lectura de su carta. Lian conserva esa diferencia como un hecho, sin exigir una gratitud que complete una escena heroica.
El reparto de tareas permitió que las dos rutas terminaran con las criaturas a salvo. La elección sigue teniendo una huella visible: algunas recuerdan tus manos en la salida y otras la rapidez con que abriste el acceso al dispositivo. La crónica conservará la prioridad elegida para que el epílogo reconozca lo que hiciste, sin inventar una catástrofe en la alternativa.
Una de las criaturas que acompañaste hasta el acceso reconoce tu señal cuando la galería queda libre. Se acerca lo suficiente para comprobar la ruta y vuelve con quienes aún necesitan orientación. La prioridad de ayudar dejó una experiencia compartida que podrá recordarse sin exigir que la criatura te acompañe fuera de este lugar.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-02: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-02 · Los guardianes olvidados*

📖 Avance: 25/32 misiones

📜 *Escena 5/5*

En la sala contigua aparece una mesa con herramientas de Bao y del antiguo protector. La disposición del trabajo contradice la versión de un único villano actuando al margen de una institución inocente. También muestra que el plan del Sello fue una decisión posterior: conocer el origen compartido no vuelve inevitables los actos que cada uno eligió después.
Bao solicita un momento antes de llegar al mecanismo principal. No pretende pedir una absolución ni utilizar el peligro para aplazar otra vez la conversación. Huan mantiene vigilada la entrada y Lian abre la carpeta de las peticiones. El mentor tendrá que hablar sabiendo que algunas respuestas ya pueden compararse con pruebas que no controla.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-03: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-03 · La confesión de Bao*

📖 Avance: 26/32 misiones

📜 *Escena 1/5*

🎁 +30 ChengCoins · +40 XP de Custodio
✨ Panda Guerrero: +150 XP
🧩 1 fragmento

Bao reconoce una herramienta que utilizó para copiar peticiones sin trasladar a su expediente principal los testimonios que las acompañaban. En aquel momento lo llamó ordenar el trabajo. Ahora muestra cómo esa decisión separó hechos que sólo podían entenderse juntos y facilitó que algunas solicitudes parecieran caprichos sin una razón verificable.
Lian no convierte la confesión en una explicación suficiente para toda la crisis. Pregunta qué documentos existen, quiénes pueden revisarlos y qué personas quedaron sin respuesta. Bao entrega la ubicación de las copias y acepta que la investigación continúe después, cuando ya no pueda ampararse en la urgencia de detener el Sello.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-03: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-03 · La confesión de Bao*

📖 Avance: 26/32 misiones

📜 *Escena 2/5*

El mentor explica que temió perder la confianza de sus compañeros si admitía cuánto conocía del origen del Archivista. Ese miedo lo llevó a decidir otra vez qué información estaban preparados para escuchar los demás. Huan reconoce el patrón sin reducir toda la vida de Bao a ese error: alguien puede haber ayudado y seguir debiendo una reparación.
Puedes insistir en que Bao permanezca como testigo responsable o en que la revisión quede en manos de personas que no dependan de su versión. Ninguna respuesta retira el acceso a los capítulos finales. La escena cambia la forma de su compromiso y lo que la crónica exigirá recordar cuando las campanas hayan dejado de sonar.

🛡️ Equipo preparado: 1/3 compañeros

1. Pedir que acompañe y responda como testigo
👉 .ctuhistoria elegir 1

2. Pedir una revisión independiente de sus actos
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia V-03: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-03 · La confesión de Bao*

📖 Avance: 26/32 misiones

📜 *Escena 3/5*

🖋️ Bao se compromete a declarar sin hablar por quienes sufrieron las omisiones. Lian conservará las preguntas que todavía no tienen respuesta.

Bao distingue su responsabilidad de la decisión del Archivista de borrar nombres y construir el Sello. Compartir un pasado no elimina la capacidad de elegir un método diferente. El antiguo protector tendrá que responder por el daño que está causando, incluso si sus primeras reclamaciones identificaron problemas que el Archivo debía haber atendido.
Huan pregunta si las criaturas podrán abandonar también a Custodios que se consideran bondadosos. Bao responde que sí. Proteger la libertad de elegir significa aceptar una despedida que uno mismo no desea, no sólo impedir los abusos cometidos por otros. La respuesta deja de ser cómoda y por eso empieza a parecerse al principio de la Primera Carta.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-03: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-03 · La confesión de Bao*

📖 Avance: 26/32 misiones

📜 *Escena 4/5*

Lian vuelve a leer los nombres que pudo recuperar en el bosque y el mercado. Algunas criaturas buscarán a sus antiguos compañeros; otras elegirán una ruta distinta o necesitarán tiempo para decidir. La restauración del Archivo no debe escribir un final idéntico para todas. Su tarea será conservar herramientas para que puedan continuar sus propias historias.
Bao guarda una sola herramienta y deja las demás sobre la mesa para quienes investiguen después. No destruye la evidencia como gesto de arrepentimiento. Las copias y los testimonios permanecen disponibles con sus límites de acceso. El grupo se prepara para una conversación final que no confundirá reconocer el daño con aceptar una prisión como respuesta.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-03: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-03 · La confesión de Bao*

📖 Avance: 26/32 misiones

📜 *Escena 5/5*

Antes del corredor principal, Huan pide revisar el acuerdo del grupo. La fuerza del Sello no proviene únicamente de sus ataques, sino de la promesa de eliminar para siempre un miedo. Si nadie puede separarse, parece decir, nadie tendrá que aprender a sostener una despedida. El rival sabe lo atractivo que puede resultar resolver una incertidumbre mediante una orden.
Bao permite que la conversación continúe sin presentarse como juez. Lian conserva los testimonios y las criaturas esperan una señal que puedan comprender. Huan no decidirá si el protagonista merece existir en la historia, pero sí expresará qué necesita entender para acompañarlo a la sala donde todas esas ideas deberán sostenerse durante el peligro.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-04: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-04 · El juicio de Huan*

📖 Avance: 27/32 misiones

📜 *Escena 1/5*

🎁 +15 ChengCoins · +25 XP de Custodio
✨ Panda Guerrero: +60 XP

Huan pregunta qué harás si una criatura elige abandonar un vínculo después de que su Custodio haya invertido años en cuidarla. No formula la pregunta para justificar un golpe ni para convertirse en enemigo a última hora. Quiere comprender cómo proteger a ambos sin que la decepción del guardián se convierta en una propiedad sobre la otra parte.
El rival ha visto tus decisiones y su forma de plantear la duda conserva ese recorrido. Puede ofrecer ayuda con confianza o pedir una explicación más concreta antes de comprometerse. Las dos escenas desembocan en apoyo suficiente para continuar: una relación variable enriquece la historia sin convertir una respuesta antigua en una llave que bloquee el final.
Huan recupera la tablilla del puente, donde una victoria y una derrota podían enseñarse sin utilizarse para humillar. Reconoce que le diste espacio para cambiar de respuesta y ofrece guardar la retirada del grupo. «Puedo seguir preguntando sin ponerme delante de la puerta», admite mientras prepara el corredor.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-04: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-04 · El juicio de Huan*

📖 Avance: 27/32 misiones

📜 *Escena 2/5*

Lian propone responder con algo que el grupo pueda poner en práctica después del combate. Una criatura debe poder expresar su voluntad sin que el registro la vuelva sospechosa; un Custodio que haya sufrido un engaño necesita una vía de reparación. Ninguna de esas garantías puede depender sólo de que la persona encargada sea siempre amable y tenga siempre razón.
Puedes defender la revisión pública de las reglas, una voz propia para las criaturas o el reparto de decisiones entre varias personas. La elección señala el argumento que Huan recordará al acompañarte. Todavía no decide el gobierno final del Archivo: esa resolución llegará cuando el Sello deje de amenazar a quienes tendrán que participar en ella.

🛡️ Equipo preparado: 1/3 compañeros

1. Necesitamos reglas que puedan revisarse
👉 .ctuhistoria elegir 1

2. Cada criatura debe conservar su voz
👉 .ctuhistoria elegir 2

3. Nadie debe decidir todo en solitario
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia V-04: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-04 · El juicio de Huan*

📖 Avance: 27/32 misiones

📜 *Escena 3/5*

🖋️ Huan acepta distinguir una norma firme de una norma incapaz de corregir un error. Ayudará a mantener los registros disponibles para revisarlos.

Huan comprueba la retirada y coloca señales que puedan leer las personas que entren después. Su contribución no añade en secreto una victoria automática ni exige que hayas ganado el duelo del puente. La ayuda se expresa en una tarea visible: conservar el acceso por el que podrán salir los nombres recuperados y quienes no deban permanecer en la sala.
Bao entrega a Lian la copia de su compromiso y ella reparte las fuentes necesarias para responder al Archivista. Ninguno pretende hablar en nombre de todas las criaturas. El grupo se acerca a la puerta con argumentos incompletos, deberes concretos y la disposición de admitir que una protección justa necesitará seguir cambiando después de esta noche.
Huan repite tu argumento sobre reglas revisables y solicita dejar por escrito quién comprobará las salidas después. Una garantía no dependerá sólo de que el guardián de turno recuerde una promesa. El rival transforma la discusión en una tarea que otra persona podrá contrastar cuando el grupo ya no esté delante de la puerta.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-04: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-04 · El juicio de Huan*

📖 Avance: 27/32 misiones

📜 *Escena 4/5*

A través de la puerta se distinguen tres pulsos del mecanismo. El primero mueve registros y recuerdos, el segundo cierra algunas vías de respuesta y el tercero reúne energía alrededor del vínculo. Lian los nombra Memoria, Control y Elección para que las señales puedan entenderse cuando la conversación se convierta en combate.
Bao recomienda revisar el equipo y entrenar si hace falta. Una criatura evolucionada puede ayudar a resistir un error, pero no es el permiso de entrada a la última misión. Huan insiste en leer la señal del turno, porque el Sello buscará que repitas una respuesta útil hasta que deje de serlo. Nadie promete que el primer intento tenga que terminar en victoria.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-04: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-04 · El juicio de Huan*

📖 Avance: 27/32 misiones

📜 *Escena 5/5*

El grupo entra cuando las rutas de retirada están listas. Las cartas no se ofrecen como pago ni se ponen en juego mediante una decisión de diálogo: cada unidad conserva la identidad y los controles de propiedad del sistema. La lucha que viene resolverá si el artefacto puede seguir imponiéndose, no quién obtiene un derecho ilimitado sobre sus compañeros.
El Archivista levanta la mirada desde una carta blanca y reconoce el sello de Bao. Huan no convierte el encuentro en un ajuste personal; se queda junto a las señales de salida. Lian sostiene el cuaderno abierto para que el relato del antiguo protector pueda contrastarse con voces que habían quedado fuera de sus conclusiones.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-05: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 1/6*

🎁 +20 ChengCoins · +30 XP de Custodio
✨ Panda Guerrero: +60 XP

El Archivista muestra registros de criaturas que fueron tratadas como trofeos y de Custodios que nunca consiguieron una respuesta al pedir ayuda. No todos los documentos son falsos ni todas las pérdidas una excusa. Lian reconoce varios casos y rechaza que admitirlos obligue a aceptar la desaparición de cualquier vínculo futuro.
El antiguo protector afirma que el Sello evitará otra despedida injusta. Bao pregunta por la criatura que quiera marcharse de una relación abusiva y por aquella que elija una nueva amistad. El Archivista no niega que también quedarían detenidas: considera ese precio una forma de seguridad. La contradicción deja de estar escondida detrás de sus buenas intenciones.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-05: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 2/6*

El mecanismo continúa borrando los nombres mientras la conversación avanza. Las palabras pueden explicar el conflicto, pero no desactivan por sí solas una decisión que el Archivista todavía está ejecutando. Tu respuesta servirá para señalar qué defenderá el grupo durante el encuentro y qué obligación seguirá existiendo cuando deje de sonar la última descarga.
Bao evita prometer que toda libertad será sencilla o que ninguna criatura volverá a sufrir. Lian señala la diferencia entre conservar una posibilidad y garantizar un resultado. Puedes centrar tu argumento en la voz de los compañeros o en la reparación de los daños; ambos caminos exigen detener el Sello sin destruir las identidades que intenta inmovilizar.
Lian puede nombrar los casos que escuchaste en el banco sin convertir a sus protagonistas en argumentos que le pertenecen. El Archivista reconoce las peticiones y descubre que el grupo no necesita negarlas para cuestionar su método. Bao vuelve a señalar que quienes sufrieron un vínculo injusto también necesitan conservar una salida.

🛡️ Equipo preparado: 1/3 compañeros

1. Proteger también significa permitir elegir
👉 .ctuhistoria elegir 1

2. Reparar el daño no autoriza a repetirlo
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia V-05: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 3/6*

🖋️ El Archivista oye que su seguridad impediría incluso una salida justa. Bao mantiene visible el espacio por el que una criatura puede apartarse.

En el primer pulso, los registros proyectan Ecos sobre los corredores de la sala. Algunos conservan una voz propia; otros repiten una orden sin reconocer a quién protege. Lian identifica la fase de Memoria y pide distinguir las señales del mecanismo de las criaturas que necesitan salir, evitando que la pelea se convierta en otro borrado indiscriminado.
El Archivista utiliza esas imágenes para repetir los peores casos que conoció. Los testimonios merecen conservarse, pero no pueden decidir por cada vínculo que aún no ha ocurrido. Huan sostiene las rutas preparadas y Bao señala cuándo la energía se concentra. Las pistas no sustituyen tu acción: permiten comprender por qué habrá momentos de ataque y de defensa.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-05: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 4/6*

El segundo pulso cierra temporalmente algunas respuestas y cambia el ritmo de la sala. Lian lo llama Control: una herramienta útil no estará disponible en todos los turnos y el equipo tendrá que leer qué puede hacer ahora. El mecanismo anuncia sus cierres antes de exigir una alternativa; la prueba no depende de una orden que el jugador sólo podía conocer fuera del juego.
Bao recuerda el Centinela y la Campana: insistir en la misma respuesta puede alimentar el problema. Si pierdes, las señales y el punto de la derrota servirán para preparar un nuevo intento sin retirar monedas, XP o cartas ganadas antes. Las repeticiones no concederán premios por caer ni debilitarán a escondidas el principio que se está poniendo a prueba.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-05: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 5/6*

El último pulso concentra la tinta alrededor del vínculo. El grupo reconoce la fase de Elección por las señales revisadas en el corredor, no por una adivinanza final. Habrá que sostener al equipo y utilizar la apertura correcta, aceptando que proteger no siempre coincide con ejecutar el ataque más grande disponible en ese instante.
Huan confirma que la salida permanece abierta y Lian reúne los Trazos recuperados sin confundirlos con una propiedad sobre el resto del Archivo. El Archivista se niega a detener el artefacto voluntariamente. La pelea será necesaria mientras siga imponiendo el Sello, aunque el grupo conserve la obligación de investigar el daño que utilizó para justificarlo.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-05: escena 6

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

La carta blanca se eleva y los tres pulsos del Sello se ordenan alrededor de la sala. Lee la fase y el aviso que muestra el enemigo antes de elegir una respuesta. Tu colección seguirá siendo tuya si el intento termina en derrota; podrás reintentar o entrenar, pero la victoria deberá llegar de acciones que sostengan al equipo frente a lo que el mecanismo anuncia.
Bao se aparta de la línea de ataque, Huan conserva la retirada y Lian protege los registros que permiten devolver los nombres. Nadie ofrece una criatura como precio de la libertad de otra. El último combate de la campaña empieza con una tarea precisa: interrumpir Memoria, Control y Elección sin repetir la idea de que cuidar significa inmovilizar.
Bao mantiene abierta la salida que señalaste al defender la elección. La criatura que necesite apartarse no encontrará una orden que la obligue a demostrar su gratitud quedándose. El Archivista observa ese espacio y vuelve a concentrar el Sello; la diferencia entre cuidar y retener tendrá que sostenerse mientras la sala cambia de fase.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 134/134 HP
🛡️ Escudo 12

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▓ 360/360 HP
Memoria

⚠️ *SEÑAL ENEMIGA*
📜 MEMORIA: observa qué registro conserva su nombre para atravesar los Ecos.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero recupera 5 HP.
El Archivista usó Presión de tinta: 9 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 125/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▒ 295/360 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T7*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero usó Golpe de Bambú: 27 de daño a El Archivista.
El Archivista usó Presión de tinta: 15 de daño a Panda Guerrero.
El Archivista entra en CONTROL: sella habilidades durante dos turnos.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 83/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▒▒▒▒ 214/360 HP
Control

⚠️ *SEÑAL ENEMIGA*
🔒 CONTROL: las habilidades pueden quedar selladas. Purifica o alterna ataques y defensa.

🧩 📜 CONTROL · Sello: 2 turnos · Registros reconocidos Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: derrota guardada y reintento

```text
🃏 *CHENGDÚ CARDS | HISTORIA | DERROTA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero usó Impacto del Panda: 38 de daño a El Archivista.
El Archivista usó Presión de tinta: 2 de daño a Panda Guerrero.
Panda Guerrero queda fuera de combate.
Tu equipo cae bajo la presión. Conservas tus cartas y monedas; revisa la señal y prepara el siguiente intento.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▒▒▒▒▒▒▒▒▒▒ 0/134 HP

👁️ *El Archivista*
▓▓▓▒▒▒▒▒▒▒ 106/360 HP

🌧️ *Esta vez la expedición cayó.*
Tu historia sigue guardada. No pierdes cartas ni monedas; reintentar no duplica los premios.

💡 Observa la señal enemiga: defender antes de un golpe cargado puede cambiar el combate. Prepara tu equipo y vuelve a intentarlo.

🔁 *.ctuhistoria reintentar*
🛡️ Preparar: .ctuequipo
🔎 Pista: .ctuhistoria pista
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 134/134 HP
🛡️ Escudo 12

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▓ 360/360 HP
Memoria

⚠️ *SEÑAL ENEMIGA*
📜 MEMORIA: observa qué registro conserva su nombre para atravesar los Ecos.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero recupera 5 HP.
El Archivista usó Presión de tinta: 9 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 125/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▒ 295/360 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T7*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero usó Golpe de Bambú: 27 de daño a El Archivista.
El Archivista usó Presión de tinta: 15 de daño a Panda Guerrero.
El Archivista entra en CONTROL: sella habilidades durante dos turnos.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 83/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▒▒▒▒ 214/360 HP
Control

⚠️ *SEÑAL ENEMIGA*
🔒 CONTROL: las habilidades pueden quedar selladas. Purifica o alterna ataques y defensa.

🧩 📜 CONTROL · Sello: 2 turnos · Registros reconocidos Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 134/134 HP
🛡️ Escudo 12

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▓ 360/360 HP
Memoria

⚠️ *SEÑAL ENEMIGA*
📜 MEMORIA: observa qué registro conserva su nombre para atravesar los Ecos.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero recupera 5 HP.
El Archivista usó Presión de tinta: 9 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 125/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▒ 295/360 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T7*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero usó Golpe de Bambú: 27 de daño a El Archivista.
El Archivista usó Presión de tinta: 15 de daño a Panda Guerrero.
El Archivista entra en CONTROL: sella habilidades durante dos turnos.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 83/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▒▒▒▒ 214/360 HP
Control

⚠️ *SEÑAL ENEMIGA*
🔒 CONTROL: las habilidades pueden quedar selladas. Purifica o alterna ataques y defensa.

🧩 📜 CONTROL · Sello: 2 turnos · Registros reconocidos Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T1*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 134/134 HP
🛡️ Escudo 12

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▓ 360/360 HP
Memoria

⚠️ *SEÑAL ENEMIGA*
📜 MEMORIA: observa qué registro conserva su nombre para atravesar los Ecos.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero recupera 5 HP.
El Archivista usó Presión de tinta: 9 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 125/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▒ 295/360 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T7*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero usó Golpe de Bambú: 27 de daño a El Archivista.
El Archivista usó Presión de tinta: 15 de daño a Panda Guerrero.
El Archivista entra en CONTROL: sella habilidades durante dos turnos.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 83/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▒▒▒▒ 214/360 HP
Control

⚠️ *SEÑAL ENEMIGA*
🔒 CONTROL: las habilidades pueden quedar selladas. Purifica o alterna ataques y defensa.

🧩 📜 CONTROL · Sello: 2 turnos · Registros reconocidos Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T4*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero recupera 4 HP.
El Archivista usó Presión de tinta: 8 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 126/134 HP

👁️ *El Archivista*
▓▓▓▓▓▓▓▓▓▒ 295/360 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 📜 MEMORIA · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria purificar · Reduce tensión o sellos

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T13*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

🛡️ Defiendes la ofensiva sin detener la presión enemiga.
El Archivista usó Descarga del vínculo: 24 de daño a Panda Guerrero.
La respuesta del vínculo causa 16 de daño al enemigo.
El Archivista entra en ELECCIÓN: protege el vínculo cuando concentre su fuerza.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 88/134 HP

👁️ *El Archivista*
▓▓▓▓▒▒▒▒▒▒ 117/360 HP
Elección

⚠️ *SEÑAL ENEMIGA*
🕊️ ELECCIÓN: protege al equipo cuando el Sello concentre toda su fuerza.

🧩 📜 ELECCIÓN · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 0/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT

👉 .ctuhistoria atacar 1
👉 .ctuhistoria atacar 2
👉 .ctuhistoria defender
👉 .ctuhistoria habilidad
👉 .ctuhistoria purificar · Reduce tensión o sellos
👉 .ctuhistoria proteger · Protege a tus aliados

💾 El turno se conserva al salir.
```

## Historia V-05: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T15*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-05 · El Archivista*

📖 Avance: 28/32 misiones

📜 *Escena 6/6*

Panda Guerrero usó Golpe de Bambú: 27 de daño a El Archivista.
El Archivista usó Presión de tinta: 4 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▒▒▒ 84/134 HP

👁️ *El Archivista*
▓▓▒▒▒▒▒▒▒▒ 52/360 HP
Protección

⚠️ *SEÑAL ENEMIGA*
🛡️ ¡Protege al equipo y a los aliados de la descarga dirigida!

🧩 📜 ELECCIÓN · Sello: 0 turnos · Registros reconocidos Ofensiva seguida: 2/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 1T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo
👉 .ctuhistoria purificar · Reduce tensión o sellos
👉 .ctuhistoria proteger · Protege a tus aliados

💾 El turno se conserva al salir.
```

## Historia V-06: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-06 · El destino del Sello*

📖 Avance: 29/32 misiones

📜 *Escena 1/5*

Panda Guerrero usó Impacto del Panda: 21 de daño a El Archivista.
El Archivista queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

🖋️ La última descarga se apaga antes de alcanzar los registros. El Sello Inmutable se separa de la carta blanca y los nombres dejan de desplazarse hacia el centro de la sala. No todas las criaturas recuerdan de inmediato cuanto perdieron, pero vuelve a existir espacio para que respondan por sí mismas y continúen su recuperación.
Entre las piezas detenidas encontráis el fragmento final, que aún debe reunirse con los otros al restaurar el Archivo. Lian registra el hallazgo sin ocultar los documentos del Archivista y Ren llega para ponerlo bajo custodia de una revisión. Comprender sus motivos no elimina su responsabilidad. Bao entrega sus propias copias: el final del combate no será el final de las preguntas.

🎁 +100 ChengCoins · +100 XP de Custodio
✨ Panda Guerrero: +350 XP
🧩 2 fragmentos · 2 esencias
📜 Recuerdo: La última inscripción

Las piezas del Sello permanecen separadas bajo vigilancia y los cinco Trazos pueden leerse sin alimentar el mecanismo. Bao insiste en que la derrota del Archivista no concede a un nuevo Custodio el derecho a decidir todo en su lugar. Ren organiza una consulta con las Casas, personas independientes y voces de criaturas que han recuperado parte de sus recuerdos.
Mei abre el pabellón para quienes no pueden o no quieren entrar al Archivo Original. Yun prepara copias que distinguen la información compartida de los testimonios con acceso limitado. La pregunta ahora es cómo reconstruir una institución capaz de proteger y corregirse, sin borrar la libertad de quienes no estén de acuerdo con su primera respuesta.
La visitante del banco recuerda la respuesta que destacaste sobre la voz de las criaturas y solicita que puedan revisar también el acuerdo nuevo. Lian reserva un espacio para sus testimonios sin pedir que se adapten primero al formulario de los antiguos protectores. La reconstrucción empieza a escuchar a quienes tendrán que vivir con sus reglas.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-06: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-06 · El destino del Sello*

📖 Avance: 29/32 misiones

📜 *Escena 2/5*

La primera propuesta conserva un Archivo con obligaciones claras, vías de reparación y supervisión de sus decisiones. La segunda abre la custodia de los registros a una comunidad más amplia sin publicar testimonios privados. La tercera establece un consejo plural que reparte la revisión entre quienes antes sólo podían pedir que alguien los escuchara.
Las tres protegen los vínculos y permiten nuevos encuentros, despedidas y transferencias legítimas. Ninguna opción desactiva el mercado real, obliga a intercambiar cartas o modifica los controles de doble confirmación. La decisión de tu Custodio determinará el enfoque de su desenlace personal dentro de un canon común: el Archivo restaurado y los vínculos libres.

🛡️ Equipo preparado: 1/3 compañeros

1. Archivo Protegido: reglas y reparación
👉 .ctuhistoria elegir 1

2. Voces Abiertas: comunidad y testimonios
👉 .ctuhistoria elegir 2

3. Consejo del Bambú: vigilancia compartida
👉 .ctuhistoria elegir 3

📖 .ctudiario historia
```

## Historia V-06: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-06 · El destino del Sello*

📖 Avance: 29/32 misiones

📜 *Escena 3/5*

🖋️ La propuesta prioriza garantías claras, registros fiables y un derecho real a revisar decisiones injustas. El Archivo deberá demostrar que sus reglas también lo obligan a responder.

Lian lee el acuerdo completo, incluida la parte que permite corregirlo. Las criaturas no quedan obligadas a conservar un vínculo por haber ayudado a restaurar el Archivo. Las Casas tampoco reciben una propiedad sobre las rutas o los testimonios que protegieron. La nueva organización tendrá que medirse por lo que permita hacer a quienes lleguen después.
Bao deja su sello antiguo junto a las copias de la revisión. Ren registra la detención del Archivista y las preguntas que su proceso deberá responder. El grupo puede reconocer que algunas de sus denuncias fueron necesarias sin dejar que esa verdad absorba la responsabilidad por los nombres que borró para imponer una respuesta universal.
En tu propuesta, cada decisión importante deja una razón consultable y una ruta de apelación. Yun reserva un espacio para las rectificaciones y Mei mantiene un acceso para quienes no saben utilizar el procedimiento. El Archivo Protegido no se considera terminado: comienza el trabajo de comprobar que su protección también llega a quienes lo cuestionan.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-06: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-06 · El destino del Sello*

📖 Avance: 29/32 misiones

📜 *Escena 4/5*

Lian reúne el fragmento final con los otros cuatro y entrega el Quinto Trazo a la crónica restaurada. Su inscripción no concede un poder que resuelva todo desacuerdo futuro. Recuerda una obligación más difícil: conservar la identidad sin poseerla por completo. Queda una copia accesible y un registro de los espacios que todavía no pueden reconstruirse con certeza.
Huan reconoce que ninguna de las propuestas garantiza una ciudad sin conflictos. Eso no las vuelve inútiles: ahora existen modos de plantearlos sin que la primera respuesta sea inmovilizar un vínculo. Las criaturas vuelven a recorrer el patio y algunas se apartan del grupo para decidir, a su propio ritmo, qué significa el camino de regreso.
Bao cumple el compromiso de permanecer como testigo y entrega una relación de las preguntas que todavía debe responder. No habla en nombre de todas las personas perjudicadas ni considera que acompañar la victoria haya cerrado sus responsabilidades. Lian conserva la lista junto a las copias que permitirán seguir contrastando su relato.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia V-06: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Capítulo V · El Último Nombre*
📍 *V-06 · El destino del Sello*

📖 Avance: 29/32 misiones

📜 *Escena 5/5*

El grupo sale del Archivo Original cuando las primeras entregas de registros están preparadas. Tao comprueba sus destinos y Yun separa lo restaurado de lo que necesitará más trabajo. Mei pregunta cuántas sillas harán falta en la casa de té. El mundo no espera un discurso perfecto para volver a ocuparse de quienes lo habitan.
Bao observa la torre desde la plaza sin atribuirle todas las respuestas. Las campanas permanecen en silencio por primera vez desde que comenzó el viaje. El epílogo no elegirá otro final por sorpresa: mostrará cómo las decisiones que conservaste encuentran un lugar en las primeras páginas de un Archivo que vuelve a aceptar historias abiertas.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-01: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-01 · Las primeras páginas*

📖 Avance: 30/32 misiones

📜 *Escena 1/5*

🎁 +25 ChengCoins · +40 XP de Custodio
✨ Panda Guerrero: +80 XP
📜 Recuerdo: Un vínculo puede continuar
🎋 Título: *El Archivo Protegido*

Mei reúne varias mesas para que el regreso no se convierta en una ceremonia donde sólo quepan quienes pelearon. Tao comparte noticias de las entregas, Yun trae una copia del tejido restaurado y Ren explica qué peticiones siguen pendientes. La crónica reconocerá la victoria sin utilizarla para ocultar el trabajo que todavía necesita continuidad.
Lian coloca el cuaderno en el centro y solicita revisar dos momentos del viaje. No preguntará cuál fue la opción correcta después de conocer el resultado; mostrará lo que cada decisión permitió ver y lo que dejó para otras manos. Las escenas conservarán tus elecciones, en vez de atribuirte una versión del camino que no recorriste.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-01: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-01 · Las primeras páginas*

📖 Avance: 30/32 misiones

📜 *Escena 2/5*

Las noticias del bosque llegan en una entrega pequeña, sin el sello de una Casa. La Guardiana Nube ha recuperado fragmentos de la canción y varias criaturas han comenzado a reconocer sus senderos. Lian deja espacio para escuchar qué ocurrió con la criatura del arroyo, una de las primeras decisiones que no necesitó derrotar a nadie para importar.
Bao recuerda que ambas rutas permitieron seguir investigando. Ayudar y perseguir no fueron universos incompatibles ni excusas para castigar al jugador con un daño invisible. Cambiaron un encuentro, una pista y la manera en que alguien pudo reconocer tu presencia. La crónica conservará esa diferencia con el tamaño de una historia personal, no con una promesa de haber decidido todo el mundo.
La criatura del arroyo se acerca a la puerta y deja unas hojas limpias junto al bastón de Bao. Reconoce a quien se detuvo cuando el rastro todavía podía perderse. No ofrece una carta como pago ni queda obligada a acompañarte: comparte una señal de gratitud y vuelve al sendero que ahora puede elegir sin la tinta sobre sus patas.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-01: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-01 · Las primeras páginas*

📖 Avance: 30/32 misiones

📜 *Escena 3/5*

Huan trae una tablilla nueva con espacio para preguntas y no sólo para resultados. Bao entrega a Ren una relación de los documentos que ha puesto a disposición de la revisión. Los dos conservan responsabilidades propias después de acompañarte: el rival seguirá aprendiendo a escuchar y el mentor no podrá declarar cerrada por sí solo la parte de la historia que lo afecta.
Lian observa que confiar no tiene por qué significar retirar una pregunta, y exigir una prueba no obliga a negar toda ayuda recibida. Las relaciones del viaje permanecen abiertas a esa diferencia. El epílogo reconoce la forma en que decidiste colaborar sin transformar un gesto amable en una absolución o una respuesta firme en una enemistad automática.
Bao recuerda que aceptaste seguir escuchándolo cuando entregó la carpeta de las dos firmas. No utiliza esa confianza para retirar documentos de la revisión. Deja las nuevas copias en la mesa y pide que los compromisos permanezcan visibles, incluso si llega el día en que el grupo tenga motivos para preguntarle otra vez por una parte de su relato.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-01: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-01 · Las primeras páginas*

📖 Avance: 30/32 misiones

📜 *Escena 4/5*

Ren informa que las Casas ya no controlan por separado los accesos al pabellón. Algunas discusiones continúan y varias personas todavía creen que el Sello parecía una respuesta más sencilla. Mei mantiene el banco de testimonios disponible sin exigir una declaración de arrepentimiento a quien necesite acercarse. La reparación no depende de que todos describan el pasado con las mismas palabras.
Puedes escoger qué página leer en voz alta durante la reunión: la ayuda que pudo organizarse sin una afiliación obligatoria o el derecho de una criatura a continuar su historia de otra manera. Las dos se conservarán. La elección identifica el primer compromiso que tu Custodio quiere recordar cuando la aventura deje de ocupar el centro de cada conversación.

🛡️ Equipo preparado: 1/3 compañeros

1. Recordar que la comunidad admite distintas rutas
👉 .ctuhistoria elegir 1

2. Recordar que un vínculo conserva su elección
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia E-01: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-01 · Las primeras páginas*

📖 Avance: 30/32 misiones

📜 *Escena 5/5*

🖋️ Mei incorpora la página a la mesa común. Las personas sin Casa y las criaturas sin un registro completo conservarán una entrada al trabajo de reconstrucción.

La reunión termina con una crónica que distingue hechos, recuerdos y tareas pendientes. No borra los errores para fabricar una victoria más limpia ni añade sufrimientos a las rutas que no elegiste. La historia de tu Custodio puede recorrerse de nuevo sin volver a emitir los premios que ya recibió; las identidades y los hitos de sus compañeros seguirán conservándose.
Tao propone llevar una copia a la plaza para quienes no estuvieron en la casa de té. Yun revisa que los nombres puedan leerse y Bao guarda su bastón antes de ofrecerse a acompañarlo. Lian deja la última página sin cerrar: todavía falta reconocer el trabajo del viaje y decidir cómo seguir practicando lo aprendido sin convertir el final en otra obligación interminable.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-02: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-02 · La historia continúa*

📖 Avance: 31/32 misiones

📜 *Escena 1/5*

🎁 +15 ChengCoins · +25 XP de Custodio
✨ Panda Guerrero: +60 XP
📜 Recuerdo: Las primeras páginas

La plaza recibe la crónica sin una barrera que separe a los Custodios por su clasificación. Los compañeros que han evolucionado conservan su identidad y quienes no lo han hecho no quedan fuera del reconocimiento. Bao recuerda el primer encuentro bajo el bambú: una carta no era una promesa de poder, sino una historia que podía continuar contigo.
Ren presenta el reconocimiento de Custodio del Alba como un título del viaje, no como una autorización para decidir por otros. Las criaturas, las personas de las Casas y quienes llegaron solos han contribuido de formas diferentes. El Archivo vuelve a abrir porque pudo escuchar más de una voz, no porque haya encontrado a alguien incapaz de equivocarse.
Mei ha colocado junto a la crónica la página que elegiste leer sobre las rutas de la comunidad. Tao comprueba que pueda encontrarse desde la entrada y Ren la incorpora al acuerdo del pabellón. Las personas que llegaron sin una Casa reconocen allí una ayuda que no les exigió convertirse en alguien distinto para recibirla.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-02: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-02 · La historia continúa*

📖 Avance: 31/32 misiones

📜 *Escena 2/5*

Lian entrega una copia de la crónica y el recuerdo del Archivo Abierto. El título y el recuerdo son reconocimientos únicos de esta campaña: repetir escenas o reiniciar para pruebas no duplicará monedas, experiencia, materiales o unidades. El cierre conserva lo que ya recibiste y deja disponibles las historias opcionales que quieras completar a tu propio ritmo.
Mei pregunta qué lugar debería ocupar la copia de tu Custodio. Puedes dejarla accesible para quienes empiezan o conservarla como una promesa de seguir revisando tus propias decisiones. La otra copia permanecerá en el Archivo. Ninguna respuesta borra el recorrido ni convierte a los compañeros en piezas que sólo valían mientras hacían avanzar la campaña.

🛡️ Equipo preparado: 1/3 compañeros

1. Compartir la crónica con nuevos Custodios
👉 .ctuhistoria elegir 1

2. Conservar una página para seguir aprendiendo
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
```

## Historia E-02: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-02 · La historia continúa*

📖 Avance: 31/32 misiones

📜 *Escena 3/5*

🖋️ Tao prepara una ruta para llevar la copia a la casa de té. Quienes comiencen encontrarán una historia que admite dudas y muestra cómo pedir ayuda.

Las primeras decisiones de reconstrucción siguen el enfoque que defendiste ante la mesa de los cinco Trazos. El canon compartido no cambia: el Sello está detenido, los nombres se recuperan y los vínculos pueden continuar. Lo personal es qué compromiso quedó destacado en tu crónica y qué voces te recuerdan cuando recorres una ciudad que todavía necesita cuidados.
Bao no declara que el Archivo haya aprendido su lección para siempre. Lian conserva las revisiones, Mei mantiene el banco y Ren acepta las preguntas sobre los accesos. El título del Alba señala un comienzo, no una institución terminada. Tu Custodio podrá participar en esa continuidad sin que el juego exija un clan, una rareza o un triunfo sobre otros jugadores.
El primer acuerdo que lleva tu firma exige una respuesta consultable y un camino de apelación. La gente empieza a reconocer tu crónica por esa insistencia en que proteger también obliga al Archivo a rendir cuentas. La puerta permanece abierta para quien necesite cuestionar una decisión tomada bajo sus propios sellos.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-02: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-02 · La historia continúa*

📖 Avance: 31/32 misiones

📜 *Escena 4/5*

El Archivo ofrece tres pruebas de práctica para revisitar señales, reflejos y elecciones. Sus encuentros pueden repetirse sin convertirse en una fuente ilimitada de monedas o XP. Las historias laterales también permanecen disponibles: la canción del bosque, una entrega de Tao, el paso de Huan y una casa sin enseña que sigue necesitando manos.
Nadie pide que regreses cada día para conservar el final que alcanzaste. Puedes consultar el diario, cambiar de compañero, evolucionar o compartir una criatura mediante los sistemas seguros de siempre. La campaña añade memoria a esas posibilidades sin sustituir las confirmaciones del mercado o los límites de emisión que conservan la identidad de cada unidad.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia E-02: escena 5

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🎋 *Epílogo · El Archivo Abierto*
📍 *E-02 · La historia continúa*

📖 Avance: 31/32 misiones

📜 *Escena 5/5*

Cuando la plaza empieza a vaciarse, una criatura recién llegada se detiene junto a tu Custodio y pronuncia el nombre con el que le han dado la bienvenida durante el viaje. No parece un Eco: responde con claridad a las preguntas de Lian y recuerda quién es. Sin embargo, ninguna búsqueda encuentra su origen en los registros recuperados de la Primera Carta.
La criatura no sabe explicar de dónde conoce ese nombre. Bao mira el espacio que Lian había dejado abierto en la última página y evita ofrecer otra respuesta antes de escuchar. La temporada termina con el Archivo restaurado y una pregunta nueva: qué lugar corresponde a las historias que siempre existieron, aunque nadie hubiera aprendido todavía a registrarlas.
Tao sale de la plaza con la copia que decidiste compartir y se detiene al escuchar el nombre pronunciado por la criatura desconocida. Mira las hojas que lleva bajo el brazo: la primera persona que encuentre esa crónica también encontrará una página abierta. La nueva pregunta viajará junto a una historia que no finge haber explicado todo el mundo.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
```

## Historia: temporada completa, cinco Trazos y título ganado

```text
🃏 *CHENGDÚ CARDS | HISTORIA | TEMPORADA COMPLETA*
━━━━━━━━━━━━━━
📖 Avance: 32/32 misiones

🎁 +25 ChengCoins · +35 XP de Custodio
✨ Panda Guerrero: +80 XP · 🌱 Nv. 9
📜 Recuerdo: El Archivo Abierto
🌅 Título: *Custodio del Alba*

🌅 *Custodio del Alba*
Has completado los cinco capítulos y el epílogo. Los cinco Trazos, tus decisiones y los vínculos del viaje quedan guardados.

🖋️ *El Archivo Protegido*
Restauraste el Archivo con nuevas salvaguardas y registros que protegen sin inmovilizar los vínculos.

📖 El Archivo queda abierto: puedes volver a sus escenas, explorar rutas opcionales y entrenar en sus pruebas.

📖 .ctudiario historia
🎋 .cturecuerdos
🏛️ .ctuhistoria pruebas
🌿 .ctuhistoria opcionales
🏅 .ctusocial titulos
```

## Historia: cuatro rutas opcionales disponibles

```text
🃏 *CHENGDÚ CARDS | HISTORIA | OPCIONALES*
━━━━━━━━━━━━━━
🌿 *I-A · Los sonidos perdidos*
👉 .ctuhistoria opcional I-A

🌿 *II-A · El paquete de Tao*
👉 .ctuhistoria opcional II-A

🌿 *III-A · El paso de Huan*
👉 .ctuhistoria opcional III-A

🌿 *IV-A · La casa sin enseña*
👉 .ctuhistoria opcional IV-A

Las rutas opcionales conservan tu avance principal.
👉 .ctuhistoria
```

## Historia opcional: ayudar a Huan conserva el avance principal

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🌿 *MISIÓN OPCIONAL*

🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-A · El paso de Huan*

📖 Avance: 32/32 misiones

📜 *Escena 1/4*

Huan vuelve al pabellón para buscar una criatura que se apartó del grupo durante el descenso. Sus primeras indicaciones suenan como otra orden de entrenamiento, pero la compañera no responde. El rival admite que la vio detenerse antes y decidió interpretar el gesto como cansancio, sin preguntar qué necesitaba del camino.
Huan conserva la tablilla de los ejercicios junto al pecho y deja de añadir órdenes que nadie está escuchando. Lian aconseja empezar por las señales que dejó la criatura, en vez de recorrer sólo los lugares que él había decidido que debía preferir. La búsqueda comienza cuando el rival acepta mirar el camino desde una perspectiva que todavía desconoce.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia opcional: pausa y regreso al epílogo completado

```text
🃏 *CHENGDÚ CARDS | HISTORIA | TEMPORADA COMPLETA*
━━━━━━━━━━━━━━
📖 Avance: 32/32 misiones

🌅 *Custodio del Alba*
Has completado los cinco capítulos y el epílogo. Los cinco Trazos, tus decisiones y los vínculos del viaje quedan guardados.

🖋️ *El Archivo Protegido*
Restauraste el Archivo con nuevas salvaguardas y registros que protegen sin inmovilizar los vínculos.

📖 El Archivo queda abierto: puedes volver a sus escenas, explorar rutas opcionales y entrenar en sus pruebas.

📖 .ctudiario historia
🎋 .cturecuerdos
🏛️ .ctuhistoria pruebas
🌿 .ctuhistoria opcionales
🏅 .ctusocial titulos
```

## Historia opcional: retomar la escena guardada

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🌿 *MISIÓN OPCIONAL*

🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-A · El paso de Huan*

📖 Avance: 32/32 misiones

📜 *Escena 1/4*

Huan vuelve al pabellón para buscar una criatura que se apartó del grupo durante el descenso. Sus primeras indicaciones suenan como otra orden de entrenamiento, pero la compañera no responde. El rival admite que la vio detenerse antes y decidió interpretar el gesto como cansancio, sin preguntar qué necesitaba del camino.
Huan conserva la tablilla de los ejercicios junto al pecho y deja de añadir órdenes que nadie está escuchando. Lian aconseja empezar por las señales que dejó la criatura, en vez de recorrer sólo los lugares que él había decidido que debía preferir. La búsqueda comienza cuando el rival acepta mirar el camino desde una perspectiva que todavía desconoce.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia III-A: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🌿 *MISIÓN OPCIONAL*

🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-A · El paso de Huan*

📖 Avance: 32/32 misiones

📜 *Escena 1/4*

Huan vuelve al pabellón para buscar una criatura que se apartó del grupo durante el descenso. Sus primeras indicaciones suenan como otra orden de entrenamiento, pero la compañera no responde. El rival admite que la vio detenerse antes y decidió interpretar el gesto como cansancio, sin preguntar qué necesitaba del camino.
Huan conserva la tablilla de los ejercicios junto al pecho y deja de añadir órdenes que nadie está escuchando. Lian aconseja empezar por las señales que dejó la criatura, en vez de recorrer sólo los lugares que él había decidido que debía preferir. La búsqueda comienza cuando el rival acepta mirar el camino desde una perspectiva que todavía desconoce.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia III-A: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🌿 *MISIÓN OPCIONAL*

🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-A · El paso de Huan*

📖 Avance: 32/32 misiones

📜 *Escena 2/4*

Las huellas terminan junto a un claro desde el que se ve el puente del primer duelo. Bao identifica un lugar de descanso y sugiere mantener una ruta libre hacia la montaña. Huan quiere acercarse deprisa para demostrar que puede arreglar la ausencia con la misma fuerza con que suele resolver sus ejercicios.
Puedes proponer esperar a una distancia visible o llamarla desde el sendero sin cerrar sus salidas. Huan necesita escoger un gesto que la criatura pueda entender sin convertirse en otra orden. Bao se queda junto al cruce y Lian aparta las ramas que ocultaban el acceso; la búsqueda deja de avanzar sobre ella y empieza a ofrecerle un camino de regreso.

🛡️ Equipo preparado: 1/3 compañeros

1. Esperar cerca sin invadir el claro
👉 .ctuhistoria elegir 1

2. Llamarla desde una salida abierta
👉 .ctuhistoria elegir 2

📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia III-A: escena 3

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🌿 *MISIÓN OPCIONAL*

🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-A · El paso de Huan*

📖 Avance: 32/32 misiones

📜 *Escena 3/4*

🖋️ Huan deja una tablilla y se aparta de su trayectoria. La criatura puede acercarse sin atravesar otra orden.

La criatura sale cuando Huan deja de avanzar hacia ella y reconoce el gesto con el que solían terminar un entrenamiento. No ha olvidado todo ni estaba preparando una traición. Necesitaba separarse del ruido y comprobar que podía regresar sin que su ausencia se convirtiera en una lección sobre obediencia.
Huan reconoce que cuidar también exige interpretar una respuesta que no se parece a un ataque o una defensa. Agradece tu ayuda sin prometer que no volverá a equivocarse. Lian conserva el encuentro como una prueba de que el rival puede cambiar sus hábitos cuando alguien le muestra una situación que sus tablillas no habían previsto.
La tablilla que Huan dejó a una distancia prudente sigue sobre la hierba cuando la criatura sale del claro. El rival permite que se acerque a ella antes de recogerla. Has ayudado a construir una referencia visible que no cierra el espacio alrededor de quien todavía estaba decidiendo cómo regresar.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia III-A: escena 4

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🌿 *MISIÓN OPCIONAL*

🎋 *Capítulo III · Las Montañas del Espejo*
📍 *III-A · El paso de Huan*

📖 Avance: 32/32 misiones

📜 *Escena 4/4*

En el regreso, Huan adapta el ritmo a la criatura que acaba de encontrar y pregunta antes de iniciar otro ejercicio. La ayuda tendrá una consecuencia visible cuando deba decidir cómo acompañarte a la sala del Archivista: podrá recordar que respetaste un vínculo incluso cuando no había un público que contara puntos por hacerlo.
El rival guarda la tablilla con una nota sobre la pregunta que no hizo al comenzar el descenso. La criatura camina cerca sin perder el espacio que acaba de recuperar. Al llegar al pabellón, Huan propone escuchar antes de reanudar los ejercicios: no quiere olvidar que una búsqueda puede terminar bien sin demostrar que siempre tuvo razón sobre el camino.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia opcional: recuerdo y premio único, campaña conservada

```text
🃏 *CHENGDÚ CARDS | HISTORIA | TEMPORADA COMPLETA*
━━━━━━━━━━━━━━
📖 Avance: 32/32 misiones

🎁 +20 ChengCoins · +15 XP de Custodio
✨ Panda Guerrero: +45 XP
🧩 1 fragmento
📜 Recuerdo: El paso de Huan

🌅 *Custodio del Alba*
Has completado los cinco capítulos y el epílogo. Los cinco Trazos, tus decisiones y los vínculos del viaje quedan guardados.

🖋️ *El Archivo Protegido*
Restauraste el Archivo con nuevas salvaguardas y registros que protegen sin inmovilizar los vínculos.

📖 El Archivo queda abierto: puedes volver a sus escenas, explorar rutas opcionales y entrenar en sus pruebas.

📖 .ctudiario historia
🎋 .cturecuerdos
🏛️ .ctuhistoria pruebas
🌿 .ctuhistoria opcionales
🏅 .ctusocial titulos
```

## Archivo: escena completada y páginas numéricas

```text
🃏 *CHENGDÚ CARDS | ARCHIVO DE ESCENAS*
━━━━━━━━━━━━━━
📖 *III-04 · El recuerdo de Bao*

Lian pregunta por la firma borrada y Bao confirma que perteneció a quien ahora llaman el Archivista. No presenta al antiguo compañero como alguien que siempre estuvo destinado a hacer daño. Recuerda propuestas valiosas y una ruptura posterior: proteger a todas las criaturas empezó a significar impedirles cambiar de vínculo.
Huan evita interrumpir para decidir de inmediato quién merece confianza. La escena conserva espacio para tu respuesta. Puedes aceptar que Bao siga acompañando al grupo mientras rinde cuentas o exigir que cada revelación futura se apoye en documentos y testimonios compartidos, sin expulsarlo de una trama que todavía necesita su ayuda.

🔎 Lectura del recuerdo guardado. No cambia tus decisiones ni vuelve a entregar premios.

📄 *Página 2 de 5*
⬅️ .ctuhistoria escenas III-04 1
➡️ .ctuhistoria escenas III-04 3
👉 .ctuhistoria
```

## Archivo: tres pruebas sin premios de campaña repetibles

```text
🃏 *CHENGDÚ CARDS | PRUEBAS DEL ARCHIVO*
━━━━━━━━━━━━━━
🏛️ Encuentros de entrenamiento tras completar la temporada. Sus premios de campaña no se vuelven a entregar.

⚔️ *1. Lectura de raíces*
👉 .ctuhistoria prueba 1

⚔️ *2. Respuestas distintas*
👉 .ctuhistoria prueba 2

⚔️ *3. Custodia en práctica*
👉 .ctuhistoria prueba 3

👉 .ctuhistoria
```

## Archivo: desafío opcional después del epílogo

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🏛️ *PRUEBA DEL ARCHIVO*

🎋 *Archivo · Diario del Custodio*
📍 *PRUEBA-1 · Lectura de raíces*

📖 Avance: 32/32 misiones

📜 *Escena 1/2*

El Archivo prepara una prueba que recuerda la defensa del bosque. Sus barreras y sus cargas vuelven a anunciarse antes de exigir una respuesta. Puedes practicar con compañeros distintos y retirarte sin perder la conclusión de la campaña; ninguna repetición producirá monedas, experiencia o materiales adicionales.
La primera finalización conservará un reconocimiento narrativo y las siguientes seguirán disponibles como práctica. No se emiten criaturas nuevas ni se altera el resultado del Guardián Marchito en la crónica. Leer señales y defender cuando corresponde vuelve a ser la tarea, con la libertad de ensayar otra forma de resolverla.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia PRUEBA-1: escena 1

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🏛️ *PRUEBA DEL ARCHIVO*

🎋 *Archivo · Diario del Custodio*
📍 *PRUEBA-1 · Lectura de raíces*

📖 Avance: 32/32 misiones

📜 *Escena 1/2*

El Archivo prepara una prueba que recuerda la defensa del bosque. Sus barreras y sus cargas vuelven a anunciarse antes de exigir una respuesta. Puedes practicar con compañeros distintos y retirarte sin perder la conclusión de la campaña; ninguna repetición producirá monedas, experiencia o materiales adicionales.
La primera finalización conservará un reconocimiento narrativo y las siguientes seguirán disponibles como práctica. No se emiten criaturas nuevas ni se altera el resultado del Guardián Marchito en la crónica. Leer señales y defender cuando corresponde vuelve a ser la tarea, con la libertad de ensayar otra forma de resolverla.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Historia PRUEBA-1: turno de combate

```text
🃏 *CHENGDÚ CARDS | HISTORIA | T3*
━━━━━━━━━━━━━━
🏛️ *PRUEBA DEL ARCHIVO*

🎋 *Archivo · Diario del Custodio*
📍 *PRUEBA-1 · Lectura de raíces*

📖 Avance: 32/32 misiones

📜 *Escena 1/2*

Panda Guerrero usó Impacto del Panda: 40 de daño a Guardián Marchito.
Guardián Marchito usó Hostigamiento de carga: 0 de daño a Panda Guerrero.

❤️ *EXPEDICIÓN*
🐼 *Panda Guerrero*
▓▓▓▓▓▓▓▓▓▓ 136/136 HP
🛡️ Escudo 5

👁️ *Guardián Marchito*
▓▓▓▓▓▓▓▓▒▒ 176/245 HP
Descarga preparada

⚠️ *SEÑAL ENEMIGA*
⚠️ ¡DESCARGA INMINENTE! Defiende para amortiguarla y devolver parte de su fuerza.

🧩 🌿 Barrera: 0. La carga y la apertura también causan daño. Ofensiva seguida: 1/3; alterna acciones para evitar la represalia.

🎯 *Tu turno*
1. Golpe de Bambú · 25 POT
2. Impacto del Panda · 36 POT · ⏳ 2T

👉 .ctuhistoria atacar 1
👉 .ctuhistoria defender
👉 .ctuhistoria apoyar · Recupera vida del equipo

💾 El turno se conserva al salir.

↩️ Para pausar esta ruta: .ctuhistoria rendirse y después .ctuhistoria volver
```

## Historia PRUEBA-1: escena 2

```text
🃏 *CHENGDÚ CARDS | HISTORIA*
━━━━━━━━━━━━━━
🏛️ *PRUEBA DEL ARCHIVO*

🎋 *Archivo · Diario del Custodio*
📍 *PRUEBA-1 · Lectura de raíces*

📖 Avance: 32/32 misiones

📜 *Escena 2/2*

Panda Guerrero usó Golpe de Bambú: 34 de daño a Guardián Marchito.
Guardián Marchito queda fuera de combate.
El vínculo resiste. El enemigo cede ante tu estrategia.

🌿 *¡Encuentro superado!*

La inscripción del patio conserva lo aprendido. Esta prueba puede repetirse sin generar monedas, XP ni materiales.

🛡️ Equipo preparado: 1/3 compañeros

👉 *.ctuhistoria continuar*
🛡️ .ctuequipo · 📖 .ctudiario historia
↩️ Volver a la campaña: .ctuhistoria volver
```

## Archivo: entrenamiento completado sin duplicar XP, monedas ni materiales

```text
🃏 *CHENGDÚ CARDS | HISTORIA | TEMPORADA COMPLETA*
━━━━━━━━━━━━━━
📖 Avance: 32/32 misiones

📜 Recuerdo: Lectura de raíces

🌅 *Custodio del Alba*
Has completado los cinco capítulos y el epílogo. Los cinco Trazos, tus decisiones y los vínculos del viaje quedan guardados.

🖋️ *El Archivo Protegido*
Restauraste el Archivo con nuevas salvaguardas y registros que protegen sin inmovilizar los vínculos.

📖 El Archivo queda abierto: puedes volver a sus escenas, explorar rutas opcionales y entrenar en sus pruebas.

📖 .ctudiario historia
🎋 .cturecuerdos
🏛️ .ctuhistoria pruebas
🌿 .ctuhistoria opcionales
🏅 .ctusocial titulos
```

## Diario narrativo: resumen, crónica y decisiones sin cobrar el diario económico

```text
🃏 *CHENGDÚ CARDS | DIARIO DEL CUSTODIO*
━━━━━━━━━━━━━━
📍 *Qué pasó antes*
Has reunido los cinco Trazos y terminado la temporada. Restauraste el Archivo con nuevas salvaguardas y registros que protegen sin inmovilizar los vínculos. El Archivo Abierto conserva tus recuerdos.

📚 *Últimas escenas*
*E-02 · La historia continúa*
La plaza recibe la crónica sin una barrera que separe a los Custodios por su clasificación. Los compañeros que han evolucionado conservan su identidad y quienes no lo han hecho no quedan fuera del reconocimiento. Bao recuerda el primer encuentro bajo el bambú: una carta no era una promesa de poder, sino una historia que podía continuar contigo.
*III-A · El paso de Huan*
Huan vuelve al pabellón para buscar una criatura que se apartó del grupo durante el descenso. Sus primeras indicaciones suenan como otra orden de entrenamiento, pero la compañera no responde. El rival admite que la vio detenerse antes y decidió interpretar el gesto como cansancio, sin preguntar qué necesitaba del camino.

👥 *Personajes conocidos*
Maestro Bao · Lian · Guardiana Nube · Guardián Marchito · Tía Mei · Tao · Señora Yun · Mercader Sin Rostro · Huan · Ren · El Archivista

🖋️ *Trazos y pistas*
*Trazos de la Primera Carta*
5 de 5 recuperados.
*Primer Trazo*
Un nombre conserva una memoria, pero también puede convertirse en una cadena. Nube te confió este fragmento cuando el bosque volvió a responder.
*Segundo Trazo*
Un vínculo auténtico guarda una historia y permite continuarla. Los registros del mercado muestran que borrar nombres también puede inmovilizar vínculos.
*Tercer Trazo*
Un vínculo sin elección no es un vínculo.
*Cuarto Trazo*
Una comunidad puede proteger sin obligar a pertenecer.
*Quinto Trazo*
La Primera Carta recupera su inscripción cuando los vínculos vuelven a ser libres.

🧭 *Últimas decisiones*
*La historia continúa*
Compartir la crónica con nuevos Custodios. Tao prepara una ruta para llevar la copia a la casa de té. Quienes comiencen encontrarán una historia que admite dudas y muestra cómo pedir ayuda.
*El paso de Huan*
Esperar cerca sin invadir el claro. Huan deja una tablilla y se aparta de su trayectoria. La criatura puede acercarse sin atravesar otra orden.

📜 *Recuerdos*
Campanas sin manos · La gratitud del bosque · La confianza de Lian · El nombre bajo las raíces · El valor de un nombre · La trampa desde dentro · El reflejo que escucha · Dos estandartes, un refugio · La última inscripción · Un vínculo puede continuar · Las primeras páginas · El Archivo Abierto · El paso de Huan · Lectura de raíces

🗺️ *Atlas*
Plaza del Archivo · Bosque de los Susurros · Mercado de las Linternas · Las Montañas del Espejo · Distrito de las Casas · Archivo Original · Gran Archivo del Bambú

📚 *Consultar el detalle*
.ctudiario historia cronica
.ctudiario historia personajes
.ctudiario historia trazos
.ctudiario historia decisiones
.ctudiario historia recuerdos
.ctudiario historia atlas

👉 .ctuhistoria
```

## Diario narrativo: primeras cuatro misiones con páginas numéricas

```text
🃏 *CHENGDÚ CARDS | DIARIO | CRÓNICA*
━━━━━━━━━━━━━━
*P-01 · Una invitación bajo el bambú*
Un panda anciano observa una carta a la sombra del bambú. A su espalda se alza el Gran Archivo.

*P-02 · El primer vínculo*
Bao despliega los registros de las criaturas que pueden formar su primer vínculo.

*P-03 · Una sombra en la plaza*
Una mancha de tinta cruza la plaza. Dentro tiembla una criatura que parece no reconocer el camino.

*P-04 · Las campanas del Archivo*
La tinta abandona al Eco, pero las campanas siguen sonando. Lian encuentra una carta completamente blanca.

📄 *Página 1 de 9*
➡️ .ctudiario historia cronica 2
📖 Resumen: .ctudiario historia
👉 .ctuhistoria
```

## Diario narrativo: siguiente página mediante el alias de Historia

```text
🃏 *CHENGDÚ CARDS | DIARIO | CRÓNICA*
━━━━━━━━━━━━━━
*I-01 · Sendero en silencio*
El sendero conserva el olor de la lluvia, pero no se oye un solo pájaro.

*I-02 · Una criatura herida*
Una pequeña criatura tiembla entre hojas manchadas de tinta. Más adelante, las huellas todavía están frescas.

*I-03 · Huellas en el bambú*
Dos Ecos retroceden hacia el bambú; un tercero avanza, reuniendo tinta alrededor de sus garras.

*I-04 · El claro de la tinta*
Nube retiene la última sílaba y señala las raíces del centro del claro. Allí alguien sigue intentando recordar su deber.

📄 *Página 2 de 9*
⬅️ .ctudiario historia cronica 1
➡️ .ctudiario historia cronica 3
📖 Resumen: .ctudiario historia
👉 .ctuhistoria
```

## Historia: avance y siguientes misiones bloqueadas

```text
🃏 *CHENGDÚ CARDS | CAPÍTULOS*
━━━━━━━━━━━━━━
✅ *El despertar del Custodio*
✅ P-01 · Una invitación bajo el bambú
✅ P-02 · El primer vínculo
✅ P-03 · Una sombra en la plaza
✅ P-04 · Las campanas del Archivo

✅ *El Bosque que Olvidó su Voz*
✅ I-01 · Sendero en silencio
✅ I-02 · Una criatura herida
✅ I-03 · Huellas en el bambú
✅ I-04 · El claro de la tinta
✅ I-05 · Guardián Marchito

✅ *El Mercado de los Ecos*
✅ II-01 · Rumores entre faroles
✅ II-02 · El puesto sin nombre
✅ II-03 · Una oferta imposible
✅ II-04 · El libro de los ausentes
✅ II-05 · Mercader Sin Rostro

✅ *Las Montañas del Espejo*
✅ III-01 · El desafío de Huan
✅ III-02 · El ascenso
✅ III-03 · Los tres reflejos
✅ III-04 · El recuerdo de Bao
✅ III-05 · Centinela del Espejo

✅ *Las Casas Divididas*
✅ IV-01 · Dos estandartes
✅ IV-02 · La plaza cerrada
✅ IV-03 · Pactos de bambú
✅ IV-04 · Voces del Sello
✅ IV-05 · Campana del Conflicto

✅ *El Último Nombre*
✅ V-01 · Puertas del Archivo Original
✅ V-02 · Los guardianes olvidados
✅ V-03 · La confesión de Bao
✅ V-04 · El juicio de Huan
✅ V-05 · El Archivista
✅ V-06 · El destino del Sello

✅ *El Archivo Abierto*
✅ E-01 · Las primeras páginas
✅ E-02 · La historia continúa

👉 .ctuhistoria
```

## Historia: recuerdos personales no comerciables

```text
🃏 *CHENGDÚ CARDS | DIARIO | RECUERDOS*
━━━━━━━━━━━━━━
*Campanas sin manos*
La primera llamada del Gran Archivo y una carta que había perdido su nombre.

*La gratitud del bosque*
Te detuviste a ayudar a una criatura herida cuando las huellas podían desaparecer.

*La confianza de Lian*
Distinguiste al Eco hostil de las criaturas asustadas. Lian dejó una nota de confianza en tu cuaderno.

*El nombre bajo las raíces*
Escuchaste al Guardián Marchito cuando pudo recordar qué protegía. Nube confió a tus cuidados el Primer Trazo.

📄 *Página 1 de 4*
➡️ .ctudiario historia recuerdos 2
📖 Resumen: .ctudiario historia
👉 .ctuhistoria
```

## Historia: materiales auténticos para el primer sello

```text
🃏 *CHENGDÚ CARDS | CRAFTING*
━━━━━━━━━━━━━━
🪵 0 fragmentos · ✨ 0 esencias · 🔮 0 sellos

🎁 18 recompensas con materiales pendientes
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

## Historia: recoger los materiales ganados en la campaña

```text
🃏 *CHENGDÚ CARDS | MATERIALES*
━━━━━━━━━━━━━━
🎒 ¡Materiales recogidos!

🪵 21 fragmentos · ✨ 7 esencias · 🔮 0 sellos

🔨 .ctucrafting
```

## Historia: fabricar el sello con materiales y monedas reales

```text
🃏 *CHENGDÚ CARDS | CRAFTING*
━━━━━━━━━━━━━━
🔨 ¡Creación completada!
sello＿evolucion

🪵 16 fragmentos · ✨ 5 esencias · 🔮 1 sellos

💰 Coste: 100 ChengCoins

🔮 .ctuevolucion ID
🎒 .ctuinventario
```

## Historia: consultar la evolución del compañero real tras la campaña

```text
🃏 *CHENGDÚ CARDS | EVOLUCIÓN*
━━━━━━━━━━━━━━
🔮 *Panda Maestro*
🎴 PAND-000006 · Nv. 9

📋 Requisitos: nivel 5 · 300 ChengCoins · 1 sello
💰 Tienes 1030 · 🔮 1 sellos

✨ Nv. 5: +4% · Nv. 10: +5%
Bono al cumplir los requisitos: +4% · redondeo hacia abajo.
🌱 El bono crece con el nivel, sin otro sello ni pago.

✨ Lista para evolucionar.

✅ .ctuevolucion PAND-000006 confirmar
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

📖 Avance: 0/32 misiones

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

📖 Avance: 1/32 misiones

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
