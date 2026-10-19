"use client";

import { useEffect, useState } from "react";
import { formatMoney } from "../lib/format";
import {
  buzzQueue,
  currentResponder,
  judgeResponse,
  openBuzzers,
  returnToBoard,
  revealClue,
  setDailyDoubleWager,
} from "../lib/game";
import { type Game, type GamePrivate, roundMaxValue } from "../lib/types";

const ACTION =
  "rounded-xl px-5 py-3 text-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export default function ClueStage({
  code,
  game,
  priv,
  pending,
  act,
}: {
  code: string;
  game: Game;
  priv: GamePrivate;
  pending: boolean;
  act: (fn: () => Promise<unknown>) => void;
}) {
  const current = game.current!;
  const queue = buzzQueue(game);
  const responder = currentResponder(game);
  const responderName = responder ? game.players?.[responder]?.name : null;
  const answer = priv.rounds[game.round]?.cells[current.cell]?.answer ?? "";
  const [peeking, setPeeking] = useState(false);

  const canOpen = current.phase === "reading" && !current.isDailyDouble;
  const canReveal = current.phase === "reading" || current.phase === "open";
  const judge = (correct: boolean) =>
    responder && act(() => judgeResponse(code, game, priv, responder, correct));
  const open = () => act(() => openBuzzers(code));
  const reveal = () => act(() => revealClue(code, game, priv));
  const back = () => act(() => returnToBoard(code));

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.repeat || pending || target?.closest("input, textarea, select")) return;
      const key = e.key.toLowerCase();
      if (key === " " && canOpen) open();
      else if (key === "c" && responder) judge(true);
      else if (key === "w" && responder) judge(false);
      else if (key === "r" && canReveal) reveal();
      else if (key === "enter" && current.phase === "revealed") back();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });

  const correctUid = Object.entries(current.judged ?? {}).find(([, j]) => j === "correct")?.[0];

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
      <section className="flex flex-1 flex-col rounded-xl bg-blue-800 p-6 text-center shadow-lg">
        <p className="text-lg font-semibold uppercase tracking-wide text-blue-200 sm:text-2xl">
          {current.category} · {current.isDailyDouble && current.wager !== undefined
            ? `Wager ${formatMoney(current.wager)}`
            : formatMoney(current.value)}
        </p>

        <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
          {current.phase === "ddWager" ? (
            <p className="animate-pulse font-serif text-6xl font-black uppercase text-amber-300 sm:text-8xl">
              Daily Double!
            </p>
          ) : (
            <p className="max-w-5xl font-serif text-3xl font-bold uppercase leading-snug text-white sm:text-5xl lg:text-6xl">
              {current.clue}
            </p>
          )}
          {current.phase === "revealed" && (
            <div className="flex flex-col items-center gap-2">
              <p className="text-2xl font-bold text-amber-300 sm:text-4xl">{current.answer}</p>
              <p className="text-lg text-blue-100">
                {correctUid
                  ? `${game.players?.[correctUid]?.name ?? "Someone"} got it!`
                  : "No one got it."}
              </p>
            </div>
          )}
        </div>

        <p className="text-sm text-blue-300">
          {current.phase === "reading" && !current.isDailyDouble && "Buzzers locked · Space to open"}
          {current.phase === "open" && "Buzzers open!"}
        </p>
      </section>

      <aside className="flex w-full flex-col gap-4 rounded-xl bg-blue-900 p-4 lg:w-96">
        {current.phase === "ddWager" ? (
          <DailyDoubleForm
            key={current.cell}
            game={game}
            pending={pending}
            onSubmit={(uid, wager) => act(() => setDailyDoubleWager(code, game, priv, uid, wager))}
          />
        ) : current.isDailyDouble ? (
          <p className="text-lg text-white">
            <span className="font-bold text-amber-300">{game.players?.[current.ddPlayer ?? ""]?.name}</span>{" "}
            is playing the Daily Double for {formatMoney(current.wager ?? 0)}.
          </p>
        ) : (
          <BuzzList queue={queue} responder={responder} openedAt={current.phase === "open"} />
        )}

        {responder && (
          <div className="flex flex-col gap-2">
            <p className="text-center text-white">
              Judging <span className="font-bold text-amber-300">{responderName}</span>
            </p>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                disabled={pending}
                onClick={() => judge(true)}
                className={`${ACTION} bg-emerald-500 text-white hover:bg-emerald-400`}
              >
                ✓ Correct <kbd className="text-xs opacity-70">C</kbd>
              </button>
              <button
                type="button"
                disabled={pending}
                onClick={() => judge(false)}
                className={`${ACTION} bg-red-500 text-white hover:bg-red-400`}
              >
                ✗ Wrong <kbd className="text-xs opacity-70">W</kbd>
              </button>
            </div>
          </div>
        )}

        <div className="mt-auto flex flex-col gap-2">
          {canOpen && (
            <button
              type="button"
              disabled={pending}
              onClick={open}
              className={`${ACTION} bg-amber-400 text-blue-950 hover:bg-amber-300`}
            >
              Open buzzers <kbd className="text-xs opacity-70">Space</kbd>
            </button>
          )}
          {canReveal && (
            <button
              type="button"
              disabled={pending}
              onClick={reveal}
              className={`${ACTION} bg-blue-700 text-white hover:bg-blue-600`}
            >
              {current.phase === "open" ? "No one / Reveal" : "Reveal response"}{" "}
              <kbd className="text-xs opacity-70">R</kbd>
            </button>
          )}
          {current.phase === "revealed" && (
            <button
              type="button"
              disabled={pending}
              onClick={back}
              className={`${ACTION} bg-amber-400 text-blue-950 hover:bg-amber-300`}
            >
              Back to board <kbd className="text-xs opacity-70">Enter</kbd>
            </button>
          )}
          {current.phase !== "revealed" && current.phase !== "ddWager" && (
            <button
              type="button"
              onPointerDown={() => setPeeking(true)}
              onPointerUp={() => setPeeking(false)}
              onPointerLeave={() => setPeeking(false)}
              className="select-none rounded-lg border border-blue-700 px-3 py-2 text-sm text-blue-200"
            >
              {peeking ? answer || "(no response entered)" : "Hold to peek at response"}
            </button>
          )}
        </div>
      </aside>
    </div>
  );
}

