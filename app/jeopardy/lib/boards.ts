// Firestore CRUD for a host's saved boards (collection: jeopardyBoards).
import {
  type Timestamp,
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase";
import {
  type BoardContent,
  type RoundData,
  type SavedBoard,
  CATEGORY_COUNT,
  CLUE_COUNT,
} from "./types";

const COLLECTION = "jeopardyBoards";

function emptyRound(): RoundData {
  return {
    categories: Array.from({ length: CATEGORY_COUNT }, () => ({
      name: "",
      clues: Array.from({ length: CLUE_COUNT }, () => ({ clue: "", answer: "" })),
    })),
  };
}

export function emptyBoard(title = "Untitled board"): BoardContent {
  return {
    title,
    rounds: { single: emptyRound(), double: emptyRound() },
    final: { category: "", clue: "", answer: "" },
  };
}

/** Pads/trims stored data so the editor always sees a full 6×5 grid. */
function normalizeRound(round: Partial<RoundData> | undefined): RoundData {
  const base = emptyRound();
  round?.categories?.slice(0, CATEGORY_COUNT).forEach((cat, c) => {
    base.categories[c].name = cat?.name ?? "";
    cat?.clues?.slice(0, CLUE_COUNT).forEach((clue, r) => {
      base.categories[c].clues[r] = { clue: clue?.clue ?? "", answer: clue?.answer ?? "" };
    });
  });
  return base;
}

interface BoardDoc extends Omit<BoardContent, "final"> {
  final?: Partial<BoardContent["final"]>;
  ownerUid: string;
  updatedAt: Timestamp | null;
}

function fromDoc(id: string, data: BoardDoc): SavedBoard {
  return {
    id,
    ownerUid: data.ownerUid,
    title: data.title,
    rounds: {
      single: normalizeRound(data.rounds?.single),
      double: normalizeRound(data.rounds?.double),
    },
    final: {
      category: data.final?.category ?? "",
      clue: data.final?.clue ?? "",
      answer: data.final?.answer ?? "",
    },
    updatedAt: data.updatedAt?.toMillis() ?? Date.now(),
  };
}

export async function listBoards(uid: string): Promise<SavedBoard[]> {
  const snap = await getDocs(query(collection(db, COLLECTION), where("ownerUid", "==", uid)));
  return snap.docs
    .map((d) => fromDoc(d.id, d.data() as BoardDoc))
    .sort((a, b) => b.updatedAt - a.updatedAt);
}

export async function getBoard(id: string): Promise<SavedBoard | null> {
  const snap = await getDoc(doc(db, COLLECTION, id));
  return snap.exists() ? fromDoc(snap.id, snap.data() as BoardDoc) : null;
}

export async function createBoard(uid: string, content: BoardContent): Promise<string> {
  const ref = await addDoc(collection(db, COLLECTION), {
    ...content,
    ownerUid: uid,
    updatedAt: serverTimestamp(),
  });
  return ref.id;
}

export async function saveBoard(id: string, uid: string, content: BoardContent): Promise<void> {
  await setDoc(doc(db, COLLECTION, id), {
    title: content.title,
    rounds: content.rounds,
    final: content.final,
    ownerUid: uid,
    updatedAt: serverTimestamp(),
  });
}

export async function deleteBoard(id: string): Promise<void> {
  await deleteDoc(doc(db, COLLECTION, id));
}

export function countFilled(content: BoardContent): { filled: number; total: number } {
  let filled = 0;
  let total = 0;
  for (const round of Object.values(content.rounds)) {
    for (const cat of round.categories) {
      for (const clue of cat.clues) {
        total++;
        if (clue.clue.trim() && clue.answer.trim()) filled++;
      }
    }
  }
  return { filled, total };
}
