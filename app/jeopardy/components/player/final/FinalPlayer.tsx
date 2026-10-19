import type { Game, PlayerSecret } from "../../../lib/types";
import Message from "../Message";
import FinalAnswerForm from "./FinalAnswerForm";
import FinalHeading from "./FinalHeading";
import FinalReveal from "./FinalReveal";
import FinalWagerForm from "./FinalWagerForm";

export default function FinalPlayer({
  code,
  uid,
  game,
  secret,
  serverOffset,
}: {
  code: string;
  uid: string;
  game: Game;
  secret: PlayerSecret | null;
  serverOffset: number;
}) {
  const final = game.final;
  if (!final) return <Message>Final Jeopardy! is coming up…</Message>;

  if (!final.eligible?.[uid]) {
    return (
      <>
        <FinalHeading category={final.category} />
        <Message>You need a positive score to play Final Jeopardy!. Watch the screen.</Message>
      </>
    );
  }

  if (final.phase === "wager") {
    const score = game.players?.[uid]?.score ?? 0;
    return <FinalWagerForm code={code} uid={uid} final={final} score={score} secret={secret} />;
  }

  if (final.phase === "answer") {
    return <FinalAnswerForm code={code} uid={uid} final={final} secret={secret} serverOffset={serverOffset} />;
  }

  return <FinalReveal uid={uid} final={final} />;
}
