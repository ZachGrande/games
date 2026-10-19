"use client";

import { createContext, useContext } from "react";
import type { Game, GamePrivate, PlayerSecret } from "../../../lib/types";
import type { HostAct } from "./useHostActions";

export interface HostGameValue {
  code: string;
  game: Game;
  priv: GamePrivate;
  /** Only loaded during Final Jeopardy. */
  secrets: Record<string, PlayerSecret> | null | undefined;
  serverOffset: number;
  pending: boolean;
  act: HostAct;
}

const HostGameContext = createContext<HostGameValue | null>(null);

export const HostGameProvider = HostGameContext.Provider;

/** Live game state and the serialized `act` runner for components under HostGame. */
export function useHostGame(): HostGameValue {
  const value = useContext(HostGameContext);
  if (!value) throw new Error("useHostGame must be used inside HostGameProvider");
  return value;
}
