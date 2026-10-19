import type { Game } from "../../../../lib/types";

export default function StatusList({
  game,
  uids,
  done,
  doneLabel,
}: {
  game: Game;
  uids: string[];
  done: (uid: string) => boolean;
  doneLabel: string;
}) {
  return (
    <ul className="flex flex-wrap justify-center gap-2">
      {uids.map((uid) => (
        <li
          key={uid}
          className={`rounded-lg px-4 py-2 text-lg ${done(uid) ? "bg-emerald-600 text-white" : "bg-blue-800 text-blue-200"}`}
        >
          {game.players?.[uid]?.name} {done(uid) ? `· ${doneLabel} ✓` : "· waiting"}
        </li>
      ))}
    </ul>
  );
}
