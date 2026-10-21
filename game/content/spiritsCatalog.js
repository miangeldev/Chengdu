export const SPIRITS_POLICY_VERSION = 1;
export const SPIRITS_CAMPAIGN_ID = 'espiritus_2026';
export const SPIRITS_BOSS_ID = 'mil_mascaras';
export const SPIRITS_LORE = 'Una niebla de tinta recorre el bambú. En un antiguo teatro, las máscaras de una compañía olvidada han despertado. Recupera tres sellos para devolverles sus nombres. Una aventura ficticia de fantasía inspirada en el arte de las máscaras de Sichuan; no representa el Festival de Zhongyuan.';

export const SPIRITS_SEALS = Object.freeze([
  { id: 'luz', number: 1, name: 'Sello de la Luz Errante', description: 'Reúne 6 fragmentos de luz en combates PvP válidos.', target: 6 },
  { id: 'mascaras', number: 2, name: 'Sello de las Máscaras', description: 'Inflige 100 de daño al teatro y alcanza al menos dos máscaras distintas.', target: 100 },
  { id: 'nombre', number: 3, name: 'Sello del Nombre Recobrado', description: 'Participa con daño en una victoria comunitaria contra el Guardián.', target: 1 }
]);

export const SPIRITS_REDEMPTIONS = Object.freeze([
  { code: 'zorro', characterId: 'zorro_llamas_errantes', requiredSeals: ['luz', 'mascaras'] },
  { code: 'guardian', characterId: 'guardian_mil_mascaras', requiredSeals: ['luz', 'mascaras', 'nombre'] }
]);

export const SPIRITS_MASKS = Object.freeze([
  { id: 'jade', name: 'Máscara de Jade', ability: 'Bastión del Escenario', description: 'Su defensa aumenta 20. La magia atraviesa parte del bastión.', defense: 20, magicDefense: 6, accuracy: 0 },
  { id: 'azul', name: 'Máscara Azul', ability: 'Velo de los Nombres', description: 'Tus ataques pierden 15 de precisión. Los ataques mágicos disipan el velo.', defense: 0, magicDefense: 0, accuracy: -15 },
  { id: 'carmesi', name: 'Máscara Carmesí', ability: 'Danza del Rostro Roto', description: 'El Guardián se expone: su defensa baja 12 y tus ataques ganan 10 de precisión.', defense: -12, magicDefense: -12, accuracy: 10 }
]);

export function spiritsMaskAt(attackCount) {
  return SPIRITS_MASKS[Math.floor(attackCount / 3) % SPIRITS_MASKS.length];
}

export function spiritsBossDefinition() {
  return { id: SPIRITS_BOSS_ID, name: 'Guardián de las Mil Máscaras', emoji: '🎭', hp: 1800, defense: 26,
    cooldownMs: 30_000, maxAttacks: 20, respawnMs: 86_400_000, durationMs: 86_400_000,
    eventId: SPIRITS_CAMPAIGN_ID, mechanicsVersion: SPIRITS_POLICY_VERSION,
    rewards: { participation: { coins: 60, userXp: 15, tickets: 1 }, top: { coins: 30, userXp: 10, tickets: 0 }, last: { coins: 15, userXp: 5, tickets: 0 } } };
}

export function seedSpiritsCampaign(startsAt = '2026-10-25T06:00:00.000Z') {
  return { id: SPIRITS_CAMPAIGN_ID, code: 'espiritus', revision: 1, policyVersion: 1,
    name: 'La Noche de los Espíritus', description: SPIRITS_LORE, startsAt, endsAt: '2026-11-02T06:00:00.000Z',
    characterIds: ['guardian_mil_mascaras', 'zorro_llamas_errantes'], welcome: { coins: 25, userXp: 10, tickets: 1 } };
}

export function seedSpiritsCharacters() {
  return [
    { id: 'guardian_mil_mascaras', unitPrefix: 'MASC', name: 'Guardián de las Mil Máscaras', rarity: 'legendary', role: 'tank', max: 10,
      baseStats: { hp: 134, attack: 26, defense: 25, speed: 9 }, attackIds: ['guardian_mil_mascaras_1', 'guardian_mil_mascaras_2'],
      combat: { version: 1, element: 'light', ability: { id: 'rostro_cambiante', name: 'Rostro Cambiante', description: 'Entra con 6 de escudo. Al comenzar cada turno propio alterna Jade (6 de escudo), Carmesí (+6% de ataque) y Azul (regenera 4% de vida). Conserva su postura al cambiar.', trigger: 'on_enter',
        effects: [{ type: 'shield', target: 'self', duration: 1, potency: 6 }] } } },
    { id: 'zorro_llamas_errantes', unitPrefix: 'ERRA', name: 'Zorro de las Llamas Errantes', rarity: 'epic', role: 'speed', max: 20,
      baseStats: { hp: 110, attack: 29, defense: 21, speed: 18 }, attackIds: ['zorro_llamas_errantes_1', 'zorro_llamas_errantes_2'],
      combat: { version: 1, element: 'fire', ability: { id: 'fuego_espectral', name: 'Fuego Espectral', description: 'Al entrar aplica quemadura de 2% de vida máxima durante 2 turnos propios del rival.', trigger: 'on_enter',
        effects: [{ type: 'burn', target: 'enemy', duration: 2, potency: 2 }] } } }
  ].map(({ max, ...character }) => ({ ...character, revision: 1, statVariation: { hp: 0, attack: 0, defense: 0, speed: 0 },
    supply: { type: 'limited', max }, obtainable: true, starterEligible: false, eventId: SPIRITS_CAMPAIGN_ID }));
}

export function seedSpiritsAttacks() {
  return [
    { id: 'guardian_mil_mascaras_1', name: 'Golpe del Abanico', element: 'light', power: 25, accuracy: 100, type: 'physical', effects: [], cooldown: 0 },
    { id: 'guardian_mil_mascaras_2', name: 'Danza de las Mil Caras', element: 'light', power: 34, accuracy: 85, type: 'physical', effects: [{ type: 'shield', target: 'self', duration: 2, potency: 8 }], cooldown: 2 },
    { id: 'zorro_llamas_errantes_1', name: 'Ascua Errante', element: 'fire', power: 25, accuracy: 100, type: 'magic', effects: [], cooldown: 0 },
    { id: 'zorro_llamas_errantes_2', name: 'Ilusión de Fuego', element: 'fire', power: 33, accuracy: 85, type: 'magic', effects: [{ type: 'burn', target: 'enemy', duration: 2, potency: 3 }], cooldown: 2 }
  ].map(({ id, name, ...combat }) => ({ id, name, revision: 1, power: combat.power, accuracy: combat.accuracy, type: 'physical', combat: { version: 1, ...combat } }));
}

export const SPIRITS_FATALITIES = Object.freeze({
  guardian_mil_mascaras: { id: 'guardian_mil_mascaras_fatality', name: 'Mil Rostros, un Destino', power: 52, accuracy: 90, type: 'physical', element: 'light', effects: [], cooldown: 0 },
  zorro_llamas_errantes: { id: 'zorro_llamas_errantes_fatality', name: 'Última Llama del Umbral', power: 50, accuracy: 90, type: 'magic', element: 'fire', effects: [], cooldown: 0 }
});
