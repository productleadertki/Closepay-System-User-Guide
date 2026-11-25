(function(){
'use strict';
const M=window.HelpAdminModel,tree=document.getElementById('tree'),editor=document.getElementById('editor'),status=document.getElementById('status');
let state=M.load(localStorage,window.HELP_MENUS,window.HELP_HIERARCHY,window.HELP_HOME);
let selection=state.menus.length?{kind:'product',product:state.menus[0].image}:{kind:'new-product'};
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const say=(message,error=false)=>{status.textContent=message;status.classList.toggle('error',error);};
const slug=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const product=()=>state.menus.find(m=>m.image===selection.product);
const moduleItem=()=>state.hierarchy.products[selection.product]?.find(m=>m.id===selection.module);
const topicItem=()=>product()?.featured.find(t=>t.slug===selection.topic);
const sectionsFor=(s,id,productId)=>s.hierarchy.topicSections[id]||s.hierarchy.sections[productId]||[];
const itemKey=()=>selection.topic+(selection.section?'/'+selection.section:'')+(selection.part?'/'+selection.part:'');
function recommendedGuideLabel(topic){const p=state.menus.find(x=>x.category===topic.category),sections=sectionsFor(state,topic.slug,p?.image);for(const section of sections)if(section.parts?.length)return section.parts[0].label;return state.content[topic.slug]?.body||state.content[topic.slug]?.html||state.content[topic.slug]?.image?'Panduan terdahulu':'';}
function select(next){selection=next;say('');render();}
function commit(change,next){const draft=M.copy(state);try{change(draft);M.save(localStorage,draft);state=draft;if(next)selection=next;render();say('Tersimpan. Muat ulang halaman bantuan untuk melihat perubahan.');}catch(err){say(err.message,true);}}
function action(text,fn,cls=''){const b=e('button','btn '+cls,text);b.type='button';b.addEventListener('click',fn);return b;}
function treeButton(label,kind,sel,cls=''){const b=e('button','tree-button '+cls+(JSON.stringify(selection)===JSON.stringify(sel)?' active':''),label);b.type='button';b.addEventListener('click',()=>select(sel));tree.append(b);}
function renderTree(){tree.replaceChildren();const head=e('div','rail-head');head.append(e('strong','','STRUKTUR KONTEN'),action('+ Produk',()=>select({kind:'new-product'})));tree.append(head);
 for(const p of state.menus){const base={product:p.image};treeButton(p.category,'product',{kind:'product',...base},'product');
  const mods=state.hierarchy.products[p.image]||[];
  for(const mod of mods){treeButton('▾  '+mod.label,'module',{kind:'module',...base,module:mod.id},'module');
   for(const id of mod.topics){const t=p.featured.find(x=>x.slug===id);if(!t)continue;
    treeButton(t.label,'topic',{kind:'topic',...base,module:mod.id,topic:id},'topic');
    if(selection.topic===id&&selection.product===p.image){
     if(state.content[id]?.body||state.content[id]?.html||state.content[id]?.image)treeButton('· Panduan terdahulu','legacy',{kind:'legacy',...base,module:mod.id,topic:id},'part');
     for(const section of sectionsFor(state,id,p.image)){
      treeButton('↳ '+section.label,'section',{kind:'section',...base,module:mod.id,topic:id,section:section.id},'section');
      if(selection.section===section.id){
       if(state.content[id+'/'+section.id]?.body||state.content[id+'/'+section.id]?.html||state.content[id+'/'+section.id]?.image)treeButton('· Panduan terdahulu','legacy',{kind:'legacy',...base,module:mod.id,topic:id,section:section.id},'part');
       for(const part of section.parts)treeButton('· '+part.label,'part',{kind:'part',...base,module:mod.id,topic:id,section:section.id,part:part.id},'part');
       treeButton('+ Panduan','new-part',{kind:'new-part',...base,module:mod.id,topic:id,section:section.id},'add part');}
     }
     treeButton('+ Submodul 2','new-section',{kind:'new-section',...base,module:mod.id,topic:id},'add section');
    }
   }
   treeButton('+ Submodul 1','new-topic',{kind:'new-topic',...base,module:mod.id},'add topic');
  }
  treeButton('+ Modul','new-module',{kind:'new-module',...base},'add module');
 }
 const caption=e('div','caption','BERANDA');tree.append(caption);treeButton('Recommended Reads','recommended',{kind:'recommended'},'product');
}
function field(form,label,name,value='',opts={}){const wrap=e('div','field'+(opts.wide?' wide':'')),lab=e('label','',label),input=opts.select?e('select'):opts.multiline?e('textarea'):e('input');input.id='f-'+name;input.name=name;lab.htmlFor=input.id;
 if(opts.select){for(const [id,title] of opts.select){const o=e('option','',title);o.value=id;input.append(o);}}else if(opts.multiline)input.className=opts.long?'long':'';else input.type='text';
 input.value=value;input.required=!!opts.required;if(opts.readonly)input.readOnly=true;
 wrap.append(lab,input);if(opts.help)wrap.append(e('span','small',opts.help));form.append(wrap);return input;}
function header(title,kicker,description,preview){const h=e('div','main-head'),copy=e('div');copy.append(e('span','kicker',kicker),e('h1','',title),e('p','',description));h.append(copy);if(preview){const a=e('a','btn','Pratinjau ↗');a.href='index.html'+preview;a.target='_blank';a.rel='noopener';h.append(a);}editor.append(h);}
function richEditor(parent,key){
 const data=state.content[key]||{},wrap=e('div','field wide rich-field'),label=e('span','','Isi dan penjelasan'),box=e('div','rich-editor'),toolbar=e('div','rich-toolbar'),surface=e('div','rich-surface'),foot=e('div','rich-foot');
 toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Pemformatan teks panduan');
 const style=e('select');style.setAttribute('aria-label','Gaya paragraf');
 for(const [value,text] of [['p','Paragraf'],['h2','Judul besar'],['h3','Judul kecil']]){const option=e('option','',text);option.value=value;style.append(option);}
 style.addEventListener('change',()=>{surface.focus();document.execCommand('formatBlock',false,style.value);style.value='p';});toolbar.append(style);
 const command=(text,title,name,value)=>{const b=e('button','rich-tool',text);b.type='button';b.title=title;b.setAttribute('aria-label',title);b.addEventListener('mousedown',event=>event.preventDefault());b.addEventListener('click',()=>{surface.focus();document.execCommand(name,false,value||null);surface.dispatchEvent(new Event('input',{bubbles:true}));});toolbar.append(b);};
 command('B','Tebal','bold');command('I','Miring','italic');command('U','Garis bawah','underline');
 command('• Daftar','Daftar poin','insertUnorderedList');command('1. Daftar','Daftar nomor','insertOrderedList');
 command('⇤','Rata kiri','justifyLeft');command('≡','Rata tengah','justifyCenter');command('⇥','Rata kanan','justifyRight');
 const link=e('button','rich-tool','Tautan');link.type='button';link.title='Sisipkan tautan';link.addEventListener('mousedown',event=>event.preventDefault());link.addEventListener('click',()=>{
  const raw=prompt('Alamat tautan (awali dengan https)');if(raw===null)return;
  let url;try{url=new URL(raw.trim());if(!['http:','https:'].includes(url.protocol))throw Error();}catch{say('Gunakan tautan http atau https yang valid.',true);return;}
  surface.focus();const selection=window.getSelection();if(selection&&selection.rangeCount&&!selection.isCollapsed&&surface.contains(selection.anchorNode))document.execCommand('createLink',false,url.href);
  else{const safe=url.href.replace(/&/g,'&amp;').replace(/"/g,'&quot;');document.execCommand('insertHTML',false,'<a href="'+safe+'">'+safe+'</a>');}
  surface.dispatchEvent(new Event('input',{bubbles:true}));
 });toolbar.append(link);
 command('↶','Urungkan','undo');command('↷','Ulangi','redo');command('Hapus format','Hapus format','removeFormat');
 surface.setAttribute('contenteditable','true');surface.role='textbox';surface.setAttribute('aria-multiline','true');surface.setAttribute('aria-label','Isi dan penjelasan panduan');surface.setAttribute('data-placeholder','Tulis informasi, langkah, dan penjelasan di sini…');
 surface.innerHTML=window.HelpRichText.sanitize(data.html||window.HelpRichText.fromText(data.body||''));
 const update=()=>{const words=window.HelpRichText.plainText(surface.innerHTML).trim().split(/\s+/).filter(Boolean);foot.textContent=words.length+' kata · Ctrl+B tebal · Ctrl+I miring';};
 surface.addEventListener('input',update);
 surface.addEventListener('paste',event=>{event.preventDefault();const html=event.clipboardData?.getData('text/html'),text=event.clipboardData?.getData('text/plain')||'';surface.focus();if(html)document.execCommand('insertHTML',false,window.HelpRichText.sanitize(html));else document.execCommand('insertText',false,text);update();});
 box.append(toolbar,surface,foot);wrap.append(label,box,e('span','small','Pilih teks untuk memformat. Simpan perubahan agar tampil di halaman bantuan.'));parent.append(wrap);update();return surface;
}
function imageControls(panel,key){const data=state.content[key]||{},block=e('div','field wide');block.append(e('span','','Gambar panduan (opsional)'));const input=e('input');input.type='file';input.accept='image/png,image/jpeg,image/webp,image/gif';input.setAttribute('aria-label','Unggah gambar panduan');
 const keepDraft=change=>{const values=[...editor.querySelectorAll('form [name]')].map(el=>[el.name,el.value]),rich=editor.querySelector('.rich-surface')?.innerHTML;commit(change);for(const [name,value] of values){const field=[...editor.querySelectorAll('form [name]')].find(el=>el.name===name);if(field)field.value=value;}const surface=editor.querySelector('.rich-surface');if(surface&&rich!==undefined){surface.innerHTML=window.HelpRichText.sanitize(rich);surface.dispatchEvent(new Event('input',{bubbles:true}));}};
 input.addEventListener('change',async()=>{const f=input.files?.[0];if(!f)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(f.type)||f.size>1000000){say('Gunakan PNG, JPEG, WebP, atau GIF maksimal 1 MB.',true);return;}const reader=new FileReader();reader.onload=()=>keepDraft(s=>{s.content[key]??={};s.content[key].image=reader.result;});reader.readAsDataURL(f);});block.append(input,e('span','small','Maksimal 1 MB. Tersimpan di browser; ekspor JSON untuk cadangan.'));
 if(data.image){const img=e('img','image-preview');img.src=data.image;img.alt='Gambar panduan tersimpan';block.append(img,action('Hapus gambar',()=>keepDraft(s=>{delete s.content[key].image;}),'danger'));}panel.append(block);}
function renderEditor(){editor.replaceChildren();const k=selection.kind,newItem=k.startsWith('new-'),type=newItem?k.slice(4):k;
 if(k==='recommended'){
  header('Recommended Reads','BERANDA','Pilih maksimal enam panduan untuk beranda. Urutan mengikuti daftar di bawah.');
  const panel=e('div','panel'),form=e('form');let count=0;
  for(const t of M.deriveTopics(state)){
   const guideLabel=recommendedGuideLabel(t);
   if(!(guideLabel||state.home.recommended.includes(t.slug)))continue;
   const line=e('label','check'),check=e('input');check.type='checkbox';check.name='read';check.value=t.slug;check.checked=state.home.recommended.includes(t.slug);
   line.append(check,e('span','',t.category+' · '+(guideLabel||'Belum ada panduan')+' — '+t.title));form.append(line);count++;
  }
  if(!count)form.append(e('p','hint','Buat panduan dahulu.'));
  form.append(action('Simpan rekomendasi',()=>{const ids=[...form.querySelectorAll('input:checked')].map(x=>x.value);commit(s=>{s.home.recommended=ids;});},'primary'));
  form.addEventListener('submit',ev=>ev.preventDefault());panel.append(form);editor.append(panel);return;
 }
 const p=product(),mod=moduleItem(),topic=topicItem();const sec=sectionsFor(state,selection.topic,selection.product).find(x=>x.id===selection.section);const part=sec?.parts.find(x=>x.id===selection.part);
 if(k==='legacy'){
  const key=itemKey(),parent=selection.section?{kind:'section',product:p.image,module:mod.id,topic:topic.slug,section:sec.id}:{kind:'topic',product:p.image,module:mod.id,topic:topic.slug};
  header('Panduan terdahulu · '+(sec?.label||topic.label),'EDIT PANDUAN','Konten lama tetap dapat diedit tanpa menampilkan isi pada halaman judul submodul.','#/baca/'+key);
  const panel=e('div','panel'),form=e('form'),fields=e('div','fields');form.append(fields);panel.append(form);editor.append(panel);richEditor(fields,key);imageControls(fields,key);
  const buttons=e('div','panel-actions');buttons.append(action('Kembali',()=>select(parent)));buttons.append(action('Simpan panduan',()=>form.requestSubmit(),'primary'));form.append(buttons);
  form.addEventListener('submit',ev=>{ev.preventDefault();const html=window.HelpRichText.sanitize(form.querySelector('.rich-surface').innerHTML);commit(s=>{s.content[key]??={};s.content[key].html=html;s.content[key].body=window.HelpRichText.plainText(html);});});return;
 }
 const current={product:p,module:mod,topic,section:sec,part}[type];const title=newItem?{product:'Produk baru',module:'Modul baru',topic:'Submodul 1 baru',section:'Submodul 2 baru',part:'Panduan baru'}[type]:current?.label||current?.category||'Editor';
 const description={product:'Nama dan ringkasan produk pada beranda.',module:'Kelompok submodul di dalam produk.',topic:'Judul submodul 1. Isi ditulis pada panduan di bawah submodul 2.',section:'Judul submodul 2. Tambahkan panduan untuk menulis isinya.',part:'Judul dan isi panduan yang dibaca pengguna.'}[type];
 const preview=type==='product'&&!newItem?'#/menu/'+p.image:type==='topic'&&!newItem?'#/panduan/'+topic.slug:type==='section'&&!newItem?'#/panduan/'+topic.slug+'/'+sec.id:type==='part'&&!newItem?'#/baca/'+topic.slug+'/'+sec.id+'/'+part.id:null;
 header(title,(newItem?'TAMBAH ':'EDIT ')+({product:'PRODUK',module:'MODUL',topic:'SUBMODUL 1',section:'SUBMODUL 2',part:'PANDUAN'}[type]),description,preview);
 const panel=e('div','panel'),form=e('form'),fields=e('div','fields');form.append(fields);editor.append(panel);panel.append(form);
 const names={product:'Nama produk',module:'Nama modul',topic:'Nama submodul 1',section:'Nama submodul 2',part:'Judul panduan'};
 const label=field(fields,names[type],'label',current?.label||current?.category||'',{required:true});
 const id=field(fields,'ID / slug URL','id',newItem?'':current?.image||current?.id||current?.slug||'',{required:false,readonly:!newItem,help:newItem?'Huruf kecil, angka, dan tanda hubung. Kosongkan untuk membuat otomatis.':'ID tidak dapat diubah setelah dibuat agar tautan tetap berlaku.'});
 if(type==='product')field(fields,'Ringkasan produk','intro',p?.intro||'',{wide:true,multiline:true});
 if(['part'].includes(type))richEditor(fields,newItem?'':itemKey());
 if(type==='topic'&&p){const options=(state.hierarchy.products[p.image]||[]).map(m=>[m.id,m.label]);if(options.length){const select=field(fields,'Modul','module',mod?.id||options[0][0],{select:options,wide:true});select.value=mod?.id||options[0][0];}}
 if(type==='part'&&!newItem)imageControls(fields,itemKey());
 const buttons=e('div','panel-actions');if(!newItem)buttons.append(action('Hapus '+names[type].toLowerCase(),()=>remove(), 'danger'));else buttons.append(e('span'));
 const right=e('div','action-right');right.append(action('Batal',()=>select(type==='product'?{kind:'recommended'}:type==='module'?{kind:'product',product:p.image}:type==='topic'?{kind:'module',product:p.image,module:mod.id}:type==='section'?{kind:'topic',product:p.image,module:mod.id,topic:topic.slug}:{kind:'section',product:p.image,module:mod.id,topic:topic.slug,section:sec.id})),action(newItem?'Buat '+names[type].toLowerCase():'Simpan perubahan',()=>form.requestSubmit(),'primary'));buttons.append(right);form.append(buttons);
 form.addEventListener('submit',ev=>{ev.preventDefault();if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));const rich=form.querySelector('.rich-surface');const html=rich?window.HelpRichText.sanitize(rich.innerHTML):'',body=rich?window.HelpRichText.plainText(html):'';const name=String(data.label||'').trim(),ident=String(data.id||'').trim()||(type==='topic'?p.image+'-'+slug(name):slug(name));if(newItem&&!M.slugOk(ident)){say('ID harus berupa huruf kecil, angka, dan tanda hubung.',true);return;}
  let next={...selection,kind:type};if(newItem){if(type==='product')next={kind:'product',product:ident};if(type==='module')next={kind:'module',product:p.image,module:ident};if(type==='topic')next={kind:'topic',product:p.image,module:data.module,topic:ident};if(type==='section')next={kind:'section',product:p.image,module:mod.id,topic:topic.slug,section:ident};if(type==='part')next={kind:'part',product:p.image,module:mod.id,topic:topic.slug,section:sec.id,part:ident};}
  commit(s=>{
   if(type==='product'){if(newItem){s.menus.push({image:ident,category:name,intro:data.intro||'',featured:[]});s.hierarchy.products[ident]=[];s.hierarchy.sections[ident]=[];}else{const target=s.menus.find(x=>x.image===p.image);target.category=name;target.intro=data.intro||'';}}
   if(type==='module'){if(newItem)s.hierarchy.products[p.image].push({id:ident,label:name,topics:[]});else s.hierarchy.products[p.image].find(x=>x.id===mod.id).label=name;}
   if(type==='topic'){const owner=s.menus.find(x=>x.image===p.image);if(newItem){owner.featured.push({slug:ident,label:name,description:''});s.hierarchy.products[p.image].find(x=>x.id===data.module).topics.push(ident);s.hierarchy.topicSections[ident]=[];}else{const target=owner.featured.find(x=>x.slug===topic.slug);target.label=name;for(const m of s.hierarchy.products[p.image])m.topics=m.topics.filter(x=>x!==topic.slug);s.hierarchy.products[p.image].find(x=>x.id===data.module).topics.push(topic.slug);next.module=data.module;}}
   if(type==='section'){s.hierarchy.topicSections[topic.slug]=M.copy(sectionsFor(s,topic.slug,p.image));const list=s.hierarchy.topicSections[topic.slug];if(newItem)list.push({id:ident,label:name,parts:[]});else list.find(x=>x.id===sec.id).label=name;}
   if(type==='part'){s.hierarchy.topicSections[topic.slug]=M.copy(sectionsFor(s,topic.slug,p.image));const section=s.hierarchy.topicSections[topic.slug].find(x=>x.id===sec.id);if(newItem)section.parts.push({id:ident,label:name});else section.parts.find(x=>x.id===part.id).label=name;}
   if(['part'].includes(type)){const key=newItem?topic.slug+'/'+sec.id+'/'+ident:itemKey();s.content[key]??={};s.content[key].body=body;s.content[key].html=html;}
  },next);
 });
}
function remove(){const k=selection.kind,p=selection.product,m=selection.module,t=selection.topic,sec=selection.section,part=selection.part;if(!confirm('Hapus '+k+' ini beserta semua turunan yang terkait?'))return;
 let next={kind:'recommended'};if(k==='module')next={kind:'product',product:p};if(k==='topic')next={kind:'module',product:p,module:m};if(k==='section')next={kind:'topic',product:p,module:m,topic:t};if(k==='part')next={kind:'section',product:p,module:m,topic:t,section:sec};
 commit(s=>{if(k==='product')M.removeProduct(s,p);if(k==='module')M.removeModule(s,p,m);if(k==='topic')M.removeTopic(s,p,t);
 if(k==='section'){s.hierarchy.topicSections[t]=M.copy(sectionsFor(s,t,p)).filter(x=>x.id!==sec);for(const key of Object.keys(s.content))if(key.startsWith(t+'/'+sec))delete s.content[key];}
 if(k==='part'){s.hierarchy.topicSections[t]=M.copy(sectionsFor(s,t,p));s.hierarchy.topicSections[t].find(x=>x.id===sec).parts=s.hierarchy.topicSections[t].find(x=>x.id===sec).parts.filter(x=>x.id!==part);delete s.content[t+'/'+sec+'/'+part];}
 },next);
}
function render(){renderTree();renderEditor();}
document.getElementById('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=e('a');a.href=url;a.download='bantuan-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Cadangan JSON berhasil disiapkan.');});
document.getElementById('import').addEventListener('click',()=>document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{if(file.size>4000000)throw Error('File JSON maksimal 4 MB.');const data=JSON.parse(await file.text());M.save(localStorage,data);state=data;selection=state.menus.length?{kind:'product',product:state.menus[0].image}:{kind:'new-product'};render();say('Impor berhasil. Muat ulang halaman bantuan.');}catch(err){say('Impor gagal: '+err.message,true);}ev.target.value='';});
document.getElementById('reset').addEventListener('click',()=>{if(!confirm('Pulihkan data contoh? Semua perubahan lokal yang belum diekspor akan hilang.'))return;localStorage.removeItem(M.KEY);state=M.makeState(window.HELP_MENUS,window.HELP_HIERARCHY,window.HELP_HOME);selection={kind:'product',product:state.menus[0].image};render();say('Data contoh dipulihkan.');});
window.addEventListener('storage',ev=>{if(ev.key===M.KEY)say('Data berubah di tab lain. Muat ulang admin sebelum menyimpan lagi.',true);});
render();
if(location.protocol==='file:')say('Mode file: perubahan admin mungkin tidak terbaca oleh index.html. Jalankan start-admin.bat dan buka kedua halaman di http://127.0.0.1:8765/.',true);
})();