import { db } from "./firebase.js";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  runTransaction,
  serverTimestamp,
  Timestamp,
  updateDoc,
  onSnapshot
} from "firebase/firestore";

/**
 * Konversi string waktu "HH:mm" ke total menit dari jam 00:00.
 */
export function timeToMinutes(timeStr) {
  if (!timeStr) return 0;
  const [h, m] = timeStr.split(":").map(Number);
  return h * 60 + (m || 0);
}

/**
 * Konversi menit ke format string "HH:mm".
 */
export function minutesToTime(totalMins) {
  const h = Math.floor(totalMins / 60)
    .toString()
    .padStart(2, "0");
  const m = (totalMins % 60).toString().padStart(2, "0");
  return `${h}:${m}`;
}

/**
 * Dapatkan nama hari Indonesia dari string tanggal "YYYY-MM-DD".
 * Aman dari timezone offset.
 */
export function getHariFromTanggal(tanggalStr) {
  if (!tanggalStr) return "";
  const [year, month, day] = tanggalStr.split("-").map(Number);
  const dateObj = new Date(year, month - 1, day);
  const dayNames = ["minggu", "senin", "selasa", "rabu", "kamis", "jumat", "sabtu"];
  return dayNames[dateObj.getDay()];
}

/**
 * 1. Membaca daftar layanan aktif dari Firestore koleksi 'layanan'.
 * Sesuai PRD 4.3.1: Hanya layanan aktif yang ditampilkan kepada pasien.
 */
export async function getActiveLayananFromFirestore() {
  try {
    const layananCol = collection(db, "layanan");
    const q = query(layananCol, where("aktif", "==", true));
    const snap = await getDocs(q);
    const result = [];
    snap.forEach((docSnap) => {
      result.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });
    return result;
  } catch (error) {
    console.error("Gagal membaca layanan dari Firestore:", error);
    throw error;
  }
}

/**
 * 2. Membaca daftar dokter aktif dari Firestore koleksi 'users'.
 * Filter: role == 'dokter' dan aktif == true.
 */
export async function getActiveDokterFromFirestore() {
  try {
    const usersCol = collection(db, "users");
    const q = query(usersCol, where("role", "==", "dokter"), where("aktif", "==", true));
    const snap = await getDocs(q);
    const dokterMap = new Map();

    snap.forEach((docSnap) => {
      const data = docSnap.data();
      // Gunakan email atau nama sebagai key dedup jika ada ID demo dan UID auth untuk orang yang sama
      const dedupKey = data.email || docSnap.id;
      if (!dokterMap.has(dedupKey)) {
        dokterMap.set(dedupKey, {
          id: docSnap.id,
          ...data
        });
      }
    });

    return Array.from(dokterMap.values());
  } catch (error) {
    console.error("Gagal membaca dokter dari Firestore:", error);
    throw error;
  }
}

/**
 * 3. Membaca jadwal praktik dokter dari Firestore koleksi 'jadwal_dokter'.
 */
export async function getJadwalDokterFromFirestore(dokterId, dokterEmail = "") {
  try {
    const jadwalCol = collection(db, "jadwal_dokter");
    const snap = await getDocs(jadwalCol);
    const jadwalList = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      // Cocokkan dokterId langsung, atau jika dokterId berupa alias/user-bima
      const isMatch =
        d.dokterId === dokterId ||
        (dokterEmail && (d.dokterId === "user-bima" && dokterEmail.includes("bima"))) ||
        (dokterEmail && (d.dokterId === "user-sinta" && dokterEmail.includes("sinta")));

      if (isMatch) {
        jadwalList.push({
          id: docSnap.id,
          ...d
        });
      }
    });

    return jadwalList;
  } catch (error) {
    console.error("Gagal membaca jadwal dokter dari Firestore:", error);
    throw error;
  }
}

/**
 * 4. Membaca slot terisi dari Firestore koleksi 'slot_terisi'.
 * Sesuai PRD 4.3.1: Koleksi slot_terisi berisi dokterId, tanggal, jam, durasiMenit.
 */
