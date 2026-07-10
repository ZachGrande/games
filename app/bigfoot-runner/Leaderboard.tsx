"use client";

import type { ScoreEntry } from "./leaderboardStore";

const MEDALS = ["🥇", "🥈", "🥉"];

export interface LeaderboardProps {
  scores: ScoreEntry[];
  loading: boolean;
  onRefresh: () => void;
}

/** Retro high-scores card shown below the game canvas. */
export default function Leaderboard({ scores, loading, onRefresh }: LeaderboardProps) {
  return (
    <div className="mx-auto mt-4 w-full max-w-190 font-mono">
      <div className="rounded-2xl border border-[#3a7a3a] bg-[linear-gradient(135deg,#1a3a1a,#2d5a2d)] px-4 pb-3 pt-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="text-[15px] font-bold tracking-[2px] text-[#e8780a]">
            🏆 HIGH SCORES
          </div>
          <button
            type="button"
            onClick={onRefresh}
            className="rounded border border-[#4a9e4a] px-2 py-1 text-[10px] tracking-[1px] text-[#90ee90] transition-colors hover:bg-[rgba(74,158,74,0.15)]"
          >
            REFRESH
          </button>
        </div>

        <div className="text-[13px]">
          {loading ? (
            <div className="py-2.5 text-center text-xs text-[#90ee90]">Loading…</div>
          ) : scores.length === 0 ? (
            <div className="py-2.5 text-center text-xs text-[#90ee90] opacity-70">
              No scores yet — be first!
            </div>
          ) : (
            scores.map((s, i) => {
              const isTop = i < 3;
              return (
                <div
                  key={`${s.ts}-${i}`}
                  className={`flex items-center border-b border-[rgba(74,158,74,0.2)] px-1 py-1.5 ${
                    isTop ? "mb-0.5 rounded-md bg-[rgba(232,120,10,0.08)]" : ""
                  }`}
                >
                  <span className={`w-7 ${isTop ? "text-base" : "text-xs"}`}>
                    {MEDALS[i] ?? `${i + 1}.`}
                  </span>
                  <span className="flex-1 overflow-hidden text-ellipsis whitespace-nowrap text-[13px] text-[#f5f0e8]">
                    {s.name}
                  </span>
                  <span className="text-sm font-bold tabular-nums text-[#e8780a]">
                    {s.score}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
