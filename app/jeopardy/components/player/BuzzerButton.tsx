"use client";

import { useEffect, useState } from "react";
import { buzz, buzzQueue, currentResponder } from "../../lib/game";
import type { Game, Judgement } from "../../lib/types";

interface BuzzerState {
  judged: Judgement | undefined;
  myTurn: boolean;
  position: number;
  open: boolean;
  tooEarly: boolean;
}

export function buzzerAppearance({ judged, myTurn, position, open, tooEarly }: BuzzerState) {
  if (judged === "wrong") return { label: "Incorrect", style: "bg-zinc-700 text-zinc-300" };
  if (myTurn) return { label: "Your turn! Answer out loud", style: "bg-amber-400 text-blue-950 animate-pulse" };
  if (position >= 0) return { label: `Buzzed · #${position + 1}`, style: "bg-blue-700 text-white" };
  if (open) {
    return {
      label: "BUZZ!",
      style: "bg-red-600 text-white active:scale-95 shadow-[0_0_40px_rgba(239,68,68,0.6)]",
    };
  }
  return { label: tooEarly ? "Not yet!" : "Locked", style: "bg-zinc-800 text-zinc-400" };
}

export default function BuzzerButton({ code, uid, game }: { code: string; uid: string; game: Game }) {
  const current = game.current!;
  const open = current.phase === "open";
  const judged = current.judged?.[uid];
  const queue = buzzQueue(game);
  const position = queue.findIndex((e) => e.uid === uid);
  const myTurn = currentResponder(game) === uid;
  const [sending, setSending] = useState(false);
  const [tooEarly, setTooEarly] = useState(false);

  useEffect(() => {
    if (open) navigator.vibrate?.(60);
  }, [open]);

  useEffect(() => {
    if (!tooEarly) return;
    const id = setTimeout(() => setTooEarly(false), 600);
    return () => clearTimeout(id);
  }, [tooEarly]);

  const canBuzz = open && position === -1 && !judged && !sending;

  const press = () => {
    if (!open) {
      setTooEarly(true);
      return;
    }
    if (!canBuzz) return;
    setSending(true);
    buzz(code, uid)
      .catch(() => {})
      .finally(() => setSending(false));
  };

  const { label, style } = buzzerAppearance({ judged, myTurn, position, open, tooEarly });

  return (
    <button
      type="button"
      onPointerDown={press}
      onKeyDown={(e) => {
        if (e.key === " " || e.key === "Enter") {
          e.preventDefault();
          press();
        }
      }}
      aria-label={label}
      className={`flex aspect-square w-64 max-w-[75vw] touch-manipulation select-none items-center justify-center rounded-full p-6 text-3xl font-black transition-transform sm:w-72 ${style}`}
    >
      {label}
    </button>
  );
}
