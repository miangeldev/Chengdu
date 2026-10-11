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

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%

2️⃣ *Impacto del Panda* · Físico
Potencia: 40 POT · Precisión: 80%

💡 Daño: potencia + ataque − defensa (mín. 1).
Fallar consume el turno.
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

👉 Tu colección: *.ctupersonajes*
```

## Colección

```text
🃏 *CHENGDÚ CARDS | COLECCIÓN*
━━━━━━━━━━━━━━
🎴 *Miguel*

🐼 *Panda Guerrero* · Nv. 1
⚪ Común · ✅ Disponible
↳ .ctuequipo usar PAND-000001

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

🛡️ *Guardián Jade*
🔵 Raro · Tanque
↳ .ctuficha guardian_jade

🐺 *Lobo Sombrío*
⚪ Común · Velocista · 🎁 Starter
↳ .ctuficha lobo_sombrio

📄 Siguiente: .ctucatalogo eyJzY29wZSI6ImNhdGFsb2ciLCJrZXkiOlsiIiwibG9ib19zb21icmlvIl19
```

## Catálogo: siguiente página

```text
🃏 *CHENGDÚ CARDS | CATÁLOGO*
━━━━━━━━━━━━━━
🔥 *Mago Carmesí*
⚪ Común · Atacante · 🎁 Starter
↳ .ctuficha mago_carmesi

🧘 *Monje Celestial*
🔵 Raro · Equilibrado
↳ .ctuficha monje_celestial

🐼 *Panda Guerrero*
⚪ Común · Tanque · 🎁 Starter
↳ .ctuficha panda_guerrero

🎁 Elegir starter: .ctustarter
```

## Guía de comandos

```text
🃏 *CHENGDÚ CARDS | AYUDA*
━━━━━━━━━━━━━━
🌱 *Empezar*
.cturegistro Nombre · Registro
.ctustarter · Primer personaje

🎴 *Colección*
.ctuperfil · Tu progreso
.ctupersonajes · Elegir unidad
.ctucatalogo · Ver personajes
.ctuficha [ID o personaje] · Stats y precisión
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
.ctuvender ID PRECIO · Publicar una unidad
.ctucomprar ANUNCIO · Comprar
.ctumercado mios · Tus anuncios
.cturetirar ANUNCIO · Retirar
.ctuventas · Tus compras y ventas
.ctupropiedad ID · Historia de propietarios

🛡️ *Equipo*
.ctuequipo · Ver equipo
.ctuequipo usar ID · Seleccionar
.ctuequipo limpiar · Vaciar

✨ *Progreso*
.ctubalance · Saldo y recompensas
.ctuhistorial · Tus partidas
.ctuhistorial ID · Turnos y recompensa

⚔️ *Combate en grupo*
.ctupelea @jugador · Desafiar
.ctuaceptar / .cturechazar · Responder
.ctucancelar · Retirar desafío
.ctuatacar 1 / .ctuatacar 2 · Atacar
.ctucombate · Ver turno
.cturendirse · Rendirse
```

## Equipo

```text
🃏 *CHENGDÚ CARDS | EQUIPO*
━━━━━━━━━━━━━━
🛡️ *Miguel*

🐼 *Panda Guerrero* · Nv. 1
✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
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

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%

2️⃣ *Impacto del Panda* · Físico
Potencia: 40 POT · Precisión: 80%

💡 Daño: potencia + ataque − defensa (mín. 1).
Fallar consume el turno.
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

👉 Tu colección: *.ctupersonajes*
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
📅 11 de octubre de 2026 · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-68c1fd68-0cde-4359-aebd-8682640600dc

🏆 Victoria vs *Lukas*
📅 11 de octubre de 2026 · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-803639db-c072-4db6-8ee3-db9bb5624290

🏆 Victoria vs *Lukas*
📅 11 de octubre de 2026 · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-bde89dfc-21bf-4bdc-87ef-0082186c44e2

👉 Tu saldo: *.ctubalance*
```

## Detalle del historial: turnos y recompensa original

```text
🃏 *CHENGDÚ CARDS | PARTIDA*
━━━━━━━━━━━━━━
🏆 Victoria · 11 de octubre de 2026
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

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%

2️⃣ *Impacto del Panda* · Físico
Potencia: 40 POT · Precisión: 80%

💡 Daño: potencia + ataque − defensa (mín. 1).
Fallar consume el turno.
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

1️⃣ *Garra del Dragón* · Físico
Potencia: 25 POT · Precisión: 100%

2️⃣ *Aliento Carmesí* · Físico
Potencia: 40 POT · Precisión: 80%

