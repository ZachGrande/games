// Client-side Firebase initialization. Only call these getters from the
// browser — they touch browser Auth and must never run during SSR.
//
// Initialization is lazy (not at module top-level) because the Firestore/Auth
// SDKs use `new Function()` internally, which the Cloudflare Workers runtime
// forbids ("Code generation from strings disallowed"). Deferring init until a
// browser-only call site keeps SSR on the Worker from ever touching that code.
import { type FirebaseApp, getApp, getApps, initializeApp } from "firebase/app";
import { type Auth, getAuth } from "firebase/auth";
import { type Firestore, getFirestore } from "firebase/firestore";

const firebaseConfig = {
  apiKey: "AIzaSyBOer8A4_eitlvChC1ERib_gyutKBCVWCA",
  authDomain: "games-b50c1.firebaseapp.com",
  projectId: "games-b50c1",
  storageBucket: "games-b50c1.firebasestorage.app",
  messagingSenderId: "89757469578",
  appId: "1:89757469578:web:ee0223e1a58d02e5fc5673",
  measurementId: "G-PGKLBLB02Q",
};

let appInstance: FirebaseApp | null = null;
let dbInstance: Firestore | null = null;
let authInstance: Auth | null = null;

/** Lazily create (or reuse) the Firebase app. Browser-only. */
export function getFirebaseApp(): FirebaseApp {
  if (!appInstance) {
    appInstance = getApps().length ? getApp() : initializeApp(firebaseConfig);
  }
  return appInstance;
}

/** Lazily create (or reuse) the Firestore instance. Browser-only. */
export function getDb(): Firestore {
  if (!dbInstance) {
    dbInstance = getFirestore(getFirebaseApp());
  }
  return dbInstance;
}

/** Lazily create (or reuse) the Auth instance. Browser-only. */
export function getFirebaseAuth(): Auth {
  if (!authInstance) {
    authInstance = getAuth(getFirebaseApp());
  }
  return authInstance;
}
