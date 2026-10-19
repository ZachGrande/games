"use client";

import type { User } from "firebase/auth";
import Link from "next/link";
import { useEffect, useState } from "react";
import { getBoard, saveBoard } from "../lib/boards";
import {
  type BoardContent,
  type RoundKey,
  CATEGORY_COUNT,
  ROUND_LABEL,
  clueValue,
} from "../lib/types";
import { formatMoney } from "../lib/format";

type Tab = RoundKey | "final";

const INPUT =
  "w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-black placeholder:text-zinc-400 dark:border-zinc-700 dark:bg-zinc-900 dark:text-zinc-50";

export default function BoardEditor({ user, boardId }: { user: User; boardId: string }) {
  const [content, setContent] = useState<BoardContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [tab, setTab] = useState<Tab>("single");
  const [category, setCategory] = useState(0);

  useEffect(() => {
    getBoard(boardId)
      .then((board) => {
        if (!board || board.ownerUid !== user.uid) setLoadError("Board not found.");
        else setContent({ title: board.title, rounds: board.rounds, final: board.final });
      })
      .catch(() => setLoadError("Board not found."));
  }, [boardId, user.uid]);

  useEffect(() => {
    if (!dirty) return;
    const warn = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener("beforeunload", warn);
    return () => window.removeEventListener("beforeunload", warn);
  }, [dirty]);

  if (loadError) {
    return (
      <p className="text-zinc-500">
        {loadError}{" "}
        <Link href="/jeopardy/host" className="underline">
          Back to boards
        </Link>
      </p>
    );
  }
  if (!content) return <p className="text-zinc-500">Loading board…</p>;

  function edit(mutate: (draft: BoardContent) => void) {
    setContent((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      mutate(next);
      return next;
    });
    setDirty(true);
    setStatus(null);
  }

  async function save() {
    if (!content) return;
    setSaving(true);
    setStatus(null);
    try {
      await saveBoard(boardId, user.uid, { ...content, title: content.title.trim() || "Untitled board" });
      setDirty(false);
      setStatus("Saved");
    } catch (e) {
      setStatus(`Save failed: ${(e as Error).message}`);
    } finally {
      setSaving(false);
    }
  }

  const tabs: { key: Tab; label: string }[] = [
    { key: "single", label: ROUND_LABEL.single },
    { key: "double", label: ROUND_LABEL.double },
    { key: "final", label: "Final Jeopardy!" },
  ];

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <Link href="/jeopardy/host" className="text-sm text-zinc-500 hover:text-black dark:hover:text-zinc-50">
          ← All boards
        </Link>
        <div className="flex items-center gap-3">
          {status && <span className="text-sm text-zinc-500">{status}</span>}
          {dirty && !status && <span className="text-sm text-amber-600">Unsaved changes</span>}
          <button
            type="button"
            onClick={save}
            disabled={saving || !dirty}
            className="rounded-lg bg-blue-700 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-600 disabled:opacity-40"
          >
            {saving ? "Saving…" : "Save"}
          </button>
        </div>
      </div>

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
        Board title
        <input
          className={INPUT}
          value={content.title}
          maxLength={80}
          onChange={(e) => edit((d) => void (d.title = e.target.value))}
        />
      </label>

      <div className="flex gap-1 border-b border-zinc-200 dark:border-zinc-800">
        {tabs.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
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

      {tab === "final" ? (
        <div className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Category
            <input
              className={INPUT}
              value={content.final.category}
              maxLength={60}
              onChange={(e) => edit((d) => void (d.final.category = e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
            Clue
            <textarea
              className={INPUT}
              rows={3}
              value={content.final.clue}
              maxLength={400}
              onChange={(e) => edit((d) => void (d.final.clue = e.target.value))}
            />
          </label>
          <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
      ) : (
        <RoundEditor
          round={tab}
          content={content}
          category={category}
          onCategory={setCategory}
          edit={edit}
        />
      )}
    </div>
  );
}

function RoundEditor({
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
  edit: (mutate: (draft: BoardContent) => void) => void;
}) {
  const categories = content.rounds[round].categories;
  const cat = categories[category];

  return (
    <div className="flex flex-col gap-4">
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

      <label className="flex flex-col gap-1 text-sm font-medium text-zinc-700 dark:text-zinc-300">
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
          <div
            key={r}
            className="grid grid-cols-[4.5rem_1fr] gap-2 rounded-lg border border-zinc-200 p-3 dark:border-zinc-800"
          >
            <span className="pt-2 font-semibold text-amber-600">{formatMoney(clueValue(round, r))}</span>
            <div className="flex flex-col gap-2">
              <textarea
                className={INPUT}
                rows={2}
                placeholder="Clue"
                aria-label={`Clue for ${formatMoney(clueValue(round, r))}`}
                value={clue.clue}
                maxLength={400}
                onChange={(e) =>
                  edit((d) => void (d.rounds[round].categories[category].clues[r].clue = e.target.value))
                }
              />
              <input
                className={INPUT}
                placeholder="Correct response (e.g. What is…?)"
                aria-label={`Response for ${formatMoney(clueValue(round, r))}`}
                value={clue.answer}
                maxLength={200}
                onChange={(e) =>
                  edit((d) => void (d.rounds[round].categories[category].clues[r].answer = e.target.value))
                }
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-sm text-zinc-500">Blank clues are shown as empty squares during the game.</p>
    </div>
  );
}
