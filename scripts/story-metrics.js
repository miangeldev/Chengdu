import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { DATA_DIR } from '../CTU-database.js';
import { JsonUnitOfWork } from '../storage/unitOfWork.js';
import { SCHEMA_VERSION } from '../storage/validation.js';
import { requireGame } from '../utils/GameError.js';
import { analyzeStoryProgress, analyzeStoryMessages, storyPreviewMessages } from '../game/story/metrics.js';

const defaultPreview = fileURLToPath(new URL('../docs/whatsapp-preview.md', import.meta.url));

export async function collectStoryMetrics({ directory = DATA_DIR, preview = defaultPreview, now = new Date().toISOString() } = {}) {
  let storage;
  try {
    // A reporting command must not initialize, migrate or recover game files.
    const manifest = JSON.parse(fs.readFileSync(path.join(directory, '_database.json'), 'utf8'));
    requireGame(manifest.database === 'chengdu-cards' && manifest.schemaVersion === SCHEMA_VERSION, 'STORY_METRICS_SCHEMA_REQUIRED');
    requireGame(!fs.existsSync(path.join(directory, '_journal.json')), 'STORY_METRICS_RECOVERY_REQUIRED');
    const previewText = fs.readFileSync(preview, 'utf8');
    storage = new JsonUnitOfWork({ directory });
    const report = await storage.withRead(async repos => analyzeStoryProgress({
      progress: await repos.storyProgress.all(), actions: await repos.storyActions.all(),
      battles: await repos.storyBattles.all(), now
    }));
    return { generatedAt: now, ...report, messages: analyzeStoryMessages(storyPreviewMessages(previewText)) };
  } finally {
    await storage?.close();
  }
}

export async function runStoryMetrics(args, { write = text => console.log(text), writeError = code => console.error(code) } = {}) {
  try {
    let directory = DATA_DIR, preview = defaultPreview, now = new Date().toISOString(), directoryGiven = false;
    for (let index = 0; index < args.length; index++) {
      const argument = args[index];
      if (argument === '--preview' || argument === '--now') {
        const value = args[++index];
        requireGame(typeof value === 'string' && !value.startsWith('--'), 'INVALID_STORY_METRICS_ARGUMENT');
        if (argument === '--preview') preview = value; else now = value;
      } else {
        requireGame(!argument.startsWith('--') && !directoryGiven, 'INVALID_STORY_METRICS_ARGUMENT');
        directory = argument; directoryGiven = true;
      }
    }
    write(JSON.stringify(await collectStoryMetrics({ directory, preview, now }), null, 2));
    return 0;
  } catch (error) {
    const code = typeof error?.code === 'string' && /^[A-Z0-9_]{1,80}$/.test(error.code) ? error.code : 'STORY_METRICS_FAILED';
    writeError(code);
    return 1;
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  process.exitCode = await runStoryMetrics(process.argv.slice(2));
}
