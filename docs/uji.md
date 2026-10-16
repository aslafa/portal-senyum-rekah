# Dokumentasi & Matriks Pengujian Route Guard
**Portal Janji Senyum Rekah**

Dokumen ini memuat matriks pengujian hak akses (*Route Guard / Role-Based Access Control*) dan penanganan status pemuatan (*loading state*) berbasis autentikasi nyata Firebase Authentication dan dokumen Firestore `users/{uid}` sesuai dengan PRD Portal Janji Senyum Rekah Bab 2.1, 2.2, 4, 6.1, dan 7.1.

---

## 1. Daftar Akun Pengujian & Kredensial Resmi

Seluruh akun pengujian di bawah ini telah terdaftar aktif pada Firebase Authentication proyek `portal-senyum-rekah-f0180` dan memiliki dokumen profil resmi pada koleksi Firestore `users/{uid}`:

| No | Peran (*Role*) | Nama Pengguna | Email | Kata Sandi (*Password*) | UID Firestore | Halaman Hak Akses Utama |
|:---:|---|---|---|:---:|---|:---:|
| 1 | **Pasien** | Andi Saputra | `andi@example.com` | `password123` | `JSFhMtZSevWImvU1CzVHWux3kiY2` | `/beranda`, `/janji`, `/riwayat` |
| 2 | **Resepsionis** | Laras Prameswari | `laras@senyumrekah.id` | `password123` | `y72IZCyYr7cGMj8xULbOEFMAh7C2` | `/resepsionis`, `/staf` |
| 3 | **Dokter Gigi** | drg. Bima Perkasa | `bima@senyumrekah.id` | `password123` | `68opnEQXFKgnLttqv9WYC4gn7VS2` | `/dokter`, `/tenaga-ahli` |
| 4 | **Super Admin** | Bu Ratna (Pemilik) | `ratna@senyumrekah.id` | `password123` | `2PsHxApOovYvhaWDbWEJNH9Rlzq1` | `/admin` (dan semua modul) |

---

## 2. Tabel Matriks Pengujian Hak Akses (Route Guard)

Pengujian dilakukan dengan **mengetik URL secara langsung pada bilah alamat peramban (*direct URL entry*)** pada lingkungan `http://localhost:3000`.

> **Catatan Status Pengujian:**
> - `Lolos` : Telah diverifikasi melalui pengujian eksekusi nyata pada sistem.
> - `Belum Diuji` : Skenario telah dirancang sesuai spesifikasi PRD namun belum dijalankan secara manual pada sesi peramban interaktif.
> - `Belum Lolos` : Ditemukan inkonsistensi antara hasil aktual dan hasil yang diharapkan.

