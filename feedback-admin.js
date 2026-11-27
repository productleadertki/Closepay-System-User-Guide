(function(root,factory){
 'use strict';const api=factory(typeof module==='object'&&module.exports?require('./feedback-model.js'):root.FeedbackModel);
 if(typeof module==='object'&&module.exports)module.exports=api;root.FeedbackAdmin=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(M){
 'use strict';
 const format=raw=>{const date=new Date(raw);return Number.isNaN(date.valueOf())?'—':new Intl.DateTimeFormat('id-ID',{day:'numeric',month:'short',year:'numeric',hour:'2-digit',minute:'2-digit'}).format(date);};
 function render(container,{storage=globalThis.localStorage,document=globalThis.document}={}){
  const el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const {totals,rows}=M.summary(storage);const box=el('section','feedback-admin'),title=el('h2','','Respons panduan'),note=el('p','feedback-admin-note','Hanya respons dari browser ini. Data tidak terkumpul dari pengunjung lain.');box.append(title,note);
  const stats=el('div','feedback-stats');for(const [label,value] of [['Total respons',totals.total],['Membantu',totals.yes],['Tidak membantu',totals.no],['Tingkat membantu',totals.helpfulPercent+'%']]){const cell=el('div','feedback-stat');cell.append(el('span','',label),el('strong','',String(value)));stats.append(cell);}box.append(stats);
  const chart=el('div','feedback-chart');chart.append(el('h3','','Komposisi respons'));
  for(const [kind,label,value] of [['yes','Ya',totals.yes],['no','Tidak',totals.no]]){const row=el('div','feedback-chart-row'),track=el('div','feedback-chart-track'),bar=el('div','feedback-bar-'+kind);const percent=totals.total?Math.round(value/totals.total*100):0;bar.setAttribute('style','width:'+percent+'%');bar.setAttribute('role','img');bar.setAttribute('aria-label',label+': '+value+' dari '+totals.total+' ('+percent+'%)');track.append(bar);row.append(el('span','',label),track,el('strong','',value+' · '+percent+'%'));chart.append(row);}box.append(chart);
  const tableWrap=el('div','feedback-table-wrap'),table=el('table','feedback-table'),thead=el('thead'),header=el('tr');for(const label of ['Halaman','Pilihan','Alasan','Komentar','Diperbarui'])header.append(el('th','',label));thead.append(header);table.append(thead);const tbody=el('tbody');for(const record of rows.sort((a,b)=>String(b.updatedAt).localeCompare(String(a.updatedAt)))){const row=el('tr');for(const text of [record.title||record.pageId,record.vote==='yes'?'Membantu':'Tidak membantu',record.reason||'—',record.comment||'—',format(record.updatedAt)])row.append(el('td','',text));tbody.append(row);}if(!rows.length){const row=el('tr'),cell=el('td','feedback-empty','Belum ada masukan. Respons akan muncul di sini setelah dikirim dari browser yang sama.');cell.setAttribute('colspan','5');row.append(cell);tbody.append(row);}table.append(tbody);tableWrap.append(table);box.append(tableWrap);container.replaceChildren(box);return box;
 }
 return {render};
});
