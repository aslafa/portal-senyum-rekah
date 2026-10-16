import { initializeApp } from "firebase/app";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBkLawmriAKN835HIqvQAtJ7gvgE33xqRY",
  authDomain: "portal-senyum-rekah-f0180.firebaseapp.com",
  projectId: "portal-senyum-rekah-f0180",
  storageBucket: "portal-senyum-rekah-f0180.firebasestorage.app",
  messagingSenderId: "1030427611136",
  appId: "1:1030427611136:web:deccf978e48e1583e988e5"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

const ACCOUNTS = [
  {
    email: "andi@example.com",
    password: "password123",
    nama: "Andi Saputra",
    noHp: "081234567891",
    role: "pasien"
  },
  {
    email: "laras@senyumrekah.id",
    password: "password123",
    nama: "Laras Prameswari",
    noHp: "081234567893",
    role: "resepsionis"
  },
  {
    email: "bima@senyumrekah.id",
    password: "password123",
    nama: "drg. Bima Perkasa",
    noHp: "081234567894",
    role: "dokter"
  },
  {
    email: "ratna@senyumrekah.id",
    password: "password123",
    nama: "Bu Ratna (Pemilik Klinik)",
    noHp: "081234567890",
    role: "super_admin"
  }
];

async function setup() {
  console.log("=== Menyiapkan Akun Uji Nyata Firebase Auth & Firestore ===");

  for (const acc of ACCOUNTS) {
    let uid = null;

    // Coba sign in dulu jika sudah ada
    try {
      const signInRes = await signInWithEmailAndPassword(auth, acc.email, acc.password);
      uid = signInRes.user.uid;
      console.log(`[LOGIN OK] ${acc.email} (UID: ${uid})`);
    } catch (signInErr) {
      // Jika belum ada, coba buat akun baru
      try {
        const createRes = await createUserWithEmailAndPassword(auth, acc.email, acc.password);
        uid = createRes.user.uid;
        console.log(`[CREATE OK] ${acc.email} (UID: ${uid})`);
      } catch (createErr) {
        if (createErr.code === "auth/email-already-in-use") {
          // Jika sudah ada tapi password beda, coba dengan 123456
          try {
            const retryRes = await signInWithEmailAndPassword(auth, acc.email, "123456");
            uid = retryRes.user.uid;
            console.log(`[LOGIN 123456 OK] ${acc.email} (UID: ${uid})`);
          } catch (e) {
            console.error(`Gagal login/buat akun untuk ${acc.email}:`, e.message);
          }
        } else {
          console.error(`Gagal membuat akun ${acc.email}:`, createErr.message);
        }
      }
    }

    if (uid) {
      // Buat / perbarui dokumen profil users/{uid} di Firestore dengan peran kanonis yang benar
      const userDocRef = doc(db, "users", uid);
      await setDoc(userDocRef, {
        nama: acc.nama,
        email: acc.email,
        noHp: acc.noHp,
        role: acc.role,
        aktif: true,
        dibuatPada: serverTimestamp()
      }, { merge: true });

      const docSnap = await getDoc(userDocRef);
      console.log(`  -> Profil Firestore users/${uid} tersimpan dengan role: ${docSnap.data().role}`);
    }
  }

  console.log("\nSemua akun uji selesai disiapkan!");
  process.exit(0);
}

setup().catch((e) => {
  console.error("Setup error:", e);
  process.exit(1);
});
