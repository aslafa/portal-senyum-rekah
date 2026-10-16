import { auth, db, googleProvider } from "./firebase";
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  onAuthStateChanged,
  updateProfile
} from "firebase/auth";
import {
  doc,
  getDoc,
  setDoc,
  serverTimestamp
} from "firebase/firestore";

/**
 * Sesuai PRD Bab 2.2 & 7.1:
 * Setelah pengguna berhasil masuk dengan cara apa pun:
 * 1. Cek dokumen users/{uid}.
 * 2. Bila belum ada, buat dokumen dengan field sesuai PRD 7.1 dan role "pasien" (peran awal).
 * 3. Bila sudah ada, jangan diubah.
 * 4. Jangan simpan kata sandi di dokumen ini.
 *
 * @param {import("firebase/auth").User} user Objek User dari Firebase Auth
 * @param {Object} [additionalData={}] Data opsional saat pendaftaran (nama, noHp)
 * @returns {Promise<Object>} Data profil pengguna dari Firestore
 */
export async function syncUserDocument(user, additionalData = {}) {
  if (!user || !user.uid) return null;

  try {
    const userDocRef = doc(db, "users", user.uid);
    const userSnapshot = await getDoc(userDocRef);

    // Bila sudah ada, jangan diubah
    if (userSnapshot.exists()) {
      const existingData = userSnapshot.data();
      return {
        id: user.uid,
        uid: user.uid,
        ...existingData,
        isNew: false
      };
    }

    // Bila belum ada, buat dokumen dengan field sesuai PRD 7.1
    // Field: nama, email, noHp, role, aktif, dibuatPada
    // Peran awal akun baru sesuai PRD Bab 2.2 adalah "pasien"
    const newUserData = {
      nama: additionalData.nama?.trim() || user.displayName || user.email?.split("@")[0] || "Pasien",
      email: user.email || "",
      noHp: additionalData.noHp?.trim() || user.phoneNumber || "",
      role: "pasien", // Peran awal sesuai PRD
      aktif: true,
      dibuatPada: serverTimestamp()
    };

    // Keamanan: pastikan kata sandi TIDAK PERNAH disimpan di Firestore
    delete newUserData.password;
    delete newUserData.kataSandi;
    delete newUserData.pass;

    await setDoc(userDocRef, newUserData);

    return {
      id: user.uid,
      uid: user.uid,
      ...newUserData,
      isNew: true
    };
  } catch (error) {
    console.error("Error memeriksa/membuat dokumen users/{uid}:", error);
    throw error;
  }
}

/**
 * Masuk dengan Email dan Kata Sandi
 */
export async function loginWithEmail(email, password) {
  const userCredential = await signInWithEmailAndPassword(auth, email, password);
  const profile = await syncUserDocument(userCredential.user);
  return { user: userCredential.user, profile };
}

/**
 * Masuk / Daftar dengan Akun Google
 */
export async function loginWithGoogle() {
  const userCredential = await signInWithPopup(auth, googleProvider);
  const profile = await syncUserDocument(userCredential.user);
  return { user: userCredential.user, profile };
}

/**
 * Daftar Akun Pasien Baru dengan Email dan Kata Sandi
 */
export async function registerWithEmail(email, password, nama, noHp) {
  const userCredential = await createUserWithEmailAndPassword(auth, email, password);
  
  if (nama) {
    try {
      await updateProfile(userCredential.user, { displayName: nama });
    } catch (e) {
      console.warn("Gagal memperbarui displayName di Firebase Auth:", e);
    }
  }

  // Cek & buat dokumen users/{uid} di Firestore (tanpa kata sandi)
  const profile = await syncUserDocument(userCredential.user, { nama, noHp });
  return { user: userCredential.user, profile };
}

/**
 * Keluar (Sign Out)
 */
export async function logoutUser() {
  await signOut(auth);
}

/**
 * Listener status autentikasi yang secara otomatis menjalankan pengecekan & pembuatan
 * dokumen users/{uid} untuk metode login apa pun (termasuk refresh halaman / token).
 */
export function onAuthUserChanged(callback) {
  return onAuthStateChanged(auth, async (user) => {
    if (user) {
      try {
        const profile = await syncUserDocument(user);
        callback(user, profile);
      } catch (err) {
        console.error("Error sinkronisasi profil auth:", err);
        callback(user, null);
      }
    } else {
      callback(null, null);
    }
  });
}
