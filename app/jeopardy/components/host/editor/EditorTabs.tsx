import { type RoundKey, ROUND_LABEL } from "../../../lib/types";

export type Tab = RoundKey | "final";

const TABS: { key: Tab; label: string }[] = [
  { key: "single", label: ROUND_LABEL.single },
  { key: "double", label: ROUND_LABEL.double },
  { key: "final", label: "Final Jeopardy!" },
];

export default function EditorTabs({ tab, onTab }: { tab: Tab; onTab: (tab: Tab) => void }) {
  return (
    <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
      {TABS.map((t) => (
        <button
          key={t.key}
          type="button"
          onClick={() => onTab(t.key)}
          className={`-mb-px border-b-2 px-3 py-2 text-sm font-medium ${
            tab === t.key
              ? "border-blue-700 text-blue-700 dark:border-blue-400 dark:text-blue-400"
              : "border-transparent text-zinc-500 hover:text-black dark:hover:text-zinc-50"
          }`}
        >
          {t.label}
        </button>
      ))}
    </div>
  );
}
