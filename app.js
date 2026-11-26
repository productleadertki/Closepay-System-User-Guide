(() => {
'use strict';
const docs=window.HELP_TOPICS||[], menus=window.HELP_MENUS||[], home=window.HELP_HOME||{recommended:[]};
const view=document.getElementById('view'), search=document.getElementById('search'), clear=document.getElementById('clear'), topNav=document.getElementById('top-product-nav');
let shown=10, filter='Semua topik';
const byMenu=key=>menus.find(menu=>menu.image===key);
const byDoc=slug=>docs.find(doc=>doc.slug===slug);
const guideForDoc=doc=>{const menu=menus.find(item=>item.category===doc.category),sections=window.HELP_HIERARCHY.topicSections?.[doc.slug]||window.HELP_HIERARCHY.sections?.[menu?.image]||[];for(const section of sections)if(section.parts?.length)return {path:'#/baca/'+encodeURIComponent(doc.slug)+'/'+encodeURIComponent(section.id)+'/'+encodeURIComponent(section.parts[0].id),title:section.parts[0].label};return {path:'#/panduan/'+encodeURIComponent(doc.slug),title:doc.title};};
const docPath=doc=>guideForDoc(doc).path;
const menuPath=menu=>'#/menu/'+encodeURIComponent(menu.image);

function element(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function renderTopNav(active){
  const nav=element('nav','product-tabs');nav.setAttribute('aria-label','Navigasi produk');
  const tabs=element('div','shell tabs-inner');
  menus.slice(0,2).forEach(menu=>{
    const tab=element('a',active?.image===menu.image?'active':'',menu.category);
    tab.href=menuPath(menu);if(active?.image===menu.image)tab.setAttribute('aria-current','page');tabs.append(tab);
  });
  const more=element('details','product-more'+(active&&!menus.slice(0,2).includes(active)?' active':''));
  const summary=element('summary','','Produk lainnya');summary.append(element('span','chevron','▾'));more.append(summary);
  const panel=element('div','product-more-menu');
  const all=element('a','','Lihat semua produk');all.href='#/';panel.append(all);
  menus.slice(2).forEach(menu=>{const item=element('a','',menu.category);item.href=menuPath(menu);panel.append(item);});
  if(menus.length<=2)panel.append(element('p','','Produk lain dapat ditambahkan di konfigurasi.'));
  more.append(panel);tabs.append(more);nav.append(tabs);topNav.replaceChildren(nav);
}
function navigate(path){if(location.hash===path){shown=10;render();return;}location.hash=path;}
function button(label,action,className=''){const b=element('button',className,label);b.type='button';b.addEventListener('click',action);return b;}
function crumb(parts){const nav=element('nav','crumbs');nav.setAttribute('aria-label','Jejak navigasi');parts.forEach((part,i)=>{if(i)nav.append(element('span','','/'));nav.append(part.path?button(part.text,()=>navigate(part.path)):element('strong','',part.text));});return nav;}
function heading(title,subtitle,count){const head=element('div','heading'),group=element('div');group.append(element('h2','',title),element('p','',subtitle));head.append(group);if(count!==undefined)head.append(element('span','count',count+' topik'));return head;}
function footerRow(doc){const b=button('',()=>navigate(docPath(doc)),'topic-row'),left=element('span');left.append(element('strong','',guideForDoc(doc).title),element('small','',doc.title+' · '+doc.category));b.append(left,element('span','arrow','↗'));return b;}
function renderBoard(){
  view.replaceChildren();
  const reads=element('section','home-section recommended');reads.setAttribute('aria-label','Recommended Reads');
  reads.append(heading('Recommended Reads','Panduan pilihan untuk membantu Anda memulai.'));
  const readsGrid=element('div','reads-grid');
  home.recommended.slice(0,6).forEach((slug,index)=>{
    const doc=byDoc(slug);if(!doc)return;
    const card=button('',()=>navigate(docPath(doc)),'read-card');
    const icon=element('span','read-icon',String(index+1).padStart(2,'0'));icon.setAttribute('aria-hidden','true');
    const copy=element('span','read-copy');
    copy.append(element('span','read-category',doc.category),element('strong','',guideForDoc(doc).title),element('small','',doc.title),element('span','read-link','Baca panduan →'));
    card.append(icon,copy);readsGrid.append(card);
  });
  reads.append(readsGrid);view.append(reads);
  const products=element('section','home-section products');
  products.setAttribute('aria-label','Our Products');
  products.append(heading('Our Products','Pilih produk untuk menjelajahi modul dan kebutuhan yang tersedia.'));
  const grid=element('div','product-grid');
  menus.forEach(menu=>{
    const card=button('',()=>navigate(menuPath(menu)),'product-card');
    const icon=element('span','product-icon',menu.category.length<=4?menu.category:menu.category.slice(0,2));icon.setAttribute('aria-hidden','true');
    const modules=window.HELP_HIERARCHY.products[menu.image]||[];
    card.append(icon,element('strong','',menu.category),element('small','',menu.intro),element('span','product-count',modules.length+' modul · '+menu.featured.length+' kebutuhan'),element('span','product-link','Jelajahi produk →'));
    grid.append(card);
  });
  products.append(grid);view.append(products);
}
function renderSearch(query){view.replaceChildren();view.append(crumb([{text:'Semua produk',path:'#/'},{text:'Hasil pencarian'}]));const matches=HelpSearch.searchDocs(docs,query,filter);view.append(heading('Hasil untuk “'+query+'”','Pilih kebutuhan untuk melihat gambar dan tautan terkait.',matches.length));const filters=element('div','filters');['Semua topik',...menus.map(m=>m.category)].forEach(name=>filters.append(button(name,()=>{filter=name;shown=10;render();},name===filter?'active':'')));view.append(filters);if(!matches.length){const empty=element('div','empty');empty.append(element('h3','','Belum ada topik yang cocok'),element('p','','Coba kata lain atau pilih salah satu produk bantuan.'));empty.append(button('Kembali ke semua produk',()=>{search.value='';navigate('#/');}));view.append(empty);return;}const list=element('div','topic-list');matches.slice(0,shown).forEach(doc=>list.append(footerRow(doc)));view.append(list);if(shown<matches.length)view.append(button('Tampilkan lebih banyak ('+(matches.length-shown)+' tersisa)',()=>{shown+=10;render();},'more'));}
function render(){const hash=decodeURIComponent(location.hash||'#/'),searchMatch=hash.match(/^#\/cari(?:\?q=(.*))?$/),menuMatch=hash.match(/^#\/menu\/([^/]+)(?:\/modul\/([^/]+))?$/),docMatch=hash.match(/^#\/(panduan|baca)\/([^/]+)(?:\/([^/]+))?(?:\/([^/]+))?$/);const selected=docMatch?byDoc(docMatch[2]):null,product=selected?menus.find(menu=>menu.category===selected.category):menuMatch?byMenu(menuMatch[1]):null;document.body.classList.toggle('compact',!!(searchMatch||product));document.body.classList.toggle('workspace-mode',!!product);renderTopNav(product);if(searchMatch){search.value=searchMatch[1]||'';clear.classList.toggle('show',!!search.value);if(search.value.trim())renderSearch(search.value.trim());else renderBoard();}else{search.value='';clear.classList.remove('show');if(product){const moduleId=selected?(window.HELP_HIERARCHY.products[product.image]||[]).find(mod=>mod.topics.includes(selected.slug))?.id:menuMatch?.[2];window.HierarchyUI.render({view,menu:product,docs,state:{module:moduleId,topic:selected?.slug,section:docMatch?.[3],part:docMatch?.[4],reading:docMatch?.[1]==='baca'||!!docMatch?.[4]}});}else renderBoard();}}
search.addEventListener('input',()=>{shown=10;filter='Semua topik';const route=search.value.trim()?'#/cari?q='+encodeURIComponent(search.value.trim()):'#/';history.replaceState(null,'',route);render();search.focus();});clear.addEventListener('click',event=>{event.preventDefault();search.value='';navigate('#/');search.focus();});window.addEventListener('hashchange',()=>{shown=10;render();window.scrollTo(0,0);});document.addEventListener('keydown',event=>{if(((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k')||(event.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName))){event.preventDefault();if(document.body.classList.contains('workspace-mode')&&document.querySelector('.sidebar-collapsed'))document.querySelector('.sidebar-toggle')?.click();const target=document.body.classList.contains('workspace-mode')?document.querySelector('.local-filter input'):search;target?.focus();target?.select();}if(event.key==='Escape'&&(document.activeElement===search||document.activeElement===document.querySelector('.local-filter input')))document.activeElement.blur();});render();
})();
