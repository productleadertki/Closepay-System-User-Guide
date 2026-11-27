const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
class Element{
 constructor(tag){this.tagName=tag;this.children=[];this.listeners={};this.attributes={};this.className='';this.textContent='';this.value='';this.dataset={};}
 append(...nodes){this.children.push(...nodes);}
 replaceChildren(...nodes){this.children=nodes;}
 setAttribute(k,v){this.attributes[k]=String(v);}
 addEventListener(k,fn){this.listeners[k]=fn;}
 fire(k){this.listeners[k]?.({preventDefault(){}});}
 find(cls){if(this.className.split(' ').includes(cls))return this;for(const c of this.children){const hit=c.find?.(cls);if(hit)return hit;}return null;}
 findAll(tag){return [...(this.tagName===tag?[this]:[]),...this.children.flatMap(c=>c.findAll?.(tag)||[])];}
 get text(){return this.textContent+this.children.map(c=>c.text||'').join('');}
}
const document={createElement:tag=>new Element(tag)};
const dir=__dirname;
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,String(v)),removeItem:k=>data.delete(k)};}
test('one vote per page can be changed without inflating totals',()=>{
 const M=require('./feedback-model.js'),s=storage();
 M.vote(s,'panduan/a','Panduan A','yes','2026-11-26T00:00:00.000Z');
 M.vote(s,'panduan/a','Panduan A','no','2026-11-27T00:00:00.000Z');
 assert.deepEqual(M.summary(s).totals,{yes:0,no:1,total:1,helpfulPercent:0});
 assert.equal(M.get(s,'panduan/a').updatedAt,'2026-11-27T00:00:00.000Z');
});
test('reason and comment remain scoped to their page and can be edited',()=>{
 const M=require('./feedback-model.js'),s=storage();
 M.vote(s,'a','Halaman A','no');M.vote(s,'b','Halaman B','yes');
 M.addDetail(s,'a','Tidak jelas','Perlu contoh');
 assert.equal(M.get(s,'a').reason,'Tidak jelas');
 assert.equal(M.get(s,'a').comment,'Perlu contoh');
 assert.equal(M.get(s,'b').comment,'');
 M.addDetail(s,'a','','');assert.equal(M.get(s,'a').comment,'');
});
test('invalid or unavailable storage never manufactures positive votes',()=>{
 const M=require('./feedback-model.js'),s=storage();s.setItem(M.KEY,'not json');
 assert.equal(M.summary(s).totals.total,0);
 assert.throws(()=>M.vote(s,'a','A','maybe'),/tidak valid/);
 assert.throws(()=>M.addDetail(s,'a','x','y'),/Belum/);
});
test('reader UI persists a negative note then restores the completed state on rerender',()=>{
 const M=require('./feedback-model.js'),UI=require('./feedback-ui.js'),s=storage(),container=new Element('div');
 UI.mount(container,{pageId:'topic/section/part',title:'Panduan A',storage:s,document});
 assert.match(container.text,/Apakah panduan ini membantu/);
 container.find('feedback-no').fire('click');
 assert.equal(M.get(s,'topic/section/part'),null);
 container.find('feedback-reason').value='Kurang jelas';
 container.find('feedback-comment').value='Tambahkan langkah';
 container.find('feedback-form').fire('submit');
 assert.equal(M.get(s,'topic/section/part').comment,'Tambahkan langkah');
 UI.mount(container,{pageId:'topic/section/part',title:'Panduan A',storage:s,document});
 assert.equal(container.find('feedback-no').attributes['aria-pressed'],'true');
 assert.equal(container.find('feedback-edit'),null);
 assert.equal(container.find('feedback-form').hidden,true);
 assert.equal(M.get(s,'topic/section/part').vote,'no');
});
test('submitting a reaction stores its comment and optional reason together',()=>{
 const M=require('./feedback-model.js'),s=storage();
 M.submit(s,'a','A','yes','','Bagus','2026-11-26T00:00:00.000Z');
 assert.deepEqual({vote:M.get(s,'a').vote,comment:M.get(s,'a').comment,reason:M.get(s,'a').reason},{vote:'yes',comment:'Bagus',reason:''});
 assert.throws(()=>M.submit(s,'a','A','no','Kurang jelas','  '),/Catatan/);
 assert.equal(M.get(s,'a').vote,'yes');
});

test('saved reaction cannot be submitted again for the same page',()=>{
 const M=require('./feedback-model.js'),s=storage();
 M.submit(s,'a','A','yes','','Bagus');
 assert.throws(()=>M.submit(s,'a','A','no','','Kurang jelas'),/sudah tersimpan/);
 assert.equal(M.get(s,'a').vote,'yes');
 assert.equal(M.summary(s).totals.total,1);
});

test('helpful selection opens a required comment form and persists only on save',()=>{
 const UI=require('./feedback-ui.js'),M=require('./feedback-model.js'),s=storage(),container=new Element('div');
 UI.mount(container,{pageId:'like',title:'Suka',storage:s,document});
 container.find('feedback-yes').fire('click');
 assert.equal(container.find('feedback-form').hidden,false);
 assert.equal(container.find('feedback-reason').hidden,true);
 assert.match(container.text,/Komentar/);
 assert.equal(M.summary(s).totals.total,0);
 container.find('feedback-form').fire('submit');
 assert.equal(M.summary(s).totals.total,0);
 container.find('feedback-comment').value='Membantu memahami langkahnya';
 container.find('feedback-form').fire('submit');
 assert.equal(M.get(s,'like').comment,'Membantu memahami langkahnya');
 assert.equal(container.find('feedback-form').hidden,true);
});

