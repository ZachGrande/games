"use client";

import { showFinalClue } from "../../../../lib/game";
import { ACTION_BUTTON as ACTION, TONE } from "../../../shared/ui";
import { useHostGame } from "../HostGameContext";
import StatusList from "./StatusList";
import { useFinalHostState } from "./useFinalHostState";

export default function FinalWagerPhase() {
  const { code, game, priv, secrets, serverOffset, pending, act } = useHostGame();
  const { eligible, allWagered } = useFinalHostState();

  return (
    <>
      <p className="text-xl text-blue-100">Players: lock in your wagers on your phones.</p>
      <StatusList
        game={game}
        uids={eligible}
        done={(uid) => secrets?.[uid]?.wager !== undefined}
        doneLabel="Wager in"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => act(() => showFinalClue(code, priv, serverOffset))}
        className={`${ACTION} ${allWagered ? TONE.primary : TONE.secondary}`}
      >
        {allWagered ? "Show clue & start timer" : "Show clue anyway"}
      </button>
    </>
  );
}
