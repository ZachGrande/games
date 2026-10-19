"use client";

import { useEffect } from "react";
import { trackPresence } from "../../lib/game";
import { isValidCode } from "../../lib/codes";
import { useGame, useMySecret, usePlayerUser, useServerOffset } from "../../lib/hooks";
import Standings from "../shared/Standings";
import Message from "./Message";
import NameForm from "./NameForm";
import PlayerBody from "./PlayerBody";
import PlayerHeader from "./PlayerHeader";

export default function PlayerGame({ code }: { code: string }) {
  const validCode = isValidCode(code);
  const { user, error: authError } = usePlayerUser();
  const uid = user?.uid ?? null;
  const { value: game } = useGame(code, !!user && validCode);
  const me = uid ? game?.players?.[uid] : undefined;
  const joined = !!me;
  const inFinal = joined && game?.status === "final";
  const { value: secret } = useMySecret(code, uid, inFinal);
  const serverOffset = useServerOffset();

  useEffect(() => {
    if (!joined || !uid) return;
    return trackPresence(code, uid);
  }, [code, uid, joined]);

  let body: React.ReactNode;
  if (!validCode) body = <Message>That room code doesn&apos;t look right.</Message>;
  else if (authError) body = <Message>Couldn&apos;t connect: {authError}</Message>;
  else if (!uid || game === undefined) body = <Message>Connecting…</Message>;
  else if (!game) body = <Message>No game with code {code}. Check the code on the host&apos;s screen.</Message>;
  else if (game.kicked?.[uid]) body = <Message>The host removed you from this game.</Message>;
  else if (!me) {
    body = game.status === "ended" ? <Standings players={game.players} compact /> : <NameForm code={code} uid={uid} />;
  } else {
    body = <PlayerBody code={code} uid={uid} game={game} secret={secret ?? null} serverOffset={serverOffset} />;
  }

  return (
    <div className="flex min-h-screen flex-col bg-blue-950 text-white">
      <PlayerHeader title={game?.title} code={code} me={me} />
      <main className="flex flex-1 flex-col items-center justify-center gap-6 p-6 text-center">{body}</main>
    </div>
  );
}
