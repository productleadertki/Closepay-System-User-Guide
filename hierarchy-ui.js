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
const PAGE_SIZE=15;
function appendPaged(container,items,renderItem,selectedIndex=-1){
  let start=selectedIndex>=0?Math.floor(selectedIndex/PAGE_SIZE)*PAGE_SIZE:0;
  const makeMore=(label,step)=>{const more=el('button','hierarchy-more',label);more.type='button';more.addEventListener('click',event=>{event.stopPropagation();start=step;draw();});return more;};
  function insertMore(button){if(container.localName==='ul'){const item=el('li','hierarchy-more-row');item.append(button);container.append(item);}else container.append(button);}
  function draw(){
    container.replaceChildren();
    if(start>0)insertMore(makeMore('Lihat '+Math.min(PAGE_SIZE,start)+' sebelumnya',Math.max(0,start-PAGE_SIZE)));
    items.slice(start,start+PAGE_SIZE).forEach(item=>container.append(renderItem(item)));
    if(start+PAGE_SIZE<items.length)insertMore(makeMore('Lihat '+Math.min(PAGE_SIZE,items.length-start-PAGE_SIZE)+' lainnya',start+PAGE_SIZE));
  }
  draw();
}
function render({view,menu,docs,state={}}){
  if(lastProduct!==menu.image){localQuery='';lastProduct=menu.image;mobileNavOpen=false;}
  if(lastRoute!==location.hash){mobileNavOpen=sidebarVisible&&innerWidth<=760;lastRoute=location.hash;}
  let path=model.resolvePath(menu,config,docs,state);
  path.reading=!!state.reading&&!!path.topic&&(!state.part||!!path.part);
  const sections=path.topic?(config.topicSections?.[path.topic.slug]||config.sections?.[menu.image]||[]):config.sections?.[menu.image]||[];
  const contentData=root.HELP_CONTENT||{};

  const appendBody=(container,data)=>{if(!data)return;if(data.html){const rich=el('div','rich-body');rich.append(root.HelpRichText.fragment(data.html));container.append(rich);return;}if(data.markdown){const rich=el('div','rich-body');rich.append(root.HelpRichText.fragment(root.HelpMarkdown.toHtml(data.markdown)));container.append(rich);return;}if(data.body)String(data.body).split(/\n\s*\n/).filter(Boolean).forEach(block=>container.append(el('p','article-paragraph',block.trim())));};
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
  const guideDropdown=el('details','guide-dropdown'),guideSummary=el('summary','guide-dropdown-toggle','Jelajahi panduan'),guidePanel=el('nav','guide-dropdown-panel');
  guidePanel.setAttribute('aria-label','Pilih modul dan panduan '+menu.category);
  const jump=(title,url)=>{const item=link(title,url);item.className='guide-jump-link';if(location.hash===url)item.setAttribute('aria-current','page');return item;};

  appendPaged(guidePanel,path.modules,mod=>{
    const branch=el('details','guide-branch guide-module'),summary=el('summary','guide-branch-title',mod.label),children=el('div','guide-branch-children');
    if(path.module?.id===mod.id)branch.open=true;
    children.append(jump('Lihat modul '+mod.label,moduleUrl(menu,mod)));
    const topicList=el('div');children.append(topicList);
    appendPaged(topicList,mod.topics,topic=>{
      const stages=config.topicSections?.[topic.slug]||config.sections?.[menu.image]||[];
      const topicBranch=el('details','guide-branch guide-topic'),topicChildren=el('div','guide-branch-children');
      if(path.topic?.slug===topic.slug)topicBranch.open=true;
      topicChildren.append(jump('Lihat submodul 1',topicUrl(topic)));
      const stageList=el('div');topicChildren.append(stageList);
      appendPaged(stageList,stages,section=>{
        const sectionBranch=el('details','guide-branch guide-section'),sectionChildren=el('div','guide-branch-children');
        if(path.topic?.slug===topic.slug&&path.section?.id===section.id)sectionBranch.open=true;
        sectionChildren.append(jump('Lihat submodul 2',sectionUrl(topic,section)));
        const partList=el('div');sectionChildren.append(partList);
        appendPaged(partList,section.parts,part=>jump('Buka panduan '+part.label,readUrl(topic,section,part)),section.parts.findIndex(part=>part.id===path.part?.id));
        sectionBranch.append(el('summary','guide-branch-title',section.label),sectionChildren);return sectionBranch;
      },stages.findIndex(section=>section.id===path.section?.id));
      topicBranch.append(el('summary','guide-branch-title',topic.title),topicChildren);return topicBranch;
    },mod.topics.findIndex(topic=>topic.slug===path.topic?.slug));
    branch.append(summary,children);return branch;
  },path.modules.findIndex(mod=>mod.id===path.module?.id));
  guideDropdown.append(guideSummary,guidePanel);
  guideDropdown.addEventListener('keydown',event=>{if(event.key==='Escape'){guideDropdown.open=false;guideSummary.focus();}});
  toolbar.append(sidebarToggle,guideDropdown);
  sidebar.setAttribute('aria-label','Struktur informasi '+menu.category);
  sidebar.append(button('← Semua produk','#/','back-products'),el('h2','sidebar-title',menu.category));
  const filterLabel=el('label','local-filter'),input=el('input');input.type='search';input.placeholder='Cari modul atau kebutuhan…';input.value=localQuery;input.setAttribute('aria-label','Cari dalam produk '+menu.category);filterLabel.append(input);sidebar.append(filterLabel);
  const toggle=el('button','mobile-modules-toggle',mobileNavOpen?'Sembunyikan daftar modul':'Lihat daftar modul');toggle.type='button';toggle.setAttribute('aria-expanded',String(mobileNavOpen));
  const nav=el('nav','topic-nav mobile-collapsible'+(mobileNavOpen?' mobile-open':''));nav.setAttribute('aria-label','Modul dan submodul '+menu.category);
  toggle.addEventListener('click',()=>{mobileNavOpen=!mobileNavOpen;nav.classList.toggle('mobile-open',mobileNavOpen);toggle.textContent=mobileNavOpen?'Sembunyikan daftar modul':'Lihat daftar modul';toggle.setAttribute('aria-expanded',String(mobileNavOpen));});

  const groupList=el('div','module-list');nav.append(groupList);sidebar.append(toggle,nav);
  const expanded=new Set(path.modules.map(m=>m.id));
  function drawGroups(){
    const query=localQuery.trim().toLowerCase();
    const visibleModules=path.modules.filter(mod=>!query||mod.label.toLowerCase().includes(query)||mod.topics.some(t=>(t.title+' '+t.description+' '+(t.body||'')).toLowerCase().includes(query)));
    appendPaged(groupList,visibleModules,mod=>{
      const moduleMatches=mod.label.toLowerCase().includes(query);
      const items=query&&!moduleMatches?mod.topics.filter(t=>(t.title+' '+t.description+' '+(t.body||'')).toLowerCase().includes(query)):mod.topics;
      const group=el('div','module-group'),heading=el('div','module-heading');
      const toggle=el('button','module-toggle',expanded.has(mod.id)?'▾':'▸');toggle.type='button';toggle.setAttribute('aria-label',(expanded.has(mod.id)?'Tutup ':'Buka ')+mod.label);toggle.setAttribute('aria-expanded',String(expanded.has(mod.id)));
      toggle.addEventListener('click',()=>{expanded.has(mod.id)?expanded.delete(mod.id):expanded.add(mod.id);drawGroups();});
      heading.append(toggle,button(mod.label,moduleUrl(menu,mod),'module-link'+(path.module?.id===mod.id&&!path.topic?' active':'')));group.append(heading);
      if(expanded.has(mod.id)){
        const children=el('div','module-children');
        appendPaged(children,items,topic=>{
          const row=el('div');row.append(button(topic.title,topicUrl(topic),'topic-nav-item'+(path.topic?.slug===topic.slug&&!path.section?' active':'')));
          if(path.topic?.slug===topic.slug){
            const stages=el('div','stage-children');
            appendPaged(stages,sections,section=>{
              const sectionRow=el('div');sectionRow.append(button(section.label,sectionUrl(topic,section),'stage-item'+(path.section?.id===section.id&&!path.part?' active':'')));
              if(path.section?.id===section.id){
                const parts=el('div');appendPaged(parts,section.parts,part=>button(part.label,readUrl(topic,section,part),'part-item'+(path.part?.id===part.id?' active':'')),section.parts.findIndex(part=>part.id===path.part?.id));sectionRow.append(parts);
              }
              return sectionRow;
            },sections.findIndex(section=>section.id===path.section?.id));row.append(stages);
          }
          return row;
        },items.findIndex(topic=>topic.slug===path.topic?.slug));group.append(children);
      }
      return group;
    },visibleModules.findIndex(mod=>mod.id===path.module?.id));
    if(!visibleModules.length)groupList.append(el('p','local-empty','Tidak ada modul atau panduan yang cocok.'));
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
  }else if(!path.topic){
    const data=contentData[root.HelpAdminModel.moduleKey(menu.image,path.module.id)];
    appendExplanation(content,data,path.module.label);
    const list=el('ul','article-topic-list');appendPaged(list,path.module.topics,topic=>{const li=el('li');li.append(link(topic.title,topicUrl(topic)));return li;},path.module.topics.findIndex(topic=>topic.slug===path.topic?.slug));content.append(list);
  }else{
    if(path.reading){
      const key=path.topic.slug+(path.section?'/'+path.section.id:'')+(path.part?'/'+path.part.id:'');
      const data=contentData[key]||{};
      if(!path.section&&path.topic.description)content.append(el('p','article-lead',path.topic.description));
      appendBody(content,data);
      if(data.image)appendFigure(content,data.image,'Gambar panduan '+title);
      else if(!data.markdown&&!data.html&&!data.body&&!path.section&&['ppdb','ppob'].includes(menu.image)){const figure=el('figure','article-figure'),image=el('img');image.src='assets/'+menu.image+'.svg';image.alt='Ilustrasi konsep '+menu.category;figure.append(image,el('figcaption','','Ilustrasi konsep, bukan tampilan sistem final.'));content.append(figure);}
      if(data.video)appendVideo(content,data.video,title);
      if(!data.body&&!data.html&&!data.markdown&&!data.image&&!data.video&&!(!path.section&&path.topic.description))content.append(el('p','article-lead','Isi panduan untuk bagian ini belum tersedia.'));

    }else if(!path.section){
      const data=contentData[path.topic.slug];
      appendExplanation(content,data,path.topic.title);
      const list=el('ul','article-topic-list');
      appendPaged(list,sections,section=>{const li=el('li');li.append(link(section.label,sectionUrl(path.topic,section)));return li;},sections.findIndex(section=>section.id===path.section?.id));content.append(list);
    }else if(!path.part){
      const data=contentData[path.topic.slug+'/'+path.section.id];
      appendExplanation(content,data,path.section.label);
      const list=el('ul','article-topic-list');
      appendPaged(list,path.section.parts,part=>{const li=el('li');li.append(link(part.label,readUrl(path.topic,path.section,part)));return li;},path.section.parts.findIndex(part=>part.id===path.part?.id));content.append(list);
    }else{
      content.append(link('Baca panduan '+path.part.label,readUrl(path.topic,path.section,path.part)));
    }
  }
  guideDocument.append(content);
  const pageId=!path.module?'@product/'+menu.image:!path.topic?root.HelpAdminModel.moduleKey(menu.image,path.module.id):path.topic.slug+(path.section?'/'+path.section.id:'')+(path.part?'/'+path.part.id:'');
  const pageData=contentData[pageId];
  if(pageData?.publishedAt||pageData?.updatedAt){const meta=el('div','content-dates');if(pageData.publishedAt)meta.append(el('span','','Diterbitkan '+new Date(pageData.publishedAt).toLocaleDateString('id-ID')));if(pageData.updatedAt)meta.append(el('span','','Diperbarui '+new Date(pageData.updatedAt).toLocaleDateString('id-ID')));guideDocument.append(meta);}
  if(root.FeedbackUI){const feedback=el('div','feedback-slot');guideDocument.append(feedback);root.FeedbackUI.mount(feedback,{pageId,title});}

  workspace.append(toolbar,sidebar,article);view.append(workspace);
}
root.HierarchyUI={render};
})(typeof globalThis!=='undefined'?globalThis:this);
