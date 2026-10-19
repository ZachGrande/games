"use client";

import type { User } from "firebase/auth";
import Link from "next/link";
import { useState } from "react";
import { INPUT, LABEL } from "../ui";
import EditorTabs, { type Tab } from "./EditorTabs";
import EditorToolbar from "./EditorToolbar";
import FinalEditor from "./FinalEditor";
import RoundEditor from "./RoundEditor";
import { useBoardDraft } from "./useBoardDraft";

export default function BoardEditor({ user, boardId }: { user: User; boardId: string }) {
  const { content, loadError, dirty, saving, status, edit, save } = useBoardDraft(boardId, user);
  const [tab, setTab] = useState<Tab>("single");
  const [category, setCategory] = useState(0);

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

  return (
    <div className="flex flex-col gap-6">
      <EditorToolbar status={status} dirty={dirty} saving={saving} onSave={save} />

      <label className={LABEL}>
        Board title
        <input
          className={INPUT}
          value={content.title}
          maxLength={80}
          onChange={(e) => edit((d) => void (d.title = e.target.value))}
        />
      </label>

      <EditorTabs tab={tab} onTab={setTab} />

      {tab === "final" ? (
        <FinalEditor content={content} edit={edit} />
      ) : (
        <RoundEditor round={tab} content={content} category={category} onCategory={setCategory} edit={edit} />
      )}
    </div>
  );
}
