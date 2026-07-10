// Selects the active leaderboard provider. Swap the return value to change
// where scores live; every caller uses the shared LeaderboardProvider contract.
import { FirebaseLeaderboard } from "./firebaseLeaderboard";
import { OfflineLeaderboard, type LeaderboardProvider } from "./leaderboardStore";

let provider: LeaderboardProvider | null = null;

/** Return the active leaderboard provider (online, offline fallback built in). */
export function getLeaderboard(): LeaderboardProvider {
  if (!provider) {
    provider = new FirebaseLeaderboard();
  }
  return provider;
}

/** Force the offline (localStorage) provider — handy for tests or offline mode. */
export function getOfflineLeaderboard(): LeaderboardProvider {
  return new OfflineLeaderboard();
}
