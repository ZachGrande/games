import { formatTime } from "./format";

export default function WinOverlay({
  moves,
  elapsed,
  onPlayAgain,
}: {
  moves: number;
  elapsed: number;
  onPlayAgain: () => void;
}) {
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-white/85 text-center backdrop-blur-sm dark:bg-black/85">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
          You won!
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          {moves} moves · {formatTime(elapsed)}
        </p>
      </div>
      <button
        type="button"
        onClick={onPlayAgain}
        className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
      >
        Play Again
      </button>
    </div>
  );
}
