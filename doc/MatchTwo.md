# Match Two — Game Overview

Match Two is a client-side memory game served at `/match-two` in this Next.js app.
The player flips cards on a 4×4 grid to find all eight matching pairs in as few
moves and as little time as possible. It is pure React + Tailwind — no canvas, no
Firebase, and no persistence.

## Route & chrome

- **Route:** [app/match-two/page.tsx](app/match-two/page.tsx) renders `<MatchTwo />`
  inside `<GameShell title="Match Two">`.
- **`GameShell`** ([app/components/GameShell.tsx](app/components/GameShell.tsx))
  provides the page title + "← Back" link and a `children` slot.
- The home page ([app/page.tsx](app/page.tsx)) links to `/match-two`.

## File map (`app/match-two/`)

- [MatchTwo.tsx](app/match-two/MatchTwo.tsx) — `"use client"` container. Owns **all**
  game state and logic (deck, flipped cards, moves, matches, timer, status) and
  composes the presentational components below. Contains no markup beyond layout.
- [cards.tsx](app/match-two/cards.tsx) — the eight shape SVGs (`SHAPES`), the `Card`
  / `ShapeId` types, and the `buildDeck()` deck builder + Fisher-Yates shuffle. No
  React state.
- [GameCard.tsx](app/match-two/GameCard.tsx) — a single flip card: 3D-flip wrapper,
  a patterned back (cover), and the shape face. Purely presentational.
- [StatsBar.tsx](app/match-two/StatsBar.tsx) — the moves / pairs / time header and
  the **Restart** button (internal `Stat` helper renders each column).
- [WinOverlay.tsx](app/match-two/WinOverlay.tsx) — the win screen shown over the
  grid, with the final moves + time and a **Play Again** button.
- [format.ts](app/match-two/format.ts) — shared `formatTime(seconds)` → `m:ss`,
  used by both `StatsBar` and `WinOverlay`.

## How to play

- Click a face-down card to flip it, then click a second card.
- If the two shapes match, both stay revealed with a green border.
- If they don't, both flip back after a short delay (input is locked meanwhile).
- Reveal all **8 pairs** to win. **Restart** (header) or **Play Again** (win screen)
  reshuffles and resets every counter.

## Game state & logic (`MatchTwo.tsx`)

All state lives in the container as React state:

- `cards: Card[]` — the 16-card deck (`{ id, shapeId, matched }`).
- `flipped: number[]` — indices of the currently face-up, unmatched cards (0–2).
- `moves` — incremented once per **completed turn** (each second flip).
- `matches` — pairs found; reaching `TOTAL_PAIRS` (8) sets `status = "won"`.
- `elapsed` — seconds, driven by a 1s `setInterval` that runs only while playing.
- `status: "idle" | "playing" | "won"` — `idle` until the first flip, which starts
  the timer; `won` disables the grid and shows the overlay.

Turn resolution in `handleCardClick(index)`:

1. Ignore the click if input is locked, the card is already matched or face-up, or
   two cards are already flipped.
2. First flip of a turn just reveals the card (and flips `idle → playing`).
3. Second flip increments `moves`, then compares the two `shapeId`s:
   - **Match** → mark both `matched: true`, clear `flipped`, bump `matches` (and win
     if that was the last pair).
   - **Mismatch** → set `lockedRef` and, after `MISMATCH_DELAY_MS` (800 ms), clear
     `flipped` and unlock.

Two refs keep the resolution race-free without extra renders:

- `lockedRef` — blocks clicks during the mismatch delay.
- `mismatchTimer` — the pending flip-back timeout; cleared on `resetGame` and on
  unmount.

`isFlipped` is derived per card as `card.matched || flipped.includes(index)`, so
there is no separate "flipped" flag to keep in sync.

## Cards & shuffling (`cards.tsx`)

- `SHAPES` maps eight `ShapeId`s — `circle`, `square`, `triangle`, `diamond`,
  `star`, `hexagon`, `cross`, `ring` — to small inline `<svg viewBox="0 0 100 100">`
  components, each a single colored shape. They accept `SVGProps` so callers size
  them (`GameCard` passes `h-full w-full`).
- `buildDeck()` doubles the eight ids into 16, Fisher-Yates shuffles them, and maps
  to `Card` objects with a stable `id` (the post-shuffle index) used as the React
  key.

## Styling

Tailwind utility classes throughout, dark-mode aware (`dark:` variants). The card
flip uses Tailwind v4 3D utilities: `perspective-[1000px]` on the button,
`transform-3d` + `backface-hidden` on the faces, and `transform-[rotateY(180deg)]`
toggled by `isFlipped`, animated with `transition-transform duration-300`. No custom
keyframes are needed.
