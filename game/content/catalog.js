export const CONTENT_POLICY_VERSION = 1;
export const CONTENT_TIME_ZONE = 'America/Mexico_City';

export const MISSIONS = Object.freeze([
  { id: 'wins_2', code: '1', name: 'Dos victorias', description: 'Gana 2 combates válidos.', metric: 'wins', target: 2, reward: { coins: 40, userXp: 15, tickets: 1 } },
  { id: 'battles_5', code: '2', name: 'En la arena', description: 'Juega 5 combates válidos.', metric: 'battles', target: 5, reward: { coins: 60, userXp: 20, tickets: 1 } },
  { id: 'characters_3', code: '3', name: 'Tres estilos', description: 'Usa 3 personajes diferentes en combates válidos.', metric: 'characters', target: 3, reward: { coins: 50, userXp: 20, tickets: 1 } }
]);

export const ACHIEVEMENTS = Object.freeze([
  { id: 'first_blood', code: 'L1', name: 'Primera sangre', description: 'Gana tu primera batalla válida.', target: 1, title: 'Primer filo', badge: '⚔️', reward: { coins: 60, userXp: 20, tickets: 1 } },
  { id: 'collector', code: 'L2', name: 'Coleccionista', description: 'Obtén 25 unidades distintas a lo largo de tu historia.', target: 25, title: 'Guardián de la colección', badge: '🃏', reward: { coins: 250, userXp: 75, tickets: 3 } },
  { id: 'veteran', code: 'L3', name: 'Veterano', description: 'Juega 100 combates válidos.', target: 100, title: 'Veterano de Chengdú', badge: '🛡️', reward: { coins: 350, userXp: 100, tickets: 3 } },
  { id: 'undefeated', code: 'L4', name: 'Invicto', description: 'Gana 10 combates válidos consecutivos.', target: 10, title: 'Invicto', badge: '🏆', reward: { coins: 200, userXp: 80, tickets: 2 } }
]);

const bossRewards = () => ({ participation: { coins: 80, userXp: 20, tickets: 1 }, top: { coins: 40, userXp: 10, tickets: 0 }, last: { coins: 20, userXp: 5, tickets: 0 } });
export const BOSSES = Object.freeze([
  { id: 'niebla', name: 'Guardián de la Niebla', emoji: '👹', hp: 1000, defense: 18, cooldownMs: 30_000, maxAttacks: 20, respawnMs: 86_400_000, durationMs: 86_400_000, rewards: bossRewards() },
  { id: 'dragon', name: 'Dragón del Vacío', emoji: '🐉', hp: 100_000, defense: 30, cooldownMs: 30_000, maxAttacks: 20, respawnMs: 259_200_000, durationMs: 259_200_000, rewards: bossRewards() }
]);

export const SPAWN_POLICY = Object.freeze({ checkIntervalMs: 1_800_000, minSpawnGapMs: 3_600_000, durationMs: 600_000, chancePercent: 25, ticketCost: 1,
  rarityWeights: Object.freeze({ common: 30, rare: 10, epic: 4, legendary: 1, mythic: 1 }) });

export function seedCampaigns() {
  return [{ id: 'faroles_2026', code: 'faroles', revision: 1, policyVersion: CONTENT_POLICY_VERSION,
    name: 'Festival de los Faroles', description: 'Enciende un farol, encuentra nuevos compañeros y celebra en comunidad.',
    startsAt: '2026-10-11T06:00:00.000Z', endsAt: '2026-10-25T06:00:00.000Z',
    characterIds: ['zorro_faroles', 'guardian_espectral'], welcome: { coins: 25, userXp: 10, tickets: 1 } }];
}

export function seedEventCharacters() {
  return [
    { id: 'zorro_faroles', unitPrefix: 'ZORR', name: 'Zorro de los Faroles', rarity: 'rare', role: 'speed',
      baseStats: { hp: 110, attack: 27, defense: 20, speed: 17 }, attackIds: ['zorro_faroles_1', 'zorro_faroles_2'], max: 35,
      combat: { version: 1, element: 'fire', ability: { id: 'brillo_farol', name: 'Brillo del Farol', description: 'Al entrar obtiene un escudo de 6 puntos durante 2 turnos propios y aumenta su ataque un 6% durante 2 turnos propios.', trigger: 'on_enter',
        effects: [{ type: 'shield', target: 'self', duration: 2, potency: 6 }, { type: 'attack_up', target: 'self', duration: 2, potency: 6 }] } } },
    { id: 'guardian_espectral', unitPrefix: 'ESPE', name: 'Guardián Espectral', rarity: 'epic', role: 'tank',
      baseStats: { hp: 132, attack: 25, defense: 26, speed: 9 }, attackIds: ['guardian_espectral_1', 'guardian_espectral_2'], max: 20,
      combat: { version: 1, element: 'dark', ability: { id: 'custodia_faroles', name: 'Custodia de los Faroles', description: 'Al entrar obtiene un escudo de 12 puntos durante 2 turnos propios.', trigger: 'on_enter',
        effects: [{ type: 'shield', target: 'self', duration: 2, potency: 12 }] } } }
  ].map(({ max, ...character }) => ({ ...character, revision: 1,
    statVariation: { hp: 0, attack: 0, defense: 0, speed: 0 }, supply: { type: 'limited', max },
    obtainable: true, starterEligible: false, eventId: 'faroles_2026' }));
}

export function seedEventAttacks() {
  return [
    { id: 'zorro_faroles_1', name: 'Chispa del Farol', element: 'fire', power: 25, accuracy: 100, type: 'physical', effects: [], cooldown: 0 },
    { id: 'zorro_faroles_2', name: 'Danza de Luz', element: 'fire', power: 30, accuracy: 85, type: 'magic', effects: [{ type: 'burn', target: 'enemy', duration: 2, potency: 2 }], cooldown: 2 },
    { id: 'guardian_espectral_1', name: 'Puño Espectral', element: 'dark', power: 25, accuracy: 100, type: 'physical', effects: [], cooldown: 0 },
    { id: 'guardian_espectral_2', name: 'Velo Espectral', element: 'dark', power: 28, accuracy: 85, type: 'physical', effects: [{ type: 'shield', target: 'self', duration: 2, potency: 10 }], cooldown: 2 }
  ].map(({ id, name, ...combat }) => ({ id, name, revision: 1, power: combat.power, accuracy: combat.accuracy, type: 'physical', combat: { version: 1, ...combat } }));
}
