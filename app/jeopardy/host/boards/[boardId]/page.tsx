"use client";

import { useParams } from "next/navigation";
import GameShell from "../../../../components/GameShell";
import BoardEditor from "../../../components/host/editor/BoardEditor";
import HostGate from "../../../components/host/HostGate";

export default function BoardEditorPage() {
  const { boardId } = useParams<{ boardId: string }>();
  return (
    <GameShell title="Edit board">
      <HostGate>{(user) => <BoardEditor user={user} boardId={boardId} />}</HostGate>
    </GameShell>
  );
}
