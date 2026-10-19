"use client";

import { useState } from "react";
import { formatMoney, parseWholeNumber } from "../../../lib/format";
import { submitFinalWager } from "../../../lib/game";
import type { LiveFinal, PlayerSecret } from "../../../lib/types";
import { PLAYER_SUBMIT_BUTTON } from "../../shared/ui";
import FinalHeading from "./FinalHeading";

export default function FinalWagerForm({
  code,
  uid,
  final,
  score,
  secret,
}: {
  code: string;
  uid: string;
  final: LiveFinal;
  score: number;
  secret: PlayerSecret | null;
}) {
  const [wager, setWager] = useState("");
  const [error, setError] = useState<string | null>(null);
  const amount = parseWholeNumber(wager, 0, score);

  return (
    <>
      <FinalHeading category={final.category} />
      <form
        className="flex w-full max-w-sm flex-col gap-3"
        onSubmit={(e) => {
          e.preventDefault();
          if (amount === null) return;
          setError(null);
          submitFinalWager(code, uid, amount).catch(() => setError("Too late — that wasn't accepted."));
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
        <button type="submit" disabled={amount === null} className={PLAYER_SUBMIT_BUTTON}>
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
