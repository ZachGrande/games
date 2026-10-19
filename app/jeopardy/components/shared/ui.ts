/** Large host-screen action button; combine with a TONE. */
export const ACTION_BUTTON =
  "rounded-xl px-5 py-3 text-lg font-bold transition-colors disabled:opacity-40 disabled:cursor-not-allowed";

export const TONE = {
  primary: "bg-amber-400 text-blue-950 hover:bg-amber-300",
  secondary: "bg-blue-700 text-white hover:bg-blue-600",
  correct: "bg-emerald-500 text-white hover:bg-emerald-400",
  wrong: "bg-red-500 text-white hover:bg-red-400",
} as const;

/** Full-width submit button on the player's phone. */
export const PLAYER_SUBMIT_BUTTON =
  "rounded-xl bg-amber-400 px-6 py-3 text-xl font-black text-blue-950 disabled:opacity-40";
