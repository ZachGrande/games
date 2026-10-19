import Link from "next/link";

export default function EditorToolbar({
  status,
  dirty,
  saving,
  onSave,
}: {
  status: string | null;
  dirty: boolean;
  saving: boolean;
  onSave: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <Link href="/jeopardy/host" className="text-sm text-zinc-500 hover:text-black dark:hover:text-zinc-50">
        ← All boards
      </Link>
      <div className="flex items-center gap-3">
        {status && <span className="text-sm text-zinc-500">{status}</span>}
        {dirty && !status && <span className="text-sm text-amber-600">Unsaved changes</span>}
        <button
          type="button"
          onClick={onSave}
          disabled={saving || !dirty}
          className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
        >
          {saving ? "Saving…" : "Save"}
        </button>
      </div>
    </div>
  );
}
