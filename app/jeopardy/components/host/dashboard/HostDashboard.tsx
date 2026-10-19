"use client";

import type { User } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { countFilled, createBoard, deleteBoard, emptyBoard, listBoards } from "../../../lib/boards";
import { createGame } from "../../../lib/game";
import { loadHostedGames, rememberHostedGame, useGame } from "../../../lib/hooks";
import { SAMPLE_BOARD } from "../../../lib/sampleBoard";
import type { BoardContent, SavedBoard } from "../../../lib/types";
import { SignOutButton } from "../HostGate";

const BUTTON =
  "rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-700 transition-colors hover:bg-zinc-100 disabled:opacity-40 dark:border-zinc-700 dark:text-zinc-200 dark:hover:bg-zinc-800";
const PRIMARY =
  "rounded-lg bg-blue-700 px-3 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-blue-600 disabled:opacity-40";

export default function HostDashboard({ user }: { user: User }) {
  const router = useRouter();
  const [boards, setBoards] = useState<SavedBoard[] | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [recent] = useState(loadHostedGames);

  useEffect(() => {
    listBoards(user.uid)
      .then(setBoards)
      .catch((e: Error) => {
        setBoards([]);
        setError(e.message);
      });
  }, [user.uid]);

  async function run(key: string, action: () => Promise<void>) {
    setBusy(key);
    setError(null);
    try {
      await action();
    } catch (e) {
      setError((e as Error).message);
    } finally {
      setBusy(null);
    }
  }

  const newBoard = (content: BoardContent) =>
    run("new", async () => {
      const id = await createBoard(user.uid, content);
      router.push(`/jeopardy/host/boards/${id}`);
    });

  const host = (board: SavedBoard) =>
    run(`host-${board.id}`, async () => {
      const code = await createGame(user, board);
      rememberHostedGame(code);
      router.push(`/jeopardy/host/${code}`);
    });

  const remove = (board: SavedBoard) => {
    if (!confirm(`Delete "${board.title}"? This can't be undone.`)) return;
    run(`del-${board.id}`, async () => {
      await deleteBoard(board.id);
      setBoards((list) => list?.filter((b) => b.id !== board.id) ?? null);
    });
  };

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-center justify-between text-sm text-zinc-500 dark:text-zinc-400">
        <span>Signed in as {user.displayName ?? user.email}</span>
        <SignOutButton />
      </div>

      {recent.length > 0 && (
        <section className="flex flex-col gap-3">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">Your recent games</h2>
          <ul className="flex flex-col gap-2">
            {recent.map((code) => (
              <RecentGame key={code} code={code} uid={user.uid} />
            ))}
          </ul>
        </section>
      )}

      <section className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="text-lg font-medium text-black dark:text-zinc-50">Your boards</h2>
          <div className="flex gap-2">
            <button type="button" className={BUTTON} disabled={!!busy} onClick={() => newBoard(SAMPLE_BOARD)}>
              New from sample
            </button>
            <button type="button" className={PRIMARY} disabled={!!busy} onClick={() => newBoard(emptyBoard())}>
              New board
            </button>
          </div>
        </div>

        {error && <p className="text-sm text-red-600">{error}</p>}

        {boards === null ? (
          <p className="text-zinc-500">Loading boards…</p>
        ) : boards.length === 0 ? (
          <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
            No boards yet. Start from the sample or build your own.
          </p>
        ) : (
          <ul className="flex flex-col gap-2">
            {boards.map((board) => {
              const { filled, total } = countFilled(board);
              return (
                <li
                  key={board.id}
                  className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800"
                >
                  <div className="flex flex-col">
                    <span className="font-medium text-black dark:text-zinc-50">{board.title}</span>
                    <span className="text-sm text-zinc-500 dark:text-zinc-400">
                      {filled}/{total} clues · {board.final.clue.trim() ? "Final ready" : "No Final"}
                    </span>
                  </div>
                  <div className="flex gap-2">
                    <button type="button" className={BUTTON} disabled={!!busy} onClick={() => remove(board)}>
                      Delete
                    </button>
                    <Link href={`/jeopardy/host/boards/${board.id}`} className={BUTTON}>
                      Edit
                    </Link>
                    <button
                      type="button"
                      className={PRIMARY}
                      disabled={!!busy || filled === 0}
                      onClick={() => host(board)}
                    >
                      {busy === `host-${board.id}` ? "Starting…" : "Host game"}
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </section>
    </div>
  );
}

function RecentGame({ code, uid }: { code: string; uid: string }) {
  const { value: game } = useGame(code);
  if (!game || game.hostUid !== uid) return null;
  return (
    <li>
      <Link
        href={`/jeopardy/host/${code}`}
        className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
      >
        <span className="flex flex-col">
          <span className="font-medium text-black dark:text-zinc-50">{game.title}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {Object.keys(game.players ?? {}).length} players · {game.status}
          </span>
        </span>
        <span className="font-mono text-lg tracking-widest text-blue-700 dark:text-blue-400">{code}</span>
      </Link>
    </li>
  );
}
