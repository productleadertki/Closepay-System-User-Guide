(function(root){
'use strict';
// Naskah orisinal untuk demonstrasi. Bukan dokumentasi fitur/API produksi.
const guides=[
 ['tautan-pembayaran-buat','Menyiapkan tautan pembayaran untuk satu pesanan.',[
  'Catat ID pesanan internal, nominal, mata uang, dan deskripsi yang mudah dikenali pelanggan.',
  'Tentukan masa berlaku dan halaman konfirmasi yang sesuai dengan alur bisnis Anda.',
  'Periksa ulang nominal dan identitas pesanan sebelum tautan dibagikan.'
 ],'Pastikan satu pesanan tidak dibuat dua kali ketika operator mengulang langkah.'],
 ['tautan-pembayaran-bagikan','Mengirim tautan yang telah diperiksa kepada pelanggan.',[
  'Cocokkan penerima dengan data pesanan dan pastikan jumlah tagihan benar.',
  'Bagikan tautan melalui kanal komunikasi resmi yang dipakai bisnis Anda.',
  'Jangan meminta pelanggan mengirim kata sandi atau kode verifikasi melalui pesan.'
 ],'Gunakan pesan yang menyebut nomor pesanan agar pelanggan dapat mengenali tagihan.'],
 ['tautan-pembayaran-status','Membaca perubahan status setelah tautan dikirim.',[
  'Temukan pesanan berdasarkan ID internal yang sama dengan saat pembuatan tautan.',
  'Bedakan status menunggu, berhasil, gagal, dan kedaluwarsa sebelum melakukan tindak lanjut.',
  'Jika pembayaran belum final, periksa kembali status sebelum mengirim barang atau layanan.'
 ],'Jangan menyimpulkan pembayaran berhasil hanya karena pelanggan sudah membuka tautan.'],
 ['langganan-paket','Menyusun contoh paket untuk penagihan berkala.',[
  'Tetapkan nama paket, harga, interval penagihan, dan tanggal mulai.',
  'Jelaskan aturan perubahan harga, jeda, dan pembatalan sebelum pelanggan mendaftar.',
  'Tinjau contoh jadwal tagihan untuk memastikan interval sudah sesuai.'
 ],'Paket ini adalah contoh; sesuaikan kebijakan tagihan dengan produk Anda.'],
 ['langganan-pelanggan','Menghubungkan pelanggan dengan paket yang dipilih.',[
  'Verifikasi identitas pelanggan dan paket yang disetujui.',
  'Simpan tanggal mulai serta catatan persetujuan pelanggan.',
  'Berikan ringkasan nilai dan jadwal tagihan sebelum siklus pertama.'
 ],'Jangan mengaktifkan penagihan berkala tanpa persetujuan yang jelas.'],
 ['langganan-jeda','Menyusun alur jeda dan pembatalan langganan.',[
  'Cari langganan pelanggan dan periksa status tagihan yang sedang berjalan.',
  'Tentukan apakah perubahan berlaku segera atau pada akhir periode.',
  'Catat keputusan dan kirim konfirmasi kepada pelanggan.'
 ],'Periksa tagihan tertunda secara terpisah agar pembatalan tidak dianggap menghapus kewajiban sebelumnya.'],
 ['transfer-dana-penerima','Mempersiapkan data tujuan transfer.',[
  'Kumpulkan nama penerima, identitas rekening, dan referensi internal yang diperlukan.',
  'Minta pemeriksa kedua mencocokkan identitas penerima dengan sumber yang tepercaya.',
  'Jangan mencantumkan data rekening lengkap dalam catatan yang dapat dilihat publik.'
 ],'Koreksi data sebelum membuat instruksi transfer; jangan mengandalkan pembatalan sesudahnya.'],
 ['transfer-dana-massal','Menyusun dan meninjau satu batch transfer.',[
  'Siapkan daftar penerima dalam format internal dengan satu baris per tujuan.',
  'Periksa duplikasi, total nominal, dan baris yang gagal validasi.',
  'Minta persetujuan petugas berwenang sebelum batch diproses.'
 ],'Simpan ID batch dan referensi per baris untuk rekonsiliasi hasil.'],
 ['transfer-dana-status','Mencocokkan hasil transfer dengan daftar awal.',[
  'Ambil hasil pemrosesan dan cocokkan setiap baris dengan referensi awal.',
  'Pisahkan transaksi berhasil, menunggu, dan gagal; jangan menyamakan status batch dengan status seluruh penerima.',
  'Tindak lanjuti baris gagal secara terpisah setelah penyebabnya diperiksa.'
 ],'Jangan mengulangi seluruh batch jika hanya sebagian baris yang gagal.'],
 ['integrasi-uji','Merencanakan pengujian sebelum menghubungkan sistem.',[
  'Siapkan lingkungan uji dan gunakan identitas pelanggan serta transaksi fiktif.',
  'Uji skenario berhasil, gagal, kedaluwarsa, dan pengiriman notifikasi ulang.',
  'Dokumentasikan hasil dan kriteria penerimaan sebelum berpindah ke produksi.'
 ],'Tidak ada URL, kunci API, atau endpoint produksi yang disediakan oleh contoh ini.'],
 ['integrasi-notifikasi','Merancang penerimaan pembaruan status yang aman.',[
  'Tentukan identitas peristiwa dan cara memverifikasi sumber pesan pada implementasi nyata.',
  'Simpan identitas peristiwa yang telah diproses agar pengiriman ulang tidak menggandakan transaksi.',
  'Perbarui status pesanan hanya setelah data dan urutan peristiwa dinyatakan valid.'
 ],'Jangan menaruh kredensial rahasia di aplikasi browser.'],
 ['integrasi-gagal','Mencatat dan menindaklanjuti kegagalan integrasi.',[
  'Catat waktu, referensi transaksi, jenis galat, dan langkah yang sedang dijalankan.',
  'Pisahkan galat input yang harus diperbaiki dari gangguan sementara yang layak dicoba ulang.',
  'Batasi pengulangan otomatis dan tinjau hasil akhir sebelum membuat transaksi baru.'
 ],'Hindari menampilkan token, data kartu, atau informasi pribadi dalam log.'],
 ['keamanan-akun-akses','Membagi hak akses sesuai peran tim.',[
  'Daftarkan tugas yang memerlukan akses membaca, mengubah, atau menyetujui transaksi.',
  'Berikan hak paling kecil yang masih memungkinkan pekerjaan dilakukan.',
  'Tinjau anggota yang keluar dari tim dan cabut aksesnya tanpa menunda.'
 ],'Akses persetujuan transfer sebaiknya dipisahkan dari akses pembuatan instruksi.'],
 ['keamanan-akun-kredensial','Melindungi rahasia yang dipakai integrasi.',[
  'Simpan kredensial pada penyimpanan rahasia di sisi server, bukan di kode frontend.',
  'Batasi siapa yang dapat melihat atau mengganti kredensial.',
  'Jika rahasia terpapar, rotasi dan audit penggunaan sebelum melanjutkan.'
 ],'Jangan menempelkan kunci asli ke artikel bantuan atau tangkapan layar.'],
 ['keamanan-akun-tinjau','Membuat alur pemeriksaan aktivitas tidak biasa.',[
  'Tandai transaksi dengan pola yang memerlukan pemeriksaan manual menurut kebijakan internal.',
  'Kumpulkan bukti secukupnya dan batasi akses ke data sensitif.',
  'Catat keputusan pemeriksa dan alasan tindak lanjut untuk audit.'
 ],'Contoh ini bukan sistem deteksi penipuan otomatis; tetapkan aturan sesuai risiko bisnis Anda.']
];
const content={};
for(const [slug,purpose,steps,check] of guides){
 const markdown=`## Tujuan\n${purpose}\n\n## Langkah contoh\n${steps.map((step,i)=>`${i+1}. ${step}`).join('\n')}\n\n## Catatan\n${check}\n\n> Ini adalah data contoh Closepay. Sesuaikan nama menu, kebijakan, dan alur dengan fitur yang benar-benar tersedia sebelum dipublikasikan.`;
 const article={body:`${purpose} ${steps.join(' ')} ${check}`,markdown};
 content[slug]=article;
 content[`${slug}/panduan/langkah`]=article;
}
root.HELP_SAMPLE_CONTENT=content;
if(!root.HELP_ADMIN_ACTIVE)root.HELP_CONTENT=content;
})(typeof globalThis!=='undefined'?globalThis:this);