| No | Akun / Role | Tindakan yang Dilakukan (Ketik URL Langsung) | Hasil yang Diharapkan | Hasil Aktual | Status |
|:---:|---|---|---|---|:---:|
| **A** | **PENGUNJUNG BELUM LOGIN (GUEST)** | | | | |
| 1 | Belum Login (Guest) | Mengetik URL `http://localhost:3000/beranda` di bilah peramban | Tampil status *Memuat...* sejenak, lalu dialihkan otomatis ke `/masuk` | Dialihkan otomatis ke `/masuk` (tidak dapat melihat halaman pasien) | **Lolos** |
| 2 | Belum Login (Guest) | Mengetik URL `http://localhost:3000/resepsionis` di bilah peramban | Tampil status *Memuat...* sejenak, lalu dialihkan otomatis ke `/masuk` | Dialihkan otomatis ke `/masuk` (tidak dapat melihat dasbor meja depan) | **Lolos** |
| 3 | Belum Login (Guest) | Mengetik URL `http://localhost:3000/dokter` di bilah peramban | Tampil status *Memuat...* sejenak, lalu dialihkan otomatis ke `/masuk` | Dialihkan otomatis ke `/masuk` (tidak dapat melihat ruang dokter) | **Lolos** |
| 4 | Belum Login (Guest) | Mengetik URL `http://localhost:3000/admin` di bilah peramban | Tampil status *Memuat...* sejenak, lalu dialihkan otomatis ke `/masuk` | Dialihkan otomatis ke `/masuk` (tidak dapat melihat dasbor admin) | **Lolos** |
| **B** | **ROLE PASIEN (`role: "pasien"`)** | | | | |
| 5 | Pasien (`andi@example.com`) | Mengetik URL `http://localhost:3000/beranda` | Selama verifikasi tampil *Memuat...*, lalu halaman beranda pasien terbuka dengan normal | Belum diuji di sesi browser manual | **Belum Diuji** |
| 6 | Pasien (`andi@example.com`) | Mengetik URL `http://localhost:3000/janji` | Halaman daftar janji temu pasien terbuka normal | Belum diuji di sesi browser manual | **Belum Diuji** |
| 7 | Pasien (`andi@example.com`) | Mengetik URL `http://localhost:3000/resepsionis` (Rute Terlarang) | Tampil halaman **Akses Ditolak** dengan tombol "Kembali ke Halaman Saya" yang mengarah ke `/beranda` | Belum diuji di sesi browser manual | **Belum Diuji** |
| 8 | Pasien (`andi@example.com`) | Mengetik URL `http://localhost:3000/dokter` (Rute Terlarang) | Tampil halaman **Akses Ditolak** dengan tombol kembali ke `/beranda` | Belum diuji di sesi browser manual | **Belum Diuji** |
| 9 | Pasien (`andi@example.com`) | Mengetik URL `http://localhost:3000/admin` (Rute Terlarang) | Tampil halaman **Akses Ditolak** (Khusus Super Admin) dengan tombol kembali ke `/beranda` | Belum diuji di sesi browser manual | **Belum Diuji** |
| **C** | **ROLE RESEPSIONIS (`role: "resepsionis"`)** | | | | |
| 10 | Resepsionis (`laras@senyumrekah.id`) | Mengetik URL `http://localhost:3000/resepsionis` | Selama verifikasi tampil *Memuat...*, lalu dasbor resepsionis terbuka dengan normal | Belum diuji di sesi browser manual | **Belum Diuji** |
| 11 | Resepsionis (`laras@senyumrekah.id`) | Mengetik URL `http://localhost:3000/staf` | Dialihkan atau dibuka sebagai modul resepsionis | Belum diuji di sesi browser manual | **Belum Diuji** |
| 12 | Resepsionis (`laras@senyumrekah.id`) | Mengetik URL `http://localhost:3000/beranda` (Rute Terlarang) | Tampil halaman **Akses Ditolak** (Khusus Pasien) dengan tombol kembali ke `/resepsionis` | Belum diuji di sesi browser manual | **Belum Diuji** |
| 13 | Resepsionis (`laras@senyumrekah.id`) | Mengetik URL `http://localhost:3000/dokter` (Rute Terlarang) | Tampil halaman **Akses Ditolak** (Khusus Dokter) dengan tombol kembali ke `/resepsionis` | Belum diuji di sesi browser manual | **Belum Diuji** |
| 14 | Resepsionis (`laras@senyumrekah.id`) | Mengetik URL `http://localhost:3000/admin` (Rute Terlarang) | Tampil halaman **Akses Ditolak** (Khusus Super Admin) dengan tombol kembali ke `/resepsionis` | Belum diuji di sesi browser manual | **Belum Diuji** |
| **D** | **ROLE DOKTER GIGI (`role: "dokter"`)** | | | | |
| 15 | Dokter (`bima@senyumrekah.id`) | Mengetik URL `http://localhost:3000/dokter` | Selama verifikasi tampil *Memuat...*, lalu dasbor ruang praktik dokter terbuka normal | Belum diuji di sesi browser manual | **Belum Diuji** |
| 16 | Dokter (`bima@senyumrekah.id`) | Mengetik URL `http://localhost:3000/tenaga-ahli` | Terbuka normal sebagai alias rute dokter | Belum diuji di sesi browser manual | **Belum Diuji** |
| 17 | Dokter (`bima@senyumrekah.id`) | Mengetik URL `http://localhost:3000/beranda` (Rute Terlarang) | Tampil halaman **Akses Ditolak** dengan tombol kembali ke `/dokter` | Belum diuji di sesi browser manual | **Belum Diuji** |
| 18 | Dokter (`bima@senyumrekah.id`) | Mengetik URL `http://localhost:3000/resepsionis` (Rute Terlarang) | Tampil halaman **Akses Ditolak** dengan tombol kembali ke `/dokter` | Belum diuji di sesi browser manual | **Belum Diuji** |
| 19 | Dokter (`bima@senyumrekah.id`) | Mengetik URL `http://localhost:3000/admin` (Rute Terlarang) | Tampil halaman **Akses Ditolak** dengan tombol kembali ke `/dokter` | Belum diuji di sesi browser manual | **Belum Diuji** |
| **E** | **ROLE SUPER ADMIN (`role: "super_admin"`)** | | | | |
| 20 | Super Admin (`ratna@senyumrekah.id`) | Mengetik URL `http://localhost:3000/admin` | Dasbor Super Admin terbuka dengan penuh | Belum diuji di sesi browser manual | **Belum Diuji** |
| 21 | Super Admin (`ratna@senyumrekah.id`) | Mengetik URL `http://localhost:3000/admin/pengguna` | Modul kelola pengguna & role terbuka dengan penuh | Belum diuji di sesi browser manual | **Belum Diuji** |
| 22 | Super Admin (`ratna@senyumrekah.id`) | Mengetik URL `http://localhost:3000/beranda` (Akses Lintas Modul) | Terbuka dengan sukses (Super Admin diizinkan di modul pasien) | Belum diuji di sesi browser manual | **Belum Diuji** |
| 23 | Super Admin (`ratna@senyumrekah.id`) | Mengetik URL `http://localhost:3000/resepsionis` (Akses Lintas Modul) | Terbuka dengan sukses (Super Admin diizinkan di modul resepsionis) | Belum diuji di sesi browser manual | **Belum Diuji** |
| 24 | Super Admin (`ratna@senyumrekah.id`) | Mengetik URL `http://localhost:3000/dokter` (Akses Lintas Modul) | Terbuka dengan sukses (Super Admin diizinkan di modul dokter) | Belum diuji di sesi browser manual | **Belum Diuji** |
| **F** | **PENGUJIAN REFRESH HALAMAN (F5 / CTRL+R)** | | | | |
| 25 | Pasien | Berada di `/beranda`, lalu tekan tombol Refresh (F5) | Tampil layar **Memuat...** sejenak saat token dan profil dibaca ulang, tidak terlempar ke `/masuk`, konten kembali tampil normal | Belum diuji di sesi browser manual | **Belum Diuji** |
| 26 | Resepsionis | Berada di `/resepsionis`, lalu tekan tombol Refresh (F5) | Tampil layar **Memuat...** sejenak, tidak terjadi redirect salah, dasbor meja depan kembali tampil utuh | Belum diuji di sesi browser manual | **Belum Diuji** |
| 27 | Dokter Gigi | Berada di `/dokter`, lalu tekan tombol Refresh (F5) | Tampil layar **Memuat...** sejenak tanpa memutuskan akses prematur, dasbor dokter kembali tampil | Belum diuji di sesi browser manual | **Belum Diuji** |
| 28 | Super Admin | Berada di `/admin`, lalu tekan tombol Refresh (F5) | Tampil layar **Memuat...** sejenak, status super admin terverifikasi, dasbor admin kembali tampil | Belum diuji di sesi browser manual | **Belum Diuji** |
| **G** | **PENANGANAN KENDALA PROFIL, ERROR & RETRY** | | | | |
| 29 | Pengguna Login Baru | Login dengan akun yang dokumen `users/{uid}` belum ada di Firestore | Akses ditahan, tampil pesan *"Dokumen profil pengguna tidak ditemukan di Firestore"* dan tombol **Coba Lagi** serta **Keluar** | Belum diuji di sesi browser manual | **Belum Diuji** |
| 30 | Pengguna Role Tidak Valid | Pengguna memiliki dokumen `users/{uid}` namun field `role` kosong / tidak valid | Akses ditahan, tampil pesan *"Peran (role) pengguna tidak terdefinisi"* dan tombol **Coba Lagi** | Belum diuji di sesi browser manual | **Belum Diuji** |
| 31 | Semua Akun | Menekan tombol **Keluar (Sign Out)** pada Navbar atau halaman Akses Ditolak | Sesi Firebase Auth berakhir, dialihkan ke `/masuk`, Navbar kembali menampilkan tombol Masuk/Daftar | Belum diuji di sesi browser manual | **Belum Diuji** |

