import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

test('direct plugin run exports share one database and complete the game flow', async t => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'chengdu-plugin-loader-'));
  t.after(() => fs.rmSync(directory, { recursive: true, force: true }));
  const root = fileURLToPath(new URL('../', import.meta.url));
  for (const entry of ['plugins', 'interfaces', 'game', 'storage', 'repositories', 'utils', 'CTU-database.js', 'CTU-config.js', 'package.json']) {
    fs.cpSync(path.join(root, entry), path.join(directory, entry), { recursive: true });
  }
  fs.mkdirSync(path.join(directory, 'ChengdúData'));
  fs.copyFileSync(path.join(root, 'ChengdúData/databases.js'), path.join(directory, 'ChengdúData/databases.js'));
  const { commands } = await import(pathToFileURL(path.join(directory, 'interfaces/whatsapp/index.js')));
  const { game } = await import(pathToFileURL(path.join(directory, 'game/index.js')));
  const plugins = new Map(commands.map(plugin => [plugin.command, plugin]));
  const replies = [];
  const sock = { sendMessage: async (_, payload) => replies.push(payload.text) };
  const alice = '521111111111@s.whatsapp.net';
  const bob = '521222222222@s.whatsapp.net';
  let sequence = 0;
  async function run(command, sender = alice, args = [], mentions = []) {
    await plugins.get(command).run(sock, {
      key: { remoteJid: '120363111@g.us', participant: sender, id: 'message-' + ++sequence },
      message: { extendedTextMessage: { contextInfo: { mentionedJid: mentions } } }
    }, args);
    assert.doesNotMatch(replies.at(-1), /No pude confirmar|Revisa tu comando/);
  }
  try {
    await run('ctuficha', alice, ['panda']);
    await run('cturegistro', alice, ['Alice']);
    await run('cturegistro', bob, ['Bob']);
    await run('ctuperfil');
    await run('ctucatalogo');
    await run('ctustarter');
    await run('ctustarter', alice, ['panda']);
    await run('ctustarter', bob, ['lobo']);
    await run('ctupersonajes');
    await run('ctuunidad', alice, ['PAND-000001']);
    await run('ctuayuda');
    await run('ctuequipo', alice, ['usar', 'PAND-000001']);
    await run('ctuequipo', bob, ['usar', 'LOBO-000001']);
    await run('ctuficha');
    await run('ctupelea', alice, ['@Bob', 'clasico'], [bob]);
    await run('ctuaceptar', bob);
    await run('ctucombate');
    await run('ctuatacar', bob, ['1']);
    await run('cturendirse');
    await run('ctupelea', alice, ['@Bob', 'clasico'], [bob]);
    await run('cturechazar', bob);
    await run('ctupelea', alice, ['@Bob', 'clasico'], [bob]);
    await run('ctucancelar');
    await run('ctubalance');
    await run('ctudiario');
    await run('ctutienda');
    await run('ctumovimientos');
    await run('ctuhistorial');
    await run('ctusobres');
    await run('ctuabrir', alice, ['basico']);
    await run('ctumercado');
    await run('ctuvender', alice, ['PAND-000001', '20']);
    const listing = (await game.market.listListings()).items[0];
    await run('ctumercado', alice, [listing.code]);
    await run('ctudiario', bob);
    await run('ctucomprar', bob, [listing.code]);
    await run('ctuventas');
    await run('ctupropiedad', bob, ['PAND-000001']);
    await run('ctuvender', bob, ['PAND-000001', '20']);
    const resale = (await game.market.listListings()).items[0];
    await run('cturetirar', bob, [resale.code]);
    const seller = await game.users.getUserByIdentity({ provider: 'whatsapp', subject: alice });
    const team = [];
    for (const characterId of ['monje_celestial', 'mago_carmesi']) team.push(await game.units.createUnit({ ownerId: seller.id, characterId,
      origin: { type: 'admin', sourceId: 'plugin-loader-test' }, operationKey: `loader:${characterId}` }));
    await run('ctuequipo', alice, ['usar', ...team.map(unit => unit.id)]);
    await run('ctuequipo', bob, ['usar', 'LOBO-000001', 'PAND-000001']);
    await run('ctupelea', alice, ['@Bob', '2v2'], [bob]);
    await run('ctuaceptar', bob);
    await run('ctucambiar', bob, ['2']);
    await run('cturendirse', alice);
    await run('ctumisiones');
    await run('ctulogros');
    await run('ctuinventario');
    await run('ctuboss');
    const boss = await game.encounters.getBoss({ userId: seller.id });
    await run('ctubossatacar', alice, ['1', boss.code]);
    await run('ctubosstop', alice, [boss.code]);
    await run('ctuspawn');
    await run('ctucapturar');
    await run('ctuexplorar');
    await run('ctueventos');
    await run('ctuevento', alice, ['faroles']);
    assert.deepEqual(await game.validateDatabase(), {
      valid: true, schemaVersion: 9, users: 2, characters: 10, units: 4, claims: 2
    });
    assert.equal(replies.length, 56);
    assert.equal(commands.length, 41);
  } finally {
    await game.close();
  }
});
