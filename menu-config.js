(function(root,factory){const menus=factory();if(typeof module==='object'&&module.exports)module.exports=menus;root.HELP_MENUS=menus;})(typeof globalThis!=='undefined'?globalThis:this,function(){return [
  {category:'PPDB',image:'ppdb',icon:'🎓',intro:'Contoh pusat bantuan penerimaan peserta didik baru. Modul dan penjelasan dapat disesuaikan dengan proses sekolah Anda.',featured:[
    {slug:'ppdb-formulir',label:'Buat formulir pendaftaran',description:'Contoh panduan untuk menyiapkan formulir pendaftaran dan informasi yang perlu diisi calon peserta.'},
    {slug:'ppdb-data',label:'Isi data calon peserta',description:'Contoh panduan pengisian identitas dan data pendukung calon peserta.'},
    {slug:'ppdb-jalur',label:'Atur jalur seleksi',description:'Contoh informasi tentang pengaturan jalur atau kategori seleksi.'},
    {slug:'ppdb-verifikasi',label:'Verifikasi berkas pendaftaran',description:'Contoh alur pemeriksaan kelengkapan berkas yang masuk.'},
    {slug:'ppdb-pengumuman',label:'Publikasikan hasil seleksi',description:'Contoh informasi mengenai penayangan hasil dan pemberitahuan kepada peserta.'}]},
  {category:'PPOB',image:'ppob',icon:'🧾',intro:'Contoh pusat bantuan pembayaran tagihan dan layanan digital. Modul dan penjelasan dapat disesuaikan dengan produk Anda.',featured:[
    {slug:'ppob-layanan',label:'Pilih layanan pembayaran',description:'Contoh panduan memilih jenis layanan atau produk tagihan yang tersedia.'},
    {slug:'ppob-tagihan',label:'Periksa rincian tagihan',description:'Contoh informasi untuk memeriksa nomor pelanggan dan rincian tagihan sebelum melanjutkan.'},
    {slug:'ppob-transaksi',label:'Proses pembayaran',description:'Contoh alur penyelesaian pembayaran pada layanan yang dipilih.'},
    {slug:'ppob-status',label:'Pantau status transaksi',description:'Contoh panduan membaca status transaksi setelah pembayaran.'},
    {slug:'ppob-riwayat',label:'Lihat riwayat transaksi',description:'Contoh informasi untuk menemukan kembali transaksi sebelumnya.'}]},
  {category:'Tautan Pembayaran',image:'tautan-pembayaran',icon:'🔗',intro:'Contoh dokumentasi membuat, membagikan, dan memantau tautan pembayaran Closepay.',featured:[
    {slug:'tautan-pembayaran-buat',label:'Buat tautan pembayaran',description:'Siapkan nominal, deskripsi, masa berlaku, dan identitas pesanan.'},
    {slug:'tautan-pembayaran-bagikan',label:'Bagikan tautan ke pelanggan',description:'Periksa rincian sebelum mengirim tautan melalui kanal komunikasi Anda.'},
    {slug:'tautan-pembayaran-status',label:'Pantau status pembayaran',description:'Kenali contoh status menunggu, berhasil, kedaluwarsa, dan gagal.'}]},
  {category:'Langganan',image:'langganan',icon:'🔁',intro:'Contoh panduan penagihan berkala untuk paket, pelanggan, dan siklus tagihan.',featured:[
    {slug:'langganan-paket',label:'Rancang paket berulang',description:'Tentukan harga, interval, dan aturan perubahan paket.'},
    {slug:'langganan-pelanggan',label:'Daftarkan pelanggan',description:'Periksa persetujuan pelanggan dan tanggal mulai penagihan.'},
    {slug:'langganan-jeda',label:'Jeda atau akhiri langganan',description:'Contoh alur menghentikan penagihan dan memberi tahu pelanggan.'}]},
  {category:'Transfer Dana',image:'transfer-dana',icon:'↗️',intro:'Contoh dokumentasi menyiapkan penerima, transfer satuan atau massal, dan rekonsiliasi.',featured:[
    {slug:'transfer-dana-penerima',label:'Siapkan data penerima',description:'Periksa rekening tujuan dan identitas sebelum membuat instruksi.'},
    {slug:'transfer-dana-massal',label:'Susun transfer massal',description:'Contoh alur mengunggah daftar, meninjau baris, dan menyetujui batch.'},
    {slug:'transfer-dana-status',label:'Rekonsiliasi hasil transfer',description:'Cocokkan status per penerima dengan catatan transaksi.'}]},
  {category:'Integrasi',image:'integrasi',icon:'⚙️',intro:'Contoh panduan lingkungan uji, notifikasi transaksi, dan penanganan kegagalan.',featured:[
    {slug:'integrasi-uji',label:'Mulai di lingkungan uji',description:'Susun skenario uji tanpa memakai data transaksi nyata.'},
    {slug:'integrasi-notifikasi',label:'Rancang notifikasi status',description:'Validasi pesan masuk dan hindari memproses peristiwa yang sama dua kali.'},
    {slug:'integrasi-gagal',label:'Tangani kegagalan integrasi',description:'Catat ID transaksi dan bedakan galat sementara dari galat input.'}]},
  {category:'Keamanan Akun',image:'keamanan-akun',icon:'🛡️',intro:'Contoh praktik kontrol akses dan pemeriksaan aktivitas mencurigakan.',featured:[
    {slug:'keamanan-akun-akses',label:'Atur peran anggota tim',description:'Berikan hak akses sesuai tugas dan tinjau kembali secara berkala.'},
    {slug:'keamanan-akun-kredensial',label:'Lindungi kredensial integrasi',description:'Simpan rahasia di sisi server dan rotasi saat diperlukan.'},
    {slug:'keamanan-akun-tinjau',label:'Tinjau transaksi mencurigakan',description:'Susun antrean pemeriksaan dan dokumentasikan keputusan.'}]}
];});
