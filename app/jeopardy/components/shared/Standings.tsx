"use client";

import { formatMoney, ordinal, rankPlayers } from "../../lib/format";
import type { Player } from "../../lib/types";

const PODIUM = [
  { place: 1, height: "h-40", color: "bg-amber-400 text-blue-950" },
  { place: 2, height: "h-28", color: "bg-zinc-300 text-blue-950" },
  { place: 3, height: "h-20", color: "bg-orange-400 text-blue-950" },
];

export default function Standings({
  players,
  highlightUid,
  compact,
}: {
  players: Record<string, Player> | undefined;
  highlightUid?: string;
  compact?: boolean;
}) {
  const ranked = rankPlayers(players);
  if (ranked.length === 0) return <p className="text-center text-blue-200">No players.</p>;
  // Visual podium order: 2nd, 1st, 3rd.
  const podium = [ranked[1], ranked[0], ranked[2]].filter(Boolean);

  return (
    <div className="flex w-full flex-col items-center gap-8">
      {!compact && (
        <div className="flex items-end justify-center gap-3">
          {podium.map((p) => {
            const style = PODIUM.find((s) => s.place === p.place) ?? PODIUM[2];
            return (
              <div key={p.uid} className="flex w-36 flex-col items-center gap-2 sm:w-44">
                <span className="text-center text-xl font-bold text-white sm:text-2xl">{p.name}</span>
                <span className="text-lg font-semibold text-amber-300">{formatMoney(p.score)}</span>
                <div
                  className={`flex w-full items-start justify-center rounded-t-lg pt-2 text-3xl font-black ${style.height} ${style.color}`}
                >
                  {p.place}
                </div>
              </div>
            );
          })}
        </div>
      )}
      <ol className="flex w-full max-w-md flex-col gap-1.5">
        {ranked.map((p) => (
          <li
            key={p.uid}
            className={`flex items-center justify-between rounded-lg px-4 py-2 ${
              p.uid === highlightUid ? "bg-amber-300 text-blue-950" : "bg-blue-800 text-white"
            }`}
          >
            <span className="font-medium">
              {ordinal(p.place)} · {p.name}
            </span>
            <span className="font-bold">{formatMoney(p.score)}</span>
          </li>
        ))}
      </ol>
    </div>
  );
}
