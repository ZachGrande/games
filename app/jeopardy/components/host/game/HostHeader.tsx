"use client";

import Link from "next/link";
import { endGame } from "../../../lib/game";
import { ROUND_LABEL } from "../../../lib/types";
import { useHostGame } from "./HostGameContext";
import { useConfirmThen } from "./useConfirmThen";
import { useNextStep } from "./useNextStep";

const TOOLBAR_BUTTON =
  "rounded-lg border border-blue-600 px-3 py-1.5 text-sm text-blue-100 transition-colors hover:bg-blue-800 disabled:opacity-40";

export default function HostHeader({ onOpenTools }: { onOpenTools: () => void }) {
  const { code, game, pending } = useHostGame();
  const { cleared, nextStep } = useNextStep();
  const confirmThen = useConfirmThen();

  return (
    <header className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-900 px-4 py-2">
      <div className="flex items-baseline gap-3">
        <Link href="/jeopardy/host" className="text-sm text-blue-300 hover:text-white">
          ←
        </Link>
        <span className="font-bold">{game.title}</span>
        {game.status === "playing" && <span className="text-sm text-blue-300">{ROUND_LABEL[game.round]}</span>}
      </div>
      {game.status !== "lobby" && (
        <p className="text-sm text-blue-200">
          Join: {typeof window !== "undefined" ? window.location.host : ""}/jeopardy · code{" "}
          <span className="font-mono text-base font-bold tracking-widest text-amber-300">{code}</span>
        </p>
      )}
      <div className="flex flex-wrap gap-2">
        <button type="button" className={TOOLBAR_BUTTON} onClick={onOpenTools}>
          Players & tools
        </button>
        {game.status === "playing" && !cleared && (
          <button
            type="button"
            className={TOOLBAR_BUTTON}
            disabled={pending}
            onClick={() => confirmThen(`Skip the rest of this round? (${nextStep.label})`, nextStep.run)}
          >
            Skip round
          </button>
        )}
        {game.status !== "ended" && (
          <button
            type="button"
            className={TOOLBAR_BUTTON}
            disabled={pending}
            onClick={() => confirmThen("End the game now and show standings?", () => endGame(code))}
          >
            End game
          </button>
        )}
      </div>
    </header>
  );
}
