(function(root,factory){
 'use strict';
 const api=factory();
 if(typeof module==='object'&&module.exports)module.exports=api;
 root.FeedbackModel=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(){
 'use strict';
 const KEY='closepay.help.feedback.v1';
 function all(storage){try{const rows=JSON.parse(storage.getItem(KEY)||'{}');return rows&&typeof rows==='object'&&!Array.isArray(rows)?rows:{};}catch{return {};}}
 function get(storage,pageId){return all(storage)[pageId]||null;}
 function vote(storage,pageId,title,value,at=new Date().toISOString()){
  if(!pageId||!['yes','no'].includes(value))throw new Error('Halaman atau pilihan tidak valid.');
  const rows=all(storage),old=rows[pageId];
  rows[pageId]={pageId,title:String(title||pageId),vote:value,reason:'',comment:'',createdAt:old?.createdAt||at,updatedAt:at};
  storage.setItem(KEY,JSON.stringify(rows));return rows[pageId];
 }
 function addDetail(storage,pageId,reason,comment,at=new Date().toISOString()){
  const rows=all(storage),row=rows[pageId];if(!row)throw new Error('Belum ada pilihan untuk halaman ini.');
  row.reason=String(reason||'').trim().slice(0,120);row.comment=String(comment||'').trim().slice(0,2000);row.updatedAt=at;
  storage.setItem(KEY,JSON.stringify(rows));return row;
 }
 function submit(storage,pageId,title,value,reason,comment,at=new Date().toISOString()){
  if(!pageId||!['yes','no'].includes(value))throw new Error('Halaman atau pilihan tidak valid.');
  const note=String(comment||'').trim();if(!note)throw new Error('Catatan wajib diisi sebelum menyimpan.');
  const rows=all(storage),old=rows[pageId];if(old)throw new Error('Masukan untuk halaman ini sudah tersimpan.');
  rows[pageId]={pageId,title:String(title||pageId),vote:value,reason:value==='no'?String(reason||'').trim().slice(0,120):'',comment:note.slice(0,2000),createdAt:at,updatedAt:at};
  storage.setItem(KEY,JSON.stringify(rows));return rows[pageId];
 }
 function summary(storage){const rows=Object.values(all(storage)).filter(row=>row&&['yes','no'].includes(row.vote));const yes=rows.filter(row=>row.vote==='yes').length,no=rows.length-yes;
  return {totals:{yes,no,total:rows.length,helpfulPercent:rows.length?Math.round(yes/rows.length*100):0},rows};}
 return {KEY,get,vote,addDetail,submit,summary};
});
