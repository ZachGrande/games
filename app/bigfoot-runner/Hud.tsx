"use client";

type HudProps = {
  score: number;
  best: number;
  speedLabel: string;
};

export default function Hud({ score, best, speedLabel }: HudProps) {
  return (
    <div className="pointer-events-none absolute inset-x-3 top-3 z-10 flex justify-between gap-2">
      <div className="rounded-md border border-[#4a9e4a] bg-[rgba(20,60,20,0.7)] px-3 py-1.5 text-center text-sm leading-tight tracking-[1px] text-white shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
        <span className="block text-[0.65em] text-[#90ee90]">SCORE</span>
        <span className="tabular-nums">{score}</span>
      </div>
      <div className="rounded-md border border-[#4a9e4a] bg-[rgba(20,60,20,0.7)] px-3 py-1.5 text-center text-sm leading-tight tracking-[1px] text-white shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
        <span className="block text-[0.65em] text-[#90ee90]">BEST</span>
        <span className="tabular-nums">{best}</span>
      </div>
      <div className="rounded-md border border-[#4a9e4a] bg-[rgba(20,60,20,0.7)] px-3 py-1.5 text-center text-sm leading-tight tracking-[1px] text-white shadow-[2px_2px_0_rgba(0,0,0,0.3)]">
        <span className="block text-[0.65em] text-[#90ee90]">SPEED</span>
        <span className="tabular-nums">{speedLabel}</span>
      </div>
    </div>
  );
}
