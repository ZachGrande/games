"use client";

import type { User } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { useGame, useGamePrivate, useGameSecrets, useServerOffset } from "../../../lib/hooks";
import BoardStage from "./BoardStage";
import Centered from "./Centered";
import ClueStage from "./clue/ClueStage";
import EndScreen from "./EndScreen";
import FinalHost from "./final/FinalHost";
import HostFooter from "./HostFooter";
import { HostGameProvider } from "./HostGameContext";
import HostHeader from "./HostHeader";
import HostLobby from "./HostLobby";
import HostTools from "./HostTools";
import { useHostActions } from "./useHostActions";

export default function HostGame({ user, code }: { user: User; code: string }) {
  const { value: game, error } = useGame(code);
  const isHost = !!game && game.hostUid === user.uid;
  const { value: priv } = useGamePrivate(code, isHost);
  const { value: secrets } = useGameSecrets(code, isHost && game?.status === "final");
  const serverOffset = useServerOffset();
  const [toolsOpen, setToolsOpen] = useState(false);
  const { act, pending, actionError } = useHostActions();

  if (game === undefined || (isHost && priv === undefined)) {
    return <Centered>Loading game…</Centered>;
  }
  if (!game || error) {
    return (
      <Centered>
        Game <span className="font-mono">{code}</span> not found.{" "}
        <Link href="/jeopardy/host" className="underline">
          Back to your boards
        </Link>
      </Centered>
    );
  }
  if (!isHost || !priv) {
    return (
      <Centered>
        This game belongs to another host.{" "}
        <Link href={`/jeopardy/play/${code}`} className="underline">
          Join as a player
        </Link>
      </Centered>
    );
  }

  return (
    <HostGameProvider value={{ code, game, priv, secrets, serverOffset, pending, act }}>
      <div className="flex min-h-screen flex-col bg-blue-950 text-white">
        <HostHeader onOpenTools={() => setToolsOpen(true)} />

        {actionError && (
          <p role="alert" className="bg-red-700 px-4 py-2 text-center text-sm">
            {actionError}
          </p>
        )}

        <main className="flex flex-1 flex-col">
          {game.status === "lobby" && <HostLobby />}
          {game.status === "playing" && (game.current ? <ClueStage /> : <BoardStage />)}
          {game.status === "final" && game.final && <FinalHost />}
          {game.status === "ended" && <EndScreen />}
        </main>

        {(game.status === "playing" || game.status === "final") && <HostFooter />}

        {toolsOpen && <HostTools onClose={() => setToolsOpen(false)} />}
      </div>
    </HostGameProvider>
  );
}
