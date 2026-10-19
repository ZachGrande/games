"use client";

import { useEffect, useState } from "react";
import { formatMoney, ordinal, rankPlayers } from "../lib/format";
import {
  buzz,
  buzzQueue,
  currentResponder,
  joinGame,
  submitFinalAnswer,
  submitFinalWager,
  trackPresence,
} from "../lib/game";
import { isValidCode } from "../lib/codes";
import {
  loadPlayerName,
  savePlayerName,
  useGame,
  useMySecret,
  useNow,
  usePlayerUser,
  useServerOffset,
} from "../lib/hooks";
import { type Game, type PlayerSecret, secondsUntil } from "../lib/types";
import Standings from "./Standings";

export default function PlayerGame({ code }: { code: string }) {
  const validCode = isValidCode(code);
  const { user, error: authError } = usePlayerUser();
  const uid = user?.uid ?? null;
  const { value: game } = useGame(code, !!user && validCode);
  const me = uid ? game?.players?.[uid] : undefined;
  const joined = !!me;
  const inFinal = joined && game?.status === "final";
  const { value: secret } = useMySecret(code, uid, inFinal);
  const serverOffset = useServerOffset();

  useEffect(() => {
    if (!joined || !uid) return;
    return trackPresence(code, uid);
  }, [code, uid, joined]);

  let body: React.ReactNode;
  if (!validCode) body = <Message>That room code doesn&apos;t look right.</Message>;
  else if (authError) body = <Message>Couldn&apos;t connect: {authError}</Message>;
  else if (!uid || game === undefined) body = <Message>Connecting…</Message>;
  else if (!game) body = <Message>No game with code {code}. Check the code on the host&apos;s screen.</Message>;
  else if (game.kicked?.[uid]) body = <Message>The host removed you from this game.</Message>;
  else if (!me) {
    body =
      game.status === "ended" ? (
        <Standings players={game.players} compact />
      ) : (
        <NameForm code={code} uid={uid} />
      );
  } else {
    body = <PlayerBody code={code} uid={uid} game={game} secret={secret ?? null} serverOffset={serverOffset} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-blue-950 text-white">
      <header className="flex items-center justify-between border-b border-blue-900 px-4 py-3">
        <span className="text-sm text-blue-300">
          {game?.title ?? "Jeopardy!"} · <span className="font-mono tracking-widest">{code}</span>
        </span>
        {me && (
          <span className="flex items-baseline gap-2">
            <span className="font-medium">{me.name}</span>
            <span className={`text-xl font-bold ${me.score < 0 ? "text-red-400" : "text-amber-300"}`}>
              {formatMoney(me.score)}
            </span>
          </span>
        )}
      </header>
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">{body}</main>
    </div>
  );
}

function Message({ children }: { children: React.ReactNode }) {
  return <p className="max-w-sm text-lg text-blue-100">{children}</p>;
}

