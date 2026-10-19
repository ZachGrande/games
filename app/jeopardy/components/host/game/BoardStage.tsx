"use client";

import { selectClue } from "../../../lib/game";
import BoardGrid from "./BoardGrid";
import { useHostGame } from "./HostGameContext";
import { useNextStep } from "./useNextStep";

export default function BoardStage() {
  const { code, game, priv, pending, act } = useHostGame();
  const { cleared, nextStep } = useNextStep();

  return (
    <div className="relative flex flex-1 flex-col p-3">
      {game.board && (
        <BoardGrid
          board={game.board}
          disabled={pending}
          onSelect={(key) => act(() => selectClue(code, game, priv, key))}
        />
      )}
      {cleared && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-blue-950/90">
          <p className="text-4xl font-black text-amber-300">Round complete!</p>
          <button
            type="button"
            disabled={pending}
            onClick={() => act(nextStep.run)}
            className="rounded-xl bg-amber-400 px-8 py-4 text-2xl font-black text-blue-950 hover:bg-amber-300 disabled:opacity-40"
          >
            {nextStep.label}
          </button>
        </div>
      )}
    </div>
  );
}
