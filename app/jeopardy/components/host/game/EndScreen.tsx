"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { deleteGame } from "../../../lib/game";
import { forgetHostedGame } from "../../../lib/hooks";
import Standings from "../../shared/Standings";
import { useHostGame } from "./HostGameContext";
import { useConfirmThen } from "./useConfirmThen";

export default function EndScreen() {
  const router = useRouter();
  const { code, game, pending } = useHostGame();
  const confirmThen = useConfirmThen();

  return (
    <div className="flex flex-1 flex-col items-center gap-10 p-6">
      <h1 className="text-5xl font-black text-amber-300">Final standings</h1>
      <Standings players={game.players} />
      <div className="flex gap-3">
        <Link
          href="/jeopardy/host"
          className="rounded-xl border border-blue-500 px-6 py-3 font-semibold hover:bg-blue-900"
        >
          Back to boards
        </Link>
        <button
          type="button"
          disabled={pending}
          onClick={() =>
            confirmThen("Delete this game? Players will be disconnected.", async () => {
              await deleteGame(code);
              forgetHostedGame(code);
              router.push("/jeopardy/host");
            })
          }
          className="rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-500 disabled:opacity-40"
        >
          Delete game
        </button>
      </div>
    </div>
  );
}
