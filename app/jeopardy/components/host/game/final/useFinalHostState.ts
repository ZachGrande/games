"use client";

import { useHostGame } from "../HostGameContext";

/** Players taking part in Final Jeopardy (lowest pre-Final score first) and how far along each phase is. */
export function useFinalHostState() {
  const { game, secrets } = useHostGame();
  const final = game.final!;
  // Reveal lowest-to-highest by pre-Final score, so rows don't jump as they're judged.
  const preFinalScore = (uid: string) => {
    const shown = final.revealed?.[uid];
    const delta = shown?.correct === undefined ? 0 : shown.correct ? shown.wager : -shown.wager;
    return game.players![uid].score - delta;
  };
  const eligible = Object.keys(final.eligible ?? {})
    .filter((uid) => game.players?.[uid])
    .sort((a, b) => preFinalScore(a) - preFinalScore(b));

  const allWagered = eligible.every((uid) => secrets?.[uid]?.wager !== undefined);
  const allAnswered = eligible.every((uid) => secrets?.[uid]?.answer !== undefined);
  const allJudged = eligible.every((uid) => final.revealed?.[uid]?.correct !== undefined);

  return { eligible, allWagered, allAnswered, allJudged };
}
