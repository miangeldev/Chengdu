import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, section } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuayuda', async ({ cmd }) => card('📖 *Guía del jugador*', [
  section('🌱 *Comienza tu aventura*', `${cmd('cturegistro', 'Tu nombre')}\nCrear tu cuenta.\n\n${cmd('ctustarter')}\nElegir tu primer personaje.`),
  section('🎴 *Tu colección*', `${cmd('ctuperfil')}\nPerfil y progreso.\n\n${cmd('ctupersonajes')}\nVer tus unidades.\n\n${cmd('ctuunidad', 'ID')}\nFicha y propietario.\n\n${cmd('ctucatalogo')}\nExplorar personajes.`),
  section('🛡️ *Prepara tu equipo*', `${cmd('ctuequipo')}\nConsultar tu unidad activa.\n\n${cmd('ctuequipo', 'usar ID')}\nSeleccionar una unidad propia.\n\n${cmd('ctuequipo', 'limpiar')}\nVaciar tu equipo.`),
  section('⚔️ *Combate en grupos*', `${cmd('ctupelea', '@jugador')}\nDesafiar a otro jugador.\n\n${cmd('ctuaceptar')}\nAceptar el desafío.\n\n${cmd('cturechazar')}\nRechazar el desafío recibido.\n\n${cmd('ctucancelar')}\nRetirar el desafío que enviaste.\n\n${cmd('ctuatacar', '1')} o ${cmd('ctuatacar', '2')}\nAtacar cuando sea tu turno.\n\n${cmd('ctucombate')}\nVer estado y ataques disponibles.\n\n${cmd('cturendirse')}\nTerminar el combate por rendición.`)
], '💡 Cada unidad es única: conserva su ID, serial y procedencia.'));
