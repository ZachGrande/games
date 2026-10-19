"use client";

import type { User } from "firebase/auth";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { createBoard, deleteBoard, emptyBoard, listBoards } from "../../../lib/boards";
import { createGame } from "../../../lib/game";
import { loadHostedGames, rememberHostedGame } from "../../../lib/hooks";
import { SAMPLE_BOARD } from "../../../lib/sampleBoard";
import type { BoardContent, SavedBoard } from "../../../lib/types";
import SignOutButton from "../SignOutButton";
import { BUTTON, PRIMARY } from "../ui";
import BoardList from "./BoardList";
import RecentGames from "./RecentGames";

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

      {recent.length > 0 && <RecentGames codes={recent} uid={user.uid} />}

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

        <BoardList boards={boards} busy={busy} onHost={host} onRemove={remove} />
      </section>
    </div>
  );
}
