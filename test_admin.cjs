const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const menus=require('./menu-config.js');
const hierarchy=require('./hierarchy-config.js');
const home=require('./home-config.js');
const context={window:{}};vm.runInNewContext(fs.readFileSync('./help-index.js','utf8'),context);
const model=require('./help-admin-model.js');
const initial=()=>model.makeState(menus,hierarchy,home);

test('admin creates an isolated product, module, topic, section and part',()=>{
 const s=initial();s.menus.push({category:'Koperasi',image:'koperasi',intro:'Panduan koperasi',featured:[]});s.hierarchy.products.koperasi=[{id:'anggota',label:'Keanggotaan',topics:['koperasi-daftar']}];s.hierarchy.sections.koperasi=[];
 s.menus.at(-1).featured.push({slug:'koperasi-daftar',label:'Daftar anggota',description:'Cara mendaftar'});
 s.hierarchy.topicSections['koperasi-daftar']=[{id:'persiapan',label:'Persiapan',parts:[{id:'dokumen',label:'Dokumen'}]}];
 s.content['koperasi-daftar/persiapan/dokumen']={body:'Siapkan KTP.'};
 assert.deepEqual(model.validate(s),[]);
 const docs=model.deriveTopics(s);assert.equal(docs.at(-1).category,'Koperasi');assert.equal(docs.at(-1).slug,'koperasi-daftar');
 const path=require('./hierarchy-model.js').resolvePath(s.menus.at(-1),s.hierarchy,docs,{module:'anggota',topic:'koperasi-daftar',section:'persiapan',part:'dokumen'});
 assert.equal(path.part.label,'Dokumen');
});
test('admin rejects duplicate IDs, missing module assignment and broken recommendations',()=>{
 const s=initial();s.menus[0].featured.push({slug:'ppob-tagihan',label:'Bentrok',description:'x'});s.home.recommended.push('tidak-ada');
 assert.ok(model.validate(s).some(x=>x.includes('ppob-tagihan')));
 assert.ok(model.validate(s).some(x=>x.includes('tidak-ada')));
});
test('removing a topic cleans module, recommendation, sections and content',()=>{
 const s=initial();s.hierarchy.topicSections['ppdb-formulir']=[{id:'syarat',label:'Syarat',parts:[]}];s.content['ppdb-formulir']={body:'Uji'};
 model.removeTopic(s,'ppdb','ppdb-formulir');
 assert.equal(s.menus[0].featured.some(t=>t.slug==='ppdb-formulir'),false);
 assert.equal(s.hierarchy.products.ppdb.some(m=>m.topics.includes('ppdb-formulir')),false);
 assert.equal(s.home.recommended.includes('ppdb-formulir'),false);
 assert.equal(s.content['ppdb-formulir'],undefined);
 assert.equal(s.hierarchy.topicSections['ppdb-formulir'],undefined);
 assert.deepEqual(model.validate(s),[]);
});
test('invalid imported content cannot break the public viewer',()=>{
 const s=initial();s.content['ppdb-formulir']=null;
 assert.ok(model.validate(s).some(x=>x.includes('konten')));
});

test('new article body is searchable within its product',()=>{
 const s=initial();s.content['ppdb-formulir']={body:'Kode registrasi khusus sekolah'};
 const docs=model.deriveTopics(s);
 const hits=require('./search.js').searchDocs(docs,'registrasi','PPDB');
 assert.equal(hits[0]?.slug,'ppdb-formulir');
 assert.equal(require('./search.js').searchDocs(docs,'registrasi','PPOB').length,0);
});

test('admin page offers product hierarchy editing and export/import',()=>{
 const page=fs.readFileSync('./admin.html','utf8');const ui=fs.readFileSync('./admin.js','utf8');
 assert.match(page,/Pengelola Bantuan/);assert.match(page,/admin.js/);
 for(const kind of ['product','module','topic','section','part'])assert.match(ui,new RegExp('new-'+kind));
 assert.match(ui,/export/);assert.match(ui,/import/);
});

test('viewer loads admin override before application and supports article bodies',()=>{
 const html=fs.readFileSync('./index.html','utf8');const ui=fs.readFileSync('./hierarchy-ui.js','utf8');
 assert.match(html,/<script src="help-admin-model.js"><\/script><script src="help-data.js"><\/script>/);
 assert.match(ui,/HELP_CONTENT/);
 assert.match(ui,/const key=path\.topic\.slug\+\(path\.section\?'\/'\+path\.section\.id:''\)\+\(path\.part\?'\/'\+path\.part\.id:''\)/);
 assert.match(ui,/if\(data\.image\)appendFigure\(content,data\.image/);
 assert.match(ui,/if\(path\.reading\)/);
});
