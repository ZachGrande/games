// Leaderboard data layer for Bigfoot Runner.
//
// Storage is abstracted behind an async `LeaderboardProvider` so the current
// offline (localStorage) implementation can be swapped for an online provider
// (e.g. Firebase) later without touching any UI code. All methods return
// Promises even though the offline store is synchronous, so the online swap is
// a drop-in.

export interface ScoreEntry {
  name: string;
  score: number;
  ts: number;
}

export type LeaderboardMode = "offline" | "online";

export interface LeaderboardProvider {
  readonly mode: LeaderboardMode;
  /** Return the top scores, sorted highest-first. */
  getScores(limit?: number): Promise<ScoreEntry[]>;
  /** Add a score and return the updated top scores. */
  addScore(entry: ScoreEntry, limit?: number): Promise<ScoreEntry[]>;
}

const SCORES_KEY = "bigfoot-runner-scores";
const NAME_KEY = "bigfoot-runner-name";

const DEFAULT_LIMIT = 10;
const MAX_KEPT = 50;

function sortAndTrim(scores: ScoreEntry[], limit: number): ScoreEntry[] {
  return [...scores].sort((a, b) => b.score - a.score).slice(0, limit);
}

function readRawScores(): ScoreEntry[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(SCORES_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter(
      (s): s is ScoreEntry =>
        s != null &&
        typeof s.name === "string" &&
        typeof s.score === "number" &&
        typeof s.ts === "number",
    );
  } catch {
    return [];
  }
}

function writeRawScores(scores: ScoreEntry[]): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(SCORES_KEY, JSON.stringify(scores));
  } catch {
    // ignore storage errors (private mode, quota, etc.)
  }
}

/** localStorage-backed leaderboard. */
export class OfflineLeaderboard implements LeaderboardProvider {
  readonly mode = "offline" as const;

  async getScores(limit = DEFAULT_LIMIT): Promise<ScoreEntry[]> {
    return sortAndTrim(readRawScores(), limit);
  }

  async addScore(entry: ScoreEntry, limit = DEFAULT_LIMIT): Promise<ScoreEntry[]> {
    const next = sortAndTrim([...readRawScores(), entry], MAX_KEPT);
    writeRawScores(next);
    return next.slice(0, limit);
  }
}

/** Remembered player name so returning players don't retype it. */
export function getRememberedName(): string {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(NAME_KEY) ?? "";
  } catch {
    return "";
  }
}

export function rememberName(name: string): void {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(NAME_KEY, name);
  } catch {
    // ignore storage errors
  }
}
