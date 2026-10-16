import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc, Timestamp } from "firebase/firestore";

// Konfigurasi Firebase dari .env.local
const firebaseConfig = {
  apiKey: "AIzaSyBkLawmriAKN835HIqvQAtJ7gvgE33xqRY",
  authDomain: "portal-senyum-rekah-f0180.firebaseapp.com",
  projectId: "portal-senyum-rekah-f0180",
  storageBucket: "portal-senyum-rekah-f0180.firebasestorage.app",
  messagingSenderId: "1030427611136",
  appId: "1:1030427611136:web:deccf978e48e1583e988e5"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Data Koleksi Sesuai PRD Bab 2, 4, dan 7.1
const USERS = [
  {
    id: "user-andi",
    nama: "Andi Saputra",
    email: "andi@example.com",
    noHp: "081234567891",
    role: "pasien",
    aktif: true,
    dibuatPada: Timestamp.fromDate(new Date("2026-09-01T08:00:00Z"))
  },
  {
    id: "user-maya",
    nama: "Maya Lestari",
    email: "maya@example.com",
    noHp: "081234567892",
    role: "pasien",
    aktif: true,
    dibuatPada: Timestamp.fromDate(new Date("2026-09-05T09:30:00Z"))
  },
  {
    id: "user-laras",
    nama: "Laras Prameswari",
    email: "laras@senyumrekah.id",
    noHp: "081234567893",
    role: "resepsionis",
    aktif: true,
    dibuatPada: Timestamp.fromDate(new Date("2026-08-01T08:00:00Z"))
  },
  {
    id: "user-bima",
    nama: "drg. Bima Perkasa",
    email: "bima@senyumrekah.id",
    noHp: "081234567894",
    role: "dokter",
    aktif: true,
    dibuatPada: Timestamp.fromDate(new Date("2026-08-01T08:00:00Z"))
  },
  {
    id: "user-sinta",
    nama: "drg. Sinta Dewi",
    email: "sinta@senyumrekah.id",
    noHp: "081234567895",
    role: "dokter",
    aktif: true,
    dibuatPada: Timestamp.fromDate(new Date("2026-08-01T08:00:00Z"))
  },
  {
    id: "user-ratna",
    nama: "Bu Ratna (Pemilik Klinik)",
    email: "ratna@senyumrekah.id",
    noHp: "081234567890",
    role: "super_admin",
    aktif: true,
    dibuatPada: Timestamp.fromDate(new Date("2026-07-01T08:00:00Z"))
  }
];

const LAYANAN = [
  {
    id: "lay-1",
    nama: "Pemeriksaan & Konsultasi Gigi",
    durasiMenit: 30,
    harga: 150000,
    aktif: true
  },
  {
    id: "lay-2",
    nama: "Scaling (Pembersihan Karang)",
    durasiMenit: 30,
    harga: 350000,
    aktif: true
  },
  {
    id: "lay-3",
    nama: "Tambal Gigi Komposit",
    durasiMenit: 60,
    harga: 400000,
    aktif: true
  },
  {
    id: "lay-4",
    nama: "Cabut Gigi",
    durasiMenit: 30,
    harga: 250000,
    aktif: true
  },
  {
    id: "lay-5",
    nama: "Perawatan Saluran Akar",
    durasiMenit: 60,
    harga: 650000,
    aktif: true
  }
];

const JADWAL_DOKTER = [
  {
    id: "jadwal-bima-senin",
    dokterId: "user-bima",
    hari: "senin",
    jamMulai: "09:00",
    jamSelesai: "15:00"
  },
  {
    id: "jadwal-bima-rabu",
    dokterId: "user-bima",
    hari: "rabu",
    jamMulai: "09:00",
    jamSelesai: "15:00"
  },
  {
    id: "jadwal-bima-jumat",
    dokterId: "user-bima",
    hari: "jumat",
    jamMulai: "09:00",
    jamSelesai: "15:00"
  },
  {
    id: "jadwal-sinta-selasa",
    dokterId: "user-sinta",
    hari: "selasa",
    jamMulai: "10:00",
    jamSelesai: "16:00"
  },
  {
    id: "jadwal-sinta-kamis",
    dokterId: "user-sinta",
    hari: "kamis",
    jamMulai: "10:00",
    jamSelesai: "16:00"
  },
  {
    id: "jadwal-sinta-sabtu",
    dokterId: "user-sinta",
    hari: "sabtu",
    jamMulai: "09:00",
    jamSelesai: "14:00"
  }
];

const JANJI_TEMU = [
  {
    id: "janji-101",
    pasienId: "user-andi",
    dokterId: "user-bima",
    layananId: "lay-3",
    tanggal: "2026-10-16",
    jam: "10:00",
    keluhan: "Tambalan lama lepas dan ngilu saat minum dingin",
    status: "hadir",
    alasanBatal: "",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-14T09:00:00Z"))
  },
  {
    id: "janji-102",
    pasienId: "user-maya",
    dokterId: "user-sinta",
    layananId: "lay-2",
    tanggal: "2026-10-16",
    jam: "11:00",
    keluhan: "Karang gigi bagian bawah terasa tebal dan gusi sering berdarah",
    status: "menunggu",
    alasanBatal: "",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-15T14:20:00Z"))
  },
  {
    id: "janji-103",
    pasienId: "user-andi",
    dokterId: "user-bima",
    layananId: "lay-1",
    tanggal: "2026-10-18",
    jam: "13:00",
    keluhan: "Kontrol pasca pembersihan gusi",
    status: "dikonfirmasi",
    alasanBatal: "",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-15T10:15:00Z"))
  },
  {
    id: "janji-104",
    pasienId: "user-maya",
    dokterId: "user-sinta",
    layananId: "lay-4",
    tanggal: "2026-10-13",
    jam: "10:30",
    keluhan: "Gigi bungsu kanan bawah miring dan mendesak pipi",
    status: "selesai",
    alasanBatal: "",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-10T11:00:00Z"))
  },
  {
    id: "janji-105",
    pasienId: "user-andi",
    dokterId: "user-bima",
    layananId: "lay-2",
    tanggal: "2026-10-09",
    jam: "09:30",
    keluhan: "Scaling rutin 6 bulanan",
    status: "selesai",
    alasanBatal: "",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-05T08:30:00Z"))
  },
  {
    id: "janji-106",
    pasienId: "user-andi",
    dokterId: "user-sinta",
    layananId: "lay-1",
    tanggal: "2026-10-04",
    jam: "14:00",
    keluhan: "Konsultasi kawat gigi",
    status: "dibatalkan",
    alasanBatal: "Pasien mendadak ada tugas dinas luar kota",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-01T15:00:00Z"))
  }
];

const CATATAN_PERAWATAN = [
  {
    id: "catatan-1",
    janjiId: "janji-104",
    pasienId: "user-maya",
    dokterId: "user-sinta",
    tindakan: "Pencabutan gigi molar 3 bawah kanan dengan anestesi infiltrasi",
    catatan: "Gigit tampon selama 60 menit. Hindari berkumur keras dan minum air hangat hari ini. Resep amoxicillin 500mg dan asam mefenamat 500mg diminum teratur.",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-13T11:15:00Z"))
  },
  {
    id: "catatan-2",
    janjiId: "janji-105",
    pasienId: "user-andi",
    dokterId: "user-bima",
    tindakan: "Ultrasonic scaling rahang atas dan rahang bawah, polishing pasta profilaksis",
    catatan: "Kalkulus supragingiva dan subgingiva anterior inferior telah dibersihkan. Edukasi teknik menyikat gigi roll technique dan penggunaan benang gigi.",
    dibuatPada: Timestamp.fromDate(new Date("2026-10-09T10:15:00Z"))
  }
];

// Koleksi 6: slot_terisi (Dibuat dari janji aktif yang belum dibatalkan sesuai PRD 4.3.1 & 7.1)
const SLOT_TERISI = [
  {
    id: "janji-101",
    dokterId: "user-bima",
    tanggal: "2026-10-16",
    jam: "10:00",
    durasiMenit: 60
  },
  {
    id: "janji-102",
    dokterId: "user-sinta",
    tanggal: "2026-10-16",
    jam: "11:00",
    durasiMenit: 30
  },
  {
    id: "janji-103",
    dokterId: "user-bima",
    tanggal: "2026-10-18",
    jam: "13:00",
    durasiMenit: 30
  }
];

async function seedFirestore() {
  console.log("Memulai pengisian seed data ke Cloud Firestore...");

  // 1. Koleksi users
  console.log(`Mengisi koleksi 'users' (${USERS.length} dokumen)...`);
  for (const item of USERS) {
    const { id, ...data } = item;
    await setDoc(doc(db, "users", id), data);
  }

  // 2. Koleksi layanan
  console.log(`Mengisi koleksi 'layanan' (${LAYANAN.length} dokumen)...`);
  for (const item of LAYANAN) {
    const { id, ...data } = item;
    await setDoc(doc(db, "layanan", id), data);
  }

  // 3. Koleksi jadwal_dokter
  console.log(`Mengisi koleksi 'jadwal_dokter' (${JADWAL_DOKTER.length} dokumen)...`);
  for (const item of JADWAL_DOKTER) {
    const { id, ...data } = item;
    await setDoc(doc(db, "jadwal_dokter", id), data);
  }

  // 4. Koleksi janji_temu
  console.log(`Mengisi koleksi 'janji_temu' (${JANJI_TEMU.length} dokumen)...`);
  for (const item of JANJI_TEMU) {
    const { id, ...data } = item;
    await setDoc(doc(db, "janji_temu", id), data);
  }

  // 5. Koleksi catatan_perawatan
  console.log(`Mengisi koleksi 'catatan_perawatan' (${CATATAN_PERAWATAN.length} dokumen)...`);
  for (const item of CATATAN_PERAWATAN) {
    const { id, ...data } = item;
    await setDoc(doc(db, "catatan_perawatan", id), data);
  }

  // 6. Koleksi slot_terisi
  console.log(`Mengisi koleksi 'slot_terisi' (${SLOT_TERISI.length} dokumen)...`);
  for (const item of SLOT_TERISI) {
    const { id, ...data } = item;
    await setDoc(doc(db, "slot_terisi", id), data);
  }

  console.log("✅ Berhasil mengisi seluruh 6 koleksi Firestore sesuai PRD 7.1!");
  process.exit(0);
}

seedFirestore().catch((err) => {
  console.error("❌ Gagal mengisi seed data:", err);
  process.exit(1);
});
