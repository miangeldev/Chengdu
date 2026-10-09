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
📦 Emisión: Ilimitada
📚 Estadísticas base
❤️ Vida: 120/120 HP
⚔️ Ataque: 24 · 🛡️ Defensa: 22 · 💨 Velocidad: 8

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
💰 0 ChengCoins · 🎴 1 unidad

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
🪪 USR-f48cb8a2-604c-46bd-96e0-7bcbb95e79d4
✅ Disponible

🌱 Nivel 1 · ✨ 0/100 XP
🏆 0 victorias · 💔 0 derrotas

📜 Personaje inicial · 8 de octubre de 2026

🔎 Stats y ataques: *.ctuficha PAND-000001*
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
⚔️ Ataque: 24 · 🛡️ Defensa: 22 · 💨 Velocidad: 8

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
▓▓▓▓▓▓▓▓▓▓ 90/90 HP

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
⚔️ Ataque: 24 · 🛡️ Defensa: 22 · 💨 Velocidad: 8

1️⃣ *Golpe de Bambú* · Físico
Potencia: 25 POT · Precisión: 100%

2️⃣ *Impacto del Panda* · Físico
Potencia: 40 POT · Precisión: 80%
📌 Datos del combate activo.

🐺 *Lobo Sombrío* · Lukas
🆔 LOBO-000001
🌱 Nivel 1
❤️ Vida: 90/90 HP
⚔️ Ataque: 27 · 🛡️ Defensa: 16 · 💨 Velocidad: 16

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
💥 *45 de daño* a Panda Guerrero

❤️ *ESTADO*
🐼 Miguel
▓▓▓▓▓▓▓▒▒▒ 75/120 HP
🐺 Lukas
▓▓▓▓▓▓▓▓▓▓ 90/90 HP

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
▓▓▓▓▓▓▓▒▒▒ 75/120 HP
🐺 Lukas
▓▓▓▓▓▒▒▒▒▒ 42/90 HP

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
▓▓▓▓▓▓▓▒▒▒ 75/120 HP
🐺 Lukas
▓▓▓▓▓▒▒▒▒▒ 42/90 HP

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
💥 *42 de daño* a Lobo Sombrío

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 4 turnos · ❤️ 75 HP restantes

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
💥 *42 de daño* a Lobo Sombrío

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 4 turnos · ❤️ 30 HP restantes

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
💰 360 ChengCoins · 🎴 1 unidad

⚔️ 3 combates
🏆 3 victorias · 💔 0 derrotas · ⚖️ 0 sin ganador

👉 Tu colección: *.ctupersonajes*
```

## Saldo y reglas de recompensa

```text
🃏 *CHENGDÚ CARDS | BALANCE*
━━━━━━━━━━━━━━
💰 *360 ChengCoins*

🏆 Victoria: +120 ChengCoins y +35 XP
💔 Derrota: +15 XP · ⚖️ Empate: +20 XP
✨ La unidad participante también recibe esa XP.

⏳ Hasta 3 combates con recompensa contra el mismo rival en 24 h.
🏳️ Rendirse requiere 4 ataques y que ambos hayan atacado.
⌛ La inactividad no otorga recompensas.

👉 Tus partidas: *.ctuhistorial*
```

## Historial compacto de partidas

```text
🃏 *CHENGDÚ CARDS | HISTORIAL*
━━━━━━━━━━━━━━
🏆 Victoria vs *Lukas*
📅 8 de octubre de 2026 · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-01e101d4-bcce-4871-9552-fec32abc25c2

🏆 Victoria vs *Lukas*
📅 8 de octubre de 2026 · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-669031e2-6254-4546-94e5-b604cd523985

🏆 Victoria vs *Lukas*
📅 8 de octubre de 2026 · 4 turnos
🎁 +120 ChengCoins · +35 XP
🔎 .ctuhistorial BTL-f22070f5-4551-43aa-bd5a-2dfde1116deb

👉 Tu saldo: *.ctubalance*
```

## Detalle del historial: turnos y recompensa original

```text
🃏 *CHENGDÚ CARDS | PARTIDA*
━━━━━━━━━━━━━━
🏆 Victoria · 8 de octubre de 2026
Miguel · Panda Guerrero · Niv. 1
Lukas · Lobo Sombrío · Niv. 1

⚔️ *TURNOS*
T1 · Lukas: Colmillo Nocturno
💥 45 de daño · Rival: 75 HP

T2 · Miguel: Impacto del Panda
💥 48 de daño · Rival: 42 HP

T3 · Lukas: Colmillo Nocturno
💥 45 de daño · Rival: 30 HP

T4 · Miguel: Impacto del Panda
💥 42 de daño · Rival: 0 HP

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
⚔️ Ataque: 24 · 🛡️ Defensa: 22 · 💨 Velocidad: 8

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
💥 *42 de daño* a Lobo Sombrío

🐼 *¡Miguel derrotó a Lukas!*

⚔️ 4 turnos · ❤️ 32 HP restantes

🎁 Sin recompensa: ya alcanzaron 3 combates con recompensa entre ustedes en 24 h.

⚔️ Otra partida: .ctupelea @jugador
```
