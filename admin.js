(function(){
'use strict';
const M=window.HelpAdminModel,tree=document.getElementById('tree'),editor=document.getElementById('editor'),status=document.getElementById('status');
let state=M.load(localStorage,window.HELP_MENUS,window.HELP_HIERARCHY,window.HELP_HOME);
let selection=state.menus.length?{kind:'product',product:state.menus[0].image}:{kind:'new-product'};
const modes=['preview','split','edit'];let editorMode='split';
const e=(tag,cls,text)=>{const n=document.createElement(tag);if(cls)n.className=cls;if(text!==undefined)n.textContent=text;return n;};
const say=(message,error=false)=>{status.textContent=message;status.classList.toggle('error',error);};
const slug=text=>String(text||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
const product=()=>state.menus.find(m=>m.image===selection.product);
const moduleItem=()=>state.hierarchy.products[selection.product]?.find(m=>m.id===selection.module);
const topicItem=()=>product()?.featured.find(t=>t.slug===selection.topic);
const sectionsFor=(s,id,productId)=>s.hierarchy.topicSections[id]||s.hierarchy.sections[productId]||[];
const itemKey=()=>selection.topic+(selection.section?'/'+selection.section:'')+(selection.part?'/'+selection.part:'');
function recommendedGuideLabel(topic){const p=state.menus.find(x=>x.category===topic.category),sections=sectionsFor(state,topic.slug,p?.image);for(const section of sections)if(section.parts?.length)return section.parts[0].label;return state.content[topic.slug]?.body||state.content[topic.slug]?.html||state.content[topic.slug]?.image||state.content[topic.slug]?.video?topic.title:'';}
function select(next){selection=next;document.body.classList.remove('rail-open');say('');render();}
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

     for(const section of sectionsFor(state,id,p.image)){
      treeButton('↳ '+section.label,'section',{kind:'section',...base,module:mod.id,topic:id,section:section.id},'section');
      if(selection.section===section.id){

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
 const caption=e('div','caption','BERANDA');tree.append(caption);treeButton('Recommended Reads','recommended',{kind:'recommended'},'product');treeButton('Respons panduan','feedback',{kind:'feedback'},'product');
}
function field(form,label,name,value='',opts={}){const wrap=e('div','field'+(opts.wide?' wide':'')),lab=e('label','',label),input=opts.select?e('select'):opts.multiline?e('textarea'):e('input');input.id='f-'+name;input.name=name;lab.htmlFor=input.id;
 if(opts.select){for(const [id,title] of opts.select){const o=e('option','',title);o.value=id;input.append(o);}}else if(opts.multiline)input.className=opts.long?'long':'';else input.type='text';
 input.value=value;input.required=!!opts.required;if(opts.readonly)input.readOnly=true;
 wrap.append(lab,input);if(opts.help)wrap.append(e('span','small',opts.help));form.append(wrap);return input;}
function header(title,kicker,description,preview){const h=e('div','main-head'),copy=e('div');copy.append(e('span','kicker',kicker),e('h1','',title),e('p','',description));h.append(copy);if(preview){const a=e('a','btn','Lihat di situs ↗');a.href='index.html'+preview;a.target='_blank';a.rel='noopener';h.append(a);}editor.append(h);}
function richEditor(parent,key){
 const data=state.content[key]||{},wrap=e('div','field wide rich-field'),label=e('span','','Isi dan penjelasan'),box=e('div','rich-editor'),toolbar=e('div','rich-toolbar'),surface=e('div','rich-surface'),foot=e('div','rich-foot');
 const author=e('div','author-switch'),source=e('textarea','markdown-source'),markdownToolbar=e('div','rich-toolbar markdown-toolbar');
 source.name='markdown';source.setAttribute('aria-label','Sumber Markdown');source.placeholder='Ketik atau tempel Markdown di sini…';source.spellcheck=true;
 surface.innerHTML=window.HelpRichText.sanitize(data.html||window.HelpRichText.fromText(data.body||''));
 source.value=typeof data.markdown==='string'?data.markdown:window.HelpMarkdown.fromHtml(surface.innerHTML);
 if(typeof data.markdown==='string')surface.innerHTML=window.HelpMarkdown.toHtml(source.value);
 if(data.image){source.value+='\n\n![Gambar bantuan]('+data.image+')';surface.innerHTML=window.HelpMarkdown.toHtml(source.value);}
 box.dataset.author='markdown';
 for(const [value,text] of [['markdown','Markdown'],['visual','Visual']]){const button=action(text,()=>{box.dataset.author=value;for(const b of author.children)b.setAttribute('aria-pressed',String(b.dataset.author===value));(value==='markdown'?source:surface).focus();},'author-button');button.dataset.author=value;button.setAttribute('aria-pressed',String(value==='markdown'));author.append(button);}
 const insert=(text,title,before,after='',placeholder='teks')=>{const button=action(text,()=>{const start=source.selectionStart,end=source.selectionEnd,selected=source.value.slice(start,end)||placeholder;source.setRangeText(before+selected+after,start,end,'select');source.focus();source.dispatchEvent(new Event('input',{bubbles:true}));},'rich-tool');button.title=title;button.setAttribute('aria-label',title);markdownToolbar.append(button);};
 insert('H','Judul Markdown','## ');insert('B','Tebal Markdown','**','**');insert('I','Miring Markdown','*','*');insert('•','Daftar Markdown','- ');insert('1.','Daftar nomor Markdown','1. ');insert('“”','Kutipan Markdown','> ');insert('`','Kode Markdown','`','`');insert('Tabel','Tabel Markdown','| Kolom 1 | Kolom 2 |\n| --- | --- |\n| Isi | Isi |\n','','');
 markdownToolbar.append(action('Tautan',()=>{const raw=prompt('Masukkan alamat tautan HTTPS');if(raw===null)return;let url;try{url=new URL(raw.trim());if(!['http:','https:'].includes(url.protocol))throw Error();}catch{say('Gunakan tautan http atau https yang valid.',true);return;}const start=source.selectionStart,end=source.selectionEnd,text=source.value.slice(start,end)||'teks tautan';source.setRangeText('['+text+']('+url.href+')',start,end,'end');source.focus();source.dispatchEvent(new Event('input',{bubbles:true}));},'rich-tool'));
 toolbar.setAttribute('role','toolbar');toolbar.setAttribute('aria-label','Pemformatan teks panduan');
 markdownToolbar.setAttribute('role','toolbar');markdownToolbar.setAttribute('aria-label','Pemformatan Markdown');
 const style=e('select');style.setAttribute('aria-label','Gaya paragraf');
 for(const [value,text] of [['p','Paragraf'],['h2','Judul besar'],['h3','Judul kecil']]){const option=e('option','',text);option.value=value;style.append(option);}
 style.addEventListener('change',()=>{surface.focus();document.execCommand('formatBlock',false,style.value);style.value='p';});toolbar.append(style);
 const command=(text,title,name,value)=>{const b=e('button','rich-tool',text);b.type='button';b.title=title;b.setAttribute('aria-label',title);b.addEventListener('mousedown',event=>event.preventDefault());b.addEventListener('click',()=>{surface.focus();document.execCommand(name,false,value||null);surface.dispatchEvent(new Event('input',{bubbles:true}));});toolbar.append(b);};
 command('B','Tebal','bold');command('I','Miring','italic');command('U','Garis bawah','underline');
 command('• Daftar','Daftar poin','insertUnorderedList');command('1. Daftar','Daftar nomor','insertOrderedList');
 const table=e('button','rich-tool','Tabel 3×3');table.type='button';table.title='Sisipkan tabel';table.addEventListener('mousedown',event=>event.preventDefault());table.addEventListener('click',()=>{surface.focus();document.execCommand('insertHTML',false,'<table><thead><tr><th>Kolom 1</th><th>Kolom 2</th><th>Kolom 3</th></tr></thead><tbody><tr><td>Isi</td><td>Isi</td><td>Isi</td></tr><tr><td>Isi</td><td>Isi</td><td>Isi</td></tr></tbody></table><p><br></p>');surface.dispatchEvent(new Event('input',{bubbles:true}));});toolbar.append(table);
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
 const optionSelect=(bar,label,options,apply)=>{const control=e('select');control.setAttribute('aria-label',label);for(const [value,text] of [['',label],...options]){const option=e('option','',text);option.value=value;control.append(option);}control.addEventListener('change',()=>{if(control.value)apply(control.value);control.value='';});bar.append(control);return control;};
 const markdownWrap=(kind,value)=>{if(!window.HelpRichText.formatOk(kind,value))return;const start=source.selectionStart,end=source.selectionEnd,text=source.value.slice(start,end)||'Teks';const tag=kind==='align'?'<p data-align="'+value+'">'+text+'</p>':'<span data-'+kind+'="'+value+'">'+text+'</span>';source.setRangeText(tag,start,end,'end');source.focus();source.dispatchEvent(new Event('input',{bubbles:true}));};
 const visualSpan=(kind,value)=>{if(!window.HelpRichText.formatOk(kind,value))return;const selection=window.getSelection();if(!selection?.rangeCount||selection.isCollapsed||!surface.contains(selection.anchorNode)){say('Pilih teks terlebih dahulu.',true);return;}const range=selection.getRangeAt(0),span=e('span');span.setAttribute('data-'+kind,value);span.append(range.extractContents());range.insertNode(span);selection.removeAllRanges();range.selectNodeContents(span);selection.addRange(range);surface.dispatchEvent(new Event('input',{bubbles:true}));};
 const visualAlign=value=>{if(!window.HelpRichText.formatOk('align',value))return;const selected=window.getSelection(),node=selected?.anchorNode,element=node?.nodeType===Node.TEXT_NODE?node.parentElement:node;let block=element?.closest?.('p,h1,h2,h3,blockquote');if(!block||!surface.contains(block)){surface.focus();document.execCommand('formatBlock',false,'p');const current=window.getSelection()?.anchorNode;block=(current?.nodeType===Node.TEXT_NODE?current.parentElement:current)?.closest?.('p');}if(!block||!surface.contains(block)){say('Letakkan kursor pada paragraf.',true);return;}block.setAttribute('data-align',value);surface.dispatchEvent(new Event('input',{bubbles:true}));};
 const fonts=[['sans','Sans'],['serif','Serif'],['mono','Monospace']],sizes=[['small','Kecil'],['normal','Normal'],['large','Besar'],['xlarge','Sangat besar']],aligns=[['left','Rata kiri'],['center','Rata tengah'],['right','Rata kanan'],['justify','Rata penuh']];
 for(const [bar,authorMode] of [[markdownToolbar,'markdown'],[toolbar,'visual']]){optionSelect(bar,'Jenis font',fonts,value=>authorMode==='markdown'?markdownWrap('font',value):visualSpan('font',value));optionSelect(bar,'Ukuran teks',sizes,value=>authorMode==='markdown'?markdownWrap('size',value):visualSpan('size',value));optionSelect(bar,'Perataan teks',aligns,value=>authorMode==='markdown'?markdownWrap('align',value):visualAlign(value));}
 let selectedImage=null;surface.addEventListener('click',event=>{if(event.target.localName==='img')selectedImage=event.target;});
 const setImageWidth=value=>{if(!window.HelpRichText.formatOk('width',value))return;if(box.dataset.author==='visual'){if(!selectedImage||!surface.contains(selectedImage)){say('Klik gambar di editor visual dahulu.',true);return;}selectedImage.setAttribute('data-width',value);surface.dispatchEvent(new Event('input',{bubbles:true}));return;}
  const position=source.selectionStart,pattern=/!\[([^\]\n]*)\]\(([^)\s]+)\)|<img\b[^>]*>/gi;let match,last=null;while((match=pattern.exec(source.value))&&match.index<=position)last=match;if(!last){say('Letakkan kursor setelah gambar yang ingin diubah.',true);return;}const image=e('img');if(last[0].startsWith('<')){const template=e('template');template.innerHTML=last[0];const original=template.content.querySelector('img');image.src=original?.getAttribute('src')||'';image.alt=original?.getAttribute('alt')||'';}else{image.src=last[2];image.alt=last[1];}if(!window.HelpRichText.safeImageSrc(image.getAttribute('src'))){say('Sumber gambar tidak valid.',true);return;}image.setAttribute('data-width',value);source.setRangeText(image.outerHTML,last.index,last.index+last[0].length,'end');source.dispatchEvent(new Event('input',{bubbles:true}));};
 for(const bar of [markdownToolbar,toolbar])optionSelect(bar,'Ukuran gambar',[['25','25%'],['50','50%'],['75','75%'],['100','100%']],setImageWidth);
 const update=()=>{const words=window.HelpRichText.plainText(surface.innerHTML).trim().split(/\s+/).filter(Boolean);foot.textContent=words.length+' kata · Ctrl+B tebal · Ctrl+I miring';};
 const fileInput=e('input','inline-image-input');fileInput.type='file';fileInput.accept='image/png,image/jpeg,image/webp,image/gif';fileInput.setAttribute('aria-label','Pilih gambar di dalam teks');fileInput.hidden=true;
 let reading=false,insertionStart=0,insertionEnd=0,savedRange=null;
 const chooseImage=()=>{if(box.dataset.author==='markdown'){insertionStart=source.selectionStart;insertionEnd=source.selectionEnd;}else{const selection=window.getSelection();savedRange=selection?.rangeCount&&surface.contains(selection.anchorNode)?selection.getRangeAt(0).cloneRange():null;}fileInput.click();};
 for(const bar of [markdownToolbar,toolbar]){const imageButton=action('Gambar',chooseImage,'rich-tool');imageButton.setAttribute('aria-label','Sisipkan gambar di dalam teks');bar.append(imageButton);}
 fileInput.addEventListener('change',()=>{const file=fileInput.files?.[0];if(!file)return;if(!['image/png','image/jpeg','image/webp','image/gif'].includes(file.type)||file.size>1000000){say('Gunakan PNG, JPEG, WebP, atau GIF maksimal 1 MB.',true);fileInput.value='';return;}reading=true;const reader=new FileReader();reader.onload=()=>{const url=window.HelpRichText.safeImageSrc(reader.result);reading=false;if(!url){say('Gambar tidak valid.',true);return;}if(box.dataset.author==='markdown'){source.setRangeText('![Gambar bantuan]('+url+')',insertionStart,insertionEnd,'end');source.dispatchEvent(new Event('input',{bubbles:true}));}else{const image=e('img');image.src=url;image.alt='Gambar bantuan';if(savedRange&&surface.contains(savedRange.commonAncestorContainer)){savedRange.deleteContents();savedRange.insertNode(image);}else surface.append(image);surface.dispatchEvent(new Event('input',{bubbles:true}));}fileInput.value='';};reader.onerror=()=>{reading=false;say('Gambar gagal dibaca.',true);};reader.readAsDataURL(file);});
 source.addEventListener('input',()=>{surface.innerHTML=window.HelpMarkdown.toHtml(source.value);update();});
 surface.addEventListener('input',()=>{source.value=window.HelpMarkdown.fromHtml(surface.innerHTML);update();});
 surface.addEventListener('paste',event=>{event.preventDefault();const html=event.clipboardData?.getData('text/html'),text=event.clipboardData?.getData('text/plain')||'';surface.focus();if(html)document.execCommand('insertHTML',false,window.HelpRichText.sanitize(html));else document.execCommand('insertText',false,text);surface.dispatchEvent(new Event('input',{bubbles:true}));});
 box.append(markdownToolbar,toolbar,fileInput,source,surface,foot);wrap.append(label,author,box,e('span','small','Markdown atau editor visual tersinkron. Gambar masuk tepat di posisi kursor.'));parent.append(wrap);update();surface.pendingImage=()=>reading;return surface;
}
function mediaControls(parent,key,refresh){const data=state.content[key]||{};
 field(parent,'Video (YouTube atau tautan langsung MP4/WebM)','video',data.video||'',{wide:true,help:'Gunakan URL https. Video ditampilkan di halaman yang sama dengan teks.'});
 return ()=>null;
}
function renderPreview(form,target,getImage,type,contentMode){target.replaceChildren();const paper=e('article','draft-paper'),name=form.querySelector('[name="label"]')?.value.trim()||'Judul belum diisi',level={product:'PRODUK',module:'MODUL',topic:'SUBMODUL 1',section:'SUBMODUL 2',part:'PANDUAN'}[type];paper.append(e('span','kicker',level),e('h2','',name));
 if(type==='product'){paper.append(e('p','draft-body',form.querySelector('[name="intro"]')?.value||'Ringkasan produk belum diisi.'));target.append(paper);return;}
 if(contentMode==='label'){paper.append(e('p','draft-empty','Hanya label. Navigasi ke submodul dan panduan anak tetap tersedia.'));target.append(paper);return;}
 const html=window.HelpRichText.sanitize(form.querySelector('.rich-surface')?.innerHTML||''),body=e('div','draft-body rich-body');body.append(window.HelpRichText.fragment(html));
 const image=getImage?.(),raw=form.querySelector('[name="video"]')?.value.trim(),safe=raw&&window.HelpRichText.safeVideo(raw);
 if(body.textContent.trim()||body.querySelector('table,img,pre'))paper.append(body);else if(!image&&!raw)paper.append(e('p','draft-empty','Belum ada isi. Anda boleh menyimpan judul saja dan menambahkan penjelasan nanti.'));
 if(image){const photo=e('img','draft-image');photo.src=image;photo.alt='Foto pratinjau';paper.append(photo);}
 if(safe){const box=e('div','draft-video');if(safe.kind==='youtube'){const frame=e('iframe');frame.src=safe.src;frame.title='Video pratinjau';frame.loading='lazy';frame.allowFullscreen=true;box.append(frame);}else{const video=e('video');video.src=safe.src;video.controls=true;box.append(video);}paper.append(box);}else if(raw)paper.append(e('p','draft-empty','Tautan video belum valid. Gunakan HTTPS YouTube, MP4, atau WebM.'));
 target.append(paper);
}
function renderEditor(){editor.replaceChildren();const k=selection.kind,newItem=k.startsWith('new-'),type=newItem?k.slice(4):k;
 if(k==='feedback'){window.FeedbackAdmin.render(editor,{storage:localStorage,document});return;}
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
 const current={product:p,module:mod,topic,section:sec,part}[type];const title=newItem?{product:'Produk baru',module:'Modul baru',topic:'Submodul 1 baru',section:'Submodul 2 baru',part:'Panduan baru'}[type]:current?.label||current?.category||'Editor';
 const description={product:'Nama dan ringkasan produk pada beranda.',module:'Tambahkan penjelasan modul jika diperlukan; boleh dibiarkan kosong.',topic:'Tambahkan penjelasan submodul 1 jika diperlukan; panduan anak tetap tersedia.',section:'Tambahkan penjelasan submodul 2 jika diperlukan; panduan anak tetap tersedia.',part:'Tulis teks, tautan, tabel, foto, dan video pada satu halaman panduan.'}[type];
 const preview=type==='product'&&!newItem?'#/menu/'+p.image:type==='module'&&!newItem?'#/menu/'+p.image+'/modul/'+mod.id:type==='topic'&&!newItem?'#/panduan/'+topic.slug:type==='section'&&!newItem?'#/panduan/'+topic.slug+'/'+sec.id:type==='part'&&!newItem?'#/baca/'+topic.slug+'/'+sec.id+'/'+part.id:null;
 header(title,(newItem?'TAMBAH ':'EDIT ')+({product:'PRODUK',module:'MODUL',topic:'SUBMODUL 1',section:'SUBMODUL 2',part:'PANDUAN'}[type]),description,preview);
 const controls=e('div','mode-controls'),switcher=e('div','mode-switch'),panel=e('div','panel editor-workspace'),form=e('form','editor-form'),fields=e('div','fields'),draft=e('div','editor-preview');
 controls.append(e('strong','','Tampilan editor'));for(const [value,text] of [['edit','Edit'],['split','Split · Edit + View'],['preview','View saja']]){const mode=action(text,()=>{editorMode=value;panel.dataset.mode=value;for(const b of switcher.children)b.setAttribute('aria-pressed',String(b.dataset.value===value));},'editor-mode');mode.dataset.value=value;mode.setAttribute('aria-pressed',String(editorMode===value));switcher.append(mode);}controls.append(switcher,action('Simpan draf',()=>form.requestSubmit(),'primary'));editor.append(controls);
 panel.dataset.mode=editorMode;form.append(fields);panel.append(form,draft);editor.append(panel);
 const names={product:'Nama produk',module:'Nama modul',topic:'Nama submodul 1',section:'Nama submodul 2',part:'Judul panduan'};
 const label=field(fields,names[type],'label',current?.label||current?.category||'',{required:true});
 const id=field(fields,'ID / slug URL','id',newItem?'':current?.image||current?.id||current?.slug||'',{required:false,readonly:!newItem,help:newItem?'Huruf kecil, angka, dan tanda hubung. Kosongkan untuk membuat otomatis.':'ID tidak dapat diubah setelah dibuat agar tautan tetap berlaku.'});
 if(type==='product'){field(fields,'Ikon produk','icon',p?.icon||window.HELP_MENUS.find(x=>x.image===p?.image)?.icon||'',{help:'Masukkan satu emoji atau singkatan pendek (maksimal empat karakter).'});field(fields,'Ringkasan produk','intro',p?.intro||'',{wide:true,multiline:true});}
 const contentKey=newItem?'':type==='module'?M.moduleKey(p.image,mod.id):itemKey();
 if(type!=='product'&&!newItem){const saved=state.content[contentKey]||{};const dates=e('div','content-dates-admin');dates.append(e('span','','Diterbitkan: '+(saved.publishedAt?new Date(saved.publishedAt).toLocaleDateString('id-ID'):'Belum tercatat')),e('span','','Diperbarui: '+(saved.updatedAt?new Date(saved.updatedAt).toLocaleDateString('id-ID'):'Belum tercatat')));fields.append(dates);}
 const optional=['module','topic','section'].includes(type),contentMode=optional?field(fields,'Tampilan tingkat ini','content-mode',!newItem&&Object.hasOwn(state.content,contentKey)?'content':'label',{select:[['label','Hanya label'],['content','Label + isi bantuan']],wide:true,help:'Pilih isi bantuan untuk menulis penjelasan di halaman tingkat ini. Mengubah ke Hanya label menghapus isinya saat disimpan.'}):null;
 const contentFields=e('div','content-fields');if(type!=='product')fields.append(contentFields);
 const richSurface=['module','topic','section','part'].includes(type)?richEditor(contentFields,contentKey):null;
 if(type==='topic'&&p){const options=(state.hierarchy.products[p.image]||[]).map(m=>[m.id,m.label]);if(options.length){const select=field(fields,'Modul','module',mod?.id||options[0][0],{select:options,wide:true});select.value=mod?.id||options[0][0];}}
 const refresh=()=>renderPreview(form,draft,getImage,type,contentMode?.value||'content');
 const getImage=type==='product'?()=>null:mediaControls(contentFields,contentKey,refresh);getImage.pending=()=>richSurface?.pendingImage?.()||false;
 if(contentMode){const toggle=()=>{contentFields.hidden=contentMode.value==='label';refresh();};contentMode.addEventListener('change',toggle);toggle();}
 form.addEventListener('input',refresh);refresh();
 const buttons=e('div','panel-actions');if(!newItem)buttons.append(action('Hapus '+names[type].toLowerCase(),()=>remove(), 'danger'));else buttons.append(e('span'));
 const right=e('div','action-right');right.append(action('Batal',()=>select(type==='product'?{kind:'recommended'}:type==='module'?{kind:'product',product:p.image}:type==='topic'?{kind:'module',product:p.image,module:mod.id}:type==='section'?{kind:'topic',product:p.image,module:mod.id,topic:topic.slug}:{kind:'section',product:p.image,module:mod.id,topic:topic.slug,section:sec.id})),action(newItem?'Buat '+names[type].toLowerCase():'Simpan perubahan',()=>form.requestSubmit(),'primary'));buttons.append(right);form.append(buttons);
 form.addEventListener('submit',ev=>{ev.preventDefault();if(!form.reportValidity())return;const data=Object.fromEntries(new FormData(form));const rich=form.querySelector('.rich-surface');const html=rich?window.HelpRichText.sanitize(rich.innerHTML):'',body=rich?window.HelpRichText.plainText(html):'';const name=String(data.label||'').trim(),ident=String(data.id||'').trim()||(type==='topic'?p.image+'-'+slug(name):slug(name));if(newItem&&!M.slugOk(ident)){say('ID harus berupa huruf kecil, angka, dan tanda hubung.',true);return;}const chosenMode=contentMode?.value||'content';if(chosenMode!=='label'&&getImage.pending?.()){say('Foto sedang diproses. Tunggu sesaat sebelum menyimpan.',true);return;}const video=chosenMode==='label'?'':String(data.video||'').trim();if(video&&!M.videoOk(video)){say('Video harus berupa URL HTTPS YouTube atau tautan langsung MP4/WebM.',true);return;}if(chosenMode==='label'&&!newItem&&Object.hasOwn(state.content,contentKey)&&!confirm('Simpan sebagai Hanya label? Isi bantuan pada tingkat ini akan dihapus.'))return;
  let next={...selection,kind:type};if(newItem){if(type==='product')next={kind:'product',product:ident};if(type==='module')next={kind:'module',product:p.image,module:ident};if(type==='topic')next={kind:'topic',product:p.image,module:data.module,topic:ident};if(type==='section')next={kind:'section',product:p.image,module:mod.id,topic:topic.slug,section:ident};if(type==='part')next={kind:'part',product:p.image,module:mod.id,topic:topic.slug,section:sec.id,part:ident};}
  commit(s=>{
   if(type==='product'){if(newItem){s.menus.push({image:ident,category:name,icon:String(data.icon||'').trim(),intro:data.intro||'',featured:[]});s.hierarchy.products[ident]=[];s.hierarchy.sections[ident]=[];}else{const target=s.menus.find(x=>x.image===p.image);target.category=name;target.icon=data.icon.trim();target.intro=data.intro||'';}}
   if(type==='module'){if(newItem)s.hierarchy.products[p.image].push({id:ident,label:name,topics:[]});else s.hierarchy.products[p.image].find(x=>x.id===mod.id).label=name;}
   if(type==='topic'){const owner=s.menus.find(x=>x.image===p.image);if(newItem){owner.featured.push({slug:ident,label:name,description:''});s.hierarchy.products[p.image].find(x=>x.id===data.module).topics.push(ident);s.hierarchy.topicSections[ident]=[];}else{const target=owner.featured.find(x=>x.slug===topic.slug);target.label=name;for(const m of s.hierarchy.products[p.image])m.topics=m.topics.filter(x=>x!==topic.slug);s.hierarchy.products[p.image].find(x=>x.id===data.module).topics.push(topic.slug);next.module=data.module;}}
   if(type==='section'){s.hierarchy.topicSections[topic.slug]=M.copy(sectionsFor(s,topic.slug,p.image));const list=s.hierarchy.topicSections[topic.slug];if(newItem)list.push({id:ident,label:name,parts:[]});else list.find(x=>x.id===sec.id).label=name;}
   if(type==='part'){s.hierarchy.topicSections[topic.slug]=M.copy(sectionsFor(s,topic.slug,p.image));const section=s.hierarchy.topicSections[topic.slug].find(x=>x.id===sec.id);if(newItem)section.parts.push({id:ident,label:name});else section.parts.find(x=>x.id===part.id).label=name;}
   if(['module','topic','section','part'].includes(type)){
    const key=type==='module'?M.moduleKey(p.image,newItem?ident:mod.id):type==='topic'?(newItem?ident:topic.slug):type==='section'?topic.slug+'/'+(newItem?ident:sec.id):topic.slug+'/'+sec.id+'/'+(newItem?ident:part.id);
    if(chosenMode==='label')delete s.content[key];else{const markdown=String(data.markdown||'');if(body||html.includes('<img')||video||optional){const previous=s.content[key];const now=new Date().toISOString();const item={body,markdown,publishedAt:previous?.publishedAt||now,updatedAt:now};if(!html.includes('data:image/'))item.html=html;if(video)item.video=video;s.content[key]=item;}else delete s.content[key];}
   }
  },next);
 });
}
function remove(){const k=selection.kind,p=selection.product,m=selection.module,t=selection.topic,sec=selection.section,part=selection.part;if(!confirm('Hapus '+k+' ini beserta semua turunan yang terkait?'))return;
 let next={kind:'recommended'};if(k==='module')next={kind:'product',product:p};if(k==='topic')next={kind:'module',product:p,module:m};if(k==='section')next={kind:'topic',product:p,module:m,topic:t};if(k==='part')next={kind:'section',product:p,module:m,topic:t,section:sec};
 commit(s=>{if(k==='product')M.removeProduct(s,p);if(k==='module')M.removeModule(s,p,m);if(k==='topic')M.removeTopic(s,p,t);
 if(k==='section')M.removeSection(s,p,t,sec);
 if(k==='part'){s.hierarchy.topicSections[t]=M.copy(sectionsFor(s,t,p));s.hierarchy.topicSections[t].find(x=>x.id===sec).parts=s.hierarchy.topicSections[t].find(x=>x.id===sec).parts.filter(x=>x.id!==part);delete s.content[t+'/'+sec+'/'+part];}
 },next);
}
function render(){document.body.classList.add('editor-full');renderTree();renderEditor();document.getElementById('tree-toggle').setAttribute('aria-expanded',String(innerWidth>950?!document.body.classList.contains('rail-collapsed'):document.body.classList.contains('rail-open')));}
document.getElementById('feedback-report').addEventListener('click',()=>select({kind:'feedback'}));
document.getElementById('tree-toggle').addEventListener('click',()=>{const mobile=innerWidth<=950,open=mobile?document.body.classList.toggle('rail-open'):!document.body.classList.toggle('rail-collapsed');document.getElementById('tree-toggle').setAttribute('aria-expanded',String(open));if(open)tree.querySelector('.tree-button.active')?.focus();});
document.getElementById('export').addEventListener('click',()=>{const blob=new Blob([JSON.stringify(state,null,2)],{type:'application/json'}),url=URL.createObjectURL(blob),a=e('a');a.href=url;a.download='bantuan-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),1000);say('Cadangan JSON berhasil disiapkan.');});
document.getElementById('import').addEventListener('click',()=>document.getElementById('import-file').click());
document.getElementById('import-file').addEventListener('change',async ev=>{const file=ev.target.files?.[0];if(!file)return;try{if(file.size>4000000)throw Error('File JSON maksimal 4 MB.');const data=JSON.parse(await file.text());M.save(localStorage,data);state=data;selection=state.menus.length?{kind:'product',product:state.menus[0].image}:{kind:'new-product'};render();say('Impor berhasil. Muat ulang halaman bantuan.');}catch(err){say('Impor gagal: '+err.message,true);}ev.target.value='';});
document.getElementById('reset').addEventListener('click',()=>{if(!confirm('Pulihkan data contoh? Semua perubahan lokal yang belum diekspor akan hilang.'))return;localStorage.removeItem(M.KEY);state=M.makeState(window.HELP_MENUS,window.HELP_HIERARCHY,window.HELP_HOME);selection={kind:'product',product:state.menus[0].image};render();say('Data contoh dipulihkan.');});
window.addEventListener('storage',ev=>{if(ev.key===M.KEY)say('Data berubah di tab lain. Muat ulang admin sebelum menyimpan lagi.',true);});
render();
if(location.protocol==='file:')say('Mode file: perubahan admin mungkin tidak terbaca oleh index.html. Jalankan start-admin.bat dan buka kedua halaman di http://127.0.0.1:8765/.',true);
})();