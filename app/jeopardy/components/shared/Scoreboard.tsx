"use client";

import { formatMoney, playersByJoinOrder } from "../../lib/format";
import type { Player } from "../../lib/types";
import PresenceDot from "./PresenceDot";

export default function Scoreboard({
  players,
  controlUid,
  highlightUid,
  onSelectControl,
}: {
  players: Record<string, Player> | undefined;
  controlUid?: string;
  highlightUid?: string;
  onSelectControl?: (uid: string) => void;
}) {
  const list = playersByJoinOrder(players);
  if (list.length === 0) return null;

  return (
    <div className="flex flex-wrap justify-center gap-2">
      {list.map(([uid, p]) => {
        const hasControl = uid === controlUid;
        return (
          <button
            key={uid}
            type="button"
            disabled={!onSelectControl}
            onClick={() => onSelectControl?.(uid)}
            title={onSelectControl ? "Give this player control of the board" : undefined}
            className={`flex min-w-28 flex-col items-center rounded-lg border-2 px-4 py-2 transition-colors ${
              uid === highlightUid
                ? "border-amber-300 bg-blue-700"
                : hasControl
                  ? "border-white/70 bg-blue-800"
                  : "border-transparent bg-blue-800"
            } ${onSelectControl ? "hover:bg-blue-700" : ""}`}
          >
            <span className="flex items-center gap-1.5 text-sm font-medium text-white">
              <PresenceDot connected={p.connected !== false} />
              {p.name}
              {hasControl && <span aria-label="has control">★</span>}
            </span>
            <span className={`text-xl font-bold ${p.score < 0 ? "text-red-400" : "text-amber-300"}`}>
              {formatMoney(p.score)}
            </span>
          </button>
        );
      })}
    </div>
  );
}
