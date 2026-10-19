import { formatMoney } from "../../../lib/format";
import type { LiveFinal } from "../../../lib/types";
import Message from "../Message";
import FinalHeading from "./FinalHeading";

export default function FinalReveal({ uid, final }: { uid: string; final: LiveFinal }) {
  const mine = final.revealed?.[uid];
  return (
    <>
      <FinalHeading category={final.category} />
      <p className="max-w-md font-serif text-xl font-bold uppercase">{final.clue}</p>
      <Message>Watch the screen!</Message>
      {mine?.correct !== undefined && (
        <p className={`text-2xl font-bold ${mine.correct ? "text-emerald-300" : "text-red-300"}`}>
          {mine.correct ? "+" : "−"}
          {formatMoney(mine.wager)}
        </p>
      )}
      {final.answer && <p className="text-2xl font-bold text-amber-300">{final.answer}</p>}
    </>
  );
}
