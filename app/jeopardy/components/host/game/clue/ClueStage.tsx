"use client";

import { formatMoney } from "../../../../lib/format";
import JudgeButtons from "../../../shared/JudgeButtons";
import { useHostGame } from "../HostGameContext";
import BuzzList from "./BuzzList";
import ClueDisplay from "./ClueDisplay";
import DailyDoubleForm from "./DailyDoubleForm";
import HostControls from "./HostControls";
import { useClueActions } from "./useClueActions";
import { useClueShortcuts } from "./useClueShortcuts";

export default function ClueStage() {
  const { game, pending } = useHostGame();
  const actions = useClueActions();
  const { current, queue, responder, responderName, judge } = actions;
  useClueShortcuts(actions);

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 lg:flex-row">
      <ClueDisplay />

      <aside className="flex w-full flex-col gap-4 rounded-xl bg-blue-900 p-4 lg:w-96">
        {current.phase === "ddWager" ? (
          <DailyDoubleForm key={current.cell} />
        ) : current.isDailyDouble ? (
          <p className="text-lg text-white">
            <span className="font-bold text-amber-300">{game.players?.[current.ddPlayer ?? ""]?.name}</span> is playing
            the Daily Double for {formatMoney(current.wager ?? 0)}.
          </p>
        ) : (
          <BuzzList queue={queue} responder={responder} openedAt={current.phase === "open"} />
        )}

        {responder && (
          <div className="flex flex-col gap-2">
            <p className="text-center text-white">
              Judging <span className="font-bold text-amber-300">{responderName}</span>
            </p>
            <JudgeButtons className="grid grid-cols-2 gap-2" disabled={pending} onJudge={judge} shortcuts />
          </div>
        )}

        <HostControls {...actions} />
      </aside>
    </div>
  );
}
