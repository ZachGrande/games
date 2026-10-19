"use client";

import { useCallback, useRef, useState } from "react";

export type HostAct = (fn: () => Promise<unknown>) => void;

/** Serializes host actions so double-clicks / key repeats can't judge twice. */
export function useHostActions() {
  const [pending, setPending] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);
  const pendingRef = useRef(false);

  const act: HostAct = useCallback((fn) => {
    if (pendingRef.current) return;
    pendingRef.current = true;
    setPending(true);
    setActionError(null);
    fn()
      .catch((e: Error) => setActionError(e.message))
      .finally(() => {
        pendingRef.current = false;
        setPending(false);
      });
  }, []);

  return { act, pending, actionError };
}
