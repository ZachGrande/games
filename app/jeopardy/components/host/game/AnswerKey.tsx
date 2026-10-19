"use client";

import type { User } from "firebase/auth";
import { formatMoney } from "../../../lib/format";
import { useGame, useGamePrivate } from "../../../lib/hooks";

/** Private, read-only view of the current response for the host's phone. */
export default function AnswerKey({ user, code }: { user: User; code: string }) {
  const { value: game } = useGame(code);
  const isHost = !!game && game.hostUid === user.uid;
  const { value: priv } = useGamePrivate(code, isHost);

  let body: React.ReactNode;
  if (game === undefined || (isHost && priv === undefined)) {
    body = <p className="text-blue-200">Loading…</p>;
  } else if (!game || !isHost || !priv) {
    body = <p className="text-blue-200">Only the host of game {code} can view its answer key.</p>;
  } else if (game.status === "final" && priv.final) {
    body = (
      <Entry heading={`Final Jeopardy! · ${priv.final.category}`} clue={priv.final.clue} answer={priv.final.answer} />
    );
  } else if (game.status === "playing" && game.current) {
    const cell = priv.rounds[game.round]?.cells[game.current.cell];
    body = (
      <Entry
        heading={`${game.current.category} · ${formatMoney(game.current.value)}${cell?.dd ? " · Daily Double" : ""}`}
        clue={cell?.clue ?? ""}
        answer={cell?.answer ?? ""}
      />
    );
  } else {
    body = <p className="text-blue-200">Waiting for the next clue…</p>;
  }

  return (
    <div className="flex min-h-screen flex-col gap-6 bg-blue-950 p-6 text-white">
      <p className="text-sm uppercase tracking-widest text-blue-300">Answer key · {code}</p>
      {body}
    </div>
  );
}

function Entry({ heading, clue, answer }: { heading: string; clue: string; answer: string }) {
  return (
    <div className="flex flex-col gap-4">
      <p className="text-sm font-semibold uppercase text-blue-300">{heading}</p>
      <p className="text-lg text-blue-100">{clue}</p>
      <p className="text-3xl font-bold text-amber-300">{answer || "(no response entered)"}</p>
    </div>
  );
}
