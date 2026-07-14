/** Pure 2048 game logic. No React, no DOM. */

export const SIZE = 4;
export const WIN_VALUE = 2048;

export type Direction = "up" | "down" | "left" | "right";

export type Tile = {
  /** Stable identity used as the React key so tiles animate as they slide. */
  id: number;
  value: number;
  row: number;
  col: number;
  /** True on the turn the tile was spawned (drives the pop-in animation). */
  isNew: boolean;
  /** True on the turn this tile resulted from a merge (drives the pop animation). */
  merged: boolean;
};

export type GameState = {
  tiles: Tile[];
  score: number;
  /** Set once a 2048 tile appears; the player may keep playing past it. */
  won: boolean;
  /** No legal moves remain. */
  over: boolean;
};

type Cell = { row: number; col: number };
type Grid = (Tile | null)[][];

let idCounter = 0;
const nextId = () => ++idCounter;

const VECTORS: Record<Direction, Cell> = {
  up: { row: -1, col: 0 },
  down: { row: 1, col: 0 },
  left: { row: 0, col: -1 },
  right: { row: 0, col: 1 },
};

function emptyGrid(): Grid {
  return Array.from({ length: SIZE }, () =>
    Array.from({ length: SIZE }, () => null as Tile | null),
  );
}

function tilesToGrid(tiles: Tile[]): Grid {
  const grid = emptyGrid();
  for (const tile of tiles) grid[tile.row][tile.col] = tile;
  return grid;
}

function gridToTiles(grid: Grid): Tile[] {
  const tiles: Tile[] = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const tile = grid[row][col];
      if (tile) tiles.push(tile);
    }
  }
  return tiles;
}

function inBounds(cell: Cell): boolean {
  return (
    cell.row >= 0 && cell.row < SIZE && cell.col >= 0 && cell.col < SIZE
  );
}

/** Traversal order so tiles closest to the target edge are processed first. */
function buildTraversals(vector: Cell): { rows: number[]; cols: number[] } {
  const rows = Array.from({ length: SIZE }, (_, i) => i);
  const cols = Array.from({ length: SIZE }, (_, i) => i);
  if (vector.row === 1) rows.reverse();
  if (vector.col === 1) cols.reverse();
  return { rows, cols };
}

/** Farthest empty cell a tile can slide to, plus the cell just beyond it. */
function findFarthest(
  grid: Grid,
  cell: Cell,
  vector: Cell,
): { farthest: Cell; next: Cell | null } {
  let previous = cell;
  let current: Cell = { row: cell.row + vector.row, col: cell.col + vector.col };
  while (inBounds(current) && !grid[current.row][current.col]) {
    previous = current;
    current = { row: current.row + vector.row, col: current.col + vector.col };
  }
  return { farthest: previous, next: inBounds(current) ? current : null };
}

function randomEmptyCell(grid: Grid): Cell | null {
  const empties: Cell[] = [];
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      if (!grid[row][col]) empties.push({ row, col });
    }
  }
  if (empties.length === 0) return null;
  return empties[Math.floor(Math.random() * empties.length)];
}

/** Mutates `tiles` in place, adding a 2 (90%) or 4 (10%) in a free cell. */
function addRandomTile(tiles: Tile[]): void {
  const cell = randomEmptyCell(tilesToGrid(tiles));
  if (!cell) return;
  tiles.push({
    id: nextId(),
    value: Math.random() < 0.9 ? 2 : 4,
    row: cell.row,
    col: cell.col,
    isNew: true,
    merged: false,
  });
}

function movesAvailable(tiles: Tile[]): boolean {
  if (tiles.length < SIZE * SIZE) return true;
  const grid = tilesToGrid(tiles);
  for (let row = 0; row < SIZE; row++) {
    for (let col = 0; col < SIZE; col++) {
      const value = grid[row][col]!.value;
      if (col + 1 < SIZE && grid[row][col + 1]!.value === value) return true;
      if (row + 1 < SIZE && grid[row + 1][col]!.value === value) return true;
    }
  }
  return false;
}

export function createInitialState(): GameState {
  const tiles: Tile[] = [];
  addRandomTile(tiles);
  addRandomTile(tiles);
  return { tiles, score: 0, won: false, over: false };
}

/**
 * Apply a move. Returns the next state and whether anything actually moved
 * (callers should ignore no-op moves so a new tile is not spawned).
 */
export function move(
  state: GameState,
  direction: Direction,
): { state: GameState; moved: boolean } {
  const vector = VECTORS[direction];
  const { rows, cols } = buildTraversals(vector);

  // Fresh copies with per-turn flags cleared.
  const grid = tilesToGrid(
    state.tiles.map((tile) => ({ ...tile, isNew: false, merged: false })),
  );

  let moved = false;
  let score = state.score;
  let won = state.won;

  for (const row of rows) {
    for (const col of cols) {
      const tile = grid[row][col];
      if (!tile) continue;

      const { farthest, next } = findFarthest(grid, { row, col }, vector);
      const target = next ? grid[next.row][next.col] : null;

      if (target && target.value === tile.value && !target.merged) {
        // Merge: the sliding tile keeps its id so it animates into place.
        const mergedValue = tile.value * 2;
        grid[next!.row][next!.col] = {
          id: tile.id,
          value: mergedValue,
          row: next!.row,
          col: next!.col,
          isNew: false,
          merged: true,
        };
        grid[row][col] = null;
        score += mergedValue;
        if (mergedValue === WIN_VALUE) won = true;
        moved = true;
      } else if (farthest.row !== row || farthest.col !== col) {
        grid[farthest.row][farthest.col] = {
          ...tile,
          row: farthest.row,
          col: farthest.col,
        };
        grid[row][col] = null;
        moved = true;
      }
    }
  }

  const tiles = gridToTiles(grid);
  if (moved) addRandomTile(tiles);

  return {
    state: { tiles, score, won, over: !movesAvailable(tiles) },
    moved,
  };
}
