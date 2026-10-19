// Client-side Firebase initialization. Only import this from client components
// ("use client") or other client-only modules — it touches browser Auth.
import { getApp, getApps, initializeApp } from "firebase/app";
import { connectAuthEmulator, getAuth } from "firebase/auth";
import { connectDatabaseEmulator, getDatabase } from "firebase/database";
import { connectFirestoreEmulator, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOer8A4_eitlvChC1ERib_gyutKBCVWCA",
  authDomain: "games-b50c1.firebaseapp.com",
  databaseURL: "https://games-b50c1-default-rtdb.firebaseio.com",
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
export const rtdb = getDatabase(app);

// Local development against the Firebase emulators: set
// NEXT_PUBLIC_FIREBASE_EMULATORS=true (see doc/Jeopardy.md).
const globalForEmulators = globalThis as { __firebaseEmulators?: boolean };
if (
  process.env.NEXT_PUBLIC_FIREBASE_EMULATORS === "true" &&
  typeof window !== "undefined" &&
  !globalForEmulators.__firebaseEmulators
) {
  globalForEmulators.__firebaseEmulators = true;
  connectAuthEmulator(auth, "http://127.0.0.1:9099", { disableWarnings: true });
  connectDatabaseEmulator(rtdb, "127.0.0.1", 9000);
  connectFirestoreEmulator(db, "127.0.0.1", 8080);
}
