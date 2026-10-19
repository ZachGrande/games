"use client";

import { QRCodeSVG } from "qrcode.react";
import { playersByJoinOrder } from "../../../lib/format";
import type { Game } from "../../../lib/types";
import PresenceDot from "../../shared/PresenceDot";

export default function HostLobby({
  code,
  game,
  pending,
  onStart,
  onKick,
}: {
  code: string;
  game: Game;
  pending: boolean;
  onStart: () => void;
  onKick: (uid: string) => void;
}) {
  const joinUrl = `${window.location.origin}/jeopardy/play/${code}`;
  const players = playersByJoinOrder(game.players);

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-10 p-6 lg:flex-row lg:gap-16">
      <div className="flex flex-col items-center gap-4">
        <p className="text-xl text-blue-200">
          Join at <span className="font-semibold text-white">{window.location.host}/jeopardy</span>
        </p>
        <p className="font-mono text-7xl font-black tracking-[0.3em] text-amber-300 sm:text-9xl">{code}</p>
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={joinUrl} size={200} />
        </div>
      </div>

      <div className="flex w-full max-w-md flex-col gap-4">
        <h2 className="text-2xl font-bold text-white">
          Players <span className="text-blue-300">({players.length})</span>
        </h2>
        {players.length === 0 ? (
          <p className="text-blue-200">Waiting for players to join…</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {players.map(([uid, p]) => (
              <li key={uid} className="flex items-center justify-between rounded-lg bg-blue-800 px-4 py-2">
                <span className="flex items-center gap-2 text-lg text-white">
                  <PresenceDot connected={p.connected !== false} size="md" />
                  {p.name}
                </span>
                <button
                  type="button"
                  onClick={() => onKick(uid)}
                  className="text-sm text-blue-300 hover:text-red-300"
                  aria-label={`Remove ${p.name}`}
                >
                  Remove
                </button>
              </li>
            ))}
          </ul>
        )}
        <button
          type="button"
          disabled={pending || players.length === 0}
          onClick={onStart}
          className="mt-2 rounded-xl bg-amber-400 px-6 py-4 text-xl font-black text-blue-950 transition-colors hover:bg-amber-300 disabled:opacity-40"
        >
          Start game
        </button>
      </div>
    </div>
  );
}
