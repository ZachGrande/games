"use client";

import type { User } from "firebase/auth";
import { type ReactNode, useState } from "react";
import { isGoogleUser, signInWithGoogle, signOutUser, useAuthUser } from "../../lib/hooks";

/** Renders children only for a Google-signed-in user (hosts). */
export default function HostGate({
  children,
  fallbackClassName,
}: {
  children: (user: User) => ReactNode;
  fallbackClassName?: string;
}) {
  const { user, loading } = useAuthUser();
  const [error, setError] = useState<string | null>(null);

  if (loading) return <p className={`text-zinc-500 ${fallbackClassName ?? ""}`}>Loading…</p>;
  if (user && isGoogleUser(user)) return <>{children(user)}</>;

  return (
    <div
      className={`flex flex-col items-start gap-4 rounded-xl border border-zinc-200 p-6 dark:border-zinc-800 ${fallbackClassName ?? ""}`}
    >
      <p className="text-zinc-600 dark:text-zinc-300">
        Sign in with Google to build boards and host games. Players don&apos;t need an account.
      </p>
      <button
        type="button"
        onClick={() => {
          setError(null);
          signInWithGoogle().catch((e: Error) => setError(e.message));
        }}
        className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200"
      >
        Sign in with Google
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  );
}

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOutUser()}
      className="text-sm text-zinc-500 hover:text-black dark:text-zinc-400 dark:hover:text-zinc-50"
    >
      Sign out
    </button>
  );
}
