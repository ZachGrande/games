import type { Player } from "./types";

export function formatMoney(value: number): string {
  const abs = Math.abs(value).toLocaleString("en-US");
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

export interface RankedPlayer extends Player {
  uid: string;
  place: number;
}

/** Players sorted by score (desc), with shared places for ties. */
export function rankPlayers(players: Record<string, Player> | undefined): RankedPlayer[] {
  const list = Object.entries(players ?? {})
    .map(([uid, p]) => ({ ...p, uid }))
    .sort((a, b) => b.score - a.score || a.joinedAt - b.joinedAt);
  let place = 0;
  return list.map((p, i) => {
    if (i === 0 || p.score !== list[i - 1].score) place = i + 1;
    return { ...p, place };
  });
}

export function ordinal(n: number): string {
  const s = ["th", "st", "nd", "rd"];
  const v = n % 100;
  return n + (s[(v - 20) % 10] ?? s[v] ?? s[0]);
}
