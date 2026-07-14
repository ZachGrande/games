"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { buildDeck, type Card } from "./cards";
import GameCard from "./GameCard";
import StatsBar from "./StatsBar";
import WinOverlay from "./WinOverlay";

const MISMATCH_DELAY_MS = 800;
const TOTAL_PAIRS = 8;

type Status = "idle" | "playing" | "won";

export default function MatchTwo() {
  const [cards, setCards] = useState<Card[]>(() => buildDeck());
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [status, setStatus] = useState<Status>("idle");
  const [elapsed, setElapsed] = useState(0);

  // Locks input while a mismatched pair is being shown before flipping back.
  const lockedRef = useRef(false);
  const mismatchTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Timer: runs only while playing.
  useEffect(() => {
    if (status !== "playing") return;
    const interval = setInterval(() => setElapsed((s) => s + 1), 1000);
    return () => clearInterval(interval);
  }, [status]);

  // Clean up any pending mismatch timeout on unmount.
  useEffect(() => {
    return () => {
      if (mismatchTimer.current) clearTimeout(mismatchTimer.current);
    };
  }, []);

  const resetGame = useCallback(() => {
    if (mismatchTimer.current) clearTimeout(mismatchTimer.current);
    lockedRef.current = false;
    setCards(buildDeck());
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setElapsed(0);
    setStatus("idle");
  }, []);

  const handleCardClick = useCallback(
    (index: number) => {
      if (lockedRef.current) return;
      const card = cards[index];
      if (card.matched) return;
      if (flipped.includes(index)) return;
      if (flipped.length === 2) return;

      if (status === "idle") setStatus("playing");

      const nextFlipped = [...flipped, index];
      setFlipped(nextFlipped);

      if (nextFlipped.length < 2) return;

      // Second card of the turn.
      setMoves((m) => m + 1);
      const [firstIndex, secondIndex] = nextFlipped;
      const isMatch = cards[firstIndex].shapeId === cards[secondIndex].shapeId;

      if (isMatch) {
        setCards((prev) =>
          prev.map((c, i) =>
            i === firstIndex || i === secondIndex ? { ...c, matched: true } : c,
          ),
        );
        setFlipped([]);
        setMatches((prev) => {
          const next = prev + 1;
          if (next === TOTAL_PAIRS) setStatus("won");
          return next;
        });
      } else {
        lockedRef.current = true;
        mismatchTimer.current = setTimeout(() => {
          setFlipped([]);
          lockedRef.current = false;
        }, MISMATCH_DELAY_MS);
      }
    },
    [cards, flipped, status],
  );

  return (
    <div className="flex flex-col gap-6">
      <StatsBar
        moves={moves}
        matches={matches}
        totalPairs={TOTAL_PAIRS}
        elapsed={elapsed}
        onRestart={resetGame}
      />

      <div className="relative">
        <div className="grid grid-cols-4 gap-3 sm:gap-4">
          {cards.map((card, index) => (
            <GameCard
              key={card.id}
              card={card}
              isFlipped={card.matched || flipped.includes(index)}
              disabled={status === "won"}
              onClick={() => handleCardClick(index)}
            />
          ))}
        </div>

        {status === "won" && (
          <WinOverlay moves={moves} elapsed={elapsed} onPlayAgain={resetGame} />
        )}
      </div>
    </div>
  );
}
