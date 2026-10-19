"use client";

import { QRCodeSVG } from "qrcode.react";
import { useState } from "react";
import { formatMoney, parseWholeNumber, playersByJoinOrder } from "../../../lib/format";
import { kickPlayer, setScore } from "../../../lib/game";
import PresenceDot from "../../shared/PresenceDot";
import { useHostGame } from "./HostGameContext";

export default function HostTools({ onClose }: { onClose: () => void }) {
  const { code, game, pending, act } = useHostGame();
  const players = playersByJoinOrder(game.players);
  const keyUrl = `${window.location.origin}/jeopardy/host/${code}/key`;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Host tools"
        className="flex max-h-full w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-2xl bg-blue-950 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Host tools</h2>
          <button type="button" onClick={onClose} className="text-blue-300 hover:text-white">
            Close ✕
          </button>
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="font-semibold text-blue-200">Players & scores</h3>
          {players.length === 0 && <p className="text-blue-300">No players yet.</p>}
          {players.map(([uid, p]) => (
            <ScoreRow
              key={`${uid}-${p.score}`}
              name={p.name}
              score={p.score}
              connected={p.connected !== false}
              pending={pending}
              onSave={(score) => act(() => setScore(code, uid, score))}
              onKick={() => {
                if (confirm(`Remove ${p.name} from the game?`)) act(() => kickPlayer(code, game, uid));
              }}
            />
          ))}
        </section>

        <section className="flex items-center gap-4 rounded-xl bg-blue-900 p-4">
          <div className="rounded-lg bg-white p-2">
            <QRCodeSVG value={keyUrl} size={96} />
          </div>
          <p className="text-sm text-blue-100">
            <span className="font-semibold text-white">Answer key on your phone:</span> scan this while signed in to
            the same Google account to see the current response privately. Only you can open it.
          </p>
        </section>
      </div>
    </div>
  );
}

function ScoreRow({
  name,
  score,
  connected,
  pending,
  onSave,
  onKick,
}: {
  name: string;
  score: number;
  connected: boolean;
  pending: boolean;
  onSave: (score: number) => void;
  onKick: () => void;
}) {
  const [draft, setDraft] = useState(String(score));
  const parsed = parseWholeNumber(draft);
  const changed = parsed !== null && parsed !== score;

  return (
    <form
      className="flex flex-wrap items-center gap-2 rounded-lg bg-blue-900 px-3 py-2"
      onSubmit={(e) => {
        e.preventDefault();
        if (changed) onSave(parsed);
      }}
    >
      <span className="flex min-w-32 flex-1 items-center gap-2">
        <PresenceDot connected={connected} />
        {name}
        <span className="text-sm text-blue-300">{formatMoney(score)}</span>
      </span>
      <input
        type="number"
        inputMode="numeric"
        step={1}
        value={draft}
        onChange={(e) => setDraft(e.target.value)}
        aria-label={`Score for ${name}`}
        className="w-28 rounded-md bg-blue-800 px-2 py-1 text-white"
      />
      <button
        type="submit"
        disabled={!changed || pending}
        className="rounded-md bg-amber-400 px-3 py-1 text-sm font-semibold text-blue-950 disabled:opacity-40"
      >
        Set
      </button>
      <button type="button" onClick={onKick} className="rounded-md px-2 py-1 text-sm text-red-300 hover:bg-blue-800">
        Remove
      </button>
    </form>
  );
}
