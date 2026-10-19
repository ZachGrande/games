"use client";

import { clueValueLabel } from "../../../../lib/format";
import { useHostGame } from "../HostGameContext";

export default function ClueDisplay() {
  const { game } = useHostGame();
  const current = game.current!;
  const correctUid = Object.entries(current.judged ?? {}).find(([, j]) => j === "correct")?.[0];

  return (
    <section className="flex flex-1 flex-col rounded-xl bg-blue-800 p-6 text-center shadow-lg">
      <p className="text-lg font-semibold uppercase tracking-wide text-blue-200 sm:text-2xl">
        {current.category} · {clueValueLabel(current)}
      </p>

      <div className="flex flex-1 flex-col items-center justify-center gap-6 py-6">
        {current.phase === "ddWager" ? (
          <p className="animate-pulse font-serif text-6xl font-black uppercase text-amber-300 sm:text-8xl">
            Daily Double!
          </p>
        ) : (
          <p className="max-w-5xl font-serif text-3xl font-bold uppercase leading-snug text-white sm:text-5xl lg:text-6xl">
            {current.clue}
          </p>
        )}
        {current.phase === "revealed" && (
          <div className="flex flex-col items-center gap-2">
            <p className="text-2xl font-bold text-amber-300 sm:text-4xl">{current.answer}</p>
            <p className="text-lg text-blue-100">
              {correctUid ? `${game.players?.[correctUid]?.name ?? "Someone"} got it!` : "No one got it."}
            </p>
          </div>
        )}
      </div>

      <p className="text-sm text-blue-300">
        {current.phase === "reading" && !current.isDailyDouble && "Buzzers locked · Space to open"}
        {current.phase === "open" && "Buzzers open!"}
      </p>
    </section>
  );
}
