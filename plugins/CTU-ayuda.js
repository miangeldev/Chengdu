import { defineCommand } from '../interfaces/whatsapp/command.js';
import { card, section } from '../interfaces/whatsapp/format.js';

export const { command, run, createRun } = defineCommand('ctuayuda', async ({ cmd }) => card('AYUDA', [
  section('🌱 *Empezar*', `${cmd('cturegistro', 'Nombre')} · Registro\n${cmd('ctustarter')} · Primer personaje`),
  section('🎴 *Colección*', `${cmd('ctuperfil')} · Tu progreso\n${cmd('ctupersonajes')} · Elegir unidad\n${cmd('ctucatalogo')} · Ver personajes\n${cmd('ctuficha', '[ID o personaje]')} · Stats y precisión\n${cmd('ctuunidad', 'ID')} · Propietario y procedencia`),
  section('🎁 *Sobres*', `${cmd('ctusobres')} · Precios y probabilidades\n${cmd('ctuabrir', 'basico')} · Obtener un personaje`),
  section('💰 *Economía*', `${cmd('ctudiario')} · +100 ChengCoins cada 24 h\n${cmd('ctutienda')} · Comprar sobres\n${cmd('ctumovimientos')} · Tus ingresos y gastos`),
  section('🛍️ *Mercado*', `${cmd('ctumercado')} · Unidades en venta\n${cmd('ctumercado', 'raro')} / ${cmd('ctumercado', 'precio')} · Filtrar\n${cmd('ctuvender', 'ID PRECIO')} · Publicar una unidad\n${cmd('ctucomprar', 'ANUNCIO')} · Comprar\n${cmd('ctumercado', 'mios')} · Tus anuncios\n${cmd('cturetirar', 'ANUNCIO')} · Retirar\n${cmd('ctuventas')} · Tus compras y ventas\n${cmd('ctupropiedad', 'ID')} · Historia de propietarios`),
  section('🛡️ *Equipo*', `${cmd('ctuequipo')} · Ver equipo\n${cmd('ctuequipo', 'usar ID')} · Seleccionar\n${cmd('ctuequipo', 'limpiar')} · Vaciar`),
  section('✨ *Progreso*', `${cmd('ctubalance')} · Saldo y recompensas\n${cmd('ctuhistorial')} · Tus partidas\n${cmd('ctuhistorial', 'ID')} · Turnos y recompensa`),
  section('⚔️ *Combate en grupo*', `${cmd('ctupelea', '@jugador')} · Desafiar\n${cmd('ctuaceptar')} / ${cmd('cturechazar')} · Responder\n${cmd('ctucancelar')} · Retirar desafío\n${cmd('ctuatacar', '1')} / ${cmd('ctuatacar', '2')} · Atacar\n${cmd('ctucombate')} · Ver turno\n${cmd('cturendirse')} · Rendirse`)
]));
