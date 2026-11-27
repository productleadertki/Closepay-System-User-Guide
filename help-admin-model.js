(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HelpAdminModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
'use strict';
const KEY='help-admin-v1';
const moduleKey=(product,id)=>'@module/'+product+'/'+id;
function videoOk(raw){if(typeof raw!=='string'||raw.length>2048)return false;try{const u=new URL(raw);if(u.protocol!=='https:')return false;const h=u.hostname.toLowerCase();if(['youtube.com','www.youtube.com','m.youtube.com','youtu.be','www.youtube-nocookie.com'].includes(h)){const id=h==='youtu.be'?u.pathname.slice(1):u.pathname==='/watch'?u.searchParams.get('v'):u.pathname.match(/^\/(?:embed|shorts|live)\/([^/]+)$/)?.[1];return /^[\w-]{11}$/.test(id||'');}return /\.(?:mp4|webm)$/i.test(u.pathname);}catch{return false;}}
const slugOk=x=>typeof x==='string'&&/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(x);
const isoDateOk=value=>typeof value==='string'&&/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(value)&&!Number.isNaN(Date.parse(value))&&new Date(value).toISOString()===value;
const copy=x=>JSON.parse(JSON.stringify(x));
function makeState(menus,hierarchy,home,sampleContent={}){return {version:1,sampleCatalogVersion:2,menus:copy(menus),hierarchy:{...copy(hierarchy),topicSections:copy(hierarchy.topicSections||{})},home:copy(home),content:copy(sampleContent)};}
function deriveTopics(s){return s.menus.flatMap(m=>m.featured.map(t=>({title:t.label,slug:t.slug,category:m.category,type:'Panduan',description:t.description||'',body:Object.entries(s.content).filter(([key])=>key===t.slug||key.startsWith(t.slug+'/')).map(([,value])=>value.body||'').join(' ')})));}
function validate(s){
 const errors=[];
 if(!s||s.version!==1||!Array.isArray(s.menus)||!s.hierarchy||!s.hierarchy.products||!s.hierarchy.sections||!s.hierarchy.topicSections||!s.home||!Array.isArray(s.home.recommended)||!s.content||typeof s.content!=='object')return ['Format data admin tidak valid.'];
 const keys=new Set(),names=new Set(),topics=new Set(),moduleKeys=new Set();
 for(const m of s.menus){
  if(!m||!slugOk(m.image)||!String(m.category||'').trim()||!Array.isArray(m.featured)||typeof m.intro!=='string'||(m.icon!==undefined&&(typeof m.icon!=='string'||[...m.icon].length>4||/[<>\u0000-\u001f]/.test(m.icon)))){errors.push('Produk tidak valid.');continue;}
  if(keys.has(m.image))errors.push('ID produk duplikat: '+m.image);keys.add(m.image);
  if(names.has(m.category.toLowerCase()))errors.push('Nama produk duplikat: '+m.category);names.add(m.category.toLowerCase());
  const modules=s.hierarchy.products[m.image];if(!Array.isArray(modules)){errors.push('Modul produk tidak ada: '+m.image);continue;}
  const ids=new Set(),assigned=[];
  for(const mod of modules){if(!mod||!slugOk(mod.id)||!String(mod.label||'').trim()||!Array.isArray(mod.topics)){errors.push('Modul tidak valid di '+m.image);continue;}
   if(ids.has(mod.id))errors.push('ID modul duplikat: '+mod.id);ids.add(mod.id);moduleKeys.add(moduleKey(m.image,mod.id));assigned.push(...mod.topics);
  }
  const local=new Set();for(const t of m.featured){if(!t||!slugOk(t.slug)||!String(t.label||'').trim()||typeof t.description!=='string'){errors.push('Panduan tidak valid di '+m.image);continue;}
   if(topics.has(t.slug)||local.has(t.slug))errors.push('ID panduan duplikat: '+t.slug);topics.add(t.slug);local.add(t.slug);
  }
  for(const id of assigned)if(!local.has(id))errors.push('Panduan bukan milik produk: '+id);
  for(const id of local)if(assigned.filter(x=>x===id).length!==1)errors.push('Panduan harus berada tepat di satu modul: '+id);
  const sections=s.hierarchy.sections[m.image];if(!Array.isArray(sections))errors.push('Bagian produk tidak ada: '+m.image);
  for(const [scope,list] of [[m.image,sections],...m.featured.filter(Boolean).map(t=>[t.slug,s.hierarchy.topicSections[t.slug]||[]])]){
   if(!Array.isArray(list)) {errors.push('Bagian tidak valid: '+scope);continue;}
   const sectionIds=new Set();for(const section of list){if(!section||!slugOk(section.id)||!String(section.label||'').trim()||!Array.isArray(section.parts)){errors.push('Bagian tidak valid: '+scope);continue;}
    if(sectionIds.has(section.id))errors.push('ID bagian duplikat: '+section.id);sectionIds.add(section.id);
    const partIds=new Set();for(const part of section.parts){if(!part||!slugOk(part.id)||!String(part.label||'').trim())errors.push('Rincian tidak valid: '+scope);else if(partIds.has(part.id))errors.push('ID rincian duplikat: '+part.id);else partIds.add(part.id);}
   }
  }
 }
 for(const id of s.home.recommended)if(!topics.has(id))errors.push('Rekomendasi tidak ditemukan: '+id);
 if(s.home.recommended.length>6||new Set(s.home.recommended).size!==s.home.recommended.length)errors.push('Rekomendasi harus unik, maksimal enam.');
 for(const [key,value] of Object.entries(s.content)){
  if(!value||typeof value!=='object'||Array.isArray(value)||
     (value.body!==undefined&&typeof value.body!=='string')||
     (value.markdown!==undefined&&(typeof value.markdown!=='string'||value.markdown.length>3500000))||
     (value.html!==undefined&&(typeof value.html!=='string'||value.html.length>200000))||
     (value.video!==undefined&&value.video!==''&&!videoOk(value.video))||
     (value.publishedAt!==undefined&&!isoDateOk(value.publishedAt))||
     (value.updatedAt!==undefined&&!isoDateOk(value.updatedAt))||
     (value.publishedAt&&value.updatedAt&&value.updatedAt<value.publishedAt)||
     (value.image!==undefined&&(typeof value.image!=='string'||value.image.length>1500000||!/^data:image\/(png|jpeg|webp|gif);base64,/.test(value.image)))||
     !(topics.has(key.split('/')[0])||moduleKeys.has(key)))errors.push('Data konten tidak valid: '+key);
 }
 return errors;
}
function removeTopic(s,product,slug){const menu=s.menus.find(m=>m.image===product);if(!menu)return;menu.featured=menu.featured.filter(t=>t.slug!==slug);(s.hierarchy.products[product]||[]).forEach(m=>{m.topics=m.topics.filter(id=>id!==slug);});s.home.recommended=s.home.recommended.filter(id=>id!==slug);delete s.hierarchy.topicSections[slug];for(const key of Object.keys(s.content))if(key===slug||key.startsWith(slug+'/'))delete s.content[key];}
function removeSection(s,product,topic,id){const sections=s.hierarchy.topicSections[topic]||s.hierarchy.sections[product]||[];s.hierarchy.topicSections[topic]=copy(sections).filter(section=>section.id!==id);const prefix=topic+'/'+id;for(const key of Object.keys(s.content))if(key===prefix||key.startsWith(prefix+'/'))delete s.content[key];}
function removeModule(s,product,id){const modules=s.hierarchy.products[product]||[];const mod=modules.find(m=>m.id===id);if(!mod)return;delete s.content[moduleKey(product,id)];for(const slug of [...mod.topics])removeTopic(s,product,slug);s.hierarchy.products[product]=modules.filter(m=>m.id!==id);}
function removeProduct(s,id){for(const mod of [...(s.hierarchy.products[id]||[])])removeModule(s,id,mod.id);s.menus=s.menus.filter(m=>m.image!==id);delete s.hierarchy.products[id];delete s.hierarchy.sections[id];}
function withSamples(saved,menus,hierarchy,sampleContent={}){
 if(saved.sampleCatalogVersion>=2)return saved;
 const next=copy(saved);
 const slugs=new Set(next.menus.flatMap(menu=>menu.featured.map(topic=>topic.slug)));
 const categories=new Set(next.menus.map(menu=>menu.category.toLowerCase()));
 for(const menu of menus.slice(2)){
  if(next.menus.some(m=>m.image===menu.image)||categories.has(menu.category.toLowerCase())||menu.featured.some(topic=>slugs.has(topic.slug)))continue;
  next.menus.push(copy(menu));
  categories.add(menu.category.toLowerCase());
  for(const topic of menu.featured)slugs.add(topic.slug);
  next.hierarchy.products[menu.image]=copy(hierarchy.products[menu.image]);
  next.hierarchy.sections[menu.image]=copy(hierarchy.sections[menu.image]);
  for(const topic of menu.featured){
   next.hierarchy.topicSections[topic.slug]=copy(hierarchy.topicSections[topic.slug]);
   for(const [key,value] of Object.entries(sampleContent))if(key===topic.slug||key.startsWith(topic.slug+'/')){
    if(!(key in next.content))next.content[key]=copy(value);
   }
  }
 }
 next.sampleCatalogVersion=2;
 return validate(next).length?saved:next;
}
function load(storage,menus,hierarchy,home,sampleContent={}){const initial=makeState(menus,hierarchy,home,sampleContent);try{const raw=storage.getItem(KEY);if(!raw)return initial;const value=JSON.parse(raw);const errors=validate(value);if(errors.length)throw Error(errors.join(' '));return withSamples(value,menus,hierarchy,sampleContent);}catch(e){return initial;}}
function save(storage,s){const errors=validate(s);if(errors.length)throw Error(errors.join(' '));storage.setItem(KEY,JSON.stringify(s));}
return {KEY,moduleKey,videoOk,makeState,withSamples,deriveTopics,validate,removeTopic,removeSection,removeModule,removeProduct,load,save,copy,slugOk};
});