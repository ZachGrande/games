import type { CurrentClue, Player } from "./types";

export function formatMoney(value: number): string {
  const abs = Math.abs(value).toLocaleString("en-US");
  return value < 0 ? `-$${abs}` : `$${abs}`;
}

/** "Wager $X" once a Daily Double wager is set, otherwise the clue's face value. */
export function clueValueLabel(clue: Pick<CurrentClue, "value" | "isDailyDouble" | "wager">): string {
  return clue.isDailyDouble && clue.wager !== undefined ? `Wager ${formatMoney(clue.wager)}` : formatMoney(clue.value);
}

/** Parses a whole-number input within [min, max]; null if blank or out of range. */
export function parseWholeNumber(input: string, min = -Infinity, max = Infinity): number | null {
  if (input.trim() === "") return null;
  const n = Number(input);
  return Number.isInteger(n) && n >= min && n <= max ? n : null;
}

export function playersByJoinOrder(players: Record<string, Player> | undefined): [string, Player][] {
  return Object.entries(players ?? {}).sort(([, a], [, b]) => a.joinedAt - b.joinedAt);
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
