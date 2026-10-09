import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { atomicWrite, parseJSON, readText, syncDirectory } from './storage/files.js';
import { requireGame } from './utils/GameError.js';

export const DATA_DIR = fileURLToPath(new URL('./ChengdúData/', import.meta.url));

// Compatibility helper for standalone files. Game data uses JsonUnitOfWork instead.
export function crearDatabase(nombre, valorInicial = {}, { directory = DATA_DIR, maintenance = false } = {}) {
  requireGame(typeof nombre === 'string' && /^[A-Za-z0-9_-]+(?:\.json)?$/.test(nombre), 'INVALID_DATABASE_NAME');
  const ruta = path.join(path.resolve(directory), nombre.endsWith('.json') ? nombre : `${nombre}.json`);
  function assertStandalone() {
    const managed = ['usuarios.json', 'personajes.json', 'unidades.json', 'estado.json', 'eventos.json', 'ataques.json', 'combates.json', 'recompensas.json', '_database.json', '_journal.json'];
    requireGame(!managed.includes(path.basename(ruta)) ||
      (!fs.existsSync(path.join(path.dirname(ruta), '_database.json')) && !fs.existsSync(path.join(path.dirname(ruta), '.writer.lock'))), 'MANAGED_DATABASE_FILE');
  }
  function guardar(data) {
    assertStandalone();
    const previous = readText(ruta);
    if (previous !== null) parseJSON(previous, ruta);
    const encoded = JSON.stringify(data, null, 2);
    requireGame(typeof encoded === 'string', 'INVALID_DATABASE_DATA');
    const result = parseJSON(encoded, ruta);
    fs.mkdirSync(path.dirname(ruta), { recursive: true, mode: 0o700 });
    atomicWrite(ruta, encoded + '\n');
    return result;
  }
  function cargar() {
    assertStandalone();
    const text = readText(ruta);
    if (text !== null) return parseJSON(text, ruta);
    return guardar(valorInicial);
  }
  function existe() { return fs.existsSync(ruta); }
  function eliminar() {
    requireGame(maintenance, 'MAINTENANCE_REQUIRED');
    assertStandalone();
    if (!existe()) return false;
    fs.unlinkSync(ruta);
    syncDirectory(path.dirname(ruta));
    return true;
  }
  return { cargar, guardar, existe, eliminar };
}
