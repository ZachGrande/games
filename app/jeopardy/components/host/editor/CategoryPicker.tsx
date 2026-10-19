import { type CategoryData, CATEGORY_COUNT } from "../../../lib/types";

export default function CategoryPicker({
  categories,
  category,
  onCategory,
}: {
  categories: CategoryData[];
  category: number;
  onCategory: (c: number) => void;
}) {
  return (
    <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
      {Array.from({ length: CATEGORY_COUNT }, (_, c) => {
        const filled = categories[c].clues.filter((cl) => cl.clue.trim() && cl.answer.trim()).length;
        return (
          <button
            key={c}
            type="button"
            onClick={() => onCategory(c)}
            className={`flex flex-col items-start rounded-lg border px-2 py-1.5 text-left text-xs ${
              c === category
                ? "border-blue-700 bg-blue-50 dark:border-blue-400 dark:bg-blue-950"
                : "border-zinc-200 hover:bg-zinc-50 dark:border-zinc-800 dark:hover:bg-zinc-900"
            }`}
          >
            <span className="w-full truncate font-medium text-black dark:text-zinc-50">
              {categories[c].name.trim() || `Category ${c + 1}`}
            </span>
            <span className="text-zinc-500">{filled}/5</span>
          </button>
        );
      })}
    </div>
  );
}
