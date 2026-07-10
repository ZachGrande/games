// Firestore-backed leaderboard ("online" mode). Implements the same
// LeaderboardProvider contract as OfflineLeaderboard, so callers are unchanged.
//
// Any Firestore/Auth error degrades gracefully to the local offline store so a
// network hiccup (or Anonymous auth not yet enabled) never breaks the game.
import { signInAnonymously } from "firebase/auth";
import {
  type Timestamp,
  addDoc,
  collection,
  getDocs,
  limit as fbLimit,
  orderBy,
  query,
  serverTimestamp,
} from "firebase/firestore";
import { auth, db } from "../firebase";
import {
  OfflineLeaderboard,
  type LeaderboardProvider,
  type ScoreEntry,
} from "./leaderboardStore";

const COLLECTION = "bfScores";
const DEFAULT_LIMIT = 10;

interface ScoreDoc {
  name: string;
  score: number;
  uid: string;
  createdAt: Timestamp | null;
}

export class FirebaseLeaderboard implements LeaderboardProvider {
  readonly mode = "online" as const;
  private readonly fallback = new OfflineLeaderboard();

  async getScores(limit = DEFAULT_LIMIT): Promise<ScoreEntry[]> {
    try {
      const q = query(
        collection(db, COLLECTION),
        orderBy("score", "desc"),
        fbLimit(limit),
      );
      const snap = await getDocs(q);
      return snap.docs.map((d) => {
        const data = d.data() as ScoreDoc;
        return {
          name: data.name,
          score: data.score,
          ts: data.createdAt?.toMillis() ?? 0,
        };
      });
    } catch {
      return this.fallback.getScores(limit);
    }
  }

  async addScore(entry: ScoreEntry, limit = DEFAULT_LIMIT): Promise<ScoreEntry[]> {
    try {
      const user = auth.currentUser ?? (await signInAnonymously(auth)).user;
      await addDoc(collection(db, COLLECTION), {
        name: entry.name,
        score: entry.score,
        uid: user.uid,
        createdAt: serverTimestamp(),
      });
      return this.getScores(limit);
    } catch {
      return this.fallback.addScore(entry, limit);
    }
  }
}
