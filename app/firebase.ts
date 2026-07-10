// Client-side Firebase initialization. Only import this from client components
// ("use client") or other client-only modules — it touches browser Auth.
import { getApp, getApps, initializeApp } from "firebase/app";
import { getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOer8A4_eitlvChC1ERib_gyutKBCVWCA",
  authDomain: "games-b50c1.firebaseapp.com",
  projectId: "games-b50c1",
  storageBucket: "games-b50c1.firebasestorage.app",
  messagingSenderId: "89757469578",
  appId: "1:89757469578:web:ee0223e1a58d02e5fc5673",
  measurementId: "G-PGKLBLB02Q",
};

// Reuse the existing app during Fast Refresh / repeated imports.
export const app = getApps().length ? getApp() : initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
