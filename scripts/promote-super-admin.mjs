import fs from "fs";
import path from "path";
import os from "os";
import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, updateDoc } from "firebase/firestore";

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

async function promoteOwner(targetEmail = "ratna@senyumrekah.id") {
  const configPath = path.join(os.homedir(), ".config", "configstore", "firebase-tools.json");
  const config = JSON.parse(fs.readFileSync(configPath, "utf-8"));
  let accessToken = config.tokens?.access_token;

  if (config.tokens?.refresh_token) {
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        client_id: "563584335869-fgrhgmd47bqnekij5i8b5pr03ho859e1.apps.googleusercontent.com",
        grant_type: "refresh_token",
        refresh_token: config.tokens.refresh_token
      })
    });
    const tokenData = await tokenRes.json();
    if (tokenData.access_token) accessToken = tokenData.access_token;
  }

  const projectId = "portal-senyum-rekah-f0180";

  // 1. Cari pengguna di Firebase Authentication dengan targetEmail
  const lookupRes = await fetch(`https://identitytoolkit.googleapis.com/v1/projects/${projectId}/accounts:lookup`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ email: [targetEmail] })
  });

  const lookupData = await lookupRes.json();
  const users = lookupData.users || [];

  if (users.length === 0) {
    console.log(`Pengguna dengan email ${targetEmail} belum ditemukan di Firebase Authentication.`);
    return null;
  }

  const authUser = users[0];
  const uid = authUser.localId;
  console.log(`Ditemukan pengguna di Firebase Authentication:`);
  console.log(`- Email: ${authUser.email}`);
  console.log(`- UID: ${uid}`);

  // 2. Ubah field role di dokumen users/{uid} menjadi "super_admin" tanpa mengubah field lain
  const userDocRef = doc(db, "users", uid);
  const docSnap = await getDoc(userDocRef);

  if (!docSnap.exists()) {
    console.log(`Dokumen users/${uid} belum ada di Firestore.`);
    return null;
  }

  console.log(`Isi dokumen sebelum diubah:`, docSnap.data());

  // Update HANYA field role menjadi "super_admin"
  await updateDoc(userDocRef, {
    role: "super_admin"
  });

  // Ambil dokumen terbaru setelah diubah
  const updatedSnap = await getDoc(userDocRef);
  console.log(`\nIsi dokumen users/${uid} setelah diubah:`);
  console.log(JSON.stringify({ id: uid, ...updatedSnap.data() }, null, 2));

  return { uid, data: updatedSnap.data() };
}

const emailArg = process.argv[2] || "ratna@senyumrekah.id";
promoteOwner(emailArg).catch(console.error);
