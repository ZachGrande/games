"use client";

import { setControl } from "../../../lib/game";
import Scoreboard from "../../shared/Scoreboard";
import { useHostGame } from "./HostGameContext";

export default function HostFooter() {
  const { code, game, pending, act } = useHostGame();

  return (
    <footer className="border-t border-blue-900 p-3">
      <Scoreboard
        players={game.players}
        controlUid={game.status === "playing" ? game.controlUid : undefined}
        onSelectControl={game.status === "playing" && !pending ? (uid) => act(() => setControl(code, uid)) : undefined}
      />
    </footer>
  );
}
