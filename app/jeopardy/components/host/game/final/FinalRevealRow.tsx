"use client";

import { formatMoney } from "../../../../lib/format";
import { judgeFinal, revealFinalResponse } from "../../../../lib/game";
import JudgeButtons from "../../../shared/JudgeButtons";
import { ACTION_BUTTON as ACTION, TONE } from "../../../shared/ui";
import { useHostGame } from "../HostGameContext";

export default function FinalRevealRow({ uid }: { uid: string }) {
  const { code, game, secrets, pending, act } = useHostGame();
  const player = game.players![uid];
  const shown = game.final!.revealed?.[uid];
  const secret = secrets?.[uid];
  const wager = shown?.wager ?? 0;

  return (
    <li className="flex flex-col gap-3 rounded-xl bg-blue-800 p-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex flex-col items-start text-left">
        <span className="text-xl font-bold text-white">{player.name}</span>
        <span className="text-amber-300">{formatMoney(player.score)}</span>
      </div>
      {!shown ? (
        <button
          type="button"
          disabled={pending}
          onClick={() => act(() => revealFinalResponse(code, uid, secret))}
          className={`${ACTION} ${TONE.primary}`}
        >
          Show response
        </button>
      ) : (
        <div className="flex flex-col items-end gap-2">
          <span className="text-2xl font-bold text-white">{shown.answer || "(no response)"}</span>
          {shown.correct === undefined ? (
            <JudgeButtons
              className="flex gap-2"
              disabled={pending}
              onJudge={(correct) => act(() => judgeFinal(code, uid, wager, correct))}
            />
          ) : (
            <span className={shown.correct ? "text-emerald-300" : "text-red-300"}>
              {shown.correct ? "+" : "−"}
              {formatMoney(wager)} wager
            </span>
          )}
        </div>
      )}
    </li>
  );
}
