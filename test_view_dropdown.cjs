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

test('article content is rendered only in the reading view at the selected level',()=>{
 const ui=fs.readFileSync('./hierarchy-ui.js','utf8');
 const start=ui.indexOf('if(path.reading){'),end=ui.indexOf('}else if(!path.section){',start);
 assert.ok(start>=0&&end>start,'guide content must be confined to the reading view');
 const reading=ui.slice(start,end),titles=ui.slice(end,ui.indexOf('article.append(content)',end));
 assert.match(reading,/path\.topic\.slug\+\(path\.section\?/);
 assert.match(reading,/appendBody\(content,data\)/);
 assert.doesNotMatch(titles,/appendBody\(/);
});
