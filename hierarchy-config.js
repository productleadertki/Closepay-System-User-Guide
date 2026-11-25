(function(root,factory){const data=factory();if(typeof module==='object'&&module.exports)module.exports=data;root.HELP_HIERARCHY=data;})(typeof globalThis!=='undefined'?globalThis:this,function(){return {
  products:{
    'ppdb':[
      {id:'pendaftaran',label:'Pendaftaran',topics:['ppdb-formulir','ppdb-data']},
      {id:'seleksi',label:'Seleksi dan verifikasi',topics:['ppdb-jalur','ppdb-verifikasi']},
      {id:'hasil',label:'Hasil penerimaan',topics:['ppdb-pengumuman']}],
    'ppob':[
      {id:'katalog',label:'Layanan dan tagihan',topics:['ppob-layanan','ppob-tagihan']},
      {id:'pembayaran',label:'Pembayaran dan status',topics:['ppob-transaksi','ppob-status']},
      {id:'riwayat',label:'Riwayat',topics:['ppob-riwayat']}]
  },
  sections:{
    ppdb:[
      {id:'persiapan',label:'Persiapan',parts:[{id:'persyaratan',label:'Persyaratan'},{id:'jadwal',label:'Jadwal'}]},
      {id:'proses',label:'Proses PPDB',parts:[{id:'langkah',label:'Langkah-langkah'},{id:'verifikasi',label:'Verifikasi'}]}],
    ppob:[
      {id:'sebelum-bayar',label:'Sebelum pembayaran',parts:[{id:'data',label:'Data pelanggan'},{id:'tagihan',label:'Rincian tagihan'}]},
      {id:'setelah-bayar',label:'Sesudah pembayaran',parts:[{id:'status',label:'Status transaksi'},{id:'bukti',label:'Bukti pembayaran'}]}]
  }
};});
