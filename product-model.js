(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;root.ProductModel=api;})(typeof globalThis!=='undefined'?globalThis:this,function(){
  const normalize=value=>String(value||'').normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,' ').trim();
  const iconForProduct=menu=>menu?.icon||({ppdb:'🎓',ppob:'🧾'}[menu?.image])||String(menu?.category||'').slice(0,2);
  function topicsForProduct(menu,docs,query=''){
    if(!menu)return [];
    const term=normalize(query);
    return menu.featured.map(need=>docs.find(doc=>doc.slug===need.slug&&doc.category===menu.category)).filter(Boolean)
      .filter(doc=>!term||normalize([doc.title,doc.description,doc.slug].join(' ')).includes(term));
  }
  function relatedForProduct(menu,current,docs){
    if(!current)return [];
    return topicsForProduct(menu,docs).filter(doc=>doc.slug!==current.slug).slice(0,3);
  }
  return {topicsForProduct,relatedForProduct,iconForProduct};
});
