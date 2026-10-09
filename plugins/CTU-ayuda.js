import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, section } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuayuda', async ({ cmd }) => card('AYUDA', [
  section('🌱 *Empezar*', `${cmd('cturegistro', 'Nombre')} · Registro\n${cmd('ctustarter')} · Primer personaje`),
  section('🎴 *Colección*', `${cmd('ctuperfil')} · Tu progreso\n${cmd('ctupersonajes')} · Elegir unidad\n${cmd('ctucatalogo')} · Ver personajes\n${cmd('ctuficha', '[ID o personaje]')} · Stats y precisión\n${cmd('ctuunidad', 'ID')} · Propietario y procedencia`),
  section('🛡️ *Equipo*', `${cmd('ctuequipo')} · Ver equipo\n${cmd('ctuequipo', 'usar ID')} · Seleccionar\n${cmd('ctuequipo', 'limpiar')} · Vaciar`),
  section('✨ *Progreso*', `${cmd('ctubalance')} · Saldo y recompensas\n${cmd('ctuhistorial')} · Tus partidas\n${cmd('ctuhistorial', 'ID')} · Turnos y recompensa`),
  section('⚔️ *Combate en grupo*', `${cmd('ctupelea', '@jugador')} · Desafiar\n${cmd('ctuaceptar')} / ${cmd('cturechazar')} · Responder\n${cmd('ctucancelar')} · Retirar desafío\n${cmd('ctuatacar', '1')} / ${cmd('ctuatacar', '2')} · Atacar\n${cmd('ctucombate')} · Ver turno\n${cmd('cturendirse')} · Rendirse`)
]));
