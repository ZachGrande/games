export default function GameOverlay({
  variant,
  score,
  onKeepPlaying,
  onPlayAgain,
}: {
  variant: "won" | "over";
  score: number;
  onKeepPlaying: () => void;
  onPlayAgain: () => void;
}) {
  const won = variant === "won";
  return (
    <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 rounded-xl bg-white/85 text-center backdrop-blur-sm dark:bg-black/85">
      <div className="flex flex-col gap-1">
        <h2 className="text-2xl font-semibold text-black dark:text-zinc-50">
          {won ? "You hit 2048!" : "Game over"}
        </h2>
        <p className="text-zinc-500 dark:text-zinc-400">
          Score: {score.toLocaleString()}
        </p>
      </div>
      <div className="flex gap-3">
        {won && (
          <button
            type="button"
            onClick={onKeepPlaying}
            className="rounded-lg border border-zinc-200 px-5 py-2.5 text-sm font-medium text-black transition-colors hover:bg-zinc-50 dark:border-zinc-800 dark:text-zinc-50 dark:hover:bg-zinc-900"
          >
            Keep Going
          </button>
        )}
        <button
          type="button"
          onClick={onPlayAgain}
          className="rounded-lg bg-black px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-zinc-800 dark:bg-zinc-50 dark:text-black dark:hover:bg-zinc-200"
        >
          Play Again
        </button>
      </div>
    </div>
  );
}
