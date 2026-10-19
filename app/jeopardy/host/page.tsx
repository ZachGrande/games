"use client";

import GameShell from "../../components/GameShell";
import HostDashboard from "../components/HostDashboard";
import HostGate from "../components/HostGate";

export default function JeopardyHostPage() {
  return (
    <GameShell title="Host Jeopardy!">
      <HostGate>{(user) => <HostDashboard user={user} />}</HostGate>
    </GameShell>
  );
}
