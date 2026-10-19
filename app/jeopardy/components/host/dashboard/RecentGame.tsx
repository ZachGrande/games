"use client";

import Link from "next/link";
import { useGame } from "../../../lib/hooks";

export default function RecentGame({ code, uid }: { code: string; uid: string }) {
  const { value: game } = useGame(code);
  if (!game || game.hostUid !== uid) return null;
  return (
    <li>
      <Link
        href={`/jeopardy/host/${code}`}
        className="flex items-center justify-between rounded-xl border border-zinc-200 p-4 transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
      >
        <span className="flex flex-col">
          <span className="font-medium text-black dark:text-zinc-50">{game.title}</span>
          <span className="text-sm text-zinc-500 dark:text-zinc-400">
            {Object.keys(game.players ?? {}).length} players · {game.status}
          </span>
        </span>
        <span className="font-mono text-lg tracking-widest text-blue-700 dark:text-blue-400">{code}</span>
      </Link>
    </li>
  );
}
