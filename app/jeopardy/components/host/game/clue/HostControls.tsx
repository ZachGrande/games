"use client";

import { ACTION_BUTTON as ACTION, TONE } from "../../../shared/ui";
import { useHostGame } from "../HostGameContext";
import PeekButton from "./PeekButton";
import type { ClueActions } from "./useClueActions";

export default function HostControls({ current, canOpen, canReveal, open, reveal, back }: ClueActions) {
  const { game, priv, pending } = useHostGame();
  const answer = priv.rounds[game.round]?.cells[current.cell]?.answer ?? "";

  return (
    <div className="mt-auto flex flex-col gap-2">
      {canOpen && (
        <button type="button" disabled={pending} onClick={open} className={`${ACTION} ${TONE.primary}`}>
          Open buzzers <kbd className="text-xs opacity-70">Space</kbd>
        </button>
      )}
      {canReveal && (
        <button type="button" disabled={pending} onClick={reveal} className={`${ACTION} ${TONE.secondary}`}>
          {current.phase === "open" ? "No one / Reveal" : "Reveal response"} <kbd className="text-xs opacity-70">R</kbd>
        </button>
      )}
      {current.phase === "revealed" && (
        <button type="button" disabled={pending} onClick={back} className={`${ACTION} ${TONE.primary}`}>
          Back to board <kbd className="text-xs opacity-70">Enter</kbd>
        </button>
      )}
      {current.phase !== "revealed" && current.phase !== "ddWager" && <PeekButton answer={answer} />}
    </div>
  );
}
