"use client";

import { useState } from "react";

export interface ScoreEntryProps {
  initialName: string;
  onSave: (name: string) => Promise<void>;
}

/** Name input + SAVE button shown on the game-over overlay. */
export default function ScoreEntry({ initialName, onSave }: ScoreEntryProps) {
  const [name, setName] = useState(initialName);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  async function handleSave() {
    if (saving || saved) return;
    setSaving(true);
    try {
      await onSave(name);
      setSaved(true);
    } finally {
      setSaving(false);
    }
  }

  if (saved) {
    return (
      <div className="mt-3.5 w-full max-w-70 text-xs font-bold tracking-[1px] text-[#90ee90]">
        ✓ Score saved!
      </div>
    );
  }

  return (
    <div className="mt-3.5 w-full max-w-70">
      <div className="mb-1.5 text-xs tracking-[1px] text-[#f5f0e8]">
        ENTER YOUR NAME TO SAVE SCORE
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          maxLength={16}
          value={name}
          onChange={(e) => setName(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") void handleSave();
          }}
          placeholder="Your name…"
          className="flex-1 rounded border border-[#4a9e4a] bg-[rgba(255,255,255,0.15)] px-2.5 py-2 text-[13px] text-white outline-none placeholder:text-[#cfe8cf]"
        />
        <button
          type="button"
          onClick={handleSave}
          disabled={saving}
          className="whitespace-nowrap rounded bg-[#4a9e4a] px-3.5 py-2 text-[13px] font-bold text-white transition-transform hover:-translate-y-0.5 active:translate-y-0.5 disabled:opacity-60"
        >
          {saving ? "…" : "SAVE"}
        </button>
      </div>
    </div>
  );
}
