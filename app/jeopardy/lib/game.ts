// Realtime Database actions for live Jeopardy games. The host's client is the
// referee (no Cloud Functions on the Spark plan); database.rules.json limits
// what players can write.
import type { User } from "firebase/auth";
import {
  type DatabaseReference,
  get,
  increment,
  onDisconnect,
  onValue,
  ref,
  serverTimestamp,
  set,
  update,
} from "firebase/database";
import { rtdb } from "../../firebase";
import { randomCode } from "./codes";
import {
  type BoardContent,
  type FinalData,
  type Game,
  type GamePrivate,
  type LiveBoard,
  type LiveCell,
  type PlayerSecret,
  type PrivateCell,
  type PrivateRound,
  type RoundData,
  type RoundKey,
  CATEGORY_COUNT,
  CLUE_COUNT,
  FINAL_SECONDS,
  cellKey,
  clueValue,
} from "./types";

// Codes older than this can be reclaimed (must match database.rules.json).
const STALE_GAME_MS = 12 * 60 * 60 * 1000;
const DAILY_DOUBLES: Record<RoundKey, number> = { single: 1, double: 2 };

const gameRef = (code: string): DatabaseReference => ref(rtdb, `games/${code}`);

function shuffle<T>(items: T[]): T[] {
  for (let i = items.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [items[i], items[j]] = [items[j], items[i]];
  }
  return items;
}

/** Host-only round snapshot with Daily Doubles placed (never in the top row). */
function buildPrivateRound(round: RoundKey, data: RoundData): PrivateRound | null {
  const cells: Record<string, PrivateCell> = {};
  const candidates: string[] = [];
  data.categories.forEach((cat, c) =>
    cat.clues.forEach((clue, r) => {
      if (!clue.clue.trim()) return;
      const key = cellKey(c, r);
      cells[key] = { clue: clue.clue.trim(), answer: clue.answer.trim() };
      if (r > 0) candidates.push(key);
    }),
  );
  if (Object.keys(cells).length === 0) return null;

  const usedCategories = new Set<string>();
  let placed = 0;
  for (const key of shuffle(candidates)) {
    if (placed >= DAILY_DOUBLES[round]) break;
    const category = key.split("_")[0];
    if (usedCategories.has(category)) continue;
    usedCategories.add(category);
    cells[key].dd = true;
    placed++;
  }
  return { categories: data.categories.map((c) => c.name.trim()), cells };
}

/** Public board: values only; blank clues start out used. */
function liveBoardFor(round: RoundKey, priv: PrivateRound): LiveBoard {
  const cells: Record<string, LiveCell> = {};
  for (let c = 0; c < CATEGORY_COUNT; c++) {
    for (let r = 0; r < CLUE_COUNT; r++) {
      const key = cellKey(c, r);
      cells[key] = { value: clueValue(round, r), used: !priv.cells[key] };
    }
  }
  return { categories: priv.categories, cells };
}

export interface QueueEntry {
  uid: string;
  name: string;
  at: number;
  judged?: "correct" | "wrong";
}

/** Buzzes in server-time order (players who left are dropped). */
export function buzzQueue(game: Game): QueueEntry[] {
  return Object.entries(game.buzzes ?? {})
    .filter(([uid]) => game.players?.[uid])
    .sort(([, a], [, b]) => a - b)
    .map(([uid, at]) => ({
      uid,
      at,
      name: game.players![uid].name,
      judged: game.current?.judged?.[uid],
    }));
}

/** Who the host should judge next, if anyone. */
export function currentResponder(game: Game): string | null {
  const current = game.current;
  if (!current) return null;
  if (current.isDailyDouble) {
    return current.phase === "reading" && current.ddPlayer && !current.judged?.[current.ddPlayer]
      ? current.ddPlayer
      : null;
  }
  if (current.phase !== "open") return null;
  return buzzQueue(game).find((entry) => !entry.judged)?.uid ?? null;
}

export function isBoardCleared(game: Game): boolean {
  return Object.values(game.board?.cells ?? {}).every((cell) => cell.used);
}

function lowestScorer(game: Game): string | null {
  const players = Object.entries(game.players ?? {}).sort(
    ([, a], [, b]) => a.score - b.score || a.joinedAt - b.joinedAt,
  );
  return players[0]?.[0] ?? null;
}

// ---------------------------------------------------------------- host

