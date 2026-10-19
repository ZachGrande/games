"use client";

import { useState } from "react";
import { formatMoney, parseWholeNumber } from "../../../lib/format";
import PresenceDot from "../../shared/PresenceDot";

export default function ScoreRow({
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
