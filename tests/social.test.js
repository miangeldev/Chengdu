import test from 'node:test';import assert from 'node:assert/strict';import { setup,register,readRecords } from './helpers.js';import { craftingFixture,fightForMaterials } from './crafting-fixtures.js';
test('public profiles show favorites, showcase and earned titles without exposing identities, wallet or operation keys',async t=>{
 const c=await craftingFixture(t);await fightForMaterials(c);await c.game.social.getTitles(c.user.id);
 await c.game.social.updatePreferences({userId:c.user.id,operationKey:'profile',favoriteUnitId:c.unit.id,featuredUnitIds:[c.unit.id],bio:'Amo el bambú',selectedTitleCode:'L1'});
 const p=await c.game.social.getProfile({userId:c.user.id,viewerId:c.rival.id});assert.equal(p.favorite.name,'Panda Guerrero');assert.equal(p.title.code,'L1');assert.equal(p.bio,'Amo el bambú');assert.equal(p.isSelf,false);
 assert.doesNotMatch(JSON.stringify(p),/@s.whatsapp.net|economy|operationKey|identities/);const s=await c.game.social.getShowcase({userId:c.user.id});assert.equal(s.highlights.oldest.id,c.unit.id);assert.equal(s.favorite.id,c.unit.id);
 const compare=await c.game.social.compareUnits({userId:c.user.id,unitIds:[c.unit.id,c.opponentUnit.id]});assert.equal(compare.units.length,2);
 await assert.rejects(c.game.social.updatePreferences({userId:c.user.id,operationKey:'unearned',selectedTitleCode:'L4'}),{code:'SOCIAL_TITLE_NOT_EARNED'});
 await assert.rejects(c.game.social.updatePreferences({userId:c.user.id,operationKey:'stolen',favoriteUnitId:c.opponentUnit.id}),{code:'UNIT_NOT_OWNED'});
 await assert.rejects(c.game.social.updatePreferences({userId:c.user.id,operationKey:'badbio',bio:'line\nline'}),{code:'INVALID_SOCIAL_BIO'});
});
test('favorites and featured ownership references survive transfer history but stop displaying traded units',async t=>{
 const c=await craftingFixture(t);await c.game.social.updatePreferences({userId:c.user.id,operationKey:'favorite',favoriteUnitId:c.unit.id,featuredUnitIds:[c.unit.id]});
 await c.game.trades.create({userId:c.user.id,opponentId:c.rival.id,chatId:c.chatId,operationKey:'trade'});
 await c.game.trades.setOffer({userId:c.user.id,chatId:c.chatId,code:'I1',unitIds:[c.unit.id],operationKey:'offer1'});await c.game.trades.setOffer({userId:c.rival.id,chatId:c.chatId,code:'I1',unitIds:[c.opponentUnit.id],operationKey:'offer2'});
 await c.game.trades.confirm({userId:c.user.id,chatId:c.chatId,code:'I1',operationKey:'confirm1'});await c.game.trades.confirm({userId:c.rival.id,chatId:c.chatId,code:'I1',operationKey:'confirm2'});
 const p=await c.game.social.getProfile({userId:c.user.id});assert.equal(p.favorite,null);assert.deepEqual(p.featured,[]);assert.equal(readRecords(c.directory,'perfilessociales')[0].preferences.favorite.unitId,c.unit.id);
 assert.equal((await c.game.validateDatabase()).valid,true);await c.game.close();Object.assign(c,c.open({clock:()=>null}));assert.equal((await c.game.social.updatePreferences({userId:c.user.id,operationKey:'favorite',favoriteUnitId:c.unit.id,featuredUnitIds:[c.unit.id]})).alreadyUpdated,true);
});
test('social changes require immutable receipts and current ownership',async t=>{
 const c=setup(t,{clock:()=> '2026-10-13T08:00:00.000Z'}),u=await register(c.game);await c.game.social.updatePreferences({userId:u.id,operationKey:'bio',bio:'Hola'});
 await assert.rejects(c.storage.withTransaction(async repos=>{const p=await repos.socialProfiles.get(`social:${u.id}`);await repos.socialProfiles.replace({...p,preferences:{...p.preferences,bio:'Forged'}});}),{code:'DATABASE_CORRUPT'});
 await assert.rejects(c.storage.withTransaction(async repos=>{const a=(await repos.socialActions.all())[0];await repos.socialActions.replace({...a,after:{...a.after,bio:'Alterado'}});}),{code:'DATABASE_CORRUPT'});
});
