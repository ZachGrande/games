import type { SavedBoard } from "../../../lib/types";
import BoardRow from "./BoardRow";

export default function BoardList({
  boards,
  busy,
  onHost,
  onRemove,
}: {
  boards: SavedBoard[] | null;
  busy: string | null;
  onHost: (board: SavedBoard) => void;
  onRemove: (board: SavedBoard) => void;
}) {
  if (boards === null) return <p className="text-zinc-500">Loading boards…</p>;
  if (boards.length === 0) {
    return (
      <p className="rounded-xl border border-dashed border-zinc-300 p-6 text-center text-zinc-500 dark:border-zinc-700">
        No boards yet. Start from the sample or build your own.
      </p>
    );
  }
  return (
    <ul className="flex flex-col gap-2">
      {boards.map((board) => (
        <BoardRow key={board.id} board={board} busy={busy} onHost={onHost} onRemove={onRemove} />
      ))}
    </ul>
  );
}
