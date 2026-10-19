"use client";

import type { User } from "firebase/auth";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useRef, useState } from "react";
import {
  deleteGame,
  endGame,
  isBoardCleared,
  kickPlayer,
  selectClue,
  setControl,
  startFinal,
  startGame,
  startRound,
} from "../lib/game";
import {
  forgetHostedGame,
  useGame,
  useGamePrivate,
  useGameSecrets,
  useServerOffset,
} from "../lib/hooks";
import { ROUND_LABEL } from "../lib/types";
import BoardGrid from "./BoardGrid";
import ClueStage from "./ClueStage";
import FinalHost from "./FinalHost";
import HostLobby from "./HostLobby";
import HostTools from "./HostTools";
import Scoreboard from "./Scoreboard";
import Standings from "./Standings";

const TOOLBAR_BUTTON =
  "rounded-lg border border-blue-600 px-3 py-1.5 text-sm text-blue-100 transition-colors hover:bg-blue-800 disabled:opacity-40";

export default function HostGame({ user, code }: { user: User; code: string }) {
  const router = useRouter();
  const { value: game, error } = useGame(code);
  const isHost = !!game && game.hostUid === user.uid;
  const { value: priv } = useGamePrivate(code, isHost);
  const { value: secrets } = useGameSecrets(code, isHost && game?.status === "final");
  const serverOffset = useServerOffset();
  const [toolsOpen, setToolsOpen] = useState(false);
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  // Serializes host actions so double-clicks / key repeats can't judge twice.
  const act = useCallback((fn: () => Promise<unknown>) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setActionError(null);
    fn()
      .catch((e: Error) => setActionError(e.message))
      .finally(() => {
        pendingRef.current = false;
        setPending(false);
      });
  }, []);

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

  const cleared = game.status === "playing" && !game.current && isBoardCleared(game);
  const hasDouble = game.round === "single" && !!priv.rounds.double;
  const confirmThen = (message: string, fn: () => Promise<unknown>) => {
    if (confirm(message)) act(fn);
  };
  const nextStep = hasDouble
    ? { label: `Start ${ROUND_LABEL.double}`, run: () => startRound(code, game, priv, "double") }
    : {
        label: priv.final ? "Start Final Jeopardy!" : "Show final standings",
        run: () => startFinal(code, game, priv),
      };

  return (
    <div className="flex min-h-screen flex-col bg-blue-950 text-white">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-blue-900 px-4 py-2">
        <div className="flex items-baseline gap-3">
          <Link href="/jeopardy/host" className="text-sm text-blue-300 hover:text-white">
            ←
          </Link>
          <span className="font-bold">{game.title}</span>
          {game.status === "playing" && <span className="text-sm text-blue-300">{ROUND_LABEL[game.round]}</span>}
        </div>
        {game.status !== "lobby" && (
          <p className="text-sm text-blue-200">
            Join: {typeof window !== "undefined" ? window.location.host : ""}/jeopardy · code{" "}
            <span className="font-mono text-base font-bold tracking-widest text-amber-300">{code}</span>
          </p>
        )}
        <div className="flex flex-wrap gap-2">
          <button type="button" className={TOOLBAR_BUTTON} onClick={() => setToolsOpen(true)}>
            Players & tools
          </button>
          {game.status === "playing" && !cleared && (
            <button
              type="button"
              className={TOOLBAR_BUTTON}
              disabled={pending}
              onClick={() => confirmThen(`Skip the rest of this round? (${nextStep.label})`, nextStep.run)}
            >
              Skip round
            </button>
          )}
          {game.status !== "ended" && (
            <button
              type="button"
              className={TOOLBAR_BUTTON}
              disabled={pending}
              onClick={() => confirmThen("End the game now and show standings?", () => endGame(code))}
            >
              End game
            </button>
          )}
        </div>
      </header>

      {actionError && (
        <p role="alert" className="bg-red-700 px-4 py-2 text-center text-sm">
          {actionError}
        </p>
      )}

      <main className="flex flex-1 flex-col">
        {game.status === "lobby" && (
          <HostLobby
            code={code}
            game={game}
            pending={pending}
            onStart={() => act(() => startGame(code, game))}
            onKick={(uid) => act(() => kickPlayer(code, game, uid))}
          />
        )}

        {game.status === "playing" &&
          (game.current ? (
            <ClueStage code={code} game={game} priv={priv} pending={pending} act={act} />
          ) : (
            <div className="relative flex flex-1 flex-col p-3">
              {game.board && (
                <BoardGrid
                  board={game.board}
                  disabled={pending}
                  onSelect={(key) => act(() => selectClue(code, game, priv, key))}
                />
              )}
              {cleared && (
                <div className="absolute inset-0 flex flex-col items-center justify-center gap-6 bg-blue-950/90">
                  <p className="text-4xl font-black text-amber-300">Round complete!</p>
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => act(nextStep.run)}
                    className="rounded-xl bg-amber-400 px-8 py-4 text-2xl font-black text-blue-950 hover:bg-amber-300 disabled:opacity-40"
                  >
                    {nextStep.label}
                  </button>
                </div>
              )}
            </div>
          ))}

        {game.status === "final" && game.final && (
          <FinalHost
            code={code}
            game={game}
            priv={priv}
            secrets={secrets}
            serverOffset={serverOffset}
            pending={pending}
            act={act}
          />
        )}

        {game.status === "ended" && (
          <div className="flex flex-1 flex-col items-center gap-10 p-6">
            <h1 className="text-5xl font-black text-amber-300">Final standings</h1>
            <Standings players={game.players} />
            <div className="flex gap-3">
              <Link
                href="/jeopardy/host"
                className="rounded-xl border border-blue-500 px-6 py-3 font-semibold hover:bg-blue-900"
              >
                Back to boards
              </Link>
              <button
                type="button"
                disabled={pending}
                onClick={() =>
                  confirmThen("Delete this game? Players will be disconnected.", async () => {
                    await deleteGame(code);
                    forgetHostedGame(code);
                    router.push("/jeopardy/host");
                  })
                }
                className="rounded-xl bg-red-600 px-6 py-3 font-semibold hover:bg-red-500 disabled:opacity-40"
              >
                Delete game
              </button>
            </div>
          </div>
        )}
      </main>

      {(game.status === "playing" || game.status === "final") && (
        <footer className="border-t border-blue-900 p-3">
          <Scoreboard
            players={game.players}
            controlUid={game.status === "playing" ? game.controlUid : undefined}
            onSelectControl={
              game.status === "playing" && !pending ? (uid) => act(() => setControl(code, uid)) : undefined
            }
          />
        </footer>
      )}

      {toolsOpen && (
        <HostTools code={code} game={game} pending={pending} act={act} onClose={() => setToolsOpen(false)} />
      )}
    </div>
  );
}

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-blue-950 p-6 text-center text-lg text-blue-100">
      <p>{children}</p>
    </div>
  );
}
