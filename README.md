# Demo Pusat Bantuan Berbasis Produk

Beranda menampilkan **pencarian**, **Recommended Reads** (maksimal enam pilihan), lalu **Our Products**. Produk dipilih dari kartu ikon di beranda, tanpa tab produk duplikat. Setelah memilih produk, halaman **modul → submodul 1 → submodul 2** dapat berisi penjelasan sesuai tingkatnya, sekaligus menampilkan daftar anak. Panduan memiliki halaman baca tersendiri. Dropdown **Jelajahi panduan** membuka struktur produk aktif tanpa bergantung pada sidebar. Pencarian di dalam produk **hanya berlaku untuk produk itu**.

Data bawaan memuat **PPDB** dan **PPOB** sebagai contoh lama, ditambah lima kategori panduan Closepay: **Tautan Pembayaran, Langganan, Transfer Dana, Integrasi, dan Keamanan Akun**. Tiap kategori baru berisi tiga panduan dengan isi Markdown orisinal dan ilustrasi konsep lokal. Ini naskah simulasi, bukan klaim fitur operasional atau dokumentasi API produksi; tidak ada tautan bantuan pihak lain.

## Menjalankan

Buka `index.html` langsung di browser. Tidak perlu instalasi, server, API key, atau koneksi internet.

## Admin konten (demo lokal)

Jalankan `start-admin.bat` di Windows, lalu buka `http://127.0.0.1:8765/admin.html` dan `http://127.0.0.1:8765/index.html` **dari alamat server yang sama**. Server hanya mendengarkan di komputer ini. Jangan membuka admin dan situs melalui dua alamat berbeda (`file:`, `localhost`, dan `127.0.0.1` memiliki penyimpanan browser yang berbeda). Untuk menghentikan server, tekan Ctrl+C pada jendela server.

Dari admin, buat/ubah/hapus **produk → modul → submodul 1 → submodul 2 → panduan**. Struktur konten berada di sidebar kiri. Tombol **Sembunyikan sidebar / Tampilkan sidebar** pada toolbar melipat dan membuka panel di desktop (area editor ikut melebar), sedangkan pada layar kecil panel dibuka sebagai overlay. Setiap modul dan submodul memiliki pilihan eksplisit **Hanya label** atau **Label + isi bantuan**. Pilihan kedua menyimpan penjelasan pada tingkat tersebut; mengubah entri berisi menjadi hanya label meminta konfirmasi sebelum menghapus isinya. Panduan menggunakan isi bantuan. Satu formulir menampung judul, teks, tautan, tabel, foto, dan video. Tulis langsung dalam **Markdown** (judul, tebal/miring, daftar, kutipan, kode, tautan, tabel) atau pindah ke editor **Visual**; keduanya tersinkron dan pratinjau disanitasi. Konten lama berformat HTML atau teks tetap dapat dibuka dan diedit. Foto PNG/JPEG/WebP/GIF maksimal 1 MB dapat dipilih sebelum menyimpan entri baru. Video menerima HTTPS YouTube atau tautan langsung MP4/WebM; URL lain ditolak. Pilih **Edit**, **Split · Edit + View**, atau **View saja** untuk mengubah tampilan tanpa menghapus draf; tombol **Simpan draf** tetap tersedia saat View saja. Atur maksimal enam **Recommended Reads**. Klik **Simpan draf** atau **Simpan perubahan**, lalu muat ulang halaman bantuan atau gunakan **Lihat di situs**. ID tautan tetap setelah dibuat; penghapusan turunan membersihkan tautan terkait. **Ekspor JSON** untuk cadangan, **Impor JSON** untuk memulihkan, dan **Pulihkan contoh** untuk menghapus perubahan lokal.

**Batasan:** Ini admin prototipe tanpa login, API, atau basis data. Data disimpan di `localStorage` browser pada alamat server yang sama, **bukan** tersimpan dalam berkas proyek dan tidak otomatis tersedia pada perangkat/pengguna lain. Ekspor cadangan sebelum menghapus data browser. Untuk admin produksi multi-pengguna, diperlukan backend, autentikasi, otorisasi, penyimpanan server, dan alur publikasi.

