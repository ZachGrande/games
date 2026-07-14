import { SHAPES, type Card } from "./cards";

export default function GameCard({
  card,
  isFlipped,
  disabled,
  onClick,
}: {
  card: Card;
  isFlipped: boolean;
  disabled: boolean;
  onClick: () => void;
}) {
  const Shape = SHAPES[card.shapeId];
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      aria-label={isFlipped ? card.shapeId : "Hidden card"}
      className="group relative aspect-square perspective-[1000px] focus:outline-none"
    >
      <span
        className={`relative block h-full w-full rounded-xl transition-transform duration-300 transform-3d ${
          isFlipped ? "transform-[rotateY(180deg)]" : ""
        }`}
      >
        {/* Back (cover) */}
        <span className="absolute inset-0 flex items-center justify-center rounded-xl border border-zinc-200 bg-linear-to-br from-zinc-100 to-zinc-200 backface-hidden group-hover:border-zinc-300 dark:border-zinc-800 dark:from-zinc-800 dark:to-zinc-900">
          <span className="h-3 w-3 rounded-full bg-zinc-300 dark:bg-zinc-600" />
        </span>
        {/* Front (shape) */}
        <span
          className={`absolute inset-0 flex items-center justify-center rounded-xl border bg-white p-3 backface-hidden transform-[rotateY(180deg)] transition-colors dark:bg-zinc-950 ${
            card.matched
              ? "border-emerald-400 dark:border-emerald-500"
              : "border-zinc-200 dark:border-zinc-800"
          }`}
        >
          <Shape className="h-full w-full" />
        </span>
      </span>
    </button>
  );
}
