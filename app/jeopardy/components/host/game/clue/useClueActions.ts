"use client";

import {
  buzzQueue,
  currentResponder,
  judgeResponse,
  openBuzzers,
  returnToBoard,
  revealClue,
} from "../../../../lib/game";
import { useHostGame } from "../HostGameContext";

/** Derived clue state and host actions shared by the controls and keyboard shortcuts. */
export function useClueActions() {
  const { code, game, priv, act } = useHostGame();
  const current = game.current!;
  const queue = buzzQueue(game);
  const responder = currentResponder(game);
  const responderName = responder ? game.players?.[responder]?.name : null;

  const canOpen = current.phase === "reading" && !current.isDailyDouble;
  const canReveal = current.phase === "reading" || current.phase === "open";
  const judge = (correct: boolean) => responder && act(() => judgeResponse(code, game, priv, responder, correct));
  const open = () => act(() => openBuzzers(code));
  const reveal = () => act(() => revealClue(code, game, priv));
  const back = () => act(() => returnToBoard(code));

  return { current, queue, responder, responderName, canOpen, canReveal, judge, open, reveal, back };
}

export type ClueActions = ReturnType<typeof useClueActions>;
