(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;root.HELP_HIERARCHY=data;})(typeof globalThis!=='undefined'?globalThis:this,function(){const data={
  products:{
    'ppdb':[
      {id:'pendaftaran',label:'Pendaftaran',topics:['ppdb-formulir','ppdb-data']},
      {id:'seleksi',label:'Seleksi dan verifikasi',topics:['ppdb-jalur','ppdb-verifikasi']},
      {id:'hasil',label:'Hasil penerimaan',topics:['ppdb-pengumuman']}],
    'ppob':[
      {id:'katalog',label:'Layanan dan tagihan',topics:['ppob-layanan','ppob-tagihan']},
      {id:'pembayaran',label:'Pembayaran dan status',topics:['ppob-transaksi','ppob-status']},
      {id:'riwayat',label:'Riwayat',topics:['ppob-riwayat']}],
    'tautan-pembayaran':[{id:'mulai',label:'Siapkan tautan',topics:['tautan-pembayaran-buat','tautan-pembayaran-bagikan']},{id:'pantau',label:'Pantau pembayaran',topics:['tautan-pembayaran-status']}],
    'langganan':[{id:'paket',label:'Paket dan pelanggan',topics:['langganan-paket','langganan-pelanggan']},{id:'siklus',label:'Siklus tagihan',topics:['langganan-jeda']}],
    'transfer-dana':[{id:'persiapan',label:'Persiapan transfer',topics:['transfer-dana-penerima','transfer-dana-massal']},{id:'hasil',label:'Hasil transfer',topics:['transfer-dana-status']}],
    'integrasi':[{id:'uji',label:'Pengujian',topics:['integrasi-uji']},{id:'operasional',label:'Notifikasi dan kegagalan',topics:['integrasi-notifikasi','integrasi-gagal']}],
    'keamanan-akun':[{id:'akses',label:'Akses akun',topics:['keamanan-akun-akses','keamanan-akun-kredensial']},{id:'pemeriksaan',label:'Pemeriksaan transaksi',topics:['keamanan-akun-tinjau']}]
  },
  sections:{
    ppdb:[
      {id:'persiapan',label:'Persiapan',parts:[{id:'persyaratan',label:'Persyaratan'},{id:'jadwal',label:'Jadwal'}]},
      {id:'proses',label:'Proses PPDB',parts:[{id:'langkah',label:'Langkah-langkah'},{id:'verifikasi',label:'Verifikasi'}]}],
    ppob:[
      {id:'sebelum-bayar',label:'Sebelum pembayaran',parts:[{id:'data',label:'Data pelanggan'},{id:'tagihan',label:'Rincian tagihan'}]},
      {id:'setelah-bayar',label:'Sesudah pembayaran',parts:[{id:'status',label:'Status transaksi'},{id:'bukti',label:'Bukti pembayaran'}]}]
  }
};
data.topicSections={};
for(const [product,modules] of Object.entries(data.products)){
 if(product==='ppdb'||product==='ppob')continue;
 const section=()=>[{id:'panduan',label:'Panduan',parts:[{id:'langkah',label:'Langkah-langkah'}]}];
 data.sections[product]=section();
 for(const module of modules)for(const topic of module.topics)data.topicSections[topic]=section();
}
return data;});
