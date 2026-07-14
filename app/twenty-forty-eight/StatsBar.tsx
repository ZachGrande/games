function Stat({ label, value }: { label: string; value: string }) {
  return (
    <span className="flex flex-col">
      <span className="text-zinc-400 dark:text-zinc-500">{label}</span>
      <span className="text-lg font-semibold tabular-nums text-black dark:text-zinc-50">
        {value}
      </span>
    </span>
  );
}

export default function StatsBar({
  score,
  best,
  onRestart,
}: {
  score: number;
  best: number;
  onRestart: () => void;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div className="flex gap-6 text-sm">
        <Stat label="Score" value={score.toLocaleString()} />
        <Stat label="Best" value={best.toLocaleString()} />
      </div>
      <button
        type="button"
        onClick={onRestart}
        className="rounded-lg border border-zinc-200 px-4 py-2 text-sm font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
      >
        New Game
      </button>
    </div>
  );
}
