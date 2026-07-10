import { initializeApp, getApp, getApps } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import { getStorage } from "firebase/storage";

const firebaseConfig = {
  apiKey: "AIzaSyDwp3mEUB1tlX0sBD5Wreq1GTmlvvC6Alc",
  authDomain: "akc-oto-kilif.firebaseapp.com",
  projectId: "akc-oto-kilif",
  storageBucket: "akc-oto-kilif.firebasestorage.app",
  messagingSenderId: "308242183206",
  appId: "1:308242183206:web:a83b8d4735b9b2808a62e7",
  measurementId: "G-WHQEYLEVQQ",
};

export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);

export const auth = getAuth(app);
export const db = getFirestore(app);
export const storage = getStorage(app);

export const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
  prompt: "select_account",
});