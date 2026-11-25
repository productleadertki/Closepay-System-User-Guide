const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('article workspace has an accessible control to show and hide its sidebar',()=>{
  const ui=fs.readFileSync('./hierarchy-ui.js','utf8');
  assert.match(ui,/sidebar-toggle/);
  assert.match(ui,/aria-controls/);
  assert.match(ui,/aria-expanded/);
  assert.match(ui,/sidebar-collapsed/);
});
test('search shortcut reopens hidden navigation before focusing product search',()=>{
  const app=fs.readFileSync('./app.js','utf8');
  assert.match(app,/sidebar-collapsed/);
  assert.match(app,/sidebar-toggle/);
});

test('collapsed sidebar lets the article occupy the full width',()=>{
  const html=fs.readFileSync('./index.html','utf8');
  assert.match(html,/\.sidebar-collapsed \.workspace-sidebar\{display:none\}/);
  assert.match(html,/\.sidebar-collapsed\{grid-template-columns:minmax\(0,1fr\)\}/);
  assert.match(html,/\.workspace-article \.article-content\{max-width:none\}/);
});
