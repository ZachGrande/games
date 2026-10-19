"use client";

import { endGame, showFinalAnswer } from "../../../../lib/game";
import { ACTION_BUTTON as ACTION, TONE } from "../../../shared/ui";
import { useHostGame } from "../HostGameContext";
import FinalRevealRow from "./FinalRevealRow";
import { useFinalHostState } from "./useFinalHostState";

export default function FinalRevealPhase() {
  const { code, game, priv, pending, act } = useHostGame();
  const final = game.final!;
  const { eligible, allJudged } = useFinalHostState();

  return (
    <>
      <p className="max-w-4xl font-serif text-xl font-bold uppercase text-blue-100 sm:text-2xl">{final.clue}</p>
      <ul className="flex w-full max-w-3xl flex-col gap-3">
        {eligible.map((uid) => (
          <FinalRevealRow key={uid} uid={uid} />
        ))}
      </ul>
      {final.answer ? (
        <p className="text-3xl font-bold text-amber-300">{final.answer}</p>
      ) : (
        <button
          type="button"
          disabled={pending}
          onClick={() => act(() => showFinalAnswer(code, priv))}
          className={`${ACTION} ${TONE.secondary}`}
        >
          Reveal correct response
        </button>
      )}
      <button
        type="button"
        disabled={pending || !allJudged}
        onClick={() => act(() => endGame(code))}
        className={`${ACTION} ${TONE.primary}`}
      >
        Show final standings
      </button>
    </>
  );
}
