const names = {
  panda_guerrero: ['Golpe de Bambú', 'Impacto del Panda'],
  mago_carmesi: ['Chispa Carmesí', 'Llamarada'],
  lobo_sombrio: ['Garra Sombría', 'Colmillo Nocturno'],
  monje_celestial: ['Palma Celestial', 'Puño del Alba'],
  guardian_jade: ['Golpe de Jade', 'Martillo del Guardián'],
  bruja_lunar: ['Pulso Lunar', 'Ráfaga de Medianoche'],
  dragon_carmesi: ['Garra del Dragón', 'Aliento Carmesí'],
  espiritu_bambu: ['Toque del Bosque', 'Tormenta de Hojas']
};

export function characterAttackIds(characterId) {
  return names[characterId] ? [`${characterId}_1`, `${characterId}_2`] : ['golpe_basico', 'golpe_potente'];
}

export function seedAttacks() {
  return Object.entries({ general: ['Golpe Básico', 'Golpe Potente'], ...names }).flatMap(([characterId, labels]) => labels.map((name, i) => ({
    id: characterId === 'general' ? ['golpe_basico', 'golpe_potente'][i] : `${characterId}_${i + 1}`,
    revision: 1, name, power: i === 0 ? 25 : 40, accuracy: i === 0 ? 100 : 80, type: 'physical'
  })));
}
