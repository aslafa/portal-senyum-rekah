import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, deleteDoc, serverTimestamp } from "firebase/firestore";

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

// Mock sync function mirroring lib/auth.js
async function syncUserDocument(user, additionalData = {}) {
  if (!user || !user.uid) return null;

  const userDocRef = doc(db, "users", user.uid);
  const userSnapshot = await getDoc(userDocRef);

  if (userSnapshot.exists()) {
    return {
      id: user.uid,
      ...userSnapshot.data(),
      isNew: false
    };
  }

  const newUserData = {
    nama: additionalData.nama?.trim() || user.displayName || user.email?.split("@")[0] || "Pasien",
    email: user.email || "",
    noHp: additionalData.noHp?.trim() || user.phoneNumber || "",
    role: "pasien", // Peran awal sesuai PRD 2.2
    aktif: true,
    dibuatPada: serverTimestamp()
  };

  delete newUserData.password;
  delete newUserData.kataSandi;

  await setDoc(userDocRef, newUserData);

  return {
    id: user.uid,
    ...newUserData,
    isNew: true
  };
}

async function runTest() {
  console.log("=== Testing syncUserDocument ===");

  const testUid = "test-uid-" + Date.now();
  const testUser = {
    uid: testUid,
    email: "test.pasien@example.com",
    displayName: "Pasien Uji Coba"
  };

  // 1. First login (document does not exist)
  console.log("1. Pengguna masuk pertama kali...");
  const firstResult = await syncUserDocument(testUser, {
    noHp: "081234567899",
    password: "secret_should_not_be_saved"
  });

  console.log("Hasil login 1:", firstResult);
  if (!firstResult.isNew) throw new Error("Harusnya dokumen baru ditandai isNew: true");
  if (firstResult.role !== "pasien") throw new Error("Peran awal harus 'pasien'");
  if (firstResult.password || firstResult.kataSandi) throw new Error("Kata sandi tidak boleh disimpan!");

  // Verifikasi langsung dari Firestore
  const docSnap = await getDoc(doc(db, "users", testUid));
  const docData = docSnap.data();
  console.log("Dokumen tersimpan di Firestore:", docData);

  if (docData.nama !== "Pasien Uji Coba") throw new Error("Nama tidak cocok");
  if (docData.role !== "pasien") throw new Error("Role bukan pasien");
  if (docData.aktif !== true) throw new Error("Field aktif harus true");
  if (!docData.dibuatPada) throw new Error("Field dibuatPada harus ada");
  if (docData.password) throw new Error("Kata sandi tersimpan!");

  // 2. Simulasi modifikasi role oleh admin (misal diangkat jadi dokter)
  console.log("2. Simulasi peran diubah admin menjadi 'dokter'...");
  await setDoc(doc(db, "users", testUid), { ...docData, role: "dokter" });

  // 3. Second login (document already exists) -> BILA SUDAH ADA, JANGAN DIUBAH!
  console.log("3. Pengguna masuk kedua kali...");
  const secondResult = await syncUserDocument(testUser, {
    nama: "Nama Berubah",
    noHp: "089999999999"
  });

  console.log("Hasil login 2:", secondResult);
  if (secondResult.isNew !== false) throw new Error("Dokumen lama tidak boleh dianggap isNew");
  if (secondResult.role !== "dokter") throw new Error("Role 'dokter' yang sudah ada tidak boleh ditimpa kembali jadi pasien!");
  if (secondResult.nama === "Nama Berubah") throw new Error("Nama tidak boleh diubah saat login bila dokumen sudah ada!");

  // 4. Bersihkan data uji coba
  console.log("4. Membersihkan dokumen uji coba...");
  await deleteDoc(doc(db, "users", testUid));

  console.log("✔ SEMUA PENGUJIAN SINKRONISASI PENGGUNA BERHASIL!");
}

runTest().catch((err) => {
  console.error("Test failed:", err);
  process.exit(1);
});
