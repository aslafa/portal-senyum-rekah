// Data awal sesuai PRD Bab 2, 4, dan 7.1 (Koleksi Firestore)

export const INITIAL_USERS = [
  {
    id: "user-andi",
    nama: "Andi Saputra",
    email: "andi@example.com",
    noHp: "081234567891",
    role: "pasien",
    aktif: true,
    dibuatPada: "2026-09-01T08:00:00Z"
  },
  {
    id: "user-maya",
    nama: "Maya Lestari",
    email: "maya@example.com",
    noHp: "081234567892",
    role: "pasien",
    aktif: true,
    dibuatPada: "2026-09-05T09:30:00Z"
  },
  {
    id: "user-laras",
    nama: "Laras Prameswari",
    email: "laras@senyumrekah.id",
    noHp: "081234567893",
    role: "resepsionis",
    aktif: true,
    dibuatPada: "2026-08-01T08:00:00Z"
  },
  {
    id: "user-bima",
    nama: "drg. Bima Perkasa",
    email: "bima@senyumrekah.id",
    noHp: "081234567894",
    role: "dokter",
    aktif: true,
    dibuatPada: "2026-08-01T08:00:00Z"
  },
  {
    id: "user-sinta",
    nama: "drg. Sinta Dewi",
    email: "sinta@senyumrekah.id",
    noHp: "081234567895",
    role: "dokter",
    aktif: true,
    dibuatPada: "2026-08-01T08:00:00Z"
  },
  {
    id: "user-ratna",
    nama: "Bu Ratna (Pemilik Klinik)",
    email: "ratna@senyumrekah.id",
    noHp: "081234567890",
    role: "super_admin",
    aktif: true,
    dibuatPada: "2026-07-01T08:00:00Z"
  }
];

export const INITIAL_LAYANAN = [
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

export const INITIAL_JADWAL_DOKTER = [
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

// Tanggal referensi deterministik untuk SSR / Prerender
function getDateOffset(days) {
  const d = new Date("2026-10-16T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().split("T")[0];
}

export const INITIAL_JANJI = [
  {
    id: "janji-101",
    pasienId: "user-andi",
    dokterId: "user-bima",
    layananId: "lay-3",
    tanggal: getDateOffset(0), // Hari ini
    jam: "10:00",
    keluhan: "Tambalan lama lepas dan ngilu saat minum dingin",
    status: "hadir",
    alasanBatal: "",
    dibuatPada: "2026-10-14T09:00:00Z"
  },
  {
    id: "janji-102",
    pasienId: "user-maya",
    dokterId: "user-sinta",
    layananId: "lay-2",
    tanggal: getDateOffset(0), // Hari ini
    jam: "11:00",
    keluhan: "Karang gigi bagian bawah terasa tebal dan gusi sering berdarah",
    status: "menunggu",
    alasanBatal: "",
    dibuatPada: "2026-10-15T14:20:00Z"
  },
  {
    id: "janji-103",
    pasienId: "user-andi",
    dokterId: "user-bima",
    layananId: "lay-1",
    tanggal: getDateOffset(2), // Lusa
    jam: "13:00",
    keluhan: "Kontrol pasca pembersihan gusi",
    status: "dikonfirmasi",
    alasanBatal: "",
    dibuatPada: "2026-10-15T10:15:00Z"
  },
  {
    id: "janji-104",
    pasienId: "user-maya",
    dokterId: "user-sinta",
    layananId: "lay-4",
    tanggal: getDateOffset(-3), // Selesai
    jam: "10:30",
    keluhan: "Gigi bungsu kanan bawah miring dan mendesak pipi",
    status: "selesai",
    alasanBatal: "",
    dibuatPada: "2026-10-10T11:00:00Z"
  },
  {
    id: "janji-105",
    pasienId: "user-andi",
    dokterId: "user-bima",
    layananId: "lay-2",
    tanggal: getDateOffset(-7), // Selesai
    jam: "09:30",
    keluhan: "Scaling rutin 6 bulanan",
    status: "selesai",
    alasanBatal: "",
    dibuatPada: "2026-10-05T08:30:00Z"
  },
  {
    id: "janji-106",
    pasienId: "user-andi",
    dokterId: "user-sinta",
    layananId: "lay-1",
    tanggal: getDateOffset(-12),
    jam: "14:00",
    keluhan: "Konsultasi kawat gigi",
    status: "dibatalkan",
    alasanBatal: "Pasien mendadak ada tugas dinas luar kota",
    dibuatPada: "2026-10-01T15:00:00Z"
  }
];

export const INITIAL_CATATAN = [
  {
    id: "catatan-1",
    janjiId: "janji-104",
    pasienId: "user-maya",
    dokterId: "user-sinta",
    tindakan: "Pencabutan gigi molar 3 bawah kanan dengan anestesi infiltrasi",
    catatan: "Gigit tampon selama 60 menit. Hindari berkumur keras dan minum air hangat hari ini. Resep amoxicillin 500mg dan asam mefenamat 500mg diminum teratur.",
    dibuatPada: "2026-10-13T11:15:00Z"
  },
  {
    id: "catatan-2",
    janjiId: "janji-105",
    pasienId: "user-andi",
    dokterId: "user-bima",
    tindakan: "Ultrasonic scaling rahang atas dan rahang bawah, polishing pasta profilaksis",
    catatan: "Kalkulus supragingiva dan subgingiva anterior inferior telah dibersihkan. Edukasi teknik menyikat gigi roll technique dan penggunaan benang gigi.",
    dibuatPada: "2026-10-09T10:15:00Z"
  }
];