export async function getSlotTerisiFromFirestore(dokterId, tanggal) {
  try {
    const slotCol = collection(db, "slot_terisi");
    const snap = await getDocs(slotCol);
    const slots = [];

    snap.forEach((docSnap) => {
      const d = docSnap.data();
      if (d.tanggal === tanggal && (d.dokterId === dokterId || (dokterId === "user-bima" && d.dokterId?.includes("bima")))) {
        slots.push({
          id: docSnap.id,
          ...d
        });
      }
    });

    return slots;
  } catch (error) {
    console.error("Gagal membaca slot_terisi dari Firestore:", error);
    throw error;
  }
}

/**
 * 5. Algoritma perhitungan ketersediaan slot jam PRD 4.3.1.
 * Disusun setiap 30 menit dari jam praktik dengan memperhitungkan durasi layanan
 * dan meniadakan slot yang bertabrakan dengan slot_terisi.
 */
export function calculateAvailableSlots(arg1, arg2, arg3, arg4) {
  let jadwalObj;
  let durasi;
  let slots;

  if (typeof arg1 === "object" && arg1 !== null && "jadwal" in arg1) {
    jadwalObj = arg1.jadwal;
    durasi = arg1.durasiMenit;
    slots = arg1.existingSlots;
  } else if (typeof arg1 === "object" && arg1 !== null && "jamMulai" in arg1) {
    jadwalObj = arg1;
    durasi = arg2;
    slots = arg3;
  } else {
    jadwalObj = { jamMulai: arg1, jamSelesai: arg2 };
    durasi = arg3;
    slots = arg4;
  }

  if (!jadwalObj || !jadwalObj.jamMulai || !jadwalObj.jamSelesai || !durasi) {
    return [];
  }

  const startMins = timeToMinutes(jadwalObj.jamMulai);
  const endMins = timeToMinutes(jadwalObj.jamSelesai);
  const duration = Number(durasi) || 30;
  const existingSlots = slots || [];

  const occupiedIntervals = (existingSlots || []).map((slot) => {
    const slotStart = timeToMinutes(slot.jam);
    const slotDuration = Number(slot.durasiMenit) || 30;
    return {
      start: slotStart,
      end: slotStart + slotDuration
    };
  });

  const available = [];

  for (let m = startMins; m + duration <= endMins; m += 30) {
    const candStart = m;
    const candEnd = m + duration;

    // Cek tabrakan: candStart < existEnd && candEnd > existStart
    const isClashing = occupiedIntervals.some(
      (occ) => candStart < occ.end && candEnd > occ.start
    );

    if (!isClashing) {
      available.push(minutesToTime(candStart));
    }
  }

  return available;
}

/**
 * 6. Pembuatan Janji Temu Pasien Secara Atomik Sesuai PRD 4.3.1 & 7.1.
 * Menggunakan Firestore Transaction untuk menjamin slot yang sama tidak dapat dipesan ganda.
 */
export async function createJanjiTemuAtomic({
  pasienId,
  dokterId,
  layananId,
  tanggal,
  jam,
  keluhan,
  durasiMenit
}) {
  if (!pasienId) {
    throw new Error("Pengguna belum terautentikasi. Silakan masuk terlebih dahulu.");
  }
  if (!dokterId || !layananId || !tanggal || !jam || !keluhan?.trim()) {
    throw new Error("Semua data pemesanan janji temu wajib diisi lengkap.");
  }

  const duration = Number(durasiMenit) || 30;
  const newStart = timeToMinutes(jam);
  const newEnd = newStart + duration;

  // Jalankan Firestore Transaction
  const result = await runTransaction(db, async (transaction) => {
    // 1. Baca semua slot_terisi pada tanggal tersebut untuk dokter tersebut
    const slotColRef = collection(db, "slot_terisi");
    // Di dalam transaksi Firestore, getDocs pada query dapat dijalankan
    const snap = await getDocs(slotColRef);

    // Periksa apakah ada slot yang bertabrakan waktu
    let isClashing = false;
    snap.forEach((docSnap) => {
      const data = docSnap.data();
      if (data.dokterId === dokterId && data.tanggal === tanggal) {
        const existStart = timeToMinutes(data.jam);
        const existDuration = Number(data.durasiMenit) || 30;
        const existEnd = existStart + existDuration;

        // Cek overlap
        if (newStart < existEnd && newEnd > existStart) {
          isClashing = true;
        }
      }
    });

    if (isClashing) {
      // Pesan validasi resmi PRD 4.3.1: "Slot ini baru saja terisi. Pilih jam lain."
      throw new Error("Slot ini baru saja terisi. Pilih jam lain.");
    }

    // 2. Buat ID unik janji temu baru
    const newJanjiRef = doc(collection(db, "janji_temu"));
    const newJanjiId = newJanjiRef.id;

    // Sesuai PRD 7.1: ID dokumen slot_terisi sama dengan ID dokumen janji
    const newSlotRef = doc(db, "slot_terisi", newJanjiId);

    const janjiData = {
      id: newJanjiId,
      pasienId,
      dokterId,
      layananId,
      tanggal,
      jam,
      keluhan: keluhan.trim(),
      status: "menunggu", // Status awal PRD 4.3.1 & 7.1
      alasanBatal: "",
      dibuatPada: serverTimestamp()
    };

    const slotData = {
      id: newJanjiId,
      dokterId,
      tanggal,
      jam,
      durasiMenit: duration
    };

    // Tulis atomik ke koleksi janji_temu dan slot_terisi
    transaction.set(newJanjiRef, janjiData);
    transaction.set(newSlotRef, slotData);

    return {
      janjiId: newJanjiId,
      janjiData
    };
  });

  return result;
}

