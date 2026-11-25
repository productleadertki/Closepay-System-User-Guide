const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

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

test('module and submodule title views defer their written content to the reading view',()=>{
  const view=ui();
  assert.match(view,/if\(path\.reading\)/);
  assert.match(view,/Baca panduan/);
  assert.match(view,/else if\(!path\.topic\)/);
  assert.match(view,/else if\(!path\.section\)/);
  assert.match(view,/else if\(!path\.part\)/);
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
