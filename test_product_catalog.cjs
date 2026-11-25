const test=require('node:test');
const assert=require('node:assert/strict');
const menus=require('./menu-config.js');
const config=require('./hierarchy-config.js');
const fs=require('node:fs');
const vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('./help-index.js','utf8'),context);
const docs=context.window.HELP_TOPICS;

test('demo catalog contains standalone PPDB and PPOB products',()=>{
  assert.deepEqual(menus.map(m=>m.category),['PPDB','PPOB']);
  assert.ok(menus.every(m=>m.intro&&m.featured.length>=4));
});
test('each example product owns distinct modules and needs',()=>{
  const all=[];
  for(const menu of menus){
    const modules=config.products[menu.image];
    assert.ok(modules.length>=2);
    const slugs=modules.flatMap(mod=>mod.topics);
    assert.deepEqual(new Set(slugs),new Set(menu.featured.map(need=>need.slug)));
    for(const need of menu.featured){
      assert.ok(need.description.length>25);
      assert.equal(docs.find(doc=>doc.slug===need.slug)?.description,need.description);
    }
    all.push(...slugs);
  }
  assert.equal(new Set(all).size,all.length);
});
