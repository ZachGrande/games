"use client";

import { signOutUser } from "../../lib/hooks";

export default function SignOutButton() {
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
