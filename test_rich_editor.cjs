const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
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

test('inline image source accepts raster data but rejects active or oversized data',()=>{
 const context={URL,location:{href:'http://127.0.0.1:8766/'}};
 vm.runInNewContext(fs.readFileSync('./rich-text.js','utf8'),context);
 const safe=context.HelpRichText.safeImageSrc;
 assert.equal(safe('data:image/png;base64,aGVsbG8='),'data:image/png;base64,aGVsbG8=');
 assert.equal(safe('data:image/svg+xml;base64,PHN2Zz4='),null);
 assert.equal(safe('javascript:alert(1)'),null);
 assert.equal(safe('data:image/png;base64,'+'A'.repeat(1500001)),null);
});

test('Markdown content can hold a permitted inline photo without duplicated HTML',()=>{
 const data=state();data.content['ppdb-formulir/persiapan/persyaratan']={body:'Foto',markdown:'![Foto](data:image/png;base64,'+'A'.repeat(1200000)+')'};
 assert.deepEqual(model.validate(data),[]);
});

test('admin places uploaded photos at the writing cursor instead of a separate field',()=>{
 const admin=fs.readFileSync('./admin.js','utf8');
 assert.match(admin,/inline-image-input/);
 assert.match(admin,/source\.setRangeText\(/);
 assert.match(admin,/pendingImage/);
 assert.doesNotMatch(admin,/media-upload-preview/);
});

test('viewer renders Markdown-only inline photos in the article body',()=>{
 const viewer=fs.readFileSync('./hierarchy-ui.js','utf8'),page=fs.readFileSync('./index.html','utf8');
 assert.match(viewer,/HelpMarkdown\.toHtml\(data\.markdown\)/);
 assert.match(page,/vendor\/marked\.umd\.js/);
 assert.match(page,/help-markdown\.js/);
});

test('inline data images load eagerly to avoid zero-size lazy placeholders',()=>{
 const source=fs.readFileSync('./rich-text.js','utf8');
 assert.match(source,/setAttribute\('loading',src\.startsWith\('data:'\)\?'eager':'lazy'\)/);
});

test('typography and image width accept only a fixed safe set',()=>{
 const context={URL,location:{href:'http://127.0.0.1:8766/'}};
 vm.runInNewContext(fs.readFileSync('./rich-text.js','utf8'),context);
 const allowed=context.HelpRichText.formatOk;
 assert.equal(allowed('font','serif'),true);
 assert.equal(allowed('size','large'),true);
 assert.equal(allowed('align','center'),true);
 assert.equal(allowed('width','50'),true);
 assert.equal(allowed('size','999px'),false);
 assert.equal(allowed('font','url(javascript:alert(1))'),false);
 assert.equal(allowed('width','expression(1)'),false);
});

test('Markdown conversion keeps safe font, size, alignment and image width markup',()=>{
 const converter=fs.readFileSync('./help-markdown.js','utf8');
 assert.match(converter,/addRule\('styledSpan'/);
 assert.match(converter,/addRule\('alignedBlock'/);
 assert.match(converter,/addRule\('resizedImage'/);
});

test('editor exposes font, text size, alignment and image size controls',()=>{
 const admin=fs.readFileSync('./admin.js','utf8'),style=fs.readFileSync('./admin.html','utf8');
 assert.match(admin,/Ukuran teks/);
 assert.match(admin,/Jenis font/);
 assert.match(admin,/Ukuran gambar/);
 assert.match(admin,/Rata tengah/);
 assert.match(style,/data-size=large/);
 assert.match(style,/data-width="50"/);
});
