"use client";

import { formatMoney } from "../../../lib/format";
import { type LiveBoard, CATEGORY_COUNT, CLUE_COUNT, cellKey } from "../../../lib/types";

export default function BoardGrid({
  board,
  onSelect,
  disabled,
}: {
  board: LiveBoard;
  onSelect: (key: string) => void;
  disabled?: boolean;
}) {
  const columns = Array.from({ length: CATEGORY_COUNT }, (_, c) => c);
  return (
    <div className="grid flex-1 grid-cols-6 grid-rows-[auto_repeat(5,minmax(3.5rem,1fr))] gap-1.5">
      {columns.map((c) => (
        <div
          key={`cat-${c}`}
          className="flex min-h-20 items-center justify-center rounded-md bg-blue-800 p-2 text-center text-xs font-bold uppercase leading-tight text-white sm:text-base lg:text-xl"
        >
          {board.categories?.[c] ?? ""}
        </div>
      ))}
      {Array.from({ length: CLUE_COUNT }, (_, r) =>
        columns.map((c) => {
          const key = cellKey(c, r);
          const cell = board.cells?.[key];
          if (!cell || cell.used) {
            return <div key={key} className="rounded-md bg-blue-900/60" />;
          }
          return (
            <button
              key={key}
              type="button"
              disabled={disabled}
              onClick={() => onSelect(key)}
              aria-label={`${board.categories?.[c] ?? ""} for ${formatMoney(cell.value)}`}
              className="flex items-center justify-center rounded-md bg-blue-800 text-xl font-black text-amber-300 shadow-inner transition-colors hover:bg-blue-600 focus-visible:outline-4 focus-visible:outline-amber-300 disabled:cursor-wait sm:text-3xl lg:text-5xl"
            >
              {formatMoney(cell.value)}
            </button>
          );
        }),
      )}
    </div>
  );
}