Editor Markdown menggunakan berkas lokal di `vendor/` (Marked, Turndown, dan plugin GFM); lisensi MIT masing-masing disertakan di sana. Aplikasi tidak memerlukan CDN saat dijalankan.

## Mengganti produk dan panduan lewat berkas (alternatif)

Data admin lama yang tersimpan di browser tetap dipertahankan; lima kategori contoh baru ditambahkan sekali tanpa menimpa tulisan lama. Setelah membuka admin, simpan sebuah perubahan agar versi katalog terbaru ikut tersimpan secara lokal. Untuk mengganti seluruh isi browser dengan contoh bawaan, ekspor cadangan lalu klik **Pulihkan contoh**. Perubahan manual pada berkas untuk produk lama yang pernah diedit mungkin tetap tertutup oleh versi `localStorage` sampai dipulihkan.

1. Di `menu-config.js`, ubah atau tambah objek produk (`category` = nama, `image` = slug unik, `intro` = ringkasan). Setiap entri `featured` memuat `slug` unik dan `label` submodul 1; `description` lama tetap dipakai untuk pencarian/kompatibilitas.
2. Di `hierarchy-config.js`, tambahkan `products[slug]` berisi modul dengan daftar `topics` yang menunjuk ke slug submodul 1. Setiap submodul harus muncul **sekali** dalam modul produk yang benar. Tambahkan `sections[slug]` untuk Submodul 2 dan bagian `parts` untuk panduan; struktur ini dapat berbeda antarproduk.
3. Tulis atau ubah konten Markdown contoh di `help-content.js` dengan kunci `slug` dan `slug/bagian/panduan`. Jalankan `node build_help_index.cjs` untuk memperbarui `help-index.js` setelah mengubah judul atau ringkasan topik di menu.
4. Ganti ilustrasi `assets/<slug>.svg` dengan gambar produk, atau sesuaikan `build_images.py` lalu jalankan `python build_images.py` untuk gambar konsep. Gambar di detail saat ini adalah ilustrasi, bukan tangkapan layar final.
5. Atur ID submodul pilihan di `home-config.js` melalui `recommended` (maksimal enam, semua slug harus ada di `help-index.js`). Kartu rekomendasi menampilkan judul panduan pertama di bawah submodul itu dan membukanya; untuk memilih panduan tertentu secara independen diperlukan pengembangan model rekomendasi lebih lanjut.
6. Semua produk tampil sebagai kartu di beranda; tidak ada tab produk tambahan di luar kartu tersebut.

Pencarian global pada beranda menelusuri judul/keterangan submodul dan isi panduan yang terindeks; hasil submodul membuka panduan pertamanya, atau halaman judul bila belum ada panduan. Pencarian lokal dan tautan terkait di ruang produk tidak bercampur dengan produk lain. Tombol **Tampilkan/Sembunyikan sidebar** di atas artikel membuka atau menutup navigasi; saat ditutup, area bacaan memakai lebar halaman yang tersedia. Pada layar kecil, sidebar awalnya tersembunyi agar artikel langsung terbaca. `hierarchy-model.js` memvalidasi tingkat berdasarkan produk, dan `hierarchy-ui.js` menampilkan panel informasi.

## Publikasi GitHub Pages

Situs statis dapat dipublikasikan dari akar branch `main` melalui GitHub Pages. Pada repo `productleadertki/Closepay-System-User-Guide`, alamat publiknya adalah `https://productleadertki.github.io/Closepay-System-User-Guide/` setelah Pages aktif. Semua referensi aset memakai jalur relatif agar bekerja di subpath repositori.

**Penting:** `admin.html` di situs publik hanyalah demo lokal. Siapa pun dapat membuka halamannya, tetapi perubahan hanya memengaruhi `localStorage` browser masing-masing, **tidak** mengubah konten bersama di GitHub Pages dan tidak tampil bagi pengunjung lain. Untuk memperbarui situs bersama, ubah berkas sumber lalu commit/push; admin produksi memerlukan backend, autentikasi, dan alur publikasi tersendiri.

## Pengujian

```bash
node --test test_*.cjs
```
