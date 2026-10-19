"use client";

import { formatMoney } from "../lib/format";
import {
  endGame,
  judgeFinal,
  revealFinalResponse,
  showFinalAnswer,
  showFinalClue,
  startFinalReveal,
} from "../lib/game";
import { useNow } from "../lib/hooks";
import { type Game, type GamePrivate, type PlayerSecret, secondsUntil } from "../lib/types";

const ACTION =
  "rounded-xl px-6 py-3 text-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export default function FinalHost({
  code,
  game,
  priv,
  secrets,
  serverOffset,
  pending,
  act,
}: {
  code: string;
  game: Game;
  priv: GamePrivate;
  secrets: Record<string, PlayerSecret> | null | undefined;
  serverOffset: number;
  pending: boolean;
  act: (fn: () => Promise<unknown>) => void;
}) {
  const final = game.final!;
  const now = useNow(final.phase === "answer");
  // Reveal lowest-to-highest by pre-Final score, so rows don't jump as they're judged.
  const preFinalScore = (uid: string) => {
    const shown = final.revealed?.[uid];
    const delta = shown?.correct === undefined ? 0 : shown.correct ? shown.wager : -shown.wager;
    return game.players![uid].score - delta;
  };
  const eligible = Object.keys(final.eligible ?? {})
    .filter((uid) => game.players?.[uid])
    .sort((a, b) => preFinalScore(a) - preFinalScore(b));
  const secondsLeft = secondsUntil(final.deadline, now + serverOffset);

  const allWagered = eligible.every((uid) => secrets?.[uid]?.wager !== undefined);
  const allAnswered = eligible.every((uid) => secrets?.[uid]?.answer !== undefined);
  const allJudged = eligible.every((uid) => final.revealed?.[uid]?.correct !== undefined);

  return (
    <div className="flex flex-1 flex-col items-center gap-8 p-6 text-center">
      <p className="text-2xl font-bold uppercase tracking-widest text-blue-200">Final Jeopardy!</p>
      <p className="text-4xl font-black uppercase text-white sm:text-6xl">{final.category}</p>

      {final.phase === "wager" && (
        <>
          <p className="text-xl text-blue-100">Players: lock in your wagers on your phones.</p>
          <StatusList game={game} uids={eligible} done={(uid) => secrets?.[uid]?.wager !== undefined} doneLabel="Wager in" />
          <button
            type="button"
            disabled={pending}
            onClick={() => act(() => showFinalClue(code, priv, serverOffset))}
            className={`${ACTION} ${allWagered ? "bg-amber-400 text-blue-950 hover:bg-amber-300" : "bg-blue-700 text-white hover:bg-blue-600"}`}
          >
            {allWagered ? "Show clue & start timer" : "Show clue anyway"}
          </button>
        </>
      )}

      {final.phase === "answer" && (
        <>
          <p className="max-w-5xl font-serif text-3xl font-bold uppercase leading-snug text-white sm:text-5xl">
            {final.clue}
          </p>
          <p className={`text-6xl font-black tabular-nums ${secondsLeft <= 5 ? "text-red-400" : "text-amber-300"}`}>
            {secondsLeft}
          </p>
          <StatusList game={game} uids={eligible} done={(uid) => secrets?.[uid]?.answer !== undefined} doneLabel="Answered" />
          <button
            type="button"
            disabled={pending}
            onClick={() => act(() => startFinalReveal(code))}
            className={`${ACTION} ${secondsLeft === 0 || allAnswered ? "bg-amber-400 text-blue-950 hover:bg-amber-300" : "bg-blue-700 text-white hover:bg-blue-600"}`}
          >
            Reveal responses
          </button>
        </>
      )}

      {final.phase === "reveal" && (
        <>
          <p className="max-w-4xl font-serif text-xl font-bold uppercase text-blue-100 sm:text-2xl">{final.clue}</p>
          <ul className="flex w-full max-w-3xl flex-col gap-3">
            {eligible.map((uid) => {
              const player = game.players![uid];
              const shown = final.revealed?.[uid];
              const secret = secrets?.[uid];
              const wager = shown?.wager ?? 0;
              return (
                <li key={uid} className="flex flex-col gap-3 rounded-xl bg-blue-800 p-4 sm:flex-row sm:items-center sm:justify-between">
                  <div className="flex flex-col items-start text-left">
                    <span className="text-xl font-bold text-white">{player.name}</span>
                    <span className="text-amber-300">{formatMoney(player.score)}</span>
                  </div>
                  {!shown ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => act(() => revealFinalResponse(code, uid, secret))}
                      className={`${ACTION} bg-amber-400 text-blue-950 hover:bg-amber-300`}
                    >
                      Show response
                    </button>
                  ) : (
                    <div className="flex flex-col items-end gap-2">
                      <span className="text-2xl font-bold text-white">{shown.answer || "(no response)"}</span>
                      {shown.correct === undefined ? (
                        <div className="flex gap-2">
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => act(() => judgeFinal(code, uid, wager, true))}
                            className={`${ACTION} bg-emerald-500 text-white hover:bg-emerald-400`}
                          >
                            ✓ Correct
                          </button>
                          <button
                            type="button"
                            disabled={pending}
                            onClick={() => act(() => judgeFinal(code, uid, wager, false))}
                            className={`${ACTION} bg-red-500 text-white hover:bg-red-400`}
                          >
                            ✗ Wrong
                          </button>
                        </div>
                      ) : (
                        <span className={shown.correct ? "text-emerald-300" : "text-red-300"}>
                          {shown.correct ? "+" : "−"}
                          {formatMoney(wager)} wager
                        </span>
                      )}
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
          {final.answer ? (
            <p className="text-3xl font-bold text-amber-300">{final.answer}</p>
          ) : (
            <button
              type="button"
              disabled={pending}
              onClick={() => act(() => showFinalAnswer(code, priv))}
              className={`${ACTION} bg-blue-700 text-white hover:bg-blue-600`}
            >
              Reveal correct response
            </button>
          )}
          <button
            type="button"
            disabled={pending || !allJudged}
            onClick={() => act(() => endGame(code))}
            className={`${ACTION} bg-amber-400 text-blue-950 hover:bg-amber-300`}
          >
            Show final standings
          </button>
        </>
      )}
    </div>
  );
}

function StatusList({
  game,
  uids,
  done,
  doneLabel,
}: {
  game: Game;
  uids: string[];
  done: (uid: string) => boolean;
  doneLabel: string;
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {uids.map((uid) => (
        <li
          key={uid}
          className={`rounded-lg px-4 py-2 text-lg ${done(uid) ? "bg-emerald-600 text-white" : "bg-blue-800 text-blue-200"}`}
        >
          {game.players?.[uid]?.name} {done(uid) ? `· ${doneLabel} ✓` : "· waiting"}
        </li>
      ))}
    </ul>
  );
}
