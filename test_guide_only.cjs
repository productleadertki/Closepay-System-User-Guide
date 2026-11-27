const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ui=()=>fs.readFileSync('./hierarchy-ui.js','utf8');
const admin=()=>fs.readFileSync('./admin.js','utf8');

test('module and submodule screens retain child navigation alongside optional explanations',()=>{
 const source=ui();
 assert.match(source,/appendPaged\(list,path\.section\.parts/);
 assert.match(source,/moduleKey\(menu\.image,path\.module\.id\)/);
});

test('rich-text editor is available for modules and every submodule level',()=>{
 const source=admin();
 assert.match(source,/\['module','topic','section','part'\]\.includes\(type\)/);
 assert.match(source,/\+ Panduan/);
 assert.match(source,/Submodul 1 baru/);
});

test('new submodule starts without inherited example sections',()=>{
 const admin=fs.readFileSync('./admin.js','utf8');
 assert.match(admin,/s\.hierarchy\.topicSections\[ident\]=\[\]/);
});

test('recommendation labels identify the guide opened by the card',()=>{
 const app=fs.readFileSync('./app.js','utf8');
 assert.match(app,/const guideForDoc=/);
 assert.match(app,/guideForDoc\(doc\)\.title/);
});

test('admin recommendation choices list actual guide titles',()=>{
 const admin=fs.readFileSync('./admin.js','utf8');
 assert.match(admin,/function recommendedGuideLabel/);
 assert.match(admin,/guideLabel\|\|state\.home\.recommended\.includes/);
});

test('reading screen has a document layout distinct from title hierarchy',()=>{
 const source=ui(),html=fs.readFileSync('./index.html','utf8');
 assert.match(source,/reading-view/);
 assert.match(source,/guide-document/);
 assert.match(html,/\.guide-document/);
});
