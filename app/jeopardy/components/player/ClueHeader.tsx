import { clueValueLabel } from "../../lib/format";
import type { CurrentClue } from "../../lib/types";

export default function ClueHeader({ current }: { current: CurrentClue }) {
  return (
    <p className="text-sm font-semibold uppercase tracking-wide text-blue-300">
      {current.category} · {clueValueLabel(current)}
    </p>
  );
}
