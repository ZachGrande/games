# Bigfoot Runner — Game Overview

Bigfoot Runner is a canvas-based endless runner served at `/bigfoot-runner` in this
Next.js app. It was ported from the standalone `leavenworth-site.html` prototype and
now has a Firestore-backed high-score leaderboard with an automatic offline fallback.

## Route & chrome

- **Route:** [app/bigfoot-runner/page.tsx](app/bigfoot-runner/page.tsx) renders
  `<BigfootRunner />` inside `<GameShell title="Bigfoot Runner">`.
- **`GameShell`** ([app/components/GameShell.tsx](app/components/GameShell.tsx))
  provides the page title + "← Back" link and a `children` slot.
- The home page ([app/page.tsx](app/page.tsx)) links to `/bigfoot-runner`.

## File map (`app/bigfoot-runner/`)

- [BigfootRunner.tsx](app/bigfoot-runner/BigfootRunner.tsx) — `"use client"`
  component: canvas, `requestAnimationFrame` game loop, HUD, title/game-over
  overlays, and input handling. All per-frame state lives in refs; React state is
  used only for the HUD (score/best/speed), `gameState`, and the leaderboard.
- [draw.ts](app/bigfoot-runner/draw.ts) — pure canvas drawing helpers, shared types,
  the `OBSTACLE_TYPES` / `COLLECT_TYPES` tables, and `checkCollision`. No React state.
- [Leaderboard.tsx](app/bigfoot-runner/Leaderboard.tsx) — presentational high-scores
  card shown below the canvas (medals for top 3, empty/loading states, REFRESH).
- [ScoreEntry.tsx](app/bigfoot-runner/ScoreEntry.tsx) — game-over name input + SAVE
  button + "✓ Score saved!" message.
- [useLeaderboard.ts](app/bigfoot-runner/useLeaderboard.ts) — hook owning `scores`
  state with `refresh` and `saveScore`.
- [leaderboardStore.ts](app/bigfoot-runner/leaderboardStore.ts) — data layer:
  `ScoreEntry` type, `LeaderboardProvider` interface, `OfflineLeaderboard`
  (localStorage), and remembered-name helpers. No React, no Firebase.
- [firebaseLeaderboard.ts](app/bigfoot-runner/firebaseLeaderboard.ts) —
  `FirebaseLeaderboard` (Firestore) implementing the same contract; falls back to
  `OfflineLeaderboard` on any error.
- [provider.ts](app/bigfoot-runner/provider.ts) — `getLeaderboard()` factory that
  selects the active provider (Firebase today).

Shared Firebase client init lives in [app/firebase.ts](app/firebase.ts) (`app`,
`db`, `auth`).

## Controls

- Tap / click / touch the canvas, or press **Space** / **ArrowUp** → jump.
- A second press while airborne → **double-jump**.

## Gameplay constants

- Canvas: `W = min(760, containerWidth)`. Height is responsive — narrow viewports
  (`W < 520`) use `min(0.72 × innerHeight, W × 1.3)` for a taller portrait area;
  desktop uses `min(460, round(W × 0.6))`. `GROUND_Y = H - 62`. Scaled by
  `devicePixelRatio`.
- Player `BF`: `x:80, w:46, h:58`; gravity `vy += 0.7`; jump `vy = -14`,
  double-jump `vy = -11`.
- `score = floor(frame / 6)`; `speed = 4 + min(score / 200, 5)`.
- Obstacle spawn gap: `minGap = max(180, 350 - score × 0.5)`, gated by
  `frame - lastObstacle > minGap / speed × 4`.
- Collectible spawn every `90` frames, with an overlap-avoidance check against
  nearby obstacles.
- Collision uses a forgiveness pad (`checkCollision` in `draw.ts`).
- `OBSTACLE_TYPES`: tent, campfire, lantern (canvas-drawn) plus emoji obstacles.
- `COLLECT_TYPES`: logo star, s'more, soda, burger, hotdog. Collecting adds points
  **and** `frame += pts × 3` (speeds progression).

## Leaderboard architecture

Storage sits behind an **async `LeaderboardProvider`** so the offline and online
implementations share one contract and the UI never changes when swapping them:

- `getScores(limit)` / `addScore(entry, limit)` — both Promise-based.
- `ScoreEntry = { name, score, ts }`.
- **`OfflineLeaderboard`** — localStorage key `bigfoot-runner-scores` (keeps top 50,
  returns top 10). Best score is also mirrored in `bigfoot-runner-best`; the
  remembered player name in `bigfoot-runner-name`.
- **`FirebaseLeaderboard`** — Firestore collection `bfScores`, read with
  `orderBy("score","desc").limit(10)`. `addScore` signs in anonymously, then
  `addDoc` with a server timestamp. Any Firestore/Auth error degrades to the
  offline store so the game keeps working.
- `getLeaderboard()` currently returns `FirebaseLeaderboard`.

### Firestore

- Project `games-b50c1`, `(default)` database, **STANDARD** edition, `us-west1`.
- Collection `bfScores` docs: `name` (string 1–16), `score` (number 0–10,000,000),
  `uid` (== auth UID), `createdAt` (server timestamp).
- Rules ([firestore.rules](firestore.rules)): **public read**; **authenticated +
  validated create-only**; **update/delete denied**; default-deny everywhere else.
- The single-field `score` index is auto-created — no composite index needed.

### Manual setup still required

- Enable **Anonymous** sign-in: Firebase console → Authentication → Sign-in method
  → Anonymous → Enable.
- Deploy rules: `npx -y firebase-tools@latest deploy --only firestore:rules`.

Until both are done, reads may fail and saves fall back to localStorage.

### Hardening (not yet done)

The current rules enforce shape, ownership, and value ranges but **cannot prove a
score was legitimately earned**. Recommended next steps: **App Check** (reCAPTCHA v3)
to block off-app API abuse, and optionally a **Cloud Function** for authoritative
anti-cheat validation.

## Styling

Retro pixel-art look implemented with Tailwind utility classes (arbitrary values
like `shadow-[4px_4px_0_#5c3d1e]`) and `font-mono`. The `breathe` keyframe in
[app/globals.css](app/globals.css) powers the pulsing 🦶 on the title screen.

## Source prototype

The original standalone game is [leavenworth-site.html](leavenworth-site.html); its
canvas drawing math was copied verbatim into `draw.ts`. The prototype's Supabase
leaderboard was dropped in favor of the provider abstraction described above.
