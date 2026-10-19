import { ordinal, rankPlayers } from "../../lib/format";
import type { Game } from "../../lib/types";
import Standings from "../shared/Standings";

export default function PlayerEnded({ uid, game }: { uid: string; game: Game }) {
  const mine = rankPlayers(game.players).find((p) => p.uid === uid);
  return (
    <>
      {mine && <p className="text-3xl font-black text-amber-300">You finished {ordinal(mine.place)}!</p>}
      <Standings players={game.players} highlightUid={uid} compact />
    </>
  );
}
