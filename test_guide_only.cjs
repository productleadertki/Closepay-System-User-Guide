const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const ui=()=>fs.readFileSync('./hierarchy-ui.js','utf8');
const admin=()=>fs.readFileSync('./admin.js','utf8');

test('module and submodule title screens have no article action of their own',()=>{
 const source=ui(),titles=source.slice(source.indexOf('}else if(!path.topic){'),source.indexOf('article.append(content)'));
 assert.doesNotMatch(titles,/Baca panduan '\+path\.(topic|section)/);
 assert.match(titles,/path\.section\.parts\.forEach/);
});

test('guide is the only new rich-text entity in admin',()=>{
 const source=admin();
 assert.match(source,/\['part'\]\.includes\(type\)/);
 assert.match(source,/\+ Panduan/);
 assert.match(source,/Submodul 1 baru/);
 assert.doesNotMatch(source,/\['topic','section','part'\]\.includes\(type\)/);
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
