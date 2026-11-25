const test=require('node:test');
const assert=require('node:assert/strict');
const menus=require('./menu-config.js');
const fs=require('node:fs');
const vm=require('node:vm');
const context={window:{}};vm.runInNewContext(fs.readFileSync('./help-index.js','utf8'),context);
const docs=context.window.HELP_TOPICS;
const {topicsForProduct,relatedForProduct}=require('./product-model.js');

test('product topics never include another product',()=>{
  for(const menu of menus){
    const items=topicsForProduct(menu,docs);
    assert.equal(items.length,menu.featured.length,menu.category);
    assert.ok(items.every(d=>d.category===menu.category),menu.category);
  }
  const payment=menus.find(m=>m.image==='ppdb');
  assert.ok(!topicsForProduct(payment,docs).some(d=>d.slug==='ppob-tagihan'));
});
test('local filtering searches only the selected product',()=>{
  const menu=menus.find(m=>m.image==='ppdb');
  assert.equal(topicsForProduct(menu,docs,'formulir').length,1);
  assert.equal(topicsForProduct(menu,docs,'tagihan').length,0);
});
test('related links stay inside the selected product and exclude current topic',()=>{
  const menu=menus.find(m=>m.image==='ppdb');
  const current=docs.find(d=>d.slug==='ppdb-formulir');
  const related=relatedForProduct(menu,current,docs);
  assert.ok(related.length>0 && related.length<=3);
  assert.ok(related.every(d=>d.category===menu.category && d.slug!==current.slug));
});
