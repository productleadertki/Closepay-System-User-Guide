const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const vm=require('node:vm');
const menus=require('./menu-config.js');
const hierarchy=require('./hierarchy-config.js');
const model=require('./help-admin-model.js');
const home=require('./home-config.js');
const catalogContext={window:{}};
vm.runInNewContext(fs.readFileSync('./help-index.js','utf8'),catalogContext);
const catalog=catalogContext.window.HELP_TOPICS;

test('Closepay default includes original payment documentation samples without external branding',()=>{
 const categories=['Tautan Pembayaran','Langganan','Transfer Dana','Integrasi','Keamanan Akun'];
 for(const name of categories){
  const product=menus.find(x=>x.category===name);
  assert.ok(product,`missing ${name}`);
  assert.ok(product.featured.length>=3,`missing guides in ${name}`);
  assert.ok(hierarchy.products[product.image]?.length,`missing modules in ${name}`);
  for(const topic of product.featured){
   const sections=hierarchy.topicSections[topic.slug];
   assert.ok(sections?.some(s=>s.parts.length),`missing sections and parts in ${topic.slug}`);
   assert.ok(catalog.some(d=>d.slug===topic.slug),`missing search entry ${topic.slug}`);
  }
 }
 const text=JSON.stringify({menus,hierarchy,catalog});
 assert.doesNotMatch(text,/xendit|docs\.xendit\.co/i);
});

test('sampled articles load into admin defaults and reader, retaining existing saved edits',()=>{
 const root={};
 vm.runInNewContext(fs.readFileSync('./help-content.js','utf8'),root);
 const sample=root.HELP_SAMPLE_CONTENT;
 for(const product of menus.filter(x=>!['ppdb','ppob'].includes(x.image)))for(const topic of product.featured){
  const sections=hierarchy.topicSections[topic.slug];
  const leaf=`${topic.slug}/${sections[0].id}/${sections[0].parts[0].id}`;
  assert.ok(sample[leaf]?.markdown?.includes('##'),`missing article ${leaf}`);
 }
 assert.doesNotMatch(JSON.stringify(sample),/xendit|docs\.xendit\.co/i);
 const initial=model.makeState(menus,hierarchy,home,sample);
 assert.ok(initial.content['tautan-pembayaran-buat/panduan/langkah']);
 const custom={...initial,content:{...initial.content,'ppdb-formulir/persiapan/persyaratan':{markdown:'Tulisan saya'}}};
 const storage={getItem:()=>JSON.stringify(custom)};
 const loaded=model.load(storage,menus,hierarchy,home,sample);
 assert.equal(loaded.content['ppdb-formulir/persiapan/persyaratan'].markdown,'Tulisan saya');
 assert.equal(loaded.content['tautan-pembayaran-buat/panduan/langkah'].markdown,initial.content['tautan-pembayaran-buat/panduan/langkah'].markdown);
});

test('existing browser edits receive new examples once without resurrecting deleted examples',()=>{
 const root={};vm.runInNewContext(fs.readFileSync('./help-content.js','utf8'),root);
 const old=model.makeState(menus.slice(0,2),hierarchy,{recommended:['ppdb-formulir']});
 delete old.sampleCatalogVersion;
 old.content['ppdb-formulir']={markdown:'Panduan lama saya'};
 let saved=JSON.stringify(old);
 const storage={getItem:()=>saved,setItem:(_key,value)=>{saved=value;}};
 const migrated=model.load(storage,menus,hierarchy,home,root.HELP_SAMPLE_CONTENT);
 assert.equal(migrated.content['ppdb-formulir'].markdown,'Panduan lama saya');
 assert.equal(migrated.menus.length,menus.length);
 assert.equal(migrated.content['tautan-pembayaran-buat'].markdown,root.HELP_SAMPLE_CONTENT['tautan-pembayaran-buat'].markdown);
 assert.deepEqual(migrated.home.recommended,['ppdb-formulir']);
 model.removeProduct(migrated,'langganan');model.save(storage,migrated);
 const reloaded=model.load(storage,menus,hierarchy,home,root.HELP_SAMPLE_CONTENT);
 assert.ok(!reloaded.menus.some(m=>m.image==='langganan'));
});

test('migration preserves a user guide whose slug collides with a new sample',()=>{
 const root={};vm.runInNewContext(fs.readFileSync('./help-content.js','utf8'),root);
 const old=model.makeState(menus.slice(0,2),hierarchy,{recommended:['ppdb-formulir']});
 delete old.sampleCatalogVersion;
 old.menus.push({category:'Produk Saya',image:'produk-saya',icon:'★',intro:'Panduan milik saya.',featured:[{slug:'integrasi-uji',label:'Pengujian saya',description:'Panduan integrasi milik pengguna yang sudah disimpan.'}]});
 old.hierarchy.products['produk-saya']=[{id:'pengaturan',label:'Pengaturan',topics:['integrasi-uji']}];
 old.hierarchy.sections['produk-saya']=[{id:'panduan',label:'Panduan',parts:[{id:'langkah',label:'Langkah'}]}];
 old.content['integrasi-uji']={markdown:'Panduan asli saya'};
 assert.deepEqual(model.validate(old),[]);
 let saved=JSON.stringify(old);
 const storage={getItem:()=>saved,setItem:(_key,value)=>{saved=value;}};
 const migrated=model.load(storage,menus,hierarchy,home,root.HELP_SAMPLE_CONTENT);
 assert.equal(migrated.content['integrasi-uji'].markdown,'Panduan asli saya');
 assert.equal(migrated.menus.filter(m=>m.featured.some(t=>t.slug==='integrasi-uji')).length,1);
 assert.ok(migrated.menus.some(m=>m.image==='tautan-pembayaran'));
 assert.ok(!migrated.menus.some(m=>m.image==='integrasi'));
 assert.deepEqual(model.validate(migrated),[]);
 model.save(storage,migrated);
 assert.equal(model.load(storage,menus,hierarchy,home,root.HELP_SAMPLE_CONTENT).content['integrasi-uji'].markdown,'Panduan asli saya');
});

test('admin and reader include the sample article script in load order',()=>{
 const admin=fs.readFileSync('./admin.html','utf8');
 const reader=fs.readFileSync('./index.html','utf8');
 assert.match(admin,/<script src="help-content\.js"><\/script>/);
 assert.match(reader,/<script src="help-content\.js"><\/script>/);
});
