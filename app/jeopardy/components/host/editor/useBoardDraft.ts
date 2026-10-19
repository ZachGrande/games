"use client";

import type { User } from "firebase/auth";
import { useCallback, useEffect, useState } from "react";
import { getBoard, saveBoard } from "../../../lib/boards";
import type { BoardContent } from "../../../lib/types";

export type EditDraft = (mutate: (draft: BoardContent) => void) => void;

export function useBoardDraft(boardId: string, user: User) {
  const [content, setContent] = useState<BoardContent | null>(null);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [dirty, setDirty] = useState(false);
  const [saving, setSaving] = useState(false);
  const [status, setStatus] = useState<string | null>(null);

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

  const edit: EditDraft = useCallback((mutate) => {
    setContent((prev) => {
      if (!prev) return prev;
      const next = structuredClone(prev);
      mutate(next);
      return next;
    });
    setDirty(true);
    setStatus(null);
  }, []);

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

  return { content, loadError, dirty, saving, status, edit, save };
}
