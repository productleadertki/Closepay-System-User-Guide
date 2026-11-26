const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');

test('reader exposes a nested product-only dropdown independent of the sidebar',()=>{
 const ui=fs.readFileSync('./hierarchy-ui.js','utf8');
 assert.match(ui,/guide-dropdown/);
 assert.match(ui,/guide-branch/);
 assert.match(ui,/guide-jump-link/);
 assert.match(ui,/toolbar\.append\(sidebarToggle,guideDropdown/);
 const html=fs.readFileSync('./index.html','utf8');
 assert.match(html,/\.guide-dropdown\[open\]/);
});

test('content is scoped to its selected module, submodule or guide',()=>{
 const ui=fs.readFileSync('./hierarchy-ui.js','utf8');
 assert.match(ui,/root\.HelpAdminModel\.moduleKey\(menu\.image,path\.module\.id\)/);
 assert.match(ui,/contentData\[path\.topic\.slug\]/);
 assert.match(ui,/contentData\[path\.topic\.slug\+'\/'\+path\.section\.id\]/);
 assert.match(ui,/appendBody\(content,data\)/);
});