💡 Daño: potencia + ataque − defensa (mín. 1).
Fallar consume el turno.
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

📄 Siguiente: *.ctumovimientos eyJzY29wZSI6ImNvaW5MZWRnZXI6VVNSLWE0MmY3YTI3LWJlZmUtNDk1OC04OTM0LTFhZGUyMDYxMDVmOSIsImtleSI6WyI5MDA3MTk5MjU0NzQwOTg3IiwiY29pbjpyZXdhcmQ6QlRMLTNhOWE5ZTQyLWZlYTMtNDZlYy1iZGZiLTY5ODkxNzJjMmU1MjpVU1ItYTQyZjdhMjctYmVmZS00OTU4LTg5MzQtMWFkZTIwNjEwNWY5Il19*
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

👉 Tu saldo: *.ctubalance*
```

## Error: saldo insuficiente para otro sobre

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
💰 No tienes suficientes ChengCoins para esa compra.
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

👉 Compartir anuncio: *.ctumercado ver LIST-9d99946c-13c7-45c8-9461-bd8137022c42*
↩️ Retirar: .cturetirar LIST-9d99946c-13c7-45c8-9461-bd8137022c42
```

## Mercado: decidir a simple vista

```text
🃏 *CHENGDÚ CARDS | MERCADO*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque
💰 *100 ChengCoins* · 👤 Miguel
👉 .ctumercado ver LIST-9d99946c-13c7-45c8-9461-bd8137022c42

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
👉 .ctumercado ver LIST-9d99946c-13c7-45c8-9461-bd8137022c42

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
👉 .ctumercado ver LIST-9d99946c-13c7-45c8-9461-bd8137022c42

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
👉 .cturetirar LIST-9d99946c-13c7-45c8-9461-bd8137022c42

🎴 Tus anuncios: .ctumercado mios
💰 Menor precio: .ctumercado precio
```

## Anuncio: ficha congelada y acción de compra

```text
🃏 *CHENGDÚ CARDS | ANUNCIO*
━━━━━━━━━━━━━━
🐼 *Panda Guerrero* · Nv. 2
⚪ Común · Tanque

👤 Vendedor: *Miguel*
💰 Precio: *100 ChengCoins*

❤️ 122 HP · ⚔️ 25 ATQ · 🛡️ 23 DEF · 💨 8 VEL
📌 Stats al publicar.

🔒 En el mercado
⏳ Vence: 20 oct 2026, 14:00 (CDMX)

🛒 Comprar: *.ctucomprar LIST-9d99946c-13c7-45c8-9461-bd8137022c42*
🔎 Ataques y rasgos: .ctuficha PAND-000001
```

## Colección: unidad bloqueada en el mercado

```text
🃏 *CHENGDÚ CARDS | COLECCIÓN*
━━━━━━━━━━━━━━
🎴 *Miguel*

🐼 *Panda Guerrero* · Nv. 2
⚪ Común · 🔒 En venta
↳ .ctumercado ver LIST-9d99946c-13c7-45c8-9461-bd8137022c42

🐉 *Dragón Carmesí* · ✨ Dorada · Nv. 1
🟡 Legendario · 🧬 2 rasgos · ✅ Disponible
↳ .ctuequipo usar DRGC-000001

🔎 Detalles: .ctuficha ID
```

## Error: una unidad en venta no puede combatir

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
🔒 Esa unidad está en combate o en venta.
👉 Consulta .ctumercado mios o .ctucombate.
```

## Error: el comprador necesita saldo

```text
🃏 *CHENGDÚ CARDS | ERROR*
━━━━━━━━━━━━━━
💰 No tienes suficientes ChengCoins para esa compra.
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
🏆 Victoria · 13 de octubre de 2026
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
🛡️ *Lukas*

🐼 *Panda Guerrero* · Nv. 2
✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
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

📄 Siguiente: *.ctumovimientos eyJzY29wZSI6ImNvaW5MZWRnZXI6VVNSLWE0MmY3YTI3LWJlZmUtNDk1OC04OTM0LTFhZGUyMDYxMDVmOSIsImtleSI6WyI5MDA3MTk5MjU0NzQwOTg0IiwiY29pbjpEQUlMWS0zMGM0MDA4OC1jODYyLTQxMzUtYWUwZC0yM2M5OWI2YTBkMjgiXX0*
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
🃏 *CHENGDÚ CARDS | ANUNCIO*
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
🛡️ *Lukas*

🐺 *Lobo Sombrío* · Nv. 1
✅ Listo para combatir

👉 *.ctupelea @jugador*
🔎 Stats y ataques: .ctuficha
```
