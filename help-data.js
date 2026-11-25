(function(root){
'use strict';
if(!root.HelpAdminModel||!root.localStorage)return;
const model=root.HelpAdminModel;
let raw;
try{raw=root.localStorage.getItem(model.KEY);}catch(e){return;}
if(!raw)return;
try{
 const data=JSON.parse(raw),errors=model.validate(data);
 if(errors.length)throw Error(errors.join(' '));
 root.HELP_MENUS=data.menus;
 root.HELP_HIERARCHY=data.hierarchy;
 root.HELP_HOME=data.home;
 root.HELP_TOPICS=model.deriveTopics(data);
 root.HELP_CONTENT=data.content;
 root.HELP_ADMIN_ACTIVE=true;
}catch(e){console.warn('Data admin tidak valid; data contoh digunakan.',e);}
})(typeof globalThis!=='undefined'?globalThis:this);