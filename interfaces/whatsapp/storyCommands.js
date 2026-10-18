import { contentOperationKey } from './command.js';
import { requireGame } from '../../utils/GameError.js';
import { renderStory, renderStoryHelp, renderStoryJournal, renderStoryMap, storyJournalArguments } from './storyFormat.js';

export async function storyCommand({ game, identity, args, context, cmd, battleOptions }, direct = null) {
  const sub = (direct ?? args[0] ?? 'estado').toLowerCase();
  const rest = direct ? args : args.slice(1);
  if (sub === 'ayuda') {
    requireGame(rest.length === 0, 'STORY_INVALID_ACTION');
    return renderStoryHelp(cmd);
  }
  const user = await game.users.getUserByIdentity(identity());
  const base = { userId: user.id };
  const operation = action => ({ ...base, operationKey: contentOperationKey(`story:${action}`, context, user.id) });
  let result;
  if (['estado', 'mision', 'inspeccionar', 'pista'].includes(sub)) {
    requireGame(rest.length === 0, 'STORY_INVALID_ACTION');
    result = await game.story.getState(base);
  } else if (['iniciar', 'continuar', 'reintentar'].includes(sub)) {
    requireGame(rest.length === 0, 'STORY_INVALID_ACTION');
    const action = { iniciar: 'start', continuar: 'continue', reintentar: 'retry' }[sub];
    result = await game.story[action](operation(action));
  } else if (sub === 'elegir') {
    requireGame(rest.length === 1 && /^[1-4]$/.test(rest[0]), 'STORY_INVALID_CHOICE');
    result = await game.story.choose({ ...operation('choose'), choice: rest[0] });
  } else if (['atacar', 'defender', 'habilidad', 'cambiar', 'rendirse', 'observar', 'romper'].includes(sub)) {
    const requiresChoice = ['atacar', 'cambiar'].includes(sub);
    requireGame(requiresChoice ? rest.length === 1 && (sub === 'atacar' ? /^[12]$/ : /^[1-3]$/).test(rest[0]) : rest.length === 0, sub === 'cambiar' ? 'STORY_INVALID_SWITCH' : 'STORY_INVALID_ACTION');
    const action = { atacar: 'attack', defender: 'defend', habilidad: 'skill', cambiar: 'switch', rendirse: 'surrender', observar: 'observe', romper: 'break' }[sub];
    result = await game.story.act({ ...operation('act'), action, ...(requiresChoice ? { choice: rest[0] } : {}) });
  } else if (['diario', 'recuerdos'].includes(sub)) {
    const options = storyJournalArguments(sub === 'recuerdos' ? ['recuerdos', ...rest] : rest);
    return renderStoryJournal(await game.story.getJournal(base), cmd, options);
  } else if (['mapa', 'capitulos'].includes(sub)) {
    requireGame(rest.length === 0, 'STORY_INVALID_ACTION');
    return renderStoryMap(await game.story.getMap(base), cmd);
  } else requireGame(false, 'STORY_INVALID_ACTION');
  return renderStory(result, cmd, { ...battleOptions, inspect: ['inspeccionar', 'pista'].includes(sub) });
}