export async function createGame(host: User, board: BoardContent): Promise<string> {
  const single = buildPrivateRound("single", board.rounds.single);
  const double = buildPrivateRound("double", board.rounds.double);
  const firstRound: RoundKey | null = single ? "single" : double ? "double" : null;
  if (!firstRound) throw new Error("Add at least one clue before hosting.");

  const rounds: GamePrivate["rounds"] = {};
  if (single) rounds.single = single;
  if (double) rounds.double = double;
  const priv: GamePrivate = { rounds };
  if (board.final.clue.trim()) {
    const final: FinalData = {
      category: board.final.category.trim() || "Final Jeopardy!",
      clue: board.final.clue.trim(),
      answer: board.final.answer.trim(),
    };
    priv.final = final;
  }

  for (let attempt = 0; attempt < 10; attempt++) {
    const code = randomCode();
    const existing = await get(gameRef(code));
    if (existing.exists() && Date.now() - (existing.val().createdAt ?? 0) < STALE_GAME_MS) continue;
    try {
      await update(ref(rtdb), {
        [`games/${code}`]: {
          hostUid: host.uid,
          title: board.title.trim().slice(0, 80) || "Jeopardy!",
          createdAt: serverTimestamp(),
          status: "lobby",
          round: firstRound,
          board: liveBoardFor(firstRound, rounds[firstRound]!),
        },
        [`gamePrivate/${code}`]: priv,
        [`gameSecrets/${code}`]: null,
      });
      return code;
    } catch {
      // Lost a race for this code (or it isn't stale yet by server time); try another.
    }
  }
  throw new Error("Couldn't find a free room code. Please try again.");
}

export function startGame(code: string, game: Game) {
  const firstJoined = Object.entries(game.players ?? {}).sort(
    ([, a], [, b]) => a.joinedAt - b.joinedAt,
  )[0]?.[0];
  return update(gameRef(code), {
    status: "playing",
    controlUid: game.controlUid ?? firstJoined ?? null,
  });
}

export function setControl(code: string, uid: string) {
  return set(ref(rtdb, `games/${code}/controlUid`), uid);
}

export function selectClue(code: string, game: Game, priv: GamePrivate, key: string) {
  const cell = priv.rounds[game.round]?.cells[key];
  const live = game.board?.cells[key];
  if (!cell || !live || live.used) return Promise.resolve();
  const category = game.board?.categories[Number(key.split("_")[0])] ?? "";
  const base = { cell: key, category, value: live.value };
  const ddPlayer = game.controlUid && game.players?.[game.controlUid] ? game.controlUid : null;
  const current = cell.dd
    ? { ...base, phase: "ddWager", isDailyDouble: true, ddPlayer }
    : { ...base, phase: "reading", clue: cell.clue };
  return update(gameRef(code), { current, buzzes: null });
}

export function openBuzzers(code: string) {
  return set(ref(rtdb, `games/${code}/current/phase`), "open");
}

export function setDailyDoubleWager(
  code: string,
  game: Game,
  priv: GamePrivate,
  uid: string,
  wager: number,
) {
  const cell = game.current && priv.rounds[game.round]?.cells[game.current.cell];
  if (!cell) return Promise.resolve();
  return update(gameRef(code), {
    "current/ddPlayer": uid,
    "current/wager": wager,
    "current/clue": cell.clue,
    "current/phase": "reading",
  });
}

function revealUpdates(game: Game, priv: GamePrivate): Record<string, unknown> {
  const current = game.current!;
  const cell = priv.rounds[game.round]?.cells[current.cell];
  return {
    "current/phase": "revealed",
    "current/answer": cell?.answer ?? "",
    "current/clue": cell?.clue ?? current.clue ?? "",
    [`board/cells/${current.cell}/used`]: true,
  };
}

/** Correct: +value, take control, reveal. Wrong: -value (queue moves on; a DD reveals). */
export function judgeResponse(
  code: string,
  game: Game,
  priv: GamePrivate,
  uid: string,
  correct: boolean,
) {
  const current = game.current;
  if (!current || !game.players?.[uid]) return Promise.resolve();
  const amount = current.isDailyDouble ? (current.wager ?? 0) : current.value;
  const updates: Record<string, unknown> = {
    [`players/${uid}/score`]: increment(correct ? amount : -amount),
    [`current/judged/${uid}`]: correct ? "correct" : "wrong",
  };
  if (correct || current.isDailyDouble) Object.assign(updates, revealUpdates(game, priv));
  if (correct) updates.controlUid = uid;
  return update(gameRef(code), updates);
}

export function revealClue(code: string, game: Game, priv: GamePrivate) {
  if (!game.current) return Promise.resolve();
  return update(gameRef(code), revealUpdates(game, priv));
}

export function returnToBoard(code: string) {
  return update(gameRef(code), { current: null, buzzes: null });
}

