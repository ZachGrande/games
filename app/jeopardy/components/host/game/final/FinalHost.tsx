"use client";

import { useHostGame } from "../HostGameContext";
import FinalAnswerPhase from "./FinalAnswerPhase";
import FinalRevealPhase from "./FinalRevealPhase";
import FinalWagerPhase from "./FinalWagerPhase";

export default function FinalHost() {
  const { game } = useHostGame();
  const final = game.final!;

  return (
    <div className="flex flex-1 flex-col items-center gap-8 p-6 text-center">
      <p className="text-2xl font-bold uppercase tracking-widest text-blue-200">Final Jeopardy!</p>
      <p className="text-4xl font-black uppercase text-white sm:text-6xl">{final.category}</p>

      {final.phase === "wager" && <FinalWagerPhase />}
      {final.phase === "answer" && <FinalAnswerPhase />}
      {final.phase === "reveal" && <FinalRevealPhase />}
    </div>
  );
}