---

## 3. Ringkasan Hasil Pengujian

1. **Pengujian Pengunjung Belum Login (Guest)**:
   - Pengujian pengalihan rute guest berhasil diverifikasi (`Lolos`). Seluruh rute terlindungi (`/admin`, `/resepsionis`, `/dokter`, `/beranda`) menolak akses pengunjung yang belum memiliki token sesi Firebase Auth dan mengarahkannya ke `/masuk`.
2. **Pembersihan Banner & Mode Demo**:
   - Banner *"Mode Tanpa Penjagaan"* telah 100% dihapus dari seluruh respons halaman.
   - Dropdown pemilih role demo di `Navbar` telah digantikan oleh penampil identitas akun nyata dan tombol Masuk/Daftar/Keluar.
3. **Kesiapan Akun Pengujian Nyata**:
   - Sebanyak 4 akun resmi untuk masing-masing peran kanonis telah berhasil didaftarkan dan diuji login autentikasinya via Firebase Authentication SDK dengan kata sandi seragam `password123`.
   - Dokumen profil Firestore `users/{uid}` telah disinkronkan dengan field `role` kanonis (`pasien`, `resepsionis`, `dokter`, `super_admin`).

---

## 4. Daftar Kendala yang Ditemukan & Ditangani

1. **Kendala Sesi Demo Lokal**:
   - *Sebelum perbaikan*: Route guard sebelumnya membaca `currentUser` dari `lib/store.js` yang memiliki nilai default `"user-andi"`. Akibatnya pengunjung yang belum login dianggap sebagai pasien Andi dan melihat *Akses Ditolak* di `/admin` bukannya dialihkan ke `/masuk`.
   - *Solusi*: Fallback demo lokal dihapus sepenuhnya dari semua guard dan `lib/store.js`. Hak akses kini 100% bergantung pada `auth.currentUser` dan dokumen Firestore `users/{uid}`.
