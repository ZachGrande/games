import { SIZE, type Tile as TileModel } from "./board";
import Tile from "./Tile";

// Board layout expressed as percentages of the inner playfield so the whole
// grid scales responsively. Four cells and three gaps fill 100%.
const GAP = 2.5;
const CELL = (100 - GAP * (SIZE - 1)) / SIZE;

function cellStyle(row: number, col: number): React.CSSProperties {
  return {
    top: `${row * (CELL + GAP)}%`,
    left: `${col * (CELL + GAP)}%`,
    width: `${CELL}%`,
    height: `${CELL}%`,
  };
}

export default function TileBoard({ tiles }: { tiles: TileModel[] }) {
  return (
    <div className="mx-auto w-full max-w-md rounded-xl bg-zinc-300 p-3 dark:bg-zinc-800">
      <div className="relative aspect-square w-full">
        {Array.from({ length: SIZE * SIZE }).map((_, i) => (
          <div
            key={i}
            style={cellStyle(Math.floor(i / SIZE), i % SIZE)}
            className="absolute rounded-lg bg-zinc-200/70 dark:bg-zinc-700/40"
          />
        ))}
        {tiles.map((tile) => (
          <Tile key={tile.id} tile={tile} style={cellStyle(tile.row, tile.col)} />
        ))}
      </div>
    </div>
  );
}
