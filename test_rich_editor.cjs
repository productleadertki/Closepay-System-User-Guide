const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const menus=require('./menu-config.js');
const hierarchy=require('./hierarchy-config.js');
const home=require('./home-config.js');
const model=require('./help-admin-model.js');
const state=()=>model.makeState(menus,hierarchy,home);

test('admin accepts formatted article content and rejects invalid HTML payloads',()=>{
 const data=state();data.content['ppdb-formulir']={body:'Judul Isi',html:'<h2>Judul</h2><p><strong>Isi</strong></p>'};
 assert.deepEqual(model.validate(data),[]);
 data.content['ppdb-formulir'].html={unsafe:true};
 assert.ok(model.validate(data).some(message=>message.includes('konten')));
});

test('admin provides a word-like editor for guide content',()=>{
 const admin=fs.readFileSync('./admin.js','utf8');const page=fs.readFileSync('./admin.html','utf8');
 assert.match(admin,/contenteditable/);
 assert.match(admin,/rich-toolbar/);
 assert.match(admin,/HelpRichText/);
 assert.match(page,/rich-text\.js/);
});

test('public guide renders sanitized formatted content without replacing legacy text',()=>{
 const viewer=fs.readFileSync('./hierarchy-ui.js','utf8');const page=fs.readFileSync('./index.html','utf8');
 assert.match(viewer,/HelpRichText/);
 assert.match(viewer,/\.html/);
 assert.match(page,/rich-text\.js/);
 assert.match(viewer,/appendBody/);
 assert.match(page,/\.rich-body table/);
 assert.match(page,/\.article-video/);
});

test('media URLs are validated and table markup is supported',()=>{
 const data=state();data.content['ppdb-formulir']={video:'javascript:alert(1)'};
 assert.ok(model.validate(data).some(message=>message.includes('konten')));
 data.content['ppdb-formulir'].video='https://www.youtube.com/watch?v=dQw4w9WgXcQ';
 assert.deepEqual(model.validate(data),[]);
 const source=fs.readFileSync('./rich-text.js','utf8');
 assert.match(source,/['"]table['"]/);
 assert.match(source,/function safeVideo/);
});
