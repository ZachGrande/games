import type { Game } from "../../lib/types";
import Message from "./Message";

export default function PlayerLobby({ game }: { game: Game }) {
  const count = Object.keys(game.players ?? {}).length;
  return (
    <>
      <p className="text-3xl font-bold">You&apos;re in!</p>
      <Message>
        Waiting for the host to start · {count} player{count === 1 ? "" : "s"} joined
      </Message>
    </>
  );
}
