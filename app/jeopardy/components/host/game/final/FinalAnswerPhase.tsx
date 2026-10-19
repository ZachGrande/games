"use client";

import { startFinalReveal } from "../../../../lib/game";
import { useCountdown } from "../../../../lib/hooks";
import Countdown from "../../../shared/Countdown";
import { ACTION_BUTTON as ACTION, TONE } from "../../../shared/ui";
import { useHostGame } from "../HostGameContext";
import StatusList from "./StatusList";
import { useFinalHostState } from "./useFinalHostState";

export default function FinalAnswerPhase() {
  const { code, game, secrets, serverOffset, pending, act } = useHostGame();
  const final = game.final!;
  const { eligible, allAnswered } = useFinalHostState();
  const secondsLeft = useCountdown(final.deadline, serverOffset, true);

  return (
    <>
      <p className="max-w-5xl font-serif text-3xl font-bold uppercase leading-snug text-white sm:text-5xl">
        {final.clue}
      </p>
      <Countdown seconds={secondsLeft} className="text-6xl" />
      <StatusList
        game={game}
        uids={eligible}
        done={(uid) => secrets?.[uid]?.answer !== undefined}
        doneLabel="Answered"
      />
      <button
        type="button"
        disabled={pending}
        onClick={() => act(() => startFinalReveal(code))}
        className={`${ACTION} ${secondsLeft === 0 || allAnswered ? TONE.primary : TONE.secondary}`}
      >
        Reveal responses
      </button>
    </>
  );
}
