import type { BoardContent } from "../../../lib/types";
import { INPUT, LABEL } from "../ui";
import type { EditDraft } from "./useBoardDraft";

export default function FinalEditor({ content, edit }: { content: BoardContent; edit: EditDraft }) {
  return (
    <div className="flex flex-col gap-4">
      <label className={LABEL}>
        Category
        <input
          className={INPUT}
          value={content.final.category}
          maxLength={60}
          onChange={(e) => edit((d) => void (d.final.category = e.target.value))}
        />
      </label>
      <label className={LABEL}>
        Clue
        <textarea
          className={INPUT}
          rows={3}
          value={content.final.clue}
          maxLength={400}
          onChange={(e) => edit((d) => void (d.final.clue = e.target.value))}
        />
      </label>
      <label className={LABEL}>
        Correct response
        <input
          className={INPUT}
          value={content.final.answer}
          maxLength={200}
          onChange={(e) => edit((d) => void (d.final.answer = e.target.value))}
        />
      </label>
      <p className="text-sm text-zinc-500">Leave the clue blank to skip Final Jeopardy.</p>
    </div>
  );
}
