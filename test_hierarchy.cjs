const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const menus=require('./menu-config.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync('./help-index.js','utf8'),context);
const topics=context.window.HELP_TOPICS;
const config=require('./hierarchy-config.js');
const {modulesForProduct,resolvePath}=require('./hierarchy-model.js');

test('every product has its own modules covering each need exactly once',()=>{
  for(const menu of menus){
    const modules=modulesForProduct(menu,config,topics);
    assert.ok(modules.length>=2,menu.category);
    const slugs=modules.flatMap(module=>module.topics.map(topic=>topic.slug));
    assert.equal(new Set(slugs).size,slugs.length,menu.category);
    assert.deepEqual(new Set(slugs),new Set(menu.featured.map(need=>need.slug)),menu.category);
  }
});
test('path reaches five levels and rejects mismatched descendants',()=>{
  const menu=menus.find(m=>m.image==='ppdb');
  const full=resolvePath(menu,config,topics,{module:'pendaftaran',topic:'ppdb-formulir',section:'proses',part:'langkah'});
  assert.deepEqual([full.module?.id,full.topic?.slug,full.section?.id,full.part?.id],['pendaftaran','ppdb-formulir','proses','langkah']);
  const changed=resolvePath(menu,config,topics,{module:'seleksi',topic:'ppdb-formulir',section:'proses',part:'langkah'});
  assert.equal(changed.module?.id,'seleksi');
  assert.equal(changed.topic,null);assert.equal(changed.section,null);assert.equal(changed.part,null);
});
test('sections belong to each product and invalid child resets',()=>{
  const ppdb=menus.find(m=>m.image==='ppdb');
  const ppob=menus.find(m=>m.image==='ppob');
  const invalid=resolvePath(ppdb,config,topics,{module:'pendaftaran',topic:'ppdb-formulir',section:'persiapan',part:'langkah'});
  assert.equal(invalid.section?.id,'persiapan');assert.equal(invalid.part,null);
  const other=resolvePath(ppob,config,topics,{module:'pembayaran',topic:'ppob-transaksi',section:'proses',part:'langkah'});
  assert.equal(other.section,null);assert.equal(other.part,null);
  assert.notDeepEqual(config.sections.ppdb.map(s=>s.id),config.sections.ppob.map(s=>s.id));
});
