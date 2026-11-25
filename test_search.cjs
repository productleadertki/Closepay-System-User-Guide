const test=require('node:test');
const assert=require('node:assert/strict');
const {searchDocs,normalize,expandQuery}=require('./search.js');
const docs=[
  {title:'Isi data calon peserta',description:'Pendaftaran calon peserta',slug:'ppdb-data',category:'PPDB',type:'Panduan'},
  {title:'Atur jalur seleksi',description:'Seleksi peserta didik baru',slug:'ppdb-jalur',category:'PPDB',type:'Panduan'},
  {title:'Periksa rincian tagihan',description:'Nomor pelanggan dan tagihan',slug:'ppob-tagihan',category:'PPOB',type:'Panduan'},
  {title:'Pantau status transaksi',description:'Cek hasil pembayaran',slug:'ppob-status',category:'PPOB',type:'Panduan'}
];
test('normalizes case, accents and punctuation',()=>assert.equal(normalize('Pendaftáran—PPDB!'),'pendaftaran ppdb'));
test('search finds product-specific needs and aliases',()=>{
  assert.equal(searchDocs(docs,'siswa baru')[0].slug,'ppdb-data');
  assert.equal(searchDocs(docs,'tagihan')[0].slug,'ppob-tagihan');
});
test('exact title outranks loose description match',()=>{
  assert.equal(searchDocs(docs,'status transaksi')[0].slug,'ppob-status');
});
test('product filter and no results are honest',()=>{
  assert.deepEqual(searchDocs(docs,'','PPOB').map(d=>d.slug),['ppob-tagihan','ppob-status']);
  assert.deepEqual(searchDocs(docs,'seleksi','PPOB'),[]);
});
test('query expansion leaves unrelated terms intact',()=>assert.deepEqual(expandQuery('PPDB'),['ppdb']));
