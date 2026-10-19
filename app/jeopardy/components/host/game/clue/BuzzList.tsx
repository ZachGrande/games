import type { buzzQueue } from "../../../../lib/game";

export default function BuzzList({
  queue,
  responder,
  openedAt,
}: {
  queue: ReturnType<typeof buzzQueue>;
  responder: string | null;
  openedAt: boolean;
}) {
  if (queue.length === 0) {
    return <p className="text-blue-200">{openedAt ? "Waiting for buzzes…" : "No buzzes yet."}</p>;
  }
  const first = queue[0].at;
  return (
    <ol className="flex flex-col gap-1.5">
      {queue.map((entry, i) => (
        <li
          key={entry.uid}
          className={`flex items-center justify-between rounded-lg px-3 py-2 ${
            entry.uid === responder
              ? "bg-amber-300 font-bold text-blue-950"
              : entry.judged === "wrong"
                ? "bg-blue-950 text-blue-400 line-through"
                : entry.judged === "correct"
                  ? "bg-emerald-500 text-white"
                  : "bg-blue-800 text-white"
          }`}
        >
          <span>
            {i + 1}. {entry.name}
          </span>
          <span className="text-xs opacity-75">
            {i === 0 ? "first" : `+${((entry.at - first) / 1000).toFixed(2)}s`}
          </span>
        </li>
      ))}
    </ol>
  );
}
