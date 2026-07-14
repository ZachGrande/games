"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import TileBoard from "./TileBoard";
import GameOverlay from "./GameOverlay";
import StatsBar from "./StatsBar";
import {
  createInitialState,
  move,
  type Direction,
  type GameState,
} from "./board";

const BEST_KEY = "twenty-forty-eight-best";
const SWIPE_THRESHOLD = 24;

const KEY_TO_DIRECTION: Record<string, Direction> = {
  ArrowUp: "up",
  ArrowDown: "down",
  ArrowLeft: "left",
  ArrowRight: "right",
  w: "up",
  s: "down",
  a: "left",
  d: "right",
};

export default function TwentyFortyEight() {
  const [state, setState] = useState<GameState>(() => createInitialState());
  const [best, setBest] = useState(0);
  // Lets the player continue after reaching 2048 without re-showing the win.
  const [dismissedWin, setDismissedWin] = useState(false);

  const showWin = state.won && !dismissedWin;
  const showOver = state.over;
  const locked = showWin || showOver;

  // Ref mirrors so the key/touch handlers can stay stable across renders.
  const stateRef = useRef(state);
  const bestRef = useRef(best);
  const lockedRef = useRef(locked);
  useEffect(() => {
    stateRef.current = state;
    bestRef.current = best;
    lockedRef.current = locked;
  }, [state, best, locked]);

  // Load the persisted best score once on the client (deferred so it does not
  // run synchronously inside the effect body).
  useEffect(() => {
    const stored = Number(localStorage.getItem(BEST_KEY));
    if (!Number.isFinite(stored) || stored <= 0) return;
    Promise.resolve().then(() => setBest((prev) => Math.max(prev, stored)));
  }, []);

  const handleMove = useCallback((direction: Direction) => {
    if (lockedRef.current) return;
    const result = move(stateRef.current, direction);
    if (!result.moved) return;
    setState(result.state);
    if (result.state.score > bestRef.current) {
      localStorage.setItem(BEST_KEY, String(result.state.score));
      setBest(result.state.score);
    }
  }, []);

  const resetGame = useCallback(() => {
    setDismissedWin(false);
    setState(createInitialState());
  }, []);

  // Keyboard input.
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      const direction = KEY_TO_DIRECTION[e.key];
      if (!direction) return;
      e.preventDefault();
      handleMove(direction);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [handleMove]);

  // Touch swipe input.
  const touchStart = useRef<{ x: number; y: number } | null>(null);

  const onTouchStart = useCallback((e: React.TouchEvent) => {
    const t = e.touches[0];
    touchStart.current = { x: t.clientX, y: t.clientY };
  }, []);

  const onTouchEnd = useCallback(
    (e: React.TouchEvent) => {
      const start = touchStart.current;
      touchStart.current = null;
      if (!start) return;
      const t = e.changedTouches[0];
      const dx = t.clientX - start.x;
      const dy = t.clientY - start.y;
      if (Math.max(Math.abs(dx), Math.abs(dy)) < SWIPE_THRESHOLD) return;
      if (Math.abs(dx) > Math.abs(dy)) {
        handleMove(dx > 0 ? "right" : "left");
      } else {
        handleMove(dy > 0 ? "down" : "up");
      }
    },
    [handleMove],
  );

  return (
    <div className="flex flex-col gap-6">
      <StatsBar score={state.score} best={best} onRestart={resetGame} />

      <div
        className="relative touch-none select-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
      >
        <TileBoard tiles={state.tiles} />

        {locked && (
          <GameOverlay
            variant={showWin ? "won" : "over"}
            score={state.score}
            onKeepPlaying={() => setDismissedWin(true)}
            onPlayAgain={resetGame}
          />
        )}
      </div>

      <p className="text-center text-sm text-zinc-500 dark:text-zinc-400">
        Use arrow keys or swipe to combine tiles and reach 2048.
      </p>
    </div>
  );
}
