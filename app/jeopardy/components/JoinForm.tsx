"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { CODE_LENGTH, isValidCode, normalizeCode } from "../lib/codes";

export default function JoinForm() {
  const router = useRouter();
  const [code, setCode] = useState("");
  const valid = isValidCode(code);

  return (
    <div className="flex flex-col gap-8">
      <form
        onSubmit={(e) => {
          e.preventDefault();
          if (valid) router.push(`/jeopardy/play/${code}`);
        }}
        className="flex flex-col gap-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800"
      >
        <label htmlFor="room-code" className="text-lg font-medium text-black dark:text-zinc-50">
          Join a game
        </label>
        <div className="flex flex-col gap-3 sm:flex-row">
          <input
            id="room-code"
            value={code}
            onChange={(e) => setCode(normalizeCode(e.target.value))}
            placeholder="ROOM CODE"
            autoComplete="off"
            autoCapitalize="characters"
            maxLength={CODE_LENGTH}
            className="w-full rounded-lg border border-zinc-300 bg-white px-4 py-3 font-mono text-2xl tracking-[0.4em] uppercase text-black placeholder:text-zinc-300 placeholder:tracking-widest sm:w-56 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50 dark:placeholder:text-zinc-600"
          />
          <button
            type="submit"
            disabled={!valid}
            className="rounded-lg bg-blue-700 px-6 py-3 font-semibold text-white transition-colors hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-40"
          >
            Join
          </button>
        </div>
        <p className="text-sm text-zinc-500 dark:text-zinc-400">
          Enter the 4-letter code shown on the host&apos;s screen.
        </p>
      </form>

      <Link
        href="/jeopardy/host"
        className="flex flex-col gap-1 rounded-xl border border-zinc-200 p-6 transition-colors hover:border-zinc-300 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:border-zinc-700 dark:hover:bg-zinc-900"
      >
        <span className="text-lg font-medium text-black dark:text-zinc-50">Host a game →</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          Sign in with Google to build boards and run a game on a shared screen.
        </span>
      </Link>
    </div>
  );
}
