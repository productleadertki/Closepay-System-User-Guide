(function(root){
'use strict';
let lastProduct='', localQuery='', mobileNavOpen=false, lastRoute='', sidebarVisible=innerWidth>760;
const config=root.HELP_HIERARCHY;
const model=root.HierarchyModel;
const el=(tag,cls,text)=>{const node=document.createElement(tag);if(cls)node.className=cls;if(text!==undefined)node.textContent=text;return node;};
const link=(text,hash)=>{const a=el('a','inline-link',text);a.href=hash;return a;};
const button=(text,hash,cls)=>{const b=el('button',cls,text);b.type='button';b.addEventListener('click',()=>{location.hash=hash;});return b;};
const menuUrl=menu=>'#/menu/'+encodeURIComponent(menu.image);
const moduleUrl=(menu,module)=>menuUrl(menu)+'/modul/'+encodeURIComponent(module.id);
const topicUrl=topic=>'#/panduan/'+encodeURIComponent(topic.slug);
const sectionUrl=(topic,section)=>topicUrl(topic)+'/'+encodeURIComponent(section.id);
const readUrl=(topic,section,part)=>'#/baca/'+encodeURIComponent(topic.slug)+(section?'/'+encodeURIComponent(section.id):'')+(part?'/'+encodeURIComponent(part.id):'');
function render({view,menu,docs,state={}}){
  if(lastProduct!==menu.image){localQuery='';lastProduct=menu.image;mobileNavOpen=false;}
  if(lastRoute!==location.hash){mobileNavOpen=sidebarVisible&&innerWidth<=760;lastRoute=location.hash;}
  let path=model.resolvePath(menu,config,docs,state);
  path.reading=!!state.reading&&!!path.topic&&(!state.part||!!path.part);
  const sections=path.topic?(config.topicSections?.[path.topic.slug]||config.sections?.[menu.image]||[]):config.sections?.[menu.image]||[];
  const contentData=root.HELP_CONTENT||{};
  const firstGuideUrl=topic=>{const list=config.topicSections?.[topic.slug]||config.sections?.[menu.image]||[];for(const section of list)if(section.parts?.length)return readUrl(topic,section,section.parts[0]);return topicUrl(topic);};
  const appendBody=(container,data)=>{if(!data)return;if(data.html){const rich=el('div','rich-body');rich.append(root.HelpRichText.fragment(data.html));container.append(rich);return;}if(data.body)String(data.body).split(/\n\s*\n/).filter(Boolean).forEach(block=>container.append(el('p','article-paragraph',block.trim())));};
  const appendFigure=(container,src,alt)=>{if(!src)return;const figure=el('figure','article-figure'),image=el('img');image.src=src;image.alt=alt;figure.append(image,el('figcaption','','Gambar panduan'));container.append(figure);};
  const appendVideo=(container,raw,title)=>{const safe=root.HelpRichText.safeVideo(raw);if(!safe)return;const box=el('div','article-video');let media;if(safe.kind==='youtube'){media=el('iframe');media.title='Video panduan '+title;media.src=safe.src;media.loading='lazy';media.referrerPolicy='strict-origin-when-cross-origin';media.allowFullscreen=true;}else{media=el('video');media.src=safe.src;media.controls=true;media.preload='metadata';}box.append(media);container.append(box);};
  const appendExplanation=(container,data,title)=>{if(!data)return;appendBody(container,data);if(data.image)appendFigure(container,data.image,'Gambar '+title);if(data.video)appendVideo(container,data.video,title);};
  if(path.topic&&localQuery){
    const matches=path.modules.some(mod=>mod.topics.some(topic=>topic.slug===path.topic.slug&&((topic.title+' '+topic.description+' '+(topic.body||'')).toLowerCase().includes(localQuery.toLowerCase())||mod.label.toLowerCase().includes(localQuery.toLowerCase()))));
    if(!matches)localQuery='';
  }
  view.replaceChildren();
  const workspace=el('div','product-workspace'+(sidebarVisible?'':' sidebar-collapsed')),sidebar=el('aside','workspace-sidebar'),article=el('article','workspace-article'+(path.reading?' reading-view':''));
  sidebar.id='product-sidebar';sidebar.setAttribute('aria-hidden',String(!sidebarVisible));
  const toolbar=el('div','workspace-toolbar');
  const sidebarToggle=el('button','sidebar-toggle',sidebarVisible?'Sembunyikan sidebar':'Tampilkan sidebar');
  sidebarToggle.type='button';sidebarToggle.setAttribute('aria-controls','product-sidebar');sidebarToggle.setAttribute('aria-expanded',String(sidebarVisible));
  sidebarToggle.addEventListener('click',()=>{
    sidebarVisible=!sidebarVisible;
    workspace.classList.toggle('sidebar-collapsed',!sidebarVisible);
    sidebar.setAttribute('aria-hidden',String(!sidebarVisible));
    sidebarToggle.setAttribute('aria-expanded',String(sidebarVisible));
    sidebarToggle.textContent=sidebarVisible?'Sembunyikan sidebar':'Tampilkan sidebar';
    if(sidebarVisible&&innerWidth<=760){mobileNavOpen=true;nav.classList.add('mobile-open');toggle.textContent='Sembunyikan daftar modul';toggle.setAttribute('aria-expanded','true');}
  });
  const guideDropdown=el('details','guide-dropdown'),guideSummary=el('summary','guide-dropdown-toggle','Jelajahi panduan ▾'),guidePanel=el('nav','guide-dropdown-panel');
  guidePanel.setAttribute('aria-label','Pilih modul dan panduan '+menu.category);
  const jump=(title,url)=>{const item=link(title,url);item.className='guide-jump-link';if(location.hash===url)item.setAttribute('aria-current','page');return item;};
  guidePanel.append(jump('Ikhtisar '+menu.category,menuUrl(menu)));
  path.modules.forEach(mod=>{
    const branch=el('details','guide-branch guide-module'),summary=el('summary','guide-branch-title',mod.label),children=el('div','guide-branch-children');
    if(path.module?.id===mod.id)branch.open=true;
    children.append(jump('Lihat modul '+mod.label,moduleUrl(menu,mod)));
    mod.topics.forEach(topic=>{
      const stages=config.topicSections?.[topic.slug]||config.sections?.[menu.image]||[];
      const topicBranch=el('details','guide-branch guide-topic'),topicChildren=el('div','guide-branch-children');
      if(path.topic?.slug===topic.slug)topicBranch.open=true;
      topicChildren.append(jump('Lihat submodul 1',topicUrl(topic)));

      stages.forEach(section=>{
        const sectionBranch=el('details','guide-branch guide-section'),sectionChildren=el('div','guide-branch-children');
        if(path.topic?.slug===topic.slug&&path.section?.id===section.id)sectionBranch.open=true;
        sectionChildren.append(jump('Lihat submodul 2',sectionUrl(topic,section)));

        section.parts.forEach(part=>sectionChildren.append(jump('Buka panduan '+part.label,readUrl(topic,section,part))));
        sectionBranch.append(el('summary','guide-branch-title',section.label),sectionChildren);topicChildren.append(sectionBranch);
      });
      topicBranch.append(el('summary','guide-branch-title',topic.title),topicChildren);children.append(topicBranch);
    });
    branch.append(summary,children);guidePanel.append(branch);
  });
  guideDropdown.append(guideSummary,guidePanel);
  guideDropdown.addEventListener('keydown',event=>{if(event.key==='Escape'){guideDropdown.open=false;guideSummary.focus();}});
  toolbar.append(sidebarToggle,guideDropdown,el('span','toolbar-hint','Navigasi modul dan panduan · '+menu.category));
  sidebar.setAttribute('aria-label','Struktur informasi '+menu.category);
  sidebar.append(button('← Semua produk','#/','back-products'),el('h2','sidebar-title',menu.category),el('p','sidebar-meta',path.modules.length+' modul · '+path.modules.reduce((n,m)=>n+m.topics.length,0)+' kebutuhan'));
  const filterLabel=el('label','local-filter'),input=el('input');input.type='search';input.placeholder='Cari modul atau kebutuhan…';input.value=localQuery;input.setAttribute('aria-label','Cari dalam produk '+menu.category);filterLabel.append(input);sidebar.append(filterLabel);
  const toggle=el('button','mobile-modules-toggle',mobileNavOpen?'Sembunyikan daftar modul':'Lihat daftar modul');toggle.type='button';toggle.setAttribute('aria-expanded',String(mobileNavOpen));
  const nav=el('nav','topic-nav mobile-collapsible'+(mobileNavOpen?' mobile-open':''));nav.setAttribute('aria-label','Modul dan submodul '+menu.category);
  toggle.addEventListener('click',()=>{mobileNavOpen=!mobileNavOpen;nav.classList.toggle('mobile-open',mobileNavOpen);toggle.textContent=mobileNavOpen?'Sembunyikan daftar modul':'Lihat daftar modul';toggle.setAttribute('aria-expanded',String(mobileNavOpen));});
  nav.append(button('Ikhtisar produk',menuUrl(menu),'overview-item'+(!path.module?' active':'')));
  const groupList=el('div','module-list');nav.append(groupList);sidebar.append(toggle,nav);
  const expanded=new Set(path.modules.map(m=>m.id));
  function drawGroups(){
    groupList.replaceChildren();const query=localQuery.trim().toLowerCase();let count=0;
    path.modules.forEach(mod=>{
      const moduleMatches=mod.label.toLowerCase().includes(query);
      const items=query&&!moduleMatches?mod.topics.filter(t=>(t.title+' '+t.description+' '+(t.body||'')).toLowerCase().includes(query)):mod.topics;
      if(query&&!moduleMatches&&!items.length)return;
      count+=items.length;
      const group=el('div','module-group'),heading=el('div','module-heading');
      const toggle=el('button','module-toggle',expanded.has(mod.id)?'▾':'▸');toggle.type='button';toggle.setAttribute('aria-label',(expanded.has(mod.id)?'Tutup ':'Buka ')+mod.label);toggle.setAttribute('aria-expanded',String(expanded.has(mod.id)));
      toggle.addEventListener('click',()=>{expanded.has(mod.id)?expanded.delete(mod.id):expanded.add(mod.id);drawGroups();});
      heading.append(toggle,button(mod.label,moduleUrl(menu,mod),'module-link'+(path.module?.id===mod.id&&!path.topic?' active':'')));group.append(heading);
      if(expanded.has(mod.id)){
        const children=el('div','module-children');
        items.forEach(topic=>{
          children.append(button(topic.title,topicUrl(topic),'topic-nav-item'+(path.topic?.slug===topic.slug&&!path.section?' active':'')));
          if(path.topic?.slug===topic.slug){
            const stages=el('div','stage-children');
            sections.forEach(section=>{
              stages.append(button(section.label,sectionUrl(topic,section),'stage-item'+(path.section?.id===section.id&&!path.part?' active':'')));
              if(path.section?.id===section.id){
                section.parts.forEach(part=>stages.append(button(part.label,readUrl(topic,section,part),'part-item'+(path.part?.id===part.id?' active':''))));
              }
            });children.append(stages);
          }
        });group.append(children);
      }
      groupList.append(group);
    });
    if(!count)groupList.append(el('p','local-empty','Tidak ada modul atau kebutuhan yang cocok.'));
  }
  input.addEventListener('input',()=>{localQuery=input.value;if(innerWidth<=760){mobileNavOpen=true;nav.classList.add('mobile-open');toggle.textContent='Sembunyikan daftar modul';toggle.setAttribute('aria-expanded','true');}drawGroups();});drawGroups();
  const breadcrumb=el('nav','crumbs');breadcrumb.setAttribute('aria-label','Jejak navigasi');
  const crumbs=[['Semua produk','#/'],[menu.category,menuUrl(menu)]];
  if(path.module)crumbs.push([path.module.label,moduleUrl(menu,path.module)]);
  if(path.topic)crumbs.push([path.topic.title,topicUrl(path.topic)]);
  if(path.section)crumbs.push([path.section.label,sectionUrl(path.topic,path.section)]);
  if(path.part)crumbs.push([path.part.label,null]);
  if(path.reading&&!path.part)crumbs.push(['Panduan terdahulu',null]);
  crumbs.forEach(([text,url],i)=>{if(i)breadcrumb.append(el('span','','/'));if(url&&i<crumbs.length-1)breadcrumb.append(button(text,url));else breadcrumb.append(el('strong','',text));});article.append(breadcrumb);
  const title=path.part?.label||path.section?.label||path.topic?.title||path.module?.label||menu.category;
  const level=path.reading?'PANDUAN':path.part?'SUBMODUL 3':path.section?'SUBMODUL 2':path.topic?'SUBMODUL 1':path.module?'MODUL':'PRODUK';
  const guideLayout=path.reading?el('div','guide-reading-layout'):null,guideDocument=path.reading?el('div','guide-document'):article;
  if(guideLayout){guideLayout.append(guideDocument);article.append(guideLayout);}
  guideDocument.append(el('span','article-eyebrow',level+' · '+menu.category),el('h1','article-title',title),el('div','article-meta',(root.HELP_ADMIN_ACTIVE?'Panduan produk · ':'Contoh struktur bantuan · ')+menu.category));
  const content=el('div','article-content');
  if(!path.module){
    content.append(el('p','article-lead',menu.intro));
    content.append(el('h2','','Modul dalam produk ini'));
    content.append(el('p','','Pilih modul di panel kiri atau pilih kebutuhan di bawah. Setiap produk memiliki struktur dan penjelasannya sendiri.'));
    path.modules.forEach(mod=>{
      const section=el('section','overview-module');section.append(el('h3','',mod.label));
      const list=el('ul');mod.topics.forEach(topic=>{const li=el('li');li.append(link(topic.title,topicUrl(topic)));list.append(li);});section.append(list);content.append(section);
    });
  }else if(!path.topic){
    const data=contentData[root.HelpAdminModel.moduleKey(menu.image,path.module.id)];
    appendExplanation(content,data,path.module.label);
    const list=el('ul','article-topic-list');path.module.topics.forEach(topic=>{const li=el('li');li.append(link(topic.title,topicUrl(topic)));list.append(li);});content.append(list);
  }else{
    if(path.reading){
      const key=path.topic.slug+(path.section?'/'+path.section.id:'')+(path.part?'/'+path.part.id:'');
      const data=contentData[key]||{};
      if(!path.section&&path.topic.description)content.append(el('p','article-lead',path.topic.description));
      appendBody(content,data);
      if(data.image)appendFigure(content,data.image,'Gambar panduan '+title);
      else if(!path.section&&['ppdb','ppob'].includes(menu.image)){const figure=el('figure','article-figure'),image=el('img');image.src='assets/'+menu.image+'.svg';image.alt='Ilustrasi konsep '+menu.category;figure.append(image,el('figcaption','','Ilustrasi konsep, bukan tampilan sistem final.'));content.append(figure);}
      if(data.video)appendVideo(content,data.video,title);
      if(!data.body&&!data.html&&!data.image&&!data.video&&!(!path.section&&path.topic.description))content.append(el('p','article-lead','Isi panduan untuk bagian ini belum tersedia.'));
      const related=root.ProductModel.relatedForProduct(menu,path.topic,docs);
      if(related.length){content.append(el('h2','','Panduan lain dalam produk ini'));const p=el('p');related.forEach((topic,i)=>{if(i)p.append(document.createTextNode(i===related.length-1?' atau ':', '));p.append(link(topic.title,firstGuideUrl(topic)));});content.append(p);}
    }else if(!path.section){
      const data=contentData[path.topic.slug];
      appendExplanation(content,data,path.topic.title);
      const list=el('ul','article-topic-list');
      sections.forEach(section=>{const li=el('li');li.append(link(section.label,sectionUrl(path.topic,section)));list.append(li);});content.append(list);
    }else if(!path.part){
      const data=contentData[path.topic.slug+'/'+path.section.id];
      appendExplanation(content,data,path.section.label);
      const list=el('ul','article-topic-list');
      path.section.parts.forEach(part=>{const li=el('li');li.append(link(part.label,readUrl(path.topic,path.section,part)));list.append(li);});content.append(list);
    }else{
      content.append(link('Baca panduan '+path.part.label,readUrl(path.topic,path.section,path.part)));
    }
  }
  guideDocument.append(content);
  if(path.reading){
    const aside=el('aside','guide-toc'),heading=el('h2','','Di halaman ini');aside.append(heading);
    const headings=[...content.querySelectorAll('.rich-body h2,.rich-body h3')];
    headings.forEach(item=>{const target=el('button','guide-toc-link',item.textContent);target.type='button';target.addEventListener('click',()=>item.scrollIntoView({behavior:'smooth',block:'start'}));aside.append(target);});
    const back=link('← Kembali ke '+(path.section?'submodul 2':'submodul 1'),path.section?sectionUrl(path.topic,path.section):topicUrl(path.topic));back.className='guide-toc-back';aside.append(back);guideLayout.append(aside);
  }
  workspace.append(toolbar,sidebar,article);view.append(workspace);
}
root.HierarchyUI={render};
})(typeof globalThis!=='undefined'?globalThis:this);
