import { formatMoney } from "../../../lib/format";
import { type ClueData, type RoundKey, clueValue } from "../../../lib/types";
import { INPUT } from "../ui";
import type { EditDraft } from "./useBoardDraft";

export default function ClueFields({
  round,
  category,
  row,
  clue,
  edit,
}: {
  round: RoundKey;
  category: number;
  row: number;
  clue: ClueData;
  edit: EditDraft;
}) {
  const value = formatMoney(clueValue(round, row));
  return (
    <div className="grid grid-cols-[4.5rem_1fr] gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800">
      <span className="pt-2 font-semibold text-amber-600">{value}</span>
      <div className="flex flex-col gap-2">
        <textarea
          className={INPUT}
          rows={2}
          placeholder="Clue"
          aria-label={`Clue for ${value}`}
          value={clue.clue}
          maxLength={400}
          onChange={(e) => edit((d) => void (d.rounds[round].categories[category].clues[row].clue = e.target.value))}
        />
        <input
          className={INPUT}
          placeholder="Correct response (e.g. What is…?)"
          aria-label={`Response for ${value}`}
          value={clue.answer}
          maxLength={200}
          onChange={(e) => edit((d) => void (d.rounds[round].categories[category].clues[row].answer = e.target.value))}
        />
      </div>
    </div>
  );
}
