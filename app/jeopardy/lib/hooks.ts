"use client";

import {
  type User,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInAnonymously,
  signInWithPopup,
  signOut,
} from "firebase/auth";
import { onValue, ref } from "firebase/database";
import { useEffect, useState } from "react";
import { auth, rtdb } from "../../firebase";
import type { Game, GamePrivate, PlayerSecret } from "./types";

interface AuthState {
  user: User | null;
  loading: boolean;
}

export function useAuthUser(): AuthState {
  const [state, setState] = useState<AuthState>({ user: auth.currentUser, loading: true });
  useEffect(
    () => onAuthStateChanged(auth, (user) => setState({ user, loading: false })),
    [],
  );
  return state;
}

/** Signs in anonymously if nobody is signed in (players don't need accounts). */
export function usePlayerUser(): AuthState & { error: string | null } {
  const state = useAuthUser();
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    if (state.loading || state.user) return;
    signInAnonymously(auth).catch((e: Error) => setError(e.message));
  }, [state.loading, state.user]);
  return { ...state, loading: state.loading || (!state.user && !error), error };
}

export function isGoogleUser(user: User | null): boolean {
  return !!user?.providerData.some((p) => p.providerId === "google.com");
}

export function signInWithGoogle() {
  return signInWithPopup(auth, new GoogleAuthProvider());
}

export function signOutUser() {
  return signOut(auth);
}

interface Subscription<T> {
  path: string | null;
  value: T | null | undefined;
  error: string | null;
}

/** Live RTDB value: undefined while loading, null if missing. */
export function useRtdbValue<T>(path: string | null): { value: T | null | undefined; error: string | null } {
  const [state, setState] = useState<Subscription<T>>({ path: null, value: undefined, error: null });
  useEffect(() => {
    if (!path) return;
    return onValue(
      ref(rtdb, path),
      (snap) => setState({ path, value: (snap.val() as T | null) ?? null, error: null }),
      (err) => setState({ path, value: null, error: err.message }),
    );
  }, [path]);
  if (!path || state.path !== path) return { value: undefined, error: null };
  return { value: state.value, error: state.error };
}

export function useGame(code: string, enabled = true) {
  return useRtdbValue<Game>(enabled ? `games/${code}` : null);
}

export function useGamePrivate(code: string, enabled: boolean) {
  return useRtdbValue<GamePrivate>(enabled ? `gamePrivate/${code}` : null);
}

export function useGameSecrets(code: string, enabled: boolean) {
  return useRtdbValue<Record<string, PlayerSecret>>(enabled ? `gameSecrets/${code}` : null);
}

export function useMySecret(code: string, uid: string | null, enabled: boolean) {
  return useRtdbValue<PlayerSecret>(enabled && uid ? `gameSecrets/${code}/${uid}` : null);
}

/** Milliseconds to add to Date.now() to approximate the server clock. */
export function useServerOffset(): number {
  const { value } = useRtdbValue<number>(".info/serverTimeOffset");
  return value ?? 0;
}

/** Re-renders on an interval while enabled, returning the current time. */
export function useNow(enabled: boolean, intervalMs = 250): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => setNow(Date.now()), intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
  return now;
}

/** Recently hosted room codes, so a host can get back to a game after a refresh. */
const RECENT_KEY = "jeopardy.recentGames";

export function rememberHostedGame(code: string) {
  const codes = [code, ...loadHostedGames().filter((c) => c !== code)].slice(0, 5);
  localStorage.setItem(RECENT_KEY, JSON.stringify(codes));
}

export function loadHostedGames(): string[] {
  try {
    const parsed = JSON.parse(localStorage.getItem(RECENT_KEY) ?? "[]");
    return Array.isArray(parsed) ? parsed.filter((c) => typeof c === "string") : [];
  } catch {
    return [];
  }
}

export function forgetHostedGame(code: string) {
  localStorage.setItem(RECENT_KEY, JSON.stringify(loadHostedGames().filter((c) => c !== code)));
}

const NAME_KEY = "jeopardy.playerName";

export function loadPlayerName(): string {
  return typeof window === "undefined" ? "" : (localStorage.getItem(NAME_KEY) ?? "");
}

export function savePlayerName(name: string) {
  localStorage.setItem(NAME_KEY, name);
}
