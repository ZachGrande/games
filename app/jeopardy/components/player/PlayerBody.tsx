import type { Game, PlayerSecret } from "../../lib/types";
import FinalPlayer from "./final/FinalPlayer";
import PlayerClue from "./PlayerClue";
import PlayerEnded from "./PlayerEnded";
import PlayerLobby from "./PlayerLobby";

export default function PlayerBody({
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
  if (game.status === "lobby") return <PlayerLobby game={game} />;
  if (game.status === "ended") return <PlayerEnded uid={uid} game={game} />;

  if (game.status === "final") {
    return (
      <FinalPlayer
        key={game.final?.phase}
        code={code}
        uid={uid}
        game={game}
        secret={secret}
        serverOffset={serverOffset}
      />
    );
  }

  return <PlayerClue code={code} uid={uid} game={game} />;
}
