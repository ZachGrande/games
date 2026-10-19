import Link from "next/link";
import { countFilled } from "../../../lib/boards";
import type { SavedBoard } from "../../../lib/types";
import { BUTTON, PRIMARY } from "../ui";

export default function BoardRow({
  board,
  busy,
  onHost,
  onRemove,
}: {
  board: SavedBoard;
  busy: string | null;
  onHost: (board: SavedBoard) => void;
  onRemove: (board: SavedBoard) => void;
}) {
  const { filled, total } = countFilled(board);
  return (
    <li className="flex flex-col gap-3 rounded-xl border border-zinc-200 p-4 sm:flex-row sm:items-center sm:justify-between dark:border-zinc-800">
      <div className="flex flex-col">
        <span className="font-medium text-black dark:text-zinc-50">{board.title}</span>
        <span className="text-sm text-zinc-500 dark:text-zinc-400">
          {filled}/{total} clues · {board.final.clue.trim() ? "Final ready" : "No Final"}
        </span>
      </div>
      <div className="flex gap-2">
        <button type="button" className={BUTTON} disabled={!!busy} onClick={() => onRemove(board)}>
          Delete
        </button>
        <Link href={`/jeopardy/host/boards/${board.id}`} className={BUTTON}>
          Edit
        </Link>
        <button type="button" className={PRIMARY} disabled={!!busy || filled === 0} onClick={() => onHost(board)}>
          {busy === `host-${board.id}` ? "Starting…" : "Host game"}
        </button>
      </div>
    </li>
  );
}
