import type { Tile as TileModel } from "./board";

/** Classic 2048 tile palette, keyed by value. */
const TILE_STYLES: Record<number, string> = {
  2: "bg-[#eee4da] text-[#776e65]",
  4: "bg-[#ede0c8] text-[#776e65]",
  8: "bg-[#f2b179] text-white",
  16: "bg-[#f59563] text-white",
  32: "bg-[#f67c5f] text-white",
  64: "bg-[#f65e3b] text-white",
  128: "bg-[#edcf72] text-white",
  256: "bg-[#edcc61] text-white",
  512: "bg-[#edc850] text-white",
  1024: "bg-[#edc53f] text-white",
  2048: "bg-[#edc22e] text-white",
};

const SUPER_STYLE = "bg-[#3c3a32] text-white";

/** Smaller text as the number grows so it always fits the tile. */
function fontSize(value: number): string {
  if (value < 100) return "text-3xl sm:text-4xl";
  if (value < 1000) return "text-2xl sm:text-3xl";
  return "text-xl sm:text-2xl";
}

export default function Tile({
  tile,
  style,
}: {
  tile: TileModel;
  style: React.CSSProperties;
}) {
  const color = TILE_STYLES[tile.value] ?? SUPER_STYLE;
  const anim = tile.isNew
    ? "animate-[tile-appear_150ms_ease-out]"
    : tile.merged
      ? "animate-[tile-pop_150ms_ease-out]"
      : "";

  return (
    <div
      style={style}
      className="absolute transition-[top,left] duration-100 ease-in-out"
    >
      <div
        className={`flex h-full w-full items-center justify-center rounded-lg font-bold tabular-nums ${color} ${fontSize(
          tile.value,
        )} ${anim}`}
      >
        {tile.value}
      </div>
    </div>
  );
}
