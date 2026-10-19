import { formatMoney } from "../../lib/format";
import type { Game } from "../../lib/types";
import BuzzerButton from "./BuzzerButton";
import ClueHeader from "./ClueHeader";
import Message from "./Message";

export default function PlayerClue({ code, uid, game }: { code: string; uid: string; game: Game }) {
  const nameOf = (id?: string) => (id && game.players?.[id]?.name) || "Someone";

  const current = game.current;
  if (!current) {
    return game.controlUid === uid ? (
      <>
        <p className="text-3xl font-bold text-amber-300">Your pick!</p>
        <Message>Tell the host a category and value.</Message>
      </>
    ) : (
      <Message>
        {game.controlUid ? `${nameOf(game.controlUid)} is picking the next clue.` : "Look at the board!"}
      </Message>
    );
  }

  const header = <ClueHeader current={current} />;
  const clue = current.clue && <p className="max-w-md font-serif text-xl font-bold uppercase">{current.clue}</p>;

  if (current.phase === "revealed") {
    const result = current.judged?.[uid];
    const amount = current.isDailyDouble ? (current.wager ?? 0) : current.value;
    return (
      <>
        {header}
        {clue}
        <p className="text-2xl font-bold text-amber-300">{current.answer}</p>
        {result && (
          <p className={`text-xl font-bold ${result === "correct" ? "text-emerald-300" : "text-red-300"}`}>
            {result === "correct" ? `+${formatMoney(amount)}` : `−${formatMoney(amount)}`}
          </p>
        )}
      </>
    );
  }

  if (current.isDailyDouble) {
    const mine = current.ddPlayer === uid;
    return (
      <>
        <p className="text-4xl font-black text-amber-300">Daily Double!</p>
        {header}
        {clue}
        <Message>
          {current.phase === "ddWager"
            ? mine
              ? "It's yours! Tell the host your wager."
              : `${nameOf(current.ddPlayer)} is making a wager.`
            : mine
              ? "Answer out loud!"
              : `${nameOf(current.ddPlayer)} is answering.`}
        </Message>
      </>
    );
  }

  return (
    <>
      {header}
      {clue}
      <BuzzerButton code={code} uid={uid} game={game} />
    </>
  );
}