function BuzzList({
  queue,
  responder,
  openedAt,
}: {
  queue: ReturnType<typeof buzzQueue>;
  responder: string | null;
  openedAt: boolean;
}) {
  if (queue.length === 0) {
    return <p className="text-blue-200">{openedAt ? "Waiting for buzzes…" : "No buzzes yet."}</p>;
  }
  const first = queue[0].at;
  return (
    <ol className="flex flex-col gap-1.5">
      {queue.map((entry, i) => (
        <li
          key={entry.uid}
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
            entry.uid === responder
              ? "bg-amber-300 font-bold text-blue-950"
              : entry.judged === "wrong"
                ? "bg-blue-950 text-blue-400 line-through"
                : entry.judged === "correct"
                  ? "bg-emerald-500 text-white"
                  : "bg-blue-800 text-white"
          }`}
        >
          <span>
            {i + 1}. {entry.name}
          </span>
          <span className="text-xs opacity-75">{i === 0 ? "first" : `+${((entry.at - first) / 1000).toFixed(2)}s`}</span>
        </li>
      ))}
    </ol>
  );
}

function DailyDoubleForm({
  game,
  pending,
  onSubmit,
}: {
  game: Game;
  pending: boolean;
  onSubmit: (uid: string, wager: number) => void;
}) {
  const players = Object.entries(game.players ?? {}).sort(([, a], [, b]) => a.joinedAt - b.joinedAt);
  const [uid, setUid] = useState(game.current?.ddPlayer ?? players[0]?.[0] ?? "");
  const [wager, setWager] = useState("");
  const score = game.players?.[uid]?.score ?? 0;
  const max = Math.max(score, roundMaxValue(game.round));
  const amount = Number(wager);
  const valid = !!uid && wager !== "" && Number.isInteger(amount) && amount >= 5 && amount <= max;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) onSubmit(uid, amount);
      }}
    >
      <label className="flex flex-col gap-1 text-sm text-blue-200">
        Player
        <select
          value={uid}
          onChange={(e) => setUid(e.target.value)}
          className="rounded-lg bg-blue-800 px-3 py-2 text-lg text-white"
        >
          {players.map(([id, p]) => (
            <option key={id} value={id}>
              {p.name} ({formatMoney(p.score)})
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1 text-sm text-blue-200">
        Wager ($5 – {formatMoney(max)})
        <div className="flex gap-2">
          <input
            type="number"
            inputMode="numeric"
            min={5}
            max={max}
            value={wager}
            onChange={(e) => setWager(e.target.value)}
            className="w-full rounded-lg bg-blue-800 px-3 py-2 text-lg text-white"
          />
          <button
            type="button"
            onClick={() => setWager(String(max))}
            className="whitespace-nowrap rounded-lg border border-blue-600 px-3 text-sm text-blue-100 hover:bg-blue-800"
          >
            All in
          </button>
        </div>
      </label>
      <button
        type="submit"
        disabled={!valid || pending}
        className={`${ACTION} bg-amber-400 text-blue-950 hover:bg-amber-300`}
      >
        Show clue
      </button>
    </form>
  );
}
