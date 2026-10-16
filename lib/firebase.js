import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || "portal-senyum-rekah-f0180.firebaseapp.com",
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || "portal-senyum-rekah-f0180",
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || "portal-senyum-rekah-f0180.firebasestorage.app",
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID
};

// Initialize Firebase with singleton pattern
const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
// getAuth throws auth/invalid-api-key when the key is missing, which would crash
// static prerendering. Skip it so the build can finish; set the env vars to enable auth.
if (!firebaseConfig.apiKey) {
  console.warn("NEXT_PUBLIC_FIREBASE_API_KEY is not set; Firebase Auth is disabled.");
}
const auth = firebaseConfig.apiKey ? getAuth(app) : null;
const db = getFirestore(app);
const googleProvider = new GoogleAuthProvider();

export { app, auth, db, googleProvider, firebaseConfig };
export default app;
