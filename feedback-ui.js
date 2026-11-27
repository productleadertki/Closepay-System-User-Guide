(function(root,factory){
 'use strict';const api=factory(typeof module==='object'&&module.exports?require('./feedback-model.js'):root.FeedbackModel);
 if(typeof module==='object'&&module.exports)module.exports=api;root.FeedbackUI=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(M){
 'use strict';
 function mount(container,{pageId,title,storage=globalThis.localStorage,document=globalThis.document}={}){
  if(!container||!pageId)throw new Error('Wadah dan ID halaman diperlukan.');
  const el=(tag,cls,text)=>{const node=document.createElement(tag);node.className=cls;if(text!==undefined)node.textContent=text;return node;};
  const box=el('section','feedback-widget'),heading=el('h2','feedback-title','Apakah panduan ini membantu?'),hint=el('p','feedback-hint','Masukan tersimpan hanya di browser ini.');
  const choices=el('div','feedback-choices'),message=el('p','feedback-message');message.setAttribute('role','status');message.setAttribute('aria-live','polite');
  const form=el('form','feedback-form'),reasonLabel=el('label','feedback-label','Alasan (opsional)'),reason=el('select','feedback-reason');
  for(const [value,label] of [['','Pilih alasan'],['Kurang jelas','Kurang jelas'],['Informasi belum lengkap','Informasi belum lengkap'],['Sulit diikuti','Sulit diikuti'],['Lainnya','Lainnya']]){const opt=el('option','',label);opt.value=value;reason.append(opt);}
  const commentLabel=el('label','feedback-label'),commentTitle=el('span','','Komentar'),comment=el('textarea','feedback-comment');comment.maxLength=2000;comment.rows=3;comment.required=true;comment.placeholder='Tulis komentar Anda di sini.';
  reasonLabel.append(reason);commentLabel.append(commentTitle,comment);
  const actions=el('div','feedback-actions'),submit=el('button','feedback-submit','Simpan masukan');submit.type='submit';actions.append(submit);form.append(reasonLabel,commentLabel,actions);
  let current=null,pending=null;try{current=M.get(storage,pageId);}catch{message.textContent='Penyimpanan browser tidak tersedia.';}
  reason.value=current?.reason||'';comment.value=current?.comment||'';
  const buttons={};
  const complete=()=>{box.className='feedback-widget feedback-complete';heading.textContent='Terima kasih atas masukan Anda';choices.hidden=true;form.hidden=true;message.textContent='Pilihan '+(current.vote==='yes'?'membantu':'tidak membantu')+' tersimpan di browser ini.';};
  for(const [value,label] of [['yes','Ya, membantu'],['no','Tidak membantu']]){
   const button=el('button','feedback-'+value,label);button.type='button';button.setAttribute('aria-pressed',String(current?.vote===value));
   button.addEventListener('click',()=>{if(current)return;pending=value;reason.value='';comment.value='';for(const [key,b] of Object.entries(buttons))b.setAttribute('aria-pressed',String(key===value));reasonLabel.hidden=value==='yes';reason.hidden=value==='yes';commentTitle.textContent=value==='yes'?'Komentar':'Catatan';comment.placeholder=value==='yes'?'Apa yang Anda sukai dari panduan ini?':'Apa yang perlu diperbaiki dari panduan ini?';choices.hidden=true;form.hidden=false;heading.textContent=value==='yes'?'Apa yang Anda sukai?':'Apa yang perlu diperbaiki?';message.textContent='Isi '+(value==='yes'?'komentar':'catatan')+' lalu tekan Simpan masukan.';});
   buttons[value]=button;choices.append(button);
  }
  form.hidden=true;choices.hidden=!!current;
  form.addEventListener('submit',event=>{event.preventDefault();if(current)return;if(!comment.value.trim()){message.textContent='Isi '+(pending==='yes'?'komentar':'catatan')+' sebelum menyimpan.';return;}try{current=M.submit(storage,pageId,title,pending,reason.value,comment.value);pending=null;complete();}catch{message.textContent='Masukan belum dapat disimpan di browser ini.';}});
  box.append(heading,hint,choices,form,message);container.replaceChildren(box);if(current)complete();return box;
 }
 return {mount};
});
