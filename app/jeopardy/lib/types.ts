export type RoundKey = "single" | "double";

export const CATEGORY_COUNT = 6;
export const CLUE_COUNT = 5;
export const FINAL_SECONDS = 30;

export function clueValue(round: RoundKey, row: number): number {
  return (row + 1) * (round === "double" ? 400 : 200);
}

export function roundMaxValue(round: RoundKey): number {
  return clueValue(round, CLUE_COUNT - 1);
}

export const ROUND_LABEL: Record<RoundKey, string> = {
  single: "Jeopardy!",
  double: "Double Jeopardy!",
};

// ---------- Saved boards (Firestore: jeopardyBoards/{id}) ----------

export interface ClueData {
  clue: string;
  answer: string;
}

export interface CategoryData {
  name: string;
  clues: ClueData[];
}

export interface RoundData {
  categories: CategoryData[];
}

export interface FinalData {
  category: string;
  clue: string;
  answer: string;
}

export interface BoardContent {
  title: string;
  rounds: Record<RoundKey, RoundData>;
  final: FinalData;
}

export interface SavedBoard extends BoardContent {
  id: string;
  ownerUid: string;
  updatedAt: number;
}

// ---------- Live game (RTDB) ----------

export type GameStatus = "lobby" | "playing" | "final" | "ended";

export type CluePhase = "ddWager" | "reading" | "open" | "revealed";

export type Judgement = "correct" | "wrong";

export interface LiveCell {
  value: number;
  used: boolean;
}

export interface LiveBoard {
  categories: string[];
  cells: Record<string, LiveCell>;
}

export interface CurrentClue {
  cell: string;
  category: string;
  value: number;
  phase: CluePhase;
  clue?: string;
  isDailyDouble?: boolean;
  ddPlayer?: string;
  wager?: number;
  judged?: Record<string, Judgement>;
  answer?: string;
}

export interface Player {
  name: string;
  score: number;
  joinedAt: number;
  connected?: boolean;
}

export type FinalPhase = "wager" | "answer" | "reveal" | "done";

export interface FinalReveal {
  answer: string;
  wager: number;
  correct?: boolean;
}

export interface LiveFinal {
  category: string;
  phase: FinalPhase;
  eligible?: Record<string, true>;
  clue?: string;
  deadline?: number;
  revealed?: Record<string, FinalReveal>;
  answer?: string;
}

export interface Game {
  hostUid: string;
  title: string;
  createdAt: number;
  status: GameStatus;
  round: RoundKey;
  board?: LiveBoard;
  controlUid?: string;
  current?: CurrentClue;
  buzzes?: Record<string, number>;
  players?: Record<string, Player>;
  kicked?: Record<string, true>;
  final?: LiveFinal;
}

export interface PrivateCell {
  clue: string;
  answer: string;
  dd?: boolean;
}

export interface PrivateRound {
  categories: string[];
  cells: Record<string, PrivateCell>;
}

/** Host-only snapshot (RTDB: gamePrivate/{code}). */
export interface GamePrivate {
  rounds: Partial<Record<RoundKey, PrivateRound>>;
  final?: FinalData;
}

/** Final Jeopardy entry (RTDB: gameSecrets/{code}/{uid}). */
export interface PlayerSecret {
  wager?: number;
  answer?: string;
}

/** Whole seconds left on the Final timer, clamped to [0, FINAL_SECONDS]. */
export function secondsUntil(deadline: number | undefined, serverNow: number): number {
  if (!deadline) return 0;
  return Math.min(FINAL_SECONDS, Math.max(0, Math.ceil((deadline - serverNow) / 1000)));
}

export function cellKey(category: number, row: number): string {
  return `${category}_${row}`;
}
