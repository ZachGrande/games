"use client";

import { useCallback, useEffect, useState } from "react";
import { rememberName, type ScoreEntry } from "./leaderboardStore";
import { getLeaderboard } from "./provider";

export interface UseLeaderboard {
  scores: ScoreEntry[];
  loading: boolean;
  refresh: () => Promise<void>;
  saveScore: (name: string, score: number) => Promise<void>;
}

/**
 * Owns leaderboard state (load / refresh / save) so the game component stays
 * focused on the canvas loop. Backed by the active `LeaderboardProvider`.
 */
export function useLeaderboard(): UseLeaderboard {
  const [scores, setScores] = useState<ScoreEntry[]>([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    setLoading(true);
    const next = await getLeaderboard().getScores();
    setScores(next);
    setLoading(false);
  }, []);

  const saveScore = useCallback(async (name: string, score: number) => {
    const cleanName = name.trim() || "Anonymous";
    rememberName(cleanName);
    const next = await getLeaderboard().addScore({
      name: cleanName,
      score,
      ts: Date.now(),
    });
    setScores(next);
  }, []);

  useEffect(() => {
    let active = true;
    getLeaderboard()
      .getScores()
      .then((next) => {
        if (!active) return;
        setScores(next);
        setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  return { scores, loading, refresh, saveScore };
}
