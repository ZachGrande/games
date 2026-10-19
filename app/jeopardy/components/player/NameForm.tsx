"use client";

import { useState } from "react";
import { joinGame } from "../../lib/game";
import { loadPlayerName, savePlayerName } from "../../lib/hooks";
import { PLAYER_SUBMIT_BUTTON } from "../shared/ui";

export default function NameForm({ code, uid }: { code: string; uid: string }) {
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
      <button type="submit" disabled={!trimmed || busy} className={PLAYER_SUBMIT_BUTTON}>
        {busy ? "Joining…" : "Join game"}
      </button>
      {error && <p className="text-red-300">{error}</p>}
    </form>
  );
}