export function startRound(code: string, game: Game, priv: GamePrivate, round: RoundKey) {
  const privRound = priv.rounds[round];
  if (!privRound) return Promise.resolve();
  return update(gameRef(code), {
    round,
    board: liveBoardFor(round, privRound),
    current: null,
    buzzes: null,
    controlUid: lowestScorer(game),
  });
}

/** Moves to Final Jeopardy, or straight to the end if nobody can play it. */
export function startFinal(code: string, game: Game, priv: GamePrivate) {
  const eligible: Record<string, true> = {};
  for (const [uid, p] of Object.entries(game.players ?? {})) if (p.score > 0) eligible[uid] = true;
  if (!priv.final || Object.keys(eligible).length === 0) return endGame(code);
  return update(ref(rtdb), {
    [`games/${code}/status`]: "final",
    [`games/${code}/current`]: null,
    [`games/${code}/buzzes`]: null,
    [`games/${code}/final`]: { category: priv.final.category, phase: "wager", eligible },
    [`gameSecrets/${code}`]: null,
  });
}

export function showFinalClue(code: string, priv: GamePrivate, serverOffset: number) {
  return update(ref(rtdb, `games/${code}/final`), {
    phase: "answer",
    clue: priv.final?.clue ?? "",
    deadline: Date.now() + serverOffset + FINAL_SECONDS * 1000,
  });
}

export function startFinalReveal(code: string) {
  return set(ref(rtdb, `games/${code}/final/phase`), "reveal");
}

export function revealFinalResponse(code: string, uid: string, secret: PlayerSecret | undefined) {
  return set(ref(rtdb, `games/${code}/final/revealed/${uid}`), {
    answer: secret?.answer ?? "",
    wager: secret?.wager ?? 0,
  });
}

export function judgeFinal(code: string, uid: string, wager: number, correct: boolean) {
  return update(gameRef(code), {
    [`final/revealed/${uid}/correct`]: correct,
    [`players/${uid}/score`]: increment(correct ? wager : -wager),
  });
}

export function showFinalAnswer(code: string, priv: GamePrivate) {
  return set(ref(rtdb, `games/${code}/final/answer`), priv.final?.answer ?? "");
}

export function endGame(code: string) {
  return update(gameRef(code), { status: "ended", current: null, buzzes: null });
}

export function setScore(code: string, uid: string, score: number) {
  return set(ref(rtdb, `games/${code}/players/${uid}/score`), score);
}

export function kickPlayer(code: string, game: Game, uid: string) {
  return update(gameRef(code), {
    [`players/${uid}`]: null,
    [`kicked/${uid}`]: true,
    [`buzzes/${uid}`]: null,
    ...(game.controlUid === uid ? { controlUid: null } : {}),
  });
}

export function deleteGame(code: string) {
  return update(ref(rtdb), {
    [`games/${code}`]: null,
    [`gamePrivate/${code}`]: null,
    [`gameSecrets/${code}`]: null,
  });
}

// -------------------------------------------------------------- player

export async function joinGame(code: string, uid: string, name: string): Promise<void> {
  const playerRef = ref(rtdb, `games/${code}/players/${uid}`);
  const existing = await get(playerRef);
  if (existing.exists()) {
    if (existing.val().name !== name) await set(ref(rtdb, `games/${code}/players/${uid}/name`), name);
    return;
  }
  await set(playerRef, { name, score: 0, joinedAt: serverTimestamp(), connected: true });
}

/** Keeps players/{uid}/connected in sync with this tab's connection. */
export function trackPresence(code: string, uid: string): () => void {
  const connectedRef = ref(rtdb, `games/${code}/players/${uid}/connected`);
  const unsubscribe = onValue(ref(rtdb, ".info/connected"), (snap) => {
    if (snap.val() !== true) return;
    onDisconnect(connectedRef)
      .set(false)
      .then(() => set(connectedRef, true))
      .catch(() => {});
  });
  return () => {
    unsubscribe();
    onDisconnect(connectedRef).cancel().catch(() => {});
    set(connectedRef, false).catch(() => {});
  };
}

export function buzz(code: string, uid: string) {
  return set(ref(rtdb, `games/${code}/buzzes/${uid}`), serverTimestamp());
}

export function submitFinalWager(code: string, uid: string, wager: number) {
  return set(ref(rtdb, `gameSecrets/${code}/${uid}/wager`), wager);
}

export function submitFinalAnswer(code: string, uid: string, answer: string) {
  return set(ref(rtdb, `gameSecrets/${code}/${uid}/answer`), answer);
}
