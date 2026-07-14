# 2048 — Game Overview

2048 is a client-side sliding-tile game served at `/twenty-forty-eight` in this
Next.js app. The player slides numbered tiles on a 4×4 grid; equal tiles merge into
their sum, and the goal is to create a **2048** tile. It is pure React + Tailwind —
no canvas, no Firebase. The only persistence is a best score in `localStorage`.

## Route & chrome

- **Route:** [app/twenty-forty-eight/page.tsx](app/twenty-forty-eight/page.tsx)
  renders `<TwentyFortyEight />` inside `<GameShell title="2048">`.
- **`GameShell`** ([app/components/GameShell.tsx](app/components/GameShell.tsx))
  provides the page title + "← Back" link and a `children` slot.
- The home page ([app/page.tsx](app/page.tsx)) links to `/twenty-forty-eight`.

## File map (`app/twenty-forty-eight/`)

- [TwentyFortyEight.tsx](app/twenty-forty-eight/TwentyFortyEight.tsx) — `"use client"`
  container. Owns the `GameState`, best score, and "keep playing" flag; wires up
  keyboard + swipe input and composes the presentational components below.
- [board.ts](app/twenty-forty-eight/board.ts) — pure game logic: the grid model,
  the slide/merge algorithm, random tile spawning, and win / game-over detection.
  No React, no DOM.
- [TileBoard.tsx](app/twenty-forty-eight/TileBoard.tsx) — the board frame: a static
  4×4 backdrop of empty cells plus the absolutely-positioned, animating tiles.
- [Tile.tsx](app/twenty-forty-eight/Tile.tsx) — a single tile: the classic 2048
  color palette, digit-aware font sizing, and pop-in / merge animations.
- [StatsBar.tsx](app/twenty-forty-eight/StatsBar.tsx) — the Score / Best header and
  the **New Game** button (internal `Stat` helper renders each column).
- [GameOverlay.tsx](app/twenty-forty-eight/GameOverlay.tsx) — the overlay shown over
  the board for both the win ("Keep Going" / "Play Again") and game-over
  ("Play Again") states.

> **Note on the filename:** the board component is `TileBoard.tsx`, not `Board.tsx`,
> to avoid a case-insensitive filesystem collision with the `board.ts` logic module.

## How to play

- **Desktop:** press an **arrow key** (or **WASD**) to slide every tile in that
  direction.
- **Touch:** **swipe** in any direction on the board.
- Tiles slide as far as they can; two tiles with the same number that collide merge
  into one tile worth their sum, adding that value to your score.
- Each move that changes the board spawns one new tile (a **2** 90% of the time, a
  **4** 10%).
- Make a **2048** tile to win. You can **Keep Going** for a higher score, or the game
  ends when the board is full with no legal merges.

## Game state & logic

State lives in the container as React state; all rules live in `board.ts`.

`GameState` (from `board.ts`):

- `tiles: Tile[]` — the live tiles. Each `Tile` is
  `{ id, value, row, col, isNew, merged }`.
- `score` — running total; each merge adds the merged tile's value.
- `won` — set once a 2048 tile appears (the player may continue past it).
- `over` — set when no legal move remains.

Container-only state in [TwentyFortyEight.tsx](app/twenty-forty-eight/TwentyFortyEight.tsx):

- `best` — high score, loaded from and written to `localStorage`.
- `dismissedWin` — lets the player continue after 2048 without re-showing the win
  overlay.

### The move algorithm (`board.ts`)

`move(state, direction)` returns `{ state, moved }` using the canonical 2048
traversal:

1. A **vector** is chosen for the direction, and rows/cols are traversed so tiles
   nearest the target edge are processed first.
2. For each tile, `findFarthest` walks along the vector to the last empty cell and
   reports the occupied cell just beyond it.
3. If that next cell holds a tile of the **same value that has not already merged
   this turn**, the two combine: the value doubles, `score` grows, and the tile is
   flagged `merged`. Otherwise the tile slides to the farthest empty cell.
4. If anything moved, one random tile is spawned via `addRandomTile`.
5. `over` is recomputed with `movesAvailable` (any empty cell, or any pair of equal
   orthogonal neighbours).

Callers **ignore no-op moves** (`moved === false`) so a new tile is never spawned
for a move that changed nothing.

### Tile identity & animation

Every tile has a **stable `id`** used as its React key, so React reuses the same DOM
node across moves and the tile's CSS transition animates it from its old cell to its
new one. On a merge, the *sliding* tile keeps its id (so it visibly travels into the
merge), while the stationary tile is replaced. Two per-turn flags drive the
keyframes:

- `isNew` → `tile-appear` (scale-in) for freshly spawned tiles.
- `merged` → `tile-pop` (a brief scale bump) for tiles created by a merge.

Both flags are cleared at the start of the next `move`.

### Input handling

Keyboard and swipe handlers read the latest game data through **ref mirrors**
(`stateRef`, `bestRef`, `lockedRef`) kept in sync by an effect, so the handlers stay
stable (empty dependency lists) and never fire while an overlay is showing. Swipes
are decided by the larger axis of the touch delta once it exceeds
`SWIPE_THRESHOLD` (24 px).

## Board layout (`TileBoard.tsx`)

The board is a square, responsive frame. Cell geometry is expressed as **percentages
of the inner playfield** — four cells and three gaps (`GAP = 2.5%`) fill 100% — so the
same `cellStyle(row, col)` positions both the static backdrop cells and the live
tiles. Tiles are absolutely positioned and animate their `top` / `left`.

## Styling

Tailwind utility classes throughout, dark-mode aware. Tile colors use the classic
2048 palette via arbitrary values (e.g. `bg-[#edc22e]`), with a dark super-tile style
for values above 2048. The `tile-appear` and `tile-pop` keyframes live in
[app/globals.css](app/globals.css) alongside `breathe`.

## Persistence

The only stored value is the best score, under the `localStorage` key
`twenty-forty-eight-best`. It is loaded once on mount and updated whenever the current
score surpasses it. There is no leaderboard and no Firebase.
