"use client";

import ScoreEntry from "./ScoreEntry";
import { getRememberedName } from "./leaderboardStore";

type GameOverOverlayProps = {
  score: number;
  best: number;
  onSave: (name: string) => Promise<void>;
  onRestart: () => void;
};

export default function GameOverOverlay({ score, best, onSave, onRestart }: GameOverOverlayProps) {
  return (
    <div className="absolute inset-0 z-100 flex flex-col items-center justify-center bg-[rgba(20,60,20,0.94)] p-5 text-center">
      <div className="mb-2 text-[56px]">🦶</div>
      <div className="text-[clamp(24px,8vw,44px)] font-bold tracking-[2px] text-[#e8780a] [text-shadow:2px_2px_0_#5c3d1e]">
        SPOTTED!
      </div>
      <div className="my-2 text-base tracking-[1px] text-[#f5f0e8]">
        Score: <span className="text-[1.3em] font-bold text-[#e8780a] tabular-nums">{score}</span>
      </div>
      <div className="text-[13px] text-[#90ee90] tabular-nums">Best: {best}</div>
      <ScoreEntry initialName={getRememberedName()} onSave={onSave} />
      <button
        type="button"
        onClick={onRestart}
        className="mt-4 rounded-md bg-[#e8780a] px-7 py-3 text-sm font-bold tracking-[2px] text-white shadow-[4px_4px_0_#5c3d1e] transition-transform hover:-translate-y-0.5 hover:shadow-[4px_6px_0_#5c3d1e] active:translate-y-0.5 active:shadow-[4px_2px_0_#5c3d1e]"
      >
        RUN AGAIN
      </button>
    </div>
  );
}
