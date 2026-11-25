(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.HierarchyModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  function modulesForProduct(menu,config,docs){
    if(!menu)return [];
    return (config.products[menu.image]||[]).map(group=>({id:group.id,label:group.label,
      topics:group.topics.map(slug=>docs.find(doc=>doc.slug===slug&&doc.category===menu.category)).filter(Boolean)}));
  }
  function resolvePath(menu,config,docs,ids={}){
    const modules=modulesForProduct(menu,config,docs);
    const module=modules.find(item=>item.id===ids.module)||null;
    const topic=module?.topics.find(item=>item.slug===ids.topic)||null;
    const section=topic?(config.topicSections?.[topic.slug]||config.sections?.[menu.image]||[]).find(item=>item.id===ids.section)||null:null;
    const part=section?.parts.find(item=>item.id===ids.part)||null;
    return {menu:menu||null,modules,module,topic,section,part};
  }
  return {modulesForProduct,resolvePath};
});
