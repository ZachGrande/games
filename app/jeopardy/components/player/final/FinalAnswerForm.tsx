"use client";

import { useState } from "react";
import { submitFinalAnswer } from "../../../lib/game";
import { useCountdown } from "../../../lib/hooks";
import type { LiveFinal, PlayerSecret } from "../../../lib/types";
import Countdown from "../../shared/Countdown";
import { PLAYER_SUBMIT_BUTTON } from "../../shared/ui";
import Message from "../Message";
import FinalHeading from "./FinalHeading";

export default function FinalAnswerForm({
  code,
  uid,
  final,
  secret,
  serverOffset,
}: {
  code: string;
  uid: string;
  final: LiveFinal;
  secret: PlayerSecret | null;
  serverOffset: number;
}) {
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);
  const secondsLeft = useCountdown(final.deadline, serverOffset, true);

  if (secret?.wager === undefined) {
    return (
      <>
        <FinalHeading category={final.category} />
        <p className="max-w-md font-serif text-xl font-bold uppercase">{final.clue}</p>
        <Message>You didn&apos;t lock in a wager, so you&apos;re sitting this one out.</Message>
      </>
    );
  }

  return (
    <>
      <FinalHeading category={final.category} />
      <p className="max-w-md font-serif text-xl font-bold uppercase">{final.clue}</p>
      <Countdown seconds={secondsLeft} className="text-5xl" />
      <form
        className="flex w-full max-w-sm flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (!answer.trim()) return;
          setError(null);
          submitFinalAnswer(code, uid, answer.trim()).catch(() => setError("Too late — that wasn't accepted."));
        }}
      >
        <input
          aria-label="Your response"
          value={answer}
          onChange={(e) => setAnswer(e.target.value)}
          maxLength={200}
          placeholder="What is…?"
          disabled={secondsLeft === 0}
          className="rounded-xl bg-blue-900 px-4 py-3 text-center text-xl text-white placeholder:text-blue-400"
        />
        <button type="submit" disabled={!answer.trim() || secondsLeft === 0} className={PLAYER_SUBMIT_BUTTON}>
          {secret.answer !== undefined ? "Update response" : "Submit response"}
        </button>
      </form>
      {secret.answer !== undefined && <p className="text-emerald-300">Submitted: {secret.answer}</p>}
      {error && <p className="text-red-300">{error}</p>}
    </>
  );
}
