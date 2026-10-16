# 🦷 Portal Janji Senyum Rekah

> **Sistem Reservasi Janji Temu dan Pengelolaan Operasional Klinik Gigi Berbasis Web Realtime.**

Aplikasi web modern untuk Klinik Gigi Senyum Rekah yang menggantikan pencatatan manual buku janji dengan sistem pemesanan online bebas bentrok waktu, manajemen alur kerja multiperan (Pasien, Resepsionis, Dokter, Super Admin), serta integrasi database cloud realtime menggunakan Firebase Firestore.

---

## 📌 Ringkasan Eksekutif

- **Masalah**: Janji temu via WhatsApp/telepon rawan tabrakan jam, pasien lupa jadwal kontrol, dan catatan medis kertas sulit ditelusuri.
- **Solusi**: Portal terpusat di mana pasien dapat memesan slot praktik dokter gigi secara mandiri, dengan garansi transaksi atomik Firestore untuk mencegah pemesanan ganda (*anti-double booking*).
- **Peran Pengguna**:
  1. **Pasien**: Memilih layanan, dokter, tanggal praktik, dan slot waktu yang tersedia, mengisi keluhan, serta membatalkan janji mandiri (H-1).
  2. **Resepsionis**: Memantau antrean harian, mengonfirmasi janji berstatus menunggu, menandai kehadiran pasien di klinik, menjadwal ulang, dan membatalkan janji.
  3. **Dokter Gigi**: Memantau jadwal praktik harian miliknya, memeriksa pasien yang hadir, dan mencatat riwayat tindakan perawatan gigi.
  4. **Super Admin**: Mengontrol penuh data pengguna, peran akses (RBAC), master data layanan klinik, jadwal praktik dokter, dan laporan kunjungan.

---

## 🚀 Fitur Utama

- ⏱️ **Pencegahan Pemesanan Ganda (Atomic Transactions)**: Algoritma slot 30 menit dengan validasi bentrok waktu serentak di level Firestore (`runTransaction`).
- 🔐 **Role-Based Access Control (RBAC)**: Proteksi rute halaman dan otorisasi ketat berbasis Firebase Authentication dan profil dokumen `users/{uid}`.
- ⚡ **Pembaruan Data Realtime**: Sinkronisasi instan status janji (`menunggu` ➔ `dikonfirmasi` ➔ `hadir` ➔ `selesai` / `dibatalkan`) menggunakan Firestore snapshot listeners.
- 🎨 **Antarmuka Responsif & Elegan**: Dibangun menggunakan Next.js App Router dan Tailwind CSS dengan desain ramah pengguna di ponsel maupun laptop.

---

## 🛠️ Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router, Turbopack)
- **Library UI**: React, Tailwind CSS, Lucide React Icons
- **Backend & Database**: Firebase Authentication, Google Cloud Firestore
- **Bahasa**: JavaScript (ES Modules)

---

## ⚙️ Persiapan & Menjalankan Proyek

### 1. Prasyarat
- Node.js versi 18.x atau lebih baru
- Proyek Firebase dengan Authentication (Email/Password & Google) serta Firestore Database aktif

### 2. Konfigurasi Environment (`.env.local`)
Buat file `.env.local` di root proyek dan tambahkan konfigurasi Firebase Anda:
```env
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.firebasestorage.app
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_messaging_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

### 3. Instalasi Dependensi
```bash
npm install
```

### 4. Menjalankan Server Pengembangan
```bash
npm run dev
```
Buka [http://localhost:3000](http://localhost:3000) di peramban Anda.

### 5. Build Produksi
```bash
npm run build
npm run start
```

---

## 👥 Akun Uji Coba Default

| Peran | Email | Kata Sandi | Halaman Utama |
| :--- | :--- | :--- | :--- |
| **Pasien** | `andi@example.com` | `password123` | `/beranda` & `/janji` |
| **Resepsionis** | `laras@example.com` | `password123` | `/resepsionis` & `/resepsionis/janji` |
| **Dokter** | `bima@example.com` | `password123` | `/dokter` |
| **Super Admin** | `ratna@example.com` | `password123` | `/admin` |

---

## 🧪 Pengujian Otomatis

Proyek ini dilengkapi dengan skrip verifikasi alur Firestore:
- `node --env-file=.env.local scripts/test-booking-flow.mjs` : Menguji alur pemesanan janji pasien, perhitungan slot waktu, dan transaksi atomik pencegah bentrok.
- `node --env-file=.env.local scripts/test-receptionist-flow.mjs` : Menguji validasi otorisasi, konfirmasi janji, penandaan kehadiran hari H, dan pembatalan resepsionis.

---

## 📄 Lisensi

Hak Cipta © 2026 Klinik Gigi Senyum Rekah. Seluruh hak cipta dilindungi undang-undang.