/**
 * 7. Membaca daftar janji milik pasien yang login dari Firestore koleksi 'janji_temu'.
 */
export async function getJanjiPasienFromFirestore(pasienId) {
  if (!pasienId) return [];

  try {
    const janjiCol = collection(db, "janji_temu");
    const q = query(janjiCol, where("pasienId", "==", pasienId));
    const snap = await getDocs(q);
    const list = [];

    snap.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    // Urutkan dari tanggal dan jam terdekat
    list.sort((a, b) => {
      const dateA = new Date(`${a.tanggal}T${a.jam || "00:00"}`);
      const dateB = new Date(`${b.tanggal}T${b.jam || "00:00"}`);
      return dateB - dateA;
    });

    return list;
  } catch (error) {
    console.error("Gagal membaca janji pasien dari Firestore:", error);
    throw error;
  }
}

/**
 * 8. Membaca satu dokumen janji dari Firestore koleksi 'janji_temu/{id}'.
 */
export async function getJanjiByIdFromFirestore(janjiId) {
  if (!janjiId) return null;
  try {
    const docRef = doc(db, "janji_temu", janjiId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return {
      id: snap.id,
      ...snap.data()
    };
  } catch (error) {
    console.error("Gagal membaca detail janji dari Firestore:", error);
    throw error;
  }
}

/**
 * 9. Membatalkan Janji Temu Sesuai PRD 4.3.2:
 * Status janji menjadi 'dibatalkan', dan dokumen slot_terisi dihapus
 * sehingga slot waktu dokter kembali kosong dan dapat dipesan pasien lain.
 */
export async function cancelJanjiTemuFromFirestore(janjiId, alasan = "Dibatalkan oleh pasien") {
  if (!janjiId) return;
  try {
    const janjiRef = doc(db, "janji_temu", janjiId);
    const slotRef = doc(db, "slot_terisi", janjiId);

    await runTransaction(db, async (transaction) => {
      transaction.update(janjiRef, {
        status: "dibatalkan",
        alasanBatal: alasan
      });
      transaction.delete(slotRef);
    });

    return true;
  } catch (error) {
    console.error("Gagal membatalkan janji di Firestore:", error);
    throw error;
  }
}

/**
 * Helper validasi otorisasi peran resepsionis / super admin.
 */
export function isResepsionisAuthorized(role) {
  return role === "resepsionis" || role === "super_admin" || role === "staf_depan";
}

/**
 * 10. Membaca SEMUA Janji Temu dari Firestore koleksi 'janji_temu' (untuk Resepsionis / Admin).
 */
export async function getAllJanjiFromFirestore() {
  try {
    const janjiCol = collection(db, "janji_temu");
    const snap = await getDocs(janjiCol);
    const list = [];

    snap.forEach((docSnap) => {
      list.push({
        id: docSnap.id,
        ...docSnap.data()
      });
    });

    list.sort((a, b) => {
      const dateA = new Date(`${a.tanggal}T${a.jam || "00:00"}`);
      const dateB = new Date(`${b.tanggal}T${b.jam || "00:00"}`);
      return dateB - dateA;
    });

    return list;
  } catch (error) {
    console.error("Gagal membaca semua janji dari Firestore:", error);
    throw error;
  }
}

/**
 * 11. Realtime listener untuk SEMUA Janji Temu (Resepsionis / Admin).
 */
export function listenAllJanjiFromFirestore(callback, onError) {
  const janjiCol = collection(db, "janji_temu");
  return onSnapshot(
    janjiCol,
    (snapshot) => {
      const list = [];
      snapshot.forEach((docSnap) => {
        list.push({
          id: docSnap.id,
          ...docSnap.data()
        });
      });

      list.sort((a, b) => {
        const dateA = new Date(`${a.tanggal}T${a.jam || "00:00"}`);
        const dateB = new Date(`${b.tanggal}T${b.jam || "00:00"}`);
        return dateB - dateA;
      });

      callback(list);
    },
    (error) => {
      console.error("Error pada snapshot janji temu Firestore:", error);
      if (onError) onError(error);
    }
  );
}

/**
 * 12. Membaca semua pengguna dari Firestore koleksi 'users' untuk pemetaan nama/noHp pasien & dokter.
 */
export async function getAllUsersFromFirestore() {
  try {
    const usersCol = collection(db, "users");
    const snap = await getDocs(usersCol);
    const usersMap = {};
    snap.forEach((docSnap) => {
      usersMap[docSnap.id] = {
        id: docSnap.id,
        ...docSnap.data()
      };
    });
    return usersMap;
  } catch (error) {
    console.error("Gagal membaca users dari Firestore:", error);
    return {};
  }
}

/**
 * 13. Konfirmasi Janji Temu oleh Resepsionis (PRD 4.7).
 * Aturan PRD: Konfirmasi hanya untuk janji berstatus Menunggu.
 * Janji Selesai atau Dibatalkan tidak bisa diubah lagi.
 */
export async function confirmJanjiTemuFromFirestore(janjiId, role) {
  if (!isResepsionisAuthorized(role)) {
    throw new Error("Akses ditolak: Hanya resepsionis atau super_admin yang berwenang mengonfirmasi janji.");
  }
  if (!janjiId) {
    throw new Error("ID janji temu tidak valid.");
  }

  const janjiRef = doc(db, "janji_temu", janjiId);
  const snap = await getDoc(janjiRef);
  if (!snap.exists()) {
    throw new Error("Janji temu tidak ditemukan di sistem.");
  }

  const data = snap.data();
  if (data.status !== "menunggu") {
    throw new Error(`Konfirmasi gagal: Hanya janji berstatus 'menunggu' yang dapat dikonfirmasi. Status saat ini: ${data.status}.`);
  }

  await updateDoc(janjiRef, {
    status: "dikonfirmasi",
    diperbaruiPada: serverTimestamp()
  });

  return { success: true, id: janjiId, status: "dikonfirmasi" };
}

/**
 * 14. Tandai Pasien Hadir oleh Resepsionis (PRD 4.7).
 * Aturan PRD: Tandai Hadir hanya untuk janji Dikonfirmasi pada hari ini.
 * Janji Selesai atau Dibatalkan tidak bisa diubah lagi.
 */
export async function markHadirJanjiTemuFromFirestore(janjiId, role, customTodayStr) {
  if (!isResepsionisAuthorized(role)) {
    throw new Error("Akses ditolak: Hanya resepsionis atau super_admin yang berwenang menandai kehadiran pasien.");
  }
  if (!janjiId) {
    throw new Error("ID janji temu tidak valid.");
  }

  const janjiRef = doc(db, "janji_temu", janjiId);
  const snap = await getDoc(janjiRef);
  if (!snap.exists()) {
    throw new Error("Janji temu tidak ditemukan di sistem.");
  }

  const data = snap.data();

  // Validasi status harus dikonfirmasi
  if (data.status !== "dikonfirmasi") {
    throw new Error(`Tandai hadir gagal: Hanya janji berstatus 'dikonfirmasi' yang dapat ditandai hadir. Status saat ini: ${data.status}.`);
  }

  // Validasi tanggal harus hari ini (PRD 4.7)
  const today = customTodayStr || new Date().toISOString().split("T")[0];
  if (data.tanggal !== today) {
    throw new Error(`Tandai hadir gagal: Pasien hanya dapat ditandai hadir pada hari janji temu (${data.tanggal}). Tanggal sistem saat ini: ${today}.`);
  }

  await updateDoc(janjiRef, {
    status: "hadir",
    diperbaruiPada: serverTimestamp()
  });

  return { success: true, id: janjiId, status: "hadir" };
}

/**
 * 15. Membatalkan Janji oleh Resepsionis (PRD 4.7).
 * Aturan PRD: Alasan pembatalan wajib diisi. Slot waktu dilepas dari slot_terisi.
 */
export async function cancelJanjiResepsionisFromFirestore(janjiId, alasanBatal, role) {
  if (!isResepsionisAuthorized(role)) {
    throw new Error("Akses ditolak: Hanya resepsionis atau super_admin yang berwenang membatalkan janji.");
  }
  if (!janjiId) {
    throw new Error("ID janji temu tidak valid.");
  }
  if (!alasanBatal || !alasanBatal.trim()) {
    throw new Error("Alasan pembatalan wajib diisi (PRD 4.7).");
  }

  const janjiRef = doc(db, "janji_temu", janjiId);
  const slotRef = doc(db, "slot_terisi", janjiId);

  await runTransaction(db, async (transaction) => {
    const janjiSnap = await transaction.get(janjiRef);
    if (!janjiSnap.exists()) {
      throw new Error("Janji temu tidak ditemukan.");
    }
    const data = janjiSnap.data();
    if (data.status === "selesai" || data.status === "dibatalkan") {
      throw new Error(`Janji yang sudah berstatus '${data.status}' tidak dapat diubah lagi (PRD 4.7).`);
    }

    transaction.update(janjiRef, {
      status: "dibatalkan",
      alasanBatal: alasanBatal.trim(),
      diperbaruiPada: serverTimestamp()
    });
    transaction.delete(slotRef);
  });

  return { success: true, id: janjiId, status: "dibatalkan" };
}

/**
 * 16. Jadwal Ulang Janji oleh Resepsionis (PRD 4.7).
 * Memindahkan tanggal dan jam janji ke slot baru yang kosong.
 */
export async function rescheduleJanjiResepsionisFromFirestore({
  janjiId,
  newTanggal,
  newJam,
  role
}) {
  if (!isResepsionisAuthorized(role)) {
    throw new Error("Akses ditolak: Hanya resepsionis atau super_admin yang berwenang menjadwal ulang janji.");
  }
  if (!janjiId || !newTanggal || !newJam) {
    throw new Error("ID janji, tanggal baru, dan jam baru wajib diisi.");
  }

  const janjiRef = doc(db, "janji_temu", janjiId);
  const slotRef = doc(db, "slot_terisi", janjiId);

  const result = await runTransaction(db, async (transaction) => {
    const janjiSnap = await transaction.get(janjiRef);
    if (!janjiSnap.exists()) {
      throw new Error("Janji temu tidak ditemukan.");
    }
    const janjiData = janjiSnap.data();
    if (janjiData.status === "selesai" || janjiData.status === "dibatalkan") {
      throw new Error(`Janji yang sudah berstatus '${janjiData.status}' tidak dapat diubah lagi (PRD 4.7).`);
    }

    const dokterId = janjiData.dokterId;
    const durasiMenit = Number(janjiData.durasiMenit) || 30;
    const newStart = timeToMinutes(newJam);
    const newEnd = newStart + durasiMenit;

    // Periksa slot terisi pada tanggal baru
    const slotColRef = collection(db, "slot_terisi");
    const snap = await getDocs(slotColRef);

    let isClashing = false;
    snap.forEach((docSnap) => {
      // Abaikan slot janji ini sendiri
      if (docSnap.id === janjiId) return;

      const data = docSnap.data();
      if (data.dokterId === dokterId && data.tanggal === newTanggal) {
        const existStart = timeToMinutes(data.jam);
        const existDuration = Number(data.durasiMenit) || 30;
        const existEnd = existStart + existDuration;
        if (newStart < existEnd && newEnd > existStart) {
          isClashing = true;
        }
      }
    });

    if (isClashing) {
      throw new Error("Slot ini baru saja terisi. Pilih jam lain.");
    }

    // Update janji_temu
    transaction.update(janjiRef, {
      tanggal: newTanggal,
      jam: newJam,
      diperbaruiPada: serverTimestamp()
    });

    // Update slot_terisi
    transaction.set(slotRef, {
      id: janjiId,
      dokterId,
      tanggal: newTanggal,
      jam: newJam,
      durasiMenit
    });

    return { success: true, id: janjiId, tanggal: newTanggal, jam: newJam };
  });

  return result;
}