function NameForm({ code, uid }: { code: string; uid: string }) {
  const [name, setName] = useState(loadPlayerName);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const trimmed = name.trim();

  return (
    <form
      className="flex w-full max-w-sm flex-col gap-4"
      onSubmit={async (e) => {
        e.preventDefault();
        if (!trimmed) return;
        setBusy(true);
        setError(null);
        try {
          await joinGame(code, uid, trimmed);
          savePlayerName(trimmed);
        } catch {
          setError("Couldn't join this game.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <label htmlFor="player-name" className="text-2xl font-bold">
        What&apos;s your name?
      </label>
      <input
        id="player-name"
        value={name}
        onChange={(e) => setName(e.target.value)}
        maxLength={20}
        autoComplete="nickname"
        autoFocus
        className="rounded-xl bg-blue-900 px-4 py-3 text-center text-2xl text-white placeholder:text-blue-400"
        placeholder="Display name"
      />
      <button
        type="submit"
        disabled={!trimmed || busy}
        className="rounded-xl bg-amber-400 px-6 py-3 text-xl font-black text-blue-950 disabled:opacity-40"
      >
        {busy ? "Joining…" : "Join game"}
      </button>
      {error && <p className="text-red-300">{error}</p>}
    </form>
  );
}

function PlayerBody({
  code,
  uid,
  game,
  secret,
  serverOffset,
}: {
  code: string;
  uid: string;
  game: Game;
  secret: PlayerSecret | null;
  serverOffset: number;
}) {
  const nameOf = (id?: string) => (id && game.players?.[id]?.name) || "Someone";

  if (game.status === "lobby") {
    const count = Object.keys(game.players ?? {}).length;
    return (
      <>
        <p className="text-3xl font-bold">You&apos;re in!</p>
        <Message>
          Waiting for the host to start · {count} player{count === 1 ? "" : "s"} joined
        </Message>
      </>
    );
  }

  if (game.status === "ended") {
    const mine = rankPlayers(game.players).find((p) => p.uid === uid);
    return (
      <>
        {mine && <p className="text-3xl font-black text-amber-300">You finished {ordinal(mine.place)}!</p>}
        <Standings players={game.players} highlightUid={uid} compact />
      </>
    );
  }

  if (game.status === "final") {
    return (
      <FinalPlayer
        key={game.final?.phase}
        code={code}
        uid={uid}
        game={game}
        secret={secret}
        serverOffset={serverOffset}
      />
    );
  }

  const current = game.current;
  if (!current) {
    return game.controlUid === uid ? (
      <>
        <p className="text-3xl font-bold text-amber-300">Your pick!</p>
        <Message>Tell the host a category and value.</Message>
      </>
    ) : (
      <Message>{game.controlUid ? `${nameOf(game.controlUid)} is picking the next clue.` : "Look at the board!"}</Message>
    );
  }

  const header = (
    <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">
      {current.category} ·{" "}
      {current.isDailyDouble && current.wager !== undefined ? `Wager ${formatMoney(current.wager)}` : formatMoney(current.value)}
    </p>
  );
  const clue = current.clue && <p className="max-w-md font-serif text-xl font-bold uppercase">{current.clue}</p>;

  if (current.phase === "revealed") {
    const result = current.judged?.[uid];
    const amount = current.isDailyDouble ? (current.wager ?? 0) : current.value;
    return (
      <>
        {header}
        {clue}
        <p className="text-2xl font-bold text-amber-300">{current.answer}</p>
        {result && (
          <p className={`text-xl font-bold ${result === "correct" ? "text-emerald-300" : "text-red-300"}`}>
            {result === "correct" ? `+${formatMoney(amount)}` : `−${formatMoney(amount)}`}
          </p>
        )}
      </>
    );
  }

  if (current.isDailyDouble) {
    const mine = current.ddPlayer === uid;
    return (
      <>
        <p className="text-4xl font-black text-amber-300">Daily Double!</p>
        {header}
        {clue}
        <Message>
          {current.phase === "ddWager"
            ? mine
              ? "It's yours! Tell the host your wager."
              : `${nameOf(current.ddPlayer)} is making a wager.`
            : mine
              ? "Answer out loud!"
              : `${nameOf(current.ddPlayer)} is answering.`}
        </Message>
      </>
    );
  }

  return (
    <>
      {header}
      {clue}
      <BuzzerPanel code={code} uid={uid} game={game} />
    </>
  );
}

function BuzzerPanel({ code, uid, game }: { code: string; uid: string; game: Game }) {
  const current = game.current!;
  const open = current.phase === "open";
  const judged = current.judged?.[uid];
  const queue = buzzQueue(game);
  const position = queue.findIndex((e) => e.uid === uid);
  const myTurn = currentResponder(game) === uid;
  const [sending, setSending] = useState(false);
  const [tooEarly, setTooEarly] = useState(false);

  useEffect(() => {
    if (open) navigator.vibrate?.(60);
  }, [open]);

  useEffect(() => {
    if (!tooEarly) return;
    const id = setTimeout(() => setTooEarly(false), 600);
    return () => clearTimeout(id);
  }, [tooEarly]);

  const canBuzz = open && position === -1 && !judged && !sending;

  const press = () => {
    if (!open) {
      setTooEarly(true);
      return;
    }
    if (!canBuzz) return;
    setSending(true);
    buzz(code, uid)
      .catch(() => {})
      .finally(() => setSending(false));
  };

  let label: string;
  let style: string;
  if (judged === "wrong") {
    label = "Incorrect";
    style = "bg-zinc-700 text-zinc-300";
  } else if (myTurn) {
    label = "Your turn! Answer out loud";
    style = "bg-amber-400 text-blue-950 animate-pulse";
  } else if (position >= 0) {
    label = `Buzzed · #${position + 1}`;
    style = "bg-blue-700 text-white";
  } else if (open) {
    label = "BUZZ!";
    style = "bg-red-600 text-white active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.6)]";
  } else {
    label = tooEarly ? "Not yet!" : "Locked";
    style = "bg-zinc-800 text-zinc-400";
  }

  return (
    <button
      type="button"
      onPointerDown={press}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          press();
        }
      }}
      aria-label={label}
      className={`flex aspect-square w-64 max-w-[75vw] touch-manipulation select-none items-center justify-center rounded-full p-6 text-3xl font-black transition-transform sm:w-72 ${style}`}
    >
      {label}
    </button>
  );
}

function FinalPlayer({
  code,
  uid,
  game,
  secret,
  serverOffset,
}: {
  code: string;
  uid: string;
  game: Game;
  secret: PlayerSecret | null;
  serverOffset: number;
}) {
  const final = game.final;
  const score = game.players?.[uid]?.score ?? 0;
  const eligible = !!final?.eligible?.[uid];
  const now = useNow(final?.phase === "answer");
  const [wager, setWager] = useState("");
  const [answer, setAnswer] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!final) return <Message>Final Jeopardy! is coming up…</Message>;

  const heading = (
    <>
      <p className="text-sm font-semibold uppercase tracking-widest text-blue-300">Final Jeopardy!</p>
      <p className="text-3xl font-black uppercase">{final.category}</p>
    </>
  );

  if (!eligible) {
    return (
      <>
        {heading}
        <Message>You need a positive score to play Final Jeopardy!. Watch the screen.</Message>
      </>
    );
  }

  const save = (fn: () => Promise<void>) => {
    setError(null);
    fn().catch(() => setError("Too late — that wasn't accepted."));
  };

  if (final.phase === "wager") {
    const amount = Number(wager);
    const valid = wager !== "" && Number.isInteger(amount) && amount >= 0 && amount <= score;
    return (
      <>
        {heading}
        <form
          className="flex w-full max-w-sm flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (valid) save(() => submitFinalWager(code, uid, amount));
          }}
        >
          <label htmlFor="final-wager" className="text-blue-100">
            Your secret wager ($0 – {formatMoney(score)})
          </label>
          <input
            id="final-wager"
            type="number"
            inputMode="numeric"
            min={0}
            max={score}
            value={wager}
            onChange={(e) => setWager(e.target.value)}
            className="rounded-xl bg-blue-900 px-4 py-3 text-center text-2xl text-white"
          />
          <button
            type="submit"
            disabled={!valid}
            className="rounded-xl bg-amber-400 px-6 py-3 text-xl font-black text-blue-950 disabled:opacity-40"
          >
            Lock in wager
          </button>
        </form>
        {secret?.wager !== undefined && (
          <p className="text-emerald-300">Locked in: {formatMoney(secret.wager)} (you can change it until the clue)</p>
        )}
        {error && <p className="text-red-300">{error}</p>}
      </>
    );
  }

  if (final.phase === "answer") {
    const secondsLeft = secondsUntil(final.deadline, now + serverOffset);
    if (secret?.wager === undefined) {
      return (
        <>
          {heading}
          <p className="max-w-md font-serif text-xl font-bold uppercase">{final.clue}</p>
          <Message>You didn&apos;t lock in a wager, so you&apos;re sitting this one out.</Message>
        </>
      );
    }
    return (
      <>
        {heading}
        <p className="max-w-md font-serif text-xl font-bold uppercase">{final.clue}</p>
        <p className={`text-5xl font-black tabular-nums ${secondsLeft <= 5 ? "text-red-400" : "text-amber-300"}`}>
          {secondsLeft}
        </p>
        <form
          className="flex w-full max-w-sm flex-col gap-3"
          onSubmit={(e) => {
            e.preventDefault();
            if (answer.trim()) save(() => submitFinalAnswer(code, uid, answer.trim()));
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
          <button
            type="submit"
            disabled={!answer.trim() || secondsLeft === 0}
            className="rounded-xl bg-amber-400 px-6 py-3 text-xl font-black text-blue-950 disabled:opacity-40"
          >
            {secret.answer !== undefined ? "Update response" : "Submit response"}
          </button>
        </form>
        {secret.answer !== undefined && <p className="text-emerald-300">Submitted: {secret.answer}</p>}
        {error && <p className="text-red-300">{error}</p>}
      </>
    );
  }

  const mine = final.revealed?.[uid];
  return (
    <>
      {heading}
      <p className="max-w-md font-serif text-xl font-bold uppercase">{final.clue}</p>
      <Message>Watch the screen!</Message>
      {mine?.correct !== undefined && (
        <p className={`text-2xl font-bold ${mine.correct ? "text-emerald-300" : "text-red-300"}`}>
          {mine.correct ? "+" : "−"}
          {formatMoney(mine.wager)}
        </p>
      )}
      {final.answer && <p className="text-2xl font-bold text-amber-300">{final.answer}</p>}
    </>
  );
}
