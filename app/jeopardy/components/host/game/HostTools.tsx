"use client";

import { playersByJoinOrder } from "../../../lib/format";
import { kickPlayer, setScore } from "../../../lib/game";
import AnswerKeyQr from "./AnswerKeyQr";
import { useHostGame } from "./HostGameContext";
import ScoreRow from "./ScoreRow";

export default function HostTools({ onClose }: { onClose: () => void }) {
  const { code, game, pending, act } = useHostGame();
  const players = playersByJoinOrder(game.players);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      onClick={onClose}
      role="presentation"
    >
      <div
        role="dialog"
        aria-label="Host tools"
        className="flex max-h-full w-full max-w-2xl flex-col gap-6 overflow-y-auto rounded-2xl bg-blue-950 p-6 text-white shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Host tools</h2>
          <button type="button" onClick={onClose} className="text-blue-300 hover:text-white">
            Close ✕
          </button>
        </div>

        <section className="flex flex-col gap-2">
          <h3 className="font-semibold text-blue-200">Players & scores</h3>
          {players.length === 0 && <p className="text-blue-300">No players yet.</p>}
          {players.map(([uid, p]) => (
            <ScoreRow
              key={`${uid}-${p.score}`}
              name={p.name}
              score={p.score}
              connected={p.connected !== false}
              pending={pending}
              onSave={(score) => act(() => setScore(code, uid, score))}
              onKick={() => {
                if (confirm(`Remove ${p.name} from the game?`)) act(() => kickPlayer(code, game, uid));
              }}
            />
          ))}
        </section>

        <AnswerKeyQr />
      </div>
    </div>
  );
}
