import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs
} from "firebase/firestore";
import {
  createJanjiTemuAtomic,
  getAllJanjiFromFirestore,
  getJanjiByIdFromFirestore,
  getSlotTerisiFromFirestore,
  confirmJanjiTemuFromFirestore,
  markHadirJanjiTemuFromFirestore,
  cancelJanjiResepsionisFromFirestore,
  rescheduleJanjiResepsionisFromFirestore
} from "../lib/firestore-service.js";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApps()[0];
const db = getFirestore(app);

// Data uji
const TEST_PASIEN_UID = "JSFhMtZSevWImvU1CzVHWux3kiY2"; // Andi (pasien)
const TEST_DOKTER_ID = "68opnEQXFKgnLttqv9WYC4gn7VS2";  // drg. Bima Perkasa
const TEST_LAYANAN_ID = "lay-1";                         // Pemeriksaan Gigi (30 mnt)

async function runReceptionistTests() {
  console.log("=== MEMULAI PENGUJIAN ALUR RESEPSIONIS MENGELOLA JANJI (PRD 4.7) ===");

  // 1. Uji Pembacaan Semua Janji dari Firestore
  console.log("\n[1] Resepsionis Membaca Daftar Semua Janji dari Firestore...");
  const initialList = await getAllJanjiFromFirestore();
  console.log(`-> Ditemukan total ${initialList.length} janji temu di Firestore.`);

  // 2. Buat Janji Uji Baru untuk Dikelola Resepsionis
  const todayStr = new Date().toISOString().split("T")[0];
  const tomorrowObj = new Date();
  tomorrowObj.setDate(tomorrowObj.getDate() + 1);
  const tomorrowStr = tomorrowObj.toISOString().split("T")[0];

  // Cari slot kosong besok
  const occSlotsTomorrow = await getSlotTerisiFromFirestore(TEST_DOKTER_ID, tomorrowStr);
  const candidateHours = ["09:00", "09:30", "10:00", "10:30", "11:00", "11:30", "13:00", "13:30", "14:00", "14:30"];
  const freeHourTomorrow = candidateHours.find(h => !occSlotsTomorrow.some(s => s.jam === h)) || "15:00";

  console.log(`\n[2] Membuat Janji Temu Uji pada ${tomorrowStr} jam ${freeHourTomorrow} (Status: menunggu)...`);
  const appointmentA = await createJanjiTemuAtomic({
    pasienId: TEST_PASIEN_UID,
    dokterId: TEST_DOKTER_ID,
    layananId: TEST_LAYANAN_ID,
    tanggal: tomorrowStr,
    jam: freeHourTomorrow,
    keluhan: "Konsultasi tambalan lepas",
    durasiMenit: 30
  });
  const janjiIdA = appointmentA.janjiId;
  console.log(`-> Janji uji berhasil dibuat: ID ${janjiIdA} (Tanggal: ${tomorrowStr}, Jam: ${freeHourTomorrow}, Status: menunggu)`);

  // 3. Uji Otorisasi: Pasien atau role lain tidak boleh melakukan aksi resepsionis
  console.log("\n[3] Menguji Otorisasi Peran (Role Guard)...");
  try {
    await confirmJanjiTemuFromFirestore(janjiIdA, "pasien");
    throw new Error("Gagal! Role pasien seharusnya tidak boleh mengonfirmasi janji!");
  } catch (err) {
    console.log(`-> Berhasil ditolak untuk role 'pasien': "${err.message}"`);
    if (!err.message.includes("Akses ditolak")) {
      throw new Error(`Pesan otorisasi tidak sesuai: ${err.message}`);
    }
  }

  // 4. Uji Resepsionis Mengonfirmasi Janji (PRD 4.7)
  console.log("\n[4] Resepsionis Mengonfirmasi Janji Temu (Role: resepsionis)...");
  const confirmResult = await confirmJanjiTemuFromFirestore(janjiIdA, "resepsionis");
  console.log(`-> Hasil konfirmasi:`, confirmResult);

  // Verifikasi di Firestore
  const snapConfirmed = await getDoc(doc(db, "janji_temu", janjiIdA));
  const dataConfirmed = snapConfirmed.data();
  console.log(`-> Status janji di Firestore setelah konfirmasi: "${dataConfirmed.status}"`);
  if (dataConfirmed.status !== "dikonfirmasi") {
    throw new Error(`Status di Firestore harus 'dikonfirmasi', aktual: ${dataConfirmed.status}`);
  }

  // 5. Uji Validasi Status: Mencoba konfirmasi ulang janji yang sudah dikonfirmasi
  console.log("\n[5] Menguji Validasi Konfirmasi: Janji yang sudah dikonfirmasi tidak boleh dikonfirmasi ulang...");
  try {
    await confirmJanjiTemuFromFirestore(janjiIdA, "resepsionis");
    throw new Error("Gagal! Konfirmasi ulang seharusnya ditolak!");
  } catch (err) {
    console.log(`-> Berhasil ditolak sesuai PRD 4.7: "${err.message}"`);
    if (!err.message.includes("Hanya janji berstatus 'menunggu'")) {
      throw new Error(`Pesan validasi tidak sesuai: ${err.message}`);
    }
  }

  // 6. Uji Validasi Tandai Hadir: Janji bukan hari ini tidak boleh ditandai hadir (PRD 4.7)
  console.log("\n[6] Menguji Validasi Tandai Hadir untuk Tanggal Bukan Hari Ini (PRD 4.7)...");
  try {
    // janjiIdA bertanggal besok (tomorrowStr), bukan todayStr
    await markHadirJanjiTemuFromFirestore(janjiIdA, "resepsionis", todayStr);
    throw new Error("Gagal! Tandai hadir sebelum hari H seharusnya ditolak!");
  } catch (err) {
    console.log(`-> Berhasil ditolak sesuai PRD 4.7: "${err.message}"`);
    if (!err.message.includes("hari janji temu")) {
      throw new Error(`Pesan validasi hari H tidak sesuai: ${err.message}`);
    }
  }

  // 7. Uji Tandai Hadir pada Hari H (PRD 4.7)
  console.log("\n[7] Menguji Tandai Hadir pada Hari H...");
  // Cari slot kosong hari ini
  const occSlotsToday = await getSlotTerisiFromFirestore(TEST_DOKTER_ID, todayStr);
  const freeHourToday = candidateHours.find(h => !occSlotsToday.some(s => s.jam === h)) || "15:00";

  // Buat janji kedua bertanggal hari ini (todayStr)
  const appointmentToday = await createJanjiTemuAtomic({
    pasienId: TEST_PASIEN_UID,
    dokterId: TEST_DOKTER_ID,
    layananId: TEST_LAYANAN_ID,
    tanggal: todayStr,
    jam: freeHourToday,
    keluhan: "Pembersihan karang gigi",
    durasiMenit: 30
  });
  const janjiIdToday = appointmentToday.janjiId;
  console.log(`-> Janji hari ini berhasil dibuat: ID ${janjiIdToday} (Jam: ${freeHourToday}, Status: menunggu)`);

  // Coba tandai hadir sebelum dikonfirmasi -> harus gagal
  try {
    await markHadirJanjiTemuFromFirestore(janjiIdToday, "resepsionis", todayStr);
    throw new Error("Gagal! Status menunggu tidak boleh langsung ditandai hadir!");
  } catch (err) {
    console.log(`-> Berhasil ditolak untuk janji berstatus 'menunggu': "${err.message}"`);
  }

  // Konfirmasi dulu janji hari ini
  await confirmJanjiTemuFromFirestore(janjiIdToday, "resepsionis");
  console.log("-> Janji hari ini berhasil dikonfirmasi.");

  // Sekarang tandai hadir
  const hadirResult = await markHadirJanjiTemuFromFirestore(janjiIdToday, "resepsionis", todayStr);
  console.log("-> Hasil tandai hadir:", hadirResult);

  // Verifikasi di Firestore
  const snapHadir = await getDoc(doc(db, "janji_temu", janjiIdToday));
  const dataHadir = snapHadir.data();
  console.log(`-> Status janji di Firestore setelah ditandai hadir: "${dataHadir.status}"`);
  if (dataHadir.status !== "hadir") {
    throw new Error(`Status di Firestore harus 'hadir', aktual: ${dataHadir.status}`);
  }

  // 8. Uji Pembatalan oleh Resepsionis dengan Alasan (PRD 4.7)
  console.log("\n[8] Menguji Pembatalan oleh Resepsionis (PRD 4.7)...");
  // Batalkan janji pertama (janjiIdA)
  const cancelResult = await cancelJanjiResepsionisFromFirestore(
    janjiIdA,
    "Pasien mengabari mendadak ada dinas luar kota",
    "resepsionis"
  );
  console.log("-> Hasil pembatalan oleh resepsionis:", cancelResult);

  const snapCancelled = await getDoc(doc(db, "janji_temu", janjiIdA));
  const dataCancelled = snapCancelled.data();
  console.log(`-> Dokumen janji_temu dibatalkan: status="${dataCancelled.status}", alasan="${dataCancelled.alasanBatal}"`);
  if (dataCancelled.status !== "dibatalkan" || !dataCancelled.alasanBatal) {
    throw new Error("Pembatalan gagal menyimpan status atau alasan ke Firestore!");
  }

  // Verifikasi slot_terisi dihapus
  const snapSlot = await getDoc(doc(db, "slot_terisi", janjiIdA));
  if (snapSlot.exists()) {
    throw new Error("Dokumen slot_terisi harus dihapus saat janji dibatalkan oleh resepsionis!");
  }
  console.log("-> Dokumen slot_terisi berhasil dihapus dari Firestore sehingga jam praktik dokter kembali kosong.");

  // Bersihkan juga janji kedua (janjiIdToday) agar data pengujian rapi
  await cancelJanjiResepsionisFromFirestore(
    janjiIdToday,
    "Dibatalkan otomatis pasca-pengujian",
    "super_admin"
  );
  console.log("-> Janji kedua berhasil dibersihkan pasca-pengujian.");

  console.log("\n=== SELURUH PENGUJIAN RESEPSIONIS SESUAI PRD 4.7 BERHASIL 100% ===");
}

runReceptionistTests().catch(err => {
  console.error("\n❌ PENGUJIAN RESEPSIONIS GAGAL:", err);
  process.exit(1);
});
