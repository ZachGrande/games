"use client";

import { useEffect } from "react";
import { useHostGame } from "../HostGameContext";
import type { ClueActions } from "./useClueActions";

export function useClueShortcuts({ current, responder, canOpen, canReveal, judge, open, reveal, back }: ClueActions) {
  const { pending } = useHostGame();

  // Intentionally no dependency array: re-subscribing each render keeps the handler's closures fresh.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement | null;
      if (e.repeat || pending || target?.closest("input, textarea, select")) return;
      const key = e.key.toLowerCase();
      if (key === " " && canOpen) open();
      else if (key === "c" && responder) judge(true);
      else if (key === "w" && responder) judge(false);
      else if (key === "r" && canReveal) reveal();
      else if (key === "enter" && current.phase === "revealed") back();
      else return;
      e.preventDefault();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  });
}
