import type { BoardContent, RoundKey } from "../../../lib/types";
import { INPUT, LABEL } from "../ui";
import CategoryPicker from "./CategoryPicker";
import ClueFields from "./ClueFields";
import type { EditDraft } from "./useBoardDraft";

export default function RoundEditor({
  round,
  content,
  category,
  onCategory,
  edit,
}: {
  round: RoundKey;
  content: BoardContent;
  category: number;
  onCategory: (c: number) => void;
  edit: EditDraft;
}) {
  const categories = content.rounds[round].categories;
  const cat = categories[category];

  return (
    <div className="flex flex-col gap-4">
      <CategoryPicker categories={categories} category={category} onCategory={onCategory} />

      <label className={LABEL}>
        Category name
        <input
          className={INPUT}
          value={cat.name}
          maxLength={60}
          placeholder={`Category ${category + 1}`}
          onChange={(e) => edit((d) => void (d.rounds[round].categories[category].name = e.target.value))}
        />
      </label>

      <div className="flex flex-col gap-3">
        {cat.clues.map((clue, r) => (
          <ClueFields key={r} round={round} category={category} row={r} clue={clue} edit={edit} />
        ))}
      </div>
      <p className="text-sm text-zinc-500">Blank clues are shown as empty squares during the game.</p>
    </div>
  );
}
