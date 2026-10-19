"use client";

import { isBoardCleared, startFinal, startRound } from "../../../lib/game";
import { ROUND_LABEL } from "../../../lib/types";
import { useHostGame } from "./HostGameContext";

/** Whether the current board is exhausted, and what advancing to the next phase means. */
export function useNextStep() {
  const { code, game, priv } = useHostGame();
  const cleared = game.status === "playing" && !game.current && isBoardCleared(game);
  const hasDouble = game.round === "single" && !!priv.rounds.double;
  const nextStep = hasDouble
    ? { label: `Start ${ROUND_LABEL.double}`, run: () => startRound(code, game, priv, "double") }
    : {
        label: priv.final ? "Start Final Jeopardy!" : "Show final standings",
        run: () => startFinal(code, game, priv),
      };

  return { cleared, nextStep };
}
