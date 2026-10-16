import { initializeApp, getApps } from "firebase/app";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  getDocs,
  query,
  where
} from "firebase/firestore";
import {
  getActiveLayananFromFirestore,
  getActiveDokterFromFirestore,
  getJadwalDokterFromFirestore,
  getSlotTerisiFromFirestore,
  calculateAvailableSlots,
  createJanjiTemuAtomic,
  getJanjiPasienFromFirestore,
  getJanjiByIdFromFirestore,
  cancelJanjiTemuFromFirestore
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

// Data uji pasien: Andi (UID autentikasi nyata di Firestore users)
const TEST_PASIEN_UID = "JSFhMtZSevWImvU1CzVHWux3kiY2"; // andi@example.com

async function runTests() {
  console.log("=== MEMULAI PENGUJIAN ALUR PEMBUATAN JANJI SESUAI PRD 4.3 ===");

  // 1. Membaca Layanan Aktif dari Firestore
  console.log("\n[1] Membaca Layanan Aktif dari Firestore...");
  const layananList = await getActiveLayananFromFirestore();
  console.log(`-> Ditemukan ${layananList.length} layanan aktif:`, layananList.map(l => `${l.nama} (${l.durasiMenit} mnt - Rp ${l.harga})`));
  if (layananList.length === 0) throw new Error("Layanan aktif tidak ditemukan!");

  // 2. Membaca Dokter Aktif dari Firestore
  console.log("\n[2] Membaca Dokter Aktif dari Firestore...");
  const dokterList = await getActiveDokterFromFirestore();
  console.log(`-> Ditemukan ${dokterList.length} dokter aktif:`, dokterList.map(d => `${d.nama} (${d.spesialisasi || 'Dokter'}) [ID: ${d.id}]`));
  if (dokterList.length === 0) throw new Error("Dokter aktif tidak ditemukan!");

  const targetLayanan = layananList[0];
  const targetDokter = dokterList[0];

  // 3. Membaca Jadwal Dokter dari Firestore
  console.log(`\n[3] Membaca Jadwal Dokter untuk ${targetDokter.nama} (ID: ${targetDokter.id})...`);
  const jadwal = await getJadwalDokterFromFirestore(targetDokter.id, targetDokter.email);
  console.log(`-> Ditemukan ${jadwal.length} hari praktik:`, jadwal.map(j => `${j.hari} (${j.jamMulai} - ${j.jamSelesai})`));
  if (jadwal.length === 0) throw new Error("Jadwal dokter tidak ditemukan!");

  // Tentukan tanggal uji: cari hari kerja yang cocok dengan jadwal praktik dokter minimal H+1
  const daysMap = { "minggu": 0, "senin": 1, "selasa": 2, "rabu": 3, "kamis": 4, "jumat": 5, "sabtu": 6 };
  const targetDayNames = jadwal.map(j => j.hari.toLowerCase());
  
  let testDate = new Date();
  testDate.setDate(testDate.getDate() + 2); // minimal H+2 agar aman
  let targetDayEntry = null;
  let testDateStr = "";

  for (let i = 0; i < 14; i++) {
    const dayOfWeek = testDate.getDay();
    const matchDay = jadwal.find(j => daysMap[j.hari.toLowerCase()] === dayOfWeek);
    if (matchDay) {
      targetDayEntry = matchDay;
      testDateStr = testDate.toISOString().split("T")[0];
      break;
    }
    testDate.setDate(testDate.getDate() + 1);
  }

  if (!targetDayEntry) throw new Error("Tidak menemukan tanggal yang cocok dengan jadwal dokter!");
  console.log(`-> Memilih tanggal uji: ${testDateStr} (${targetDayEntry.hari}, ${targetDayEntry.jamMulai} - ${targetDayEntry.jamSelesai})`);

  // 4. Membaca Slot Terisi & Menghitung Slot Waktu Bebas Bentrok
  console.log(`\n[4] Menghitung ketersediaan slot waktu untuk ${testDateStr}...`);
  const occupiedSlots = await getSlotTerisiFromFirestore(targetDokter.id, testDateStr);
  console.log(`-> Slot yang sudah terisi saat ini: ${occupiedSlots.length}`);

  const availableSlots = calculateAvailableSlots(
    targetDayEntry.jamMulai,
    targetDayEntry.jamSelesai,
    targetLayanan.durasiMenit,
    occupiedSlots
  );
  console.log(`-> Slot waktu tersedia (${availableSlots.length}):`, availableSlots.slice(0, 5), "...");
  if (availableSlots.length === 0) throw new Error("Tidak ada slot waktu tersedia!");

  const targetJam = availableSlots[0];
  console.log(`-> Memilih jam: ${targetJam}`);

  // 5. Pembuatan Janji Temu Atomik (PRD 4.3.1 & 7.1)
  console.log("\n[5] Membuat Janji Temu Menggunakan Transaksi Atomik Firestore...");
  const appointmentResult = await createJanjiTemuAtomic({
    pasienId: TEST_PASIEN_UID,
    dokterId: targetDokter.id,
    layananId: targetLayanan.id,
    tanggal: testDateStr,
    jam: targetJam,
    keluhan: "Gigi ngilu saat makan es krim sejak 3 hari lalu",
    durasiMenit: targetLayanan.durasiMenit
  });

  const createdJanjiId = appointmentResult.janjiId;
  console.log(`-> Berhasil dibuat! Janji ID: ${createdJanjiId}`);

  // 6. Verifikasi Dokumen di Firestore
  console.log("\n[6] Memverifikasi Dokumen di Firestore...");
  const janjiDocSnap = await getDoc(doc(db, "janji_temu", createdJanjiId));
  if (!janjiDocSnap.exists()) throw new Error("Dokumen janji_temu tidak ditemukan di Firestore!");
  const janjiData = janjiDocSnap.data();
  console.log("-> Dokumen janji_temu di Firestore:", {
    id: janjiDocSnap.id,
    pasienId: janjiData.pasienId,
    dokterId: janjiData.dokterId,
    layananId: janjiData.layananId,
    tanggal: janjiData.tanggal,
    jam: janjiData.jam,
    status: janjiData.status,
    keluhan: janjiData.keluhan,
    alasanBatal: janjiData.alasanBatal
  });

  if (janjiData.status !== "menunggu") throw new Error(`Status harus 'menunggu', aktual: ${janjiData.status}`);
  if (janjiData.pasienId !== TEST_PASIEN_UID) throw new Error("pasienId tidak cocok dengan UID pasien!");

  const slotDocSnap = await getDoc(doc(db, "slot_terisi", createdJanjiId));
  if (!slotDocSnap.exists()) throw new Error("Dokumen slot_terisi tidak ditemukan di Firestore!");
  console.log("-> Dokumen slot_terisi di Firestore:", slotDocSnap.data());

  // 7. Pengujian Pencegahan Slot Ganda (Pesan PRD 4.3.1: 'Slot ini baru saja terisi. Pilih jam lain.')
  console.log("\n[7] Menguji Pencegahan Slot Ganda (Atomic Transaction Conflict)...");
  try {
    await createJanjiTemuAtomic({
      pasienId: "another-patient-uid",
      dokterId: targetDokter.id,
      layananId: targetLayanan.id,
      tanggal: testDateStr,
      jam: targetJam, // jam yang persis sama
      keluhan: "Ingin booking di jam yang sama",
      durasiMenit: targetLayanan.durasiMenit
    });
    throw new Error("Gagal! Transaksi seharusnya menolak pemesanan ganda!");
  } catch (err) {
    console.log(`-> Berhasil mendeteksi bentrok! Pesan error: "${err.message}"`);
    if (!err.message.includes("Slot ini baru saja terisi")) {
      throw new Error(`Pesan error tidak sesuai PRD! Aktual: ${err.message}`);
    }
  }

  // 8. Verifikasi Pembacaan Janji Pasien dari Firestore
  console.log(`\n[8] Membaca Janji Temu untuk Pasien UID ${TEST_PASIEN_UID}...`);
  const pasienAppointments = await getJanjiPasienFromFirestore(TEST_PASIEN_UID);
  console.log(`-> Ditemukan ${pasienAppointments.length} janji temu milik pasien.`);
  const foundAppointment = pasienAppointments.find(j => j.id === createdJanjiId);
  if (!foundAppointment) throw new Error("Janji yang baru dibuat tidak ditemukan di daftar janji pasien!");
  console.log(`-> Janji ditemukan di daftar pasien dengan status: ${foundAppointment.status}`);

  // 9. Uji Pembatalan Janji (PRD 4.3.2)
  console.log("\n[9] Menguji Pembatalan Janji Temu Sesuai PRD 4.3.2...");
  await cancelJanjiTemuFromFirestore(createdJanjiId, "Dibatalkan oleh pasien untuk pengujian otomatis");
  
  const updatedJanjiSnap = await getDoc(doc(db, "janji_temu", createdJanjiId));
  const updatedData = updatedJanjiSnap.data();
  console.log(`-> Status setelah pembatalan: ${updatedData.status}, alasanBatal: "${updatedData.alasanBatal}"`);
  if (updatedData.status !== "dibatalkan") throw new Error("Status janji tidak berubah menjadi dibatalkan!");

  const slotAfterCancelSnap = await getDoc(doc(db, "slot_terisi", createdJanjiId));
  if (slotAfterCancelSnap.exists()) throw new Error("Dokumen slot_terisi harus dihapus saat janji dibatalkan!");
  console.log("-> Dokumen slot_terisi berhasil dihapus dari Firestore sehingga slot waktu kembali tersedia.");

  console.log("\n=== SELURUH PENGUJIAN ALUR JANJI TEMU SESUAI PRD 4.3 BERHASIL 100% ===");
}

runTests().catch(err => {
  console.error("\n❌ PENGUJIAN GAGAL:", err);
  process.exit(1);
});
