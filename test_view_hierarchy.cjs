const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');

const app=()=>fs.readFileSync('./app.js','utf8');
const ui=()=>fs.readFileSync('./hierarchy-ui.js','utf8');

test('guide links open an explicit reading route while hierarchy links open titles',()=>{
  const source=app();
  assert.ok(source.includes("'#/baca/'"));
  assert.match(source,/reading:/);
  assert.match(source,/const docPath=doc=>/);
  assert.match(source,/section\.parts\?\.length/);
  const view=ui();
  assert.match(view,/const readUrl=/);
  assert.match(view,/jump\('Buka panduan /);
});

test('a submodule explanation without a child guide opens its submodule page',()=>{
  const source=app();
  const expression=source.match(/const guideForDoc=(.*);\r?\nconst docPath=/)?.[1];
  assert.ok(expression,'guideForDoc route helper exists');
  const guideForDoc=vm.runInNewContext('('+expression+')',{
    menus:[{image:'test',category:'Test'}],window:{HELP_HIERARCHY:{topicSections:{topic:[]},sections:{test:[]}},HELP_CONTENT:{topic:{body:'Penjelasan konsep'}}},encodeURIComponent
  });
  assert.equal(guideForDoc({slug:'topic',title:'Submodul Uji',category:'Test'}).path,'#/panduan/topic');
  assert.doesNotMatch(ui(),/return hasLegacy\(topic\.slug\)\?readUrl\(topic\):topicUrl\(topic\)/);
});

test('module and submodule views can show optional explanations without hiding child guides',()=>{
  const view=ui();
  assert.match(view,/if\(path\.reading\)/);
  assert.match(view,/else if\(!path\.topic\)/);
  assert.match(view,/else if\(!path\.section\)/);
  assert.match(view,/else if\(!path\.part\)/);
  assert.match(view,/contentData\[path\.topic\.slug\]/);
});

test('viewer exposes a nested product-local dropdown with guide actions',()=>{
  const view=ui(),html=fs.readFileSync('./index.html','utf8');
  assert.match(view,/guide-dropdown/);
  assert.match(view,/guide-module/);
  assert.match(view,/guide-topic/);
  assert.match(view,/guide-section/);
  assert.match(html,/\.guide-dropdown-panel/);
  assert.match(html,/\.product-workspace\{[^}]*align-content:start/);
});

test('reader has no product overview action or separate references panel',()=>{
 const view=ui();
 assert.doesNotMatch(view,/Ikhtisar produk|Ikhtisar '\+menu\.category/);
 assert.doesNotMatch(view,/guide-toc|Panduan lain dalam produk ini/);
 assert.match(view,/guideDocument\.append\(content\)/);
});

test('product view omits duplicate module overview and count copy',()=>{
 const view=ui();
 assert.doesNotMatch(view,/Modul dalam produk ini|modul · '.+?' kebutuhan'/);
 assert.doesNotMatch(view,/Navigasi modul dan panduan · /);
 assert.match(view,/guide-dropdown/);
});

test('hierarchy lists offer a fifteen-item progressive limit with selected item visible',()=>{
 const view=ui();
 assert.match(view,/const PAGE_SIZE=15/);
 assert.match(view,/function appendPaged\(/);
 assert.match(view,/selectedIndex/);
 assert.match(view,/Math\.floor\(selectedIndex\/PAGE_SIZE\)\*PAGE_SIZE/);
 assert.match(view,/items\.slice\(start,start\+PAGE_SIZE\)/);
 assert.match(view,/Lihat '\+Math\.min\(PAGE_SIZE,items\.length-start-PAGE_SIZE\)\+' lainnya/);
});

test('hierarchy dropdown has an explicit expandable affordance',()=>{
 const view=ui(),html=fs.readFileSync('./index.html','utf8');
 assert.match(view,/guide-dropdown-toggle/);
 assert.match(html,/\.guide-dropdown-toggle:after\{content:'▾'/);
});

test('image-only Markdown counts as article content and suppresses sample image',()=>{
 const view=ui();
 assert.match(view,/!data\.body&&!data\.html&&!data\.markdown&&!data\.image/);
 assert.match(view,/!data\.markdown&&!data\.html&&!data\.body&&!path\.section/);
});
