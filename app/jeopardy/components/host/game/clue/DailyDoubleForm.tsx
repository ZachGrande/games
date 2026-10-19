"use client";

import { useState } from "react";
import { formatMoney, parseWholeNumber, playersByJoinOrder } from "../../../../lib/format";
import { setDailyDoubleWager } from "../../../../lib/game";
import { roundMaxValue } from "../../../../lib/types";
import { ACTION_BUTTON as ACTION, TONE } from "../../../shared/ui";
import { useHostGame } from "../HostGameContext";

export default function DailyDoubleForm() {
  const { code, game, priv, pending, act } = useHostGame();
  const players = playersByJoinOrder(game.players);
  const [uid, setUid] = useState(game.current?.ddPlayer ?? players[0]?.[0] ?? "");
  const [wager, setWager] = useState("");
  const score = game.players?.[uid]?.score ?? 0;
  const max = Math.max(score, roundMaxValue(game.round));
  const amount = parseWholeNumber(wager, 5, max);
  const valid = !!uid && amount !== null;

  return (
    <form
      className="flex flex-col gap-3"
      onSubmit={(e) => {
        e.preventDefault();
        if (valid) act(() => setDailyDoubleWager(code, game, priv, uid, amount));
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
      <button type="submit" disabled={!valid || pending} className={`${ACTION} ${TONE.primary}`}>
        Show clue
      </button>
    </form>
  );
}