test('saved feedback shows confirmation without any change-choice control',()=>{
 const UI=require('./feedback-ui.js'),M=require('./feedback-model.js'),s=storage(),container=new Element('div');
 UI.mount(container,{pageId:'once',title:'Panduan',storage:s,document});
 container.find('feedback-yes').fire('click');container.find('feedback-comment').value='Sudah jelas';container.find('feedback-form').fire('submit');
 assert.equal(M.get(s,'once').vote,'yes');
 assert.equal(container.find('feedback-edit'),null);
 UI.mount(container,{pageId:'once',title:'Panduan',storage:s,document});
 assert.equal(container.find('feedback-edit'),null);
 assert.equal(container.find('feedback-choices').hidden,true);
 assert.equal(container.find('feedback-form').hidden,true);
});

test('a helpful vote closes the form and stays compact after reload',()=>{
 const UI=require('./feedback-ui.js'),M=require('./feedback-model.js'),s=storage(),container=new Element('div');
 UI.mount(container,{pageId:'a',title:'A',storage:s,document});
 container.find('feedback-yes').fire('click');
 assert.equal(M.summary(s).totals.yes,0);
 container.find('feedback-comment').value='Panduan membantu';container.find('feedback-form').fire('submit');
 assert.equal(M.summary(s).totals.yes,1);
 assert.equal(container.find('feedback-form').hidden,true);
 assert.equal(container.find('feedback-choices').hidden,true);
 assert.match(container.text,/Terima kasih/);
 UI.mount(container,{pageId:'a',title:'A',storage:s,document});
 assert.equal(container.find('feedback-choices').hidden,true);
 assert.equal(container.find('feedback-edit'),null);
});

test('unhelpful selection accepts an optional reason but requires a note before saving',()=>{
 const UI=require('./feedback-ui.js'),M=require('./feedback-model.js'),s=storage(),container=new Element('div');
 UI.mount(container,{pageId:'dislike',title:'Tidak suka',storage:s,document});
 container.find('feedback-no').fire('click');
 assert.equal(container.find('feedback-reason').hidden,false);
 assert.match(container.text,/Catatan/);
 assert.equal(M.summary(s).totals.total,0);
 container.find('feedback-form').fire('submit');
 assert.equal(M.summary(s).totals.total,0);
 container.find('feedback-comment').value='Langkah kedua tidak tersedia';
 container.find('feedback-form').fire('submit');
 assert.deepEqual({vote:M.get(s,'dislike').vote,reason:M.get(s,'dislike').reason,comment:M.get(s,'dislike').comment},{vote:'no',reason:'',comment:'Langkah kedua tidak tersedia'});
 assert.equal(container.find('feedback-form').hidden,true);
});

test('a negative vote closes after saving with no change option',()=>{
 const UI=require('./feedback-ui.js'),M=require('./feedback-model.js'),s=storage(),container=new Element('div');
 UI.mount(container,{pageId:'b',title:'B',storage:s,document});container.find('feedback-no').fire('click');
 assert.equal(container.find('feedback-form').hidden,false);
 container.find('feedback-reason').value='Kurang jelas';container.find('feedback-comment').value='Butuh contoh';container.find('feedback-form').fire('submit');
 assert.equal(container.find('feedback-form').hidden,true);
 assert.equal(container.find('feedback-choices').hidden,true);
 assert.equal(M.get(s,'b').reason,'Kurang jelas');
 assert.equal(container.find('feedback-edit'),null);
 assert.deepEqual(M.summary(s).totals,{yes:0,no:1,total:1,helpfulPercent:0});
});

test('admin shows a report table and zero counts before the first vote',()=>{
 const A=require('./feedback-admin.js'),s=storage(),container=new Element('div');
 A.render(container,{storage:s,document});
 assert.ok(container.find('feedback-table'));
 assert.match(container.text,/Belum ada masukan/);
 assert.match(container.text,/Total respons0/);
 assert.equal(container.findAll('tr').length,2);
});

test('report is directly accessible from the admin toolbar',()=>{
 const html=fs.readFileSync('./admin.html','utf8'),js=fs.readFileSync('./admin.js','utf8');
 assert.match(html,/id="feedback-report"/);
 assert.match(js,/getElementById\('feedback-report'\)\.addEventListener\('click',\(\)=>select\(\{kind:'feedback'\}\)\)/);
});

test('admin renders truthful empty state and data-backed chart/table',()=>{
 const M=require('./feedback-model.js'),A=require('./feedback-admin.js'),s=storage(),container=new Element('div');
 A.render(container,{storage:s,document});
 assert.match(container.text,/Belum ada masukan/);
 assert.equal(container.findAll('tr').length,2);
 M.vote(s,'a','Halaman A','yes','2026-11-26T00:00:00.000Z');
 M.vote(s,'b','Halaman B','no','2026-11-27T00:00:00.000Z');
 M.addDetail(s,'b','Kurang jelas','Tolong jelaskan','2026-11-27T01:00:00.000Z');
 A.render(container,{storage:s,document});
 assert.match(container.text,/50%/);
 assert.match(container.text,/Tolong jelaskan/);
 assert.match(container.text,/27 Nov 2026/);
 assert.equal(container.findAll('tr').length,3);
 assert.equal(container.find('feedback-bar-yes').attributes['aria-label'],'Ya: 1 dari 2 (50%)');
 assert.equal(container.find('feedback-bar-no').attributes['aria-label'],'Tidak: 1 dari 2 (50%)');
});