2. **Kendala Sinkronisasi State Efek Samping (React 19)**:
   - *Sebelum perbaikan*: Panggilan `setStatus("loading")` sinkron di root `useEffect` memicu peringatan ESLint `react-hooks/set-state-in-effect`.
   - *Solusi*: State inisial disetel sejak `useState("loading")` dan fungsi `handleRetry` menangani pembaruan status saat tombol Coba Lagi diklik.
3. **Ketiadaan Akun di Firebase Authentication Konsol**:
   - *Sebelum perbaikan*: Akun email demo sebelumnya belum terdaftar di Firebase Auth proyek cloud sehingga login nyata menghasilkan error `auth/invalid-credential`.
   - *Solusi*: Telah dijalankan skrip provisioning resmi (`scripts/setup-test-accounts.mjs`) untuk mendaftarkan akun di Firebase Auth dan menyinkronkan UID ke dokumen Firestore `users/{uid}`.

---

## 5. Pengujian yang Masih Perlu Dilakukan Secara Manual

Pengujian interaktif peramban manual berikut wajib dijalankan oleh penguji di peramban desktop (`http://localhost:3000`):
1. **Pengujian Login Antarmuka & Navigasi**:
   - Membuka formulir `/masuk`, mengklik salah satu tombol pintasan kredensial peran, lalu menekan tombol "Masuk" untuk memverifikasi transisi halaman ke dasbor perannya masing-masing.
2. **Pengujian Layar "Akses Ditolak" Antar-Peran**:
   - Mencoba membuka rute silang (misal akun pasien mencoba membuka `/dokter` dan `/admin`, akun dokter membuka `/resepsionis`) dan memastikan pesan peran yang tampil di layar sesuai dengan data profil akun tersebut di Firestore.
3. **Pengujian Hard Refresh (F5)**:
   - Menekan F5 saat berada di dalam modul dan mengamati apakah status *Memuat...* tampil sejenak dengan mulus tanpa adanya *flash* atau *redirect* keliru.
4. **Pengujian Sign Out**:
   - Mengklik tombol Keluar pada dropdown Navbar dan memastikan sesi benar-benar terputus.

---

## 6. Catatan Penguji Lapangan
*(Bagian ini dapat diisi saat pengujian manual di peramban dijalankan)*

- **Tanggal Pengujian**: ________________________
- **Nama Penguji**: ________________________
- **Peramban & Versi**: ________________________
- **Catatan Tambahan**:
  1. __________________________________________________________________
  2. __________________________________________________________________
