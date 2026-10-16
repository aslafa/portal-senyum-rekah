import { initializeApp } from "firebase/app";
import { getFirestore, collection, getDocs } from "firebase/firestore";

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

const collections = [
  "users",
  "layanan",
  "jadwal_dokter",
  "janji_temu",
  "catatan_perawatan",
  "slot_terisi"
];

async function verify() {
  console.log("Verifikasi koleksi di Cloud Firestore...");
  for (const colName of collections) {
    const snap = await getDocs(collection(db, colName));
    console.log(`- Koleksi '${colName}': ${snap.size} dokumen tersimpan.`);
  }
  process.exit(0);
}

verify().catch((e) => {
  console.error("Error verifikasi:", e);
  process.exit(1);
});
