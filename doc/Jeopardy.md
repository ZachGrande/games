# Jeopardy! — Game Overview

A live, multiplayer Jeopardy-style trivia game served at `/jeopardy`. A host signs in with
Google, builds boards, and runs the game from a laptop mirrored to a TV, which shows the
board. Players join from their phones with a room code and a display name. Players only
**pick a name**, **buzz**, and enter their **Final Jeopardy wager and response**; everything
else (picking clues, opening buzzers, judging, scoring) is done by the host.

State lives in Firebase project `games-b50c1`:

- **Realtime Database (RTDB)**: live games (low latency, `onDisconnect` presence, server
  timestamps for fair buzz ordering).
- **Cloud Firestore**: each host's saved boards.
- **Auth**: Google for hosts, Anonymous for players (no account needed; the anonymous uid
  persists in the browser so refreshing keeps a player's seat and score).

Everything runs on the free Spark plan; there are no Cloud Functions. The host's browser acts as
the referee, and [database.rules.json](../database.rules.json) limits what players can write.

## Routes

| Route | Who | What |
|---|---|---|
| `/jeopardy` | anyone | Enter a room code, or go host a game |
| `/jeopardy/play/[code]` | players | Name entry → buzzer → Final Jeopardy → standings (the lobby QR links here) |
| `/jeopardy/host` | host | Google sign-in, saved boards, recent games |
| `/jeopardy/host/boards/[boardId]` | host | Board editor (J!, DJ!, Final) |
| `/jeopardy/host/[code]` | host | **The shared screen**: lobby, board, clues, Final, standings |
| `/jeopardy/host/[code]/key` | host | Optional private answer key for the host's phone |

## File map (`app/jeopardy/`)

- `lib/types.ts`: board + live game types, constants (6×5 grid, values, 30s Final timer).
- `lib/boards.ts`: Firestore CRUD for `jeopardyBoards`; `emptyBoard()`, `countFilled()`.
- `lib/sampleBoard.ts`: a complete sample board ("New from sample").
- `lib/game.ts`: all RTDB actions (create/start, select clue, open buzzers, judge, Daily
  Double, rounds, Final, end/delete; player join/presence/buzz/wager/answer) plus the
  `buzzQueue()` / `currentResponder()` selectors.
- `lib/hooks.ts`: auth hooks, `useRtdbValue` and game/private/secret subscriptions,
  `useServerOffset`, `useNow`, localStorage helpers (recent games, player name).
- `lib/codes.ts`, `lib/format.ts`: room codes (4 letters, no I/O) and money/ranking helpers.
- `components/HostGame.tsx`: host screen container; serializes actions through `act()` so
  double-clicks and key repeats can't judge twice.
- `components/ClueStage.tsx`: clue view, buzz queue, judging, Daily Double wager form,
  keyboard shortcuts, hold-to-peek.
- `components/FinalHost.tsx` / `PlayerGame.tsx` (`FinalPlayer`): Final Jeopardy on each side.
- `components/HostLobby.tsx`, `BoardGrid.tsx`, `Scoreboard.tsx`, `Standings.tsx`,
  `HostTools.tsx` (score edits, remove player, answer-key QR), `BoardEditor.tsx`,
  `HostDashboard.tsx`, `HostGate.tsx` (Google-only gate), `JoinForm.tsx`, `AnswerKey.tsx`.

## How a game runs

1. **Host game** snapshots the board into RTDB under a fresh room code and randomly places
   Daily Doubles (1 in J!, 2 in DJ! in different categories, never in the top row). Blank clues
   become empty squares; a round with no clues is skipped; a blank Final clue skips Final.
2. **Lobby:** the TV shows the code + QR; players join. The host can remove players.
3. **Board:** players call out picks; the host clicks the cell. ★ marks who picks next (click
   a score to change it). Control goes to whoever last answered correctly.
4. **Clue:** shown on the TV and phones with buzzers **locked**. After reading, the host opens them
   (**Space**). Buzzes are ordered by server receive time and listed with their offsets.
5. **Judging:** **C** = correct (+value, takes control, reveals), **W** = wrong (−value, next in
   the queue; late buzzers can still join). **R** reveals with nobody correct. **Enter** returns to
   the board. "Hold to peek" briefly shows the response on the host screen.
6. **Daily Double:** the player says their wager out loud; the host picks the player and enters
   it ($5 to max(score, top clue value)). No buzzers; the host judges ±wager.
7. **Rounds:** when the board is cleared (or **Skip round**) → Double Jeopardy!; the lowest
   score picks first.
8. **Final Jeopardy!:** players with a positive score enter a secret wager on their phone →
   host shows the clue and a 30s timer starts → players type responses → host reveals each
   player lowest-first and judges ±wager → reveal the correct response → standings.
9. **End:** podium + standings on the TV; each phone shows the player's finishing place. The host
   can delete the game.

**Players & tools** (any time): edit scores, remove players, and a QR for the answer key.

## Data model

Firestore `jeopardyBoards/{id}`:
`{ ownerUid, title, rounds: { single|double: { categories[6]: { name, clues[5]: { clue, answer } } } }, final: { category, clue, answer }, updatedAt }`.
Values are derived from the row ($200–$1,000; doubled in DJ!).

RTDB:

```
games/{CODE}            any signed-in user can read by exact code (no listing)
  hostUid, title, createdAt, status (lobby|playing|final|ended), round (single|double)
  board: { categories[], cells: { "c_r": { value, used } } }    (no clue text/answers)
  controlUid, current: { cell, category, value, phase, clue?, isDailyDouble?, ddPlayer?,
                         wager?, judged: { uid: correct|wrong }, answer? }
  buzzes/{uid}: server timestamp
  players/{uid}: { name, score, joinedAt, connected }
  kicked/{uid}: true
  final: { category, phase, eligible, clue?, deadline?, revealed/{uid}, answer? }
gamePrivate/{CODE}      host only: full clues, responses, Daily Double positions, Final
gameSecrets/{CODE}/{uid} host + that player: { wager, answer }
```

Responses and secrets are stored at separate top-level paths because RTDB read access cascades
down the tree.

## Security rules

[database.rules.json](../database.rules.json) (RTDB) enforces:

- Only Google-signed-in users can create games; only `hostUid` can change game state, scores,
  or ownership. A room code unused for more than 12 hours can be reclaimed by a new host.
- Players can create their own `players/{uid}` entry with score 0, rename themselves, and set
  their presence. They can never change their score, and kicked players can't rejoin.
- Each player can buzz once, only while `current.phase == "open"`. The value must equal the
  server's `now`, so buzz times can't be forged.
- Final wagers must be whole numbers from 0 to the player's score, accepted only during the
  wager phase. Responses are accepted only during the answer phase, after wagering, and before
  `deadline` + 3s grace.

[firestore.rules](../firestore.rules) restricts `jeopardyBoards` to its owner (creation requires
Google sign-in) and validates the top-level fields.

The host is trusted to referee; nothing stops a host from setting arbitrary scores.

## Firebase setup

1. RTDB default instance (`https://games-b50c1-default-rtdb.firebaseio.com`), already created.
2. Console → Authentication → Sign-in method: enable **Google** and **Anonymous**.
3. Authentication → Settings → Authorized domains: add the Vercel production domain. Google
   sign-in won't work on Vercel preview URLs; players are unaffected.
4. Deploy rules: `npx -y firebase-tools@latest deploy --only database,firestore:rules`.

## Local development with emulators

`app/firebase.ts` connects to the emulators when `NEXT_PUBLIC_FIREBASE_EMULATORS=true`
(Auth :9099, RTDB :9000, Firestore :8080):

```bash
npx -y firebase-tools@latest emulators:start --only auth,database,firestore
NEXT_PUBLIC_FIREBASE_EMULATORS=true pnpm dev
```

The Firebase CLI needs Java 21+ to run the Database and Firestore emulators. The Auth emulator
shows a fake Google sign-in popup. Open the host and player views in separate
browser profiles (or a private window) so they get different users.
