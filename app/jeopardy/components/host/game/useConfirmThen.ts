"use client";

import { useHostGame } from "./HostGameContext";

/** Returns a helper that runs `fn` through the serialized `act` only after the host confirms. */
export function useConfirmThen() {
  const { act } = useHostGame();
  return (message: string, fn: () => Promise<unknown>) => {
    if (confirm(message)) act(fn);
  };
}
