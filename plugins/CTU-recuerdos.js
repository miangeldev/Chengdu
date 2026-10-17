import { defineCommand } from '../interfaces/whatsapp/command.js';
import { storyCommand } from '../interfaces/whatsapp/storyCommands.js';

export const { command, run, createRun } = defineCommand('cturecuerdos', context => storyCommand(context, 'recuerdos'));
